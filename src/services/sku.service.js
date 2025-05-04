"use strict";

const _ = require("lodash");

const { randomProductId } = require("../utils");
/**
 * create sku
 * get single sku
 * get sku list by product_id
 * set default sku by product_id
 */
const Sku = require("../models/sku.model");
const { NotFoundError } = require("../core/error.response");
const { CACHE_PRODUCT } = require("../configs/constant");
const {
  getCacheIO,
  setCacheIOExpiration,
} = require("../models/repo/cache.repo");
const createSkuService = async ({ product_id, sku_list }) => {
  try {
    const convert_sku_list = sku_list.map((sku) => {
      return {
        ...sku,
        product_id: product_id,
        sku_id: `${product_id}.${randomProductId()}`,
      };
    });
    const skues = await Sku.create(convert_sku_list);
    return skues;
  } catch (error) {
    console.log("Có lỗi trong quá trình tạo::", error);
    return [];
  }
};
const findSkusByTierIdx = async (sku_list) => {
  // Tạo danh sách `sku_tier_idx` để tìm kiếm
  const skuTierIdxList = sku_list.map((sku) => sku.sku_tier_idx);

  // Tìm tất cả SKU có `sku_tier_idx` trong danh sách
  const foundSkus = await Sku.find({
    sku_tier_idx: { $in: skuTierIdxList },
  });

  return foundSkus;
};
const updateSkuService = async ({ product_id, sku_list }) => {
  if (!sku_list.length) return;

  if (!sku_list.length) return;

  // Tìm tất cả SKU có `sku_tier_idx` trong danh sách
  const existingSkus = await findSkusByTierIdx(sku_list);

  for (const sku of sku_list) {
    const { sku_tier_idx, ...skuWithoutId } = sku;

    // Tìm SKU đã tồn tại với `sku_tier_idx`
    const existingSku = existingSkus.find(
      (existing) => existing.sku_tier_idx.toString() === sku_tier_idx.toString()
    );

    if (existingSku) {
      // Nếu SKU đã tồn tại, cập nhật nó
      await Sku.updateOne({ _id: existingSku._id }, { $set: skuWithoutId });
    } else {
      // Nếu SKU không tồn tại, tạo mới
      await Sku.create({
        ...skuWithoutId,
        sku_tier_idx,
        product_id: product_id,
        sku_id: `${product_id}.${randomProductId()}`,
      });
    }
  }
};

const getAllSkuService = async ({ product_id }) => {
  try {
    const skues = await Sku.find({
      product_id: product_id,
    }).lean();
    return skues;
  } catch (error) {
    console.log("Có l��i trong quá trình lấy danh sách::", error);
    return [];
  }
};
const getSingleSkuService = async ({ product_id, sku_id }) => {
  try {
    //1. check params
    if (!sku_id < 0) return null;
    if (!product_id < 0) return null;
    //2. read cache
    const skuKeyCache = `${CACHE_PRODUCT.SKU}${sku_id}`; // key cache
    let skuCache = await getCacheIO({ key: skuKeyCache });
    if (skuCache) {
      return {
        ...JSON.parse(skuCache),
        toLoad: "cache", // dbs
      };
    }
    //3.read from dbs
    if (!skuCache) {
      skuCache = await Sku.findOne({
        sku_id,
        product_id,
      }).lean();
      const valueCache = skuCache ? skuCache : null;
      setCacheIOExpiration({
        key: skuKeyCache,
        value: JSON.stringify(valueCache),
        expirationInSecond: 30,
      }).then();
    }
    return {
      skuCache,
      toLoad: "dbs", // dbs
    };
    // const sku = await Sku.findOne({
    //   sku_id,
    //   product_id,
    // }).lean();
    // return _.omit(sku, ["__v", "createdAt", "updatedAt", "isDeleted"]);
  } catch (error) {
    console.log("Có lỗi xảy ra::", error);
    return null;
  }
};

const setDefaultSkuService = async ({ product_id, sku_id }) => {
  try {
    const foundSku = await Sku.findOne({
      sku_id,
      product_id,
    });
    if (!foundSku) throw new NotFoundError("Không tìm thấy sản phẩm");
    const { modifiedCount } = foundSku.updateOne(
      {
        $set: {
          sku_default: true,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
    return modifiedCount;
  } catch (error) {
    console.log("Có l��i trong quá trình thiết lập mặc đ��nh::", error);
    return 0;
  }
};
module.exports = {
  createSkuService,
  updateSkuService,
  getAllSkuService,
  getSingleSkuService,
  setDefaultSkuService,
};
