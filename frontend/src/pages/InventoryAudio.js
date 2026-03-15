import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import { IoCloseOutline } from 'react-icons/io5';
import './InventoryGeneral.css';

const InventoryAudio = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/items');
      const audioItems = response.data.filter(item => item.category === 'audio');
      setItems(audioItems);
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

    if (stockStatus === 'out') {
      filtered = filtered.filter(item => parseFloat(item.quantity) === 0);
    } else if (stockStatus === 'low') {
      filtered = filtered.filter(item => parseFloat(item.quantity) <= parseFloat(item.min_stock));
    }

    return filtered;
  }, [items, searchTerm, stockStatus]);

  const clearFilters = () => {
    setSearchTerm('');
    setStockStatus('all');
  };

  if (loading) {
    return <div className="loading">جاري التحميل...</div>;
  }

  return (
    <div className="inventory-general">
      <h2>المواد الصوتية</h2>
      
      <div className="filters-toolbar">
        <SearchBar 
          onSearch={setSearchTerm} 
          placeholder="بحث في المواد الصوتية..."
        />

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

      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <p className="no-items">لا توجد مواد تطابق معايير البحث.</p>
        ) : (
          filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default InventoryAudio;