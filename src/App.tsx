import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlanList from './pages/PlanList';
import ApprovalList from './pages/ApprovalList';
// import Monitoring from './pages/Monitoring';
import UserManagement from './pages/UserManagement';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="plans" element={<PlanList />} />
          <Route path="approvals" element={<ProtectedRoute allowedRoles={['审批人员', '管理员']}><ApprovalList /></ProtectedRoute>} />
          {/* <Route path="monitoring" element={<Monitoring />} /> */}
          <Route path="users" element={<ProtectedRoute allowedRoles={['管理员']}><UserManagement /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
