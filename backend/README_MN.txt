NUTRI BBE — OPENAI BACKEND

1) Node.js 20+ суулгана.
2) backend хавтсанд terminal нээгээд:
   npm install
   cp .env.example .env
3) .env файлд OPENAI_API_KEY=... утгаа оруулна. API key-г аппын UI, GitHub эсвэл хэрэглэгчид тараах APK дотор хэзээ ч бүү хий.
4) npm start
5) Серверээ HTTPS домэйн дээр байршуул (Render, Railway, Fly.io, VPS гэх мэт). Health шалгалт: https://YOUR_HOST/health
6) Nutri Bbe апп → Хоол → AI backend серверийн HTTPS хаяг хэсэгт домэйнээ оруул.
7) Зураг, текст, эсвэл хоёуланг явуулж турш.

Endpoint:
POST /api/analyze
Content-Type: multipart/form-data
- image: optional JPG/PNG/WEBP file
- description: optional text

Response:
{ "food": { "name":"...", "portion_grams":..., "calories_kcal":..., "protein_g":..., "carbs_g":..., "fat_g":..., "fiber_g":..., "confidence":"medium", "notes":"..." } }

Security:
- API key зөвхөн backend .env-д байна.
- Production-д CORS_ORIGIN-ийг өөрийн аппын домэйнүүдээр хязгаарла.
- Rate limit 20 request/min/IP; production-д хэрэглэгчийн auth, quotas, abuse protection нэм.
- AI estimate нь ойролцоо; хэрэглэгчээр баталгаажуул.
