import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-4">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}