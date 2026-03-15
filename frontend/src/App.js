import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Associations from './pages/Associations';
import Tasweeb from './pages/Tasweeb';
import Purchases from './pages/Purchases';
import NewPurchase from './pages/NewPurchase';
import PurchaseDetails from './pages/PurchaseDetails';
import Sales from './pages/Sales';
import NewSale from './pages/NewSale';
import SaleDetails from './pages/SaleDetails';
import Damages from './pages/Damages';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SplashScreen from './components/SplashScreen';

// صفحات المخزن
import Inventory from './pages/Inventory';
import InventoryGeneral from './pages/InventoryGeneral';
import InventoryMedia from './pages/InventoryMedia';
import InventoryAudio from './pages/InventoryAudio';
import InventoryDamages from './pages/InventoryDamages';
import InventoryItems from './pages/InventoryItems';

// صفحات أرشيف المناسبات
import Occasions from './pages/Occasions';
import NewOccasionEvent from './pages/NewOccasionEvent';

// صفحات التعديل
import EditSale from './pages/EditSale';
import EditPurchase from './pages/EditPurchase';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && (
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="members" element={<Members />} />
                <Route path="associations" element={<Associations />} />
                <Route path="tasweeb" element={<Tasweeb />} />
                <Route path="purchases" element={<Purchases />} />
                <Route path="purchases/new" element={<NewPurchase />} />
                <Route path="purchases/:id" element={<PurchaseDetails />} />
                <Route path="purchases/edit/:id" element={<EditPurchase />} />
                <Route path="sales" element={<Sales />} />
                <Route path="sales/new" element={<NewSale />} />
                <Route path="sales/:id" element={<SaleDetails />} />
                <Route path="sales/edit/:id" element={<EditSale />} />
                <Route path="damages" element={<Damages />} />
                <Route path="users" element={<Users />} />
                <Route path="reports" element={<Reports />} />
                <Route path="inventory" element={<Inventory />}>
                  <Route index element={<Navigate to="general" />} />
                  <Route path="general" element={<InventoryGeneral />} />
                  <Route path="media" element={<InventoryMedia />} />
                  <Route path="audio" element={<InventoryAudio />} />
                  <Route path="damages" element={<InventoryDamages />} />
                  <Route path="items" element={<InventoryItems />} />
                </Route>
                <Route path="occasions" element={<Occasions />} />
                <Route path="occasions/new" element={<NewOccasionEvent />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
      )}
    </>
  );
}

export default App;