'use client';

import { useState } from 'react';

interface DeleteSectionProps {
  onApagarPortarias: () => void;
  onApagarPautas: () => void;
  onApagarTudo: () => void;
  portariasFolderId?: string;
  pautasFolderId?: string;
}

export default function DeleteSection({
  onApagarPortarias,
  onApagarPautas,
  onApagarTudo,
  portariasFolderId,
  pautasFolderId,
}: DeleteSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="block mx-auto my-3 px-6 py-3 rounded-md cursor-pointer text-[clamp(0.875rem,2.5vw,1rem)] w-full max-w-[15rem] z-[1] text-white"
        style={{
          backgroundColor: '#00274d',
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.40)',
          border: 'none',
          transition: 'all 0.3s ease-in-out',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
      >
        Apagar Arquivos
      </button>

      {open && (
        <div
          className="mx-auto my-2 p-2 bg-[#f9f9f9] border border-[#ccc] rounded w-full max-w-[15rem] z-[1]"
        >
          <div className="flex items-center justify-between my-1">
            <button
              onClick={onApagarPortarias}
              className="text-white px-2 py-1.5 rounded cursor-pointer text-[clamp(0.75rem,2vw,0.875rem)] w-[70%] flex items-center justify-center gap-1"
              style={{
                backgroundColor: '#00274d',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                border: 'none',
              }}
            >
              Portarias Inseridas
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <a
              href={portariasFolderId ? `https://drive.google.com/drive/folders/${portariasFolderId}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <img
                src="https://img.icons8.com/color/48/000000/folder-invoices.png"
                alt="Folder"
                className="w-5 h-5"
              />
            </a>
          </div>

          <div className="flex items-center justify-between my-1">
            <button
              onClick={onApagarPautas}
              className="text-white px-2 py-1.5 rounded cursor-pointer text-[clamp(0.75rem,2vw,0.875rem)] w-[70%] flex items-center justify-center gap-1"
              style={{
                backgroundColor: '#00274d',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                border: 'none',
              }}
            >
              Pauta do Dia
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            <a
              href={pautasFolderId ? `https://drive.google.com/drive/folders/${pautasFolderId}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <img
                src="https://img.icons8.com/color/48/000000/folder-invoices.png"
                alt="Folder"
                className="w-5 h-5"
              />
            </a>
          </div>

          <div className="flex items-center justify-between my-1">
            <button
              onClick={onApagarTudo}
              className="text-white px-2 py-1.5 rounded cursor-pointer text-[clamp(0.75rem,2vw,0.875rem)] w-[70%]"
              style={{
                backgroundColor: '#00274d',
                boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
                border: 'none',
              }}
            >
              Apagar Tudo
            </button>
            <span className="w-5" />
          </div>
        </div>
      )}
    </>
  );
}
