'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { PortfolioRenderer } from '@/components/portfolio/PortfolioRenderer';
import { EditProfileModal } from '@/components/portfolio/EditProfileModal';
import { SharePublishModal } from '@/components/portfolio/SharePublishModal';
import {
  ArrowLeft,
  Sliders,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Copy,
  Check,
  UserCheck,
  Lock,
  Globe,
  EyeOff,
} from 'lucide-react';

export default function PublicPortfolioPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug || '';
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    getPortfolioBySlug,
    incrementView,
    currentUser,
    updateActiveProfile,
    dbSyncing,
  } = usePortfolioStore();

  const profile = getPortfolioBySlug(slug);

  // Strictly verify whether the viewer is the authenticated owner
  const isOwner = Boolean(
    currentUser && profile && currentUser.portfolioId === profile.id
  );

  useEffect(() => {
    if (profile?.id) {
      incrementView(profile.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!profile && dbSyncing) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Carregando portfólio @{slug}...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">
            Portfólio @{slug} não encontrado
          </h1>
          <p className="text-xs text-zinc-400">
            Verifique se o endereço foi digitado corretamente ou explore os profissionais disponíveis no Diretório de Talentos.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              Ir para o Hub de Talentos
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
            >
              Criar Meu Portfólio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If portfolio is set to Draft/Offline (!isPublished) and viewer is not owner
  if (!profile.isPublished && !isOwner) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <EyeOff className="w-10 h-10 text-zinc-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">
            Portfólio em Modo Rascunho
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            O proprietário deste perfil pausou temporariamente a visualização pública.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
            >
              Explorar Hub de Talentos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Subtle Top Public Portfolio Context Bar */}
      <div className="bg-zinc-950/90 border-b border-zinc-800/80 py-2 px-4 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao Hub
            </Link>
            <span className="text-zinc-700">|</span>
            <span className="inline-flex items-center gap-1 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <strong className="font-mono text-zinc-100">/p/{profile.slug}</strong>
            </span>

            {!profile.isPublished ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                <EyeOff className="w-3 h-3" />
                Rascunho (Visível só para você)
              </span>
            ) : !profile.showInHub ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                <Lock className="w-3 h-3" />
                Perfil Privado • Somente com Link
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Copy Public Link Button (Available to all) */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ag-glass hover:bg-white/10 text-zinc-200 font-semibold transition cursor-pointer"
              title="Copiar link compartilhável para recrutadores"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-blue-400" />
                  <span>Copiar Link</span>
                </>
              )}
            </button>

            {/* ONLY The Authenticated Owner Can See & Access Edit Controls */}
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                    profile.showInHub
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                  title="Alterar privacidade do perfil (Público no Hub ou Privado somente com link)"
                >
                  {profile.showInHub ? (
                    <>
                      <Globe className="w-3 h-3" />
                      <span>Público no Hub</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Privado (Só Link)</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 font-semibold transition cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-blue-400" />
                  Editar Perfil
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/editor')}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  Editor Visual
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-300 font-semibold transition"
              >
                <UserCheck className="w-3 h-3" />
                Criar Meu Portfólio
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Rendered Portfolio with Developer's Custom Theme */}
      <PortfolioRenderer profile={profile} />

      {/* Floating Bottom Badge */}
      <div className="fixed bottom-4 right-4 z-30 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 shadow-2xl backdrop-blur-md text-xs font-semibold text-zinc-200 transition"
        >
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>ProofStack • Diretório</span>
        </Link>
      </div>

      {/* Owner Modals */}
      {isOwner && (
        <>
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          />
          <SharePublishModal
            profile={profile}
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            onUpdateProfile={updateActiveProfile}
          />
        </>
      )}
    </div>
  );
}
