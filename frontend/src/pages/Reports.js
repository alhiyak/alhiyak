import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoBarChartOutline,
  IoPieChartOutline,
  IoTrendingUpOutline,
  IoCartOutline,
  IoPeopleOutline,
  IoGiftOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Reports.css';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [inventorySummary, setInventorySummary] = useState({ total: 0, lowStock: 0, outOfStock: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const COLORS = ['#FFD700', '#2b2b2b', '#718096', '#e74c3c', '#27ae60', '#f39c12'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchReports();
    }
  }, []);

  const fetchReports = async () => {
    try {
      // جلب بيانات الملخص
      const summaryRes = await axios.get('http://localhost:5000/api/dashboard/summary');
      setSummary(summaryRes.data);

      // بيانات المبيعات الشهرية (وهمية - يمكن استبدالها بـ API حقيقي لاحقاً)
      setMonthlySales([
        { month: 'يناير', sales: 1200, purchases: 800 },
        { month: 'فبراير', sales: 1500, purchases: 900 },
        { month: 'مارس', sales: 1100, purchases: 700 },
        { month: 'أبريل', sales: 1800, purchases: 1100 },
        { month: 'مايو', sales: 2100, purchases: 1300 },
        { month: 'يونيو', sales: 1900, purchases: 1200 },
      ]);

      // أكثر المواد مبيعاً (وهمية)
      setTopItems([
        { name: 'مايك سنهايزر', count: 25 },
        { name: 'كاميرا سوني', count: 18 },
        { name: 'سماعات أوديو', count: 15 },
        { name: 'حامل ثلاثي', count: 12 },
        { name: 'واجهة صوت', count: 10 },
      ]);

      // إحصائيات المخزون
      setInventorySummary({ total: 120, lowStock: 8, outOfStock: 5 });

      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب التقارير:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="reports">
      <h1><IoBarChartOutline /> التقارير والإحصائيات</h1>

      <div className="summary-cards">
        <div className="summary-card">
          <IoGiftOutline className="card-icon" />
          <span className="card-label">الجمعية</span>
          <span className="card-value">{summary?.association_total?.toFixed(3)} د.ب</span>
        </div>
        <div className="summary-card">
          <IoCalendarOutline className="card-icon" />
          <span className="card-label">التثويبات</span>
          <span className="card-value">{summary?.tasweeb_total?.toFixed(3)} د.ب</span>
        </div>
        <div className="summary-card">
          <IoTrendingUpOutline className="card-icon" />
          <span className="card-label">المبيعات</span>
          <span className="card-value">{summary?.sales_total?.toFixed(3)} د.ب</span>
        </div>
        <div className="summary-card">
          <IoCartOutline className="card-icon" />
          <span className="card-label">المشتريات</span>
          <span className="card-value">{summary?.purchases_total?.toFixed(3)} د.ب</span>
        </div>
        <div className="summary-card">
          <IoPeopleOutline className="card-icon" />
          <span className="card-label">الأعضاء</span>
          <span className="card-value">{summary?.members_count}</span>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h2>المبيعات والمشتريات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#FFD700" name="المبيعات" />
              <Bar dataKey="purchases" fill="#2b2b2b" name="المشتريات" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h2>أكثر المواد مبيعاً</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topItems}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {topItems.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="inventory-stats">
        <h2>إحصائيات المخزون</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">إجمالي المواد</span>
            <span className="stat-value">{inventorySummary.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">مواد منخفضة (أقل من الحد)</span>
            <span className="stat-value">{inventorySummary.lowStock}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">مواد منتهية الكمية</span>
            <span className="stat-value">{inventorySummary.outOfStock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;