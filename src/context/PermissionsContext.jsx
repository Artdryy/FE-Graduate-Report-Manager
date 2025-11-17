import React, { createContext, useContext, useMemo } from 'react';

const PermissionsContext = createContext();

export const usePermissions = () => useContext(PermissionsContext);

const permissionMap = {
  1: 'CREATE',
  2: 'UPDATE',
  3: 'DELETE',
  4: 'READ',
};

export const PermissionsProvider = ({ children }) => {
  const permissions = useMemo(() => {
    const storedPermissions = localStorage.getItem('userPermissions');
    return storedPermissions ? JSON.parse(storedPermissions) : [];
  }, []);

  const hasPermission = (moduleName, permissionName) => {
    if (!permissions || permissions.length === 0) return false;

    const mod = moduleName.toLowerCase();
    const perm = permissionName.toLowerCase();

    return permissions.some((p) => {
      const module = p.module_name?.toLowerCase();
      const action = permissionMap[p.permission_id]?.toLowerCase(); 
      const granted =
        p.is_granted === 1 || p.is_granted === true || p.is_granted === '1' || p.is_granted === undefined;

      return module === mod && action === perm && granted;
    });
  };

  const isModuleVisible = (moduleName) => {
    if (!permissions || permissions.length === 0) return false;

    const mod = moduleName.toLowerCase();

    const modulePermission = permissions.find((p) => p.module_name?.toLowerCase() === mod);
    return modulePermission
      ? modulePermission.is_visible === 1 ||
        modulePermission.is_visible === true ||
        modulePermission.is_visible === '1' ||
        modulePermission.is_visible === undefined
      : false;
  };

  const value = {
    permissions,
    hasPermission,
    isModuleVisible,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
