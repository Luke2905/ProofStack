export type SeniorityLevel = 'Júnior' | 'Pleno' | 'Sênior' | 'Tech Lead / Staff' | 'Principal / Arquitetura';

export type AvailabilityStatus =
  | 'available_now'      // Disponível para início imediato
  | 'open_to_offers'     // Aberto a propostas
  | 'freelance_only'     // Disponível para Freelance / Consultoria
  | 'employed_networking'; // Empregado (Apenas Networking)

export type WorkModality = 'Remoto' | 'Híbrido' | 'Presencial';

export type ContractType = 'CLT' | 'PJ' | 'Freelance' | 'Internacional (USD/EUR)';

export type RoleCategory =
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'Mobile'
  | 'DevOps & Cloud'
  | 'Dados & IA'
  | 'UI/UX & Product';

export type PortfolioTemplate = 'bento' | 'recruiter' | 'terminal' | 'minimal';

export type PortfolioSectionId =
  | 'hero'
  | 'recruiter_highlights'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'contact';

export type CardRadius = 'sharp' | 'soft' | 'round';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type TextScale = 'sm' | 'md' | 'lg';
export type HeadingStyle = 'plain' | 'underline' | 'accent-bar';
export type ExperienceLayout = 'cards' | 'timeline';
export type SkillsLayout = 'grid' | 'bars' | 'tags';
export type ProjectsLayout = 'auto' | 'grid' | 'list';
export type HeroLayout = 'split' | 'centered' | 'minimal' | 'banner';
export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'mesh';
export type AccentStyle = 'solid' | 'gradient';
export type VisualEffects = 'glow' | 'flat';

export interface CustomTemplatePreset {
  id: string;
  name: string;
  createdAt: string;
  settings: Partial<Omit<ThemeSettings, 'savedTemplates'>>;
}

export interface ThemeSettings {
  // Opcionais: perfis antigos continuam funcionando com valores padrão.
  /** 'glow' = vidro sutil, profundidade e microinterações; 'flat' = plano */
  effects?: VisualEffects;
  heroLayout?: HeroLayout;
  backgroundPattern?: BackgroundPattern;
  accentStyle?: AccentStyle;
  customBgColor?: string;
  customSurfaceColor?: string;
  cardRadius?: CardRadius;
  density?: LayoutDensity;
  textScale?: TextScale;
  headingStyle?: HeadingStyle;
  experienceLayout?: ExperienceLayout;
  skillsLayout?: SkillsLayout;
  projectsLayout?: ProjectsLayout;
  showProjectCovers?: boolean;
  /** Títulos personalizados por seção (texto livre) */
  sectionTitles?: Partial<Record<PortfolioSectionId, string>>;
  /** Subtítulos personalizados por seção (texto livre) */
  sectionSubtitles?: Partial<Record<PortfolioSectionId, string>>;
  /** Templates personalizados salvos pelo usuário */
  savedTemplates?: CustomTemplatePreset[];

  template: PortfolioTemplate;
  mode: 'dark' | 'light';
  primaryColor: string;
  accentColor: string;
  fontFamily: 'sans' | 'mono' | 'editorial';
  cardStyle: 'glass' | 'solid' | 'bordered';
  showGithubStats: boolean;
  showImpactHighlights: boolean;
  showAvailabilityBanner: boolean;
  sectionOrder: PortfolioSectionId[];
  visibleSections: Record<PortfolioSectionId, boolean>;
}

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  problemStatement: string;
  solutionDetails: string;
  impactMetrics: string;
  coverImageUrl: string;
  demoUrl?: string;
  repoUrl?: string;
  techStack: string[];
  isFromGithub: boolean;
  githubRepoId?: number;
  starsCount: number;
  forksCount: number;
  language?: string;
  role?: string;
  clientOrCompany?: string;
  year?: string;
  isFeatured: boolean;
  isVisible: boolean;
}

export type SkillCategory =
  | 'Frontend'
  | 'Backend'
  | 'Banco de Dados'
  | 'DevOps & Cloud'
  | 'Mobile'
  | 'Arquitetura & Ferramentas';

export interface SkillItem {
  id: string;
  name: string;
  category: SkillCategory;
  level: 'Avançado / Especialista' | 'Proficiência Sólida' | 'Prático';
  years: number;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface PortfolioProfile {
  id: string;
  slug: string;
  isOwnerProfile?: boolean;
  isPublished: boolean;
  showInHub: boolean;
  updatedAt: string;

  // Basic Identity
  name: string;
  avatarUrl: string;
  headline: string;
  roleCategory: RoleCategory;
  seniority: SeniorityLevel;
  yearsOfExperience: number;
  shortBio: string;
  aboutMarkdown: string;
  location: string;
  languages: string[];

  // Recruiter & Company Critical Metadata
  availabilityStatus: AvailabilityStatus;
  preferredModalities: WorkModality[];
  contractTypes: ContractType[];
  compensationExpectation?: string;
  noticePeriod?: string;

  // Contact & Validation Links
  email: string;
  whatsapp?: string;
  linkedinUrl?: string;
  githubUsername?: string;
  githubUrl?: string;
  websiteUrl?: string;
  calendlyUrl?: string;
  resumeUrl?: string;

  // GitHub Sync Stats
  githubStats: {
    publicRepos: number;
    totalStars: number;
    totalForks: number;
    followers: number;
    lastSyncedAt?: string;
    topLanguages: string[];
  };

  // Visual Customization
  theme: ThemeSettings;

  // Content Collections
  projects: ProjectItem[];
  skills: SkillItem[];
  experiences: ExperienceItem[];

  // Hub Engagement Metrics
  viewsCount: number;
  likesCount: number;
  verifiedGithub: boolean;
}

export interface GithubRepoApiItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  updated_at: string;
  created_at: string;
  fork: boolean;
  archived: boolean;
}

export interface GithubUserApiItem {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}
