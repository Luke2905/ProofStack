'use client';

import React, { useEffect, useState } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import {
  CustomTemplatePreset,
  PortfolioSectionId,
  PortfolioTemplate,
  ThemeSettings,
} from '@/types/portfolio';
import {
  DEFAULT_SECTION_SUBTITLES,
  DEFAULT_SECTION_TITLES,
  STYLE_PRESETS,
  extractTemplateSnapshot,
  resolveTheme,
} from '@/lib/themeTokens';
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  Check,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Azul Executivo', primary: '#2563eb', accent: '#0f766e' },
  { name: 'SaaS Indigo', primary: '#6366f1', accent: '#14b8a6' },
  { name: 'Fintech Esmeralda', primary: '#10b981', accent: '#06b6d4' },
  { name: 'Studio Âmbar', primary: '#ea580c', accent: '#4f46e5' },
  { name: 'Grafite & Ouro', primary: '#f59e0b', accent: '#3b82f6' },
  { name: 'Carmim & Violeta', primary: '#e11d48', accent: '#7c3aed' },
];

const SECTION_LABELS: Record<PortfolioSectionId, string> = {
  hero: 'Apresentação (Hero)',
  recruiter_highlights: 'Destaques & Métricas',
  projects: 'Projetos & Cases',
  skills: 'Competências & Stack',
  experience: 'Experiência Profissional',
  contact: 'Chamada de Contato',
};

const LOCAL_TEMPLATES_KEY = 'portifoliohub_custom_templates_v1';

/* ---------- Building blocks ---------- */

function Group({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800/90 bg-zinc-950/90 p-4 space-y-3.5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">{title}</h3>
        {help && <p className="text-[11px] text-zinc-500 mt-0.5">{help}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      {children}
    </div>
  );
}

function Choice<T extends string>({
  value,
  options,
  onChange,
  columns,
}: {
  value: T;
  options: { id: T; label: string; hint?: string; preview?: React.ReactNode }[];
  onChange: (v: T) => void;
  columns?: number;
}) {
  const cols =
    (columns ?? options.length) === 2
      ? 'grid-cols-2'
      : (columns ?? options.length) === 4
      ? 'grid-cols-2'
      : 'grid-cols-3';
  return (
    <div role="radiogroup" className={`grid ${cols} gap-2`}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.hint}
            onClick={() => onChange(o.id)}
            className={`flex flex-col items-stretch gap-1 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
              active
                ? 'border-blue-500 bg-blue-500/10 text-white'
                : 'border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {o.preview && (
              <div className="h-8 rounded bg-zinc-800/70 p-1.5 mb-0.5 overflow-hidden">
                {o.preview}
              </div>
            )}
            <span className="text-xs font-semibold leading-tight">{o.label}</span>
            {o.hint && (
              <span className="text-[10px] text-zinc-500 leading-tight">{o.hint}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

const bar = (w: string, extra = '') => (
  <span className={`block h-1 rounded-full bg-zinc-500 ${extra}`} style={{ width: w }} />
);
const radiusPreview = (r: string) => (
  <span className={`block w-full h-full border border-zinc-400 ${r}`} />
);
const spacePreview = (gap: string) => (
  <span className={`flex flex-col ${gap} h-full justify-center`}>
    {bar('100%')}
    {bar('70%')}
    {bar('85%')}
  </span>
);

export function ThemeCustomizer() {
  const { getActivePortfolio, updateTheme, moveSectionOrder, toggleSectionVisibility } =
    usePortfolioStore();
  const profile = getActivePortfolio();

  const [newTemplateName, setNewTemplateName] = useState('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState<CustomTemplatePreset[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_TEMPLATES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setLocalTemplates(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!profile) return null;

  const theme = profile.theme;
  const tk = resolveTheme(theme);

  // Merge profile.theme.savedTemplates with localTemplates without duplicates
  const allSavedTemplates: CustomTemplatePreset[] = [
    ...(theme.savedTemplates || []),
    ...localTemplates.filter(
      (lt) => !(theme.savedTemplates || []).some((st) => st.id === lt.id)
    ),
  ];

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTemplateName.trim() || `Meu Template (${allSavedTemplates.length + 1})`;
    const preset: CustomTemplatePreset = {
      id: `tpl_${Date.now()}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
      settings: extractTemplateSnapshot(theme),
    };
    const updated = [preset, ...allSavedTemplates];
    setLocalTemplates(updated);
    try {
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    updateTheme({ savedTemplates: updated });
    setNewTemplateName('');
    setSavedNotice(`Template "${trimmed}" salvo!`);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleDeleteCustomTemplate = (id: string) => {
    const updated = allSavedTemplates.filter((t) => t.id !== id);
    setLocalTemplates(updated);
    try {
      localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    updateTheme({ savedTemplates: updated });
  };

  const setTitle = (id: PortfolioSectionId, value: string) =>
    updateTheme({ sectionTitles: { ...theme.sectionTitles, [id]: value } });
  const setSubtitle = (id: PortfolioSectionId, value: string) =>
    updateTheme({ sectionSubtitles: { ...theme.sectionSubtitles, [id]: value } });

  const resetLayoutAndText = () =>
    updateTheme({
      effects: undefined,
      heroLayout: undefined,
      backgroundPattern: undefined,
      accentStyle: undefined,
      customBgColor: undefined,
      customSurfaceColor: undefined,
      cardRadius: undefined,
      density: undefined,
      textScale: undefined,
      headingStyle: undefined,
      experienceLayout: undefined,
      skillsLayout: undefined,
      projectsLayout: undefined,
      showProjectCovers: undefined,
      sectionTitles: undefined,
      sectionSubtitles: undefined,
    } as Partial<ThemeSettings>);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Identidade Visual & Templates</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Escolha um template pronto ou customize cada detalhe e salve o seu próprio modelo.
          </p>
        </div>
        <button
          type="button"
          onClick={resetLayoutAndText}
          className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-900 cursor-pointer"
          title="Restaurar opções visuais ao padrão"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Padrão
        </button>
      </div>

      {/* 1. Saved User Templates */}
      <Group
        title="Meus Templates Salvos"
        help="Salve sua combinação atual de cores, tipografia e blocos para reutilizar quando quiser."
      >
        <form onSubmit={handleSaveCustomTemplate} className="flex items-center gap-2">
          <input
            type="text"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Nome do seu template (ex: Meu Dark B2B)..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Salvar Atual
          </button>
        </form>

        {savedNotice && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5" />
            <span>{savedNotice}</span>
          </div>
        )}

        {allSavedTemplates.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 pt-1">
            {allSavedTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => updateTheme(tpl.settings)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <span className="flex -space-x-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-950"
                      style={{ backgroundColor: tpl.settings.primaryColor || '#3b82f6' }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-950"
                      style={{ backgroundColor: tpl.settings.accentColor || '#10b981' }}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                      <Bookmark className="w-3 h-3 text-blue-400 shrink-0" />
                      {tpl.name}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {tpl.settings.mode === 'light' ? 'Claro' : 'Escuro'} ·{' '}
                      {tpl.settings.heroLayout || 'split'} · {tpl.settings.fontFamily || 'sans'}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateTheme(tpl.settings)}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-medium text-zinc-200 cursor-pointer"
                  >
                    Aplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomTemplate(tpl.id)}
                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                    title="Excluir template salvo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-zinc-500">
            Você ainda não salvou nenhum template personalizado.
          </p>
        )}
      </Group>

      {/* 2. Ready-Made Templates Gallery */}
      <Group
        title="1. Galeria de Templates Prontos"
        help="Selecione um estilo completo de mercado e personalize livremente abaixo."
      >
        <div className="grid grid-cols-2 gap-2">
          {STYLE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => updateTheme(p.values)}
              className="group p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 text-left transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Mini Visual Header Preview */}
                <div
                  className="h-9 rounded-lg border border-white/10 mb-2 p-2 flex items-center justify-between overflow-hidden"
                  style={{ backgroundColor: p.previewBg }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.values.primaryColor }}
                    />
                    <div className="space-y-1">
                      <span
                        className="block w-10 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            p.values.mode === 'light' ? '#1e293b' : '#f4f4f5',
                        }}
                      />
                      <span
                        className="block w-6 h-1 rounded-full opacity-50"
                        style={{
                          backgroundColor:
                            p.values.mode === 'light' ? '#64748b' : '#a1a1aa',
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.values.accentColor }}
                  />
                </div>

                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-white">{p.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {p.values.mode === 'light' ? 'Claro' : 'Escuro'}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                  {p.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Group>

      {/* 3. Hero Layout & Background Texture */}
      <Group
        title="2. Estrutura do Topo (Hero) & Fundo"
        help="Mude a disposição da sua foto, bio e o acabamento do plano de fundo."
      >
        <Field label="Formato da Apresentação (Hero)">
          <Choice
            value={tk.heroLayout}
            onChange={(heroLayout) => updateTheme({ heroLayout })}
            columns={2}
            options={[
              { id: 'split', label: 'Dividido (SaaS)', hint: 'Foto à esquerda e dados à direita' },
              { id: 'centered', label: 'Centralizado', hint: 'Estilo editorial em destaque' },
              { id: 'banner', label: 'Capa Executiva', hint: 'Faixa superior com foto sobreposta' },
              { id: 'minimal', label: 'Minimalista', hint: 'Cabeçalho direto sem moldura' },
            ]}
          />
        </Field>

        <Field label="Textura de Fundo">
          <Choice
            value={tk.backgroundPattern}
            onChange={(backgroundPattern) => updateTheme({ backgroundPattern })}
            columns={4}
            options={[
              { id: 'mesh', label: 'Luz Suave', hint: 'Ambiente sutil no topo' },
              { id: 'dots', label: 'Pontilhado', hint: 'Matriz técnica' },
              { id: 'grid', label: 'Grade', hint: 'Linhas de engenharia' },
              { id: 'none', label: 'Liso', hint: 'Fundo 100% sólido' },
            ]}
          />
        </Field>

        <Field label="Base Estrutural do Portfólio">
          <Choice<PortfolioTemplate>
            value={theme.template}
            onChange={(template) => updateTheme({ template })}
            columns={2}
            options={[
              { id: 'bento', label: 'Bento Dashboard', hint: 'Mosaico com case principal' },
              { id: 'recruiter', label: 'Executivo Linear', hint: 'Leitura direta em 1 coluna' },
              { id: 'minimal', label: 'Editorial Limpo', hint: 'Foco em texto e conteúdo' },
              { id: 'terminal', label: 'Terminal DevOS', hint: 'Estética prompt Unix' },
            ]}
          />
        </Field>
      </Group>

      {/* 4. Colors & Custom Surfaces */}
      <Group
        title="3. Cores & Superfícies Personalizadas"
        help="Use uma paleta pronta ou defina cada cor manualmente para refletir sua marca."
      >
        <div className="grid grid-cols-2 gap-2">
          <Field label="Modo Base">
            <Choice
              value={theme.mode}
              onChange={(mode) =>
                updateTheme({
                  mode,
                  customBgColor: undefined,
                  customSurfaceColor: undefined,
                })
              }
              options={[
                { id: 'dark', label: 'Escuro' },
                { id: 'light', label: 'Claro' },
              ]}
            />
          </Field>
          <Field label="Botões & Destaques">
            <Choice
              value={tk.accentStyle}
              onChange={(accentStyle) => updateTheme({ accentStyle })}
              options={[
                { id: 'solid', label: 'Cor Sólida' },
                { id: 'gradient', label: 'Gradiente' },
              ]}
            />
          </Field>
        </div>

        <Field label="Paletas Curadas">
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((p) => {
              const active =
                theme.primaryColor.toLowerCase() === p.primary &&
                theme.accentColor.toLowerCase() === p.accent;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    updateTheme({ primaryColor: p.primary, accentColor: p.accent })
                  }
                  className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs cursor-pointer ${
                    active
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  <span className="flex -space-x-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-950"
                      style={{ backgroundColor: p.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-950"
                      style={{ backgroundColor: p.accent }}
                    />
                  </span>
                  {p.name}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Cor Principal</span>
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Cor Secundária</span>
            <input
              type="color"
              value={theme.accentColor}
              onChange={(e) => updateTheme({ accentColor: e.target.value })}
              className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="truncate">Fundo Página</span>
            <div className="flex items-center gap-1">
              {theme.customBgColor && (
                <button
                  type="button"
                  onClick={() => updateTheme({ customBgColor: undefined })}
                  className="text-[10px] text-zinc-500 hover:text-zinc-200 px-1 cursor-pointer"
                  title="Voltar ao fundo padrão"
                >
                  Auto
                </button>
              )}
              <input
                type="color"
                value={
                  theme.customBgColor || (theme.mode === 'light' ? '#f8fafc' : '#07090e')
                }
                onChange={(e) => updateTheme({ customBgColor: e.target.value })}
                className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="truncate">Fundo Cartão</span>
            <div className="flex items-center gap-1">
              {theme.customSurfaceColor && (
                <button
                  type="button"
                  onClick={() => updateTheme({ customSurfaceColor: undefined })}
                  className="text-[10px] text-zinc-500 hover:text-zinc-200 px-1 cursor-pointer"
                  title="Voltar ao cartão padrão"
                >
                  Auto
                </button>
              )}
              <input
                type="color"
                value={
                  theme.customSurfaceColor ||
                  (theme.mode === 'light' ? '#ffffff' : '#111216')
                }
                onChange={(e) => updateTheme({ customSurfaceColor: e.target.value })}
                className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </Group>

      {/* 5. Cards & Spacing */}
      <Group title="4. Cartões, Bordas & Espaçamento">
        <Field label="Acabamento Visual">
          <Choice
            value={tk.fx ? 'glow' : 'flat'}
            onChange={(effects) => updateTheme({ effects })}
            columns={2}
            options={[
              {
                id: 'glow',
                label: 'SaaS Profundo',
                hint: 'Vidro sutil, moldura de navegador e transições',
              },
              {
                id: 'flat',
                label: 'Editorial Sóbrio',
                hint: 'Superfícies diretas sem vidro ou animações',
              },
            ]}
          />
        </Field>
        <Field label="Arredondamento dos Cantos">
          <Choice
            value={tk.cardRadius}
            onChange={(cardRadius) => updateTheme({ cardRadius })}
            options={[
              { id: 'sharp', label: 'Retos', preview: radiusPreview('rounded-sm') },
              { id: 'soft', label: 'Suaves', preview: radiusPreview('rounded-lg') },
              { id: 'round', label: 'Redondos', preview: radiusPreview('rounded-full') },
            ]}
          />
        </Field>
        <Field label="Estilo do Cartão">
          <Choice
            value={theme.cardStyle}
            onChange={(cardStyle) => updateTheme({ cardStyle })}
            options={[
              { id: 'glass', label: 'Elevado / Vidro' },
              { id: 'bordered', label: 'Borda Fina' },
              { id: 'solid', label: 'Preenchido' },
            ]}
          />
        </Field>
        <Field label="Densidade & Espaçamento">
          <Choice
            value={tk.density}
            onChange={(density) => updateTheme({ density })}
            options={[
              { id: 'compact', label: 'Compacto', preview: spacePreview('gap-0.5') },
              { id: 'comfortable', label: 'Equilibrado', preview: spacePreview('gap-1.5') },
              { id: 'spacious', label: 'Amplo', preview: spacePreview('gap-2.5') },
            ]}
          />
        </Field>
      </Group>

      {/* 6. Typography */}
      <Group title="5. Tipografia & Títulos">
        <Field label="Família Tipográfica">
          <Choice
            value={theme.fontFamily}
            onChange={(fontFamily) => updateTheme({ fontFamily })}
            options={[
              { id: 'sans', label: 'Sans Moderna' },
              { id: 'editorial', label: 'Clássica Serifa' },
              { id: 'mono', label: 'Tech Mono' },
            ]}
          />
        </Field>
        <Field label="Escala de Texto">
          <Choice
            value={tk.textScale}
            onChange={(textScale) => updateTheme({ textScale })}
            options={[
              { id: 'sm', label: 'Compacta' },
              { id: 'md', label: 'Padrão' },
              { id: 'lg', label: 'Ampla' },
            ]}
          />
        </Field>
        <Field label="Destaque nos Títulos das Seções">
          <Choice
            value={tk.headingStyle}
            onChange={(headingStyle) => updateTheme({ headingStyle })}
            options={[
              { id: 'plain', label: 'Limpo' },
              { id: 'accent-bar', label: 'Barra Lateral' },
              { id: 'underline', label: 'Sublinhado' },
            ]}
          />
        </Field>
      </Group>

      {/* 7. Section Layouts */}
      <Group title="6. Exibição dos Blocos">
        <Field label="Trajetória & Experiência">
          <Choice
            value={tk.experienceLayout}
            onChange={(experienceLayout) => updateTheme({ experienceLayout })}
            columns={2}
            options={[
              { id: 'timeline', label: 'Linha do Tempo', hint: 'Conector vertical cronológico' },
              { id: 'cards', label: 'Cartões Separados', hint: 'Um cartão por empresa' },
            ]}
          />
        </Field>
        <Field label="Matriz de Competências">
          <Choice
            value={tk.skillsLayout}
            onChange={(skillsLayout) => updateTheme({ skillsLayout })}
            options={[
              { id: 'grid', label: 'Lista Detalhada' },
              { id: 'bars', label: 'Barras Visuais' },
              { id: 'tags', label: 'Etiquetas' },
            ]}
          />
        </Field>
        <Field label="Disposição dos Projetos">
          <Choice
            value={tk.projectsLayout}
            onChange={(projectsLayout) => updateTheme({ projectsLayout })}
            options={[
              { id: 'auto', label: 'Bento Auto' },
              { id: 'grid', label: '2 Colunas' },
              { id: 'list', label: 'Lista Larga' },
            ]}
          />
        </Field>
        <div className="grid grid-cols-1 gap-2 pt-1">
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Mostrar prévia/capa visual nos projetos</span>
            <input
              type="checkbox"
              checked={tk.showProjectCovers}
              onChange={(e) => updateTheme({ showProjectCovers: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </label>
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Mostrar faixa de disponibilidade no topo</span>
            <input
              type="checkbox"
              checked={theme.showAvailabilityBanner}
              onChange={(e) => updateTheme({ showAvailabilityBanner: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </label>
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Destacar métricas de resultado nos projetos</span>
            <input
              type="checkbox"
              checked={theme.showImpactHighlights}
              onChange={(e) => updateTheme({ showImpactHighlights: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </label>
          <label className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 cursor-pointer">
            <span>Mostrar bloco de estatísticas do GitHub</span>
            <input
              type="checkbox"
              checked={theme.showGithubStats}
              onChange={(e) => updateTheme({ showGithubStats: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </label>
        </div>
      </Group>

      {/* 8. Sections ordering & custom titles */}
      <Group
        title="7. Ordem das Seções & Textos Personalizados"
        help="Reordene, oculte ou altere o título e subtítulo de cada seção."
      >
        <div className="space-y-2">
          {theme.sectionOrder.map((secId, index) => {
            const visible = theme.visibleSections[secId];
            const editable = secId !== 'hero' && secId !== 'recruiter_highlights';
            return (
              <div key={secId} className="rounded-lg bg-zinc-900 border border-zinc-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <span
                    className={`text-xs font-medium ${
                      visible ? 'text-white' : 'text-zinc-500 line-through'
                    }`}
                  >
                    {index + 1}. {SECTION_LABELS[secId]}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Mover para cima"
                      disabled={index === 0}
                      onClick={() => moveSectionOrder(secId, 'up')}
                      className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Mover para baixo"
                      disabled={index === theme.sectionOrder.length - 1}
                      onClick={() => moveSectionOrder(secId, 'down')}
                      className="p-1 rounded hover:bg-zinc-800 disabled:opacity-30 text-zinc-400 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={visible ? 'Esconder seção' : 'Mostrar seção'}
                      onClick={() => toggleSectionVisibility(secId)}
                      className="p-1 rounded hover:bg-zinc-800 cursor-pointer"
                    >
                      {visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </button>
                  </div>
                </div>

                {editable && visible && (
                  <div className="px-3 pb-3 space-y-1.5">
                    <input
                      type="text"
                      value={theme.sectionTitles?.[secId] ?? ''}
                      onChange={(e) => setTitle(secId, e.target.value)}
                      placeholder={DEFAULT_SECTION_TITLES[secId]}
                      aria-label={`Título de ${SECTION_LABELS[secId]}`}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={theme.sectionSubtitles?.[secId] ?? ''}
                      onChange={(e) => setSubtitle(secId, e.target.value)}
                      placeholder={DEFAULT_SECTION_SUBTITLES[secId] || 'Subtítulo (opcional)'}
                      aria-label={`Subtítulo de ${SECTION_LABELS[secId]}`}
                      className="w-full px-2.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Group>
    </div>
  );
}
