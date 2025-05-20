"use strict";

const Inventory = require("../models/inventory.model");
const SKU = require("../models/sku.model");
const { getProductById } = require("../models/repo/product.repo");
const { paginate } = require("../helpers/paginate");
const { NotFoundError } = require("../core/error.response");

const addStockToInventory = async ({
  stock,
  productId,
  shopId,
  location = "unKnow",
  skuId,
}) => {
  if (typeof stock !== "number" || isNaN(stock)) {
    throw new Error("Giá trị stock không hợp lệ");
  }
  const product = await getProductById({ productId: productId });
  if (!product) throw new NotFoundError("Không tìm thấy sản phẩm");
  // Add your code here to update inventory
  const query = {
      inven_shopId: shopId,
      inven_productId: productId,
      inven_skuId: skuId,
    },
    update = {
      $inc: { inven_stock: stock },
      ...(location && { $setOnInsert: { inven_location: location } }),
    },
    options = {
      upsert: true,
      returnDocument: "after",
    };
  return await Inventory.findOneAndUpdate(query, update, options);
};
const getLowSaleProductsService = async ({ page = 1, limit = 10 }) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const lowSaleSku = await SKU.aggregate([
    {
      $lookup: {
        from: "orders",
        let: { skuId: "$sku_id" },
        pipeline: [
          {
            $match: {
              createdAt: { $lt: thirtyDaysAgo },
              order_status: "completed",
            },
          },
          {
            $unwind: "$order_products",
          },
          {
            $unwind: "$order_products.item_products",
          },
          {
            $match: {
              $expr: {
                $eq: ["$order_products.item_products.skuId", "$$skuId"],
              },
            },
          },
        ],
        as: "oldSales",
      },
    },
    {
      $addFields: {
        oldSaleCount: { $size: "$oldSales" },
        totalQuantitySold: {
          $sum: {
            $map: {
              input: "$oldSales",
              as: "sale",
              in: {
                $ifNull: ["$$sale.order_products.item_products.quantity", 0],
              },
            },
          },
        },
      },
    },
    {
      $match: {
        oldSaleCount: { $lte: 3 },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "product_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $match: {
        sku_status: "published",
        sku_price_sale: { $ne: 0 },
        $expr: {
          $eq: ["$sku_price_sale", "$sku_price"],
        },
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "sku_id",
        foreignField: "inven_skuId",
        as: "inventory",
      },
    },
    {
      $unwind: "$inventory",
    },
    {
      $project: {
        product_id: "$product._id",
        skuId: "$sku_id",
        sku_name: "$sku_name",
        product_name: "$product.product_name",
        attributes: {
          color: {
            $arrayElemAt: [
              "$product.product_variations.0.options",
              { $arrayElemAt: ["$sku_tier_idx", 0] },
            ],
          },
          size: {
            $arrayElemAt: [
              "$product.product_variations.1.options",
              { $arrayElemAt: ["$sku_tier_idx", 1] },
            ],
          },
        },
        product_quantity: "$inventory.inven_stock",
        oldSaleCount: 1,
        totalQuantitySold: 1,
        stockValue: {
          $multiply: [
            { $ifNull: ["$inventory.inven_stock", 0] },
            { $ifNull: [{ $toDouble: "$sku_price" }, 0] },
          ],
        },
        product_price: "$product.product_price",
      },
    },
  ]);

  const total = lowSaleSku.length;
  const skip = (page - 1) * limit;
  const paginatedData = lowSaleSku.slice(skip, skip + limit);

  return {
    data: paginatedData,
    // pagination: {
    page: Number(page),
    limit: Number(limit),
    totalRows: total,
    totalPages: Math.ceil(total / limit),
    // }
  };
};

module.exports = {
  addStockToInventory,
  getLowSaleProductsService,
};
