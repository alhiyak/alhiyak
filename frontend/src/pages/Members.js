import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoPersonAddOutline, 
  IoCreateOutline, 
  IoTrashOutline, 
  IoCallOutline, 
  IoLocationOutline,
  IoPeopleOutline,
  IoCheckmarkOutline  // أيقونة الحفظ - مهم
} from 'react-icons/io5';
import './Members.css';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'member'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchMembers();
    }
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('خطأ في جلب الأعضاء:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert('فشل في تحميل قائمة الأعضاء. تأكد من اتصال الخادم.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('الاسم مطلوب');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/members', {
        name: formData.name.trim(),
        phone: formData.phone || null,
        address: formData.address || null,
        type: formData.type
      });
      setShowModal(false);
      setFormData({ name: '', phone: '', address: '', type: 'member' });
      fetchMembers();
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({
      name: member.name,
      phone: member.phone || '',
      address: member.address || '',
      type: member.type || 'member'
    });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('الاسم مطلوب');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`http://localhost:5000/api/members/${currentMember.id}`, {
        name: formData.name.trim(),
        phone: formData.phone || null,
        address: formData.address || null,
        type: formData.type
      });
      setEditModal(false);
      setCurrentMember(null);
      setFormData({ name: '', phone: '', address: '', type: 'member' });
      fetchMembers();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
      }
    }
  };

  return (
    <div className="members">
      <div className="header">
        <h1><IoPeopleOutline /> إدارة الأعضاء</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <IoPersonAddOutline /> إضافة عضو جديد
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>الكود</th>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>العنوان</th>
              <th>النوع</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-message">
                  لا يوجد أعضاء بعد. أضف أول عضو الآن.
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id}>
                  <td><span className="member-code">{member.member_code}</span></td>
                  <td>{member.name}</td>
                  <td>
                    {member.phone ? (
                      <span className="contact-info">
                        <IoCallOutline /> {member.phone}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {member.address ? (
                      <span className="contact-info">
                        <IoLocationOutline /> {member.address}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{member.type === 'member' ? 'عضو' : member.type}</td>
                  <td>{new Date(member.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(member)} title="تعديل">
                      <IoCreateOutline />
                    </button>
                    <button className="btn-icon btn-delete" onClick={() => handleDelete(member.id)} title="حذف">
                      <IoTrashOutline />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال إضافة عضو جديد - مهم: تأكد من أن كلاس الزر هو btn-save */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>إضافة عضو جديد</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الاسم <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    placeholder="أدخل الاسم كاملاً"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    placeholder="اختياري"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>العنوان</label>
                  <textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    placeholder="اختياري"
                    rows="2"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={loading}>
                  إلغاء
                </button>
                {/* مهم: هنا يجب أن يكون الزر بـ className="btn-save" */}
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ العضو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل عضو - نفس الشيء */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>تعديل بيانات العضو</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>الاسم <span className="required">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input 
                    type="text" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>العنوان</label>
                  <textarea 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                    rows="2"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'تحديث البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;