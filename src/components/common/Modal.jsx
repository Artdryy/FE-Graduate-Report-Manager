import React from 'react';

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  className,
  error,
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
          {/* Antes, cuando el servidor rechazaba el formulario, el error solo
              se escribia en la consola: para el usuario el boton "no hacia
              nada". Las paginas pasan aqui el mensaje del servidor. */}
          {error && <p className="modal-error" role="alert">{error}</p>}
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