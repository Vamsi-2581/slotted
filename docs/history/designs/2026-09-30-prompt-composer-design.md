# `prompt-composer` e `textarea` — desenho (2026-09-30)

Modo `build` para `prompt-composer` (família nova, `[Specialized]`, invocada pelo
pedido "entradas: AI chat inputs") e `polish` para `textarea`. Fila das entradas,
item 2 (`2026-09-30-text-field-rebuild-design.md` § 6).

## 1. Inventário

### 1.1 Surveyed

| Implementação | Nome | Fonte |
| ------------- | ---- | ----- |
| ReUI | `InputGroup` + `InputGroupTextarea` + `InputGroupAddon align="block-start|block-end"` | `https://reui.io/r/c-input-group-{17,18,19,26,33,34}.json`; blocos Pro `app-shell-17`, `sheet-4`, `sheet-10` (só catálogo) |
| Vercel AI Elements | `PromptInput`, `PromptInputTextarea`, `PromptInputToolbar`, `PromptInputTools`, `PromptInputButton`, `PromptInputSubmit` (`status`: `ready`, `submitted`, `streaming`, `error`), `PromptInputModelSelect`, anexos | `https://ai-sdk.dev/elements/components/prompt-input` |
| assistant-ui | `ComposerPrimitive.Root`, `.Input` (`submitOnEnter`), `.Send`, `.Cancel`, `.Attachments`, `.AddAttachment` | `https://www.assistant-ui.com/docs/api-reference/primitives/Composer` |
| Chatscope | `MessageInput` (`sendOnReturnDisabled`, `attachButton`, `sendButton`) | `https://chatscope.io/storybook/react/?path=/docs/components-messageinput` |
| Primer | `Textarea` e a caixa de comentário (`MarkdownEditor`: barra, Cancelar/Comentar, colar ficheiros) | `https://primer.style/components/textarea` |
| HTML | `textarea`, `field-sizing: content`, `KeyboardEvent.isComposing`, `DataTransfer.files` em `paste` e `drop` | `https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element` |

Espécime de referência: ReUI `c-input-group-18` (barra inferior com modelo e envio) e `c-input-group-26` (Cancelar/Publicar).

### 1.2 Table stakes

| Capacidade | Quem entrega | Veredicto | Razão |
| ---------- | ------------ | --------- | ----- |
| Texto de várias linhas que cresce até um máximo | todos | adopt | `field-sizing: content` com `rows` como piso e `maxRows` como teto, a regra de `textarea`. |
| Enter envia, Shift+Enter quebra linha | AI Elements, assistant-ui, Chatscope | adopt | `submitOn: 'enter' | 'mod-enter'`; nunca durante composição IME (`isComposing`). |
| Botão de envio desativado com valor vazio | AI Elements, assistant-ui | adopt | `canSubmit` sobrepõe a regra (valor vazio com anexos). |
| Estado do pedido: enviado, a transmitir, erro | AI Elements (`status`), assistant-ui (`Cancel`) | adopt | `status`; em `streaming` o envio vira parar e emite `onStop`. |
| Barra de ferramentas inferior (anexar, modelo, pesquisa) | ReUI 18/19, AI Elements `PromptInputTools` | adopt | Parte `footer`; botões por `action`, menus por composição com `menu`. |
| Faixa superior (anexos, contexto) | ReUI 19, AI Elements anexos | adopt | Parte `header`; os anexos são `attachment` do consumidor. |
| Anexar por botão, colar e largar ficheiros | AI Elements, assistant-ui, Primer | adopt | Parte `attach` e escuta de `paste`/`drop` na moldura; `onAttach(files, { reason, rejected })` com as regras de `selectFiles` (`@slotted/core/upload`). |
| Lista de anexos como estado da família | assistant-ui | decline | Os anexos sobem para um servidor enquanto se escreve; o dono da lista é o consumidor, com `upload`/`attachment`. A família entrega os ficheiros e desenha nada deles. |
| Cancelar/Publicar numa caixa de comentário | ReUI 26, Primer | adopt | `action` rotulada no `footer`; o envio chama-se pelo rótulo (`sendLabel`). |
| Seletor de modelo | ReUI 18/19, AI Elements | adapt | Composição `menu` + `action`; nenhuma prop de modelo. |
| Contador | ReUI 17 | adopt | `showCount`, publicado para o `field`. |

### 1.3 Differentiators

| Capacidade | Razão |
| ---------- | ----- |
| Largar ficheiros sobre a moldura com `data-drop-target` e a mesma validação de `upload` | Nenhuma implementação pesquisada rejeita por tipo e tamanho antes de entregar; aqui `rejected` chega junto. |
| O valor não se perde num envio recusado | O pedido de envio é cancelável; só depois de aceite o valor não controlado é limpo, com razão `submit`. |
| Anúncio do estado | `status` anunciado pelo `live-announcer` (`sendingLabel`, `stoppedLabel`); o botão troca de nome e de marca. |
| Dois bindings, três esquemas, três densidades, RTL | Herdados. |

### 1.4 Gaps

| Caso | Resposta |
| ---- | -------- |
| IME (japonês, chinês): Enter confirma a composição | `isComposing` e `keyCode 229` ignoram o Enter. |
| Colar uma imagem com texto | Os ficheiros vão para `onAttach`; o texto entra no valor. |
| Mensagem com 200 linhas | O campo para em `maxRows` e rola; a barra fica visível. |
| Envio durante `submitted` | Recusado: o botão está ocupado e Enter não envia. |

## 2. Padrão

Sem padrão APG para um compositor. O `textarea` nativo dá papel e teclado; o
root é um `form` (envio nativo com `requestSubmit`, `reset`); os botões são
`button`. A barra inferior não é `toolbar` APG: uma parada de tabulação por
botão, porque são poucos e heterogéneos (um menu, um anexar, um enviar).

## 3. Decisões

1. **Anatomia:** `root` (`form`), `header`, `input` (`textarea`), `footer`,
   `action` (botão do consumidor em `header`/`footer`), `attach` (botão que
   abre o seletor de ficheiros), `submit`. O `submit` fica no fim do `footer`
   pela margem automática, sem espaçador.
2. **Estado:** `value` com par controlado e razões `keyboard` e `submit`
   (limpeza depois do envio aceite). `status` pertence ao consumidor.
3. **Saídas:** `onValueSubmit(value, request)` cancelável; `onStop(reason)`;
   `onAttach(files, detail)`. `onSubmit` fica o evento nativo do `form`.
4. **Moldura:** o `root` pinta a borda, o fundo, a elevação e o anel de foco
   quando o `input` tem foco; os botões internos seguem R2. Três variantes:
   `raised` (predefinida, compositor de chat) — `--slotted-shadow-md` em
   repouso, `--slotted-shadow-lg` ao escrever, botões de 28 px redondos,
   folga `--slotted-space-4`, raio derivado `botão / 2 + folga` (22 px em
   `md`) para ficar concêntrico com o envio redondo, porque a escala de raios
   para em 8; `outline` e `subtle` — compositor dentro de um formulário, com a
   geometria de um controlo de uma linha e raio `--slotted-radius-lg`.
   O texto começa na vertical da tinta do primeiro ícone da faixa
   (`folga + (botão − glifo) / 2`).
5. **Envio:** disco na cor de destaque; a seta sobe 1 px no hover; a pressão
   reduz o disco a 0.9 (exceção R7 `prompt-composer/submit`, só com
   `aria-label`); vazio é um disco neutro com a seta legível; `submitted`
   mostra o anel do tamanho do glifo; `streaming` o quadrado de parar dentro
   do anel do `spinner` partilhado do tamanho do disco; `error` o glifo
   `rotate-ccw` (tentar de novo).
6. **Largar:** lavagem de acento e uma borda tracejada num pseudo-elemento, a
   meia folga, concêntrica, com entrada e saída de opacidade; o `outline`
   fica para o anel de foco.
7. **Glifos novos:** `arrow-up` (enviar), `stop` (quadrado cheio), `paperclip`
   (anexar), em commit próprio.
8. **`textarea`:** nenhuma mudança de API. O `textarea` continua o próprio
   elemento; o que o ReUI põe à volta dele é esta família.

## 4. Integração

### React

| Pergunta | Resposta |
| -------- | -------- |
| Par controlado + pedido | `value`/`defaultValue`/`onValueChange` no `PromptComposer`. |
| Defaults | `PromptComposerDefaultsProvider`: `size`, `variant`, `submitOn`, rótulos. |
| `render` | em cada parte. |
| Handler do consumidor | `onKeyDown`, `onPaste` do `input`; `onDrop`/`onDragOver` do root compostos. |
| `ref` | `ref` do `PromptComposerInput` no `textarea`; o root expõe o `form`. |
| SSR | nada lido do layout no render. |
| Estados no DOM | `data-status`, `data-disabled`, `data-invalid`, `data-drop-target`, `data-empty`. |
| Tipos | cada parte estende `ComponentPropsWithRef` do seu elemento. |

### Angular

| Pergunta | Resposta |
| -------- | -------- |
| `model()` + `output()` | `valueChange`, `valueSubmit`, `stop`, `attach` como `output()`. |
| Forms | `textarea[slPromptComposerInput]` é `ControlValueAccessor`. |
| Defaults | `providePromptComposerDefaults()`. |
| `exportAs` | `slPromptComposer`, `slPromptComposerInput`. |
| Projeção | diretivas nos elementos do consumidor. |
| Zoneless | sinais. |
| Teardown | listeners no `host`. |
| Atributo estático | `data-part` reescrito em `action` quando `slMenuTriggerFor` está no mesmo elemento. |
| Entrada | `@slotted/angular/prompt-composer`. |
