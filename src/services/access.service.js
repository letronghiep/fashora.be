"use strict";

// library
const bcrypt = require("bcrypt");

const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Shop = require("../models/shop.model");
const KeyStore = require("../models/keyToken.model");
const generateKey = require("../helpers/generateKey");
const { createKeyToken, removeKeyById } = require("./keyToken.service");
const { getInfoData, randomUserId } = require("../utils");
const { createTokenPair, verifyJWT } = require("../auth/authUtil");

const signUpService = async ({ usr_name, usr_password, usr_full_name }) => {
  try {
    const holderUser = await User.findOne({ usr_name }).lean();
    if (holderUser) {
      throw new BadRequestError("Tên người dùng đã tồn tại");
    }

    const passwordHash = await bcrypt.hash(usr_password, 10);
    const role = await Role.findOne({
      rol_name: "user",
      rol_status: "active",
    });
    const newUser = await User.create({
      usr_id: randomUserId(),
      usr_name,
      usr_full_name,
      usr_password: passwordHash,
      usr_status: "active",
      usr_role: role._id,
    });
    if (newUser) {
      const { publicKey, privateKey } = await generateKey();
      const keyStore = await createKeyToken({
        userId: newUser._id,
        privateKey,
        publicKey,
      });
      if (!keyStore) throw new BadRequestError("Xảy ra lỗi khi tạo khóa");
      const tokens = await createTokenPair(
        { userId: newUser._id, usr_name, role: role.rol_slug },
        publicKey,
        privateKey
      );
      return {
        tokens,
        user: getInfoData({
          field: ["usr_id", "usr_name"],
          object: newUser,
        }),
      };
    }
  } catch (error) {
    throw error;
  }
};
const loginService = async ({ usr_name, usr_password }) => {
  /**
   * check exists user
   * check username
   * check valid password
   * create accessToken and refreshToken
   */
  try {
    const foundUser = await User.findOne({
      usr_name,
      usr_status: "active",
    })
      .populate("usr_role")
      .lean();
    if (!foundUser)
      throw new AuthFailureError("Tài khoản hoặc mật khẩu không đúng");
    // check valid password
    const isMatch = await bcrypt.compare(usr_password, foundUser.usr_password);
    if (!isMatch) throw new AuthFailureError("Mật khẩu không đúng");
    // create token
    const { privateKey, publicKey } = generateKey();
    const { _id: userId, usr_role } = foundUser;
    const role = usr_role.rol_slug;
    const tokens = await createTokenPair(
      { userId, usr_name, role },
      publicKey,
      privateKey
    );
    // generate token
    const data = await createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      user: getInfoData({
        field: ["__v", "createdAt", "updatedAt"],
        object: foundUser,
      }),
      tokens,
    };
  } catch (error) {
    throw error;
  }
};
// logout
const logoutService = async (keyStore) => {
  try {
    const delKey = await removeKeyById(keyStore._id);
    return delKey;
  } catch (error) {
    throw error;
  }
};

const handleRefreshTokenService = async ({ refreshToken, keyStore, user }) => {
  const { userId, usr_name, role } = user;
  if (keyStore.refreshTokenUsed.includes(refreshToken))
    throw new ForbiddenError("Có lỗi xảy ra. Vui lòng đăng nhập lại!");
  if (keyStore.refreshToken !== refreshToken)
    throw new AuthFailureError("Tài khoản chưa được đăng ký");
  const foundUser = User.findOne({
    usr_name: usr_name,
    usr_id: userId,
  })
    .populate("usr_role")
    .lean();
  if (!foundUser) throw new AuthFailureError("Người dùng không tồn tại");
  // check tokens is used
  const tokens = await createTokenPair(
    { userId, usr_name, role },
    keyStore.publicKey,
    keyStore.privateKey
  );
  // Update tokens;
  await KeyStore.updateOne({
    $set: {
      refreshToken: tokens.refreshToken,
    },
    $addToSet: {
      refreshTokensUsed: refreshToken,
    },
  });
  return {
    user,
    tokens,
  };
};
module.exports = {
  signUpService,
  loginService,
  logoutService,
  handleRefreshTokenService,
};
