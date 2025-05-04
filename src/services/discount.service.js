"use strict";

const Discount = require("../models/discount.model");

const { BadRequestError, NotFoundError } = require("../core/error.response");
const { findAllProduct } = require("../models/repo/product.repo");
const {
  findAllDiscountSelect,
  checkDiscountExists,
} = require("../models/repo/discount.repo");
const { Types } = require("mongoose");
const { paginate } = require("../helpers/paginate");

/**
 * generate discount code[admin, shop]
 * get discount amount[user]
 * get all discount code
 * verify discount code [user]
 * delete discount code [admin | shop]
 * cancel discount [user]
 */
const createDiscountService = async (payload) => {
  try {
    const {
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_code,
      discount_start_date,
      discount_end_date,
      discount_max_uses,
      discount_uses_count,
      discount_users_used,
      discount_max_uses_per_user,
      discount_min_order_value,
      discount_max_value,
      discount_shopId,
      discount_is_active,
      discount_applies_to,
      discount_product_ids,
    } = payload;
    if (
      new Date() < new Date(discount_start_date) ||
      new Date() > new Date(discount_end_date)
    )
      throw new BadRequestError("Discount code has expired!");
    if (new Date(discount_start_date) > new Date(discount_end_date))
      throw new BadRequestError("Start date must be less than end date");
    const foundDiscount = await checkDiscountExists({
      filter: {
        discount_code,
        discount_shopId,
      },
    });
    if (foundDiscount) throw new BadRequestError("Discount is already");

    const discount = await Discount.create({
      discount_name,
      discount_description,
      discount_type,
      discount_value,
      discount_code,
      discount_start_date,
      discount_end_date,
      discount_max_uses,
      discount_uses_count,
      discount_users_used,
      discount_max_uses_per_user,
      discount_min_order_value,
      discount_max_value,
      discount_shopId,
      discount_is_active,
      discount_applies_to,
      discount_product_ids,
    });
    return discount;
  } catch (error) {
    throw error;
  }
};

const getAllDiscountCodeService = async ({
  code,
  shopId,
  userId,
  limit,
  page,
}) => {
  const foundDiscount = await checkDiscountExists({
    filter: {
      discount_code: code,
      discount_shopId: shopId,
    },
  });
  if (!foundDiscount || !foundDiscount.discount_is_active)
    throw new NotFoundError("Discount is not already");
  const { discount_applies_to, discount_product_ids } = foundDiscount;
  let products;
  if (discount_applies_to === "all") {
    products = await findAllProduct({
      filter: {
        product_shop: shopId,
        isPublished: true,
      },
      limit: +limit,
      page: +page,
      sort: "ctime",
      select: ["product_name"],
    });
  }
  if (discount_applies_to === "specific") {
    products = await findAllProduct({
      filter: {
        _id: { $in: discount_product_ids },
        isPublished: true,
      },
      limit: +limit,
      page: +page,
      sort: "ctime",
      select: ["product_name"],
    });
  }
  return products;
};

const getAllDiscountCodeByShopService = async ({
  limit = 10,
  page = 1,
  shopId,
  q,
}) => {
  const searchText = q
    ? {
        $or: [
          { discount_code: { $regex: q, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$discount_name" },
                regex: q,
                options: "i",
              },
            },
          },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$discount_max_uses" },
                regex: q,
                options: "i",
              },
            },
          },
        ],
      }
    : {};
  const discounts = await paginate({
    model: Discount,
    filter: {
      ...searchText,
      discount_shopId: shopId,
      discount_is_active: true,
    },
    limit: +limit,
    page: +page,
  });
  return discounts;
};

const getDiscountAmountService = async ({
  codeId,
  userId,
  // shopId,
  products,
}) => {
  const foundDiscount = await checkDiscountExists({
    filter: {
      discount_code: codeId,
      // discount_shopId: shopId,
    },
  });
  if (!foundDiscount) throw new NotFoundError("Discount is not exists");
  const {
    discount_is_active,
    discount_max_uses,
    discount_min_order_value,
    discount_start_date,
    discount_end_date,
    discount_max_uses_per_user,
    discount_users_used,
    discount_type,
    discount_value,
  } = foundDiscount;
  if (!discount_is_active) throw new BadRequestError("Discount is not already");
  if (!discount_max_uses) throw new BadRequestError("Discount are out");
  if (
    new Date() < new Date(discount_start_date) ||
    new Date() > new Date(discount_end_date)
  ) {
    throw new BadRequestError("Discount code has expired!");
  }
  // check gia tri toi da

  const totalOrder = products.reduce((acc, product) => {
    return acc + product.quantity * product.price;
  }, 0);
  if (totalOrder < discount_min_order_value)
    throw new BadRequestError(
      `discount requires a minium order value of ${discount_min_order_value}`
    );
  if (discount_max_uses_per_user > 0) {
    const userUseDiscount = discount_users_used.find(
      (user) => user.usr_id === userId
    );
    if (userUseDiscount) {
      throw new BadRequestError(
        `You have used ${discount_max_uses_per_user} times`
      );
    }
  }
  // check discount type
  const amount =
    discount_type === "fixed_amount"
      ? discount_value
      : totalOrder * (discount_value / 100);
  return {
    totalOrder,
    discount: amount,
    totalPrice: totalOrder - amount,
  };
};

// delete discount code
const deleteDiscountCodeService = async ({ codeId, shopId, userId }) => {
  const result = await Discount.findByIdAndDelete({
    _id: new Types.ObjectId(codeId),
    discount_shopId: new Types.ObjectId(shopId),
  });
  return result;
};
const getDiscountDetailService = async ({ discount_id }) => {
  const result = await Discount.findById({
    _id: new Types.ObjectId(discount_id),
  });
  if (!result) throw new NotFoundError("Mã không tồn tại");
  return result;
};
// cancel discount
const cancelDiscountCodeService = async ({ codeId, shopId, userId }) => {
  const foundDiscount = await checkDiscountExists({
    filter: {
      discount_code: codeId,
      discount_shopId: shopId,
    },
  });
  if (!foundDiscount) throw new NotFoundError("Discount is not exists");
  const result = await Discount.findByIdAndUpdate(foundDiscount._id, {
    $pull: {
      discount_users_used: userId,
    },
    $inc: {
      discount_max_uses: 1,
      discount_uses_count: -1,
    },
  });
  return result;
};
const updateDiscountService = async ({ voucher_id, data }) => {
  const foundDiscount = await Discount.findById({
    _id: new Types.ObjectId(voucher_id),
  });
  if (!foundDiscount) throw new NotFoundError("Discount is not exists");
  const result = await Discount.findByIdAndUpdate(voucher_id, data, {
    new: true,
  });
  return result;
};
module.exports = {
  createDiscountService,
  getAllDiscountCodeService,
  getAllDiscountCodeByShopService,
  getDiscountAmountService,
  deleteDiscountCodeService,
  cancelDiscountCodeService,
  getDiscountDetailService,
  updateDiscountService,
};
