import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/styles/logo.png';
import logoExpanded from '../../assets/styles/logo-expanded.png';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const logoActual = isExpanded ? logoExpanded : logo;

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <img src={logoActual} alt="Logo" className="sidebar-logo" />
      </div>

      <div className="sidebar-menu">
        <NavLink 
          to="/reports" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-file-alt"></i>
          <span>Informes</span>
        </NavLink>
        <NavLink 
          to="/users" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-user-graduate"></i>
          <span>Usuarios</span>
        </NavLink>
        <NavLink 
          to="/companies" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-building"></i>
          <span>Empresas</span>
        </NavLink>
        <NavLink 
          to="/roles" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          <i className="fas fa-user-shield"></i>
          <span>Roles</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;