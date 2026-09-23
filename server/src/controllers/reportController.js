const ReportService = require('../services/reportService');

class ReportController {
  static async getMonthlyReports(req, res, next) {
    try {
      const { month = 9, year = 2026 } = req.query;
      const data = await ReportService.getReports(req.user.id, { month, year });
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReportController;
