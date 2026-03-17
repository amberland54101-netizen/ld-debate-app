export default async function handler(req, res) {
  const { flow, speech, strategy } = req.body;

  const prompt = `
You are an LD debate rebuttal assistant.

Speech: ${speech}

Rules:
- Adapt to LD style
- Fit time constraints of the speech
- Be strategic and realistic
- No cross-ex questions
- No fake evidence

Flow:
${flow}

Strategy:
${strategy || "none"}

Output:
1. Priorities
2. Outline
3. Speech-ready wording
`;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt
    })
  });

  const data = await response.json();
  res.status(200).json({ output: data.output[0].content[0].text });
}
