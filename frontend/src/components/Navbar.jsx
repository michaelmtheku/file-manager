import React from 'react';
import useAuth from '../hooks/useAuth.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <div className="font-bold">File Manager</div>
      <div className="flex gap-4 items-center">
        {user && <span>{user.email}</span>}
        <button
          onClick={logout}
          className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm"
        >Logout</button>
      </div>
    </div>
  );
}