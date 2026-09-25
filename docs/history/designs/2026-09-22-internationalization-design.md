# Internacionalização — desenho

Uma aplicação declara o idioma num ponto. Biblioteca e aplicação falam a mesma língua. A troca em runtime reflete sem recarregar, e duas subárvores da mesma página podem falar línguas diferentes.

## 1. Termos

- **locale**: etiqueta BCP-47 (`pt-BR`, `en-US`).
- **mensagem**: uma entrada de texto que a biblioteca emite.
- **catálogo**: o conjunto de mensagens de um locale, agrupado por família.
- **slot**: marcador `{nome}` dentro de uma mensagem.

## 2. Estado que este desenho substitui

Medições sobre código de runtime de `packages/react/src` e `packages/angular`, excluindo `.spec.`, `.test.`, `.stories.`, `.docs.` e ficheiros de demonstração.

| Facto | Medida |
| --- | --- |
| Famílias que emitem texto | 44 React, 41 Angular |
| Famílias com input/prop `labels` | 22 React, 22 Angular |
| Famílias com input/prop `messages` | 20 React, 17 Angular |
| Famílias com props de texto soltas (`emptyLabel`, `scrollLabel`, …) | 8 React, 7 Angular |
| Ficheiros de catálogo nomeados (`*_LABELS`, `*_MESSAGES`) | 30 |
| Chaves nesses catálogos | 539 |
| Texto fixo sem escape | `dialog` nos dois bindings (`Close`, `Full screen`) |
| Contratos em `specs/components/*/contract.json` com bloco `labels` | 8 |

As duas listas não coincidem. `badge`, `field-group`, `result-state` e `switch` expõem texto só em React; `slider` só em Angular; `table` tem em React uma prop de texto que Angular não tem. Um catálogo partilhado obriga as duas superfícies a fechar no mesmo conjunto de chaves.

Três defeitos estruturais decorrem daí.

**Duplicação entre bindings.** `packages/react/src/data-grid/data-grid-defaults.tsx` e `packages/angular/data-grid/src/data-grid-defaults.ts` declaram as mesmas 97 chaves com os mesmos textos. Os 8 contratos com bloco `labels` declaram uma terceira cópia dos mesmos textos.

**Angular não troca em runtime.** `injectDataGridDefaults()` (`packages/angular/data-grid/src/data-grid.ts:1332`) captura um objeto uma vez, e a factory do token corre uma vez por injector. Trocar idioma exige recriar o injector.

**Plural incorreto em qualquer locale.** `groupCount: '{count} rows'` rende `1 rows`. `fillLabel` (`data-grid-defaults.ts`) substitui slots por interpolação literal e não tem noção de categoria plural nem de formatação numérica.

## 3. Decisões

**D1 — Texto tem exatamente dois lugares: o catálogo raiz e a instância.**
Hoje são três (constante da família, provider da família, input da instância). O catálogo raiz é agrupado por família, o que torna o slot de texto nos providers de família redundante. Os providers de família mantêm o que é default de comportamento e de forma (`variant`, `selectionMode`, `pageSizes`, `filterDebounce`) e perdem `labels`/`messages`.

**D2 — O catálogo vive em `@slotted/core/i18n`.**
`core` já carrega lógica com forma de família (`grid`, `filter`, `upload`, `toast`, `pagination`) e já carrega texto com a forma que este desenho generaliza: `DEFAULT_DRAG_MESSAGES` em `packages/core/src/drag/messages.ts` é `string | (contexto) => string`. As constantes de texto dos dois bindings são apagadas e passam a importar daqui.

**D3 — Mensagem é `string | (slots, locale) => string`.**
A forma função é o ponto de integração com i18next, react-intl, ngx-translate e `$localize`. Precedente externo: `localeText` do MUI e `LocalizedStringFormatter` do React Aria aceitam funções.

**D4 — Plural por `Intl.PluralRules`, através de `plural()`.**
`plural({ one, other })` devolve uma função. O valor de uma mensagem é sempre `string` ou função, nunca um objeto — o que torna a regra de fusão do D8 inequívoca sem inspeção de chaves.

**D5 — Slots numéricos são formatados por `Intl.NumberFormat` no locale negociado.**
`{count}`, `{total}`, `{start}`, `{end}` saem `1.234` em pt-BR e `1,234` em en-US. Um slot já em `string` passa intacto.

**D6 — Negociação por lookup RFC 4647, com `en-US` como base.**
`pt-BR` → `pt` → `en-US`. Chave ausente resolve para a base; a chave crua nunca é renderizada. `en-US` é incluído no entrypoint `./i18n` por ser a base da resolução; os restantes locales são entrypoints próprios.

**D7 — Catálogos são síncronos.**
O provider aceita catálogos já resolvidos. Carregar um catálogo sob procura é trabalho da aplicação: importa dinamicamente, e só então troca o estado. A biblioteca não ganha estado de carregamento, e o render é determinista em SSR.

**D8 — Fusão: registos fundem, valores substituem.**
Numa sobreposição, um nível que é registo simples funde entrada a entrada (`filterOperators`); um valor de mensagem substitui por inteiro.

**D9 — Um `locale` alimenta texto e formatação.**
O provider raiz passa a alimentar o `locale` que hoje é declarado nos defaults de 24 famílias Angular e 23 React. O input por instância continua a ganhar, para o caso de uma grelha formatar noutro locale que o resto da página.

**D10 — Nome único: `messages`.**
Os catálogos contêm anúncios e frases (`sortedBy`, `editConflict`, `filterCleared`), não apenas nomes de controlo. `labels` desaparece do repositório, incluindo dos contratos.

**D11 — Direção fica fora deste contrato.**
As famílias derivam `rtl` do DOM (`packages/react/src/listbox/listbox.tsx:473`) e o CSS é lógico: 1299 `padding-inline`, 441 `inset-inline`, 395 `margin-inline`, contra 1 `margin-left`. `dir` e `lang` são do documento da aplicação. O eixo `direction` da toolbar do Storybook continua a ser onde RTL é revisto.

**D12 — O contrato de família declara chaves, não textos.**
Em `specs/components/*/contract.json`, o bloco `labels` — objeto de chave para texto inglês — passa a `messages`, uma lista ordenada de chaves. O teste da família assere que a lista é igual às chaves do catálogo `en-US` dessa família. A terceira cópia do texto desaparece e o contrato continua a fechar a superfície.

## 4. Contrato público

### 4.1 Núcleo

```ts
// @slotted/core/i18n
export type SlotValue = string | number;
export type MessageSlots = Readonly<Record<string, SlotValue>>;
export type MessageFn<S extends MessageSlots = MessageSlots> = (slots: S, locale: string) => string;
export type Message<S extends MessageSlots = MessageSlots> = string | MessageFn<S>;

export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };
/** A categoria sai de `Intl.PluralRules` sobre o slot `count`. */
export function plural(forms: PluralForms): MessageFn;

export interface SlottedMessages {
  readonly dataGrid: DataGridMessages;
  readonly filterBar: FilterBarMessages;
  readonly table: TableMessages;
  // uma entrada por família com texto
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

`SlottedProvider` aninha: o provider interno herda `catalogs` e `resolve` do externo e substitui o `locale`. Sem provider, `useLocale()` devolve `en-US` e o catálogo é `EN_US` — a biblioteca funciona sem configuração.

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

`injectMessages` devolve uma função que lê o signal do locale na chamada. Uma expressão de template que a invoca reavalia quando o locale muda, sem recriar o componente. É esta assinatura que resolve o defeito registado em §2.

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

Cada família com texto expõe um input/prop `messages`, do tipo `Partial<FamilyMessages>`. Substitui chave a chave sobre o catálogo negociado, pela regra do D8.

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

## 5. Formatação de slots

- `{nome}` é substituído pelo slot com esse nome; um slot ausente deixa o marcador intacto.
- `{{` rende `{`.
- Um slot `number` é formatado por `Intl.NumberFormat` no locale negociado; um slot `string` passa intacto.
- Numa mensagem construída por `plural()`, a categoria sai de `Intl.PluralRules(locale).select(slots.count)`; uma categoria ausente no objeto cai em `other`. Uma contagem noutro slot exige a forma função.

## 6. Estrutura de ficheiros

```
packages/core/src/i18n/
  index.ts              contrato público do módulo
  types.ts              Message, MessageFn, SlottedMessages, Catalog, PartialCatalog
  plural.ts             plural()
  format.ts             preenchimento de slots e formatação numérica
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

1. **Nenhum texto fora do catálogo.** Sobre o código de runtime dos dois bindings, falha quando encontra um literal de texto atribuído a `aria-label`, `aria-description`, `title`, `placeholder`, `alt`, a uma chave terminada em `Label`, `Text`, `Message`, `Title`, `Placeholder` ou `Hint`, ou emitido como nó de texto. Exclui `throw new Error` e literais de atributo técnico (`data-*`, `role`, seletores).
2. **Paridade de chaves.** Todo catálogo publicado tem exatamente as chaves de `EN_US`.
3. **Paridade de slots.** Para cada chave, o conjunto de nomes `{…}` é igual ao de `EN_US`. Uma tradução que perca `{count}` falha.
4. **Paridade de contrato.** Para cada família com bloco `messages` em `specs/components/*/contract.json`, a lista de chaves é igual às chaves do catálogo `en-US` dessa família.

Os pontos 1 e 2 são também cobertos pelos tipos; o teste existe porque uma tradução é dados e pode ser escrita fora do TypeScript.

## 8. Superfícies de verificação

- **Storybook.** `tools/storybook-workbench/src/globals.tsx` ganha um eixo `locale` com `['en-US', 'pt-BR']`, à imagem do eixo `direction` existente, e o decorador dos dois storybooks envolve a story no provider. Toda família passa a ser revista nos dois idiomas sem código de story.
- **Demo Nexora.** Um seletor de idioma no shell, persistido, com `<html lang>` a acompanhar. Um cenário determinista de browser troca o idioma e assere texto de `data-grid`, `filter-bar` e `pagination` nos dois idiomas, sem recarregar.
- **React.** Um teste que renderiza dois `SlottedProvider` aninhados com locales diferentes e assere os dois textos no mesmo render.
- **Angular.** Um teste que altera o signal de locale e assere o texto renderizado sem recriar o componente.

## 9. Fora de âmbito

- Locales além de `en-US` e `pt-BR`. O motor, a trava de paridade e os tipos aceitam qualquer um; traduzir é trabalho de conteúdo.
- Carregamento assíncrono de catálogo dentro da biblioteca (D7).
- `dir` e `lang` do documento (D11).
- Formatação de moeda por locale: o código de moeda é dado do domínio, não do locale, e `packages/core/src/currency` permanece como está.
