"use strict";
const { CREATED, SuccessResponse } = require("../core/success.response");
const {
  createProductService,
  getAllProductService,
  blockProductService,
  deleteProductService,
  updateProductService,
  getDetailProductService,
  getListProductByShopService,
  searchProductService,
  updateProductStatusService,
  getInfoProductService,
  updateProductFavoriteService,
  addToWishListService,
  getCountFavoriteService,
  increaseViewProductService,
  getArrivalsProductService,
  getHomePageService,
  getFavoriteProductsService,
} = require("../services/product.service");
const {
  getRelatedProductsService,
} = require("../services/related-product.service");
const { getSingleSkuService } = require("../services/sku.service");
// user
const getAllProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "List product",
    metadata: await getAllProductService(req.query),
  }).send(res);
};

const getProductById = async (req, res, next) => {
  new SuccessResponse({
    message: "Detail product",
    metadata: await getDetailProductService({
      product_id: req.params.product_id,
    }),
  }).send(res);
};

const getListProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "List product by shop",
    metadata: await getListProductByShopService({
      product_shop: req.user.userId,
      q: req.query.q,
      product_status: req.query.product_status || "all",
    }),
  }).send(res);
};
const searchProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "Search product",
    metadata: await searchProductService({
      q: req.query.q,
      product_status: req.query.product_status,
      product_category: req.query.product_category,
      limit: req.query.offset,
      currentPage: req.query.page,
      sort: req.query.sort_by,
      product_price: req.query.product_price,
      size: req.query.size,
      color: req.query.color,
    }),
  }).send(res);
};
const getRelatedProducts = async (req, res, next) => {
  new SuccessResponse({
    message: "Related products",
    metadata: await getRelatedProductsService({
      productId: req.params.product_id,
    }),
  }).send(res);
};
const createProductByShop = async (req, res, next) => {
  const product = await createProductService({
    product_shop: req.user.userId,
    ...req.body,
  });
  new CREATED({
    message: "Product created",
    metadata: product,
  }).send(res);
};
const createProductByAdmin = async (req, res, next) => {
  new CREATED({
    message: "Product created",
    metadata: await createProductService({
      ...req.body,
    }),
  }).send(res);
};

const updateStatusProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "Published success",
    metadata: await updateProductStatusService({
      product_id: req.params.product_id,
      product_shop: req.user.userId,
      product_status: req.params.product_status,
    }),
  }).send(res);
};

const updateStatusProductByAdmin = async (req, res, next) => {
  new SuccessResponse({
    message: "Published success",
    metadata: await updateProductStatusService({
      product_id: req.query.product_id,
      product_shop: req.query.product_shop,
      product_status: req.params.product_status,
    }),
  }).send(res);
};
// draft
const draftProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "draft success",
    metadata: await draftProductService({
      product_id: req.params.product_id,
      product_shop: req.user.userId,
    }),
  }).send(res);
};

const draftProductByAdmin = async (req, res, next) => {
  new SuccessResponse({
    message: "draft success",
    metadata: await draftProductService({
      product_id: req.query.product_id,
      product_shop: req.query.product_shop,
    }),
  }).send(res);
};

//block

const blockProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "block success",
    metadata: await blockProductService({
      product_id: req.params.product_id,
      product_shop: req.user.userId,
    }),
  }).send(res);
};

const blockProductByAdmin = async (req, res, next) => {
  new SuccessResponse({
    message: "draft success",
    metadata: await blockProductService({
      product_id: req.query.product_id,
      product_shop: req.query.product_shop,
    }),
  }).send(res);
};

// update product
const updateProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "update success",
    metadata: await updateProductService({
      product_id: req.params.product_id,
      product_shop: req.user.userId,
      ...req.body,
    }),
  }).send(res);
};
const updateProductFavorite = async (req, res, next) => {
  new SuccessResponse({
    message: "update success",
    metadata: await updateProductFavoriteService({
      product_id: req.params.product_id,
      userId: req.user.userId,
    }),
  }).send(res);
};
const increaseViewProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "increase view product",
    metadata: await increaseViewProductService({
      product_id: req.params.product_id,
    }),
  }).send(res);
};
const getCountFavorite = async (req, res, next) => {
  new SuccessResponse({
    message: "favorite count product",
    metadata: await getCountFavoriteService({
      product_id: req.params.product_id,
    }),
  }).send(res);
};
const addProductToWishList = async (req, res, next) => {
  new SuccessResponse({
    message: "Add to white list success",
    metadata: await addToWishListService({
      userId: req.user.userId,
      product_id: req.params.product_id,
    }),
  }).send(res);
};
const deleteProductByShop = async (req, res, next) => {
  new SuccessResponse({
    message: "deleted success",
    metadata: await deleteProductService({
      product_id: req.params.product_id,
      product_shop: req.user.userId,
    }),
  }).send(res);
};

const deleteProductByAdmin = async (req, res, next) => {
  new SuccessResponse({
    message: "deleted success",
    metadata: await deleteProductService({
      product_id: req.query.product_id,
      product_shop: req.query.product_shop,
    }),
  }).send(res);
};

const getAllPublishedProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "List published products",
    metadata: await getAllPublishedProductsService({
      product_shop: req.user.userId,
    }),
  }).send(res);
};

// get info product
const getInfoProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "Product information",
    metadata: await getInfoProductService({
      product_slug: req.params.product_slug,
    }),
  }).send(res);
};
/**
 * Handles the request to find a single SKU by product ID and SKU ID.
 * Sends a success response with the SKU details if found.
 *
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object for sending the response.
 * @param {Function} next - The next middleware function in the stack.
 */
const findOneSku = async (req, res, next) => {
  const { productId, skuId } = req.query;
  const sku = await getSingleSkuService({
    product_id: productId,
    sku_id: skuId,
  });

  if (!sku) {
    return next(new NotFoundError("Sku not found"));
  }

  new SuccessResponse({
    message: "Sku found",
    metadata: sku,
  }).send(res);
};
const getArrivalsProduct = async (req, res, next) => {
  new SuccessResponse({
    message: "List arrivals products",
    metadata: await getArrivalsProductService({
      limit: req.query.limit,
    }),
  }).send(res);
};
const getHomePage = async (req, res, next) => {
  new SuccessResponse({
    message: "Home page products",
    metadata: await getHomePageService(),
  }).send(res);
};
const getFavoriteProducts = async (req, res, next) => {
  new SuccessResponse({
    message: "Lấy danh sách sản phẩm yêu thích thành công",
    metadata: await getFavoriteProductsService({
      userId: req.user.userId,
      limit: parseInt(req.query.limit) || 10,
      page: parseInt(req.query.page) || 1
    }),
  }).send(res);
};
module.exports = {
  createProductByShop,
  updateProductByShop,
  updateStatusProductByShop,
  draftProductByShop,
  blockProductByShop,
  deleteProductByShop,
  getInfoProduct,
  createProductByAdmin,
  updateStatusProductByAdmin,
  draftProductByAdmin,
  blockProductByAdmin,
  deleteProductByAdmin,
  getAllProduct,
  getAllPublishedProduct,
  getListProductByShop,
  getProductById,
  searchProduct,
  findOneSku,
  getRelatedProducts,
  updateProductFavorite,
  addProductToWishList,
  getCountFavorite,
  increaseViewProduct,
  getArrivalsProduct,
  getHomePage,
  getFavoriteProducts,
};
