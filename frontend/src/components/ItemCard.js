import React from 'react';
import { IoImageOutline } from 'react-icons/io5';
import './ItemCard.css';

const ItemCard = ({ item, onClick }) => {
  const getCategoryName = (category) => {
    return category === 'audio' ? 'صوتيات' : 'إعلامية';
  };

  const formatQuantity = (qty) => {
    return parseInt(qty) || 0;
  };

  // التحقق من انتهاء الكمية (سواء كانت نصاً أو رقماً)
  const isOutOfStock = parseFloat(item.quantity) === 0;

  return (
    <div 
      className={`item-card ${isOutOfStock ? 'out-of-stock' : ''}`} 
      onClick={() => onClick && onClick(item)}
    >
      <div className="item-card-image">
        {item.image_url ? (
          <img src={`http://localhost:5000${item.image_url}`} alt={item.name} />
        ) : (
          <IoImageOutline />
        )}
      </div>
      <div className="item-card-info">
        <h3>{item.name}</h3>
        <p className="item-code">{item.code}</p>
        <p className="item-category">{getCategoryName(item.category)}</p>
        <p className="item-quantity">الكمية: {formatQuantity(item.quantity)}</p>
      </div>
    </div>
  );
};

export default ItemCard;