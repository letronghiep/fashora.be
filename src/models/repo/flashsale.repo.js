"use strict";

const { paginate } = require("../../helpers/paginate");
const FlashSale = require("../flashsale.model");
const getFlashSale = async ({ flashSaleId }) => {
  return await FlashSale.findOne({ _id: flashSaleId });
};
const getFlashSales = async ({ page, limit, sort, filter }) => {
  return await paginate({
    model: FlashSale,
    filter,
    page,
    limit,
    sort,
  });
};

module.exports = {
  getFlashSale,
  getFlashSales,
};
