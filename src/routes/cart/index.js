"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const {
  addToCart,
  updateCart,
  getListUserCart,
  deleteCart,
} = require("../../controllers/cart.controller");
const { grantAccess } = require("../../middlewares/rbac.middleware");
const router = express.Router();
router.use(authentication);
router.post("", asyncHandler(addToCart));
router.patch("/update", asyncHandler(updateCart));
router.get("", asyncHandler(getListUserCart));
router.delete("/:sku_id", asyncHandler(deleteCart));
module.exports = router;
