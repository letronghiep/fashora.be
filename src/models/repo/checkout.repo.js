"use strict";

const { CACHE_ORDER } = require("../../configs/constant");
const { getCacheIO, setCacheIOExpiration } = require("./cache.repo");
const Order = require("../order.model");
const { paginate } = require("../../helpers/paginate");
const { Types } = require("mongoose");
const getOrderByUserList = async ({ page, limit, filter, sort }) => {
  try {

    // Fetch paginated order data
    const orderCache = await paginate({
      model: Order,
      filter,
      page,
      limit,
      sort,
    });

    if (!orderCache) throw new Error("No orders found");

    const { order_userId } = filter;

    // Parallel fetching of counts and total products
    const [counts, totalProducts] = await Promise.all([
      // Fetch order counts by status
      Promise.all(
        ["pending", "canceled", "delivered", "confirmed", "shipped"].map(
          async (status) => ({
            [status]: await Order.countDocuments({ order_status: status }),
          })
        )
      ).then((res) => Object.assign({}, ...res)),

      // Fetch total products
      Order.aggregate([
        { $match: { order_userId: new Types.ObjectId(order_userId) } },
        { $unwind: "$order_products" },
        { $unwind: "$order_products.item_products" },
        {
          $group: {
            _id: "$order_id",
            total_products: { $sum: "$order_products.item_products.quantity" },
          },
        },
      ]),
    ]);

    // Map total products to orders
    const items = orderCache.data.map((item) => {
      const totalProduct = totalProducts.find(
        (totalItem) => totalItem._id === item.order_id
      );
      return {
        ...item,
        total_product: totalProduct ? totalProduct.total_products : 0,
      };
    });

    // Construct result
    const result = {
      ...orderCache,
      data: items,
      ...counts,
    };

    // // Cache the result
    // await setCacheIOExpiration({
    //   key: orderKeyCache,
    //   value: JSON.stringify(result),
    //   expirationInSecond: 60,
    // });

    return await result;
  } catch (error) {
    console.error("Error in getOrderByUserList:", error);
    throw error;
  }
};
const getOrderForAdminList = async ({ page, limit, filter, sort }) => {
  try {
    const orderCache = await paginate({
      model: Order,
      filter,
      page,
      limit,
      sort,
    });
    if (!orderCache) throw new Error("No orders found");

    // Parallel fetching of counts and total products
    const [counts, totalProducts] = await Promise.all([
      // Fetch order counts by status
      Promise.all(
        ["pending", "canceled", "delivered", "confirmed", "shipped"].map(
          async (status) => ({
            [status]: await Order.countDocuments({ order_status: status }),
          })
        )
      ).then((res) => Object.assign({}, ...res)),

      // Fetch total products
      Order.aggregate([
        { $match: filter },
        { $unwind: "$order_products" },
        { $unwind: "$order_products.item_products" },
        {
          $group: {
            _id: "$order_id",
            total_products: { $sum: "$order_products.item_products.quantity" },
          },
        },
      ]),
    ]);

    // Map total products to orders
    const items = orderCache.data.map((item) => {
      const totalProduct = totalProducts.find(
        (totalItem) => totalItem._id === item.order_id
      );
      return {
        ...item,
        total_product: totalProduct ? totalProduct.total_products : 0,
      };
    });

    // Construct result
    const result = {
      ...orderCache,
      data: items,
      ...counts,
    };

    // // Cache the result
    // await setCacheIOExpiration({
    //   key: orderKeyCache,
    //   value: JSON.stringify(result),
    //   expirationInSecond: 60,
    // });

    return await result;
  } catch (error) {
    console.error("Error in getOrderForAdminList:", error);
    throw error;
  }
};
module.exports = {
  getOrderByUserList,
  getOrderForAdminList,
};
