const debtTrackerService = require('../services/debtTrackerService');

exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await debtTrackerService.getContacts(req.user.id, req.query.search);
    res.json({ contacts });
  } catch (error) {
    next(error);
  }
};

exports.createContact = async (req, res, next) => {
  try {
    const contact = await debtTrackerService.createContact(req.user.id, req.body);
    res.status(201).json({ message: 'Kontak berhasil dibuat.', contact });
  } catch (error) {
    next(error);
  }
};

exports.getContactWASummary = async (req, res, next) => {
  try {
    const result = await debtTrackerService.generateWASummary(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getDebts = async (req, res, next) => {
  try {
    const debts = await debtTrackerService.getDebts(req.user.id, req.query);
    res.json({ debts });
  } catch (error) {
    next(error);
  }
};

exports.getDebtSummary = async (req, res, next) => {
  try {
    const summary = await debtTrackerService.getDebtSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};

exports.getDebtDetail = async (req, res, next) => {
  try {
    const debt = await debtTrackerService.getDebtById(req.user.id, req.params.id);
    if (!debt) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    }
    res.json({ debt });
  } catch (error) {
    next(error);
  }
};

exports.createDebt = async (req, res, next) => {
  try {
    const debt = await debtTrackerService.createDebt(req.user.id, req.body);
    res.status(201).json({ message: 'Transaksi hutang/piutang berhasil dicatat.', debt });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const result = await debtTrackerService.recordPayment(req.user.id, req.params.id, req.body);
    const debt = await debtTrackerService.getDebtById(req.user.id, req.params.id);
    res.json({ message: result.message, debt });
  } catch (error) {
    next(error);
  }
};

exports.cancelDebt = async (req, res, next) => {
  try {
    const result = await debtTrackerService.cancelDebt(req.user.id, req.params.id, req.body.reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteDebt = async (req, res, next) => {
  try {
    const result = await debtTrackerService.deleteDebt(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyReport = async (req, res, next) => {
  try {
    const report = await debtTrackerService.getMonthlyReport(req.user.id);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const user = await debtTrackerService.updateUserSettings(req.user.id, req.body);
    res.json({ message: 'Pengaturan berhasil diperbarui.', user });
  } catch (error) {
    next(error);
  }
};
