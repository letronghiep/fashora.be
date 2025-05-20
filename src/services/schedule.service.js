const cron = require("node-cron");
const Product = require("../models/product.model");
const FlashSale = require("../models/flashsale.model");
const User = require("../models/user.model");
const Discount = require("../models/discount.model");
const Notification = require("../models/notification.model");
const SKU = require("../models/sku.model");
const { producer } = require("./rabbitMQ.service");
const { sendMail } = require("./nodemailer.service");

class ScheduleService {
  constructor() {
    this.initSchedules();
  }

  initSchedules() {
    // Chạy mỗi phút để kiểm tra các flashsale cần được kích hoạt
    cron.schedule("* * * * *", async () => {
      try {
        await this.updateFlashSalePrices();
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
          content: `Fashora chúc quý khách sinh nhật vui vẻ, Chúc mừng sinh nhật ${
            user.usr_full_name
          }. Fashora gửi tặng bạn 1 voucher giảm giá 10% đối với tất cả sản phẩm (áp dụng đến hết ngày ${voucherEndDate.toLocaleDateString(
            "vi-VN"
          )})`,
          type: "birthday",
          is_read: false,
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

    // Tìm các flashsale đang bắt đầu
    const activeFlashSales = await FlashSale.find({
      start_time: { $lte: now },
      end_time: { $gt: now },
      status: "scheduled",
      isApproved: true,
    });

    for (const flashSale of activeFlashSales) {
      try {
        // Cập nhật giá và thông tin flashsale cho từng sản phẩm
        for (const product of flashSale.products) {
          await SKU.findOneAndUpdate(
            { sku_id: product.sku_id },
            {
              $set: {
                sku_price_sale: product.sale_price,
              },
            }
          );
          const foundProduct = await Product.findOne({
            _id: product.product_id,
          });
          if (foundProduct) {
            const foundModel = foundProduct.product_models.find(
              (model) => model.sku_id === product.sku_id
            );
            if (foundModel) {
              foundModel.sku_price_sale = product.sale_price;
            }
          }
          await foundProduct.save();
        }
        await FlashSale.findByIdAndUpdate(flashSale._id, {
          status: "ongoing",
        });
        console.log(`Flash sale ${flashSale.id} has been activated`);
      } catch (error) {
        console.error(`Error activating flash sale ${flashSale.id}:`, error);
      }
    }

    // Kiểm tra và cập nhật các flashsale đã kết thúc
    const endedFlashSales = await FlashSale.find({
      end_time: { $lt: now },
      status: "ongoing",
    });

    for (const flashSale of endedFlashSales) {
      try {
        // Reset thông tin flashsale cho các sản phẩm
        for (const product of flashSale.products) {
          await Product.findOneAndUpdate(
            { id: product.product_id },
            {
              $set: {
                is_flash_sale: false,
                flash_sale_price: null,
                flash_sale_stock: null,
                flash_sale_limit: null,
                flash_sale_sold: null,
                flash_sale_id: null,
              },
            }
          );
        }

        // Cập nhật trạng thái flashsale
        await FlashSale.findByIdAndUpdate(flashSale._id, {
          status: "ended",
        });

        console.log(`Flash sale ${flashSale.id} has ended`);
      } catch (error) {
        console.error(`Error ending flash sale ${flashSale.id}:`, error);
      }
    }
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
}

module.exports = new ScheduleService();
