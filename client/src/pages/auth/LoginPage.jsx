import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';
import './AuthPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('alfian@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Harap isi email dan password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Selamat datang kembali di BuyLog!');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Gagal login. Silakan periksa kembali akun Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-header">
          <div className="auth-logo">
            <ShoppingBag size={28} color="#FFFFFF" />
          </div>
          <h1 className="auth-title">BuyLog</h1>
          <p className="auth-subtitle">Masuk untuk mencatat & membandingkan pembelian</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input with-icon"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input with-icon"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Memproses...' : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-demo-hint">
          <strong>Demo Login:</strong>
          <span>Email: alfian@example.com / Pass: password123</span>
        </div>

        <div className="auth-footer">
          Belum punya akun?{' '}
          <Link to="/register" className="auth-link">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
