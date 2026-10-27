'use client';

import React, { useRef, useState } from 'react';
import { PortfolioProfile } from '@/types/portfolio';
import { getAvailabilityMeta } from '@/lib/utils';
import {
  X,
  Printer,
  FileText,
  Columns,
  AlignLeft,
  LayoutTemplate,
} from 'lucide-react';

interface PrintableResumeModalProps {
  profile: PortfolioProfile;
  isOpen: boolean;
  onClose: () => void;
}

type ResumeFormat = 'executive' | 'ats' | 'compact';

export function PrintableResumeModal({
  profile,
  isOpen,
  onClose,
}: PrintableResumeModalProps) {
  const [format, setFormat] = useState<ResumeFormat>('executive');
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const avail = getAvailabilityMeta(profile.availabilityStatus);
  const visibleProjects = profile.projects.filter((p) => p.isVisible);
  const accent = format === 'ats' ? '#111827' : profile.theme.primaryColor || '#1d4ed8';

  // Group skills by category for clean structured display
  const skillsByCategory = profile.skills.reduce((acc, sk) => {
    if (!acc[sk.category]) acc[sk.category] = [];
    acc[sk.category].push(sk);
    return acc;
  }, {} as Record<string, typeof profile.skills>);

  const handlePrintPdf = () => {
    if (!sheetRef.current) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const safeName = profile.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const styleTags = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]')
    )
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Curriculo_${safeName}</title>
  ${styleTags}
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #09090b !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
    }
    .resume-print-sheet {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
    .avoid-break {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <div class="resume-print-sheet">${sheetRef.current.innerHTML}</div>
</body>
</html>`);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 350);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm print:static print:bg-white"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Control Bar */}
      <div className="shrink-0 bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Currículo & Exportação PDF — {profile.name}
              </h3>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Escolha o formato abaixo e salve em A4 com texto selecionável para recrutadores e ATS
              </p>
            </div>
          </div>

          {/* Format Selector & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
              {[
                { id: 'executive', label: 'Executivo', icon: LayoutTemplate },
                { id: 'ats', label: 'ATS Linear', icon: AlignLeft },
                { id: 'compact', label: '2 Colunas', icon: Columns },
              ].map((item) => {
                const Icon = item.icon;
                const active = format === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormat(item.id as ResumeFormat)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSummary}
                  onChange={(e) => setIncludeSummary(e.target.checked)}
                  className="accent-blue-500"
                />
                Resumo
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProjects}
                  onChange={(e) => setIncludeProjects(e.target.checked)}
                  className="accent-blue-500"
                />
                Projetos
              </label>
            </div>

            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar PDF
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable A4 Preview Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-8 flex justify-center print:p-0 print:overflow-visible">
        <div
          ref={sheetRef}
          className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-zinc-900 shadow-2xl rounded-sm p-6 sm:p-10 md:p-12 print:shadow-none print:p-0 ${
            format === 'ats' ? 'font-sans' : 'font-sans'
          }`}
        >
          {/* HEADER */}
          <header
            className="pb-4 mb-5 border-b-2"
            style={{ borderColor: format === 'ats' ? '#18181b' : accent }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-950 leading-tight">
                  {profile.name}
                </h1>
                <p
                  className="text-sm sm:text-base font-semibold mt-0.5"
                  style={{ color: accent }}
                >
                  {profile.headline}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  {profile.seniority} ({profile.yearsOfExperience}{' '}
                  {profile.yearsOfExperience === 1 ? 'ano' : 'anos'} de experiência) ·{' '}
                  {profile.preferredModalities.join(' / ')} ·{' '}
                  {profile.contractTypes.join(' / ')}
                  {profile.noticePeriod ? ` · Início: ${profile.noticePeriod}` : ''}
                </p>
              </div>

              <div className="text-xs text-zinc-700 space-y-0.5 sm:text-right shrink-0">
                {profile.location && <div>{profile.location}</div>}
                {profile.email && <div className="font-medium text-zinc-900">{profile.email}</div>}
                {profile.whatsapp && <div>+{profile.whatsapp.replace(/^\+/, '')}</div>}
                {profile.linkedinUrl && (
                  <div>{profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>
                )}
                {profile.githubUsername && <div>github.com/{profile.githubUsername}</div>}
                {profile.websiteUrl && (
                  <div>{profile.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}</div>
                )}
              </div>
            </div>
          </header>

          {/* COMPACT 2-COLUMN LAYOUT */}
          {format === 'compact' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Main Column (8 cols) */}
              <div className="md:col-span-8 space-y-5">
                {includeSummary && (profile.shortBio || profile.aboutMarkdown) && (
                  <section className="avoid-break">
                    <h2
                      className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: accent }}
                    >
                      Resumo Profissional
                    </h2>
                    <p className="text-xs text-zinc-800 leading-relaxed">
                      {profile.shortBio}
                      {profile.aboutMarkdown ? ` ${profile.aboutMarkdown}` : ''}
                    </p>
                  </section>
                )}

                {profile.experiences.length > 0 && (
                  <section>
                    <h2
                      className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
                      style={{ color: accent }}
                    >
                      Experiência Profissional
                    </h2>
                    <div className="space-y-3.5">
                      {profile.experiences.map((exp) => (
                        <div key={exp.id} className="avoid-break">
                          <div className="flex items-baseline justify-between gap-2 flex-wrap">
                            <h3 className="text-xs font-bold text-zinc-950">
                              {exp.role}{' '}
                              <span className="font-semibold text-zinc-700">
                                · {exp.company}
                              </span>
                            </h3>
                            <span className="text-[11px] text-zinc-500">
                              {exp.startDate} — {exp.isCurrent ? 'Atual' : exp.endDate}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-zinc-700 mt-1 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                          {exp.achievements.length > 0 && (
                            <ul className="mt-1.5 space-y-0.5 list-disc list-inside text-[11px] text-zinc-800">
                              {exp.achievements.map((ach, i) => (
                                <li key={i}>{ach}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {includeProjects && visibleProjects.length > 0 && (
                  <section>
                    <h2
                      className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
                      style={{ color: accent }}
                    >
                      Projetos & Cases Técnicos
                    </h2>
                    <div className="space-y-3">
                      {visibleProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="avoid-break pb-2.5 border-b border-zinc-200 last:border-none"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-xs font-bold text-zinc-950">
                              {proj.title}
                              {proj.subtitle ? (
                                <span className="font-normal text-zinc-600">
                                  {' '}
                                  — {proj.subtitle}
                                </span>
                              ) : null}
                            </h3>
                            {proj.year && (
                              <span className="text-[10px] text-zinc-500 shrink-0">
                                {proj.year}
                              </span>
                            )}
                          </div>
                          {proj.solutionDetails && (
                            <p className="text-[11px] text-zinc-700 mt-1 leading-relaxed">
                              {proj.solutionDetails}
                            </p>
                          )}
                          {proj.impactMetrics && (
                            <p className="text-[11px] font-medium text-zinc-900 mt-0.5">
                              Resultado: {proj.impactMetrics}
                            </p>
                          )}
                          {proj.techStack.length > 0 && (
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Stack: {proj.techStack.join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Right Sidebar Column (4 cols) */}
              <div className="md:col-span-4 space-y-5 md:border-l md:border-zinc-200 md:pl-5">
                {Object.keys(skillsByCategory).length > 0 && (
                  <section className="avoid-break">
                    <h2
                      className="text-[11px] font-bold uppercase tracking-wider mb-2.5"
                      style={{ color: accent }}
                    >
                      Competências
                    </h2>
                    <div className="space-y-3">
                      {Object.entries(skillsByCategory).map(([category, items]) => (
                        <div key={category}>
                          <div className="text-[11px] font-semibold text-zinc-900 mb-1">
                            {category}
                          </div>
                          <div className="text-[11px] text-zinc-700 leading-relaxed">
                            {items.map((s) => `${s.name} (${s.years}a)`).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {profile.languages.length > 0 && (
                  <section className="avoid-break">
                    <h2
                      className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                      style={{ color: accent }}
                    >
                      Idiomas
                    </h2>
                    <ul className="space-y-1 text-[11px] text-zinc-800">
                      {profile.languages.map((lang) => (
                        <li key={lang}>{lang}</li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="avoid-break">
                  <h2
                    className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                    style={{ color: accent }}
                  >
                    Disponibilidade
                  </h2>
                  <p className="text-[11px] text-zinc-700 leading-relaxed">
                    {avail.label}
                    <br />
                    Modalidade: {profile.preferredModalities.join(', ')}
                    <br />
                    Contrato: {profile.contractTypes.join(', ')}
                  </p>
                </section>
              </div>
            </div>
          ) : (
            /* EXECUTIVE & ATS SINGLE-COLUMN FLOW */
            <div className="space-y-5">
              {/* Summary */}
              {includeSummary && (profile.shortBio || profile.aboutMarkdown) && (
                <section className="avoid-break">
                  <h2
                    className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b border-zinc-200"
                    style={{ color: accent }}
                  >
                    Resumo Profissional
                  </h2>
                  <p className="text-xs sm:text-[13px] text-zinc-800 leading-relaxed">
                    {profile.shortBio}
                    {profile.aboutMarkdown ? ` ${profile.aboutMarkdown}` : ''}
                  </p>
                </section>
              )}

              {/* Experience (First in standard recruitment order) */}
              {profile.experiences.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-zinc-200"
                    style={{ color: accent }}
                  >
                    Experiência Profissional
                  </h2>
                  <div className="space-y-4">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id} className="avoid-break">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h3 className="text-sm font-bold text-zinc-950">
                            {exp.role}{' '}
                            <span className="font-semibold" style={{ color: accent }}>
                              · {exp.company}
                            </span>
                          </h3>
                          <span className="text-xs text-zinc-600 font-medium">
                            {exp.startDate} — {exp.isCurrent ? 'Atual' : exp.endDate} ·{' '}
                            {exp.location}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-xs text-zinc-700 mt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                        {exp.achievements.length > 0 && (
                          <ul className="mt-1.5 space-y-1 list-disc list-inside text-xs text-zinc-800">
                            {exp.achievements.map((ach, i) => (
                              <li key={i}>{ach}</li>
                            ))}
                          </ul>
                        )}
                        {exp.technologies.length > 0 && (
                          <p className="text-[11px] text-zinc-500 mt-1.5">
                            <strong>Tecnologias:</strong> {exp.technologies.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {includeProjects && visibleProjects.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-zinc-200"
                    style={{ color: accent }}
                  >
                    Projetos Relevantes & Cases de Engenharia
                  </h2>
                  <div className="space-y-3.5">
                    {visibleProjects.map((proj) => (
                      <div key={proj.id} className="avoid-break">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                          <h3 className="text-xs sm:text-sm font-bold text-zinc-950">
                            {proj.title}
                            {proj.subtitle ? (
                              <span className="font-normal text-zinc-600">
                                {' '}
                                — {proj.subtitle}
                              </span>
                            ) : null}
                          </h3>
                          <span className="text-[11px] text-zinc-500 shrink-0">
                            {[proj.role, proj.clientOrCompany, proj.year]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-xs text-zinc-700 leading-relaxed">
                          {proj.problemStatement && (
                            <p>
                              <strong className="text-zinc-900">Contexto:</strong>{' '}
                              {proj.problemStatement}
                            </p>
                          )}
                          {proj.solutionDetails && (
                            <p>
                              <strong className="text-zinc-900">Arquitetura & Solução:</strong>{' '}
                              {proj.solutionDetails}
                            </p>
                          )}
                          {proj.impactMetrics && (
                            <p className="font-medium text-zinc-900">
                              <strong>Resultado:</strong> {proj.impactMetrics}
                            </p>
                          )}
                        </div>
                        {proj.techStack.length > 0 && (
                          <p className="text-[11px] text-zinc-500 mt-1">
                            <strong>Stack:</strong> {proj.techStack.join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills Grouped by Domain */}
              {Object.keys(skillsByCategory).length > 0 && (
                <section className="avoid-break">
                  <h2
                    className="text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-zinc-200"
                    style={{ color: accent }}
                  >
                    Competências Técnicas
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {Object.entries(skillsByCategory).map(([category, items]) => (
                      <div key={category} className="leading-relaxed">
                        <strong className="text-zinc-900">{category}:</strong>{' '}
                        <span className="text-zinc-700">
                          {items
                            .map((s) => `${s.name} (${s.years} ${s.years === 1 ? 'ano' : 'anos'})`)
                            .join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer: Languages & Portfolio Link */}
              <footer className="avoid-break pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600">
                {profile.languages.length > 0 && (
                  <div>
                    <strong className="text-zinc-900">Idiomas:</strong>{' '}
                    {profile.languages.join(' · ')}
                  </div>
                )}
                <div>
                  Portfólio completo: <strong className="text-zinc-900">/p/{profile.slug}</strong>
                </div>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
