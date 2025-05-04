"use strict";

const { SuccessResponse } = require("../core/success.response");
const { getAnalysisDataService, exportRevenueToCSVService } = require("../services/analysis.service");

class AnalysisController {
  getAnalysisData = async (req, res, next) => {
    new SuccessResponse({
      message: "Get analysis data successfully",
      metadata: await getAnalysisDataService({
        userId: req.user.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
      }),
    }).send(res);
  };

  downloadRevenueCSV = async (req, res, next) => {
    try {
      const csvContent = await exportRevenueToCSVService({
        userId: req.user.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        type: req.query.type,
      });
      
      // Thiết lập header cho file download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');

      res.setHeader('Content-Disposition', 'attachment; filename=revenue_report.csv');
      // res.sendFile(csvContent.fullPath);
      res.download(csvContent.fullPath, csvContent.filename, (err) => {
        if (!err) {
          csvContent.deleteFile(); // Gọi hàm đã trả về từ service
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AnalysisController();
