"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createBannerService,
  getBannersService,
  getBannerByIdService,
  updateBannerService,
  deleteBannerService,
} = require("../services/banner.service");

const createBanner = async (req, res, next) => {
  new CREATED({
    message: "Banner created successfully",
    metadata: await createBannerService(req.body),
  }).send(res);
};

const getBanners = async (req, res, next) => {
  new SuccessResponse({
    message: "Get banners successfully",
    metadata: await getBannersService({
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort
    }),
  }).send(res);
};

const getBannerById = async (req, res, next) => {
  new SuccessResponse({
    message: "Get banner successfully",
    metadata: await getBannerByIdService(req.params.bannerId),
  }).send(res);
};

const updateBanner = async (req, res, next) => {
  new SuccessResponse({
    message: "Update banner successfully",
    metadata: await updateBannerService({
      bannerId: req.params.bannerId,
      data: req.body,
    }),
  }).send(res);
};

const deleteBanner = async (req, res, next) => {
  new SuccessResponse({
    message: "Delete banner successfully",
    metadata: await deleteBannerService(req.params.bannerId),
  }).send(res);
};

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
