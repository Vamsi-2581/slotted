# Checkpoint — arquitetura de tematização e aparência da Nexora

- Plano: `docs/history/plans/2026-10-01-theming-architecture.md` (concluído). Spec: `docs/history/designs/2026-10-01-theming-architecture-design.md`.
- Ramo `review/implementation-pass-1`. HEAD `c4a76d68`.

## Estado

O plano de tematização está concluído (tarefas 1–12, revisão final e correções). A aparência da Nexora também está concluída e revista, nos commits seguintes:

| Commit | Conteúdo |
| --- | --- |
| `a379ded7` | Implementação |
| `654f754c` | Token `--slotted-font-family-heading` no pacote |
| `80e1322b` | Literal no token de título e entrada `@slotted/theme/seeds` |
| `aa005338`, `08cf6009`, `73bdd5b0` | Correções da revisão |
| `c4a76d68` | Lockfile alinhado com os manifests |

## Testes

Num checkout limpo:
- `generate-sources.mjs --check` termina com exit 0;
- o verify de `@slotted/theme` passa (vitest 72, node 81);
- os contratos passam 2168/2168;
- `pnpm install --frozen-lockfile` passa.

Na demo:
- os specs alvo passam 31/31;
- o build passa;
- `tools/theme-switch.mjs` passa 241/241;
- o bundle inicial fica +5,9 kB acima do que tinha antes da aparência.

## Problemas conhecidos

- `test:docs` falha em `navigation-menu-angular-theming`, por causa alheia (`04c4ddea`).
- Os specs da demo com timeout de 5 s falham de forma intermitente sob carga, e já falhavam antes desta aparência.
- Ficam por decidir:
  - sementes com croma acima de 0.35 perdem a garantia de contraste;
  - o custo do observer de `style` do portal;
  - não há teste Angular de herança de overlay dentro de `SlThemeScope`;
  - `contrast` tem nomes coincidentes nas duas superfícies públicas;
  - `rankOf` ainda usa o prefixo `theme-`.

## Próxima ação

Verificação visual pelo utilizador:

```bash
pnpm_config_verify_deps_before_run=false pnpm demo:nexora
```

Abrir Preferences › Appearance. Depois, escolher a integração do ramo: merge local, push e PR, ou manter.
