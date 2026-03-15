const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// استيراد المسارات من مجلدات modules مباشرة
const authRoutes = require('./modules/auth/authRoutes');
const saleRoutes = require('./modules/sales/saleRoutes');
const purchaseRoutes = require('./modules/purchases/purchaseRoutes');
const itemRoutes = require('./modules/inventory/itemRoutes');
const memberRoutes = require('./modules/members/memberRoutes');
const associationRoutes = require('./modules/associations/associationRoutes');
const tasweebRoutes = require('./modules/tasweeb/tasweebRoutes');
const damageRoutes = require('./modules/damages/damageRoutes');
const dashboardRoutes = require('./modules/dashboard/dashboardRoutes');

// استخدام المسارات
app.use('/api/auth', authRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/associations', associationRoutes);
app.use('/api/tasweeb', tasweebRoutes);
app.use('/api/damages', damageRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على http://localhost:${PORT}`);
});