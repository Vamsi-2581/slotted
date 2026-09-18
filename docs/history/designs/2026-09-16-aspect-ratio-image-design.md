# Aspect ratio e Image — desenho

Inventário: `2026-09-16-aspect-ratio-image-capability-inventory.md`. O que se
decide aqui sobrevive às duas famílias: a anatomia que `avatar` e `upload` vão
ler quando forem reabertos, a regra de crescimento da moldura e o par
`renderImage`/`img[slImageMedia]` que qualquer família com uma picture herda.

## 1. Padrão

O WAI-ARIA APG não tem padrão para nenhuma das duas
(<https://www.w3.org/WAI/ARIA/apg/patterns/>, lido em 2026-09-16). A orientação
aplicável é a árvore de decisão do `alt`
(<https://www.w3.org/WAI/tutorials/images/decision-tree/>): uma imagem
informativa tem `alt` que diz o que ela mostra; uma decorativa tem `alt=""`;
uma funcional (dentro de um link ou botão) tem `alt` que diz a função; uma
legenda não se repete no `alt`. Nenhum teclado, nenhum `aria-*`, nenhum foco:
o `<img>` é o elemento com papel e a família não lhe acrescenta outro.

| Exigência                                             | Onde                                                                                             | Estado    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- |
| `alt` presente em toda a picture                      | `alt: string` obrigatório nos dois tipos; `""` é decorativa                                      | passa     |
| O nome acessível não muda com o estado de carregamento | o `<img>` nunca sai do DOM; placeholder e fallback são `aria-hidden` ou vazios                   | passa     |
| Uma picture funcional tem `alt` funcional              | `render` para `<a>`/`<button>`; a página diz que o `alt` passa a nomear a ação                   | passa     |
| Legenda fora do `alt`                                  | `<figure>` + `<figcaption>` é composição do consumidor; a página mostra-a                        | passa     |
| Placeholder desfocado não é anunciado                 | o `<img>` do placeholder leva `alt=""` e `aria-hidden="true"`                                    | passa     |
| Fallback com conteúdo interativo é anunciado          | a parte `fallback` não leva `aria-hidden`; o glifo padrão é `::before` sobre `:empty`             | passa     |
| `aspect-ratio` não tem papel                          | um `div`, sem `role`; o conteúdo é do consumidor                                                 | passa     |

Nenhum departure.

## 2. Anatomia

### `aspect-ratio`

```html
<div data-ui="aspect-ratio" data-part="root" data-ratio="video">
  <iframe …></iframe>
</div>
```

- `root`, `div`, sempre presente. `data-ratio` é uma das cinco nomeadas ou
  `custom`; `custom` lê `--slotted-aspect-ratio` escrito na instância como
  `w / h`.
- Uma grelha de uma célula: cada filho ocupa `grid-area: 1 / 1` e estica.
  Um filho substituído (`img`, `video`, `canvas`, `svg`, `iframe`, `picture`)
  recebe `inline-size`/`block-size: 100%`; `img` e `video` recebem
  `object-fit: contain`. A moldura reserva; não corta.
- A caixa cresce quando o conteúdo é mais alto do que a razão. É o mínimo
  automático que css-sizing-4 dá a uma caixa com `aspect-ratio`, e a família
  não o anula: nada é cortado e nada sai por cima do que vem a seguir.
- Nenhum estado além de `default`. Nenhum modelo de estado. Nenhum provider de
  defaults: a razão é obrigatória e é da instância.

### `image`

```html
<div data-ui="image" data-part="root" data-layout="fill" data-fit="cover"
     data-position="center" data-radius="md" data-placeholder="surface"
     data-status="loading">
  <div data-ui="aspect-ratio" data-part="root" data-ratio="landscape">
    <picture data-part="picture">
      <source type="image/avif" srcset="…" />
      <img data-part="image" src="…" srcset="…" sizes="…" alt="…" loading="lazy" decoding="async" />
    </picture>
    <span data-part="placeholder" aria-hidden="true"></span>
    <span data-part="fallback"></span>
  </div>
</div>
```

- `root`, `div`, sempre presente. `render` (React) e `[slImage]` no elemento
  do consumidor (Angular) trocam o elemento: `figure`, `a`, `button`, `li`.
  `className` e `style` chegam à raiz; os atributos nativos do `<img>` chegam
  ao `<img>`, como `text-field` faz com o seu `input`.
- A raiz de `aspect-ratio` só existe quando `ratio` foi dado. Sem ela, as
  três camadas ficam diretamente na raiz de `image`, que é a mesma grelha de
  uma célula.
- `picture`, `<picture>`, só com `sources`. Um `<source>` por entrada, na
  ordem dada; o `<img>` é o último filho, como a plataforma exige.
- `image`, `<img>`, sempre presente. `opacity: 0` até `loaded`; `object-fit`
  e `object-position` vêm de `data-fit` e `data-position` da raiz.
- `placeholder`, `<span aria-hidden="true">`, sempre presente e pintado só
  em `loading` (e `idle`). `surface` é o chão `surface-sunken`; `blur` põe
  dentro um `<img alt="" src=placeholderSrc>` desfocado com o mesmo
  `fit`/`position`; `none` não pinta. Conteúdo projetado pelo consumidor
  desenha-se em cima do chão.
- `fallback`, `<span>`, sempre presente e pintado só em `error`. Vazio,
  `::before` desenha o glifo `--slotted-icon-image-off` sobre
  `surface-sunken`. Conteúdo projetado substitui o glifo.
- Camadas na ordem `picture`/`image`, `placeholder`, `fallback`: a última
  pinta por cima, o que dispensa `z-index`.

## 3. Estado

`status: idle | loading | loaded | error`, um eixo e não um estado do
vocabulário partilhado, pela razão que `avatar` regista: `data-loaded` é um
booleano e não diz se a picture falhou, está a caminho ou nunca foi pedida.

Derivação, igual nos dois bindings:

1. Sem `src` (e sem `<img>` projetado): `idle`.
2. Com `src`: `loading`, calculado durante a renderização, também quando `src`
   muda — nenhum frame mostra o estado da picture anterior.
3. `load` do `<img>`: `loaded`. Um `<img>` já completo antes do listener é
   perguntado (`complete && naturalWidth > 0`).
4. `error` do `<img>` com `fallbackSrc` ainda não tentado: o `src` passa a
   `fallbackSrc` e o estado fica `loading`. Segundo `error`, ou primeiro sem
   `fallbackSrc`: `error`.
5. Um `status` passado pelo consumidor vence a derivação e nunca dispara
   `onStatusChange`/`(statusChange)`.

Sem modelo de estado: um evento de carga é um facto, não há nada a cancelar e
nenhuma razão do vocabulário fechado o descreve.

## 4. Bindings

### React

`AspectRatio({ ratio, render, children, ...div })` — `ratio` obrigatória.

`Image` — `ImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'placeholder'>`:
`src`, `srcSet`, `sizes`, `alt`, `width`, `height`, `loading`, `decoding`,
`fetchPriority`, `crossOrigin`, `referrerPolicy`, `onLoad`, `onError` e `ref`
chegam ao `<img>`; `className` e `style` chegam à raiz. Próprios: `ratio`,
`layout`, `fit`, `position`, `radius`, `bordered`, `priority`, `placeholder`,
`placeholderSrc`, `placeholderContent`, `fallbackSrc`, `fallback`, `sources`,
`status`, `onStatusChange`, `render`, `renderImage`. `ImageDefaultsProvider`
segura `layout`, `fit`, `position`, `radius`, `bordered`, `placeholder`,
`loading`, `decoding`.

| Pergunta                                   | Resposta                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado com razão    | Não. Nenhuma das duas segura estado mutável; `status` é derivado, um `status` passado vence, e `onStatusChange` reporta um facto (§3).                                                                                                                                                                    |
| Defaults uma vez                           | `image`: `ImageDefaultsProvider` + `useImageDefaults`. `aspect-ratio`: não — o único valor é obrigatório e é da instância.                                                                                                                                                                               |
| Substituir o elemento de cada parte        | `root`: `render` nas duas. `image`: `renderImage(props)` — um `next/image` com o `ref`, `onLoad` e `onError` da família. `picture`: fixo, é o elemento da plataforma que `sources` exige. `placeholder`/`fallback`: o conteúdo é substituível (`placeholderContent`, `fallback`); o `span` é fixo porque é uma camada sem semântica. |
| O handler do consumidor continua a correr  | `onLoad`/`onError` do consumidor são compostos com os da família em `image.tsx`; `render` recebe os props e espalha-os.                                                                                                                                                                                  |
| Elemento nativo e ação imperativa          | `ref` no `<img>` (`naturalWidth`, `decode()`); a raiz por `render`. Nenhuma ação imperativa: não há nada que um prop não expresse.                                                                                                                                                                       |
| SSR sem mismatch                           | `status` inicial é função só dos props (`idle`/`loading`); nenhum layout read na renderização; nenhum `useId` porque nenhum ID é escrito.                                                                                                                                                                 |
| Cada estado estilizável no DOM             | `data-status`, `data-layout`, `data-fit`, `data-position`, `data-radius`, `data-placeholder`, `data-bordered`, `data-ratio`.                                                                                                                                                                             |
| Props de cada parte = elemento nativo      | `ImageProps` estende `ComponentPropsWithRef<'img'>`; `AspectRatioProps` estende `ComponentPropsWithRef<'div'>`; `ImageRootProps` e `ImageMediaProps` são o que `render`/`renderImage` recebem.                                                                                                             |

### Angular

`[slAspectRatio]` — componente no elemento do consumidor, `ratio =
input.required()`, `exportAs: 'slAspectRatio'`, `<ng-content>`.

`[slImage]` — componente no elemento do consumidor. Inputs: `src`, `srcset`,
`sizes`, `alt` (obrigatório), `width`, `height`, `ratio`, `layout`, `fit`,
`position`, `radius`, `bordered`, `loading`, `decoding`, `priority`,
`placeholder`, `placeholderSrc`, `fallbackSrc`, `sources`, `status`;
output `statusChange`. `img[slImageMedia]` — diretiva no `<img>` do consumidor
(`ngSrc`), com `IMAGE_MEDIA_HOST` como `avatar` faz com `AVATAR_IMAGE_HOST`.
Projeção: `img[slImageMedia]`, `[slImagePlaceholder]`, `[slImageFallback]`.

| Pergunta                                       | Resposta                                                                                                                                                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Two-way com `model()`                          | Não: nenhum valor é do consumidor. `status` é `input()` + `output()`, como `avatar`, porque um `model()` escreveria por cima do valor passado ao primeiro `load`.                                                                   |
| Reactive Forms                                 | Não: nenhuma das duas segura um valor de formulário.                                                                                                                                                                              |
| Defaults uma vez                               | `provideImageDefaults()` + `IMAGE_DEFAULTS` + `injectImageDefaults()`. `aspect-ratio`: não, pela razão dada em React.                                                                                                              |
| `exportAs`                                     | `slAspectRatio`, `slImage`, `slImageMedia`.                                                                                                                                                                                       |
| Projeção com laziness                          | `img[slImageMedia]`, `[slImagePlaceholder]`, `[slImageFallback]` por `ng-content select`. O `<img>` da família só é renderizado quando não há um projetado; `sources` é input porque `<source>` só tem sentido dentro do `<picture>` que a família escreve. |
| Zoneless e `OnPush`                            | Sinais em tudo; `linkedSignal` para o estado derivado do `src`; nenhum `markForCheck`.                                                                                                                                             |
| Teardown                                       | Listeners `(load)`/`(error)` em `host`; `afterNextRender` para o `<img>` já completo. Nada a destruir à mão.                                                                                                                       |
| Atributo estático sobrevive ao host binding    | `alt` e `loading` escritos pelo consumidor no `<img slImageMedia>` são lidos com `HostAttributeToken` antes de a diretiva escrever; `role` na raiz idem.                                                                            |
| Entry point de uma classe                      | `@slotted/angular/aspect-ratio` e `@slotted/angular/image`; `image` importa `SlAspectRatio` por `@slotted/angular/aspect-ratio`.                                                                                                   |

## 5. Composição

- `image` com `ratio` renderiza `AspectRatio`/`[slAspectRatio]` dentro da sua
  raiz; a folha de `image` não escreve `aspect-ratio`. `card` continua a
  estilizar a sua parte `media`; um `<Image>` dentro dela é um `div` que a
  regra de `card` não toca (a regra é sobre `img, video, canvas, picture,
  svg` filhos diretos). `card` lê `image` quando for reaberto; `avatar` e
  `upload` idem, como `docs/process/build-order.md` escreve.
- Zoom é `dialog`: `render={(p) => <button {...p} onClick={open} />}`.
- Legenda: `<figure><Image /><figcaption /></figure>`.

## 6. Custos

- **Nada reservado sem decisão.** Uma `image` sem `ratio` e sem
  `width`/`height` tem altura zero até a picture chegar; o placeholder é
  invisível e o fallback recebe um mínimo de `--slotted-space-12` para o
  glifo ter caixa. É o custo de não adivinhar uma razão.
- **`fill` num pai sem altura** resolve `block-size: 100%` para `auto`. A
  família não mede o pai.
- **Dois níveis de raiz** quando há `ratio`: um consumidor que seleciona
  `[data-ui='image'] > [data-part='image']` não encontra a picture; o seletor
  correto é o descendente, que é o que a folha usa.
- **Glifo novo**, `--slotted-icon-image-off` (Lucide `image-off`): um token na
  escala de glifos, com o parágrafo em `docs/token-foundation.md` e o commit
  próprio que a briefing pede. `file-image` diz "um ficheiro de imagem" e não
  "uma imagem que não chegou".
- **Sem `active`, sem `disabled`.** Uma picture não é ação momentânea; um
  estado desativado é do controlo que a contém.
