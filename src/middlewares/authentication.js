const { HEADER } = require("../constants");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const JWT = require("jsonwebtoken");
const {
  BadRequestError,
  NotFoundError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findKeyTokenByUser } = require("../services/keyToken.service");
const { verifyJWT } = require("../auth/authUtil");

const authentication = async (req, res, next) => {
  try {
    const token = await req.headers[HEADER.AUTHORIZATION];
    if (!token || !token.startsWith("Bearer "))
      throw new AuthFailureError("Kiểm tra lại thông tin");
    const userId = await req.headers[HEADER.CLIENT_ID];
    const accessToken = token.split("Bearer ")[1];
    const keyStore = await findKeyTokenByUser({ userId });
    if (!keyStore) throw new AuthFailureError("Người dùng không hợp lệ");
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Người dùng không hợp lệ");
    req.user = decodeUser;
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    next(error);
  }
};
const checkAdmin = async (req, res, next) => {
  const usr_name = await req.body.username;
  try {
    const foundUser = await User.findOne({
      usr_name,
    })
      .populate("usr_role")
      .lean();
    if (foundUser.usr_role.rol_slug !== "s00001") {
      throw new AuthFailureError("Tài khoản không phải admin");
    }
    return next();
  } catch (error) {
    next(error);
  }
};
const checkSeller = async (req, res, next) => {
  try {
    const usr_name = await req.body.username;
    const foundShop = await Shop.findOne({
      usr_name,
    })
      .populate("role")
      .lean();
    if (!foundShop) throw new AuthFailureError("Tài khoản không tồn tại");
    if (foundShop.role.rol_slug !== "s00002") {
      throw new AuthFailureError(
        "Tài khoản của bạn chưa có quyền truy cập vào Seller Center. Vui lòng thử lại bằng tài khoản khác"
      );
    }
    return next();
  } catch (error) {
    next(error);
  }
};
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("usr_role").lean();
    if (user.usr_role.rol_slug !== "s00002") {
      throw new AuthFailureError("Bạn không có quyền quản trị viên");
    }
    return next();
  } catch (error) {
    next(error);
  }
};
const isNotUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("usr_role").lean();
    if (user.usr_role.rol_slug === "s00003") {
      throw new AuthFailureError("Người dùng không có quyền đăng sản phẩm");
    }
    return next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authentication,
  checkAdmin,
  checkSeller,
  isAdmin,
  isNotUser,
};
