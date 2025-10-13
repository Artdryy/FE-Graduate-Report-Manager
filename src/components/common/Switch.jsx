import React from 'react';

const Switch = ({ label, checked, onChange, id }) => {
  return (
    <div className="switch-container">
      {}
      {label && <label htmlFor={id} className="switch-label">{label}</label>}
      <input
        type="checkbox"
        id={id} 
        className="switch-checkbox"
        checked={checked}
        onChange={onChange}
      />
      {}
      <label htmlFor={id} className="switch-lever"></label>
    </div>
  );
};

export default Switch;