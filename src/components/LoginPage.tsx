'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f4f4f9',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="https://i.imgur.com/LLwdGyL.png"
        alt="Logo TJPA"
        style={{
          width: 173,
          height: 'auto',
          filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.40))',
          marginBottom: '1rem',
        }}
      />
      <p style={{ color: '#666', fontSize: 'clamp(1.2rem, 4vw, 1.875rem)', margin: 0 }}>
        Divisão de Apoio Técnico Jurídico da Presidência
      </p>
      <h1 style={{ color: '#00274d', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: '1rem 0 2rem' }}>
        Gerador de Pauta
      </h1>
      <button
        onClick={() => signIn('google')}
        style={{
          backgroundColor: '#00274d',
          color: 'white',
          padding: '0.75rem 2rem',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: '1rem',
          boxShadow: '0px 6px 12px rgba(0,0,0,0.40)',
          transition: 'all 0.3s ease-in-out',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#001f3f')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00274d')}
      >
        Entrar com Google
      </button>
      <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '1rem' }}>
        Faça login com sua conta Google para acessar seu Drive
      </p>
    </div>
  );
}
