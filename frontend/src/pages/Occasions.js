import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoCalendarOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoMicOutline,
  IoSettingsOutline,
  IoPaperPlaneOutline,
  IoPersonOutline,
  IoChevronDownOutline,
  IoChevronUpOutline
} from 'react-icons/io5';
import OccasionFilters from '../components/OccasionFilters';
import './Occasions.css';

// أسماء الأشهر الهجرية المستخدمة فقط
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

const Occasions = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(null); // للسنة المحددة في الشريط الجانبي
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [expandedYears, setExpandedYears] = useState({}); // للتحكم بطي/توسيع السنوات
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchEvents();
    }
  }, []);

  const fetchEvents = async () => {
    try {
      // TODO: استبدال الرابط الفعلي للـ API
      // const response = await axios.get('http://localhost:5000/api/occasion-events');
      // setEvents(response.data);
      
      // بيانات تجريبية مؤقتة (أكثر تنوعاً)
      const mockData = [
        { id: 1, occasion_name: 'ليلة حادي', month: 0, hijri_year: 1446, participant_names: 'حسين, علي', has_raw_recording: true, has_engineering: false, has_telegram: true, notes: '' },
        { id: 2, occasion_name: 'ليلة حادي', month: 0, hijri_year: 1447, participant_names: 'محمود', has_raw_recording: true, has_engineering: true, has_telegram: false, notes: 'جودة عالية' },
        { id: 3, occasion_name: 'صفر', month: 1, hijri_year: 1446, participant_names: 'رضا, كاظم', has_raw_recording: false, has_engineering: true, has_telegram: true, notes: '' },
        { id: 4, occasion_name: 'شهادة الامام الرضا', month: 1, hijri_year: 1446, participant_names: 'حسن', has_raw_recording: true, has_engineering: false, has_telegram: false, notes: '' },
        { id: 5, occasion_name: 'ليلة عاشر', month: 0, hijri_year: 1448, participant_names: 'سعيد', has_raw_recording: true, has_engineering: true, has_telegram: true, notes: '' },
        { id: 6, occasion_name: 'شهادة السيدة الزهراء', month: 3, hijri_year: 1447, participant_names: 'فاطمة', has_raw_recording: false, has_engineering: true, has_telegram: false, notes: '' },
      ];
      setEvents(mockData);
      
      // توسيع جميع السنوات افتراضياً
      const years = [...new Set(mockData.map(e => e.hijri_year))];
      const expanded = years.reduce((acc, year) => ({ ...acc, [year]: true }), {});
      setExpandedYears(expanded);
      
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب المناسبات:', error);
      setLoading(false);
    }
  };

  // الحصول على السنوات المتوفرة
  const availableYears = useMemo(() => {
    return [...new Set(events.map(e => e.hijri_year))].sort((a, b) => b - a);
  }, [events]);

  // تطبيق الفلاتر (بحث، سنة محددة، شهر محدد)
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.occasion_name.toLowerCase().includes(term) ||
        (event.participant_names && event.participant_names.toLowerCase().includes(term))
      );
    }

    if (selectedYear) {
      filtered = filtered.filter(event => event.hijri_year === selectedYear);
    }

    if (selectedMonth !== null) {
      filtered = filtered.filter(event => event.month === selectedMonth);
    }

    return filtered;
  }, [events, searchTerm, selectedYear, selectedMonth]);

  // تجميع الأحداث حسب السنة ثم حسب الشهر
  const groupedByYear = useMemo(() => {
    const groups = {};
    filteredEvents.forEach(event => {
      if (!groups[event.hijri_year]) {
        groups[event.hijri_year] = {};
      }
      if (!groups[event.hijri_year][event.month]) {
        groups[event.hijri_year][event.month] = [];
      }
      groups[event.hijri_year][event.month].push(event);
    });
    return groups;
  }, [filteredEvents]);

  // دالة لتبديل توسيع سنة معينة
  const toggleYear = (year) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  // توسيع جميع السنوات
  const expandAll = () => {
    const allExpanded = availableYears.reduce((acc, year) => ({ ...acc, [year]: true }), {});
    setExpandedYears(allExpanded);
  };

  // طي جميع السنوات
  const collapseAll = () => {
    const allCollapsed = availableYears.reduce((acc, year) => ({ ...acc, [year]: false }), {});
    setExpandedYears(allCollapsed);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      // TODO: استبدال الرابط الفعلي
      // await axios.delete(`http://localhost:5000/api/occasion-events/${id}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="occasions">
      <div className="header">
        <h1><IoCalendarOutline /> أرشيف المناسبات</h1>
        <button className="btn-add" onClick={() => navigate('/occasions/new')}>
          <IoAddOutline /> إضافة تسجيل جديد
        </button>
      </div>

      <div className="occasions-layout">
        {/* الشريط الجانبي للفلاتر */}
        <aside className="filters-sidebar">
          <OccasionFilters
            availableYears={availableYears}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        </aside>

        {/* المحتوى الرئيسي */}
        <main className="occasions-content">
          {/* عرض النتائج مجمعة حسب السنة */}
          {availableYears.length === 0 ? (
            <div className="empty-message">لا توجد سجلات بعد. أضف أول تسجيل الآن.</div>
          ) : (
            <div className="years-container">
              {availableYears.map(year => {
                const yearData = groupedByYear[year];
                if (!yearData) return null;

                const totalForYear = Object.values(yearData).reduce((sum, events) => sum + events.length, 0);
                const isExpanded = expandedYears[year];

                return (
                  <div key={year} className="year-group">
                    <div className="year-header" onClick={() => toggleYear(year)}>
                      <div className="year-title">
                        <h2>سنة {year} هـ</h2>
                        <span className="year-count">{totalForYear} مناسبة</span>
                      </div>
                      <div className="year-toggle">
                        {isExpanded ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="year-content">
                        {Object.entries(yearData)
                          .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
                          .map(([month, events]) => (
                            <div key={month} className="month-group">
                              <div className="month-title">
                                <h3>{hijriMonths[parseInt(month)]}</h3>
                                <span className="month-count">{events.length}</span>
                              </div>
                              <div className="month-events">
                                <table className="compact-table">
                                  <thead>
                                    <tr>
                                      <th>المناسبة</th>
                                      <th>أسماء المشاركين</th>
                                      <th>الخيارات</th>
                                      <th>ملاحظات</th>
                                      <th>الإجراءات</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {events.map(event => (
                                      <tr key={event.id} className="event-row">
                                        <td className="event-name">{event.occasion_name}</td>
                                        <td className="participants-cell">
                                          {event.participant_names ? (
                                            <>
                                              <IoPersonOutline /> {event.participant_names}
                                            </>
                                          ) : '-'}
                                        </td>
                                        <td className="options-cell">
                                          {event.has_raw_recording && <IoMicOutline className="option-icon" title="تسجيل خام" />}
                                          {event.has_engineering && <IoSettingsOutline className="option-icon" title="هندسة" />}
                                          {event.has_telegram && <IoPaperPlaneOutline className="option-icon" title="تلقرام" />}
                                        </td>
                                        <td>{event.notes || '-'}</td>
                                        <td className="actions-cell">
                                          <button className="btn-icon btn-edit" title="تعديل">
                                            <IoCreateOutline />
                                          </button>
                                          <button className="btn-icon btn-delete" onClick={() => handleDelete(event.id)} title="حذف">
                                            <IoTrashOutline />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Occasions;