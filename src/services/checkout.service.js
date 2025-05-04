"use strict";
const Order = require("../models/order.model");
const { BadRequestError } = require("../core/error.response");
const {} = require("../core/success.response");
const { findCartById } = require("../models/repo/cart.repo");
const { checkProductByServer } = require("../models/repo/product.repo");
const { getDiscountAmount } = require("../controllers/discount.controller");
const { acquireLock, releaseLock } = require("../services/redis.service");
const { deleteUserCartService } = require("./cart.service");
const { producer } = require("./rabbitMQ.service");
const { getOrderByUserList, getOrderForAdminList } = require("../models/repo/checkout.repo");
const { randomString } = require("../utils");
const cartModel = require("../models/cart.model");
const { Types } = require("mongoose");
const { getDiscountAmountService } = require("./discount.service");
const XLSX = require("xlsx");
const axios = require("axios");
const moment = require("moment");
var Product = require("../models/product.model");
const CryptoJS = require("crypto-js");
const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};
/* 
    {
        cartId,
        userId,
        shop_order_ids: [
            {
                shopId,
                shop_discount: [],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    }
                ]
            },
            {
                shopId,
                shop_discount: [
                    {
                        shopId,
                        discountId,
                        codeId
                    }
                ],
                item_products: [
                    {
                    price,
                    quantity,
                    productId
                    }
                ]
            }
        ]
    }

*/
// const io = getIO();
const checkoutReviewService = async ({
  cartId,
  userId,
  shop_order_ids = [],
  discount_code = "",
  payment_method = "",
}) => {
  const foundCart = await cartModel.findOne({
    _id: new Types.ObjectId(cartId),
    cart_state: "active",
  });
  if (!foundCart) throw new BadRequestError("Cart not exists");
  if (!foundCart.cart_products.length) {
    throw new BadRequestError("Cart is empty");
  }
  const checkout_order = {
    totalPrice: 0, // tong tien hang
    feeShip: 0, // phi van chuyen
    totalDiscount: 0, // tong giam gia
    totalCheckout: 0, // tong thanh toan
  };
  if (payment_method === "BANK") {
    checkout_order.feeShip = 0;
  } else {
    checkout_order.feeShip = 30000;
  }
  const shop_order_ids_new = [];
  // tinh tong tien bill
  // for (let i = 0; i < shop_order_ids.length; i++) {
  // const {
  //   shopId,
  //   shop_discounts = [],
  //   item_products = [],
  // } = shop_order_ids[i];
  // check product server
  const checkProductServer = await checkProductByServer({
    products: shop_order_ids,
  });
  if (!checkProductServer[0]) throw new BadRequestError("order wrong!!!");
  // tong tien don hang
  const checkoutPrice = checkProductServer.reduce((acc, product) => {
    return acc + product.quantity * product.price;
  }, 0);
  // tong tien truoc xu li
  checkout_order.totalPrice = +checkoutPrice;
  checkout_order.totalCheckout = +checkoutPrice + checkout_order.feeShip;
  const itemCheckout = {
    // shopId,
    discount_code,
    priceRaw: checkoutPrice,
    priceApplyDiscount: checkoutPrice,
    item_products: checkProductServer,
  };
  // if (shop_discounts.length > 0) {
  //   const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
  //     codeId: shop_discounts[0].codeId,
  //     userId: userId,
  //     shopId,
  //     products: checkProductServer,
  //   });
  //   // tong discount giam gia
  //   checkout_order.totalDiscount += discount;
  //   if (discount > 0) {
  //     itemCheckout.priceApplyDiscount = checkoutPrice - discount;
  //     // tong thanh toan cuoi cung
  //     checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
  //   }
  // }
  if (discount_code) {
    const { totalPrice = 0, discount = 0 } = await getDiscountAmountService({
      codeId: discount_code,
      userId: userId,
      // shopId: shop_order_ids[0].shopId,`
      products: checkProductServer,
    });
    checkout_order.totalDiscount += discount;
    if (discount > 0) {
      itemCheckout.priceApplyDiscount = checkoutPrice - discount;
      checkout_order.totalCheckout =
        itemCheckout.priceApplyDiscount + checkout_order.feeShip;
    }
  }
  shop_order_ids_new.push(itemCheckout);
  return {
    shop_order_ids,
    shop_order_ids_new,
    checkout_order,
  };
  // }
};
// order
const orderByUserService = async ({
  shop_order_ids,
  cartId,
  userId,
  user_address,
  user_payment,
}) => {
  const { shop_order_ids_new, checkout_order } = await checkoutReviewService({
    cartId,
    userId,
    shop_order_ids,
  });
  // check lai mot lan nua xem vuot ton kho hay khong
  // get new array product
  const products = await shop_order_ids_new.flatMap((order) => {
    return order.item_products;
  });
  const acquireProduct = [];
  for (let i = 0; i < products.length; i++) {
    const { productId, quantity } = products[i];
    const keyLock = await acquireLock(productId, quantity, cartId);
    acquireProduct.push(keyLock ? true : false);
    if (keyLock) {
      await releaseLock(keyLock);
    }
  }
  // check neu co mot san pham het hang trong kho
  if (acquireProduct.includes(false)) {
    throw new BadRequestError(
      "Mot so san pham da duoc cap nhat, vui long quay lai gio hang..."
    );
  }
  const newOrder = await Order.create({
    order_userId: userId,
    order_id: randomString(),
    order_checkout: checkout_order,
    order_shipping: user_address,
    order_payment: user_payment,
    order_products: shop_order_ids_new,
  });
  if (newOrder) {
    // remove product in my cart
    await deleteUserCartService({
      userId,
      productId: shop_order_ids_new.flatMap((order) =>
        order.item_products.map((product) => product.productId)
      ),
    });
    await producer(JSON.stringify(newOrder), "orderQueue");
    // io.emit("order-requirement", newOrder);
  }
  return newOrder;
};
/*
 Query order
 */
const getOrderForAdminService = async ({
  limit = 50,
  sort = "ctime",
  page = 1,
  filter = {},
}) => {
  const { order_status, order_trackingNumber, sort_by } = filter;
  const validStatuses = [
    "pending", // Chờ xác nhận
    "confirmed", // Đã xác nhận
    "processing", // Đang xử lý
    "packed", // Đã đóng gói
    "delivering", // Đang giao hàng
    "shipped", // Đã giao hàng
    "completed", // Hoàn tất
    "cancelled", // Đã hủy
    "returned", // Trả hàng
    "exchanged", // Đổi hàng
    "refunded", // Đã hoàn tiền
    "failed_delivery", // Giao hàng thất bại
    "on_hold", // Đơn bị treo
  ];
  const isValidStatus = validStatuses.includes(order_status);

  // Build filter object dynamically
  const filterQuery = {
    ...(isValidStatus && { order_status }), // only add if valid
  };
  const result = await getOrderForAdminList({
    limit,
    sort: sort_by || sort, // Sử dụng sort_by nếu có, không thì dùng sort mặc định
    page,
    filter: filterQuery,
  });
  return result;
};

const getOrderByUserService = async ({
  userId,
  limit = 50,
  sort = "ctime",
  page = 1,
  filter = {},
}) => {
  if (!userId) return null;
  const { order_status, order_trackingNumber, sort_by } = filter;

  const validStatuses = [
    "pending", // Chờ xác nhận
    "confirmed", // Đã xác nhận
    "processing", // Đang xử lý
    "packed", // Đã đóng gói
    "delivering", // Đang giao hàng
    "shipped", // Đã giao hàng
    "completed", // Hoàn tất
    "cancelled", // Đã hủy
    "returned", // Trả hàng
    "exchanged", // Đổi hàng
    "refunded", // Đã hoàn tiền
    "failed_delivery", // Giao hàng thất bại
    "on_hold", // Đơn bị treo
  ];
  const isValidStatus = validStatuses.includes(order_status);

  // Build filter object dynamically
  const filterQuery = {
    order_userId: userId,
    ...(order_trackingNumber && { order_trackingNumber }),
    ...(isValidStatus && { order_status }), // only add if valid
  };

  const result = await getOrderByUserList({
    limit,
    sort: sort_by || sort, // Sử dụng sort_by nếu có, không thì dùng sort mặc định
    page,
    filter: filterQuery,
  });

  return {
    ...result,
  };
};
const getDetailOrderService = async ({ userId, orderId }) => {
  if (!userId) throw new BadRequestError("Vui lòng đăng nhập!");

  const foundOrder = await Order.findOne({
    order_userId: new Types.ObjectId(userId),
    _id: new Types.ObjectId(orderId),
  }).lean();

  if (!foundOrder) throw new NotFoundError("Không tìm thấy đơn hàng");
  // Lấy tất cả item_products từ các order_products và thực hiện async hành động
  const result = await Promise.all(
    foundOrder.order_products.flatMap(async (orderProduct) => {
      // For each item_product, fetch the related product details asynchronously
      await Promise.all(
        orderProduct.item_products.map(async (itemProduct) => {
          const product = await Product.findOne({
            _id: new Types.ObjectId(itemProduct.productId),
          })
            .lean()
            .exec();
          if (product) {
            itemProduct.product_thumb = product.product_thumb;
            itemProduct.product_name = product.product_name;
          }
        })
      );
      return orderProduct.item_products; // Return the item_products from each orderProduct
    })
  );

  // Flatten the array of item_products into a single array
  const allItemProducts = result.flat();
  const orderResult = {
    ...foundOrder,
    order_products: allItemProducts,
  };

  return orderResult;
};

const cancelOrderService = async ({ orderId, userId }) => {
  const query = {
      order_userId: userId,
      _id: orderId,
    },
    updateSet = {
      order_status: "canceled",
    };
  const { modifiedCount } = await Order.updateOne(query, updateSet);
  return modifiedCount;
};
const updateStatusOrderService = async ({ order_status, userId, orderId }) => {
  const query = {
      order_userId: userId,
      _id: orderId,
    },
    updateSet = {
      order_status: order_status,
    };
  const { modifiedCount } = await Order.updateOne(query, updateSet);
  return modifiedCount;
};

const exportOrderToCSVService = async ({ userId, filter = {} }) => {
  try {
    const { order_status, startDate, endDate } = filter;

    const validStatuses = [
      "pending",
      "canceled",
      "delivered",
      "confirmed",
      "shipped",
    ];
    const isValidStatus = validStatuses.includes(order_status);

    const filterQuery = {
      order_userId: new Types.ObjectId(userId),
      ...(isValidStatus && { order_status }),
    };

    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const orders = await Order.find(filterQuery)
      .populate("order_userId", "usr_name usr_email usr_phone")
      .lean();
    const headers = [
      "Mã đơn hàng",
      "Người mua",
      "Email",
      "Số điện thoại",
      "Tổng tiền",
      "Giảm giá",
      "Phí vận chuyển",
      "Thành tiền",
      "Địa chỉ giao hàng",
      "Phương thức thanh toán",
      "Trạng thái",
      "Mã vận đơn",
      "Ngày tạo",
      "Ngày cập nhật",
    ];

    const rows = orders.map((order) => {
      const shippingAddress = order.order_shipping
        ? `${order.order_shipping.street}, ${order.order_shipping.city}, ${order.order_shipping.state}, ${order.order_shipping.country}`
        : "";

      const totalPrice = order.order_checkout?.totalPrice || 0;
      const discount = order.order_checkout?.totalApplyDiscount || 0;
      const feeShip = order.order_checkout?.feeShip || 0;
      const finalPrice = totalPrice - discount + feeShip;

      return [
        order.order_id,
        order.order_userId?.usr_name || "",
        order.order_userId?.usr_email || "",
        order.order_userId?.usr_phone || "",
        totalPrice,
        discount,
        feeShip,
        finalPrice,
        shippingAddress,
        order.order_payment?.paymentMethod || "",
        order.order_status,
        order.order_trackingNumber || "",
        new Date(order.createdAt).toLocaleString(),
        new Date(order.updatedAt).toLocaleString(),
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const statusSuffix = isValidStatus ? order_status : "all";
    const dateSuffix = new Date().toISOString().split("T")[0];

    return {
      filename: `orders_${statusSuffix}_${dateSuffix}.xlsx`,
      content: buffer,
    };
  } catch (error) {
    console.error("Error exporting orders:", error);
    throw error;
  }
};
const createCheckoutOnlineService = async ({
  shop_order_ids,
  cartId,
  userId,
  user_address,
  user_payment,
}) => {
  const embed_data = {
    user_address: JSON.stringify(user_address),
    user_payment: JSON.stringify(user_payment),
    cart_id: cartId,

    //sau khi hoàn tất thanh toán sẽ đi vào link này (thường là link web thanh toán thành công của mình)
    redirecturl: "http://localhost:3000/checkout/success",
  };
  const { shop_order_ids_new, checkout_order } = await checkoutReviewService({
    cartId,
    userId,
    shop_order_ids,
  });
  const transID = Math.floor(Math.random() * 1000000);
  const order = {
    app_id: config.app_id,
    app_trans_id: `${moment().format("YYMMDD")}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
    app_user: userId,
    app_time: Date.now(), // miliseconds
    item: JSON.stringify(shop_order_ids),
    embed_data: JSON.stringify(embed_data),
    amount: checkout_order?.totalPrice,
    user_fee_amount: checkout_order?.totalPrice,
    description: `Lazada - Payment for the order #${transID}`,
    bank_code: "",
    callback_url: process.env.NGROK_URL + "/v1/api/checkout/callback",
  };

  // appid|app_trans_id|appuser|amount|apptime|embeddata|item
  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;
  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const result = await axios.post(
      config.endpoint,
      null,
      { params: order },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return result.data;
  } catch (error) {
    console.log(error);
  }
};
const callbackZaloPayService = async ({ data, mac }) => {
  let result = {};
  try {
    let dataStr = data;
    let reqMac = mac;
    let macCrypto = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log({ dataStr, reqMac, macCrypto });
    if (reqMac !== macCrypto) {
      // callback không hợp lệ
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      // thanh toán thành công
      // merchant cập nhật trạng thái cho đơn hàng
      let dataJson = JSON.parse(dataStr, config.key2);
      const embed_data = JSON.parse(dataJson.embed_data);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson
      );
      const shop_order_ids = JSON.parse(dataJson.item);
      const cartId = embed_data.cart_id;
      const userId = dataJson.app_user;
      const { shop_order_ids_new, checkout_order } =
        await checkoutReviewService({
          cartId,
          userId,
          shop_order_ids,
        });
      const products = await shop_order_ids_new.flatMap((order) => {
        return order.item_products;
      });
      const acquireProduct = [];
      for (let i = 0; i < products.length; i++) {
        const { productId, quantity } = products[i];
        const keyLock = await acquireLock(productId, quantity, cartId);
        acquireProduct.push(keyLock ? true : false);
        if (keyLock) {
          await releaseLock(keyLock);
        }
      }
      // check neu co mot san pham het hang trong kho
      if (acquireProduct.includes(false)) {
        throw new BadRequestError(
          "Mot so san pham da duoc cap nhat, vui long quay lai gio hang..."
        );
      }
      const newOrder = await Order.create({
        order_userId: dataJson.app_user,
        order_id: randomString(),
        order_checkout: checkout_order,
        order_shipping: embed_data.user_address,
        order_payment: {
          paymentMethod: "Banking",
          paymentGateway: "ZaloPay",
          paymentToken: dataJson.merchant_user_id,
        },
        order_trackingNumber: dataJson.zp_trans_id,
        order_products: shop_order_ids_new,
        order_status: "pending",
      });
      if (newOrder) {
        // remove product in my cart
        await deleteUserCartService({
          userId,
          productId: shop_order_ids_new.flatMap((order) =>
            order.item_products.map((product) => product.productId)
          ),
        });
        await producer(JSON.stringify(newOrder), "orderQueue");
        // io.emit("order-requirement", newOrder);
      }
      result.return_code = 1;
      result.return_message = "success";
      result.data = newOrder;
    }
    return result;
  } catch (ex) {
    result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
    result.return_message = ex.message;
    console.log(ex);
  }
};
module.exports = {
  checkoutReviewService,
  orderByUserService,
  cancelOrderService,
  updateStatusOrderService,
  getOrderByUserService,
  getDetailOrderService,
  exportOrderToCSVService,
  createCheckoutOnlineService,
  callbackZaloPayService,
  getOrderForAdminService,
};
