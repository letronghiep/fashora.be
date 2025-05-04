"use strict";

const { CREATED, SuccessResponse } = require("../core/success.response");

const {
  createDiscountService,
  getDiscountAmountService,
  getAllDiscountCodeService,
  getAllDiscountCodeByShopService,
  cancelDiscountCodeService,
  deleteDiscountCodeService,
  getDiscountDetailService,
  updateDiscountService,
} = require("../services/discount.service");

const createDiscount = async (req, res, next) => {
  new CREATED({
    message: "Discount is created",
    metadata: await createDiscountService({
      discount_shopId: req.user.userId,
      ...req.body,
    }),
  }).send(res);
};

const getAllDiscountCodes = async (req, res, next) => {
  new SuccessResponse({
    message: "discount amount",
    metadata: await getAllDiscountCodeByShopService({
      shopId: req.user.userId,
      ...req.query,
    }),
  }).send(res);
};

const getDiscountAmount = async (req, res, next) => {
  new SuccessResponse({
    message: "discount amount",
    metadata: await getDiscountAmountService({
      codeId: req.body.codeId,
      userId: req.user.userId,
      products: req.body.products,
    }),
  }).send(res);
};
const getAllDiscountCodeWithProducts = async (req, res, next) => {
  new SuccessResponse({
    message: "list  products discount",
    metadata: await getAllDiscountCodeService({
      ...req.query,
    }),
  }).send(res);
};
const cancelDiscountCode = async (req, res, next) => {
  new SuccessResponse({
    message: "Discount code is canceled",
    metadata: await cancelDiscountCodeService({
      discount_shopId: req.user.userId,
      ...req.query,
    }),
  }).send(res);
};

const deleteDiscountCode = async (req, res, next) => {
  new SuccessResponse({
    message: "Discount code is deleted",
    metadata: await deleteDiscountCodeService({
      shopId: req.user.userId,
      codeId: req.params.codeId,
    }),
  }).send(res);
};
const getDiscountDetail = async (req, res, next) => {
  new SuccessResponse({
    message: "discount detail",
    metadata: await getDiscountDetailService({
      discount_id: req.params.discount_id,
    }),
  }).send(res);
};
const updateDiscount = async (req, res, next) => {
  new SuccessResponse({
    message: "discount updated",
    metadata: await updateDiscountService({
      voucher_id: req.params.discount_id,
      data: req.body,
    }),
  }).send(res);
};
module.exports = {
  createDiscount,
  getAllDiscountCodes,
  getDiscountAmount,
  getAllDiscountCodeWithProducts,
  cancelDiscountCode,
  deleteDiscountCode,
  getDiscountDetail,
  updateDiscount,
};
