# Dossiê ReUI — alert dialog (membro `alertDialog` da família `dialog`)

## 0. Cabeçalho

- Família: `dialog`, membro `alertDialog` (`role="alertdialog"`)
- Modo: `polish`
- Data: 2026-09-29
- HEAD: `fd5bc64a` (ramo `review/implementation-pass-1`)
- Specimens: `tools/harness/out/specimen/rx-<item>/` e `tools/harness/out/specimen/dialog/`

## 1. Seleção

Cobertura: `direta`. O ReUI publica catorze exemplos `c-alert-dialog-*`. O primitivo é o `AlertDialog` do shadcn/ui: `https://reui.io/r/alert-dialog.json` responde `Registry item not found … alert-dialog is part of shadcn/ui`. As regras `nova` do primitivo foram lidas no CSS servido pela página (`reui-src/nova.css`, seletores `.style-nova .cn-alert-dialog-*`).

Termos pesquisados em `llms-full.txt` (2188 linhas): `alert dialog` 15, `alert-dialog` 14, `AlertDialog` 6, `confirm` 15, `delete` 15, `dialog` 74, `destructive` 0.

Base `radix` em vez de `base`. Na rota `/preview/base/example/c-alert-dialog-5`, o clique no gatilho remove as folhas de estilo da página: 523 tokens na raiz antes do clique, 34 depois (`c-alert-dialog-5-light-1280.json` contra `c-alert-dialog-5-light-1280-click-button-7b7fcc.json`). A rota `radix` mantém 523 tokens com o diálogo aberto.

| Item                | Tipo         | Rota                                      | Parte ou interação Slotted que informa                                       | Capturas                                                                             |
| ------------------- | ------------ | ----------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `c-alert-dialog-5`  | Free example | `/preview/radix/example/c-alert-dialog-5` | `size="sm"`, tom de perigo, `icon`, `footer`, `cancel`, `action`             | `light-1280`, `light-720`, `dark-1280`, `-motion-reduce`; estados do footer (`579857`) |
| `c-alert-dialog-3`  | Free example | `/preview/radix/example/c-alert-dialog-3` | tamanho por omissão: marca ao lado do título                                 | `light-1280`, `dark-1280`, `-motion-reduce`; estados do footer                         |
| `c-alert-dialog-9`  | Free example | `/preview/radix/example/c-alert-dialog-9` | `warning`, conteúdo extra no footer                                          | `light-1280`, `dark-1280`, `-motion-reduce`; estados do footer                         |
| `profile-10`        | Pro block    | `/preview/radix/profile-10`               | confirmação de revogação aberta de um menu; nome do objeto na descrição      | `light-1280`, `dark-1280`; estados do footer (`e79528`)                               |
| `solution-users-2`  | Pro block    | `/preview/radix/solution-users-2`         | confirmação de remoção na danger zone; nome do objeto na descrição           | `light-1280`, `dark-1280`; estados do footer (`e79528`)                               |

Slotted: cena `alert-danger`, `slotted-{light,dark,high-contrast}-720`, `-motion-reduce`, `-forced`, `-dense`, `-rtl`; estados de `cancel` e `action` (`f34949`).

## 2. Anatomia

| `data-slot` ReUI           | Parte Slotted | Estado              |
| -------------------------- | ------------- | ------------------- |
| `alert-dialog-overlay`     | `backdrop`    | igual               |
| `alert-dialog-content`     | `content`     | igual               |
| `alert-dialog-header`      | `header`      | igual               |
| `alert-dialog-media`       | `icon`        | igual               |
| `alert-dialog-title`       | `title`       | igual               |
| `alert-dialog-description` | `description` | igual               |
| `alert-dialog-footer`      | `footer`      | igual               |
| `alert-dialog-cancel`      | `cancel`      | igual               |
| `alert-dialog-action`      | `action`      | igual               |
| —                          | `root`        | só no Slotted       |
| —                          | `viewport`    | só no Slotted       |
| —                          | `body`        | só no Slotted       |

## 3. Medidas

Largura de página: ReUI 720 (`c-alert-dialog-5-light-720`) e 1280 para os restantes; Slotted 720. Nenhuma propriedade abaixo varia com a largura entre 720 e 1280 no ReUI (painel 320 nas duas). Tamanho `sm` nos dois lados.

| Parte         | Propriedade        | ReUI                                     | Slotted hoje                                  | Alvo                                           | Veredicto                                                                                             |
| ------------- | ------------------ | ---------------------------------------- | --------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `content`     | rect               | 320 × 241                                | 386 × 167.19                                  | 386 × 147 (descrição de duas linhas)            | `adaptar`: a altura fracionária vem da linha do título (linha seguinte)                                |
| `content`     | inline padding     | 16                                       | 0 (cada linha tem o seu)                      | sem mudança                                    | `recusar`: três insets por linha documentados em `dialog.css`                                          |
| `content`     | radius             | 14                                       | 8                                             | `--slotted-radius-lg`                          | `recusar`: 14 não tem degrau                                                                           |
| `content`     | border             | anel 1px `oklab(0.145 0 0 / 0.1)`, sem sombra | 1px `rgb(216,222,230)` + `--slotted-shadow-lg` | sem mudança                                 | `superar`: sob cores forçadas o Slotted engrossa a borda para 2px (`-forced`), o ReUI não tem tratamento |
| `backdrop`    | fundo              | `oklab(0 0 0 / 0.1)`, `blur(4px)`        | `rgba(15,23,42,0.45)`, sem blur               | sem mudança                                    | `recusar`: o blur custa uma camada de composição por quadro e a página atrás não precisa de ser lida   |
| `header`      | padding            | 0 (herda 16 do painel)                   | 12 / 20                                       | sem mudança                                    | `recusar`: insets por linha                                                                            |
| `header`      | gap título–descrição | 6                                      | 4                                             | sem mudança                                    | `recusar`: a linha de 24 do alvo acrescenta 0.4 acima da descrição                                     |
| `icon`        | caixa              | 40 × 40, radius 8, fundo tom a 10%       | 16 × 16, sem fundo                            | sem mudança                                    | `recusar`: R5 fixa a marca no tamanho do título (`dialog.css`, `--_status-size`)                       |
| `icon`        | glifo              | 24                                       | 16                                            | sem mudança                                    | `recusar`: R5                                                                                          |
| `title`       | font-size          | 16                                       | 16                                            | `--slotted-font-size-lg`                       | igual                                                                                                  |
| `title`       | weight             | 500                                      | 600                                           | `--slotted-font-weight-semibold`               | `recusar`: o título é o único cabeçalho do painel                                                      |
| `title`       | line-height        | 24                                       | 23.2 (`1.45`)                                 | 24 (`--slotted-line-height-md`, 1.5)           | `adotar`: 23.2 põe `header` (114.19) e `content` (167.19) fora da grelha de píxel                      |
| `title`       | letter-spacing     | normal                                   | normal                                        | normal                                         | igual                                                                                                  |
| `description` | font-size / linha  | 14 / 20                                  | 14 / 21                                       | sem mudança                                    | `recusar`: 21 é inteiro e segue `--slotted-line-height-md`                                             |
| `description` | cor                | `oklch(0.556 0 0)`                       | `rgb(91,107,127)`                             | sem mudança                                    | igual por papel (`--slotted-text-muted`)                                                              |
| `description` | `strong` interno   | 500, `oklch(0.145 0 0)` (cor do título)  | 700 herdado, cor muted                        | `--slotted-font-weight-semibold`, cor do título | `adaptar`: `profile-10` e `solution-users-2` destacam o nome do objeto destruído                       |
| `footer`      | padding            | 16                                       | 8 / 20                                        | sem mudança                                    | `recusar`: inset do footer documentado em `dialog.css`                                                 |
| `footer`      | gap                | 8                                        | 12                                            | sem mudança                                    | `recusar`: 12 separa melhor ação e cancelamento destrutivos                                            |
| `footer`      | fundo / régua      | `oklab(0.97 0 0 / 0.5)`, 1px             | `rgb(247,248,250)`, 1px                       | sem mudança                                    | igual por papel (`--slotted-surface-sunken`)                                                          |
| `cancel`/`action` | altura / radius | 32 / 10                                 | 34 / 4                                        | sem mudança                                    | `outra família`: `button`                                                                              |

## 4. Coreografia de estados

`cancel` e `action` são botões da família `button`. O membro `alertDialog` não tem outra parte interativa (sem `close`).

| Parte    | Estado        | Delta ReUI                                                               | Delta Slotted hoje                                                            | Alvo                                    |
| -------- | ------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------- |
| `cancel` | hover         | fundo transparente → `oklch(0.97 0 0)`                                   | fundo transparente → `rgb(241,245,249)`; ΔL 0.032                              | sem mudança                             |
| `cancel` | active        | fundo `oklch(0.97 0 0)`, opacity 0.6, translate 0 1px                    | fundo → `rgb(226,232,240)`                                                    | sem mudança                             |
| `cancel` | focus-visible | anel 3px `oklab(0.708 0 0 / 0.5)` (≈ 1.5:1 sobre branco)                 | outline 2px `rgb(37,99,235)`, offset 2; 4.86:1 sobre `rgb(247,248,250)`        | `superar`                               |
| `action` | hover         | fundo tom 10% → 20%                                                      | `rgb(220,38,38)` → `rgb(222,52,47)`; ΔL 0.014                                  | `outra família`: `button`, ΔL ≥ 0.02     |
| `action` | active        | opacity 0.6, translate 0 1px                                             | fundo → `rgb(153,27,27)`, sombra → none, translate 0 1px                       | sem mudança                             |
| `action` | focus-visible | anel 3px tom a 20%                                                       | outline 2px; 4.86:1 claro, 7.69:1 escuro, 21:1 alto contraste                  | `superar`                               |
| `action` | hover, forced | —                                                                        | delta vazio (`-forced`)                                                       | `outra família`: `button`                |

## 5. Movimento

| Lado            | Parte      | Entrada                                              | Saída                                              | Movimento reduzido                          |
| --------------- | ---------- | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| ReUI            | overlay    | `@keyframes enter`, opacity 0 → 1, 100ms `ease`      | `exit`, opacity 1 → 0, 100ms `ease`                | 100ms mantidos (`-motion-reduce`)            |
| ReUI            | content    | `enter`, opacity 0 → 1 e scale 0.95 → 1, 100ms `ease` | `exit`, opacity e scale 0.95, 100ms `ease`        | 100ms mantidos, incluindo a escala           |
| Slotted hoje    | backdrop   | opacity, 320ms `--slotted-easing-standard`           | opacity, 120ms `--slotted-easing-exit`             | 0.001s                                      |
| Slotted hoje    | content    | opacity, 320ms `--slotted-easing-standard`           | opacity, 120ms `--slotted-easing-exit`             | 0.001s                                      |
| Slotted alvo    | —          | sem mudança: DG4 mantida pelo gate de 2026-09-29      | sem mudança                                        | sem mudança                                 |

A escala do ReUI reamostra o texto do painel em cada quadro; R7 e `text-scale.test.mjs` recusam-na no Slotted.

## 6. Capacidades

| Capacidade                                  | Onde aparece no ReUI                      | Forma no ReUI                                                 | Forma no Slotted                                                                      | Em que a forma Slotted é melhor                                                  | Veredicto | Família dona, se não esta |
| ------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------- | ------------------------- |
| Nome do objeto destacado na descrição       | `profile-10`, `solution-users-2`          | `<span className="text-foreground font-medium">` escrito à mão | `<strong>` nativo dentro de `description`; a folha dá-lhe a cor do título            | elemento nativo com semântica de importância; nenhuma classe a lembrar            | `adaptar` | —                         |
| Marca num quadrado tonal (`AlertDialogMedia`) | `c-alert-dialog-3`, `-5`                | parte `Media` com classes de cor por instância                 | `icon` com o glifo do `tone`, cor pelo tom                                             | a cor segue `tone` e o esquema; nenhuma classe por instância                     | `recusar` | —                         |
| Layout centrado em `size="sm"`              | `c-alert-dialog-1`, `-5`                  | cabeçalho e botões centrados, botões em duas colunas iguais    | cabeçalho alinhado ao início, ações ao fim                                             | a descrição de três linhas não fica com as duas margens irregulares               | `recusar` | —                         |
| Ação destrutiva em fundo suave              | `c-alert-dialog-5`, Pro blocks            | `variant="destructive"` com fundo a 10%                        | `action` `solid` `danger`                                                             | a ação irreversível tem o maior contraste do painel                               | `recusar` | —                         |
| Checkbox "não perguntar outra vez" no footer | `c-alert-dialog-9`                       | `Checkbox` e `Label` à esquerda das ações                      | não oferecido                                                                          | uma confirmação de ação irreversível não se desliga dentro de si própria          | `recusar` | —                         |
| Alert dialog aberto de dentro de um dialog  | `c-alert-dialog-6`                        | `AlertDialog` dentro de `DialogFooter`                         | cena `nested`; `--slotted-layer-depth` soma um degrau                                 | as duas formas coincidem                                                         | `adotar`  | —                         |

## 7. Superar

| Critério        | ReUI                                                   | Slotted hoje                                                                                  | Alvo                                             | Fonte                                              |
| --------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------- |
| Pixel grid      | passa: content 241, header 144, footer 65              | falha: content 167.19, header 114.19 (title 23.19)                                            | content 147, header 94, title 24 (após o delta, com a descrição de duas linhas) | `slotted-light-720`, `rx-c-alert-dialog-5-light-720` |
| Hover           | passa: delta não vazio nos dois botões                 | falha em `action`: ΔL 0.014 < 0.02 (claro e escuro)                                           | `outra família`: `button`                        | estados `f34949`                                   |
| Press           | falha: active repete o fundo do hover                  | passa: active ≠ hover nos dois botões                                                         | `superar`                                        | estados `579857`, `f34949`                         |
| Focus           | falha: anel ≈ 1.5:1 sobre branco                       | passa: 4.86:1 claro, 7.69:1 escuro, 21:1 alto contraste                                       | `superar`                                        | estados, três esquemas                             |
| Transition      | falha: `transition-property: all` com 150ms            | passa: lista explícita nos botões e `opacity` no painel                                       | `superar`                                        | estados                                            |
| Motion          | falha: entrada e saída em `ease`                       | falha na letra do critério: entrada em `--slotted-easing-standard`, não `--slotted-easing-enter`; DG4 em `dialog.css` regista a escolha | DG4 mantida pelo gate de 2026-09-29: exceção medida ao critério | `slotted-light-720`, `dialog.css` (backdrop, content) |
| Reduced motion  | falha: 100ms e escala mantidos                         | passa: 0.001s                                                                                 | `superar`                                        | `-motion-reduce` dos dois lados                    |
| Disabled        | não se aplica: nenhum botão desativado nas capturas    | não se aplica                                                                                 | —                                                | —                                                  |
| Schemes         | sem alto contraste nem cores forçadas                  | passa: alto contraste com borda preta; `-forced` com borda 2px `CanvasText` e marca preta     | `superar`                                        | `slotted-high-contrast-720`, `-forced`             |
| Density and RTL | sem eixo                                               | passa: dense reduz o footer de 51 para 43 e os botões para 26; rtl espelha marca e ações      | `superar`                                        | `-dense`, `-rtl`                                   |
| Target size     | botões 32                                              | botões 34, dense 26 (≥ 24)                                                                    | sem mudança                                      | estados                                            |
| Intent          | classes Tailwind sem razão escrita                     | passa após o delta: cada valor novo com token e comentário                                    | —                                                | `dialog.css`                                       |

## 8. Delta

| #   | Ficheiro                                              | Mudança                                                                                                                                                                 | Linhas do dossiê que resolve                        | Captura que o prova                                  |
| --- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------- |
| 1   | `packages/styles/src/dialog/dialog.css`               | `title` com `line-height: var(--slotted-line-height-md, 1.5)`: 24 em `sm`, 27 em `md`; a margem da marca calcula com o mesmo token: (24 − 16) / 2 = 4 em `sm`, (27 − 18) / 2 = 4.5 em `md`| § 3 `title` line-height, `content` rect; § 7 Pixel grid | `slotted-light-720`: title 24, header 94, content 147; nenhuma parte enquadrada fracionária na página |
| 2   | `packages/styles/src/dialog/dialog.harness.html`      | cena `alert-danger`: a descrição nomeia o projeto em `<strong>`                                                                                                         | § 3 `description` `strong`                          | `slotted-light-720`: `strong` presente               |
| 3   | `packages/styles/src/dialog/dialog.css`               | `description > :is(strong, b)` com a cor do título e `--slotted-font-weight-semibold`                                                                                   | § 3 `description` `strong`; § 6 primeira linha      | `strong` 600 em `rgb(15,23,42)` claro, `rgb(250,250,250)` escuro, `rgb(0,0,0)` alto contraste e `-forced` |
| 4   | `packages/styles/src/button/` — `outra família`       | hover de `solid` `danger` com ΔL ≥ 0.02                                                                                                                                 | § 4 `action` hover; § 7 Hover                       | não aplicado                                         |
| 5   | `packages/styles/src/dialog/dialog.css` — gate        | não aplicado: o gate manteve DG4                                                         | § 5; § 7 Motion                                     | `slotted-light-720` `transition-timing-function`     |
