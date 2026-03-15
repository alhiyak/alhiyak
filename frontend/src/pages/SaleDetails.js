import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoPrintOutline } from 'react-icons/io5';
import InvoicePrint from '../components/InvoicePrint';
import './SaleDetails.css';

const SaleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/sales/${id}`);
      setSale(response.data);
    } catch (err) {
      console.error('خطأ في جلب تفاصيل الفاتورة:', err);
      setError('تعذر العثور على الفاتورة أو حدث خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getPaymentStatusText = (status) => {
    switch(status) {
      case 'paid': return 'مدفوع';
      case 'unpaid': return 'غير مدفوع';
      default: return status;
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="btn-back" onClick={() => navigate('/sales')}>
          <IoArrowBackOutline /> العودة إلى المبيعات
        </button>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="error-container">
        <div className="error-message">الفاتورة غير موجودة</div>
        <button className="btn-back" onClick={() => navigate('/sales')}>
          <IoArrowBackOutline /> العودة إلى المبيعات
        </button>
      </div>
    );
  }

  return (
    <div className="sale-details">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate('/sales')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1>تفاصيل فاتورة بيع</h1>
        <button className="btn-print" onClick={() => setShowInvoicePrint(true)}>
          <IoPrintOutline /> طباعة الفاتورة
        </button>
      </div>

      <div className="details-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">رقم الفاتورة:</span>
            <span className="info-value">{sale.transaction_code}</span>
          </div>
          <div className="info-item">
            <span className="info-label">التاريخ:</span>
            <span className="info-value">{formatDate(sale.date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">العميل:</span>
            <span className="info-value">{sale.member_name || 'غير معروف'}</span>
          </div>
          {/* 👇 حالة الدفع جديدة */}
          <div className="info-item">
            <span className="info-label">حالة الدفع:</span>
            <span className="info-value" style={{ color: sale.payment_status === 'paid' ? 'green' : 'red', fontWeight: 'bold' }}>
              {getPaymentStatusText(sale.payment_status)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">ملاحظات:</span>
            <span className="info-value">{sale.notes || '-'}</span>
          </div>
        </div>

        <h3>المواد المباعة</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المادة</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {sale.items && sale.items.length > 0 ? (
              sale.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{parseInt(item.quantity)}</td>
                  <td>{parseFloat(item.unit_price).toFixed(3)} د.ب</td>
                  <td>{(parseInt(item.quantity) * parseFloat(item.unit_price)).toFixed(3)} د.ب</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">لا توجد مواد</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" className="total-label">الإجمالي الكلي</td>
              <td className="total-value">{parseFloat(sale.total_amount).toFixed(3)} د.ب</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <InvoicePrint
        isOpen={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        invoiceData={{
          transaction_code: sale.transaction_code,
          date: sale.date,
          member_name: sale.member_name,
          supplier_name: null,
          document_number: null,
          items: sale.items,
          total_amount: sale.total_amount,
          notes: sale.notes,
          payment_status: sale.payment_status // 👇 إرسال حالة الدفع للطباعة
        }}
        type="sale"
      />
    </div>
  );
};

export default SaleDetails;