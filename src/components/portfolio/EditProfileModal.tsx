'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import {
  AvailabilityStatus,
  ContractType,
  PortfolioProfile,
  RoleCategory,
  SeniorityLevel,
  WorkModality,
} from '@/types/portfolio';
import { TiltSurface } from '@/components/ui/AntigravityPrimitives';
import { LinkedInImportModal } from '@/components/portfolio/LinkedInImportModal';
import {
  User,
  Briefcase,
  Globe,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Linkedin,
  Github,
  Check,
  X,
  Circle,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
];

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { getActivePortfolio, updateActiveProfile } = usePortfolioStore();
  const profile = getActivePortfolio();

  const [form, setForm] = useState<Partial<PortfolioProfile>>({});
  const [languagesInput, setLanguagesInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'basics' | 'recruiter' | 'contact'>('basics');
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        slug: profile.slug,
        avatarUrl: profile.avatarUrl,
        headline: profile.headline,
        roleCategory: profile.roleCategory,
        seniority: profile.seniority,
        yearsOfExperience: profile.yearsOfExperience,
        shortBio: profile.shortBio,
        aboutMarkdown: profile.aboutMarkdown,
        location: profile.location,
        availabilityStatus: profile.availabilityStatus,
        preferredModalities: profile.preferredModalities || [],
        contractTypes: profile.contractTypes || [],
        compensationExpectation: profile.compensationExpectation || '',
        noticePeriod: profile.noticePeriod || '',
        email: profile.email,
        whatsapp: profile.whatsapp || '',
        linkedinUrl: profile.linkedinUrl || '',
        githubUsername: profile.githubUsername || '',
        websiteUrl: profile.websiteUrl || '',
        calendlyUrl: profile.calendlyUrl || '',
        resumeUrl: profile.resumeUrl || '',
        isPublished: profile.isPublished,
        showInHub: profile.showInHub,
      });
      setLanguagesInput((profile.languages || []).join(', '));
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLanguages = languagesInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    const cleanSlug = (form.slug || profile.slug)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/(^-|-$)/g, '');

    updateActiveProfile({
      ...form,
      slug: cleanSlug,
      languages: parsedLanguages.length > 0 ? parsedLanguages : profile.languages,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const toggleModality = (mod: WorkModality) => {
    const current = form.preferredModalities || [];
    const exists = current.includes(mod);
    const updated = exists ? current.filter((m) => m !== mod) : [...current, mod];
    setForm({ ...form, preferredModalities: updated });
  };

  const toggleContract = (ct: ContractType) => {
    const current = form.contractTypes || [];
    const exists = current.includes(ct);
    const updated = exists ? current.filter((c) => c !== ct) : [...current, ct];
    setForm({ ...form, contractTypes: updated });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl ag-glass-elevated rounded-3xl shadow-2xl overflow-hidden my-8 border border-white/10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black/60 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Editar Informações do Perfil
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  /p/{form.slug}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Altere seus dados, cargo, avatar e informações avaliadas por empresas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLinkedInModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 border border-[#0a66c2]/40 text-blue-300 text-xs font-bold transition cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>Importar LinkedIn</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="px-6 pt-4 pb-2 border-b border-white/10 flex items-center gap-2 bg-black/30">
          {[
            { id: 'basics', label: '1. Identidade & Apresentação' },
            { id: 'recruiter', label: '2. Disponibilidade & Recrutador' },
            { id: 'contact', label: '3. Contato & Links' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white bg-black/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Informações salvas e sincronizadas com sucesso!</span>
            </div>
          )}

          {/* TAB 1: IDENTIDADE E APRESENTAÇÃO */}
          {activeTab === 'basics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Slug da URL Pública (/p/seu-slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.slug || ''}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-blue-400 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Headline / Cargo Principal *
                </label>
                <input
                  type="text"
                  required
                  value={form.headline || ''}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  placeholder="Ex: Engenheiro Fullstack Sênior • React, Next.js & Node.js"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Área Principal
                  </label>
                  <select
                    value={form.roleCategory}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        roleCategory: e.target.value as RoleCategory,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    {[
                      'Fullstack',
                      'Frontend',
                      'Backend',
                      'Mobile',
                      'Dados & IA',
                      'DevOps & Cloud',
                      'UI/UX & Product',
                    ].map((role) => (
                      <option key={role} value={role} className="bg-zinc-900">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Senioridade
                  </label>
                  <select
                    value={form.seniority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        seniority: e.target.value as SeniorityLevel,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                  >
                    {[
                      'Júnior',
                      'Pleno',
                      'Sênior',
                      'Tech Lead / Staff',
                      'Principal / Arquitetura',
                    ].map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-zinc-900">
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Anos de Experiência
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={form.yearsOfExperience ?? 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        yearsOfExperience: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="block text-xs font-semibold text-zinc-300">
                  Foto de Perfil (Avatar)
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={form.avatarUrl || profile.avatarUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-lg shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={form.avatarUrl || ''}
                      onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                      placeholder="https://exemplo.com/sua-foto.jpg"
                      className="w-full px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white font-mono"
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-zinc-400">Presets rápidos:</span>
                      {AVATAR_PRESETS.map((presetUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setForm({ ...form, avatarUrl: presetUrl })}
                          className="w-7 h-7 rounded-lg overflow-hidden border border-white/20 hover:scale-110 transition cursor-pointer"
                        >
                          <img
                            src={presetUrl}
                            alt={`Preset ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                      {form.githubUsername && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              avatarUrl: `https://github.com/${form.githubUsername}.png`,
                            })
                          }
                          className="px-2 py-0.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold cursor-pointer"
                        >
                          Usar Foto do GitHub
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Bio Resumida (Destaque nos Cards do Hub)
                </label>
                <textarea
                  rows={2}
                  value={form.shortBio || ''}
                  onChange={(e) => setForm({ ...form, shortBio: e.target.value })}
                  placeholder="Resumo executivo em 1 ou 2 frases sobre seus pontos fortes..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Sobre Mim & Princípios de Engenharia (Texto Completo)
                </label>
                <textarea
                  rows={3}
                  value={form.aboutMarkdown || ''}
                  onChange={(e) => setForm({ ...form, aboutMarkdown: e.target.value })}
                  placeholder="Conte sobre sua trajetória, tecnologias favoritas e projetos de destaque..."
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DISPONIBILIDADE E RECRUTADOR */}
          {activeTab === 'recruiter' && (
            <div className="space-y-4">
              {/* Privacy Mode Selector */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Privacidade e Listagem no Hub
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, isPublished: true, showInHub: true })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      form.isPublished && form.showInHub
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">Público no Hub</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Listado no diretório e acessível por link
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, isPublished: true, showInHub: false })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      form.isPublished && !form.showInHub
                        ? 'bg-amber-500/15 border-amber-500/40 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">Perfil Privado (Só Link)</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Oculto no Hub; disponível apenas via link direto
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, isPublished: false, showInHub: false })
                    }
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      !form.isPublished
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold">Rascunho (Offline)</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Pausado; apenas você logado pode ver
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Status de Disponibilidade
                </label>
                <select
                  value={form.availabilityStatus}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      availabilityStatus: e.target.value as AvailabilityStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="available_now" className="bg-zinc-900">
                    Disponível Imediatamente (Ready to Hire)
                  </option>
                  <option value="open_to_offers" className="bg-zinc-900">
                    Aberto a Propostas
                  </option>
                  <option value="freelance_only" className="bg-zinc-900">
                    Apenas Projetos Freelance / Consultoria
                  </option>
                  <option value="employed_networking" className="bg-zinc-900">
                    Empregado (Apenas Networking)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Modalidades de Trabalho Aceitas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Remoto', 'Híbrido', 'Presencial'] as WorkModality[]).map(
                      (mod) => {
                        const active = form.preferredModalities?.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => toggleModality(mod)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              active
                                ? 'bg-blue-600/25 border-blue-500 text-blue-300'
                                : 'bg-black/40 border-white/10 text-zinc-400'
                            }`}
                          >
                            {mod}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Formatos de Contratação
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'PJ',
                        'CLT',
                        'Freelance',
                        'Internacional (USD/EUR)',
                      ] as ContractType[]
                    ).map((ct) => {
                      const active = form.contractTypes?.includes(ct);
                      return (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => toggleContract(ct)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            active
                              ? 'bg-emerald-600/25 border-emerald-500 text-emerald-300'
                              : 'bg-black/40 border-white/10 text-zinc-400'
                          }`}
                        >
                          {ct}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Pretensão Salarial ou Taxa / Hora (Opcional)
                  </label>
                  <input
                    type="text"
                    value={form.compensationExpectation || ''}
                    onChange={(e) =>
                      setForm({ ...form, compensationExpectation: e.target.value })
                    }
                    placeholder="Ex: R$ 16k - 20k / USD 4.500"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Prazo de Início (Aviso Prévio)
                  </label>
                  <input
                    type="text"
                    value={form.noticePeriod || ''}
                    onChange={(e) =>
                      setForm({ ...form, noticePeriod: e.target.value })
                    }
                    placeholder="Ex: Imediato, 15 dias, 30 dias"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Localização (Cidade, Estado, País)
                  </label>
                  <input
                    type="text"
                    value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Ex: São Paulo, SP (Brasil)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Idiomas (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={languagesInput}
                    onChange={(e) => setLanguagesInput(e.target.value)}
                    placeholder="Português (Nativo), Inglês (Fluente)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTATO E LINKS */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    E-mail de Contato *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={form.email || ''}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    WhatsApp (apenas números com DDI, ex: 5511999998888)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.whatsapp || ''}
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                      placeholder="5511999999999"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Perfil no LinkedIn (URL)
                  </label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={form.linkedinUrl || ''}
                      onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/seu-perfil"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Username do GitHub
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.githubUsername || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          githubUsername: e.target.value.replace(/^@/, ''),
                          githubUrl: e.target.value
                            ? `https://github.com/${e.target.value.replace(/^@/, '')}`
                            : '',
                        })
                      }
                      placeholder="seu-usuario"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Website Pessoal / Blog (Opcional)
                  </label>
                  <input
                    type="url"
                    value={form.websiteUrl || ''}
                    onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                    placeholder="https://seusite.dev"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Link de Agendamento (Calendly ou Cal.com)
                  </label>
                  <input
                    type="url"
                    value={form.calendlyUrl || ''}
                    onChange={(e) => setForm({ ...form, calendlyUrl: e.target.value })}
                    placeholder="https://cal.com/seu-nome"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Todas as edições são salvas automaticamente na nuvem.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Nested LinkedIn Import Modal */}
      <LinkedInImportModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onSuccess={() => {
          const updated = getActivePortfolio();
          if (updated) {
            setForm(updated);
          }
        }}
      />
    </div>
  );
}
