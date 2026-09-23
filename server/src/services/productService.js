const Product = require('../models/Product');
const Brand = require('../models/Brand');
const { AppError } = require('../middleware/errorHandler');

class ProductService {
  static async getAllProducts(userId, filters) {
    const products = await Product.findAll(userId, filters);
    const total = await Product.count(userId, filters);
    return {
      products,
      total,
      page: Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1,
      limit: filters.limit || 50,
      total_pages: Math.ceil(total / (filters.limit || 50))
    };
  }

  static async getProductById(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }
    return product;
  }

  static async checkProductExistence(name, brandName, userId) {
    if (!name) return { exists: false, product: null };
    
    let brandId = null;
    if (brandName) {
      const brand = await Brand.findByName(brandName, userId);
      if (brand) brandId = brand.id;
    }

    const product = await Product.findByNameAndBrand(name, brandId, userId);
    return {
      exists: !!product,
      product: product || null
    };
  }

  static async createProduct(userId, { name, brand_name, brand_id, category_id, model, description, photo_url }) {
    let finalBrandId = brand_id;
    if (!finalBrandId && brand_name) {
      const brand = await Brand.findOrCreate(brand_name, userId);
      if (brand) finalBrandId = brand.id;
    }

    const existing = await Product.findByNameAndBrand(name, finalBrandId, userId);
    if (existing) {
      throw new AppError('Produk dengan nama dan merk ini sudah terdaftar', 400);
    }

    return Product.create({
      name,
      brandId: finalBrandId,
      categoryId: category_id ? Number(category_id) : null,
      model,
      description,
      photoUrl: photo_url,
      userId
    });
  }

  static async updateProduct(id, userId, updateData) {
    const existing = await Product.findById(id);
    if (!existing) {
      throw new AppError('Produk tidak ditemukan', 404);
    }

    let finalBrandId = updateData.brand_id;
    if (!finalBrandId && updateData.brand_name) {
      const brand = await Brand.findOrCreate(updateData.brand_name, userId);
      if (brand) finalBrandId = brand.id;
    }

    return Product.update(id, userId, {
      name: updateData.name,
      brandId: finalBrandId,
      categoryId: updateData.category_id,
      model: updateData.model,
      description: updateData.description,
      photoUrl: updateData.photo_url
    });
  }

  static async deleteProduct(id, userId) {
    const existing = await Product.findById(id);
    if (!existing) {
      throw new AppError('Produk tidak ditemukan', 404);
    }
    await Product.delete(id, userId);
    return { message: 'Produk berhasil dihapus' };
  }

  static async getPriceReference(productId, userId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }
    return Product.getPriceReference(productId, userId);
  }

  static async getPriceHistory(productId, userId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError('Produk tidak ditemukan', 404);
    }
    return Product.getPriceHistory(productId, userId);
  }
}

module.exports = ProductService;
