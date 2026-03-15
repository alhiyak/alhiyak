const db = require('../../config/database');

const getAllPurchases = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'name', i.name,
              'quantity', ti.quantity,
              'unit_price', ti.unit_price
            ) ORDER BY ti.id
          ) FILTER (WHERE ti.id IS NOT NULL), 
          '[]'::json
        ) as items
      FROM transactions t
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      LEFT JOIN items i ON ti.item_id = i.id
      WHERE t.type = 'purchase'
      GROUP BY t.id
      ORDER BY t.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('خطأ في getAllPurchases:', error);
    res.status(500).json({ message: 'خطأ في جلب المشتريات' });
  }
};

const getPurchaseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'name', i.name,
              'quantity', ti.quantity,
              'unit_price', ti.unit_price
            ) ORDER BY ti.id
          ) FILTER (WHERE ti.id IS NOT NULL), 
          '[]'::json
        ) as items
       FROM transactions t
       LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
       LEFT JOIN items i ON ti.item_id = i.id
       WHERE t.id = $1 AND t.type = 'purchase'
       GROUP BY t.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الفاتورة غير موجودة' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('خطأ في getPurchaseById:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

const createPurchase = async (req, res) => {
  const { date, member_id, document_number, supplier_name, notes, items, payment_status } = req.body;
  const created_by = req.user.id;

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const codeResult = await client.query(
        `SELECT transaction_code FROM transactions WHERE type = 'purchase' ORDER BY id DESC LIMIT 1`
      );
      let newCode = 'Pu0001';
      if (codeResult.rows.length > 0) {
        const lastCode = codeResult.rows[0].transaction_code;
        const lastNumber = parseInt(lastCode.replace('Pu', ''), 10);
        newCode = `Pu${(lastNumber + 1).toString().padStart(4, '0')}`;
      }

      const transResult = await client.query(
        `INSERT INTO transactions 
         (transaction_code, type, date, member_id, supplier_name, document_number, total_amount, notes, created_by, payment_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [newCode, 'purchase', date, member_id, supplier_name || null, document_number || null, 0, notes, created_by, payment_status || 'unpaid']
      );
      const transactionId = transResult.rows[0].id;

      let totalAmount = 0;

      for (const item of items) {
        await client.query(
          `INSERT INTO transaction_items (transaction_id, item_id, quantity, unit_price) 
           VALUES ($1, $2, $3, $4)`,
          [transactionId, item.item_id, item.quantity, item.unit_price]
        );

        totalAmount += item.quantity * item.unit_price;

        await client.query(
          'UPDATE items SET quantity = quantity + $1 WHERE id = $2',
          [item.quantity, item.item_id]
        );
      }

      await client.query(
        'UPDATE transactions SET total_amount = $1 WHERE id = $2',
        [totalAmount, transactionId]
      );

      await client.query('COMMIT');

      const result = await client.query(
        `SELECT t.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'name', i.name,
                'quantity', ti.quantity,
                'unit_price', ti.unit_price
              ) ORDER BY ti.id
            ) FILTER (WHERE ti.id IS NOT NULL), 
            '[]'::json
          ) as items
         FROM transactions t
         LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
         LEFT JOIN items i ON ti.item_id = i.id
         WHERE t.id = $1
         GROUP BY t.id`,
        [transactionId]
      );

      res.status(201).json(result.rows[0]);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('خطأ في createPurchase:', error);
    res.status(500).json({ message: error.message || 'خطأ في إنشاء الفاتورة' });
  }
};

const updatePurchase = async (req, res) => {
  const { id } = req.params;
  const { date, member_id, document_number, supplier_name, notes, items, payment_status } = req.body;

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const oldItems = await client.query(
        'SELECT item_id, quantity FROM transaction_items WHERE transaction_id = $1',
        [id]
      );
      for (const item of oldItems.rows) {
        await client.query(
          'UPDATE items SET quantity = quantity - $1 WHERE id = $2',
          [item.quantity, item.item_id]
        );
      }

      await client.query(
        `UPDATE transactions 
         SET date = $1, member_id = $2, supplier_name = $3, document_number = $4, notes = $5, payment_status = $6 
         WHERE id = $7 AND type = 'purchase'`,
        [date, member_id, supplier_name || null, document_number || null, notes, payment_status || 'unpaid', id]
      );

      await client.query('DELETE FROM transaction_items WHERE transaction_id = $1', [id]);

      let totalAmount = 0;

      for (const item of items) {
        await client.query(
          `INSERT INTO transaction_items (transaction_id, item_id, quantity, unit_price) 
           VALUES ($1, $2, $3, $4)`,
          [id, item.item_id, item.quantity, item.unit_price]
        );

        totalAmount += item.quantity * item.unit_price;

        await client.query(
          'UPDATE items SET quantity = quantity + $1 WHERE id = $2',
          [item.quantity, item.item_id]
        );
      }

      await client.query(
        'UPDATE transactions SET total_amount = $1 WHERE id = $2',
        [totalAmount, id]
      );

      await client.query('COMMIT');

      const result = await client.query(
        `SELECT t.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'name', i.name,
                'quantity', ti.quantity,
                'unit_price', ti.unit_price
              ) ORDER BY ti.id
            ) FILTER (WHERE ti.id IS NOT NULL), 
            '[]'::json
          ) as items
         FROM transactions t
         LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
         LEFT JOIN items i ON ti.item_id = i.id
         WHERE t.id = $1
         GROUP BY t.id`,
        [id]
      );

      res.json(result.rows[0]);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('خطأ في updatePurchase:', error);
    res.status(500).json({ message: error.message || 'خطأ في تحديث الفاتورة' });
  }
};

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase
};