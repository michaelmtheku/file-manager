import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">404 - Not Found</h1>
      <Link to="/" className="text-blue-600 underline">Go Home</Link>
    </div>
  );
}