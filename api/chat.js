export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Parsear body aunque venga como texto plano
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { messages } = body || {};
    if (!messages) return res.status(400).json({ error: 'Sin mensajes' });

    const systemPrompt = `Eres el asesor técnico de DM Tools, distribuidora de herramienta industrial en Querétaro, México. Especialidad: herramienta de corte metalmecánico. Recomienda insertos, fresas y brocas según los parámetros del usuario. Responde en español, técnico pero claro. Pide datos si la consulta es vaga.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.slice(-10)
      })
    });

    const data = await response.json();
    const reply = data?.content?.[0]?.text || 'Sin respuesta';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
