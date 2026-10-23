# Marcas de status desenhadas por grade: inline-message e status-indicator

Entrada: spec de correção do Claude Design (referência, não código). Decisões do revisor em 2026-10-23:

- Marca do inline-message e do glifo do status-indicator: `round(nearest, 1em, 2px)` (R5 mantida), 12px em `sm`, 14px em `md` e `lg`.
- Sem variante `badge` no status-indicator: a pílula com ponto é da família `badge`.
- O losango de aviso substitui o triângulo em todas as famílias que desenham marca de status: inline-message, status-indicator, alert, toast, dialog.
- Os seis status do status-indicator ficam; cada um é redesenhado nas grades novas.

## Decisões de implementação

- Os glifos de status são desenhados à mão em grades 12, 14 e 16, sólidos (forma cheia, símbolo recortado por `<mask>`), em `packages/core/src/glyph/status-glyphs.ts`. O elemento `Glyph` de cada binding os desenha como `<svg>`; a regra de `glyph-element.test.mjs` (nenhuma máscara de CSS) continua valendo.
- O `Glyph` de status leva as três grades como `<svg data-grid>` aninhados; `icon.css` mostra a grade cujo tamanho é o da caixa por container query. Abaixo de 1dppx mostra a de 12.
- O eixo da marca é `0.5cap` acima da linha de base, a forma que `[data-ui-icon]` já usa.
- Altura de linha: `round(up, 1em * token, 2px)`.

## Tarefas

1. Fundação: `status-glyphs.ts`, `Glyph` React e Angular, `icon.css`, testes.
2. inline-message: CSS (marca inline na 1ª linha, recuo pendurado, `text-box`), contrato, bindings, testes, harness.
3. status-indicator: CSS (marca inline, rótulo `inline-block` com `baseline-source: first`), parte `detail`, contrato, bindings, testes, harness.
4. alert, toast, dialog: mapa de glifos de status.
5. Stories, docs, `pnpm check:affected`, capturas do harness.
