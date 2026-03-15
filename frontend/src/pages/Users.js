import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoPeopleOutline,
  IoAddOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoKeyOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
  IoSettingsOutline
} from 'react-icons/io5';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [permissionsModal, setPermissionsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [permissions, setPermissions] = useState({
    associations: { view: false, add: false, edit: false, delete: false, print: false },
    tasweeb: { view: false, add: false, edit: false, delete: false, print: false },
    sales: { view: false, add: false, edit: false, delete: false, print: false },
    purchases: { view: false, add: false, edit: false, delete: false, print: false },
    inventory: { view: false, add: false, edit: false, delete: false, print: false },
    members: { view: false, add: false, edit: false, delete: false, print: false },
    occasions: { view: false, add: false, edit: false, delete: false, print: false },
    reports: { view: false }
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/dashboard');
    } else {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'user'
    });
  };

  const resetPermissions = () => {
    setPermissions({
      associations: { view: false, add: false, edit: false, delete: false, print: false },
      tasweeb: { view: false, add: false, edit: false, delete: false, print: false },
      sales: { view: false, add: false, edit: false, delete: false, print: false },
      purchases: { view: false, add: false, edit: false, delete: false, print: false },
      inventory: { view: false, add: false, edit: false, delete: false, print: false },
      members: { view: false, add: false, edit: false, delete: false, print: false },
      occasions: { view: false, add: false, edit: false, delete: false, print: false },
      reports: { view: false }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      alert('اسم المستخدم مطلوب');
      return;
    }
    if (!formData.password.trim()) {
      alert('كلمة السر مطلوبة');
      return;
    }

    setLoadingSubmit(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username.trim(),
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      });
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('خطأ في الإضافة:', error);
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      role: user.role
    });
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      await axios.put(`http://localhost:5000/api/users/${currentUser.id}`, {
        username: formData.username.trim(),
        full_name: formData.full_name,
        role: formData.role,
        password: formData.password || undefined
      });
      setEditModal(false);
      setCurrentUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handlePermissionsClick = (user) => {
    setCurrentUser(user);
    // هنا يمكن تحميل الصلاحيات من قاعدة البيانات إذا كانت مخزنة
    // حالياً سنستخدم الصلاحيات الافتراضية
    setPermissions({
      associations: { view: true, add: true, edit: true, delete: true, print: true },
      tasweeb: { view: true, add: true, edit: true, delete: true, print: true },
      sales: { view: true, add: true, edit: true, delete: true, print: true },
      purchases: { view: true, add: true, edit: true, delete: true, print: true },
      inventory: { view: true, add: true, edit: true, delete: true, print: true },
      members: { view: true, add: true, edit: true, delete: true, print: true },
      occasions: { view: true, add: true, edit: true, delete: true, print: true },
      reports: { view: true }
    });
    setPermissionsModal(true);
  };

  const handlePermissionChange = (section, action) => {
    setPermissions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [action]: !prev[section][action]
      }
    }));
  };

  const handleSavePermissions = async () => {
    // TODO: إرسال الصلاحيات إلى الخادم
    console.log('حفظ الصلاحيات للمستخدم:', currentUser?.id, permissions);
    alert('تم حفظ الصلاحيات (تجريبي)');
    setPermissionsModal(false);
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="users">
      <div className="header">
        <h1><IoPeopleOutline /> إدارة المستخدمين</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <IoAddOutline /> إضافة مستخدم
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>الاسم الكامل</th>
              <th>الدور</th>
              <th>تاريخ التسجيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-message">لا يوجد مستخدمين بعد.</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.full_name || '-'}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                      {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="actions-cell">
                    <button className="btn-icon btn-edit" onClick={() => handleEdit(user)} title="تعديل">
                      <IoCreateOutline />
                    </button>
                    <button className="btn-icon btn-permissions" onClick={() => handlePermissionsClick(user)} title="الصلاحيات">
                      <IoKeyOutline />
                    </button>
                    {user.username !== 'admin' && (
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(user.id)} title="حذف">
                        <IoTrashOutline />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* مودال إضافة مستخدم */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>إضافة مستخدم جديد</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المستخدم <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    placeholder="أدخل اسم المستخدم"
                    autoFocus
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>كلمة السر <span className="required">*</span></label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    placeholder="أدخل كلمة السر"
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="اختياري"
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    disabled={loadingSubmit}
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)} disabled={loadingSubmit}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loadingSubmit}>
                  <IoCheckmarkOutline /> {loadingSubmit ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل مستخدم */}
      {editModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>تعديل بيانات المستخدم</h3>
              <button className="modal-close" onClick={() => setEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>اسم المستخدم <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>كلمة السر (اتركها فارغة إذا لم ترد تغييرها)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="أدخل كلمة سر جديدة"
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    disabled={loadingSubmit}
                  />
                </div>
                <div className="form-group">
                  <label>الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    disabled={loadingSubmit}
                  >
                    <option value="user">مستخدم</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEditModal(false)} disabled={loadingSubmit}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loadingSubmit}>
                  <IoCheckmarkOutline /> {loadingSubmit ? 'جاري الحفظ...' : 'تحديث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال إدارة الصلاحيات */}
      {permissionsModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-large">
            <div className="modal-header">
              <h3>صلاحيات المستخدم: {currentUser?.username}</h3>
              <button className="modal-close" onClick={() => setPermissionsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="permissions-container">
                {/* الجمعية */}
                <div className="permission-section">
                  <h4>الجمعية</h4>
                  <div className="permission-actions">
                    <label>
                      <input
                        type="checkbox"
                        checked={permissions.associations.view}
                        onChange={() => handlePermissionChange('associations', 'view')}
                      /> عرض
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissions.associations.add}
                        onChange={() => handlePermissionChange('associations', 'add')}
                      /> إضافة
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissions.associations.edit}
                        onChange={() => handlePermissionChange('associations', 'edit')}
                      /> تعديل
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissions.associations.delete}
                        onChange={() => handlePermissionChange('associations', 'delete')}
                      /> حذف
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={permissions.associations.print}
                        onChange={() => handlePermissionChange('associations', 'print')}
                      /> طباعة
                    </label>
                  </div>
                </div>

                {/* التثويبات */}
                <div className="permission-section">
                  <h4>التثويبات</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.tasweeb.view} onChange={() => handlePermissionChange('tasweeb', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.tasweeb.add} onChange={() => handlePermissionChange('tasweeb', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.tasweeb.edit} onChange={() => handlePermissionChange('tasweeb', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.tasweeb.delete} onChange={() => handlePermissionChange('tasweeb', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.tasweeb.print} onChange={() => handlePermissionChange('tasweeb', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* المبيعات */}
                <div className="permission-section">
                  <h4>المبيعات</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.sales.view} onChange={() => handlePermissionChange('sales', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.sales.add} onChange={() => handlePermissionChange('sales', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.sales.edit} onChange={() => handlePermissionChange('sales', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.sales.delete} onChange={() => handlePermissionChange('sales', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.sales.print} onChange={() => handlePermissionChange('sales', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* المشتريات */}
                <div className="permission-section">
                  <h4>المشتريات</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.purchases.view} onChange={() => handlePermissionChange('purchases', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.purchases.add} onChange={() => handlePermissionChange('purchases', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.purchases.edit} onChange={() => handlePermissionChange('purchases', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.purchases.delete} onChange={() => handlePermissionChange('purchases', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.purchases.print} onChange={() => handlePermissionChange('purchases', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* المخزن (المواد) */}
                <div className="permission-section">
                  <h4>المخزن</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.inventory.view} onChange={() => handlePermissionChange('inventory', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.inventory.add} onChange={() => handlePermissionChange('inventory', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.inventory.edit} onChange={() => handlePermissionChange('inventory', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.inventory.delete} onChange={() => handlePermissionChange('inventory', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.inventory.print} onChange={() => handlePermissionChange('inventory', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* الأعضاء */}
                <div className="permission-section">
                  <h4>الأعضاء</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.members.view} onChange={() => handlePermissionChange('members', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.members.add} onChange={() => handlePermissionChange('members', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.members.edit} onChange={() => handlePermissionChange('members', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.members.delete} onChange={() => handlePermissionChange('members', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.members.print} onChange={() => handlePermissionChange('members', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* أرشيف المناسبات */}
                <div className="permission-section">
                  <h4>أرشيف المناسبات</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.occasions.view} onChange={() => handlePermissionChange('occasions', 'view')} /> عرض</label>
                    <label><input type="checkbox" checked={permissions.occasions.add} onChange={() => handlePermissionChange('occasions', 'add')} /> إضافة</label>
                    <label><input type="checkbox" checked={permissions.occasions.edit} onChange={() => handlePermissionChange('occasions', 'edit')} /> تعديل</label>
                    <label><input type="checkbox" checked={permissions.occasions.delete} onChange={() => handlePermissionChange('occasions', 'delete')} /> حذف</label>
                    <label><input type="checkbox" checked={permissions.occasions.print} onChange={() => handlePermissionChange('occasions', 'print')} /> طباعة</label>
                  </div>
                </div>

                {/* التقارير */}
                <div className="permission-section">
                  <h4>التقارير</h4>
                  <div className="permission-actions">
                    <label><input type="checkbox" checked={permissions.reports.view} onChange={() => handlePermissionChange('reports', 'view')} /> عرض</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setPermissionsModal(false)}>إلغاء</button>
              <button type="button" className="btn-save" onClick={handleSavePermissions}>
                <IoCheckmarkOutline /> حفظ الصلاحيات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;