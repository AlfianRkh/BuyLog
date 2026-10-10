const Category = require('./Category');

class SmartFinCategory {
  static async getCategories(userId = 1) {
    const rows = await Category.findAll(userId, 'smartfin');
    return rows.map(this.formatCategory);
  }

  static formatCategory(r) {
    return {
      id: r.id.toString(),
      dbId: r.id,
      name: r.name,
      icon: r.icon || '🏷️',
      type: r.type || 'Pengeluaran',
      feature: r.feature || 'smartfin'
    };
  }

  static async createCategory({ name, icon, type, userId = 1 }) {
    if (!name || !name.trim()) {
      throw new Error('Nama kategori wajib diisi.');
    }

    await Category.create({
      name: name.trim(),
      icon: icon || '🏷️',
      type: type || 'Pengeluaran',
      feature: 'smartfin',
      userId
    });

    return this.getCategories(userId);
  }

  static async deleteCategory(id, userId = 1) {
    await Category.delete(id, userId);
    return this.getCategories(userId);
  }
}

module.exports = SmartFinCategory;
