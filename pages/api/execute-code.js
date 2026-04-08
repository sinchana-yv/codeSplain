export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, language } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing code payload' });
  }

  // Map frontend languages to Judge0 CE language IDs
  let languageId = 93; // default JavaScript
  
  if (language === 'javascript') languageId = 93;
  else if (language === 'python') languageId = 71;
  else if (language === 'c') languageId = 50;
  else if (language === 'cpp') languageId = 54;
  else if (language === 'java') languageId = 62;

  try {
    const response = await fetch('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: code,
        language_id: languageId,
      })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error("Judge0 execution failed:", data);
        return res.status(500).json({ 
          error: data.message || data.error || 'Execution failed on the remote server.' 
        });
    }

    // Judge0 CE returns stdout, stderr, compile_output, status
    const stdout = data.stdout || '';
    const stderr = data.stderr || '';
    const compileOutput = data.compile_output || '';
    
    // Status ID 3 usually means Accepted/Success
    const exitCode = data.status?.id === 3 ? 0 : 1;

    return res.status(200).json({
      stdout,
      stderr: stderr || compileOutput,
      exitCode
    });
  } catch (error) {
    console.error("Execution error Details:", error);
    return res.status(500).json({ error: `Failed to connect to execution engine: ${error.message}` });
  }
}

