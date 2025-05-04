"use strict";
const { Types } = require("mongoose");
const Notification = require("../models/notification.model");
const { NotFoundError, BadRequestError } = require("../core/error.response");
const { getIO } = require("../db/init.socket");
const io = getIO();
const pushNotifyToSystem = async ({
  type = "SHOP-001",
  receiverId,
  senderId,
  notify_content,
  options = {},
}) => {
  // let notify_content;
  // switch (type) {
  //   case "SHOP-001":
  //     notify_content = `@@@ vừa thêm một sản phẩm mới @@@@`;
  //     break;
  //   case "PROMOTION-001":
  //     notify_content = `@@@ vừa thêm một voucher mới @@@@`;
  //     break;
  //   default:
  //     notify_content = `@@@ Loại thông báo không xác định @@@@`;
  // }
  const newNotify = await Notification.create({
    notify_type: type,
    notify_content: notify_content,
    notify_receiverId: receiverId,
    notify_senderId: senderId,
    notify_options: options,
  });
  return newNotify;
};
const listNotifyByUserService = async ({ userId, isAll, isRead }) => {
  let match;
  if (isAll == "true") {
    match = {
      notify_receiverId: new Types.ObjectId(userId),
    };
  } else {
    match = {
      notify_receiverId: new Types.ObjectId(userId),
      notify_isRead: isRead,
    };
  }
  const result = await Notification.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        notify_type: 1,
        notify_senderId: 1,
        notify_receiverId: 1,
        notify_content: 1,
        notify_isRead: 1,
        createdAt: 1,
        notify_options: 1,
        count_not_read: 1,
      },
    },
  ]).sort({ createdAt: -1 });
  return result;
  
};
const updateReadNotifyService = async ({ notify_id, receiverId }) => {
  const notification = await Notification.findOne({
    _id: new Types.ObjectId(notify_id),
    notify_receiverId: new Types.ObjectId(receiverId),
    notify_isRead: false,
  });
  if (!notification) {
    throw new NotFoundError("Thông báo không tồn tại");
  }
  const notifyUpdated = await notification.updateOne(
    {
      notify_isRead: true,
    },
    {
      new: true,
      upsert: true,
    }
  );
  if (!notifyUpdated) {
    throw new BadRequestError("Cập nhật thông báo thất bại");
  }
  await io.emit("read:notification", "1");
  return notifyUpdated;
};
const countNotificationService = async ({ receiverId, isRead }) => {
  const count = await Notification.countDocuments({
    notify_receiverId: new Types.ObjectId(receiverId),
    notify_isRead: isRead,
  });
  return count;
};
module.exports = {
  pushNotifyToSystem,
  listNotifyByUserService,
  updateReadNotifyService,
  countNotificationService,
};
