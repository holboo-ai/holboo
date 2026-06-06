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

  const GEMINI_KEY = 'AQ.Ab8RN6LvIvLTfuh-wF5xtTwHa27ZEYjUC1Tomh36AFpdp5cfbg'

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GEMINI_KEY}`
      },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
      })
    })

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Уучлаарай, алдаа гарлаа 😔'
    res.status(200).json({ reply })
  } catch (e) {
    res.status(500).json({ reply: 'Уучлаарай, алдаа гарлаа 😔' })
  }
}
