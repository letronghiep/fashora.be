"use strict";

const FlashSale = require("../models/flashsale.model");

const { getProductById } = require("../models/repo/product.repo");

const { NotFoundError } = require("../core/error.response");
const {
  createFlashSaleService,
  getFlashSaleService,
  getFlashSalesService,
} = require("../services/flashsale.service");
const { CREATED, SuccessResponse } = require("../core/success.response");

const createFlashSale = async (req, res, next) => {
  new CREATED({
    message: "Flash sale created",
    metadata: await createFlashSaleService({
      name: req.body.name,
      thumb: req.body.thumb,
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      status: req.body.status,
      isApproved: req.body.isApproved,
      products: req.body.products,
    }),
  }).send(res);
};

const getFlashSales = async (req, res, next) => {
  new SuccessResponse({
    message: "Flash sales",
    metadata: await getFlashSalesService({
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
    }),
  }).send(res);
};

const getFlashSale = async (req, res, next) => {
  new SuccessResponse({
    message: "Flash sale",
    metadata: await getFlashSaleService({
      flashSaleId: req.params.flash_sale,
    }),
  }).send(res);
};
module.exports = {
  createFlashSale,
  getFlashSale,
  getFlashSales,
};
