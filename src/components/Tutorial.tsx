'use client';

import { useState, useEffect, useLayoutEffect, useCallback } from 'react';

interface Step {
  targetId: string;
  title: string;
  text: string;
  position: 'right' | 'left' | 'bottom' | 'top';
}

const steps: Step[] = [
  { targetId: 'uploadArea', title: 'Upload', text: 'Selecione ou arraste o arquivo da portaria para fazer o upload.', position: 'right' },
  { targetId: 'gerarPautaButton', title: 'Gerar Pauta', text: 'Clique no botão para gerar a Pauta.', position: 'right' },
  { targetId: 'pautaNotification', title: 'Pauta SGP', text: 'Quando a SGP gerar a pauta do dia, a notificação aparecerá aqui.', position: 'right' },
  { targetId: 'deleteButton', title: 'Apagar Arquivos', text: 'Clique aqui para apagar os arquivos das portarias e das pautas geradas.', position: 'right' },
  { targetId: 'naoGeradosButton', title: 'Não Gerados', text: 'Aqui serão exibidas as portarias que ainda não foram incluídas na pauta.', position: 'right' },
];

export default function Tutorial() {
  const [active, setActive] = useState(-1);

  function start() { setActive(0); }
  function next() { if (active < steps.length - 1) setActive(active + 1); }
  function prev() { if (active > 0) setActive(active - 1); }
  function end() { setActive(-1); }

  // Highlight target element
  useEffect(() => {
    if (active < 0) return;
    const step = steps[active];
    const el = document.getElementById(step.targetId);
    if (el) {
      el.style.position = 'relative';
      el.style.zIndex = '1002';
      el.style.outline = '3px dashed #e53935';
      el.style.outlineOffset = '4px';
    }
    return () => {
      steps.forEach((s) => {
        const el = document.getElementById(s.targetId);
        if (el) {
          el.style.outline = '';
          el.style.outlineOffset = '';
          el.style.zIndex = '';
          el.style.position = '';
        }
      });
    };
  }, [active]);

  // Keyboard navigation
  useEffect(() => {
    if (active < 0) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') end();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active]);

  const step = active >= 0 ? steps[active] : null;

  // Position balloon and draw connector line
  const updateLayout = useCallback(() => {
    if (!step) return;
    const target = document.getElementById(step.targetId);
    const balloon = document.getElementById('tutorialBalloon');
    const line = document.getElementById('connectorLine');
    if (!target || !balloon || !line) return;

    const targetRect = target.getBoundingClientRect();
    const targetCX = targetRect.left + targetRect.width / 2;
    const targetCY = targetRect.top + targetRect.height / 2;

    const balloonW = 320;
    const balloonH = 180;
    const gap = 30;
    const margin = 20;

    let bx: number, by: number;

    if (step.position === 'right') {
      bx = targetRect.right + gap;
      by = targetCY - balloonH / 2;
    } else if (step.position === 'left') {
      bx = targetRect.left - balloonW - gap;
      by = targetCY - balloonH / 2;
    } else if (step.position === 'bottom') {
      bx = targetCX - balloonW / 2;
      by = targetRect.bottom + gap;
    } else {
      bx = targetCX - balloonW / 2;
      by = targetRect.top - balloonH - gap;
    }

    // Clamp to viewport
    bx = Math.max(margin, Math.min(bx, window.innerWidth - balloonW - margin));
    by = Math.max(margin, Math.min(by, window.innerHeight - balloonH - margin));

    balloon.style.left = `${bx}px`;
    balloon.style.top = `${by}px`;

    const balloonCX = bx + balloonW / 2;
    const balloonCY = by + balloonH / 2;

    // Draw line from target center to nearest edge of balloon
    if (step.position === 'right') {
      line.setAttribute('x1', String(targetRect.right));
      line.setAttribute('y1', String(targetCY));
      line.setAttribute('x2', String(bx));
      line.setAttribute('y2', String(balloonCY));
    } else if (step.position === 'left') {
      line.setAttribute('x1', String(targetRect.left));
      line.setAttribute('y1', String(targetCY));
      line.setAttribute('x2', String(bx + balloonW));
      line.setAttribute('y2', String(balloonCY));
    } else if (step.position === 'bottom') {
      line.setAttribute('x1', String(targetCX));
      line.setAttribute('y1', String(targetRect.bottom));
      line.setAttribute('x2', String(balloonCX));
      line.setAttribute('y2', String(by));
    } else {
      line.setAttribute('x1', String(targetCX));
      line.setAttribute('y1', String(targetRect.top));
      line.setAttribute('x2', String(balloonCX));
      line.setAttribute('y2', String(by + balloonH));
    }
  }, [step]);

  useLayoutEffect(() => {
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, [updateLayout]);

  return (
    <>
      {/* Tutorial button */}
      <span
        onClick={start}
        className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 cursor-pointer select-none"
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-sm font-bold"
          style={{ backgroundColor: '#2196F3', boxShadow: '0 2px 6px rgba(33,150,243,0.4)' }}
        >
          ?
        </span>
        <span className="text-sm font-medium" style={{ color: '#1976D2' }}>
          Tutorial
        </span>
      </span>

      {/* Overlay */}
      {step && (
        <>
          <div
            className="fixed inset-0 z-[1001]"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={end}
          />

          {/* Balloon */}
          <div
            className="fixed z-[1003] bg-white rounded-xl p-5 max-w-[320px] animate-fadeIn"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
            id="tutorialBalloon"
          >
            <p className="text-sm font-bold mb-1" style={{ color: '#00274d' }}>
              {step.title}
            </p>
            <p className="text-sm mb-4" style={{ color: '#555', lineHeight: 1.5 }}>
              {step.text}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#999' }}>
                {active + 1} de {steps.length}
              </span>
              <div className="flex gap-2">
                {active > 0 && (
                  <button
                    onClick={prev}
                    className="px-3 py-1.5 text-xs rounded cursor-pointer text-white"
                    style={{ backgroundColor: '#888', border: 'none' }}
                  >
                    Voltar
                  </button>
                )}
                {active < steps.length - 1 ? (
                  <button
                    onClick={next}
                    className="px-3 py-1.5 text-xs rounded cursor-pointer text-white"
                    style={{ backgroundColor: '#1976D2', border: 'none' }}
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={end}
                    className="px-3 py-1.5 text-xs rounded cursor-pointer text-white"
                    style={{ backgroundColor: '#4CAF50', border: 'none' }}
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SVG line connector */}
          <svg className="fixed inset-0 z-[1002] pointer-events-none" id="tutorialLine">
            <line id="connectorLine" stroke="#e53935" strokeWidth="2" strokeDasharray="6,4" />
          </svg>
        </>
      )}
    </>
  );
}
