const { SuccessResponse } = require("../core/success.response");
const {
  createInventoryTransactionService,
} = require("../services/inventoryTransaction.service");
// const getInventoryTransactions = async (req, res, next) => {
//   try {
//     const transactions = await InventoryTransaction.find().populate("transaction_productId").populate("transaction_shopId").populate("transaction_userId");
//     new SuccessResponse({
//       message: "Fetched inventory transactions successfully",
//       metadata: transactions,
//     }).send(res);
//   } catch (error) {
//     next(error);
//   }
// };

const createInventoryTransaction = async (req, res, next) => {
  try {
    if (req.body && req.body.length) {
      const results = [];
      for (const transaction of req.body) {
        const metadata = await createInventoryTransactionService({
          transaction_shopId: req.user.userId,
          transaction_userId: req.user.userId,
          transaction_productId: transaction.transaction_productId,
          transaction_type: transaction.transaction_type,
          transaction_quantity: transaction.transaction_quantity,
          transaction_note: transaction.note,
          transaction_skuId: transaction.transaction_skuId,
        });
        results.push(metadata);
      }

      return new SuccessResponse({
        message: "Created inventory transactions successfully",
        metadata: results,
      }).send(res);
    } else {
      return new SuccessResponse({
        message: "No transactions to process",
        metadata: [],
      }).send(res);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  //   getInventoryTransactions,
  createInventoryTransaction,
};
