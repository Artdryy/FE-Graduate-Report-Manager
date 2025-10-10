import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Corrected from SideBar to Sidebar
import Topbar from './Topbar';

const MainLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="content-area">
          <Outlet /> {/* Child routes will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;