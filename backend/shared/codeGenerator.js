const db = require('../config/database');

const generateCode = async (prefix, tableName, columnName = 'transaction_code') => {
  const result = await db.query(
    `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} LIKE $1 ORDER BY ${columnName} DESC LIMIT 1`,
    [`${prefix}%`]
  );

  if (result.rows.length === 0) {
    return `${prefix}0001`;
  }

  const lastCode = result.rows[0][columnName];
  const lastNumber = parseInt(lastCode.replace(prefix, ''), 10);
  const newNumber = lastNumber + 1;
  return `${prefix}${newNumber.toString().padStart(4, '0')}`;
};

module.exports = generateCode;
