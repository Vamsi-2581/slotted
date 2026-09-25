# `wizard` — inventário e desenho

Data: 2026-09-25. Família nova da onda 11 (`docs/process/build-order.md`, guia §15).
Compõe `stepper` (a barra de progresso), `form` (cada etapa), `button` (as ações),
`alert` (o erro global) e `tag` (a marca de etapa opcional). A aritmética do fluxo é
`@slotted/core/wizard`, módulo novo.

## 1. Inventário de capacidades

### 1.1 Surveyed

| Implementação                          | Nome                                            | Fonte lida em 2026-09-25                                                                                                     |
| -------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| PatternFly React 6                     | `Wizard`, `WizardStep`, `WizardFooter`, `WizardToggle` | `packages/react-core/src/components/Wizard/{Wizard,WizardStep,types}.tsx`, ramo `main`; patternfly.org/components/wizard |
| Clarity (Angular)                      | `clr-wizard`, `clr-wizard-page`                 | `projects/angular/wizard/{wizard,wizard-page}.ts` em `vmware-clarity/ng-clarity`, ramo `main`                               |
| SAP OpenUI5                            | `sap.m.Wizard`, `sap.m.WizardStep`              | `src/sap.m/src/sap/m/{Wizard,WizardStep}.js` em `SAP/openui5`, ramo `master`                                                 |
| Carbon for IBM Products                | `CreateTearsheet`, `CreateTearsheetStep`        | `packages/ibm-products/src/components/CreateTearsheet/*.tsx`, ramo `main`; carbondesignsystem.com/community/patterns/create-flows |
| Angular CDK / Material                 | `CdkStepper`, `mat-stepper`                     | `src/cdk/stepper/stepper.ts` em `angular/components`, ramo `main`                                                            |
| Zag (Ark UI, Chakra 3)                 | `steps`                                          | `packages/machines/steps/src/steps.types.ts` em `chakra-ui/zag`, ramo `main`                                                 |
| Mantine 8                              | `Stepper`, `Stepper.Completed`                   | mantine.dev/llms/core-stepper.md                                                                                             |
| GOV.UK Design System                   | Question pages, Check answers                   | design-system.service.gov.uk/patterns/{question-pages,check-answers}                                                         |
| W3C WAI                                | Multi-page Forms                                 | w3.org/WAI/tutorials/forms/multi-page; WCAG 2.2 SC 3.3.7 Redundant Entry, SC 2.2.1 Timing Adjustable                         |

PatternFly, Clarity, UI5 e Carbon entregam o assistente inteiro. CDK, Zag e Mantine
entregam o indicador com conteúdo por etapa e deixam validação e dados ao consumidor; são
o contraste. GOV.UK e WAI são a prática de formulário em várias páginas, sem componente.

### 1.2 Table stakes

| Capacidade                                                 | Quem entrega                                  | Veredito | Razão                                                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Etapa atual controlada e não controlada, pedido de mudança | todos                                         | adopt    | Modelo `current` por `name` de etapa (§4).                                                                                              |
| Voltar, Avançar, Concluir, Cancelar com rótulos próprios   | PatternFly, Clarity, Carbon, UI5              | adopt    | Partes `previous`, `next`, `submit`, `cancel`; `labels` por instância e por provider.                                                   |
| Avançar vira Concluir na última etapa                      | PatternFly, Clarity, Carbon, UI5 (`finishButtonText`) | adopt | Uma só parte ativa: `next` antes da última etapa, `submit` na última.                                                                 |
| Validação por etapa que bloqueia o avanço                  | CDK (`stepControl`), Zag (`isStepValid`), Carbon (`onNext`, `disableSubmit`), Clarity (`nextDisabled`), UI5 (`validated`) | adopt | A etapa é um `form`: validação de restrição da plataforma, mais `validate` do consumidor. Erros vão ao resumo de `form`. |
| Validação assíncrona com espera                            | Carbon (`onNext` devolve promessa), Clarity (`preventDefaultNext` + `forceNext`), CDK (`pending`) | adopt | `validate` devolve promessa; o botão Avançar fica `loading`; voltar cancela por `AbortSignal`. |
| Navegação linear; salto direto só a etapas alcançáveis     | CDK (`linear`), Zag (`linear`), PatternFly (`isVisitRequired`), Mantine (`allowNextStepsSelect`), Clarity (`forceForwardNavigation`) | adopt | `linear`, omissão `true`: alcança-se a etapa atual, as anteriores e a primeira seguinte cujas anteriores estão concluídas (`stepReachable`). |
| Etapa condicional (ramificação)                            | UI5 (`enableBranching`, `nextStep`), Carbon (`includeStep`), PatternFly (`isHidden`) | adapt | Renderização condicional da etapa no idioma de cada framework; a família reage à lista que muda (§5.6). |
| Etapa opcional                                              | CDK (`optional`), UI5 (`optional`), Carbon (`secondaryLabel`), WAI | adopt | `optional` na etapa: marca "Optional" no cabeçalho e no progresso, parte `skip`.                                                  |
| Etapa em erro                                              | PatternFly (`status: 'error'`), CDK (`hasError`), Clarity (`hasError`), Carbon (`invalid`) | adopt | Derivada: uma etapa com erros publicados no seu `form` fica `invalid` no `stepper`.                                  |
| Começar noutra etapa / retomar                             | PatternFly (`startIndex`), Carbon (`initialStep`), CDK (`selectedIndex`) | adopt | `defaultStep` e `defaultValue`, ajustados à etapa alcançável (§5.5).                                                  |
| Envio assíncrono com estado ocupado                        | Carbon (`onRequestSubmit` com promessa), PatternFly (`onSave` com promessa) | adopt | `onSubmit` devolve promessa; `submit` fica `loading`; as outras ações recusam.                                               |
| Conteúdo de conclusão                                      | Zag (`CompletedContent`), Mantine (`Stepper.Completed`) | adopt | Parte `complete`, mostrada depois de um envio aceite; recebe o foco.                                                        |
| Foco no conteúdo ao mudar de etapa                         | PatternFly (`shouldFocusContent`), UI5 (`goToStep(step, focusFirst)`) | adopt | O foco vai ao título da etapa, que diz a posição (§6).                                                                   |
| Repor                                                      | CDK (`reset`), Clarity (`reset`)              | adopt    | `reset()` imperativo: volta a `defaultStep`, esvazia valor, rascunho e erro.                                                            |
| API imperativa                                             | todos                                          | adopt    | `next`, `previous`, `goTo`, `edit`, `skip`, `submit`, `saveDraft`, `clearDraft`, `reset`, `focus`.                                      |
| Progresso lateral ou em cima                               | PatternFly e Clarity (lateral), Carbon, CDK e Mantine (em cima) | adopt | Eixo `progress`: `start` \| `top` \| `none`.                                                                      |
| Progresso recolhido em largura estreita                    | PatternFly (`WizardToggle`), Carbon (tearsheet estreito) | adopt | Abaixo da classe compacta, uma parte `progress-toggle` abre a lista (§5.8).                                                  |
| Rodapé substituível por etapa, botões próprios             | PatternFly (`footer` por etapa), Clarity (botões personalizados) | adapt | As ações são partes que o consumidor arruma; `render` em cada uma; `useWizard()` para um rodapé próprio.                    |
| Assistente em modal ou em página                           | Clarity (modal por omissão, `inPage`), Carbon (tearsheet), PatternFly (demo em modal) | decline | `dialog` e `drawer` são a camada; a família é conteúdo de página. Eixo `scroll="self"` faz o corpo rolar e prende as ações dentro de uma camada (§5.9). |
| Subetapas (etapa pai com filhas)                           | PatternFly                                    | decline  | Só PatternFly entrega. Uma etapa com várias secções compõe `section` dentro do seu `form`.                                             |
| Descartar o progresso depois de uma etapa                  | UI5 (`discardProgress`), Clarity (`forceForwardNavigation`) | adapt | Uma etapa cujas respostas dependem de outra renderiza-se com um `name` derivado da resposta; `name` novo é etapa nova, sem dados (§5.6). |
| Rever respostas e voltar a editar                          | GOV.UK (Check answers), UI5 (`finishButtonText: "Review"`) | adopt | Parte `edit`: vai à etapa e, ao concluí-la, regressa à etapa de revisão (§5.4).                                              |

### 1.3 Differentiators

- **Cada etapa é um `form` da família `form`.** `Enter` num campo submete a etapa pela
  submissão implícita da plataforma; a validação de restrição, o resumo de erros, o foco
  no primeiro erro e o estado ocupado vêm de `form` sem código novo. Nenhuma implementação
  inspecionada usa a submissão nativa: PatternFly, Clarity e Carbon só avançam por clique.
- **Erro do servidor no envio final encaminhado à etapa certa.** `onSubmit` pode devolver
  `{ step, errors }`: a família volta à etapa, publica os erros no seu `form` e mostra o
  erro global. Carbon, PatternFly e Clarity mostram só uma mensagem.
- **Regresso à revisão** depois de editar uma resposta, com o rótulo "Save and return"
  (GOV.UK descreve-o; nenhum componente inspecionado o entrega).
- **Rascunho e recuperação por adaptador declarado.** `persistence` com `load`, `save`,
  `clear`; `storagePersistence` para `sessionStorage` (recarregar) e `localStorage`
  (voltar noutro dia), com versão. Nenhuma implementação inspecionada persiste.
- **Voltar nunca perde o que foi escrito** (WAI Multi-page Forms: "any data already
  entered in the current step should be saved"). Voltar e saltar para trás guardam os
  valores da etapa sem os validar.
- Três esquemas, três densidades, `dir="rtl"`, e duas ligações de primeira classe:
  Reactive Forms em Angular, `FormData` e `useWizard()` em React.

### 1.4 Gaps

- **URL a apontar para uma etapa ainda inalcançável** (marcador, recarga, link partilhado):
  nenhuma implementação responde. A família recusa a etapa, pede a primeira etapa
  incompleta com razão `programmatic`, e o roteador do consumidor segue o pedido.
- **Rascunho de uma versão anterior do fluxo**: um snapshot com `version` diferente é
  ignorado e apagado, em vez de preencher campos que já não existem.
- **Ficheiros no rascunho**: um `File` não se serializa em `Storage`. `storagePersistence`
  omite-os e o valor restaurado não os tem; `upload` guarda identificadores, que se
  serializam.
- **Envio que falha sem etapa**: o erro global fica acima da etapa, com as respostas
  intactas e o botão Concluir de novo disponível.
- **Etapa atual removida por uma ramificação** enquanto o leitor está nela: a família
  pede a etapa seguinte que existe, ou a anterior quando não há seguinte.
- **Validação assíncrona interrompida**: voltar ou saltar durante a espera aborta-a pelo
  `AbortSignal` dado a `validate`, e uma resposta atrasada não avança.
- **Rótulo de etapa longo ou traduzido**: o progresso lateral e o título quebram linha.
  O botão de progresso recolhido não repete o nome da etapa: diz a posição e desenha um
  segmento por etapa, e o título logo abaixo diz o nome.

## 2. Padrão

O APG não tem padrão de assistente. As fontes são o tutorial WAI Multi-page Forms, o
padrão de `stepper` já transcrito em `specs/components/stepper/contract.json` e o de
`form` em `specs/components/form/contract.json`.

| Requisito                                                               | Resposta                                                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Indicar o progresso no título principal                                 | O título da etapa começa pela posição: `Step 2 of 5` na parte `position`, dentro do heading |
| Indicador por lista ordenada, atual e concluídas em texto oculto        | `stepper`: `ol`, `aria-current="step"`, parte `status`                                   |
| Link para etapas concluídas, guardando o que foi escrito na atual        | Cabeçalhos alcançáveis são botões; saltar guarda sem validar (§5.3)                       |
| Etapas opcionais reconhecíveis e com opção de saltar                    | `optional`: marca no título e no progresso; parte `skip`                                  |
| Sem limite de tempo, ou limite ajustável (SC 2.2.1)                     | A família não impõe tempo; um rascunho restaurável protege contra o limite de sessão de um servidor |
| Não pedir a mesma informação duas vezes (SC 3.3.7)                      | O valor acumulado chega a cada etapa por `useWizardStep().values` / `slWizardStep.values` |
| O título do documento indica o progresso                                | Declinado: `<title>` pertence ao roteador. A posição e o rótulo estão em `useWizard()` / `slWizard`, e o consumidor escreve o título numa linha |

## 3. Anatomia

```
div[data-ui=wizard][data-part=root]                       container slotted-wizard; data-progress, data-scroll
  div[data-part=layout]                                   grelha: progresso ao lado ou em cima
    div[data-part=progress][id]                           data-open em largura compacta
      button[data-part=progress-toggle][aria-expanded]    só na classe compacta
        span[data-part=progress-position]                 "Step 2 of 5", o nome acessível do botão
        span[data-part=progress-track][aria-hidden]       um progress-segment por etapa presente
      stepper (vertical com progress=start, horizontal com progress=top)
    div[data-part=main]
      div[data-part=error] > alert (tone danger)          só com erro global
      div[data-part=step][aria-busy]                      a etapa atual
        div[data-part=step-header]
          h2[data-part=step-title][tabindex=-1]
            span[data-part=position]                      "Step 2 of 5"
            rótulo da etapa
            tag[data-part=optional]                        só em etapa opcional
          p[data-part=step-description]
        form[data-ui=form][id]                            campos do consumidor; resumo de form
        div[data-part=skeleton] > field                   só durante um restauro assíncrono, no lugar do form
      div[data-part=actions]
        div[data-part=actions-start]
          button[data-part=cancel] button[data-part=save-draft]
          span[data-part=draft-status][role=status]        "Draft saved at 14:02"
        div[data-part=actions-end]
          button[data-part=skip] button[data-part=previous]
          button[data-part=next | submit][form=<id do form>]
      div[data-part=complete][tabindex=-1]                depois de um envio aceite; substitui step e actions
  button[data-part=edit]                                   em qualquer sítio da etapa de revisão; texto no acento
```

- O root é contentor e a grelha está um elemento dentro (decisão "A family that changes
  its own tracks with a container query needs two elements").
- `next` e `submit` são `type="submit"` associados ao `form` da etapa pelo atributo
  `form`: ficam fora do `form` e submetem-no, como a plataforma permite.
- Nenhum landmark: o `stepper` já recusou `navigation` pela mesma razão (§6 do desenho de
  `stepper`), e a etapa é nomeada pelo seu heading (`aria-labelledby` no `form`).

## 4. Estado

| Capacidade | Controlado     | Não controlado        | Pedido                  | Razões                                               |
| ---------- | -------------- | --------------------- | ----------------------- | ---------------------------------------------------- |
| `current`  | `step`         | `defaultStep`         | `onStepChange`          | `pointer`, `keyboard`, `submit`, `programmatic`      |
| `value`    | `value`        | `defaultValue`        | `onValueChange`         | `submit`, `clear`, `programmatic`                    |
| `open`     | `progressOpen` | `defaultProgressOpen` | `onProgressOpenChange`  | `pointer`, `keyboard`, `select`, `escape`, `programmatic` |

- `step` é o `name` da etapa, não o índice: um índice muda quando uma ramificação
  insere uma etapa, e uma URL guardada com `?step=3` passaria a apontar para outra.
- `value` é `Record<name, StepValues>` e guarda só **respostas aceites**: uma etapa entra
  no mapa quando a sua submissão passa a validação. Uma etapa está concluída se, e só
  se, está no mapa. É o facto do consumidor (§4.4 do desenho de `stepper`), e um valor
  vindo do servidor declara as etapas concluídas sem um segundo campo.
- Os valores escritos e ainda não aceites (voltar, saltar para trás, guardar rascunho)
  ficam num rascunho interno por etapa. Não são `value`: não passaram a validação. Entram
  no snapshot de rascunho (§5.7) e voltam aos campos pela mesma via que `value`.
- Razões: `submit` é a submissão da etapa (clique em Avançar ou `Enter` num campo, os dois
  chegam como evento `submit`); `pointer` e `keyboard` são o cabeçalho, Voltar e Editar;
  `programmatic` é o ajuste de uma etapa inalcançável, o restauro e a API. `select` fecha
  o progresso recolhido depois de escolher uma etapa.
- O ciclo de envio (`editing`, `submitting`, `complete`) não tem modelo: é a resposta a
  um pedido que a família fez (`onSubmit`), não um valor que o consumidor possua. Aparece
  como `data-loading` e `data-complete` no root; `reset()` volta a `editing`.
- O erro global é `error` do consumidor, ou a falha devolvida por `onSubmit`. O do
  consumidor ganha.

## 5. Ciclo

### 5.1 Avançar

1. A etapa é submetida (`next`, `Enter`, `handle.next()`).
2. `form` corre a validação de restrição; erros publicam-se no resumo e o pedido para.
3. `validate(values, { value, signal })` da etapa, se existir. Devolve erros por `name`
   de controlo, ou promessa deles. Erros vão ao `form`; promessa põe `next` em `loading`.
4. Sem erros: `onValueChange` com `value` mais esta etapa, razão `submit`; rascunho
   interno da etapa apagado; `autosave` guarda o snapshot.
5. Pede a etapa de destino (§5.4) com razão `submit`. O foco vai ao título da nova etapa.

### 5.2 Voltar

Sem validação. Os valores da etapa atual vão para o rascunho interno e a família pede a
etapa anterior que existe, razão `pointer`.

### 5.3 Saltar pelo cabeçalho

- Para trás: como Voltar.
- Para a frente, a uma etapa alcançável: a etapa atual é submetida primeiro (§5.1); o
  destino é o cabeçalho escolhido e não o seguinte.
- Durante uma validação assíncrona, os cabeçalhos recusam (a mesma regra de `loading` de
  `stepper`).

### 5.4 Destino depois de aceitar uma etapa

`nextDestination` em `@slotted/core/wizard`:

- Com um ponto de regresso (entrou-se pela parte `edit`): a primeira etapa incompleta
  entre a atual e o ponto de regresso; nenhuma, o ponto de regresso. É a regra GOV.UK:
  uma resposta que abre perguntas novas pergunta-as antes de voltar à revisão.
- Sem ponto de regresso: a etapa seguinte que existe.
- Na última etapa: envio (§5.5).

Com ponto de regresso, `next` diz `labels.return` ("Save and return").

### 5.5 Concluir

1. A última etapa é aceite como em §5.1.
2. `firstIncomplete` em `@slotted/core/wizard`: com `linear={false}` pode haver etapas
   por concluir. Havendo, a família pede essa etapa com razão `submit` e o seu título diz
   `labels.incomplete`. O envio não corre.
3. `onSubmit(values, request)`. `values` contém só as etapas presentes no momento do
   envio (§5.6). Promessa: root `data-loading`, `submit` em `loading`, `previous`,
   `cancel`, `save-draft` e cabeçalhos recusam.
4. Resultado `{ message, step?, errors? }` ou promessa rejeitada: erro global na parte
   `error`, foco nele. Com `step`, a família pede essa etapa (razão `programmatic`) e
   publica `errors` no seu `form`.
5. Sucesso: `complete`; `persistence.clear()`; o foco vai à parte `complete`.

`defaultStep` e um `step` controlado inalcançável (URL, restauro) são ajustados pela
mesma função: `clampStep` devolve a primeira etapa incompleta quando a pedida não é
alcançável, e a família pede-a com `programmatic`.

### 5.6 Etapas condicionais

A lista de etapas é a que o consumidor renderiza: `{business && <WizardStep …/>}` em
React, `@if` em Angular. A família não tem `when`.

- A etapa atual sai da lista: a família pede a seguinte que existe, ou a anterior.
- Uma etapa ausente mantém a sua entrada em `value`, para que voltar a incluí-la devolva
  as respostas. O envio só recebe as etapas presentes. É a política explícita que o guia
  (§15, Data Entry Form) pede para campos ocultos: manter o valor, não o submeter.
- Uma etapa cujas perguntas dependem de uma resposta anterior renderiza-se com um `name`
  derivado dela (`name={"plan-" + tier}`). Um `name` novo é uma etapa nova, incompleta e
  sem dados; é assim que o descarte de progresso de UI5 e Clarity se escreve sem API.

Oito casos decididos na porta visual (2026-09-25), cada um com o seu teste em
`@slotted/core/wizard` e nas duas ligações:

1. **Etapa nova antes da atual.** A etapa atual nunca é ajustada por uma mudança da
   lista: `clampStep` serve só uma etapa pedida (URL, restauro, `step` controlado). A
   etapa nova e incompleta é apanhada pelo avanço seguinte (`nextDestination` vai à
   primeira incompleta antes do destino) e pelo envio (`firstIncomplete`).
2. **Etapa atual controlada e ausente.** A família desenha a etapa que pediu e emite o
   pedido com `programmatic`, como `pagination` desenha a página ajustada.
3. **Ponto de regresso ausente.** O regresso é descartado e o avanço segue para a etapa
   seguinte presente.
4. **Etapa que sai durante uma validação assíncrona.** A validação é abortada pelo
   `AbortSignal`, e uma resposta atrasada não avança nem publica erros.
5. **Dois `name` iguais.** Erro lançado (`assertUniqueSteps`); duas etapas com um nome
   partilhariam uma resposta.
6. **Condição sobre o que se escreve.** Em React o valor chega à família na submissão
   da etapa, portanto uma etapa condicional sobre `value` aparece depois de avançar,
   como em GOV.UK. Uma pré-visualização ao vivo lê o estado do consumidor; a página de
   referência mostra essa variante. Em Angular o `FormGroup` do consumidor já é estado
   vivo.
7. **Total que muda.** `labels.position` recalcula-se; não há anúncio próprio. O título
   da etapa seguinte diz a posição nova quando recebe o foco.
8. **Nenhuma etapa.** A família lança um erro: um assistente sem etapas é um engano do
   consumidor que um render vazio esconderia.

**O destino decide-se depois do render do consumidor.** Uma etapa que a resposta aceite
abre (Company depois de Business) só existe quando o consumidor volta a renderizar com o
valor novo. Calculado no momento da aceitação, o destino saltava-a e ia para Billing,
defeito encontrado na revisão de 2026-09-25. A aceitação regista o destino pendente, e este
resolve-se no efeito seguinte ao render (React) ou em `afterNextRender` (Angular), com a
lista já renderizada. O restauro de um rascunho segue a mesma regra: o valor restaurado é
anunciado nos dois modos e a etapa do rascunho resolve-se depois do render. Os testes
`a branch on the accepted answer` (React) e `SlWizard branch on the accepted answer` e
`restore on a branch` (Angular) percorrem o caminho real e falham sem a regra.

### 5.7 Rascunho, recarga e URL

- **URL.** `step` controlado pelo roteador do consumidor; `onStepChange` navega. A
  família ajusta uma etapa inalcançável (§5.5). Nenhuma escrita em `location` pela
  família: dois donos da URL divergem.
- **Rascunho.** `WizardSnapshot = { version, step, value, drafts, savedAt }`. A parte
  `save-draft` e `saveDraft()` escrevem-no com razão `pointer` ou `programmatic`, em
  `onSaveDraft(snapshot, request)` e em `persistence.save`. `draft-status` anuncia
  `labels.saved(savedAt)` uma vez, `polite`.
- **Recarga e retoma.** `persistence.load()` no arranque. Síncrono (`storagePersistence`):
  o primeiro render já é o restaurado. Assíncrono: a etapa fica `aria-busy` com o
  esqueleto de §5.10; versão diferente: ignorado e `clear()`.
- **`autosave`**: `none` | `step`, omissão `step` quando há `persistence`. `step` guarda a
  cada etapa aceite. Um intervalo de tempo foi recusado: escreve durante a digitação e
  não guarda nada que a etapa aceite não guarde.
- **Guarda de saída.** `guardUnsaved`, omissão `false`, como em `form`: `beforeunload`
  enquanto há valores não guardados.

### 5.8 Largura

- Classe compacta (`< 600px` do contentor): o `stepper` sai do layout até o leitor abrir
  `progress-toggle`; a lista aberta fica por cima da etapa, no fluxo, sobre o fundo
  `surface-sunken`. O botão diz a posição e desenha um segmento por etapa: fino para uma
  etapa por vir, quatro vezes mais grosso para uma alcançada, no tom de perigo para uma em
  erro; a espessura separa os estados em `high-contrast`, onde a linha pendente e o acento
  são quase pretos. A posição no título sai da imagem (fica no texto do heading, que é o
  que um leitor de ecrã ouve) porque o botão logo acima já a diz. Escolher uma etapa
  fecha-a (razão `select`). `Escape` com o foco na lista fecha-a e devolve o foco ao botão.
- Classe média e expandida: `progress="start"` põe a lista vertical numa coluna de 14rem
  no lado inline-start; `progress="top"` põe-na horizontal por cima. `stepper` já passa a
  vertical abaixo de 30rem, e dentro do assistente isso não ocorre: abaixo de 600px o
  progresso está recolhido.
- Ações: a ordem visual é a ordem do DOM (WCAG 2.4.3), como em Carbon. `actions-start`
  leva as ações que saem do fluxo (cancelar, guardar); `actions-end` as que o movem
  (saltar, voltar, avançar), com a principal na ponta. Em largura compacta os dois grupos
  empilham-se, `actions-end` por baixo, e cada botão de `actions-end` divide a linha.

### 5.9 Rolagem

`scroll`: `ancestor` (omissão) | `self`, o mesmo eixo de `detail-panel`. `self`: o root
ocupa a altura do pai, `main` rola e `actions` fica presa ao fundo com a sua aresta. É o
que um `dialog` ou um `drawer` com o assistente dentro precisam.

### 5.10 Esperas

| Espera                               | Indicador                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Restauro assíncrono do rascunho      | `skeleton` da etapa: linha da posição, linha do título, um campo (rótulo e controlo); ações ausentes; `delay` 200 ms, `minDuration` 400 ms; `aria-busy` na etapa; `labels.restoring` anunciado uma vez |
| Validação assíncrona de uma etapa    | `loading` do botão `next`; `aria-busy` no `form`                                              |
| Envio final                          | `loading` do botão `submit`; `data-loading` no root                                           |
| Guardar rascunho                     | `loading` do botão `save-draft`; depois `draft-status`                                        |

O progresso (`stepper`) é chrome já pintado e fica com os rótulos reais durante o
restauro.

## 6. Foco

| Momento                              | Destino                                              |
| ------------------------------------ | ---------------------------------------------------- |
| Primeiro render                      | Nenhum movimento                                     |
| Mudança de etapa por qualquer via    | `step-title` (`tabindex="-1"`), que diz posição e nome |
| Validação falhou                     | O que `form` decide (`errorFocus`: resumo por omissão) |
| Envio falhou                         | O `alert` da parte `error`                           |
| Envio aceite                         | A parte `complete`                                   |
| Progresso recolhido fechado por `Escape` | `progress-toggle`                               |

O foco não é dado ao primeiro campo: um leitor de ecrã que aterra num campo não ouve o
título nem a posição, e o tutorial WAI põe a posição no título por essa razão.

## 7. Teclado

A família não acrescenta teclas. `Enter` num campo de texto submete a etapa (submissão
implícita). O progresso tem o teclado de `stepper`. `Escape` fecha o progresso recolhido.

## 8. `@slotted/core/wizard`

| Exportação          | Responde                                                                        |
| ------------------- | ------------------------------------------------------------------------------- |
| `stepComplete`      | Se uma etapa está em `value`                                                    |
| `reachableStep`     | Se o leitor pode ir a uma etapa, por `stepReachable` de `@slotted/core/steps`   |
| `clampStep`         | A etapa a mostrar quando a pedida não existe ou não é alcançável                |
| `nextDestination`   | Para onde ir depois de aceitar uma etapa, com ou sem ponto de regresso          |
| `firstIncomplete`   | A primeira etapa presente e incompleta                                          |
| `includedValues`    | O valor restrito às etapas presentes, para o envio                              |
| `createSnapshot`, `readSnapshot` | O snapshot e a sua leitura com versão                              |
| `storagePersistence`| Adaptador de `sessionStorage` ou `localStorage`, sem `File`                     |

## 9. Integração

### React

| Pergunta                            | Resposta                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| Par controlado e pedido com razão   | as três linhas de §4, `(value, request)`                                                          |
| Defaults uma vez                    | `WizardDefaultsProvider` (`labels`, `progress`, `linear`, `level`, `scroll`, `delay`, `minDuration`) e `useWizardDefaults` |
| Substituir o elemento de cada parte | `render` em root, `WizardStep` (o `div` da etapa), `WizardPrevious`, `WizardNext`, `WizardCancel`, `WizardSaveDraft`, `WizardSkip`, `WizardEdit`, `WizardComplete`. O `form` da etapa é fixo pela razão de `Form` (sem `render`) |
| Handler do consumidor corre         | `onClick` das ações e `onSubmit` nativo compõem; `defaultPrevented` cancela                       |
| Elemento nativo e ação imperativa   | `ref` no root; `handle` com `next`, `previous`, `goTo`, `edit`, `skip`, `submit`, `saveDraft`, `clearDraft`, `reset`, `focus` |
| SSR sem mismatch                    | `useId` para ids de etapa e `form`; `persistence.load` síncrono corre num inicializador de estado, e o assíncrono num efeito |
| Estados no DOM                      | `data-progress`, `data-scroll`, `data-loading`, `data-invalid`, `data-complete`, `data-open`, `data-final` |
| Props nativas                       | `ComponentPropsWithRef<'div'>` no root, `<'button'>` nas ações                                   |

### Angular

| Pergunta                                | Resposta                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| Valor two-way em signal                 | `model()` em `step`, `value`, `progressOpen`; `output()` com o pedido e a razão         |
| Reactive Forms e template forms         | A etapa é `form[slForm]` do consumidor com `slWizardForm`; lê `FormGroupDirective`/`NgForm` quando existe: validade, `pending` e `getRawValue()` substituem `FormData`, e `markAllAsTouched()` corre numa submissão inválida. O assistente não é um `ControlValueAccessor`: não é um controlo dentro de um formulário, contém vários |
| Defaults uma vez                        | `WIZARD_DEFAULTS` e `provideWizardDefaults()`                                            |
| `exportAs`                              | `slWizard`, `slWizardStep`                                                              |
| Conteúdo projetado e preguiçoso         | `ng-template[slWizardStepContent]` por etapa, por `NgTemplateOutlet`: só a etapa atual existe |
| Zoneless e `OnPush`                     | signals; nenhum `markForCheck`                                                          |
| Listeners desmontados                   | `DestroyRef` para `beforeunload`, o `AbortController` da validação e o carregamento     |
| Atributo estático sobrevive             | `HostAttributeToken` para `aria-label` do host                                          |
| Entry point único                       | `@slotted/angular/wizard`                                                               |

Assimetria registada: em React a família renderiza o `form` da etapa; em Angular é o
consumidor, porque `formControlName` resolve o `ControlContainer` pelo injector do
template onde está escrito, e um `form` da família não seria esse.

## 10. Decisões

| Pergunta                                                   | Decisão                                                                                                         |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `linear` por omissão                                       | `true`. O âmbito da onda: "Navegação direta depende de etapas concluídas".                                      |
| A família pinta botões, ao contrário de `stepper`?          | Sim. Os quatro assistentes inspecionados pintam o rodapé; `stepper` não os pinta porque não sabe o que é concluir. As ações compõem `button`, e `render` devolve o elemento ao consumidor. |
| Cancelar pede confirmação?                                 | Não. `onCancel(request)` leva `dirty`; a confirmação é um `alert-dialog` do consumidor (Clarity faz o mesmo com `preventDefaultCancel`). |
| Uma etapa saltada (`skip`) conta como concluída?            | Sim, com `{}` em `value`. A revisão mostra "Not provided" (GOV.UK).                                              |
| Etapa de revisão                                           | Uma etapa comum do consumidor, com `description-list` e a parte `edit`. A família não gera o resumo.             |
| Aparência de `edit`                                        | Texto no acento, sublinhado ao hover, como o "Change" de GOV.UK. A coluna `action` de `description-list` tem uma linha de altura e alinha ao início da linha; um `button` `sm` ficava um terço de linha abaixo da resposta. É um `button` porque move o fluxo e não a página. |
| Título da etapa com foco                                   | Sem anel: é uma posição de leitura, não um controlo. O resumo de `form`, para onde o leitor é mandado com trabalho a fazer, mantém o seu. |
| Primeiro botão `ghost` das ações                           | Devolve o recuo com margem negativa, `flex: none` e `max-inline-size: none`; o texto "Cancel" fica na aresta da coluna dos campos. |
| Título da etapa: nível                                     | `level`, omissão 2, provider.                                                                                   |
| O todo desativado                                          | `disabled`: o `form` da etapa fica num `fieldset disabled`, as ações e os cabeçalhos recusam, o root leva `data-disabled`. Serve um fluxo cujo prazo terminou e que ainda se lê. |
| Subetapas, modal, título do documento                      | Declinados em §1.2 e §2.                                                                                         |

## 11. Custo de uma resposta errada no gate visual

A anatomia de §3 fixa o que as duas ligações escrevem: o `form` por etapa, as ações fora
dele com o atributo `form`, o progresso recolhido e o título com a posição. Mudar agora a
posição das ações (por exemplo, ações dentro do `form`), a coluna do progresso ou a forma
do progresso recolhido custa a folha e o harness. Depois do Step 13 custa as duas
ligações, os testes de comportamento, `@slotted/core/wizard` e as duas páginas de
referência.
