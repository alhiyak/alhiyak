import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBackOutline, IoPrintOutline } from 'react-icons/io5';
import InvoicePrint from '../components/InvoicePrint';
import './PurchaseDetails.css';

const PurchaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/purchases/${id}`);
      setPurchase(response.data);
    } catch (err) {
      console.error('خطأ في جلب تفاصيل الفاتورة:', err);
      if (err.response && err.response.status === 404) {
        setError('الفاتورة غير موجودة');
      } else {
        setError('حدث خطأ في الاتصال بالخادم');
      }
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
        <button className="btn-back" onClick={() => navigate('/purchases')}>
          <IoArrowBackOutline /> العودة إلى المشتريات
        </button>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="error-container">
        <div className="error-message">الفاتورة غير موجودة</div>
        <button className="btn-back" onClick={() => navigate('/purchases')}>
          <IoArrowBackOutline /> العودة إلى المشتريات
        </button>
      </div>
    );
  }

  return (
    <div className="purchase-details">
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate('/purchases')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1>تفاصيل فاتورة شراء</h1>
        <button className="btn-print" onClick={() => setShowInvoicePrint(true)}>
          <IoPrintOutline /> طباعة الفاتورة
        </button>
      </div>

      <div className="details-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">رقم الفاتورة:</span>
            <span className="info-value">{purchase.transaction_code}</span>
          </div>
          <div className="info-item">
            <span className="info-label">التاريخ:</span>
            <span className="info-value">{formatDate(purchase.date)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">الجهة المشترية:</span>
            <span className="info-value">{purchase.supplier_name || 'غير معروف'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">رقم الفاتورة الخارجية:</span>
            <span className="info-value">{purchase.document_number || '-'}</span>
          </div>
          {/* 👇 حالة الدفع جديدة */}
          <div className="info-item">
            <span className="info-label">حالة الدفع:</span>
            <span className="info-value" style={{ color: purchase.payment_status === 'paid' ? 'green' : 'red', fontWeight: 'bold' }}>
              {getPaymentStatusText(purchase.payment_status)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">ملاحظات:</span>
            <span className="info-value">{purchase.notes || '-'}</span>
          </div>
        </div>

        <h3>المواد المشتراة</h3>
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
            {purchase.items && purchase.items.length > 0 ? (
              purchase.items.map((item, index) => (
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
              <td className="total-value">{parseFloat(purchase.total_amount).toFixed(3)} د.ب</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <InvoicePrint
        isOpen={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        invoiceData={{
          transaction_code: purchase.transaction_code,
          date: purchase.date,
          member_name: purchase.supplier_name,
          supplier_name: purchase.supplier_name,
          document_number: purchase.document_number,
          items: purchase.items,
          total_amount: purchase.total_amount,
          notes: purchase.notes,
          payment_status: purchase.payment_status // 👇 إرسال حالة الدفع للطباعة
        }}
        type="purchase"
      />
    </div>
  );
};

export default PurchaseDetails;