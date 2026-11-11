import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

const app = express();
const port = Number(process.env.PORT || 8787);
const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const maxMb = Math.max(1, Number(process.env.MAX_IMAGE_MB || 8));
const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map(x=>x.trim());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp"];
    cb(allowed.includes(file.mimetype) ? null : new Error("Зөвхөн JPG, PNG, WEBP зураг зөвшөөрнө."), allowed.includes(file.mimetype));
  }
});
app.use(cors({origin:(origin,cb)=> {
  if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return cb(null,true);
  cb(new Error("CORS origin зөвшөөрөгдөөгүй"));
}}));
app.use(express.json({limit:"32kb"}));
app.use(rateLimit({windowMs:60_000,limit:20,standardHeaders:true,legacyHeaders:false}));
app.get("/health",(_req,res)=>res.json({ok:true,service:"Nutri Bbe AI",model,apiKeyConfigured:Boolean(process.env.OPENAI_API_KEY)}));

const schema = {
  type:"object", additionalProperties:false,
  properties:{
    name:{type:"string"},
    portion_grams:{type:"number"},
    calories_kcal:{type:"number"},
    protein_g:{type:"number"},
    carbs_g:{type:"number"},
    fat_g:{type:"number"},
    fiber_g:{type:"number"},
    confidence:{type:"string",enum:["low","medium","high"]},
    notes:{type:"string"}
  },
  required:["name","portion_grams","calories_kcal","protein_g","carbs_g","fat_g","fiber_g","confidence","notes"]
};
const nutritionInstructions = `You are Nutri Bbe, a careful nutrition estimation assistant. Understand Mongolian and English food descriptions. Identify food from the provided photo and/or text. Prefer Mongolian dish names when appropriate. Estimate edible serving weight and nutrition for the whole described serving, not per 100g. For mixed dishes, state assumptions briefly in Mongolian. Never claim exact laboratory accuracy. If image is ambiguous, use confidence low and explain. Do not infer ingredients that cannot be seen or described; make conservative typical-recipe estimates. Return only the requested schema. All nutrient numbers must be non-negative.`;

app.post("/api/analyze", upload.single("image"), async (req,res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({error:"Сервер дээр OPENAI_API_KEY тохируулаагүй байна."});
    const description = String(req.body.description || "").trim().slice(0,4000);
    if (!req.file && !description) return res.status(400).json({error:"Зураг эсвэл хоолны тайлбар шаардлагатай."});
    const content = [{type:"input_text",text:`Estimate the nutrition for this food. User description: ${description || "No text description; identify the food in the image."}`}];
    if (req.file) {
      const mime = req.file.mimetype;
      const base64 = req.file.buffer.toString("base64");
      content.push({type:"input_image",image_url:`data:${mime};base64,${base64}`,detail:"high"});
    }
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const response = await client.responses.create({
      model,
      instructions:nutritionInstructions,
      input:[{role:"user",content}],
      text:{format:{type:"json_schema",name:"nutrition_estimate",strict:true,schema}}
    });
    const food = JSON.parse(response.output_text);
    for (const key of ["portion_grams","calories_kcal","protein_g","carbs_g","fat_g","fiber_g"]) {
      if (!Number.isFinite(food[key]) || food[key] < 0) throw new Error("AI output validation failed");
    }
    res.json({food,model,disclaimer:"Ойролцоо тооцоо. Порц, жор, тос болон орцноос хамаарч өөрчлөгдөнө."});
  } catch (err) {
    console.error("analyze_error",err?.status || "",err?.message || err);
    if (err instanceof multer.MulterError) return res.status(413).json({error:"Зураг хэт том байна."});
    res.status(500).json({error:"AI шинжилгээ амжилтгүй боллоо. Серверийн тохиргоо болон API хэрэглээг шалгана уу."});
  }
});
app.use((err,_req,res,_next)=>res.status(400).json({error:err.message || "Хүсэлт буруу байна."}));
app.listen(port,()=>console.log(`Nutri Bbe AI backend listening on ${port}`));
