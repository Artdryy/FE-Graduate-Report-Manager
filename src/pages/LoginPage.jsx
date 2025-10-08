import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginPage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // This effect should only run ONCE when the component first loads.
    // By providing an empty dependency array [], we ensure that.
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/reports'); 
    }
  }, []); // <-- THE FIX IS HERE: Use an empty dependency array

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await authService.login(userName, password);
      // The redirect after a successful action belongs here.
      navigate('/reports'); 
    } catch (err) {
      const apiError = err.response?.data?.message || 'Invalid credentials or server error.';
      setError(apiError);
    }
  };

  return (
    <div className="login-container">
      <div className="login-promo"></div>
      <div className="login-form-container">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Acceder
            </button>
          </form>

          <Link to="/forgot-password" className="recovery-toggle">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;