"use strict";
const Category = require("../models/category.model");
const { randomCategoryId } = require("../utils/index");
const { NotFoundError } = require("../core/error.response");
const { paginate } = require("../helpers/paginate");
const createCategoryService = async ({
  category_id = randomCategoryId(),
  category_name,
  category_thumb,
  category_parentId = [],
}) => {
  const category = new Category({
    category_id,
    category_name,
    category_thumb,
    category_parentId,
    category_status: "pending",
  });
  await category.save();
  return category;
};

// get category by parent id
const getCategoryByParentIdService = async ({
  category_parentId = null,
  limit = 50,
  offset = 0,
}) => {
  const categories = await Category.find({}).sort({
    createdAt: 1,
  });
  return categories;
};
const getListCategoryBySearchService = async ({ q, category_status }) => {
  const searchText = q
    ? {
        $or: [
          { category_name: { $regex: q, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$category_id" },
                regex: q,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$category_parentId" },
                regex: q,
                options: "i",
              },
            },
          },
        ],
      }
    : {};

  const foundCategories = await paginate({
    model: Category,
    filter: {
      ...searchText,
      ...(category_status !== "all" ? { category_status } : {}),
    },
    limit: 50,
    page: 1,
    sort: "ctime",
  });
  return foundCategories;
};
// const getCategoryByAdmin = async ({ limit = 50, offset = 0 }) => {
//   const categories = await Category.find({}).sort({
//     createdAt: 1,
//   });
//   return categories;
// };
// delete category
const deleteCategoryService = async ({ category_id }) => {
  const category = await Category.findById(category_id);
  if (!category) throw new NotFoundError("Danh mục không tồn tại");
  await Category.findByIdAndDelete(category_id);
  return true;
};
// getCategoryById
const getCategoryByIdService = async ({ category_id }) => {
  const category = await Category.findOne({
    _id: category_id,
  });
  return category;
};
const updateCategoryService = async ({
  category_id,
  category_name,
  category_parentId,
  category_thumb,
  category_status,
}) => {
  const foundCategory = await Category.findById(category_id);
  if (!foundCategory) throw new NotFoundError("Danh mục không tồn tại");
  const category = await Category.findOneAndUpdate(
    { _id: category_id },
    { category_name, category_parentId, category_thumb, category_status },
    {
      new: true,
    }
  );
  return category;
};
module.exports = {
  createCategoryService,
  getCategoryByParentIdService,
  deleteCategoryService,
  getCategoryByIdService,
  getListCategoryBySearchService,
  updateCategoryService,
};
