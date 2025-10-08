import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter code and new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authService.requestPasswordReset(email);
      setMessage('Si el correo existe en nuestro sistema, se ha enviado un código de recuperación.');
      setStep(2); // Move to the next step
    } catch (err) {
      const apiError = err.response?.data?.message || 'Error sending recovery code.';
      setError(apiError);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    setMessage('');
    try {
      await authService.resetPassword(email, code, newPassword);
      setMessage('¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const apiError = err.response?.data?.message || 'Error resetting password.';
      setError(apiError);
    }
  };

  return (
    <div className="login-container">
      {/* This is the empty left side for your image */}
      <div className="login-promo"></div>

      {/* Right side with the form */}
      <div className="login-form-container">
        <div className="login-card">
          <h2>Recuperar Contraseña</h2>
          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <p>Ingresa tu correo electrónico para recibir un código de recuperación.</p>
              <div className="input-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Enviar Código
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label htmlFor="recoveryCode">Código de Recuperación</label>
                <input
                  type="text"
                  id="recoveryCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Restablecer Contraseña
              </button>
            </form>
          )}

          <Link to="/login" className="recovery-toggle">
            ¿Recordaste tu contraseña? Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;