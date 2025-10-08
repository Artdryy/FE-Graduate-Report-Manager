import React, { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';

const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getRoles();
        setRoles(data);
      } catch (err) {
        console.error("Failed to load roles");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Gestión de Roles</h1>
        {/* Add button can go here */}
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Rol</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Loading...</td></tr>
            ) : (
              roles.map(role => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.role_name}</td>
                  <td>{role.description}</td>
                  <td>
                    <button className="btn-edit">Editar</button>
                    <button className="btn-delete">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesPage;
