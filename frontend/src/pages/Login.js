import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Per la navigazione programmatica
import { useUser } from '../components/UserContext'; // Assumendo che tu abbia un UserContext per gestire lo stato dell'utente


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Per gestire eventuali errori
  const { setUser } = useUser(); // Per aggiornare lo stato dell'utente nel contesto globale
  const navigate = useNavigate(); // Per reindirizzare l'utente dopo il login

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      
      console.log('Response data:', response.data); // Log della risposta
  
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username); // Store the username in localStorage
        setUser({ username, token });
        navigate('/calendar');
        alert('Login avvenuto con successo');
      } else {
        setErrorMessage('Login fallito. Verifica le credenziali.');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      setErrorMessage('Login fallito. Verifica le credenziali.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Messaggio di errore */}
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
      <button type="submit">Login</button>
      <p>Non hai un account? <a href="/register">Registrati qui</a></p>
    </form>
  );
}

export default Login;