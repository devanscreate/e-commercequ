# E-Commercequ (Zero-Cost MVP)

Platform website e-commerce mandiri yang dibangun dengan arsitektur **Zero-Cost Tech Stack** menggunakan Next.js (App Router), Tailwind CSS, MySQL (kompatibel TiDB Cloud Serverless / Aiven / Local), alur **Guest Checkout**, dan **Semi-Automated WhatsApp Checkout**.

---

## 🎨 Palet Desain (Modern Minimalist / Clean Tech)
* **Primary:** `#0F172A` (Slate 900)
* **Background:** `#F8FAFC` (Slate 50)
* **Surface/Card:** `#FFFFFF`
* **Accent (Action):** `#2563EB` (Royal Blue)
* **Success/WA:** `#22C55E` (Emerald Green)

---

## 🚀 Fitur yang Telah Diimplementasikan

### 1. Etalase Pembeli (Storefront - Tanpa Wajib Login)
* **Katalog & Filter ([FR-01]):** Pencarian kata kunci produk, filter berdasarkan kategori, indikator sisa stok / stok habis, serta skeleton loading.
* **Detail Produk ([FR-02]):** Foto produk, berat (gram), deskripsi lengkap, pembatasan kuantitas sesuai sisa stok.
* **Keranjang Belanja ([FR-03]):** Berbasis browser `localStorage`, ubah jumlah barang (`+` / `-`), hapus barang, kalkulasi subtotal.
* **Checkout Cepat ([FR-04]):** Formulir nama lengkap, nomor WhatsApp aktif, alamat pengiriman, dan pilihan zona kota/kurir. Validasi stok sebelum pesanan dibuat.
* **Invoice & WhatsApp Generator ([FR-05]):** Nomor invoice unik (`INV-YYYYMMDD-XXXX`), rekening pembayaran & scan QRIS toko, tombol direct link konfirmasi via WhatsApp (`https://wa.me/...`) dengan format pesan pesanan lengkap.
* **Lacak Status Pesanan ([FR-06]):** Pelacakan status (`PENDING`, `PAID`, `SHIPPED`, `CANCELLED`) beserta nomor resi kurir.

### 2. Backoffice Admin (`/admin`)
* **Autentikasi ([FR-07]):** Login terenkripsi JWT HTTP-only Cookie (`/admin/login`). Default: `admin` / `adminpassword123`.
* **Dashboard Metrik ([FR-08]):** Total pesanan pending, pesanan perlu dikirim, pesanan terkirim, estimasi omset, dan deteksi peringatan produk stok menipis ($\le 5$).
* **Katalog Produk CRUD ([FR-09]):** Tambah produk baru, ubah harga, kelola sisa stok, status aktif/nonaktif, dan hapus produk.
* **Kategori CRUD:** Tambah, edit, dan hapus kategori produk.
* **Manajemen Pesanan & Concurrency Control ([FR-10]):**
  * Perubahan `PENDING` $\rightarrow$ `PAID` menjalankan **Database Transaction** dengan row-level lock (`SELECT ... FOR UPDATE`) untuk mencegah *overselling* / minus stok.
  * Perubahan `PAID` $\rightarrow$ `SHIPPED` memfasilitasi input nomor resi kurir dan pintasan pengiriman resi langsung ke WhatsApp pelanggan.
* **Tarif Pengiriman ([FR-11]):** Pengaturan daftar tarif ongkir flat/zona per wilayah.

---

## 🛠️ Panduan Pengujian Manual oleh Pengguna

Sesuai aturan panduan kerja (*Rule 2: No Self-Testing or Auto-Execution*), dev server dan pengujian diserahkan sepenuhnya kepada Anda:

### 1. Konfigurasi Database
Sesuaikan file [`.env.local`](file:///d:/1.%20WEB/e-commercequ/.env.local) dengan kredensial database MySQL Anda (misal: TiDB Cloud Serverless gratis, Aiven, atau MySQL lokal).

### 2. Inisialisasi Skema & Data Awal
Jalankan perintah berikut di terminal Anda untuk membuat tabel dan data kategori awal:
```bash
npm run init-db
```

### 3. Menjalankan Server Pengembangan
Jalankan perintah berikut di terminal Anda:
```bash
npm run dev
```
Buka browser di:
* **Etalase Toko:** [http://localhost:3000](http://localhost:3000)
* **Pelacakan Pesanan:** [http://localhost:3000/track](http://localhost:3000/track)
* **Dashboard Admin:** [http://localhost:3000/admin](http://localhost:3000/admin) (Login: `admin` / `adminpassword123`)

