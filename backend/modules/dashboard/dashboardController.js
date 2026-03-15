const db = require('../../config/database');

const getSummary = async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, transaction_code, type, total_amount::text as amount
      FROM transactions
      ORDER BY id
    `);

    let assocTotal = 0;
    let tasweebTotal = 0;
    let salesTotal = 0;
    let purchasesTotal = 0;

    rows.forEach((row) => {
      const amount = parseFloat(row.amount) || 0;
      if (row.type === 'association') {
        assocTotal += amount;
      } else if (row.type === 'tasweeb') {
        tasweebTotal += amount;
      } else if (row.type === 'sale') {
        salesTotal += amount;
      } else if (row.type === 'purchase') {
        purchasesTotal += amount;
      }
    });

    const members = await db.query("SELECT COUNT(*) as count FROM members");
    const membersCount = parseInt(members.rows[0].count) || 0;

    const totalIncome = assocTotal + tasweebTotal + salesTotal;
    const netCurrent = totalIncome - purchasesTotal;

    res.json({
      association_total: assocTotal,
      association_current: assocTotal,
      tasweeb_total: tasweebTotal,
      tasweeb_current: tasweebTotal,
      sales_total: salesTotal,
      purchases_total: purchasesTotal,
      total_income: totalIncome,
      net_current: netCurrent,
      members_count: membersCount
    });

  } catch (error) {
    console.error('خطأ في dashboardController:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
};

module.exports = { getSummary };