const { CACHE_ADMIN } = require("../../configs/constant");
const User = require("../user.model");
// const {}
const _ = require("lodash");
const { getCacheIO, setCacheIOExpiration } = require("./cache.repo");
const { paginate } = require("../../helpers/paginate");
const getListUser = async ({ limit, sort, page, filter }) => {
  const skip = (page - 1) * limit;
  const sortBy = sort === "ctime" ? { _id: -1 } : { _id: 1 };
  const users = await paginate({
    model: User,
    filter,
    page,
    limit,
    sort: sortBy,
  });

  return users;
};
const getDetailUser = async ({ user_id }) => {
  const foundUser = await User.findOne({
    _id: user_id,
  });
  return _.omit(foundUser, ["__v", "createdAt", "updatedAt"]);
};
const findOneUser = async (filter) => {
  return await User.findOne(filter);
};
const getAdmin = async () => {
  const cacheAdmin = `${CACHE_ADMIN.ADMIN}`;
  let idAdmin = await getCacheIO({ key: cacheAdmin });
  if (idAdmin) {
    return JSON.parse(idAdmin);
  } else {
    const admin = await User.findOne({ usr_id: 0 });
    if (admin) {
      await setCacheIOExpiration({
        key: cacheAdmin,
        value: JSON.stringify(admin._id),
        expirationInSecond: 3600,
      });
      return admin._id;
    } else return null;
  }
};
module.exports = {
  getListUser,
  findOneUser,
  getDetailUser,
  getAdmin,
};
