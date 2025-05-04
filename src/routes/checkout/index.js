"use strict";

const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication, isAdmin } = require("../../middlewares/authentication");
const {
  checkoutReview,
  orderByUser,
  getOrderByUser,
  getDetailOrderByUser,
  updateStatusOrder,
  cancelOrder,
  exportOrderToCSV,
  createCheckoutOnline,
  callbackZaloPay,
  getOrderForAdmin,
} = require("../../controllers/checkout.controller");

router.post("/callback", asyncHandler(callbackZaloPay));
router.use(authentication);
router.post("/review", asyncHandler(checkoutReview));
router.post("/create", asyncHandler(orderByUser));
router.post("/payment", asyncHandler(createCheckoutOnline));
router.get("", asyncHandler(getOrderByUser));
router.get("/export", asyncHandler(exportOrderToCSV));
router.get("/admin", isAdmin, asyncHandler(getOrderForAdmin));
router.get("/:order_id", asyncHandler(getDetailOrderByUser));
router.patch("/", asyncHandler(updateStatusOrder));
router.patch("/canceled/:order_id", asyncHandler(cancelOrder));
module.exports = router;
