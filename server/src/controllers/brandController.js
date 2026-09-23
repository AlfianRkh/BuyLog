const Brand = require('../models/Brand');

class BrandController {
  static async getAll(req, res, next) {
    try {
      const brands = await Brand.findAll(req.user.id);
      res.status(200).json({
        success: true,
        data: brands
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Nama merk harus diisi' });
      }
      const brand = await Brand.findOrCreate(name, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Merk berhasil ditambahkan',
        data: brand
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { name } = req.body;
      const brand = await Brand.update(req.params.id, req.user.id, { name });
      res.status(200).json({
        success: true,
        message: 'Merk berhasil diperbarui',
        data: brand
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await Brand.delete(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Merk berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BrandController;
