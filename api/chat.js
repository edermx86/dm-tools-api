export default async function handler(req, res) {

  // CORS primero — antes de todo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'false');

  // Responder preflight inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { messages } = req.body || {};
  if (!messages) return res.status(400).json({ error: 'Datos inválidos' });

  const systemPrompt = `Eres el asesor técnico experto de DM Tools, distribuidora de herramienta industrial en Querétaro, México. Tu especialidad es herramienta de corte metalmecánico — insertos, fresas, brocas y portaherramientas.

INSTRUCCIONES:
- Recomienda herramientas de corte basándote en los parámetros que te dé el usuario
- Indica siempre: tipo de herramienta, geometría recomendada, grado, y parámetros de corte (Vc, fn, ap)
- Responde en español, técnico pero claro
- Si la consulta es vaga, pide: material exacto, operación, máquina y acabado requerido
- Sugiere contactar a DM Tools en Querétaro para confirmar disponibilidad y precio`;

  try {
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

    if (!response.ok) {
      console.error('Anthropic error:', data);
      return res.status(500).json({ error: 'Error de Claude', detail: data });
    }

    const reply = data?.content?.[0]?.text || 'Sin respuesta';
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
