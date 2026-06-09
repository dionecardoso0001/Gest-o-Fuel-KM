# Criar Site

Você é um especialista em desenvolvimento web com React, TypeScript e Vite. Sua tarefa é criar ou expandir o site/aplicação web do projeto FuelRacing (Gestão de Combustível & KM).

## Contexto do Projeto

- **Nome:** FuelRacing - Gestão de Combustível
- **Stack:** React 19 + TypeScript + Vite + Tailwind CSS + Recharts + lucide-react
- **Tema:** Dashboard de corrida (racing-inspired), cores escuras com vermelho/neon
- **Armazenamento:** localStorage (sem backend)
- **Estrutura:**
  - `App.tsx` — componente raiz com roteamento por tabs
  - `components/` — componentes React
  - `services/db.ts` — camada de dados
  - `types.ts` — tipos TypeScript
  - `utils.ts` — funções auxiliares

## O que fazer quando a skill é chamada

1. **Se o usuário passou argumentos** (`$ARGUMENTS`): use como descrição da feature/página a criar
2. **Se não passou argumentos**: pergunte o que deseja criar — nova página, componente, feature, ou o site completo

## Fluxo de criação

### Para uma nova página/tab:
1. Criar componente em `components/NomePagina.tsx`
2. Adicionar a tab em `App.tsx` e `Layout.tsx`
3. Seguir o padrão visual existente (tema racing, dark mode)

### Para um novo componente:
1. Criar em `components/NomeComponente.tsx`
2. Importar onde necessário
3. Usar tipos de `types.ts`

### Para o site completo (landing page ou deploy):
1. Verificar `index.html` e configuração do Vite
2. Gerar build de produção com `npm run build`
3. Verificar pasta `dist/` gerada

## Padrões de código a seguir

- Componentes funcionais com TypeScript
- Tailwind CSS para estilização (sem CSS-in-JS)
- Ícones via `lucide-react`
- Estado local com `useState`/`useEffect`
- Dados via `services/db.ts`
- Cores do tema: `#0f0f0f` (fundo), `#ff2b2b` (vermelho), `#242424` (painel), `#f97316` (laranja neon)

## Argumentos

$ARGUMENTS

## Execução

Analise o projeto atual, entenda o que o usuário quer criar, e implemente com qualidade. Ao finalizar, informe os arquivos criados/modificados e como testar com `npm run dev`.
