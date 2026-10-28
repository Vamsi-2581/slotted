# Changelog

Every release of the six `@slotted/*` packages, newest first, at one shared version. `pnpm release` writes each entry from the commit subjects since the previous `v*` tag. The `0.x` line changes its public API between beta releases without deprecation.

## 0.1.0-beta.21 — 2026-10-28

- docs(agents): findings chegam como issues com o rótulo finding e o formulário de .github/ISSUE_TEMPLATE; o commit que corrige fecha a issue com Fixes #n
- chore(progress): fila de findings da equori
- feat(drawer): a viagem programática do bottom sheet
- fix(chart): o snippet Angular do gráfico numa secção passa no formato que o workbench verifica
- chore(progress): fila de findings da equori
- feat(theme): a raiz do tema declara font-size e line-height do passo md, e o texto que nenhuma família desenha herda 14px em vez dos 16px do browser
- chore(progress): fila de findings da equori
- feat(tag): variante dashed
- test(alert): num banner de página cuja mensagem quebra, ação e dismiss ficam na primeira linha
- fix(field): os roots dos controlos de campo declaram flex-basis: content
- fix(chart): no Angular, sem title, o plot é nomeado pelo aria-label escrito na figure, como no React; docs e exemplo de um gráfico que a secção já nomeia

## 0.1.0-beta.20 — 2026-10-28

- chore(progress): fila de findings da equori
- docs(chart): sem title, o plot é nomeado pelo aria-label do Chart; exemplo de um gráfico que a secção já nomeia
- feat(button): IconButtonLink
- fix(date-picker): o root do date-picker e o do select deixam de declarar inline-size: 100%, que numa linha flex fazia da linha inteira a base de cada item e cortava a data
- chore(theme): regenera hooks.json com data-actions-placement do alert
- feat(alert): actionsPlacement põe as ações no fim da linha da mensagem a partir de 40rem; padrão end para reach page e below para os outros alcances
- fix(portal): as seeds de uma camada são lidas no elemento que as declara e não no opener; abrir um menu a 24 níveis no jsdom deixa de levar 160 s

## 0.1.0-beta.19 — 2026-10-28

- docs(evals): avaliação de 2026-10-28
- docs(agent-docs): o snippet React diz que um link do roteador só aparece no render de uma família; caso de avaliação record-link
- fix(app-shell): o aside-resizer de um pane em coluna fica no centro do gutter em inset e floating e no centro da costura em flush e panel; o pane deixa de rolar e só o aside-body rola
- fix(page-header): o back posto direto na área do título recebe o estilo do back no nav
- fix(collapsible): um gatilho sem descrição centra o rótulo e o indicador quando a altura do controle excede o conteúdo (align-content: center)

## 0.1.0-beta.18 — 2026-10-27

- test(agent-docs): o teste de inline-message trata a captura ausente das famílias
- chore(theme): regenera hooks.json depois da saída de --slotted-app-shell-resizer-color
- test(app-shell): o teste da marca do resizer procura a regra pelo fim do seletor, que o Prettier mantém numa linha
- docs(evals): avaliação de 2026-10-27
- docs(inline-message): a mensagem de uma região é um alert
- feat(description-list): minColumnWidth sm | md escolhe onde a contagem de colunas dobra
- feat(app-shell): o aside-resizer desenha a marca do splitter em repouso
- chore(demo): demo:refresh fixa a Nexora na versão corrente (pack-beta --pin); a Nexora passa a 0.1.0-beta.17
- fix(angular): as entradas de currency-field e menubar passam a públicas; um teste de fonte recusa input, model ou output protected

### Guidelines

- Added: CP-11

## 0.1.0-beta.17 — 2026-10-27

- docs(evals): avaliação de 2026-10-27
- docs(agent-docs): OV-07 e OV-08 levam a visão geral à dashboard-grid e proíbem moldura dentro de moldura; LA-06 limita o sticky pela altura do scroller; compose-screen encaminha um sticky próprio para LA-06
- feat(page): a página publica --slotted-page-scrollport-block-size, a altura do scroller, para o teto de um elemento sticky sob um canvas inset
- feat(dashboard-grid): rows=auto desenha a altura do conteúdo em sub-linhas (DASHBOARD_SUBROWS); um widget dentro de um componente ou fragmento declara-se à grade; fix(dashboard-grid): Reset pede o defaultLayout e os layouts persistidos devolvem o seu; o gráfico de um widget preenche o corpo em todos os tamanhos (achados equori)
- feat(stat-card): a tendência acompanha a altura da figura em inline e sangra até às bordas do cartão em stacked; a linha sai suavizada e com área por omissão
- feat(chart): Chart e SlChart genéricos sobre a linha; data aceita linhas tipadas por interface e series, x e recordKey só nomeiam chaves da linha

### Guidelines

- Added: OV-07, OV-08

## 0.1.0-beta.16 — 2026-10-26

- docs(list-item): a anatomia diz o pai de cada parte e a cena anatomy mostra uma linha lida com duas ações e quando usar end ou actions; feat(list-item): em desenvolvimento, body, label e description fora da caixa, e a caixa dentro de um body, avisam uma vez por parte (itens 21, 22)
- fix(calendar): o nome de um dia marcado lê-se '12, 2 items' também no Angular (template protegido do Prettier); fecho do plano equori-pending com o resultado de check:full
- feat(calendar): marks marca os dias com itens (parte mark, tom, contagem no nome acessível); fix(attachment): a miniatura carrega com loading=lazy e decoding=async; item 20 registado como uso (achados equori 18, 19, 20)
- feat(dashboard-grid): renderDetail (React) e slDashboardWidgetDetail (Angular) põem o link do router no canto do widget; feat(link): eixo size, e as ações de stat-card, section e chart fixam sm para os links; fix(table): a célula fixa pinta o fundo da linha sobre a superfície da página (achados equori 15, 16, 17)
- feat(dashboard-grid): expandedFrom move o limiar da classe expandida (a raiz escreve data-size-class e o CSS segue-o); rows="auto" desenha o widget com as linhas que o conteúdo mede, sem as guardar; headingLevel por omissão 'auto', um nível abaixo do contorno (achados equori 12, 13, 14)
- feat(prompt-composer): PromptComposerDictate dita pelo SpeechRecognition da plataforma (@slotted/core/dictation, glifo mic, razão dictation); fix(prompt-composer): o brilho do anel é a tinta do blur sobre a caixa do compositor, sem máscara e sem overflow no contentor (achados equori 10, 11)
- feat(markdown): source lê um subconjunto de CommonMark por parseMarkdown em @slotted/core/markdown, só a sintaxe dos tipos em allow; fix(message): uma bolha com Markdown mede o texto (prose deixa de ser contentor de tamanho dentro dela); fix(dialog): o corpo e o rodapé fixam as suas linhas, e um diálogo de ecrã inteiro sem corpo assenta o rodapé no fundo (achados equori 7, 8, 9)
- feat(drawer): --slotted-drawer-slide-duration e --slotted-drawer-slide-exit-duration regem o deslize por transição (o sheet com drag continua no scroll suave da plataforma); sob drag=panel toda a região dentro do painel passa o overscroll vertical ao sheet; fix(message-scroller): conteúdo sem itens não fica pendente (achados equori 4, 5, 6)
- feat(drawer): DrawerActions põe ações ao lado do título, na linha dele; um bottom sheet size="full" com drag=panel assenta o rodapé no fundo do ecrã; um sheet overlay só desenha as bordas laterais quando é mais estreito que a viewport, e size="full" não desenha nenhuma (achados equori 1, 2, 3)

## 0.1.0-beta.15 — 2026-10-24

- chore(theme): hooks.json regenerado com o atributo data-sheet-ready do drawer
- fix(drawer): abrir a folha não força layout
- feat(drawer): o bottom sheet move-se pelo scroll da plataforma

## 0.1.0-beta.14 — 2026-10-23

- fix(drawer): fechar arrastando é fluido e não encolhe a próxima abertura

## 0.1.0-beta.13 — 2026-10-23

- fix(drawer): o bottom sheet segue o dedo em gestos rápidos sem saltos
- feat(alert, toast, dialog): marcas de tom do conjunto status-*, o mesmo mapa do inline-message (perigo é círculo com !, aviso é o losango); a caixa do ícone de alert e toast é o tamanho da marca, porque o glifo enche a caixa de ponta a ponta; checkpoint do plano das marcas de status
- feat(status-indicator): a marca fica na primeira linha, centrada nas maiúsculas, e o rótulo é um inline-block com baseline-source: first, de modo que quebra com recuo pendurado e alinha a linha da tabela pela primeira linha; raiz td/th mantém o próprio display; parte detail nova (prop detail em React, slStatusIndicatorDetail em Angular); glifos status-* para os seis status; o pulso passa a ser pseudo-elemento da marca
- feat(inline-message): a marca é uma caixa inline na primeira linha, centrada nas maiúsculas (0.5cap, arredondado ao pixel do dispositivo), e as linhas seguintes pendem sob o texto; marca de round(1em, 2px), entrelinha arredondada para cima a 2px e caixa aparada às maiúsculas e à linha de base (text-box); glifos status-*; R5 ganha a forma de âncora inline
- feat(glyph): marcas de status desenhadas à mão em grades de 12, 14 e 16, cada corte em unidade inteira da própria grade; o aviso é um losango, simétrico nos dois eixos; o Glyph de React e Angular desenha as três grades e icon.css mostra a do tamanho da caixa por container query (12 abaixo de 1dppx); o harness desenha o mesmo; a regra "No triangle glyph" do briefing aponta para status-*
- chore(progress): checkpoint após o achado 14
- fix(styles): a camada dos popups só se move e o esmaecer passa ao conteúdo, para o backdrop-filter do conteúdo borrar em todo quadro da entrada e da saída
- chore(progress): checkpoint dos achados do equori v3 após a fatia 5
- feat(react): useRovingFocus, o modelo de teclado do menu para uma lista própria
- chore(progress): checkpoint dos achados do equori v3 após a fatia 4
- perf(drawer): o arrasto do bottom sheet, pelo corpo e pelo separador, dimensiona o painel uma vez e o move só por translate; a soltura anima a partir da posição viva com a velocidade da mão e o fling sai em um movimento contínuo no tempo que a camada declara; extent pedido uma vez, ao chegar (equori v3)
- chore(progress): checkpoint dos achados do equori v3 após os achados 6 e 9
- feat(theme): eixo data-slotted-corners (square, soft, standard, round) compilado do mapa corners do tema; cada entrada é uma escala de raio parcial e os tokens do tema que a leem são declarados de novo no escopo; ThemeScope ganha corners em React e Angular, o portal carrega o atributo e o tema padrão traz as quatro escalas (equori v3)
- fix(dismissable-layer): fechar a camada para navegar mantém o destino: o passo atrás da entrada não é dado quando a localização já não é a em que a entrada foi posta (equori v3)
- chore(progress): checkpoint dos achados do equori v3 após a fatia 3
- fix(theme): a regra que começa pelo esquema e segue para um hook público passa a ser recusada com a forma &[data-slotted-scheme] …, porque o elemento do esquema é a raiz do @scope e nunca descendente de si; contract.ts regenerado com os tokens novos; theme-app mostra a forma que casa (equori v3)
- fix(docs): splitter, scroll-area e action-sheet exportavam as docs fora da chave do membro e saíam com api vazia; data-grid usava dataGrid em vez de data-grid; a verificação compara as chaves com os membros do contrato; o splitter diz que não tem nome acessível por omissão (equori v3)
- feat(styles): --slotted-<família>-backdrop-filter em menu, popover, tooltip, drawer, action-bar, select, combobox, entity-picker e date-picker; none sob prefers-reduced-transparency e forced-colors (equori v3)
- feat(table-of-contents,chart,kbd): a coluna sticky do sumário fica --slotted-table-of-contents-sticky-inset longe do cabeçalho; actions e toolbar do Chart partilham a margem que os centra na linha do título; kbd ganha --slotted-kbd-surface, --slotted-kbd-border-color e --slotted-kbd-color (equori v3)
- feat(section): o header preso escreve data-stuck e lê --slotted-section-header-background; o divider de ground=surface vai de ponta a ponta; a anatomia ganha a coluna Parent e a descrição fora do título avisa em desenvolvimento (equori v3)

## 0.1.0-beta.12 — 2026-10-22

- perf(data-grid): o arrasto do resizer move só a guia e aplica a largura ao soltar, sempre
- chore(progress): release v0.1.0-beta.11

## 0.1.0-beta.11 — 2026-10-22

- chore(progress): checkpoint dos achados do equori v2
- build: pnpm sync:equori
- test(agent-docs): acesso por índice no teste da tabela de eixos (equori v2, verificação final)
- test(agent-docs): --slotted-material-backdrop é token de esquema e não é cor; o export do design system larga-o (equori v2, verificação final)
- test(styles): resize-guide no fragmento do data-grid e o marcador de tabs como exceção nomeada do R7 (equori v2, verificação final)
- perf(tabs): o marcador desliza por translate e scale a partir da caixa onde estava (FLIP no createIndicator), no compositor
- docs(compose-screen): Done mede no build de produção a 375 px (Event Timing ≤ 200 ms, linhas montadas limitadas à janela ou às páginas pedidas); Compose diz que props do data-grid manter estáveis (equori v2)
- docs(guidelines): LP-12 e LP-14 sem contradição
- docs(guidelines): LA-03 para todo título e LA-07 (action-bar do rodapé numa linha no telefone); review-screen e compose-screen verificam as duas a 360 px (equori v2)
- feat(theme): themeConformance aceita thresholds.layerStep (0,04 por omissão) e a falha nomeia a opção (equori v2)
- fix(toolbar, action-bar): nome do controlo de overflow vem das famílias toolbar e actionBar do catálogo, com plural ICU e pt-BR ("Mais 3 ações"); React e Angular (equori v2)
- fix(action-bar): abaixo de 24rem só a barra sem overflow empilha; com overflow mantém uma linha e dobra as ações com contrapartida (equori v2)
- fix(button): rótulo numa linha à sua largura, sem quebra dentro da palavra; reticências só quando o contentor segura o controlo mais estreito que o rótulo (equori v2)
- fix(app-shell): o render das partes e da raiz recebe o ref, que é também como a shell regista a parte (AppShellFooter com render deixava de se registar) (equori v2)
- fix(detail-panel): a contagem da secção empilhada vai para SectionTags, fora do heading e do seu nome acessível, no eixo óptico das maiúsculas (React e Angular) (equori v2)
- feat(drawer): data-expanded no bottom sheet que ocupa o layer (ou size=full)
- perf(drawer): o arrasto do bottom sheet escreve a posição no layer sem estado por movimento
- docs(drawer): default de size por lado (content em cima e embaixo, md no início e no fim) no contrato e nas duas tabelas; a tabela de eixos escreve um default que depende de outro eixo como frase (equori v2)
- feat(data-grid): resizeMode="deferred"
- fix(data-grid): carregar mais por IntersectionObserver sem root sobre as últimas loadMoreThreshold linhas
- fix(data-grid): o resizer da última coluna é o do último cabeçalho de coluna, não o do último filho da linha
- docs(data-grid): regra das props comparadas por identidade (columns, disabledKeys, rowKey função) e das lidas na hora do render; exemplos sem essas props inline, com verificação (equori v2)
- perf(data-grid): renderers e callbacks do tree lidos na hora do render, linhas respondem só à presença; useMessages compara textos por valor e chama funções pela versão mais recente
- fix(spinner): anel em SVG inline traçado por CSS, sem imagens data: (aparece sob img-src 'self'); o giro é rotate no compositor e continua com o main thread ocupado; cenário spinner-busy (equori v2)
- docs(section, detail-panel): região com chão próprio republica --slotted-page-ground; linha sticky, token e exemplo do painel com scroll="self" (equori v2)
- feat(page-header): sob o passo estreito, um toolbar que dobra fica numa linha própria abaixo de um título rico (visual, marks, subheading); LA-03 e contrato com a mesma divisão (equori v2)
- feat(page-header): chão da raiz e do title-area com transição de background-color (--slotted-page-header-ground-duration e -easing) (equori v2)
- feat(theme): --slotted-material-backdrop passa a token de esquema; tema padrão com blur de 6 px no claro, 20 px no escuro e none no alto contraste (equori v2)
- fix(dialog): painel plain fica opaco e os filhos fazem o fade, para o backdrop-filter de um material interno aparecer desde o primeiro frame; token --slotted-dialog-backdrop-filter (equori v2)
- feat(page, detail-panel): footers como material
- feat(toast): token --slotted-toast-backdrop-filter no item raised, desligado sob transparência reduzida e cores forçadas (equori v2)
- feat(command-palette): token --slotted-command-palette-backdrop-filter na raiz, desligado sob transparência reduzida e cores forçadas (equori v2)
- feat(page-header): material

### Guidelines

- Added: LA-07

## 0.1.0-beta.10 — 2026-10-22

- build: Prettier e ESLint repartidos por núcleo com cache estável por fatia (formatação completa 7 s quente, lint 6 s); testes de desempenho fora do verify, com a máquina livre
- build: pnpm check em ~25 s
- fix: barra de progresso Angular recomeça por ramo de paridade (sem NG0956); teste de lista longa com 150 registos para caber no tempo da suíte
- build(turbo): agent-docs verify depois de core, theme e themes
- fix: semente info espelhada nos portais; módulos React sem import de CSS, folhas por família explícitas (equori, verificação final)
- chore(theme): regenera contrato, hooks e snapshot do proof (tokens e partes da rodada equori)
- test(theme): semente info na fixture de recipe.test
- chore(react): formata o tsconfig
- feat(react): CSS por família importado pelo próprio chunk e folhas por família; receita no theme-app (equori, fatia 11)
- feat: anel de ênfase do prompt-composer; AF-07, AF-03 e waiting-states com a barra do page-header para o refresh da página (equori, fatia 10)
- feat: partes de opção do entity-picker, janela de opções em listas longas, espaço entre campos do form (equori, fatia 9)
- feat: dialog e drawer montados abertos entram animados e avisam o fim (onOpenChangeComplete), ações no inline-message, slot e tom por fatia na pizza (equori, fatia 8)
- fix: autofill pinta o controle inteiro, avatar carregado sem fundo de tom e prop surface, offsets ópticos de glifos com corpo declarado (equori, fatia 7)
- feat: tom info em tema e famílias, tinta por slot de dados (--slotted-data-N-on), offset do anel dos campos (--slotted-control-focus-ring-offset); receita volta a ser gerada pelo calibrador (equori, fatia 6)
- feat(theme): borda e texto dark do accent no matiz do seed, escada de superfícies dark visível, escada de dados derivada do accent e segura para daltonismo (equori, fatia 5)
- feat: barra indeterminada no compositor, data-grid mantém o vazio ao reler (loading initial/refresh), sparkline só anima mudança de dados e tem largura mínima (equori, fatia 4)
- fix: busy de data-grid/data-list por véu, progress do page-header na linha de fecho em qualquer ordem, varredura do progress recomeça a cada pintura (equori, fatia 3)
- fix: props de render das famílias de link sem membros undefined (DefinedProps, definedProps), anel do prompt-composer sem transição da cor do texto (equori, fatia 2)
- fix: light-dark() nativo no styles.css do React, regressão de foco do dialog coberta, entity-picker sem spellcheck por padrão (equori, fatia 1)
- fix(spinner): o anel passa a ser desenhado em vetor, sem serrilhado, borrão ou corte
- feat(section): título em rótulo, parte tags na linha de base e espaço entre sections do próprio componente
- test(react): os testes de desempenho correm um arquivo de cada vez
- perf(data-grid): um passo de scroll deixa de refazer o layout e o estilo da grade inteira

### Guidelines

- Added: FM-17

## 0.1.0-beta.9 — 2026-10-21

- test(react): o custo das chaves de seletor é medido contra os mesmos seletores por valor, não em milissegundos do runner
- test(angular): o bundle nomeia a família pela chave de seletor ou por hostSelectorKey
- fix(build): verificadores do pacote e hooks do tema na forma chaveada; glifos direcionais pela fonte do tema
- docs(plans): findings da revisão do dono do equori
- perf: chave de seletor por parte e família; dialog, data-grid, roving focus e page sem trabalho repetido; correções do equori beta.7
- docs(guidelines): LP-15 a LP-17, OV-06, AF-08 e CP-10; compose-screen nomeia os valores de domínio antes de escolher a família
- fix: docs em inglês, data-grid selectRow e commit síncrono, currency-field unit, tags-input suggestions, dialog como form

### Guidelines

- Added: AF-08, LP-15, LP-16, LP-17, OV-06
- Rewritten: CP-07 → CP-10

## 0.1.0-beta.8 — 2026-10-21

- fix(drawer): abrir uma folha não força layout
- feat(dialog): um diálogo em ecrã inteiro recua pelo teclado virtual
- fix(command-palette): o foco fica no input enquanto a paleta está aberta, e um toque que rola a lista não move o destaque
- test(react): testes em Chromium
- fix(date-field, time-field, datetime-field): cada segmento tem o nome da unidade, do catálogo da língua em vigor
- fix(calendar): os botões de paginação levam o nome do passo que dão
- fix(tabs): o marcador anda por left e inline-size, as duas propriedades de layout na mesma thread

## 0.1.0-beta.7 — 2026-10-20

- fix(presence): stop() reversível para o StrictMode do React, destroy() volta a ser final
- chore(theme): regenera o contrato com width do menu e o recuo do anel
- fix(app-shell, side-navigation): o recuo do anel publica-se de --_row-ring-inset, e o tokens.json da side-navigation lista-o
- fix(side-navigation): o contrato lê --slotted-app-shell-row-ring-inset
- feat(menu): width 'content' | 'anchor'
- fix(button, kbd): o slot do Button deixa de impor display:block e 16px a uma tecla
- fix(app-shell): a costura relê a cor em cada região; cabeça, corpo e pé da nav partilham a calha da barra e um recuo do anel de foco (--slotted-app-shell-row-ring-inset), e a side-navigation mantém a borda das linhas
- fix(table): TableEmpty escreve a sua própria linha
- fix(presence): destroy é reversível

## 0.1.0-beta.6 — 2026-10-20

- ci(release): uma só validação
- style(harness): formata tabs-marker.mjs
- Revert "feat(segmented-control): intervalo entre segmentos de --slotted-space-2, um passo acima do anel; o polegar mantém a altura"
- Revert "docs(plans): sexta iteração
- docs(plans): sexta iteração
- feat(segmented-control): intervalo entre segmentos de --slotted-space-2, um passo acima do anel; o polegar mantém a altura
- docs(plans): sexta iteração
- feat(segmented-control): divisores de volta, refinados
- docs(plans): sexta iteração
- feat(segmented-control): segmentos afastados pelo passo do anel e sem divisores; o polegar anda uma coluna e um intervalo, e o rádio cobre metade do intervalo de cada lado
- docs(plans): sexta iteração
- feat(segmented-control): visual neutro
- docs(plans): sexta iteração
- fix(stat-card): limite do @scope ancorado em :scope
- fix(tabs): o marcador desliza só quando a seleção muda, com duração média numa curva que começa e acaba devagar; uma nova medição da mesma tab já não o anima
- feat(tabs): --slotted-tabs-marker-offset

## 0.1.0-beta.5 — 2026-10-20

- docs(evals): caminhos relativos do material de agente
- docs(plans): quinta iteração
- docs(plans): quinta iteração
- perf(angular, popups): data-open e data-positioned escritos no elemento na tarefa da abertura, sem esperar a verificação seguinte
- perf(pickers): superfície montada, no portal e posicionada no commit da abertura; foco de entrada e revelação da lista de horas no frame seguinte
- perf(side-navigation): flyout com portal e posicionador em layout effect, data-open escrito pela medição
- perf(cascader): data-open escrito pela medição que posiciona a camada, no commit da abertura
- perf(entity-picker): data-open escrito pela medição que posiciona o popup, no commit da abertura
- perf(tooltip): data-open escrito pela medição que posiciona a dica, sem render de positioned; camada do portal ao chegar o ponteiro ou o foco
- perf(menu): data-open no primeiro frame depois do clique; o foco de entrada move-se no frame seguinte
- perf(popover): data-open no primeiro frame depois do clique; o foco inicial move-se no frame seguinte
- perf(multi-select, combobox): data-open no primeiro frame depois do clique, como o select; cenário popup-open.mjs por família
- docs(plans): quinta iteração
- perf(select, angular): a pressão registada substitui a leitura da caixa no clique, a camada do portal nasce no foco ou na pressão, e o destaque revela-se no frame seguinte
- fix(stat-card): regras de parte em @scope com limite no conteúdo de uma família aninhada
- perf(select, core/positioner): data-open no primeiro frame depois do clique
- fix(agent-docs): renderExamples num diretório próprio por chamada
- fix(core/measure): createIndicator escreve data-positioned na segunda posição, sem requestAnimationFrame
- docs(plans): quinta iteração
- feat(tabs): um marcador na lista que desliza por translate, na caixa de conteúdo da tab, com tokens de espessura, raio, recuo e opacidade do hover
- feat(core/measure): createIndicator
- feat(page-header): um só fundo sob um título sem header-area e --slotted-page-header-backdrop-filter enquanto preso
- feat(react): bin slotted-agent-docs
- fix(agent-docs): caminhos dos SKILL.md e das diretrizes relativos ao próprio ficheiro; o snippet declara a base na primeira frase
- docs(plans): quinta iteração
- fix(table, scroll-area, chart): anel da região de scroll só para foco vindo do teclado; o anel do navegador sai para foco por ponteiro
- fix(app-shell): main recebe tabindex só para o foco do skip link e de focusMain; um clique no conteúdo não o foca
- feat(core/focus): focusTarget e createFocusOrigin
- fix(stat-card): value de StatCardValue e StatCardDelta aceita undefined sob exactOptionalPropertyTypes

## 0.1.0-beta.4 — 2026-10-20

- test(accordion): sai o teto de 100 ms por tempo de relógio
- docs(evals): compose-screen atende após CP-09 e LP-14
- test(table): sai o teste de razão por tempo de relógio
- fix(theme): contrato gerado a par do token --slotted-table-edge-inset e de data-edges
- fix(date-picker): SlDatePicker genérico sobre o tipo do valor
- feat(date-picker): granularity month
- docs(text-field): a linha type nomeia o controle que substitui cada tipo fora da lista
- docs(agent-docs): CP-09 e LP-14
- feat(tabs): deferPanels e useTabs().shownValue
- feat(page): aviso em desenvolvimento quando falta PageBody
- fix(select): o controle fechado mostra o rótulo do SelectItem sem items
- feat(table): edges inset e flush
- perf(overflow): a sombra de rolagem mede no primeiro relatório do ResizeObserver
- perf(accordion): cinquenta itens fechados montam num commit e sem leitura de estilo
- perf(combobox): abrir e mover o destaque recontam a lista uma vez por render

### Guidelines

- Added: CP-09, LP-14

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
