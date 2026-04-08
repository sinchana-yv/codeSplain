import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullCode, lastLine, language } = req.body;

  if (!lastLine) {
    return res.status(400).json({ error: 'Missing lastLine' });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const systemPrompt = "You are a friendly programming teacher. Given code context and a single code line, return a short beginner-friendly explanation in plain English.";
    
    const userPrompt = `Language: ${language || 'javascript'}
FullCode:
${fullCode || '<none>'}

Explain only this line:
${lastLine}

Rules:
- Return 1-2 short sentences.
- Avoid all technical jargon; prefer plain words.
- Do not output code or markup; only explanation text.
- Keep it under ~200 characters.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
      max_tokens: 150,
    });

    const explanation = chatCompletion.choices[0]?.message?.content || "No explanation provided.";

    return res.status(200).json({ explanation: explanation.trim() });
  } catch (error) {
    console.error("Groq API error:", error);
    return res.status(500).json({ error: "Could not explain line. Try again." });
  }
}
