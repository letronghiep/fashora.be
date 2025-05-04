"use strict";

const { generateContent } = require("./openAi.service");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { splitMessagesNatural } = require("../utils");
const createChatContext = async ({ content, userId }) => {
  try {
    // Gọi OpenAI để tạo nội dung trả lời
    const aiResponse = await generateContent(content);
    const foundUser = await User.findOne({
      _id: userId,
    });
    if (!foundUser) throw new NotFoundError("User not found");
    const chat = await Chat.create({
      userId: userId,
      messages: [
        {
          sender: "user",
          content: content,
          isAI: false,
          isUser: true,
        },
        {
          sender: "AI",
          content: splitMessagesNatural(aiResponse),
          isAI: true,
          isUser: false,
        },
      ],
    });
    return chat;
  } catch (error) {
    throw new BadRequestError(error);
  }
};
const getChatContext = async ({ userId }) => {
  try {
    const chat = await Chat.findOne({ userId }).sort({ createdAt: -1 });
    return chat;
  } catch (error) {
    throw new BadRequestError(error);
  }
};
module.exports = { createChatContext, getChatContext };