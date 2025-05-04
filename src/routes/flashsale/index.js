"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const {
  createFlashSale,
  getFlashSale,
  getFlashSales,
} = require("../../controllers/flashsale.controller");
const router = express.Router();
// shop
router.post("", authentication, asyncHandler(createFlashSale));
router.get("", asyncHandler(getFlashSales));
router.get("/:flash_sale", asyncHandler(getFlashSale));
module.exports = router;
