import React, { useState } from 'react';
import axios from 'axios';
import { Link, Navigate } from 'react-router-dom';
import './Login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { username, password });
      alert('Registrazione avvenuta con successo');
      setRedirect(true);
    } catch (error) {
      console.error('Errore durante la registrazione:', error.response ? error.response.data : error.message);
    }
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registrazione</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Registrati</button>

      {/* Link alla pagina di login */}
      <p>Hai già un account? <Link to="/login">Accedi qui</Link></p>
    </form>
  );
}

export default Register;