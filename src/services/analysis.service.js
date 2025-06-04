"use strict";
const { Types } = require("mongoose");
const Order = require("../models/order.model");
const PageView = require("../models/pageview.model");
const Product = require("../models/product.model");
const SKU = require("../models/sku.model");
const analysisRepo = require("../models/repo/analysis.repo");
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
// const getDateRange = (type, startDate, endDate) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   switch (type) {
//     case "today":
//       return {
//         start: today,
//         end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
//       };
//     case "yesterday":
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       return {
//         start: yesterday,
//         end: today,
//       };
//     case "week":
//       const startOfWeek = new Date(today);
//       startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
//       const endOfWeek = new Date(startOfWeek);
//       endOfWeek.setDate(endOfWeek.getDate() + 6);
//       endOfWeek.setHours(23, 59, 59, 999);
//       return {
//         start: startOfWeek,
//         end: endOfWeek,
//       };
//     case "month":
//       const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
//       const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//       endOfMonth.setHours(23, 59, 59, 999);
//       return {
//         start: startOfMonth,
//         end: endOfMonth,
//       };
//     case "specific-date":
//       return {
//         start: new Date(startDate),
//         end: new Date(endDate),
//       };
//     default:
//       return {
//         start: today,
//         end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
//       };
//   }
// };
const getAnalysisDataService = async ({
  type = "today",
  startDate,
  endDate,
}) => {
  try {
    return await analysisRepo.getAnalysisData(type, startDate, endDate);
  } catch (error) {
    console.error("Error fetching analysis data:", error);
    throw new Error("Failed to get analysis data");
  }
};
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const fs = require("fs");

const exportRevenueToCSVService = async ({
  type = "today",
  startDate,
  endDate,
}) => {
  try {
    return await analysisRepo.exportRevenueToCSV(type, startDate, endDate);
    // const { revenue_report } = await getAnalysisDataService({
    //   userId,
    //   type,
    //   startDate,
    //   endDate,
    // });
    // const { daily, revenue, total_order, total_order_count, date_range } =
    //   revenue_report;

    // // Lấy dữ liệu lượt xem
    // const pageViews = await PageView.find({
    //   lastUpdated: {
    //     $gte: date_range.start,
    //     $lte: date_range.end,
    //   },
    // });

    // // Lấy dữ liệu đơn hàng hủy
    // const cancelledOrders = await Order.countDocuments({
    //   order_userId: new Types.ObjectId(userId),
    //   order_status: "cancelled",
    //   createdAt: {
    //     $gte: date_range.start,
    //     $lte: date_range.end,
    //   },
    // });

    // // Tạo tên file với timestamp
    // const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    // const filename = `revenue-report-${timestamp}.csv`;
    // const filePath = path.join(__dirname, "../../public/exports", filename);

    // // Đảm bảo thư mục tồn tại
    // if (!fs.existsSync(path.dirname(filePath))) {
    //   fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // }

    // // const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
    // // stream.write('\uFEFF');
    // // stream.end();
    // // Tạo CSV writer
    // const csvWriter = createCsvWriter({
    //   path: filePath,
    //   header: [
    //     { id: "date", title: "Thời gian" },
    //     { id: "revenue", title: "Doanh số" },
    //     { id: "order", title: "Đơn hàng" },
    //     { id: "totalRevenue", title: "Doanh thu" },
    //     { id: "views", title: "Lượt xem" },
    //     { id: "avgOrderValue", title: "Giá trị hàng trung bình" },
    //     { id: "cancelledOrders", title: "Đơn hàng hủy" },
    //   ],
    //   // append: true
    // });

    // // Chuẩn bị dữ liệu cho CSV
    // const records = await Promise.all(
    //   daily.map(async (item) => {
    //     const views =
    //       pageViews.find(
    //         (pv) => pv.lastUpdated.toISOString().split("T")[0] === item.date
    //       )?.views || 0;
    //     const avgOrderValue = item.order > 0 ? item.revenue / item.order : 0;

    //     const cancelledCount = await Order.countDocuments({
    //       order_userId: new Types.ObjectId(userId),
    //       order_status: "cancelled",
    //       createdAt: {
    //         $gte: new Date(item.date),
    //         $lt: new Date(new Date(item.date).getTime() + 24 * 60 * 60 * 1000),
    //       },
    //     });

    //     return {
    //       date: item.date,
    //       revenue: item.revenue,
    //       order: item.order,
    //       totalRevenue: item.revenue,
    //       views: views,
    //       avgOrderValue: avgOrderValue.toFixed(2),
    //       cancelledOrders: cancelledCount,
    //     };
    //   })
    // );

    // // Thêm dòng tổng kết
    // const totalViews = pageViews.reduce((sum, pv) => sum + pv.views, 0);
    // const avgOrderValue =
    //   total_order_count > 0 ? revenue / total_order_count : 0;

    // // Thêm BOM vào đầu file
    // // fs.writeFileSync(filePath, '\uFEFF', { encoding: 'utf8' });

    // records.push({
    //   date: "Tổng cộng",
    //   revenue: revenue,
    //   order: total_order_count,
    //   totalRevenue: revenue,
    //   views: totalViews,
    //   avgOrderValue: avgOrderValue.toFixed(2),
    //   cancelledOrders: cancelledOrders,
    // });

    // // Ghi dữ liệu vào file CSV
    // await csvWriter.writeRecords(records);
    // const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    // fs.writeFileSync(filePath, "\uFEFF" + fileContent, { encoding: "utf8" });
    // return {
    //   filename,
    //   path: `/exports/${filename}`,
    //   fullPath: filePath,
    //   deleteFile: () => deleteFile(filePath),
    // };
  } catch (error) {
    console.error("Error exporting revenue to CSV:", error);
    throw new Error("Failed to export revenue data to CSV");
  }
};

module.exports = {
  getAnalysisDataService,
  exportRevenueToCSVService,
};
