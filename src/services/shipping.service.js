"use strict";
const { paginate } = require("../helpers/paginate");
const Notification = require("../models/notification.model");
const {
  getListAddress,
  getPaginateAddressList,
  updateShippingInCache,
} = require("../models/repo/shipping.repo");
const { findOneUser, getAdmin } = require("../models/repo/user.repo");
const Shipping = require("../models/shipping.model");
const { randomShippingId } = require("../utils");
const RedisPubsubService = require("../services/redisPubsub.service");
const { getIORedis } = require("../db/init.ioredis");
const { CACHE_SHIPPING } = require("../configs/constant");
const { NotFoundError } = require("../core/error.response");
const { Types } = require("mongoose");
const {
  clearCacheIO,
  getCacheIO,
  setCacheIO,
  setCacheIOExpiration,
  clearCachePattern,
} = require("../models/repo/cache.repo");
const { getIO } = require("../db/init.socket");
const { listenRedis } = require("../services/redisListener.service");
const { shippingConfig } = require("../configs/event.config");
const { shippingCreated, shippingUpdated, shippingDeleted } = shippingConfig;
const io = getIO();
// Get shipping information by shipping_id
const redisPubsub = new RedisPubsubService();
const getListShippingByUser = async ({
  user_id,
  limit = 50,
  sort = "ctime",
  page = 1,
  filter = {},
}) => {
  if (!user_id) return null;
  return await getPaginateAddressList({
    limit,
    sort,
    page,
    filter: { user_id: user_id },
  });
};
const getShippingDetailService = async ({ user_id, shipping_id }) => {
  if (!user_id || !shipping_id) return null;
  const shippingKeyCache = `${CACHE_SHIPPING["SHIPPING"]}:${user_id}:${shipping_id}`;
  const shippingCache = await getCacheIO({ key: shippingKeyCache });
  if (shippingCache) {
    return {
      ...JSON.parse(shippingCache),
      toLoad: "cache", // redis
    };
  } else {
    const shipping = await Shipping.findOne({
      user_id: user_id,
      _id: new Types.ObjectId(shipping_id),
    });

    if (shipping) {
      await setCacheIOExpiration({
        key: shippingKeyCache,
        value: JSON.stringify({
          shipping: shipping,
          toLoad: "db",
        }),
        expirationInSecond: 60,
      });
      return {
        shipping,
        toLoad: "db",
      };
    }
  }
};
const createShippingByUser = async ({
  user_id,
  name,
  phone,
  address,
  city,
  district,
  ward,
  country,
  zip,
  geo_info,
  is_delivery_address,
  is_return_address,
}) => {
  const foundUser = await findOneUser({
    _id: new Types.ObjectId(user_id),
    usr_status: "active",
  });
  if (!foundUser) throw new NotFoundError("Người dùng không tồn tại");
  const newAddress = await Shipping.create({
    user_id,
    shipping_id: randomShippingId(),
    name,
    phone,
    address,
    city,
    district,
    ward,
    country,
    zip,
    geo_info,
    is_delivery_address,
    is_return_address,
  });
  redisPubsub.publish(shippingCreated.event, JSON.stringify(newAddress));
  // const addressList = JSON.parse(getIORedis(addressKeyCache));
  const addressKeyCache = `${CACHE_SHIPPING["SHIPPING-LIST"]}:*`;
  const addressKeyCacheItem = `${CACHE_SHIPPING["SHIPPING"]}:*`;
  await clearCachePattern(addressKeyCacheItem);
  await clearCachePattern(addressKeyCache);
  await io.emit("new address", newAddress._id);
  return newAddress;
};
const updateShippingService = async ({
  user_id,
  shipping_id,
  name,
  phone,
  address,
  city,
  district,
  ward,
  country,
  zip,
  geo_info,
  is_delivery_address,
  is_return_address,
}) => {
  // Update logic here
  const user = await findOneUser({
    _id: new Types.ObjectId(user_id),
    usr_status: "active",
  });
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }
  const shippingUpdate = {
    name,
    phone,
    address,
    city,
    district,
    ward,
    country,
    zip,
    geo_info,
    is_delivery_address,
    is_return_address,
  };
  if (is_delivery_address) {
    const shippingUpdate = {
      is_delivery_address: false,
      is_return_address: false,
    };
    await Shipping.updateMany({ user_id: user_id }, shippingUpdate);
  }
  const shipping = await Shipping.findOneAndUpdate(
    { user_id: user_id, _id: shipping_id },
    shippingUpdate,
    { new: true, upsert: true }
  );
  const addressKeyCache = `${CACHE_SHIPPING["SHIPPING-LIST"]}:*`;
  const addressKeyCacheItem = `${CACHE_SHIPPING["SHIPPING"]}:*`;
  await clearCachePattern(addressKeyCacheItem);
  await clearCachePattern(addressKeyCache);
  await redisPubsub.publish(shippingUpdated.event, JSON.stringify(shipping));

  return shipping;
};
const removeShippingService = async ({ user_id, shipping_id }) => {
  // Delete logic here
  const user = await findOneUser({
    _id: new Types.ObjectId(user_id),
    usr_status: "active",
  });
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }
  const shippingDelete = await Shipping.findOneAndDelete({
    user_id: user_id,
    _id: shipping_id,
  });
  await redisPubsub.publish(
    shippingDeleted.event,
    JSON.stringify(shippingDelete)
  );
  const addressKeyCache = `${CACHE_SHIPPING["SHIPPING-LIST"]}:*`;
  const addressKeyCacheItem = `${CACHE_SHIPPING["SHIPPING"]}:*`;
  await clearCachePattern(addressKeyCacheItem);
  await clearCachePattern(addressKeyCache);
  return true;
};

const updateDefaultShippingService = async ({ user_id, shipping_id }) => {
  const user = await findOneUser({
    _id: new Types.ObjectId(user_id),
    usr_status: "active",
  });
  if (!user) {
    throw new NotFoundError("Người dùng không tồn tại");
  }
  const shippingUpdate = {
    is_delivery_address: false,
    is_return_address: false,
  };
  await Shipping.updateMany({ user_id: user_id }, shippingUpdate);
  const shipping = await Shipping.findOneAndUpdate(
    { user_id: user_id, _id: shipping_id },
    { $set: { is_delivery_address: true, is_return_address: true } },
    { new: true, upsert: true }
  );
  const addressKeyCache = `${CACHE_SHIPPING["SHIPPING-LIST"]}:*`;
  const addressKeyCacheItem = `${CACHE_SHIPPING["SHIPPING"]}:*`;
  await clearCachePattern(addressKeyCacheItem);
  await clearCachePattern(addressKeyCache);
  await redisPubsub.publish(shippingUpdated.event, JSON.stringify(shipping));
  return shipping;
};

listenRedis();

module.exports = {
  getListShippingByUser,
  getShippingDetailService,
  createShippingByUser,
  updateShippingService,
  removeShippingService,
  updateDefaultShippingService,
};
