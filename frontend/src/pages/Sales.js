import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoStatsChartOutline,
  IoAddOutline,
  IoDocumentTextOutline,
  IoCreateOutline,  // أيقونة التعديل
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
import './Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
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
  const [paymentStatus, setPaymentStatus] = useState('');

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
  } = useSelection(sales, 'id');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchSales();
      fetchMembers();
      fetchItems();
    }
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSales(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب المبيعات:', error);
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('خطأ في جلب الأعضاء:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const filteredSales = useMemo(() => {
    let filtered = sales;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        sale.transaction_code?.toLowerCase().includes(term) ||
        sale.member_name?.toLowerCase().includes(term) ||
        sale.notes?.toLowerCase().includes(term) ||
        sale.total_amount?.toString().includes(term)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0);
      filtered = filtered.filter(sale => new Date(sale.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo).setHours(23, 59, 59, 999);
      filtered = filtered.filter(sale => new Date(sale.date) <= toDate);
    }

    if (selectedMonth !== '') {
      filtered = filtered.filter(sale => {
        const month = new Date(sale.date).getMonth();
        return month === parseInt(selectedMonth);
      });
    }

    if (selectedItemId) {
      filtered = filtered.filter(sale => 
        sale.items && sale.items.some(item => item.item_id === parseInt(selectedItemId))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(sale => 
        sale.items && sale.items.some(item => {
          const foundItem = items.find(i => i.id === item.item_id);
          return foundItem && foundItem.category === selectedCategory;
        })
      );
    }

    if (paymentStatus) {
      filtered = filtered.filter(sale => sale.payment_status === paymentStatus);
    }

    return filtered;
  }, [sales, searchTerm, dateFrom, dateTo, selectedMonth, selectedItemId, selectedCategory, paymentStatus, items]);

  const sortedSales = useMemo(() => {
    const sortable = [...filteredSales];
    sortable.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'date') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (sortConfig.key === 'total_amount') {
        aValue = parseFloat(a.total_amount);
        bValue = parseFloat(b.total_amount);
      } else if (sortConfig.key === 'member_name') {
        aValue = a.member_name || '';
        bValue = b.member_name || '';
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredSales, sortConfig]);

  const selectedTotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

  const printColumns = [
    { key: 'transaction_code', label: 'رقم الفاتورة' },
    { key: 'date', label: 'التاريخ' },
    { key: 'member_name', label: 'العميل' },
    { key: 'total_amount', label: 'الإجمالي' },
    { key: 'payment_status', label: 'حالة الدفع' },
    { key: 'notes', label: 'ملاحظات' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setSelectedMonth('');
    setSelectedItemId('');
    setSelectedCategory('');
    setPaymentStatus('');
  };

  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? member.name : 'غير معروف';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSales();
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

  const getPaymentStatusText = (status) => {
    const statusMap = {
      paid: 'مدفوع',
      unpaid: 'غير مدفوع',
      partial: 'مدفوع جزئياً'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="sales">
      <div className="header">
        <h1><IoStatsChartOutline /> المبيعات</h1>
        <button className="btn-add" onClick={() => navigate('/sales/new')}>
          <IoAddOutline /> فاتورة جديدة
        </button>
      </div>

      <div className="stats-bar">
        <div className="total-amount">
          <span>إجمالي المبيعات المحددة: </span>
          <strong>{selectedTotal.toFixed(3)} د.ب</strong>
        </div>
      </div>

      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في الفواتير (رقم، عميل، ملاحظات)..."
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

        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">كل حالات الدفع</option>
          <option value="paid">مدفوع</option>
          <option value="unpaid">غير مدفوع</option>
          <option value="partial">مدفوع جزئياً</option>
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
              <th onClick={() => requestSort('member_name')}>
                العميل {getSortIcon('member_name')}
              </th>
              <th>عدد الأصناف</th>
              <th onClick={() => requestSort('total_amount')}>
                الإجمالي {getSortIcon('total_amount')}
              </th>
              <th>حالة الدفع</th>
              <th onClick={() => requestSort('notes')}>
                ملاحظات {getSortIcon('notes')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sortedSales.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-message">لا توجد فواتير تطابق معايير البحث.</td>
              </tr>
            ) : (
              sortedSales.map(sale => (
                <tr key={sale.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(sale.id)}
                      onChange={() => toggleSelection(sale.id)}
                    />
                  </td>
                  <td><span className="sale-code">{sale.transaction_code}</span></td>
                  <td>{formatDate(sale.date)}</td>
                  <td>{sale.member_name || getMemberName(sale.member_id)}</td>
                  <td>{sale.items?.length || 0}</td>
                  <td>{parseFloat(sale.total_amount).toFixed(3)} د.ب</td>
                  <td>
                    <span className={`payment-status status-${sale.payment_status}`}>
                      {getPaymentStatusText(sale.payment_status)}
                    </span>
                  </td>
                  <td>{sale.notes || '-'}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-icon btn-view" 
                      title="عرض التفاصيل" 
                      onClick={() => navigate(`/sales/${sale.id}`)}
                    >
                      <IoDocumentTextOutline />
                    </button>
                    <button 
                      className="btn-icon btn-edit" 
                      title="تعديل الفاتورة" 
                      onClick={() => navigate(`/sales/edit/${sale.id}`)}
                    >
                      <IoCreateOutline />
                    </button>
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => handleDelete(sale.id)} 
                      title="حذف"
                    >
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
        title="كشف فواتير المبيعات"
        data={selectedItems.map(item => ({
          ...item,
          date: formatDate(item.date),
          total_amount: parseFloat(item.total_amount).toFixed(3) + ' د.ب',
          payment_status: getPaymentStatusText(item.payment_status)
        }))}
        columns={printColumns}
        totalAmount={selectedTotal}
      />
    </div>
  );
};

export default Sales;