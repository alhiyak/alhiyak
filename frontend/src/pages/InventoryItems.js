import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  IoCubeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoImageOutline,
  IoCheckmarkOutline,
  IoAddOutline,
  IoWarningOutline,
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
import './InventoryItems.css';
console.log('تم تحميل InventoryItems.js');
const InventoryItems = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [damageModal, setDamageModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [damageItem, setDamageItem] = useState(null);
  const [damageQuantity, setDamageQuantity] = useState(1);
  const [damageReason, setDamageReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'audio',
    quantity: '',
    purchase_price: '',
    sale_price: '',
    min_stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const navigate = useNavigate();

  // حالة الترتيب
  const [sortConfig, setSortConfig] = useState({
    key: 'code',
    direction: 'asc'
  });

  const {
    selectedIds,
    selectedItems,
    selectionCount,
    isAllSelected,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected
  } = useSelection(items, 'id');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('خطأ في جلب المواد:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  // دالة رفع الصورة ومعالجتها عبر Remove.bg
  const uploadImageWithRemoveBg = async (file) => {
    console.log('uploadImageWithRemoveBg تم استدعاؤها بالملف:', file);
    const formData = new FormData();
    formData.append('product_image', file);

    try {
      const response = await axios.post(
        'http://localhost/البرنامج_المتكامل/backend/upload_product_image.php',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      console.log('الرد من upload_product_image.php:', response.data);
      return response.data;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      throw error;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('handleImageChange - الملف المختار:', file);
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('1. handleSubmit بدأت');
    if (!formData.name.trim()) {
      alert('اسم المادة مطلوب');
      return;
    }

    setLoading(true);
    console.log('2. بعد setLoading');
    try {
      let imagePath = null;
      console.log('3. imageFile:', imageFile);

      if (imageFile) {
        console.log('4. سأرفع الصورة');
        const uploadResult = await uploadImageWithRemoveBg(imageFile);
        console.log('5. نتيجة الرفع:', uploadResult);
        if (uploadResult.success) {
          imagePath = uploadResult.path;
        } else {
          alert('فشلت معالجة الصورة: ' + (uploadResult.error || uploadResult.message));
          setLoading(false);
          return; // نوقف الإرسال إذا فشلت الصورة
        }
      } else {
        console.log('4. لا يوجد imageFile');
      }

      const itemData = {
        name: formData.name.trim(),
        description: formData.description || '',
        category: formData.category,
        quantity: formData.quantity || 0,
        purchase_price: formData.purchase_price || 0,
        sale_price: formData.sale_price || 0,
        min_stock: formData.min_stock || 0,
        image_url: imagePath // إذا كانت null، سيتعامل معها الخادم حسب التصميم
      };
      console.log('6. بيانات المادة المرسلة:', itemData);

      await axios.post('http://localhost:5000/api/items', itemData);
      console.log('7. تم حفظ المادة بنجاح');
      
      setShowModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('خطأ في الحفظ:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      purchase_price: item.purchase_price,
      sale_price: item.sale_price,
      min_stock: item.min_stock || ''
    });
    if (item.image_url) {
      setImagePreview(`http://localhost:5000${item.image_url}`);
    }
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('اسم المادة مطلوب');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name.trim(),
        description: formData.description || '',
        category: formData.category,
        quantity: formData.quantity || 0,
        purchase_price: formData.purchase_price || 0,
        sale_price: formData.sale_price || 0,
        min_stock: formData.min_stock || 0,
      };

      // إذا كان هناك صورة جديدة، نعالجها
      if (imageFile) {
        const uploadResult = await uploadImageWithRemoveBg(imageFile);
        if (uploadResult.success) {
          itemData.image_url = uploadResult.path;
        } else {
          alert('فشلت معالجة الصورة: ' + (uploadResult.error || uploadResult.message));
          setLoading(false);
          return;
        }
      }

      await axios.put(`http://localhost:5000/api/items/${currentItem.id}`, itemData);
      
      setEditModal(false);
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('خطأ في التحديث:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المادة؟')) return;
    try {
      await axios.delete(`http://localhost:5000/api/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('خطأ في الحذف:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const handleDamageClick = (item) => {
    setDamageItem(item);
    setDamageQuantity(1);
    setDamageReason('');
    setDamageModal(true);
  };

  const handleDamageSubmit = async (e) => {
    e.preventDefault();
    if (!damageItem) return;
    if (damageQuantity < 1 || damageQuantity > damageItem.quantity) {
      alert(`الكمية يجب أن تكون بين 1 و ${damageItem.quantity}`);
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/damages', {
        date: new Date().toISOString().split('T')[0],
        notes: damageReason || 'تالف',
        items: [{ item_id: damageItem.id, quantity: damageQuantity }]
      });
      setDamageModal(false);
      fetchItems();
      alert('تم تسجيل التالف بنجاح');
    } catch (error) {
      console.error('خطأ في تسجيل التالف:', error);
      alert(error.response?.data?.message || 'حدث خطأ أثناء تسجيل التالف');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'audio',
      quantity: '',
      purchase_price: '',
      sale_price: '',
      min_stock: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const getCategoryName = (category) => {
    return category === 'audio' ? 'صوتيات' : 'إعلامية';
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <IoArrowUpOutline /> : <IoArrowDownOutline />;
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.code?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (stockStatus === 'out') {
      filtered = filtered.filter(item => parseFloat(item.quantity) === 0);
    } else if (stockStatus === 'low') {
      filtered = filtered.filter(item => parseFloat(item.quantity) <= parseFloat(item.min_stock));
    }

    return filtered;
  }, [items, searchTerm, selectedCategory, stockStatus]);

  const sortedItems = useMemo(() => {
    const sortable = [...filteredItems];
    sortable.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'quantity' || sortConfig.key === 'purchase_price' || sortConfig.key === 'sale_price') {
        aValue = parseFloat(a[sortConfig.key] || 0);
        bValue = parseFloat(b[sortConfig.key] || 0);
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredItems, sortConfig]);

  const selectedTotal = selectedItems.reduce((sum, item) => sum + parseFloat(item.purchase_price || 0), 0);

  const printColumns = [
    { key: 'code', label: 'الكود' },
    { key: 'name', label: 'الاسم' },
    { key: 'category', label: 'القسم' },
    { key: 'quantity', label: 'الكمية' },
    { key: 'purchase_price', label: 'سعر الشراء' },
    { key: 'sale_price', label: 'سعر البيع' }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockStatus('all');
  };

  const renderModal = (content) => {
    return ReactDOM.createPortal(content, document.body);
  };

  return (
    <div className="inventory-items">
      <div className="header">
        <h1><IoCubeOutline /> إدارة المواد</h1>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <IoAddOutline /> إضافة مادة جديدة
        </button>
      </div>

      {/* شريط الفلاتر */}
      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في المواد (كود، اسم، وصف)..."
        />

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
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">كل المواد</option>
          <option value="out">منتهية الكمية (0)</option>
          <option value="low">مخزون منخفض</option>
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
              <th onClick={() => requestSort('code')}>
                الكود {getSortIcon('code')}
              </th>
              <th>الصورة</th>
              <th onClick={() => requestSort('name')}>
                الاسم {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('category')}>
                القسم {getSortIcon('category')}
              </th>
              <th onClick={() => requestSort('quantity')}>
                الكمية {getSortIcon('quantity')}
              </th>
              <th onClick={() => requestSort('purchase_price')}>
                سعر الشراء {getSortIcon('purchase_price')}
              </th>
              <th onClick={() => requestSort('sale_price')}>
                سعر البيع {getSortIcon('sale_price')}
              </th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-message">
                  لا توجد مواد تطابق معايير البحث.
                </td>
              </tr>
            ) : (
              sortedItems.map(item => {
                const isOutOfStock = parseFloat(item.quantity) === 0;
                return (
                  <tr key={item.id} className={isOutOfStock ? 'out-of-stock-row' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected(item.id)}
                        onChange={() => toggleSelection(item.id)}
                      />
                    </td>
                    <td><span className="item-code">{item.code}</span></td>
                    <td>
                      {item.image_url ? (
                        <img 
                          src={`http://localhost:5000${item.image_url}`} 
                          alt={item.name}
                          className="item-thumbnail"
                        />
                      ) : (
                        <IoImageOutline className="no-image" />
                      )}
                    </td>
                    <td>{item.name}</td>
                    <td>{getCategoryName(item.category)}</td>
                    <td className={item.quantity <= item.min_stock ? 'low-stock' : ''}>
                      {parseInt(item.quantity)}
                    </td>
                    <td>{item.purchase_price} د.ب</td>
                    <td>{item.sale_price} د.ب</td>
                    <td className="actions-cell">
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(item)} title="تعديل">
                        <IoCreateOutline />
                      </button>
                      <button className="btn-icon btn-damage" onClick={() => handleDamageClick(item)} title="تسجيل تالف">
                        <IoWarningOutline />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(item.id)} title="حذف">
                        <IoTrashOutline />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PrintModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        title="قائمة المواد"
        data={selectedItems.map(item => ({
          ...item,
          category: getCategoryName(item.category),
          quantity: parseInt(item.quantity),
          purchase_price: item.purchase_price + ' د.ب',
          sale_price: item.sale_price + ' د.ب'
        }))}
        columns={printColumns}
      />

      {/* مودال إضافة مادة جديدة */}
      {showModal && renderModal(
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>إضافة مادة جديدة</h3>
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
                    placeholder="أدخل اسم المادة"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>الوصف</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="وصف المادة (اختياري)"
                    rows="2"
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>القسم <span className="required">*</span></label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      disabled={loading}
                    >
                      <option value="audio">صوتيات</option>
                      <option value="media">إعلامية</option>
                    </select>
                  </div>
                  
                  <div className="form-group half">
                    <label>الكمية</label>
                    <input 
                      type="number" 
                      value={formData.quantity} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                      placeholder="0"
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>سعر الشراء</label>
                    <input 
                      type="number" 
                      value={formData.purchase_price} 
                      onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} 
                      placeholder="0.000"
                      min="0"
                      step="0.001"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label>سعر البيع</label>
                    <input 
                      type="number" 
                      value={formData.sale_price} 
                      onChange={(e) => setFormData({...formData, sale_price: e.target.value})} 
                      placeholder="0.000"
                      min="0"
                      step="0.001"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>الحد الأدنى للتنبيه</label>
                  <input 
                    type="number" 
                    value={formData.min_stock} 
                    onChange={(e) => setFormData({...formData, min_stock: e.target.value})} 
                    placeholder="0"
                    min="0"
                    step="1"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>صورة المادة</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'حفظ المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال تعديل مادة */}
      {editModal && renderModal(
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>تعديل بيانات المادة</h3>
              <button className="modal-close" onClick={() => {
                setEditModal(false);
                resetForm();
              }}>×</button>
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
                  <label>الوصف</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    rows="2"
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>القسم</label>
                    <select 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      disabled={loading}
                    >
                      <option value="audio">صوتيات</option>
                      <option value="media">إعلامية</option>
                    </select>
                  </div>
                  
                  <div className="form-group half">
                    <label>الكمية</label>
                    <input 
                      type="number" 
                      value={parseInt(formData.quantity)} 
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group half">
                    <label>سعر الشراء</label>
                    <input 
                      type="number" 
                      value={formData.purchase_price} 
                      onChange={(e) => setFormData({...formData, purchase_price: e.target.value})} 
                      min="0"
                      step="0.001"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label>سعر البيع</label>
                    <input 
                      type="number" 
                      value={formData.sale_price} 
                      onChange={(e) => setFormData({...formData, sale_price: e.target.value})} 
                      min="0"
                      step="0.001"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>الحد الأدنى للتنبيه</label>
                  <input 
                    type="number" 
                    value={parseInt(formData.min_stock)} 
                    onChange={(e) => setFormData({...formData, min_stock: e.target.value})} 
                    min="0"
                    step="1"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>صورة المادة</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => {
                  setEditModal(false);
                  resetForm();
                }} disabled={loading}>
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

      {/* مودال تسجيل تالف */}
      {damageModal && damageItem && renderModal(
        <div className="modal-overlay">
          <div className="modal-card modal-medium">
            <div className="modal-header">
              <h3>تسجيل تالف</h3>
              <button className="modal-close" onClick={() => setDamageModal(false)}>×</button>
            </div>
            <form onSubmit={handleDamageSubmit}>
              <div className="modal-body">
                <div className="damage-item-details">
                  {damageItem.image_url ? (
                    <img 
                      src={`http://localhost:5000${damageItem.image_url}`} 
                      alt={damageItem.name}
                      className="damage-item-image"
                    />
                  ) : (
                    <IoImageOutline className="damage-item-image-placeholder" />
                  )}
                  <div className="damage-item-info">
                    <h4>{damageItem.name}</h4>
                    <p>الكود: {damageItem.code}</p>
                    <p>الكمية المتوفرة: <strong>{parseInt(damageItem.quantity)}</strong></p>
                  </div>
                </div>

                <div className="form-group">
                  <label>الكمية المراد إتلافها <span className="required">*</span></label>
                  <input
                    type="number"
                    min="1"
                    max={damageItem.quantity}
                    step="1"
                    value={damageQuantity}
                    onChange={(e) => setDamageQuantity(parseInt(e.target.value) || 1)}
                    required
                    disabled={loading}
                  />
                  <small>الحد الأقصى: {parseInt(damageItem.quantity)}</small>
                </div>

                <div className="form-group">
                  <label>سبب التلف (اختياري)</label>
                  <textarea
                    value={damageReason}
                    onChange={(e) => setDamageReason(e.target.value)}
                    placeholder="اذكر سبب التلف إن وجد"
                    rows="3"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setDamageModal(false)} disabled={loading}>
                  إلغاء
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  <IoCheckmarkOutline /> {loading ? 'جاري الحفظ...' : 'تسجيل التالف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryItems;