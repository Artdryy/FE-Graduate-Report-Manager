import React, { useState, useEffect } from 'react';
import { rolesService } from '../../services/rolesService';
import Switch from '../common/Switch'; // Import the Switch component

const UserForm = ({ user, setUser }) => {
  const [roles, setRoles] = useState([]);
  const isNewUser = !user.id;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await rolesService.getRoles();
        if (Array.isArray(data)) {
          setRoles(data);
        } else {
          console.error("Failed to load roles: Data is not an array", data);
          setRoles([]);
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // THE FIX IS HERE: This function now handles regular inputs and checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If it's a checkbox, use the 'checked' property and convert it to 1 or 0.
    // Otherwise, use the 'value' property.
    const val = type === 'checkbox' ? (checked ? 1 : 0) : value;

    setUser((prevUser) => ({
      ...prevUser,
      [name]: val,
    }));
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="user_name">Nombre de Usuario</label>
        <input
          type="text"
          id="user_name"
          name="user_name"
          className="modal-input"
          value={user.user_name || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          name="email"
          className="modal-input"
          value={user.email || ''}
          onChange={handleChange}
          required
        />
      </div>

      {isNewUser && (
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            className="modal-input"
            onChange={handleChange}
            required={isNewUser}
          />
        </div>
      )}
      
      <div className="input-group">
        <label htmlFor="role_id">Rol</label>
        <select
          id="role_id"
          name="role_id"
          className="modal-input"
          value={user.role_id || ''}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione un rol</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.role_name}
            </option>
          ))}
        </select>
      </div>

      {/* Show the is_active switch only when editing an existing user */}
      {!isNewUser && (
        <div className="input-group">
           <Switch
              label="Activo"
              // The 'checked' prop expects a boolean
              checked={user.is_active === 1}
              // The onChange handler will now correctly update the state
              onChange={(e) => handleChange({ target: { name: 'is_active', type: 'checkbox', checked: e.target.checked }})}
          />
        </div>
      )}
    </>
  );
};

export default UserForm;