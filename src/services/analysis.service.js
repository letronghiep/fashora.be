"use strict";
const { Types } = require("mongoose");
const Order = require("../models/order.model");
const PageView = require("../models/pageview.model");
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
const getWeekRange = (startDate) => {
  const startOfCurrentWeek = new Date(startDate);
  startOfCurrentWeek.setDate(
    startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay()
  );
  const endOfCurrentWeek = new Date(startOfCurrentWeek);
  endOfCurrentWeek.setDate(endOfCurrentWeek.getDate() + 6);
  const startOfPreviousWeek = new Date(startOfCurrentWeek);
  startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);
  const endOfPreviousWeek = new Date(startOfPreviousWeek);
  endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() + 6);
  return {
    currentWeek: { start: startOfCurrentWeek, end: endOfCurrentWeek },
    previousWeek: { start: startOfPreviousWeek, end: endOfPreviousWeek },
  };
};
const getDateRange = (type, startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (type) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        start: yesterday,
        end: today
      };
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return {
        start: startOfWeek,
        end: endOfWeek
      };
    case 'month':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      return {
        start: startOfMonth,
        end: endOfMonth
      };
    case 'specific-date':
      return {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    default:
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
  }
};
const getAnalysisDataService = async ({ userId, type = 'today', startDate, endDate }) => {
  try {
    const { start, end } = getDateRange(type, startDate, endDate);

    const orderDataPromise = Order.aggregate([
      {
        $match: {
          order_userId: new Types.ObjectId(userId),
          createdAt: {
            $gte: start,
            $lte: end
          }
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

    const revenueData = (async () => {
      const revenue = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: start,
              $lte: end
            },
          },
        },
        {
          $unwind: "$order_products",
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$order_products.priceApplyDiscount" },
            total_order: { $sum: 1 },
          },
        },
      ]);

      const dailySaleData = async () => {
        try {
          const daily = await Order.aggregate([
            {
              $match: {
                createdAt: {
                  $gte: start,
                  $lte: end,
                },
              },
            },
            {
              $unwind: "$order_products",
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue: { $sum: "$order_products.priceApplyDiscount" },
                order: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ]);

          const dateArray = getDatesInRange(start, end);

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

      const total_order = await Order.countDocuments({
        createdAt: {
          $gte: start,
          $lte: end
        }
      });

      return {
        daily: await dailySaleData(),
        revenue: revenue[0]?.revenue || 0,
        total_order: revenue[0]?.total_order || 0,
        total_order_count: total_order,
        date_range: {
          start,
          end
        }
      };
    })();

    const [orderData, revenueReport] = await Promise.all([
      orderDataPromise,
      revenueData,
    ]);

    const resultOrder = orderData.reduce((order, item) => {
      order[item._id] = item.count;
      return order;
    }, {});

    return {
      order: resultOrder,
      revenue_report: revenueReport,
    };
  } catch (error) {
    console.error("Error fetching analysis data:", error);
    throw new Error("Failed to get analysis data");
  }
};

const deleteFile = (filePath) => {
  try {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`File ${filePath} đã được xóa thành công`);
    }
  } catch (error) {
    console.error(`Lỗi khi xóa file ${filePath}:`, error);
  }
};

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');

const exportRevenueToCSVService = async ({ userId, type = 'today', startDate, endDate }) => {
  try {
    const { revenue_report } = await getAnalysisDataService({ userId, type, startDate, endDate });
    const { daily, revenue, total_order, total_order_count, date_range } = revenue_report;

    // Lấy dữ liệu lượt xem
    const pageViews = await PageView.find({
      lastUpdated: {
        $gte: date_range.start,
        $lte: date_range.end
      }
    });

    // Lấy dữ liệu đơn hàng hủy
    const cancelledOrders = await Order.countDocuments({
      order_userId: new Types.ObjectId(userId),
      order_status: "cancelled",
      createdAt: {
        $gte: date_range.start,
        $lte: date_range.end
      }
    });

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `revenue-report-${timestamp}.csv`;
    const filePath = path.join(__dirname, '../../public/exports', filename);

    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // const stream = fs.createWriteStream(filePath, { encoding: 'utf8' });
    // stream.write('\uFEFF');
    // stream.end();
    // Tạo CSV writer
    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'date', title: 'Thời gian' },
        { id: 'revenue', title: 'Doanh số' },
        { id: 'order', title: 'Đơn hàng' },
        { id: 'totalRevenue', title: 'Doanh thu' },
        { id: 'views', title: 'Lượt xem' },
        { id: 'avgOrderValue', title: 'Giá trị hàng trung bình' },
        { id: 'cancelledOrders', title: 'Đơn hàng hủy' }
      ],
      // append: true
    });

    // Chuẩn bị dữ liệu cho CSV
    const records = await Promise.all(daily.map(async (item) => {
      const views = pageViews.find(pv => pv.lastUpdated.toISOString().split('T')[0] === item.date)?.views || 0;
      const avgOrderValue = item.order > 0 ? (item.revenue / item.order) : 0;
      
      const cancelledCount = await Order.countDocuments({
        order_userId: new Types.ObjectId(userId),
        order_status: "cancelled",
        createdAt: {
          $gte: new Date(item.date),
          $lt: new Date(new Date(item.date).getTime() + 24 * 60 * 60 * 1000)
        }
      });

      return {
        date: item.date,
        revenue: item.revenue,
        order: item.order,
        totalRevenue: item.revenue,
        views: views,
        avgOrderValue: avgOrderValue.toFixed(2),
        cancelledOrders: cancelledCount
      };
    }));

    // Thêm dòng tổng kết
    const totalViews = pageViews.reduce((sum, pv) => sum + pv.views, 0);
    const avgOrderValue = total_order_count > 0 ? (revenue / total_order_count) : 0;
    
    // Thêm BOM vào đầu file
    // fs.writeFileSync(filePath, '\uFEFF', { encoding: 'utf8' });
    
    records.push({
      date: 'Tổng cộng',
      revenue: revenue,
      order: total_order_count,
      totalRevenue: revenue,
      views: totalViews,
      avgOrderValue: avgOrderValue.toFixed(2),
      cancelledOrders: cancelledOrders
    });

    // Ghi dữ liệu vào file CSV
    await csvWriter.writeRecords(records);
   const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
   fs.writeFileSync(filePath, '\uFEFF' + fileContent, { encoding: 'utf8' });
    return {
      filename,
      path: `/exports/${filename}`,
      fullPath: filePath,
      deleteFile: () => deleteFile(filePath)
    };
  } catch (error) {
    console.error("Error exporting revenue to CSV:", error);
    throw new Error("Failed to export revenue data to CSV");
  }
};

module.exports = {
  getAnalysisDataService,
  exportRevenueToCSVService,
  deleteFile
};
