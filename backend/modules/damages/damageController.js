const { createDetailedTransaction } = require('../transactions/transactionHelper');
const db = require('../../config/database');

const createDamage = async (req, res) => {
  const { date, notes, items } = req.body;
  const created_by = req.user.id;

  const damageItems = items.map(item => ({
    ...item,
    unit_price: 0
  }));

  try {
    const transaction = await createDetailedTransaction('damage', 'Da', {
      date,
      notes,
      created_by
    }, damageItems);
    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const getAllDamages = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT t.*,
        json_agg(json_build_object('item_id', ti.item_id, 'name', i.name, 'quantity', ti.quantity)) as items
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
       LEFT JOIN items i ON ti.item_id = i.id
       WHERE t.transaction_type = 'damage'
       GROUP BY t.id
       ORDER BY t.date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { createDamage, getAllDamages };
