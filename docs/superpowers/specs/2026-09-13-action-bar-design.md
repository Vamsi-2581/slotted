# Desenho — `action-bar`

Escrito depois de `2026-09-13-action-bar-capability-inventory.md` e antes de
qualquer código, como o passo 5 da skill exige. Regista as decisões de
responsabilidade, anatomia, posse de estado, composição e comportamento entre
_bindings_, e responde às duas tabelas de integração de
`.claude/skills/component/references/frameworks.md`.

## 1. A fronteira: três famílias, três perguntas

A biblioteca já tem duas famílias que põem controlos numa linha. A pergunta que
este desenho tem de responder primeiro é porque há uma terceira.

| Família        | A pergunta que possui                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `button-group` | A **forma** de uma corrida de ações: gap, orientação, junção, alinhamento.                        |
| `toolbar`      | O **teclado** de um conjunto de ferramentas: um só _tab stop_, setas, `Home`, `End`, `role="toolbar"`. |
| `action-bar`   | As **ações que terminam uma tarefa** numa página ou num painel: qual delas nunca cede, o que a que cede se torna, e onde a barra assenta. |

A distinção não é de aparência. Uma barra de ferramentas e uma barra de ações
respondem de maneira oposta a duas perguntas concretas:

**Ordem de leitura contra importância.** Numa barra de ferramentas as duas
correm no mesmo sentido: a primeira ferramenta é a mais usada, e ceder a partir
do fim cede a menos usada. É por isso que `toolbar` recusou prioridade por
escrito no seu contrato. Numa barra de ações correm em sentidos opostos: Polaris
(`PageActions`), SLDS (`docked-form-footer`) e o rodapé da `sap.f.DynamicPage`
põem a ação que confirma **no fim da linha**, portanto ceder a partir do fim cede
o `Guardar` primeiro. É a razão pela qual esta família tem posto e a outra não.

**Um _tab stop_ ou vários.** Ver §4.

**`table` já apontou para cá.** O contrato de `table` recusa `batchActions` e
adia-o para esta família por escrito, dizendo que entrega a seleção e a sua
contagem e que onde as ações são desenhadas é decisão da página. A barra de ações
em massa é, portanto, um contexto desta família e não uma família por construir:
é esta barra com uma frase no `status`, um conjunto de ações permitidas, e
`present` — §8.5.

`page` não é uma quarta resposta: o seu `footer` já pinta o chão, a régua e o
comportamento colado de um rodapé de página, e o seu `actions` é uma fila
simples. `action-bar` é o que vai **dentro** desse rodapé quando a fila precisa
de posto, de menu ou de separação — e é também o que se usa quando não há
`page` nenhuma à volta, dentro de uma `drawer`, de um `dialog` ou de um `card`.
A `page` continua a não saber nada sobre postos, e esta família continua a não
pintar chão nenhum sob `variant="plain"`.

## 2. Anatomia

```
root  ▸ status
      ▸ actions ▸ action … ▸ separator ▸ action … ▸ overflow
```

| Parte       | Elemento                 | Sempre presente | Para quê                                                                                        |
| ----------- | ------------------------ | --------------- | ------------------------------------------------------------------------------------------------ |
| `root`      | `div`, `role="group"`    | sim             | A barra. É o contentor de consulta (`container-type: inline-size`) e o elemento que cola.        |
| `status`    | `div`                    | não             | A frase ao início: estado sujo, carimbo de hora, contagem. Um slot, não um componente.           |
| `actions`   | `div`                    | sim             | A fila que cede. É aqui que a consulta de contentor decide a coluna.                             |
| `action`    | `div`                    | não             | Uma unidade: o seu posto e o que ela se torna no menu.                                           |
| `separator` | `div`, `role="separator"` | não            | A régua entre duas corridas. É o que separa uma ação destrutiva de uma frequente.                |
| `overflow`  | `button`                 | não             | O gatilho de `menu` que segura o que não coube.                                                  |

`root` é o contentor de consulta e `actions` é o que a consulta reestiliza. É a
divisão que `docs/build-briefing.md` regista em _Decisions already taken_: um
elemento com `container-type: inline-size` é contentor para os descendentes e
não para si próprio, pelo que a regra que empilha tem de apanhar um descendente.
A raiz não precisa de mudar as suas próprias faixas — é um `flex` que embrulha —
por isso não há um elemento extra.

**Não há parte `primary`.** A ação que confirma é um `action` de posto `pinned`,
e a sua posição é o fim da fila. Uma parte própria seria uma segunda maneira de
dizer a mesma coisa, e duas maneiras acabam por discordar.

## 3. O posto

Cinco valores, adaptados dos cinco de `sap.m.OverflowToolbarPriority`:

| Posto    | Cede?                          | Fica no menu? | Para quê                                                        |
| -------- | ------------------------------ | ------------- | ----------------------------------------------------------------- |
| `pinned` | nunca                          | —             | A ação que confirma, e a que cancela quando o produto assim quer. |
| `high`   | depois de `low` e de `hide`    | sim           | Uma ação secundária que se quer manter à vista o máximo possível. |
| `low`    | primeiro entre as que vão para o menu | sim    | O padrão de uma ação secundária.                                  |
| `hide`   | antes de todas                 | **não**       | Um controlo que não vale uma linha de menu: uma marca de rascunho, um carimbo de hora, uma pré-visualização. |
| `always` | nunca está na barra            | sim           | Uma ação rara, que começa e fica no menu.                         |

**Padrões.** Um `action` que declara `counterpart` e não declara posto é `low`.
Um que não declara `counterpart` é `pinned`, pela mesma razão que em `toolbar`:
não ter para onde ir é a definição de ficar. Um posto `high`, `low` ou `always`
sem `counterpart` é um erro do consumidor e a família comporta-se como `pinned`
— falha visível, que é a escolha que `docs/build-briefing.md` pede quando duas
respostas são defensáveis.

**A ordem dentro de um posto** é a da barra, invertida: a última unidade do
posto mais baixo é a primeira a ceder. É a regra de `toolbar` intacta, aplicada
dentro de cada posto em vez de sobre a barra inteira.

### 3.1 O que isto custa a `@slotted/core/overflow`

`collapseState` diz hoje, no seu próprio comentário, que não há prioridade. A
mudança é aditiva e vai num commit próprio, antes da família, como
`docs/build-briefing.md` manda para toda ferramenta partilhada:

- `CollapseUnitInput` ganha `rank?: number`, com `0` por omissão;
- os candidatos passam a ser ordenados por `rank` ascendente e, dentro do mesmo
  posto, por índice descendente — que é exatamente o comportamento de hoje
  quando todos os postos são iguais.

`toolbar` não passa `rank` e não muda de comportamento; o teste existente é a
prova. O comentário do módulo passa a dizer as duas regras e porquê, em vez de
dizer que só há uma.

## 4. O teclado, e a recusa do foco rotativo

**A barra não é um composto de um só _tab stop_.** `Tab` alcança cada ação, pela
ordem do documento. As setas não são ligadas.

A razão: os controlos de uma barra de ações são as ações do próprio formulário
da página. Um leitor que percorre um formulário com `Tab` espera chegar a
`Cancelar` e depois a `Guardar`; um foco rotativo poria a barra inteira num só
_tab stop_ e esconderia `Guardar` atrás de uma seta que nada anuncia.
Primer, Fluent e o APG fazem o contrário porque as suas barras são faixas de
botões de ícone de um editor — dez controlos que ninguém quer percorrer um a um.

**O custo, escrito:** uma barra com dez ações de ícone é dez paragens de `Tab`.
Quem tem uma faixa dessas não tem uma barra de ações: tem uma `toolbar`, e é
essa a família que a serve. A separação entre as duas é a própria resposta ao
custo.

**O papel segue a decisão.** `role="group"`, não `role="toolbar"`: a ARIA 1.2 diz
que `toolbar` é uma subclasse de `group`, e a subclasse é o que se afirma quando
há gestão de foco a declarar. Sem foco rotativo, `group` é o que é verdade. O
nome acessível é do consumidor — `aria-label` ou `aria-labelledby` —, porque só a
página sabe que tarefa a barra termina.

O único teclado que a família escreve é o do gatilho de overflow, e é o de
`menu`: `Enter`, `Space` e `ArrowDown` abrem, `Escape` fecha e devolve o foco ao
gatilho. Nada disso é escrito aqui.

**Comparação item a item com o padrão**, exigida por `references/patterns.md`,
fica em `specs/components/action-bar/contract.json` (chaves `pattern`,
`patternDeparture`, `keyboard`) e na autoavaliação.

## 5. Estado: a família não tem nenhum

Nenhuma capacidade mutável, portanto nenhum `stateModel`. As três candidatas e
porque não são:

- **O conjunto que cedeu** é `overflow`, que `specs/contract.schema.mjs` declara
  deliberadamente não-mutável: é lido do _layout_, e um consumidor que o
  possuísse podia afirmar que a barra cabe quando o navegador diz que não. O
  facto é reportado — `data-collapsed` na raiz e um retorno por mudança.
- **A superfície aberta** é de `menu`. A família declara o estado `open` para o
  gatilho poder ser pintado, sem declarar a capacidade — que é exatamente o que
  `toolbar` faz.
- **`loading` e `disabled`** são do controlo. `button` já mantém rótulo, nome
  acessível e largura sob `loading`.
- **`present`** é uma entrada do consumidor, não um valor que a família mova: a
  barra nunca pede para aparecer nem para sair, e não há nada para cancelar. É a
  mesma forma que `loading` tem em `page`.

## 6. A garantia de que a ação principal não se desloca

É a terceira linha do escopo e é estrutural, não uma recomendação:

- a raiz é um `flex` com `flex-wrap: wrap`;
- `status` é `flex: 1 1 auto` com `min-inline-size: 0`;
- `actions` é `flex: 0 0 auto` e leva `margin-inline-start: auto`.

A fila ancora-se à borda de fim da barra. Uma mensagem que aparece em `status`,
um botão que entra em `loading` e um filtro de permissões que remove um controlo
mexem no que está **antes** da última ação — nunca nela. Em RTL a âncora espelha
com a propriedade lógica.

A cena `stability` do harness mostra o mesmo `stage` em quatro estados — sem
mensagem, com mensagem curta, com mensagem longa, e com uma ação removida — para
que a leitura seja uma comparação e não uma afirmação.

## 7. Colar sem cobrir

`sticky` é um eixo booleano. A regra é uma:

```css
position: sticky;
inset-block-end: var(--slotted-page-sticky-bottom, 0px);
```

`page` publica `--slotted-page-sticky-bottom` no elemento que rola, e é a
decisão que `docs/build-briefing.md` já regista: quem cola por baixo lê a
propriedade e nunca mede o rodapé. Uma `action-bar` colada dentro de uma `page`
com rodapé para **acima** do rodapé; sem `page` à volta, a propriedade não
existe e o `0px` de recurso cola-a ao fim do contentor que rola.

Colada e não fixa, pela razão que `page` já escreveu no seu contrato: uma barra
fixa cobre a última linha de conteúdo e obriga a acolchoar o corpo com um número
que nenhum token explica.

## 8. Empilhar

Abaixo de `24rem` de largura de contentor a fila passa a coluna de largura
inteira, com a ação que confirma em cima. O valor é literal porque
`@container (width < var(--x))` é inválido — regra 4 de
`docs/token-foundation.md`.

A consulta e o script têm de concordar, e há um único lugar onde o número é
escrito: a folha de estilo levanta `--_stacked: 1` em `[data-part='actions']`
dentro da consulta, e o _binding_ lê essa propriedade calculada em vez de
comparar larguras. Enquanto a barra está empilhada a medição não corre e nada
cede: uma coluna tem espaço para todas as ações, e um menu de overflow numa
coluna seria um menu por nada.

A degradação seguinte é a do `flex-wrap`: se o conjunto `pinned` não couber numa
linha, passa a duas. Não há scroll horizontal. Uma ferramenta é um ícone e
revela-se rolando; uma ação é uma frase, e um `Guardar` que se alcança fazendo
scroll horizontal é um `Guardar` que ninguém encontra.

## 8.5 A barra que aparece

Uma barra de ações em massa existe enquanto houver seleção, e uma barra de
gravação contextual enquanto houver alterações por gravar. `present` é uma
entrada booleana, verdadeira por omissão, e `@slotted/core/presence` segura a
barra durante a saída: entra a deslizar de baixo e sai do mesmo modo, com uma
duração da escala de movimento, e só então deixa o DOM.

Carbon deixa a barra sempre no DOM e escreve `aria-hidden` na raiz quando não há
seleção. Os botões lá dentro continuam a ser alcançados por `Tab`, o que põe o
foco numa região que o leitor de ecrã anuncia como ausente. A barra que não está
presente sai do DOM, e o foco que estivesse dentro dela volta ao documento pela
ordem normal.

O que a barra **não** faz ao aparecer: mover o foco. Não é um diálogo, e roubar
o foco a quem está a marcar caixas é o salto que `docs/component-features.md` §11
proíbe pelo nome. O `status` é a região que diz o que mudou; quem precisar de o
anunciar usa `live-announcer` a partir da família que possui a contagem, que é
`table`.

## 9. Eixos e resolução

| Eixo      | Valores                     | Omissão | O que muda                                                       |
| --------- | --------------------------- | ------- | ------------------------------------------------------------------ |
| `variant` | `plain`, `raised`           | `plain` | Se a barra pinta chão e régua de topo, ou herda o de quem a contém. |
| `size`    | `sm`, `md`, `lg`            | `md`    | A altura mínima, o _inset_ e o _gap_ da barra. Nunca os controlos.  |
| `align`   | `end`, `start`, `center`    | `end`   | Onde a fila assenta no espaço que sobra depois de `status`.         |
| `sticky`  | `false`, `true`             | `false` | Se a barra cola ao fim da região que rola.                          |

Resolução, em três degraus, como toda a biblioteca: `prop`, depois o
_provider_, depois a omissão.

A barra passa `size` aos botões que contém através de `buttonDefaults`, que é o
que `button-group` já faz — uma barra `sm` não obriga o consumidor a repetir
`size="sm"` em cada botão, e um botão que o declare continua a ganhar.

## 10. Integração — React

| Pergunta                                                                | Resposta                                                                                                                                              |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Par controlado/não controlado e pedido com razão?                       | **Não aplicável.** A família não tem capacidade mutável — §5. O único facto que muda é a medição, e vai por `onOverflowChange(hidden)`.                 |
| A aplicação fixa os padrões uma vez?                                    | `ActionBarDefaultsProvider` e `useActionBarDefaults`, em `action-bar-defaults.tsx`.                                                                     |
| O consumidor substitui o elemento de cada parte pública?                | `render` em `ActionBar`, `ActionBarStatus`, `ActionBarActions`, `ActionBarAction`, `ActionBarSeparator` e `ActionBarOverflow`.                          |
| O handler do consumidor continua a correr?                              | A família não intercepta evento nenhum dos controlos: eles são do consumidor e a barra só os mede. No gatilho de overflow, `menu` compõe.               |
| Acesso ao elemento nativo e à ação imperativa?                          | `ref` em todas as partes; `menuRef` no gatilho alcança `open`, `close` e `focus` de `menu`. Não há mais nada imperativo por alcançar.                   |
| Renderiza no servidor sem divergência de hidratação?                    | `useId` para o identificador de cada unidade; nenhuma leitura de _layout_ durante o render — a medição corre num efeito.                                |
| Todo o estado que o consumidor pode estilizar está no DOM?              | `data-ui`, `data-part`, `data-variant`, `data-size`, `data-align`, `data-sticky`, `data-collapsed`, `data-priority` e `data-open` no gatilho.           |
| O tipo de props de cada parte é o do elemento nativo, estendido?        | `ComponentPropsWithRef<'div'>` e `ComponentPropsWithRef<'button'>`.                                                                                    |

## 11. Integração — Angular

| Pergunta                                                      | Resposta                                                                                                                                                                  |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valor de duas vias na forma que o ecossistema espera?         | **Não aplicável** — §5. `output()` para `overflowChange`, que reporta um facto.                                                                                            |
| Reactive Forms e `ControlValueAccessor`?                      | **Não aplicável.** A barra não é um controlo e não tem valor. Os controlos dentro dela são do consumidor e ficam nos seus próprios formulários.                            |
| A aplicação fixa os padrões uma vez?                          | `SL_ACTION_BAR_DEFAULTS` e `provideActionBarDefaults()`.                                                                                                                   |
| O template alcança a instância?                               | `exportAs: 'slActionBar'`, e `slActionBarOverflow` para o gatilho.                                                                                                         |
| Conteúdo projetado substituível e preguiçoso?                 | Diretivas sobre os elementos do próprio consumidor (`slActionBarStatus`, `slActionBarAction`…), e `ng-template` + `NgTemplateOutlet` para a contrapartida de menu, que só é instanciada quando a unidade cede. |
| Correto sem zona e com `OnPush`?                              | `signal`/`computed` em toda a família; a medição escreve num `signal` e nada chama `markForCheck`.                                                                          |
| Todas as subscrições e ouvintes desmontados?                  | `DestroyRef` no efeito que cria o `CollapseHandle`, e `handle.destroy()`.                                                                                                  |
| Um atributo estático do consumidor sobrevive aos host bindings? | `HostAttributeToken` para `role` e `aria-label` na raiz: um consumidor que escreva `role="toolbar"` porque tem dez ações de ícone mantém-no.                              |
| Um ponto de entrada que outros dependem continua uma classe?  | `@slotted/angular/action-bar`; `menu` entra por `@slotted/angular/menu`.                                                                                                    |

**A regra das duas diretivas.** O gatilho de overflow é o gatilho de `menu` a
usar a geometria desta família, e `docs/build-briefing.md` já regista o que isso
custa em Angular: `slMenuTriggerFor` escreve `null` no mesmo _slot_ de atributos
e apaga o `data-part` estático. O `data-part="overflow"` é reescrito depois da
primeira deteção de mudanças, com o comentário a nomear a diretiva que o apagou
— e o `ref` de `menu` é composto, nunca substituído, pela razão que a mesma
secção regista.

## 12. O que fica registado noutro lado

- O parágrafo de escopo em `docs/build-order.md`, que a família ainda não tinha.
- O posto em `@slotted/core/overflow`, em commit próprio e antes da família.
