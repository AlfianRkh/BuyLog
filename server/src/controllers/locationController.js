const Location = require('../models/Location');

class LocationController {
  static async getAll(req, res, next) {
    try {
      const locations = await Location.findAll(req.user.id);
      res.status(200).json({
        success: true,
        data: locations
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { city, province, latitude, longitude } = req.body;
      if (!city) {
        return res.status(400).json({ success: false, message: 'Kota harus diisi' });
      }
      const location = await Location.create({
        city,
        province,
        latitude,
        longitude,
        userId: req.user.id
      });
      res.status(201).json({
        success: true,
        message: 'Lokasi berhasil ditambahkan',
        data: location
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = LocationController;
