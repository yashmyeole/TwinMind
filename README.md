# 🧠 TwinMind Meeting Copilot

TwinMind is a highly responsive, low-latency AI meeting assistant built to process live audio, instantly transcribe conversations, surface intelligent contextual insights on the fly, and answer direct questions regarding the ongoing discussion.

Models: Groq for everything. Whisper Large V3 for transcription. GPT-OSS 120B for suggestions and chat. Same model for everyone so we are comparing prompts quality.

## ✨ Features
* **Live Audio Transcription Blocking:** Continuously chunks and transcribes microphone input automatically.
* **Intelligent Auto-Suggestions:** Watches the conversational state silently in the background. If you make a claim, it surfaces a Fact Check. If discussion stalls, it surfaces a novel Talking Point.
* **Context-Aware Deep Chat:** Click any generated suggestion or type a custom question to rapidly receive detailed answers sourced meticulously from the recent transcript context.
* **Formal Meeting Notes Export:** Natively converts the final transcript, AI insights, and Q&A history into a fully styled, print-ready HTML document.

---

## 🚀 Setup Instructions

1. **Clone & Install**
   ```bash
   git clone <repo-url>
   cd TwinMind
   npm install
   ```

2. **Start the Development Server**
   ```bash
   npm run dev
   ```

3. **Configure API Key**
   - Access the UI running sequentially on `localhost:5173`.
   - Click the **⚙️ Settings** icon in the header.
   - Paste a valid **Groq API Key**. *(Note: This key is stored securely inside your browser's private `localStorage` and is never exported or shared).*

---

## 🛠️ Stack Choices & Architecture

* **React + Vite:** Chosen for incredibly fast HMR during development and granular component state separation. Component separation allows the transcript engine to parse chunks asynchronously without freezing the chat UI.
* **Tailwind CSS:** Used explicitly due to how rapidly it maps specific cohesive visual tokens (gradients, micro-animations like our bouncing processing beads, and conditional classes).
* **Native Web Audio API (`MediaRecorder`):** Used to interface directly with hardware mics to slice reliable audio telemetry (`Blob`) data before routing to HTTP backends.
* **Groq Cloud API:** Because live meetings are incredibly time-sensitive, traditional LLM API latencies (2s–8s) are unnacceptable. We mandate Groq here to exploit their LPU speeds to crush the Time-To-First-Token (TTFT).

---

## 📝 Prompt Strategy & Context Management

The core engineering constraint of an active meeting copilot is balancing massive conversational context against speed and UI readability.

1. **The 30-Second Chunk Engine:** The microphone natively slices audio every exactly 30,000ms. Groq's Whisper API instantaneously converts these blobs seamlessly.
2. **The Sliding Protocol Window (Context Management):** We do not dump the entire 1-hour history into the Suggestions engine. Instead, we constrain the system to the tail-sliding **6 Minutes (12 chunks)**. This ensures that the AI is only reacting to the active subject at hand rather than bringing up "Talking Points" from long-dead topics. The context window is adjustable inside the Settings Panel.
3. **Contextual Suggestion Override Logic:** The primary suggestion architecture forces a clean JSON schema: `[Question, Talking Point, Fact Check]`. However, the prompt is explicitly designed dynamically to overwrite these default slots if its sliding window detects immediate intent (i.e. replacing a Fact Check with a direct 'Answer' if a specific question was recorded on mic).
4. **The 24-Word Visual Clamp Constraint:** We actively instruct Llama 3.3 70b to rigidly restrict the total output character limit of suggestion cards to 24 words. Under live testing, readers inherently ignore long blocks of text while speaking; we forced intense concision over detail. Detailed insight is sequestered intentionally to the Chat UI shell.

---

## ⚖️ Tradeoffs & Technical Decisions

* **Promise-Waiting vs SSE Streaming:** While Server-Sent-Events (SSE streaming) is incredibly popular for LLMs right now, handling continuous React component state injections for every single token causes massive internal performance drag (re-renders). **Tradeoff:** By clamping output lengths explicitly via prompt engineering combined with the extraordinary raw inference speed of Groq, we achieve perceived real-time speeds *without* bloating our front-end architecture with complex streaming reducers. 
* **30-Second Interval Slicing:** A continuous WebSocket connection sending raw bytes directly to Whisper would lower transcription latency to ~1s instead of 30s. **Tradeoff:** Websocket audio piping dramatically increases structural complexity. The 30s `MediaRecorder.ondataavailable` chunk method is brutally robust and easily restarts natively if hardware disconnects.
* **HTML Export over raw JSON:** We opted to compile the export outputs dynamically via string-literal mapping into an independent `.html` wrapper. **Tradeoff:** While raw JSON would be much better for data-ingestion systems, our primary exported stakeholder is human (project managers, directors). The HTML file allows them to double-click and immediately perceive a beautifully colored document, which they natively 'Print-To-PDF' without requiring any dev knowledge.
