"use strict";

const { Types } = require("mongoose");
const Order = require("../order.model");
const SKU = require("../sku.model");
const Product = require("../product.model");
const PageView = require("../pageview.model");
const { createObjectCsvWriter } = require("csv-writer");
const path = require("path");
const fs = require("fs");

class AnalysisRepo {
  getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= new Date(endDate)) {
      dates.push(currentDate.toLocaleDateString("en-CA"));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  getDateRange = (type, startDate, endDate) => {
    const today = new Date();

    switch (type) {
      case "today":
        const endDate = new Date();
        today.setDate(today.getDate() - 1);
        today.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return {
          start: today,
          end: endDate,
        };
      case "yesterday":
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(23, 59, 59, 999);
        return {
          start: dayBeforeYesterday,
          end: yesterday,
        };
      case "week":
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - 6);
        const endOfWeek = new Date();
        endOfWeek.setHours(23, 59, 59, 999);
        return {
          start: startOfWeek,
          end: endOfWeek,
        };
      case "month":
        const startOfMonth = new Date(today);
        startOfMonth.setDate(startOfMonth.getDate() - 29);
        const endOfMonth = new Date(today);
        endOfMonth.setHours(23, 59, 59, 999);
        return {
          start: startOfMonth,
          end: endOfMonth,
        };
      case "specific-date":
        return {
          start: new Date(startDate),
          end: new Date(endDate),
        };
      default:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  };

  getOrderData = async (start, end) => {
    return await Order.aggregate([
      {
        $match: {
          //   order_userId: new Types.ObjectId(userId),
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  };

  getRevenueData = async (start, end) => {
    const revenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start,
            $lte: end,
          },
          order_status: {
            $in: [
              "confirmed",
              "processing",
              "packed",
              "delivering",
              "shipped",
              "completed",
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: "$order_checkout.totalPrice" },
          total_order: { $sum: 1 },
          total_fee_ship: { $sum: "$order_checkout.feeShip" },
          total_discount: { $sum: "$order_checkout.totalDiscount" },
          total_price: { $sum: "$order_checkout.totalPrice" },
        },
      },
    ]);

    const daily = await this.getDailySalesData(start, end);
    const total_order = await Order.countDocuments({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    return {
      daily,
      revenue: revenue[0]?.revenue || 0,
      total_order: revenue[0]?.total_order || 0,
      total_order_count: total_order,
      date_range: {
        start,
        end,
      },
    };
  };

  getDailySalesData = async (start, end) => {
    try {
      const daily = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lte: end,
            },
            order_status: {
              $in: [
                "confirmed",
                "processing",
                "packed",
                "delivering",
                "shipped",
                "completed",
              ],
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$order_checkout.totalPrice" },
            order: { $sum: 1 },
            total_fee_ship: { $sum: "$order_checkout.feeShip" },
            total_discount: { $sum: "$order_checkout.totalDiscount" },
            total_price: { $sum: "$order_checkout.totalPrice" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      const dateArray = this.getDatesInRange(start, end);

      return dateArray.map((date) => {
        const foundData = daily.find((item) => item._id === date);
        return {
          date,
          revenue: foundData?.revenue || 0,
          order: foundData?.order || 0,
        };
      });
    } catch (error) {
      console.error("Error fetching daily sales data:", error);
      return [];
    }
  };

  getLowSaleSku = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await SKU.aggregate([
      {
        $lookup: {
          from: "orders",
          let: { skuId: "$sku_id" },
          pipeline: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
                order_status: {
                  $nin: ["cancelled", "pending", "failed", "refunded"],
                },
              },
            },
            {
              $unwind: "$order_products",
            },
            { $unwind: "$order_products.item_products" },
            {
              $match: {
                $expr: {
                  $eq: ["$order_products.item_products.skuId", "$$skuId"],
                },
              },
            },
            {
              $project: {
                quantity: "$order_products.item_products.quantity",
              },
            },
          ],
          as: "recentSales",
        },
      },
      {
        $addFields: {
          oldSaleCount: { $size: "$recentSales" },
          totalQuantitySold: {
            $sum: "$recentSales.quantity",
          },
        },
      },
      {
        $match: {
          oldSaleCount: { $lte: 3 },
          sku_status: "published",
          $expr: {
            $or: [
              { $eq: ["$sku_price_sale", 0] },
              { $eq: ["$sku_price_sale", "$sku_price"] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "inventories",
          localField: "sku_id",
          foreignField: "inven_skuId",
          as: "inventory",
        },
      },
      {
        $unwind: "$inventory",
      },
      {
        $project: {
          skuId: "$sku_id",
          product_name: "$product.product_name",
          attributes: {
            color: {
              $arrayElemAt: [
                "$product.product_variations.0.options",
                { $arrayElemAt: ["$sku_tier_idx", 0] },
              ],
            },
            size: {
              $arrayElemAt: [
                "$product.product_variations.1.options",
                { $arrayElemAt: ["$sku_tier_idx", 1] },
              ],
            },
          },
          product_quantity: "$inventory.inven_stock",
          oldSaleCount: 1,
          totalQuantitySold: 1,
          stockValue: {
            $multiply: [
              { $ifNull: ["$inventory.inven_stock", 0] },
              { $ifNull: [{ $toDouble: "$sku_price" }, 0] },
            ],
          },
          product_price: "$sku_price",
          sku_name: "$sku_name",
        },
      },
      {
        $sort: { totalQuantitySold: -1 },
      },
      {
        $limit: 10,
      },
    ]);
  };

  getTopSellingSku = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await SKU.aggregate([
      {
        $lookup: {
          from: "orders",
          let: {
            skuId: "$sku_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ["$createdAt", thirtyDaysAgo] },
                    {
                      $not: {
                        $in: [
                          "$order_status",
                          [
                            "pending",
                            "cancelled",
                            "returned",
                            "exchanged",
                            "refunded",
                            "failed_delivery",
                            "on_hold",
                          ],
                        ],
                      },
                    },
                  ],
                },
              },
            },
            {
              $unwind: "$order_products",
            },
            {
              $unwind: "$order_products.item_products",
            },
            {
              $match: {
                $expr: {
                  $eq: ["$order_products.item_products.skuId", "$$skuId"],
                },
              },
            },
            {
              $project: {
                quantity: "$order_products.item_products.quantity",
                price: {
                  $toDouble: "$order_products.item_products.price",
                },
              },
            },
          ],
          as: "sales",
        },
      },
      {
        $addFields: {
          totalOrders: { $size: "$sales" },
          totalQuantitySold: {
            $sum: "$sales.quantity",
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: "$sales",
                as: "s",
                in: {
                  $multiply: [
                    { $ifNull: ["$$s.quantity", 0] },
                    { $ifNull: ["$$s.price", 0] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $match: {
          totalOrders: { $gte: 5 },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "inventories",
          localField: "sku_id",
          foreignField: "inven_skuId",
          as: "inventory",
        },
      },
      {
        $unwind: "$inventory",
      },
      {
        $addFields: {
          averageOrderValue: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalOrders"] },
            ],
          },
        },
      },
      {
        $project: {
          skuId: "$sku_id",
          product_name: "$product.product_name",
          attributes: {
            color: {
              $arrayElemAt: [
                "$product.product_variations.0.options",
                { $arrayElemAt: ["$sku_tier_idx", 0] },
              ],
            },
            size: {
              $arrayElemAt: [
                "$product.product_variations.1.options",
                { $arrayElemAt: ["$sku_tier_idx", 1] },
              ],
            },
          },
          stock: "$inventory.inven_stock",
          product_price: "$sku_price",
          totalOrders: 1,
          totalQuantitySold: 1,
          totalRevenue: 1,
          averageOrderValue: 1,
          sku_name: "$sku_name",
          product_thumb: "$product.product_thumb",
          product_slug: "$product.product_slug",
          stockValue: {
            $multiply: [
              { $ifNull: ["$inventory.inven_stock", 0] },
              { $ifNull: [{ $toDouble: "$sku_price" }, 0] },
            ],
          },
          product_quantity: "$inventory.inven_stock",
        },
      },
      {
        $sort: {
          totalQuantitySold: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);
  };

  getTotalProductViews = async () => {
    const result = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$product_views" },
        },
      },
    ]);

    return result.length > 0 ? result[0].totalViews : 0;
  };

  getAnalysisData = async (type = "today", startDate, endDate) => {
    try {
      const { start, end } = this.getDateRange(type, startDate, endDate);

      const [orderData, revenueReport, lowSaleSku, topSellingSku, totalViews] =
        await Promise.all([
          this.getOrderData(start, end),
          this.getRevenueData(start, end),
          this.getLowSaleSku(),
          this.getTopSellingSku(),
          this.getTotalProductViews(),
        ]);

      const resultOrder = orderData.reduce((order, item) => {
        order[item._id] = item.count;
        return order;
      }, {});

      return {
        order: resultOrder,
        revenue_report: revenueReport,
        lowSaleSku,
        topSellingSku,
        countLowSaleSku: lowSaleSku.length,
        countTopSellingSku: topSellingSku.length,
        totalProductView: totalViews,
      };
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      throw new Error("Failed to get analysis data");
    }
  };

  exportRevenueToCSV = async (type = "today", startDate, endDate) => {
    try {
      const { revenue_report } = await this.getAnalysisData(
        type,
        startDate,
        endDate
      );
      const { daily, revenue, total_order, total_order_count, date_range } =
        revenue_report;

      const pageViews = await PageView.find({
        lastUpdated: {
          $gte: date_range.start,
          $lte: date_range.end,
        },
      });

      const cancelledOrders = await Order.countDocuments({
        //   order_userId: new Types.ObjectId(userId),
        order_status: "cancelled",
        createdAt: {
          $gte: date_range.start,
          $lte: date_range.end,
        },
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `revenue-report-${timestamp}.csv`;
      const filePath = path.join(__dirname, "../../public/exports", filename);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: "date", title: "Thời gian" },
          { id: "grossRevenue", title: "Doanh thu thực tế" },
          { id: "discount", title: "Giảm giá" },
          { id: "netRevenue", title: "Doanh thu sau giảm" },
          {id: 'feeShip', title: 'Phí ship'},
          { id: "order", title: "Đơn hàng" },
          { id: "totalRevenue", title: "Tổng doanh thu" },
          { id: "views", title: "Lượt xem" },
          { id: "avgOrderValue", title: "Giá trị hàng trung bình" },
          { id: "cancelledOrders", title: "Đơn hàng hủy" },
        ],
      });

      const records = await Promise.all(
        daily.map(async (item) => {
          const views =
            pageViews.find(
              (pv) => pv.lastUpdated.toISOString().split("T")[0] === item.date
            )?.views || 0;
          const avgOrderValue = item.order > 0 ? item.revenue / item.order : 0;
            const orders = await Order.find({
              createdAt: {
                $gte: new Date(item.date),
                $lt: new Date(
                  new Date(item.date).getTime() + 24 * 60 * 60 * 1000
                ),
              },
            });
            const grossRevenue = orders.reduce((sum, order) => {
              return sum + order.order_checkout.totalPrice;
            }, 0);
            const discount = orders.reduce((sum, order) => {
              return sum + order.order_checkout.totalDiscount;
            }, 0);
            const netRevenue = grossRevenue - discount;
            const feeShip = orders.reduce((sum, order) => {
              return sum + order.order_checkout.feeShip;
            }, 0);
            const totalRevenue = orders.reduce((sum, order) => {
              return sum + order.order_checkout.totalCheckout;
            }, 0);
          const cancelledCount = await Order.countDocuments({
            //   order_userId: new Types.ObjectId(userId),
            order_status: "canceled",
            createdAt: {
              $gte: new Date(item.date),
              $lt: new Date(
                new Date(item.date).getTime() + 24 * 60 * 60 * 1000
              ),
            },
          });

          return {
            date: item.date,
            grossRevenue: grossRevenue,
            discount: discount,
            netRevenue: netRevenue,
            feeShip: feeShip,
            order: item.order,
            totalRevenue: totalRevenue,
            views: views,
            avgOrderValue: avgOrderValue.toFixed(2),
            cancelledOrders: cancelledCount,
          };
        })
      );

      const totalViews = pageViews.reduce((sum, pv) => sum + pv.views, 0);
      const avgOrderValue =
        total_order_count > 0 ? revenue / total_order_count : 0;

      records.push({
        date: "Tổng cộng",
        grossRevenue: records.reduce((sum, item) => sum + Number(item.grossRevenue), 0),
        discount: records.reduce((sum, item) => sum + Number(item.discount), 0),
        netRevenue: records.reduce((sum, item) => sum + Number(item.netRevenue), 0),
        feeShip: records.reduce((sum, item) => sum + Number(item.feeShip), 0),
        order: total_order_count,
        totalRevenue: revenue,
        views: totalViews,
        avgOrderValue: avgOrderValue.toFixed(2),
        cancelledOrders: cancelledOrders,
      });

      await csvWriter.writeRecords(records);
      const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
      fs.writeFileSync(filePath, "\uFEFF" + fileContent, { encoding: "utf8" });

      return {
        filename,
        path: `/exports/${filename}`,
        fullPath: filePath,
        deleteFile: () => this.deleteFile(filePath),
      };
    } catch (error) {
      console.error("Error exporting revenue to CSV:", error);
      throw new Error("Failed to export revenue data to CSV");
    }
  };

  deleteFile = (filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File ${filePath} đã được xóa thành công`);
      }
    } catch (error) {
      console.error(`Lỗi khi xóa file ${filePath}:`, error);
    }
  };
}

module.exports = new AnalysisRepo();
