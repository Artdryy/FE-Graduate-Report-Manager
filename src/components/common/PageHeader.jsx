import React from 'react';

const PageHeader = ({ title, onAdd, buttonText = 'Agregar' }) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <button onClick={onAdd} className="btn btn-primary">
        <i className="fas fa-plus"></i> {buttonText}
      </button>
    </div>
  );
};

export default PageHeader;