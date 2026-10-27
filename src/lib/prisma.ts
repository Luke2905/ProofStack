import mysql, { Pool } from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  AvailabilityStatus,
  ContractType,
  PortfolioProfile,
  RoleCategory,
  SeniorityLevel,
  SkillCategory,
  ThemeSettings,
  WorkModality,
} from '@/types/portfolio';

const CONFIG_FILE = path.join(process.cwd(), '.db-config.json');
const LEGACY_CONFIG_FILE = path.join(process.cwd(), '.pg-config.json');

export function getDatabaseUrl(): string {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (raw.databaseUrl) return raw.databaseUrl;
    }
    if (fs.existsSync(LEGACY_CONFIG_FILE)) {
      const raw = JSON.parse(fs.readFileSync(LEGACY_CONFIG_FILE, 'utf-8'));
      if (raw.databaseUrl && !raw.databaseUrl.startsWith('postgresql:')) {
        return raw.databaseUrl;
      }
    }
  } catch {
    // ignore
  }
  return (
    process.env.DATABASE_URL ||
    'mysql://root@localhost:3306/portifoliohub'
  );
}

export function saveDatabaseUrl(databaseUrl: string) {
  const payload = JSON.stringify({ databaseUrl: databaseUrl.trim() }, null, 2);
  try {
    fs.writeFileSync(CONFIG_FILE, payload, 'utf-8');
    fs.writeFileSync(LEGACY_CONFIG_FILE, payload, 'utf-8');
  } catch {
    // Ignore on read-only serverless filesystems (e.g. Vercel)
  }

  if (globalForMysql.pool) {
    globalForMysql.pool.end().catch(() => {});
    globalForMysql.pool = undefined;
    globalForMysql.schemaInitialized = false;
  }
}

function parseMysqlUrl(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const sslParam =
      url.searchParams.get('ssl') ||
      url.searchParams.get('sslaccept') ||
      url.searchParams.get('ssl-mode');
    const useSsl =
      Boolean(sslParam) &&
      sslParam !== 'false' &&
      sslParam !== '0' &&
      sslParam?.toLowerCase() !== 'disabled';

    return {
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port, 10) : 3306,
      user: decodeURIComponent(url.username || 'root'),
      password: decodeURIComponent(url.password || ''),
      database: url.pathname.replace(/^\//, '') || 'portifoliohub',
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    return {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'portifoliohub',
      ssl: undefined,
    };
  }
}

const globalForMysql = globalThis as unknown as {
  pool: Pool | undefined;
  schemaInitialized: boolean | undefined;
  currentUrl: string | undefined;
};

function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return `${actualSalt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

async function ensureDatabaseExists(connectionConfig: ReturnType<typeof parseMysqlUrl>) {
  try {
    const adminConn = await mysql.createConnection({
      host: connectionConfig.host,
      port: connectionConfig.port,
      user: connectionConfig.user,
      password: connectionConfig.password,
      ssl: connectionConfig.ssl,
    });
    const safeDbName = connectionConfig.database.replace(/`/g, '');
    await adminConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${safeDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await adminConn.end();
  } catch {
    // Ignore if already exists or permission denied
  }
}

export async function getPool(): Promise<Pool> {
  const dbUrl = getDatabaseUrl();

  if (!globalForMysql.pool || globalForMysql.currentUrl !== dbUrl) {
    const connConfig = parseMysqlUrl(dbUrl);
    await ensureDatabaseExists(connConfig);

    globalForMysql.pool = mysql.createPool({
      host: connConfig.host,
      port: connConfig.port,
      user: connConfig.user,
      password: connConfig.password,
      database: connConfig.database,
      ssl: connConfig.ssl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    globalForMysql.currentUrl = dbUrl;
    globalForMysql.schemaInitialized = false;
  }

  if (!globalForMysql.schemaInitialized) {
    const conn = await globalForMysql.pool.getConnection();
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          portfolio_id VARCHAR(255) UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS portfolios (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255),
          slug VARCHAR(255) NOT NULL UNIQUE,
          is_owner_profile BOOLEAN DEFAULT FALSE,
          is_published BOOLEAN DEFAULT TRUE,
          show_in_hub BOOLEAN DEFAULT TRUE,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(255) NOT NULL,
          avatar_url VARCHAR(1000) NOT NULL,
          headline VARCHAR(500) NOT NULL,
          role_category VARCHAR(100) NOT NULL,
          seniority VARCHAR(100) NOT NULL,
          years_of_experience INT DEFAULT 1,
          short_bio TEXT NOT NULL,
          about_markdown MEDIUMTEXT,
          location VARCHAR(255) NOT NULL,
          languages JSON,
          availability_status VARCHAR(100) NOT NULL,
          preferred_modalities JSON,
          contract_types JSON,
          compensation_expectation VARCHAR(255),
          notice_period VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          whatsapp VARCHAR(255),
          linkedin_url VARCHAR(1000),
          github_username VARCHAR(255),
          github_url VARCHAR(1000),
          website_url VARCHAR(1000),
          calendly_url VARCHAR(1000),
          resume_url VARCHAR(1000),
          github_stats JSON,
          theme JSON,
          views_count INT DEFAULT 0,
          likes_count INT DEFAULT 0,
          verified_github BOOLEAN DEFAULT FALSE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id VARCHAR(255) PRIMARY KEY,
          portfolio_id VARCHAR(255) NOT NULL,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(500) NOT NULL,
          problem_statement TEXT NOT NULL,
          solution_details TEXT NOT NULL,
          impact_metrics TEXT NOT NULL,
          cover_image_url VARCHAR(1000) NOT NULL,
          demo_url VARCHAR(1000),
          repo_url VARCHAR(1000),
          tech_stack JSON,
          is_from_github BOOLEAN DEFAULT FALSE,
          github_repo_id BIGINT,
          stars_count INT DEFAULT 0,
          forks_count INT DEFAULT 0,
          language VARCHAR(100),
          role VARCHAR(255),
          client_or_company VARCHAR(255),
          year VARCHAR(50),
          is_featured BOOLEAN DEFAULT FALSE,
          is_visible BOOLEAN DEFAULT TRUE,
          display_order INT DEFAULT 0,
          CONSTRAINT fk_projects_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS skills (
          id VARCHAR(255) PRIMARY KEY,
          portfolio_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          level VARCHAR(100) NOT NULL,
          years INT DEFAULT 1,
          CONSTRAINT fk_skills_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS experiences (
          id VARCHAR(255) PRIMARY KEY,
          portfolio_id VARCHAR(255) NOT NULL,
          company VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL,
          location VARCHAR(255) NOT NULL,
          start_date VARCHAR(100) NOT NULL,
          end_date VARCHAR(100) NOT NULL,
          is_current BOOLEAN DEFAULT FALSE,
          description TEXT NOT NULL,
          achievements JSON,
          technologies JSON,
          CONSTRAINT fk_experiences_portfolio FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Clean up legacy mock profiles if present
      await conn.query(`
        DELETE FROM portfolios
        WHERE id IN ('prof-owner-1', 'prof-2', 'prof-3', 'prof-4', 'prof-5');
      `);

      globalForMysql.schemaInitialized = true;
    } finally {
      conn.release();
    }
  }

  return globalForMysql.pool;
}

export async function fetchAllPortfoliosFromDb(): Promise<PortfolioProfile[]> {
  const pool = await getPool();

  const [portfoliosRows] = (await pool.query(
    'SELECT * FROM portfolios ORDER BY updated_at DESC'
  )) as [any[], any];

  const [projectsRows] = (await pool.query(
    'SELECT * FROM projects ORDER BY display_order ASC'
  )) as [any[], any];

  const [skillsRows] = (await pool.query('SELECT * FROM skills')) as [any[], any];

  const [experiencesRows] = (await pool.query('SELECT * FROM experiences')) as [
    any[],
    any
  ];

  return portfoliosRows.map((row) => {
    const profProjects = projectsRows.filter((p) => p.portfolio_id === row.id);
    const profSkills = skillsRows.filter((s) => s.portfolio_id === row.id);
    const profExps = experiencesRows.filter((e) => e.portfolio_id === row.id);

    return {
      id: row.id,
      slug: row.slug,
      isOwnerProfile: Boolean(row.is_owner_profile),
      isPublished: Boolean(row.is_published),
      showInHub: Boolean(row.show_in_hub),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      name: row.name,
      avatarUrl: row.avatar_url,
      headline: row.headline,
      roleCategory: row.role_category as RoleCategory,
      seniority: row.seniority as SeniorityLevel,
      yearsOfExperience: row.years_of_experience ?? 1,
      shortBio: row.short_bio,
      aboutMarkdown: row.about_markdown || '',
      location: row.location,
      languages: safeJsonParse<string[]>(row.languages, []),
      availabilityStatus: row.availability_status as AvailabilityStatus,
      preferredModalities: safeJsonParse<WorkModality[]>(row.preferred_modalities, []),
      contractTypes: safeJsonParse<ContractType[]>(row.contract_types, []),
      compensationExpectation: row.compensation_expectation || undefined,
      noticePeriod: row.notice_period || undefined,
      email: row.email,
      whatsapp: row.whatsapp || undefined,
      linkedinUrl: row.linkedin_url || undefined,
      githubUsername: row.github_username || undefined,
      githubUrl: row.github_url || undefined,
      websiteUrl: row.website_url || undefined,
      calendlyUrl: row.calendly_url || undefined,
      resumeUrl: row.resume_url || undefined,
      githubStats: safeJsonParse<PortfolioProfile['githubStats']>(row.github_stats, {
        publicRepos: 0,
        totalStars: 0,
        totalForks: 0,
        followers: 0,
        topLanguages: [],
      }),
      theme: safeJsonParse<ThemeSettings>(row.theme, {
        template: 'bento',
        mode: 'dark',
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        fontFamily: 'sans',
        cardStyle: 'glass',
        showGithubStats: true,
        showImpactHighlights: true,
        showAvailabilityBanner: true,
        sectionOrder: [
          'hero',
          'recruiter_highlights',
          'projects',
          'skills',
          'experience',
          'contact',
        ],
        visibleSections: {
          hero: true,
          recruiter_highlights: true,
          projects: true,
          skills: true,
          experience: true,
          contact: true,
        },
      }),
      viewsCount: row.views_count ?? 0,
      likesCount: row.likes_count ?? 0,
      verifiedGithub: Boolean(row.verified_github),
      projects: profProjects.map((p) => ({
        id: p.id.replace(`${row.id}_`, ''),
        title: p.title,
        subtitle: p.subtitle,
        problemStatement: p.problem_statement,
        solutionDetails: p.solution_details,
        impactMetrics: p.impact_metrics,
        coverImageUrl: p.cover_image_url,
        demoUrl: p.demo_url || undefined,
        repoUrl: p.repo_url || undefined,
        techStack: safeJsonParse<string[]>(p.tech_stack, []),
        isFromGithub: Boolean(p.is_from_github),
        githubRepoId: p.github_repo_id ? Number(p.github_repo_id) : undefined,
        starsCount: p.stars_count ?? 0,
        forksCount: p.forks_count ?? 0,
        language: p.language || undefined,
        role: p.role || undefined,
        clientOrCompany: p.client_or_company || undefined,
        year: p.year || undefined,
        isFeatured: Boolean(p.is_featured),
        isVisible: Boolean(p.is_visible),
      })),
      skills: profSkills.map((s) => ({
        id: s.id.replace(`${row.id}_`, ''),
        name: s.name,
        category: s.category as SkillCategory,
        level: s.level as 'Avançado / Especialista' | 'Proficiência Sólida' | 'Prático',
        years: s.years ?? 1,
      })),
      experiences: profExps.map((e) => ({
        id: e.id.replace(`${row.id}_`, ''),
        company: e.company,
        role: e.role,
        location: e.location,
        startDate: e.start_date,
        endDate: e.end_date,
        isCurrent: Boolean(e.is_current),
        description: e.description,
        achievements: safeJsonParse<string[]>(e.achievements, []),
        technologies: safeJsonParse<string[]>(e.technologies, []),
      })),
    };
  });
}

// Backwards compatibility alias
export const fetchAllPortfoliosFromPostgres = fetchAllPortfoliosFromDb;

export async function upsertPortfolioInDb(profile: PortfolioProfile) {
  const pool = await getPool();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `
      INSERT INTO portfolios (
        id, slug, is_owner_profile, is_published, show_in_hub, updated_at,
        name, avatar_url, headline, role_category, seniority, years_of_experience,
        short_bio, about_markdown, location, languages,
        availability_status, preferred_modalities, contract_types,
        compensation_expectation, notice_period,
        email, whatsapp, linkedin_url, github_username, github_url,
        website_url, calendly_url, resume_url,
        github_stats, theme, views_count, likes_count, verified_github
      ) VALUES (
        ?, ?, ?, ?, ?, NOW(),
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        slug = VALUES(slug),
        is_owner_profile = VALUES(is_owner_profile),
        is_published = VALUES(is_published),
        show_in_hub = VALUES(show_in_hub),
        updated_at = NOW(),
        name = VALUES(name),
        avatar_url = VALUES(avatar_url),
        headline = VALUES(headline),
        role_category = VALUES(role_category),
        seniority = VALUES(seniority),
        years_of_experience = VALUES(years_of_experience),
        short_bio = VALUES(short_bio),
        about_markdown = VALUES(about_markdown),
        location = VALUES(location),
        languages = VALUES(languages),
        availability_status = VALUES(availability_status),
        preferred_modalities = VALUES(preferred_modalities),
        contract_types = VALUES(contract_types),
        compensation_expectation = VALUES(compensation_expectation),
        notice_period = VALUES(notice_period),
        email = VALUES(email),
        whatsapp = VALUES(whatsapp),
        linkedin_url = VALUES(linkedin_url),
        github_username = VALUES(github_username),
        github_url = VALUES(github_url),
        website_url = VALUES(website_url),
        calendly_url = VALUES(calendly_url),
        resume_url = VALUES(resume_url),
        github_stats = VALUES(github_stats),
        theme = VALUES(theme),
        views_count = VALUES(views_count),
        likes_count = VALUES(likes_count),
        verified_github = VALUES(verified_github)
      `,
      [
        profile.id,
        profile.slug,
        Boolean(profile.isOwnerProfile),
        Boolean(profile.isPublished),
        Boolean(profile.showInHub),
        profile.name,
        profile.avatarUrl,
        profile.headline,
        profile.roleCategory,
        profile.seniority,
        profile.yearsOfExperience ?? 1,
        profile.shortBio,
        profile.aboutMarkdown || '',
        profile.location,
        JSON.stringify(profile.languages || []),
        profile.availabilityStatus,
        JSON.stringify(profile.preferredModalities || []),
        JSON.stringify(profile.contractTypes || []),
        profile.compensationExpectation ?? null,
        profile.noticePeriod ?? null,
        profile.email,
        profile.whatsapp ?? null,
        profile.linkedinUrl ?? null,
        profile.githubUsername ?? null,
        profile.githubUrl ?? null,
        profile.websiteUrl ?? null,
        profile.calendlyUrl ?? null,
        profile.resumeUrl ?? null,
        JSON.stringify(profile.githubStats || {}),
        JSON.stringify(profile.theme || {}),
        profile.viewsCount || 0,
        profile.likesCount || 0,
        Boolean(profile.verifiedGithub),
      ]
    );

    // Sync Projects
    await conn.query('DELETE FROM projects WHERE portfolio_id = ?', [profile.id]);
    for (let i = 0; i < (profile.projects || []).length; i++) {
      const p = profile.projects[i];
      await conn.query(
        `
        INSERT INTO projects (
          id, portfolio_id, title, subtitle, problem_statement, solution_details,
          impact_metrics, cover_image_url, demo_url, repo_url, tech_stack,
          is_from_github, github_repo_id, stars_count, forks_count, language,
          role, client_or_company, year, is_featured, is_visible, display_order
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
        `,
        [
          `${profile.id}_${p.id}`,
          profile.id,
          p.title,
          p.subtitle,
          p.problemStatement,
          p.solutionDetails,
          p.impactMetrics,
          p.coverImageUrl,
          p.demoUrl ?? null,
          p.repoUrl ?? null,
          JSON.stringify(p.techStack || []),
          Boolean(p.isFromGithub),
          p.githubRepoId ?? null,
          p.starsCount || 0,
          p.forksCount || 0,
          p.language ?? null,
          p.role ?? null,
          p.clientOrCompany ?? null,
          p.year ?? null,
          Boolean(p.isFeatured),
          Boolean(p.isVisible),
          i,
        ]
      );
    }

    // Sync Skills
    await conn.query('DELETE FROM skills WHERE portfolio_id = ?', [profile.id]);
    for (const s of profile.skills || []) {
      await conn.query(
        `
        INSERT INTO skills (id, portfolio_id, name, category, level, years)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [`${profile.id}_${s.id}`, profile.id, s.name, s.category, s.level, s.years ?? 1]
      );
    }

    // Sync Experiences
    await conn.query('DELETE FROM experiences WHERE portfolio_id = ?', [profile.id]);
    for (const e of profile.experiences || []) {
      await conn.query(
        `
        INSERT INTO experiences (
          id, portfolio_id, company, role, location, start_date, end_date,
          is_current, description, achievements, technologies
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          `${profile.id}_${e.id}`,
          profile.id,
          e.company,
          e.role,
          e.location,
          e.startDate,
          e.endDate,
          Boolean(e.isCurrent),
          e.description,
          JSON.stringify(e.achievements || []),
          JSON.stringify(e.technologies || []),
        ]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Backwards compatibility alias
export const upsertPortfolioInPostgres = upsertPortfolioInDb;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  portfolioId: string;
}

export async function registerUserInDb(input: {
  name: string;
  email: string;
  password: string;
  headline: string;
  roleCategory: RoleCategory;
  seniority: SeniorityLevel;
  githubUsername?: string;
}): Promise<{ user: AuthUser; portfolio: PortfolioProfile }> {
  const pool = await getPool();
  const normalizedEmail = input.email.trim().toLowerCase();

  const [existing] = (await pool.query(
    'SELECT id FROM users WHERE email = ?',
    [normalizedEmail]
  )) as [any[], any];

  if (existing.length > 0) {
    throw new Error('Já existe uma conta cadastrada com este e-mail.');
  }

  const userId = `usr_${Date.now()}`;
  const portfolioId = `prof_${Date.now()}`;

  const slugBase = input.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const [slugCheck] = (await pool.query(
    'SELECT id FROM portfolios WHERE slug = ?',
    [slugBase]
  )) as [any[], any];

  const finalSlug =
    slugCheck.length > 0
      ? `${slugBase}-${Math.floor(100 + Math.random() * 900)}`
      : slugBase || `dev-${Date.now()}`;

  const cleanGh = input.githubUsername?.trim().replace(/^@/, '') || '';

  const initialPortfolio: PortfolioProfile = {
    id: portfolioId,
    slug: finalSlug,
    isOwnerProfile: true,
    isPublished: true,
    showInHub: true,
    updatedAt: new Date().toISOString(),
    name: input.name.trim(),
    avatarUrl: cleanGh
      ? `https://github.com/${cleanGh}.png`
      : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
          input.name.trim()
        )}`,
    headline: input.headline.trim() || `Especialista em ${input.roleCategory}`,
    roleCategory: input.roleCategory,
    seniority: input.seniority,
    yearsOfExperience: input.seniority === 'Júnior' ? 1 : input.seniority === 'Pleno' ? 3 : 6,
    shortBio: `Profissional de ${input.roleCategory} (${input.seniority}). Conecte seu GitHub ou adicione seus projetos no Editor Visual para destacar seus cases técnicos.`,
    aboutMarkdown: '',
    location: 'Brasil (Remoto)',
    languages: ['Português (Nativo)'],
    availabilityStatus: 'available_now',
    preferredModalities: ['Remoto'],
    contractTypes: ['PJ', 'CLT'],
    noticePeriod: 'Imediato',
    email: normalizedEmail,
    githubUsername: cleanGh || undefined,
    githubUrl: cleanGh ? `https://github.com/${cleanGh}` : undefined,
    githubStats: {
      publicRepos: 0,
      totalStars: 0,
      totalForks: 0,
      followers: 0,
      topLanguages: [],
    },
    theme: {
      template: 'bento',
      mode: 'dark',
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      fontFamily: 'sans',
      cardStyle: 'glass',
      showGithubStats: true,
      showImpactHighlights: true,
      showAvailabilityBanner: true,
      sectionOrder: [
        'hero',
        'recruiter_highlights',
        'projects',
        'skills',
        'experience',
        'contact',
      ],
      visibleSections: {
        hero: true,
        recruiter_highlights: true,
        projects: true,
        skills: true,
        experience: true,
        contact: true,
      },
    },
    projects: [],
    skills: [],
    experiences: [],
    viewsCount: 1,
    likesCount: 0,
    verifiedGithub: Boolean(cleanGh),
  };

  await upsertPortfolioInDb(initialPortfolio);

  const pwdHash = hashPassword(input.password);
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, portfolio_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, input.name.trim(), normalizedEmail, pwdHash, portfolioId]
  );

  await pool.query('UPDATE portfolios SET user_id = ? WHERE id = ?', [
    userId,
    portfolioId,
  ]);

  return {
    user: {
      id: userId,
      name: input.name.trim(),
      email: normalizedEmail,
      portfolioId,
    },
    portfolio: initialPortfolio,
  };
}

// Backwards compatibility alias
export const registerUserInPostgres = registerUserInDb;

export async function loginUserInDb(input: {
  email: string;
  password: string;
}): Promise<{ user: AuthUser; portfolio: PortfolioProfile }> {
  const pool = await getPool();
  const normalizedEmail = input.email.trim().toLowerCase();

  const [res] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    normalizedEmail,
  ])) as [any[], any];

  if (!res || res.length === 0) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const userRow = res[0];
  const valid = verifyPassword(input.password, userRow.password_hash);
  if (!valid) {
    throw new Error('E-mail ou senha inválidos.');
  }

  const allPortfolios = await fetchAllPortfoliosFromDb();
  const userPortfolio = allPortfolios.find((p) => p.id === userRow.portfolio_id);

  if (!userPortfolio) {
    throw new Error('Portfólio vinculado a este usuário não foi encontrado.');
  }

  return {
    user: {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      portfolioId: userRow.portfolio_id,
    },
    portfolio: userPortfolio,
  };
}

// Backwards compatibility alias
export const loginUserInPostgres = loginUserInDb;
