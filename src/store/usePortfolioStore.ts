'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ExperienceItem,
  GithubRepoApiItem,
  GithubUserApiItem,
  PortfolioProfile,
  PortfolioSectionId,
  ProjectItem,
  SkillItem,
  ThemeSettings,
} from '@/types/portfolio';
import { convertGithubRepoToProject } from '@/lib/github';

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  portfolioId: string;
}

interface PortfolioStoreState {
  portfolios: PortfolioProfile[];
  currentUser: LoggedInUser | null;
  activePortfolioId: string | null;
  githubCachedRepos: GithubRepoApiItem[];
  githubConnectedUser: GithubUserApiItem | null;

  // PostgreSQL Sync State
  dbConnected: boolean;
  dbSyncing: boolean;
  dbError: string | null;
  syncFromPostgres: () => Promise<void>;
  persistPortfolioToPostgres: (portfolio: PortfolioProfile) => Promise<void>;

  // Auth Actions
  setAuthSession: (user: LoggedInUser, portfolio: PortfolioProfile) => void;
  logout: () => void;

  // Getters
  getActivePortfolio: () => PortfolioProfile | undefined;
  getPortfolioBySlug: (slug: string) => PortfolioProfile | undefined;

  // Profile Management
  setActivePortfolioId: (id: string) => void;
  updateActiveProfile: (partial: Partial<PortfolioProfile>) => void;
  updateTheme: (partialTheme: Partial<ThemeSettings>) => void;
  toggleSectionVisibility: (sectionId: PortfolioSectionId) => void;
  moveSectionOrder: (sectionId: PortfolioSectionId, direction: 'up' | 'down') => void;

  // GitHub Sync Actions
  setGithubData: (user: GithubUserApiItem, repos: GithubRepoApiItem[]) => void;
  applyGithubUserProfileToActive: (user: GithubUserApiItem, repos: GithubRepoApiItem[]) => void;
  importGithubRepoToActive: (repo: GithubRepoApiItem) => void;

  // Project Actions
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  updateProject: (projectId: string, partial: Partial<ProjectItem>) => void;
  deleteProject: (projectId: string) => void;
  moveProjectOrder: (projectId: string, direction: 'up' | 'down') => void;

  // Skill Actions
  addSkill: (skill: Omit<SkillItem, 'id'>) => void;
  deleteSkill: (skillId: string) => void;

  // Experience Actions
  addExperience: (exp: Omit<ExperienceItem, 'id'>) => void;
  updateExperience: (expId: string, partial: Partial<ExperienceItem>) => void;
  deleteExperience: (expId: string) => void;

  // LinkedIn Import
  bulkImportLinkedIn: (data: {
    skills: Omit<SkillItem, 'id'>[];
    experiences: Omit<ExperienceItem, 'id'>[];
    headline?: string;
    shortBio?: string;
    aboutMarkdown?: string;
    location?: string;
  }) => void;

  // Hub Engagement
  incrementLike: (portfolioId: string) => void;
  incrementView: (portfolioId: string) => void;
}

export const usePortfolioStore = create<PortfolioStoreState>()(
  persist(
    (set, get) => {
      const triggerBackgroundSave = () => {
        const active = get().getActivePortfolio();
        if (active) {
          get().persistPortfolioToPostgres(active);
        }
      };

      return {
        portfolios: [],
        currentUser: null,
        activePortfolioId: null,
        githubCachedRepos: [],
        githubConnectedUser: null,
        dbConnected: false,
        dbSyncing: false,
        dbError: null,

        setAuthSession: (user, portfolio) => {
          set((state) => {
            const exists = state.portfolios.some((p) => p.id === portfolio.id);
            const nextPortfolios = exists
              ? state.portfolios.map((p) => (p.id === portfolio.id ? portfolio : p))
              : [portfolio, ...state.portfolios];
            return {
              currentUser: user,
              activePortfolioId: portfolio.id,
              portfolios: nextPortfolios,
            };
          });
        },

        logout: () => {
          try {
            fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'logout' }),
            }).catch(() => {});
          } catch {
            // ignore network failure
          }
          set({
            currentUser: null,
            activePortfolioId: null,
            githubCachedRepos: [],
            githubConnectedUser: null,
          });
        },

        syncFromPostgres: async () => {
          set({ dbSyncing: true });
          try {
            // 1. Validate JWT session with backend
            try {
              const authRes = await fetch('/api/auth', { cache: 'no-store' });
              const authData = await authRes.json();
              if (authData.authenticated && authData.user) {
                set({
                  currentUser: authData.user,
                  activePortfolioId: authData.user.portfolioId,
                });
              } else if (get().currentUser) {
                // Token expired on server, clear stale client session
                set({
                  currentUser: null,
                  activePortfolioId: null,
                });
              }
            } catch {
              // ignore session check errors
            }

            // 2. Fetch all public portfolios
            const res = await fetch('/api/portfolios', { cache: 'no-store' });
            const data = await res.json();
            if (data.connected && Array.isArray(data.portfolios)) {
              const currentUser = get().currentUser;
              set({
                portfolios: data.portfolios,
                activePortfolioId: currentUser?.portfolioId || get().activePortfolioId,
                dbConnected: true,
                dbError: null,
                dbSyncing: false,
              });
            } else {
              set({
                dbConnected: false,
                dbError: data.error || 'Banco de dados indisponível',
                dbSyncing: false,
              });
            }
          } catch (err: unknown) {
            set({
              dbConnected: false,
              dbError: err instanceof Error ? err.message : 'Erro de rede',
              dbSyncing: false,
            });
          }
        },

        persistPortfolioToPostgres: async (portfolio) => {
          try {
            const res = await fetch('/api/portfolios', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ portfolio }),
            });
            const data = await res.json();
            if (res.status === 401) {
              set({
                currentUser: null,
                activePortfolioId: null,
                dbError: 'Sessão expirada. Faça login novamente para salvar.',
              });
              return;
            }
            if (data.connected) {
              set({ dbConnected: true, dbError: null });
            } else if (data.error) {
              set({ dbConnected: false, dbError: data.error });
            }
          } catch {
            // ignore network error
          }
        },

        getActivePortfolio: () => {
          const { portfolios, currentUser } = get();
          const targetId = currentUser?.portfolioId;
          if (!targetId) return undefined;
          return portfolios.find((p) => p.id === targetId);
        },

        getPortfolioBySlug: (slug: string) => {
          const cleanSlug = decodeURIComponent(slug).replace(/^@/, '').toLowerCase();
          return get().portfolios.find((p) => p.slug.toLowerCase() === cleanSlug);
        },

        setActivePortfolioId: (id) => set({ activePortfolioId: id }),

        updateActiveProfile: (partial) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? { ...p, ...partial, updatedAt: new Date().toISOString() }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        updateTheme: (partialTheme) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    theme: { ...p.theme, ...partialTheme },
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        toggleSectionVisibility: (sectionId) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== targetId) return p;
              return {
                ...p,
                theme: {
                  ...p.theme,
                  visibleSections: {
                    ...p.theme.visibleSections,
                    [sectionId]: !p.theme.visibleSections[sectionId],
                  },
                },
              };
            }),
          }));
          triggerBackgroundSave();
        },

        moveSectionOrder: (sectionId, direction) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== targetId) return p;
              const order = [...p.theme.sectionOrder];
              const idx = order.indexOf(sectionId);
              if (idx === -1) return p;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= order.length) return p;
              const temp = order[idx];
              order[idx] = order[targetIdx];
              order[targetIdx] = temp;
              return {
                ...p,
                theme: { ...p.theme, sectionOrder: order },
              };
            }),
          }));
          triggerBackgroundSave();
        },

        setGithubData: (user, repos) =>
          set({
            githubConnectedUser: user,
            githubCachedRepos: repos,
          }),

        applyGithubUserProfileToActive: (user, repos) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => {
            const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
            const totalForks = repos.reduce((acc, r) => acc + (r.forks_count || 0), 0);
            const langCounts: Record<string, number> = {};
            repos.forEach((r) => {
              if (r.language) {
                langCounts[r.language] = (langCounts[r.language] || 0) + 1;
              }
            });
            const topLanguages = Object.entries(langCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang]) => lang);

            return {
              portfolios: state.portfolios.map((p) =>
                p.id === targetId
                  ? {
                      ...p,
                      name: user.name || user.login || p.name,
                      avatarUrl: user.avatar_url || p.avatarUrl,
                      shortBio: user.bio || p.shortBio,
                      location: user.location || p.location,
                      websiteUrl: user.blog || p.websiteUrl,
                      githubUsername: user.login,
                      githubUrl: user.html_url,
                      verifiedGithub: true,
                      githubStats: {
                        publicRepos: user.public_repos,
                        totalStars,
                        totalForks,
                        followers: user.followers,
                        lastSyncedAt: new Date().toISOString(),
                        topLanguages:
                          topLanguages.length > 0 ? topLanguages : p.githubStats.topLanguages,
                      },
                      updatedAt: new Date().toISOString(),
                    }
                  : p
              ),
            };
          });
          triggerBackgroundSave();
        },

        importGithubRepoToActive: (repo) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== targetId) return p;
              const exists = p.projects.some(
                (proj) => proj.githubRepoId === repo.id || proj.id === `gh-${repo.id}`
              );
              if (exists) {
                return {
                  ...p,
                  projects: p.projects.map((proj) =>
                    proj.githubRepoId === repo.id || proj.id === `gh-${repo.id}`
                      ? {
                          ...proj,
                          starsCount: repo.stargazers_count,
                          forksCount: repo.forks_count,
                          repoUrl: repo.html_url,
                          demoUrl: repo.homepage || proj.demoUrl,
                        }
                      : proj
                  ),
                };
              }
              const newProj = convertGithubRepoToProject(repo, p.projects.length);
              return {
                ...p,
                projects: [newProj, ...p.projects],
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
          triggerBackgroundSave();
        },

        addProject: (project) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    projects: [
                      {
                        ...project,
                        id: `proj-${Date.now()}`,
                      },
                      ...p.projects,
                    ],
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        updateProject: (projectId, partial) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    projects: p.projects.map((proj) =>
                      proj.id === projectId ? { ...proj, ...partial } : proj
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        deleteProject: (projectId) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    projects: p.projects.filter((proj) => proj.id !== projectId),
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        moveProjectOrder: (projectId, direction) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== targetId) return p;
              const list = [...p.projects];
              const idx = list.findIndex((item) => item.id === projectId);
              if (idx === -1) return p;
              const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
              if (targetIdx < 0 || targetIdx >= list.length) return p;
              const temp = list[idx];
              list[idx] = list[targetIdx];
              list[targetIdx] = temp;
              return {
                ...p,
                projects: list,
                updatedAt: new Date().toISOString(),
              };
            }),
          }));
          triggerBackgroundSave();
        },

        addSkill: (skill) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    skills: [...p.skills, { ...skill, id: `sk-${Date.now()}` }],
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        deleteSkill: (skillId) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    skills: p.skills.filter((s) => s.id !== skillId),
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        addExperience: (exp) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    experiences: [{ ...exp, id: `exp-${Date.now()}` }, ...p.experiences],
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        updateExperience: (expId, partial) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    experiences: p.experiences.map((e) =>
                      e.id === expId ? { ...e, ...partial } : e
                    ),
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        deleteExperience: (expId) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === targetId
                ? {
                    ...p,
                    experiences: p.experiences.filter((e) => e.id !== expId),
                    updatedAt: new Date().toISOString(),
                  }
                : p
            ),
          }));
          triggerBackgroundSave();
        },

        bulkImportLinkedIn: (data) => {
          const targetId = get().currentUser?.portfolioId;
          if (!targetId) return;

          set((state) => ({
            portfolios: state.portfolios.map((p) => {
              if (p.id !== targetId) return p;

              // Avoid duplicate skills by name
              const existingSkillNames = new Set(
                p.skills.map((s) => s.name.toLowerCase())
              );
              const newSkills: SkillItem[] = data.skills
                .filter((s) => !existingSkillNames.has(s.name.toLowerCase()))
                .map((s, idx) => ({
                  ...s,
                  id: `sk-li-${Date.now()}-${idx}`,
                }));

              // Avoid duplicate experiences by company and role
              const existingExpKeys = new Set(
                p.experiences.map(
                  (e) => `${e.company.toLowerCase()}|${e.role.toLowerCase()}`
                )
              );
              const newExperiences: ExperienceItem[] = data.experiences
                .filter(
                  (e) =>
                    !existingExpKeys.has(
                      `${e.company.toLowerCase()}|${e.role.toLowerCase()}`
                    )
                )
                .map((e, idx) => ({
                  ...e,
                  id: `exp-li-${Date.now()}-${idx}`,
                }));

              return {
                ...p,
                skills: [...p.skills, ...newSkills],
                experiences: [...newExperiences, ...p.experiences],
                headline: data.headline || p.headline,
                shortBio: data.shortBio || p.shortBio,
                aboutMarkdown: data.aboutMarkdown
                  ? p.aboutMarkdown
                    ? `${p.aboutMarkdown}\n\n${data.aboutMarkdown}`
                    : data.aboutMarkdown
                  : p.aboutMarkdown,
                location: data.location || p.location,
                updatedAt: new Date().toISOString(),
              };
            }),
          }));

          triggerBackgroundSave();
        },

        incrementLike: (portfolioId) => {
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === portfolioId ? { ...p, likesCount: p.likesCount + 1 } : p
            ),
          }));
          const target = get().portfolios.find((p) => p.id === portfolioId);
          if (target) get().persistPortfolioToPostgres(target);
        },

        incrementView: (portfolioId) => {
          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === portfolioId ? { ...p, viewsCount: p.viewsCount + 1 } : p
            ),
          }));
          const target = get().portfolios.find((p) => p.id === portfolioId);
          if (target) get().persistPortfolioToPostgres(target);
        },
      };
    },
    {
      name: 'portifoliohub-postgres-auth-v2',
    }
  )
);
