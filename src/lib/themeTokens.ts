import {
  ThemeSettings,
  CardRadius,
  LayoutDensity,
  TextScale,
  HeadingStyle,
  ExperienceLayout,
  SkillsLayout,
  ProjectsLayout,
  PortfolioSectionId,
  VisualEffects,
  HeroLayout,
  BackgroundPattern,
  AccentStyle,
} from '@/types/portfolio';

export const THEME_DEFAULTS = {
  effects: 'glow' as VisualEffects,
  heroLayout: 'split' as HeroLayout,
  backgroundPattern: 'mesh' as BackgroundPattern,
  accentStyle: 'solid' as AccentStyle,
  cardRadius: 'soft' as CardRadius,
  density: 'comfortable' as LayoutDensity,
  textScale: 'md' as TextScale,
  headingStyle: 'plain' as HeadingStyle,
  experienceLayout: 'timeline' as ExperienceLayout,
  skillsLayout: 'grid' as SkillsLayout,
  projectsLayout: 'auto' as ProjectsLayout,
  showProjectCovers: true,
};

export const DEFAULT_SECTION_TITLES: Record<PortfolioSectionId, string> = {
  hero: 'Apresentação',
  recruiter_highlights: 'Destaques Profissionais',
  projects: 'Projetos & Cases Técnicos',
  skills: 'Competências & Stack',
  experience: 'Experiência Profissional',
  contact: 'Vamos conversar?',
};

export const DEFAULT_SECTION_SUBTITLES: Record<PortfolioSectionId, string> = {
  hero: '',
  recruiter_highlights: '',
  projects: 'Contexto de negócio, arquitetura aplicada e resultados mensuráveis.',
  skills: 'Tecnologias organizadas por domínio e tempo de atuação prática.',
  experience: 'Histórico profissional, liderança e principais entregas.',
  contact: 'Disponível para entrevistas técnicas, projetos e propostas.',
};

const RADIUS: Record<CardRadius, { card: string; inner: string; chip: string; button: string }> = {
  sharp: { card: 'rounded-lg', inner: 'rounded-md', chip: 'rounded', button: 'rounded-md' },
  soft: { card: 'rounded-2xl', inner: 'rounded-xl', chip: 'rounded-lg', button: 'rounded-xl' },
  round: { card: 'rounded-3xl', inner: 'rounded-2xl', chip: 'rounded-full', button: 'rounded-full' },
};

const DENSITY: Record<LayoutDensity, { pad: string; padLg: string; sectionGap: string; itemGap: string }> = {
  compact: {
    pad: 'p-3.5 @sm:p-4',
    padLg: 'p-4 @sm:p-6',
    sectionGap: 'space-y-6 @sm:space-y-8',
    itemGap: 'gap-3',
  },
  comfortable: {
    pad: 'p-4 @sm:p-5',
    padLg: 'p-5 @sm:p-7 @lg:p-8',
    sectionGap: 'space-y-8 @sm:space-y-11',
    itemGap: 'gap-4 @sm:gap-5',
  },
  spacious: {
    pad: 'p-5 @sm:p-7',
    padLg: 'p-6 @sm:p-9 @lg:p-11',
    sectionGap: 'space-y-10 @sm:space-y-14',
    itemGap: 'gap-5 @sm:gap-6',
  },
};

const TEXT: Record<TextScale, { h1: string; h2: string; h3: string; body: string; small: string }> = {
  sm: {
    h1: 'text-xl @sm:text-2xl @md:text-3xl',
    h2: 'text-base @sm:text-lg @md:text-xl',
    h3: 'text-sm @sm:text-base',
    body: 'text-xs @sm:text-[13px]',
    small: 'text-[11px]',
  },
  md: {
    h1: 'text-2xl @sm:text-3xl @md:text-4xl',
    h2: 'text-lg @sm:text-xl @md:text-2xl',
    h3: 'text-base @sm:text-lg',
    body: 'text-[13px] @sm:text-sm',
    small: 'text-[11px] @sm:text-xs',
  },
  lg: {
    h1: 'text-2xl @sm:text-4xl @md:text-5xl',
    h2: 'text-xl @sm:text-2xl @md:text-3xl',
    h3: 'text-base @sm:text-lg @md:text-xl',
    body: 'text-sm @sm:text-base',
    small: 'text-xs @sm:text-sm',
  },
};

export interface ResolvedTheme {
  /** true quando vidro/profundidade/animações sutis estão ativos */
  fx: boolean;
  heroLayout: HeroLayout;
  backgroundPattern: BackgroundPattern;
  accentStyle: AccentStyle;
  customBgColor?: string;
  customSurfaceColor?: string;
  cardRadius: CardRadius;
  density: LayoutDensity;
  textScale: TextScale;
  headingStyle: HeadingStyle;
  experienceLayout: ExperienceLayout;
  skillsLayout: SkillsLayout;
  projectsLayout: ProjectsLayout;
  showProjectCovers: boolean;
  r: (typeof RADIUS)[CardRadius];
  d: (typeof DENSITY)[LayoutDensity];
  t: (typeof TEXT)[TextScale];
  title: (id: PortfolioSectionId) => string;
  subtitle: (id: PortfolioSectionId) => string;
}

/** Resolve configurações opcionais do tema em tokens de classes Tailwind. */
export function resolveTheme(theme: ThemeSettings): ResolvedTheme {
  const cardRadius = theme.cardRadius ?? THEME_DEFAULTS.cardRadius;
  const density = theme.density ?? THEME_DEFAULTS.density;
  const textScale = theme.textScale ?? THEME_DEFAULTS.textScale;

  return {
    fx: (theme.effects ?? THEME_DEFAULTS.effects) === 'glow' && theme.template !== 'terminal',
    heroLayout: theme.heroLayout ?? THEME_DEFAULTS.heroLayout,
    backgroundPattern: theme.backgroundPattern ?? THEME_DEFAULTS.backgroundPattern,
    accentStyle: theme.accentStyle ?? THEME_DEFAULTS.accentStyle,
    customBgColor: theme.customBgColor || undefined,
    customSurfaceColor: theme.customSurfaceColor || undefined,
    cardRadius,
    density,
    textScale,
    headingStyle: theme.headingStyle ?? THEME_DEFAULTS.headingStyle,
    experienceLayout: theme.experienceLayout ?? THEME_DEFAULTS.experienceLayout,
    skillsLayout: theme.skillsLayout ?? THEME_DEFAULTS.skillsLayout,
    projectsLayout: theme.projectsLayout ?? THEME_DEFAULTS.projectsLayout,
    showProjectCovers: theme.showProjectCovers ?? THEME_DEFAULTS.showProjectCovers,
    r: RADIUS[cardRadius],
    d: DENSITY[density],
    t: TEXT[textScale],
    title: (id) => theme.sectionTitles?.[id]?.trim() || DEFAULT_SECTION_TITLES[id],
    subtitle: (id) =>
      theme.sectionSubtitles?.[id]?.trim() || DEFAULT_SECTION_SUBTITLES[id],
  };
}

/** Extrai apenas as propriedades visuais para salvar como um template do usuário */
export function extractTemplateSnapshot(
  theme: ThemeSettings
): Partial<Omit<ThemeSettings, 'savedTemplates'>> {
  return {
    template: theme.template,
    mode: theme.mode,
    primaryColor: theme.primaryColor,
    accentColor: theme.accentColor,
    fontFamily: theme.fontFamily,
    cardStyle: theme.cardStyle,
    effects: theme.effects ?? THEME_DEFAULTS.effects,
    heroLayout: theme.heroLayout ?? THEME_DEFAULTS.heroLayout,
    backgroundPattern: theme.backgroundPattern ?? THEME_DEFAULTS.backgroundPattern,
    accentStyle: theme.accentStyle ?? THEME_DEFAULTS.accentStyle,
    customBgColor: theme.customBgColor,
    customSurfaceColor: theme.customSurfaceColor,
    cardRadius: theme.cardRadius ?? THEME_DEFAULTS.cardRadius,
    density: theme.density ?? THEME_DEFAULTS.density,
    textScale: theme.textScale ?? THEME_DEFAULTS.textScale,
    headingStyle: theme.headingStyle ?? THEME_DEFAULTS.headingStyle,
    experienceLayout: theme.experienceLayout ?? THEME_DEFAULTS.experienceLayout,
    skillsLayout: theme.skillsLayout ?? THEME_DEFAULTS.skillsLayout,
    projectsLayout: theme.projectsLayout ?? THEME_DEFAULTS.projectsLayout,
    showProjectCovers: theme.showProjectCovers ?? THEME_DEFAULTS.showProjectCovers,
    showGithubStats: theme.showGithubStats,
    showImpactHighlights: theme.showImpactHighlights,
    showAvailabilityBanner: theme.showAvailabilityBanner,
  };
}

/** Templates prontos de fábrica: 1 clique aplica identidade visual completa. */
export interface StylePreset {
  id: string;
  name: string;
  category: 'SaaS & Tech' | 'Corporativo' | 'Editorial & Design' | 'Engenharia';
  description: string;
  previewBg: string;
  values: Partial<ThemeSettings>;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'executive-saas',
    name: 'Executive SaaS',
    category: 'SaaS & Tech',
    description: 'Fundo escuro profundo, Bento Grid e estética Linear/Stripe',
    previewBg: '#090b10',
    values: {
      effects: 'glow',
      template: 'bento',
      mode: 'dark',
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      customBgColor: undefined,
      customSurfaceColor: undefined,
      heroLayout: 'split',
      backgroundPattern: 'mesh',
      accentStyle: 'solid',
      fontFamily: 'sans',
      cardStyle: 'glass',
      cardRadius: 'soft',
      density: 'comfortable',
      textScale: 'md',
      headingStyle: 'accent-bar',
      experienceLayout: 'timeline',
      skillsLayout: 'bars',
      projectsLayout: 'auto',
      showProjectCovers: true,
    },
  },
  {
    id: 'corporate-trust',
    name: 'Corporate B2B',
    category: 'Corporativo',
    description: 'Modo claro executivo, azul-confiança e leitura escaneável',
    previewBg: '#f8fafc',
    values: {
      effects: 'glow',
      template: 'recruiter',
      mode: 'light',
      primaryColor: '#1d4ed8',
      accentColor: '#0f766e',
      customBgColor: undefined,
      customSurfaceColor: undefined,
      heroLayout: 'banner',
      backgroundPattern: 'none',
      accentStyle: 'solid',
      fontFamily: 'sans',
      cardStyle: 'bordered',
      cardRadius: 'soft',
      density: 'comfortable',
      textScale: 'md',
      headingStyle: 'plain',
      experienceLayout: 'timeline',
      skillsLayout: 'grid',
      projectsLayout: 'list',
      showProjectCovers: true,
    },
  },
  {
    id: 'linear-minimal',
    name: 'Obsidian Minimal',
    category: 'SaaS & Tech',
    description: 'Contraste alto em grafite puro, cantos retos e foco técnico',
    previewBg: '#09090b',
    values: {
      effects: 'flat',
      template: 'bento',
      mode: 'dark',
      primaryColor: '#6366f1',
      accentColor: '#14b8a6',
      customBgColor: '#09090b',
      customSurfaceColor: '#111114',
      heroLayout: 'minimal',
      backgroundPattern: 'dots',
      accentStyle: 'solid',
      fontFamily: 'sans',
      cardStyle: 'bordered',
      cardRadius: 'sharp',
      density: 'compact',
      textScale: 'sm',
      headingStyle: 'plain',
      experienceLayout: 'timeline',
      skillsLayout: 'tags',
      projectsLayout: 'grid',
      showProjectCovers: true,
    },
  },
  {
    id: 'fintech-emerald',
    name: 'Fintech Carbon',
    category: 'SaaS & Tech',
    description: 'Visual de plataformas financeiras com verde esmeralda e grade sutil',
    previewBg: '#060c0a',
    values: {
      effects: 'glow',
      template: 'bento',
      mode: 'dark',
      primaryColor: '#10b981',
      accentColor: '#06b6d4',
      customBgColor: '#060a09',
      customSurfaceColor: '#0c1311',
      heroLayout: 'split',
      backgroundPattern: 'grid',
      accentStyle: 'gradient',
      fontFamily: 'sans',
      cardStyle: 'glass',
      cardRadius: 'soft',
      density: 'comfortable',
      textScale: 'md',
      headingStyle: 'accent-bar',
      experienceLayout: 'cards',
      skillsLayout: 'bars',
      projectsLayout: 'auto',
      showProjectCovers: true,
    },
  },
  {
    id: 'editorial-serif',
    name: 'Read.cv Editorial',
    category: 'Editorial & Design',
    description: 'Tipografia clássica serifada, centralizado e muito respiro',
    previewBg: '#fafaf9',
    values: {
      effects: 'flat',
      template: 'minimal',
      mode: 'light',
      primaryColor: '#18181b',
      accentColor: '#b45309',
      customBgColor: '#fafaf7',
      customSurfaceColor: '#ffffff',
      heroLayout: 'centered',
      backgroundPattern: 'none',
      accentStyle: 'solid',
      fontFamily: 'editorial',
      cardStyle: 'bordered',
      cardRadius: 'sharp',
      density: 'spacious',
      textScale: 'lg',
      headingStyle: 'underline',
      experienceLayout: 'timeline',
      skillsLayout: 'tags',
      projectsLayout: 'list',
      showProjectCovers: false,
    },
  },
  {
    id: 'product-studio',
    name: 'Product Studio',
    category: 'Editorial & Design',
    description: 'Ideal para UI/UX e Frontend: cartões arredondados e destaque visual',
    previewBg: '#fffaf5',
    values: {
      effects: 'glow',
      template: 'bento',
      mode: 'light',
      primaryColor: '#ea580c',
      accentColor: '#4f46e5',
      customBgColor: undefined,
      customSurfaceColor: undefined,
      heroLayout: 'centered',
      backgroundPattern: 'dots',
      accentStyle: 'gradient',
      fontFamily: 'sans',
      cardStyle: 'glass',
      cardRadius: 'round',
      density: 'spacious',
      textScale: 'md',
      headingStyle: 'plain',
      experienceLayout: 'cards',
      skillsLayout: 'tags',
      projectsLayout: 'grid',
      showProjectCovers: true,
    },
  },
  {
    id: 'staff-architect',
    name: 'Staff Dossier',
    category: 'Engenharia',
    description: 'Alta densidade de informação para Tech Leads e Arquitetos',
    previewBg: '#0c0d12',
    values: {
      effects: 'flat',
      template: 'recruiter',
      mode: 'dark',
      primaryColor: '#f59e0b',
      accentColor: '#3b82f6',
      customBgColor: '#0b0c10',
      customSurfaceColor: '#12141c',
      heroLayout: 'banner',
      backgroundPattern: 'grid',
      accentStyle: 'solid',
      fontFamily: 'sans',
      cardStyle: 'bordered',
      cardRadius: 'sharp',
      density: 'compact',
      textScale: 'sm',
      headingStyle: 'underline',
      experienceLayout: 'timeline',
      skillsLayout: 'grid',
      projectsLayout: 'list',
      showProjectCovers: false,
    },
  },
  {
    id: 'devos-terminal',
    name: 'DevOS Terminal',
    category: 'Engenharia',
    description: 'Interface monoespaçada inspirada em linha de comando Unix',
    previewBg: '#050807',
    values: {
      effects: 'flat',
      template: 'terminal',
      mode: 'dark',
      primaryColor: '#10b981',
      accentColor: '#22d3ee',
      customBgColor: undefined,
      customSurfaceColor: undefined,
      heroLayout: 'split',
      backgroundPattern: 'grid',
      accentStyle: 'solid',
      fontFamily: 'mono',
      cardStyle: 'bordered',
      cardRadius: 'sharp',
      density: 'compact',
      textScale: 'sm',
      headingStyle: 'plain',
      experienceLayout: 'timeline',
      skillsLayout: 'bars',
      projectsLayout: 'grid',
      showProjectCovers: true,
    },
  },
];
