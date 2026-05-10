import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Termos de Serviço - Gerador de Pauta DATJP',
};

export default function Termos() {
  return (
    <div style={pageStyle}>
      <h1 style={h1Style}>Termos de Serviço</h1>
      <p style={pStyle}><strong>Última atualização:</strong> 10 de maio de 2026</p>

      <h2 style={h2Style}>1. Aceitação dos Termos</h2>
      <p style={pStyle}>
        Ao utilizar o <strong>Gerador de Pauta DATJP</strong>, você concorda com estes termos.
        Se não concordar, não utilize o aplicativo.
      </p>

      <h2 style={h2Style}>2. Descrição do Serviço</h2>
      <p style={pStyle}>
        O Gerador de Pauta DATJP é uma ferramenta web que auxilia na criação de pautas
        de portarias a partir de arquivos Word (.doc/.docx). O aplicativo:
      </p>
      <ul style={ulStyle}>
        <li>Faz upload de arquivos de portarias para o Google Drive do usuário</li>
        <li>Processa documentos da SGP para extração de portarias</li>
        <li>Gera um Documento Google formatado com todas as portarias consolidadas</li>
        <li>Permite o gerenciamento (exclusão) dos arquivos processados</li>
      </ul>

      <h2 style={h2Style}>3. Responsabilidades do Usuário</h2>
      <ul style={ulStyle}>
        <li>Você é responsável pelo conteúdo dos arquivos enviados</li>
        <li>Você deve garantir que tem direito de processar os documentos enviados</li>
        <li>Você é responsável por manter a confidencialidade de sua conta Google</li>
      </ul>

      <h2 style={h2Style}>4. Limitação de Responsabilidade</h2>
      <p style={pStyle}>
        O aplicativo é fornecido &quot;como está&quot;, sem garantias de qualquer tipo.
        Não nos responsabilizamos por:
      </p>
      <ul style={ulStyle}>
        <li>Perda de dados armazenados no Google Drive do usuário</li>
        <li>Falhas de processamento de arquivos corrompidos ou em formatos não suportados</li>
        <li>Indisponibilidade temporária do serviço</li>
        <li>Erros no conteúdo gerado decorrentes de falhas na extração de texto</li>
      </ul>

      <h2 style={h2Style}>5. Serviços de Terceiros</h2>
      <p style={pStyle}>
        Este aplicativo utiliza as APIs do Google (Google Drive API e Google Docs API).
        O uso destes serviços está sujeito aos Termos de Serviço do Google.
      </p>

      <h2 style={h2Style}>6. Modificações</h2>
      <p style={pStyle}>
        Reservamo-nos o direito de modificar estes termos a qualquer momento.
        Alterações serão publicadas nesta página.
      </p>

      <h2 style={h2Style}>7. Contato</h2>
      <p style={pStyle}>
        <strong>E-mail:</strong> marciolarosa@gmail.com
      </p>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  fontFamily: 'Arial, sans-serif',
  maxWidth: 720,
  margin: '2rem auto',
  padding: '2rem',
  backgroundColor: '#fff',
  borderRadius: 8,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  color: '#333',
  lineHeight: 1.7,
};

const h1Style: React.CSSProperties = {
  color: '#00274d',
  fontSize: '1.8rem',
  borderBottom: '2px solid #00274d',
  paddingBottom: '0.5rem',
};

const h2Style: React.CSSProperties = {
  color: '#00274d',
  fontSize: '1.2rem',
  marginTop: '2rem',
};

const pStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#444',
};

const ulStyle: React.CSSProperties = {
  paddingLeft: '1.5rem',
  fontSize: '0.95rem',
  color: '#444',
};
