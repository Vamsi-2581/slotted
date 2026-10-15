# Documentação para agentes de código — desenho

Data: 2026-10-01. Estado: proposto.

Substitui a linha "Consumo por IA" de [2026-10-01-docs-site-design.md](2026-10-01-docs-site-design.md).

## Objetivo

Um agente de código que trabalha num projeto com `@slotted/react` ou `@slotted/angular` instalado escreve UI correta com a biblioteca: compila, usa só props e seletores existentes, produz o DOM do contrato e pinta com tokens. A cena prioritária é o agente no projeto. O agente que lê o site público é a segunda cena, servida pela mesma fonte.

A verificação é determinística e sem custo de API: compilação, orçamento de tamanho, cobertura, rastreabilidade e determinismo. Medição por execução de agentes está fora de escopo.

## Evidência de partida

| Prática | Resultado | Força | Fonte |
| --- | --- | --- | --- |
| Índice de 8 KB no `AGENTS.md` apontando para docs locais da versão instalada | 53% → 100% de aprovação em APIs fora do treino | medida | vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals |
| Skill sem instrução de invocação | 53% (não invocada em 56% dos casos); com instrução, 79% | medida | idem |
| Arquivos de contexto com visão geral em prosa | sem ganho de sucesso; custo +20% | medida | arxiv.org/abs/2602.11988 |
| `llms.txt` ligado de cada página | buscas a URLs mortas por tarefa: 2,23 → 0,11; acurácia inalterada | medida pelo fornecedor | mintlify.com/blog/llms-txt-agent-benchmark |
| `.md` sem índice ligado | mais 404 por caminhos `.md` adivinhados | medida pelo fornecedor | idem |
| Formato pedido pelo agente | 95,7% das buscas com formato escolhem Markdown | medida | vercel.com/kb/guide/make-your-documentation-readable-by-ai-agents |
| Cópia literal | 61% das respostas com código copiam linhas da página buscada | medida | idem |
| Conteúdo renderizado só por JavaScript | única condição, com 403, que bloqueou recuperação | medida | idem |
| Servidor MCP instalado | não chamado sem arquivo de regras | relato do fornecedor | mui.com/material-ui/getting-started/mcp |

## Decisões

| Tema | Decisão |
| --- | --- |
| Gerador | `tools/agent-docs/`, pacote de workspace não publicado. Uma função pura converte dados de referência em Markdown e JSON; um script carrega os dados por `runnerImport` do Vite, porque `*.docs.ts` importa `@slotted/storybook-workbench` e JSON |
| Consumidores do gerador | O `build` de `@slotted/react` e `@slotted/angular` grava `dist/docs/`; `apps/docs` importa a mesma função nos endpoints estáticos. Pacote nunca depende do site |
| Entradas | `packages/<binding>/**/<family>.docs.ts` (imports, anatomy, api, composition, events, scenes), `specs/components/<family>/contract.json` (`ui`, eixos, `provides`, regras com `reason`), `packages/styles/src/<family>/<family>.tokens.json`, `apps/docs/examples/<framework>/<family>/*` |
| Precedência de exemplo | O exemplo do site substitui o snippet da cena de mesmo assunto; sem exemplo do site, vale o snippet de `*.docs.ts` |
| Prosa | O gerador não escreve prosa própria. Toda frase da saída vem de um campo tipado das entradas |
| Campos de preenchimento | Omitidos. `purpose: 'Theme-owned <Family> decision'`, repetido em todo token, não é publicado; a tabela de tokens vira lista de nomes |
| Idioma | Inglês em todo material gerado |
| Binding | Um arquivo por binding; sem abas |

## Saídas no pacote

Em `node_modules/@slotted/<binding>/dist/docs/`:

| Arquivo | Conteúdo | Orçamento |
| --- | --- | --- |
| `index.md` | Uma linha por família: nome, `data-ui`, propósito em uma frase, caminho do arquivo; agrupado por categoria | 8 KB |
| `<family>.md` | Primeira linha aponta para `index.md`. Seções, nesta ordem: Import, Minimal example, Anatomy (parte, elemento, `data-part`), Props (nome, tipo, padrão, componente), Events (nome, payload, quando), Axes and defaults, Rules, Tokens, Examples | 24 KB |
| `AGENTS.snippet.md` | Bloco para colar no `AGENTS.md` do projeto: ler `dist/docs/index.md` antes de escrever UI; preferir estes arquivos ao conhecimento prévio; regras não deriváveis (eixos de tema são atributos; tokens em vez de literais; eixos `size`, `variant`, `tone` em vez de CSS próprio; `render` para trocar o elemento raiz; ordem de camadas) | 2 KB |

Conteúdo acima do orçamento vai para um arquivo ligado; nada é truncado. Orçamento excedido falha o build.

## Saídas no site

Geradas pela mesma função:

- `/<framework>/components/<family>.md` e `/<framework>/components/<family>.json`;
- `/llms.txt`, índice dos `.md`;
- em cada página HTML, `<link rel="alternate" type="text/markdown">` para o seu `.md` e `<link rel="describedby">` para `/llms.txt`.

O `.md` de uma família Angular existe antes da página HTML Angular; os `<link>` só aparecem nas páginas HTML existentes.

## Gate de exemplo

Um bloco é publicado como "Example" só quando compila como módulo completo:

- React: `tsc --noEmit` contra os tipos de `@slotted/react`;
- Angular: componente gerado em torno do snippet, compilado com `strictTemplates`.

Um bloco que não compila é publicado como "Excerpt — not a complete module". Nenhuma heurística textual falha a geração: `…` aparece em texto legítimo de interface (`"Loading…"`), e acentos aparecem em nomes próprios e em exemplos de locale.

O idioma dos snippets é verificado por relatório avulso, não por gate. Estado em 2026-10-01: fragmentos com `…` em 21 arquivos `*.docs.ts` React e 24 Angular; texto em português em 10 React e 9 Angular. As correções são manuais, em `*.docs.ts`.

## Ordem de entrega

1. `summary` e `group` em `contract.json`.
2. Gerador: `tools/agent-docs`, gate de compilação, `dist/docs/` no build dos dois pacotes, relatório de idioma.
3. Correção de fonte: snippets em português traduzidos; cena principal reescrita como módulo completo em `button`, `field`, `menu`, `dialog`, `data-grid`, `table`, `tabs`, `combobox`, `select`, `toast`, `app-shell`, `side-navigation`.
4. Saídas no site.

## Fora de escopo

| Item | Condição de entrada |
| --- | --- |
| Evals com agentes (`claude -p` headless) | Decisão do usuário em 2026-10-01: custo de API recusado |
| Skills da biblioteca | Decisão própria; quando entrar, com instrução de invocação no snippet, porque sem ela a skill não é chamada em 56% dos casos |
| Servidor MCP | Decisão própria; exige runtime |
| Negociação `Accept: text/markdown` | Exige servidor; o site é estático |
| `llms-full.txt` | Não entra: arquivos de referência medem 0,1 a 40 MB |
| Botões "copy page" e "Open in Claude/ChatGPT" | Decisão própria; sem medição publicada |
| Diretrizes de uso (`demos/nexora/guidelines/`) | Arquivos extras em `dist/docs/`, listados no índice, sob os mesmos orçamentos |

## Garantias

| Verificação | Falha quando |
| --- | --- |
| Orçamento de tamanho | `index.md` > 8 KB, `<family>.md` > 24 KB, `AGENTS.snippet.md` > 2 KB |
| Cobertura | Família com `contract.json` sem `<family>.md` num binding |
| Rótulo de bloco | Bloco "Example" que não compila |
| Rastreabilidade | Texto da saída que não é título fixo de seção, cabeçalho de tabela nem cópia literal de um campo de entrada (teste da função pura com entradas de fixture) |
| Determinismo | Duas gerações sobre as mesmas entradas diferem |
