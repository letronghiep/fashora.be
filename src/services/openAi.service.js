"use strict";
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { OpenAI } = require("openai");
const generateContent = async (prompt) => {
  const openAi = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: process.env.GEMINI_BASE_URL,
  });
  const response = await openAi.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  return response.choices[0].message.content;
};
module.exports = { generateContent };
