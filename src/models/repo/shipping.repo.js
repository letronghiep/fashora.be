const { CACHE_SHIPPING } = require("../../configs/constant");
const { BadRequestError } = require("../../core/error.response");
const { paginate } = require("../../helpers/paginate");
const Shipping = require("../shipping.model");
const {
  getCacheIO,
  setCacheIOExpiration,
  getAllCache,
} = require("./cache.repo");
const getPaginateAddressList = async ({ page, limit, filter, sort }) => {
  try {
    const addressKeyCache = `${CACHE_SHIPPING["SHIPPING-LIST"]}:${page}:${limit}`;
    let addressCache = await getCacheIO({ key: addressKeyCache });
    if (addressCache) {
      return { ...JSON.parse(addressCache), toLoad: "cache" };
    } else {
      addressCache = await paginate({
        model: Shipping,
        filter,
        page,
        limit,
        sort,
      });
    }
    const valueCache = addressCache ? addressCache : null;
    await setCacheIOExpiration({
      key: addressKeyCache,
      value: JSON.stringify(valueCache),
      expirationInSecond: 60,
    });
    return {
      ...addressCache,
      toLoad: "db",
    };
  } catch (error) {
    throw error;
  }
};
const updateShippingInCache = async (shippingId, updatedShipping) => {
  try {
    // const totalPageKey = `${CACHE_SHIPPING["TOTAL-PAGE"]}`;
    const shippingKey = `${CACHE_SHIPPING["SHIPPING-LIST"]}:*`;
    const shipping = await getAllCache({ key: shippingKey });
    if (!shipping || shipping.length === 0) {
      return;
    }
    const totalPages = parseInt(
      JSON.parse(await getCacheIO({ key: shipping[0] })).totalPages
    );
    const limit = parseInt(
      JSON.parse(await getCacheIO({ key: shipping[0] })).limit
    );
    if (!totalPages || totalPages === 0) {
      throw new BadRequestError("Không tìm thấy trang");
    }
    let updated = false;
    for (let page = 0; page < totalPages; page++) {
      const pageKey = `${CACHE_SHIPPING["SHIPPING-LIST"]}:${page + 1}:${limit}`;
      const pageData = JSON.parse(await getCacheIO({ key: pageKey }));
      const updatedPageData = pageData.data.map((shipping) => {
        return shipping._id === shippingId
          ? { ...shipping, updatedShipping }
          : shipping;
      });
      if (JSON.stringify(pageData) !== JSON.stringify(updatedPageData)) {
        await setCacheIOExpiration({
          key: pageKey,
          value: JSON.stringify({
            limit: pageData.limit,
            currentPage: pageData.currentPage,
            totalRows: pageData.totalRows,
            totalPages: pageData.totalPages,
            data: updatedPageData,
          }),
          expirationInSecond: 3600,
        });
        updated = true;
        break;
      }
    }
    if (!updated) {
      console.log(`Không tìm thấy địa chỉ trong danh sách`);
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getPaginateAddressList,
  updateShippingInCache,
};
