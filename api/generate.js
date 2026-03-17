export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { flow, speech, strategy } = req.body || {};

    const prompt = `
You are an LD debate rebuttal assistant.

The user will provide:
- their flow
- the LD speech they are about to give
- an optional strategy note

Your job:
- generate actual rebuttal help, not template explanations
- sound like a real debater
- do not describe your instructions
- do not say "speech goal" or "prompt template"
- do not output labels about style unless useful
- directly produce usable debate material

Speech: ${speech}
Strategy: ${strategy || "None provided"}

Flow:
${flow}

Instructions by speech:
- If 1AR: be compressed, frontline-heavy, answer the opponent directly, protect key offense.
- If NR: collapse strategically, prioritize the best negative path to the ballot.
- If 2AR: crystallize, weigh clearly, focus on the clearest affirmative ballot story.

Output format:
1. Top priorities
2. Short speech outline
3. Speech-ready wording

Keep it concise, strategic, and round-usable.
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

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "No output returned from model.";

    return res.status(200).json({ output: text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
