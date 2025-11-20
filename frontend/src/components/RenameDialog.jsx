import React, { useState } from 'react';
import api from '../services/api.js';

export default function RenameDialog({ fileId, onClose, onRenamed }) {
  const [name, setName] = useState('');

  async function submit(e) {
    e.preventDefault();
    await api.patch(`/files/${fileId}/rename`, { newName: name });
    onRenamed();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white p-4 rounded space-y-3 w-full max-w-sm">
        <h3 className="font-semibold">Rename File</h3>
        <input
          className="border rounded w-full p-2"
            placeholder="New name"
            value={name}
            onChange={e => setName(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1">Cancel</button>
          <button disabled={!name} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        </div>
      </form>
    </div>
  );
}