import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoArrowBackOutline,
  IoCheckmarkOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import './NewOccasion.css';

// أسماء الأشهر الهجرية
const hijriMonths = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const NewOccasion = () => {
  const [formData, setFormData] = useState({
    name: '',
    month: 0,
    year: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('اسم المناسبة مطلوب');
      return;
    }
    if (!formData.year) {
      alert('السنة الهجرية مطلوبة');
      return;
    }

    setLoading(true);
    try {
      // TODO: استبدال الرابط الفعلي للـ API
      // await axios.post('http://localhost:5000/api/occasions', formData);
      console.log('تم إضافة مناسبة:', formData);
      navigate('/occasions');
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-occasion">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/occasions')}>
          <IoArrowBackOutline /> رجوع
        </button>
        <h1><IoCalendarOutline /> إضافة مناسبة جديدة</h1>
      </div>

      <form onSubmit={handleSubmit} className="occasion-form">
        <div className="form-section">
          <h2>بيانات المناسبة</h2>
          <div className="form-row">
            <div className="form-group half">
              <label>اسم المناسبة <span className="required">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="مثال: ليلة حادي"
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="form-group half">
              <label>السنة الهجرية <span className="required">*</span></label>
              <input
                type="number"
                min="1300"
                max="1500"
                step="1"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                required
                placeholder="مثال: 1446"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>الشهر الهجري</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
              disabled={loading}
            >
              {hijriMonths.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>ملاحظات</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="أضف أي ملاحظات إضافية (اختياري)"
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
            <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ المناسبة'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOccasion;