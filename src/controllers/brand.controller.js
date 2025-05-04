"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createBrandService,
  getBrandService,
  deleteBrandService,
  updateBrandService,
} = require("../services/brands.service");

const createBrand = async (req, res, next) => {
  new CREATED({
    message: "Brand created",
    metadata: await createBrandService(req.body),
  }).send(res);
};

const getBrands = async (req, res, next) => {
  new SuccessResponse({
    message: "Get brands",
    metadata: await getBrandService({
      category_id: req.query.category_id,
    }),
  }).send(res);
};

const deleteBrand = async (req, res, next) => {
  new SuccessResponse({
    message: "Delete brand",
    metadata: await deleteBrandService(req.params),
  }).send(res);
};

const updateBrand = async (req, res, next) => {
  new SuccessResponse({
    message: "Update brand",
    metadata: await updateBrandService(req.params, req.body),
  }).send(res);
};

module.exports = {
  createBrand,
  getBrands,
  deleteBrand,
  updateBrand,
};
