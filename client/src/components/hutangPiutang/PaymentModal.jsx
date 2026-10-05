import React, { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import './PaymentModal.css';
import './NewDebtModal.css'; // reuse modal layout styles

const formatRupiah = (num) => {
  if (num === null || num === undefined) return 'Rp 0';
  const parsed = Number(num);
  return 'Rp ' + Math.round(parsed).toLocaleString('id-ID');
};

const PaymentModal = ({ isOpen, debt, onClose, onSaved }) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debt) {
      setAmount(debt.remaining.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
    }
  }, [debt]);

  if (!isOpen || !debt) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.debtTracker.recordPayment(debt.id, {
        amount: numAmount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        notes: notes.trim()
      });

      if (onSaved) onSaved(res.message || 'Pembayaran berhasil dicatat!');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-title-icon" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
              <CreditCard size={20} />
            </div>
            <div>
              <div className="modal-title-text">Catat Pembayaran / Cicilan</div>
              <div className="modal-subtitle-text">
                #DBT-{debt.id} • {debt.contact_name || 'Umum'} ({debt.type.toUpperCase()})
              </div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="payment-summary-box">
            <div className="payment-summary-item">
              <span className="payment-summary-label">Sisa Tagihan Saat Ini</span>
              <span className="payment-summary-value secondary">{formatRupiah(debt.remaining)}</span>
            </div>
            <div className="payment-summary-item" style={{ textAlign: 'right' }}>
              <span className="payment-summary-label">Total Pokok</span>
              <span className="payment-summary-value">{formatRupiah(debt.amount)}</span>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="form-label-custom">Nominal Pembayaran (Rp)</label>
            <div className="amount-input-box">
              <span className="amount-prefix">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="input-custom"
                required
              />
            </div>
            <div className="quick-pay-options">
              <button
                type="button"
                onClick={() => setAmount(debt.remaining.toString())}
                className="quick-pay-btn"
              >
                Bayar Penuh ({formatRupiah(debt.remaining)})
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.round(debt.remaining / 2).toString())}
                className="quick-pay-btn"
              >
                50% ({formatRupiah(debt.remaining / 2)})
              </button>
            </div>
          </div>

          <div className="grid-2col">
            <div className="form-group-custom">
              <label className="form-label-custom">Tanggal Bayar</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="input-custom"
                required
              />
            </div>
            <div className="form-group-custom">
              <label className="form-label-custom">Metode Pembayaran</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input-custom"
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="QRIS">QRIS Statis</option>
                <option value="Tunai">Tunai / Cash</option>
                <option value="E-Wallet">E-Wallet (GoPay/OVO)</option>
              </select>
            </div>
          </div>

          <div className="form-group-custom">
            <label className="form-label-custom">Catatan Pembayaran</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Cicilan ke-2 via BCA Mobile"
              className="input-custom"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary-custom" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-custom"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)' }}
            >
              <CheckCircle size={16} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Pembayaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
