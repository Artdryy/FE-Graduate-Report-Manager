import React from 'react';

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  className,
  submitLabel = "Guardar",
  submitClass = "btn-primary"
}) => {
  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={`modal-overlay ${className || ''}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-buttons">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={submitClass}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;