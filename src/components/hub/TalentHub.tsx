'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import {
  AvailabilityStatus,
  PortfolioProfile,
  RoleCategory,
  SeniorityLevel,
  WorkModality,
} from '@/types/portfolio';
import { getAvailabilityMeta } from '@/lib/utils';
import { PrintableResumeModal } from '@/components/portfolio/PrintableResumeModal';
import {
  StaggerRevealGrid,
  TiltSurface,
} from '@/components/ui/AntigravityPrimitives';
import { Reveal, CountUp } from '@/components/ui/Motion';
import {
  Search,
  Filter,
  Star,
  Github,
  MapPin,
  ExternalLink,
  FileText,
  ShieldCheck,
  TrendingUp,
  Heart,
  Eye,
  Sliders,
  Phone,
  X,
  Layers,
  Users,
  UserPlus,
  LogIn,
} from 'lucide-react';

const ROLE_CATEGORIES: ('Todos' | RoleCategory)[] = [
  'Todos',
  'Fullstack',
  'Frontend',
  'Backend',
  'Mobile',
  'Dados & IA',
  'DevOps & Cloud',
  'UI/UX & Product',
];

const SENIORITY_LEVELS: ('Todos' | SeniorityLevel)[] = [
  'Todos',
  'Júnior',
  'Pleno',
  'Sênior',
  'Tech Lead / Staff',
];

const POPULAR_TECH_FILTERS = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Go',
  'Rust',
  'Python',
  'React Native',
  'PostgreSQL',
  'AWS',
  'Kubernetes',
];

export function TalentHub() {
  const router = useRouter();
  const {
    portfolios,
    currentUser,
    incrementLike,
  } = usePortfolioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Todos' | RoleCategory>('Todos');
  const [selectedSeniority, setSelectedSeniority] = useState<'Todos' | SeniorityLevel>('Todos');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | AvailabilityStatus>('all');
  const [selectedModality, setSelectedModality] = useState<'all' | WorkModality>('all');
  const [selectedTechTag, setSelectedTechTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'stars' | 'experience' | 'likes'>('featured');

  const [quickViewProfile, setQuickViewProfile] = useState<PortfolioProfile | null>(null);
  const [resumeModalProfile, setResumeModalProfile] = useState<PortfolioProfile | null>(null);

  const publicPortfolios = useMemo(
    () => portfolios.filter((p) => p.isPublished && p.showInHub),
    [portfolios]
  );

  const hubPortfolios = useMemo(() => {
    return publicPortfolios
      .filter((p) => {
        if (selectedRole !== 'Todos' && p.roleCategory !== selectedRole) return false;
        if (selectedSeniority !== 'Todos' && p.seniority !== selectedSeniority) return false;
        if (selectedAvailability !== 'all' && p.availabilityStatus !== selectedAvailability)
          return false;
        if (
          selectedModality !== 'all' &&
          !p.preferredModalities.includes(selectedModality)
        )
          return false;

        if (selectedTechTag) {
          const tagLower = selectedTechTag.toLowerCase();
          const inSkills = p.skills.some((s) => s.name.toLowerCase().includes(tagLower));
          const inProjects = p.projects.some((proj) =>
            proj.techStack.some((t) => t.toLowerCase().includes(tagLower))
          );
          if (!inSkills && !inProjects) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchHeadline = p.headline.toLowerCase().includes(q);
          const matchBio = p.shortBio.toLowerCase().includes(q);
          const matchLoc = p.location.toLowerCase().includes(q);
          const matchSkills = p.skills.some((s) => s.name.toLowerCase().includes(q));
          const matchProj = p.projects.some(
            (proj) =>
              proj.title.toLowerCase().includes(q) ||
              proj.techStack.some((t) => t.toLowerCase().includes(q))
          );
          return (
            matchName ||
            matchHeadline ||
            matchBio ||
            matchLoc ||
            matchSkills ||
            matchProj
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'stars') {
          return b.githubStats.totalStars - a.githubStats.totalStars;
        }
        if (sortBy === 'experience') {
          return b.yearsOfExperience - a.yearsOfExperience;
        }
        if (sortBy === 'likes') {
          return b.likesCount - a.likesCount;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [
    publicPortfolios,
    selectedRole,
    selectedSeniority,
    selectedAvailability,
    selectedModality,
    selectedTechTag,
    searchQuery,
    sortBy,
  ]);

  const totalStarsAcrossHub = publicPortfolios.reduce(
    (acc, p) => acc + (p.githubStats?.totalStars || 0),
    0
  );
  const availableNowCount = publicPortfolios.filter(
    (p) => p.availabilityStatus === 'available_now'
  ).length;
  const totalCasesAcrossHub = publicPortfolios.reduce(
    (acc, p) => acc + p.projects.filter((pr) => pr.isVisible).length,
    0
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('Todos');
    setSelectedSeniority('Todos');
    setSelectedAvailability('all');
    setSelectedModality('all');
    setSelectedTechTag(null);
  };

  return (
    <div className="min-h-screen ag-spatial-bg text-zinc-100 pb-24">
      {/* Executive B2B / SaaS Hero */}
      <section className="relative isolate overflow-hidden border-b border-white/10 pt-12 pb-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 -top-36 left-[10%] w-[540px] h-[340px] rounded-full bg-blue-600/15 blur-3xl"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-medium text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Diretório Executivo de Engenharia & Produto
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Avalie profissionais pelo{' '}
                <span className="text-blue-400">
                  impacto técnico e cases reais
                </span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
                Portfólios padronizados para tomada de decisão: arquitetura, métricas de negócio, repositórios sincronizados via GitHub API e currículo executivo pronto para impressão.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {currentUser ? (
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition"
                  >
                    <Sliders className="w-4 h-4" />
                    Abrir Estúdio do Portfólio
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition"
                    >
                      <UserPlus className="w-4 h-4" />
                      Criar Portfólio Profissional
                    </Link>
                    <Link
                      href="/auth"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-sm font-medium transition"
                    >
                      <LogIn className="w-4 h-4" />
                      Acessar Conta
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Corporate Bento Grid Overview with Real Directory Telemetry */}
            <div className="lg:col-span-6">
              <Reveal>
                <div className="rounded-2xl border border-zinc-800/90 bg-zinc-950/90 p-5 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-zinc-200">
                        Indicadores do Diretório em Tempo Real
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">
                      GitHub API + Dossiê ATS
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-3.5">
                      <div className="text-[11px] font-medium text-zinc-400">
                        Perfis Públicos
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        <CountUp value={publicPortfolios.length} />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Ativos no Hub
                      </div>
                    </div>

                    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-3.5">
                      <div className="text-[11px] font-medium text-zinc-400">
                        Contr. Imediata
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">
                        <CountUp value={availableNowCount} />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Ready to hire
                      </div>
                    </div>

                    <div className="rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-3.5">
                      <div className="text-[11px] font-medium text-zinc-400">
                        Cases & Stars
                      </div>
                      <div className="text-2xl font-bold text-white mt-1">
                        <CountUp value={totalCasesAcrossHub + totalStarsAcrossHub} />
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Projetos & GitHub
                      </div>
                    </div>
                  </div>

                  {/* Quick Executive Filter Shortcuts */}
                  <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/80 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-zinc-300">
                        Filtros Rápidos para Recrutadores
                      </span>
                      <span className="text-zinc-500">1 clique para filtrar</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAvailability(
                            selectedAvailability === 'available_now'
                              ? 'all'
                              : 'available_now'
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          selectedAvailability === 'available_now'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        Disponibilidade Imediata
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSeniority(
                            selectedSeniority === 'Sênior' ? 'Todos' : 'Sênior'
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          selectedSeniority === 'Sênior'
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        Engenheiros Sênior
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRole(
                            selectedRole === 'Fullstack' ? 'Todos' : 'Fullstack'
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          selectedRole === 'Fullstack'
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        Fullstack & Arquitetura
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Main Directory & Multi-Faceted Recruiter Filter Dock */}
      <main id="talent-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-7">
        {/* Weightless Glass Filter Bar */}
        <div className="p-5 sm:p-6 rounded-3xl ag-glass-elevated space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por tecnologia (React, Go, Python), cargo, nome ou cidade..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Seniority Select */}
            <div className="lg:col-span-2">
              <select
                value={selectedSeniority}
                onChange={(e) =>
                  setSelectedSeniority(e.target.value as 'Todos' | SeniorityLevel)
                }
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                {SENIORITY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-zinc-900">
                    Senioridade: {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Select */}
            <div className="lg:col-span-3">
              <select
                value={selectedAvailability}
                onChange={(e) =>
                  setSelectedAvailability(
                    e.target.value as 'all' | AvailabilityStatus
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="all" className="bg-zinc-900">
                  Disponibilidade: Todos os Status
                </option>
                <option value="available_now" className="bg-zinc-900">
                  Disponível Imediatamente
                </option>
                <option value="open_to_offers" className="bg-zinc-900">
                  Aberto a Propostas
                </option>
                <option value="freelance_only" className="bg-zinc-900">
                  Disponível para Freelance
                </option>
              </select>
            </div>

            {/* Sort Select */}
            <div className="lg:col-span-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'featured' | 'stars' | 'experience' | 'likes'
                  )
                }
                className="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-blue-500"
              >
                <option value="featured" className="bg-zinc-900">
                  Ordenar: Mais Recentes
                </option>
                <option value="stars" className="bg-zinc-900">
                  ★ Mais Estrelas GitHub
                </option>
                <option value="experience" className="bg-zinc-900">
                  Maior Experiência
                </option>
                <option value="likes" className="bg-zinc-900">
                  Mais Recomendados
                </option>
              </select>
            </div>
          </div>

          {/* Role Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-zinc-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              Especialidade:
            </span>
            {ROLE_CATEGORIES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-black/40 text-zinc-400 hover:text-white border border-white/10'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Quick Tech Stack Filter Chips */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mr-1">
                Stacks Populares:
              </span>
              {POPULAR_TECH_FILTERS.map((tech) => {
                const isSelected = selectedTechTag === tech;
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() =>
                      setSelectedTechTag(isSelected ? null : tech)
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tech}
                  </button>
                );
              })}
            </div>

            {(searchQuery ||
              selectedRole !== 'Todos' ||
              selectedSeniority !== 'Todos' ||
              selectedAvailability !== 'all' ||
              selectedTechTag) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span>
            Exibindo <strong className="text-white">{hubPortfolios.length}</strong>{' '}
            profissionais com portfólios públicos no diretório
          </span>
        </div>

        {/* Developer Portfolio Cards Grid */}
        {publicPortfolios.length === 0 ? (
          <TiltSurface
            maxTilt={3.5}
            className="p-12 sm:p-16 rounded-3xl ag-glass-elevated text-center space-y-4 max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Diretório de Talentos Pronto para o seu Portfólio
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300/80 max-w-md mx-auto leading-relaxed">
              Crie sua conta para publicar seu portfólio no Hub (ou deixá-lo privado somente com link), importar repositórios do GitHub e personalizar o visual.
            </p>
            <div className="pt-3">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Criar Conta e Publicar Meu Portfólio
              </Link>
            </div>
          </TiltSurface>
        ) : hubPortfolios.length === 0 ? (
          <div className="p-12 rounded-3xl ag-glass text-center space-y-3">
            <p className="text-base font-bold text-white">
              Nenhum profissional encontrado com os filtros selecionados.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <StaggerRevealGrid className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            {hubPortfolios.map((prof) => {
              const avail = getAvailabilityMeta(prof.availabilityStatus);
              const topProject =
                prof.projects.find((p) => p.isFeatured && p.isVisible) ||
                prof.projects.find((p) => p.isVisible);
              const isMyPortfolio = currentUser?.portfolioId === prof.id;

              return (
                <TiltSurface
                  key={prof.id}
                  maxTilt={4.5}
                  glareColor={`${prof.theme.primaryColor}24`}
                  className="rounded-3xl ag-glass-elevated overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Accent Line matching developer's chosen theme */}
                  <div
                    className="h-1 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${prof.theme.primaryColor}, ${prof.theme.accentColor})`,
                    }}
                  />

                  <div className="p-6 space-y-5 flex-1">
                    {/* Top Row: Availability Badge + Theme Template Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${avail.badgeBg}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${avail.dotColor} ${
                            avail.pulse ? 'animate-pulse' : ''
                          }`}
                        />
                        {avail.label}
                      </span>

                      <div className="flex items-center gap-2">
                        {isMyPortfolio && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Sua Conta
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-black/50 text-zinc-300 border border-white/10">
                          Tema: {prof.theme.template}
                        </span>
                      </div>
                    </div>

                    {/* Identity Header */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={prof.avatarUrl}
                          alt={prof.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 shadow-lg"
                          style={{ borderColor: prof.theme.primaryColor }}
                        />
                        {prof.verifiedGithub && (
                          <div
                            title="GitHub Verificado"
                            className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-blue-600 text-white shadow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/p/${prof.slug}`}
                            className="text-lg sm:text-xl font-extrabold text-white hover:text-blue-400 transition truncate"
                          >
                            {prof.name}
                          </Link>
                          <span
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                            style={{
                              backgroundColor: `${prof.theme.primaryColor}25`,
                              color: prof.theme.primaryColor,
                            }}
                          >
                            {prof.roleCategory}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium text-zinc-200 mt-1 line-clamp-1">
                          {prof.headline}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400">
                          <span className="font-semibold text-zinc-200">
                            {prof.seniority} ({prof.yearsOfExperience} anos)
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-zinc-500" />
                            {prof.location}
                          </span>
                          <span>•</span>
                          <span>{prof.preferredModalities.join('/')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Short Bio */}
                    <p className="text-xs text-zinc-300/80 line-clamp-2 leading-relaxed">
                      {prof.shortBio}
                    </p>

                    {/* Recruiter Key Metrics Bar */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/45 border border-white/10 text-center">
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {prof.githubStats.totalStars}
                        </div>
                        <div className="text-[10px] text-zinc-400">GitHub Stars</div>
                      </div>
                      <div className="border-x border-white/10">
                        <div className="text-xs font-extrabold text-white">
                          {prof.projects.filter((p) => p.isVisible).length} Cases
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {prof.githubStats.publicRepos} Repos Públicos
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-400 truncate px-1">
                          {prof.contractTypes.slice(0, 2).join(' / ')}
                        </div>
                        <div className="text-[10px] text-zinc-400">Contratação</div>
                      </div>
                    </div>

                    {/* Top Skills Pills */}
                    {prof.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {prof.skills.slice(0, 6).map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-semibold text-zinc-200"
                          >
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Featured Project Mini Case-Study Inside Hub Card */}
                    {topProject && (
                      <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                          <span className="font-bold text-zinc-200 flex items-center gap-1.5 truncate">
                            <Layers
                              className="w-3.5 h-3.5 shrink-0"
                              style={{ color: prof.theme.primaryColor }}
                            />
                            Case em Destaque: {topProject.title}
                          </span>
                          {topProject.isFromGithub && (
                            <span className="text-zinc-400 flex items-center gap-1 shrink-0">
                              <Github className="w-3 h-3" />
                              Sync
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-emerald-300 font-medium flex items-start gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{topProject.impactMetrics}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-4 bg-black/50 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                      <button
                        type="button"
                        onClick={() => incrementLike(prof.id)}
                        className="inline-flex items-center gap-1 hover:text-rose-400 transition cursor-pointer"
                        title="Recomendar Portfólio"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                        <span>{prof.likesCount}</span>
                      </button>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{prof.viewsCount}</span>
                      </span>
                      {isMyPortfolio && (
                        <button
                          type="button"
                          onClick={() => router.push('/editor')}
                          className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer ml-1 font-semibold"
                        >
                          Editar Meu Portfólio
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickViewProfile(prof)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-100 text-xs font-semibold transition cursor-pointer"
                      >
                        Resumo Recrutador
                      </button>

                      <Link
                        href={`/p/${prof.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition hover:opacity-90"
                        style={{ backgroundColor: prof.theme.primaryColor }}
                      >
                        <span>Ver Portfólio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </TiltSurface>
              );
            })}
          </StaggerRevealGrid>
        )}
      </main>

      {/* Recruiter Quick-View Dossier Modal */}
      {quickViewProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl ag-glass-elevated rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-black/60 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={quickViewProfile.avatarUrl}
                  alt={quickViewProfile.name}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Dossiê Rápido para Recrutadores — {quickViewProfile.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {quickViewProfile.seniority} • {quickViewProfile.roleCategory} •{' '}
                    {quickViewProfile.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickViewProfile(null)}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Recruiter Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">
                    Disponibilidade
                  </div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">
                    {getAvailabilityMeta(quickViewProfile.availabilityStatus).shortLabel}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">
                    Modalidade & Contrato
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {quickViewProfile.preferredModalities.join('/')} •{' '}
                    {quickViewProfile.contractTypes.join('/')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">
                    Pretensão / Taxa
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    {quickViewProfile.compensationExpectation || 'A combinar'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/50 border border-white/10">
                  <div className="text-[10px] uppercase text-zinc-500 font-bold">
                    Idiomas
                  </div>
                  <div className="text-xs font-bold text-white mt-1 truncate">
                    {quickViewProfile.languages.join(', ')}
                  </div>
                </div>
              </div>

              {/* Projects & Case Studies Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Principais Cases & Repositórios Verificados
                </h4>
                {quickViewProfile.projects.filter((p) => p.isVisible).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">
                    Nenhum projeto cadastrado ainda neste portfólio.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {quickViewProfile.projects
                      .filter((p) => p.isVisible)
                      .map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-white">
                              {proj.title}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {proj.isFromGithub
                                ? `★ ${proj.starsCount} stars no GitHub`
                                : 'Case Corporativo'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            <strong className="text-zinc-200">Problema:</strong>{' '}
                            {proj.problemStatement}
                          </p>
                          <p className="text-xs text-zinc-400">
                            <strong className="text-zinc-200">Solução:</strong>{' '}
                            {proj.solutionDetails}
                          </p>
                          <p className="text-xs text-emerald-400 font-medium">
                            <strong>Impacto:</strong> {proj.impactMetrics}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Direct Contact & Resume Footer */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {quickViewProfile.whatsapp && (
                    <a
                      href={`https://wa.me/${quickViewProfile.whatsapp.replace(
                        /\D/g,
                        ''
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Chamar no WhatsApp
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const prof = quickViewProfile;
                      setQuickViewProfile(null);
                      setResumeModalProfile(prof);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Abrir Currículo ATS / PDF
                  </button>
                </div>

                <Link
                  href={`/p/${quickViewProfile.slug}`}
                  onClick={() => setQuickViewProfile(null)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  <span>Abrir Portfólio Completo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Resume Modal */}
      {resumeModalProfile && (
        <PrintableResumeModal
          profile={resumeModalProfile}
          isOpen={!!resumeModalProfile}
          onClose={() => setResumeModalProfile(null)}
        />
      )}
    </div>
  );
}
