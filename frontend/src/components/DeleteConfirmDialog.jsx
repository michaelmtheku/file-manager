import React from 'react';
import api from '../services/api.js';

export default function DeleteConfirmDialog({ fileId, onClose, onDeleted }) {
  async function confirm() {
    await api.delete(`/files/${fileId}`);
    onDeleted();
    onClose();
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-4 rounded space-y-4 max-w-sm w-full">
        <h3 className="font-semibold">Delete File?</h3>
        <p className="text-sm">This action cannot be undone.</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button onClick={confirm} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}