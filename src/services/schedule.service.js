const cron = require("node-cron");
const Product = require("../models/product.model");
const FlashSale = require("../models/flashsale.model");
const User = require("../models/user.model");
const Discount = require("../models/discount.model");
const Notification = require("../models/notification.model");
const SKU = require("../models/sku.model");
const { producer } = require("./rabbitMQ.service");
const { sendMail } = require("./nodemailer.service");
const Banner = require("../models/banner.model");
const { randomFlashSaleId } = require("../utils");
const { Types } = require("mongoose");

class ScheduleService {
  constructor() {
    this.initSchedules();
  }

  initSchedules() {
    // Chạy mỗi phút để kiểm tra các flashsale cần được kích hoạt
    cron.schedule("* * * * *", async () => {
      try {
        await this.updateFlashSalePrices();
        await this.updateExpiredDiscounts();
        await this.updateActiveDiscounts();
      } catch (error) {
        console.error("Error updating flash sale prices:", error);
      }
    });

    // Chạy mỗi ngày lúc 00:00 để kiểm tra sinh nhật (0 0 * * *)
    cron.schedule("0 0 * * *", async () => {
      // moi gio 1 lan
      try {
        await this.checkBirthdays();
        await this.updateDiscountStatus();
      } catch (error) {
        console.error("Error checking birthdays:", error);
      }
    });
  }

  async checkBirthdays() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Tháng hiện tại (1-12)
    const currentDay = today.getDate(); // Ngày hiện tại

    // Tìm tất cả user có sinh nhật hôm nay
    const birthdayUsers = await User.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$usr_date_of_birth" }, currentMonth] },
          { $eq: [{ $dayOfMonth: "$usr_date_of_birth" }, currentDay] },
        ],
      },
      usr_status: "active", // Chỉ gửi cho user đang hoạt động
    });
    for (const user of birthdayUsers) {
      try {
        // Tạo voucher giảm giá 10%
        const voucherEndDate = new Date(today);
        voucherEndDate.setHours(23, 59, 59, 999); // Hết ngày hôm nay

        const voucher = await Discount.create({
          discount_name: `Voucher sinh nhật - ${user.usr_full_name}`,
          discount_description:
            "Voucher sinh nhật - Giảm 10% cho tất cả sản phẩm",
          discount_type: "percentage",
          discount_value: 10,
          discount_code: `BIRTHDAY_${user.usr_id}_${Date.now()}`,
          discount_start_date: today,
          discount_end_date: voucherEndDate,
          discount_max_uses: 1,
          discount_uses_count: 0,
          discount_users_used: [user.usr_id],
          discount_max_uses_per_user: 1,
          discount_min_order_value: 0,
          discount_max_value: null,
          discount_shopId: "675c6f050288fb66c0edfb0d", // Voucher sinh nhật áp dụng cho tất cả shop
          discount_is_active: true,
          discount_applies_to: "all",
          discount_product_ids: [],
          discount_status: "active",
          discount_user_id: user._id, // ID của user được tặng voucher
        });

        // Tạo thông báo chúc mừng sinh nhật
        const notification = await Notification.create({
          user_id: user._id,
          title: "Chúc mừng sinh nhật!",
          notify_content: `Fashora chúc quý khách sinh nhật vui vẻ, Chúc mừng sinh nhật ${
            user.usr_full_name
          }. Fashora gửi tặng bạn 1 voucher giảm giá 10% đối với tất cả sản phẩm (áp dụng đến hết ngày ${voucherEndDate.toLocaleDateString(
            "vi-VN"
          )})`,
          type: "birthday",
          is_read: false,
          notify_receiverId: user._id,
          notify_senderId: "675c6f050288fb66c0edfb0d",
          notify_type: "birthday",
          notify_status: "active",
          notify_createdAt: today,
          notify_updatedAt: today,
        });
        // gui mail chuc mung sinh nhat
        await sendMail({
          to: user.usr_email,
          subject: "Chúc mừng sinh nhật!",
          text: "Chúc mừng sinh nhật!",
          html: `<p>Fashora chúc mừng sinh nhật quý khách, Chúc quý khách ${
            user.usr_full_name
          } có một sinh nhật vui vẻ. Fashora gửi tặng bạn 1 voucher giảm giá 10% đối với tất cả sản phẩm (áp dụng đến hết ngày ${voucherEndDate.toLocaleDateString(
            "vi-VN"
          )})</p>`,
        });

        // console.log(
        //   `Created birthday voucher and notification for user ${user.usr_id}`
        // );
      } catch (error) {
        console.error(
          `Error creating birthday voucher for user ${user.usr_id}:`,
          error
        );
      }
    }
  }

  async updateFlashSalePrices() {
    const now = new Date();

    try {
      // Xử lý các flashsale đang bắt đầu
      await this.handleActiveFlashSales(now);

      // Xử lý các flashsale đã kết thúc
      await this.handleEndedFlashSales(now);
    } catch (error) {
      console.error("Error in updateFlashSalePrices:", error);
    }
  }

  async handleActiveFlashSales(now) {
    const activeFlashSales = await FlashSale.find({
      start_time: { $lte: now },
      end_time: { $gt: now },
      status: "scheduled",
      isApproved: true,
    });

    await Promise.all(
      activeFlashSales.map(async (flashSale) => {
        try {
          await this.activateFlashSale(flashSale);
        } catch (error) {
          console.error(`Error activating flash sale ${flashSale.id}:`, error);
        }
      })
    );
  }

  async handleEndedFlashSales(now) {
    const endedFlashSales = await FlashSale.find({
      end_time: { $lt: now },
      status: "ongoing",
    });

    await Promise.all(
      endedFlashSales.map(async (flashSale) => {
        try {
          await this.deactivateFlashSale(flashSale);
        } catch (error) {
          console.error(`Error ending flash sale ${flashSale.id}:`, error);
        }
      })
    );
  }

  async activateFlashSale(flashSale) {
    // Cập nhật thông tin cho tất cả sản phẩm trong flashsale
    await Promise.all(
      flashSale.products.map(async (product) => {
        await this.updateProductFlashSaleInfo(product, flashSale, true);
      })
    );

    // Cập nhật trạng thái flashsale
    await FlashSale.findByIdAndUpdate(flashSale._id, {
      status: "ongoing",
    });
    await Banner.create({
      id: flashSale.id,
      title: flashSale.name,
      thumb: flashSale.thumb,
      linkTo: flashSale.id,
      isActive: true,
      startDate: flashSale.start_time,
      endDate: flashSale.end_time,
    });
    console.log(`Flash sale ${flashSale.id} has been activated`);
  }

  async deactivateFlashSale(flashSale) {
    // Reset thông tin cho tất cả sản phẩm trong flashsale
    await Promise.all(
      flashSale.products.map(async (product) => {
        await this.updateProductFlashSaleInfo(product, flashSale, false);
      })
    );

    // Cập nhật trạng thái flashsale
    await FlashSale.findByIdAndUpdate(flashSale._id, {
      status: "ended",
    });
    await Banner.findOneAndUpdate(
      {
        id: flashSale.id,
      },
      {
        isActive: false,
      }
    );
    console.log(`Flash sale ${flashSale.id} has ended`);
  }

  async updateProductFlashSaleInfo(product, flashSale, isActivating) {
    // Cập nhật thông tin SKU
    await this.updateSKUFlashSaleInfo(product, flashSale, isActivating);

    // Cập nhật thông tin Product
    await this.updateProductModelFlashSaleInfo(
      product,
      flashSale,
      isActivating
    );
  }

  async updateSKUFlashSaleInfo(product, flashSale, isActivating) {
    const updateData = isActivating
      ? {
          sku_price_sale: product.sale_price,
        }
      : {
          sku_price_sale: 0,
        };

    await SKU.findOneAndUpdate(
      { sku_id: product.sku_id },
      { $set: updateData }
    );
  }

  async updateProductModelFlashSaleInfo(product, flashSale, isActivating) {
    const foundProduct = await Product.findOne({
      _id: new Types.ObjectId(product.product_id),
    });

    if (!foundProduct) return;
    await Product.updateOne(
      { _id: product.product_id, "product_models.sku_id": product.sku_id },
      {
        $set: {
          product_seller: product.sale_price,
          "product_models.$.sku_price_sale": isActivating
            ? product.sale_price
            : 0,
          is_flash_sale: isActivating,
          flash_sale_id: isActivating ? flashSale.id : null,
          flash_sale_name: isActivating ? flashSale.name : null,
          flash_sale_thumb: isActivating ? flashSale.thumb : null,
          flash_sale_start_time: isActivating ? flashSale.start_time : null,
          flash_sale_end_time: isActivating ? flashSale.end_time : null,
        },
      }
    );
  }

  async updateDiscountStatus() {
    const now = new Date();
    const expiredDiscounts = await Discount.find({
      discount_end_date: { $lt: now },
      discount_status: "active",
    });
    console.log(expiredDiscounts);
    await Discount.updateMany(
      { _id: { $in: expiredDiscounts.map((discount) => discount._id) } },
      { discount_status: "expired" }
    );
    // for (const discount of expiredDiscounts) {
    //   await Discount.findByIdAndUpdate(discount._id, {
    //     discount_status: "expired",
    //   });
    // }
    console.log(`Updated ${expiredDiscounts.length} expired discounts`);
  }
  async updateFlashSaleSold(productId, quantity) {
    const activeFlashSale = await FlashSale.findOne({
      products: { $elemMatch: { productId: productId } },
      status: "ongoing",
    });

    if (activeFlashSale) {
      const productInFlashSale = activeFlashSale.products.find(
        (product) => product.product_id.toString() === productId.toString()
      );

      if (productInFlashSale) {
        productInFlashSale.sold += quantity;
        await activeFlashSale.save();
      }
    }
  }
  // update expired discount
  async updateExpiredDiscounts() {
    const now = new Date();
    const expiredDiscounts = await Discount.find({
      discount_end_date: { $lt: now },
      discount_status: "active",
    });
    if (!expiredDiscounts) return;
    await Discount.updateMany(
      { _id: { $in: expiredDiscounts.map((discount) => discount._id) } },
      { discount_status: "expired" }
    );
    console.log(`Updated ${expiredDiscounts.length} expired discounts`);
  }
  async updateActiveDiscounts() {
    const now = new Date();
    const expiredDiscounts = await Discount.find({
      discount_start_date: { $lt: now },
      discount_status: "pending",
    });
    if (!expiredDiscounts) return;
    await Discount.updateMany(
      { _id: { $in: expiredDiscounts.map((discount) => discount._id) } },
      { discount_status: "active" }
    );
    console.log(`Updated ${expiredDiscounts.length} expired discounts`);
  }
}

module.exports = new ScheduleService();
