const db = require('../../config/database');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../config/auth');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة السر غير صحيحة' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة السر غير صحيحة' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const register = async (req, res) => {
  const { username, password, full_name, role } = req.body;
  try {
    const existing = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, full_name, role',
      [username, hashedPassword, full_name, role || 'user']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { login, register };