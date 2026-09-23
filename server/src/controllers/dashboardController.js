const DashboardService = require('../services/dashboardService');

class DashboardController {
  static async getMonthly(req, res, next) {
    try {
      const { month = 9, year = 2026 } = req.query;
      const data = await DashboardService.getMonthlyDashboard(req.user.id, month, year);
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
