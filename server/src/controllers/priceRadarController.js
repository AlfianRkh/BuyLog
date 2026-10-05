const priceRadarService = require('../services/priceRadarService');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await priceRadarService.getDashboard(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getWatchlist = async (req, res, next) => {
  try {
    const items = await priceRadarService.getWatchlist(req.user.id, req.query);
    res.json({ items });
  } catch (error) {
    next(error);
  }
};

exports.createWatchlist = async (req, res, next) => {
  try {
    const item = await priceRadarService.createWatchlist(req.user.id, req.body);
    res.status(201).json({ message: 'Produk berhasil ditambahkan ke Watchlist Radar.', item });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetail = async (req, res, next) => {
  try {
    const product = await priceRadarService.getProductDetail(req.user.id, req.params.idOrSlug);
    if (!product) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
};

exports.updateWatchlist = async (req, res, next) => {
  try {
    const item = await priceRadarService.updateWatchlist(req.user.id, req.params.id, req.body);
    res.json({ message: 'Data produk diperbarui.', item });
  } catch (error) {
    next(error);
  }
};

exports.deleteWatchlist = async (req, res, next) => {
  try {
    await priceRadarService.deleteWatchlist(req.user.id, req.params.id);
    res.json({ message: 'Produk dihapus dari Watchlist.' });
  } catch (error) {
    next(error);
  }
};

exports.recordLog = async (req, res, next) => {
  try {
    const log = await priceRadarService.recordLog(req.user.id, req.body);
    res.status(201).json({ message: 'Log harga berhasil dicatat.', log });
  } catch (error) {
    next(error);
  }
};

exports.getSources = async (req, res, next) => {
  try {
    const sources = await priceRadarService.getSources(req.user.id, req.query.category);
    res.json({ sources });
  } catch (error) {
    next(error);
  }
};

exports.createSource = async (req, res, next) => {
  try {
    const source = await priceRadarService.createSource(req.user.id, req.body);
    res.status(201).json({ message: 'Sumber harga berhasil ditambahkan.', source });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const stats = await priceRadarService.getStats(req.user.id, req.query.time);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};
