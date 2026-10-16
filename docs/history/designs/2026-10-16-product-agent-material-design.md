# Material de agente do produto — desenho

Data: 2026-10-16. Subprojeto 1 de 4 do material de IA da Slotted.

## Objetivo

O agente de quem consome `@slotted/react` ou `@slotted/angular` compõe telas e estados de espera conforme as regras da biblioteca, lendo apenas o pacote instalado.

Material de agente do produto: guidelines e skills publicadas dentro de `dist/docs` dos bindings, para o agente do consumidor. Skill de produto: procedimento com gatilho e critério de conclusão que o agente do consumidor executa sobre a própria aplicação.

## Escopo

Dentro:

- guidelines genéricas de composição de tela, migradas de `demos/nexora/guidelines/`;
- duas skills de produto: `compose-screen` e `waiting-states`;
- ativação pelo `AGENTS.snippet.md`;
- verificação estática em `pnpm check` e avaliação de eficácia manual.

Fora:

- skills de desenvolvimento em `.claude/skills/`: nenhuma alteração, nenhuma remoção, nenhuma sincronia com as skills de produto;
- instalador de skills (subprojeto condicionado ao resultado da avaliação, §6);
- exportação de design system (subprojeto 4);
- skills de tema e de revisão de tela.

## 1. Fonte, saída e migração

### Fonte

```
tools/agent-docs/content/
  guidelines/
    README.md              protocolo de leitura
    writing-rules.md       protocolo de escrita; não publicado
    ids.json               registro de todo ID emitido
    async-feedback.md      AF
    layout-alignment.md    LA
    shell-composition.md   SC
    composition.md         CP
    list-pages.md          LP
    record-pages.md        RP
    forms.md               FM
    errors-and-conflicts.md ER
    browsing.md            BR
    overviews.md           OV
  skills/
    compose-screen/SKILL.md
    waiting-states/SKILL.md
```

`tools/agent-docs/src/agents-snippet.*.md` é o precedente: texto de agente publicado tem fonte em `tools/agent-docs`.

### Saída

O build existente de `tools/agent-docs` escreve, em `packages/{react,angular}/dist/docs/`:

```
index.md               ganha as seções "Guidelines" e "Skills"
AGENTS.snippet.md      ganha a tabela tarefa → SKILL.md
guidelines/README.md
guidelines/index.md    gerado a partir dos tópicos
guidelines/<topic>.md
skills/<skill>/SKILL.md
```

Transformações do build:

- o campo `Seen in` é removido de cada regra; ele permanece na fonte como prova;
- regras com `Status: retired` saem de `index.md` e mantêm só o cabeçalho e o status no tópico;
- os caminhos citam `@slotted/react` ou `@slotted/angular` conforme o binding; o restante do texto é idêntico.

`apps/docs` serve os mesmos arquivos em `/<framework>/guidelines/*.md` e `/<framework>/skills/<skill>/SKILL.md`. `llms.txt` lista os dois grupos.

### Migração da Nexora

- Os 10 tópicos de §1 saem de `demos/nexora/guidelines/` sem cópia.
- Permanecem na demo: `ledgers.md` (LG), `conversations.md` (CV), `workspaces.md` (WS), `builders.md` (BD).
- `reading-permissions.md` (PM) é dividido regra a regra: `PM-01` e `PM-02` migram; `PM-03` permanece. O prefixo `PM` passa a pertencer ao pacote; a regra de domínio da Nexora recebe novo prefixo, com `PM-03` aposentada e remetida ao novo ID.
- Os IDs migrados não mudam.
- `demos/nexora/guidelines/index.md` passa a listar só as regras de domínio, com uma linha que remete a `node_modules/@slotted/angular/dist/docs/guidelines/index.md`.
- `demos/nexora/guidelines/writing-rules.md` é substituído por uma remissão à fonte única em `tools/agent-docs/content/guidelines/writing-rules.md`.
- Um prefixo pertence a um único local. O teste do gerador falha se a demo e o pacote declaram o mesmo prefixo.

## 2. Skills de produto

As duas skills seguem o formato SKILL.md (frontmatter `name` e `description`) e o vocabulário de `writing-rules.md`. Nenhuma contém API de binding. Famílias, partes, estados e tokens aparecem pelo nome publicado. A API de cada família fica em `../../<family>.md`.

### `waiting-states`

Origem: `.claude/skills/loading-states`, reescrita para o consumidor. A skill interna permanece intacta.

Conteúdo mantido: tabela espera → indicador; skeleton como anatomia do conteúdo; teste "nada se move"; temporização; anúncio e foco; movimento; pendente, vazio e erro como três estados; checklist de conclusão.

Conteúdo removido: referências a `demos/`, a `packages/` e ao processo do repositório.

Regras `AF-01` a `AF-07` são citadas por ID, sem repetir o texto.

### `compose-screen`

1. Classificar a tela: lista, registro, formulário, overview ou navegação em árvore.
2. Ler `guidelines/index.md`, `guidelines/composition.md` e o tópico do tipo de tela.
3. Para cada família usada, ler `<family>.md` antes de escrever (`CP-01`).
4. Compor: elementos próprios só com tokens (`CP-05`); irmãos em `inline` ou `stack` (`CP-02`).
5. Estados de espera: executar `waiting-states`.
6. Concluir: executar o `Check` de cada regra `MUST` dos tópicos lidos; listar cada desvio de `SHOULD` com o motivo.

### Ativação

`AGENTS.snippet.md` recebe uma tabela com uma linha por skill: tarefa, caminho do `SKILL.md` em `node_modules`. O snippet instrui o consumidor a colocá-lo no arquivo de instruções lido pelo seu agente: `AGENTS.md`, ou `CLAUDE.md` com `@AGENTS.md`.

## 3. Verificação estática

Os testes ficam em `tools/agent-docs` e rodam em `pnpm check` por `test:docs`.

### Referências

Todo nome entre crases nas guidelines e nas skills é resolvido:

| Forma | Fonte de resolução |
| --- | --- |
| família | `specs/components/<family>/contract.json` |
| parte | `elements` do contrato da família |
| atributo de estado | `stateAttributes` do contrato |
| valor de eixo | `axes` e `resolution` do contrato |
| token `--slotted-*` | `packages/theme/src/contract.json` e `packages/styles/src/**/*.tokens.json` |
| ID de regra | regra ativa nos tópicos publicados |
| link relativo | arquivo existente em `dist/docs` |

Um nome sem resolução falha o teste. Exceções ficam numa lista explícita no teste, com motivo por entrada.

### Forma

- Regra: frontmatter do tópico; campos na ordem de `writing-rules.md`, cada um uma vez; `Check` presente; nenhuma palavra da lista proibida; nenhum bloco de código; nenhuma API de binding.
- Skill: frontmatter `name` e `description`; `description` começa por "Use when"; corpo com no máximo 500 linhas; todo ID citado existe e está ativo.
- Índice: `guidelines/index.md` é gerado; o texto de cada regra existe só no tópico.

### Registro de IDs

`content/guidelines/ids.json` lista cada ID emitido com `level` e `status` (`active` ou `retired`). O teste falha quando:

- um ID sai do registro;
- um ID é reutilizado;
- o `level` de uma regra ativa muda;
- o registro diverge dos tópicos.

Uma mudança de significado ou de nível exige aposentar a regra e emitir um ID novo.

### Paridade entre bindings

O teste compara `dist/docs/{guidelines,skills}` de React e de Angular. A única diferença admitida é o nome do pacote nos caminhos.

### Changelog

`pnpm release` acrescenta à entrada do release um bloco "Guidelines" com os IDs adicionados, aposentados e reescritos. O bloco é derivado do diff de `ids.json` contra a tag `v*` anterior. Um release sem mudança em `ids.json` não recebe o bloco.

## 4. Nexora como consumidora

- O arquivo de instruções do agente da Nexora contém o `AGENTS.snippet.md` publicado, sem edição.
- Depois de `pnpm demo:refresh`, a demo lê guidelines e skills em `node_modules/@slotted/angular/dist/docs/`.
- Uma regra nova observada na Nexora vai para `tools/agent-docs/content/guidelines/` quando não depende do domínio, com `Seen in: Nexora · …`; vai para `demos/nexora/guidelines/` quando depende.

## 5. Avaliação de eficácia

Local: `tools/agent-docs/eval/`. Comando: `pnpm eval:agent-docs`. Fora de `pnpm check`.

- Fixture: um projeto consumidor mínimo por binding, com os tarballs de `demos/.registry/` instalados e o snippet no `CLAUDE.md`.
- Casos: 8 por binding, declarados em `cases.json`. Cada caso tem prompt, skill esperada e asserções estáticas sobre o código produzido.
- Execução: `claude -p --output-format stream-json` num diretório temporário; 3 execuções por caso; modelo fixado em `cases.json`.
- Condições: com snippet e sem snippet (linha de base).
- Métricas por skill:
  - taxa de disparo: fração das execuções com leitura do `SKILL.md` esperado nas chamadas de ferramenta;
  - taxa de conformidade: fração das asserções atendidas (famílias usadas, ausência de literais de cor e espaçamento pelo critério de `specs/demo-screen-tokens.test.mjs`, presença do estado pendente).
- Volume por rodada: 2 bindings × 8 casos × 3 execuções × 2 condições = 96 sessões. O custo em tokens é medido na primeira rodada e registrado no resultado.
- Resultado: `docs/history/evals/<AAAA-MM-DD>-agent-docs.md`, com as métricas das duas condições.
- A rodada é obrigatória antes de um release que altera `tools/agent-docs/content/`.
- Sem navegador e sem screenshots.

## 6. Limiares

| Métrica | Limiar | Consequência abaixo do limiar |
| --- | --- | --- |
| disparo | ≥ 90 % por skill | abre o subprojeto do instalador |
| conformidade | ≥ 85 % por skill | o conteúdo da skill ou das regras citadas é revisto antes do release |

## Subprojetos seguintes

2. Guidelines adicionais a partir de novas observações na Nexora.
3. Skills de produto adicionais: tema, revisão de tela.
4. Exportação de design system para Claude Design.
