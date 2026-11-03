-- Skema Database E-Commercequ (MySQL Compatible: TiDB Serverless / Aiven / Local)

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
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

CREATE TABLE IF NOT EXISTS shipping_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(150) NOT NULL,
    courier_name VARCHAR(50) NOT NULL,
    cost_per_kg DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
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

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS order_tracking_checkpoints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    description VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    sender ENUM('BUYER', 'SELLER') NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Seed Contoh Awal Kategori
INSERT IGNORE INTO categories (id, name, slug) VALUES 
(1, 'Fashion & Pakaian', 'fashion-pakaian'),
(2, 'Elektronik & Gadget', 'elektronik-gadget'),
(3, 'Kopi & Makanan', 'kopi-makanan');

-- Seed Contoh Awal Tarif Ongkir Flat / Zona
INSERT IGNORE INTO shipping_zones (id, city_name, courier_name, cost_per_kg) VALUES
(1, 'Jabodetabek', 'JNE Reguler', 10000),
(2, 'Bandung & Jawa Barat', 'JNE Reguler', 12000),
(3, 'Semarang & Jawa Tengah', 'JNE Reguler', 16000),
(4, 'Surabaya & Jawa Timur', 'JNE Reguler', 18000),
(5, 'Luar Pulau Jawa', 'JNE Reguler', 30000);

-- Seed Dummy Produk Awal (Katalog Siap Pakai)
INSERT IGNORE INTO products (id, category_id, name, slug, price, stock, weight_gram, image_url, description, is_active) VALUES
(1, 1, 'Kemeja Oversized Linen Putih', 'kemeja-oversized-linen-putih', 189000, 15, 250, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', 'Kemeja pria & wanita berbahan linen premium yang adem, jatuh dengan rapi, dan cocok untuk tampilan kasual minimalis.', TRUE),
(2, 1, 'Celana Chino Slim Fit Charcoal', 'celana-chino-slim-fit-charcoal', 225000, 8, 400, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', 'Celana bahan katun twill stretch warna abu arang dengan potongan slim-fit yang fleksibel dan nyaman dipakai seharian.', TRUE),
(3, 1, 'Totebag Kanvas Heavyweight 16oz', 'totebag-kanvas-heavyweight-16oz', 95000, 3, 200, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80', 'Tas jinjing kanvas tebal dengan kompartemen laptop 14 inci dan ritsleting YKK. Sisa stok terbatas!', TRUE),
(4, 2, 'Mechanical Keyboard TKL Wireless', 'mechanical-keyboard-tkl-wireless', 450000, 12, 850, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80', 'Keyboard mekanik layout tenkeyless dengan konektivitas Bluetooth 5.0, baterai 3000mAh, dan tactile brown switch.', TRUE),
(5, 2, 'Mouse Nirkabel Ergonomis Silent Click', 'mouse-nirkabel-ergonomis-silent-click', 135000, 20, 120, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80', 'Mouse kantor senyap tanpa bunyi klik berisik. Dilengkapi switch DPI variabel dan desain pegangan natural.', TRUE),
(6, 2, 'Earphone USB-C Hi-Fi DAC', 'earphone-usb-c-hi-fi-dac', 85000, 0, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', 'Earphone in-ear monitor dengan chip DAC internal untuk bass bertenaga dan vokal jernih pada smartphone tanpa jack audio.', TRUE),
(7, 3, 'Kopi Arabika Gayo Single Origin 250g', 'kopi-arabika-gayo-single-origin-250g', 85000, 25, 260, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80', 'Biji kopi sangrai medium-dark khas dataran tinggi Aceh Gayo dengan notes cokelat manis, rempah, dan keasaman seimbang.', TRUE),
(8, 3, 'Drip Bag Coffee Box (Isi 10 Sachet)', 'drip-bag-coffee-box-isi-10-sachet', 75000, 4, 150, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 'Praktis seduh kopi asli tanpa ampas di mana saja. Cukup tambahkan 150ml air panas.', TRUE);


