"use strict";
const { NotFoundError } = require("../core/error.response");
const { paginate } = require("../helpers/paginate");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Sku = require("../models/sku.model");
const Category = require("../models/category.model");
const Attribute = require("../models/attribute.model");
const Variation = require("../models/variation.model");
const Order = require("../models/order.model");
const {
  insertInventory,
  updateInventory,
} = require("../models/repo/inventory.repo");
const { findShopById } = require("../models/repo/shop.repo");
const { randomProductId } = require("../utils");
const { createSkuService, updateSkuService } = require("./sku.service");
const {
  foundProductByShop,
  getProductById,
  updateStatusProduct,
  getProductBySlug,
  updateFavoriteProduct,
  getCountFavoriteProduct,
  addProductToWishList,
  increaseViewProduct,
} = require("../models/repo/product.repo");
// const { getDetailUser } = require("../models/repo/user.repo");
// const { getIO } = require("../db/init.socket");
const { pushNotifyToSystem } = require("./notification.service");
const { Types } = require("mongoose");
const { findAllDiscountSelect } = require("../models/repo/discount.repo");
const { getBrandService } = require("./brands.service");

/**
 * createProduct
 * getAllProduct
 * getProductIsDraft
 * getProductIsPublished
 * publishedProduct [shop | admin]
 * draft Product [shop | admin]
 * block product [admin]
 * delete product [admin | shop]
 * update product [admin | shop]
 * add to wishList
 */

// create product

const createProductService = async ({
  product_name,
  product_brand,
  product_thumb,
  product_images,
  product_description,
  product_price,
  product_category,
  product_quantity,
  product_shop,
  product_attributes,
  product_ratingAvg,
  product_variations,
  product_status,
  sku_list = [],
  product_models,
}) => {
  // 1. check shop exists or active
  const foundShop = await findShopById({
    _id: new Types.ObjectId(product_shop),
    status: "active",
  });
  if (!foundShop) throw new NotFoundError("Shop chưa được đăng ký");
  // 2. create product
  const product = await Product.create({
    product_id: randomProductId(),
    product_name,
    product_thumb,
    product_images,
    product_description,
    product_price,
    product_category,
    product_quantity,
    product_shop,
    product_attributes,
    product_brand,
    product_ratingAvg,
    product_status,
    product_variations,
    // product_models,
  });
  if (product && sku_list.length) {
    const skus = await createSkuService({
      sku_list,
      product_id: product._id,
    }).then();
    const total_stock = sku_list.reduce(
      (total, sku) => (total += sku.sku_stock),
      0
    );
    product.product_quantity = total_stock;
    await Product.findByIdAndUpdate(product._id, {
      $set: { product_models: skus },
    });
  }
  // product.product_price =
  await insertInventory({
    productId: product._id,
    shopId: product.product_shop,
    location: "",
    stock: product.product_quantity,
  });
  // // product.product_quantity = await Product.
  const notify_content = `Người dùng <a>${foundShop.usr_name}</a> vừa thêm <a>${product.product_name}</a> vào giỏ hàng `;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-001",
    senderId: product.product_shop,
    options: {
      // link:
      // shorten Url or link product
    },
    receiverId: product.product_shop,
  });
  // io.emit("productCreated", {
  //   message: notify_content,
  //   createdAt: notification.createdAt,
  //   // metadata: product,
  // });
  return product;
};

// draft product

const updateProductStatusService = async ({
  product_id,
  product_shop,
  product_status,
}) => {
  const foundProduct = await foundProductByShop({
    product_id,
    product_shop,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  const updatedProduct = await updateStatusProduct({
    product_id,
    product_shop,
    product_status,
  });
  const notify_content = `Người quản trị <a>${foundShop.usr_name}</a> vừa thay đổi trạng thái sản phẩm <a>${product.product_name}</a>`;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-002",
    senderId: foundProduct.product_shop,
    options: {
      // link:
      // shorten Url or link product
    },
    receiverId: foundProduct.product_shop,
  });
  return updatedProduct;
};
const updateProductFavoriteService = async ({ product_id, userId }) => {
  const foundProduct = await foundProductByShop({
    product_id,
    product_shop: userId,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  const notify_content = `Người dùng <a>${foundShop.usr_name}</a> vừa thêm <a>${foundProduct.product_name}</a> vào phần yêu thích `;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-001",
    senderId: product.product_shop,
    options: {
      // link:
      // shorten Url or link product
    },
    receiverId: foundProduct.product_shop,
  });
  const updatedProduct = await updateFavoriteProduct({
    product_id,
    userId,
  });
  return updatedProduct;
};
const getCountFavoriteService = async ({ product_id }) => {
  return await getCountFavoriteProduct({ product_id });
};
// block product
const blockProductService = async ({ product_id, product_shop }) => {
  const foundProduct = await foundProductByShop({ product_id, product_shop });
  if (!foundProduct) throw new NotFoundError("Sản phẩm không tồn tại");
  foundProduct.isBlocked = true;
  const updatedProduct = await Product.findByIdAndUpdate(
    product_id,
    foundProduct,
    {
      new: true,
    }
  );
  const notify_content = `Người quản trị <a>${foundShop.usr_name}</a> vừa khóa sản phẩm <a>${foundProduct.product_name}</a>`;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-002",
    senderId: foundProduct.product_shop,
  });
  return updatedProduct;
};

// delete product [admin | shop]

const deleteProductService = async ({ product_id, product_shop }) => {
  const deletedProduct = await Product.findByIdAndDelete({
    _id: product_id,
    product_shop: product_shop,
  });
  await Sku.deleteMany({
    product_id: product_id,
  });
  const notify_content = `Người quản trị <a>${foundShop.usr_name}</a> vừa xóa sản phẩm <a>${deletedProduct.product_name}</a>`;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-003",
    senderId: deletedProduct.product_shop,
  });
  return deletedProduct;
};

// update product
const updateProductService = async ({
  product_id,
  product_name,
  product_thumb,
  product_images,
  product_description,
  product_price,
  product_category,
  product_quantity,
  product_shop,
  product_attributes,
  product_ratingAvg,
  product_variations,
  sku_list,
  product_models,
}) => {
  // check exists product
  const foundProduct = await foundProductByShop({
    product_id: product_id,
    product_shop,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  // update skus

  const total_stock = sku_list.reduce(
    (total, sku) => (total += sku.sku_stock),
    0
  );
  // update product
  const updateFields = {
    product_name,
    product_thumb,
    product_images,
    product_description,
    product_price,
    product_category,
    product_quantity: total_stock,
    product_shop,
    product_attributes,
    product_ratingAvg,
    product_variations,
    sku_list,
    product_models,
  };
  await updateSkuService({ product_id: product_id, sku_list: sku_list });

  // update product_quantity
  const { modifiedCount } = await Product.updateOne(
    { _id: product_id },
    { $set: updateFields }, // use $set to update specific fields,
    {
      new: true,
      upsert: true,
    }
  );
  await updateInventory({
    productId: product_id,
    shopId: product_shop,
    location: "",
    stock: total_stock,
  });
  const notify_content = `Người quản trị <a>${foundShop.usr_name}</a> vừa cập nhật sản phẩm <a>${foundProduct.product_name}</a>`;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-002",
    senderId: foundProduct.product_shop,
  });
  return modifiedCount;
};
// add to wishlist

const addToWishListService = async ({ userId, product_id }) => {
  const foundProduct = await foundProductByShop({
    product_id,
    product_shop: userId,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  const addedProduct = await addProductToWishList({
    product_id: product_id,
    userId: userId,
  });
  const notify_content = `Người dùng <a>${foundShop.usr_name}</a> vừa thêm <a>${addedProduct.product_name}</a> vào phần yêu thích `;
  await pushNotifyToSystem({
    notify_content: notify_content,
    notify_type: "SHOP-001",
    senderId: addedProduct.product_shop,
  });
  return addedProduct;
};
const increaseViewProductService = async ({ product_id }) => {
  return await increaseViewProduct({ product_id });
};
// QUERY
// get all product for user
const getAllProductService = async ({
  filter = { product_status: "published" },
  limit = 50,
  sort = "ctime",
  page = 1,
}) => {
  return await paginate({
    model: Product,
    filter,
    limit,
    page,
    sort,
    select: [
      "product_name",
      "product_thumb",
      "product_price",
      "product_ratingAvg",
    ],
  });
};

// get list product for shop
const getListProductByShopService = async ({
  product_shop,
  q,
  product_status,
}) => {
  // if (product_status)
  const searchText = q
    ? {
        $or: [
          { product_name: { $regex: q, $options: "i" } }, // Tìm trong tên sản phẩm
          { product_description: { $regex: q, $options: "i" } }, // Tìm trong mô tả sản phẩm
        ],
      }
    : {};

  const foundProducts = await paginate({
    model: Product,
    filter: {
      product_shop: new Types.ObjectId(product_shop),
      ...searchText,
      ...(product_status !== "all" ? { product_status } : {}),
    },
    limit: 50,
    page: 1,
    sort: "ctime",
  });
  return foundProducts;
};
// get detail product
const getDetailProductService = async ({ product_id }) => {
  const foundProduct = await getProductById({
    productId: product_id,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  return foundProduct;
};

// search
const searchProductService = async ({
  q,
  product_status,
  product_category,
  product_price,
  size,
  color,
  limit = 50,
  sort = "ctime",
  currentPage = 1,
  ...query
}) => {
  const searchText =
    q != null
      ? {
          $or: [
            { product_name: { $regex: `.*${q}.*`, $options: "i" } },
            { product_description: { $regex: `.*${q}.*`, $options: "i" } },
          ],
        }
      : {};

  const price =
    product_price != null
      ? Array.isArray(product_price)
        ? product_price.map(Number)
        : typeof product_price === "string"
        ? product_price.split(",").map(Number)
        : []
      : [];

  const isValidPriceRange =
    price.length === 2 && !isNaN(price[0]) && !isNaN(price[1]);

  const category =
    product_category != null && product_category !== "undefined"
      ? Array.isArray(product_category)
        ? product_category.map(Number).filter((v) => !isNaN(v))
        : typeof product_category === "string"
        ? product_category
            .split(",")
            .map((item) => Number(item))
            .filter((v) => !isNaN(v))
        : []
      : [];

  const isValidCategory = category.length > 0;

  const productFilter = {
    ...searchText,
    ...(product_status != null && { product_status }),
    ...(isValidCategory && { product_category: { $in: category } }),
    ...(isValidPriceRange && {
      product_price: { $gte: price[0], $lte: price[1] },
    }),
    ...(Object.keys(query).length > 0 ? query : {}),
  };

  if (size !== "undefined" && color !== "undefined" && size != null && color != null) {
    const sizes = size.split(",").map((s) => s.trim());
    const colors = color.split(",").map((c) => c.trim());
    const combinations = [];

    for (const c of colors) {
      for (const s of sizes) {
        combinations.push(`${c}, ${s}`);
      }
    }

    if (combinations.length > 0) {
      productFilter.product_models = {
        $elemMatch: {
          sku_name: { $in: combinations },
        },
      };
    }
  }

  const result = await paginate({
    model: Product,
    filter: productFilter,
    populate: ["product_shop"],
    limit,
    page: currentPage,
    sort,
  });

  return result;
};

// const searchProductService = async ({
//   q,
//   product_status,
//   product_category,
//   product_price = [],
//   size,
//   color,
//   limit = 50,
//   sort = "ctime",
//   currentPage = 1,
//   ...query
// }) => {
//   const searchText = q
//     ? {
//         $or: [
//           { product_name: { $regex: `.*${q}.*`, $options: "i" } }, // Tìm trong tên sản phẩm
//           { product_description: { $regex: `.*${q}.*`, $options: "i" } }, // Tìm trong mô tả sản phẩm
//         ],
//       }
//     : {};
//   const price = Array.isArray(product_price)
//     ? product_price.map(Number)
//     : typeof product_price === "string"
//     ? product_price.split(",").map((item) => Number(item))
//     : [];

//   const isValidPriceRange =
//     price.length === 2 && !isNaN(price[0]) && !isNaN(price[1]);
//   const category = Array.isArray(product_category)
//     ? product_category.map(Number)
//     : typeof product_category === "string"
//     ? product_category.split(",").map((item) => Number(item))
//     : [];
//   const isValidCategory = category.length > 0;
//   const productFilter = {
//     ...searchText,
//     ...(product_status && { product_status }),
//     ...(isValidCategory && {
//       product_category: { $in: category },
//       ...query,
//     }),
//     ...(isValidPriceRange && {
//       product_price: { $gte: price[0], $lte: price[1] },
//     }),
//   };

//   if (size && color) {
//     const sizes = size.split(",");
//     const colors = color.split(",");
//     const combinations = [];

//     for (const c of colors) {
//       for (const s of sizes) {
//         combinations.push(`${c.trim()}, ${s.trim()}`);
//       }
//     }

//     productFilter.product_models = {
//       $elemMatch: {
//         sku_name: { $in: combinations },
//       },
//     };
//   }

//   const result = await paginate({
//     model: Product,
//     filter: productFilter,
//     populate: ["product_shop"],
//     limit,
//     page: currentPage,
//     sort,
//   });
//   return result;
// };

// get info product
const getInfoProductService = async ({ product_slug }) => {
  const foundProduct = await getProductBySlug({
    productSlug: product_slug,
  });
  if (!foundProduct) throw new NotFoundError("Không tìm thấy sản phẩm");
  const category = await Category.find({
    category_id: { $in: foundProduct.product_category },
  });
  function flattenCategories(categories) {
    let flattedData = [];

    categories.forEach((category) => {
      flattedData.push({
        category_id: category.category_id,
        category_name: category.category_name,
      });

      // Nếu có children, tiếp tục gọi đệ quy
      if (category.children && category.children.length > 0) {
        flattedData = flattedData.concat(flattenCategories(category.children));
      }
    });
    const result = flattedData.filter((data) =>
      foundProduct.product_category.find(
        (category) => category === data.category_id
      )
    );
    return result;
  }
  const attribute = await Attribute.findOne({
    category_id: { $in: foundProduct.product_category },
  }).lean();
  const attributeList = await attribute?.attribute_list;
  const product_attributes = foundProduct?.product_attributes.reduce(
    (acc, item) => {
      const attribute = attributeList?.find(
        (attr) => attr.attribute_id === item?.id
      );
      if (attribute) {
        const data = Array.isArray(item.value) ? item.value : [item.value];
        // acc[attribute?.display_name] = data
        //   .map(
        //     (i) =>
        //       attribute.children.find((child) => child.value_id === i)
        //         ?.display_name
        //   )
        //   .join(", ");
        const value = data
          .map(
            (i) =>
              attribute.children.find((child) => child.value_id === i)
                ?.display_name
          )
          .join(", ");

        acc.push({
          id: attribute.display_name,
          value,
        });
      }
      return acc;
    },
    []
  );
  const foundVariation = await Variation.findOne({
    category_id: { $in: foundProduct.product_category },
  }).lean();
  const variations = foundProduct.product_variations?.map(
    (product_variation) => {
      return foundVariation?.tier_variation_list?.find(
        (variation) => variation.display_name === product_variation.name
      )?.group_list[0].value_list;
    }
  );
  // console.log( foundProduct.product_variations );
  const discounts = await findAllDiscountSelect({
    filter: {
      discount_shopId: foundProduct.product_shop,
      discount_is_active: true,
      $or: [
        {
          discount_applies_to: "all",
        },
        {
          discount_applies_to: "specific",
          discount_product_ids: { $in: [foundProduct._id.toString()] },
        },
      ],
    },
  });
  const productResult = {
    ...foundProduct,
    product_category: flattenCategories(category),
    product_attributes,
    // product_variations,
    product_promotion: discounts,
  };
  return productResult;
};
const getArrivalsProductService = async ({ limit = 50 }) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); // Lùi về 30 ngày trước

  const newArrivals = await Product.find({ createdAt: { $gte: thirtyDaysAgo } })
    .sort({ createdAt: -1 })
    .limit(limit);
  return newArrivals;
};
const getBestSellerService = async ({ limit }) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const bestSellers = await Order.aggregate([
    { $match: { createdAt: { $gte: oneWeekAgo } } },
    { $unwind: { path: "$order_products", preserveNullAndEmptyArrays: true } },
    {
      $unwind: {
        path: "$order_products.item_products",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        "order_products.item_products.productId": {
          $exists: true,
          $type: "string",
        },
      },
    },
    {
      $group: {
        _id: { $toObjectId: "$order_products.item_products.productId" },
        totalSold: { $sum: "$order_products.item_products.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: "$_id",
        product_name: "$product.product_name",
        product_price: "$product.product_price",
        product_slug: "$product.product_slug",
        product_thumb: "$product.product_thumb",
        totalSold: 1,
      },
    },
  ]);

  return bestSellers;
};
const getHomePageService = async () => {
  const arrivalProduct = await getArrivalsProductService({ limit: 10 });
  const bestSeller = await getBestSellerService({ limit: 8 });
  return { arrivalProduct, bestSeller };
};
const getFavoriteProductsService = async ({ userId, limit = 10, page = 1 }) => {
  const user = await User.findById(userId).lean();
  if (!user) throw new NotFoundError("Không tìm thấy người dùng");

  const favoriteProducts = await paginate({
    model: Product,
    filter: {
      _id: { $in: user.usr_wishList },
    },
    limit,
    page,
    sort: "ctime",
    populate: ["product_shop"],
  });

  return favoriteProducts;
};
// END QUERY
module.exports = {
  createProductService,
  updateProductService,
  updateProductStatusService,
  blockProductService,
  deleteProductService,
  getAllProductService,
  getListProductByShopService,
  getDetailProductService,
  searchProductService,
  getInfoProductService,
  updateProductFavoriteService,
  addToWishListService,
  getCountFavoriteService,
  increaseViewProductService,
  getArrivalsProductService,
  getBestSellerService,
  getHomePageService,
  getFavoriteProductsService,
};
