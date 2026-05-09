'use client';

import { useState } from 'react';

const steps = [
  { id: 'tutorialStep1', side: 'right', top: 250, left: 'calc(50% + 110px)', text: 'Selecione ou arraste o arquivo da portaria para fazer o upload.' },
  { id: 'tutorialStep2', side: 'right', top: 450, left: 'calc(50% + 110px)', text: 'Clique no botão para gerar a Pauta.' },
  { id: 'tutorialStep3', side: 'right', top: 500, left: 'calc(50% + 110px)', text: 'Quando a SGP gerar a pauta do dia, a notificação aparecerá aqui.' },
  { id: 'tutorialStep4', side: 'right', top: 560, left: 'calc(50% + 110px)', text: 'Clique aqui para apagar os arquivos das portarias e das pautas geradas.' },
  { id: 'tutorialStep5', side: 'right', top: 600, left: 'calc(50% + 110px)', text: 'Clique aqui para apagar as portarias inseridas.' },
  { id: 'tutorialStep6', side: 'left', top: 600, left: 'calc(50% + 180px)', text: 'Clique aqui para acessar a pasta das portarias enviadas.' },
  { id: 'tutorialStep7', side: 'right', top: 640, left: 'calc(50% + 110px)', text: 'Clique aqui para apagar a pauta do dia.' },
  { id: 'tutorialStep8', side: 'left', top: 640, left: 'calc(50% + 180px)', text: 'Clique aqui para acessar a pasta das pautas geradas.' },
  { id: 'tutorialStep9', side: 'right', top: 680, left: 'calc(50% + 110px)', text: 'Clique aqui para apagar todos os arquivos.' },
  { id: 'tutorialStep10', side: 'right', top: 740, left: 'calc(50% + 110px)', text: 'Aqui serão exibidas as portarias que ainda não foram incluídas na pauta.' },
];

export default function Tutorial() {
  const [active, setActive] = useState(-1);

  function start() {
    setActive(0);
  }

  function next() {
    if (active < steps.length - 1) setActive(active + 1);
  }

  function end() {
    setActive(-1);
  }

  return (
    <>
      {/* Button */}
      <span
        onClick={start}
        className="absolute top-2.5 left-2.5 ml-2.5 text-[16px] cursor-pointer z-[1000]"
        style={{ color: '#2196F3' }}
      >
        Tutorial
      </span>

      {/* Overlay */}
      {active >= 0 && (
        <div
          className="fixed inset-0 bg-black/70 z-[1001]"
          onClick={end}
        />
      )}

      {/* Steps */}
      {steps.map((step, i) => (
        <div
          key={step.id}
          className={`absolute z-[1002] ${i === active ? 'block' : 'hidden'}`}
          style={{ top: step.top, left: step.left }}
        >
          <div
            className={`relative bg-[#E6E6FA] px-5 py-4 rounded-lg max-w-[300px] text-center text-sm text-[#333] z-[1002] animate-fadeIn`}
            style={{
              boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
              fontSize: 14,
            }}
          >
            {step.text}
            <br />
            {i < steps.length - 1 ? (
              <button
                onClick={next}
                className="mt-2.5 px-4 py-2 text-white rounded cursor-pointer text-xs"
                style={{ backgroundColor: '#4B0082', border: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6A0DAD')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4B0082')}
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={end}
                className="mt-2.5 px-4 py-2 text-white rounded cursor-pointer text-xs"
                style={{ backgroundColor: '#4B0082', border: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#6A0DAD')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4B0082')}
              >
                Finalizar Tutorial
              </button>
            )}
          </div>
          {/* Arrow */}
          <div
            className="absolute top-1/2 -translate-y-1/2 border-[10px] border-transparent z-[1002]"
            style={{
              [step.side === 'right' ? 'left' : 'right']: '-10px',
              [`border${step.side === 'right' ? 'Right' : 'Left'}Color`]: '#E6E6FA',
            }}
          />
        </div>
      ))}
    </>
  );
}
