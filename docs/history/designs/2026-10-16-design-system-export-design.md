# Exportação do design system para o Claude Design — desenho

Data: 2026-10-16. Subprojeto 4 de 4 do material de IA da Slotted. Segue [2026-10-16-product-skills-design.md](2026-10-16-product-skills-design.md). Decisões tomadas sem revisão do usuário, por delegação ("pode seguir com tudo que achar necessário").

## Objetivo

Um sistema do tipo Design System do Claude ("Claude Design") mostra a Slotted: tokens dos três esquemas com a nota de uso de cada um, fontes reais, uma página por família com prévia e guia, e um livro de regras que nomeia tokens. O sistema é regenerado por um comando a partir das fontes do repositório; nenhum valor é escrito à mão.

Sistema publicado: `https://claude.ai/artifact/4TKQdNKUXAXwzTDmk8buS1`, privado até o usuário compartilhá-lo.

## Escopo

Dentro:

- gerador `tools/agent-docs/bin/design-system.mjs`, que escreve `<out>/project/` no formato do tipo;
- `tokens.json` a partir de `flattenTheme` do tema padrão e dos grupos do contrato;
- `README.md` a partir de uma fonte em `tools/agent-docs/content/design-system/README.md` e dos grupos do contrato;
- uma pasta por família com `README.md` (a página da família no binding React) e `preview.html` estático;
- `components/bundle.css` com o tema padrão e as folhas das famílias;
- fontes Geist e Geist Mono em `fonts/`;
- capa em `components/Cover/preview.html`;
- procedimento de republicação no guia do mantenedor.

Fora:

- prévias interativas: exigem empacotar React e a biblioteca como script clássico;
- edição de tokens pela página refletida nas prévias: o tema declara os tokens no elemento com `data-slotted-theme`, que a folha gerada pela página não alcança.

## 1. `tokens.json`

- `color.themes`: `light`, `dark`, `high-contrast`, nessa ordem.
- `color.tokens`: cada token de cor dos grupos lidos pela aplicação, com nome sem `--`, valor hex por esquema (`flattenTheme` e `resolveTokens`) e `usage` = propósito do grupo e significado da dimensão, o mesmo texto de `tokens.md`. Um valor que não é cor concreta (`transparent`) sai do arquivo e entra na lista do relatório.
- `type`: `fonts` com os arquivos copiados; `families` com as pilhas do grupo `font-family`; um grupo de estilos com um estilo por passo de `font-size`, com o `line-height` do mesmo passo e o peso regular.
- `spacing`, `radius`, `shadow` (valor do esquema `light`), `borderWidth`, `zIndex`.
- `meta`: `source` `github`, `repo`, `ref` (`main@<sha>`), os caminhos lidos e a data.

## 2. Componentes

- Pasta `components/<Família em PascalCase>/`.
- `README.md`: a página React da família, gerada por `renderFamily`, sem o título.
- `preview.html`: linha 1 `<!-- @dsCard group="<prateleira>" height=<n> -->`; o HTML estático do exemplo mínimo React renderizado por `react-dom/server`, dentro de um elemento com `data-slotted-theme="default"`, e um script que copia o `data-theme` do documento para `data-slotted-scheme`.
- Uma família cujo exemplo não renderiza no servidor fica só com `README.md` e entra no relatório.

## 3. Livro de regras

`content/design-system/README.md` traz o texto: o que a Slotted é, fundamentos visuais por grupo, estados e foco, layout, ícones e consumo. O gerador acrescenta a lista de tokens por grupo. O teste de conteúdo resolve cada nome entre crases contra o catálogo.

## 4. Publicação

O comando escreve a árvore num diretório; uma sessão com a ferramenta de Artifact publica `project/` na URL do sistema, com o índice `project/design-system.json` por último. O guia do mantenedor descreve os passos.

## 5. Testes

- `tokens.json` lido pela gramática do tipo: nomes válidos e únicos, cor hex, cada token de cor da aplicação presente nos três esquemas.
- O gerador é determinístico para um mesmo `ref`.
- Cada família tem `README.md`; o relatório lista as famílias sem prévia.
