'use client';

interface BotaoVerificarSGPProps {
  onCheck: () => void;
}

export default function BotaoVerificarSGP({ onCheck }: BotaoVerificarSGPProps) {
  return (
    <button
      onClick={onCheck}
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
      Verificar Pauta SGP
    </button>
  );
}
