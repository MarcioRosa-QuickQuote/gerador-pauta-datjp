'use client';

import { useState, useRef, type DragEvent } from 'react';

interface UploadAreaProps {
  onUpload: (files: FileList) => void;
  uploadProgress: string;
}

export default function UploadArea({ onUpload, uploadProgress }: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  }

  function triggerFileInput(e: React.MouseEvent) {
    e.stopPropagation();
    fileInputRef.current?.click();
  }

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mx-auto my-4 px-4 py-3 border-2 border-dashed rounded w-[90%] max-w-xs text-center cursor-pointer relative z-[1] ${
          isDragOver ? 'bg-[#d0d0d0] border-[#666]' : 'bg-[#f5f5f5] border-[#ccc]'
        }`}
        style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="upload"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept=".doc,.docx"
        />
        <p
          className="my-1 text-sm"
          style={{ color: '#666' }}
        >
          Upload de arquivo
        </p>
        <p className="text-2xl my-2" style={{ color: '#888' }}>
          ↑
        </p>
        <p
          className="my-1 text-sm"
          style={{ color: '#666' }}
        >
          Arraste e solte um arquivo aqui
        </p>
        <button
          onClick={triggerFileInput}
          className="mt-2 px-3 py-1.5 text-sm bg-white border border-[#ccc] rounded cursor-pointer"
          style={{ color: '#333' }}
        >
          Escolher arquivo
        </button>
      </div>
      {uploadProgress && (
        <div
          id="uploadProgress"
          className="mx-auto my-4 font-bold text-[clamp(0.875rem,2.5vw,1rem)] z-[1]"
        >
          {uploadProgress}
        </div>
      )}
    </>
  );
}
