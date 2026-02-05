"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  onResult: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onResult, disabled }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      console.error("Microphone access denied");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function transcribe(blob: Blob) {
    setIsTranscribing(true);
    try {
      // Use Web Speech API as primary (free, no API key needed)
      // Fallback: send to /api/transcribe for Whisper
      const text = await webSpeechTranscribe(blob);
      if (text) {
        onResult(text);
      }
    } catch (error) {
      console.error("Transcription failed:", error);
    } finally {
      setIsTranscribing(false);
    }
  }

  // Simple approach: re-record using SpeechRecognition API
  // This is a fallback — the main approach records and sends to API
  async function webSpeechTranscribe(_blob: Blob): Promise<string | null> {
    // For MVP, we'll use the blob approach with a server endpoint
    // but also try the browser SpeechRecognition if available
    const formData = new FormData();
    formData.append("audio", _blob, "recording.webm");

    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        return data.text;
      }
    } catch {
      // Fallback to empty - user can type instead
    }
    return null;
  }

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  if (isTranscribing) {
    return (
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={disabled}
      className={clsx(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0",
        isRecording
          ? "bg-error text-white animate-pulse"
          : "bg-gray-100 text-text-secondary hover:bg-gray-200"
      )}
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </button>
  );
}
