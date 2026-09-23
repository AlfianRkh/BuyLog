# BuyLog - Aplikasi Pencatatan & Pembandingan Pembelian Barang

Aplikasi full-stack untuk pencatatan transaksi pembelian barang, pemantauan pengeluaran bulanan, dan pembandingan harga produk antar toko/lokasi berbasis REST API.

---

## Fitur Utama

1. **Authentication (JWT & Bcrypt)**
   - Registrasi dan Login pengguna dengan token JWT yang aman
   - Manajemen profil dan ubah password
   - Proteksi semua endpoint data transaksi

2. **Dashboard Monitoring Bulanan**
   - Ringkasan 4 metrik utama: Total Pembelian (Rp), Jumlah Transaksi, Jumlah Barang, dan Jumlah Merk
   - Indikator perbandingan tren persentase pengeluaran terhadap bulan lalu
   - Grafik Donut Chart interaktif untuk rincian pengeluaran per kategori
   - Daftar transaksi pembelian terbaru

3. **Catat Pembelian + Lokasi Maps & Foto Produk**
   - Pencatatan transaksi lengkap: Tanggal, Kategori, Nama Barang, Merk, Model, Jumlah, Harga Satuan, Metode Pembayaran, Catatan
   - **Auto-Check & Auto-Register**: Sistem otomatis memeriksa apakah barang sudah terdaftar berdasarkan kombinasi Nama Produk & Merk. Jika belum ada, produk langsung didaftarkan ke database tanpa perlu input terpisah
   - **Pemetaan Lokasi**: Interaktif Map (Leaflet & OpenStreetMap) untuk menandai koordinat toko/tempat belanja secara presisi
   - **Upload Foto**: Unggah foto nota atau foto fisik produk

4. **Histori Perubahan Harga Produk (Price Change History)**
   - Sistem secara otomatis mencatat riwayat perubahan harga setiap kali barang yang sama dibeli dengan harga berbeda
   - Melacak harga lama, harga baru, selisih nominal (Rp), dan persentase kenaikan/penurunan harga
   - Visualisasi timeline perubahan harga pada halaman detail produk

5. **Referensi & Perbandingan Harga Antar Toko (Multi-Store Price Reference)**
   - Menampilkan seluruh riwayat harga dan lokasi pembelian sebelumnya untuk setiap produk
   - Metrik perbandingan harga: Harga Terendah (Rekomendasi), Harga Rata-Rata, Harga Tertinggi, dan Potensi Penghematan
   - Tabel perbandingan komprehensif antar toko fisik, online, maupun marketplace

6. **Laporan & Statistik Pengeluaran**
   - Statistik pengeluaran bulanan
   - Peringkat Toko Paling Sering dikunjungi
   - Peringkat Barang Paling Sering dibeli
   - Peringkat Lokasi transaksi terbanyak

7. **Peta Sebaran Belanja (Maps View)**
   - Peta interaktif dengan pin lokasi semua transaksi pembelian yang dikelompokkan berdasarkan jenis toko (Fisik, Online, Marketplace)

---

## Arsitektur & Struktur Direktori

Aplikasi dibangun menggunakan prinsip **Clean Code & Clean Architecture**:

```
BuyLog/
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable Layout, Charts, & Maps
│   │   │   ├── charts/         # CategoryDonutChart (Chart.js)
│   │   │   ├── layout/         # Sidebar, Header, AppLayout
│   │   │   └── maps/           # LocationPicker, LocationMap (Leaflet)
│   │   ├── contexts/           # AuthContext, ToastContext
│   │   ├── pages/              # Modul Halaman
│   │   │   ├── auth/           # LoginPage, RegisterPage
│   │   │   ├── dashboard/      # DashboardPage
│   │   │   ├── pembelian/      # List, Create, Detail
│   │   │   ├── barang/         # List, Detail (Price Ref & History)
│   │   │   ├── laporan/        # LaporanPage
│   │   │   ├── lokasi/         # LokasiPage
│   │   │   ├── merk/           # MerkPage
│   │   │   ├── toko/           # TokoPage
│   │   │   └── pengaturan/     # PengaturanPage
│   │   ├── services/           # REST API client
│   │   ├── styles/             # Design tokens & Global CSS
│   │   └── utils/              # Indonesian currency & date formatters
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend (Express + PostgreSQL)
│   ├── src/
│   │   ├── config/             # DB & JWT config
│   │   ├── controllers/        # Request & response handlers
│   │   ├── database/           # Migrations & realistic demo seeders
│   │   ├── middleware/         # JWT Auth, Error Handler, Upload, Validation
│   │   ├── models/             # Data Access Object (DAO) pattern
│   │   ├── routes/             # REST API routing
│   │   ├── services/           # Core Business Logic Layer
│   │   └── app.js              # Express app setup
│   ├── uploads/                # Directory foto produk/nota
│   ├── server.js               # Entry point
│   └── package.json
│
└── README.md
```

---

## Cara Menjalankan Aplikasi

### 1. Menjalankan Backend Server
```bash
cd server
npm install
npm run dev # atau: npm start
```
*Backend berjalan di: `http://localhost:5001`*

### 2. Menjalankan Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend berjalan di: `http://localhost:5173`*

---

## Kredensial Demo Akun

- **Email:** `alfian@example.com`
- **Password:** `password123`
