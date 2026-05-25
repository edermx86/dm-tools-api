// DM Tools - Backend Vercel
// Archivo: api/chat.js

export default async function handler(req, res) {

  // CORS — permite peticiones desde tu Shopify
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'Datos inválidos' });

  // Catálogo base (puedes expandirlo con más productos)
  const catalogo = process.env.CATALOGO_TEXTO || "Catálogo no configurado.";

  const systemPrompt = `Eres el asesor técnico experto de DM Tools, distribuidora de herramienta industrial en Querétaro, México. Tu especialidad es herramienta de corte metalmecánico.

CATÁLOGO ACTUAL DE DM TOOLS:
${catalogo}

INSTRUCCIONES:
- Recomienda ÚNICAMENTE herramientas del catálogo anterior
- Indica siempre: código, proveedor, razón técnica y parámetros de corte
- Si ninguna herramienta es ideal, indícalo honestamente
- Responde en español, técnico pero claro
- Pide datos si la consulta es vaga: material, operación, máquina, acabado
- Máximo 3-4 párrafos por respuesta
- Sugiere contactar a DM Tools en Querétaro para confirmar disponibilidad`;

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
    const reply = data?.content?.[0]?.text || 'Sin respuesta';
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: 'Error al conectar con Claude' });
  }
}
