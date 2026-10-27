import { GithubRepoApiItem, GithubUserApiItem, ProjectItem } from '@/types/portfolio';
import { COVER_PRESETS } from './utils';

export async function fetchGithubUserAndRepos(
  username: string,
  token?: string
): Promise<{
  user: GithubUserApiItem;
  repos: GithubRepoApiItem[];
}> {
  const cleanUser = username.trim().replace(/^@/, '');
  if (!cleanUser) {
    throw new Error('Informe um nome de usuário válido do GitHub.');
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
  };

  if (token && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${encodeURIComponent(cleanUser)}`, { headers }),
    fetch(
      `https://api.github.com/users/${encodeURIComponent(cleanUser)}/repos?sort=updated&per_page=40`,
      { headers }
    ),
  ]);

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`Usuário "${cleanUser}" não encontrado no GitHub.`);
    }
    if (userRes.status === 403) {
      throw new Error(
        'Limite de requisições da API do GitHub atingido. Você pode informar um Token opcional ou tentar novamente em instantes.'
      );
    }
    throw new Error(`Erro ao consultar GitHub API (Status ${userRes.status}).`);
  }

  const user: GithubUserApiItem = await userRes.json();
  const repos: GithubRepoApiItem[] = reposRes.ok ? await reposRes.json() : [];

  // Sort by stars descending, then updated_at
  const sortedRepos = [...repos].sort((a, b) => {
    if (b.stargazers_count !== a.stargazers_count) {
      return b.stargazers_count - a.stargazers_count;
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return { user, repos: sortedRepos };
}

export function convertGithubRepoToProject(repo: GithubRepoApiItem, index = 0): ProjectItem {
  const topics = repo.topics && repo.topics.length > 0 ? repo.topics : [];
  const stack = Array.from(
    new Set([
      ...(repo.language ? [repo.language] : []),
      ...topics.slice(0, 6).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    ])
  );

  const presetCover = COVER_PRESETS[index % COVER_PRESETS.length].url;

  return {
    id: `gh-${repo.id}`,
    title: repo.name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    subtitle:
      repo.description ||
      `Repositório oficial ${repo.name} desenvolvido em ${repo.language || 'código aberto'}.`,
    problemStatement:
      repo.description ||
      `Necessidade de uma solução modular e performática para ${repo.name} com código aberto e arquitetura escalável.`,
    solutionDetails: `Implementado utilizando ${
      stack.length > 0 ? stack.join(', ') : 'boas práticas de engenharia de software'
    }, estruturado para fácil manutenção, testes automatizados e integração contínua.`,
    impactMetrics: `${
      repo.stargazers_count > 0 ? `★ ${repo.stargazers_count} estrelas no GitHub • ` : ''
    }${repo.forks_count > 0 ? `${repo.forks_count} forks na comunidade • ` : ''}Código aberto verificável em produção`,
    coverImageUrl: presetCover,
    demoUrl: repo.homepage && repo.homepage.trim() !== '' ? repo.homepage : undefined,
    repoUrl: repo.html_url,
    techStack: stack.length > 0 ? stack : ['Software Engineering', 'Git'],
    isFromGithub: true,
    githubRepoId: repo.id,
    starsCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    language: repo.language || 'Code',
    role: 'Autor / Maintainer',
    clientOrCompany: 'GitHub Open Source',
    year: new Date(repo.updated_at).getFullYear().toString(),
    isFeatured: repo.stargazers_count > 5 || index < 2,
    isVisible: true,
  };
}
