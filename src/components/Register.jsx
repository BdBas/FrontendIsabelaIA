import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      if (value.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setPasswordError('');
      }
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Las contraseñas no coinciden.');
      } else if (formData.confirmPassword) {
        setConfirmPasswordError('');
      }
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setConfirmPasswordError('Las contraseñas no coinciden.');
      } else {
        setConfirmPasswordError('');
      }
      if (formData.password.length < 6) {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setPasswordError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setRegistrationSuccess('');

    if (formData.password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      return;
    }
    if (passwordError || confirmPasswordError) {
      return;
    }

    const { confirmPassword, ...dataToRegister } = formData;

    const result = await register(dataToRegister);
    if (result.success) {
      setError('');
      setPasswordError('');
      setConfirmPasswordError('');
      setRegistrationSuccess('Usuario registrado exitosamente. Redirigiendo a Iniciar Sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
      setRegistrationSuccess('');
    }
  };

  const isRegisterDisabled = (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    passwordError ||
    confirmPasswordError ||
    loading
  );

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Registrarse</h2>
        {error && <div className="error-message">{error}</div>}
        {registrationSuccess && <div className="success-message" style={{ backgroundColor: '#d4edda', color: '#155724', padding: '0.75rem', borderRadius: '5px', marginBottom: '1rem', textAlign: 'center', border: '1px solid #c3e6cb' }}>{registrationSuccess}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            {passwordError && <p className="error-message" style={{ marginTop: '0.5rem' }}>{passwordError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
            {confirmPasswordError && <p className="error-message" style={{ marginTop: '0.5rem' }}>{confirmPasswordError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="role">Rol</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="student">Estudiante</option>
              <option value="parent">Padre/Madre</option>
            </select>
          </div>
          <button type="submit" className="auth-button" disabled={isRegisterDisabled}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          ¿Ya tienes cuenta? <a href="/login" style={{ color: '#4a90e2', textDecoration: 'underline', cursor: 'pointer' }}>Inicia Sesión aquí</a>
        </div>
      </div>
    </div>
  );
};

export default Register; 