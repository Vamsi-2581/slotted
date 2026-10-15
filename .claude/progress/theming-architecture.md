# Checkpoint — Nexora: temas refeitos e secção Controls

- Ramo `review/implementation-pass-1`.
- Commits:
  - `d42e1224` feat(theme): a política de regras aceita `&` como raiz do tema num esquema, densidade ou sementes;
  - `1ce8e971` feat(nexora): temas refeitos e secção Controls.
- Spec do modelo de temas: `docs/history/designs/2026-10-01-theming-architecture-design.md`.
- ADR: `docs/decisions/0004-theming-architecture.md`.
- Guia: `docs/styling.md`.

## Estado

As frentes A, B e C do pedido estão concluídas e commitadas.

- Verificação no momento do commit:
  - specs da demo (theming, preferences e session): 10 ficheiros, 104/104;
  - `tools/theme-switch.mjs`: 1150/1150;
  - passo `SHOTS` com `PERSONA=maya-chen`: 47/47;
  - `packages/theme` › `validate-rules.test.mjs`: 36/36.
- O que ficou de fora dos commits:
  - `packages/theme` › `generated.test.mjs` "hooks.json is current" falha com o working tree atual, por causa de alterações sem commit de outras sessões em `packages/styles`. `packages/theme/src/generated/hooks.json` aparece modificado, provavelmente regenerado pelo build do `demo:refresh`, e não foi commitado.
  - `pnpm-lock.yaml`, `demos/.registry/*` e as linhas de outras sessões em `LIBRARY-FEEDBACK.md` não fazem parte destes commits.
- Achados `impeccable` não tratados (P2):
  - Precise pouco diferenciado de Standard à primeira vista;
  - scroll da navegação lateral em Corporate e Expressive a 900px de altura.

## Problemas conhecidos

- A memória do sistema chegou a nível crítico numa execução anterior. Verificar `free -m` antes de build ou cenário.
- `demo:refresh` apaga `.angular/cache`; reiniciar o `ng serve` depois.
- Pendências menores de antes:
  - switch: em forced-colors com foco, a aresta inválida fica só no thumb;
  - o anel duplo em forced-colors;
  - `invalid-edge.test`: lacunas M3, M7 e M8;
  - faltam testes de binding no color-picker e no filter-bar;
  - sementes com croma acima de 0.35;
  - custo do observer do portal;
  - o bug de `@scope` do Firefox não foi reportado upstream.

## Próxima ação exata

Nenhuma desta frente. Se o utilizador pedir os P2:
- Precise: rever `nexora-themes.ts` › `precise` (fundo, borda de cartão, densidade) contra as capturas `nexora-precise-*`;
- navegação lateral: medir as alturas de linha em Corporate e Expressive a 1440×900.
