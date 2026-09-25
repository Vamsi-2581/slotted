# `import-export-center` — inventário e design

Data: 2026-09-25. Família nova da onda 12 (`docs/process/build-order.md`). Compõe
`upload` (a entrada de uma importação, no slot `actions`), `progress-indicator` (a barra de
cada job), `table` (as linhas com erro), `result-state` (vazio e erro de carga), `tabs` (as
vistas), `button`, `tooltip` e `skeleton`; `toast` recebe o aviso que aponta para o job.
Módulos de core: `state`, `live-announcer`, `timeline`
(`formatTimestamp`), `upload` (`fileKind`, `splitName`, `formatBytes`, `formatDuration`) e o
módulo novo `@slotted/core/import-export-center`.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação                          | Nome                                                        | Fonte lida em 2026-09-25                                                                                                                  |
| -------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Carbon for IBM Products                | `ImportModal`, `ExportModal`                                | `packages/ibm-products/src/components/ImportModal/ImportModal.tsx` e `ExportModal/ExportModal.tsx`, ramo `main` de `carbon-design-system/ibm-products` |
| Stripe API                             | Report Run (`reporting.report_run`), File Link              | <https://docs.stripe.com/api/reporting/report_run/object>, <https://docs.stripe.com/api/file_links/object>                               |
| Salesforce Bulk API 2.0                | Ingest job, failed record results                           | <https://developer.salesforce.com/docs/atlas.en-us.api_asynch.meta/api_asynch/get_job_info.htm>, `get_job_failed_results.htm`            |
| HubSpot                                | File imports, import errors                                 | <https://knowledge.hubspot.com/import-and-export/view-and-analyze-previous-imports>, `troubleshoot-import-errors`                          |
| Flatfile                               | Job                                                         | <https://flatfile.com/docs/core-concepts/jobs>                                                                                            |
| PatternFly 6                           | Notification drawer                                         | <https://www.patternfly.org/components/notification-drawer/design-guidelines>                                                            |
| Este repositório                       | `upload`, `notification-center`, `toast`, `progress-indicator`, `table`, `result-state` | `specs/components/*/contract.json` das seis famílias                                                              |

O APG não tem padrão para um centro de jobs. A família é uma lista (`ul`/`li`) com o padrão
Disclosure (<https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/>) no controlo que abre os
detalhes de um job, o padrão Button nos controlos, o papel `progressbar` herdado de
`progress-indicator` e o critério WCAG 2.2 SC 4.1.3 (Status Messages) para as transições.

As fontes dividem-se em dois grupos. Carbon desenha o diálogo que inicia a operação e não
tem histórico; Stripe, Salesforce, HubSpot e Flatfile descrevem o job que corre no
servidor, com estado, contagens, resultado e erros. Nenhuma fonte entrega as duas metades
como componente de UI: o histórico da HubSpot é um ecrã de produto, e os outros três são
APIs.

### 1.2 Table stakes

| Capacidade                                            | Quem entrega                                                          | Veredito | Razão                                                                                                                                                                                                                        |
| ----------------------------------------------------- | --------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lista de jobs com tipo, nome e arquivo                | HubSpot, Salesforce (`object`, `operation`), Flatfile (`operation`), Stripe (`report_type`) | adopt | `jobs`, array do consumidor; cada job tem `direction` (`import` \| `export`), `title`, `format` e os arquivos `source` e `result`.                                                                                        |
| Estado do job                                         | Stripe (`pending`, `succeeded`, `failed`), Salesforce (seis estados), Flatfile (oito estados) | adapt | Cinco estados: `queued`, `running`, `succeeded`, `failed`, `canceled`. Os estados de servidor anteriores à execução (`Open`, `planning`, `scheduled`) mapeiam em `queued`; a frase de fase vai em `stage`.        |
| Conclusão parcial, separada de falha e de sucesso     | Salesforce (`Failed` com registos processados sem rollback), HubSpot (Errors por import concluído) | adopt | `succeeded` com `counts.failed > 0` ou `errorCount > 0` é o desfecho `partial`, derivado em `@slotted/core/import-export-center` e pintado como `data-outcome="partial"` na tonalidade `warning`.                 |
| Progresso determinado e indeterminado                 | Flatfile (`progress`), Salesforce (`numberRecordsProcessed`), Carbon (`loading`) | adopt | `progress: { value?, max?, unit? }`; sem `value` a barra é indeterminada. A barra é `progress-indicator` linear.                                                                                                     |
| Frase de fase                                         | Flatfile (`info`), Carbon (`loadingMessage`)                          | adopt    | `stage`, texto ao lado da palavra de estado: "Em andamento · A validar linhas".                                                                                                                                              |
| Contagens do resultado                                | HubSpot (novas, atualizadas, erros), Salesforce (`numberRecordsProcessed`, `numberRecordsFailed`) | adopt | `counts: { total, processed, created, updated, skipped, failed }`; resumo numa linha do job e lista de descrição nos detalhes.                                                                                   |
| Erros por linha                                       | HubSpot (erros por tipo e linha), Salesforce (`sf__Error` por registo), Flatfile | adopt | `errors: { row, column?, value?, message }[]` numa `table` dentro dos detalhes; `errorCount` quando o consumidor só envia uma amostra.                                                                               |
| Descarregar o resultado                               | Stripe (`result`), Carbon Export, HubSpot                             | adopt    | Controlo `download`: `a[download]` quando o arquivo tem `href`, `button` quando o consumidor gera o endereço no pedido `onDownload`.                                                                                        |
| Descarregar o relatório de erros                      | HubSpot, Salesforce (`failedResults` em CSV)                          | adopt    | `errorsFile`, com o mesmo controlo, nos detalhes.                                                                                                                                                                             |
| Descarregar o arquivo original de uma importação      | HubSpot (com permissão)                                               | adopt    | `source.href` nos detalhes.                                                                                                                                                                                                   |
| Cancelar                                              | Salesforce (`Aborted`), Flatfile (`cancelled`)                        | adopt    | `onCancel(key, request)` em `queued` e `running`; `cancelable: false` retira o controlo numa fase que o servidor não interrompe.                                                                                             |
| Repetir                                               | HubSpot (reimportar), Stripe (criar outro run), Flatfile (novo job)   | adopt    | `onRetry(key, request)` em `failed`, `canceled` e num resultado expirado; o rótulo muda para "Gerar novamente" no resultado expirado de uma exportação.                                                                       |
| Mensagem global de falha                              | Stripe (`error`), Flatfile (`outcome.message`), Carbon (`errorMessage`) | adopt  | `message`, frase sob o estado, na tonalidade do desfecho.                                                                                                                                                                     |
| Expiração do arquivo                                  | Stripe File Link (`expires_at`, `expired`)                            | adopt    | `expiresAt` em cada arquivo; antes do prazo, "Disponível até …"; depois, `data-expired`, o controlo de descarga sai e a frase diz a data.                                                                                   |
| Permissão sobre o arquivo                             | HubSpot (só quem importou ou Super Admin descarrega o original)       | adopt    | `denied` em cada arquivo: a frase do consumidor substitui o controlo de descarga.                                                                                                                                             |
| Autor e datas                                         | HubSpot (Created by, Create Date), Salesforce (`createdById`, `createdDate`, `systemModstamp`), Stripe (`created`, `succeeded_at`) | adopt | `actor`, `createdAt`, `finishedAt`, escritos por `formatTimestamp` de `@slotted/core/timeline` em `time[datetime]`.                                                               |
| Vistas por direção                                    | HubSpot (separadores de imports e exports), Salesforce (`jobType`)    | adopt    | Modelo `current`: `view` / `defaultView` / `onViewChange`; `all`, `import` e `export` embutidas, desenhadas por `tabs` só com a lista.                                                                                      |
| Histórico paginado                                    | HubSpot (tabela paginada)                                             | adapt    | `growing="none" \| "button"` com `onLoadMore` e `hasMore`, o vocabulário de `notification-center`. `scroll` recusado: um histórico de jobs é consultado, não percorrido.                                                     |
| Aviso fora do centro enquanto o job corre             | Flatfile (`mode: background`), PatternFly (drawer de notificações)    | adopt    | `jobNotice(anterior, seguinte)` em core e os adaptadores `useJobToasts` (React) e `jobToasts` (Angular): um `toast` por job, com o id do job, atualizado no lugar, com a ação "Ver" que devolve o leitor ao job.              |
| Estado vazio                                          | HubSpot, PatternFly                                                   | adopt    | Parte `empty`: `result-state` com a frase da vista, ou o conteúdo do consumidor.                                                                                                                                              |
| Remover do histórico e limpar concluídos              | PatternFly (Clear all)                                                | adopt    | `onRemove({ keys }, request)` no controlo `remove` de um job terminado e no `clear` do cabeçalho.                                                                                                                             |
| Iniciar uma importação a partir de um arquivo         | Carbon ImportModal (drop container)                                   | adopt — compõe `upload` | O botão Importar do slot `actions` abre um `dialog` com `upload`; o adaptador do upload cria o job. O centro não transfere bytes.                                                                  |
| Importar a partir de um URL                           | Carbon ImportModal (`inputLabel`, `inputPlaceholder`)                 | decline  | Três linhas do consumidor: `text-field` e `button` no slot `actions`, com o handler que cria o job.                                                                                                                          |
| Diálogo de formato e nome do arquivo exportado        | Carbon ExportModal (`validExtensions`, `filename`)                    | decline  | `dialog` com `radio-group` e `text-field`; a página de referência mostra a composição. O centro recebe o job depois da escolha.                                                                                               |
| Mapeamento de colunas e revisão célula a célula       | Flatfile                                                              | decline  | É um editor de dados, não um centro de jobs: `data-grid` com edição, ou o produto de importação do consumidor. O centro recebe o job depois do mapeamento.                                                                   |
| Transporte das atualizações (polling, websocket)      | Stripe (webhook), Flatfile (listener)                                 | decline  | A loja do consumidor atualiza `jobs`; a família lê o array e nunca abre ligação, como `notification-center`.                                                                                                                 |
| Pausar e retomar                                      | nenhum job de servidor das fontes                                     | decline  | Só `upload` pausa uma transferência; o slot `actions` do job recebe o controlo de um servidor que pausa.                                                                                                                    |
| Seleção em massa                                      | HubSpot (tabela)                                                      | defer to `selection-toolbar` | A seleção sobre uma lista é de `selection-toolbar`, composta sobre os mesmos jobs.                                                                                                                                 |

### 1.3 Differentiators

| Capacidade                                                             | Razão                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O toast aponta para o job e não o duplica                              | Nenhuma fonte liga o aviso ao histórico. `jobNotice` decide as quatro transições que merecem aviso (início, sucesso, parcial, falha); o id do toast é o do job, portanto o aviso de conclusão substitui o de início em vez de se empilhar.        |
| Três desfechos separados                                               | Sucesso, parcial e falha têm palavra, marca e tonalidade próprias. HubSpot mostra a coluna Errors num import concluído sem mudar a linha; Salesforce chama `Failed` a um job com registos gravados.                                                   |
| Controlos nomeados pelo job                                            | Cada controlo tem `aria-labelledby` com o próprio id e o id do título do job: "Baixar Faturas Q3", não cinco "Baixar" iguais para um leitor de ecrã.                                                                                              |
| O foco não se perde quando o estado retira o controlo focado          | Um job que termina com o foco em "Cancelar" perde esse controlo. A família move o foco para o primeiro controlo do mesmo job, ou para o título dele quando não resta nenhum.                                                                         |
| Tempo restante estimado quando o servidor não o dá                     | Só Flatfile publica `estimatedCompletionAt`. Sem `eta`, o módulo estima a partir das atualizações observadas, com o limiar que `upload` já usa para a transferência.                                                                              |
| O mosaico do tipo de arquivo é o de `upload`                           | Um CSV tem a mesma cor e a mesma marca no campo onde foi escolhido e no job que o importa (escala File kind de `docs/token-foundation.md`).                                                                                                      |
| Três esquemas, três densidades, RTL                                    | Tonalidades do estado pelos pares da fundação; o nome do arquivo trunca ao meio e preserva a extensão em qualquer direção.                                                                                                                        |

### 1.4 Gaps

| Situação                                                      | Resposta                                                                                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12 000 linhas com erro                                        | A tabela mostra as linhas que o consumidor enviou num contentor com altura máxima e rolagem; `errorCount` maior do que `errors.length` escreve "Mostrando 50 de 12 000" ao lado do controlo do relatório completo.       |
| Nome de arquivo com 120 caracteres, ou em árabe numa página LTR | `splitName` de `@slotted/core/upload`: o radical encolhe com reticências e a extensão fica; o nome inteiro fica no DOM com `dir="auto"`.                                                                                |
| Cancelar no instante em que o job termina                     | O pedido segue; o estado seguinte do consumidor vence. O controlo desaparece e o foco segue a regra da secção 1.3.                                                                                                       |
| Um job removido no servidor enquanto os detalhes estão abertos | A chave sai de `expanded` no render seguinte; o foco vai para o mesmo controlo no job seguinte, depois no anterior, depois para a lista (`focusDestination`).                                                               |
| Atualizações interrompidas (sem rede)                         | O job mantém o último estado conhecido. O consumidor escreve a frase em `message` ("Sem ligação desde 14:02"); a família não mede a idade de uma atualização que não recebeu.                                             |
| A lista não carrega                                           | `status="error"`: `result-state` com `messages.loadError` e o controlo que pede `onReload`.                                                                                                                              |
| A lista carrega pela primeira vez                             | Três linhas de `skeleton` com a anatomia do job (mosaico, título, linha de meta, barra); `aria-busy` na lista.                                                                                                          |
| Cem jobs em curso ao mesmo tempo                              | A lista cresce; a contagem do cabeçalho diz quantos estão ativos. Não há virtualização: `growing` limita o histórico.                                                                                                   |
| Estado traduzido com o dobro do comprimento                   | A linha de estado quebra; a barra ocupa a largura da coluna do estado e não depende do texto.                                                                                                                           |

### 1.5 Delta contra o que já existe

| Já entregue          | Nesta família                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `upload`             | Transfere bytes e é a entrada de uma importação no slot `actions`. O centro reusa `fileKind`, `splitName`, `formatBytes`, `formatDuration` e a escala File kind. |
| `notification-center`| Vocabulário partilhado: `size`, `level`, `growing`, `onLoadMore`, vistas por `tabs` só com a lista, contagem como chip próprio.                     |
| `toast`              | Recebe o aviso; o centro não desenha toast.                                                                                                    |
| `progress-indicator`, `table`, `result-state`, `skeleton`, `button`, `tooltip` | Compostos dentro do job, dos detalhes e dos estados da lista.                                                     |

## 2. Anatomia

```
[data-part=root]                         ← section; região nomeada pelo título; contentor de consulta
├─ [data-part=header]
│    ├─ [data-part=title]                ← heading em `level`, com [data-part=count] (jobs ativos)
│    └─ [data-part=tools]                ← grupo que quebra junto
│         ├─ [data-part=clear]           ← button: remove os jobs terminados; ausente sem nenhum
│         └─ [data-part=actions]         ← slot do consumidor: importar (abre o diálogo com upload), exportar
├─ [data-part=views]                     ← tabs só com a lista; ausente com uma vista
├─ [data-part=list]                      ← ul, aria-labelledby o título, aria-busy ao carregar
│    └─ [data-part=job] ×n               ← li; data-direction, data-status, data-outcome, data-expired, data-expanded
│         ├─ [data-part=visual]          ← mosaico do tipo de arquivo, aria-hidden
│         ├─ [data-part=body]
│         │    ├─ [data-part=heading]    ← [data-part=job-title] (link com href) e [data-part=meta]
│         │    ├─ [data-part=status]     ← [data-part=mark] (Icon) + palavra + [data-part=stage]
│         │    ├─ [data-part=progress]   ← progress-indicator linear e [data-part=progress-text]
│         │    ├─ [data-part=summary]    ← resumo das contagens, após o fim
│         │    └─ [data-part=message]    ← falha, permissão ou expiração
│         ├─ [data-part=controls]
│         │    ├─ [data-part=download]   ← a[download] ou button
│         │    ├─ [data-part=cancel] / [data-part=retry]
│         │    ├─ [data-part=toggle]     ← button "Detalhes" em ambos os estados, aria-expanded, aria-controls; [data-part=chevron] no slot end
│         │    ├─ [data-part=job-actions]← slot do consumidor por job
│         │    └─ [data-part=remove]     ← botão de ícone com tooltip, só num job terminado
│         └─ [data-part=details]         ← div role=region, aria-labelledby o toggle
│              ├─ [data-part=counts]     ← dl: total, processadas, criadas, atualizadas, ignoradas, com erro
│              ├─ [data-part=files]      ← arquivo original, resultado, relatório de erros; cada um com descarga
│              └─ [data-part=errors]     ← table com caption (linha, erro, coluna, valor); [data-part=errors-note] "Mostrando 50 de 12 000"
├─ [data-part=more]                      ← growing=button: "Carregar mais"
├─ [data-part=empty]                     ← result-state da vista, ou o conteúdo do consumidor
├─ [data-part=error]                     ← status=error: result-state com o pedido onReload
└─ [data-part=footer]                    ← slot do consumidor
```

## 3. Eixos, estados e dados

| Eixo         | Valores                     | Omissão    | Efeito                                                                                                    |
| ------------ | --------------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `size`       | `sm`, `md`                  | `md`       | `sm` para popover e drawer: insets menores, degrau pequeno dos controlos, detalhes com uma coluna.        |
| `level`      | `2`, `3`, `4`               | `2`        | Nível do heading do cabeçalho.                                                                            |
| `growing`    | `none`, `button`            | `none`     | Como o histórico cresce.                                                                                  |
| `timeFormat` | `relative`, `absolute`      | `relative` | Como `createdAt` e `finishedAt` são escritos. `expiresAt` é sempre absoluto: um prazo é uma data.         |
| `status`     | `ready`, `error`            | `ready`    | `error` substitui a lista pelo estado de erro de carga.                                                   |

Estados: `loading` na raiz (skeleton ou `more` em espera); `expanded` no job e no toggle;
`data-status`, `data-outcome`, `data-direction` e `data-expired` são eixos do job, não estados
do vocabulário partilhado.

| Estado do job | Desfecho       | Tonalidade  | Marca                         | Controlos                                   |
| ------------- | -------------- | ----------- | ----------------------------- | ------------------------------------------- |
| `queued`      | —              | `secondary` | `clock`                       | cancel, toggle                              |
| `running`     | —              | `accent`    | `loader-circle`, rodando      | cancel, toggle                              |
| `succeeded`   | `success`      | `success`   | `circle-check`                | download, toggle, remove                    |
| `succeeded`   | `partial`      | `warning`   | `circle-alert`                | download, toggle, remove                    |
| `failed`      | `failed`       | `danger`    | `circle-x`                    | retry, toggle, remove                       |
| `canceled`    | `canceled`     | `secondary` | `circle`                      | retry, toggle, remove                       |

Um resultado expirado troca `download` por `retry` ("Gerar novamente" numa exportação). Um
arquivo com `denied` perde o controlo de descarga e mostra a frase. `cancelable: false` e
`retryable: false` retiram os respetivos controlos. `jobControls(job, now)` em core é a única
fonte desta tabela para os dois bindings.

A marca de `running` roda com `--slotted-duration-loop` e para sob
`prefers-reduced-motion`; a barra continua a dizer o progresso. `canceled` usa o círculo
vazio porque `circle-x` já é a falha e a biblioteca não desenha triângulo.

```ts
interface ImportExportJob {
  key: string;
  direction: 'import' | 'export';
  title: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'canceled';
  format?: string;                       // "CSV", "XLSX"; escrito na meta
  stage?: string;                        // frase de fase
  progress?: { value?: number; max?: number; unit?: 'rows' | 'bytes' | 'percent' };
  eta?: TimestampValue;                  // fim estimado pelo servidor
  counts?: { total?; processed?; created?; updated?; skipped?; failed? };
  errors?: { row: number; column?: string; value?: string; message: string }[];
  errorCount?: number;
  message?: string;
  source?: JobFile; result?: JobFile; errorsFile?: JobFile;
  actor?: string;
  createdAt?: TimestampValue; finishedAt?: TimestampValue;
  href?: string;                         // página do job, no título
  cancelable?: boolean; retryable?: boolean; removable?: boolean;
}
interface JobFile { name: string; size?: number; type?: string; href?: string; expiresAt?: TimestampValue; denied?: string }
```

## 4. Modelo de estado e pedidos

| Modelo / pedido    | Assinatura                                             | Razões                                   |
| ------------------ | ------------------------------------------------------ | ---------------------------------------- |
| `current`          | `view` / `defaultView` / `onViewChange(view, request)` | `pointer`, `keyboard`, `programmatic`    |
| `open`             | `expanded` / `defaultExpanded` / `onExpandedChange(keys, request)` | `pointer`, `keyboard`, `programmatic` |
| `onCancel`         | `(key, request)`                                       | `pointer`, `keyboard`                    |
| `onRetry`          | `(key, request)`                                       | `pointer`, `keyboard`                    |
| `onRemove`         | `({ keys }, request)`                                  | `pointer`, `keyboard`, `clear`           |
| `onDownload`       | `({ key, file }, request)`; cancelável antes da navegação | `pointer`, `keyboard`                 |
| `onOpen`           | `(key, request)`; cancelável antes da navegação        | `pointer`, `keyboard`                    |
| `onLoadMore`       | `(request)`                                            | `pointer`, `keyboard`                    |
| `onReload`         | `(request)`                                            | `pointer`, `keyboard`                    |

Os jobs são factos da loja do consumidor: a família pede e nunca muda um job.

## 5. Anúncios e foco

- Uma transição de estado de um job já mostrado é anunciada uma vez, com cortesia, por
  `live-announcer`: "Exportação Faturas Q3 concluída", "Importação Contatos concluída com 12
  erros". O primeiro render e o progresso não são anunciados; a barra tem `aria-valuenow`.
- Remoção: `focusDestination` leva o foco ao mesmo controlo do job seguinte, depois do anterior,
  depois à lista (`tabindex="-1"`).
- Controlo retirado pelo estado: foco no primeiro controlo restante do job, ou no título.
- `reveal(key)` no handle: pede `expanded` com `programmatic`, rola o job até à vista e foca o
  título. É o destino da ação "Ver" do toast.

## 6. Integração com os frameworks

### React

| Pergunta                                      | Resposta                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Par controlado e não controlado, com razão    | `view` / `defaultView` / `onViewChange`; `expanded` / `defaultExpanded` / `onExpandedChange`.                                                    |
| Defaults uma vez                              | `ImportExportCenterDefaultsProvider` (`size`, `level`, `growing`, `timeFormat`, `locale`, `timeZone`, `messages`).                             |
| Substituir o elemento renderizado             | `render` na raiz; `renderJobActions(job)` para o slot do job; `actions`, `empty`, `footer` como nós. Os controlos são `Button` da família `button`. |
| Handler do consumidor continua a correr       | Props nativas espalhadas depois das da família na raiz; os pedidos são os únicos handlers da família.                                          |
| Elemento nativo e ação imperativa             | `ref` com `ImportExportCenterHandle`: `element`, `focus()`, `reveal(key)`.                                                                       |
| Render no servidor                            | `useId` para título e lista; `now` declarado pelo consumidor para leitura relativa estável; estimativa de tempo só depois da hidratação.        |
| Todo estado no DOM                            | `data-size`, `data-level`, `data-growing`, `data-loading`, `data-view`, e no job `data-direction`, `data-status`, `data-outcome`, `data-expired`, `data-expanded`. |
| Props do elemento nativo, estendidas          | `ComponentPropsWithRef<'section'>`.                                                                                                              |

### Angular

| Pergunta                                   | Resposta                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Valor de duas vias em sinal                | `view = model<string>()`, `expanded = model<readonly string[]>()`, com `viewRequest` e `expandedRequest` em `output()`.              |
| Reactive Forms                             | Não: o centro não tem valor de formulário.                                                                                           |
| Defaults uma vez                           | `provideImportExportCenterDefaults()`.                                                                                               |
| Template alcança a instância               | `exportAs: 'slImportExportCenter'`.                                                                                                  |
| Conteúdo projetado, preguiçoso             | `ng-template[slImportExportJobActions]` com o job como contexto; `[slImportExportCenterActions]`, `[slImportExportCenterEmpty]`, `[slImportExportCenterFooter]`. |
| Zoneless e `OnPush`                        | Sinais; `afterRenderEffect` para as leituras de foco.                                                                                |
| Subscrições desfeitas                      | Nenhum observer; o anunciador é partilhado e não se subscreve.                                                                       |
| Atributo estático sobrevive                | `aria-label` na raiz lido com `HostAttributeToken`.                                                                                  |
| Uma classe por entry point                 | `@slotted/angular/import-export-center`.                                                                                             |

## 7. Decisões e custo

- **O centro não transfere bytes nem abre ligação.** `upload` transfere, a loja do consumidor
  atualiza. Custo: uma importação tem duas barras em dois sítios enquanto o arquivo sobe; o
  job só entra no centro quando o servidor o cria.
- **Cinco estados e um desfecho derivado.** `partial` não é um estado que o consumidor
  escreve: deriva das contagens, para que um job com 12 falhas não seja pintado de verde por
  engano. Custo: um servidor que conta falhas sem as expor tem de passar `errorCount`.
- **Sem glifo de descarga.** Os controlos de descarga são botões com texto. Um glifo novo
  muda o contrato de tokens, que outra sessão tem aberto nesta worktree. Custo: o controlo
  principal de um job terminado ocupa a largura da palavra.
- **O mosaico lê a escala File kind de `upload`.** Custo: esta família lê tokens da camada de
  componente de outra família; o ganho é um CSV com a mesma cor nos dois sítios.
- **Colunas a partir de 42rem, por subgrid.** A lista passa a uma grelha e cada job a uma
  subgrelha: mosaico, nome com meta, e a coluna de estado com os controlos por baixo. As
  colunas alinham em toda a lista e o controlo de remover fica numa só linha vertical. Uma
  primeira versão com os controlos numa quarta coluna comprimia o nome a 140 px a 720 px
  e foi recusada na captura. Custo: um limiar literal (`@container`), como `list-item` e
  `card`; abaixo de 22rem os detalhes ocupam também a coluna do mosaico.
- **O rótulo do toggle não muda.** "Detalhes" em ambos os estados; `aria-expanded` e o
  chevron dizem qual. Um rótulo que troca para "Ocultar" repete o estado ao leitor de ecrã.
- **A mensagem de erro é a segunda coluna da tabela.** A largura estreita rola a tabela na
  horizontal; o texto que diz o que falhou fica à vista.
- **O cabeçalho não aloja `upload`.** `upload variant="button"` ocupa 100% da largura com
  largura intrínseca nula (contenção de inline-size) e, com arquivos, desenha a lista por
  baixo do gatilho. A ação "Importar" abre um `dialog` com `upload`, a forma do
  ImportModal do Carbon; a página de referência demonstra a composição.
- **Os glifos são o elemento `Icon`.** O binding desenha cada marca (mosaico, estado,
  chevron, remover); a folha só define `--slotted-icon-size`. É a convenção que a migração
  em curso na worktree aplica a todas as famílias.
- **Sem `growing="scroll"`.** Custo: um histórico longo pede um clique por página.
- **A marca de estado centra-se na banda `(1cap + 1ex) / 2`.** O centro fica a metade da
  banda acima da linha de base; a caixa assenta na linha de base e desce
  `0.5em − (1cap + 1ex) / 4`, arredondado ao pixel. A primeira versão dividia por dois e a
  marca ficava 4 px acima das palavras em todas as linhas; o revisor viu-o no gate
  visual. Medido em Chrome com Geist a 13 px e 12 px, em `comfortable`, `dense` e RTL: o
  centro fica a 0,35 px e a 0,17 px do alvo, o resto do arredondamento ao pixel. O ponto
  separador centra-se em `0.5ex` pela `vertical-align` (desvio 0,01 px) e o mosaico
  centra-se no par nome e meta. `import-export-center.styles.test.mjs` fixa as duas
  fórmulas e falha com a antiga.
- **A marca tem coluna própria e o texto nunca passa por baixo dela.** A linha de status é
  uma grelha `auto minmax(0, 1fr)`: a marca numa coluna, a palavra e a fase
  (`status-label`) na outra. Em flex com quebra, a 240 px a palavra descia sozinha para a
  linha seguinte e a marca ficava isolada. A distância marca-palavra é
  `--slotted-space-3` (6 px), um degrau abaixo dos 8 px das outras marcas: a marca tem o
  tamanho da linha (13 px) e a arte fica recuada um pixel dentro da caixa. Com 8 px, o
  intervalo lia-se como separação.
- **A fase ocupa uma linha, com reticências.** Cinco linhas de fase a 240 px empurravam a
  barra para fora da vista; o texto inteiro fica no DOM e o binding repete-o em `title`.
  Os itens das linhas secundárias quebram inteiros ou truncam, com
  `overflow-clip-margin` igual ao intervalo, para o ponto separador continuar pintado.
- **A marca de `running` é `spinner`.** O anel que a biblioteca usa para uma espera
  indeterminada substitui o `loader-circle` a rodar; a família deixa de ter animação
  própria, e o anel para sozinho sob movimento reduzido.

