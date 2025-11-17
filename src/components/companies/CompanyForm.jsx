import React from 'react';

const CompanyForm = ({ company, setCompany }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div className="input-group">
        <label htmlFor="company_name">Nombre de la Empresa</label>
        <input
          type="text"
          id="company_name"
          name="company_name"
          className="modal-input"
          value={company.company_name || ''}
          onChange={handleChange}
          required
        />
      </div>

      {}
      <div className="input-group">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          name="description"
          className="modal-input"
          value={company.description || ''}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div className="input-group">
        <label htmlFor="address">Dirección</label>
        <input
          type="text"
          id="address"
          name="address"
          className="modal-input"
          value={company.address || ''}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label htmlFor="phone_number">Teléfono</label>
        <input
          type="tel"
          id="phone_number"
          name="phone_number"
          className="modal-input"
          value={company.phone_number || ''}
          onChange={handleChange}
        />
      </div>

      <div className="input-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          className="modal-input"
          value={company.email || ''}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default CompanyForm;