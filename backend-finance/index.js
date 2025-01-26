import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import sgMail from '@sendgrid/mail';
import * as pdfjsLib from 'pdfjs-dist';



import multer from 'multer';
import { createReadStream } from 'fs';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    // Accept only PDFs for statement analysis
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for statements'), false);
    }
  } else if (file.fieldname === 'audio') {
    // Accept common audio formats
    const allowedMimes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format'), false);
    }
  } else {
    cb(new Error('Unexpected field name'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "-"
});

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const convertToMp3 = async (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i ${inputPath} -ar 16000 -ac 1 ${outputPath}`, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(outputPath);
    });
  });
};

const polly = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const voiceId = "Joanna"; // AWS Polly voice ID

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.post("/send-report", async (req, res) => {
  const { email, reportContent } = req.body;

  const msg = {
    to: email,
    from: 'arygandhi111@gmail.com', // Replace with your SendGrid verified email
    subject: 'Your Financial Insights Report',
    text: reportContent,
    html: `<pre>${reportContent}</pre>`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/uploadcsv', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log('File uploaded:', req.file);
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
});

app.post("/analyze-statement", upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file' });
  }

  try {
    const dataBuffer = await fs.readFile(req.file.path);
    const uint8Array = new Uint8Array(dataBuffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map(item => item.str).join(' ');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyze this credit card statement and extract balance, transactions, merchant categories, and amounts. Return data in JSON format with totalSpent, topCategory, topCategoryAmount, and biggestPurchase (containing merchant and amount)."
        },
        {
          role: "user",
          content: text
        }
      ]
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    await fs.unlink(req.file.path);
    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/transcribe", upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file' });
  }

  try {
    const convertedPath = `uploads/converted_${req.file.filename}.mp3`;
    await convertToMp3(req.file.path, convertedPath);

    const transcription = await openai.audio.transcriptions.create({
      file: createReadStream(convertedPath),
      model: "whisper-1",
      language: "en",
    });

    // Clean up files
    await fs.unlink(req.file.path);
    await fs.unlink(convertedPath);

    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: error.message });
  }
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/voices", async (req, res) => {
  const { Voices } = await polly.send(new DescribeVoicesCommand({}));
  res.send(Voices);
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const synthesizeSpeech = async (text, filename) => {
  const command = new SynthesizeSpeechCommand({
    Text: text,
    OutputFormat: "mp3",
    VoiceId: voiceId,
    Engine: "neural"
  });

  const response = await polly.send(command);
  const buffer = Buffer.from(await response.AudioStream.transformToByteArray());
  await fs.writeFile(filename, buffer);
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  const result = await execCommand(
    `ffmpeg -i audios/message_${message}.mp3 -af silencedetect=noise=-30dB:d=0.1 -f null - 2>&1`
  );
  
  // Parse silence detection output
  const silences = [];
  const regex = /silence_start: (\d+\.?\d*)|silence_end: (\d+\.?\d*)/g;
  let match;
  while ((match = regex.exec(result)) !== null) {
    if (match[1]) silences.push({ type: 'start', time: parseFloat(match[1]) });
    if (match[2]) silences.push({ type: 'end', time: parseFloat(match[2]) });
  }
  
  // Generate simplified lipsync data
  const mouthCues = [];
  let speaking = true;
  silences.forEach(silence => {
    if (silence.type === 'start') {
      mouthCues.push({
        start: silence.time,
        value: "X"
      });
      speaking = false;
    } else {
      mouthCues.push({
        start: silence.time,
        value: "A"
      });
      speaking = true;
    }
  });

  await fs.writeFile(
    `audios/message_${message}.json`,
    JSON.stringify({ mouthCues }, null, 2)
  );
  
  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    max_tokens: 1000,
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
        You are a friendly financial advisor analyzing financial information.
        Be concise with your talking.
        You will always reply with a JSON array of messages. With a maximum of 3 messages.
        Each message has a text, facialExpression, and animation property.
        The different facial expressions are: smile, sad, angry, surprised, funnyFace, and default.
        The different animations are: Talking_0, Talking_1, Talking_2, Crying, Laughing, Rumba, Idle, Terrified, and Angry. 
        `
      },
      {
        role: "user",
        content: userMessage || "Hello"
      }
    ]
  });
  
  let messages = JSON.parse(completion.choices[0].message.content);
  if (messages.messages) messages = messages.messages;

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const fileName = `audios/message_${i}.mp3`;
    await synthesizeSpeech(message.text, fileName);
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};



app.listen(port, () => {
  console.log(`Financly ${port}`);
});