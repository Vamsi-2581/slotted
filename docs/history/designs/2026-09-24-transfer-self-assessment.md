# `transfer` — autoavaliação

Data: 2026-09-24. Lê-se ao lado de `2026-09-24-transfer-design.md`. Evidência: contrato e
teste em `specs/components/transfer/`, `packages/core/src/transfer/transfer.test.ts`,
`packages/react/src/transfer/transfer.test.tsx`, `packages/angular/transfer/src/transfer.spec.ts`,
capturas do harness em `/tmp/claude-1000/-home-dreco-dev-slotted/fd08a677-743b-4e6e-81f9-eb3551d08136/scratchpad/tr/`
e o cenário de navegador em `…/scratchpad/scenario/drive.mjs`.

## 1. Rubrica

| Dimensão               | Estado                                                                                                                                                                                                                                                                  | Mudança que mais melhoraria                                                                                                  | Feita                                                                                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icons                  | Chevron e duplo chevron por máscara no slot do botão; espelhados para a origem e em RTL (captura rtl 720); lupa, inbox e search-x; `forced-color-adjust: none` nas quatro máscaras.                                                                                   | Um glifo de seta para cima em vez do chevron girado em Up/Down.                                                               | Não: o chevron girado é a mesma marca que `move-to-*` usa, e um glifo novo pede justificação de escala.                                                                     |
| Motion                 | O quadro do painel faz transição de borda e sombra ao virar alvo de largada (duração do tema); a troca de etapas é instantânea, porque a troca de painel é navegação e não movimento que o olho segue.                                                                    | Transição de opacidade na opção carregada.                                                                                    | Não: a opção fantasma aparece no início de um gesto; uma transição de 120 ms atrasa a leitura do que foi pego.                                                              |
| Responsiveness         | Container `transfer`; colunas a partir de 36rem, etapas abaixo; `layout` fixa a resposta. Capturas 240, 420 e 720.                                                                                                                                                       | Nas etapas, as ações do destino ficam acima da lista e as da origem abaixo.                                                    | Não: mover as duas para o mesmo lado tira a ordem de Tab da ordem visual (registado no design §4.3).                                                                        |
| Refinement             | A caixa de selecionar todos fica centrada sobre a coluna de marcas do listbox; o título alinha com os rótulos; listas de altura fixa mantêm os painéis nivelados; o botão que esvazia a própria seleção fica focável.                                                    | O intervalo entre caixa e título em denso: o anel de foco tocava no título.                                                   | Sim: `column-gap: var(--slotted-space-4)` no cabeçalho, capturado em denso com foco.                                                                                       |
| Tokens                 | Um token de componente com literal registado (`--slotted-transfer-pane-min-inline-size: 13rem`); tudo o mais lê a fundação; `transfer.tokens.json` é a lista exata.                                                                                                     | Expor o intervalo entre painéis como token.                                                                                   | Não: é `--slotted-space-5`, e um tema que o quisesse mudar mudaria a escala.                                                                                               |
| Patterns               | Exemplo APG de listbox reordenável, item a item (design §2): Enter adiciona, Delete remove, Alt+setas reordena com o foco na opção, `aria-keyshortcuts`, live region; foco depois de mover na primeira opção seguinte habilitada. Duas partidas escritas com custo.      | Um toolbar de uma só paragem para as ações, como no exemplo 1 do APG.                                                         | Não: partida registada; seis botões atrás de setas esconderiam o caminho do ponteiro.                                                                                      |
| Accessibility          | Painéis e listas nomeados pelo título; `aria-disabled` nos botões sem nada para mover; anúncio de cada movimento; lista esvaziada passa o foco à outra. Cenário de navegador confirma foco depois de Enter, Delete e Alt+ArrowUp.                                       | A lista de destino ficava sem paragem de Tab quando a opção ativa controlada saía dela.                                        | Sim: a opção ativa passada a cada lista é descartada quando a lista já não a mostra; verificado no navegador.                                                              |
| Native API             | React: props nativas e `ref` na raiz, `render` recebe `ref`, `handleRef`. Angular: host é a raiz, `role` escrito pelo consumidor vence, `exportAs`, métodos `focus`/`scrollToKey`.                                                                                       | O nome da caixa em Angular é escrito no `input` por DOM, porque `slCheckbox` não aceita um nome.                              | Não nesta família: pede um input `ariaLabel` em `slCheckbox` (outra família, levado ao gate).                                                                              |
| Capability             | Tabela de §1.2 do design: todas as linhas `adopt`/`adapt` entregues; recusas com dono. Quatro modelos de estado com par controlado/não controlado e razões.                                                                                                             | Seleção por grupos (secções) nos painéis.                                                                                    | Não: nenhuma implementação inspecionada a oferece numa lista dupla; `listbox` já tem `sections` e a porta fica aberta.                                                     |
| Ecosystem integration  | React: provider, `useId`, sem medição no render, handlers compostos. Angular: `model()` + pedidos com razão, `ControlValueAccessor` + `Validator`, `provideTransferDefaults`, `DestroyRef`, signals. Assimetria: React lê o `field` à volta; Angular usa forms.          | O Angular não lê um `slField` à volta.                                                                                        | Não: `slListbox` também não lê; o caminho Angular de um campo é o `ControlValueAccessor`.                                                                                  |
| Documentation          | Duas páginas com os 14 cenários, API, eventos, composição e acessibilidade; testes de página passam. Nenhum Storybook responde em 6006/6007, então as páginas não foram lidas renderizadas nem medidas com `audit.mjs`.                                                   | Ler as duas páginas renderizadas a 1280 e 720, claro e escuro, e correr `audit.mjs`.                                          | Não: exige os Storybooks, que não estão a correr (levado ao gate).                                                                                                          |

## 2. Secção 18

1. **Propósito:** mover itens entre disponíveis e escolhidos. **Antiuso:** poucas escolhas —
   `checkbox-group` ou `multi-select`.
2. **Anatomia:** 22 partes, contrato `members.transfer.parts`.
3. **Controlado e não controlado:** `targetKeys`, `selectedKeys`, `sourceQuery`/`targetQuery`,
   `pane`; o pedido de movimento leva `direction` e `keys`. Razão da forma: o âmbito nomeia
   `targetKeys` e `selectedKeys`; a seleção é um conjunto porque cada chave está num lado.
4. **Estados:** `current` (painel), `disabled`, `readonly`, `invalid`, `required`, `loading`,
   `dragging`, `drop-target`; `disabled` vence os restantes; `readonly` deixa a seleção e recusa
   movimentos.
5. **Teclado, foco, ARIA:** contrato `keyboard`; testes nas duas ligações e cenário de navegador.
   **Toque:** arraste por ponteiro com atraso de toque do módulo `drag`; os botões cobrem o
   toque sem arraste. **Leitor de ecrã:** não verificado nesta máquina.
6. **Tamanho e densidade:** `size` sm/md/lg; densidade pela geometria de controlo (captura
   dense).
7. **Responsivo, RTL, locale, reduced motion:** etapas abaixo de 36rem; chevrons e
   Ctrl+setas espelhados; busca com `Intl.Collator`; nenhuma animação em loop.
8. **Loading, empty, error, disabled, extremo:** `loading`/`hasMore`; vazio e sem
   resultados com marca; `invalid`; `disabled`; rótulo sem espaços quebra, título traduzido
   quebra, chave sem item mostrada com `data-unresolved`.
9. **SSR e performance:** ids por `useId`; container query em CSS; `virtual` com `itemSize`
   em ambas as listas.
10. **Exemplos:** 14 cenários por página, domínio de uma equipa de projeto.
11. **Testes partilhados:** mesma lista de comportamentos em `transfer.test.tsx` e
    `transfer.spec.ts`; aritmética única em `@slotted/core/transfer`.
12. **Changelog e migração:** família nova; não há consumidor a migrar.
