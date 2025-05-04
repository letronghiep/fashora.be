"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  createUser,
  listUser,
  detailUser,
  updateUser,
  createShop,
  getMe,
  deleteUser,
} = require("../../controllers/user.controller");
const {
  authentication,
  isAdmin,
  checkAdmin,
} = require("../../middlewares/authentication");
const { grantAccess } = require("../../middlewares/rbac.middleware");
const router = express.Router();
router.get("/me", authentication, asyncHandler(getMe));
router.get("/:user_id", asyncHandler(detailUser));
// middlewares to authenticate the request
router.post("/", authentication, asyncHandler(createUser));
router.patch("/update/:usr_id", authentication, asyncHandler(updateUser));
router.get("/", authentication, asyncHandler(listUser));
router.delete("/:user_id", authentication, asyncHandler(deleteUser));
router.post("/seller", asyncHandler(createShop));
module.exports = router;
