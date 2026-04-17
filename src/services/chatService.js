import { SYSTEM_CHAT_PROMPT } from '../constants/prompts';

export async function sendChatMessage(apiKey, transcriptContext, chatHistory, newUserMessage, customChatPrompt = null) {
  if (!apiKey) {
    throw new Error("Missing Groq API Key.");
  }

  const systemMessage = customChatPrompt || SYSTEM_CHAT_PROMPT;

  // Format history for Groq 
  const messages = [
    {
      role: 'system',
      content: systemMessage + (transcriptContext ? `\n\nRecent Meeting Transcript:\n${transcriptContext}` : '\n\nNo transcript available yet.')
    }
  ];

  // Map history (assuming standard role/content)
  chatHistory.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    });
  });

  // Append new user query
  messages.push({
    role: 'user',
    content: newUserMessage
  });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', 
        messages: messages,
        temperature: 0.5,
        stream: false // To keep UI simple we wait for the generation. Alternatively, stream can be built out using the fetch body reader.
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    console.error("Chat Service Error:", err);
    throw err;
  }
}
