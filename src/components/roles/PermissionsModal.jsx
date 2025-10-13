import React, { useState, useEffect, useMemo } from 'react';
import { permissionsService } from '../../services/permissionsService';
import { translate } from '../../utils/translations';
import Modal from '../common/Modal';
import Switch from '../common/Switch';
import '../../assets/styles/permissions.css';

const PermissionsModal = ({ role, onClose, onSaveSuccess }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!role) return;
    const fetchPermissions = async () => {
      setLoading(true);
      setError('');
      try {
        const flatPermissions = await permissionsService.getPermissionsForRole(role.id);
        setPermissions(flatPermissions || []);
      } catch (err) {
        setError('No se pudieron cargar los permisos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [role]);

  const groupedPermissions = useMemo(() => {
    if (!permissions || !Array.isArray(permissions)) return {};
    return permissions.reduce((acc, p) => {
      if (!acc[p.module_name]) {
        acc[p.module_name] = {
          module_id: p.module_id,
          is_visible: p.is_visible,
          permissions: [],
        };
      }
      acc[p.module_name].permissions.push(p);
      return acc;
    }, {});
  }, [permissions]);

  const handlePermissionChange = (moduleId, permissionId, isChecked) => {
    setPermissions(currentPermissions =>
      currentPermissions.map(p =>
        p.permission_id === permissionId && p.module_id === moduleId
          ? { ...p, is_granted: isChecked ? 1 : 0 }
          : p
      )
    );
  };

  const handleVisibilityChange = (moduleName, isChecked) => {
    setPermissions(currentPermissions =>
      currentPermissions.map(p =>
        p.module_name === moduleName ? { ...p, is_visible: isChecked ? 1 : 0 } : p
      )
    );
  };

  const handleSave = async () => {
    const payload = {
      role_id: role.id,
      permissions: Object.values(groupedPermissions).map(moduleData => ({
        module_id: moduleData.module_id,
        is_visible: moduleData.is_visible,
        permissions: moduleData.permissions
          .filter(p => p.is_granted === 1)
          .map(p => p.permission_id),
      })),
    };

    try {
      await permissionsService.assignPermissionsToRole(payload);
      onSaveSuccess();
    } catch (err) {
      setError('Error al guardar los permisos. Intente de nuevo.');
    }
  };

  return (
    <Modal
      isOpen={!!role}
      onClose={onClose}
      onSubmit={handleSave}
      title={`${translate('Permisos para')}: ${role?.role_name}`}
      className="permissions-modal-wrapper"
    >
      {loading && <p>Cargando...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <div className="permissions-grid">
          {Object.entries(groupedPermissions).map(([moduleName, moduleData]) => (
            <div key={moduleName} className="permission-module">
              <div className="permission-module-header">
                <h4>{translate(moduleName)}</h4>
                <Switch
                  id={`vis-${moduleData.module_id}`}
                  label="Visible"
                  checked={moduleData.is_visible === 1}
                  onChange={(e) => handleVisibilityChange(moduleName, e.target.checked)}
                />
              </div>
              <div className="permission-items">
                {moduleData.permissions.map(p => (
                  <div key={`${moduleData.module_id}-${p.permission_id}`} className="permission-item">
                    <span>{translate(p.permission.split('_').pop())}</span>
                    <Switch
                      id={`perm-${moduleData.module_id}-${p.permission_id}`}
                      checked={p.is_granted === 1}
                      onChange={(e) => handlePermissionChange(moduleData.module_id, p.permission_id, e.target.checked)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default PermissionsModal;