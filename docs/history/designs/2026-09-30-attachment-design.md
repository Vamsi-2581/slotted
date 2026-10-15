# attachment — desenho

Família nova, criada pela invocação `/reui upload, attachment` (2026-09-30). O dossiê ReUI do `upload` (`2026-09-30-upload-reui-dossier.md`, secção 6) adiou para esta família o ficheiro mostrado fora de um envio.

## 1. Responsabilidade

`attachment` mostra um ficheiro que já pertence a alguma coisa: uma mensagem, um registo, um evento de linha do tempo, a bandeja de um compositor. Mostra o que o ficheiro é, dá acesso a ele e às ações que a aplicação oferece sobre ele.

`upload` adquire ficheiros e transfere-os. `attachment` não adquire, não valida e não transfere. Uma aplicação que envia por conta própria e quer mostrar o progresso numa bandeja usa `loading` e `value` do `attachment`; uma aplicação que quer o gestor de envio usa `upload`.

As duas famílias partilham o vocabulário de ficheiro de `@slotted/core/upload` (`fileKind`, `splitName`, `formatBytes`) e a escala de cor por tipo `--slotted-upload-kind-*`, que `import-export-center` já lê. Não partilham implementação: a linha do `upload` é um objeto de fila com estado de transferência, o `attachment` é uma apresentação.

## 2. Inventário de capacidades

### 2.1 Surveyed

Nenhuma biblioteca de componentes de uso geral publica a família com este nome fora de bibliotecas de chat. Nomes pesquisados: attachment, file card, file chip, file preview, media card, thumbnail.

| Implementação | Onde foi lida | Nome | Forma |
| --- | --- | --- | --- |
| ReUI | `https://reui.io/r/styles/base-nova/c-attachment-{1..6}.json`; specimens `tools/harness/out/specimen/c-attachment-*` | `Attachment` + `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction`, `AttachmentGroup`, `AttachmentTrigger` | `size` (default, sm, xs), `orientation` (horizontal, vertical), `state` (idle, uploading, processing, error, done); grupo com scroll horizontal e esbatimento |
| Vercel AI Elements | `https://ai-sdk.dev/elements/components/attachments` | `Attachments` + `Attachment`, `AttachmentPreview`, `AttachmentInfo`, `AttachmentRemove`, `AttachmentHoverCard`, `AttachmentEmpty` | `variant` do contentor (grid, inline, list); `data` com o ficheiro; `onRemove` desenha a remoção; `getMediaCategory` |
| assistant-ui | `https://www.assistant-ui.com/docs/api-reference/primitives/attachment` | `AttachmentPrimitive.Root`, `Thumb`, `Name`, `Remove` | primitivos sem estilo; `asChild` / `render` para substituir o elemento |
| Carbon | `https://carbondesignsystem.com/components/file-uploader/usage/` | `FileUploaderItem` | nome, estado por ficheiro (uploading, complete, edit), erro de uma ou várias linhas |

Referência medida: ReUI `c-attachment-5` e `c-attachment-3` (specimens claro, escuro, `--motion reduce`, estados de `attachment-action`).

### 2.2 Table stakes

| Capacidade | Quem publica | Veredicto | Razão |
| --- | --- | --- | --- |
| Pré-visualização: miniatura de imagem ou marca do tipo | ReUI, AI Elements, assistant-ui | `adopt` | parte `preview`; azulejo da cor do tipo com a marca vazada, como no `upload`, ou `img` quando há `src` |
| Nome do ficheiro truncado | ReUI, AI Elements, assistant-ui, Carbon | `adapt` | a extensão não encolhe (`name` + `extension`, `splitName`), a regra do `upload` |
| Linha secundária (tamanho, tipo, texto livre) | ReUI, AI Elements, Carbon | `adopt` | parte `detail`; tamanho por `formatBytes` com o `locale`; `description` substitui |
| Remoção | ReUI, AI Elements, assistant-ui, Carbon | `adopt` | parte `remove`, desenhada quando há `onRemove` (React) ou quando `(remove)` tem ouvinte (Angular) |
| Ações do consumidor | ReUI | `adopt` | parte `actions` com os botões que o consumidor escreve |
| Tamanhos | ReUI | `adopt` | `size`: `sm`, `md`, `lg`, na escala de controlo |
| Orientação cartão | ReUI (`vertical`), AI Elements (`grid`) | `adopt` | `orientation`: `horizontal`, `vertical` |
| Contentor com disposição | ReUI (`AttachmentGroup`), AI Elements (`Attachments variant`) | `adopt` | membro `attachmentList`: `layout` `list`, `grid`, `strip` |
| Estado de transferência | ReUI (`uploading`, `error`), Carbon | `adapt` | estados partilhados `loading` e `invalid`; `value` desenha a barra de `progress-indicator` |
| Ficheiro inteiro como alvo (abrir, descarregar) | ReUI (`AttachmentTrigger`), assistant-ui (`render`) | `adapt` | parte `trigger`: `a` com `href` (e `download` nativo), senão `button` com `onOpen`; alvo esticado sobre a raiz, ações ao lado e acima dele |
| Substituir o elemento | assistant-ui | `adopt` | `render` em React; em Angular o elemento que o autor escreve recebe a diretiva |
| Estado vazio | AI Elements (`AttachmentEmpty`) | `decline` | a lista sem anexos é o `result-state` da página; uma lista vazia não desenha nada: `@if (files.length) { <ul slAttachmentList>…</ul> } @else { <sl-result-state …/> }` |
| Hover card com detalhe | AI Elements | `decline` | `hover-card` compõe-se à volta do `trigger`: `<HoverCard><HoverCardTrigger render={(p) => <AttachmentTrigger {...p} />} />…</HoverCard>` |
| Esbatimento das pontas da faixa | ReUI | `defer to scroll-area` | `scroll-area` tem a reabertura "véu por `animation-timeline: scroll()`"; a faixa dentro de um `ScrollArea` recebe-o |

### 2.3 Differentiators

| Capacidade | Porquê aqui |
| --- | --- |
| Cor por tipo em três esquemas e forced-colors | a escala `--slotted-upload-kind-*` já tem os contrastes medidos em `default-theme.test.mjs`; nenhuma implementação inspecionada distingue um PDF de uma folha de cálculo a não ser pela marca |
| Densidade | o azulejo mede `2 × --slotted-control-icon-size-*` e escala com a densidade, como a linha do `upload` |
| Nome em RTL | `filename` com `dir="auto"` e `unicode-bidi: isolate`; `claim.pdf` não se lê `pdf.claim` numa página RTL |
| Anúncio de remoção e destino do foco | remover move o foco para o anexo seguinte, ou o anterior, ou o contentor (`@slotted/core/focus` removal-focus), como o `upload` |

### 2.4 Gaps

| Caso | Resposta |
| --- | --- |
| Nome de 200 caracteres sem espaços | o `name` encolhe com reticência, a extensão fica; o nome completo fica no DOM e no `title` do `trigger` |
| Cem anexos numa faixa | `strip` rola na linha com `scroll-snap-type: inline proximity`; `grid` quebra |
| Miniatura que falha a carregar | `img` com `onError` volta ao azulejo do tipo; o estado é interno, não é um estado do contrato |
| Ficheiro sem extensão e sem tipo | `fileKind` devolve `other`; o azulejo usa `--slotted-upload-kind-other` |

## 3. Anatomia e semântica

- `attachment`: `li` dentro do conjunto, `div` fora; `data-kind`, `data-size`, `data-orientation`, estados `loading`, `invalid`, `disabled`.
- Partes: `group`, `preview`, `body`, `trigger`, `filename`, `name`, `extension`, `detail`, `message`, `progress`, `actions`, `action`, `remove`.

Revisão de 2026-09-30, na implementação:

- O conjunto deixou de ser o membro `attachmentList` e passou a parte `group` do único membro (`ul`, `tabindex="-1"`, `data-layout`), como o `group` de `tag`. Um segundo membro exigia uma segunda página de referência para uma lista com um eixo; o `li` dentro dela é o mesmo anexo. React `AttachmentGroup`, Angular `[slAttachmentGroup]`.
- No cartão, com ponteiro fino, a placa de `actions` aparece com o hover ou o foco dentro do cartão e fica a `opacity: 0` em repouso (`--slotted-duration-short`, entrada `--slotted-easing-enter`, saída `--slotted-easing-exit`). A 120 px a marca do tipo está centrada a 51 px e a placa chega a 36 px do topo no lado final: em repouso cobria metade da página do PDF. Em toque e num cartão desativado a placa fica visível. Verificado no specimen `slotted-light-720-data-ui-attachment-data-9432fc` (repouso sem placa, hover com placa).
- Parte nova `action`: controlo interior (R2) das ações da aplicação, em `button` ou `a` com `download`. Sem ela, cada consumidor desenhava o seu botão com a altura de um controlo (30 px) dentro de uma linha de 58.
- `trigger` tem dois elementos por binding: React `AttachmentLink` (`a`) e `AttachmentTrigger` (`button`), pela razão de `list-item` (duas árvores de acessibilidade); Angular uma diretiva em `a` ou `button`.
- `remove` em React desenha-se quando existe `onRemove`; em Angular um `output()` não expõe ouvintes, por isso o sinal é o input `removable`, como em `tag`.
- `Backspace` e `Delete` pedem a remoção a partir de qualquer foco dentro de um anexo removível (razão `keyboard`), o atalho de `tag`.

Não há padrão APG para um anexo; `https://www.w3.org/WAI/ARIA/apg/patterns/` foi lido a 2026-09-30. `trigger` e `remove` seguem o padrão Button (`https://www.w3.org/WAI/ARIA/apg/patterns/button/`) e o elemento `a` nativo. O nome acessível do `trigger` é o nome do ficheiro; o de `remove` é o rótulo com o nome (`Remove claim-form.pdf`). Nenhum tabindex próprio: `trigger`, as ações e `remove` estão na sequência da página.

`trigger` e as ações são irmãos: conteúdo interativo não se aninha em `a` ou `button`. O alvo cobre a raiz por um `::after` esticado do `trigger`, e `actions` sobe acima dele (`position: relative; z-index: 1`), a decisão de `list-item`.

## 4. Estado

Nenhum valor mutável pertence à família. A lista de anexos é do consumidor; `remove` é um pedido (`onRemove` / `(remove)`), sem par controlado, porque a família não guarda a lista. `docs/state-and-events.md` não exige `stateModel` para um evento sem valor.

## 5. Custo

- Leitura de `--slotted-upload-kind-*` por uma segunda família. Um nome partilhado (`--slotted-file-kind-*`) muda doze ficheiros de três famílias e do tema; fica como reabertura se uma terceira família precisar da escala.
- `strip` sem esbatimento até `scroll-area` o ter.
