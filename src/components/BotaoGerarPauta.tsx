'use client';

interface BotaoGerarPautaProps {
  onGerar: () => void;
  disabled: boolean;
}

export default function BotaoGerarPauta({ onGerar, disabled }: BotaoGerarPautaProps) {
  return (
    <button
      id="gerarPautaButton"
      onClick={onGerar}
      disabled={disabled}
      className="block mx-auto my-3 px-6 py-3 rounded-md cursor-pointer text-[clamp(0.875rem,2.5vw,1rem)] w-full max-w-[15rem] z-[1] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: '#00274d',
        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.40)',
        border: 'none',
        transition: 'all 0.3s ease-in-out',
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#001f3f')}
      onMouseLeave={(e) => !disabled && (e.currentTarget.style.backgroundColor = '#00274d')}
    >
      Gerar a Pauta
    </button>
  );
}
