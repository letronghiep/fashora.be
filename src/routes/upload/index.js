"use strict";
const express = require("express");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../middlewares/authentication");
const {
  uploadFile,
  uploadImgFromLocal,
  uploadMultipleFile,
} = require("../../controllers/upload.controller");
const { uploadDisk } = require("../../configs/multer.config");
const router = express.Router();

// router.use(authentication);
router.post(
  "/avatar",
  uploadDisk.single("file"),
  asyncHandler(uploadImgFromLocal)
);
router.post("/product", asyncHandler(uploadFile));
router.post(
  "/multiple",
  uploadDisk.array("files", 8),
  asyncHandler(uploadMultipleFile)
);
module.exports = router;
