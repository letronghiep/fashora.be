"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createCategoryService,
  getCategoryByParentIdService,
  deleteCategoryService,
  getCategoryByIdService,
  getListCategoryBySearchService,
  updateCategoryService,
} = require("../services/category.service");
const createCategory = async (req, res, next) => {
  await new CREATED({
    message: "Category created",
    metadata: await createCategoryService(req.body),
  }).send(res);
};
const getCategoryByParentId = async (req, res, next) => {
  new SuccessResponse({
    message: "List Category",
    metadata: await getCategoryByParentIdService({
      category_parentId: req.query.category_parentId,
    }),
  }).send(res);
};
const getListCategoriesBySearch = async (req, res, next) => {
  new SuccessResponse({
    message: "List categories",
    metadata: await getListCategoryBySearchService({
      q: req.query.q,
      category_status: req.query.category_status || "all",
    }),
  }).send(res);
};
const deleteCategory = async (req, res, next) => {
  new SuccessResponse({
    message: "deleted Category",
    metadata: await deleteCategoryService({
      category_id: req.params.category_id,
    }),
  }).send(res);
};
const getCategoryById = async (req, res, next) => {
  new SuccessResponse({
    message: "get Category",
    metadata: await getCategoryByIdService({
      category_id: req.params.category_id,
    }),
  }).send(res);
};
const updateCategory = async (req, res, next) => {
  new SuccessResponse({
    message: "updated Category",
    metadata: await updateCategoryService({
      category_id: req.params.category_id,
      category_name: req.body.category_name,
      category_thumb: req.body.category_thumb,
      category_status: req.body.category_status,
      category_parentId: req.body.category_parentId,
    }),
  }).send(res);
};
module.exports = {
  createCategory,
  getCategoryByParentId,
  deleteCategory,
  getCategoryById,
  getListCategoriesBySearch,
  updateCategory,
};
