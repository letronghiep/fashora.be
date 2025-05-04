"use strict";
const { Types } = require("mongoose");
const { getSelectData } = require("../../utils");
const Product = require("../product.model");
const Sku = require("../sku.model");
const User = require("../user.model");
const { NotFoundError } = require("../../core/error.response");
const { getIO } = require("../../db/init.socket");
const { getDetailUser } = require("./user.repo");
const io = getIO();
const getProductById = async ({ productId }) => {
  return await Product.findOne({
    _id: new Types.ObjectId(productId),
  }).lean();
};
const getProductBySlug = async ({ productSlug }) => {
  return await Product.findOne({
    product_slug: productSlug,
  }).lean();
};

const foundProductByShop = async ({ product_id, product_shop }) => {
  return await Product.findOne({
    product_shop: product_shop,
    _id: product_id,
  });
};
async function findAllProduct({ limit, sort, page, filter, select }) {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = (page - 1) * limit;
  return await Product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
}
const checkProductByServer = async ({ products }) => {
  return await Promise.all(
    products.map(async (product) => {
      const foundProduct = await getProductById({
        productId: product.productId,
      });
      if (foundProduct)
        return {
          price: foundProduct.product_price,
          quantity: product.quantity,
          productId: product.productId,
        };
    })
  );
};
const updateStatusProduct = async ({
  product_id,
  product_shop,
  product_status,
}) => {
  // check product exists
  const foundProduct = await foundProductByShop({ product_id, product_shop });
  if (!foundProduct) throw new NotFoundError("Sản phẩm không tồn tại");
  foundProduct.product_status = product_status;
  await Sku.updateMany({
    product_id: product_id,
  }, {
    sku_status: product_status,
  });
  return await Product.findByIdAndUpdate(product_id, foundProduct, {
    new: true,
  });
};
const addProductToWishList = async ({ product_id, userId }) => {
  // io.on("likeProduct", async () => {
  const user = await getDetailUser({ user_id: userId });
  const alreadyAdd = await user.usr_wishList.find(
    (id) => id.toString() === product_id
  );
  let userAdd;
  if (alreadyAdd) {
    userAdd = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          usr_wishList: product_id,
        },
      },
      {
        new: true,
      }
    );
  } else {
    userAdd = await User.findByIdAndUpdate(
      userId,
      {
        $push: { usr_wishList: product_id },
      },
      {
        new: true,
      }
    );
  }
  return userAdd;
  // });
};
const updateFavoriteProduct = async ({ product_id, userId }) => {
  // io.on("likeProduct", async () => {
  // check product exists
  const foundProduct = await getProductById({ productId: product_id });
  if (!foundProduct) throw new NotFoundError("Sản phẩm không tồn tại");
  const isFavorite = foundProduct.product_favorites.find(
    (user_id) => user_id.toString() === userId
  );
  let updatedFavorite;
  if (isFavorite) {
    updatedFavorite = await Product.findByIdAndUpdate(
      product_id,
      { $pull: { product_favorites: userId } },
      { new: true }
    );
  } else {
    updatedFavorite = await Product.findByIdAndUpdate(
      product_id,
      { $push: { product_favorites: userId } },
      { new: true }
    );
  }
  await Sku.updateMany({
    product_id: product_id,
  });
  await io.emit(`updatedLikes:${product_id}`, {
    likesCount: updatedFavorite.product_favorites.length,
  });
  return updatedFavorite;
  // });
};
const increaseViewProduct = async ({ product_id }) => {
  const foundProduct = await getProductById({ productId: product_id });
  if (!foundProduct) throw new NotFoundError("Sản phẩm không tồn tại");
  foundProduct.product_views += 1;
  return await Product.findByIdAndUpdate(product_id, foundProduct, {
    new: true,
  });
};
const getCountFavoriteProduct = async ({ product_id }) => {
  const foundProduct = await getProductById({ productId: product_id });
  if (!foundProduct) throw new NotFoundError("Sản phẩm không tồn tại");
  return foundProduct.product_favorites.length;
};
module.exports = {
  getProductById,
  foundProductByShop,
  findAllProduct,
  checkProductByServer,
  updateStatusProduct,
  getProductBySlug,
  updateFavoriteProduct,
  getCountFavoriteProduct,
  addProductToWishList,
  increaseViewProduct
};
