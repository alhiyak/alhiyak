import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoCartOutline,
  IoAddOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoPrintOutline,
  IoCloseOutline
} from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import SearchBar from '../components/SearchBar';
import PrintModal from '../components/PrintModal';
import useSelection from '../hooks/useSelection';
import './Purchases.css';

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  
  // فلاتر متقدمة
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 👈 جديد

  const [sortConfig, setSortConfig] = useState({
    key: 'transaction_code',
    direction: 'desc'
  });

  const navigate = useNavigate();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const {
    selectedIds,
    selectedItems,
    selectionCount,
    isAllSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected
  } = useSelection(purchases, 'id');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchPurchases();
      fetchMembers();
      fetchItems();
    }
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchases');
      setPurchases(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب المشتريات:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
      setLoading(false);
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

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'desc' ? <IoArrowDownOutline /> : <IoArrowUpOutline />;
  };

  const filteredPurchases = useMemo(() => {
    let filtered = purchases;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.transaction_code?.toLowerCase().includes(term) ||
        p.supplier_name?.toLowerCase().includes(term) ||
        p.notes?.toLowerCase().includes(term) ||
        p.total_amount?.toString().includes(term)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => new Date(p.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo).setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => new Date(p.date) <= toDate);
    }

    if (selectedMonth !== '') {
      filtered = filtered.filter(p => {
        const month = new Date(p.date).getMonth();
        return month === parseInt(selectedMonth);
      });
    }

    if (selectedItemId) {
      filtered = filtered.filter(p => 
        p.items && p.items.some(item => item.item_id === parseInt(selectedItemId))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => 
        p.items && p.items.some(item => {
          const foundItem = items.find(i => i.id === item.item_id);
          return foundItem && foundItem.category === selectedCategory;
        })
      );
    }

    // 👇 فلتر حالة الدفع جديد
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(p => p.payment_status === paymentFilter);
    }

    return filtered;
  }, [purchases, searchTerm, dateFrom, dateTo, selectedMonth, selectedItemId, selectedCategory, paymentFilter, items]);

  const sortedPurchases = useMemo(() => {
    const sortable = [...filteredPurchases];
    sortable.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortConfig.key === 'total_amount') {
        aValue = parseFloat(a.total_amount);
        bValue = parseFloat(b.total_amount);
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredPurchases, sortConfig]);

  const selectedTotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

  const printColumns = [
    { key: 'transaction_code', label: 'رقم الفاتورة' },
    { key: 'date', label: 'التاريخ' },
    { key: 'supplier_name', label: 'الجهة المشترية' },
    { key: 'total_amount', label: 'الإجمالي' },
    { key: 'payment_status', label: 'حالة الدفع' }, // 👈 جديد
    { key: 'notes', label: 'ملاحظات' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setSelectedMonth('');
    setSelectedItemId('');
    setSelectedCategory('');
    setPaymentFilter('all'); // 👈 جديد
  };

  const getSupplierName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'غير معروف';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/purchases/${id}`);
      fetchPurchases();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 👇 دالة عرض حالة الدفع مع تلوين
  const getPaymentStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return <span className="payment-badge paid">مدفوع</span>;
      case 'unpaid':
        return <span className="payment-badge unpaid">غير مدفوع</span>;
      default:
        return <span className="payment-badge">{status}</span>;
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="purchases">
      <div className="header">
        <h1><IoCartOutline /> المشتريات</h1>
        <button className="btn-add" onClick={() => navigate('/purchases/new')}>
          <IoAddOutline /> فاتورة جديدة
        </button>
      </div>

      <div className="stats-bar">
        <div className="total-amount">
          <span>إجمالي المشتريات: </span>
          <strong>{selectedTotal.toFixed(3)} د.ب</strong>
        </div>
      </div>

      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في الفواتير (رقم، جهة، ملاحظات)..."
        />
        
        <div className="date-range">
          <DatePicker
            selected={dateFrom}
            onChange={setDateFrom}
            dateFormat="dd/MM/yyyy"
            placeholderText="من تاريخ"
            isClearable
            className="filter-datepicker"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            yearDropdownItemNumber={15}
          />
          <span className="date-separator">–</span>
          <DatePicker
            selected={dateTo}
            onChange={setDateTo}
            dateFormat="dd/MM/yyyy"
            placeholderText="إلى تاريخ"
            isClearable
            className="filter-datepicker"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            yearDropdownItemNumber={15}
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="filter-select"
        >
          <option value="">كل الأشهر</option>
          {monthNames.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>

        <select
          value={selectedItemId}
          onChange={(e) => setSelectedItemId(e.target.value)}
          className="filter-select"
        >
          <option value="">جميع المواد</option>
          {items.map(item => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">كل الأقسام</option>
          <option value="audio">صوتيات</option>
          <option value="media">إعلامية</option>
        </select>

        {/* 👇 فلتر حالة الدفع جديد */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">كل الحالات</option>
          <option value="paid">مدفوع</option>
          <option value="unpaid">غير مدفوع</option>
        </select>

        <button className="btn-clear-filters" onClick={clearFilters} title="مسح الفلاتر">
          <IoCloseOutline />
        </button>

        {selectionCount > 0 && (
          <div className="action-buttons">
            <button className="btn-cancel" onClick={deselectAll}>إلغاء</button>
            <button className="btn-save" onClick={() => setPrintModalOpen(true)}>
              <IoPrintOutline /> طباعة المحدد
            </button>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                />
              </th>
              <th onClick={() => requestSort('transaction_code')}>
                رقم الفاتورة {getSortIcon('transaction_code')}
              </th>
              <th onClick={() => requestSort('date')}>
                التاريخ {getSortIcon('date')}
              </th>
              <th onClick={() => requestSort('supplier_name')}>
                الجهة المشترية {getSortIcon('supplier_name')}
              </th>
              <th>عدد الأصناف</th>
              <th onClick={() => requestSort('total_amount')}>
                الإجمالي {getSortIcon('total_amount')}
              </th>
              <th>حالة الدفع</th> {/* 👇 عمود جديد */}
              <th onClick={() => requestSort('notes')}>
                ملاحظات {getSortIcon('notes')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sortedPurchases.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-message">لا توجد فواتير تطابق معايير البحث.</td>
              </tr>
            ) : (
              sortedPurchases.map(purchase => (
                <tr key={purchase.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(purchase.id)}
                      onChange={() => toggleSelection(purchase.id)}
                    />
                  </td>
                  <td><span className="purchase-code">{purchase.transaction_code}</span></td>
                  <td>{formatDate(purchase.date)}</td>
                  <td>{purchase.supplier_name || getSupplierName(purchase.supplier_id)}</td>
                  <td>{purchase.items?.length || 0}</td>
                  <td>{purchase.total_amount} د.ب</td>
                  <td>{getPaymentStatusBadge(purchase.payment_status)}</td> {/* 👇 عرض الحالة */}
                  <td>{purchase.notes || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-view" title="عرض التفاصيل" onClick={() => navigate(`/purchases/${purchase.id}`)}>
                      <IoDocumentTextOutline />
                    </button>
                    {/* 👇 زر تعديل جديد */}
                    <button className="btn-icon btn-edit" title="تعديل" onClick={() => navigate(`/purchases/edit/${purchase.id}`)}>
                      <IoCreateOutline />
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(purchase.id)} title="حذف">
                      <IoTrashOutline />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="كشف فواتير المشتريات"
        data={selectedItems.map(item => ({
          ...item,
          date: formatDate(item.date),
          total_amount: item.total_amount + ' د.ب',
          payment_status: item.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'
        }))}
        columns={printColumns}
        totalAmount={selectedTotal}
      />
    </div>
  );
};

export default Purchases;