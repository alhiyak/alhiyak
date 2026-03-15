import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBackOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkOutline,
  IoStatsChartOutline
} from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InvoicePrint from '../components/InvoicePrint';
import './NewSale.css';

const NewSale = () => {
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'audio',
    sale_price_dinars: '',
    sale_price_fils: ''
  });
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [savedInvoiceData, setSavedInvoiceData] = useState(null);
  
  const [saleForm, setSaleForm] = useState({
    date: new Date(),
    member_id: '',
    notes: '',
    payment_status: 'unpaid', // حالة الدفع الافتراضية
    items: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchMembers();
      fetchItems();
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('خطأ في جلب الأعضاء:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('خطأ في جلب المواد:', error);
    }
  };

  const convertToDecimal = (dinars, fils) => {
    const d = parseInt(dinars) || 0;
    const f = parseInt(fils) || 0;
    return d + (f / 1000);
  };

  const getDinarsAndFils = (decimal) => {
    const d = Math.floor(decimal);
    const f = Math.round((decimal - d) * 1000);
    return { dinars: d, fils: f };
  };

  const handleAddItemToSale = (item) => {
    const existing = saleForm.items.find(i => i.item_id === item.id);
    if (existing) {
      alert('هذه المادة مضافة بالفعل. يمكنك تعديل الكمية من الجدول.');
      return;
    }

    const priceDecimal = parseFloat(item.sale_price) || 0;
    const { dinars, fils } = getDinarsAndFils(priceDecimal);

    const newItem = {
      item_id: item.id,
      name: item.name,
      quantity: 1,
      dinars: dinars,
      fils: fils,
      unit_price: priceDecimal,
      total: priceDecimal,
      available: item.quantity
    };
    setSaleForm({
      ...saleForm,
      items: [...saleForm.items, newItem]
    });
  };

  const handleRemoveItemFromSale = (index) => {
    const updated = [...saleForm.items];
    updated.splice(index, 1);
    setSaleForm({ ...saleForm, items: updated });
  };

  const handleItemQuantityChange = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty < 1) return;
    const updated = [...saleForm.items];
    updated[index].quantity = qty;
    updated[index].total = qty * updated[index].unit_price;
    setSaleForm({ ...saleForm, items: updated });
  };

  const handleItemPriceChange = (index, field, value) => {
    const updated = [...saleForm.items];
    if (field === 'dinars') {
      updated[index].dinars = parseInt(value) || 0;
    } else if (field === 'fils') {
      let fils = parseInt(value) || 0;
      if (fils > 999) fils = 999;
      if (fils < 0) fils = 0;
      updated[index].fils = fils;
    }
    updated[index].unit_price = convertToDecimal(updated[index].dinars, updated[index].fils);
    updated[index].total = updated[index].quantity * updated[index].unit_price;
    setSaleForm({ ...saleForm, items: updated });
  };

  const calculateTotal = () => {
    return saleForm.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemData.name.trim()) {
      alert('اسم المادة مطلوب');
      return;
    }

    setLoading(true);
    try {
      const sale_price = convertToDecimal(newItemData.sale_price_dinars, newItemData.sale_price_fils);

      const response = await axios.post('http://localhost:5000/api/items', {
        name: newItemData.name.trim(),
        category: newItemData.category,
        purchase_price: 0,
        sale_price: sale_price,
        quantity: 0
      });

      await fetchItems();
      handleAddItemToSale(response.data);

      setShowNewItemModal(false);
      setNewItemData({ name: '', category: 'audio', sale_price_dinars: '', sale_price_fils: '' });
    } catch (error) {
      console.error('خطأ في إضافة المادة:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء إضافة المادة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saleForm.items.length === 0) {
      alert('يجب إضافة مادة واحدة على الأقل');
      return;
    }
    if (!saleForm.member_id) {
      alert('يجب اختيار العضو');
      return;
    }

    for (const item of saleForm.items) {
      const stockItem = items.find(i => i.id === item.item_id);
      if (!stockItem) {
        alert(`المادة ${item.name} غير موجودة في المخزون`);
        return;
      }
      if (stockItem.quantity < item.quantity) {
        alert(`الكمية المطلوبة من ${item.name} (${item.quantity}) غير متوفرة. المتوفر: ${stockItem.quantity}`);
        return;
      }
    }

    setLoading(true);
    try {
      const itemsData = saleForm.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const response = await axios.post('http://localhost:5000/api/sales', {
        date: saleForm.date.toISOString().split('T')[0],
        member_id: saleForm.member_id,
        notes: saleForm.notes,
        payment_status: saleForm.payment_status,
        items: itemsData
      });

      const member = members.find(m => m.id === parseInt(saleForm.member_id));
      const invoiceData = {
        transaction_code: response.data.transaction_code,
        date: saleForm.date,
        member_name: member?.name,
        items: saleForm.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        total_amount: calculateTotal(),
        notes: saleForm.notes,
        payment_status: saleForm.payment_status
      };

      setSavedInvoiceData(invoiceData);
      setShowInvoicePrint(true);

    } catch (error) {
      console.error('خطأ في حفظ الفاتورة:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء حفظ الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-sale">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/sales')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1><IoStatsChartOutline /> فاتورة مبيعات جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="sale-form">
        <div className="form-section">
          <h2>معلومات الفاتورة</h2>
          <div className="form-row">
            <div className="form-group half">
              <label>التاريخ</label>
              <DatePicker
                selected={saleForm.date}
                onChange={(date) => setSaleForm({...saleForm, date})}
                dateFormat="dd/MM/yyyy"
                className="date-picker"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={15}
                disabled={loading}
              />
            </div>
            <div className="form-group half">
              <label>العضو <span className="required">*</span></label>
              <select
                value={saleForm.member_id}
                onChange={(e) => setSaleForm({...saleForm, member_id: e.target.value})}
                required
                disabled={loading}
              >
                <option value="">اختر العضو</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>حالة الدفع</label>
              <select
                value={saleForm.payment_status}
                onChange={(e) => setSaleForm({...saleForm, payment_status: e.target.value})}
                disabled={loading}
              >
                <option value="unpaid">غير مدفوع</option>
                <option value="paid">مدفوع</option>
                <option value="partial">مدفوع جزئياً</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>المواد المباعة</h2>
          <div className="items-controls">
            <select
              className="item-select"
              onChange={(e) => {
                const itemId = e.target.value;
                if (itemId) {
                  const item = items.find(i => i.id === parseInt(itemId));
                  if (item) handleAddItemToSale(item);
                  e.target.value = '';
                }
              }}
              disabled={loading}
            >
              <option value="">-- اختر مادة --</option>
              {items.filter(item => item.quantity > 0).map(item => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name} ({item.category === 'audio' ? 'صوتيات' : 'إعلامية'}) - المتوفر: {parseInt(item.quantity)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-add-item"
              onClick={() => setShowNewItemModal(true)}
              disabled={loading}
            >
              <IoAddOutline /> إضافة مادة جديدة
            </button>
          </div>

          {saleForm.items.length > 0 ? (
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>المادة</th>
                    <th>الكمية</th>
                    <th>الدينار</th>
                    <th>الفلس</th>
                    <th>الإجمالي</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {saleForm.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                          className="quantity-input"
                          disabled={loading}
                        />
                        {item.quantity > item.available && (
                          <small className="warning-text">أقصى كمية: {item.available}</small>
                        )}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.dinars}
                          onChange={(e) => handleItemPriceChange(index, 'dinars', e.target.value)}
                          className="price-input"
                          disabled={loading}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="999"
                          step="1"
                          value={item.fils}
                          onChange={(e) => handleItemPriceChange(index, 'fils', e.target.value)}
                          className="price-input"
                          disabled={loading}
                        />
                      </td>
                      <td>{item.total.toFixed(3)} د.ب</td>
                      <td>
                        <button
                          type="button"
                          className="btn-remove-item"
                          onClick={() => handleRemoveItemFromSale(index)}
                          disabled={loading}
                        >
                          <IoTrashOutline />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="total-label">الإجمالي الكلي</td>
                    <td className="total-value">{calculateTotal().toFixed(3)} د.ب</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="no-items">لم تضف أي مواد بعد. اختر مادة من القائمة أعلاه.</p>
          )}
        </div>

        <div className="form-section">
          <h2>ملاحظات</h2>
          <textarea
            value={saleForm.notes}
            onChange={(e) => setSaleForm({...saleForm, notes: e.target.value})}
            placeholder="أضف أي ملاحظات إضافية (اختياري)"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/sales')} disabled={loading}>
            إلغاء
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
          </button>
        </div>
      </form>

      {/* مودال إضافة مادة جديدة */}
      {showNewItemModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-medium">
            <div className="modal-header">
              <h3>إضافة مادة جديدة</h3>
              <button className="modal-close" onClick={() => setShowNewItemModal(false)}>×</button>
            </div>
            <form onSubmit={handleNewItemSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المادة <span className="required">*</span></label>
                  <input
                    type="text"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                    placeholder="أدخل اسم المادة"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>القسم</label>
                  <select
                    value={newItemData.category}
                    onChange={(e) => setNewItemData({...newItemData, category: e.target.value})}
                    disabled={loading}
                  >
                    <option value="audio">صوتيات</option>
                    <option value="media">إعلامية</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>الدينار</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newItemData.sale_price_dinars}
                      onChange={(e) => setNewItemData({...newItemData, sale_price_dinars: e.target.value})}
                      placeholder="0"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group half">
                    <label>الفلس</label>
                    <input
                      type="number"
                      min="0"
                      max="999"
                      step="1"
                      value={newItemData.sale_price_fils}
                      onChange={(e) => setNewItemData({...newItemData, sale_price_fils: e.target.value})}
                      placeholder="0"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="helper-text">مثال: 5 دينار و 250 فلس = 5.250 د.ب</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowNewItemModal(false)} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الإضافة...' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال طباعة الفاتورة */}
      <InvoicePrint
        isOpen={showInvoicePrint}
        onClose={() => {
          setShowInvoicePrint(false);
          navigate('/sales');
        }}
        invoiceData={savedInvoiceData}
        type="sale"
      />
    </div>
  );
};

export default NewSale;