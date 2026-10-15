# Field — a fila do rótulo

Reconstrução de `field` (e do eixo de necessidade que `field-group` fornece),
invocada como `/reui field build`. Fonte das medidas:
`2026-09-30-field-reui-dossier.md`. Inventário anterior:
`2026-09-02-field-capability-inventory.md`, cujas linhas não repetidas aqui
continuam válidas.

## 1. Inventário

### Surveyed

As onze implementações de 2026-09-02 (Base UI 1.7.0, Ark UI 5.39.1, React
Aria / Spectrum, Angular Material 21, Fluent UI v9, Primer React, Carbon,
Mantine 7, Chakra UI 3, GOV.UK, HTML/APG) e duas novas:

| Implementação | Nome | Lida em |
| ------------- | ---- | ------- |
| ReUI (shadcn `Field`) | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`; fila do rótulo escrita à mão | `tools/harness/out/specimen/reui-src/c-field-*.json`, blocos `settings-3`, `auth-6`, `comparison-1` |
| Polaris | `labelAction`, `requiredIndicator`, `showCharacterCount` em `TextField` | <https://polaris.shopify.com/components/selection-and-input/text-field> |

A especificação de referência é `https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/`
(nome por `label[for]`, descrição por `aria-describedby`). Não existe padrão APG
para um campo; a dica segue `tooltip` (`specs/components/tooltip/contract.json`,
padrão APG Tooltip e WCAG 2.2 SC 1.4.13).

### Table stakes

| Capacidade | Quem publica | Veredicto | Razão |
| ---------- | ------------ | --------- | ----- |
| Marca só nos opcionais, `(optional)` | GOV.UK, Carbon, Polaris (`requiredIndicator` inverso), Spectrum (`necessityIndicator="label"` escreve os dois) | adotar | `necessity="optional"`. O eixo `requiredMark` deixa de descrever o que faz e passa a `necessity`. |
| Ação na fila do rótulo | Polaris (`labelAction`), ReUI `auth-6`, Primer (`FormControl.Label` + `Link` à mão) | adotar | parte `action`. |
| Ajuda contextual por ícone | Spectrum (`contextualHelp`), ReUI `comparison-1`, Carbon (`Toggletip` no rótulo) | adotar | parte `help`. Em 2026-09-02 foi recusada com "uma de onze"; três implementações a publicam agora, e a objeção técnica — um botão dentro de `label` — desaparece com a parte `header`. |
| Emblema ao lado do rótulo | ReUI `settings-3`, Primer (`Label` ao lado de `FormControl.Label`), Carbon (`Tag` "Beta" em formulários) | adotar | parte `indicator`. |
| Contador em `aria-describedby` | Angular Material (`mat-hint` é descrição), Carbon (`aria-describedby` do helper) | adotar | `component-features.md` §2.8 exige a relação por ID para o contador; hoje falta. |
| Fila do rótulo com itens ao fim | ReUI (`c-field-2`, `c-field-5`, `c-field-7`), Primer, Carbon | adotar | parte `header`. |
| Valor ao vivo no fim da fila (`75%`) | ReUI `c-field-5`, Carbon `Slider` | adiar para `slider` | o valor pertence ao controlo que o move; `slider` desenha-o. |

### Differentiators

| Capacidade | Porque esta biblioteca a pode ter |
| ---------- | --------------------------------- |
| A dica abre com um toque | `tooltip` só abre por pressão longa num ponteiro grosso; `help` controla o `open` da dica e alterna-o no clique, como um *toggletip*. Nenhuma das três implementações acima abre a dica num ecrã tátil com um toque. |
| A dica também está no controlo | O texto da dica entra em `aria-describedby` do controlo, por um nó oculto com o identificador `help`. Quem navega por Tab até ao controlo ouve a dica sem visitar o botão. |
| Tudo na fila alinha pela linha de base | Rótulo a 13 px, ação e contador a 12 px, emblema com a sua própria caixa: `align-items: baseline` e o glifo da ajuda posto na banda do texto por `calc((1cap + 1ex) / 2)` (decisão de `toast` no briefing). O ReUI centra caixas (`items-center`). |
| Alvos de 24 px sem crescer a fila | `help` e `action` recuperam `--slotted-target-min` por enchimento e margem negativa em bloco, e 44 px sob `pointer: coarse` por halo; a fila mede o mesmo com e sem eles. |
| Uma decisão de necessidade por aplicação | `necessity` e `necessityWords` no fornecedor, nos dois bindings, e herdados por `field-group`. |

### Gaps

| O que um produto encontra | O que a família faz |
| ------------------------- | ------------------- |
| Rótulo longo com ajuda, emblema, ação e contador numa coluna de 240 px | O cabeçalho quebra: o rótulo encolhe e quebra por palavras; a ação e o contador passam para a linha seguinte, alinhados ao fim. Cena `header` a 240 px. |
| Campo desativado cuja ajuda explica porquê | `help` não herda `disabled`: continua focável e abre. `action` também não; a página decide. |
| Contador lido como "doze barra sessenta" | O contador entra na descrição com o texto que mostra. Uma frase traduzida por contagem seria um formatador de plural por locale; fica por escrever e a razão está aqui. |
| Dica com uma ligação ou um botão dentro | Recusado: `role="tooltip"` não pode conter conteúdo interativo. Uma ajuda com ligações é `popover` composto pela página dentro de `header`. |

### Delta contra o que existe

| Hoje | Depois |
| ---- | ------ |
| `requiredMark`: `mark`, `text`, `none` | `necessity`: `mark`, `optional`, `words`, `none` |
| `data-required-mark` | `data-necessity` |
| `label` e `counter` filhos diretos da raiz | idem, ou dentro de `header` com `help`, `indicator`, `action` |
| `describedBy`: `description`, `error` | `indicator`, `help`, `description`, `counter`, `error` |
| contador fora da descrição | contador com identificador próprio |

## 2. Anatomia

```html
<div data-ui="field" data-part="root" data-necessity="mark" …>
  <div data-part="header">
    <label data-part="label" for="f-control" id="f-label">
      Palavra-passe<span data-part="mark" aria-hidden="true">*</span>
    </label>
    <button data-part="help" type="button" aria-label="Mais informação"
            aria-describedby="f-help" aria-expanded? data-open?>
      <span data-ui="icon"><svg data-part="glyph" data-glyph="circle-question"/></span>
    </button>
    <span data-part="help-text" id="f-help" hidden>Mínimo de oito caracteres.</span>
    <span data-part="indicator" id="f-indicator"><span data-ui="badge">Beta</span></span>
    <a data-part="action" href="/recuperar">Esqueceu-se?</a>
    <span data-part="counter" id="f-counter">12/60</span>
  </div>
  <input data-part="control" id="f-control"
         aria-describedby="f-indicator f-help f-description f-counter f-error">
  <p data-ui="inline-message" id="f-description">…</p>
  <p data-ui="inline-message" id="f-error">…</p>
</div>
```

- `header` é opcional. Um campo só com rótulo escreve o `label` diretamente na
  raiz, como hoje. Os itens de `header` seguem a ordem do DOM acima; nenhuma
  regra `order` reordena o que o leitor percorre.
- `help-text` não é parte pública: é o nó oculto que a descrição referencia. O
  conteúdo visível vive na camada de `tooltip`, que só existe aberta; um
  `aria-describedby` para ela ficaria vazio fechado. Um nó com `hidden`
  referenciado por `aria-describedby` entra no cálculo da descrição (accname
  1.2, passo 2A).
- A dica abre com `describes="none"` em `tooltip`, porque o botão já é descrito
  pelo mesmo texto através de `help-text`; a camada fica `aria-hidden` e a
  frase não é lida duas vezes.
- `indicator` fica fora do `label` para a marca de necessidade continuar colada
  à palavra; entra na descrição do controlo.
- `action` é `button type="button"` por omissão, `a` por `render` (React) ou
  pela diretiva no elemento do consumidor (Angular).

## 3. Disposição

- `header`: `display: flex; flex-wrap: wrap; align-items: baseline`,
  `column-gap: --slotted-space-3`, com a letra e a linha do rótulo. A fila mede
  a altura do rótulo com ou sem ajuda, emblema ou ação: 18.84 a 18.88 px em
  `md` confortável, 17.39 px em denso (espécimes `slotted-light-420*.json`).
- `help`: caixa `max(min(glifo + 2 × --slotted-space-2, --slotted-control-inner-size-*), 1lh)`
  (22 px confortável, 17.39 px denso), halo transparente até
  `--slotted-target-min`, e 44 px sob `pointer: coarse`. A linha dentro do botão
  é a do rótulo e o botão centra-a, por isso a linha de base coincide. O glifo
  fica na banda `(1cap + 1ex) / 2`.
- `indicator`: centrado na linha (`align-self: center`), não na linha de base:
  a caixa do emblema passava 1.77 px acima da linha.
- `action`: caixa flex de 24 px devolvida à linha por margem negativa em bloco;
  `unicode-bidi: plaintext`, para uma ação latina numa página rtl não abrir
  com o ponto de interrogação.
- `action` e `counter` têm `margin-inline-start: auto`; um contador depois de
  uma ação fica a um segundo passo do intervalo (12 px no total).
- `labelPlacement="side"`: o cabeçalho ocupa a primeira coluna e recebe o
  deslocamento que o rótulo recebe. O contador fica numa linha própria por
  baixo do rótulo, alinhado ao fim da coluna do rótulo, com e sem cabeçalho.
  Todos os filhos têm `align-self: start`: um rótulo de três linhas, ou um
  cabeçalho cuja ação quebrou, esticava um input de uma linha até 43 px.
- Limites registados: numa coluna estreita a ajuda pode ir para a linha
  seguinte, separada da última palavra do rótulo, porque é um item flex e não
  texto em linha; um emblema `sm` mede 18.8 px em denso contra uma linha de
  17.39, e a fila cresce 1.41 px (dimensão de `badge`, `outra família`); um
  cabeçalho com ação e contador numa coluna onde os dois não cabem juntos
  depois do emblema deixa o contador sozinho no início de uma terceira linha,
  porque duas margens `auto` não mantêm o par unido ao quebrar e só um
  envoltório no DOM o faria.

## 4. Estados

| Parte | Estado | Tratamento |
| ----- | ------ | ---------- |
| `help` | hover | fundo `--slotted-tone-secondary-subtle-hover` (R2.3: só o fundo) |
| `help` | active | fundo `--slotted-tone-secondary-subtle-active` |
| `help` | open | fundo do hover enquanto `data-open` |
| `help` | focus-visible | anel do tema |
| `action` | hover | tinta `color-mix(accent-text 65 %, text)`, sublinhado `currentColor` |
| `action` | active | `color-mix(accent-text 35 %, text)` |
| `action` | focus-visible | anel do tema |
| raiz | disabled | rótulo, marca e contador em `--slotted-disabled-foreground`; `help` e `action` não mudam |

`open` é um estado mutável da ajuda. Modelo: `open` / `defaultOpen` /
`onOpenChange` (React) e `[(open)]` (Angular) na parte `help`, razões
`pointer`, `keyboard`, `escape`, `blur`, `outsidePress`.

## 5. Integração

### React

| Pergunta | Resposta |
| -------- | -------- |
| Par controlado e não controlado com razão | `FieldHelp` `open`/`defaultOpen`/`onOpenChange(open, request)`; o resto da família não guarda estado. |
| Predefinições uma vez | `FieldDefaultsProvider`: `necessity`, `necessityWords`, `helpLabel`. |
| Substituir o elemento de cada parte | `render` em `FieldHeader`, `FieldAction`, `FieldIndicator`, `FieldCounter`; `FieldHelp` fixo, porque o botão carrega o nome, a descrição e o controlo da camada. |
| O handler do consumidor corre | `onClick` de `FieldHelp` e `FieldAction` composto antes do da família. |
| Elemento nativo e ação imperativa | `ref` em cada parte; nenhuma ação imperativa. |
| SSR sem divergência | identificadores derivados de `useId`; nenhuma leitura de layout. |
| Estado estilizável no DOM | `data-necessity`, `data-open` na ajuda, `data-invalid` no contador. |
| Tipos das props | `ComponentPropsWithRef<'div' \| 'button' \| 'span'>`. |

### Angular

| Pergunta | Resposta |
| -------- | -------- |
| Valor bidirecional | `open = model(false)` em `slFieldHelp`, `openChange` com razão. |
| Formulários | não se aplica: o campo não tem valor; o controlo dentro dele tem o seu `ControlValueAccessor`. |
| Predefinições uma vez | `provideFieldDefaults({ necessity, necessityWords, helpLabel })`. |
| Instância | `exportAs` em `slField` e `slFieldHelp`. |
| Conteúdo projetado | o texto da ajuda projetado em `slFieldHelp`; `slFieldAction` é diretiva no `a` ou `button` do consumidor. |
| Zoneless e `OnPush` | sinais em todo o registo de mensagens e na ajuda. |
| Limpeza | ouvintes em `host`; `DestroyRef` no registo. |
| Atributo estático do consumidor | `aria-label` escrito na ajuda vence `helpLabel` (`HostAttributeToken`). |
| Ponto de entrada único | `@slotted/angular/field`. |

## 6. Custo

Quebra de API, sem camada de compatibilidade (`AGENTS.md`):

| Antes | Depois | Como migra |
| ----- | ------ | ---------- |
| `requiredMark="mark"` | `necessity="mark"` | renomear a prop |
| `requiredMark="text"` | `necessity="words"` | renomear prop e valor |
| `requiredMark="none"` | `necessity="none"` | renomear a prop |
| `[data-required-mark]` | `[data-necessity]` | seletor novo |
| contador ao fim da fila do controlo com `labelPlacement="side"` | por baixo do rótulo | nada a escrever |
