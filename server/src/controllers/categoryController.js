const Category = require('../models/Category');

class CategoryController {
  static async getAll(req, res, next) {
    try {
      const categories = await Category.findAll(req.user.id);
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, icon, color } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Nama kategori harus diisi' });
      }
      const category = await Category.create({ name, icon, color, userId: req.user.id });
      res.status(201).json({
        success: true,
        message: 'Kategori berhasil ditambahkan',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, icon, color } = req.body;
      const category = await Category.update(req.params.id, req.user.id, { name, icon, color });
      res.status(200).json({
        success: true,
        message: 'Kategori berhasil diperbarui',
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await Category.delete(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Kategori berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
