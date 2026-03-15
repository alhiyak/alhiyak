import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IoHomeOutline,
  IoPeopleOutline,
  IoHandLeftOutline,
  IoPlayCircleOutline,
  IoCartOutline,
  IoStatsChartOutline,
  IoStorefrontOutline,
  IoSettingsOutline,
  IoCalendarOutline,
  IoBarChartOutline // ✅ أيقونة التقارير
} from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <div className="logo">
        <NavLink to="/dashboard" className="logo-link">
          <div className="logo-container">
            <img src="/logo.png" alt="موكب الحياك" className="logo-image" />
          </div>
        </NavLink>
      </div>
      <nav>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoHomeOutline /> الرئيسية
        </NavLink>
        <NavLink to="/members" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoPeopleOutline /> الأعضاء
        </NavLink>
        <NavLink to="/associations" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoHandLeftOutline /> الجمعية
        </NavLink>
        <NavLink to="/tasweeb" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoPlayCircleOutline /> التثويبات
        </NavLink>
        <NavLink to="/sales" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoStatsChartOutline /> المبيعات
        </NavLink>
        <NavLink to="/purchases" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoCartOutline /> المشتريات
        </NavLink>
        <NavLink to="/inventory/general" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoStorefrontOutline /> المخزن
        </NavLink>
        <NavLink to="/occasions" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoCalendarOutline /> أرشيف المناسبات
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => isActive ? 'active' : ''}>
          <IoBarChartOutline /> التقارير
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
            <IoSettingsOutline /> الإدارة
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;