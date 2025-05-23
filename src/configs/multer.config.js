"use strict";
const multer = require("multer");

const uploadMemory = multer({
  storage: multer.memoryStorage(),
});

const uploadDisk = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./src/uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

module.exports = {
  uploadMemory,
  uploadDisk,
};
