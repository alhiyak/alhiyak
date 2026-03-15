import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { IoStorefrontOutline } from 'react-icons/io5';
import './Inventory.css';

const Inventory = () => {
  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1><IoStorefrontOutline /> المخزن</h1>
        <nav className="inventory-nav">
          <NavLink to="general" className={({ isActive }) => isActive ? 'active' : ''}>المخزن العام</NavLink>
          <NavLink to="media" className={({ isActive }) => isActive ? 'active' : ''}>الإعلامية</NavLink>
          <NavLink to="audio" className={({ isActive }) => isActive ? 'active' : ''}>الصوتيات</NavLink>
          <NavLink to="damages" className={({ isActive }) => isActive ? 'active' : ''}>التلفيات</NavLink>
          <NavLink to="items" className={({ isActive }) => isActive ? 'active' : ''}>إدارة المواد</NavLink>
        </nav>
      </div>
      <div className="inventory-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Inventory;