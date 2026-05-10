import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade - Gerador de Pauta DATJP',
};

export default function Privacidade() {
  return (
    <div style={pageStyle}>
      <h1 style={h1Style}>Política de Privacidade</h1>
      <p style={pStyle}><strong>Última atualização:</strong> 10 de maio de 2026</p>

      <h2 style={h2Style}>1. Informações que coletamos</h2>
      <p style={pStyle}>
        Ao fazer login com sua conta Google, o aplicativo acessa:
      </p>
      <ul style={ulStyle}>
        <li>Seu nome e e-mail (para identificação na interface)</li>
        <li>Seu Google Drive (apenas para criar e gerenciar as pastas <strong>DATJP - Portarias</strong>, <strong>DATJP - Pautas</strong> e <strong>DATJP - SGP</strong>)</li>
        <li>Seus Google Docs (apenas para ler e criar documentos de pauta)</li>
      </ul>

      <h2 style={h2Style}>2. Como usamos essas informações</h2>
      <p style={pStyle}>
        As permissões do Google Drive e Docs são usadas exclusivamente para:
      </p>
      <ul style={ulStyle}>
        <li>Criar pastas automaticamente no seu Drive na primeira utilização</li>
        <li>Armazenar arquivos de portarias (.doc/.docx) que você envia</li>
        <li>Ler documentos da pasta SGP para processamento</li>
        <li>Gerar novos Documentos Google com a pauta formatada</li>
        <li>Permitir que você exclua arquivos das pastas do aplicativo</li>
      </ul>

      <h2 style={h2Style}>3. Armazenamento de dados</h2>
      <p style={pStyle}>
        <strong>Este aplicativo não armazena nenhum dado em servidores externos.</strong> Todas as informações
        (arquivos de portarias, pautas geradas, configurações de pastas) ficam exclusivamente no seu Google Drive.
        Os IDs das pastas são armazenados temporariamente em um cookie de sessão criptografado e são removidos
        ao fazer logout.
      </p>

      <h2 style={h2Style}>4. Compartilhamento de dados</h2>
      <p style={pStyle}>
        Não compartilhamos, vendemos ou transferimos suas informações para terceiros.
        O aplicativo funciona exclusivamente como uma interface entre você e os serviços do Google
        (Drive e Docs), sem intermediar ou armazenar dados.
      </p>

      <h2 style={h2Style}>5. Segurança</h2>
      <p style={pStyle}>
        Utilizamos autenticação OAuth 2.0 do Google com tokens criptografados (JWT).
        Todo o tráfego entre o aplicativo e os servidores do Google é feito via HTTPS.
        O aplicativo não solicita acesso a e-mails, contatos, fotos ou qualquer outro
        dado além do estritamente necessário para seu funcionamento.
      </p>

      <h2 style={h2Style}>6. Revogação de acesso</h2>
      <p style={pStyle}>
        Você pode revogar o acesso do aplicativo à sua conta Google a qualquer momento em:
        <a href="https://myaccount.google.com/permissions" style={{ color: '#00274d' }}>
          https://myaccount.google.com/permissions
        </a>
      </p>

      <h2 style={h2Style}>7. Contato</h2>
      <p style={pStyle}>
        Em caso de dúvidas sobre esta política, entre em contato:
        <br />
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
