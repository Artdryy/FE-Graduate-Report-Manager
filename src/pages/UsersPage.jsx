import React, { useState, useEffect, useMemo } from 'react';
import { usersService } from '../services/usersService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import UserForm from '../components/users/UserForm';
import Switch from '../components/common/Switch';
import { useAuth } from '../context/AuthContext';

  const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { permissions } = useAuth();

  const can = useMemo(() => permissions['Users']?.permissions || {}, [permissions]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = () => {
    setCurrentUser({ user_name: '', email: '', password: '', role_id: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario "${user.user_name}"?`)) {
      try {
        await usersService.deleteUser(user.id);
        fetchUsers(); 
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (currentUser.id) {
        const userDataForUpdate = {
          user_id: currentUser.id,
          user_name: currentUser.user_name,
          email: currentUser.email,
          role_id: currentUser.role_id,
          is_active: currentUser.is_active
        };
        await usersService.updateUser(userDataForUpdate);

      } else {
        await usersService.createUser(currentUser);
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleSearch = (query) => {
    console.log("Searching for user:", query);
  };

const handleToggleActive = async (user) => {
    const newStatus = user.is_active === 1 ? 0 : 1;
    const userDataForUpdate = {
      user_id: user.id,
      user_name: user.user_name,
      email: user.email,
      role_id: user.role_id,
      is_active: newStatus
    };

    try {
      await usersService.updateUser(userDataForUpdate);
      setUsers(currentUsers =>
        currentUsers.map(u => (u.id === user.id ? { ...u, is_active: newStatus } : u))
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Usuario' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'role_name', label: 'Rol' },
    { key: 'status', label: 'Estado' },
  ];

const renderUserActions = (user) => (
    <div className="actions-cell">
      <button 
        onClick={() => can.UPDATE && handleEdit(user)} 
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
      <button 
        onClick={() => can.DELETE && handleDelete(user)} 
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
      <Switch
        id={`user-active-${user.id}`}
        checked={user.is_active === 1}
        onChange={() => handleToggleActive(user)}
        title={can.UPDATE ? (user.is_active === 1 ? 'Desactivar usuario' : 'Activar usuario') : "Permisos insuficientes"}
        disabled={!can.UPDATE}
      />
    </div>
  );

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Usuarios" onAdd={handleAdd} showAddButton={can.CREATE === 1} />
      <SearchBar placeholder="Buscar por usuario o correo..." onSearch={() => {}} />
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        renderActions={renderUserActions}
        renderCell={(item, column) => {
          if (column.key === 'status') {
            return item.is_active === 1 ? <span className="status-active">Activo</span> : <span className="status-inactive">Inactivo</span>;
          }
        }}
      />
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          title={currentUser && currentUser.id ? "Editar Usuario" : "Agregar Usuario"}
        >
          <UserForm user={currentUser} setUser={setCurrentUser} />
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;