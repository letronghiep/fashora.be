"use strict";
const { getUnSelectData, getSelectData } = require("../../utils");

const Discount = require("../discount.model");
const findAllDiscountSelect = async ({
  filter,
  limit = 10,
  sort,
  page = 1,
  select,
}) => {
  const sortBy = sort === "ctime" ? { _id: -1 } : { id: 1 };
  const skip = (page - 1) * limit;
  return await Discount.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean();
};

async function findAllDiscountUnSelect({
  limit,
  sort,
  page,
  filter,
  unSelect,
  model,
}) {
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const skip = (page - 1) * limit;
  return await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getUnSelectData(unSelect))
    .lean();
}
const checkDiscountExists = async ({ filter }) => {
  return await Discount.findOne(filter).lean();
};
module.exports = {
  findAllDiscountSelect,
  findAllDiscountUnSelect,
  checkDiscountExists,
};
