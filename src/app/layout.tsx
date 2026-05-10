import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gerador de Pauta - DATJP',
  description: 'Divisão de Apoio Técnico Jurídico da Presidência - TJPA',
  icons: {
    icon: 'https://i.imgur.com/LLwdGyL.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
