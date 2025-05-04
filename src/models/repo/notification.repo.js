"use strict";

const { getDetailUser } = require("./user.repo");

const generateNotification = async (key, data) => {
  const getUser = await getDetailUser({ user_id: data.user_id });
  if (!getUser) throw new Error("User not found");
  switch (key) {
    case "shipping.created":
      return `Địa chỉ ${data.shipping_id} đã được ${getUser.usr_full_name} tạo`;
    case "shipping.updated":
        if (data.is_delivery_address)
            return `Địa chỉ ${data.shipping_id} đã đươc ${getUser.usr_full_name} thay đổi thành địa chỉ giao hàng`;
        else if (data.is_return_address)
            return `Địa chỉ ${data.shipping_id} đã được ${getUser.usr_full_name} thay đổi thành địa chỉ trả hàng`;
        else
            return `Địa chỉ ${data.shipping_id} đã được người dùng ${getUser.usr_full_name} cập nhật`;
    case "shipping.deleted":
      return `Địa chỉ ${data.shipping_id} đã được ${getUser.usr_full_name} xóa `;
    default:
      return "";
  }
};

module.exports = {
  generateNotification,
};
