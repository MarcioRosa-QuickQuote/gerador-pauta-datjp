'use client';

import { useState } from 'react';

interface DeleteSectionProps {
  onApagarPortarias: () => void;
  onApagarPautas: () => void;
  onApagarTudo: () => void;
  portariasFolderId?: string;
  pautasFolderId?: string;
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#F9A825" stroke="#F9A825" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface CardProps {
  title: string;
  subtitle: string;
  dangerous?: boolean;
  onView?: () => void;
  onDelete: () => void;
  showView?: boolean;
}

function Card({ title, subtitle, dangerous, onView, onDelete, showView }: CardProps) {
  const glow = dangerous
    ? '0 0 20px rgba(229,57,53,0.25), 0 0 3px rgba(229,57,53,0.15)'
    : '0 2px 8px rgba(0,0,0,0.3)';
  const borderColor = dangerous ? 'rgba(229,57,53,0.35)' : 'rgba(255,255,255,0.08)';

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all duration-200"
      style={{
        backgroundColor: dangerous ? 'rgba(229,57,53,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${borderColor}`,
        boxShadow: glow,
      }}
    >
      <div className="shrink-0">
        <FolderIcon />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[15px] leading-tight">{title}</p>
        <p className="text-xs mt-0.5" style={{ color: '#9e9e9e' }}>{subtitle}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        {showView && onView && (
          <button
            onClick={onView}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ backgroundColor: '#1565C0', color: 'white', border: 'none' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1976D2')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1565C0')}
          >
            <EyeIcon />
            Ver
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{ backgroundColor: dangerous ? '#c62828' : 'rgba(229,57,53,0.9)', color: 'white', border: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = dangerous ? '#d32f2f' : '#e53935')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = dangerous ? '#c62828' : 'rgba(229,57,53,0.9)')}
        >
          <TrashIcon />
          {dangerous ? 'Excluir Tudo' : 'Excluir'}
        </button>
      </div>
    </div>
  );
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
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] w-[92%] max-w-[420px] rounded-[22px] p-6"
            style={{
              backgroundColor: '#1a1a2e',
              boxShadow: '0 0 40px rgba(0,39,77,0.5), 0 16px 48px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <h2 className="text-white text-xl font-bold mb-1">Área de exclusão</h2>
            <p className="text-sm mb-5" style={{ color: '#9e9e9e' }}>
              Selecione uma pasta para visualizar ou excluir seu conteúdo.
            </p>

            <div className="flex flex-col gap-3">
              <Card
                title="Portarias"
                subtitle="Inseridas na pasta"
                showView
                onView={() => {
                  if (portariasFolderId) window.open(`https://drive.google.com/drive/folders/${portariasFolderId}`, '_blank');
                }}
                onDelete={onApagarPortarias}
              />

              <Card
                title="Pauta"
                subtitle="Geradas no dia"
                showView
                onView={() => {
                  if (pautasFolderId) window.open(`https://drive.google.com/drive/folders/${pautasFolderId}`, '_blank');
                }}
                onDelete={onApagarPautas}
              />

              <Card
                title="Apagar Tudo"
                subtitle="Portarias e Pauta"
                dangerous
                onDelete={onApagarTudo}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
