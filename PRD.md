# Product Requirements Document (PRD)
**Nama Proyek:** Simple Web E-Commerce (Zero-Cost MVP)  
**Versi Dokumen:** 1.0  
**Tanggal:** 3 November 2026  
**Status:** Draft / Siap Eksekusi  

---

## 1. Ringkasan Proyek (Executive Summary)
Proyek ini bertujuan untuk membangun platform website e-commerce mandiri yang ringan, mudah dikelola, dan berjalan di atas infrastruktur **100% gratis (Zero-Cost Tech Stack)**. 

Untuk memangkas biaya bulanan server dan biaya potongan per transaksi (*fee* Payment Gateway), sistem ini menggunakan pendekatan **Guest Checkout** (belanja tanpa wajib registrasi akun) dan **Semi-Automated WhatsApp Checkout** (konfirmasi pembayaran dan pengiriman difasilitasi melalui integrasi pesan WhatsApp otomatis serta verifikasi manual di Dashboard Admin).

---

## 2. Tujuan & Target Keberhasilan (Objectives)
1. **Biaya Operasional Infrastruktur Rp 0:** Memanfaatkan layanan *cloud free-tier* untuk aplikasi web, database, dan penyimpanan media tanpa biaya langganan bulanan.
2. **Kemudahan Pembeli (Low Friction):** Pembeli dapat memilih barang hingga melakukan *checkout* dalam waktu kurang dari 2 menit tanpa harus membuat akun terlebih dahulu.
3. **Kemudahan Operasional Klien (Admin):** Klien dapat mengelola katalog produk, memantau pesanan masuk, mencegah stok minus (*overselling*), dan memperbarui nomor resi melalui satu halaman *dashboard* yang intuitif.

---

## 3. Peran Pengguna (User Roles)

| Peran | Deskripsi | Akses Sistem |
| :--- | :--- | :--- |
| **Pembeli (Guest User)** | Pengunjung website yang melihat katalog, memasukkan barang ke keranjang, melakukan *checkout*, dan melacak status pesanan via nomor *invoice*. | Publik (Tanpa Login) |
| **Admin Toko (Klien)** | Pemilik atau pengelola toko yang mengatur katalog produk, memverifikasi pembayaran mutasi bank/QRIS, dan memproses pengiriman barang. | Terproteksi (Wajib Login di `/admin`) |

---

## 4. Alur Sistem Utama (User Flow)

### 4.1. Alur Pembeli (Customer Journey)
1. **Eksplorasi:** Pembeli membuka halaman utama, mencari produk lewat kolom pencarian atau filter kategori, dan melihat halaman detail produk.
2. **Keranjang Belanja:** Pembeli memilih jumlah barang dan menekan tombol *"Tambah ke Keranjang"*. Data keranjang disimpan di memori browser (`localStorage`).
3. **Checkout & Ongkir:** Pembeli membuka keranjang, menekan *"Checkout"*, lalu mengisi Nama, Nomor WhatsApp, Alamat Lengkap, dan memilih Kota/Kurir pengiriman.
4. **Pembuatan Pesanan:** Saat menekan *"Buat Pesanan"*, sistem menyimpan data ke database dengan status `PENDING` dan menerbitkan nomor *invoice* unik (contoh: `INV-20261103-001`).
5. **Instruksi Bayar & Redirect WhatsApp:** Layar menampilkan rincian tagihan, nomor rekening / gambar QRIS statis toko, serta tombol *"Konfirmasi via WhatsApp"* yang otomatis membuka aplikasi WhatsApp dengan format pesan pesanan yang sudah terisi lengkap.
6. **Lacak Pesanan:** Pembeli dapat mengecek status pesanan dan nomor resi kapan saja dengan memasukkan nomor *invoice* di menu *"Cek Pesanan"*.

### 4.2. Alur Admin (Order Fulfillment Flow)
1. **Notifikasi:** Admin menerima pesan WhatsApp dari pembeli berisi Nomor Invoice dan rincian pesanan.
2. **Verifikasi Pembayaran:** Admin mengecek mutasi rekening bank atau aplikasi QRIS toko setelah pembeli mengirimkan bukti transfer.
3. **Konfirmasi & Potong Stok:** Admin membuka Dashboard (`/admin`), mencari Nomor Invoice terkait, dan mengubah status dari `PENDING` menjadi `PAID`. Sistem secara otomatis memotong stok produk di database.
4. **Pengiriman:** Admin mengemas barang, mengirimkannya ke kurir, lalu memasukkan nomor resi dan mengubah status pesanan menjadi `SHIPPED`.

---

## 5. Kebutuhan Fungsional (Functional Requirements)

### 5.1. Modul Pelanggan (Storefront)
* **[FR-01] Katalog & Pencarian Produk:**
  * Menampilkan daftar produk aktif (`is_active = true`) beserta foto, nama, harga, dan indikator ketersediaan stok (*Stok Habis* jika `stock = 0`).
  * Fitur pencarian berdasarkan kata kunci nama produk dan filter berdasarkan kategori.
* **[FR-02] Halaman Detail Produk:**
  * Menampilkan foto produk ukuran penuh, deskripsi lengkap, berat barang, sisa stok, dan tombol tambah ke keranjang.
  * Mencegah input jumlah pembelian melebihi sisa stok yang tersedia.
* **[FR-03] Keranjang Belanja (`localStorage`):**
  * Tambah item, ubah kuantitas (`+` / `-`), hapus item, dan kalkulasi subtotal otomatis di sisi klien (*client-side*).
* **[FR-04] Halaman Checkout:**
  * Validasi input wajib: Nama Lengkap, Nomor WhatsApp aktif (format angka), Alamat Lengkap, dan Pilihan Kota/Kurir.
  * Kalkulasi otomatis: $\text{Total Bayar} = \sum (\text{Harga Produk} \times \text{Kuantitas}) + \text{Ongkos Kirim}$.
  * Validasi stok ulang ke database sebelum menyimpan pesanan. Jika stok tiba-tiba habis, tampilkan pesan peringatan.
* **[FR-05] Halaman Invoice & WhatsApp Generator:**
  * Menampilkan ringkasan pesanan berdasarkan `invoice_number`.
  * Menampilkan info pembayaran toko (Nomor Rekening & gambar QRIS Statis).
  * Tombol *direct link* ke API WhatsApp (`https://wa.me/628xxx?text=...`) dengan teks terformat rapi.
* **[FR-06] Halaman Lacak Pesanan (Order Tracking):**
  * Input pencarian berdasarkan `invoice_number` untuk melihat status terkini (`PENDING`, `PAID`, `SHIPPED`, `CANCELLED`) beserta nomor resi pengiriman.

### 5.2. Modul Admin (Backoffice)
* **[FR-07] Autentikasi Admin:**
  * Halaman login menggunakan Email/Username dan Password yang terenkripsi (menggunakan *session* / JWT).
* **[FR-08] Dashboard Ringkasan:**
  * Menampilkan metrik sederhana: Total Pesanan Baru (`PENDING`), Total Pesanan Diproses (`PAID`), Total Pendapatan Bulan Ini, dan daftar produk yang stoknya menipis ($\text{stok} \le 5$).
* **[FR-09] Manajemen Kategori & Produk (CRUD):**
  * Tambah, lihat, edit, dan hapus/nonaktifkan kategori serta produk.
  * Unggah foto produk ke penyimpanan *cloud* (otomatis dikompresi/diubah ke format `.webp` agar hemat kuota penyimpanan).
* **[FR-10] Manajemen Pesanan & Stok:**
  * Tabel daftar pesanan dengan filter berdasarkan status dan pencarian Nomor Invoice / Nama Pembeli.
  * Fitur ubah status pesanan:
    * `PENDING` $\rightarrow$ `PAID`: **Memicu transaksi database untuk memotong stok produk.**
    * `PAID` $\rightarrow$ `SHIPPED`: Membuka kolom input `tracking_number` (Nomor Resi) dan menyediakan tombol pintas untuk mengirim info resi ke WhatsApp pembeli.
    * `PENDING` $\rightarrow$ `CANCELLED`: Membatalkan pesanan tanpa memotong stok.
* **[FR-11] Pengaturan Toko & Ongkir:**
  * Mengelola daftar tarif ongkir per wilayah/kota (jika menggunakan tabel ongkir manual) atau konfigurasi kota asal pengiriman (jika menggunakan API RajaOngkir Starter).

---

## 6. Arsitektur & Tech Stack (100% Gratis)

| Komponen | Rekomendasi Layanan (Free Tier) | Batasan Kuota Gratis |
| :--- | :--- | :--- |
| **Aplikasi Web (Full-Stack)** | Next.js (App Router) di **Vercel** atau **Cloudflare Pages** | Bandwidth 100 GB/bulan, SSL/HTTPS gratis, subdomain `.vercel.app` gratis. |
| **Database Relasional** | **TiDB Cloud Serverless** / **Aiven** / **Layerbase** (MySQL/MariaDB Compatible) | Kapasitas penyimpanan 1 GB – 5 GB gratis tanpa kartu kredit. |
| **Penyimpanan Media (Foto)** | **Cloudinary** atau **Supabase Storage** | 1 GB – 25 GB gratis (cukup untuk >5.000 foto produk ukuran ~150 KB). |
| **Kalkulasi Ongkir** | **Tabel Ongkir Flat/Zona** di Database *atau* **RajaOngkir Starter API** | RajaOngkir Starter mendukung JNE, POS, TIKI tingkat Kabupaten/Kota. |

---

## 7. Skema Database (Data Model)

```sql
-- 1. Tabel Kategori Produk
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- 2. Tabel Katalog Produk
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    weight_gram INT NOT NULL DEFAULT 100,
    image_url VARCHAR(500),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. Tabel Tarif Ongkir Manual (Opsional jika tidak memakai API Pihak Ketiga)
CREATE TABLE shipping_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(150) NOT NULL,
    courier_name VARCHAR(50) NOT NULL,
    cost_per_kg DECIMAL(12,2) NOT NULL
);

-- 4. Tabel Header Pesanan
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_whatsapp VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    courier_info VARCHAR(100) NOT NULL,
    shipping_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING', 'PAID', 'SHIPPED', 'CANCELLED') DEFAULT 'PENDING',
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Detail Item Pesanan (Snapshot Harga & Nama)
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 8. Kebutuhan Non-Fungsional & Penanganan Masalah Teknis

1. **Pencegahan Stok Minus (Concurrency Control):**
   * Stok tidak dipotong saat pesanan baru dibuat (`PENDING`) untuk mencegah *ghost order* (orang iseng memborong stok tanpa membayar).
   * Saat Admin mengubah status ke `PAID`, sistem wajib menjalankan **Database Transaction** (`BEGIN` ... `SELECT stock FOR UPDATE` ... `COMMIT`). Jika stok saat itu tidak mencukupi, sistem menolak perubahan status dan menampilkan pesan error kepada Admin.
2. **Optimasi Penyimpanan Gratis:**
   * Setiap foto produk yang diunggah Admin wajib dibatasi maksimal ukuran file 2 MB dan dikompresi di sisi *client/server* ke resolusi maksimal $1080 \times 1080$ piksel dengan format `.webp`.
3. **Antisipasi Database Cold Start:**
   * Layanan database gratis dapat mengalami mode *sleep* jika tidak ada trafik. Aplikasi perlu menampilkan *skeleton loading* yang rapi saat mengambil data katalog agar pengguna tetap nyaman menunggu $2\text{--}3$ detik pada kunjungan pertama.
4. **Desain Responsif (Mobile-First):**
   * Mengingat mayoritas transaksi berujung di WhatsApp, antarmuka toko dan dashboard admin wajib dioptimalkan untuk layar *smartphone*.

---

## 9. Batasan Proyek (Out of Scope - Fase MVP)
Hal-hal berikut **tidak termasuk** dalam ruang lingkup pengerjaan versi pertama (MVP) ini agar proyek tetap sederhana dan bebas biaya:
* Integrasi *Payment Gateway* otomatis (Midtrans/Xendit) karena membutuhkan biaya transaksi dan verifikasi legalitas/NPWP.
* Sistem registrasi/login akun untuk pembeli, fitur *wishlist*, dan ulasan/rating bintang.
* Sistem retur barang atau pengembalian dana (*refund*) otomatis di dalam aplikasi.
* Cetak label pengiriman berstandar *barcode* kurir atau *request pickup* otomatis ke kurir.
* Pembelian domain kustom (`.com` / `.id`) — jika klien menginginkan nama domain sendiri di luar subdomain gratis `.vercel.app`, biaya sewa domain tahunan ditanggung oleh klien.

---

## 10. Tahapan Pengerjaan (Development Roadmap)

* **Minggu 1: Setup Infrastruktur & Database**
  * Inisialisasi proyek, koneksi ke database *cloud* gratis, pembuatan skema tabel, dan konfigurasi autentikasi Admin.
* **Minggu 2: Pengembangan Modul Admin (Backoffice)**
  * Pembuatan fitur CRUD Kategori, CRUD Produk + integrasi upload gambar ke Cloudinary/Supabase, dan pengaturan tarif ongkir.
* **Minggu 3: Pengembangan Storefront & Alur Checkout**
  * Pembuatan halaman katalog, detail produk, keranjang belanja (`localStorage`), halaman *checkout*, generator pesan WhatsApp, dan halaman lacak pesanan.
* **Minggu 4: Manajemen Order, Pengujian, & Deployment**
  * Pembuatan fitur kelola status pesanan di Admin (termasuk logika *database transaction* pemotongan stok), uji coba alur *end-to-end*, dan *deployment* ke Vercel.