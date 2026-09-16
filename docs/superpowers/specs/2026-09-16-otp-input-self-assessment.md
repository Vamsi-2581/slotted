# OTP Input — autoavaliação

Contra `.claude/skills/component/references/rubric.md` e
`docs/component-features.md` §18. Cada dimensão nomeia a mudança que mais a
melhoraria e diz se foi feita.

## As onze dimensões

| Dimensão               | Estado | A mudança que mais melhoraria                                                                                                                                                                                                                           | Feita |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| 1. Icons               | passa  | Nenhum ícone. O separador é uma régua em CSS; o ponto da máscara é o carácter que um campo de palavra-passe mostra, não um ícone. Sob `forced-colors` o input recebe `forced-color-adjust: none` (`otp-input.css`, bloco final).                              | —     |
| 2. Motion              | passa  | O cursor falso pisca no `--slotted-duration-loop` com `step-end` e pára (`animation: none`) sob reduced motion; aresta, fundo e sombra transitam no par de controlo. Melhoria: uma transição no `data-current` ao mover o cursor — recusada, o salto entre caixas é a informação. | não   |
| 3. Responsiveness      | passa  | Caixas `flex: 0 1 auto; min-inline-size: calc(altura × 0.6)` e raiz `fit-content` + `max-inline-size: 100%`: a 240 px oito caixas encolhem sem transbordar (captura `content` 240). Sem container query: a família não muda de composição, só de largura.                       | —     |
| 4. Refinement          | passa  | Anel de foco na caixa corrente; tinta de seleção só na caixa cheia; cursor `thin`; bullet da máscara dois passos acima; caixa nunca mais estreita que seis décimos da altura. O detalhe de mais uma hora: em `dense` o dígito de 14 px enche uma caixa de 26 px — o tipo não encolhe com a densidade como o do controlo. Deixado: o passo de texto é a decisão registada no desenho §2. | não   |
| 5. Tokens              | passa  | 62 tokens lidos, todos da fundação ou da família com fallback à fundação; um literal declarado (`--slotted-otp-input-caret-width`). Melhoria: `--slotted-otp-input-mask-size` como passo por tamanho em vez de um só — recusada, um ponto de 6 px lê-se igual nos três passos.       | não   |
| 6. Patterns            | passa  | Sem padrão APG; o controlo é o `textbox` nativo e a tabela de teclado é a do elemento (desenho §1). Departure registada: seleção normalizada a um carácter, com o custo em Shift+←.                                                                            | —     |
| 7. Accessibility       | passa  | Um input, um nome (`label[for]`), `aria-describedby` fundido, `aria-invalid`, `aria-required` nunca `required`, caixas `aria-hidden`; `mask` é `type="password"`. Não verificável aqui: leitor de tela real e teclado iOS; dito no gate.                        | —     |
| 8. Native API          | passa  | React: `ComponentPropsWithRef<'input'>` menos cinco; `ref` no input; handlers compostos. Angular: `HostAttributeToken` para `id`, `type`, `autocomplete`, `inputmode`, `spellcheck`, `aria-*`, `readonly`; CVA. Melhoria: `onPaste` no React composto explicitamente — passa por `nativeProps`, já compõe. | —     |
| 9. Capability          | passa  | Todas as linhas do inventário `adopt`/`adapt` entregues; três `decline` com a composição escrita; um diferenciador que ninguém pediu (`webOtp`) e outro (clique na caixa). Melhoria: `pattern` como string além de `RegExp` — recusada, uma string seria a regex do atributo nativo, que é sobre o valor inteiro. | não   |
| 10. Ecosystem          | passa  | As duas tabelas de `frameworks.md` respondidas no desenho §5. Assimetria registada: CVA no Angular, `name`/`FormData` no React. Melhoria: `Validator` no Angular para `minLength` — recusada, a validade é do form (`Validators.minLength(6)` na página).         | não   |
| 11. Documentation      | parcial | Doze cenas em cada página, todas telas reais (login Nexora, PIN de pagamento, código de recuperação, telefone RTL). React lida a 1280 claro e 720 escuro, gavetas abertas; `audit.mjs` limpo a 1280 e 620 (30 stages). Dois defeitos encontrados a olhar e corrigidos: campos em `stack` encolhiam as caixas ao mínimo (cenas passam a `block`, `form` em `Stack`) e o botão em espera esticava (numa `slotted-demo-row`). Angular **não lida renderizada**: 6007 em baixo. | sim   |

## Contra §18

1. **Propósito, casos e antiuso.** Código de verificação por SMS/app, PIN de
   autorização, código de recuperação. Antiuso: qualquer texto com mais de
   ~8 caracteres ou com espaços — é `text-field`.
2. **Anatomia.** `root`, `input`, `group`, `separator`, `slot`
   (`specs/components/otp-input/contract.json`).
3. **Contrato.** `value` / `defaultValue` / `onValueChange` com razões
   `keyboard` e `programmatic`; `onComplete` e `onRejected` são eventos, não
   estado (não há valor a controlar nem nada a cancelar).
4. **Matriz de estados.** Raiz: `disabled` > `readonly` > `invalid` > `complete`
   > `hover` > `focus-visible` > `default`; caixa: `current`. `invalid` vence a
   aresta accent de `current`; a tinta de seleção sobrevive; `disabled` e
   `readonly` retiram o cursor; hover guardado por `:not([data-disabled])`,
   `:not([data-readonly])`, `:not([data-invalid])`.
5. **Teclado, foco, ARIA, toque.** Tudo nativo do textbox; um tab stop;
   `pointerdown` na raiz mapeia a caixa; toque longo no iOS chega ao input
   (`opacity: 1`). Testes: `otp-input.test.tsx` (38), `otp-input.spec.ts`
   (26), `otp.test.ts` (14).
6. **Recipes.** `size` (3) × `variant` (2) × `attached` × `mask`, via tokens de
   controlo e de texto.
7. **Responsivo, RTL, locale, reduced motion.** §3 acima; fila LTR sempre;
   sem locale (dígitos ASCII); cursor pára.
8. **Loading, empty, error, disabled, extremo.** Vazio: caixas vazias com
   placeholder opcional; erro: `invalid` + `FieldError`; disabled: cor medida;
   extremo: `defaultValue` longo cortado, colagem com hífens filtrada e
   reportada, 8 caixas a 240 px.
9. **SSR.** Nenhuma leitura de layout no render; seleção só em efeitos; o
   `id` vem do `field`.
10. **Exemplos.** Doze cenas por binding, todas com contexto de produto.
11. **Testes partilhados.** O mesmo contrato e o mesmo motor puro nos dois
    bindings; os specs cobrem os mesmos casos.
12. **Estabilidade.** Família nova; sem quebra.

## Evidência

- Capturas: `/tmp/claude-1000/-home-dreco-dev-slotted/f8a9818c-0485-4eb0-b917-dff9e02133ed/scratchpad/shots/`
  (light/dark/high-contrast 420, light 240, dense, rtl; foco em `default`,
  `states` dark, `attached`, `in-a-field`; `content` após a máscara).
- Harness: `tools/harness/out/otp-input.html`.
- Defeito reportado ao vivo pelo revisor: com o código cheio, clicar numa caixa
  fazia aparecer o mesmo dígito à esquerda das caixas. Causa: o carácter
  selecionado do input real era pintado na tinta do `::selection` da página
  (o workbench escreve um, sem layer, que vence a regra da família em layer).
  Correção: a regra `::selection` da família passa a `!important` — o único
  na biblioteca, com a razão na folha — e o arrasto do texto selecionado é
  recusado (`dragstart` nos dois bindings, `-webkit-user-drag: none`), porque
  uma caixa cheia tem sempre um carácter selecionado. Testes nos três.
- `pnpm check`: format só falha fora da família (`docs/nexora-op-demo-domain.md`,
  `stat-card.harness.html`); lint só falha em `toggle-group` (outra sessão);
  typecheck limpo; contracts 1780/1780; layers 12/12; docs 25/25 depois de
  `otp-input-theming`.
