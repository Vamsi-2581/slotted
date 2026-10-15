# Checkpoint — preparação da beta pública

- Plano: caminho mínimo da conversa de 2026-10-14 (sem arquivo de plano). Passos: 1 integrar e CI verde; 2 manifests e READMEs; 3 publicar com tag `beta`; 4 docs das famílias usadas pela Nexora.
- `main` em `8e5a3c27` (merge do PR #1), igual a `origin/main`. Árvore limpa. O checkout local está em `main`.

## Concluído

- Passo 1: PR #1 integrado em `main`. Commits da integração: `4aab16a8` (CI num clone limpo), `ad8a0881` (specs Angular isolados), `016a3c66` (pacotes), `899882d4` (site de docs), `8700e75f` (Nexora), `6b6e597b` (docs e checkpoints).
- Passo 2: manifests e READMEs (`12ca0aff`).
- Preparação do passo 3: `rm -rf packages/*/dist && pnpm build` em `8e5a3c27`; `pnpm -r --filter './packages/*' publish --tag beta --access public --dry-run` exit 0; tarballs com `license: MIT`, README, LICENSE e sem `workspace:`; consumidor isolado React (`skipLibCheck: false`) 0 erros TS, consumidor Angular `ngc` com `strictTemplates` exit 0.

## Verificação

- CI do PR (run 38740088079): sucesso, 15m51s. CI de `main` (run 38742374500): sucesso.
- Local, árvore completa antes dos commits: `pnpm check:full` exit 0, 12/12 tarefas.

## Publicação

- 2026-10-15, a partir de `main` em `5a6940ef` (pacotes idênticos a `8e5a3c27`), pelo terminal do usuário (OTP): `@slotted/{styles,theme,core,themes,angular,react}@0.1.0-beta.0`, dist-tags `beta` e `latest` em `0.1.0-beta.0`, peers `@slotted/*` fixadas em `0.1.0-beta.0`. O registry criou `0.0.0-stage` na primeira publicação de cada pacote; a versão real ficou visível até 2 minutos depois.
- Documentação alinhada em `67f597db` (README, AGENTS, CONTRIBUTING › Publishing to npm, docs/README, build-schedule, build-briefing).

## Problemas conhecidos

- Runner `ubuntu-latest` migra para Ubuntu 26 a partir de 2026-10-19.
- `docs/history/build-log.md` termina em 2026-09-11; as sessões seguintes registaram em `.claude/progress/`.

## Próxima ação

Passo 4 do plano: páginas de docs das famílias que a Nexora usa, com a skill `docs-page`.
