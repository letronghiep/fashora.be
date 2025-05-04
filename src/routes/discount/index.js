"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  getDiscountAmount,
  getAllDiscountCodeWithProducts,
  createDiscount,
  getAllDiscountCodes,
  cancelDiscountCode,
  deleteDiscountCode,
  getDiscountDetail,
  updateDiscount,
} = require("../../controllers/discount.controller");
const { authentication } = require("../../middlewares/authentication");
const router = express.Router();

router.post("/amount", asyncHandler(getDiscountAmount));
router.get("/list_product_code", asyncHandler(getAllDiscountCodeWithProducts));
router.use(authentication);
router.post("", asyncHandler(createDiscount));
router.get("", asyncHandler(getAllDiscountCodes));
router.get('/:discount_id', asyncHandler(getDiscountDetail))
router.patch('/:discount_id', asyncHandler(updateDiscount))
router.delete("/:codeId", asyncHandler(deleteDiscountCode));
router.put("/cancel", asyncHandler(cancelDiscountCode));
module.exports = router;
