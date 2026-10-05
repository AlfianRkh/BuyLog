import React, { useState, useEffect } from 'react';
import { X, PlusCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { api } from '../../services/api';
import './NewDebtModal.css';

const NewDebtModal = ({ isOpen, onClose, onSave, contacts = [], refreshContacts }) => {
  const [type, setType] = useState('piutang');
  const [contactId, setContactId] = useState('');
  const [contactName, setContactName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDebtDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContactSelect = (e) => {
    const val = e.target.value;
    setContactId(val);
    if (val) {
      const selected = contacts.find(c => c.id.toString() === val);
      if (selected) setContactName(selected.name);
    } else {
      setContactName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (!contactId && !contactName.trim()) {
      alert('Pilih kontak atau masukkan nama kontak baru.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        contact_id: contactId ? parseInt(contactId) : null,
        contact_name: contactName.trim(),
        type,
        amount: numAmount,
        description: description.trim() || `${type === 'piutang' ? 'Piutang ke' : 'Hutang ke'} ${contactName}`,
        debt_date: debtDate,
        due_date: dueDate || null,
        payment_method: paymentMethod,
        notes: notes.trim() || null
      };

      const res = await api.debtTracker.createDebt(payload);
      if (refreshContacts) refreshContacts();
      if (onSave) onSave(res.message || 'Transaksi hutang/piutang berhasil disimpan!');
      
      // Reset form
      setAmount('');
      setDescription('');
      setContactId('');
      setContactName('');
      setNotes('');
      setDueDate('');
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Gagal menyimpan catatan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <div className="modal-title-icon">
              <PlusCircle size={20} />
            </div>
            <div>
              <div className="modal-title-text">Catat Hutang / Piutang</div>
              <div className="modal-subtitle-text">Tambahkan transaksi baru ke dalam buku catatan personal</div>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Tipe Transaksi */}
          <div className="form-group-custom">
            <label className="form-label-custom">Tipe Transaksi</label>
            <div className="type-selector">
              <button
                type="button"
                onClick={() => setType('piutang')}
                className={`type-btn ${type === 'piutang' ? 'active-piutang' : ''}`}
              >
                <ArrowDownLeft size={18} />
                <span>Piutang (Pinjaman ke orang)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('hutang')}
                className={`type-btn ${type === 'hutang' ? 'active-hutang' : ''}`}
              >
                <ArrowUpRight size={18} />
                <span>Hutang (Saya meminjam)</span>
              </button>
            </div>
          </div>

          {/* Target Kontak */}
          <div className="form-group-custom">
            <label className="form-label-custom">Pilih / Nama Kontak</label>
            {contacts.length > 0 && (
              <select
                value={contactId}
                onChange={handleContactSelect}
                className="input-custom mb-2"
              >
                <option value="">-- Pilih dari Kontak Ada --</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            )}
            {!contactId && (
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Atau ketik nama kontak baru..."
                className="input-custom"
                required
              />
            )}
          </div>

          {/* Nominal */}
          <div className="form-group-custom">
            <label className="form-label-custom">Nominal (Rp)</label>
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
            <div className="quick-amount-tags">
              <button type="button" onClick={() => setAmount('50000')} className="tag-btn">+50rb</button>
              <button type="button" onClick={() => setAmount('100000')} className="tag-btn">+100rb</button>
              <button type="button" onClick={() => setAmount('500000')} className="tag-btn">+500rb</button>
              <button type="button" onClick={() => setAmount('1000000')} className="tag-btn">+1 Juta</button>
              <button type="button" onClick={() => setAmount('5000000')} className="tag-btn">+5 Juta</button>
            </div>
          </div>

          {/* Deskripsi / Keterangan */}
          <div className="form-group-custom">
            <label className="form-label-custom">Deskripsi Transaksi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Talangan beli sparepart laptop / makan bersama"
              className="input-custom"
              required
            />
          </div>

          {/* Tanggal & Jatuh Tempo */}
          <div className="grid-2col">
            <div className="form-group-custom">
              <label className="form-label-custom">Tanggal Pinjam</label>
              <input
                type="date"
                value={debtDate}
                onChange={(e) => setDebtDate(e.target.value)}
                className="input-custom"
                required
              />
            </div>
            <div className="form-group-custom">
              <label className="form-label-custom">Jatuh Tempo (Opsional)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-custom"
              />
            </div>
          </div>

          {/* Metode & Catatan */}
          <div className="grid-2col">
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
            <div className="form-group-custom">
              <label className="form-label-custom">Catatan Tambahan</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Nomor referensi #001"
                className="input-custom"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary-custom" onClick={onClose}>
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary-custom">
              <PlusCircle size={16} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDebtModal;
