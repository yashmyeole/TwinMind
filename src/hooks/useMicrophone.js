import { useState, useRef, useCallback } from 'react';

export function useMicrophone({ onAudioData, timeslice = 30000 } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

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

      const startRecordingChunk = () => {
        if (!streamRef.current) return;
        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && onAudioData) {
            onAudioData(event.data);
          }
        };
        
        recorder.start();
        mediaRecorderRef.current = recorder;
      };

      startRecordingChunk();
      setIsRecording(true);

      // Stop the current recorder and immediately start a new one to force new file headers
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop(); // Triggers ondataavailable with the full chunk
        }
        startRecordingChunk();
      }, timeslice);
      
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    }
  }, [isRecording]);

  const flushMic = useCallback(() => {
    // Manually push current chunk and restart
    if (isRecording && streamRef.current && mediaRecorderRef.current) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mimeType = 'audio/webm;codecs=opus';
      else if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
      
      const startRecordingChunk = () => {
        if (!streamRef.current) return;
        const recorder = new MediaRecorder(streamRef.current, { mimeType });
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && onAudioData) onAudioData(event.data);
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      };

      startRecordingChunk();
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        startRecordingChunk();
      }, timeslice);
    }
  }, [isRecording, onAudioData, timeslice]);

  return { isRecording, startMic, stopMic, flushMic, error };
}
