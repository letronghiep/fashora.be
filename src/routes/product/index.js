"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const {
  createProductByShop,
  createProductByAdmin,
  getAllProduct,
  draftProductByAdmin,
  deleteProductByAdmin,
  blockProductByShop,
  blockProductByAdmin,
  deleteProductByShop,
  updateProductByShop,
  getProductById,
  getListProductByShop,
  searchProduct,
  findOneSku,
  getInfoProduct,
  getRelatedProducts,
  updateProductFavorite,
  addProductToWishList,
  getCountFavorite,
  increaseViewProduct,
  getArrivalsProduct,
  getHomePage,
  getFavoriteProducts,
} = require("../../controllers/product.controller");
const { authentication } = require("../../middlewares/authentication");
const { grantAccess } = require("../../middlewares/rbac.middleware");
const router = express.Router();
// user

router.get("", asyncHandler(getAllProduct));
router.get("/homepage", asyncHandler(getHomePage));
router.get("/arrivals", asyncHandler(getArrivalsProduct));
router.get("/search", asyncHandler(searchProduct));
router.get("/seller", authentication, asyncHandler(getListProductByShop));
router.get("/favorite", authentication, asyncHandler(getFavoriteProducts));
router.get("/favorite/:product_id", asyncHandler(getCountFavorite));
router.get("/:product_id", asyncHandler(getProductById));
router.get("/info/:product_slug", asyncHandler(getInfoProduct));
router.get("/sku/select_variant", asyncHandler(findOneSku));
router.get("/related/:product_id", asyncHandler(getRelatedProducts));
// shop
router.post(
  "/seller",
  authentication,
  grantAccess("createOwn", "product"),
  asyncHandler(createProductByShop)
);

router.patch(
  "/seller/:product_id",
  grantAccess("updateOwn", "product"),
  asyncHandler(updateProductByShop)
);
router.patch(
  "/favorite/:product_id",
  authentication,
  asyncHandler(updateProductFavorite)
);
router.patch(
  "/wishlist/:product_id",
  authentication,
  asyncHandler(addProductToWishList)
);
router.patch("/view/:product_id", asyncHandler(increaseViewProduct));
router.post(
  "/seller/block/:product_id",
  grantAccess("updateOwn", "product"),
  asyncHandler(blockProductByShop)
);
router.delete(
  "/seller/:product_id",
  authentication,
  // grantAccess("deleteOwn", "product"),
  asyncHandler(deleteProductByShop)
);
// admin
router.post(
  "/admin",
  grantAccess("createAny", "product"),
  asyncHandler(createProductByAdmin)
);
router.post(
  "/admin/draft",
  grantAccess("updateAny", "product"),
  asyncHandler(draftProductByAdmin)
);
router.post(
  "/admin/block",
  grantAccess("updateAny", "product"),
  asyncHandler(blockProductByAdmin)
);
router.delete(
  "/admin",
  grantAccess("deleteAny", "product"),
  asyncHandler(deleteProductByAdmin)
);

module.exports = router;
