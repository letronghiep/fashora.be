"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  getListShipping,
  createShipping,
  updateShipping,
  removeShipping,
  getShippingDetail,
  updateDefaultShipping,
} = require("../../controllers/shipping.controller");
const {
  authentication,
  isAdmin,
  checkAdmin,
} = require("../../middlewares/authentication");
const router = express.Router();
router.get("/", authentication, asyncHandler(getListShipping));
router.get('/:shipping_id', authentication, asyncHandler(getShippingDetail))
router.post("/", authentication, asyncHandler(createShipping));
router.patch('/:shipping_id', authentication, asyncHandler(updateShipping))
router.patch('/default/:shipping_id', authentication, asyncHandler(updateDefaultShipping));
router.delete('/:shipping_id', authentication, asyncHandler(removeShipping));
module.exports = router;
