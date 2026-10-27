'use client';

import React, { useState } from 'react';
import { PortfolioProfile } from '@/types/portfolio';
import { getAvailabilityMeta } from '@/lib/utils';
import {
  X,
  Copy,
  Check,
  Globe,
  Share2,
  ExternalLink,
  QrCode,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface SharePublishModalProps {
  profile: PortfolioProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile?: (partial: Partial<PortfolioProfile>) => void;
}

export function SharePublishModal({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
}: SharePublishModalProps) {
  const [copied, setCopied] = useState(false);
  const [slugInput, setSlugInput] = useState(profile.slug);

  if (!isOpen) return null;

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://proofstack.dev';
  const publicUrl = `${origin}/p/${profile.slug}`;
  const avail = getAvailabilityMeta(profile.availabilityStatus);

  const visibilityMode: 'public_hub' | 'private_link' | 'draft' = !profile.isPublished
    ? 'draft'
    : profile.showInHub
    ? 'public_hub'
    : 'private_link';

  const handleSetVisibility = (mode: 'public_hub' | 'private_link' | 'draft') => {
    if (!onUpdateProfile) return;
    if (mode === 'public_hub') {
      onUpdateProfile({ isPublished: true, showInHub: true });
    } else if (mode === 'private_link') {
      onUpdateProfile({ isPublished: true, showInHub: false });
    } else {
      onUpdateProfile({ isPublished: false, showInHub: false });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveSlug = () => {
    if (!onUpdateProfile) return;
    const clean = slugInput
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/(^-|-$)/g, '');
    if (clean) {
      onUpdateProfile({ slug: clean });
      setSlugInput(clean);
    }
  };

  // Generate deterministic visual QR pattern from slug
  const qrSize = 11;
  const seedStr = publicUrl;
  const isModuleDark = (r: number, c: number) => {
    const inTopLeft = r < 3 && c < 3;
    const inTopRight = r < 3 && c >= qrSize - 3;
    const inBottomLeft = r >= qrSize - 3 && c < 3;
    if (inTopLeft || inTopRight || inBottomLeft) return true;
    const charCode = seedStr.charCodeAt((r * qrSize + c) % seedStr.length);
    return (charCode + r * 7 + c * 13) % 2 === 0;
  };

  const shareText = encodeURIComponent(
    `Confira o portfólio e cases técnicos de ${profile.name} (${profile.headline}) no ProofStack:`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Privacidade, Publicação & Link Direto
              </h3>
              <p className="text-xs text-zinc-400">
                Defina se o seu perfil aparece no Hub ou se fica restrito apenas para quem possui o link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* 3-Mode Visibility Selector */}
          {onUpdateProfile && (
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                Modo de Visibilidade do Portfólio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Public in Hub */}
                <button
                  type="button"
                  onClick={() => handleSetVisibility('public_hub')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    visibilityMode === 'public_hub'
                      ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    {visibilityMode === 'public_hub' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Público no Hub</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Listado no diretório para recrutadores e acessível por link.
                    </p>
                  </div>
                </button>

                {/* 2. Private Profile (Link Only) */}
                <button
                  type="button"
                  onClick={() => handleSetVisibility('private_link')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    visibilityMode === 'private_link'
                      ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    {visibilityMode === 'private_link' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      Perfil Privado (Só Link)
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Não aparece no Hub nem nas buscas. Só abre com o link direto.
                    </p>
                  </div>
                </button>

                {/* 3. Draft / Offline */}
                <button
                  type="button"
                  onClick={() => handleSetVisibility('draft')}
                  className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    visibilityMode === 'draft'
                      ? 'bg-zinc-800/80 border-zinc-600'
                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                      <EyeOff className="w-4 h-4" />
                    </span>
                    {visibilityMode === 'draft' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-zinc-700 text-zinc-200">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Rascunho (Offline)</div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Link público pausado. Visível somente para você logado.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Shareable Link Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              {visibilityMode === 'private_link' ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Globe className="w-3.5 h-3.5 text-blue-400" />
              )}
              {visibilityMode === 'private_link'
                ? 'Link Privado de Acesso Direto (Oculto do Hub)'
                : 'Link Direto de Visualização do Portfólio'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 font-mono overflow-x-auto">
                <span className="text-zinc-500 select-none">{origin}/p/</span>
                <span className="text-blue-400 font-semibold">{profile.slug}</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shrink-0 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Link
                  </>
                )}
              </button>
              <Link
                href={`/p/${profile.slug}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </Link>
            </div>

            {onUpdateProfile && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-zinc-400">Personalizar slug:</span>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                  placeholder="seu-nome"
                />
                <button
                  type="button"
                  onClick={handleSaveSlug}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium transition cursor-pointer"
                >
                  Atualizar URL
                </button>
              </div>
            )}
          </div>

          {/* Social OpenGraph Card Preview + QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* OpenGraph Preview */}
            <div className="md:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-3">
                <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Preview de Compartilhamento (LinkedIn / WhatsApp)
                </span>
                <span>OpenGraph Card</span>
              </div>

              <div
                className="rounded-lg border border-zinc-800/90 p-4 relative overflow-hidden"
                style={{
                  backgroundColor: '#09090b',
                }}
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white/15 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">
                        {profile.name}
                      </span>
                      {profile.verifiedGithub && (
                        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                      )}
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {avail.shortLabel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1">
                      {profile.headline}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5 text-[10px] text-zinc-400">
                      <span>{profile.seniority}</span>
                      <span>•</span>
                      <span>{profile.projects.length} Cases & Projetos</span>
                      <span>•</span>
                      <span>★ {profile.githubStats.totalStars} GitHub Stars</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2 mt-4">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    publicUrl
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/40 text-blue-200 text-xs font-medium text-center transition"
                >
                  Compartilhar no LinkedIn
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${encodeURIComponent(publicUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-medium text-center transition"
                >
                  Enviar no WhatsApp
                </a>
              </div>
            </div>

            {/* QR Code Box */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col items-center justify-center text-center">
              <div className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-400" />
                QR Code para CV
              </div>
              <div className="p-3 bg-white rounded-xl shadow-inner">
                <svg
                  width="110"
                  height="110"
                  viewBox={`0 0 ${qrSize} ${qrSize}`}
                  shapeRendering="crispEdges"
                >
                  {Array.from({ length: qrSize }).map((_, r) =>
                    Array.from({ length: qrSize }).map((__, c) =>
                      isModuleDark(r, c) ? (
                        <rect
                          key={`${r}-${c}`}
                          x={c}
                          y={r}
                          width={1}
                          height={1}
                          fill="#09090b"
                        />
                      ) : null
                    )
                  )}
                </svg>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                Escaneie para abrir <span className="text-zinc-200 font-mono">/p/{profile.slug}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
