"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");

const {
  createTrackPageView,
  getTrackPageView,
} = require("../../controllers/pageview.controller");
const router = express.Router();

router.post("", asyncHandler(createTrackPageView));
router.get("", asyncHandler(getTrackPageView));

module.exports = router;
