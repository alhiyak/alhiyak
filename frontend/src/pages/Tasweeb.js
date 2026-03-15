import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoPlayCircleOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoAddOutline,
  IoCheckmarkOutline,
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
import './Tasweeb.css';

const Tasweeb = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date(),
    member_id: '',
    total_amount: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  
  // فلاتر متقدمة
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  // حالة الترتيب
  const [sortConfig, setSortConfig] = useState({
    key: 'transaction_code',
    direction: 'desc'
  });

  // استخدام هوك التحديد
  const {
    selectedIds,
    selectedItems,
    selectionCount,
    isAllSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected
  } = useSelection(records, 'id');

  const navigate = useNavigate();

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchRecords();
      fetchMembers();
    }
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tasweeb');
      setRecords(response.data);
      const total = response.data.reduce((sum, record) => sum + parseFloat(record.total_amount), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('خطأ في جلب سجلات التثويبات:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
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

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record => 
        record.transaction_code?.toLowerCase().includes(term) ||
        record.member_name?.toLowerCase().includes(term) ||
        record.notes?.toLowerCase().includes(term) ||
        record.total_amount?.toString().includes(term)
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom).setHours(0, 0, 0, 0);
      filtered = filtered.filter(record => new Date(record.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo).setHours(23, 59, 59, 999);
      filtered = filtered.filter(record => new Date(record.date) <= toDate);
    }

    if (selectedMonth !== '') {
      filtered = filtered.filter(record => {
        const recordMonth = new Date(record.date).getMonth();
        return recordMonth === parseInt(selectedMonth);
      });
    }

    return filtered;
  }, [records, searchTerm, dateFrom, dateTo, selectedMonth]);

  const sortedRecords = useMemo(() => {
    const sortable = [...filteredRecords];
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
      } else if (sortConfig.key === 'month') {
        aValue = new Date(a.date).getMonth();
        bValue = new Date(b.date).getMonth();
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredRecords, sortConfig]);

  const selectedTotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);

  const printColumns = [
    { key: 'transaction_code', label: 'الكود' },
    { key: 'date', label: 'التاريخ' },
    { key: 'member_name', label: 'العضو' },
    { key: 'total_amount', label: 'المبلغ' },
    { key: 'notes', label: 'ملاحظات' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom(null);
    setDateTo(null);
    setSelectedMonth('');
  };

  const resetForm = () => {
    setFormData({
      date: new Date(),
      member_id: '',
      total_amount: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.member_id) {
      alert('الرجاء اختيار العضو');
      return;
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tasweeb', {
        date: formData.date.toISOString().split('T')[0],
        member_id: formData.member_id,
        total_amount: parseFloat(formData.total_amount),
        notes: formData.notes
      });
      setShowModal(false);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setFormData({
      date: new Date(record.date),
      member_id: record.member_id,
      total_amount: record.total_amount,
      notes: record.notes || ''
    });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.member_id) {
      alert('الرجاء اختيار العضو');
      return;
    }
    if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/tasweeb/${currentRecord.id}`, {
        date: formData.date.toISOString().split('T')[0],
        member_id: formData.member_id,
        total_amount: parseFloat(formData.total_amount),
        notes: formData.notes
      });
      setEditModal(false);
      setCurrentRecord(null);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/tasweeb/${id}`);
      fetchRecords();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim()) {
      alert('الاسم مطلوب');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/members', {
        name: newMemberName.trim()
      });
      setMemberModal(false);
      setNewMemberName('');
      fetchMembers();
    } catch (error) {
      console.error('خطأ في إضافة العضو:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء إضافة العضو');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return monthNames[date.getMonth()];
  };

  const lastAmount = sortedRecords.length > 0 ? sortedRecords[0].total_amount : 0;
  const lastDate = sortedRecords.length > 0 ? sortedRecords[0].date : null;

  return (
    <div className="tasweeb">
      <div className="header">
        <h1><IoPlayCircleOutline /> التثويبات</h1>
        <div>
          <button className="btn-add" onClick={() => setMemberModal(true)}>
            <IoAddOutline /> عضو جديد
          </button>
          <button className="btn-add" onClick={() => setShowModal(true)} style={{ marginRight: '10px' }}>
            <IoAddOutline /> دفعة جديدة
          </button>
        </div>
      </div>

      <div className="stats-bar">
        <div className="last-amount">
          <span>آخر دفعة: </span>
          <strong>{lastAmount} د.ب</strong>
          {lastDate && (
            <span> {formatDate(lastDate)} ({getMonthName(lastDate)})</span>
          )}
        </div>
        <div className="total-amount">
          <span>الإجمالي الحالي: </span>
          <strong>{totalAmount.toFixed(3)} د.ب</strong>
        </div>
      </div>

      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في السجلات (كود، عضو، مبلغ، ملاحظات)..."
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

        <button className="btn-clear-filters" onClick={clearFilters} title="مسح الفلاتر">
          <IoCloseOutline />
        </button>

        {selectionCount > 0 && (
          <div className="action-buttons">
            <button className="btn-cancel" onClick={deselectAll}>إلغاء</button>
            <button className="btn-save" onClick={() => setPrintModalOpen(true)}>
              <IoPrintOutline /> طباعة
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
                الكود {getSortIcon('transaction_code')}
              </th>
              <th onClick={() => requestSort('date')}>
                التاريخ {getSortIcon('date')}
              </th>
              <th onClick={() => requestSort('month')}>
                الشهر {getSortIcon('month')}
              </th>
              <th onClick={() => requestSort('member_name')}>
                العضو {getSortIcon('member_name')}
              </th>
              <th onClick={() => requestSort('total_amount')}>
                المبلغ {getSortIcon('total_amount')}
              </th>
              <th onClick={() => requestSort('notes')}>
                ملاحظات {getSortIcon('notes')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">لا توجد سجلات تطابق معايير البحث.</td>
              </tr>
            ) : (
              sortedRecords.map(record => (
                <tr key={record.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={isSelected(record.id)}
                      onChange={() => toggleSelection(record.id)}
                    />
                  </td>
                  <td><span className="record-code">{record.transaction_code}</span></td>
                  <td>{formatDate(record.date)}</td>
                  <td>{getMonthName(record.date)}</td>
                  <td>{record.member_name}</td>
                  <td>{record.total_amount} د.ب</td>
                  <td>{record.notes || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(record)} title="تعديل">
                      <IoCreateOutline />
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(record.id)} title="حذف">
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
        title="كشف حساب التثويبات"
        data={selectedItems.map(item => ({
          ...item,
          date: formatDate(item.date),
          total_amount: item.total_amount + ' د.ب'
        }))}
        columns={printColumns}
        totalAmount={selectedTotal}
      />

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>إضافة دفعة تثويبة جديدة</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>العضو <span className="required">*</span></label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">اختر العضو</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.member_code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>التاريخ</label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({...formData, date})}
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
                    <label>المبلغ <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                      required
                      placeholder="0.000"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="اختياري"
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>تعديل دفعة التثويبة</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>العضو <span className="required">*</span></label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({...formData, member_id: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">اختر العضو</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.member_code} - {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>التاريخ</label>
                    <DatePicker
                      selected={formData.date}
                      onChange={(date) => setFormData({...formData, date})}
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
                    <label>المبلغ <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={formData.total_amount}
                      onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'تحديث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {memberModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-small">
            <div className="modal-header">
              <h3>إضافة عضو جديد</h3>
              <button className="modal-close" onClick={() => setMemberModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>الاسم <span className="required">*</span></label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="أدخل اسم العضو"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setMemberModal(false)}>
                إلغاء
              </button>
              <button type="button" className="btn-save" onClick={handleAddMember}>
                <IoCheckmarkOutline /> إضافة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasweeb;