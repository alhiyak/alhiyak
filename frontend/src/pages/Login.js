import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard'); // أو أي صفحة تريد التوجيه إليها
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>البرنامج الخيري</h1>
        <h2>تسجيل الدخول</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المستخدم</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>كلمة السر</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">دخول</button>
        </form>
      </div>
    </div>
  );
};

export default Login;