import React from 'react';
import api from '../services/api.js';
import useFiles from '../hooks/useFiles.js';

export default function MoveDialog({ fileId, onClose, onMoved }) {
  const { folders } = useFiles();
  const [target, setTarget] = React.useState('');

  async function submit(e) {
    e.preventDefault();
    await api.patch(`/files/${fileId}/move`, { targetFolder: target || null });
    onMoved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-white p-4 rounded space-y-3 max-w-sm w-full">
        <h3 className="font-semibold">Move File</h3>
        <select
          className="border rounded w-full p-2"
          value={target}
          onChange={e => setTarget(e.target.value)}
        >
          <option value="">(Root)</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button className="bg-blue-600 text-white px-3 py-1 rounded">Move</button>
        </div>
      </form>
    </div>
  );
}