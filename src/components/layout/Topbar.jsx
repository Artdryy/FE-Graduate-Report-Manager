import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const Topbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  const openProfile = () => {
    console.log('Profile icon clicked. Logging out.');
    handleLogout();
  };

  return (
    <header className="topbar">
      <div className="topbar-right">
        <div className="profile-btn" onClick={openProfile} title="Perfil / Salir">
          <i className="fas fa-user-circle"></i>
        </div>
      </div>
    </header>
  );
};

export default Topbar;