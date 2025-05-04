"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { createShipment, getShipment } = require("../../controllers/shipment.controller");
const router = express.Router();

router.post('', asyncHandler(createShipment))
router.get('', asyncHandler(getShipment))
module.exports = router;
