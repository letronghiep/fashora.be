"use strict";

const express = require("express");
const router = express.Router();

const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const {
  listNotifyByUser,
  updateReadNotification,
  countNotifications,
} = require("../../controllers/notification.controller");
router.use(authentication);
router.get("/", asyncHandler(listNotifyByUser));
router.patch("/:notify_id", asyncHandler(updateReadNotification));
router.get("/count", asyncHandler(countNotifications));
module.exports = router;
