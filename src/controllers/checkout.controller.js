"use strict";

const { SuccessResponse, CREATED } = require("../core/success.response");
const {
  checkoutReviewService,
  orderByUserService,
  getOrderByUserService,
  getDetailOrderService,
  updateStatusOrderService,
  cancelOrderService,
  exportOrderToCSVService,
  createCheckoutOnlineService,
  callbackZaloPayService,
  getOrderForAdminService
} = require("../services/checkout.service");

const checkoutReview = async (req, res, next) => {
  // implement checkout review logic here
  new SuccessResponse({
    message: "checkout review",
    metadata: await checkoutReviewService({
      userId: req.user.userId,
      cartId: req.body.cartId,
      shop_order_ids: req.body.shop_order_ids,
      discount_code: req.body.discount_code,
      payment_method: req.body.payment_method,
      // cart_products: req.body.cart_products,
    }),
  }).send(res);
};
const orderByUser = async (req, res, next) => {
  new SuccessResponse({
    message: "order",
    metadata: await orderByUserService({
      userId: req.user.userId,
      ...req.body,
    }),
  }).send(res);
};
// [admin]
const getOrderForAdmin = async (req, res, next) => {
  new SuccessResponse({
    message: "get order for admin",
    metadata: await getOrderForAdminService({
      filter: req.query,
      page: req.query.page,
      limit: req.query.limit,
    }),
  }).send(res);
};

// [user]
const getOrderByUser = async (req, res, next) => {
  new SuccessResponse({
    message: "get order by user",
    metadata: await getOrderByUserService({
      userId: req.user.userId,
      filter: req.query,
      page: req.query.page,
      limit: req.query.limit,
    }),
  }).send(res);
};

const getDetailOrderByUser = async (req, res, next) => {
  new SuccessResponse({
    message: "get order detail by user",
    metadata: await getDetailOrderService({
      userId: req.user.userId,
      orderId: req.params.order_id,
    }),
  }).send(res);
};
// [Shop | admin]
const updateStatusOrder = async (req, res, next) => {
  const { userId } = req.user;
  new SuccessResponse({
    message: "update status order",
    metadata: await updateStatusOrderService({
      order_status: req.body.order_status,
      userId: userId,
      orderId: req.query.order_id,
    }),
  }).send(res);
};
// [user]
const cancelOrder = async (req, res, next) => {
  new SuccessResponse({
    message: "cancel success",
    metadata: await cancelOrderService({
      orderId: req.params.order_id,
      userId: req.user.userId,
    }),
  }).send(res);
};

const exportOrderToCSV = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { order_status, startDate, endDate } = req.query;

    const { filename, content } = await exportOrderToCSVService({
      userId,
      filter: { order_status, startDate, endDate }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(content);
  } catch (error) {
    next(error);
  }
};
const createCheckoutOnline = async (req, res, next) => {
  new SuccessResponse({
    message: "create checkout online",
    metadata: await createCheckoutOnlineService({
      userId: req.user.userId,
      ...req.body,
    }),
  }).send(res);
}
const callbackZaloPay = async (req, res, next) => {
    new CREATED({
      message: "create checkout online",
      metadata: await callbackZaloPayService({
        // userId: req.user.userId,
        data: req.body.data,
        mac: req.body.mac,
        ...req.body
      }),
    }).send(res);
}
module.exports = {
  checkoutReview,
  orderByUser,
  getOrderByUser,
  getDetailOrderByUser,
  updateStatusOrder,
  cancelOrder,
  exportOrderToCSV,
  createCheckoutOnline,
  callbackZaloPay,
  getOrderForAdmin
};
