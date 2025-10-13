import React, { useState, useEffect } from 'react';
import { rolesService } from '../../services/rolesService';
import Switch from '../common/Switch'; // Import the Switch component

const UserForm = ({ user, setUser }) => {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const isNewUser = !user.id;


  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true); 
      try {
        const data = await rolesService.getRoles();
        setRoles(data || []);
      } catch (err) {
        console.error("Failed to load roles:", err);
        setRoles([]);
      } finally {
        setLoadingRoles(false); 
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

   return (
    <>
      <div className="input-group">
        <label htmlFor="user_name">Nombre de Usuario</label>
        <input
          type="text" id="user_name" name="user_name"
          className="modal-input" value={user.user_name || ''}
          onChange={handleChange} required
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email" id="email" name="email"
          className="modal-input" value={user.email || ''}
          onChange={handleChange} required
        />
      </div>

      {isNewUser && (
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password" id="password" name="password"
            className="modal-input" onChange={handleChange}
            required={isNewUser}
          />
        </div>
      )}
      
      <div className="input-group">
        <label htmlFor="role_id">Rol</label>
        <select
          id="role_id" name="role_id" className="modal-input"
          value={user.role_id || ''} onChange={handleChange} required
          disabled={loadingRoles} 
        >
          {}
          {loadingRoles ? (
            <option>Cargando roles...</option>
          ) : (
            <>
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.role_name}
                </option>
              ))}
            </>
          )}
        </select>
      </div>
    </>
  );
};

export default UserForm;