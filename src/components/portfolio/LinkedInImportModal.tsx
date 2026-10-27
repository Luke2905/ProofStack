'use client';

import React, { useState, useRef } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import {
  ParsedLinkedInData,
  ParsedLinkedInExperience,
  ParsedLinkedInSkill,
} from '@/lib/linkedinParser';
import {
  X,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Award,
  GraduationCap,
  Circle,
  ArrowRight,
  Layers,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LinkedInImportModal({
  isOpen,
  onClose,
  onSuccess,
}: LinkedInImportModalProps) {
  const { bulkImportLinkedIn } = usePortfolioStore();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLinkedInData | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Selection states
  const [importSkills, setImportSkills] = useState(true);
  const [importExperiences, setImportExperiences] = useState(true);
  const [importBio, setImportBio] = useState(true);
  const [importHeadline, setImportHeadline] = useState(true);

  // Selected skills toggle
  const [selectedSkills, setSelectedSkills] = useState<ParsedLinkedInSkill[]>([]);
  // Selected experiences toggle
  const [selectedExperiences, setSelectedExperiences] = useState<
    ParsedLinkedInExperience[]
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setError(null);
    setIsSuccess(false);
    setSelectedSkills([]);
    setSelectedExperiences([]);
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Por favor, selecione um arquivo no formato PDF.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/linkedin/import-pdf', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error ||
            'Não foi possível extrair os dados. Verifique se o PDF foi gerado pelo LinkedIn.'
        );
      }

      const data: ParsedLinkedInData = json.data;
      setParsedData(data);
      setSelectedSkills(data.skills || []);
      setSelectedExperiences(data.experiences || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao processar o arquivo PDF do LinkedIn.'
      );
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const toggleSkill = (skill: ParsedLinkedInSkill) => {
    if (selectedSkills.some((s) => s.name === skill.name)) {
      setSelectedSkills(selectedSkills.filter((s) => s.name !== skill.name));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const toggleExperience = (idx: number) => {
    if (selectedExperiences.includes(parsedData!.experiences[idx])) {
      setSelectedExperiences(
        selectedExperiences.filter((e) => e !== parsedData!.experiences[idx])
      );
    } else {
      setSelectedExperiences([
        ...selectedExperiences,
        parsedData!.experiences[idx],
      ]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;

    // Build education markdown block if available
    let educationMarkdown = '';
    if (parsedData.education && parsedData.education.length > 0) {
      educationMarkdown = `### 🎓 Formação Acadêmica\n` +
        parsedData.education
          .map(
            (edu) =>
              `- **${edu.school}** — ${edu.degree} *(${edu.period})*`
          )
          .join('\n');
    }

    let combinedAbout = parsedData.summary || '';
    if (importBio && educationMarkdown) {
      combinedAbout = combinedAbout
        ? `${combinedAbout}\n\n${educationMarkdown}`
        : educationMarkdown;
    }

    bulkImportLinkedIn({
      skills: importSkills
        ? selectedSkills.map((s) => ({
            name: s.name,
            category: s.category,
            level: s.level,
            years: s.years,
          }))
        : [],
      experiences: importExperiences
        ? selectedExperiences.map((e) => ({
            company: e.company,
            role: e.role,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate,
            isCurrent: e.isCurrent,
            description: e.description,
            achievements: e.achievements,
            technologies: e.technologies,
          }))
        : [],
      headline: importHeadline ? parsedData.headline : undefined,
      shortBio: importBio ? parsedData.summary?.slice(0, 180) : undefined,
      aboutMarkdown: importBio ? combinedAbout : undefined,
      location: parsedData.location,
    });

    setIsSuccess(true);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a66c2]/20 border border-[#0a66c2]/40 flex items-center justify-center text-[#0a66c2]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Importador de Perfil do LinkedIn
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0a66c2]/20 text-blue-300 border border-[#0a66c2]/30">
                  1-Click PDF Parser
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Puxe competências, histórico profissional e formação acadêmica do seu currículo oficial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Success Banner */}
          {isSuccess ? (
            <div className="p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  Dados do LinkedIn Importados com Sucesso!
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Suas experiências e competências foram sincronizadas e salvas automaticamente no banco de dados do seu portfólio.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  Ver Meu Portfólio Atualizado
                </button>
              </div>
            </div>
          ) : !parsedData ? (
            <>
              {/* How to get PDF mini guide */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Circle className="w-4 h-4 text-blue-400" />
                  Como salvar seu PDF no LinkedIn em 10 segundos:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-300">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold inline-flex items-center justify-center mr-1.5 text-[11px]">
                      1
                    </span>
                    Acesse seu perfil no <strong>LinkedIn</strong> no navegador.
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold inline-flex items-center justify-center mr-1.5 text-[11px]">
                      2
                    </span>
                    Clique no botão <strong>&quot;Mais&quot;</strong> logo abaixo do seu nome.
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-850">
                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 font-bold inline-flex items-center justify-center mr-1.5 text-[11px]">
                      3
                    </span>
                    Escolha <strong>&quot;Salvar como PDF&quot;</strong> e envie o arquivo aqui.
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center gap-3 text-center cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {loading ? (
                  <div className="py-6 space-y-3">
                    <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
                    <p className="text-sm font-semibold text-white">
                      Analisando PDF do LinkedIn...
                    </p>
                    <p className="text-xs text-zinc-400">
                      Extraindo competências, empresas, períodos e histórico formatado.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        Arraste seu arquivo PDF do LinkedIn ou clique para selecionar
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">
                        Formatos suportados: PDF oficial exportado pelo LinkedIn (Português ou Inglês)
                      </p>
                    </div>
                    <span className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold mt-2 inline-flex items-center gap-1.5 transition">
                      <FileText className="w-3.5 h-3.5" />
                      Escolher arquivo PDF
                    </span>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Review & Confirmation Screen */
            <div className="space-y-6">
              {/* Header metrics */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {parsedData.name || 'Perfil Encontrado'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {parsedData.headline || 'Desenvolvedor Tech'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Subir outro PDF
                </button>
              </div>

              {/* Import Options Checkboxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={importSkills}
                    onChange={(e) => setImportSkills(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      Importar Competências ({selectedSkills.length})
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      Categorizadas automaticamente por stack
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={importExperiences}
                    onChange={(e) => setImportExperiences(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                      Importar Experiências ({selectedExperiences.length})
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      Cargos, empresas, datas e conquistas
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={importBio}
                    onChange={(e) => setImportBio(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      Importar Bio & Formação
                    </span>
                    <span className="text-[11px] text-zinc-400 block">
                      {parsedData.education.length} formações encontradas
                    </span>
                  </div>
                </label>

                <label className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 cursor-pointer hover:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={importHeadline}
                    onChange={(e) => setImportHeadline(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Circle className="w-3.5 h-3.5 text-amber-400" />
                      Atualizar Headline do Perfil
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate max-w-[200px]">
                      {parsedData.headline || 'Manter atual'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Skills Preview */}
              {importSkills && parsedData.skills.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-400" />
                      Competências Identificadas (Clique para ativar/desativar):
                    </span>
                    <span className="text-zinc-400">
                      {selectedSkills.length} selecionadas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    {parsedData.skills.map((skill) => {
                      const isSelected = selectedSkills.some(
                        (s) => s.name === skill.name
                      );
                      return (
                        <button
                          key={skill.name}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                              : 'bg-zinc-800/40 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-blue-400" />}
                          <span>{skill.name}</span>
                          <span className="text-[9px] opacity-70">
                            ({skill.category})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Experiences Preview */}
              {importExperiences && parsedData.experiences.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      Histórico Profissional ({selectedExperiences.length} selecionadas):
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {parsedData.experiences.map((exp, idx) => {
                      const isSelected = selectedExperiences.includes(exp);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleExperience(idx)}
                          className={`p-3 rounded-2xl border transition cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-900/90 border-emerald-500/40 hover:border-emerald-500/60'
                              : 'bg-zinc-950 border-zinc-800 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>{exp.role}</span>
                                <span className="text-zinc-500 font-normal">•</span>
                                <span className="text-emerald-400">
                                  {exp.company}
                                </span>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5">
                                {exp.startDate} – {exp.endDate} ({exp.location})
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-500'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Education Preview */}
              {importBio && parsedData.education.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    Formações Acadêmicas que serão adicionadas ao Perfil:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-300 text-[11px]">
                    {parsedData.education.map((edu, idx) => (
                      <li key={idx}>
                        <strong>{edu.school}</strong>: {edu.degree} ({edu.period})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Actions */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition cursor-pointer"
                >
                  Voltar
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold  transition cursor-pointer flex items-center gap-2"
                >
                  <Circle className="w-4 h-4" />
                  Confirmar e Sincronizar com Meu Portfólio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
