"use strict";
const { BadRequestError } = require("../core/error.response");
const { CREATED, SuccessResponse, OK } = require("../core/success.response");
const {
  signUpService,
  loginService,
  logoutService,
  handleRefreshTokenService,
} = require("../services/access.service");
const signUp = async (req, res, next) => {
  const data = await signUpService({
    usr_name: req.body.username,
    usr_password: req.body.password,
    usr_full_name: req.body.fullname,
  });
  const { tokens } = data;
  // set cookies
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  new CREATED({
    message: "Đăng ký thành công",
    metadata: data,
  }).send(res);
};

const login = async (req, res, next) => {
  const data = await loginService({
    usr_name: req.body.username,
    usr_password: req.body.password,
  });
  const { tokens } = data;
  // set cookies
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  new OK({
    message: "Đăng nhập thành công",
    metadata: data,
  }).send(res);
};
const logout = async (req, res, next) => {
  try {
    const result = await logoutService(req.keyStore);
    res.clearCookie("refreshToken", {
      httpOnly: true,
    });
    new SuccessResponse({
      message: "User logged out successfully",
      metadata: result,
    }).send(res);
  } catch (error) {
    next(error);
  }
};
const getRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) throw new BadRequestError("Refresh token not found");
  new SuccessResponse({
    message: "Refresh token get successfully",
    metadata: { refreshToken: 1 },
  }).send(res);
};
const handleRefreshToken = async (req, res, next) => {
  const data = await handleRefreshTokenService({
    refreshToken: req.cookies.refreshToken,
    user: req.user,
    keyStore: req.keyStore,
  });
  const { tokens } = data;
  // set cookies
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  new SuccessResponse({
    message: "Refresh token handle successfully",
    metadata: data,
  }).send(res);
};

module.exports = {
  signUp,
  login,
  logout,
  handleRefreshToken,
  getRefreshToken,
};
