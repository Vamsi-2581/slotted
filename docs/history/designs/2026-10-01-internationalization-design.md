# Internacionalização — desenho

Substitui `2026-09-22-internationalization-design.md`, nunca executado. As medições de §2 são de 2026-10-01, sobre o ramo `review/implementation-pass-1`.

Uma aplicação declara o locale num ponto. Biblioteca e aplicação falam a mesma língua. A troca em runtime reflete sem recarregar, e duas subárvores da mesma página podem falar línguas diferentes.

## 1. Termos

- **locale**: etiqueta BCP-47 (`pt-BR`, `en-US`).
- **mensagem**: uma entrada de texto que a biblioteca emite.
- **catálogo**: o conjunto de mensagens de um locale, agrupado por família.
- **slot**: marcador `{nome}` dentro de uma mensagem.
- **texto de cromo**: texto cujo valor por omissão é fornecido pela biblioteca (`Close`, `Clear`, `{count} rows`). Opõe-se a conteúdo, que só a aplicação fornece (o `label` de um `field`, o título de um `dialog`).

## 2. Estado que este desenho substitui

Medição por AST TypeScript sobre o código de runtime de `packages/react/src`, `packages/angular` e `packages/core/src`, excluindo `.spec.`, `.test.`, `.stories.`, `.docs.` e `*-demo`.

| Facto | Medida |
| --- | --- |
| Famílias com superfície de texto | 82 React, 81 Angular; 83 na união |
| Famílias com input/prop `labels` | 21 React, 20 Angular |
| Famílias com input/prop `messages` | 19 React, 19 Angular; `data-grid` tem as duas |
| Famílias com props de texto soltas (`clearLabel`, `emptyLabel`, `chooseLabel`, …) | 56 React, 55 Angular |
| Catálogos nomeados (`*_LABELS`, `*_MESSAGES`) nos bindings | 36 React, 37 Angular; 546 chaves em cada binding |
| Catálogos nomeados em `packages/core` | 7 (`carousel`, `chart`, `dashboard-grid`, `data-list`, `drag`, `fullscreen`, `import-export-center`); 171 chaves |
| Funções de preenchimento de slots | 14: 7 nos bindings (`fillLabel`, `formatMessage`), 7 em `core` (`formatRatingMessage`, `formatScrollerMessage`, `formatCarouselMessage`, `formatDataListMessage`, `formatDashboardLabel`, `formatEntityLabel`, `fillMessage`) |
| Funções de fusão de catálogo | 6 (`resolveLabels`, `resolveDataGridLabels`, `resolveFilterBarLabels`) |
| Texto fixo sem escape | `dialog` (`Close`, `Full screen`) e `color-picker` (`2D slider`), nos dois bindings |
| Contratos com bloco `labels` | 18: 15 objeto chave→texto, 3 lista de chaves (`code-block`, `event-calendar`, `filter-bar`) |
| Contratos com bloco `messages` | 15: 14 objeto chave→texto, 1 lista de chaves (`fullscreen`) |
| Famílias com `locale` declarado | 42 React, 41 Angular |

As listas por binding não coincidem: `avatar` e `result-state` expõem texto só em React, `avatar-group` só em Angular, `listbox` tem `labels` só em React, e 17 famílias presentes nos dois têm props de texto soltas diferentes. Um catálogo partilhado obriga as duas superfícies a fechar no mesmo conjunto de chaves.

Cinco defeitos estruturais decorrem daí.

**Duplicação entre bindings.** `packages/react/src/data-grid/data-grid-defaults.tsx` e `packages/angular/data-grid/src/data-grid-defaults.ts` declaram as mesmas chaves com os mesmos textos. 29 contratos declaram uma terceira cópia dos textos.

**Língua base incoerente.** 13 famílias têm texto por omissão em português: `app-shell`, `carousel`, `detail-panel`, `import-export-center`, `message`, `message-scroller`, `notification-center`, `page`, `page-header`, `rating`, `side-navigation`, `table-of-contents`, `top-navigation`. As restantes têm texto por omissão em inglês. A demo Nexora, em inglês, regista o custo em `demos/nexora/angular/LIBRARY-FEEDBACK.md`: um `provide*Defaults` por família para falar inglês (linha 7), e catálogos portugueses visíveis num host de teste sem `app.config.ts` (linhas 33 e 143).

**Quatro formas de mensagem.** String com substituição literal de `{slot}` (`fillLabel`); string com plural em subconjunto ICU (`{count, plural, one {# nova} other {# novas}}`), com o mesmo parser copiado em `formatRatingMessage` e `formatScrollerMessage`; função de contagem (`import-export-center`: `active: (count) => string`); função de contexto (`drag`). Só as famílias `rating` e `message-scroller` pluralizam; `groupCount: '{count} rows'` rende `1 rows`.

**Angular não troca em runtime.** `data-grid.ts:1571` captura `injectDataGridDefaults()` uma vez, e a factory do token corre uma vez por injector. `packages/angular` tem 130 atribuições `= inject*Defaults()` com a mesma forma. Trocar idioma exige recriar o injector.

**Locale de formatação sem fonte comum.** Cada família lê o seu `locale` da instância ou dos seus defaults. Só `rating` em Angular cai em `<html lang>` (`injectDocumentLocale`, `packages/angular/rating/src/rating-defaults.ts:152`).

## 3. Decisões

**D1 — Texto de cromo tem exatamente dois lugares: o catálogo raiz e a instância.**
Hoje são três (constante da família, provider da família, input da instância). O catálogo raiz é agrupado por família, o que torna o slot de texto nos providers de família redundante. Os providers de família mantêm os defaults de comportamento e de forma (`variant`, `selectionMode`, `pageSizes`, `filterDebounce`) e perdem `labels`, `messages` e as props de texto soltas.

**D2 — Critério de pertença ao catálogo: a biblioteca fornece o valor por omissão.**
Uma prop de texto com valor por omissão na biblioteca é texto de cromo: entra no catálogo da família e sai da superfície do componente. Uma prop sem valor por omissão é conteúdo e permanece prop. Exemplo: `clearLabel` (omissão `Clear`) entra; `label` de `field` permanece.

**D3 — O catálogo vive em `@slotted/core/i18n`.**
Os 7 catálogos e as 7 funções de preenchimento de `core` são apagados e absorvidos por este módulo. As constantes de texto dos dois bindings são apagadas e passam a importar daqui.

**D4 — Mensagem é `string | (slots, locale) => string`.**
A forma função é o ponto de integração com i18next, react-intl, ngx-translate e `$localize`, e mantém frases compostas como as de `drag`. Precedente externo: `localeText` do MUI e `LocalizedStringFormatter` do React Aria aceitam funções.

**D5 — Plural e seleção no subconjunto ICU, dentro da string.**
A gramática de §5 generaliza o parser já usado por `rating` e `message-scroller` e acrescenta `select`. Uma tradução com plural continua a ser dados: um locale com categorias `few` e `many` é escrito sem código. Um único parser em `@slotted/core/i18n` substitui os dois existentes.

**D6 — Slots numéricos são formatados por `Intl.NumberFormat` no locale negociado.**
`{count}`, `{total}`, `{start}`, `{end}` saem `1.234` em pt-BR e `1,234` em en-US. Um slot já em `string` passa intacto; a família que precisa de outra precisão ou de percentagem passa o slot formatado (`formatShare` em `rating`).

**D7 — Negociação por lookup RFC 4647, com `en-US` como base.**
`pt-BR` → `pt` → `en-US`. Chave ausente resolve para a base; a chave crua nunca é renderizada. `en-US` é incluído no entrypoint `./i18n` por ser a base da resolução; os restantes locales são entrypoints próprios.

**D8 — A língua base é `en-US` em todas as famílias.**
`EN_US` contém texto inglês para as 83 famílias. O texto português atual das 13 famílias de §2 passa a ponto de partida de `PT_BR`.

**D9 — Catálogos são síncronos.**
O provider aceita catálogos já resolvidos. Carregar um catálogo sob procura é trabalho da aplicação: importa dinamicamente, e só então troca o estado. A biblioteca não ganha estado de carregamento, e o render é determinista em SSR.

**D10 — Fusão: registos fundem, valores substituem.**
Numa sobreposição, um nível que é registo simples funde entrada a entrada (`filterOperators`); um valor de mensagem substitui por inteiro.

**D11 — Um `locale` alimenta texto e formatação.**
O provider raiz alimenta o `locale` hoje declarado nos defaults de 42 famílias React e 41 Angular. O input por instância continua a ganhar, para o caso de uma grelha formatar noutro locale que o resto da página. Sem provider, o locale é `en-US`; `injectDocumentLocale` é apagado.

**D12 — Nome único: `messages`.**
Os catálogos contêm anúncios e frases (`sortedBy`, `editConflict`, `filterCleared`), não apenas nomes de controlo. `labels` desaparece do repositório, incluindo dos contratos.

**D13 — Direção fica fora deste contrato.**
As famílias derivam `rtl` do DOM e o CSS é lógico: 851 `padding-inline`, 370 `inset-inline`, 296 `margin-inline`, contra 1 `margin-left`. `dir` e `lang` são do documento da aplicação. O eixo `direction` da toolbar do Storybook continua a ser onde RTL é revisto.

**D14 — O contrato de família declara chaves, não textos.**
Em `specs/components/*/contract.json`, os blocos `labels` e `messages` passam a um único bloco `messages`: lista ordenada de chaves. O teste da família assere que a lista é igual às chaves de `EN_US` dessa família. Os textos dos 29 contratos com objeto desaparecem.

## 4. Contrato público

### 4.1 Núcleo

```ts
// @slotted/core/i18n
export type SlotValue = string | number;
export type MessageSlots = Readonly<Record<string, SlotValue>>;
export type MessageFn<S extends MessageSlots = MessageSlots> = (slots: S, locale: string) => string;
export type Message<S extends MessageSlots = MessageSlots> = string | MessageFn<S>;

/** Preenche uma mensagem pela gramática de §5. */
export function formatMessage(template: string, slots: MessageSlots, locale: string): string;

export interface SlottedMessages {
  readonly dataGrid: DataGridMessages;
  readonly filterBar: FilterBarMessages;
  readonly table: TableMessages;
  // uma entrada por família do Apêndice A do plano, em camelCase
}

export type Catalog = { readonly [F in keyof SlottedMessages]: SlottedMessages[F] };
export type PartialCatalog = { readonly [F in keyof SlottedMessages]?: Partial<SlottedMessages[F]> };

export const EN_US: Catalog;

export interface TranslatorOptions {
  readonly locale: string;
  /** Catálogos disponíveis, por locale. `en-US` está sempre presente. */
  readonly catalogs?: Readonly<Record<string, PartialCatalog>>;
  /** Delegação a um i18n da aplicação. Devolver `undefined` cai no catálogo. */
  readonly resolve?: (path: string, slots: MessageSlots, locale: string) => string | undefined;
}

export interface Translator {
  /** O locale negociado, não o pedido. */
  readonly locale: string;
  family<F extends keyof SlottedMessages>(
    name: F,
    override?: Partial<SlottedMessages[F]>,
  ): FamilyTranslator<SlottedMessages[F]>;
}

export interface FamilyTranslator<M> {
  <K extends keyof M>(key: K, slots?: SlotsOf<M[K]>): string;
}

export function createTranslator(options: TranslatorOptions): Translator;
export function negotiateLocale(requested: string, available: readonly string[]): string;
```

Ordem de resolução de uma mensagem, do primeiro ao último: `resolve` da aplicação; `override` da instância; catálogo do locale negociado; catálogo do prefixo de língua; `EN_US`.

### 4.2 React

```tsx
// @slotted/react/i18n
export function SlottedProvider(props: {
  locale?: string;
  catalogs?: Record<string, PartialCatalog>;
  resolve?: TranslatorOptions['resolve'];
  children: ReactNode;
}): ReactElement;

export function useLocale(): string;
export function useTranslator(): Translator;
export function useMessages<F extends keyof SlottedMessages>(
  family: F,
  override?: Partial<SlottedMessages[F]>,
): FamilyTranslator<SlottedMessages[F]>;
```

`SlottedProvider` aninha: o provider interno herda `catalogs` e `resolve` do externo e substitui o `locale`. Sem provider, `useLocale()` devolve `en-US` e o catálogo é `EN_US`.

Consumo numa família:

```tsx
const t = useMessages('table', messages);
<button aria-label={t('selectRow')} />
<span>{t('groupCount', { count })}</span>
```

### 4.3 Angular

```ts
// @slotted/angular/i18n
export function provideSlotted(config: {
  locale?: string | Signal<string>;
  catalogs?: Record<string, PartialCatalog>;
  resolve?: TranslatorOptions['resolve'];
}): EnvironmentProviders;

export function injectLocale(): Signal<string>;
export function injectTranslator(): Signal<Translator>;
export function injectMessages<F extends keyof SlottedMessages>(
  family: F,
  override?: Signal<Partial<SlottedMessages[F]> | undefined>,
): FamilyTranslator<SlottedMessages[F]>;
```

`injectMessages` devolve uma função que lê o signal do locale na chamada. Uma expressão de template que a invoca reavalia quando o locale muda, sem recriar o componente.

`provideSlotted` também pode ser declarado nos `providers` de um componente, e vale para a subárvore.

Consumo numa família:

```ts
protected readonly t = injectMessages('table', this.messages);
```

```html
<button [attr.aria-label]="t('selectRow')"></button>
<span>{{ t('groupCount', { count: count() }) }}</span>
```

### 4.4 Sobreposição por instância

Cada família com texto de cromo expõe um input/prop `messages`, do tipo `Partial<FamilyMessages>`. Substitui chave a chave sobre o catálogo negociado, pela regra do D10.

### 4.5 Aplicação

```ts
provideSlotted({ locale: this.locale, catalogs: { 'pt-BR': PT_BR } });
```

```tsx
<SlottedProvider locale={locale} catalogs={{ 'pt-BR': PT_BR }}>
```

Delegando a um i18n existente:

```ts
provideSlotted({ locale, resolve: (path, slots) => translate.instant(path, slots) });
```

`path` é `<família>.<chave>`, com a chave aninhada separada por ponto (`dataGrid.filterOperators.contains`).

## 5. Gramática de mensagem

- `{nome}` é substituído pelo slot com esse nome. Um slot ausente deixa o marcador intacto.
- `{nome, plural, =N {…} zero {…} one {…} two {…} few {…} many {…} other {…}}`: o ramo `=N` exato é lido primeiro; depois a categoria de `Intl.PluralRules(locale).select(valor)`; depois `other`. Dentro do ramo, `#` rende o valor formatado por D6.
- `{nome, select, chave {…} other {…}}`: o ramo cuja chave é igual ao slot `string`; sem igualdade, `other`.
- Um ramo pode conter slots simples `{nome}`. Um ramo não contém `plural` nem `select`.
- `'{'`, `'}'` e `'#'` rendem o carácter literal; `''` rende `'`. Um apóstrofo noutra posição é texto.
- Um slot `number` é formatado por `Intl.NumberFormat` no locale negociado; um slot `string` passa intacto.

Os casos de teste atuais de `formatRatingMessage` e `formatScrollerMessage` passam sem alteração sobre `formatMessage`.

## 6. Estrutura de ficheiros

```
packages/core/src/i18n/
  index.ts              contrato público do módulo
  types.ts              Message, MessageFn, SlottedMessages, Catalog, PartialCatalog
  format.ts             formatMessage(): gramática de §5
  negotiate.ts          negotiateLocale(), lookup RFC 4647
  translator.ts         createTranslator()
  messages/<família>.ts uma interface por família
  locales/en-US.ts      EN_US: Catalog
  locales/pt-BR.ts      PT_BR: Catalog

packages/react/src/i18n/     SlottedProvider, useLocale, useTranslator, useMessages
packages/angular/i18n/src/   provideSlotted, injectLocale, injectTranslator, injectMessages
```

Entradas de build e `exports`:

| Especificador | Conteúdo |
| --- | --- |
| `@slotted/core/i18n` | motor, tipos e `EN_US` |
| `@slotted/core/i18n/pt-BR` | `PT_BR` |
| `@slotted/react/i18n` | provider e hooks |
| `@slotted/angular/i18n` | provider e funções de injeção |

`packages/angular/i18n/` recebe `ng-package.json` como qualquer entrada secundária. `packages/core/vite.config.ts` e `packages/react/vite.config.ts` recebem as entradas correspondentes, e os `exports` dos respetivos `package.json` os caminhos acima.

## 7. Trava de conformidade

`scripts/verify-i18n.mjs`, com `scripts/verify-i18n.test.mjs`, ligado a `pnpm test:i18n` e incluído em `pnpm check`.

1. **Nenhum texto fora do catálogo.** Sobre o código de runtime dos dois bindings, falha quando encontra um literal de texto atribuído a `aria-label`, `aria-description`, `aria-roledescription`, `aria-valuetext`, `title`, `placeholder`, `alt`, a uma chave terminada em `Label`, `Text`, `Message`, `Title`, `Placeholder` ou `Hint`, ou emitido como nó de texto. Exclui `throw new Error`, ficheiros `*-demo` e literais de atributo técnico (`data-*`, `role`, seletores).
2. **Paridade de chaves.** Todo catálogo publicado tem exatamente as chaves de `EN_US`.
3. **Paridade de slots.** Para cada chave, o conjunto de nomes de slot é igual ao de `EN_US`, incluindo os nomes dentro de `plural` e `select`. Uma tradução que perca `{count}` falha.
4. **Gramática.** Toda string de todo catálogo publicado é aceite por `formatMessage` sem chaveta desemparelhada.
5. **Paridade de contrato.** Para cada família com bloco `messages` em `specs/components/*/contract.json`, a lista de chaves é igual às chaves de `EN_US` dessa família.

Os pontos 1 e 2 são também cobertos pelos tipos; o teste existe porque uma tradução é dados e pode ser escrita fora do TypeScript.

## 8. Superfícies de verificação

- **Storybook.** `tools/storybook-workbench/src/globals.tsx` ganha um eixo `locale` com `['en-US', 'pt-BR']`, à imagem do eixo `direction` existente, e o decorador dos dois storybooks envolve a story no provider. Toda família passa a ser revista nos dois idiomas sem código de story.
- **Demo Nexora.** Em `app.config.ts`, os cinco `provide*Defaults` que só passam texto (`app-shell`, `side-navigation`, `top-navigation`, `page`, `page-header`) e `provideNotificationCenterMessages` dão lugar a `provideSlotted`; `provideSkeletonDefaults` perde `label`. Um seletor de idioma no shell, persistido, com `<html lang>` a acompanhar. Um cenário determinista de browser troca o idioma e assere texto de `data-grid`, `filter-bar` e `pagination` nos dois idiomas, sem recarregar.
- **React.** Um teste que renderiza dois `SlottedProvider` aninhados com locales diferentes e assere os dois textos no mesmo render.
- **Angular.** Um teste que altera o signal de locale e assere o texto renderizado sem recriar o componente.

## 9. Fora de âmbito

- Locales além de `en-US` e `pt-BR`. O motor, a trava de paridade e os tipos aceitam qualquer um; traduzir é trabalho de conteúdo.
- Carregamento assíncrono de catálogo dentro da biblioteca (D9).
- `dir` e `lang` do documento (D13).
- Tradução do texto próprio das páginas da demo Nexora. A demo troca o texto da biblioteca; o texto das páginas permanece em inglês.
- Formatação de moeda por locale: o código de moeda é dado do domínio, não do locale, e `packages/core/src/currency` permanece como está.
- Formatação de data e hora: cada família de data mantém o seu formatador; D11 só lhe muda a fonte do `locale`.
