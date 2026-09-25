# `wizard` — autoavaliação

Data: 2026-09-25. Desenho em `docs/history/designs/2026-09-25-wizard-design.md`, contrato em
`specs/components/wizard/contract.json`.

## 1. Rubrica

| Dimensão | Estado | Mudança que mais a melhora | Feita |
| --- | --- | --- | --- |
| Ícones | O único glifo próprio é o chevron do botão de progresso compacto (`chevron-down` pelo `Glyph`), que roda meia volta ao abrir. As marcas de etapa são do `stepper`. | Um glifo de rascunho guardado ao lado de `draft-status`. | Não: o texto já diz a hora e um glifo a mais é ruído num grupo de ações. |
| Motion | Roda do chevron (`duration-short`), espessura e cor dos segmentos (`duration-medium`), borda do botão compacto; os tokens colapsam em `prefers-reduced-motion`. A troca de etapa não anima: o foco no título é a mudança que o leitor segue. | Transição da altura da lista compacta ao abrir. | Não: exigiria animar `display`; a lista entra no fluxo e o foco não se move. |
| Responsividade | Contentor `slotted-wizard`, classe compacta `< 600px`: progresso recolhido, ações empilhadas, posição do título só no texto. Capturas a 240, 420 e 720; salas `laptop` e `phone` nas páginas. | Classe expandida (`>= 1024px`) com coluna de progresso mais larga. | Não: 14rem cabe nos rótulos medidos; a coluna fica declarada em token. |
| Refinamento | Alinhamento óptico do primeiro `ghost`, estado do rascunho na linha de base das etiquetas, segmentos em duas espessuras, anel de foco inteiro em `scroll="self"` (defeito visto na revisão), conector do `stepper` simétrico (commit `a32bae48`). | Linha das ações em `scroll="self"` alinhada à coluna dos campos (hoje passa 4 px de cada lado, pela margem do anel). | Não. |
| Tokens | 12 tokens de componente com fallback para a fundação; um literal registado (`--slotted-wizard-progress-inline-size`, 14rem); sem durações literais (`motion.test.mjs`). | Token de componente para a espessura do segmento. | Não: lê `border-width-thin`, e a proporção de quatro vezes é a regra. |
| Padrões | Tutorial WAI Multi-page Forms, item a item em §2 do desenho; teclado de `stepper`; submissão implícita da plataforma. | Anunciar a mudança do total de etapas. | Não, decisão 7: o título seguinte diz a posição nova. |
| Acessibilidade | Foco no título a cada mudança de etapa, no `alert` numa falha, em `complete` no sucesso; `aria-busy` no restauro; `draft-status` polite; etapas inalcançáveis com `aria-disabled`. | Verificação com leitor de ecrã real. | Não verificável nesta máquina; verificado por árvore de acessibilidade nos testes (`getByRole`). |
| API nativa | React: props do `div` no root, `render`, `handle`, `ButtonProps` nas ações com `render` composto. Angular: `model()`, `output()` com razão, `exportAs`, `form[slForm]` do consumidor com Reactive Forms. | `render` no `form` da etapa em React. | Não: o `Form` não tem `render`, pela razão que a família `form` regista. |
| Capacidade | Inventário §1: 21 linhas de table stakes, 17 `adopt`/`adapt`, 4 `decline` com dono. Oito casos de lista que muda, decididos e testados. | `when` declarativo nas etapas. | Não: o render condicional de cada framework cobre-o (§5.6). |
| Integração | Tabelas de §9 respondidas. Assimetria registada: em Angular o `form` é do consumidor; cancelar e guardar rascunho aparecem por `cancellable`/`draftable`, porque um `output` não diz se tem ouvintes. | Um `ControlValueAccessor` no assistente inteiro. | Não: o assistente contém formulários, não é um controlo de um. |
| Documentação | Duas páginas com 15 cenas cada, auditoria React limpa a 1280 e 620. | Página Angular lida renderizada. | Não: o Storybook Angular precisa de reinício para compilar o ficheiro de stories novo (§3). |

## 2. Critérios de pronto (guia §18)

- **Anatomia:** 29 partes, §3 do desenho.
- **Controlado e não controlado:** `step`, `value`, `progressOpen`, cada um com pedido e razão;
  o ciclo de envio não é modelo, porque é a resposta a um pedido da família.
- **Matriz de estados:** raiz `loading` (envio, restauro), `invalid` (erro), `complete`,
  `disabled`; `open` no progresso; `current`, `complete`, `invalid`, `disabled`, `loading` nos
  itens do `stepper`; `data-complete`, `data-current`, `data-invalid` nos segmentos.
- **Densidade e direção:** capturas `dense` e `rtl`; o espaçamento entre regiões é fixo, os
  controlos encolhem.
- **Carregamento, vazio, erro, conteúdo extremo:** restauro com esqueleto e `delay`/`minDuration`;
  zero etapas lança; erro global e erro por etapa vindo do servidor; sete etapas em alemão.

## 3. Evidência e limites

- Testes: core 36, React 34 (e a suíte React inteira sem falhas do `wizard`), Angular 23,
  contrato 14, estilos 6.
- Defeito de lógica encontrado na revisão: o destino depois de aceitar uma etapa era calculado
  antes de o consumidor renderizar a lista nova, e uma etapa aberta pela resposta era saltada.
  O restauro tinha o mesmo defeito. Os dois foram corrigidos com testes do caminho real, e os
  testes Angular foram vistos a falhar sem a correção.
- O `verify` de Angular não corre: `packages/angular/dashboard-grid` e
  `packages/core/src/dashboard-grid`, de outra sessão, não compilam. As specs do `wizard` foram
  compiladas à parte com um tsconfig temporário, já apagado.
- As páginas usam `.slotted-demo-viewport[data-size="content"]`, primitiva do workbench ainda
  por commitar pela sessão de `dashboard-grid`.
