const db = require('../config/database');
const Purchase = require('../models/Purchase');
const PurchaseItem = require('../models/PurchaseItem');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Store = require('../models/Store');
const Location = require('../models/Location');
const PriceHistory = require('../models/PriceHistory');
const { AppError } = require('../middleware/errorHandler');

class PurchaseService {
  static async createPurchase(userId, purchaseData) {
    const {
      store_type = 'fisik',
      store_name,
      store_address,
      city,
      province,
      latitude,
      longitude,
      store_id: existingStoreId,

      invoice_number,
      payment_method = 'Tunai',
      notes,
      purchase_date = new Date().toISOString(),

      product_name,
      brand_name,
      category_id,
      model,
      description,
      photo_url,
      quantity = 1,
      unit_price = 0,
      item_notes,

      items = []
    } = purchaseData;

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Resolve Location & Store
      let finalLocationId = null;
      if (city) {
        let loc = await Location.findByCity(city.trim(), userId);
        if (!loc) {
          loc = await Location.create({
            city: city.trim(),
            province: province || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            userId
          });
        }
        if (loc) finalLocationId = loc.id;
      }

      let finalStoreId = existingStoreId || null;
      if (!finalStoreId && store_name && store_name.trim()) {
        const store = await Store.findOrCreate({
          name: store_name.trim(),
          address: store_address || null,
          locationId: finalLocationId,
          storeType: store_type,
          userId
        }, client);
        if (store) finalStoreId = store.id;
      }

      // 2. Prepare items list
      let itemList = [];
      if (items && items.length > 0) {
        itemList = items;
      } else if (product_name) {
        itemList = [
          {
            product_name,
            brand_name,
            category_id,
            model,
            description,
            photo_url,
            quantity: Number(quantity) || 1,
            unit_price: Number(unit_price) || 0,
            notes: item_notes
          }
        ];
      }

      if (itemList.length === 0) {
        throw new AppError('Minimal harus ada 1 barang dalam pembelian.', 400);
      }

      let totalAmount = 0;
      itemList.forEach(item => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unit_price) || 0;
        totalAmount += qty * price;
      });

      // 3. Create Purchase Header
      const purchase = await Purchase.create({
        invoiceNumber: invoice_number,
        storeId: finalStoreId,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        paymentMethod: payment_method,
        notes,
        totalAmount,
        purchaseDate: purchase_date,
        userId
      }, client);

      const purchaseId = purchase.id;
      const createdItems = [];

      // 4. Process each item (Requirement #3: Auto-register & Requirement #4: Price History)
      for (const item of itemList) {
        const itemName = (item.product_name || item.name || '').trim();
        const bName = (item.brand_name || '').trim();

        if (!itemName) {
          throw new AppError('Nama produk harus diisi.', 400);
        }

        // Resolve Brand
        let brandId = item.brand_id || null;
        if (!brandId && bName) {
          let brand = await Brand.findByName(bName, userId);
          if (!brand) {
            brand = await Brand.create({ name: bName, userId });
          }
          if (brand) brandId = brand.id;
        }

        // Check if product exists in database by (Name + Brand)
        let product = await Product.findByNameAndBrand(itemName, brandId, userId, client);
        let isNewProduct = false;

        if (!product) {
          // AUTO-REGISTER PRODUCT (Requirement #3)
          product = await Product.create({
            name: itemName,
            brandId: brandId,
            categoryId: item.category_id ? Number(item.category_id) : null,
            model: item.model || null,
            description: item.description || null,
            photoUrl: item.photo_url || null,
            userId
          }, client);
          isNewProduct = true;
        } else {
          if ((item.photo_url && !product.photo_url) || (item.model && !product.model) || (item.category_id && !product.category_id)) {
            await Product.update(product.id, userId, {
              photoUrl: item.photo_url || product.photo_url,
              model: item.model || product.model,
              categoryId: item.category_id ? Number(item.category_id) : product.category_id
            }, client);
          }
        }

        const itemQty = Number(item.quantity) || 1;
        const itemPrice = Number(item.unit_price) || 0;
        const subtotal = itemQty * itemPrice;

        // Check previous price for price history tracking (Requirement #4)
        const previousRecord = await PurchaseItem.getLatestPrice(product.id, null, client);

        // Insert Purchase Item
        const purchaseItemId = await PurchaseItem.create({
          purchaseId,
          productId: product.id,
          quantity: itemQty,
          unitPrice: itemPrice,
          subtotal,
          notes: item.notes || null
        }, client);

        // If previous purchase exists and price is different, record in price_histories
        if (previousRecord && previousRecord.unit_price !== itemPrice) {
          await PriceHistory.create({
            productId: product.id,
            storeId: finalStoreId,
            purchaseItemId,
            oldPrice: previousRecord.unit_price,
            newPrice: itemPrice,
            userId,
            recordedAt: purchase_date
          }, client);
        }

        createdItems.push({
          id: purchaseItemId,
          product_id: product.id,
          product_name: product.name,
          brand_name: bName,
          quantity: itemQty,
          unit_price: itemPrice,
          subtotal,
          is_new_product: isNewProduct
        });
      }

      await client.query('COMMIT');

      return {
        purchase,
        items: createdItems
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getPurchaseById(id, userId) {
    const purchase = await Purchase.findById(id, userId);
    if (!purchase) {
      throw new AppError('Pembelian tidak ditemukan', 404);
    }
    const items = await PurchaseItem.findByPurchaseId(id);
    return {
      ...purchase,
      items
    };
  }

  static async getAllPurchases(userId, filters) {
    const purchases = await Purchase.findAll(userId, filters);
    const total = await Purchase.count(userId, filters);
    return {
      purchases,
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1,
      limit: filters.limit || 20,
      total_pages: Math.ceil(total / (filters.limit || 20))
    };
  }

  static async updatePurchase(id, userId, updateData) {
    const existing = await Purchase.findById(id, userId);
    if (!existing) {
      throw new AppError('Pembelian tidak ditemukan', 404);
    }
    return Purchase.update(id, userId, updateData);
  }

  static async deletePurchase(id, userId) {
    const existing = await Purchase.findById(id, userId);
    if (!existing) {
      throw new AppError('Pembelian tidak ditemukan', 404);
    }
    await Purchase.delete(id, userId);
    return { message: 'Pembelian berhasil dihapus' };
  }

  static async getAllLocations(userId) {
    return Purchase.getAllLocations(userId);
  }
}

module.exports = PurchaseService;
