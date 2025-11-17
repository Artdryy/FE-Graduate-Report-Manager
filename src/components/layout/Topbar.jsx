import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Topbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const openProfile = () => {
    console.log('Profile icon clicked. Logging out.');
    handleLogout();
  };

  return (
    <header className="topbar">
      <div className="topbar-right">
        <div className="profile-btn" onClick={openProfile} title="Salir">
          <i className="fas fa-user-circle"></i>
        </div>
      </div>
    </header>
  );
};

export default Topbar;