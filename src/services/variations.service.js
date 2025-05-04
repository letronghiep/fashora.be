"use strict";
const Variation = require("../models/variation.model");
const { NotFoundError } = require("../core/error.response");

const createVariationService = async ({ category_id, tier_variation_list }) => {
  const existingVariation = await Variation.findOne({
    category_id: {
      $in: category_id,
    },
  });
  if (existingVariation) throw new Error("Biến thể đã tồn tại");

  const variation = await Variation.create({
    category_id,
    tier_variation_list,
  });
  return variation;
};

const getVariationsService = async ({ category_id }) => {
  const variations = await Variation.find({
    category_id: {
      $in: category_id,
    },
  }).select(["tier_variation_list"]);
  if (!variations.length) throw new NotFoundError("Không tìm thấy biến thể");
  return variations;
};

const updateVariationService = async ({
  variation_id,
  variation_name,
  variation_value,
  variation_thumb,
  variation_sort_order,
  variation_is_default,
}) => {
  const variation = await Variation.findById(variation_id);
  if (!variation) throw new NotFoundError("Không tìm thấy biến thể");
  variation.variation_name = variation_name;
  variation.variation_value = variation_value;
  variation.variation_thumb = variation_thumb;
  variation.variation_sort_order = variation_sort_order;
  variation.variation_is_default = variation_is_default;
  await variation.save();
  return variation;
};

const deleteVariationService = async (variation_id) => {
  const deletedCount = await Variation.deleteOne({ _id: variation_id });
  if (deletedCount.deletedCount === 0)
    throw new NotFoundError("Không tìm thấy biến thể");
};

module.exports = {
  createVariationService,
  getVariationsService,
  updateVariationService,
  deleteVariationService,
};
