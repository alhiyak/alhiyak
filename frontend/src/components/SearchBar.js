import React, { useState } from 'react';
import { IoSearchOutline, IoCloseOutline } from 'react-icons/io5';
import './SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'بحث...', delay = 300 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timer, setTimer] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // تأخير البحث لمنع التنفيذ المتكرر مع كل حرف
    if (timer) clearTimeout(timer);
    const newTimer = setTimeout(() => {
      onSearch(value);
    }, delay);
    setTimer(newTimer);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <IoSearchOutline className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
        {searchTerm && (
          <button className="search-clear" onClick={handleClear}>
            <IoCloseOutline />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;