import React from 'react';

const Switch = ({ label, checked, onChange, id, disabled }) => {
  return (
    <div className={`switch-container ${disabled ? 'disabled' : ''}`}>

      {label && <label htmlFor={id} className="switch-label">{label}</label>}

      <input
        type="checkbox"
        id={id}
        className="switch-checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />

      <label htmlFor={id} className="switch-lever"></label>
    </div>
  );
};

export default Switch;