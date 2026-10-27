import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AvailabilityStatus } from '@/types/portfolio';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAvailabilityMeta(status: AvailabilityStatus) {
  switch (status) {
    case 'available_now':
      return {
        label: 'Disponível Imediatamente',
        shortLabel: 'Disponível Agora',
        dotColor: 'bg-emerald-400',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        pulse: true,
      };
    case 'open_to_offers':
      return {
        label: 'Aberto a Propostas',
        shortLabel: 'Aberto a Propostas',
        dotColor: 'bg-blue-400',
        badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        pulse: false,
      };
    case 'freelance_only':
      return {
        label: 'Disponível para Freelance / Projetos',
        shortLabel: 'Apenas Freelance',
        dotColor: 'bg-amber-400',
        badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        pulse: true,
      };
    case 'employed_networking':
    default:
      return {
        label: 'Empregado • Aberto a Networking',
        shortLabel: 'Apenas Networking',
        dotColor: 'bg-zinc-400',
        badgeBg: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
        pulse: false,
      };
  }
}

export const COVER_PRESETS = [
  {
    label: 'Dashboard Financeiro & Analytics',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Infraestrutura Cloud & Servidores',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Código & Arquitetura de Software',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Design System & UI/UX',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Inteligência Artificial & Redes Neurais',
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=80',
  },
  {
    label: 'Aplicativo Mobile Moderno',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&auto=format&fit=crop&q=80',
  },
];
