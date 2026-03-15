import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBackOutline,
  IoCheckmarkOutline,
  IoCalendarOutline,
  IoMicOutline,
  IoSettingsOutline,
  IoPaperPlaneOutline
} from 'react-icons/io5';
import './NewOccasionEvent.css';

// الأشهر الهجرية المستخدمة فقط
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

// المناسبات حسب الشهر (بنفس ترتيب الأشهر أعلاه)
const occasionsByMonth = [
  // محرم (0)
  [
    'ليلة حادي', 'ليلة ثاني', 'ليلة ثالث', 'ليلة رابع', 'ليلة خامس',
    'ليلة سادس', 'ليلة سابع', 'ليلة ثامن', 'ليلة تاسع', 'ليلة عاشر',
    'يوم عاشر', 'ليلة الوحشة', 'ليلة 13', 'شهادة الامام السجاد'
  ],
  // صفر (1)
  [
    'شهادة الامام المجتبى', 'شهادة الامام الرضا', 'ليلة الاربعين', 'يوم الاربعين',
    'ليلة شهادة الرسول الأكرم', 'يوم شهادة الرسول الاكرم'
  ],
  // ربيع الأول (2)
  [
    'تسقيط الزهراء', 'شهادة الامام العسكري'
  ],
  // جمادى الأولى (3)
  [
    'شهادة السيدة الزهراء'
  ],
  // رجب (4)
  [
    'شهادة الامام الهادي', 'شهادة السيدة زينب', 'شهادة الامام الكاظم'
  ],
  // رمضان (5)
  [
    'ضربة الامام علي ( 19 رمضان )', 'مرض الامام علي ( 20 رمضان )', 'شهادة الامام علي ( 21 رمضان )'
  ],
  // شوال (6)
  [
    'شهادة الإمام الصادق'
  ],
  // ذو القعدة (7)
  [
    'شهادة الامام الجواد'
  ],
  // ذو الحجة (8)
  [
    'شهادة الامام الباقر', 'حرم الحجاج'
  ]
];

const NewOccasionEvent = () => {
  const [formData, setFormData] = useState({
    hijri_year: '',
    month: '',
    occasion_name: '',
    participant_names: '',
    has_raw_recording: false,
    has_engineering: false,
    has_telegram: false,
    notes: ''
  });
  const [availableOccasions, setAvailableOccasions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, []);

  // تحديث قائمة المناسبات المتاحة عند اختيار الشهر
  useEffect(() => {
    if (formData.month !== '') {
      const monthIndex = parseInt(formData.month);
      setAvailableOccasions(occasionsByMonth[monthIndex] || []);
      // إعادة تعيين اسم المناسبة إذا كان الشهر قد تغير
      setFormData(prev => ({ ...prev, occasion_name: '' }));
    } else {
      setAvailableOccasions([]);
      setFormData(prev => ({ ...prev, occasion_name: '' }));
    }
  }, [formData.month]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hijri_year) {
      alert('أدخل السنة الهجرية');
      return;
    }
    if (formData.month === '') {
      alert('اختر الشهر الهجري');
      return;
    }
    if (!formData.occasion_name) {
      alert('اختر المناسبة');
      return;
    }

    setLoading(true);
    try {
      // TODO: استبدال الرابط الفعلي للـ API
      // await axios.post('http://localhost:5000/api/occasion-events', formData);
      console.log('تم إضافة سجل:', formData);
      navigate('/occasions');
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-occasion-event">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/occasions')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1><IoCalendarOutline /> إضافة تسجيل مناسبة</h1>
      </div>

      <form onSubmit={handleSubmit} className="occasion-form">
        <div className="form-section">
          <h2>بيانات التسجيل</h2>
          
          {/* السنة والشهر في صف واحد */}
          <div className="form-row">
            <div className="form-group half">
              <label>السنة الهجرية <span className="required">*</span></label>
              <input
                type="number"
                min="1300"
                max="1500"
                step="1"
                value={formData.hijri_year}
                onChange={(e) => setFormData({...formData, hijri_year: e.target.value})}
                required
                placeholder="مثال: 1446"
                disabled={loading}
              />
            </div>
            <div className="form-group half">
              <label>الشهر الهجري <span className="required">*</span></label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
                required
                disabled={loading}
              >
                <option value="">اختر الشهر</option>
                {hijriMonths.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          {/* المناسبة (تظهر بعد اختيار الشهر) */}
          <div className="form-group">
            <label>المناسبة <span className="required">*</span></label>
            <select
              value={formData.occasion_name}
              onChange={(e) => setFormData({...formData, occasion_name: e.target.value})}
              required
              disabled={loading || formData.month === ''}
            >
              <option value="">اختر المناسبة</option>
              {availableOccasions.map((occ, index) => (
                <option key={index} value={occ}>{occ}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>أسماء المشاركين</label>
            <textarea
              value={formData.participant_names}
              onChange={(e) => setFormData({...formData, participant_names: e.target.value})}
              placeholder="أدخل الأسماء مفصولة بفواصل (مثال: حسين, علي, محمود)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>الخيارات المتاحة</label>
            <div className="options-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.has_raw_recording}
                  onChange={(e) => setFormData({...formData, has_raw_recording: e.target.checked})}
                  disabled={loading}
                />
                <span className="checkbox-custom">
                  <IoMicOutline /> تسجيل خام
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.has_engineering}
                  onChange={(e) => setFormData({...formData, has_engineering: e.target.checked})}
                  disabled={loading}
                />
                <span className="checkbox-custom">
                  <IoSettingsOutline /> هندسة
                </span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.has_telegram}
                  onChange={(e) => setFormData({...formData, has_telegram: e.target.checked})}
                  disabled={loading}
                />
                <span className="checkbox-custom">
                  <IoPaperPlaneOutline /> تلقرام
                </span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>ملاحظات إضافية</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="أضف أي ملاحظات هنا"
              rows="4"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/occasions')} disabled={loading}>
            إلغاء
          </button>
          <button type="submit" className="btn-save" disabled={loading}>
            <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ التسجيل'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOccasionEvent;