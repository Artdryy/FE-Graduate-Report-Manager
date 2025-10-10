import React from 'react';
import AppRouter from './routes/AppRouter';
import './assets/styles/main.css';

// No need to set token here anymore! The interceptor handles it.

function App() {
  return (
    <div className="App">
      <AppRouter />
    </div>
  );
}

export default App;