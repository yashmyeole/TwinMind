import { SYSTEM_CHAT_PROMPT } from '../constants/prompts';

export async function sendChatMessage(apiKey, transcriptContext, chatHistory, newUserMessage, customChatPrompt = null, onChunk = null) {
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
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      const lines = chunkText.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const parsed = JSON.parse(line.substring(6));
            if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
              const token = parsed.choices[0].delta.content;
              fullContent += token;
              if (onChunk) {
                onChunk(token);
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }

    return fullContent;

  } catch (err) {
    console.error("Chat Service Error:", err);
    throw err;
  }
}

