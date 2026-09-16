# Autoavaliação — `command-palette`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões) e
`docs/component-features.md` §18. Inventário em
`2026-09-15-command-palette-capability-inventory.md`; desenho em
`2026-09-15-command-palette-design.md`.

Evidência: contrato `specs/components/command-palette/contract.json` (21
testes); folha `packages/styles/src/command-palette/command-palette.css`
(testes partilhados de `packages/styles`: 0 falhas nesta família); React
`packages/react/src/command-palette/` (27 testes de comportamento, 4 de
página); Angular `packages/angular/command-palette/` (17 de comportamento, 4 de
página); núcleo `packages/core/src/commands/` (11) e as adições a
`collection/filter.ts` (8) e `keys/keys.ts` (7).

Capturas lidas (harness `tools/harness/out/command-palette.html`):
`default` light/dark/high-contrast a 420 e a 720, light a 240 (ecrã inteiro),
dense; `pages` em rtl; `query` com foco em `clear`; `default` com foco em
`input`; `content` dark; `states`; `sizes`.

---

## 1. Ícones

A lupa (`--slotted-icon-search`), o ✕ do `clear` (`--slotted-icon-x`), o
chevron da trilha e da seta de página (`--slotted-icon-chevron-right`,
espelhado por `:dir(rtl)`) são máscaras da escala de glifos; o anel é o de
`spinner`. A marca do item é do consumidor, na coluna que a família reserva.
`forced-colors` mantém a tinta de cada máscara.

Mudança que mais melhoraria: um glifo próprio para "abre uma página" em vez do
chevron partilhado com `menu`. Não feita — o chevron é o que Raycast e Linear
desenham e a escala não ganha um passo por uma leitura já estabelecida.

## 2. Movimento

A camada chega e sai pelo `dialog`. A linha corrente não transita
(`transition: none`): uma mudança de linha é leitura, não deslocamento, e uma
transição fica atrás de um leitor a segurar `ArrowDown`. Hover e os controles
do cabeçalho transitam cor no passo `--slotted-control-transition-duration`.

Mudança: nenhuma identificada; a decisão de não animar o realce é deliberada.

## 3. Responsividade

`container-type: inline-size` na raiz, `container-name: command-palette`,
ponto literal de 360px: abaixo dele `description` e `meta` somem, o atalho
fica, a trilha limita-se a um terço. Dentro do `dialog` abaixo de 30rem do
seu contêiner a raiz fixa-se à camada e perde raio, borda lateral e sombra —
lido a 240 e a 420 no harness. A 720 o painel flutua.

Mudança feita durante a revisão: o ponto de 400px escondia a descrição a
420px; passou a 360px.

## 4. Refinamento

Cabeçalho um passo acima da linha, rodapé um passo abaixo; anel de foco como
banda na borda inferior do cabeçalho; linha corrente = chão accent + anel
inset (R1 recusa trilho inicial); `meta` sem atalho ocupa as colunas 3–4 para
terminar onde os atalhos terminam; `kbd` no passo da paleta.

O detalhe que mudaria com mais uma hora: a coluna do atalho é tão larga
quanto o atalho mais largo da lista, e um `meta` numa linha com atalho fica
uma coluna à esquerda do fim — visível na cena `content` ("Empfohlen"). Não
feito: é a consequência do subgrid que `menu` também aceita, e o custo
alternativo (meta e atalho na mesma célula) perde o alinhamento dos atalhos.

## 5. Tokens

77 propriedades lidas, todas em `command-palette.tokens.json`. Um literal
documentado: `--slotted-command-palette-list-max-block-size` com fallback
`22rem`, com o motivo de `--slotted-dialog-measure`. Nenhuma escala paralela;
a geometria vem de `--slotted-control-*`, o chão/borda/raio/sombra do painel
da camada semântica.

Mudança: nenhuma; o literal está justificado na folha.

## 6. Padrões

Combobox Pattern (popup listbox) transcrito no desenho §6 e no contrato
(`keyboard`, 17 entradas, cada uma com origem `pattern|platform|family`);
Dialog (Modal) respondido pela família `dialog`. Duas partidas escritas:
`aria-expanded` sempre `true`; `Escape` limpa antes de fechar.

Mudança: nenhuma pendente.

## 7. Acessibilidade

`role="combobox"` no campo com `aria-expanded`, `aria-controls`,
`aria-activedescendant`, `aria-autocomplete="list"`; `role="listbox"` e
`option`; `aria-selected` na corrente; `aria-disabled`; `aria-busy` no item
pendente e na lista; `aria-keyshortcuts` nos acordes (sequências só
desenhadas); `role="status"` oculto e o `live-announcer`; nome do diálogo
(`label`) e do campo (`inputLabel`); `hidden h2` no Angular para o
`aria-labelledby` do diálogo. Verificado em jsdom (React e Angular) e no
harness; **não verificado num leitor de tela real**.

Mudança: testar com VoiceOver/NVDA o anúncio de `aria-activedescendant` com
`aria-expanded` sempre `true`. Não feita — esta máquina não tem leitor de tela.

## 8. API nativa

React: `ComponentPropsWithRef<'div'>` na raiz, `inputProps` com `ref`,
`render` no gatilho, `compose` nos handlers. Angular: `input()`, `model()`,
`output()`, `computed`, `host`, `HostAttributeToken('id')`, `exportAs`,
`DestroyRef`, `ng-template` para item/rodapé/vazio. Assimetria registada: o
React nomeia o diálogo por `aria-label`; o Angular por um título oculto que o
`sl-dialog` aponta, porque o `aria-label` do host é lido estático.

Mudança: `sl-dialog` aceitar `ariaLabel` como input. Não feita — é ficheiro de
outra família; fica como reabertura sugerida.

Defeito desta família, encontrado na segunda ronda e corrigido: a regra do
`separator` entre grupos era um seletor descendente e alcançava o `then` e o
`+` que `kbd` também chama `separator`, pintando-os como réguas de um pixel —
a barra sobre a palavra e a palavra empurrada para fora da caixa. Passou a um
seletor filho da lista com `:not([data-separator])`. As três células do fim
da linha (`meta`, `shortcut`, `arrow`, `busy`) ocupam agora as duas linhas do
item e centram-se, para uma tecla mais alta que a linha do rótulo não afastar
a descrição.

## 9. Capacidade

Contra o inventário: 24 table stakes (23 adopt/adapt, 1 decline com dono),
8 diferenciadores, 13 lacunas — todas com resposta no contrato ou no código.
Cinco modelos de estado (`open`, `value`, `current.item`, `current.page`,
`queue`), cada um com par controlado/não controlado, razão e linha na
matriz. Teclado chave a chave nos testes de ambos os bindings.

Mudança: virtualização — adiada para `collection`, como `menu` e `select`.

## 10. Integração no ecossistema

Tabelas do desenho §9 e §10 respondidas linha a linha. React: provider,
`render`, handle (`open/close/toggle/focus/setQuery/scrollToId/input`),
`useId`, marcador de origem do portal. Angular: `provideCommandPaletteDefaults`,
`exportAs`, gatilho como diretiva que se regista no `triggerNode` do diálogo,
`container` input. Sem `ControlValueAccessor` — a paleta não guarda um valor
de formulário.

Mudança: nenhuma pendente.

## 11. Documentação

Vinte cenários, cada um com título, legenda ≥ 40 caracteres e trecho
formatado (verificado por `snippetFormatErrors`); anatomia de 26 partes;
tabela de eventos; composição; oito frases de acessibilidade. Página React
lida renderizada a 1280 (light e dark) e a 620, com todas as gavetas de
código abertas; `audit.mjs` a 1280 e a 620 sem achados (28 palcos). Página
Angular **não lida**: a porta 6007 não responde.

Defeitos encontrados na leitura e corrigidos: cenas em duas e três colunas
espremiam o painel a 300px (todas passaram a uma coluna); o painel dentro de
um popover media 2px (contenção de tamanho inline retira o conteúdo da medida
intrínseca — `contain-intrinsic-inline-size: 22rem` na raiz); as cenas
operadas (playground, hotkey, composition) eram um canvas vazio de 22rem na
página — na página o gatilho fica numa barra e a paleta abre sobre a própria
página, como numa aplicação; o `then` e o `+` de `kbd` em `plain` ficavam
abaixo da linha dos caps — causa acima, em §8; os atalhos dos itens são
keycaps `outline` de `kbd` em `inherit`, a um décimo do tipo secundário, sem
separador (`separator=""`); o rodapé caps `outline` na mesma proporção do
seu tipo, com a palavra em `line-height: 1` para centrar com os caps.

Mudança pendente: ler a página Angular quando o 6007 subir.

---

## Contra §18

1. **Propósito e anti-uso** — desenho §1.
2. **Anatomia** — 26 partes, contrato e páginas.
3. **Contrato controlado/não controlado com razão** — cinco modelos; a
   execução é evento (`onSelect`/`select`) e não estado, com o motivo escrito.
4. **Matriz de estados** — `default hover active focus-visible open disabled
   loading current`; hover recua para `current` e `disabled`; `loading` no
   item e na raiz.
5. **Teclado, foco, ARIA** — 17 entradas; foco no campo; testes em ambos.
   Touch: linhas crescem para `--slotted-target-comfortable` pelo tema; não
   verificado em dispositivo.
6. **Recipes** — `size` sm/md/lg pela geometria de controle; três esquemas.
7. **Responsivo, RTL, reduced motion** — contêiner 360px, ecrã inteiro abaixo
   de 30rem no diálogo; rtl capturado; movimento só do diálogo.
8. **Loading, empty, error, disabled, conteúdo extremo** — cenas `loading`,
   `empty`, `async` (rejeição na `status`), `states`, `content`.
9. **SSR** — `useId`; o hotkey liga-se num efeito; `resolvePlatform` no
   Angular avisa sem `navigator`. Virtualização adiada.
10. **Exemplos** — 20 cenas num só domínio (consola de deploy).
11. **Testes partilhados entre bindings** — a ordem vem de
    `@slotted/core/commands` (11 testes); cada binding testa os mesmos
    comportamentos.
12. **Changelog/migração** — família nova; sem quebra.
