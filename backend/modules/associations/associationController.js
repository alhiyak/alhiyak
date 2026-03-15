const db = require('../../config/database');
const { createSimpleTransaction } = require('../transactions/transactionHelper');

const getAllAssociations = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*, m.name as member_name 
       FROM transactions t 
       LEFT JOIN members m ON t.member_id = m.id 
       WHERE t.type = 'association' 
       ORDER BY t.date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const createAssociation = async (req, res) => {
  const { date, member_id, total_amount, notes } = req.body;
  const created_by = req.user.id;

  try {
    const transaction = await createSimpleTransaction('association', 'Ja', {
      date,
      member_id,
      total_amount,
      notes,
      created_by
    });
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const updateAssociation = async (req, res) => {
  const { id } = req.params;
  const { date, member_id, total_amount, notes } = req.body;
  try {
    const result = await db.query(
      `UPDATE transactions SET date = $1, member_id = $2, total_amount = $3, notes = $4 
       WHERE id = $5 AND type = 'association' RETURNING *`,
      [date, member_id, total_amount, notes, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const deleteAssociation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM transactions WHERE id = $1 AND type = $2 RETURNING id',
      [id, 'association']
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'السجل غير موجود' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { getAllAssociations, createAssociation, updateAssociation, deleteAssociation };