import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/styles/logo.png';
import logoExpanded from '../../assets/styles/logo-expanded.png';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { permissions } = useAuth(); 

  const logoActual = isExpanded ? logoExpanded : logo;

  const moduleLinks = [
    { name: 'Reports', path: '/reports', icon: 'fa-file-alt', label: 'Informes' },
    { name: 'Users', path: '/users', icon: 'fa-user-graduate', label: 'Usuarios' },
    { name: 'Companies', path: '/companies', icon: 'fa-building', label: 'Empresas' },
    { name: 'Roles', path: '/roles', icon: 'fa-user-shield', label: 'Roles' },
  ];

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
        {}
        {moduleLinks.map((link) => (
          permissions[link.name]?.is_visible === 1 && (
            <NavLink 
              key={link.path}
              to={link.path} 
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fas ${link.icon}`}></i>
              <span>{link.label}</span>
            </NavLink>
          )
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;