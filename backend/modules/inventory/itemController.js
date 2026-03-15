const db = require('../../config/database');
const generateCode = require('../../shared/codeGenerator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const getAllItems = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المادة غير موجودة' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const createItem = async (req, res) => {
  const { name, description, category, quantity, purchase_price, sale_price, min_stock } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const prefix = category === 'audio' ? 'So' : 'Me';
    const code = await generateCode(prefix, 'items', 'code');
    
    const result = await db.query(
      `INSERT INTO items 
       (code, name, description, category, quantity, purchase_price, sale_price, min_stock, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, name, description, category, quantity, purchase_price, sale_price, min_stock, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, quantity, purchase_price, sale_price, min_stock } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    let query = 'UPDATE items SET name = $1, description = $2, category = $3, quantity = $4, purchase_price = $5, sale_price = $6, min_stock = $7';
    let params = [name, description, category, quantity, purchase_price, sale_price, min_stock];
    
    if (image_url) {
      query += ', image_url = $8 WHERE id = $9 RETURNING *';
      params.push(image_url, id);
    } else {
      query += ' WHERE id = $8 RETURNING *';
      params.push(id);
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المادة غير موجودة' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM items WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المادة غير موجودة' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const updateQuantity = async (itemId, quantityChange) => {
  await db.query(
    'UPDATE items SET quantity = quantity + $1 WHERE id = $2',
    [quantityChange, itemId]
  );
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  updateQuantity,
  upload: upload.single('image')
};
