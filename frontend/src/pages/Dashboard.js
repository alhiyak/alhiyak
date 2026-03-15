import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryCard from '../components/Cards/SummaryCard';
import { 
  IoPeopleOutline,
  IoPeopleCircleOutline,
  IoPlayCircleOutline,
  IoPlayForwardCircleOutline,
  IoStatsChartOutline,
  IoCartOutline,
  IoTrendingUpOutline,
  IoWalletOutline,
  IoPersonOutline
} from 'react-icons/io5';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    association_total: 0,
    association_current: 0,
    tasweeb_total: 0,
    tasweeb_current: 0,
    sales_total: 0,
    purchases_total: 0,
    total_income: 0,
    net_current: 0,
    members_count: 0
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard/summary');
      setSummary(response.data);
    } catch (error) {
      console.error('خطأ في جلب البيانات', error);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0.000 د.ب';
    return num.toFixed(3) + ' د.ب';
  };

  return (
    <div className="dashboard">
      <h1>الرئيسية</h1>

      {/* تم إزالة الأزرار المكررة - أصبحت البطاقات مباشرة تحت العنوان */}

      <div className="cards-grid">
        <SummaryCard 
          title="إجمالي الجمعية العام" 
          value={formatCurrency(summary.association_total)} 
          icon={IoPeopleOutline}
        />
        <SummaryCard 
          title="إجمالي الجمعية الحالي" 
          value={formatCurrency(summary.association_current)} 
          icon={IoPeopleCircleOutline}
        />
        <SummaryCard 
          title="إجمالي التثويبات العام" 
          value={formatCurrency(summary.tasweeb_total)} 
          icon={IoPlayCircleOutline}
        />
        <SummaryCard 
          title="إجمالي التثويبات الحالي" 
          value={formatCurrency(summary.tasweeb_current)} 
          icon={IoPlayForwardCircleOutline}
        />
        <SummaryCard 
          title="إجمالي المبيعات" 
          value={formatCurrency(summary.sales_total)} 
          icon={IoStatsChartOutline}
        />
        <SummaryCard 
          title="إجمالي المشتريات" 
          value={formatCurrency(summary.purchases_total)} 
          icon={IoCartOutline}
        />
        
        <SummaryCard 
          title="المبلغ الإجمالي" 
          value={formatCurrency(summary.total_income)} 
          icon={IoTrendingUpOutline}
          highlight={true}
        />
        
        <SummaryCard 
          title="الصافي الحالي" 
          value={formatCurrency(summary.net_current)} 
          icon={IoWalletOutline}
          highlight={true}
        />
        
        <SummaryCard 
          title="عدد الأعضاء" 
          value={summary.members_count} 
          icon={IoPersonOutline}
        />
      </div>
    </div>
  );
};

export default Dashboard;