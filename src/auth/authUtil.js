"use strict";
const JWT = require("jsonwebtoken");
const { BadRequestError } = require("../core/error.response");
const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    const accessToken = await JWT.sign(payload, publicKey, {
      expiresIn: "3d",

    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      expiresIn: "7d",
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new BadRequestError("Xảy ra lỗi khi tạo token");
  }
};
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = { createTokenPair, verifyJWT };
