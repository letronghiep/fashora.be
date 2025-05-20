"use strict";
const express = require("express");
const router = express.Router();
const {
  createInventoryTransaction,
} = require("../../controllers/inventoryTransaction.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
// Định nghĩa các route cho inventory transactions
// router.get("/", asyncHandler(getInventoryTransactions));
router.post("/", authentication, asyncHandler(createInventoryTransaction));

module.exports = router;
