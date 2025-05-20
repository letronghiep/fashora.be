"use strict";
const express = require("express");
const router = express.Router();
const {
  getLowSaleProducts,
} = require("../../controllers/inventory.controller");
const { authentication } = require("../../middlewares/authentication");

router.get("/", authentication, getLowSaleProducts);

module.exports = router;
