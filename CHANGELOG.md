# Changelog

Every release of the six `@slotted/*` packages, newest first, at one shared version. `pnpm release` writes each entry from the commit subjects since the previous `v*` tag. The `0.x` line changes its public API between beta releases without deprecation.

## 0.1.0-beta.3 — 2026-10-19

- docs(evals): theme-app atende após o passo dos materiais
- feat(react): usePressSelection
- feat(button): justify between
- feat(theme): material translúcido
- perf(filter-bar): o modo compacto e o sticky medem só no relatório do observer
- perf(page-header): o sticky-header mede no primeiro relatório do ResizeObserver
- perf(chart): o tema lê-se uma vez por contexto e nunca dentro da montagem
- fix(agent-docs): o export do design system lê uma camada de estado como cor com alfa
- fix(theme): fontes geradas e snapshot proof a par dos contratos
- fix(react): o pacote deixa de embutir o react-dom
- docs(dialog): quem tem o inset do painel
- feat(chart): rótulos de anotações sem sobreposição
- feat(currency-field): appearance display
- feat(list): fim do cabeçalho de grupo e variante ruled
- feat(segmented-control): variante underline
- feat(table): linha de grupo, linha atual e ação na linha
- feat(theme): tom neutral, camadas de estado e tracking
- perf(positioner): um cálculo para os pedidos feitos na mesma tarefa
- fix(app-shell): a navegação volta aberta ao sair de overlay

## 0.1.0-beta.2 — 2026-10-17

- fix(docs): llms.txt lista o skills/index.md de cada binding
- fix(agent-docs): renderExamples remove o require global que definiu
- docs(agent-docs): relatório da avaliação de 2026-10-17
- fix(agent-docs): devolve own-element ao caso original e leva o foco ao seat-map
- fix(agent-docs): brand-theme aceita o seed accent em qualquer forma da API (ThemeScope seeds, seedStyle, definição de tema) e confere o hex da marca; uma execução parcial imprime o relatório em vez de sobrescrever o de docs/history/evals
- fix(agent-docs): seat-map aceita assentos desenhados por toggle, toggle-group ou checkbox no lugar do foco, do alvo e das cores forçadas escritos à mão
- feat(agent-docs): a avaliação grava cada sessão num diário e retoma dele
- perf(agent-docs): a avaliação roda --jobs sessões ao mesmo tempo (4 por padrão) e encerra uma sessão passados 15 minutos; a primeira falha impede novas sessões
- fix(agent-docs): brand-theme aceita a marca passada por seedStyle({ accent }) de @slotted/theme/seeds
- fix(agent-docs): no-literal da avaliação ignora o passo de uma media ou container query e os comentários, como specs/demo-screen-tokens.test.mjs
- fix(agent-docs): build-own-element nomeia o seletor :focus-visible, os tokens do anel de foco, --slotted-target-min e forced-colors: active
- fix(agent-docs): uses-family no React aceita qualquer componente que a família exporta (SkeletonText, ProgressBar, Loader) ou o import do subcaminho
- fix(agent-docs): a avaliação para quando uma sessão não executa
- fix(agent-docs): a avaliação instala as fixtures de todos os bindings antes da primeira sessão, e a fixture Angular fixa @angular/forms, peer de @slotted/angular
- fix(agent-docs): theme-app mede a reestilização pela aparência que o CSS muda numa família, como review-screen e o snippet
- fix(agent-docs): o livro do design system diz onde um id de regra (CP-01) se resolve
- fix(agent-docs): review-screen acusa o CSS da aplicação que muda cor, borda, raio, preenchimento ou tipo de uma família, e não qualquer seletor sobre data-ui
- docs(agent-docs): o guia do mantenedor descreve a exportação do design system
- feat(agent-docs): exportação do design system
- feat(agent-docs): pastas de componente do design system
- feat(agent-docs): tokens.json do design system
- docs(agent-docs): desenho do subprojeto 4
- docs(agent-docs): o guia do mantenedor cita as sementes de avaliação, a linha de cada skill no snippet, skills/index.md gerado e a API de tema no catálogo
- feat(agent-docs): skill theme-app
- feat(agent-docs): skill build-own-element
- fix(agent-docs): o index.md remete a skills/index.md, que lista cada skill com a descrição
- feat(agent-docs): skill review-screen
- docs(agents): os betas 0.x saem no dist-tag latest, como scripts/release.mjs publica
- feat(agent-docs): avaliação com tela-semente
- feat(agent-docs): o catálogo lê a API pública de @slotted/theme e @slotted/themes (exportações, comando, subcaminhos, atributos de tema, seeds, camadas, esquemas e densidades); o placeholder {{themeScope}} nomeia o ThemeScope do React e o slThemeScope do Angular, conferidos no código dos bindings
- docs(agent-docs): desenho do subprojeto 3
- feat(agent-docs): as regras de relatórios, construtores, conversas, workspaces e ledgers passam a valer para qualquer aplicação
- docs(token-foundation): a frase do Glyph nomeia o ícone próprio da família em vez de remeter a um antecedente removido
- fix(agent-docs): revisão final
- test(agent-docs): caso own-element
- docs(agent-docs): guia do mantenedor (o que editar, o que é gerado, sequência de release) e guia de escrita de skills; cada skill exige um caso de avaliação e cada caso uma skill existente
- refactor(agent-docs): o registro de ids é lido dos tópicos, agora e na última tag; ids.json sai, e uma regra nova é editada num arquivo só; o release lê o mesmo registro
- feat(agent-docs): tópico own-elements (OE-01..OE-10)
- feat(docs): o site serve tokens.md de cada binding e o lista no llms.txt
- feat(agent-docs): cada binding publica tokens.md, citado pelo index.md; o texto passa pelo catálogo e pelo filtro de publicação
- feat(agent-docs): renderTokens
- feat(theme): o contrato diz para que serve cada token
- feat(theme): token-groups
- docs(agent-docs): plano do subprojeto 2
- docs(agent-docs): desenho do subprojeto 2
- fix(agent-docs): revisão final
- fix(tabs): o controlo de fechar é neutro e redondo, como o fecho do diálogo, e fica à distância do inset da aba a partir da última letra
- fix(progress-indicator): a espessura da barra passa a 4, 6 e 8 píxeis
- perf(dashboard-grid): o arrasto deixa de produzir long tasks
- feat(agent-docs): pnpm eval:agent-docs
- feat(agent-docs): núcleo da avaliação de eficácia
- feat(release): a entrada do changelog lista as regras de guideline adicionadas, aposentadas e reescritas, pelo diff de ids.json contra a tag anterior
- docs(nexora): a demo lê as instruções de agente como um consumidor
- feat(docs): o site serve guidelines e skills de cada binding como o pacote os publica, e llms.txt os lista; os README dos bindings dizem onde o snippet entra
- feat(agent-docs): skill de produto compose-screen
- feat(agent-docs): skill de produto waiting-states
- docs(guidelines): ER, BR, OV e PM passam ao pacote; PM-03 aposentada no pacote e reescrita na Nexora como PC-01, regra de domínio de compras; citações de secções da spec da demo (§) proibidas no texto publicado; a demo guarda só as regras do seu domínio
- docs(guidelines): LP, RP e FM passam ao pacote
- docs(guidelines): AF, LA, SC e CP passam ao pacote
- docs(guidelines): o protocolo de escrita passa a ter fonte única em tools/agent-docs/content, com Verified in só na fonte e Check escrito para o consumidor; protocolo de leitura publicado; a demo remete aos dois; o resolvedor aceita o vocabulário do formato e os caminhos de docs que existem
- test(agent-docs): o conteúdo publicado entra em pnpm check
- feat(agent-docs): o build escreve guidelines/ e skills/ a partir de tools/agent-docs/content, com {{docsDir}} e {{package}} por binding; index.md ganha as seções Guidelines e Skills; turbo reconstrói os bindings quando content/ muda
- feat(agent-docs): registro de IDs das guidelines
- feat(agent-docs): resolução dos nomes entre crases contra contratos, tema, tokens e propriedades declaradas nas folhas
- feat(agent-docs): análise, validação e renderização dos tópicos de guidelines
- docs: plano do material de agente do produto
- docs: desenho do material de agente do produto
- chore: delete .codex
- docs: resultado da triagem dos defeitos registados
- fix(multi-select): o grid leva o rótulo do campo e a contagem, como o contrato diz
- fix(drawer): um painel inline sem papel não escreve nome
- fix(menu): as props de render do trigger levam children como obrigatório
- fix(nexora): os cabeçalhos de linha com identificadores do cliente pedem text="nowrap"
- fix(number-field): a marca de scrub é uma corrida bidi própria
- fix(app-shell): o hover de uma linha da navegação vê-se sobre o fundo de canvas inset
- fix(stat-card): a ação é um alvo de toque inteiro num ponteiro grosso
- docs(feedback): os ledgers deixam de dizer uncommitted em 141 linhas, todas integradas em main a 2026-10-15; combobox e calendar (React) passam a fixed com a evidência
- fix(combobox): a lista revela o destaque sem rolar a página e esconde o que o filtro tirou
- docs: triagem dos defeitos registados
- feat(event-calendar): now
- fix(data-grid): uma paragem de Tab com coluna de seleção no Angular

### Guidelines

- Added: AF-01, AF-02, AF-03, AF-04, AF-05, AF-06, AF-07, BD-01, BD-02, BD-03, BD-04, BD-05, BD-06, BR-01, BR-02, BR-03, BR-04, CP-01, CP-02, CP-03, CP-04, CP-05, CP-06, CP-07, CP-08, CV-01, CV-02, CV-03, ER-01, ER-02, ER-03, ER-04, FM-01, FM-02, FM-03, FM-04, FM-05, FM-06, FM-07, FM-08, FM-09, FM-10, FM-11, FM-12, FM-13, FM-14, FM-15, FM-16, LA-01, LA-02, LA-03, LA-04, LA-05, LA-06, LG-01, LG-02, LP-01, LP-02, LP-03, LP-04, LP-05, LP-06, LP-08, LP-09, LP-10, LP-11, LP-12, LP-13, OE-01, OE-02, OE-03, OE-04, OE-05, OE-06, OE-07, OE-08, OE-09, OE-10, OV-01, OV-02, OV-03, OV-04, OV-05, PM-01, PM-02, RE-01, RE-02, RE-03, RE-04, RE-05, RE-06, RE-07, RE-08, RE-09, RP-01, RP-02, RP-03, RP-04, RP-05, RP-06, RP-07, RP-08, RP-09, RP-10, RP-11, RP-12, RP-13, SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, WS-01, WS-02

## 0.1.0-beta.1 — 2026-10-15

- docs(release): o comando que configura o trusted publisher de um pacote novo
- feat(release): lançamentos sem token nem OTP
- docs: documentação alinhada com a beta pública

## 0.1.0-beta.0 — 2026-10-15

- First public beta: `@slotted/react`, `@slotted/angular`, `@slotted/core`, `@slotted/theme`, `@slotted/themes` and `@slotted/styles`, with 124 component families specified in `specs/components/`.
