"use strict";
const Brand = require("../models/brand.model");
const { NotFoundError, BadRequestError } = require("../core/error.response");

const createBrandService = async ({ category_id, brand_list }) => {
  const existingBrand = await Brand.findOne({
    category_id: {
      $in: category_id,
    },
  });
  if (existingBrand) throw new BadRequestError("Nhãn hàng đã tồn tại");

  const brand = await Brand.create({
    category_id,
    brand_list,
  });
  return brand;
};

const updateBrandService = async ({ category_id, brand_list }) => {
  const brand = await Brand.findOne({
    category_id: {
      $in: category_id,
    },
  });
  if (!brand) throw new NotFoundError("Không tìm thấy nhãn hàng");
  brand.brand_list = brand_list;
  await brand.save();
  return brand;
};

const deleteBrandService = async ({ category_id }) => {
  const deletedCount = await Brand.deleteOne({
    category_id: {
      $in: category_id,
    },
  });
  if (deletedCount.deletedCount === 0)
    throw new NotFoundError("Không tìm thấy nhãn hàng");
  return deletedCount;
};

const getBrandService = async ({ category_id }) => {
  const brand = await Brand.findOne({
    category_id: {
      $in: category_id,
    },
  }).select(["brand_list"]);
  if (!brand) throw new NotFoundError("Không tìm thấy nhãn hàng");
  // const foundBrand = brand.brand_list.find((b) => b.brand_id === brand_id);
  // if (!foundBrand) throw new NotFoundError("Không tìm thấy nhãn hàng");
  // return foundBrand;
  return brand;
};

module.exports = {
  createBrandService,
  updateBrandService,
  deleteBrandService,
  getBrandService,
};
