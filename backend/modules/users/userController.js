const db = require('../../config/database');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, username, full_name, role, created_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT id, username, full_name, role, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, role, password } = req.body;
  try {
    let query = 'UPDATE users SET username = $1, full_name = $2, role = $3';
    let params = [username, full_name, role];
    
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = $4 WHERE id = $5 RETURNING id, username, full_name, role';
      params.push(hashedPassword, id);
    } else {
      query += ' WHERE id = $4 RETURNING id, username, full_name, role';
      params.push(id);
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
