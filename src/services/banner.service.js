"use strict";

const Banner = require("../models/banner.model");
const { BadRequestError, NotFoundError } = require("../core/error.response");
const { Types } = require("mongoose");
const { randomBannerId } = require("../utils");
const { paginate } = require("../helpers/paginate");

const createBannerService = async (payload) => {
  try {
    const {
      title,
      thumb,
      linkTo,
      isActive,
      startDate,
      endDate
    } = payload;

    if (new Date() < new Date(startDate) || new Date() > new Date(endDate)) {
      throw new BadRequestError("Banner has expired!");
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestError("Start date must be less than end date");
    }

    const banner = await Banner.create({
      id: randomBannerId(),
      title,
      thumb,
      linkTo,
      isActive,
      startDate,
      endDate
    });

    return banner;
  } catch (error) {
    throw error;
  }
};

const getBannersService = async ({ limit = 10, page = 1, sort = "ctime" }) => {
  try {
    const banners = await paginate({
      model: Banner,
      filter: { isActive: true },
      limit: +limit,
      page: +page,
      sort
    });
    return banners;
  } catch (error) {
    throw error;
  }
};

const getBannerByIdService = async (bannerId) => {
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) throw new NotFoundError("Banner not found");
    return banner;
  } catch (error) {
    throw error;
  }
};

const updateBannerService = async ({ bannerId, data }) => {
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) throw new NotFoundError("Banner not found");

    const updatedBanner = await Banner.findByIdAndUpdate(
      bannerId,
      data,
      { new: true }
    );

    return updatedBanner;
  } catch (error) {
    throw error;
  }
};

const deleteBannerService = async (bannerId) => {
  try {
    const banner = await Banner.findById(bannerId);
    if (!banner) throw new NotFoundError("Banner not found");

    const deletedBanner = await Banner.findByIdAndDelete(bannerId);
    return deletedBanner;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBannerService,
  getBannersService,
  getBannerByIdService,
  updateBannerService,
  deleteBannerService
};
