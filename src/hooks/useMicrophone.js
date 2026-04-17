import { useState, useRef, useCallback } from 'react';

export function useMicrophone({ onAudioData, timeslice = 30000 } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const startMic = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'; 
      }

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          if (onAudioData) onAudioData(event.data);
        }
      };

      // Pass timeslice so it fires ondataavailable automatically every X ms
      mediaRecorderRef.current.start(timeslice);
      setIsRecording(true);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please click 'Allow' in your browser.");
      } else {
        setError("An error occurred while accessing the microphone.");
      }
    }
  }, [onAudioData, timeslice]);

  const stopMic = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  }, [isRecording]);

  const flushMic = useCallback(() => {
    // Manually request data from the recorder (used for manual refresh button)
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.requestData();
    }
  }, [isRecording]);

  return { isRecording, startMic, stopMic, flushMic, error };
}
