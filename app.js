import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

async function callGroq(messages, maxTokens = 1024) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: maxTokens,
        temperature: 0.5,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

app.post("/summarize", async (req, res) => {
  const { title, url, text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });

  try {
    const result = await callGroq([
      {
        role: "system",
        content: `তুমি একজন বাংলা ভাষার AI সহকারী। 
তোমার কাজ হলো যেকোনো ভাষার webpage পড়ে সম্পূর্ণ বাংলায় সহজ ভাষায় বুঝিয়ে দেওয়া।
সবসময় বাংলায় উত্তর দেবে, অন্য কোনো ভাষায় নয়।`,
      },
      {
        role: "user",
        content: `এই webpage-টি পড়ো এবং বাংলায় বুঝিয়ে দাও।

পেজের শিরোনাম: ${title}
পেজের লিংক: ${url}

পেজের বিষয়বস্তু:
${text}

নিচের format-এ বাংলায় উত্তর দাও:

📌 মূল বিষয়: (এক লাইনে বলো এই পেজটি কী নিয়ে)

📝 সহজ ভাষায় সারসংক্ষেপ: (৩-৫ লাইনে সহজ বাংলায় বুঝিয়ে দাও, যেন একজন সাধারণ মানুষও বুঝতে পারে)

🔑 গুরুত্বপূর্ণ পয়েন্টগুলো:
• (পয়েন্ট ১)
• (পয়েন্ট ২)
• (পয়েন্ট ৩)

💡 এক কথায়: (পুরো বিষয়টা এক বাক্যে বলো)`,
      },
    ]);

    res.json({ result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  try {
    const result = await callGroq(
      [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      300,
    );

    res.json({ result });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
