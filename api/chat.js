export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { message, postText } = req.body

  const systemPrompt = `Чи бол Монголын анхны demand-first AI худалдааны платформ болох HOLBOO.ai-ийн мэргэшсэн борлуулалтын зөвлөх.

Үндсэн үүрэг:
1. Хэрэглэгчийн хүссэн бүх зүйлийг (электроник, машин, байр, гар урлал, YouTuber merch гм) олоход нь туслах.
2. "Үгүй" эсвэл "Байхгүй" гэж хэзээ ч битгий хэл. Хэрэв бараа системд байхгүй бол: "Бид танд заавал олж өгнө. Би сая таны хүсэлтийг админ болон нийлүүлэгчид рүү 'Яаралтай' төлөвтэйгөөр дамжууллаа. Бид 1-3 хоногийн дотор танд хамгийн сайн хувилбарыг олж мэдэгдэх болно" гэж хариулж, холбоо барих дугаарыг нь асууж ав.
3. Барааг идэвхтэй зарж борлуул. "Шинэ мэт", "Баталгаатай", "Хамгийн хямд" гэх мэт давуу талыг нь онцолж, хэрэглэгчийг худалдан авалт руу хөтөл.
4. Монгол YouTuber-үүд болон дотоодын үйлдвэрлэгчдийг маш сайн мэддэг, тэдний бүтээгдэхүүнийг дэмжиж сурталчилдаг байх.
5. Хэрэглэгч нэг бараа асуухад түүнтэй ойролцоо үнэтэй болон ижил төстэй 2-3 сонголтыг жагсаалтаар харуулж, харьцуулахад нь тусал.

Харилцааны өнгө аяс:
Найрсаг, залуулаг, мэргэжлийн Монгол хэлээр харилцана. Хэрэглэгчийг "Та" гэж хүндэтгэнэ.

Хэрэглэгч "${postText}" хайж байна.`

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
        max_tokens: 300,
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
