import React, { useState, useEffect, useMemo } from 'react';
import { rolesService } from '../services/rolesService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import RoleForm from '../components/roles/RoleForm';
import PermissionsModal from '../components/roles/PermissionsModal';
import { useAuth } from '../context/AuthContext';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const { permissions } = useAuth();

  const can = useMemo(() => permissions['Roles']?.permissions || {}, [permissions]);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setCurrentRole({ role_name: '', description: '' }); 
    setIsModalOpen(true);
  };

  const handleEdit = (role) => {
    setCurrentRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = async (role) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el rol "${role.role_name}"?`)) {
      try {
        await rolesService.deleteRole(role.id);
        fetchRoles(); 
      } catch (error) {
        console.error("Failed to delete role:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentRole(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentRole.id) {
        const roleData = { ...currentRole, role_id: currentRole.id };
        delete roleData.id;
        await rolesService.updateRole(roleData);
      } else {
        await rolesService.createRole(currentRole);
      }
      handleCloseModal();
      fetchRoles(); // Refresh data
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  };
  
  const handleSearch = (query) => console.log("Searching for:", query);

  const handleOpenPermissionsModal = (role) => {
    setSelectedRoleForPermissions(role);
    setIsPermissionsModalOpen(true);
  };

  const handleClosePermissionsModal = () => {
    setSelectedRoleForPermissions(null);
    setIsPermissionsModalOpen(false);
  };

const renderRoleActions = (role) => (
    <div className="actions-cell">
      {/* PERMISSIONS BUTTON (Requires UPDATE permission) */}
      <button 
        onClick={() => can.UPDATE && handleOpenPermissionsModal(role)} 
        className="btn-permissions" 
        disabled={!can.UPDATE}
        title={can.UPDATE ? "Permisos" : "Permisos insuficientes"}
        style={!can.UPDATE ? { 
          opacity: 0.5, 
          cursor: 'not-allowed', 
          backgroundColor: '#ccc', 
          border: '1px solid #999' 
        } : {}}
      >
        <i className="fas fa-key"></i>
      </button>

      {/* EDIT BUTTON */}
      <button 
        onClick={() => can.UPDATE && handleEdit(role)} 
        className="btn-edit" 
        disabled={!can.UPDATE}
        title={can.UPDATE ? "Editar" : "Permisos insuficientes"}
        style={!can.UPDATE ? { 
          opacity: 0.5, 
          cursor: 'not-allowed', 
          backgroundColor: '#ccc', 
          border: '1px solid #999' 
        } : {}}
      >
        <i className="fas fa-pencil-alt"></i>
      </button>

      {/* DELETE BUTTON */}
      <button 
        onClick={() => can.DELETE && handleDelete(role)} 
        className="btn-delete" 
        disabled={!can.DELETE}
        title={can.DELETE ? "Eliminar" : "Permisos insuficientes"}
        style={!can.DELETE ? { 
          opacity: 0.5, 
          cursor: 'not-allowed', 
          backgroundColor: '#ccc', 
          border: '1px solid #999' 
        } : {}}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'role_name', label: 'Nombre del Rol' },
    { key: 'description', label: 'Descripción' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Roles" onAdd={handleAdd} showAddButton={can.CREATE === 1}/>
      <SearchBar onSearch={() => {}} placeholder="Buscar por nombre de rol..." />
      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        renderActions={renderRoleActions}
      />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentRole && currentRole.id ? "Editar Rol" : "Agregar Rol"}
        >
          <RoleForm role={currentRole} setRole={setCurrentRole} />
        </Modal>
      )}
      {isPermissionsModalOpen && (
        <PermissionsModal
          role={selectedRoleForPermissions}
          onClose={handleClosePermissionsModal}
          onSaveSuccess={handleClosePermissionsModal}
        />
      )}
    </div>
  );
};

export default RolesPage;