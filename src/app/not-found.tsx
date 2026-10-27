import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 text-zinc-100">
      <div className="max-w-md w-full p-8 rounded-3xl ag-glass-elevated text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-white">404 — Página Não Encontrada</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O portfólio ou endereço solicitado não foi encontrado no ProofStack.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Hub de Talentos
          </Link>
        </div>
      </div>
    </div>
  );
}
