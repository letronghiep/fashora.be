"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
    createVariation,
    
    deleteVariation,
    updateVariation,
    getVariations,
} = require("../../controllers/variation.controller");
const router = express.Router();
router.post("/", asyncHandler(createVariation));
router.get("/", asyncHandler(getVariations));
module.exports = router;
