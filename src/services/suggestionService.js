import { SYSTEM_SUGGESTION_PROMPT } from '../constants/prompts';

export async function generateSuggestions(apiKey, transcriptContext, customPrompt = null) {
  if (!apiKey) {
    throw new Error("Missing Groq API Key.");
  }
  if (!transcriptContext || transcriptContext.trim() === "") {
    return [];
  }

  // Always use the main suggestion prompt (which now generates exactly 3 suggestions)
  let systemMessage = customPrompt || SYSTEM_SUGGESTION_PROMPT;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: `Recent Transcript:\n${transcriptContext}\n\nRespond with JSON format only.`
          }
        ],
        temperature: 0.3,
        // Using response_format for strict json
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Parse the JSON. We adapt because we asked for {"suggestions": [...]} via JSON object forcing
    let parsed;
    try {
      parsed = JSON.parse(content);
      if (parsed.suggestions !== undefined) {
        parsed = parsed.suggestions;
      }
    } catch (e) {
      console.error("Failed to parse JSON content from LLM:", content);
      throw new Error("Invalid format received from AI.");
    }

    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      const possibleArray = Object.values(parsed).find(val => Array.isArray(val));
      if (possibleArray) parsed = possibleArray;
      else if (parsed === null || Object.keys(parsed).length === 0) parsed = [];
      else parsed = [parsed];
    }

    return parsed.slice(0, 3); // Cap at 3

  } catch (err) {
    console.error("Suggestion Service Error:", err);
    throw err;
  }
}
