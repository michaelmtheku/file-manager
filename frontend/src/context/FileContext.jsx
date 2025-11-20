import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext.jsx';
import api from '../services/api.js';

export const FileContext = createContext(null);

export function FileProvider({ children }) {
  const { token } = useContext(AuthContext);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    try {
      const [fileRes, folderRes] = await Promise.all([
        api.get('/files', { params: { folder: currentFolder } }),
        api.get('/folders', { params: { parent: currentFolder } })
      ]);
      setFiles(fileRes.data.files);
      setFolders(folderRes.data.folders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [currentFolder, token]);

  return (
    <FileContext.Provider value={{
      currentFolder,
      setCurrentFolder,
      files,
      folders,
      loading,
      refresh
    }}>
      {children}
    </FileContext.Provider>
  );
}