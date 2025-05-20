"use strict";

const InventoryTransaction = require("../models/inventory_transaction.model");
const { addStockToInventory } = require("./inventory.service");
const { NotFoundError } = require("../core/error.response");
const Product = require("../models/product.model");
const Sku = require("../models/sku.model");
const { Types, default: mongoose } = require("mongoose");
const createInventoryTransactionService = async ({
  transaction_shopId,
  transaction_userId,
  transaction_productId,
  transaction_type,
  transaction_quantity,
  transaction_note,
  transaction_skuId,
}) => {
  // Kiểm tra loại giao dịch
  if (!["import", "sold", "created"].includes(transaction_type)) {
    throw new Error("Loại giao dịch không hợp lệ");
  }

  // Cập nhật kho hàng dựa trên loại giao dịch
  let stockChange = 0;
  if (transaction_type === "import" || transaction_type === "created") {
    stockChange = transaction_quantity;
  } else if (transaction_type === "sold") {
    stockChange = -transaction_quantity;
  }
  try {
    // update Inventory
    const updatedInventory = await addStockToInventory({
      stock: stockChange,
      productId: transaction_productId,
      shopId: transaction_shopId,
      skuId: transaction_skuId,
    });
    if (!updatedInventory) {
      throw new Error("Không thể cập nhật kho hàng");
    }
    // update Product quantity
    await Product.findOneAndUpdate(
      {
        _id: new Types.ObjectId(transaction_productId),
        "product_models.sku_id": transaction_skuId,
      },
      {
        $inc: {
          product_sold: -stockChange,
          product_quantity: transaction_type === "created" ? 0 : stockChange,
          "product_models.$.sku_stock":
            transaction_type === "created" ? 0 : stockChange,
        },
      }
    );
    // update sku
    if (transaction_skuId) {
      await Sku.updateOne(
        {
          sku_id: transaction_skuId,
          product_id: transaction_productId,
        },
        {
          $inc: {
            sku_stock: transaction_type === "created" ? 0 : stockChange,
          },
        },
        {
          upsert: true,
          new: true,
        }
      );
    }
    // create inventory transaction
    const newInventoryTransaction = new InventoryTransaction({
      transaction_shopId,
      transaction_userId,
      transaction_productId,
      transaction_type,
      transaction_quantity,
      transaction_note,
      transaction_skuId,
    });

    await newInventoryTransaction.save();
    // await session.commitTransaction();
    // session.endSession();
    return newInventoryTransaction;
  } catch (error) {
    // await session.abortTransaction();
    throw error;
  } finally {
    // await session.endSession();
  }
};

module.exports = {
  createInventoryTransactionService,
};
