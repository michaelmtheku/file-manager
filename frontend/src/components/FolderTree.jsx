import React, { useState } from 'react';
import useFiles from '../hooks/useFiles.js';
import api from '../services/api.js';

export default function FolderTree() {
  const { folders, currentFolder, setCurrentFolder, refresh } = useFiles();
  const [name, setName] = useState('');

  async function createFolder(e) {
    e.preventDefault();
    if (!name) return;
    await api.post('/folders', { name, parentFolder: currentFolder });
    setName('');
    refresh();
  }

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Folders</h2>
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-2 py-1 rounded ${currentFolder === null ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setCurrentFolder(null)}
        >Root</button>
        {folders.map(f => (
          <button
            key={f.id}
            onClick={() => setCurrentFolder(f.id)}
            className={`px-2 py-1 rounded ${currentFolder === f.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >{f.name}</button>
        ))}
      </div>
      <form onSubmit={createFolder} className="flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="New Folder"
          className="border rounded p-2 flex-1"
        />
        <button className="bg-green-600 text-white px-3 py-1 rounded" disabled={!name}>Create</button>
      </form>
    </div>
  );
}