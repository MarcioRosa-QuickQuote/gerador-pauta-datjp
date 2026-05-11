'use client';

import { useState } from 'react';

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

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

  const btnBase: React.CSSProperties = {
    backgroundColor: '#00274d',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 'clamp(0.85rem, 2.2vw, 0.95rem)',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '0.65rem 1rem',
    position: 'relative' as const,
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="block mx-auto my-3 px-6 py-3 rounded-md cursor-pointer text-[clamp(0.875rem,2.5vw,1rem)] w-full max-w-[16rem] z-[1] text-white"
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
          className="mx-auto my-2 p-3 bg-[#f9f9f9] border border-[#ccc] rounded-lg w-full max-w-[17rem] z-[1] flex flex-col gap-2"
        >
          {/* Portarias Inseridas */}
          <div className="flex items-center gap-2">
            <button
              onClick={onApagarPortarias}
              style={btnBase}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
            >
              Portarias Inseridas
              <span style={{ marginLeft: 'auto', display: 'flex' }}>
                <TrashIcon />
              </span>
            </button>
            <a
              href={portariasFolderId ? `https://drive.google.com/drive/folders/${portariasFolderId}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img src="https://img.icons8.com/color/48/000000/folder-invoices.png" alt="Folder" className="w-5 h-5" />
            </a>
          </div>

          {/* Pauta do Dia */}
          <div className="flex items-center gap-2">
            <button
              onClick={onApagarPautas}
              style={btnBase}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
            >
              Pauta do Dia
              <span style={{ marginLeft: 'auto', display: 'flex' }}>
                <TrashIcon />
              </span>
            </button>
            <a
              href={pautasFolderId ? `https://drive.google.com/drive/folders/${pautasFolderId}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <img src="https://img.icons8.com/color/48/000000/folder-invoices.png" alt="Folder" className="w-5 h-5" />
            </a>
          </div>

          {/* Apagar Tudo */}
          <div className="flex items-center gap-2">
            <button
              onClick={onApagarTudo}
              style={btnBase}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
            >
              Apagar Tudo
              <span style={{ marginLeft: 'auto', display: 'flex' }}>
                <TrashIcon />
              </span>
            </button>
            <span className="w-5 shrink-0" />
          </div>
        </div>
      )}
    </>
  );
}
