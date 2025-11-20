import React from 'react';
import Navbar from '../components/Navbar.jsx';
import UploadForm from '../components/UploadForm.jsx';
import FolderTree from '../components/FolderTree.jsx';
import FileList from '../components/FileList.jsx';
import useFiles from '../hooks/useFiles.js';

export default function Dashboard() {
  const { loading } = useFiles();
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-4 space-y-6 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <FolderTree />
            <UploadForm />
          </div>
          <div className="md:col-span-2">
            {loading ? <div>Loading...</div> : <FileList />}
          </div>
        </div>
      </main>
    </div>
  );
}