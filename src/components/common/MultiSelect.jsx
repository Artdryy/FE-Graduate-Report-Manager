import React, { useState, useRef, useEffect } from 'react';
import '../../assets/styles/multiselect.css';

const MultiSelect = ({ options, selected, onChange, placeholder = "Seleccione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (option) => {
    if (selected.some(s => s.id === option.id)) {
      onChange(selected.filter(s => s.id !== option.id));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleRemove = (e, option) => {
    e.stopPropagation();
    onChange(selected.filter(s => s.id !== option.id));
  };

  return (
    <div className="multiselect-container" ref={wrapperRef}>
      <div className="multiselect-input" onClick={() => setIsOpen(!isOpen)}>
        {selected.length > 0 ? (
          selected.map(s => (
            <span key={s.id} className="multiselect-pill">
              {s.name}
              <button type="button" onClick={(e) => handleRemove(e, s)}>&times;</button>
            </span>
          ))
        ) : (
          <span className="multiselect-placeholder">{placeholder}</span>
        )}
      </div>
      {isOpen && (
        <div className="multiselect-dropdown">
          {options.map(option => (
            <div
              key={option.id}
              className={`multiselect-option ${selected.some(s => s.id === option.id) ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;