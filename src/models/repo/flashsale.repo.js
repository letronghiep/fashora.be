"use strict";

const { Types } = require("mongoose");
const { paginate } = require("../../helpers/paginate");
const FlashSale = require("../flashsale.model");
const getFlashSale = async ({ flashSaleId }) => {
  console.log({flashSaleId})
  return await FlashSale.findOne({ _id: new Types.ObjectId(flashSaleId) });
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
const updateFlashSale = async ({ flashSaleId, update }) => {
  return await FlashSale.findByIdAndUpdate(flashSaleId, update, { new: true });
};

module.exports = {
  getFlashSale,
  getFlashSales,
  updateFlashSale,
};
