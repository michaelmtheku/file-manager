import React from 'react';
import useFiles from '../hooks/useFiles.js';
import { formatBytes } from '../utils/formatBytes.js';
import { fileIcon } from '../utils/fileIcons.js';
import RenameDialog from './RenameDialog.jsx';
import DeleteConfirmDialog from './DeleteConfirmDialog.jsx';
import MoveDialog from './MoveDialog.jsx';
import api from '../services/api.js';

export default function FileList() {
  const { files, refresh } = useFiles();
  const [renameId, setRenameId] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  const [moveId, setMoveId] = React.useState(null);
  const [preview, setPreview] = React.useState(null); // file object

  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-lg">Files</h2>
      {!files.length && <div className="text-sm text-gray-500">No files here.</div>}
      <ul className="divide-y divide-gray-200 bg-white shadow rounded">
        {files.map(f => (
          <li key={f.id} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <span>{fileIcon(f.mimeType)}</span>
              <button
                onClick={() => setPreview(f)}
                className="text-blue-600 hover:underline"
              >
                {f.originalName}
              </button>
              <span className="text-xs text-gray-500">{formatBytes(f.size)}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="text-xs px-2 py-1 bg-yellow-100 rounded"
                onClick={() => setRenameId(f.id)}
              >Rename</button>
              <button
                className="text-xs px-2 py-1 bg-purple-100 rounded"
                onClick={() => setMoveId(f.id)}
              >Move</button>
              <button
                className="text-xs px-2 py-1 bg-red-100 rounded"
                onClick={() => setDeleteId(f.id)}
              >Delete</button>
              <a
                href={`${import.meta.env.VITE_API_BASE.replace('/api','')}/files/raw/${f.storedName}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2 py-1 bg-blue-100 rounded"
              >Raw</a>
            </div>
          </li>
        ))}
      </ul>
      {preview && <FilePreview file={preview} onClose={() => setPreview(null)} />}
      {renameId && (
        <RenameDialog
          fileId={renameId}
          onClose={() => setRenameId(null)}
          onRenamed={refresh}
        />
      )}
      {deleteId && (
        <DeleteConfirmDialog
          fileId={deleteId}
          onClose={() => setDeleteId(null)}
          onDeleted={refresh}
        />
      )}
      {moveId && (
        <MoveDialog
          fileId={moveId}
          onClose={() => setMoveId(null)}
          onMoved={refresh}
        />
      )}
    </div>
  );
}

function FilePreview({ file, onClose }) {
  const isImage = file.mimeType?.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const rawUrl = `${import.meta.env.VITE_API_BASE.replace('/api','')}/files/raw/${file.storedName}`;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded p-4 max-w-xl w-full space-y-4">
        <div className="flex justify-between">
          <h3 className="font-semibold">{file.originalName}</h3>
          <button onClick={onClose}>✖</button>
        </div>
        {isImage && <img src={rawUrl} alt={file.originalName} className="max-h-96 mx-auto" />}
        {isPdf && <iframe title="pdf" src={rawUrl} className="w-full h-96" />}
        {!isImage && !isPdf && (
          <div className="text-sm text-gray-600">
            Preview not supported. Download raw file instead.
          </div>
        )}
        <a
          className="inline-block bg-blue-600 text-white px-3 py-1 rounded"
          href={rawUrl}
          target="_blank"
          rel="noreferrer"
        >Open Raw</a>
      </div>
    </div>
  );
}