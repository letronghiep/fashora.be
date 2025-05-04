"use strict";
const { SuccessResponse } = require("../core/success.response");
const {
  listNotifyByUserService,
  updateReadNotifyService,
  countNotificationService,
} = require("../services/notification.service");
const listNotifyByUser = async (req, res, next) => {
  new SuccessResponse({
    message: "list listNotifyByUser",
    metadata: await listNotifyByUserService({
      userId: req.query.user_id,
      isAll: req.query.isAll,
      isRead: req.query.isRead,

    }),
  }).send(res);
};
const updateReadNotification = async (req, res, next) => {
  new SuccessResponse({
    message: "update read notification",
    metadata: await updateReadNotifyService({
      notify_id: req.params.notify_id,
      receiverId: req.user.userId,
    }),
  }).send(res);
};
const countNotifications = async(req, res,next) => {
  new SuccessResponse({
    message: "count notifications",
    metadata: await countNotificationService({
      receiverId: req.user.userId,
      isRead: req.query.isRead,
    }),
  }).send(res);
}
module.exports = {
  listNotifyByUser,
  updateReadNotification,
  countNotifications
};
