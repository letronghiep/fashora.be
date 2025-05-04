const _ = require("lodash");
const { Types } = require("mongoose");

const getInfoData = ({ field = [], object = {} }) => {
  return _.omit(object, field);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};
const convertToObjMongo = (id) => new Types.ObjectId(id);
const getUnSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};
const randomUserId = () => {
  return Math.floor(Math.random() * 89999 + 10000);
};
const randomCategoryId = () => {
  return Math.floor(Math.random() * 89999 + 10000);
};
const randomProductId = () => {
  return Math.floor(Math.random() * 899999 + 100000);
};
const randomShippingId = () => {
  return Math.floor(Math.random() * 899999 + 100000);
};
const randomFlashSaleId = () => {
  return "fs_" + Math.floor(Math.random() * 8999 + 1000);
};
const randomBannerId = () => {
  return "bn_" + Math.floor(Math.random() * 8999 + 1000);
};
function randomString() {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result.toUpperCase();
}
function splitMessagesNatural(text) {
  // 1. Cắt theo dấu xuống dòng hoặc xuống dòng + khoảng trắng
  const roughSplits = text.split(/\n|\r/).map(line => line.trim()).filter(line => line.length > 0);

  const messages = [];
  let tempBuffer = '';

  roughSplits.forEach(line => {
    // Nếu dòng là tiêu đề mục (bắt đầu bằng **số.)
    if (/^\*\*\d\./.test(line)) {
      if (tempBuffer) {
        messages.push(tempBuffer.trim());
        tempBuffer = '';
      }
      messages.push(line.trim());
    }
    // Nếu dòng là câu hỏi hoặc bullet point (*)
    else if (/^\*/.test(line)) {
      if (tempBuffer) {
        messages.push(tempBuffer.trim());
        tempBuffer = '';
      }
      messages.push(line.trim());
    }
    // Nếu là dòng nội dung, cộng dồn cho đủ dài rồi mới gửi
    else {
      tempBuffer += ' ' + line;
      if (tempBuffer.length > 150) { // Nếu buffer dài quá 150 ký tự thì cắt ra
        messages.push(tempBuffer.trim());
        tempBuffer = '';
      }
    }
  });

  if (tempBuffer) {
    messages.push(tempBuffer.trim());
  }

  return messages;
}
module.exports = {
  getInfoData,
  getSelectData,
  convertToObjMongo,
  getUnSelectData,
  randomUserId,
  randomCategoryId,
  randomProductId,
  randomShippingId,
  randomString,
  randomFlashSaleId,
  randomBannerId,
  splitMessagesNatural
};
