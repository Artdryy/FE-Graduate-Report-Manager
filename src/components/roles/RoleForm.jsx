import React from 'react';

const RoleForm = ({ role, setRole }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRole((prevRole) => ({
      ...prevRole,
      [name]: value,
    }));
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="role_name">Nombre del Rol</label>
        <input
          type="text"
          id="role_name"
          name="role_name"
          className="modal-input"
          value={role.role_name || ''}
          onChange={handleChange}
          required
        />
      </div>
      <div className="input-group">
        <label htmlFor="description">Descripción</label>
        <input
          type="text"
          id="description"
          name="description"
          className="modal-input"
          value={role.description || ''}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );
};

export default RoleForm;