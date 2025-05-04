"use strict";
const RedisPubsub = require("./redisPubsub.service");
const { getAdmin } = require("../models/repo/user.repo");
const { shippingConfig } = require("../configs/event.config");
const Notification = require("../models/notification.model");
const { generateNotification } = require("../models/repo/notification.repo");
const redisPubsub = new RedisPubsub();
const { getIO } = require("../db/init.socket");
const io = getIO();
module.exports = {
  listenRedis: async () => {
    const adminId = await getAdmin();

    const handleEvent = async (event, message) => {
      try {
        const data = await JSON.parse(message);
        const notifyContent = await generateNotification(event, data);
        await Notification.create({
          notify_type: event,
          notify_content: notifyContent,
          notify_senderId: adminId,
          notify_receiverId: data.user_id,
          notify_options: data,
        });
        io.emit(event, data);
      } catch (error) {
        console.error(error);
      }
    };
    Object.keys(shippingConfig).forEach((key) => {
      const { event } = shippingConfig[key];
      redisPubsub.subscribe(event, (channel, message) => {
        handleEvent(event, message);
      });
    });
  },
};
