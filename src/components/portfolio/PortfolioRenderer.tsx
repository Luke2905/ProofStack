'use client';

import React, { useState } from 'react';
import { PortfolioProfile, PortfolioSectionId } from '@/types/portfolio';
import { getAvailabilityMeta } from '@/lib/utils';
import { resolveTheme } from '@/lib/themeTokens';
import {
  Github,
  Linkedin,
  Globe,
  Mail,
  MapPin,
  Calendar,
  ExternalLink,
  Star,
  GitFork,
  FileText,
  Check,
  Phone,
  ShieldCheck,
  Share2,
  Lock,
} from 'lucide-react';
import { PrintableResumeModal } from './PrintableResumeModal';
import { SharePublishModal } from './SharePublishModal';
import { Reveal, CountUp, AnimatedBar, ProductMockup } from '@/components/ui/Motion';

interface PortfolioRendererProps {
  profile: PortfolioProfile;
  isPreview?: boolean;
}

const LEVEL_PERCENT: Record<string, number> = {
  'Avançado / Especialista': 100,
  'Proficiência Sólida': 72,
  Prático: 45,
};

export function PortfolioRenderer({
  profile,
  isPreview = false,
}: PortfolioRendererProps) {
  const [projectFilter, setProjectFilter] = useState<'all' | 'featured' | 'github' | 'manual'>('all');
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { theme } = profile;
  const tk = resolveTheme(theme);
  const { r, d, t } = tk;
  const avail = getAvailabilityMeta(profile.availabilityStatus);

  const isLight = theme.mode === 'light';
  const isTerminal = theme.template === 'terminal';
  const isMinimal = theme.template === 'minimal';
  const isRecruiter = theme.template === 'recruiter';
  const fx = tk.fx;
  const useGrad = tk.accentStyle === 'gradient' && !isTerminal;

  const fontClass =
    theme.fontFamily === 'mono' || isTerminal
      ? 'font-mono'
      : theme.fontFamily === 'editorial'
      ? 'font-serif'
      : 'font-sans';

  const bgBase = isLight
    ? 'bg-[#f8fafc] text-slate-900'
    : isTerminal
    ? 'bg-[#060908] text-emerald-50'
    : fx
    ? 'bg-[#07090e] text-zinc-100'
    : 'bg-[#09090b] text-zinc-100';

  const borderColor = isLight
    ? 'border-slate-200/90'
    : isTerminal
    ? 'border-emerald-500/25'
    : 'border-white/[0.08]';

  const divider = isLight
    ? 'border-slate-200'
    : isTerminal
    ? 'border-emerald-500/20'
    : 'border-white/[0.08]';

  const glassSurface = isLight
    ? 'bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.08)]'
    : 'bg-white/[0.03] backdrop-blur-xl border border-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_40px_-24px_rgba(0,0,0,0.75)]';

  const cardSurface = `${r.card} ${
    fx && theme.cardStyle === 'glass'
      ? glassSurface
      : theme.cardStyle === 'solid'
      ? isLight
        ? 'bg-slate-100/90 border border-transparent'
        : isTerminal
        ? 'bg-[#0b110e] border border-transparent'
        : 'bg-zinc-900/90 border border-transparent'
      : `${isLight ? 'bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]' : isTerminal ? 'bg-[#0b110e]' : 'bg-[#111216]'} border ${borderColor}`
  }`;

  const customCardStyle: React.CSSProperties | undefined = tk.customSurfaceColor
    ? { backgroundColor: tk.customSurfaceColor }
    : undefined;

  const mutedText = isLight
    ? 'text-slate-600'
    : isTerminal
    ? 'text-emerald-100/65'
    : 'text-zinc-400';

  const subtleBg = isLight
    ? 'bg-slate-100/80 border-slate-200/90 text-slate-700'
    : isTerminal
    ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-100'
    : 'bg-white/[0.04] border-white/[0.08] text-zinc-200';

  const chip = `${r.chip} border ${subtleBg}`;
  const btnBase = `inline-flex items-center justify-center gap-2 ${r.button} font-semibold transition-all cursor-pointer`;
  const btnPrimary = `${btnBase} text-white px-4 py-2.5 ${t.body} hover:brightness-110`;
  const btnSecondary = `${btnBase} border px-4 py-2.5 ${t.body} ${subtleBg} hover:border-zinc-500/40`;

  const primaryBtnStyle: React.CSSProperties = useGrad
    ? {
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
        boxShadow: fx ? `0 6px 20px -6px ${theme.primaryColor}88` : undefined,
      }
    : {
        backgroundColor: theme.primaryColor,
        boxShadow: fx ? `0 6px 20px -6px ${theme.primaryColor}66` : undefined,
      };

  const visibleProjects = profile.projects.filter((proj) => {
    if (!proj.isVisible) return false;
    if (projectFilter === 'featured') return proj.isFeatured;
    if (projectFilter === 'github') return proj.isFromGithub;
    if (projectFilter === 'manual') return !proj.isFromGithub;
    return true;
  });

  const skillsByCategory = profile.skills.reduce((acc, sk) => {
    if (!acc[sk.category]) acc[sk.category] = [];
    acc[sk.category].push(sk);
    return acc;
  }, {} as Record<string, typeof profile.skills>);

  // Background pattern overlay style
  const getPatternStyle = (): React.CSSProperties | undefined => {
    const dotColor = isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.06)';
    const gridColor = isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.035)';
    if (tk.backgroundPattern === 'dots') {
      return {
        backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      };
    }
    if (tk.backgroundPattern === 'grid') {
      return {
        backgroundImage: `linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '36px 36px',
      };
    }
    if (tk.backgroundPattern === 'mesh') {
      return {
        backgroundImage: `radial-gradient(50% 45% at 12% 0%, ${theme.primaryColor}${isLight ? '14' : '22'} 0%, transparent 70%), radial-gradient(40% 40% at 90% 5%, ${theme.accentColor}${isLight ? '10' : '18'} 0%, transparent 70%)`,
      };
    }
    return undefined;
  };

  // ---- Reusable section heading ----
  const SectionHeading = ({ id }: { id: PortfolioSectionId }) => {
    const subtitle = tk.subtitle(id);
    return (
      <div className="mb-5 @sm:mb-6">
        <div className="flex items-center gap-2.5">
          {tk.headingStyle === 'accent-bar' && (
            <span
              className="w-1 h-6 rounded-full shrink-0"
              style={{ backgroundColor: theme.primaryColor }}
            />
          )}
          <h2 className={`${t.h2} font-bold tracking-tight`}>{tk.title(id)}</h2>
        </div>
        {tk.headingStyle === 'underline' && (
          <div
            className="mt-2 h-0.5 w-12"
            style={{ backgroundColor: theme.primaryColor }}
          />
        )}
        {subtitle && <p className={`${t.body} mt-1.5 ${mutedText}`}>{subtitle}</p>}
      </div>
    );
  };

  const renderHeroSection = () => {
    const isCentered = tk.heroLayout === 'centered';
    const isHeroMinimal = tk.heroLayout === 'minimal';
    const isBanner = tk.heroLayout === 'banner';

    const avatarShape =
      tk.cardRadius === 'round'
        ? 'rounded-full'
        : tk.cardRadius === 'sharp'
        ? 'rounded-lg'
        : 'rounded-2xl';

    const topBar = theme.showAvailabilityBanner && (
      <div
        className={`flex flex-col @md:flex-row @md:items-center justify-between gap-3 mb-6 ${
          isCentered ? 'items-center' : ''
        }`}
      >
        <div className={`flex flex-wrap items-center gap-2 ${isCentered ? 'justify-center' : ''}`}>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 ${r.chip} ${t.small} font-semibold border ${avail.badgeBg}`}
          >
            <span className={`w-2 h-2 rounded-full ${avail.dotColor}`} />
            {avail.label}
          </span>
          <span className={`px-2.5 py-1 ${t.small} font-medium ${chip}`}>
            {profile.seniority} · {profile.yearsOfExperience}{' '}
            {profile.yearsOfExperience === 1 ? 'ano' : 'anos'}
          </span>
          {profile.preferredModalities.length > 0 && (
            <span className={`px-2.5 py-1 ${t.small} font-medium ${chip}`}>
              {profile.preferredModalities.join(' / ')} · {profile.contractTypes.join(' / ')}
            </span>
          )}
          {!profile.showInHub && (
            <span
              title="Este portfólio não aparece nas buscas do Hub; acessível apenas via link direto"
              className={`inline-flex items-center gap-1 px-2.5 py-1 ${r.chip} ${t.small} font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400`}
            >
              <Lock className="w-3 h-3" />
              Somente com link
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start @md:self-auto">
          <button
            type="button"
            onClick={() => setIsResumeOpen(true)}
            className={`${btnSecondary} !py-1.5 !px-3 ${t.small}`}
          >
            <FileText className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
            Currículo PDF
          </button>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className={`${btnSecondary} !py-1.5 !px-3 ${t.small}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartilhar
          </button>
        </div>
      </div>
    );

    const actionsFooter = (
      <div
        className={`mt-6 pt-5 border-t ${divider} flex flex-col @sm:flex-row @sm:items-center justify-between gap-3 ${
          isCentered ? '@sm:justify-center' : ''
        }`}
      >
        <div className={`flex flex-col @xs:flex-row flex-wrap items-stretch @xs:items-center gap-2.5 ${isCentered ? 'justify-center' : ''}`}>
          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Olá ${profile.name}, vi seu portfólio e gostaria de conversar sobre uma oportunidade.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className={btnPrimary}
              style={primaryBtnStyle}
            >
              <Phone className="w-4 h-4" />
              Conversar no WhatsApp
            </a>
          )}
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(`Contato Profissional — ${profile.name}`)}`}
            className={btnSecondary}
          >
            <Mail className="w-4 h-4" style={{ color: theme.primaryColor }} />
            Enviar e-mail
          </a>
        </div>

        <div className={`flex flex-wrap items-center gap-2 ${isCentered ? 'justify-center' : ''}`}>
          {profile.githubUrl && (
            <a
              href={profile.githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`${btnSecondary} !px-3 !py-2 ${t.small}`}
              title="GitHub"
            >
              <Github className="w-4 h-4" />
              <span>@{profile.githubUsername || 'GitHub'}</span>
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className={`${btnSecondary} !px-3 !py-2 ${t.small}`}
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className={`${btnSecondary} !px-3 !py-2 ${t.small}`}
              title="Site"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    );

    const metadataRow = (
      <div
        className={`flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 ${t.small} ${mutedText} ${
          isCentered ? 'justify-center' : ''
        }`}
      >
        {profile.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
            {profile.location}
          </span>
        )}
        {profile.languages.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
            {profile.languages.join(' · ')}
          </span>
        )}
        {profile.noticePeriod && (
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: theme.primaryColor }} />
            Disponibilidade: <strong className="font-semibold">{profile.noticePeriod}</strong>
          </span>
        )}
      </div>
    );

    if (isBanner) {
      return (
        <section
          key="hero"
          className={`${cardSurface} overflow-hidden relative isolate`}
          style={customCardStyle}
        >
          {/* Top Banner Accent Strip */}
          <div
            className="h-24 @sm:h-28 w-full relative"
            style={{
              background: `linear-gradient(120deg, ${theme.primaryColor}33 0%, ${theme.accentColor}22 50%, transparent 100%)`,
              borderBottom: `1px solid ${theme.primaryColor}22`,
            }}
          >
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResumeOpen(true)}
                className={`${btnSecondary} !py-1.5 !px-3 ${t.small} backdrop-blur-md`}
              >
                <FileText className="w-3.5 h-3.5" style={{ color: theme.primaryColor }} />
                Currículo PDF
              </button>
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className={`${btnSecondary} !py-1.5 !px-3 ${t.small} backdrop-blur-md`}
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar
              </button>
            </div>
          </div>

          <div className={`${d.padLg} -mt-12 @sm:-mt-14 relative`}>
            <div className="flex flex-col @md:flex-row @md:items-end justify-between gap-4 mb-4">
              <div className="relative inline-block">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className={`w-20 h-20 @sm:w-24 @sm:h-24 object-cover border-4 ${
                    isLight ? 'border-white' : 'border-[#111216]'
                  } shadow-md ${avatarShape}`}
                />
                {profile.verifiedGithub && (
                  <span
                    title="GitHub sincronizado"
                    className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-white flex items-center gap-1 border border-zinc-700"
                  >
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    GitHub
                  </span>
                )}
              </div>

              {theme.showAvailabilityBanner && (
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 ${r.chip} ${t.small} font-semibold border ${avail.badgeBg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${avail.dotColor}`} />
                    {avail.label}
                  </span>
                  <span className={`px-2.5 py-1 ${t.small} font-medium ${chip}`}>
                    {profile.seniority} · {profile.yearsOfExperience} anos
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className={`${t.h1} font-bold tracking-tight`}>{profile.name}</h1>
              <span
                className={`px-2.5 py-0.5 ${r.chip} ${t.small} font-semibold`}
                style={{ backgroundColor: `${theme.primaryColor}18`, color: theme.primaryColor }}
              >
                {profile.roleCategory}
              </span>
            </div>
            <p className={`${t.h3} font-medium mt-1`}>{profile.headline}</p>
            <p className={`${t.body} leading-relaxed mt-2.5 max-w-3xl ${mutedText}`}>
              {profile.shortBio}
            </p>
            {metadataRow}
            {actionsFooter}
          </div>
        </section>
      );
    }

    return (
      <section
        key="hero"
        className={`${
          isHeroMinimal ? `pb-8 border-b ${divider}` : `${cardSurface} ${d.padLg}`
        } relative overflow-hidden isolate`}
        style={isHeroMinimal ? undefined : customCardStyle}
      >
        {isTerminal && (
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-emerald-500/20 text-xs text-emerald-400/80 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
              <span className="ml-2 truncate">{profile.slug}@proofstack:~$ cat profile.json</span>
            </div>
          </div>
        )}

        {topBar}

        <div
          className={`flex ${
            isCentered
              ? 'flex-col items-center text-center'
              : 'flex-col @md:flex-row items-start @md:items-center'
          } gap-5 @md:gap-7`}
        >
          <div className="relative shrink-0">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className={`w-20 h-20 @sm:w-24 @sm:h-24 @md:w-28 @md:h-28 object-cover border ${borderColor} ${avatarShape}`}
            />
            {profile.verifiedGithub && (
              <div
                title="GitHub conectado"
                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-white flex items-center gap-1 border border-zinc-700"
              >
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                GitHub
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={`flex items-center gap-2.5 flex-wrap ${
                isCentered ? 'justify-center' : ''
              }`}
            >
              <h1 className={`${t.h1} font-bold tracking-tight`}>{profile.name}</h1>
              <span
                className={`px-2.5 py-0.5 ${r.chip} ${t.small} font-semibold`}
                style={{ backgroundColor: `${theme.primaryColor}18`, color: theme.primaryColor }}
              >
                {profile.roleCategory}
              </span>
            </div>

            <p className={`${t.h3} font-medium mt-1.5`}>{profile.headline}</p>
            <p
              className={`${t.body} leading-relaxed mt-2.5 max-w-3xl ${mutedText} ${
                isCentered ? 'mx-auto' : ''
              }`}
            >
              {profile.shortBio}
            </p>

            {metadataRow}
          </div>
        </div>

        {actionsFooter}
      </section>
    );
  };

  const renderRecruiterHighlightsSection = () => {
    const topSkills = [...profile.skills].sort((a, b) => b.years - a.years).slice(0, 4);
    const maxYears = Math.max(1, ...topSkills.map((s) => s.years));
    const publishedCount = profile.projects.filter((p) => p.isVisible).length;
    const featuredCount = profile.projects.filter((p) => p.isVisible && p.isFeatured).length;
    const showGh = theme.showGithubStats;
    const tile = `${cardSurface} ${d.pad} h-full`;
    const label = `${t.small} font-medium ${mutedText}`;
    const barColor = useGrad
      ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`
      : theme.primaryColor;
    const track = isLight ? 'bg-slate-200' : 'bg-white/10';

    return (
      <section key="recruiter_highlights">
        <h2 className="sr-only">{tk.title('recruiter_highlights')}</h2>
        <div className={`grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 ${d.itemGap}`}>
          {/* A — Experiência + anos por tecnologia */}
          <Reveal enabled={fx} className="@sm:col-span-2 @lg:row-span-2">
            <div className={`${tile} flex flex-col justify-between gap-4`} style={customCardStyle}>
              <div className="flex items-baseline justify-between gap-4 flex-wrap">
                <div>
                  <div className={label}>Experiência Acumulada</div>
                  <div className="mt-1.5 flex items-baseline gap-2">
                    <span
                      className="text-3xl @sm:text-4xl font-bold tracking-tight leading-none"
                      style={{ color: theme.primaryColor }}
                    >
                      <CountUp value={profile.yearsOfExperience} enabled={fx} />
                    </span>
                    <span className={`${t.h3} font-semibold`}>
                      {profile.yearsOfExperience === 1 ? 'ano' : 'anos'}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 ${t.small} font-medium ${chip}`}>
                  {profile.seniority} · {profile.roleCategory}
                </span>
              </div>

              {topSkills.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                  <div className={label}>Principais tecnologias por tempo de prática</div>
                  {topSkills.map((s, i) => (
                    <div key={s.id}>
                      <div className={`flex items-center justify-between ${t.small} mb-1`}>
                        <span className="font-medium">{s.name}</span>
                        <span className={mutedText}>
                          {s.years} {s.years === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                      <AnimatedBar
                        percent={(s.years / maxYears) * 100}
                        color={barColor}
                        trackClass={track}
                        enabled={fx}
                        delay={i * 70}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          {/* B — GitHub */}
          {showGh && (
            <Reveal enabled={fx} delay={60} className="@sm:col-span-2">
              <div className={`${tile} flex flex-col justify-between gap-3`} style={customCardStyle}>
                <div className="flex items-center justify-between">
                  <span className={label}>Repositórios & Código Aberto (GitHub)</span>
                  <Github className="w-4 h-4" style={{ color: theme.primaryColor }} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-2xl @sm:text-3xl font-bold tracking-tight leading-none">
                      <CountUp value={profile.githubStats.publicRepos} enabled={fx} />
                    </div>
                    <div className={`${t.small} mt-1 ${mutedText}`}>repositórios</div>
                  </div>
                  <div>
                    <div className="text-2xl @sm:text-3xl font-bold tracking-tight leading-none">
                      <CountUp value={profile.githubStats.totalStars} enabled={fx} />
                    </div>
                    <div className={`${t.small} mt-1 ${mutedText}`}>estrelas</div>
                  </div>
                  <div>
                    <div className="text-2xl @sm:text-3xl font-bold tracking-tight leading-none">
                      <CountUp value={profile.githubStats.followers} enabled={fx} />
                    </div>
                    <div className={`${t.small} mt-1 ${mutedText}`}>seguidores</div>
                  </div>
                </div>
                {profile.githubStats.topLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.githubStats.topLanguages.slice(0, 5).map((l) => (
                      <span key={l} className={`px-2 py-0.5 ${t.small} ${chip}`}>
                        {l}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          )}

          {/* C — Contratação */}
          <Reveal enabled={fx} delay={120} className={showGh ? '' : '@sm:col-span-2'}>
            <div className={`${tile} flex flex-col justify-between gap-2.5`} style={customCardStyle}>
              <div className={label}>Formato & Contratação</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.contractTypes.map((c) => (
                  <span
                    key={c}
                    className={`px-2.5 py-0.5 ${t.small} font-semibold ${r.chip}`}
                    style={{ backgroundColor: `${theme.primaryColor}1a`, color: theme.primaryColor }}
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className={`${t.small} ${mutedText}`}>
                {profile.preferredModalities.join(' · ')}
                {profile.compensationExpectation ? ` · ${profile.compensationExpectation}` : ''}
              </p>
            </div>
          </Reveal>

          {/* D — Projetos */}
          <Reveal enabled={fx} delay={180} className={showGh ? '' : '@sm:col-span-2'}>
            <div className={`${tile} flex flex-col justify-between gap-1`} style={customCardStyle}>
              <div className={label}>Portfólio de Projetos</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl @sm:text-3xl font-bold tracking-tight leading-none">
                  <CountUp value={publishedCount} enabled={fx} />
                </span>
                <span className={`${t.small} ${mutedText}`}>
                  {publishedCount === 1 ? 'case publicado' : 'cases publicados'}
                </span>
              </div>
              <p className={`${t.small} mt-1 ${mutedText}`}>
                {featuredCount > 0
                  ? `${featuredCount} em destaque principal`
                  : 'Problema, arquitetura e impacto'}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  };

  const renderProjectCard = (proj: (typeof visibleProjects)[number], index: number) => {
    const isListLayout =
      tk.projectsLayout === 'list' ||
      (tk.projectsLayout === 'auto' && (isRecruiter || isMinimal));
    const hasCover = tk.showProjectCovers && (fx || Boolean(proj.coverImageUrl));
    const isFeaturedFirst =
      tk.projectsLayout === 'auto' &&
      theme.template === 'bento' &&
      index === 0 &&
      visibleProjects.length > 1;

    return (
      <Reveal
        key={proj.id}
        enabled={fx}
        delay={Math.min(index, 5) * 60}
        className={isFeaturedFirst ? '@lg:col-span-2' : ''}
      >
        <article
          className={`group h-full ${cardSurface} overflow-hidden flex ${
            isListLayout && hasCover
              ? 'flex-col @md:flex-row'
              : isFeaturedFirst && hasCover
              ? 'flex-col @lg:flex-row'
              : 'flex-col'
          } transition-colors`}
          style={customCardStyle}
        >
          {hasCover && fx && (
            <div
              className={`relative shrink-0 p-3.5 @sm:p-4 ${
                isListLayout
                  ? '@md:w-72 @lg:w-80'
                  : isFeaturedFirst
                  ? '@lg:w-[46%]'
                  : 'pb-0'
              }`}
            >
              <ProductMockup
                className="relative"
                title={proj.title}
                url={proj.demoUrl || proj.repoUrl}
                imageUrl={proj.coverImageUrl || undefined}
                tags={proj.techStack}
                primary={theme.primaryColor}
                accent={theme.accentColor}
                dark={!isLight}
              />
              {proj.isFeatured && (
                <span
                  className={`absolute top-6 right-6 px-2.5 py-0.5 ${r.chip} text-[11px] font-semibold text-white shadow`}
                  style={primaryBtnStyle}
                >
                  Destaque
                </span>
              )}
            </div>
          )}

          {hasCover && !fx && (
            <div
              className={`relative overflow-hidden shrink-0 ${
                isLight ? 'bg-slate-200' : 'bg-zinc-900'
              } ${
                isListLayout
                  ? '@md:w-64 h-44 @md:h-auto'
                  : isFeaturedFirst
                  ? '@lg:w-[45%] h-48 @lg:h-auto'
                  : 'h-44'
              }`}
            >
              {proj.coverImageUrl && (
                <img
                  src={proj.coverImageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              {proj.isFeatured && (
                <span
                  className={`absolute top-3 left-3 px-2.5 py-0.5 ${r.chip} text-[11px] font-semibold text-white`}
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Destaque
                </span>
              )}
            </div>
          )}

          <div className={`${d.pad} flex flex-col justify-between flex-1 min-w-0`}>
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className={`${t.h3} font-bold tracking-tight`}>
                    {!hasCover && proj.isFeatured && (
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-2 align-middle"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                    )}
                    {proj.title}
                  </h3>
                  <p className={`${t.small} mt-0.5 ${mutedText}`}>
                    {[proj.role, proj.clientOrCompany, proj.year].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {proj.isFromGithub && (proj.starsCount > 0 || proj.forksCount > 0) && (
                  <div className={`flex items-center gap-2.5 ${t.small} ${mutedText} shrink-0`}>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {proj.starsCount}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {proj.forksCount}
                    </span>
                  </div>
                )}
              </div>

              {proj.subtitle && <p className={`${t.body} mt-1.5 font-medium`}>{proj.subtitle}</p>}

              <dl className={`mt-3.5 space-y-2.5 ${t.small}`}>
                {proj.problemStatement && (
                  <div>
                    <dt className="font-semibold" style={{ color: theme.primaryColor }}>
                      Problema & Contexto
                    </dt>
                    <dd className={`mt-0.5 leading-relaxed ${mutedText}`}>{proj.problemStatement}</dd>
                  </div>
                )}
                {proj.solutionDetails && (
                  <div>
                    <dt className="font-semibold" style={{ color: theme.primaryColor }}>
                      Arquitetura & Solução
                    </dt>
                    <dd className={`mt-0.5 leading-relaxed ${mutedText}`}>{proj.solutionDetails}</dd>
                  </div>
                )}
                {theme.showImpactHighlights && proj.impactMetrics && (
                  <div
                    className={`px-3 py-2 ${r.inner} border`}
                    style={{
                      backgroundColor: `${theme.accentColor}12`,
                      borderColor: `${theme.accentColor}30`,
                    }}
                  >
                    <dt className="font-semibold" style={{ color: theme.accentColor }}>
                      Impacto & Resultados
                    </dt>
                    <dd className="mt-0.5 font-medium">{proj.impactMetrics}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-3">
              {proj.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.map((tech) => (
                    <span key={tech} className={`px-2 py-0.5 ${t.small} font-medium ${chip}`}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {(proj.demoUrl || proj.repoUrl) && (
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnPrimary} !py-2 !px-3.5 ${t.small}`}
                      style={primaryBtnStyle}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver em Produção
                    </a>
                  )}
                  {proj.repoUrl && (
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${btnSecondary} !py-2 !px-3.5 ${t.small}`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      Código-fonte
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>
      </Reveal>
    );
  };

  const renderProjectsSection = () => {
    const isListLayout =
      tk.projectsLayout === 'list' ||
      (tk.projectsLayout === 'auto' && (isRecruiter || isMinimal));
    const visibleCount = profile.projects.filter((p) => p.isVisible).length;

    return (
      <section key="projects">
        <div className="flex flex-col @sm:flex-row @sm:items-end justify-between gap-3">
          <SectionHeading id="projects" />
          {visibleCount > 1 && (
            <div
              className={`inline-flex p-1 mb-5 @sm:mb-6 ${r.inner} border self-start max-w-full overflow-x-auto ${subtleBg}`}
            >
              {[
                { id: 'all', label: 'Todos' },
                { id: 'featured', label: 'Destaques' },
                { id: 'github', label: 'GitHub' },
                { id: 'manual', label: 'Cases' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setProjectFilter(tab.id as typeof projectFilter)}
                  className={`px-2.5 @sm:px-3 py-1.5 ${r.button} ${t.small} font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    projectFilter === tab.id ? 'text-white' : `${mutedText} hover:opacity-80`
                  }`}
                  style={projectFilter === tab.id ? { backgroundColor: theme.primaryColor } : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {visibleProjects.length === 0 ? (
          <div
            className={`${d.pad} ${cardSurface} text-center ${t.body} ${mutedText} py-10`}
            style={customCardStyle}
          >
            Nenhum projeto encontrado para este filtro.
          </div>
        ) : (
          <div
            className={`grid ${d.itemGap} ${
              isListLayout ? 'grid-cols-1' : 'grid-cols-1 @lg:grid-cols-2'
            }`}
          >
            {visibleProjects.map((proj, i) => renderProjectCard(proj, i))}
          </div>
        )}
      </section>
    );
  };

  const renderSkillsSection = () => {
    const barColor = useGrad
      ? `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`
      : theme.primaryColor;
    const track = isLight ? 'bg-slate-200' : 'bg-white/10';

    return (
      <section key="skills">
        <SectionHeading id="skills" />

        <div
          className={`grid grid-cols-1 ${
            tk.skillsLayout === 'tags'
              ? '@md:grid-cols-2'
              : '@md:grid-cols-2 @lg:grid-cols-3'
          } ${d.itemGap}`}
        >
          {Object.entries(skillsByCategory).map(([category, items], catIndex) => (
            <Reveal key={category} enabled={fx} delay={Math.min(catIndex, 5) * 60}>
              <div className={`${cardSurface} ${d.pad} h-full`} style={customCardStyle}>
                <h3
                  className={`${t.small} font-bold uppercase tracking-wider mb-3 flex items-center justify-between`}
                  style={{ color: theme.primaryColor }}
                >
                  <span>{category}</span>
                  <span className={`font-medium normal-case ${mutedText}`}>{items.length}</span>
                </h3>

                {tk.skillsLayout === 'tags' && (
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((skill) => (
                      <span
                        key={skill.id}
                        title={`${skill.level} · ${skill.years} ${skill.years === 1 ? 'ano' : 'anos'}`}
                        className={`px-2.5 py-1 ${t.small} font-medium ${chip}`}
                      >
                        {skill.name}
                        <span className={`ml-1.5 ${mutedText}`}>{skill.years}a</span>
                      </span>
                    ))}
                  </div>
                )}

                {tk.skillsLayout === 'bars' && (
                  <div className="space-y-3">
                    {items.map((skill, i) => (
                      <div key={skill.id}>
                        <div className={`flex items-center justify-between ${t.small} mb-1`}>
                          <span className="font-semibold">{skill.name}</span>
                          <span className={mutedText}>
                            {skill.years} {skill.years === 1 ? 'ano' : 'anos'}
                          </span>
                        </div>
                        <AnimatedBar
                          percent={LEVEL_PERCENT[skill.level] ?? 60}
                          color={barColor}
                          trackClass={track}
                          enabled={fx}
                          delay={i * 60}
                        />
                        <div className={`text-[10px] mt-1 ${mutedText}`}>{skill.level}</div>
                      </div>
                    ))}
                  </div>
                )}

                {tk.skillsLayout === 'grid' && (
                  <div className="space-y-2">
                    {items.map((skill) => (
                      <div
                        key={skill.id}
                        className={`px-3 py-2 ${r.inner} border flex items-center justify-between gap-2 ${subtleBg}`}
                      >
                        <div className="min-w-0">
                          <div className={`${t.small} font-semibold truncate`}>{skill.name}</div>
                          <div className={`text-[11px] ${mutedText}`}>{skill.level}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 ${r.chip} text-[11px] font-semibold shrink-0`}
                          style={{
                            backgroundColor: `${theme.primaryColor}18`,
                            color: theme.primaryColor,
                          }}
                        >
                          {skill.years} {skill.years === 1 ? 'ano' : 'anos'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    );
  };

  const renderExperienceSection = () => (
    <section key="experience">
      <SectionHeading id="experience" />

      {tk.experienceLayout === 'timeline' ? (
        <ol className="relative">
          <span
            aria-hidden
            className={`absolute left-[7px] top-2 bottom-2 w-px ${
              fx ? '' : isLight ? 'bg-slate-300' : isTerminal ? 'bg-emerald-500/25' : 'bg-zinc-800'
            }`}
            style={
              fx
                ? {
                    background: `linear-gradient(180deg, ${theme.primaryColor}, ${theme.accentColor}66 70%, transparent)`,
                  }
                : undefined
            }
          />
          {profile.experiences.map((exp, i) => (
            <li key={exp.id} className="relative pl-7 @sm:pl-9 pb-7 @sm:pb-8 last:pb-0">
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
                  isLight ? 'bg-white' : isTerminal ? 'bg-[#060908]' : 'bg-[#07090e]'
                }`}
                style={{
                  borderColor: theme.primaryColor,
                  backgroundColor: exp.isCurrent ? theme.primaryColor : undefined,
                }}
              />
              <Reveal enabled={fx} delay={Math.min(i, 4) * 50}>
                <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between gap-1">
                  <h3 className={`${t.h3} font-bold`}>{exp.role}</h3>
                  <span className={`${t.small} font-mono ${mutedText}`}>
                    {exp.startDate} — {exp.isCurrent ? 'Atual' : exp.endDate}
                  </span>
                </div>
                <p className={`${t.body} font-medium mt-0.5`} style={{ color: theme.primaryColor }}>
                  {exp.company}
                  <span className={`font-normal ${mutedText}`}> · {exp.location}</span>
                </p>
                {exp.description && (
                  <p className={`${t.body} mt-2 leading-relaxed ${mutedText}`}>{exp.description}</p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {exp.achievements.map((ach, k) => (
                      <li key={k} className={`${t.body} flex items-start gap-2`}>
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: theme.accentColor }}
                        />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className={`px-2 py-0.5 ${t.small} ${chip}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      ) : (
        <div className={`grid ${d.itemGap}`}>
          {profile.experiences.map((exp, i) => (
            <Reveal key={exp.id} enabled={fx} delay={Math.min(i, 4) * 50}>
              <div className={`${cardSurface} ${d.padLg}`} style={customCardStyle}>
                <div
                  className={`flex flex-col @sm:flex-row @sm:items-start justify-between gap-2 pb-3 border-b ${divider}`}
                >
                  <div>
                    <h3 className={`${t.h3} font-bold`}>{exp.role}</h3>
                    <p
                      className={`${t.body} font-medium mt-0.5`}
                      style={{ color: theme.primaryColor }}
                    >
                      {exp.company}
                      <span className={`font-normal ${mutedText}`}> · {exp.location}</span>
                    </p>
                  </div>
                  <div className={`${t.small} font-mono px-2.5 py-1 ${chip} self-start`}>
                    {exp.startDate} — {exp.isCurrent ? 'Atual' : exp.endDate}
                  </div>
                </div>
                {exp.description && (
                  <p className={`${t.body} mt-3 leading-relaxed ${mutedText}`}>
                    {exp.description}
                  </p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="mt-3.5 space-y-1.5">
                    {exp.achievements.map((ach, k) => (
                      <li key={k} className={`${t.body} flex items-start gap-2`}>
                        <Check
                          className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: theme.accentColor }}
                        />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span key={tech} className={`px-2 py-0.5 ${t.small} ${chip}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );

  const renderContactSection = () => {
    const subtitle = tk.subtitle('contact');
    return (
      <section
        key="contact"
        className={`${cardSurface} ${d.padLg} text-center relative overflow-hidden isolate`}
        style={customCardStyle}
      >
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 ${r.chip} ${t.small} font-semibold border mb-3.5 ${avail.badgeBg}`}
        >
          <span className={`w-2 h-2 rounded-full ${avail.dotColor}`} />
          {avail.label}
        </span>
        <h2 className={`${t.h2} font-bold max-w-xl mx-auto`}>{tk.title('contact')}</h2>
        {subtitle && <p className={`${t.body} max-w-xl mx-auto mt-1.5 ${mutedText}`}>{subtitle}</p>}
        <p className={`${t.small} max-w-xl mx-auto mt-1 ${mutedText}`}>
          {profile.preferredModalities.join(' / ')} · {profile.contractTypes.join(', ')}
        </p>

        <div className="mt-5 flex flex-col @xs:flex-row flex-wrap items-stretch @xs:items-center justify-center gap-2.5">
          {profile.whatsapp && (
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className={`${btnPrimary} !px-5 !py-2.5`}
              style={primaryBtnStyle}
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          )}
          <a href={`mailto:${profile.email}`} className={`${btnSecondary} !px-5 !py-2.5 break-all`}>
            <Mail className="w-4 h-4 shrink-0" />
            <span>{profile.email}</span>
          </a>
          <button
            type="button"
            onClick={() => setIsResumeOpen(true)}
            className={`${btnSecondary} !px-5 !py-2.5`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            Exportar Currículo PDF
          </button>
        </div>
      </section>
    );
  };

  const sectionRenderers: Record<PortfolioSectionId, () => React.ReactNode> = {
    hero: renderHeroSection,
    recruiter_highlights: renderRecruiterHighlightsSection,
    projects: renderProjectsSection,
    skills: renderSkillsSection,
    experience: renderExperienceSection,
    contact: renderContactSection,
  };

  return (
    <div
      className={`@container relative isolate min-h-full w-full overflow-x-hidden transition-colors duration-200 ${bgBase} ${fontClass}`}
      style={{
        ...(tk.customBgColor ? { backgroundColor: tk.customBgColor } : {}),
        ...getPatternStyle(),
      }}
    >
      <div
        className={`mx-auto px-3.5 @sm:px-6 @lg:px-8 py-5 @sm:py-8 ${d.sectionGap} ${
          isPreview ? 'max-w-5xl' : 'max-w-6xl'
        }`}
      >
        {theme.sectionOrder.map((secId) => {
          if (!theme.visibleSections[secId]) return null;
          const fn = sectionRenderers[secId];
          return fn ? fn() : null;
        })}
      </div>

      <PrintableResumeModal
        profile={profile}
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
      <SharePublishModal
        profile={profile}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
