const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("dotenv").config();

// CREATE APP
const app = express();

// MIDDLEWARES
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// GIMINI_API_CONFIG

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
// ROUTERS

app.post("/api/v1/summarize", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 10) {
      return res.status(400).json({
        success: false,
        message: "বিশ্লেষণ করার জন্য পর্যাপ্ত টেক্সট পাওয়া যায়নি।",
      });
    }

    // MY_CUSTOMIZE_PROMT
    const prompt = `আপনি একজন প্রফেশনাল MERN Stack ডেভেলপার। নিচের ডাটাটি খুব ভালোভাবে বিশ্লেষণ করুন এবং এর একটি সারসংক্ষেপ বাংলায় প্রদান করুন। গুরুত্বপূর্ণ অংশগুলো বুলেট পয়েন্টে লিখুন: \n\n ${text.substring(0, 15000)}`;

    const response = await axios.post(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY.trim()}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
    );

    const aiResult = response.data.candidates[0].content.parts[0].text;

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error) {
    console.error(
      "Gemini Error:",
      error.response ? error.response.data : error.message,
    );
    res.status(500).json({
      success: false,
      message: "সার্ভারে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
    });
  }
});

// SERVER START

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});
