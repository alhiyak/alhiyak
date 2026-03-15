const db = require('../../config/database');

const getAllMembers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM members ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ getAllMembers:', error);
    res.status(500).json({ message: 'خطأ في جلب الأعضاء' });
  }
};

const getMemberById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM members WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ getMemberById:', error);
    res.status(500).json({ message: 'خطأ في جلب العضو' });
  }
};

const createMember = async (req, res) => {
  const { name, phone, address } = req.body;
  try {
    const codeResult = await db.query("SELECT member_code FROM members ORDER BY id DESC LIMIT 1");
    let newCode = 'M0001';
    if (codeResult.rows.length > 0) {
      const lastCode = codeResult.rows[0].member_code;
      const lastNumber = parseInt(lastCode.replace('M', ''), 10);
      newCode = `M${(lastNumber + 1).toString().padStart(4, '0')}`;
    }
    const result = await db.query(
      'INSERT INTO members (member_code, name, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [newCode, name, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ createMember:', error);
    res.status(500).json({ message: 'خطأ في إنشاء العضو' });
  }
};

const updateMember = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  try {
    const result = await db.query(
      'UPDATE members SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING *',
      [name, phone, address, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ updateMember:', error);
    res.status(500).json({ message: 'خطأ في تحديث العضو' });
  }
};

const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM members WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'العضو غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error('❌ deleteMember:', error);
    res.status(500).json({ message: 'خطأ في حذف العضو' });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};