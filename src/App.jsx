import React from 'react';
import AppRouter from './routes/AppRouter';
import { PermissionsProvider } from './context/PermissionsContext';
import './assets/styles/main.css';

function App() {
  return (
    <div className="App">
      {}
      <PermissionsProvider>
        <AppRouter />
      </PermissionsProvider>
    </div>
  );
}

export default App;