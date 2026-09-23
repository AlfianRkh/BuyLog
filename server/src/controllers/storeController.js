const Store = require('../models/Store');

class StoreController {
  static async getAll(req, res, next) {
    try {
      const stores = await Store.findAll(req.user.id);
      res.status(200).json({
        success: true,
        data: stores
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ success: false, message: 'Toko tidak ditemukan' });
      }
      res.status(200).json({
        success: true,
        data: store
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { name, address, location_id, store_type } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Nama toko harus diisi' });
      }
      const store = await Store.create({
        name,
        address,
        locationId: location_id,
        storeType: store_type,
        userId: req.user.id
      });
      res.status(201).json({
        success: true,
        message: 'Toko berhasil ditambahkan',
        data: store
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { name, address, location_id, store_type } = req.body;
      const store = await Store.update(req.params.id, req.user.id, {
        name,
        address,
        locationId: location_id,
        storeType: store_type
      });
      res.status(200).json({
        success: true,
        message: 'Toko berhasil diperbarui',
        data: store
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await Store.delete(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Toko berhasil dihapus'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StoreController;
