import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'ProofStack — Portfólios Técnicos, Case Studies & Diretório Executivo',
  description:
    'Plataforma de portfólios verificados para engenheiros de software e líderes de produto com sincronização via GitHub API, Case Studies de impacto e currículo executivo em PDF.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-blue-600 selection:text-white">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
