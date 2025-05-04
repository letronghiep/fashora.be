"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
    createAttribute,
    getAttributes
} = require("../../controllers/attributes.controller");
const router = express.Router();
router.post("/", asyncHandler(createAttribute));
router.get("/", asyncHandler(getAttributes));
module.exports = router;
