"use strict";
const Cart = require("../models/cart.model");
const { getProductById } = require("../models/repo/product.repo");
const { NotFoundError } = require("../core/error.response");
const { Types } = require("mongoose");
const skuModel = require("../models/sku.model");

// REPO
const createUserCart = async ({ userId, product }) => {
  const query = {
      cart_userId: userId,
      cart_state: "active",
    },
    updateSet = {
      $addToSet: {
        cart_products: product,
      },
    },
    options = {
      upsert: true,
      new: true,
    };
  return await Cart.findOneAndUpdate(query, updateSet, options);
};
const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity, sku_id } = product;
  const query = {
      cart_userId: userId,
      // "cart_products.productId": productId,
      "cart_products.sku_id": sku_id,
      cart_state: "active",
    },
    updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    },
    options = {
      upsert: true,
      new: true,
    };
  const existingCart = await Cart.findOne(query);
  let cartUpdated;
  if (existingCart) {
    cartUpdated = await Cart.findOneAndUpdate(query, updateSet, options);
  } else {
    cartUpdated = await Cart.findOneAndUpdate(
      { cart_userId: userId, cart_state: "active" },
      {
        $push: { cart_products: { ...product, quantity } },
      },
      { upsert: true, new: true }
    );
  }

  return cartUpdated;
};
// END REPO

const addToCartService = async ({ userId, product }) => {
  const { productId, quantity, sku_id } = product;
  try {
    // Tìm giỏ hàng của user
    const userCart = await Cart.findOne({
      cart_userId: new Types.ObjectId(userId),
    }).lean();

    // Nếu chưa có giỏ hàng hoặc giỏ hàng trống, tạo mới
    if (!userCart || !userCart.cart_products.length) {
      return await createUserCart({ userId, product });
    }
    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingProduct = userCart.cart_products.find(
      (p) => p.sku_id?.toString() === sku_id.toString()
    );

    if (existingProduct) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      return await updateUserCartQuantity({ userId, product });
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm mới vào giỏ hàng
      return await createUserCart({ userId, product });
    }
  } catch (error) {
    throw new Error("Lỗi khi thêm sản phẩm vào giỏ hàng: " + error.message);
  }
};

/* 
    shop_order_ids: [
        {
        shopId,
        item_products: [
        {
            quantity, 
            shopId,
            old_quantity,
            product_id
        }
            
        ],
    }
    ]
  */
const updateCartService = async ({ userId, shop_order_ids }) => {
  const { productId, quantity, old_quantity, sku_id } =
    shop_order_ids[0]?.item_products[0];
  // check product
  // const foundProduct = await getProductById({ productId });
  const foundSku = await skuModel.findOne({ sku_id: sku_id });
  if (!foundSku) throw new NotFoundError("Product not found");
  // if (foundSku.product_shop.toString() !== shop_order_ids[0]?.shopId)
  //   throw new NotFoundError("Product does not exists");
  // check cart
  if (quantity === 0) {
    await deleteUserCartService({ userId, productId });
  }
  return await updateUserCartQuantity({
    userId,
    product: {
      productId,
      quantity: quantity - old_quantity,
      sku_id,
    },
  });
};

const deleteUserCartService = async ({ userId, sku_id }) => {
  const deleted = await Cart.updateOne(
    {
      cart_userId: new Types.ObjectId(userId),
      cart_state: "active",
    },
    {
      $pull: {
        cart_products: { sku_id },
      },
    }
  );
  return deleted;
};

const getListUserCartService = async ({ userId }) => {
  const cartCount = await Cart.aggregate([
    { $match: { cart_userId: new Types.ObjectId(userId) } },
    { $unwind: "$cart_products" },
    {
      $group: {
        _id: "$cart_products.productId",
        quantity: { $sum: "$cart_products.quantity" },
      },
    },
  ]);
  const totalCart = await cartCount.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const amount = await Cart.aggregate([
    { $match: { cart_userId: new Types.ObjectId(userId) } },
    { $unwind: "$cart_products" },
    {
      $group: {
        _id: "$cart_products.productId",
        price: { $sum: "$cart_products.price" },
        quantity: { $sum: "$cart_products.quantity" },
      },
    },
  ]);
  const totalAmount = await amount.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
  const carts = await Cart.findOne({
    cart_userId: new Types.ObjectId(userId),
  }).lean();
  return {
    totalCart,
    carts,
    totalAmount,
  };
};

module.exports = {
  addToCartService,
  updateCartService,
  deleteUserCartService,
  getListUserCartService,
};
