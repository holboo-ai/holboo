export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { message, postText } = req.body

  const systemPrompt = `Чи HOLBOO.ai платформын AI худалдааны зөвлөх юм. Монгол хэлээр найрсаг байж яриарай. Хэрэглэгч "${postText}" гэж хайж байна. Бараа санал болгохдоо үнэ, нөхцөл, баталгааг хэл. "Таалагдаж байна уу? 😊" гэж л асуу — хэт ятгаж бүү зар. Байхгүй бараа бол "бид олж өгнө, түр хүлээгээрэй 🙂" гэж хэл. Дэлгүүр хаалттай үед "маргааш хүргэгдэнэ 🙂" гэж хэл. Хамтрахыг хүсвэл "+976 99999999 руу холбогдоорой" гэж хэл.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'Уучлаарай, алдаа гарлаа 😔'
    res.status(200).json({ reply })
  } catch (e) {
    res.status(500).json({ reply: 'Уучлаарай, алдаа гарлаа 😔' })
  }
}
