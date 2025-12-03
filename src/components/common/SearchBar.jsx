import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Buscar...' }) => {

  const handleInputChange = (e) => {
    const val = e.target.value;
    onSearch(val);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={placeholder}
            onChange={handleInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;