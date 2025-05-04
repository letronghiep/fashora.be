"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const { grantAccess } = require("../../middlewares/rbac.middleware");
const {
  getAnalysisData,
  downloadRevenueCSV
} = require("../../controllers/analysis.controller");
const router = express.Router();
router.use(authentication);
router.get("/seller", asyncHandler(getAnalysisData));
router.get("/seller/export", asyncHandler(downloadRevenueCSV));
module.exports = router;
