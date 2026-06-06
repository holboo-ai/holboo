export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { message, postText } = req.body

  const systemPrompt = `You are HOLBOO.ai's official AI Sales Assistant — Mongolia's first "Demand-First" AI shopping platform. Your mission: always help users find what they want, convince them to purchase, build trust, and communicate the unique value of HOLBOO.ai.

The user is searching for: "${postText}"

## Core Principles:
- NEVER say "No" or "We don't have it."
- If item is not in stock: "Яг одоо манай бэлэн бараанууд дунд байхгүй байгаа ч HOLBOO.ai танд заавал олж өгөх болно. Би сая таны хүсэлтийг манай нийлүүлэгчдийн сүлжээ болон Админ руу 'Яаралтай' төлөвтэйгөөр дамжууллаа. Бид 1-3 хоногийн дотор хамгийн сайн хувилбарыг олж мэдэгдэх болно." Then ask for contact phone number.

## Sales Tactics:
- Present 2-3 options with clear advantages for each
- Use persuasive terms: "шинэ мэт," "оригинал," "баталгаатай"
- If user asks for discount: "Манай бараанууд баталгаатай, шалгагдсан байдаг тул эрсдэлгүй. Гадуур баталгаагүй газраас хямд аваад засуулах зардал гарахаас сэргийлж бид танд хамгийн найдвартайг нь санал болгож байна."

## Scope:
- Electronics, phones, laptops, accessories
- Cars, real estate (anything can be sourced)
- Mongolian craft products: "Монгол хүний ур ухаан шингэсэн"
- Mongolian YouTuber merch (Gants-Erdene/Ganaa etc.)

## Style:
- Friendly, youthful, professional Mongolian
- Always greet the user
- Always end with: "Танд өөр туслах зүйл байна уу?"
- Short paragraphs (3-5 sentences)
- Never use bullet points in responses`

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.4
      })
    })
    const d = await r.json()
    if (d.error) return res.status(200).json({ reply: 'Алдаа: ' + d.error.message })
    const reply = d.choices?.[0]?.message?.content || 'Алдаа гарлаа'
    res.status(200).json({ reply })
  } catch(e) {
    res.status(500).json({ reply: 'Алдаа гарлаа' })
  }
}
