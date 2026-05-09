'use client';

export default function Sobre() {
  return (
    <div className="relative inline-block z-[1]">
      <span
        id="sobre"
        className="text-[clamp(0.75rem,2vw,0.875rem)] cursor-pointer font-normal mt-4"
        style={{ color: '#00274d' }}
        onMouseEnter={() => {
          const el = document.getElementById('tooltip');
          if (el) el.style.display = 'block';
        }}
        onMouseLeave={() => {
          const el = document.getElementById('tooltip');
          if (el) el.style.display = 'none';
        }}
      >
        Sobre
      </span>
      <div
        id="tooltip"
        className="hidden absolute left-1/2 -translate-x-1/2 text-center font-light bg-white px-2 py-2 rounded z-[1001] whitespace-nowrap"
        style={{
          color: '#333',
          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: 'none',
        }}
      >
        Criado por Márcio Rosa<br />marciolarosa@gmail.com
      </div>
    </div>
  );
}
