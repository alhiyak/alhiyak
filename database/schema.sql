-- جدول المستخدمين
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الأعضاء
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    member_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    type VARCHAR(20) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول المواد
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(10) NOT NULL CHECK (category IN ('audio', 'media')),
    quantity DECIMAL(10,2) DEFAULT 0,
    purchase_price DECIMAL(10,3),
    sale_price DECIMAL(10,3),
    min_stock DECIMAL(10,2),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول العمليات الرئيسي
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_code VARCHAR(20) UNIQUE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'purchase', 'damage', 'association', 'tasweeb')),
    date DATE NOT NULL,
    member_id INT REFERENCES members(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES members(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,3) NOT NULL,
    notes TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول تفاصيل العمليات
CREATE TABLE transaction_items (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,3),
    total_price DECIMAL(10,3) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- جدول إعدادات النظام
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value DECIMAL(10,3) DEFAULT 0,
    description TEXT
);

-- إدخال المستخدم الافتراضي (admin/admin123)
INSERT INTO users (username, password, full_name, role) VALUES 
('admin', '$2b$10$8KxZ1P7Q8Z9x9x9x9x9x9uQ8KxZ1P7Q8Z9x9x9x9x9x9x9x9x9x9x', 'مدير النظام', 'admin');

-- إدخال إعدادات المرحل
INSERT INTO system_settings (key, value, description) VALUES 
('carryover_association', 0, 'المبلغ المرحل من الجمعية'),
('carryover_tasweeb', 0, 'المبلغ المرحل من التثويبات');
