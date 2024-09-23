import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Alert, AlertDescription } from "../components/ui/alert"
import { UserPlus } from "lucide-react"

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/register', { username, password });
      alert('Registrazione avvenuta con successo');
      navigate('/login');
    } catch (error) {
      console.error('Errore durante la registrazione:', error.response ? error.response.data : error.message);
      setErrorMessage('Errore durante la registrazione. Riprova.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crea un account</CardTitle>
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
              <UserPlus className="mr-2 h-4 w-4" /> Registrati
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Hai già un account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Accedi qui
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}