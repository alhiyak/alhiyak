import React from 'react';
import ReactDOM from 'react-dom';
import { IoPrintOutline, IoCloseOutline } from 'react-icons/io5';
import './InvoicePrint.css';

const InvoicePrint = ({ isOpen, onClose, invoiceData, type }) => {
  if (!isOpen || !invoiceData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    return type === 'sale' ? 'فاتورة بيع' : 'فاتورة شراء';
  };

  // تحديد لون الختم حسب حالة الدفع
  const getStampStyle = () => {
    if (invoiceData.payment_status === 'paid') {
      return { color: 'rgba(40, 167, 69, 0.2)', borderColor: 'rgba(40, 167, 69, 0.2)' };
    } else {
      return { color: 'rgba(220, 53, 69, 0.2)', borderColor: 'rgba(220, 53, 69, 0.2)' };
    }
  };

  const stampText = invoiceData.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع';

  return ReactDOM.createPortal(
    <div className="invoice-print-modal">
      <div className="invoice-print-content">
        <div className="invoice-print-header">
          <h2>{getTitle()}</h2>
          <div>
            <button className="btn-print" onClick={handlePrint}>
              <IoPrintOutline /> طباعة
            </button>
            <button className="btn-close" onClick={onClose}>
              <IoCloseOutline />
            </button>
          </div>
        </div>
        <div className="invoice-print-body" id="invoice-print-area">
          {/* ختم ملون حسب حالة الدفع */}
          <div className="paid-stamp" style={getStampStyle()}>
            {stampText}
          </div>
          <div className="invoice-header">
            <h3>{getTitle()}</h3>
            <p>رقم الفاتورة: {invoiceData.transaction_code}</p>
            <p>التاريخ: {formatDate(invoiceData.date)}</p>
            {type === 'sale' ? (
              <p>العميل: {invoiceData.member_name || '-'}</p>
            ) : (
              <>
                <p>الجهة المشترية: {invoiceData.supplier_name || invoiceData.member_name || '-'}</p>
                {invoiceData.document_number && <p>رقم الفاتورة الخارجية: {invoiceData.document_number}</p>}
              </>
            )}
            <p>حالة الدفع: {
              invoiceData.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'
            }</p>
          </div>
          <table className="invoice-items-table">
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
              {invoiceData.items && invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{parseInt(item.quantity)}</td>
                  <td>{parseFloat(item.unit_price).toFixed(3)} د.ب</td>
                  <td>{(parseInt(item.quantity) * parseFloat(item.unit_price)).toFixed(3)} د.ب</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'left', fontWeight: 'bold' }}>الإجمالي الكلي</td>
                <td style={{ fontWeight: 'bold' }}>{parseFloat(invoiceData.total_amount).toFixed(3)} د.ب</td>
              </tr>
            </tfoot>
          </table>
          {invoiceData.notes && (
            <div className="invoice-notes">
              <strong>ملاحظات:</strong> {invoiceData.notes}
            </div>
          )}
          <div className="invoice-footer">
            <div className="signature-area">
              <p>التوقيع: ______________________</p>
              <p>الختم: ______________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InvoicePrint;