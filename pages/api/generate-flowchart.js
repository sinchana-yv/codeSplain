import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language } = req.body;

  if (!code || !code.trim()) {
    return res.status(400).json({ error: 'No code provided.' });
  }

  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is missing." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Directing the LLM to only respond with Mermaid syntax
    const systemPrompt = "You are a senior logic analyzer and architecture mapper. You digest source code and build elegant Mermaid flowcharts representing the code structure.";
    
const userPrompt = `Given the following ${language} code, generate a Mermaid.js flowchart (graph TD) that maps its core logical flow. 
Code:
${code}

Rules:
1. Return ONLY valid Mermaid syntax starting with "graph TD;".
2. No markdown wrappers (\`\`\`mermaid) around your response.
3. Node labels MUST be simple English words ONLY. absolutely NO quotes ("), parentheses (), brackets [], equals =, or symbols inside node labels.
4. Correct example: A[User Input] --> B[If x is 10]
5. BAD example: A[user_input("Enter")] --> B[__main__==true]
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.1, // Strict determinism
      max_tokens: 500,
    });

    let rawOutput = chatCompletion.choices[0]?.message?.content || "";
    
    // Clean up potential markdown wrappers if the LLM disobeys Rule 2
    rawOutput = rawOutput.replace(/```mermaid/i, '').replace(/```/g, '').trim();

    // Make sure it starts correctly
    if (!rawOutput.startsWith('graph')) {
      rawOutput = `graph TD;\n  A[Incomplete Graph] --> B[Model yielded invalid syntax];`;
    }

    return res.status(200).json({ mermaidSyntax: rawOutput });
  } catch (error) {
    console.error("Flowchart API error:", error);
    return res.status(500).json({ error: "Failed to generate flowchart from Groq." });
  }
}
