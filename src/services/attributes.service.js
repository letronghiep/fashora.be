"use strict";

const { NotFoundError } = require("../core/error.response");
const Attribute = require("../models/attribute.model");

// Create an attribute

const createAttributeService = async ({ category_id, attribute_list }) => {
  const existingAttributes = await Attribute.findOne({
    category_id: { $in: category_id },
  });
  if (existingAttributes) throw new NotFoundError("Thuộc tính đã tồn tại");
  const newAttribute = await Attribute.create({
    category_id,
    attribute_list,
  });
  return newAttribute;
};

// Get a single attribute by id

// const getAttributeByIdService = async (attribute_id) => {
//   return await Attribute.findById(attribute_id);
// };

// Update an attribute by id

const updateAttributeService = async (attribute_id, attribute) => {
  return await Attribute.findByIdAndUpdate(attribute_id, attribute, {
    new: true,
  });
};

// Delete an attribute by id

const deleteAttributeService = async (attribute_id) => {
  return await Attribute.findByIdAndDelete(attribute_id);
};

// Get all attributes by category id

const getAttributesByCategoryIdService = async ({ category_id }) => {
  return await Attribute.find({
    category_id: {
      $in: category_id,
    },
  }).select(["attribute_list"]);
};

module.exports = {
  createAttributeService,
  //   getAttributeByIdService,
  updateAttributeService,
  deleteAttributeService,
  getAttributesByCategoryIdService,
};
