import { useRef, useState } from "react"
import { useChat } from "../hooks/useChat"
import { Mic, MicOff } from "lucide-react"

const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const UI = ({ hidden, ...props }) => {
  const input = useRef()
  const { chat, loading, message } = useChat()
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };
  
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
  
        try {
          const response = await fetch(`${backendUrl}/transcribe`, {
            method: 'POST',
            body: formData
          });
          const { text } = await response.json();
          if (text) {
            chat(text);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
        
        chunksRef.current = [];
      };
  
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };


  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      console.log('Recording stopped');
    }
  }

  const sendMessage = () => {
    const text = input.current.value
    if (!loading && !message) {
      chat(text)
      input.current.value = ""
    }
  }

  if (hidden) return null

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col justify-between p-4 pointer-events-none">
      <div className="self-start backdrop-blur-md p-4 rounded-lg"></div>

      {message && (
        <div className="fixed bottom-20 right-10 w-full max-w-screen-sm mx-auto pointer-events-none">
          <div className="backdrop-blur-md bg-white/10 p-4 rounded-lg border border-white/20">
            <p className="text-lg text-center text-white">{message.text}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pointer-events-auto max-w-screen-sm w-full mx-auto">
        <input
          className="w-full text-white placeholder:text-gray-400 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          ref={input}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage()
            }
          }}
        />
        <button
          disabled={loading || message}
          onClick={sendMessage}
          className={`bg-blue-600 hover:bg-blue-700 text-white p-4 px-10 font-semibold uppercase rounded-lg transition-all ${loading || message ? "cursor-not-allowed opacity-30" : ""
            }`}
        >
          Send
        </button>
        <button
          disabled={loading || message}
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center justify-center p-4 rounded-lg transition-all ${isRecording
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
            } ${loading || message ? "cursor-not-allowed opacity-30" : ""}`}
        >
          {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
      </div>
    </div>
  )
}