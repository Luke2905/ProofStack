# 🚀 PortifólioHub — Diretório de Talentos Tech & Construtor Integrado ao GitHub

Plataforma completa para desenvolvedores e profissionais de tecnologia criarem portfólios orientados ao que **empresas e recrutadores buscam**, com integração direta via **GitHub API**, projetos manuais no formato **Case Study**, **Editor Visual Embarcado em Tempo Real** e **Hub Público de Talentos**.

---

## ✨ Principais Funcionalidades

1. **Hub & Diretório Público de Talentos (`/`)**:
   - Busca instantânea por tecnologia (`React`, `Go`, `Rust`, `Python`, `TypeScript`, `AWS`, `React Native`), cargo, localização ou nome.
   - Filtros multifacetados para recrutadores: **Especialidade**, **Senioridade** (Júnior a Staff), **Status de Disponibilidade** (*Disponível Imediatamente*, *Aberto a Propostas*, *Freelance*) e **Ordenação por Estrelas no GitHub / Experiência**.
   - **Modal de Dossiê Rápido para Recrutadores**: Visualização resumida dos Cases de Impacto, pretensão, modalidades aceitas e contato direto.

2. **Conector GitHub API em Tempo Real (`/editor` -> Aba GitHub API)**:
   - Consulta qualquer usuário real do GitHub (`https://api.github.com/users/{username}/repos`).
   - Importa dados do perfil (avatar, bio, localização, estrelas acumuladas, linguagens principais).
   - Importação com 1 clique de repositórios públicos convertendo-os automaticamente em projetos estruturados no portfólio.

3. **Gestão de Projetos Manuais & Case Studies (`/editor` -> Aba Projetos)**:
   - Criação e edição de projetos corporativos, freelas ou sob NDA.
   - Estrutura focada em recrutamento técnico:
     - 🎯 **Problema & Contexto de Negócio**
     - ⚙️ **Solução Técnica & Arquitetura**
     - 📈 **Métricas de Impacto & Resultados Mensuráveis**

4. **Editor Visual Embarcado (`/editor` -> Aba Tema Visual)**:
   - **4 Templates Exclusivos**: `Bento Grid Modern`, `Executive Recruiter`, `Terminal Hacker CLI` e `Minimalist Editorial`.
   - Customização de paleta de cores (presets + seletores de cor primária e destaque), modo `Dark` / `Light` e tipografia.
   - Reordenação e controle de visibilidade das seções com **Live Preview Responsivo** (Desktop, Tablet e Mobile).

5. **Publicação, Compartilhamento & Currículo ATS PDF (`/p/[slug]`)**:
   - Link público compartilhável (`/p/lucas-dev`, `/p/camila-rocha`, etc.) com personalização de `slug`.
   - Geração automática de **QR Code** e preview de card **OpenGraph** para LinkedIn e WhatsApp.
   - **Gerador de Currículo Executivo & ATS (PDF)** integrado a partir dos dados do portfólio.

---

## 🛠️ Como Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no navegador.
