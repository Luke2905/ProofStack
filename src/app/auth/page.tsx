'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { RoleCategory, SeniorityLevel } from '@/types/portfolio';
import { TiltSurface } from '@/components/ui/AntigravityPrimitives';
import {
  Terminal,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Github,
  Briefcase,
  AlertCircle,
  Circle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { setAuthSession, syncFromPostgres } = usePortfolioStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [roleCategory, setRoleCategory] = useState<RoleCategory>('Fullstack');
  const [seniority, setSeniority] = useState<SeniorityLevel>('Pleno');
  const [githubUsername, setGithubUsername] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'login'
            ? { action: 'login', email, password }
            : {
                action: 'register',
                name,
                email,
                password,
                headline:
                  headline.trim() ||
                  `Desenvolvedor ${roleCategory} (${seniority})`,
                roleCategory,
                seniority,
                githubUsername,
              }
        ),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || 'Não foi possível concluir a autenticação.');
        setLoading(false);
        return;
      }

      setAuthSession(data.user, data.portfolio);
      await syncFromPostgres();
      router.push('/editor');
    } catch {
      setError('Erro de conexão com o servidor. Tente novamente em instantes.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] ag-spatial-bg text-zinc-100 flex items-center justify-center p-4 sm:p-6">
      <TiltSurface
        maxTilt={2}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden ag-glass-elevated shadow-2xl"
      >
        {/* Left Informational Column */}
        <div className="lg:col-span-5 p-8 sm:p-10 bg-zinc-900/60 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ProofStack • Dossiês de Engenharia & Produto</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
                Construa seu Portfólio Técnico e Conecte-se a Empresas
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Crie sua conta gratuita para importar seus repositórios via{' '}
                <strong className="text-zinc-200">GitHub API</strong>, documentar{' '}
                <strong className="text-zinc-200">Case Studies de Impacto</strong>,
                personalizar o tema visual ao vivo e aparecer no Diretório de Talentos.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-zinc-300 pt-2">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">
                  1
                </span>
                <span>
                  <strong>Sincronização GitHub 1-Click:</strong> Puxe repositórios, estrelas, linguagens e tópicos em segundos.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                  2
                </span>
                <span>
                  <strong>Estrutura para Recrutadores:</strong> Destaque Problema, Solução Técnica, Métricas de Impacto e gere Currículo ATS em PDF.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold">
                  3
                </span>
                <span>
                  <strong>Perfil Profissional Salvo:</strong> Conta segura e portfólio publicado com link próprio (<code>/p/seu-slug</code>).
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-8 mt-8 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Ambiente Seguro & Criptografado
            </span>
            <Link href="/" className="hover:text-white underline">
              Explorar Hub Público →
            </Link>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-zinc-950/80 flex flex-col justify-center">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Criar Conta & Portfólio
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-white">
              {mode === 'login'
                ? 'Bem-vindo de volta ao ProofStack'
                : 'Crie sua conta profissional no ProofStack'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === 'login'
                ? 'Acesse o estúdio visual para gerenciar seus projetos e link público.'
                : 'Preencha seus dados básicos para gerar seu portfólio profissional automaticamente.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Lucas Mendes"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  E-mail Profissional *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="voce@exemplo.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className={mode === 'login' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Título Profissional / Headline
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Ex: Engenheiro Fullstack • React, Next.js & Node.js"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Especialidade
                    </label>
                    <select
                      value={roleCategory}
                      onChange={(e) =>
                        setRoleCategory(e.target.value as RoleCategory)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                    >
                      {[
                        'Fullstack',
                        'Frontend',
                        'Backend',
                        'Mobile',
                        'Dados & IA',
                        'DevOps & Cloud',
                        'UI/UX & Product',
                      ].map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Senioridade
                    </label>
                    <select
                      value={seniority}
                      onChange={(e) =>
                        setSeniority(e.target.value as SeniorityLevel)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-white focus:outline-none focus:border-blue-500"
                    >
                      {[
                        'Júnior',
                        'Pleno',
                        'Sênior',
                        'Tech Lead / Staff',
                        'Principal / Arquitetura',
                      ].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Usuário GitHub (Opcional)
                    </label>
                    <div className="relative">
                      <Github className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        placeholder="seu-user"
                        className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>
                {loading
                  ? 'Processando...'
                  : mode === 'login'
                  ? 'Entrar e Abrir Meu Portfólio'
                  : 'Criar Conta e Iniciar Meu Portfólio'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </TiltSurface>
    </div>
  );
}
