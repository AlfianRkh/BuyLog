const PurchaseService = require('../services/purchaseService');

class PurchaseController {
  static async create(req, res, next) {
    try {
      const result = await PurchaseService.createPurchase(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Pembelian berhasil dicatat',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const {
        search,
        period,
        month,
        year,
        start_date,
        end_date,
        category_id,
        brand_id,
        store_id,
        location_id,
        min_price,
        max_price,
        sort_by,
        sort_order,
        page = 1,
        limit = 20
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      const result = await PurchaseService.getAllPurchases(req.user.id, {
        search,
        period,
        month,
        year,
        startDate: start_date,
        endDate: end_date,
        categoryId: category_id,
        brandId: brand_id,
        storeId: store_id,
        locationId: location_id,
        minPrice: min_price,
        maxPrice: max_price,
        sortBy: sort_by,
        sortOrder: sort_order,
        limit: Number(limit),
        offset
      });

      res.status(200).json({
        success: true,
        data: result.purchases,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.total_pages
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const purchase = await PurchaseService.getPurchaseById(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: purchase
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await PurchaseService.updatePurchase(req.params.id, req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Pembelian berhasil diperbarui',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await PurchaseService.deletePurchase(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLocations(req, res, next) {
    try {
      const locations = await PurchaseService.getAllLocations(req.user.id);
      res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PurchaseController;
