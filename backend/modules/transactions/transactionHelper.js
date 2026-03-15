const db = require('../../config/database');
const generateCode = require('../../shared/codeGenerator');

const createSimpleTransaction = async (type, prefix, data) => {
  const { date, member_id, total_amount, notes, created_by } = data;
  const code = await generateCode(prefix, 'transactions');
  
  const result = await db.query(
    `INSERT INTO transactions 
     (transaction_code, transaction_type, date, member_id, total_amount, notes, created_by) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [code, type, date, member_id, total_amount, notes, created_by]
  );
  return result.rows[0];
};

const createDetailedTransaction = async (type, prefix, data, items) => {
  const { date, member_id, supplier_id, notes, created_by } = data;
  const code = await generateCode(prefix, 'transactions');
  
  let total_amount = 0;
  for (const item of items) {
    total_amount += item.quantity * item.unit_price;
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const transResult = await client.query(
      `INSERT INTO transactions 
       (transaction_code, transaction_type, date, member_id, supplier_id, total_amount, notes, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [code, type, date, member_id, supplier_id, total_amount, notes, created_by]
    );
    const transactionId = transResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, item_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4)`,
        [transactionId, item.item_id, item.quantity, item.unit_price]
      );

      let quantityChange = 0;
      if (type === 'sale' || type === 'damage') quantityChange = -item.quantity;
      else if (type === 'purchase') quantityChange = item.quantity;

      if (quantityChange !== 0) {
        await client.query(
          'UPDATE items SET quantity = quantity + $1 WHERE id = $2',
          [quantityChange, item.item_id]
        );
      }
    }

    await client.query('COMMIT');
    
    const fullTrans = await client.query(
      `SELECT t.*, 
        json_agg(json_build_object('item_id', ti.item_id, 'name', i.name, 'quantity', ti.quantity, 'unit_price', ti.unit_price)) as items
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
       LEFT JOIN items i ON ti.item_id = i.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [transactionId]
    );
    
    return fullTrans.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createSimpleTransaction, createDetailedTransaction };
