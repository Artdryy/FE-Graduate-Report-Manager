import React, { useState, useEffect } from 'react';
import { usersService } from '../services/usersService';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import UserForm from '../components/users/UserForm';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // We only need one API call now!
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
        fetchUsers(); // Refresh the data
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
        // Exclude role_name from the update payload, as the backend doesn't need it
        const { id, role_name, ...updateData } = currentUser;
        await usersService.updateUser(id, updateData);
      } else {
        await usersService.createUser(currentUser);
      }
      handleCloseModal();
      fetchUsers(); // Refresh the data
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleSearch = (query) => {
    console.log("Searching for user:", query);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Usuario' },
    { key: 'email', label: 'Correo Electrónico' },
    { key: 'role_name', label: 'Rol' },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Gestión de Usuarios" onAdd={handleAdd} />
      <SearchBar onSearch={handleSearch} placeholder="Buscar por usuario o correo..." />
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
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