'use client';

import type { NaoGerado } from '@/types';

interface NaoGeradosListProps {
  naoGerados: NaoGerado[];
  visible: boolean;
  onToggle: () => void;
}

export default function NaoGeradosList({ naoGerados, visible, onToggle }: NaoGeradosListProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="block mx-auto my-3 px-6 py-3 rounded-md cursor-pointer text-[clamp(0.875rem,2.5vw,1rem)] w-full max-w-[15rem] z-[1] text-white"
        style={{
          backgroundColor: '#00274d',
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.40)',
          border: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
      >
        Não Gerados
      </button>

      {visible && (
        <div
          className="mx-auto my-4 p-4 border border-[#ccc] bg-[#f9f9f9] w-[90%] max-w-[80%] text-left max-h-72 overflow-y-auto z-[1]"
        >
          {naoGerados.length === 0 ? (
            <p>Nenhum arquivo ficou de fora.</p>
          ) : (
            <>
              <p
                className="font-bold text-base"
                style={{ color: '#333' }}
              >
                PORTARIAS NÃO GERADAS NA PAUTA:
              </p>
              <ul className="list-none p-0 font-sans text-sm" style={{ color: '#666' }}>
                {naoGerados.map((item, i) => (
                  <li key={i} className="py-1 flex items-center">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-2"
                      style={{ backgroundColor: '#888' }}
                    />
                    {item.nome} - {item.motivo}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}
