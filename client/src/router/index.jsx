import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminDashboard from '../screens/adminDashboard';
import AvatarDemo from '../components/ui/avatar';

const ProtectedAdminRoute = ({ children }) => {
  const savedUser = localStorage.getItem('zara_user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AvatarDemo />} />

        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;