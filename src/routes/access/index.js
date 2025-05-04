"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  signUp,
  login,
  logout,
  handleRefreshToken,
  getRefreshToken,
} = require("../../controllers/access.controller");
const {
  checkAdmin,
  authentication,
} = require("../../middlewares/authentication");
const router = express.Router();
router.post("/signup", asyncHandler(signUp));
router.post("/login", asyncHandler(login));

// router.use(checkAdmin);
router.post("/admin-login", checkAdmin, asyncHandler(login));
router.get("/refresh-token", asyncHandler(getRefreshToken));
// handle refreshTOken and logout
router.use(authentication);
router.post("/logout", asyncHandler(logout));
router.post("/refreshToken", asyncHandler(handleRefreshToken));
module.exports = router;
