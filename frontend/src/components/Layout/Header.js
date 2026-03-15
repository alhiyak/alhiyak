import React from 'react';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment-hijri';
import './Layout.css';

const Header = () => {
  const { user, logout } = useAuth();

  // التاريخ الميلادي
  const gregorianDate = new Date();
  const formattedGregorian = gregorianDate.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // التاريخ الهجري - فقط الشهر والسنة
  const hijriMonth = moment(gregorianDate).format('iMMMM'); // اسم الشهر الهجري
  const hijriYear = moment(gregorianDate).format('iYYYY'); // السنة الهجرية
  const formattedHijri = `${hijriMonth} ${hijriYear}هـ`;

  return (
    <div className="header">
      <div className="date-container">
        <div className="gregorian-date">{formattedGregorian}</div>
        <div className="hijri-date">{formattedHijri}</div>
      </div>
      <div className="user-menu">
        <span className="user-name">مرحباً، {user?.full_name || user?.username}</span>
        <button onClick={logout} className="logout-btn">
          تسجيل خروج
        </button>
      </div>
    </div>
  );
};

export default Header;