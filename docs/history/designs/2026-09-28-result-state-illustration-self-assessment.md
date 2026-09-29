# Autoavaliação — result-state, eixo `illustration`

Passo 13 de `/component` para a reabertura descrita em `2026-09-25-result-state-reui-dossier.md`. Cobre o que esta reabertura mudou; o resto da família mantém a avaliação de `2026-09-04-result-state-self-assessment.md`.

## Onze dimensões

| Dimensão | Estado, com evidência | Mudança que mais a melhoraria | Feita |
| -------- | --------------------- | ----------------------------- | ----- |
| Ícones | O glifo é o `Glyph` do consumidor em `media` (`<Icon><Glyph name="bell" /></Icon>`, `<span slIcon slResultStateMedia><svg slGlyph name="bell">`). A folha pinta molduras, camadas e linhas, nenhum ícone; `glyph-element.test.mjs` passa. | Um glifo `user-plus` na fundação, para o caso de convite que o ReUI desenha em `empty-state-9`. | Não: pertence a `glyph`, e `bell`, `inbox`, `file-text`, `search` cobrem os cenários desta página. |
| Movimento | Entrada com `live ≠ off`: raiz por `opacity` (`--slotted-duration-short`, `--slotted-easing-enter`); camadas e cartões abrem da frente (`--slotted-duration-long`); o segundo cartão atrasa `--slotted-duration-short`; o mosaico parte de `scale: 0.96`. Saída por `[hidden]` com `--slotted-easing-exit` e `allow-discrete`. O tema recolhe as durações sob movimento reduzido (`render-theme.mjs:148`). | Observar a entrada numa captura determinística em vez de só ao vivo. | Não: `shoot.mjs` captura o estado final; a entrada é lida ao vivo, recarregando o harness. |
| Responsividade | 240, 420 e 720 px lidos: os cartões (208 px) cabem a 240 com a região; a pilha e o mosaico não mudam de largura; `inline` não desenha ilustração. | Encolher os cartões abaixo de 240 px de contentor. | Não: `max-inline-size: 100%` já impede o transbordo; abaixo de 208 px as linhas continuam dentro do cartão. |
| Refinamento | Todas as molduras têm píxeis inteiros nas três densidades (specimen: 46, 42, 208×62; pseudo 38, 42, 62). Linhas com pontas redondas; tinta da segunda linha opaca, sem conta nas junções. Pilha espelhada em rtl. | Afinar a legibilidade das camadas de trás da pilha em dark, hoje discretas como no ReUI. | Não: a discrição é a do ReUI e o escuro lê três camadas na captura `dark-420`. |
| Tokens | Cada comprimento vem da escala de controlo ou de espaço; cores só de papéis neutros (`surface-raised`, `surface-sunken`, `border-subtle`, `border-strong`, `text-muted`); literais (26°, 0.9, 0.36, 0.3, 0.325, 0.145, 0.37, 0.28, 0.96, −0.01em) com a razão junto da regra. `result-state.tokens.json` sincronizado. | Um token público para o tamanho da ilustração, separado de `--slotted-result-state-media-size`. | Não: `--_art` segue a escala de controlo e a densidade; um token novo espera por um pedido que o justifique. |
| Padrões | Sem padrão APG para a família (inventário de 2026-09-03). R5, faixa 3, admite a ilustração desenhada para o espaço; nenhum desenho usa tom. | — | — |
| Acessibilidade | `media` e tudo o que contém ficam `aria-hidden`; a região viva continua a ser `content`; foco inalterado. Sob cores forçadas, `forced-color-adjust: none` mantém o mapeamento do tema para cores do sistema, e a captura `high-contrast` lê as três molduras. | Uma captura `--forced-colors active` no specimen. | Não: o specimen não foi corrido com esse eixo; a leitura é a de `high-contrast`, que usa os mesmos papéis. |
| API nativa | `illustration` é uma prop e um input como `reach` e `align`; `media` continua a ser o nó do consumidor. | — | — |
| Capacidade | Três desenhos do ReUI (dossiê § 6) passam a uma prop, sem componente de ilustração nem SVG no consumidor. | Uma variante de `cards` que desce para `no-results`, como `empty-state-2`. | Não: acrescentaria um par estado–desenho que `statusPaints: nothing` recusa. |
| Integração no ecossistema | `ResultStateDefaultsProvider` e `provideResultStateDefaults` aceitam `illustration`; um ecrã inteiro escolhe o desenho uma vez. | — | — |
| Documentação | Cenário `illustration` nas duas páginas, com quatro cenas e snippet; linha `illustration` nas tabelas; frases desatualizadas corrigidas (marca por estado de antes de RS1, "animates nothing"). | Ler as duas páginas renderizadas a 1280 e 720 px. | Não: nenhum Storybook responde em 6006 nem 6007, e o passo proíbe arrancá-los. |

## Secção 18

- **Anatomia:** sete partes, inalteradas. `media` recebe o glifo à volta do qual o desenho é feito.
- **Controlado e não controlado:** não se aplica; a família não guarda nenhum valor mutável e o contrato não declara `stateModel`.
- **Matriz de estados:** `default` e `focus-visible`, inalterados. A ilustração não tem hover nem press: é decorativa e está escondida dos leitores de ecrã.
- **Densidade e direção:** o desenho mede a partir de `--slotted-control-height-lg` e aperta com a densidade; o texto mantém o tamanho. Em rtl a pilha inclina para o outro lado e as linhas dos cartões correm a partir da direita.
- **Carregamento, vazio, erro e conteúdo extremo:** o carregamento continua em `skeleton`. Uma região `cards` sem glifo desenha só as linhas. Um título longo quebra por `overflow-wrap: break-word`, sem efeito no desenho.
