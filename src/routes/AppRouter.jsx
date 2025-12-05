import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ReportsPage from '../pages/ReportsPage';
import UsersPage from '../pages/UsersPage';
import CompaniesPage from '../pages/CompaniesPage';
import RolesPage from '../pages/RolesPage';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext'; 

const ModuleGuard = ({ moduleName, children }) => {
  const { permissions } = useAuth();

  if (permissions[moduleName]?.is_visible === 1) {
    return children; 
  }

  return <Navigate to="/reports" replace />;
};


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />     
        <Route element={<ProtectedRoute />}>
          <Route
            path="/reports"
            element={
              <ModuleGuard moduleName="Reports">
                <ReportsPage />
              </ModuleGuard>
            }
          />
          <Route
            path="/users"
            element={
              <ModuleGuard moduleName="Users">
                <UsersPage />
              </ModuleGuard>
            }
          />
          <Route
            path="/companies"
            element={
              <ModuleGuard moduleName="Companies">
                <CompaniesPage />
              </ModuleGuard>
            }
          />
          <Route
            path="/roles"
            element={
              <ModuleGuard moduleName="Roles">
                <RolesPage />
              </ModuleGuard>
            }
          />
          
          <Route index element={<Navigate to="/reports" replace />} />

        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;