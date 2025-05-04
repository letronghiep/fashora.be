"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
    createBrand,
    getBrands,
    deleteBrand,
    updateBrand,
} = require("../../controllers/brand.controller");
const router = express.Router();
router.post("/", asyncHandler(createBrand));
router.get("/", asyncHandler(getBrands));
module.exports = router;
