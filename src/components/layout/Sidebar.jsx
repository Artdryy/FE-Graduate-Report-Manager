import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header logo-container">
        {/* Placeholder for logos - you can add img tags here later */}
        <h3>{isExpanded ? 'Graduate Reports' : 'GR'}</h3>
      </div>
      <div className="sidebar-menu">
        <NavLink to="/reports" className="menu-item">
          <i className="fas fa-file-alt"></i>
          <span>Reportes</span>
        </NavLink>
        <NavLink to="/users" className="menu-item">
          <i className="fas fa-user-graduate"></i>
          <span>Usuarios</span>
        </NavLink>
        <NavLink to="/companies" className="menu-item">
          <i className="fas fa-building"></i>
          <span>Empresas</span>
        </NavLink>
        <NavLink to="/roles" className="menu-item">
          <i className="fas fa-user-shield"></i>
          <span>Roles</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
