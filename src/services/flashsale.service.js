"use strict";
const FlashSale = require("../models/flashsale.model");
const {
  getFlashSale,
  getFlashSales,
  updateFlashSale,
} = require("../models/repo/flashsale.repo");
const { randomFlashSaleId } = require("../utils");
const Banner = require("../models/banner.model");
const ScheduleService = require("./schedule.service");
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
  if (status === "ongoing") {
    await Banner.create({
      id: randomFlashSaleId(),
      title: name,
      thumb: thumb,
      linkTo: flashSale.id,
      isActive: true,
      startDate: start_time,
      endDate: end_time,
    });
    await ScheduleService.activateFlashSale(flashSale);
  }
  return flashSale;
};
const getFlashSaleService = async ({ flashSaleId }) => {
  return await getFlashSale({ flashSaleId: flashSaleId });
};
const getFlashSalesService = async ({ page, limit, sort, filter }) => {
  return await getFlashSales({ page, limit, sort, filter });
};
const updateFlashSaleService = async ({ flashSaleId, update }) => {
  return await updateFlashSale({ flashSaleId: flashSaleId, update: update });
};
module.exports = {
  createFlashSaleService,
  getFlashSaleService,
  getFlashSalesService,
  updateFlashSaleService,
};
