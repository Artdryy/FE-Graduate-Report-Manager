import React, { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import RoleForm from '../components/roles/RoleForm';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  // Function to fetch and update roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles", err);
      // You can add an error state here to show a message to the user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAdd = () => {
    setCurrentRole({ role_name: '', description: '' }); // Initialize for a new role
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
        fetchRoles(); // Refresh the data
      } catch (error) {
        console.error("Failed to delete role:", error);
        // Add a user-friendly error notification here
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

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'role_name', label: 'Nombre del Rol' },
    { key: 'description', label: 'Descripción' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Roles" onAdd={handleAdd} />
      <SearchBar onSearch={handleSearch} placeholder="Buscar por nombre de rol..." />
      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
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
    </div>
  );
};

export default RolesPage;