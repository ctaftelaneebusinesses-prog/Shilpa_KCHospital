import { useEffect, useRef, useState } from "react";
import { speechLanguageCodes } from "../i18n";

export function useVoiceInput(language) {
  const recognitionRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;
    setSupported(true);

    return () => {
      recognition.abort();
    };
  }, []);

  function startListening(onResult) {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.lang = speechLanguageCodes[language] || "en-IN";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      setStatusText("Voice message captured.");
    };

    recognition.onerror = (event) => {
      setListening(false);
      setStatusText("Voice input unavailable. Please type your message.");
      console.error(event.error);
    };

    recognition.start();
    setListening(true);
    setStatusText("Listening... Speak now.");
  }

  return { supported, listening, statusText, startListening };
}
