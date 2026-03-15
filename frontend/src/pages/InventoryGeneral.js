import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { IoCloseOutline } from 'react-icons/io5';
import './InventoryGeneral.css';

const InventoryGeneral = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      setItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('خطأ في جلب المواد:', error);
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.code?.toLowerCase().includes(term) ||
        item.name?.toLowerCase().includes(term)
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockStatus('all');
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="inventory-general">
      <h2>جميع المواد</h2>
      
      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في المواد (كود، اسم)..."
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
      </div>

      {filteredItems.length === 0 ? (
        <p className="no-items">لا توجد مواد تطابق معايير البحث.</p>
      ) : (
        <div className="items-grid">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryGeneral;