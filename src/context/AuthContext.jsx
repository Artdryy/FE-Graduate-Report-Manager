import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import { permissionsService } from '../services/permissionsService';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({}); 
  const [loading, setLoading] = useState(true);

  const groupPermissions = (flatPermissions) => {
    if (!flatPermissions || !Array.isArray(flatPermissions)) return {};
    return flatPermissions.reduce((acc, p) => {
      if (!acc[p.module_name]) {
        acc[p.module_name] = {
          module_id: p.module_id,
          is_visible: p.is_visible, 
          permissions: {},        
        };
      }
      
      const permissionKey = p.permission.split('_').pop(); 
      
      acc[p.module_name].permissions[permissionKey] = p.is_granted;
      
      return acc;
    }, {});
  };

const fetchAndSetPermissions = async () => { 
    try {
      const flatPermissions = await permissionsService.getMyPermissions();
      const grouped = groupPermissions(flatPermissions);
      setPermissions(grouped);
    } catch (error) {
      console.error("Failed to fetch permissions", error);
      setPermissions({}); 
    }
  };

  const initializeAuth = async (token) => {
    try {
      const decodedToken = jwtDecode(token);
      setUser({
        id: decodedToken.userId,
        roleId: decodedToken.roleId,
      });
      await fetchAndSetPermissions(); 
    } catch (error) {
      console.error("Failed to initialize auth from token", error);
      logout(); 
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      initializeAuth(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    await initializeAuth(data.data.accessToken);
    return data;
  };

  const logout = () => {
    authService.logout(); 
    setUser(null);
    setPermissions({});
  };

  const value = useMemo(() => ({
    user,
    permissions,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  }), [user, permissions, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};