import { useContext } from 'react';
import { FileContext } from '../context/FileContext.jsx';

export default function useFiles() {
  return useContext(FileContext);
}