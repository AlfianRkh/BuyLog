const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { secret, expiresIn } = require('../config/jwt');
const { AppError } = require('../middleware/errorHandler');

class AuthService {
  static async register({ name, email, password, avatar }) {
    const existing = await User.findByEmail(email);
    if (existing) {
      throw new AppError('Email sudah terdaftar. Gunakan email lain.', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      avatar
    });

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    };
  }

  static async login({ email, password }) {
    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new AppError('Email atau password salah.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Email atau password salah.', 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      token
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }
    return user;
  }

  static async updateProfile(userId, { name, avatar }) {
    return User.update(userId, { name, avatar });
  }

  static async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId);
    const fullUser = await User.findByEmail(user.email);
    const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);
    if (!isMatch) {
      throw new AppError('Password saat ini salah', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await User.updatePassword(userId, passwordHash);

    return { message: 'Password berhasil diubah' };
  }
}

module.exports = AuthService;
