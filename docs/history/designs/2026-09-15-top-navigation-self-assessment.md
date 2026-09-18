# Autoavaliação — `top-navigation`

Contra `.claude/skills/component/references/rubric.md` (onze dimensões, cada
uma com a mudança que mais a melhoraria e se foi feita) e
`docs/component-features.md` §18. Capturas em
`/tmp/claude-1000/-home-dreco-dev-slotted/c50091b2-ccb4-44b7-9c62-8593f97a4faf/scratchpad/shots/`,
harness em `tools/harness/out/top-navigation.html`.

## As onze dimensões

| #   | Dimensão               | Estado | A mudança que mais melhoraria                                                                                                                                                                              | Feita                                                                                                      |
| --- | ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Ícones                 | passa  | O sino como glifo da escala (`--slotted-icon-bell`) em vez de artwork do consumidor; `forced-color-adjust: none` em cada máscara.                                                                          | sim: seis máscaras (`ellipsis`, `search`, `x`, `circle-question`, `bell`, `chevron-down`), bloco `forced-colors` |
| 2   | Motion                 | passa  | O painel a entrar de um passo acima e a sair de onde está, por transição sobre um nó que fica no DOM; o chevron a rodar na duração média; `reduced-motion` mantém o fade.                                 | sim; a procura a tomar a barra não anima, por decisão (troca de layout)                                    |
| 3   | Responsividade         | passa  | Três degraus literais no contentor nomeado, comparados pelo teste de estilo; `context` ao painel no degrau médio, porque 640 px não segura um seletor e um campo; a raiz sem `padding` para a condição `@container` e o `ResizeObserver` medirem a mesma caixa (`--_edge` nos aglomerados); a procura cede até 10rem e o nome até à elipse. | sim; custo escrito: dentro da casca a barra segura a partir de 300 (`collapseAtReason`)                    |
| 4   | Refinamento            | passa  | O contador sobre o canto do sino, fora do fluxo — o controlo mantém a largura do sino, a pílula de três cresce sobre o gap e, abaixo de 480 px, para o sino; a conta como pílula com halo de um passo de espaço em volta de um avatar `xs`; o indicador do seletor no `end` de `button`, alinhado ao texto. | sim (`q16.png`, `q18.png`, `shots/top-navigation-light-dense-ltr-420.png`)                                 |
| 5   | Tokens                 | passa  | 93 tokens lidos com recurso ao seu passo; nenhum literal fora das isenções; a moldura lê `--slotted-surface` e `--slotted-border-subtle`.                                                                  | sim (`top-navigation.tokens.json`, `tokens.test.mjs` 180/180)                                              |
| 6   | Padrões                | passa  | Transcrição do exemplo Disclosure Navigation sem as setas opcionais, e a advertência do exemplo Menubar no `patternStatus`; `Space` num link é a única partida, e é a plataforma.                          | sim (`contract.json.keyboard`, desenho §4)                                                                 |
| 7   | Acessibilidade         | passa  | Um nome para `help` nos dois sítios (os filhos são o rótulo, cortados na barra); o painel dentro da raiz para Tab entrar; `data-disabled` no item e `aria-disabled` só no link.                            | sim; o que esta máquina não verifica: leitor de ecrã real, toque real                                      |
| 8   | API nativa             | passa  | React: `render` em 17 partes, `ComponentPropsWithRef` por elemento; Angular: diretivas no elemento do consumidor, `HostAttributeToken` para `aria-label` e `aria-current`, `data-part` reescrito após `slMenuTriggerFor`. | sim                                                                                                        |
| 9   | Capacidade             | passa  | Do inventário, 12 adopt/adapt entregues, 1 defer (`nav-toggle`), 5 decline com composição escrita; três modelos de estado; `overflow` como facto com `onCollapseChange`.                                    | sim; a pendência aberta: ações extra recolhíveis (`declined.extraActions`, reabertura se pedida)             |
| 10  | Integração             | passa  | As duas tabelas de `frameworks.md` respondidas (desenho §7 e §8); o contentor nomeado como ponto de integração do consumidor (`@container slotted-top-navigation`).                                          | sim; assimetria registada: Angular sem `default*` (um `model()` é os dois lados)                            |
| 11  | Documentação           | passa  | Cada demonstração da barra numa sala de largura declarada (`.slotted-demo-room`, primitiva nova do workbench com teste) em vez da coluna de docs de 676 px, que espremia todas; página React lida a 1920 e 1280 em claro e escuro e a 720 em claro; `audit.mjs` a 1280 e 620 sem achados (36 stages). | sim; a página Angular (6007) depende do reinício do Storybook — pedido no gate                              |

## Contra a secção 18

1. **Propósito e antiuso.** A barra de uma aplicação: marca, contexto,
   destinos, procura, controlos globais. Não é o cabeçalho de uma página
   (`page-header`), não é um `toolbar`, não é um `menubar`.
2. **Anatomia.** Vinte e quatro partes em `contract.json.anatomy`; a parte
   `panel` dentro da raiz depois de `nav`.
3. **Contrato controlado/não controlado.** `value`/`defaultValue`/
   `onValueChange`, `moreOpen`/`defaultMoreOpen`/`onMoreOpenChange`,
   `searchOpen`/`defaultSearchOpen`/`onSearchOpenChange`, cada pedido com
   razão do subconjunto declarado. `overflow` não é mutável: a largura decide.
4. **Matriz de estados.** `current`, `open`, `disabled` + hover, active,
   focus-visible; precedência `disabled` > `current` > `active` > `hover` >
   `focus-visible` (`states.test.mjs`). `data-collapsed`, `data-overflow`,
   `data-search-open` como factos.
5. **Teclado, foco, ARIA.** `contract.json.keyboard`; Escape devolve o foco a
   `more` ou a `search-toggle`; landmarks `banner` e `navigation`; testes em
   `top-navigation.test.tsx` (18) e `top-navigation.spec.ts` (16).
6. **Recipes.** `size` sm/md/lg pela escala de controlo; `frame`; tokens de
   família para superfície, tinta, régua, corrente, contador, painel.
7. **Responsivo, RTL, motion.** Três degraus; tudo em propriedades lógicas
   (`shots/…-default-light-comfortable-rtl-1280.png`); `reduced-motion`.
8. **Loading, empty, error, extremo.** Sem `loading` e sem `empty` por decisão
   (`declined`); conteúdo extremo na cena `content` (nome de nove palavras
   em 1024 e em 375, contador `99+` com o atalho, RTL); contador `128` na cena
   `states`.
9. **SSR.** `useId` / fábrica de ids da aplicação; `data-collapsed`,
   `data-overflow` e `data-search-open` só depois de medir; a folha decide a
   imagem sem script.
10. **Exemplos.** Dezoito cenas por binding.
11. **Testes partilhados.** Os mesmos casos nos dois bindings: partes,
    landmark/frame na casca, nomes, corrente, desativado, três degraus, painel
    (abrir, `select`, Escape), procura (abrir, Escape, blur, fechar), omissões,
    imperativo.
12. **Quebra de contrato.** Família nova; nada quebra. `app-shell` ganha uma
    linha de reabertura pelo seletor descendente do seu `brand`.

## Fora desta máquina

- Leitor de ecrã e toque: não verificados; o que foi verificado no seu lugar
  são os atributos no DOM (testes) e o foco por teclado (harness com `--focus`).
- A página de referência Angular renderizada e o seu `audit.mjs`: pendentes do
  reinício do Storybook 6007.
