import React from 'react';
import ReactDOM from 'react-dom';
import { IoCloseOutline, IoPrintOutline } from 'react-icons/io5';
import './PrintModal.css';

const PrintModal = ({ isOpen, onClose, title, data, columns, totalAmount }) => {
  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return `${parseFloat(amount).toFixed(3)} د.ب`;
  };

  const handlePrint = () => {
    window.print();
  };

  return ReactDOM.createPortal(
    <div className="print-modal-overlay">
      <div className="print-modal-content">
        <div className="print-modal-header">
          <h3>{title}</h3>
          <button className="print-modal-close" onClick={onClose}>
            <IoCloseOutline />
          </button>
        </div>

        <div className="print-modal-body">
          <div className="print-area">
            {/* شعار المؤسسة */}
            <div className="print-header">
              <img src="/logo.png" alt="موكب الحياك" className="print-logo" />
              <div className="print-title">{title}</div>
              <div className="print-date">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</div>
            </div>

            {/* جدول البيانات */}
            <table className="print-table">
              <thead>
                <tr>
                  {columns.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    {columns.map(col => (
                      <td key={col.key}>{row[col.key] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* الإجمالي إن وجد */}
            {totalAmount !== undefined && (
              <div className="print-total">
                <span>الإجمالي: </span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
            )}

            {/* مساحة التوقيع */}
            <div className="print-signature">
              <div className="signature-line">التوقيع: ____________________</div>
              <div className="stamp-line">الختم: ____________________</div>
            </div>
          </div>
        </div>

        <div className="print-modal-footer">
          <button className="btn-cancel" onClick={onClose}>إلغاء</button>
          <button className="btn-print" onClick={handlePrint}>
            <IoPrintOutline /> طباعة
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PrintModal;