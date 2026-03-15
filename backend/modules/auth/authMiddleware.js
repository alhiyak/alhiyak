const { verifyToken } = require('../../config/auth');

const authMiddleware = (req, res, next) => {
  // قراءة التوكن من الهيدر
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'لا يوجد رمز دخول' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'تنسيق الرمز غير صحيح' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error.message);
    return res.status(401).json({ message: 'رمز غير صالح أو منتهي الصلاحية' });
  }
};

module.exports = authMiddleware;