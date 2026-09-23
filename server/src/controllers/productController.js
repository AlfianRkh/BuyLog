const ProductService = require('../services/productService');

class ProductController {
  static async getAll(req, res, next) {
    try {
      const { search, category_id, brand_id, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const result = await ProductService.getAllProducts(req.user.id, {
        search,
        categoryId: category_id,
        brandId: brand_id,
        limit: Number(limit),
        offset
      });

      res.status(200).json({
        success: true,
        data: result.products,
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
      const product = await ProductService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkExistence(req, res, next) {
    try {
      const { name, brand_name } = req.query;
      const result = await ProductService.checkProductExistence(name, brand_name, req.user.id);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Produk berhasil didaftarkan',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Produk berhasil diperbarui',
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPriceReference(req, res, next) {
    try {
      const reference = await ProductService.getPriceReference(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: reference
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPriceHistory(req, res, next) {
    try {
      const history = await ProductService.getPriceHistory(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
