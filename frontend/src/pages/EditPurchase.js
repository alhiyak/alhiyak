import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  IoArrowBackOutline,
  IoAddOutline,
  IoTrashOutline,
  IoCheckmarkOutline,
  IoCartOutline
} from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InvoicePrint from '../components/InvoicePrint';
import './NewPurchase.css';

const EditPurchase = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'audio',
    purchase_price_dinars: '',
    purchase_price_fils: ''
  });
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);
  const [savedInvoiceData, setSavedInvoiceData] = useState(null);
  
  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date(),
    member_id: '',
    document_number: '',
    supplier_name: '',
    notes: '',
    items: [],
    payment_status: 'unpaid'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchMembers();
      fetchItems();
      fetchPurchase();
    }
  }, [id]);

  const fetchPurchase = async () => {
    try {
      setFetching(true);
      const response = await axios.get(`http://localhost:5000/api/purchases/${id}`);
      const purchase = response.data;
      setPurchaseForm({
        date: new Date(purchase.date),
        member_id: purchase.member_id,
        document_number: purchase.document_number || '',
        supplier_name: purchase.supplier_name || '',
        notes: purchase.notes || '',
        items: purchase.items.map(item => ({
          item_id: item.item_id,
          name: item.name,
          quantity: item.quantity,
          dinars: Math.floor(item.unit_price),
          fils: Math.round((item.unit_price - Math.floor(item.unit_price)) * 1000),
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        })),
        payment_status: purchase.payment_status || 'unpaid'
      });
    } catch (error) {
      console.error('خطأ في جلب بيانات الفاتورة:', error);
      alert('حدث خطأ في جلب بيانات الفاتورة');
    } finally {
      setFetching(false);
    }
  };

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

  const handleAddItemToPurchase = (item) => {
    const existing = purchaseForm.items.find(i => i.item_id === item.id);
    if (existing) {
      alert('هذه المادة مضافة بالفعل. يمكنك تعديل الكمية من الجدول.');
      return;
    }

    const priceDecimal = parseFloat(item.purchase_price) || 0;
    const { dinars, fils } = getDinarsAndFils(priceDecimal);

    const newItem = {
      item_id: item.id,
      name: item.name,
      quantity: 1,
      dinars: dinars,
      fils: fils,
      unit_price: priceDecimal,
      total: priceDecimal
    };
    setPurchaseForm({
      ...purchaseForm,
      items: [...purchaseForm.items, newItem]
    });
  };

  const handleRemoveItemFromPurchase = (index) => {
    const updated = [...purchaseForm.items];
    updated.splice(index, 1);
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const handleItemQuantityChange = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    if (qty < 1) return;
    const updated = [...purchaseForm.items];
    updated[index].quantity = qty;
    updated[index].total = qty * updated[index].unit_price;
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const handleItemPriceChange = (index, field, value) => {
    const updated = [...purchaseForm.items];
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
    setPurchaseForm({ ...purchaseForm, items: updated });
  };

  const calculateTotal = () => {
    return purchaseForm.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  };

  const handleNewItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemData.name.trim()) {
      alert('اسم المادة مطلوب');
      return;
    }

    setLoading(true);
    try {
      const purchase_price = convertToDecimal(newItemData.purchase_price_dinars, newItemData.purchase_price_fils);

      const response = await axios.post('http://localhost:5000/api/items', {
        name: newItemData.name.trim(),
        category: newItemData.category,
        purchase_price: purchase_price,
        sale_price: 0,
        quantity: 0
      });

      // إعادة جلب المواد بعد الإضافة
      await fetchItems();
      handleAddItemToPurchase(response.data);

      setShowNewItemModal(false);
      setNewItemData({ name: '', category: 'audio', purchase_price_dinars: '', purchase_price_fils: '' });
    } catch (error) {
      console.error('خطأ في إضافة المادة:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء إضافة المادة');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (purchaseForm.items.length === 0) {
      alert('يجب إضافة مادة واحدة على الأقل');
      return;
    }
    if (!purchaseForm.member_id) {
      alert('يجب اختيار العضو');
      return;
    }

    setLoading(true);
    try {
      // جلب أحدث بيانات المواد من المخزون
      const itemsRes = await axios.get('http://localhost:5000/api/items');
      const latestItems = itemsRes.data;

      for (const item of purchaseForm.items) {
        const stockItem = latestItems.find(i => i.id === item.item_id);
        if (!stockItem) {
          alert(`المادة ${item.name} غير موجودة في المخزون`);
          setLoading(false);
          return;
        }
        // المشتريات لا تحتاج التحقق من الكمية المتوفرة (لأنها تضيف إلى المخزون)
        // ولكن يمكنك إضافة تحقق آخر إذا أردت
      }

      const itemsData = purchaseForm.items.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      const response = await axios.put(`http://localhost:5000/api/purchases/${id}`, {
        date: purchaseForm.date.toISOString().split('T')[0],
        member_id: purchaseForm.member_id,
        document_number: purchaseForm.document_number,
        supplier_name: purchaseForm.supplier_name,
        notes: purchaseForm.notes,
        items: itemsData,
        payment_status: purchaseForm.payment_status
      });

      const member = members.find(m => m.id === parseInt(purchaseForm.member_id));
      const invoiceData = {
        transaction_code: response.data.transaction_code,
        date: purchaseForm.date,
        member_name: member?.name || purchaseForm.supplier_name,
        supplier_name: purchaseForm.supplier_name,
        document_number: purchaseForm.document_number,
        items: purchaseForm.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        total_amount: calculateTotal(),
        notes: purchaseForm.notes,
        payment_status: purchaseForm.payment_status
      };

      setSavedInvoiceData(invoiceData);
      setShowInvoicePrint(true);

    } catch (error) {
      console.error('خطأ في تحديث الفاتورة:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء تحديث الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">جاري تحميل بيانات الفاتورة...</div>;
  }

  return (
    <div className="new-purchase">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/purchases')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1><IoCartOutline /> تعديل فاتورة شراء</h1>
      </div>

      <form onSubmit={handleSubmit} className="purchase-form">
        <div className="form-section">
          <h2>معلومات الفاتورة</h2>
          <div className="form-row">
            <div className="form-group half">
              <label>التاريخ</label>
              <DatePicker
                selected={purchaseForm.date}
                onChange={(date) => setPurchaseForm({...purchaseForm, date})}
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
                value={purchaseForm.member_id}
                onChange={(e) => setPurchaseForm({...purchaseForm, member_id: e.target.value})}
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
              <label>رقم الرصيد / الفاتورة الخارجية</label>
              <input
                type="text"
                value={purchaseForm.document_number}
                onChange={(e) => setPurchaseForm({...purchaseForm, document_number: e.target.value})}
                placeholder="اختياري"
                disabled={loading}
              />
            </div>
            <div className="form-group half">
              <label>اسم المؤسسة/المحل</label>
              <input
                type="text"
                value={purchaseForm.supplier_name}
                onChange={(e) => setPurchaseForm({...purchaseForm, supplier_name: e.target.value})}
                placeholder="اختياري"
                disabled={loading}
              />
            </div>
          </div>

          {/* حقل حالة الدفع */}
          <div className="form-row">
            <div className="form-group half">
              <label>حالة الدفع</label>
              <select
                value={purchaseForm.payment_status}
                onChange={(e) => setPurchaseForm({...purchaseForm, payment_status: e.target.value})}
                className="payment-select"
                disabled={loading}
              >
                <option value="unpaid">غير مدفوع</option>
                <option value="paid">مدفوع</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>المواد المشتراة</h2>
          <div className="items-controls">
            <select
              className="item-select"
              onChange={(e) => {
                const itemId = e.target.value;
                if (itemId) {
                  const item = items.find(i => i.id === parseInt(itemId));
                  if (item) handleAddItemToPurchase(item);
                  e.target.value = '';
                }
              }}
              disabled={loading}
            >
              <option value="">-- اختر مادة --</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.code} - {item.name} ({item.category === 'audio' ? 'صوتيات' : 'إعلامية'})
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

          {purchaseForm.items.length > 0 ? (
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
                  {purchaseForm.items.map((item, index) => (
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
                          onClick={() => handleRemoveItemFromPurchase(index)}
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
            value={purchaseForm.notes}
            onChange={(e) => setPurchaseForm({...purchaseForm, notes: e.target.value})}
            placeholder="أضف أي ملاحظات إضافية (اختياري)"
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/purchases')} disabled={loading}>
            إلغاء
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            <IoCheckmarkOutline /> {loading ? 'جاري التحديث...' : 'تحديث الفاتورة'}
          </button>
        </div>
      </form>

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
                      value={newItemData.purchase_price_dinars}
                      onChange={(e) => setNewItemData({...newItemData, purchase_price_dinars: e.target.value})}
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
                      value={newItemData.purchase_price_fils}
                      onChange={(e) => setNewItemData({...newItemData, purchase_price_fils: e.target.value})}
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

      <InvoicePrint
        isOpen={showInvoicePrint}
        onClose={() => {
          setShowInvoicePrint(false);
          navigate('/purchases');
        }}
        invoiceData={savedInvoiceData}
        type="purchase"
      />
    </div>
  );
};

export default EditPurchase;