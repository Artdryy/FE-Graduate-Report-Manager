import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      {/* Placeholder for future search bar */}
      <div className="search-container">
          {/* We can build the search component here later */}
      </div>
      <div className="topbar-right">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
