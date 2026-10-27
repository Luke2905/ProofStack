'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { fetchGithubUserAndRepos } from '@/lib/github';
import { COVER_PRESETS } from '@/lib/utils';
import {
  AvailabilityStatus,
  ContractType,
  PortfolioSectionId,
  PortfolioTemplate,
  ProjectItem,
  RoleCategory,
  SeniorityLevel,
  SkillCategory,
  WorkModality,
} from '@/types/portfolio';
import { PortfolioRenderer } from '@/components/portfolio/PortfolioRenderer';
import { SharePublishModal } from '@/components/portfolio/SharePublishModal';
import { EditProfileModal } from '@/components/portfolio/EditProfileModal';
import { LinkedInImportModal } from '@/components/portfolio/LinkedInImportModal';
import { ThemeCustomizer } from '@/components/editor/ThemeCustomizer';
import {
  Github,
  FolderGit2,
  UserCheck,
  Palette,
  Briefcase,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Star,
  GitFork,
  Check,
  Circle,
  Monitor,
  Smartphone,
  Tablet,
  Share2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Lock,
  Globe,
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Cyber Blue & Emerald', primary: '#3b82f6', accent: '#10b981' },
  { name: 'Linear Violet & Pink', primary: '#8b5cf6', accent: '#ec4899' },
  { name: 'Hacker Terminal Green', primary: '#10b981', accent: '#06b6d4' },
  { name: 'Amber Gold & Blue', primary: '#f59e0b', accent: '#3b82f6' },
  { name: 'Rose Crimson & Violet', primary: '#f43f5e', accent: '#a855f7' },
  { name: 'Cyan Ocean & Indigo', primary: '#06b6d4', accent: '#6366f1' },
];

const SECTION_LABELS: Record<PortfolioSectionId, string> = {
  hero: 'Hero & Status de Contratação',
  recruiter_highlights: 'Métricas Rápidas para Recrutadores',
  projects: 'Projetos, GitHub & Case Studies',
  skills: 'Matriz de Competências & Stack',
  experience: 'Trajetória & Experiência Profissional',
  contact: 'Chamada Final de Contato (CTA)',
};

export function PortfolioEditorStudio() {
  const {
    currentUser,
    getActivePortfolio,
    updateActiveProfile,
    updateTheme,
    toggleSectionVisibility,
    moveSectionOrder,
    githubCachedRepos,
    githubConnectedUser,
    setGithubData,
    applyGithubUserProfileToActive,
    importGithubRepoToActive,
    addProject,
    updateProject,
    deleteProject,
    moveProjectOrder,
    addSkill,
    deleteSkill,
    addExperience,
    deleteExperience,
  } = usePortfolioStore();

  const profile = getActivePortfolio();

  const [activeTab, setActiveTab] = useState<
    'github' | 'projects' | 'profile' | 'career' | 'theme'
  >('github');

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [mobilePane, setMobilePane] = useState<'controls' | 'preview'>('controls');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  // GitHub API State
  const [ghUsernameInput, setGhUsernameInput] = useState(
    profile?.githubUsername || ''
  );
  const [ghTokenInput, setGhTokenInput] = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState<string | null>(null);
  const [ghSuccessMsg, setGhSuccessMsg] = useState<string | null>(null);
  const [repoSearchFilter, setRepoSearchFilter] = useState('');

  // Project Modal State (Create / Edit Manual or GitHub Project)
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projForm, setProjForm] = useState({
    title: '',
    subtitle: '',
    problemStatement: '',
    solutionDetails: '',
    impactMetrics: '',
    coverImageUrl: COVER_PRESETS[0].url,
    demoUrl: '',
    repoUrl: '',
    techStackInput: 'React, TypeScript, Node.js, PostgreSQL',
    role: 'Engenheiro Responsável',
    clientOrCompany: 'Projeto Próprio / Cliente',
    year: '2026',
    isFeatured: true,
  });

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Frontend');
  const [newSkillLevel, setNewSkillLevel] = useState<
    'Avançado / Especialista' | 'Proficiência Sólida' | 'Prático'
  >('Avançado / Especialista');
  const [newSkillYears, setNewSkillYears] = useState(4);

  // New Experience Form State
  const [newExpCompany, setNewExpCompany] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpLocation, setNewExpLocation] = useState('Remoto');
  const [newExpStart, setNewExpStart] = useState('Jan 2024');
  const [newExpEnd, setNewExpEnd] = useState('Atual');
  const [newExpCurrent, setNewExpCurrent] = useState(true);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAchievements, setNewExpAchievements] = useState('');
  const [newExpTechs, setNewExpTechs] = useState('TypeScript, React, Node.js');

  const handleFetchGithub = async (usernameOverride?: string) => {
    const targetUser = usernameOverride ?? ghUsernameInput;
    setGhLoading(true);
    setGhError(null);
    setGhSuccessMsg(null);
    try {
      const { user, repos } = await fetchGithubUserAndRepos(targetUser, ghTokenInput);
      setGithubData(user, repos);
      setGhSuccessMsg(
        `Conectado a @${user.login}! ${repos.length} repositórios carregados da API do GitHub.`
      );
    } catch (err: unknown) {
      setGhError(
        err instanceof Error ? err.message : 'Erro ao conectar com a API do GitHub.'
      );
    } finally {
      setGhLoading(false);
    }
  };

  const openCreateProjectModal = () => {
    setEditingProject(null);
    setProjForm({
      title: '',
      subtitle: '',
      problemStatement: '',
      solutionDetails: '',
      impactMetrics: '',
      coverImageUrl: COVER_PRESETS[0].url,
      demoUrl: '',
      repoUrl: '',
      techStackInput: 'Next.js, TypeScript, Node.js, PostgreSQL',
      role: 'Tech Lead / Fullstack',
      clientOrCompany: 'Projeto Corporativo',
      year: '2026',
      isFeatured: true,
    });
    setIsCreatingProject(true);
  };

  const openEditProjectModal = (proj: ProjectItem) => {
    setEditingProject(proj);
    setProjForm({
      title: proj.title,
      subtitle: proj.subtitle,
      problemStatement: proj.problemStatement,
      solutionDetails: proj.solutionDetails,
      impactMetrics: proj.impactMetrics,
      coverImageUrl: proj.coverImageUrl,
      demoUrl: proj.demoUrl || '',
      repoUrl: proj.repoUrl || '',
      techStackInput: proj.techStack.join(', '),
      role: proj.role || '',
      clientOrCompany: proj.clientOrCompany || '',
      year: proj.year || '2026',
      isFeatured: proj.isFeatured,
    });
    setIsCreatingProject(true);
  };

  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    const techArray = projForm.techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProject) {
      updateProject(editingProject.id, {
        title: projForm.title,
        subtitle: projForm.subtitle,
        problemStatement: projForm.problemStatement,
        solutionDetails: projForm.solutionDetails,
        impactMetrics: projForm.impactMetrics,
        coverImageUrl: projForm.coverImageUrl,
        demoUrl: projForm.demoUrl || undefined,
        repoUrl: projForm.repoUrl || undefined,
        techStack: techArray,
        role: projForm.role,
        clientOrCompany: projForm.clientOrCompany,
        year: projForm.year,
        isFeatured: projForm.isFeatured,
      });
    } else {
      addProject({
        title: projForm.title,
        subtitle: projForm.subtitle,
        problemStatement: projForm.problemStatement,
        solutionDetails: projForm.solutionDetails,
        impactMetrics: projForm.impactMetrics,
        coverImageUrl: projForm.coverImageUrl,
        demoUrl: projForm.demoUrl || undefined,
        repoUrl: projForm.repoUrl || undefined,
        techStack: techArray.length > 0 ? techArray : ['TypeScript'],
        isFromGithub: false,
        starsCount: 0,
        forksCount: 0,
        role: projForm.role,
        clientOrCompany: projForm.clientOrCompany,
        year: projForm.year,
        isFeatured: projForm.isFeatured,
        isVisible: true,
      });
    }
    setIsCreatingProject(false);
    setEditingProject(null);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
      years: Number(newSkillYears) || 1,
    });
    setNewSkillName('');
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpCompany.trim() || !newExpRole.trim()) return;
    const achList = newExpAchievements
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const techList = newExpTechs
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addExperience({
      company: newExpCompany.trim(),
      role: newExpRole.trim(),
      location: newExpLocation.trim(),
      startDate: newExpStart.trim(),
      endDate: newExpCurrent ? 'Atual' : newExpEnd.trim(),
      isCurrent: newExpCurrent,
      description: newExpDesc.trim(),
      achievements: achList,
      technologies: techList,
    });

    setNewExpCompany('');
    setNewExpRole('');
    setNewExpDesc('');
    setNewExpAchievements('');
  };

  if (!currentUser || !profile) {
    return (
      <div className="min-h-[80vh] bg-[#09090b] text-zinc-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">
            Acesse sua Conta para Editar seu Portfólio
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Para conectar seu GitHub via API, cadastrar projetos e personalizar o tema visual do seu portfólio, faça login ou crie sua conta.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/auth"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition"
            >
              Entrar ou Criar Conta
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
            >
              Voltar ao Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleModality = (mod: WorkModality) => {
    const exists = profile.preferredModalities.includes(mod);
    const next = exists
      ? profile.preferredModalities.filter((m) => m !== mod)
      : [...profile.preferredModalities, mod];
    if (next.length > 0) {
      updateActiveProfile({ preferredModalities: next });
    }
  };

  const toggleContract = (ct: ContractType) => {
    const exists = profile.contractTypes.includes(ct);
    const next = exists
      ? profile.contractTypes.filter((c) => c !== ct)
      : [...profile.contractTypes, ct];
    if (next.length > 0) {
      updateActiveProfile({ contractTypes: next });
    }
  };

  const filteredGithubRepos = githubCachedRepos.filter((r) => {
    if (!repoSearchFilter.trim()) return true;
    const q = repoSearchFilter.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      (r.language && r.language.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] ag-spatial-bg text-zinc-100 flex flex-col lg:flex-row">
      {/* MOBILE MODE SWITCHER (Visible on screens < lg) */}
      <div className="flex lg:hidden items-center justify-between gap-2 px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 sticky top-16 z-30">
        <div className="grid grid-cols-2 gap-1.5 flex-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setMobilePane('controls')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobilePane === 'controls'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Editar Portfólio
          </button>
          <button
            type="button"
            onClick={() => setMobilePane('preview')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
              mobilePane === 'preview'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Ver Preview Ao Vivo
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsShareOpen(true)}
          className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shrink-0 cursor-pointer"
        >
          Link
        </button>
      </div>

      {/* LEFT PANE: CONTROL STUDIO */}
      <aside
        className={`w-full lg:w-[480px] xl:w-[540px] shrink-0 border-r border-white/10 ag-glass flex-col lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 ${
          mobilePane === 'preview' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Studio Header & Navigation Tabs */}
        <div className="p-3 bg-zinc-950 border-b border-zinc-800 space-y-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Estúdio do Portfólio
            </span>
            <button
              type="button"
              onClick={() => setIsLinkedInModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a66c2]/20 hover:bg-[#0a66c2]/30 border border-[#0a66c2]/40 text-blue-300 text-[11px] font-bold transition cursor-pointer"
              title="Importe experiências e competências direto do PDF do seu LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>Importar LinkedIn (PDF)</span>
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[
              { id: 'github', label: 'GitHub API', icon: Github },
              { id: 'projects', label: 'Projetos', icon: FolderGit2 },
              { id: 'profile', label: 'Recrutador', icon: UserCheck },
              { id: 'career', label: 'Stack & CV', icon: Briefcase },
              { id: 'theme', label: 'Aparência', icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: GITHUB API INTEGRATION */}
          {activeTab === 'github' && (
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Github className="w-5 h-5 text-blue-400" />
                  Integração Direta com GitHub API
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Busque qualquer usuário do GitHub em tempo real para puxar repositórios, estrelas, linguagens e converter em projetos do portfólio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Username do GitHub
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ghUsernameInput}
                      onChange={(e) => setGhUsernameInput(e.target.value)}
                      placeholder="Ex: torvalds, diego3g, vercel..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      disabled={ghLoading}
                      onClick={() => handleFetchGithub()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${ghLoading ? 'animate-spin' : ''}`}
                      />
                      {ghLoading ? 'Buscando...' : 'Puxar Repos'}
                    </button>
                  </div>
                </div>

                {/* Quick Preset GitHub Accounts for Testing */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-zinc-500">Testar rápido:</span>
                  {['vercel', 'diego3g', 'filipedeschamps', 'shadcn-ui', 'facebook'].map(
                    (preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setGhUsernameInput(preset);
                          handleFetchGithub(preset);
                        }}
                        className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 cursor-pointer"
                      >
                        @{preset}
                      </button>
                    )
                  )}
                </div>

                {/* Optional GitHub Token */}
                <details className="text-xs text-zinc-400 pt-1">
                  <summary className="cursor-pointer hover:text-zinc-200">
                    Token Pessoal Opcional (para evitar rate-limit ou ler repos privados)
                  </summary>
                  <input
                    type="password"
                    value={ghTokenInput}
                    onChange={(e) => setGhTokenInput(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="mt-2 w-full px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
                  />
                </details>

                {ghError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{ghError}</span>
                  </div>
                )}

                {ghSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{ghSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Connected GitHub User Summary */}
              {githubConnectedUser && (
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={githubConnectedUser.avatar_url}
                        alt={githubConnectedUser.login}
                        className="w-12 h-12 rounded-xl object-cover border border-blue-400/40"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {githubConnectedUser.name || githubConnectedUser.login}
                        </div>
                        <div className="text-xs text-blue-300 font-mono">
                          @{githubConnectedUser.login} • {githubConnectedUser.public_repos}{' '}
                          repos • {githubConnectedUser.followers} seguidores
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        applyGithubUserProfileToActive(
                          githubConnectedUser,
                          githubCachedRepos
                        );
                        setGhSuccessMsg(
                          'Dados do perfil e estatísticas do GitHub aplicados ao portfólio!'
                        );
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shrink-0 cursor-pointer"
                    >
                      Aplicar ao Perfil
                    </button>
                  </div>
                </div>
              )}

              {/* Repositories List for 1-Click Import */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Repositórios Encontrados ({filteredGithubRepos.length})
                  </h3>
                  {githubCachedRepos.length > 0 && (
                    <input
                      type="text"
                      value={repoSearchFilter}
                      onChange={(e) => setRepoSearchFilter(e.target.value)}
                      placeholder="Filtrar repo..."
                      className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white"
                    />
                  )}
                </div>

                {githubCachedRepos.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center space-y-2">
                    <Github className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs text-zinc-400">
                      Clique em <strong>&quot;Puxar Repos&quot;</strong> acima para carregar repositórios reais da API do GitHub e importá-los com 1 clique.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {filteredGithubRepos.map((repo) => {
                      const alreadyImported = profile.projects.some(
                        (p) => p.githubRepoId === repo.id || p.id === `gh-${repo.id}`
                      );

                      return (
                        <div
                          key={repo.id}
                          className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white truncate">
                                {repo.name}
                              </span>
                              {repo.language && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-blue-400 border border-zinc-800">
                                  {repo.language}
                                </span>
                              )}
                              <span className="flex items-center gap-0.5 text-[11px] text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {repo.stargazers_count}
                              </span>
                              <span className="flex items-center gap-0.5 text-[11px] text-zinc-400">
                                <GitFork className="w-3 h-3" />
                                {repo.forks_count}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {repo.description || 'Sem descrição no GitHub.'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => importGithubRepoToActive(repo)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                              alreadyImported
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                          >
                            {alreadyImported ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Importado
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Importar
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PROJECTS & CASE STUDIES */}
          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white">
                    Projetos & Case Studies ({profile.projects.length})
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Adicione projetos manualmente ou edite os repositórios importados do GitHub
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCreateProjectModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Novo Projeto Manual
                </button>
              </div>

              <div className="space-y-3">
                {profile.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className={`p-4 rounded-2xl border transition space-y-3 ${
                      proj.isVisible
                        ? 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white truncate">
                            {proj.title}
                          </span>
                          {proj.isFromGithub ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                              GitHub API
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              Manual / Case
                            </span>
                          )}
                          {proj.isFeatured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                              ★ Destaque
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {proj.subtitle}
                        </p>
                      </div>

                      {/* Order & Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveProjectOrder(proj.id, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 cursor-pointer"
                          title="Subir posição"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProjectOrder(proj.id, 'down')}
                          disabled={idx === profile.projects.length - 1}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 cursor-pointer"
                          title="Descer posição"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateProject(proj.id, { isVisible: !proj.isVisible })
                          }
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                          title={proj.isVisible ? 'Ocultar' : 'Mostrar'}
                        >
                          {proj.isVisible ? (
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditProjectModal(proj)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-blue-400 cursor-pointer"
                          title="Editar Case Study"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProject(proj.id)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 text-rose-400 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[11px] text-zinc-400">
                      <button
                        type="button"
                        onClick={() =>
                          updateProject(proj.id, { isFeatured: !proj.isFeatured })
                        }
                        className="hover:text-white underline cursor-pointer"
                      >
                        {proj.isFeatured
                          ? 'Remover dos Destaques'
                          : 'Marcar como Destaque'}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditProjectModal(proj)}
                        className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                      >
                        Editar Problema / Solução / Impacto →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECRUITER PROFILE INFO */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-400" />
                    Informações do Perfil & Recrutador
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Edite seus dados pessoais, cargo, senioridade e canais de contato
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Abrir Modal Completo
                </button>
              </div>

              {/* Privacy / Visibility Mode Selector */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {profile.showInHub && profile.isPublished ? (
                      <Globe className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-amber-400" />
                    )}
                    Privacidade do Perfil
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">/p/{profile.slug}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateActiveProfile({ isPublished: true, showInHub: true })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      profile.isPublished && profile.showInHub
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      Público no Hub
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Visível no diretório e buscas
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateActiveProfile({ isPublished: true, showInHub: false })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      profile.isPublished && !profile.showInHub
                        ? 'bg-amber-500/10 border-amber-500/40 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Privado (Só Link)
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Oculto no Hub; abre só com link
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateActiveProfile({ isPublished: false, showInHub: false })}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      !profile.isPublished
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                      Rascunho Offline
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Visível apenas para você
                    </p>
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Nome Profissional
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => updateActiveProfile({ name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Slug da URL Pública (/p/slug)
                    </label>
                    <input
                      type="text"
                      value={profile.slug}
                      onChange={(e) =>
                        updateActiveProfile({
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-blue-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Headline / Cargo & Especialidade
                  </label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => updateActiveProfile({ headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Área Principal
                    </label>
                    <select
                      value={profile.roleCategory}
                      onChange={(e) =>
                        updateActiveProfile({
                          roleCategory: e.target.value as RoleCategory,
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    >
                      {[
                        'Fullstack',
                        'Frontend',
                        'Backend',
                        'Mobile',
                        'Dados & IA',
                        'DevOps & Cloud',
                        'UI/UX & Product',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Senioridade
                    </label>
                    <select
                      value={profile.seniority}
                      onChange={(e) =>
                        updateActiveProfile({
                          seniority: e.target.value as SeniorityLevel,
                        })
                      }
                      className="w-full px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    >
                      {[
                        'Júnior',
                        'Pleno',
                        'Sênior',
                        'Tech Lead / Staff',
                        'Principal / Arquitetura',
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Anos Exp.
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={profile.yearsOfExperience}
                      onChange={(e) =>
                        updateActiveProfile({
                          yearsOfExperience: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Status de Disponibilidade para Empresas
                  </label>
                  <select
                    value={profile.availabilityStatus}
                    onChange={(e) =>
                      updateActiveProfile({
                        availabilityStatus: e.target.value as AvailabilityStatus,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-semibold"
                  >
                    <option value="available_now">
                      Disponível Imediatamente (Ready to Hire)
                    </option>
                    <option value="open_to_offers">
                      Aberto a Propostas
                    </option>
                    <option value="freelance_only">
                      Disponível para Freelance / Consultoria
                    </option>
                    <option value="employed_networking">
                      Empregado (Apenas Networking)
                    </option>
                  </select>
                </div>

                {/* Modalities & Contracts */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Modalidades Aceitas
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Remoto', 'Híbrido', 'Presencial'] as WorkModality[]).map(
                      (mod) => {
                        const active = profile.preferredModalities.includes(mod);
                        return (
                          <button
                            key={mod}
                            type="button"
                            onClick={() => toggleModality(mod)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                              active
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
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
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
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
                      const active = profile.contractTypes.includes(ct);
                      return (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => toggleContract(ct)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            active
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                          }`}
                        >
                          {ct}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Resumo Executivo (Bio Curta)
                  </label>
                  <textarea
                    rows={3}
                    value={profile.shortBio}
                    onChange={(e) => updateActiveProfile({ shortBio: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Localização / Fuso
                    </label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={(e) => updateActiveProfile({ location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      Pretensão / Faixa Salarial
                    </label>
                    <input
                      type="text"
                      value={profile.compensationExpectation || ''}
                      onChange={(e) =>
                        updateActiveProfile({ compensationExpectation: e.target.value })
                      }
                      placeholder="Ex: R$ 15k - 18k / USD 4k"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      WhatsApp (com DDI, ex: 5511999999999)
                    </label>
                    <input
                      type="text"
                      value={profile.whatsapp || ''}
                      onChange={(e) => updateActiveProfile({ whatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateActiveProfile({ email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    URL da Foto de Perfil (Avatar)
                  </label>
                  <input
                    type="text"
                    value={profile.avatarUrl}
                    onChange={(e) => updateActiveProfile({ avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & CAREER EXPERIENCE */}
          {activeTab === 'career' && (
            <div className="space-y-6">
              {/* LinkedIn Quick Import Banner */}
              <div className="p-4 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0a66c2]/20 border border-[#0a66c2]/40 flex items-center justify-center text-[#0a66c2] shrink-0">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      Poupe tempo com o LinkedIn
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Importe todas as suas experiências e competências via PDF oficial do LinkedIn.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsLinkedInModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0a66c2] hover:bg-[#095196] text-white text-xs font-bold  transition cursor-pointer shrink-0"
                >
                  Importar PDF
                </button>
              </div>

              {/* Skills Manager */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white">
                  Matriz de Competências ({profile.skills.length})
                </h3>

                <form onSubmit={handleAddSkill} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="Ex: Next.js, Kubernetes, Go..."
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                    <select
                      value={newSkillCategory}
                      onChange={(e) =>
                        setNewSkillCategory(e.target.value as SkillCategory)
                      }
                      className="px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    >
                      {[
                        'Frontend',
                        'Backend',
                        'Banco de Dados',
                        'DevOps & Cloud',
                        'Mobile',
                        'Arquitetura & Ferramentas',
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={newSkillLevel}
                      onChange={(e) =>
                        setNewSkillLevel(e.target.value as typeof newSkillLevel)
                      }
                      className="flex-1 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    >
                      <option value="Avançado / Especialista">
                        Avançado / Especialista
                      </option>
                      <option value="Proficiência Sólida">Proficiência Sólida</option>
                      <option value="Prático">Prático</option>
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={newSkillYears}
                      onChange={(e) => setNewSkillYears(Number(e.target.value))}
                      className="w-20 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                      title="Anos de experiência"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                    >
                      + Adicionar
                    </button>
                  </div>
                </form>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {profile.skills.map((sk) => (
                    <span
                      key={sk.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    >
                      <span>
                        {sk.name} <strong className="text-blue-400">({sk.years}a)</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteSkill(sk.id)}
                        className="text-zinc-500 hover:text-rose-400 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Manager */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white">
                  Experiência Profissional ({profile.experiences.length})
                </h3>

                <form onSubmit={handleAddExperience} className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newExpRole}
                      onChange={(e) => setNewExpRole(e.target.value)}
                      placeholder="Cargo (Ex: Senior Backend Dev)"
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      value={newExpCompany}
                      onChange={(e) => setNewExpCompany(e.target.value)}
                      placeholder="Empresa"
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={newExpStart}
                      onChange={(e) => setNewExpStart(e.target.value)}
                      placeholder="Início (Jan 2023)"
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={newExpEnd}
                      onChange={(e) => setNewExpEnd(e.target.value)}
                      disabled={newExpCurrent}
                      placeholder="Fim (Dez 2025)"
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white disabled:opacity-50"
                    />
                    <label className="flex items-center gap-1.5 text-xs text-zinc-300 px-2">
                      <input
                        type="checkbox"
                        checked={newExpCurrent}
                        onChange={(e) => setNewExpCurrent(e.target.checked)}
                      />
                      Atual
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    placeholder="Resumo das responsabilidades..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                  <textarea
                    rows={2}
                    value={newExpAchievements}
                    onChange={(e) => setNewExpAchievements(e.target.value)}
                    placeholder="Principais conquistas (1 por linha)..."
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                  >
                    + Adicionar Experiência ao Portfólio
                  </button>
                </form>

                <div className="space-y-2 pt-2">
                  {profile.experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {exp.role} • {exp.company}
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {exp.startDate} — {exp.isCurrent ? 'Atual' : exp.endDate}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteExperience(exp.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APARÊNCIA */}
          {activeTab === 'theme' && <ThemeCustomizer />}
        </div>
      </aside>

      {/* RIGHT PANE: INTERACTIVE LIVE PREVIEW */}
      <div
        className={`flex-1 flex-col min-w-0 bg-zinc-950 ${
          mobilePane === 'controls' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Preview Top Toolbar */}
        <div className="sticky top-16 z-20 px-4 sm:px-6 py-3 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Preview Ao Vivo
            </span>
            <span className="text-xs text-zinc-600 hidden sm:inline">|</span>
            {/* 1-Click Private / Public Toggle Pill */}
            <button
              type="button"
              onClick={() =>
                updateActiveProfile({
                  isPublished: true,
                  showInHub: !profile.showInHub,
                })
              }
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${
                profile.showInHub && profile.isPublished
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
              }`}
              title="Clique para alternar entre Público no Hub e Perfil Privado (Somente com Link)"
            >
              {profile.showInHub && profile.isPublished ? (
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
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Desktop"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Visualização Mobile (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </button>
          </div>

          {/* Publish & Open Link Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/p/${profile.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Tela Cheia
            </Link>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Privacidade & Link
            </button>
          </div>
        </div>

        {/* Live Canvas Frame */}
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto flex justify-center ag-spatial-bg">
          <div
            className={`transition-all duration-300 rounded-3xl overflow-hidden ag-glass-elevated max-w-full ${
              viewport === 'mobile'
                ? 'w-[390px]'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-full'
            }`}
          >
            <PortfolioRenderer profile={profile} isPreview />
          </div>
        </div>
      </div>

      {/* Modal for Creating / Editing a Project Case Study */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProjectForm}
            className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                {editingProject
                  ? `Editar Projeto / Case Study: ${editingProject.title}`
                  : 'Adicionar Novo Projeto & Case Study'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Título do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={projForm.title}
                  onChange={(e) =>
                    setProjForm({ ...projForm, title: e.target.value })
                  }
                  placeholder="Ex: Sistema de Pagamentos Pix em Tempo Real"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Subtítulo Resumido *
                </label>
                <input
                  type="text"
                  required
                  value={projForm.subtitle}
                  onChange={(e) =>
                    setProjForm({ ...projForm, subtitle: e.target.value })
                  }
                  placeholder="Ex: Plataforma SaaS B2B de alta disponibilidade"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            {/* Structured Case Study Fields for Companies */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Estrutura de Case Study (O que Recrutadores Avaliam)
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  1. Problema / Desafio de Negócio
                </label>
                <textarea
                  rows={2}
                  required
                  value={projForm.problemStatement}
                  onChange={(e) =>
                    setProjForm({ ...projForm, problemStatement: e.target.value })
                  }
                  placeholder="Qual dor real o sistema resolvia? Qual era o gargalo técnico antes?"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  2. Solução Técnica & Decisões de Arquitetura
                </label>
                <textarea
                  rows={2}
                  required
                  value={projForm.solutionDetails}
                  onChange={(e) =>
                    setProjForm({ ...projForm, solutionDetails: e.target.value })
                  }
                  placeholder="Como você arquitetou a solução? Quais padrões, bancos e integrações utilizou?"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  3. Métricas de Impacto & Resultados Alcançados
                </label>
                <input
                  type="text"
                  required
                  value={projForm.impactMetrics}
                  onChange={(e) =>
                    setProjForm({ ...projForm, impactMetrics: e.target.value })
                  }
                  placeholder="Ex: Redução de 65% na latência • +25.000 usuários ativos • Zero downtime"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-emerald-500/40 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Seu Papel (Role)
                </label>
                <input
                  type="text"
                  value={projForm.role}
                  onChange={(e) =>
                    setProjForm({ ...projForm, role: e.target.value })
                  }
                  placeholder="Ex: Tech Lead / Fullstack"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Empresa / Cliente
                </label>
                <input
                  type="text"
                  value={projForm.clientOrCompany}
                  onChange={(e) =>
                    setProjForm({ ...projForm, clientOrCompany: e.target.value })
                  }
                  placeholder="Ex: Fintech X / Open Source"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ano
                </label>
                <input
                  type="text"
                  value={projForm.year}
                  onChange={(e) =>
                    setProjForm({ ...projForm, year: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tecnologias Utilizadas (separadas por vírgula)
              </label>
              <input
                type="text"
                value={projForm.techStackInput}
                onChange={(e) =>
                  setProjForm({ ...projForm, techStackInput: e.target.value })
                }
                placeholder="React, Next.js, Node.js, PostgreSQL, Docker, AWS"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL da Demo ao Vivo (Opcional)
                </label>
                <input
                  type="url"
                  value={projForm.demoUrl}
                  onChange={(e) =>
                    setProjForm({ ...projForm, demoUrl: e.target.value })
                  }
                  placeholder="https://meu-projeto.vercel.app"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  URL do Repositório GitHub (Opcional)
                </label>
                <input
                  type="url"
                  value={projForm.repoUrl}
                  onChange={(e) =>
                    setProjForm({ ...projForm, repoUrl: e.target.value })
                  }
                  placeholder="https://github.com/usuario/repo"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Cover Image Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Imagem de Capa do Projeto (URL ou Presets Rápidos)
              </label>
              <input
                type="text"
                value={projForm.coverImageUrl}
                onChange={(e) =>
                  setProjForm({ ...projForm, coverImageUrl: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono mb-2"
              />
              <div className="flex flex-wrap gap-1.5">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setProjForm({ ...projForm, coverImageUrl: preset.url })
                    }
                    className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={projForm.isFeatured}
                  onChange={(e) =>
                    setProjForm({ ...projForm, isFeatured: e.target.checked })
                  }
                />
                Destacar este projeto no topo do portfólio e no card do Hub
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow cursor-pointer"
                >
                  Salvar Projeto no Portfólio
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Share & Publish Modal */}
      <SharePublishModal
        profile={profile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onUpdateProfile={updateActiveProfile}
      />

      {/* Edit Profile Full Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />

      {/* LinkedIn Import Modal */}
      <LinkedInImportModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
      />
    </div>
  );
}
