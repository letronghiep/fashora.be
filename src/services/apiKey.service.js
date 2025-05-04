"use strict";
const ApiKey = require("../models/apikey.model");
const crypto = require("node:crypto");
const findById = async (key) => {
  const objKey = await ApiKey.findOne({
    key,
    status: true,
  }).lean();
  return objKey;
};
module.exports = {
  findById,
};
