import { createClient } from '@supabase/supabase-js'

const SB_URL = 'https://sioawkogfwbtbkotefph.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpb2F3a29nZndidGJrb3RlZnBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NDIyMTQsImV4cCI6MjA5NjAxODIxNH0.uyhykWjnqLJOVmsPMlDDECmv03GECPm29FBvlgUBiM0'
const sb = createClient(SB_URL, SB_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { message, postText } = req.body

  // Supabase-аас бараа хайх
  let productsContext = ''
  try {
    const searchTerm = postText || message || ''
    const { data: products } = await sb
      .from('products')
      .select('name, price, condition, warranty, delivery, description')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .limit(5)

    if (products && products.length > 0) {
      productsContext = '\n\nОдоо байгаа бараанууд:\n' + products.map((p, i) =>
        `${i+1}. ${p.name} — ₮${p.price?.toLocaleString()}, ${p.condition}, баталгаа: ${p.warranty||'байхгүй'}, хүргэлт: ${p.delivery||'тодорхойгүй'}`
      ).join('\n')
    }
  } catch(e) {
    console.log('Product search error:', e)
  }

  const systemPrompt = `Та HOLBOO.ai платформын AI худалдааны зөвлөх юм. Зөвхөн монгол хэлээр хариул.

ДҮРЭМ:
- Давтан мэндлэхгүй, шууд бараа санал болго
- Богино, тодорхой хариул (2-3 өгүүлбэр)
- Үнэтэй бараа түрүүлж харуул (anchoring)
- "Таалагдаж байна уу? 😊" гэж л асуу — хэзээ ч "Авах уу?" гэж битгий асуу
- Бараа байхгүй бол: "Бид олж өгнө, түр хүлээгээрэй 🙂" гэж хэлээд ойролцоо бараа санал болго
- Орой 18:00-аас хойш захиалга: "Маргааш хүргэгдэнэ 🙂"
- Хамтрахыг хүсвэл: "+976 96091122 руу холбогдоорой"
- Хэрэглэгч эргэлзвэл давуу талыг нь тайлбарла

Хэрэглэгч хайж байгаа зүйл: "${postText}"${productsContext}`

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.5
      })
    })
    const d = await r.json()
    const reply = d.choices?.[0]?.message?.content || 'Алдаа гарлаа'
    res.status(200).json({ reply })
  } catch(e) {
    res.status(200).json({ reply: 'Холболт алдаа гарлаа 😔' })
  }
}
