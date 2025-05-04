"use strict";
const { BadRequestError, NotFoundError } = require("../core/error.response");
const KeyToken = require("../models/keyToken.model");
const createKeyToken = async ({
  userId,
  publicKey,
  privateKey,
  refreshToken = "",
}) => {
  try {
    const filter = { user: userId },
      update = {
        publicKey,
        privateKey,
        refreshTokenUsed: [],
        refreshToken,
      },
      options = {
        upsert: true,
        new: true,
      };
    const tokens = await KeyToken.findOneAndUpdate(filter, update, options);
    return tokens ? tokens : null;
  } catch (error) {}
};
const findKeyTokenByUser = async ({ userId }) => {
  try {
    const token = await KeyToken.findOne({ user: userId }).lean();
    if (!token) throw new NotFoundError('Không tìm thấy user');
    return token;
  } catch (error) {
    throw new BadRequestError("Xảy ra lỗi");
  }
};
const removeKeyById = async (keyToken) => {
  try {
    await KeyToken.findByIdAndDelete(keyToken).exec();
    return true;
  } catch (error) {
    throw new BadRequestError("Xảy ra l��i");
  }
};
module.exports = {
  createKeyToken,
  findKeyTokenByUser,
  removeKeyById
};
