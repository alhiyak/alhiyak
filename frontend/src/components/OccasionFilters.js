import React from 'react';
import { 
  IoSearchOutline,
  IoFilterOutline,
  IoChevronForwardOutline,
  IoChevronBackOutline
} from 'react-icons/io5';
import './OccasionFilters.css';

// أسماء الأشهر الهجرية المستخدمة
const hijriMonths = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'جمادى الأولى',
  'رجب',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذي الحجة'
];

const OccasionFilters = ({
  availableYears,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  searchTerm,
  setSearchTerm,
  onExpandAll,
  onCollapseAll
}) => {
  return (
    <div className="occasion-filters">
      <h3>بحث وتصفية</h3>
      
      {/* بحث بالكلمة */}
      <div className="filter-group">
        <label><IoSearchOutline /> بحث</label>
        <input
          type="text"
          placeholder="اسم المناسبة أو الرادود..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* فلتر السنة */}
      <div className="filter-group">
        <label><IoFilterOutline /> السنة</label>
        <select
          value={selectedYear || ''}
          onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">جميع السنوات</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year} هـ</option>
          ))}
        </select>
      </div>

      {/* فلتر الشهر */}
      <div className="filter-group">
        <label><IoFilterOutline /> الشهر</label>
        <select
          value={selectedMonth !== null ? selectedMonth : ''}
          onChange={(e) => setSelectedMonth(e.target.value !== '' ? parseInt(e.target.value) : null)}
        >
          <option value="">جميع الأشهر</option>
          {hijriMonths.map((month, index) => (
            <option key={index} value={index}>{month}</option>
          ))}
        </select>
      </div>

      {/* أزرار توسيع/طي الكل */}
      <div className="filter-actions">
        <button className="filter-btn" onClick={onExpandAll}>
          <IoChevronBackOutline /> توسيع الكل
        </button>
        <button className="filter-btn" onClick={onCollapseAll}>
          <IoChevronForwardOutline /> طي الكل
        </button>
      </div>
    </div>
  );
};

export default OccasionFilters;