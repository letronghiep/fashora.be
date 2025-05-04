"use strict";
const { SuccessResponse } = require("../core/success.response");
const {
  uploadImageFromUrl,
  uploadImageFromLocalFiles,
  uploadImageFromLocalFile,
} = require("../services/upload.service");

const uploadFile = async (req, res, next) => {
  new SuccessResponse({
    message: "File uploaded successfully",
    metadata: await uploadImageFromUrl({
      url: req.body,
      filename: req.file.filename,
      shopId: req.user.userId,
      folderName: "products",
    }),
  }).send(res);
};
const uploadImgFromLocal = async (req, res, next) => {
  new SuccessResponse({
    message: "File uploaded successfully",
    metadata: await uploadImageFromLocalFile({
      file: req.file,
    }),
  }).send(res);
};
const uploadMultipleFile = async (req, res, next) => {
  new SuccessResponse({
    message: "Files uploaded successfully",
    metadata: await uploadImageFromLocalFiles({
      files: req.files,
    }),
  }).send(res);
}
module.exports = {
  uploadFile,
  uploadImgFromLocal,
  uploadMultipleFile
};
