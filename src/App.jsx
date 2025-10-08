// src/App.jsx
import React from 'react';
import AppRouter from './routes/AppRouter';
import './assets/styles/main.css'; // We'll create this file next

function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;