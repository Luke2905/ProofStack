'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { SharePublishModal } from '@/components/portfolio/SharePublishModal';
import { EditProfileModal } from '@/components/portfolio/EditProfileModal';
import {
  Layers,
  Compass,
  Sliders,
  ExternalLink,
  Share2,
  LogIn,
  UserPlus,
  LogOut,
  Edit3,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    portfolios,
    currentUser,
    getActivePortfolio,
    updateActiveProfile,
    logout,
    syncFromPostgres,
  } = usePortfolioStore();

  useEffect(() => {
    syncFromPostgres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeProfile = getActivePortfolio();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <Link
                href="/"
                className="w-9 h-9 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:bg-blue-500 transition"
              >
                <Layers className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="text-base font-extrabold tracking-tight text-white"
                  >
                    Proof<span className="text-blue-400">Stack</span>
                  </Link>
                </div>
                <p className="text-[10px] text-zinc-400 hidden sm:block">
                  Verified Engineering Dossiers & Talent Hub
                </p>
              </div>
            </div>

            {/* Primary Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
              <Link
                href="/"
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  pathname === '/'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Hub de Talentos ({portfolios.filter((p) => p.showInHub && p.isPublished).length})
              </Link>

              {currentUser && activeProfile && (
                <>
                  <Link
                    href="/editor"
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname.startsWith('/editor')
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Editor Visual & GitHub Sync
                  </Link>

                  <Link
                    href={`/p/${activeProfile.slug}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                      pathname === `/p/${activeProfile.slug}`
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Minha Página Pública
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Controls: Auth or User Session */}
          <div className="flex items-center gap-2.5">
            {currentUser && activeProfile ? (
              <>
                <Link
                  href="/editor"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left transition"
                  title="Logado — Clique para editar seu portfólio"
                >
                  <img
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.name}
                    className="w-6 h-6 rounded-lg object-cover border border-blue-500/40"
                  />
                  <div className="hidden sm:block max-w-[140px]">
                    <div className="text-[11px] font-bold text-white truncate">
                      {activeProfile.name}
                    </div>
                    <div className="text-[10px] text-emerald-400 truncate font-mono">
                      @{activeProfile.slug}
                    </div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl ag-glass hover:bg-white/10 text-zinc-200 text-xs font-semibold transition cursor-pointer"
                  title="Editar Informações do Perfil"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Editar Perfil</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Publicar & Link</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sair da conta"
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-500/30 text-zinc-400 hover:text-rose-300 text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sair</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold transition"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-400" />
                  Entrar
                </Link>
                <Link
                  href="/auth"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-zinc-800/80 bg-zinc-950 py-2 px-2">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              pathname === '/' ? 'bg-blue-600 text-white' : 'text-zinc-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Hub
          </Link>
          {currentUser && activeProfile ? (
            <>
              <Link
                href="/editor"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  pathname.startsWith('/editor')
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Editor
              </Link>
              <Link
                href={`/p/${activeProfile.slug}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  pathname === `/p/${activeProfile.slug}`
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Meu Link
              </Link>
            </>
          ) : (
            <Link
              href="/auth"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                pathname === '/auth' ? 'bg-blue-600 text-white' : 'text-zinc-400'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar / Cadastrar
            </Link>
          )}
        </div>
      </header>

      {/* Share & Publish Modal */}
      {activeProfile && (
        <SharePublishModal
          profile={activeProfile}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          onUpdateProfile={updateActiveProfile}
        />
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </>
  );
}
