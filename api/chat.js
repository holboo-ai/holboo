export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { message, postText } = req.body
  const KEY = 'AQ.Ab8RN6LvIvLTfuh-wF5xtTwHa27ZEYjUC1Tomh36AFpdp5cfbg'
  
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${KEY}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{role:'user', parts:[{text: `Та HOLBOO.ai-ийн AI зөвлөх юм. Монгол хэлээр хариулна уу. Хэрэглэгч "${postText}" хайж байна.\n\nХэрэглэгч: ${message}`}]}],
        generationConfig: {maxOutputTokens: 300, temperature: 0.4}
      })
    })
    const d = await r.json()
    const reply = d.candidates?.[0]?.content?.parts?.[0]?.text || 'Алдаа гарлаа'
    res.status(200).json({ reply })
  } catch(e) {
    res.status(500).json({ reply: 'Алдаа гарлаа' })
  }
}
