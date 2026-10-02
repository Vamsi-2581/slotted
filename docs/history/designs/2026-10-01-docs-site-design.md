# Site de documentação oficial — desenho

Data: 2026-10-01. Estado: aceito.

## Objetivo

Um site público de documentação em inglês, com React e Angular como dimensões de primeira classe. Cada exemplo é executado no framework selecionado pelo leitor. Um framework futuro entra acrescentando um runtime de exemplos, um diretório de exemplos e um extrator de API, sem alterar a camada neutra.

## Decisões

| Tema | Decisão |
| --- | --- |
| Aplicação | `apps/docs`, Astro 7, saída estática |
| Conteúdo neutro | MDX em `apps/docs/src/content/`, uma entrada por família e uma por fundamento |
| Exemplos | Arquivos reais em `apps/docs/examples/<framework>/<family>/<example>.{tsx,ts}`. O mesmo arquivo alimenta o preview (módulo) e o código exibido (`?raw`) |
| Runtime de exemplo | Um módulo por framework com dois pontos de entrada: `render(id)` no servidor (HTML) e `mount(element, id)` no cliente |
| React | `react-dom/server` no build; `hydrateRoot` no cliente quando o preview entra na viewport |
| Angular | Compilado pelo Vite do Astro com `@analogjs/vite-plugin-angular`, o mesmo compilador do Storybook Angular. HTML do build por `@angular/platform-server`; montagem no cliente por `createApplication` + `createComponent({ hostElement })` |
| Pacotes | Resolvidos a partir do código-fonte, pela convenção de `scripts/source-aliases.mjs` |
| Interface do site | `@slotted/react` + `@slotted/theme-default` |
| Código do exemplo | Abaixo do preview, num `CodeBlock` de `@slotted/react` hidratado ao ficar visível, recolhido acima de 16 linhas |
| Realce de código | Shiki no build, só escopos TextMate; `fromShikiTokens` de `@slotted/core/code` reduz aos doze escopos que o tema pinta por `--slotted-code-<scope>` |
| URLs | `/<framework>/components/<family>`, `/<framework>/` (início), `/foundations/<slug>` |
| API | Gerada do código: TypeScript Compiler API no React; metadata Angular no Angular |
| Acessibilidade e teclado | Lidos de `specs/components/<family>/contract.json` |
| Tokens | Lidos de `@slotted/styles/<family>/tokens.json` |
| Busca | Pagefind |
| Consumo por IA | Rota `.md` por página e `llms.txt` |

O runtime de exemplo dispensa as diretivas `client:*` do Astro. Uma diretiva exige import estático do componente, e o catálogo de exemplos é resolvido por id em tempo de build.

## Plano B do Angular

Condição de ativação: `@analogjs/vite-plugin-angular` falhar dentro do Vite do Astro 7, em build ou SSR.

Substituto: build do Angular CLI (`@angular/build:application`) em `apps/docs/examples/angular`, com saída em `public/ng/` e um registro de exemplos gerado por script. Previews Angular passam a ser renderizados só no cliente, e a caixa do preview reserva a altura medida no build React do mesmo exemplo.

## Garantias

| Verificação | Falha quando |
| --- | --- |
| Typecheck de `examples/**` | Um exemplo não compila |
| Paridade de catálogo | Um id de exemplo falta em algum framework |
| Paridade de DOM | `render(id)` do React e do Angular geram árvores diferentes de `data-ui`, `role` e `aria-*` |
| Idioma | Texto em pt-BR em MDX ou em `examples/**` |
| Links | Link interno ou âncora sem destino |
| Montagem | Erro no console ao montar um exemplo (cenário Playwright fixo) |

## Relação com o Storybook

O Storybook continua como bancada: matriz, cenários e harness. A página de referência de uma família sai do Storybook quando a página dela entra no site. O `*.docs.ts` correspondente é apagado na mesma alteração.

## Fora do escopo

- "Open in StackBlitz": depende da publicação no npm.
- Versionamento da documentação: entra com a primeira versão estável.
