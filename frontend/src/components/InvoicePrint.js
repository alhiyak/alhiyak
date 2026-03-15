import React, { useRef } from 'react';
import './InvoicePrint.css';

const InvoicePrint = ({ isOpen, onClose, invoiceData, type }) => {
  const printContentRef = useRef(null);

  if (!isOpen || !invoiceData) return null;

  const totalAmount = typeof invoiceData.total_amount === 'number'
    ? invoiceData.total_amount
    : parseFloat(invoiceData.total_amount) || 0;

  // تحديد صورة الختم حسب حالة الدفع
  const getStampImage = () => {
    const status = invoiceData.payment_status || 'unpaid';
    switch (status) {
      case 'paid': return '/stamps/paid.png';
      case 'partial': return '/stamps/partial.png';
      default: return '/stamps/unpaid.png';
    }
  };

  const handlePrint = () => {
    if (!printContentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = printContentRef.current.cloneNode(true);
      const styles = document.querySelector('link[href*="InvoicePrint.css"]')?.outerHTML || '';
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="utf-8">
          <title>فاتورة ${invoiceData.transaction_code || ''}</title>
          ${styles}
          <style>
            body { margin: 0; padding: 20px; background: white; }
            .invoice-print-modal { display: none; }
            .invoice-print-header, .invoice-print-footer, .invoice-print-close { display: none; }
            .invoice-paper { box-shadow: none; padding: 0.5in; }
            .invoice-stamp-img { 
              position: absolute; 
              top: 30%; 
              left: 50%; 
              transform: translate(-50%, -50%) rotate(-15deg); 
              width: 250px; 
              opacity: 0.8; 
              pointer-events: none; 
              z-index: 100; 
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="invoice-print-modal">
      <div className="invoice-print-content">
        <div className="invoice-print-header">
          <h2>{type === 'sale' ? 'طباعة فاتورة مبيعات' : 'طباعة فاتورة مشتريات'}</h2>
          <button className="invoice-print-close" onClick={onClose}>×</button>
        </div>

        <div className="invoice-print-body">
          <div ref={printContentRef} className="invoice-paper" id="invoice-print-area">
            {/* الختم - صورة PNG */}
            {invoiceData.payment_status && (
              <img 
                src={getStampImage()} 
                alt="ختم حالة الدفع"
                className="invoice-stamp-img"
                style={{
                  position: 'absolute',
                  top: '30%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-15deg)',
                  width: '700px',
                  opacity: '0.8',
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              />
            )}

            {/* باقي محتوى الفاتورة (نفس ما كان) */}
            <div className="invoice-header">
              <div className="invoice-logo">
                <img src="/invoice-logo/logo.png" alt="Alhiyak" />
              </div>
              <div className="invoice-title">
                <h1>موكب الحياك</h1>
                <p>نظام إدارة الحسابات والمخزون</p>
              </div>
            </div>

            <div className="invoice-info">
              <p><strong>رقم الفاتورة:</strong> {invoiceData.transaction_code}</p>
              <p><strong>التاريخ:</strong> {
                invoiceData.date instanceof Date
                  ? invoiceData.date.toLocaleDateString('ar-EG')
                  : new Date(invoiceData.date).toLocaleDateString('ar-EG')
              }</p>
              {type === 'sale' && <p><strong>العميل:</strong> {invoiceData.member_name || '—'}</p>}
              {type === 'purchase' && (
                <>
                  <p><strong>رقم المستند:</strong> {invoiceData.document_number || '—'}</p>
                  <p><strong>المورد:</strong> {invoiceData.supplier_name || invoiceData.member_name || '—'}</p>
                </>
              )}
            </div>

            <table className="invoice-items">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items && invoiceData.items.length > 0 ? (
                  invoiceData.items.map((item, index) => {
                    const itemTotal = (item.quantity * item.unit_price) || 0;
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit_price?.toFixed(3)} د.ب</td>
                        <td>{itemTotal.toFixed(3)} د.ب</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="5">لا توجد أصناف</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total-label">الإجمالي الكلي</td>
                  <td className="total-value">{totalAmount.toFixed(3)} د.ب</td>
                </tr>
              </tfoot>
            </table>

            {invoiceData.notes && (
              <div className="invoice-notes">
                <strong>ملاحظات:</strong> {invoiceData.notes}
              </div>
            )}

            <div className="invoice-signatures">
              <div className="signature">
                <p>التوقيع: ______________________</p>
              </div>
              <div className="stamp-placeholder">
                <p>الختم: ______________________</p>
              </div>
            </div>
          </div>
        </div>

        <div className="invoice-print-footer">
          <button className="btn-cancel" onClick={onClose}>إلغاء</button>
          <button className="btn-print" onClick={handlePrint}>طباعة</button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;