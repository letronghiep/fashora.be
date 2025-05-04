"use strict";
const Shop = require("../shop.model");
const findShopById = async ({ filter }) => {
  return await Shop.findOne({ filter });
};

module.exports = {
  findShopById,
};
