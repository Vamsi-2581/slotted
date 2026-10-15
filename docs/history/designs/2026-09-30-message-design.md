# message e message-scroller — desenho

Par novo, criado pela invocação `/reui build message/bubble, message scroller, etc.` (2026-09-30). O utilizador escolheu o recorte: família `message` com os membros `message` e `bubble`, família `message-scroller`, e toda a capacidade pertinente encontrada no levantamento. Dossiê: `2026-09-30-message-reui-dossier.md`.

## 1. Responsabilidade

- `message` desenha uma mensagem de uma conversa: a linha (`message`), com avatar, cabeçalho, corpo, rodapé, recibo, ações e versões; e a superfície da fala (`bubble`), com pintura, citação, corte de texto longo, cursor de streaming, indicador de escrita e reações.
- `message-scroller` é a região que rola uma conversa: posição de abertura, âncora de turno, seguir a resposta, histórico anterior sem salto, salto para uma mensagem, botão para a mais recente com contagem, separador de dia fixo, marca de não lidas, carregamento anterior e anúncios.

Fora do par, por composição: o compositor (`prompt-composer`, família Specialized por construir), os anexos (`attachment`), o texto rico (`markdown`, `prose`, `code-block`), o avatar (`avatar`), os botões de ação (`button` › `iconButton`, `toggleButton`), o estado vazio (`result-state`), o separador desenhado (`divider`). O transporte, a persistência, o modelo e o fornecedor são da aplicação (`docs/component-features.md` §16).

As duas famílias não se importam: `message` funciona fora de um scroller (um cartão de comentário, uma lista de notas), e o scroller rola qualquer linha, uma mensagem, um separador ou um evento de sistema.

## 2. Inventário de capacidades

### 2.1 Surveyed

| Implementação | Onde foi lida | Nome | Forma |
| --- | --- | --- | --- |
| shadcn/ui, desenhado pelo ReUI | `https://ui.shadcn.com/r/styles/base-nova/{bubble,message,message-scroller,marker}.json`, `https://ui.shadcn.com/docs/react/message-scroller.md`, 20 exemplos `c-*` (dossiê §1) | `Bubble`, `Message`, `MessageScroller` | Bolha com sete variantes e reações; linha com avatar, cabeçalho, rodapé, grupo; scroller com abertura, âncora, seguir, prepend, salto e visibilidade |
| Vercel AI Elements | `https://registry.ai-sdk.dev/{conversation,message}.json` | `Conversation`, `Message`, `MessageBranch`, `MessageActions` | `use-stick-to-bottom`; `role="log"`; versões com `1 of N`; ações com tooltip; estado vazio |
| Ant Design X 2 | `https://raw.githubusercontent.com/ant-design/x/main/packages/x/components/bubble/index.en-US.md` | `Bubble`, `Bubble.List`, `Bubble.System`, `Bubble.Divider` | `placement`, `variant` (filled, outlined, shadow, borderless), `shape`, `loading`, `typing`, `streaming`, `editable`, slots header/footer/avatar/extra, lista com `autoScroll` e papéis |
| PatternFly Chatbot | `https://raw.githubusercontent.com/patternfly/chatbot/main/packages/module/src/{MessageBox,Message}/*.tsx` | `MessageBox`, `Message` | `enableSmartScroll`, botões de salto para o topo e o fim, `announcement`; mensagem com `role`, `alignment`, avatar, `timestamp`, `isLoading`, ações, fontes, respostas rápidas, edição, erro |
| Chatscope chat-ui-kit | `https://raw.githubusercontent.com/chatscope/chat-ui-kit-react/master/src/components/{MessageList,Message}/*.jsx` | `MessageList`, `Message`, `TypingIndicator`, `MessageSeparator` | `direction` incoming/outgoing, `position` single/first/normal/last, `loadingMore`, `onYReachStart`, `typingIndicator`, `autoScrollToBottom` |
| Nebular (Angular) | `https://raw.githubusercontent.com/akveo/nebular/master/src/framework/theme/components/chat/*.ts` | `nb-chat`, `nb-chat-message` | `reply`, `sender`, `date`, `files`, `quote`, `avatar`, animação de entrada `flyInOut`, `noMessagesPlaceholder` |
| WAI-ARIA | `https://www.w3.org/TR/wai-aria-1.2/#log`, `https://www.w3.org/WAI/ARIA/apg/patterns/feed/` | `log`, `feed` | Região viva de adições; padrão feed com `article`, `aria-busy`, `PageUp`/`PageDown` |

Referência medida: ReUI `c-bubble-2`, `c-bubble-6`, `c-message-4`, `c-message-scroller-4` (claro, escuro e estados).

### 2.2 Table stakes

| Capacidade | Quem publica | Veredicto | Razão |
| --- | --- | --- | --- |
| Lado do remetente | shadcn, AI Elements, Ant X, PatternFly, Chatscope, Nebular | `adapt` | `align` `start`/`end` só em `message`; a bolha segue |
| Avatar | shadcn, Ant X, PatternFly, Chatscope, Nebular | `adopt` | parte `avatar`, alinhada ao fim da corrida (`bubble`) ou ao topo (`thread`); o conteúdo é `avatar` |
| Nome e hora | shadcn, Ant X, PatternFly, Nebular | `adopt` | `header` com `author` e `time` (`<time datetime>`) |
| Rodapé | shadcn, Ant X | `adopt` | `footer` |
| Corrida de um remetente | shadcn, Chatscope | `adapt` | `group`; a coluna do avatar é reservada e os cantos interiores achatam sem props por linha |
| Variantes da bolha | shadcn, Ant X | `adapt` | `variant` × `tone` |
| Ações da mensagem | shadcn, AI Elements, PatternFly | `adopt` | `actions`, `role="toolbar"`, reveladas por hover, foco ou toque |
| Estado de carregamento de uma resposta | Ant X (`loading`), PatternFly (`isLoading`), shadcn (`c-message-7`) | `adopt` | `status="streaming"`, `activity`, `caret`; `aria-busy` |
| Erro de envio | PatternFly (`error`), Ant X (`status: error`) | `adopt` | `status="failed"`, `receipt` com `circle-alert` e texto |
| Streaming sem anúncio por token | shadcn, AI Elements (`role="log"`) | `adopt` | `content` com `role="log"`, `aria-relevant="additions"`; `busy` suspende os anúncios |
| Indicador de escrita | Chatscope, Nebular (ecrã de exemplo), Stream | `adopt` | `typing` |
| Versões de uma resposta | AI Elements (`MessageBranch`), ReUI `ai-chat-9` | `adopt` | `versions` com estado `current` |
| Reações | shadcn, Stream | `adapt` | `reactions`, `reaction` com `pressed` e contagem |
| Bolha interativa (resposta rápida) | shadcn, PatternFly (`quickResponses`) | `adopt` | `content` como `button` ou `a` |
| Conteúdo longo recolhido | shadcn (Collapsible) | `adapt` | `maxLines`, `more`, estado `revealed` |
| Citação de resposta | Nebular (`quote`), ReUI `ai-chat-4` | `adopt` | `quote` |
| Anexos | shadcn, AI Elements, PatternFly, Nebular (`files`) | `defer to attachment` | `attachment` no `body`: `<MessageBody><AttachmentGroup>…</AttachmentGroup><Bubble>…</Bubble></MessageBody>` |
| Edição da mensagem | Ant X (`editable`), PatternFly (`isEditable`) | `decline` | o campo de edição é um `textarea` do compositor no lugar da bolha: `{editing ? <Textarea defaultValue={text} /> : <Bubble>…</Bubble>}`; o estado de edição é do produto |
| Seguir o fim | todos os scrollers | `adopt` | `follow`, largado por roda, toque, teclado, arrasto da barra e seleção |
| Posição de abertura | shadcn, Chatscope (`autoScrollToBottomOnMount`) | `adopt` | `defaultPosition` `start`/`end`/`last-anchor` |
| Botão para o fim | shadcn, AI Elements, PatternFly | `adapt` | `jump`, com contagem de novas |
| Botão para o topo | PatternFly | `adopt` | `jump` com `direction="start"` |
| Carregar anteriores | Chatscope (`loadingMore`, `onYReachStart`), shadcn (prepend) | `adopt` | evento `reachStart` com a razão `scroll`, parte `loader`, prepend preservado |
| Salto para mensagem | shadcn | `adopt` | `scrollToMessage` com destaque `current` do alvo |
| Separador de dia | shadcn (`Marker`), Ant X (`Bubble.Divider`), Chatscope (`MessageSeparator`) | `adapt` | `separator`, fixo no topo |
| Mensagem de sistema | Ant X (`Bubble.System`) | `decline` | um `item` com `separator` ou `activity` sem mensagem: `<MessageScrollerItem><MessageScrollerSeparator>Ana entrou</MessageScrollerSeparator></MessageScrollerItem>` |
| Estado vazio | AI Elements, Nebular | `defer to result-state` | `{messages.length ? <MessageScroller>…</MessageScroller> : <ResultState status="empty" … />}` |
| Animação de entrada de linha | Nebular (`flyInOut`), shadcn (documentação) | `adopt` | `item` novo entra por `@starting-style` com `opacity` e `translate` |
| Efeito de máquina de escrever | Ant X (`typing`) | `decline` | um ritmo próprio a atrasar texto já recebido mostra menos do que existe; a entrada por palavra de `stream` (§8, terceira revisão) põe cada palavra no DOM ao chegar e só escalona a pintura, no máximo 320 ms |

### 2.3 Differentiators

| Capacidade | Porquê aqui |
| --- | --- |
| Disposição `thread` | a mesma família desenha o chat em bolhas e o fio de comentários (Slack, `sheet-5`), com avatar no topo, cabeçalho em linha e faixa de hover, sem segunda família |
| Cantos da corrida | bolhas consecutivas achatam o canto do lado do remetente a `--slotted-radius-sm`; a corrida lê-se como um bloco (Messenger, iMessage), sem prop de posição |
| Contagem de novas no `jump` | o scroller conta as linhas chegadas fora de vista; a documentação do shadcn pede-o (princípio 8) e não o faz |
| Separador fixo | o dia fica no topo enquanto as suas mensagens estão à vista (WhatsApp, Telegram) |
| Destaque do alvo de um salto | a linha aterrada pinta uma faixa que se apaga; o leitor vê onde está |
| Três esquemas e forced-colors | a bolha `soft` ganha aresta em `high-contrast`, onde cada `surface` é branco |
| Densidade | padding, gaps, avatar e reações escalam com a densidade |
| Duas bindings | a mesma anatomia em React e Angular, com `ControlValueAccessor` dispensado (nenhum valor de formulário) e defaults por provider nos dois |

### 2.4 Gaps

| Caso | Resposta |
| --- | --- |
| Palavra de 300 caracteres sem espaços (URL, hash) | `overflow-wrap: anywhere` no `content`; a bolha não passa dos 80% |
| Texto de um idioma RTL numa página LTR | `content` com `dir="auto"` e `unicode-bidi: plaintext` por parágrafo |
| Mil mensagens | linhas com `content-visibility: auto` e `contain-intrinsic-size`; o motor não re-renderiza linhas ao rolar |
| Resposta interrompida (stop, erro de rede) | `status="failed"` guarda o texto parcial na bolha e o `receipt` diz porquê |
| Imagem que carrega depois de a linha aparecer | o `ResizeObserver` do motor preserva a linha de referência ou o fim, conforme o leitor está a seguir |
| Leitor a selecionar texto durante o streaming | `selectionchange` dentro do conteúdo larga o seguimento |
| Movimento reduzido | saltos em `auto` em vez de `smooth`, pontos de escrita parados, `caret` fixo |
| Toque | ações sempre visíveis quando `(hover: none)`; alvos ≥ 24 |

## 3. Anatomia

### 3.1 `message` › membro `message`

Raiz `article`, `data-ui="message"`, `data-part="root"`. Um `article` é o que um leitor de ecrã salta com o comando de artigo e o que o padrão feed usa por linha; o nome acessível é `author` (`aria-labelledby`) quando existe.

| Parte | Elemento | Papel |
| --- | --- | --- |
| `group` | `div` | corrida de mensagens de um remetente |
| `avatar` | `div` | caixa do avatar, reservada em todas as linhas de uma corrida |
| `body` | `div` | coluna: cabeçalho, bolhas, anexos, rodapé |
| `header` | `div` | `author` e `time` |
| `author` | `span` | nome do remetente |
| `time` | `time` | hora, com `datetime` |
| `footer` | `div` | recibo, hora, ações |
| `receipt` | `span` | estado de entrega com glifo e texto |
| `actions` | `div` `role="toolbar"` | ações da mensagem |
| `activity` | `div` `role="status"` | cartão elevado com o registo do que uma resposta está a fazer |
| `activity-step` | `div` | um passo: `complete` com visto, `current` com o anel partilhado e uma faixa de luz no texto |
| `versions` | `div` `role="group"` | `version-previous`, `version-label`, `version-next` |

Eixos: `align` (`start`, `end`), `layout` (`bubble`, `thread`), `actionsVisibility` (`always`, `hover`), `status` (`sending`, `sent`, `delivered`, `read`, `failed`, `streaming`).

Estados: `loading` (`sending` e `streaming`, com `aria-busy`), `invalid` (`failed`), `read` (`read`), `complete` e `current` (passos de `activity`), `hover` (faixa em `thread`), `focus-visible` (das ações e versões).

Estado mutável: `current` — a versão mostrada. `version` / `defaultVersion` / `onVersionChange(version, reason)`, razões `pointer`, `keyboard`; `versionCount` diz quantas existem. O conteúdo de cada versão é do consumidor.

### 3.2 `message` › membro `bubble`

Raiz `div`, `data-ui="message"`, `data-part="bubble"`. Um `bubble` fora de uma `message` é permitido e segue `align` do contentor mais próximo com `data-align`.

| Parte | Elemento | Papel |
| --- | --- | --- |
| `content` | `div`, `button` ou `a` | a superfície pintada |
| `quote` | `div`, ou `button` quando salta | mensagem citada, com `quote-author` |
| `more` | `button` | "Mostrar mais" / "Mostrar menos" quando o texto excede `maxLines` |
| `stream` | `span` | o texto de uma resposta em streaming; cada chegada entra palavra a palavra |
| `stream-chunk` | `span` | uma palavra ainda a entrar; volta a texto simples quando a entrada acaba |
| `caret` | `span` `aria-hidden` | ponto no fim do texto em streaming |
| `typing` | `span` `role="img"` | três pontos com rótulo, em onda |
| `retry` | `button` | ao lado da superfície de uma mensagem que falhou; reenvia |
| `reactions` | `div` `role="group"` | fila de reações sobre a aresta inferior |
| `reaction` | `button` `aria-pressed` | uma reação, com `reaction-count` |

Eixos: `variant` (`solid`, `soft`, `outline`, `plain`), `tone` (os cinco tons), `maxLines` (inteiro).

Resolução: `variant` = prop → `message` (`align="end"` dá `solid`; `layout="thread"` dá `plain`) → defaults → `soft`. `tone` = prop → `message` (`align="end"` dá `accent`) → defaults → `secondary`. A inferência é do binding e escreve `data-variant` e `data-tone`, por isso o DOM diz sempre a pintura.

Estados: `hover`, `active`, `focus-visible` (em `content` interativo, `reaction`, `more`, `quote`), `pressed` (`reaction`), `revealed` (texto inteiro), `loading` (`caret` presente), `disabled` (`reaction`).

Estados mutáveis:
- `pressed` — `reaction`: `pressed` / `defaultPressed` / `onPressedChange(pressed, reason)`, razões `pointer`, `keyboard`. A contagem é do consumidor.
- `revealed` — `revealed` / `defaultRevealed` / `onRevealedChange(revealed, reason)`, razões `pointer`, `keyboard`.

### 3.3 `message-scroller`

Raiz `div`, `data-ui="message-scroller"`.

| Parte | Elemento | Papel |
| --- | --- | --- |
| `viewport` | `div` `role="region"` `tabindex="0"` | elemento que rola, rótulo "Mensagens" |
| `content` | `div` `role="log"` `aria-relevant="additions"` | as linhas; `padding-block-end` inclui `--slotted-message-scroller-room` |
| `item` | `div` | uma linha: `data-message-id`, `data-anchor` |
| `separator` | `div` | dia ou evento; `sticky` fixa-o no topo |
| `unread` | `div` | régua "Novas mensagens" |
| `loader` | `div` `role="status"` | "A carregar mensagens anteriores" |
| `jump` | `button` | para o fim (ou o início) |
| `jump-count` | `span` | quantas chegaram fora de vista |

Atributos escritos pelo motor na raiz e no `viewport`: `data-scrollable` (`start`, `end`, `start end`, ausente), `data-following`, `data-pending`. `item` recebe `data-current` depois de um salto com destaque. Estes são runtime, como `--slotted-positioner-*`.

Opções: `follow` (falso), `defaultPosition` (`last-anchor`), `edgeThreshold` (8), `scrollMargin` (0), `peek` (64), `preserveOnPrepend` (verdadeiro), `busy`, `label`.

Eventos: `reachStart(reason)` — o leitor chegou ao topo (razão `scroll`), para pedir histórico; `anchorChange(id, reason)` — turno corrente (`scroll`, `programmatic`); `scrollableChange({ start, end })`.

Comandos: `scrollToMessage(id, { align, behavior, highlight })`, `scrollToEnd(options)`, `scrollToStart(options)`, `focus()`. Devolvem `false` quando não se aplicam.

Nenhum valor que o consumidor possa possuir: a posição de scroll é lida do layout e mudada por comando, a razão pela qual `overflow` não é mutável. O scroller não declara `stateModel`.

## 4. Motor: `@slotted/core/message-scroller`

Um controlador sem framework. `createMessageScroller(options)` devolve `connect(root, viewport, content)`, `update(options)`, os três comandos, `getState()` e `subscribe(listener)`. O estado lido pelos bindings é `{ scrollable, following, pending, newCount, currentAnchorId }`.

- O caminho quente não passa pelo framework: o motor escreve os atributos de §3.3 e a propriedade `--slotted-message-scroller-room` diretamente; os bindings só re-renderizam o `jump`.
- `overflow-anchor: none` no `viewport`; o motor preserva a linha de referência (a primeira visível) em prepend e em mudança de tamanho acima dela, porque o Safari não tem ancoragem nativa e duas correções somadas saltam.
- Uma linha nova com `data-anchor` é levada para `scrollMargin + peek` abaixo do topo; o espaço que falta vai para `--slotted-message-scroller-room` e encolhe enquanto a resposta cresce, até o seguimento tomar conta.
- Intenção do leitor: `wheel`, `touchmove`, teclas de scroll no `viewport`, `pointerdown` na barra e `selectionchange` dentro do conteúdo largam o seguimento. Um scroll do próprio motor não o larga.
- Sob `prefers-reduced-motion: reduce`, `behavior: 'smooth'` passa a `'auto'`.
- `newCount` conta linhas com `data-message-id` acrescentadas enquanto o fim não está à vista, e volta a zero no fim.

## 5. Acessibilidade

Não há padrão APG para uma conversa (`https://www.w3.org/WAI/ARIA/apg/patterns/`, lido a 2026-09-30). O mais próximo é o Feed Pattern (`https://www.w3.org/WAI/ARIA/apg/patterns/feed/`): `feed` com `article`, `aria-busy` durante carregamentos, `PageDown`/`PageUp` para o artigo seguinte e anterior, `Control+End`/`Control+Home` para sair.

Decisão: `content` é `role="log"` (WAI-ARIA 1.2, região viva com `aria-live="polite"` implícito) e cada mensagem é `article`. `log` anuncia as linhas acrescentadas, que é o que uma conversa precisa e o `feed` não faz. O custo: `PageDown`/`PageUp` rolam o `viewport` (comportamento nativo de um elemento focável que rola) em vez de mover o foco entre artigos; um leitor de ecrã em modo de leitura navega os `article` com o seu próprio comando.

| Requisito | Onde |
| --- | --- |
| Região rolável focável e nomeada | `viewport` `role="region"`, `tabindex="0"`, `aria-label` |
| Adições anunciadas, streaming não | `content` `role="log"`, `aria-relevant="additions"`, `aria-busy` com `busy` |
| Estado anunciado uma vez | `live-announcer` com `busy` ("A responder" / "Resposta completa", mensagens substituíveis) |
| Artigo nomeado | `article` `aria-labelledby` → `author` |
| Ações nomeadas | cada botão com rótulo; `actions` `role="toolbar"` com `aria-label` |
| Recibo não só por cor | glifo e texto (visível ou `sr-only`) |
| Reações | `button` `aria-pressed`, nome "👍 3, reagir" composto pelo consumidor com a contagem |
| `jump` inativo | `inert`, `data-active="false"`; ativo com rótulo e contagem |
| Movimento reduzido | §4 e folhas |

Teclado: tudo nativo. `Tab` percorre ações, versões, reações, `more`, `quote` e o `jump`; `Enter`/`Espaço` ativam; no `viewport`, setas, `PageUp`, `PageDown`, `Home`, `End` e `Espaço` rolam. Nenhum `tabindex` itinerante: uma mensagem tem até seis alvos e uma conversa centenas; um modo de setas esconderia as ações, a decisão de `attachment` e `list-item`.

## 6. Integração

### React

| Pergunta | Resposta |
| --- | --- |
| Par controlado e não controlado | `version`/`defaultVersion`/`onVersionChange`, `pressed`/`defaultPressed`/`onPressedChange`, `revealed`/`defaultRevealed`/`onRevealedChange`, com `reason` |
| Defaults uma vez | `MessageDefaultsProvider`, `MessageScrollerDefaultsProvider` |
| Substituir o elemento | `render` em cada parte; `BubbleContent` torna-se `button` ou `a` |
| Handler do consumidor | compostos, nunca substituídos (`onClick` das partes, `onScroll` do `viewport`) |
| Elemento nativo e comandos | `ref` em cada parte; `MessageScroller` expõe `MessageScrollerHandle` (`scrollToMessage`, `scrollToEnd`, `scrollToStart`, `focus`, `element`) |
| SSR | `useId` para `author`; nenhuma leitura de layout no render; `data-pending` no HTML do servidor esconde o `viewport` até à primeira posição |
| Estados no DOM | `data-align`, `data-layout`, `data-status`, `data-variant`, `data-tone`, `data-loading`, `data-invalid`, `data-read`, `data-pressed`, `data-revealed`, `data-current`, `data-scrollable`, `data-following` |
| Tipos | `ComponentPropsWithRef<'article' / 'div' / 'button' / 'time'>` estendidos |

`useMessageScroller()` dentro da raiz devolve os comandos e o estado (`useSyncExternalStore`); um controlo fora da raiz usa o `ref` e os eventos.

### Angular

| Pergunta | Resposta |
| --- | --- |
| Valor de duas vias | `model()` para `version`, `pressed`, `revealed`; `output()` com razão (`versionChange`, `pressedChange`, `revealedChange`) |
| Formulários | nenhum valor de formulário; sem `ControlValueAccessor` |
| Defaults uma vez | `provideMessageDefaults()`, `provideMessageScrollerDefaults()` |
| Instância | `exportAs`: `slMessage`, `slBubble`, `slMessageScroller` |
| Conteúdo projetado | diretivas de atributo nas partes; `ng-content` nas partes com template (`versions`, `receipt`, `typing`, `jump`) |
| Zoneless e OnPush | signals; o motor chama `set` de um `signal` por mudança de estado |
| Limpeza | `DestroyRef` desliga o motor e os observadores |
| Atributos estáticos | `HostAttributeToken` para `aria-label` escrito pelo autor |
| Ponto de entrada | `@slotted/angular/message`, `@slotted/angular/message-scroller` |

## 7. Decisões visuais

- Bolha: altura inteira (linha `round(up, 1em × --slotted-line-height-md, 1px)`), raio `calc(--slotted-radius-lg × 2)`, canto do remetente na corrida `--slotted-radius-sm`, largura máxima 80% da linha e 100% em `plain`.
- `soft`: `--slotted-tone-*-surface` com aresta `--slotted-border-subtle` (1.35:1 em `light`, preta em `high-contrast`). `solid`: `solid`/`on-solid` do tom. `outline`: aresta `--slotted-tone-*-border`, fundo transparente. `plain`: sem caixa nem padding.
- Linha: gap avatar–corpo `--slotted-space-4`; corpo `--slotted-space-2`; corrida `--slotted-space-1`; entre corridas o `content` do scroller dá `calc(--slotted-control-gap-md × 2.5)`.
- Movimento: `jump` com entrada `--slotted-duration-medium` `--slotted-easing-enter` e saída `--slotted-duration-short` `--slotted-easing-exit`; linha nova por `@starting-style`; destaque do salto apaga-se em `--slotted-duration-long`; loops em `--slotted-duration-loop*`, parados sob movimento reduzido.
- Glifo novo `--slotted-icon-check-check` (Lucide `check-check`) para `delivered` e `read`: dois vistos é a marca de entrega que o leitor aprendeu em WhatsApp, Telegram e Messenger; `check` sozinho diz `sent`. `read` pinta o mesmo glifo em `accent-text`, com o texto "Lida" para quem não distingue a cor.
- `jump` desenha `arrow-left` rodado (para baixo no fim, para cima no início): nenhuma seta vertical na escala, e a rotação é a mesma geometria.

## 8. Revisão do portão visual (2026-09-30)

O revisor recusou a mensagem com erro e os estados de espera.

- Falha: o contorno vermelho sobre a bolha accent lia-se como uma segunda bolha e o texto do erro e o botão "Tentar de novo" ficavam soltos no rodapé. Passou a `bubble` › `retry`, um controlo circular no tom de perigo ao lado da superfície, centrado na última linha, que reenvia (`onRetry` / `(retry)`); o rodapé fica com o recibo (glifo e "Não enviada"). O preenchimento desbotado foi medido e recusado: texto branco a 4.2:1 sobre o accent a 85%.
- Espera: `activity` passou a cartão elevado com passos (`activity-step`, estados `complete` e `current`); o passo corrente tem o anel de `spinner` e uma faixa de luz que percorre o texto, parada sob movimento reduzido.
- Escrita: pontos de um terço da linha (7 px a comfortable) em onda de meio ponto, desfasados um sexto do ciclo.

Segunda revisão: o revisor recusou as notas "glifo + texto" por baixo das bolhas (gap, desalinhamento vertical) e pediu mais ao indicador de escrita.

- Recibo: passou para dentro da bolha, na parte nova `bubble` › `meta` — a hora e a marca de entrega num `float` no fim da última linha (WhatsApp, Telegram). A caixa tem a linha arredondada a par (20 px a comfortable), dígitos e marca com 14 px, centrados em pixels inteiros (specimen: `meta` y 180/20, `time` y 183/14, `receipt` y 285/14). Tinta a 90% da bolha: 4.50:1 no accent escuro, 5.74 em claro, 8.39 em alto contraste. `read` usa a tinta plena num preenchimento sólido e o accent num tingido; o relógio de `sending` respira.
- Falha: só a palavra, no tom de perigo, alinhada à aresta da bolha, sem glifo; o `retry` ao lado diz o resto.
- Escrita: rasto de dois círculos no pé da bolha, do lado do remetente, no preenchimento e na aresta da própria bolha; entrada por `@starting-style`; rótulo "Marta está a escrever" no rodapé, fora da árvore de acessibilidade (o `typing` já tem o nome).

Terceira revisão (2026-10-01): o revisor recusou a animação do texto em streaming: três caracteres a cada 45 ms e uma barra a piscar em dois passos.

- Chegada: parte nova `bubble` › `stream` (React `BubbleStream`, Angular `span[slBubbleStream]`) com `text`, o texto inteiro recebido até agora. O estado é de `@slotted/core/text-stream`. Cada chegada é partida em palavras por `Intl.Segmenter`. Cada palavra entra no DOM no mesmo instante, como `stream-chunk`, com atraso de 28 ms em relação à anterior. Uma rajada grande comprime-se para nenhuma palavra esperar mais de 320 ms, e uma rajada começa depois da anterior, por isso as palavras nunca se ultrapassam. Uma palavra que acabou de entrar volta a texto simples.
- Entrada: opacidade 0 → 1 e desfoque 0.16em → 0 juntos, em `--slotted-duration-long` com `--slotted-easing-standard`. A primeira versão, com tinta plena aos 45 % e desfoque de 0.25em, deixava cinco palavras opacas e borradas lado a lado (fotograma `react-1300`), lidas como uma linha manchada.
- Ponto: o `caret` passa a ser um ponto de `round(0.6em, 2px)` (8 px a comfortable), centrado no meio da altura-x, que respira entre escala 1 e 0.72. Enquanto há palavras a entrar, o ponto sai com `filter: opacity(0)`. Uma palavra ainda invisível já ocupa o seu lugar na linha, e o ponto depois dela ficava solto a meio da linha seguinte (fotograma `react-2700` da primeira versão). Volta quando o transporte fica parado.
- Demo: o transporte simulado chega em rajadas fixas, com pausas de 30 a 380 ms e rajadas de 1 a 12 palavras.
- Movimento reduzido: todas as chegadas assentam de imediato e o ponto fica aceso.
- Cenário verificado nos dois Storybooks: palavras a entrar com atrasos ≤ 320 ms; ponto de 8 × 8; nenhum `stream-chunk` e nenhum ponto depois do fim; nenhum `stream-chunk` sob `prefers-reduced-motion: reduce`.

## 9. Custo

- Um glifo novo na escala partilhada (`check-check`), com a entrada em `docs/token-foundation.md`.
- Dois módulos novos em `packages/core`: `text-stream`, puro, e `message-scroller`, com observadores; o scroller depende de `ResizeObserver`, `MutationObserver` e `scrollend` (com recurso a temporizador onde falta).
- A inferência de pintura pela linha (`align="end"` → `solid accent`) acopla o binding de `bubble` ao de `message`; uma bolha fora de uma mensagem cai nos defaults.
