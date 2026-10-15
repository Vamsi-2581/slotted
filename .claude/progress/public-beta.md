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

## Problemas conhecidos

- Publicação recusada: `[E404] 404 Not Found - PUT https://registry.npmjs.org/@slotted%2fstyles`. Nenhum pacote publicado (`npm view @slotted/<pacote>` → E404 nos seis). `npm whoami` → `dreco`; `npm org ls slotted` → `dreco - owner`. Um 404 no PUT de um pacote novo com autenticação válida é a resposta do npm a um token sem escrita no escopo.
- Runner `ubuntu-latest` migra para Ubuntu 26 a partir de 2026-10-19.

## Próxima ação

Depois de um token com escrita em todos os pacotes do escopo `@slotted`: `cd /home/dreco/dev/slotted && pnpm -r --filter './packages/*' publish --tag beta --access public`, e conferir com `npm view @slotted/react dist-tags`.
