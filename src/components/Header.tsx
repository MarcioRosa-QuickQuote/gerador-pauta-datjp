export default function Header() {
  return (
    <>
      <img
        src="https://i.imgur.com/LLwdGyL.png"
        alt="Logo TJPA"
        className="mx-auto mt-1 mb-0"
        style={{
          width: 173,
          height: 'auto',
          filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.40))',
          zIndex: 1,
        }}
      />
      <p
        className="text-[clamp(1.2rem,4vw,1.875rem)] mt-0 mb-4"
        style={{ color: '#666', zIndex: 1 }}
      >
        Divisão de Apoio Técnico Jurídico da Presidência
      </p>
      <h1
        className="text-[clamp(1.5rem,5vw,2.5rem)] mt-4"
        style={{ color: '#00274d', zIndex: 1 }}
      >
        Gerador de Pauta
      </h1>
    </>
  );
}
