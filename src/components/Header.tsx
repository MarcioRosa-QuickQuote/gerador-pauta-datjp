export default function Header() {
  return (
    <>
      <img
        src="https://i.imgur.com/LLwdGyL.png"
        alt="Logo TJPA"
        className="mx-auto mt-1 mb-0"
        style={{
          width: 120,
          height: 'auto',
          filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.40))',
          zIndex: 1,
        }}
      />
      <p
        className="text-[clamp(1rem,3.5vw,1.5rem)] mt-1 mb-0"
        style={{ color: '#666', zIndex: 1 }}
      >
        Divisão de Apoio Técnico Jurídico da Presidência
      </p>
      <h1
        className="text-[clamp(1.4rem,4.5vw,2.2rem)] mt-1"
        style={{ color: '#00274d', zIndex: 1 }}
      >
        Gerador de Pauta
      </h1>
    </>
  );
}
