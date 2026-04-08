# CodeSplain AI

Real-Time Coding Explanation Terminal powered by Next.js, Monaco Editor, and Groq (LLaMA 3.1).

## Getting Started

1. Set up your environment variable. Open `.env.local` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

- Type code into the Monaco Editor on the left.
- When you press Enter or pause typing for a second, the current line will be sent to the AI for explanation.
- Explanations appear sequentially in the Terminal pane on the right.
- You can enable Voice Controls to auto-read explanations or dictate commands ("explain code", "clear terminal").
