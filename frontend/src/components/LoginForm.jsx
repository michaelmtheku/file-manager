import React, { useState } from 'react';
import api from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm w-full">
      <h1 className="text-xl font-semibold">{mode === 'login' ? 'Login' : 'Register'}</h1>
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <input
        type="email"
        className="border rounded w-full p-2"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="border rounded w-full p-2"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={!email || !password}
      >Submit</button>
      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        className="text-sm text-blue-600"
      >
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
    </form>
  );
}