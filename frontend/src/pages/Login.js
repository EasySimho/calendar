import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';
import { Button } from "../components//ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { LogIn } from "lucide-react"

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      
      console.log('Response data:', response.data);
  
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setUser({ username, token });
        navigate('/calendar');
      } else {
        setErrorMessage('Login fallito. Verifica le credenziali.');
      }
    } catch (error) {
      console.error('Errore durante il login:', error);
      setErrorMessage('Login fallito. Verifica le credenziali.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Accedi al tuo account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <Button type="submit" className="w-full hover:bg-slate-200">
              <LogIn className="mr-2 h-4 w-4" /> Accedi
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Non hai un account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Registrati qui
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}