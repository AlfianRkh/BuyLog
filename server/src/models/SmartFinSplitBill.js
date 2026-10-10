const db = require('../config/database');

class SmartFinSplitBill {
  static async getSplitBill(userId = 1) {
    const billQuery = `
      SELECT 
        id, title, merchant, invoice_no as "invoiceNo", date_str as "date",
        payment_method as "paymentMethod", paid_by as "paidBy",
        subtotal_menu::float as "subtotalMenu", tax_pb1::float as "taxPb1",
        service::float as "service", total_bill::float as "totalBill"
      FROM smartfin_split_bills
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY id DESC
      LIMIT 1
    `;
    const { rows: bills } = await db.query(billQuery, [userId]);

    // Seed initial row if user has 0 split bills in database
    if (bills.length === 0) {
      const { rows: newBill } = await db.query(`
        INSERT INTO smartfin_split_bills (
          user_id, title, merchant, invoice_no, date_str, payment_method, 
          paid_by, subtotal_menu, tax_pb1, service, total_bill
        )
        VALUES (
          $1, 'Kopi Kenangan & Kitchen - Galaxy Mall', 'Kopi Kenangan & Kitchen - Galaxy Mall',
          'INV-KK-20261005-0421', '05 Okt 2026, 20:15 WIB', 'QRIS BCA',
          'Alfian S.', 190000, 19000, 11000, 220000
        )
        RETURNING id, title, merchant, invoice_no as "invoiceNo", date_str as "date",
                  payment_method as "paymentMethod", paid_by as "paidBy",
                  subtotal_menu::float as "subtotalMenu", tax_pb1::float as "taxPb1",
                  service::float as "service", total_bill::float as "totalBill"
      `, [userId]);

      const billId = newBill[0].id;
      await db.query(`
        INSERT INTO smartfin_split_bill_participants (split_bill_id, name, is_host, is_paid, portion, description)
        VALUES 
          ($1, 'Alfian (Saya)', TRUE, TRUE, 57895, 'Nasgor Gila + Fries'),
          ($1, 'Budi Pratama', FALSE, FALSE, 92632, 'Double Wagyu + Fries'),
          ($1, 'Sari Anggraini', FALSE, TRUE, 63684, 'Carbonara + Fries'),
          ($1, 'Dimas Raditya', FALSE, FALSE, 31263, 'Kopi Mantan + Fries')
      `, [billId]);

      const participants = await this.getParticipants(billId);
      return {
        ...newBill[0],
        id: newBill[0].id.toString(),
        participants
      };
    }

    const currentBill = bills[0];
    const participants = await this.getParticipants(currentBill.id);
    return {
      ...currentBill,
      id: currentBill.id.toString(),
      participants
    };
  }

  static async getParticipants(splitBillId) {
    const { rows } = await db.query(`
      SELECT 
        id, name, is_host as "isHost", is_paid as "isPaid", 
        portion::float as portion, description as desc
      FROM smartfin_split_bill_participants
      WHERE split_bill_id = $1
      ORDER BY id ASC
    `, [splitBillId]);

    return rows.map(r => ({
      ...r,
      id: r.id.toString(),
      isHost: Boolean(r.isHost),
      isPaid: Boolean(r.isPaid)
    }));
  }

  static async toggleMemberPaid(memberId, userId = 1) {
    const numericId = parseInt(memberId, 10);

    if (!isNaN(numericId) && numericId > 0) {
      await db.query(`
        UPDATE smartfin_split_bill_participants
        SET is_paid = NOT is_paid, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [numericId]);
    } else {
      await db.query(`
        UPDATE smartfin_split_bill_participants
        SET is_paid = NOT is_paid, updated_at = CURRENT_TIMESTAMP
        WHERE name = $1
      `, [memberId]);
    }

    return this.getSplitBill(userId);
  }

  static async addMember({ name, desc, portion, userId = 1 }) {
    const currentBill = await this.getSplitBill(userId);
    const billId = parseInt(currentBill.id, 10);

    await db.query(`
      INSERT INTO smartfin_split_bill_participants (split_bill_id, name, is_host, is_paid, portion, description)
      VALUES ($1, $2, FALSE, FALSE, $3, $4)
    `, [
      billId,
      name.trim(),
      Number(portion) || 25000,
      desc || 'Pesanan Tambahan'
    ]);

    return this.getSplitBill(userId);
  }
}

module.exports = SmartFinSplitBill;
