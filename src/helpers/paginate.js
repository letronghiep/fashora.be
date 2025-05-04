"use strict";
const { getSelectData } = require("../utils/index");
const paginate = async ({
  model,
  filter,
  page=1,
  limit = 50,
  select,
  sort,
  populate,
}) => {
  try {
    const skip = (page - 1) * limit;
    let sortBy = { createdAt: -1 }; // mặc định sort theo ngày tạo mới nhất

    // Xử lý sort theo các trạng thái
    switch(sort) {
      case 'confirmed_date_asc': // Ngày xác nhận (Xa - Gần)
        sortBy = { 'updatedAt': 1, 'createdAt': 1 };
        break;
      case 'confirmed_date_desc': // Ngày xác nhận (Gần - Xa)
        sortBy = { 'updatedAt': -1, 'createdAt': -1 };
        break;
      case 'create_date_asc': // Ngày tạo đơn (Xa - Gần)
        sortBy = { 'createdAt': 1 };
        break;
      case 'create_date_desc': // Ngày tạo đơn (Gần - Xa)
        sortBy = { 'createdAt': -1 };
        break;
      case 'ctime':
        sortBy = { 'createdAt': -1 };
        break;
    }

    const totalRows = await model.countDocuments(filter);
    const totalPages = Math.ceil(totalRows / limit);
    const data = await model
      .find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .select(getSelectData(select))
      .populate(populate)
      .lean();
    return {
      limit,
      currentPage: page,
      totalRows,
      totalPages,
      data,
    };
  } catch (error) {
    console.log("Xảy ra lỗi trong quá trình phân trang::", error);
  }
};

// search
// const search = async({}) => {

// }

module.exports = {
  paginate,
};
