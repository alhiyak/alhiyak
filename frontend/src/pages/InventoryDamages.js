import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryDamages.css';

const InventoryDamages = () => {
  const [damages, setDamages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDamages();
  }, []);

  const fetchDamages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/damages');
      setDamages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب التلفيات:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="inventory-damages">
      <h2>سجل التلفيات</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>كود التلف</th>
              <th>التاريخ</th>
              <th>المادة</th>
              <th>الكمية</th>
              <th>السبب</th>
            </tr>
          </thead>
          <tbody>
            {damages.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-message">لا توجد تلفيات مسجلة</td>
              </tr>
            ) : (
              damages.map(damage => (
                <tr key={damage.id}>
                  <td><span className="damage-code">{damage.transaction_code}</span></td>
                  <td>{new Date(damage.date).toLocaleDateString('ar-EG')}</td>
                  <td>{damage.items?.[0]?.name || '-'}</td>
                  <td>{damage.items?.[0]?.quantity || 0}</td>
                  <td>{damage.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryDamages;