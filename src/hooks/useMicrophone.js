import { useState, useRef, useCallback } from 'react';

export function useMicrophone({ onAudioData } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startMic = useCallback(async () => {
    try {
      setError(null);
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Determine the best supported audio MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'; 
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`🎤 Captured Audio Blob: ${event.data.size} bytes (${mimeType})`);
          if (onAudioData) onAudioData(event.data);
        }
      };

      // Start recording
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please click 'Allow' in your browser permissions.");
      } else if (err.name === 'NotFoundError') {
        setError("No microphone found on your device.");
      } else {
        setError("An error occurred while accessing the microphone.");
      }
    }
  }, [onAudioData]);

  const stopMic = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      // Stopping the recorder will trigger a final `ondataavailable` event
      mediaRecorderRef.current.stop();
      
      // Stop all audio tracks to release the hardware indicator light
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  }, [isRecording]);

  return { isRecording, startMic, stopMic, error };
}
