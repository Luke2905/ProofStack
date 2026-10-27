import { SkillCategory } from '@/types/portfolio';

export interface ParsedLinkedInEducation {
  school: string;
  degree: string;
  period: string;
}

export interface ParsedLinkedInExperience {
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

export interface ParsedLinkedInSkill {
  name: string;
  category: SkillCategory;
  level: 'Avançado / Especialista' | 'Proficiência Sólida' | 'Prático';
  years: number;
}

export interface ParsedLinkedInData {
  name?: string;
  headline?: string;
  location?: string;
  email?: string;
  linkedinUrl?: string;
  slug?: string;
  summary?: string;
  skills: ParsedLinkedInSkill[];
  experiences: ParsedLinkedInExperience[];
  education: ParsedLinkedInEducation[];
  languages: string[];
}

export function inferSkillCategory(skillName: string): SkillCategory {
  const s = skillName.toLowerCase();
  if (
    /react|next|vue|angular|svelte|tailwind|css|html|typescript|javascript|redux|sass|styled|ui|frontend|front-end|bootstrap|vite|webpack/i.test(
      s
    )
  ) {
    return 'Frontend';
  }
  if (
    /node|express|nest|python|django|fastapi|flask|java\b|spring|c#|\.net|php|laravel|golang|go\b|rust|ruby|backend|back-end|api|graphql|rest/i.test(
      s
    )
  ) {
    return 'Backend';
  }
  if (
    /postgres|mysql|mongo|redis|sql|prisma|typeorm|database|banco|cassandra|dynamo|sqlite|mariadb/i.test(
      s
    )
  ) {
    return 'Banco de Dados';
  }
  if (
    /docker|kubernetes|aws|azure|gcp|cloud|ci\/cd|devops|linux|terraform|git\b|github actions|nginx|microservices|serverless/i.test(
      s
    )
  ) {
    return 'DevOps & Cloud';
  }
  if (/react native|flutter|swift|kotlin|ios|android|mobile/i.test(s)) {
    return 'Mobile';
  }
  return 'Arquitetura & Ferramentas';
}

/**
 * Parses raw text extracted from LinkedIn's "Save to PDF" feature
 * Supports Portuguese and English exports.
 */
export function parseLinkedInRawText(rawText: string): ParsedLinkedInData {
  const clean = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n') // remove form feed page breaks
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/Página \d+ de \d+/gi, '');

  const lines = clean
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result: ParsedLinkedInData = {
    skills: [],
    experiences: [],
    education: [],
    languages: [],
  };

  // 1. Email extraction
  const emailMatch = clean.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    result.email = emailMatch[0].toLowerCase();
  }

  // 2. LinkedIn URL and Slug
  const linkedinMatch = clean.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i
  );
  if (linkedinMatch) {
    result.linkedinUrl = `https://www.linkedin.com/in/${linkedinMatch[1]}`;
    result.slug = linkedinMatch[1].toLowerCase();
  }

  // Detect section indices
  // Standard LinkedIn section markers
  const sectionKeywords: { key: string; regex: RegExp }[] = [
    { key: 'contact', regex: /^(Contato|Contact)$/i },
    { key: 'top_skills', regex: /^(Principais competências|Top Skills)$/i },
    { key: 'languages', regex: /^(Idiomas|Languages)$/i },
    { key: 'certifications', regex: /^(Certificações|Certifications)$/i },
    { key: 'summary', regex: /^(Resumo|Summary|About)$/i },
    { key: 'experience', regex: /^(Experiência|Experience)$/i },
    { key: 'education', regex: /^(Formação acadêmica|Education)$/i },
  ];

  interface SectionRange {
    key: string;
    start: number;
    end: number;
  }

  const foundSections: { key: string; lineIndex: number }[] = [];

  lines.forEach((line, idx) => {
    for (const sec of sectionKeywords) {
      if (sec.regex.test(line)) {
        foundSections.push({ key: sec.key, lineIndex: idx });
        break;
      }
    }
  });

  foundSections.sort((a, b) => a.lineIndex - b.lineIndex);

  const ranges: SectionRange[] = [];
  for (let i = 0; i < foundSections.length; i++) {
    const cur = foundSections[i];
    const nextIdx =
      i + 1 < foundSections.length ? foundSections[i + 1].lineIndex : lines.length;
    ranges.push({
      key: cur.key,
      start: cur.lineIndex + 1,
      end: nextIdx,
    });
  }

  const getSectionLines = (key: string): string[] => {
    const r = ranges.find((range) => range.key === key);
    if (!r) return [];
    return lines.slice(r.start, r.end);
  };

  // 3. Extract Top Skills
  const skillLines = getSectionLines('top_skills');
  const seenSkills = new Set<string>();

  skillLines.forEach((s) => {
    const cleanName = s.replace(/^[•\-\*]\s*/, '').trim();
    if (
      cleanName &&
      cleanName.length < 50 &&
      !cleanName.toLowerCase().startsWith('page') &&
      !seenSkills.has(cleanName.toLowerCase())
    ) {
      seenSkills.add(cleanName.toLowerCase());
      result.skills.push({
        name: cleanName,
        category: inferSkillCategory(cleanName),
        level: 'Avançado / Especialista',
        years: 3,
      });
    }
  });

  // 4. Extract Languages
  const langLines = getSectionLines('languages');
  langLines.forEach((l) => {
    const cleanLang = l.replace(/^[•\-\*]\s*/, '').trim();
    if (cleanLang && cleanLang.length < 50) {
      result.languages.push(cleanLang);
    }
  });

  // 5. Extract Summary / Bio
  const summaryLines = getSectionLines('summary');
  if (summaryLines.length > 0) {
    result.summary = summaryLines.join('\n\n');
  }

  // 6. Extract Education
  const eduLines = getSectionLines('education');
  if (eduLines.length > 0) {
    let currentSchool = '';
    let currentDegree = '';
    let currentPeriod = '';

    const saveEdu = () => {
      if (currentSchool) {
        result.education.push({
          school: currentSchool,
          degree: currentDegree || 'Formação Acadêmica',
          period: currentPeriod || 'Concluído',
        });
      }
      currentSchool = '';
      currentDegree = '';
      currentPeriod = '';
    };

    eduLines.forEach((line) => {
      const yearMatch = line.match(/\(?(\d{4})\s*[-–]\s*(\d{4}|o momento|presente|present)\)?/i);
      if (yearMatch) {
        currentPeriod = yearMatch[0].replace(/[()]/g, '');
        const degreeInSameLine = line
          .replace(yearMatch[0], '')
          .replace(/[·•]/g, '')
          .trim();
        if (degreeInSameLine) {
          currentDegree = degreeInSameLine;
        }
        saveEdu();
      } else if (!currentSchool) {
        currentSchool = line;
      } else if (!currentDegree) {
        currentDegree = line;
      } else {
        saveEdu();
        currentSchool = line;
      }
    });

    saveEdu();
  }

  // 7. Extract Experiences
  const expLines = getSectionLines('experience');
  if (expLines.length > 0) {
    const dateRegex =
      /(?:(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(?:de\s+)?\d{4}|\d{4})\s*[-–]\s*(?:(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(?:de\s+)?\d{4}|o momento|presente|present|\d{4})/i;

    const parsedExps: ParsedLinkedInExperience[] = [];
    let curExp: Partial<ParsedLinkedInExperience> | null = null;
    let descLines: string[] = [];

    const finalizeCurrent = () => {
      if (curExp && curExp.company && curExp.role) {
        const fullDesc = descLines.join(' ').trim();
        const achievements: string[] = [];
        // Extract bulleted accomplishments or sentences mentioning metrics
        descLines.forEach((dl) => {
          if (/^[•\-\*]/.test(dl) || /%|\b(aumentou|reduziu|melhorou|liderou|desenvolveu|criou)\b/i.test(dl)) {
            achievements.push(dl.replace(/^[•\-\*]\s*/, '').trim());
          }
        });

        // Infer tech stack mentions from description
        const foundTechs: string[] = [];
        const commonTech = [
          'React',
          'Next.js',
          'TypeScript',
          'JavaScript',
          'Node.js',
          'PostgreSQL',
          'MySQL',
          'Docker',
          'AWS',
          'Python',
          'Java',
          'Git',
          'Tailwind CSS',
          'GraphQL',
          'REST API',
        ];
        commonTech.forEach((t) => {
          if (new RegExp(`\\b${t}\\b`, 'i').test(fullDesc)) {
            foundTechs.push(t);
          }
        });

        parsedExps.push({
          company: curExp.company,
          role: curExp.role,
          location: curExp.location || 'Brasil (Remoto)',
          startDate: curExp.startDate || 'Jan 2023',
          endDate: curExp.endDate || 'Atual',
          isCurrent: curExp.isCurrent ?? true,
          description: fullDesc || `${curExp.role} na empresa ${curExp.company}.`,
          achievements: achievements.slice(0, 4),
          technologies: foundTechs.length > 0 ? foundTechs : ['TypeScript', 'React'],
        });
      }
      curExp = null;
      descLines = [];
    };

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const match = line.match(dateRegex);

      if (match) {
        // Date line found! The lines right before it are role and company.
        const dateRangeStr = match[0];
        const isCurrent = /o momento|presente|present/i.test(dateRangeStr);
        const parts = dateRangeStr.split(/[-–]/);
        const startDate = parts[0]?.trim() || 'Jan 2023';
        const endDate = isCurrent ? 'Atual' : parts[1]?.trim() || 'Jan 2024';

        // Check previous lines in expLines
        let company = '';
        let role = '';

        if (descLines.length >= 2) {
          company = descLines[descLines.length - 2];
          role = descLines[descLines.length - 1];
          descLines = descLines.slice(0, descLines.length - 2);
          finalizeCurrent();
        } else if (descLines.length === 1) {
          role = descLines[0];
          company = 'Empresa Confidencial';
          descLines = [];
          finalizeCurrent();
        } else {
          company = 'Empresa Tech';
          role = 'Desenvolvedor';
        }

        // The line following the date might be location (e.g., "São Paulo, Brasil")
        let location = 'Remoto';
        if (i + 1 < expLines.length) {
          const nextLine = expLines[i + 1];
          if (
            /brasil|brazil|são paulo|rio|remoto|remote|hybrid|híbrido|área|area/i.test(
              nextLine
            ) &&
            !dateRegex.test(nextLine)
          ) {
            location = nextLine;
            i++; // skip location line
          }
        }

        curExp = {
          company,
          role,
          location,
          startDate,
          endDate,
          isCurrent,
        };
      } else {
        descLines.push(line);
      }
    }

    finalizeCurrent();
    result.experiences = parsedExps;
  }

  // 8. Extract Name, Headline and Location
  // First attempt: match against slug words from the LinkedIn profile URL (most accurate)
  if (result.slug) {
    const slugParts = result.slug.split('-').filter((p) => p.length > 2);
    const matchedLine = lines.find((l) => {
      const lower = l.toLowerCase();
      return (
        slugParts.every((part) => lower.includes(part)) &&
        l.length < 50 &&
        !l.includes('linkedin.com')
      );
    });

    if (matchedLine) {
      result.name = matchedLine;
      const nameIdx = lines.indexOf(matchedLine);
      if (nameIdx !== -1 && nameIdx + 1 < lines.length) {
        const nextL = lines[nameIdx + 1];
        if (!sectionKeywords.some((sk) => sk.regex.test(nextL))) {
          result.headline = nextL;
        }
      }
      if (nameIdx !== -1 && nameIdx + 2 < lines.length) {
        const locL = lines[nameIdx + 2];
        if (
          /brasil|brazil|são paulo|rio|remoto|remote|hybrid|híbrido|portugal|área|area/i.test(
            locL
          )
        ) {
          result.location = locL;
        }
      }
    }
  }

  // Fallback: look at prominent non-section lines
  if (!result.name) {
    const isLineInSection = (idx: number) =>
      ranges.some((r) => idx >= r.start && idx < r.end) ||
      foundSections.some((s) => s.lineIndex === idx);

    const potentialNameLines = lines.filter((l, idx) => {
      return (
        !isLineInSection(idx) &&
        l.length > 2 &&
        l.length < 50 &&
        !l.includes('@') &&
        !l.includes('linkedin.com') &&
        !sectionKeywords.some((sk) => sk.regex.test(l)) &&
        !/^(Contato|Contact|Página|Page|\d+)$/i.test(l)
      );
    });

    if (potentialNameLines.length > 0) {
      result.name = potentialNameLines[0];
      if (potentialNameLines.length > 1) {
        result.headline = potentialNameLines[1];
      }
    }
  }

  return result;
}
