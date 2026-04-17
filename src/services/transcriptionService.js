export async function transcribeAudio(apiKey, audioBlob) {
  if (!apiKey) {
    throw new Error("Missing Groq API Key. Please add it in Settings.");
  }
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error("Empty audio data received.");
  }

  const formData = new FormData();
  // Provide a generic filename with extension indicating webm
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-large-v3');
  formData.append('response_format', 'json');
  formData.append('language', 'en'); // Optional but helps accuracy

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.text ? data.text.trim() : "";
    
  } catch (err) {
    console.error("Transcription Service Error:", err);
    throw err;
  }
}
