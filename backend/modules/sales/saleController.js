const db = require('../../config/database');

// الحصول على جميع فواتير البيع
const getAllSales = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
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
      WHERE t.type = 'sale'
      GROUP BY t.id
      ORDER BY t.date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('خطأ في getAllSales:', error);
    res.status(500).json({ message: 'خطأ في جلب المبيعات' });
  }
};

// الحصول على فاتورة بيع محددة
const getSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT t.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', i.id,
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
       WHERE t.id = $1 AND t.type = 'sale'
       GROUP BY t.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'الفاتورة غير موجودة' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('خطأ في getSaleById:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

// إنشاء فاتورة بيع جديدة
const createSale = async (req, res) => {
  const { date, member_id, notes, items, payment_status } = req.body;
  const created_by = req.user.id;

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // التحقق من صحة البيانات
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('يجب إضافة مادة واحدة على الأقل');
      }

      // توليد كود الفاتورة
      const codeResult = await client.query(
        `SELECT transaction_code FROM transactions WHERE type = 'sale' ORDER BY id DESC LIMIT 1`
      );
      let newCode = 'Sa0001';
      if (codeResult.rows.length > 0) {
        const lastCode = codeResult.rows[0].transaction_code;
        const lastNumber = parseInt(lastCode.replace('Sa', ''), 10);
        newCode = `Sa${(lastNumber + 1).toString().padStart(4, '0')}`;
      }

      const transResult = await client.query(
        `INSERT INTO transactions 
         (transaction_code, type, date, member_id, total_amount, notes, created_by, payment_status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [newCode, 'sale', date, member_id, 0, notes, created_by, payment_status || 'unpaid']
      );
      const transactionId = transResult.rows[0].id;

      let totalAmount = 0;

      for (const item of items) {
        // التأكد من وجود item_id
        if (!item.item_id) {
          throw new Error(`بيانات المادة غير مكتملة: item_id مفقود`);
        }

        const stockCheck = await client.query(
          'SELECT * FROM items WHERE id = $1',
          [item.item_id]
        );

        if (stockCheck.rows.length === 0) {
          throw new Error(`المادة ذات المعرف ${item.item_id} غير موجودة في قاعدة البيانات`);
        }

        if (stockCheck.rows[0].quantity < item.quantity) {
          throw new Error(`الكمية غير كافية للمادة ${item.item_id}. المتوفر: ${stockCheck.rows[0].quantity}`);
        }

        await client.query(
          `INSERT INTO transaction_items (transaction_id, item_id, quantity, unit_price) 
           VALUES ($1, $2, $3, $4)`,
          [transactionId, item.item_id, item.quantity, item.unit_price]
        );

        totalAmount += item.quantity * item.unit_price;

        await client.query(
          'UPDATE items SET quantity = quantity - $1 WHERE id = $2',
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
                'id', i.id,
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
    console.error('خطأ في createSale:', error);
    res.status(500).json({ message: error.message || 'خطأ في إنشاء الفاتورة' });
  }
};

// تحديث فاتورة بيع (معدلة بالكامل)
const updateSale = async (req, res) => {
  const { id } = req.params;
  const { date, member_id, notes, items, payment_status } = req.body;

  console.log('🔄 updateSale called for transaction ID:', id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  try {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // التحقق من وجود الفاتورة
      const saleCheck = await client.query(
        'SELECT * FROM transactions WHERE id = $1 AND type = $2',
        [id, 'sale']
      );
      if (saleCheck.rows.length === 0) {
        return res.status(404).json({ message: 'الفاتورة غير موجودة' });
      }

      // استعادة الكميات القديمة للمخزون
      const oldItems = await client.query(
        'SELECT item_id, quantity FROM transaction_items WHERE transaction_id = $1',
        [id]
      );
      console.log('Old items from transaction:', oldItems.rows);

      for (const oldItem of oldItems.rows) {
        console.log(`Restoring quantity ${oldItem.quantity} to item ID ${oldItem.item_id}`);
        await client.query(
          'UPDATE items SET quantity = quantity + $1 WHERE id = $2',
          [oldItem.quantity, oldItem.item_id]
        );
      }

      // تحديث بيانات الفاتورة
      await client.query(
        `UPDATE transactions 
         SET date = $1, member_id = $2, notes = $3, payment_status = $4 
         WHERE id = $5 AND type = 'sale'`,
        [date, member_id, notes, payment_status || 'unpaid', id]
      );

      // حذف العناصر القديمة من transaction_items
      await client.query('DELETE FROM transaction_items WHERE transaction_id = $1', [id]);

      let totalAmount = 0;

      // إضافة العناصر الجديدة
      for (const item of items) {
        console.log('Processing new item:', item);

        // التحقق من وجود item_id
        if (!item.item_id) {
          throw new Error(`بيانات المادة غير مكتملة: item_id مفقود`);
        }

        // التحقق من وجود المادة في قاعدة البيانات
        const stockCheck = await client.query(
          'SELECT * FROM items WHERE id = $1',
          [item.item_id]
        );

        console.log('Item from DB:', stockCheck.rows);

        if (stockCheck.rows.length === 0) {
          throw new Error(`المادة ذات المعرف ${item.item_id} غير موجودة في قاعدة البيانات`);
        }

        // التحقق من توفر الكمية (الكمية الجديدة يجب ألا تتجاوز المتوفر بعد إعادة الكمية القديمة)
        const availableQuantity = stockCheck.rows[0].quantity;
        if (availableQuantity < item.quantity) {
          throw new Error(`الكمية غير كافية للمادة ${item.item_id}. المتوفر: ${availableQuantity}, المطلوب: ${item.quantity}`);
        }

        // إدراج العنصر الجديد
        await client.query(
          `INSERT INTO transaction_items (transaction_id, item_id, quantity, unit_price) 
           VALUES ($1, $2, $3, $4)`,
          [id, item.item_id, item.quantity, item.unit_price]
        );

        totalAmount += item.quantity * item.unit_price;

        // خصم الكمية الجديدة من المخزون
        await client.query(
          'UPDATE items SET quantity = quantity - $1 WHERE id = $2',
          [item.quantity, item.item_id]
        );
      }

      // تحديث إجمالي الفاتورة
      await client.query(
        'UPDATE transactions SET total_amount = $1 WHERE id = $2',
        [totalAmount, id]
      );

      await client.query('COMMIT');

      // جلب الفاتورة المحدثة
      const result = await client.query(
        `SELECT t.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', i.id,
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
      console.error('Error in updateSale transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('خطأ في updateSale:', error);
    res.status(500).json({ message: error.message || 'خطأ في تحديث الفاتورة' });
  }
};

module.exports = {
  getAllSales,
  getSaleById,
  createSale,
  updateSale
};