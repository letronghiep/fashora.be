"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {grantAccess} = require("../../middlewares/rbac.middleware");
const { authentication } = require("../../middlewares/authentication");
const {
  createCategory,
  getCategoryByParentId,
  deleteCategory,
  getCategoryById,
  getListCategoriesBySearch,
  updateCategory,
} = require("../../controllers/category.controller");
const router = express.Router();

router.post("/", asyncHandler(createCategory));
router.get("/", asyncHandler(getCategoryByParentId));
router.patch("/:category_id", authentication, grantAccess("updateOwn", "category") , asyncHandler(updateCategory));
router.get("/search", asyncHandler(getListCategoriesBySearch));
router.delete("/:category_id", asyncHandler(deleteCategory));
router.get("/:category_id", asyncHandler(getCategoryById));

module.exports = router;
