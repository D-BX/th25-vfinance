const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

const app = express();
app.use(cors());
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const PORT = process.env.PORT || 5001;

// Endpoint to send the report
app.post('/send-report', async (req, res) => {
  const { email, reportContent } = req.body;

  const msg = {
    to: email,
    from: 'arygandhi111@gmail.com', // Replace with your verified SendGrid email
    subject: 'Your Financial Insights Report',
    text: reportContent,
    html: `<pre>${reportContent}</pre>`, // Add basic formatting
  };

  try {
    await sgMail.send(msg);
    res.status(200).send('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error.response ? error.response.body : error.message);
    res.status(500).send('Failed to send email.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Financial Insights API!');
  });