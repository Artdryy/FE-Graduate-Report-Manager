import React from 'react';
import '../../assets/styles/switch.css';

const Switch = ({ label, checked, onChange }) => {
  return (
    <div className="switch-container">
      <label className="switch-label">{label}</label>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default Switch;