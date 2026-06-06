export default async function handler(req, res) {
  // CORS тохиргоо - Бусад вэбээс хандах боломж олгоно
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { message, postText } = req.body;

  // 1. HOLBOO.ai СИСТЕМ ЗААВАРЧИЛГАА (PROMPT)
  const systemPrompt = `Чи бол Монголын анхны demand-first AI худалдааны платформ болох HOLBOO.ai-ийн мэргэшсэн борлуулалтын зөвлөх.

Үндсэн үүрэг:
1. Хэрэглэгчийн хүссэн бүх зүйлийг (электроник, машин, байр, гар урлал, YouTuber merch гм) олоход нь туслах.
2. "Үгүй" эсвэл "Байхгүй" гэж хэзээ ч битгий хэл. Хэрэв бараа системд байхгүй бол: "Бид танд заавал олж өгнө. Би сая таны хүсэлтийг админ болон нийлүүлэгчид рүү 'Яаралтай' төлөвтэйгөөр дамжууллаа. Бид 1-3 хоногийн дотор танд хамгийн сайн хувилбарыг олж мэдэгдэх болно" гэж хариулж, холбоо барих дугаарыг нь асууж ав.
3. Барааг идэвхтэй зарж борлуул. "Шинэ мэт", "Баталгаатай", "Хамгийн хямд" гэх мэт давуу талыг нь онцолж, хэрэглэгчийг худалдан авалт руу хөтөл.
4. Монгол YouTuber-үүд (жишээ нь: Gants-Erdene) болон дотоодын үйлдвэрлэгчдийг маш сайн мэддэг, тэдний бүтээгдэхүүнийг дэмжиж сурталчилдаг байх.
5. Хэрэглэгч нэг бараа асуухад түүнтэй ойролцоо үнэтэй болон ижил төстэй 2-3 сонголтыг жагсаалтаар харуулж, харьцуулахад нь тусал.

Харилцааны өнгө аяс:
Найрсаг, залуулаг, мэргэжлийн Монгол хэлээр харилцана. Хэрэглэгчийг "Та" гэж хүндэтгэнэ.

Хэрэглэгч одоо "${postText || 'бараа'}" сонирхож байна.`;

  // 2. ЧИНИЙ API KEY - Үүнийг ' ' дотор тавиарай
  const GEMINI_KEY = 'AQ.Ab8RN6LvIvLTfuh-wF5xtTwHa27ZEYjUC1Tomh36AFpdp5cfbg'; 

  try {
    // Gemini 1.5 Flash API-г дуудах URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_KEY // AQ түлхүүр дээр заавал header хэрэгтэй болдог
      },
      body: JSON.stringify({
        system_instruction: { 
          parts: [{ text: systemPrompt }] 
        },
        contents: [
          { 
            role: 'user', 
            parts: [{ text: message }] 
          }
        ],
        generationConfig: { 
          maxOutputTokens: 1000, 
          temperature: 0.7 
        }
      })
    });

    const data = await response.json();
    
    // Алдаа шалгах
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return res.status(200).json({ 
        reply: "Уучлаарай, холболт түр саатлаа. Та дараа дахин оролдоно уу." 
      });
    }

    // Хариуг задлах
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Уучлаарай, би таныг сайн ойлгосонгүй. Та асуултаа тодруулна уу?";
    
    res.status(200).json({ reply });

  } catch (e) {
    console.error('Server side error:', e);
    res.status(500).json({ reply: "Сервер дээр алдаа гарлаа. Түр хүлээнэ үү." });
  }
}
