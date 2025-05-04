"use strict";
const FlashSale = require("../models/flashsale.model");
const { getFlashSale, getFlashSales } = require("../models/repo/flashsale.repo");
const { randomFlashSaleId } = require("../utils");

const createFlashSaleService = async ({
  name,
  start_time,
  end_time,
  status,
  isApproved,
  products,
  thumb,
}) => {
  const flashSale = new FlashSale({
    id: randomFlashSaleId(),
    name: name,
    thumb: thumb,
    start_time: start_time,
    end_time: end_time,
    status: status,
    isApproved: isApproved,
    products: products,
  });
  await flashSale.save();
  return flashSale;
};
const getFlashSaleService = async ({flashSaleId}) => {
  
  return await getFlashSale(flashSaleId)
}
const getFlashSalesService = async ({page, limit, sort, filter}) => { 
  return await getFlashSales({page, limit, sort, filter})
}
module.exports = {
  createFlashSaleService,
  getFlashSaleService,
  getFlashSalesService,
};
