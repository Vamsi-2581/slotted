# Guia de features para uma biblioteca de UI multiframework

Referência agnóstica de framework para bibliotecas React e Angular, com foco em produtos SaaS e aplicações enterprise. A Sirius UI é a baseline de profundidade operacional; as decisões refletem também padrões atuais de bibliotecas headless, design systems e suítes avançadas analisadas em agosto de 2026.

Este não é um inventário de componentes existentes nem uma proposta de API literal. É um contrato de produto: o que cada família precisa entregar, independentemente de JSX, templates Angular, hooks, signals, diretivas ou mecanismo de estilos.

## 1. Escopo e níveis

- **Core:** necessário para uma biblioteca de produto utilizável e coerente.
- **Extended:** recorrente em SaaS/enterprise, mas pode ser entregue depois do núcleo.
- **Specialized:** valioso em domínios específicos; deve ser modular e opcional.

Os nomes `Root`, `Trigger`, `Content`, `Item`, `Label` e semelhantes representam **partes semânticas**, não uma sintaxe de framework. Cada binding escolhe a construção idiomática do seu ecossistema.

## 2. Contrato global

### 2.1 Arquitetura

Separe três camadas:

1. **Comportamento:** estado, teclado, foco, ARIA, coleções, posicionamento e regras de interação.
2. **Binding:** adaptação idiomática para React ou Angular, sem mudar a semântica pública.
3. **Visual:** tokens, recipes, variantes, densidade, motion e partes estilizadas.

Uma implementação pode usar máquinas de estado, hooks, signals ou Web Components internamente. Nenhum deles deve vazar para o contrato comum.

### 2.2 Estado e eventos

Todo estado mutável relevante deve admitir:

- modo controlado: estado atual fornecido pelo consumidor e solicitação correspondente de mudança;
- modo não controlado: valor inicial consumido uma vez e estado mantido pelo componente;
- valor inicial somente no modo não controlado; mudanças posteriores nele não sincronizam o estado silenciosamente;
- solicitação normalizada com novo valor, `reason` enumerado e evento de origem opaco/opcional;
- métodos imperativos apenas para ações inevitáveis, como `focus()`, `open()` e `scrollToKey()`.

Razões típicas: `pointer`, `keyboard`, `clear`, `remove`, `select`, `dismiss`, `escape`, `outsidePress`, `blur`, `submit` e `programmatic`. Evite booleanos ambíguos ou eventos diferentes para a mesma transição.

Solicitações de mudança podem ser canceladas antes do commit. No modo não controlado, o componente altera o estado somente após a solicitação ser aceita; no controlado, apenas notifica e aguarda o novo estado do consumidor. O evento de origem serve para inspeção/cancelamento no binding e não possui tipo comum entre frameworks.

| Conceito comum               | Binding React, por convenção | Binding Angular, por convenção                     |
| ---------------------------- | ---------------------------- | -------------------------------------------------- |
| estado atual + solicitação   | `value` + `onValueChange`    | `[value]` + `(valueChange)` ou integração de forms |
| valor inicial não controlado | `defaultValue`               | input de valor inicial + estado interno            |
| nome e descrição acessíveis  | props ARIA/label             | atributos do host, label e relações por ID         |
| evento de origem             | DOM/SyntheticEvent opcional  | DOM Event opcional no output                       |

Os nomes das duas últimas colunas pertencem aos bindings; não são requisitos da camada comportamental.

### 2.3 Anatomia e composição

- Partes nomeadas e estáveis: `Root`, `Label`, `Description`, `Control`, `Trigger`, `Content`, `Item`, `Indicator`, `Close` e `Footer` quando aplicáveis.
- Conteúdo, ícones e ações podem ser substituídos sem reimplementar comportamento.
- Atributos, listeners e referência ao elemento host devem ser encaminhados com segurança.
- O consumidor pode trocar o elemento semântico de uma parte somente quando preservar teclado, foco e ARIA.
- Exponha `data-ui`, `data-part` e estados semânticos para estilo e teste; classes internas e estrutura DOM não são contrato.

### 2.4 Vocabulário comum de inputs

Use conceitos consistentes, sem obrigar todos os componentes a aceitar todos eles:

- identidade e formulário: identificador estável, nome de submissão e associação ao form;
- conteúdo: label, descrição, placeholder e mensagens empty/loading;
- estado: disabled, readonly, required, invalid, loading e busy;
- aparência: size, density, variant, tone, orientation e width;
- acessibilidade: nome acessível, referências por ID e texto anunciado;
- coleção: items, chave do item, chaves disabled/selected/expanded e modo de seleção;
- overlay: estado aberto, placement, alignment, offset, modalidade, política de dismissal e raiz de portal;
- localização: locale, direção, timezone, calendário, formatadores e mensagens.

Prefira `start`/`end` a `left`/`right`. Não aceite cor arbitrária, objeto CSS-in-JS, adapter de data ou classe de framework como parte do contrato agnóstico.

### 2.5 Estados visuais

Estados são exigidos por capacidade, sem inventar semântica que o componente não possui:

| Capacidade          | Estados esperados                                                     |
| ------------------- | --------------------------------------------------------------------- |
| interação universal | `default`, `hover` quando disponível, `focus-visible`, `disabled`     |
| ação momentânea     | `active/pressed`; `loading/busy` somente se a ação for assíncrona     |
| valor/formulário    | `readonly`, `required`, `invalid` quando suportados semanticamente    |
| seleção             | `selected`, `checked`, `unchecked`, `indeterminate` conforme o modelo |
| disclosure/overlay  | `open/closed`, `expanded/collapsed`                                   |
| drag-and-drop       | `dragging`, `drop-target`, `drop-invalid`                             |

- `focus-visible` não depende apenas de cor e permanece perceptível em temas claros, escuros e alto contraste.
- `disabled` não responde a hover, não dispara ação e preserva legibilidade; prefira controles nativos desabilitados quando possível.
- `readonly` continua focável e copiável; não deve parecer igual a `disabled`.
- `loading` preserva largura, bloqueia ação duplicada e mantém nome acessível.
- `invalid` usa mensagem associada ao controle; cor e ícone sozinhos não bastam.
- Estados simultâneos têm precedência documentada: por exemplo, `disabled` vence `hover`; `invalid` não apaga `focus-visible`.

### 2.6 Tokens e visual

Use três camadas: **primitivos** → **tokens semânticos** → **tokens de componente**.

- Primitivos: cor, tipografia, espaço, tamanho, raio, borda, sombra, opacidade, duração, easing, breakpoint e z-index.
- Semânticos: `surface`, `text`, `border`, `focus`, `interactive`, `selected`, `disabled`, `danger`, `warning`, `success` e `info`.
- Componente: somente ajustes necessários, como altura do controle, padding do botão ou largura do painel.

Requisitos visuais:

- temas claro, escuro, alto contraste e múltiplas marcas sem recompilar componentes;
- densidades `comfortable`, `compact` e `dense`, mantendo a mesma semântica;
- tamanhos coerentes entre controles; alvo de toque de aproximadamente 44 px em contextos touch e nunca abaixo do mínimo WCAG de 24 × 24 CSS px sem espaçamento compensatório;
- texto normal com contraste mínimo 4,5:1; texto grande, ícones funcionais, bordas essenciais e foco com 3:1;
- layout por propriedades lógicas e suporte a RTL;
- motion por tokens, respeitando `prefers-reduced-motion`; animação nunca é necessária para compreender estado.

### 2.7 Responsividade

Responsividade muda **composição e prioridade**, não apenas tamanho:

- toolbar move ações secundárias para overflow;
- filtros extensos podem virar drawer;
- master–detail pode trocar painel lado a lado por navegação ou overlay;
- tabela preserva colunas essenciais e oferece scroll, detalhe de linha ou visão em lista;
- overlay escolhe popover no desktop e sheet/action sheet em viewport estreita quando a tarefa exigir;
- use container queries quando o componente depende do espaço disponível, com fallback documentado.

Nenhum comportamento importante pode depender de hover. O modo responsivo deve poder ser testado deterministicamente.

### 2.8 Acessibilidade

- Prefira HTML nativo; use os padrões do WAI-ARIA APG quando não houver elemento nativo suficiente.
- Todo controle tem nome acessível; label, descrição, erro e contador usam relações por ID estáveis.
- Defina matriz de teclado por família, incluindo setas, `Home`, `End`, `PageUp`, `PageDown`, `Enter`, `Space`, `Escape` e typeahead quando aplicáveis.
- Foco segue a tarefa: entra em modal, permanece contido quando modal, retorna ao acionador e nunca é perdido após remoção de item.
- Seleção múltipla, drag-and-drop e resize têm alternativa por teclado.
- Mensagens assíncronas usam live region adequada sem anúncios duplicados.
- Suporte a zoom de 400%, reflow, alto contraste/forced colors, reduced motion e leitores de tela faz parte do aceite.
- Testes validam comportamento e relações ARIA, não snapshots de markup.

### 2.9 Internacionalização

- `locale` usa BCP 47; direção, timezone e calendário são explícitos quando relevantes.
- Textos internos, pluralização e mensagens vazias/erro são substituíveis por provider e por instância.
- Número, moeda, data e hora são valores de domínio, não strings formatadas.
- Busca, ordenação e typeahead usam comparação sensível ao locale.
- Layout e ícones direcionais espelham em RTL; ícones sem direção permanecem iguais.

### 2.10 Performance e distribuição

- SSR e hidratação não podem gerar IDs ou DOM divergentes.
- Virtualização, lazy loading e paginação são capacidades opcionais de coleções, não componentes paralelos.
- Componentes são tree-shakeable; engines pesadas, exportadores, editores e gráficos vivem em pacotes opcionais.
- Não carregue portal, posicionamento, locale completo ou ícones inteiros quando não usados.
- Exponha versão e estabilidade por pacote, sem transformar licença comercial de uma referência externa em requisito do núcleo.

## 3. Infraestrutura invisível

Estas capacidades sustentam componentes públicos e devem possuir testes próprios.

### Theme e configuração `[Core]`

- **Contrato:** tema, marca, densidade, locale, direção, timezone, reduced motion, raiz de portal e faixa de z-index.
- **Comportamento:** herança por subtree, override por escopo e troca em runtime sem remontar a aplicação.
- **Visual:** emite tokens semânticos; valida combinações de contraste e não acopla componente a paleta bruta.

### Presence `[Core]`

- Mantém conteúdo montado durante animação de saída, sincroniza estado `open/closed` e remove sem perder eventos ou foco.
- Oferece modo `forceMount` para medição, SSR e integrações; respeita reduced motion.

### Focus scope e roving focus `[Core]`

- Contém, restaura e desloca foco em overlays e coleções.
- Roving focus mantém um único item no tab order e suporta orientação, RTL, itens disabled e loop configurável.

### Dismissable layer e portal `[Core]`

- Coordena Escape, clique/press externo, scroll lock, conteúdo inert, pilha de overlays e restauração de foco.
- Não fecha uma camada ancestral ao interagir com overlay descendente; z-index segue uma pilha única.

### Positioner `[Core]`

- Posiciona por âncora, placement, alinhamento, offset, colisão e viewport; atualiza em resize, scroll e mudança de conteúdo.
- O contrato não expõe Floating UI, Popper ou outra engine. Disponibiliza largura da âncora e origem da transformação como tokens de estilo.

### Collection engine `[Core]`

- Modelo comum para itens estáticos/dinâmicos, seções, chaves estáveis, itens disabled, seleção, typeahead e foco.
- Suporta carregamento incremental, estado vazio/erro e virtualização opcional sem mudar IDs ou seleção.

### Drag-and-drop `[Extended]`

- Pointer, touch e teclado; preview, handles, zonas válidas, auto-scroll, cancelamento e anúncio acessível.
- Eventos carregam itens, origem, destino, posição e operação permitida; não dependem da geometria do DOM como modelo de dados.

### Visually hidden e live announcer `[Core]`

- Conteúdo oculto visualmente permanece acessível sem alterar layout.
- Announcer gerencia prioridade, deduplicação e limpeza de mensagens; não vira API de toast.

## 4. Layout e estrutura

### Stack, Inline e Grid `[Core]`

- **Propósito:** composição de layout previsível sem criar uma DSL CSS completa.
- **Contrato:** `gap`, `align`, `justify`, `wrap`, `columns/minItemWidth` e breakpoints limitados por tokens.
- **Visual:** propriedades lógicas, densidade herdada e ausência de margens implícitas. Grid suporta auto-fit; Stack/Inline podem trocar direção responsivamente.

### Container `[Core]`

- Centraliza conteúdo com largura máxima, gutters responsivos e variantes de leitura, formulário e tela ampla.
- Permite largura fluida e nesting; não injeta background, card ou padding vertical de página.

### Divider / Separator `[Core]`

- **Contrato:** orientação, decorativo ou semântico, inset, variante e label opcional.
- Usa `separator` apenas quando comunica divisão; decorativo sai da árvore acessível. Label interrompe a linha sem reduzir contraste.

### Scroll Area `[Extended]`

- Preserva scroll nativo, teclado, touch, momentum, focus e impressão; scrollbar customizada é progressivamente aprimorada.
- **Contrato:** eixo, tamanho máximo, shadows de overflow, evento de alcance e referência para `scrollTo`.
- Não oculta scrollbar em contextos que dependem de descoberta nem cria scroll aninhado sem necessidade.

### Resizable Panels / Splitter `[Extended]`

- **Contrato:** orientação, painéis com `id`, tamanho inicial/mínimo/máximo, colapsável, persistência e evento de resize concluído.
- Handle é operável por teclado, tem separador acessível e oferece reset; double-click pode ajustar ou restaurar.
- Responsivamente pode virar stack, tabs ou master–detail, preservando estado.

### Aspect Ratio `[Extended]`

- Reserva proporção antes do carregamento de mídia e evita layout shift.
- Aceita ratio numérico e conteúdo substituível; não força crop — isso pertence ao componente de imagem.

### Page e Section `[Core]`

- **Page:** largura, gutters, regiões de header/body/footer e estado de carregamento da superfície.
- **Section:** heading associado, descrição, ações e conteúdo; níveis de título derivam do contexto sem saltos.
- Não transformam toda seção em card; separação pode vir de espaço, divider ou superfície.

### Page Header `[Core]`

- **Anatomia:** breadcrumbs/back, eyebrow opcional, título, descrição, metadados, ações primária/secundárias e tabs opcionais.
- **Comportamento:** ações entram em overflow por prioridade; modo sticky/compacto preserva o título acessível.
- Não duplica navegação nem cria dois `h1`; loading usa skeleton com dimensões estáveis.

### Card `[Core]`

- **Contrato:** superfície, padding, orientação, header/media/body/footer e estado selecionado/disabled quando interativo.
- Card inteiro só é clicável quando representa um único destino/ação; ações internas não podem ficar aninhadas no mesmo link/button.
- Visual usa hierarquia e espaço; borda e sombra não são obrigatórias simultaneamente.

### Master–Detail `[Extended]`

- Coordena lista/grade principal e detalhe, seleção por URL/ID, estado vazio e retorno de foco.
- Desktop pode usar painéis; mobile usa navegação ou overlay com back previsível. O detalhe preserva contexto e posição da lista.

### Dashboard Grid `[Extended]`

- Layout responsivo de widgets com tamanhos mínimos, reordenação/redimensionamento opcionais, persistência e modo de edição explícito.
- Widgets mantêm heading, estado vazio/erro/loading e ação de detalhe; drag-and-drop tem alternativa por teclado.

## 5. Ações e comandos

### Button `[Core]`

- **Propósito:** ação momentânea. Use Link para navegação e Toggle para estado persistente.
- **Contrato:** `type`, `variant`, `tone`, `size`, `fullWidth`, `disabled`, `loading`, ícones start/end e evento `press` unificado para pointer/teclado.
- **Visual:** variantes primária, secundária, outline/ghost e danger; uma ação primária por região. Loading mantém label ou nome acessível e largura.
- **Acessibilidade:** elemento nativo, `Space`/`Enter`, foco visível; ícone decorativo não repete o label.

### Icon Button `[Core]`

- Mesmo comportamento de Button, mas exige nome acessível explícito e tooltip quando o significado não é universal.
- Área visual e alvo interativo podem ter tamanhos diferentes; estado loading/pressed não desloca o ícone.

### Link `[Core]`

- **Contrato:** destino, navegação interna/externa, download, estado disabled excepcional e ícone externo.
- É visualmente reconhecível sem depender apenas de cor; suporta visited quando útil. Nova janela é comunicada.
- Não emula botão; ações sem URL usam Button.

### Button Group / Toolbar `[Core]`

- Agrupa ações relacionadas e define espaçamento, orientação e overflow; não altera a semântica individual dos botões.
- Toolbar usa roving focus quando forma um controle composto; labels de grupo e atalhos são anunciáveis.
- Ação primária permanece visível; ações destrutivas não ficam encostadas em ações frequentes sem separação.

### Toggle e Toggle Group `[Extended]`

- Estado `pressed` controlado/não controlado, simples ou múltiplo, orientação e seleção obrigatória opcional.
- `aria-pressed` ou padrão radio conforme semântica; setas navegam no grupo. Não use como substituto visual de Checkbox para formulários.

### Segmented Control `[Extended]`

- Seleção exclusiva entre poucas opções mutuamente excludentes; valor, opções, tamanho, full width e evento de mudança.
- Implementa radio group ou tabs conforme trocar uma configuração ou uma vista. Labels permanecem curtos; overflow vira Select/Tabs scrollável.

### Split Button `[Extended]`

- Ação padrão independente e menu de alternativas; partes `PrimaryAction` e `MenuTrigger` têm nomes acessíveis distintos.
- A escolha no menu pode atualizar a ação padrão apenas quando isso for previsível e persistente.

### Floating Action Button `[Specialized]`

- Uma ação de criação dominante em superfícies mobile; label expandido opcional e posição respeitando safe areas.
- Não cobre conteúdo, não compete com bottom navigation e não aparece só por convenção visual.

### Command Palette `[Extended]`

- Busca rápida de comandos e destinos com grupos, atalhos, histórico, ações assíncronas e subcomandos.
- **Contrato:** itens com ID, label, keywords, group, disabled e handler/destino; query controlável e loading/empty.
- Dialog acessível com combobox/listbox; mantém foco, anuncia resultados e não executa item disabled. Ranking é adaptador substituível.

### Keyboard Shortcut / Kbd `[Extended]`

- Exibe combinação localizada por plataforma e fornece nome acessível; não registra atalhos sozinho.
- Atalhos globais evitam conflitos do navegador/leitor de tela e não disparam dentro de campos editáveis sem intenção explícita.

## 6. Formulários e entrada

### Field e Field Group `[Core]`

- **Anatomia:** Label, Control, Description, Error, Counter e RequiredMark; Group adiciona legend e descrição comum.
- **Contrato:** `required`, `invalid`, `disabled`, `readonly`, orientação e mensagens; IDs e relações são gerados de forma estável.
- Marca de obrigatório é apresentação, não instala validação. Erro aparece após interação/submit conforme política do form e é anunciado uma vez.

### Text Field `[Core]`

- **Contrato:** valor, default, placeholder, autocomplete, inputMode, min/max length, pattern, prefix/suffix, clearable e eventos `input`, `change`, `blur`.
- Variantes semânticas: texto, e-mail, URL, telefone, busca e senha; formatação/máscara é adapter, não string mágica.
- Clear e reveal password são botões focáveis com labels; prefixos não entram no valor. Contador não substitui validação.

### Textarea `[Core]`

- Valor, rows/minRows/maxRows, resize, auto-grow, limites e contador.
- Auto-grow evita saltos excessivos e respeita altura máxima; Enter cria linha, nunca submete implicitamente sem configuração explícita.

### Number Field `[Core]`

- Valor numérico ou vazio, min/max, step, precision, locale, formato/unidade, clamp opcional e botões increment/decrement.
- Parsing aceita edição intermediária sem corromper o valor; formatação ocorre em momento previsível. Setas e PageUp/PageDown ajustam; wheel não muda valor acidentalmente.
- Moeda e percentual são formatações, não tipos numéricos distintos.

### Checkbox `[Core]`

- Estados checked, unchecked e indeterminate; valor controlado/default, disabled, readonly e invalid.
- Label inteiro aumenta alvo; `Space` alterna. Indeterminate é estado visual/semântico explícito, não terceiro valor submetido sem contrato.

### Radio Group `[Core]`

- Seleção exclusiva, orientação, required, disabledKeys, descrição por item e valor controlado/default.
- Setas movem foco e seleção conforme APG; apenas um item entra no tab order. Não permita desmarcar o único valor com click.

### Switch `[Core]`

- Estado binário de efeito imediato; label descreve a configuração, não “sim/não”.
- Usa semântica switch, `Space` alterna e estado on/off é perceptível além de cor/posição. Para confirmação em submit, prefira Checkbox.

### Slider e Range Slider `[Extended]`

- Valor único ou intervalo, min/max/step, orientação, marks, tooltip de valor, escala/formatador e valores mínimos entre thumbs.
- Teclado inclui setas, Home/End e PageUp/PageDown; cada thumb tem label e não se torna inalcançável ao cruzar.
- Input numérico alternativo é recomendado quando precisão é importante.

### Select `[Core]`

- Escolha entre opções conhecidas; simples/múltipla, clearable, placeholder, groups, disabledKeys, loading e empty.
- Trigger abre listbox, exibe seleção e mantém nome acessível. Typeahead busca labels; seleção múltipla define resumo/chips e remoção por teclado.
- Busca opcional dentro do popup: campo no topo da superfície, filtro por adapter, marca do trecho encontrado e contagem anunciada. O popup passa a `dialog` e a listbox desce um elemento, como o padrão Combobox exige de um popup que não é listbox.
- Não inclui entrada de texto livre: o controle nunca recebe texto, e a consulta é transitória — filtra, é esvaziada ao escolher e nunca vira valor. Texto digitado como valor é Combobox.

### Combobox / Autocomplete `[Core]`

- Entrada de texto + coleção filtrada; valor textual e chave selecionada são contratos distintos.
- **Contrato:** query controlada/default, items, selectedKey, allowsCustomValue, debounce, async loading, load more e política de commit.
- Setas navegam sem mover cursor de texto indevidamente; Escape fecha/reverte conforme estado; leitores de tela recebem contagem e item ativo.
- Filtragem, ranking e busca remota são adapters; o componente não assume `contains` nem normalização inglesa.

### MultiSelect / Tags Input `[Extended]`

- Coleção de valores selecionados com busca/criação opcional, limite, duplicatas, reorder e paste de múltiplos valores.
- Chips removíveis têm labels; Backspace remove apenas com input vazio e regra previsível. Overflow resume seleção sem ocultar acesso ao conjunto completo.

### Hierarchical Picker `[Extended]`

- Seleciona em árvore/cascata sem expor uma combinação incoerente de Tree + Select.
- Nós com ID, parent/children, lazy loading, seleção de folha ou ancestral, caminho visível e busca.
- Em viewport estreita pode usar navegação por níveis. TreeSelect e Cascader são recipes do mesmo núcleo, não engines separadas.

### Date Field e Date Picker `[Core]`

- Valor de data sem timezone, locale/calendário, min/max, datas indisponíveis, readonly/required e granularidade.
- Campo segmentado aceita digitação, setas e paste; botão abre calendário. Parsing local implícito não altera valor silenciosamente.
- Calendário tem grid acessível, navegação por mês/ano, foco roving, today destacado separadamente de selected e nomes localizados.

### Date Range Picker `[Extended]`

- `start`/`end`, limite de duração, datas indisponíveis, ranges predefinidos e meses visíveis.
- Estados de início, fim e intervalo são distinguíveis; hover preview não é necessário para touch/teclado. Impede range inválido ou explica ajuste.

### Time e DateTime Picker `[Core]`

- Valor temporal normalizado, granularidade, step, formato 12/24 h e limites.
- Campo segmentado funciona sem abrir painel; painel de hora complementa, não bloqueia digitação. DST e horários inexistentes/ambíguos têm política documentada.
- Era `[Extended]` até 2026-09-10. Passou a `[Core]` porque um formulário que sabe dizer _quando_ precisa da hora: uma biblioteca que entrega o campo de data e não o de hora deixa o consumidor escrever o seu contra o motor de segmentos que ela própria publicou, e nenhuma das bibliotecas pesquisadas separa os dois em níveis diferentes. O custo de adiar era o argumento de Extended — "pode ser entregue depois do núcleo" — e o custo aqui é uma união mais larga e três linhas em `fieldRange`, o que não sustenta a linha. `Date Range Picker` continua `[Extended]`: é uma composição especializada de um valor que o Core já tem, e não um valor que o Core não sabe dizer.
- O timezone explícito saiu deste contrato: o que a biblioteca guarda é o valor de relógio de parede que o leitor escreveu, e converter para um instante é da aplicação, contra o fuso que ela conhece. A razão está em _Decisions already taken_ em `docs/build-briefing.md`.

### PIN / OTP Input `[Extended]`

- Valor único distribuído visualmente, comprimento, tipo numérico/alfanumérico, paste completo, autocomplete one-time-code e masking opcional.
- A implementação não cria seis paradas de foco desnecessárias; erros e leitura por screen reader descrevem um único campo.

### Color Picker `[Specialized]`

- Modelos suportados explícitos, alpha, presets, eyedropper opcional, campos numéricos e preview com contraste.
- Nunca comunica a escolha apenas pela cor; preserva formato de saída definido e não converte gamut silenciosamente.

### Rating `[Specialized]`

- Valor, máximo, step, readonly e label de cada ponto; teclado e touch completos.
- Use somente para avaliação ordinal compreensível; formulário crítico deve oferecer opção textual ou N/A.

### Form `[Core]`

- Coordena submit, reset, validação, touched/dirty, mensagens globais e foco no primeiro erro sem possuir o estado de cada framework.
- Suporta validação sync/async cancelável e servidor; erros de servidor persistem até o campo mudar ou nova submissão.
- Não gera formulários por schema como única via. Composição manual permanece o caminho principal para fluxos complexos.

## 7. Navegação e orientação

### Breadcrumbs `[Core]`

- Lista hierárquica de links com página atual, separador decorativo e colapso responsivo.
- Primeiro/último itens permanecem discerníveis; itens ocultos entram em menu acessível. Não substitui back em fluxo linear.

### Tabs `[Core]`

- Valor ativo controlado/default, orientação, activation mode automática/manual, disabledKeys e lazy/keepAlive.
- Setas/Home/End movem foco; tab e panel são associados. Overflow usa scroll/buttons/menu sem comprimir labels até ilegibilidade.
- Use para vistas pares no mesmo contexto, não para etapas de um processo.

### Pagination `[Core]`

- Página ou cursor, pageSize, total conhecido/desconhecido, limites, labels e evento de mudança.
- Preserva posição/foco de forma previsível; mobile prioriza anterior/próxima e estado atual. Não inventa total quando o servidor não conhece.

### Stepper / Wizard Navigation `[Extended]`

- Etapa atual, estados pending/current/complete/error/disabled, navegação permitida e orientação.
- Indicador não é o wizard inteiro: conteúdo, validação, persistência e ações ficam no padrão Wizard.
- Labels continuam visíveis ou acessíveis; progresso não depende apenas de cor.

### Side Navigation `[Extended]`

- Itens e grupos aninhados, estado expanded/selected, ícones opcionais, badges e modo compacto.
- Seleção deriva da rota; expansão pode ser independente. Mobile vira drawer e retorna foco ao trigger.
- Ícones sem labels só são aceitos em modo compacto com tooltip e descoberta clara.

### Top Navigation / App Bar `[Extended]`

- Regiões de marca, navegação, busca, contexto, ajuda, notificações e conta; prioridades definem colapso.
- Usa landmarks e skip link; não transforma todo header em toolbar com tab stops excessivos.

### Navigation Rail / Bottom Navigation `[Specialized]`

- De três a cinco destinos primários com label persistente e safe areas; seleção segue rota.
- Rail atende larguras intermediárias; bottom navigation é mobile. Não acomoda ações contextuais ou dezenas de destinos.

### Table of Contents / Anchor Nav `[Extended]`

- Links para headings, estado ativo por interseção, scroll offset e atualização de URL opcional.
- Respeita reduced motion, foco após navegação e hierarquia dos headings; mobile pode colapsar em Select/Popover.

### Tour / Coach Marks `[Extended]`

- Etapas com âncora, título, conteúdo, placement, progresso, next/back/skip e condição de disponibilidade.
- Move foco apenas quando apropriado, mantém alternativa sem spotlight e recupera de âncora ausente.
- Persistência/versionamento pertencem ao produto; tour não substitui UX compreensível.

## 8. Disclosure, menus e overlays

### Collapsible e Accordion `[Core]`

- Collapsible controla uma região; Accordion organiza múltiplas seções com seleção simples/múltipla e colapso permitido.
- Trigger é heading/button, `aria-expanded` e relação com panel; setas/Home/End navegam entre headers.
- Anima altura sem medir continuamente e respeita reduced motion; conteúdo fechado define política de montagem.

### Tooltip `[Core]`

- Informação curta, não interativa e suplementar; abre por hover e foco com delays configuráveis e fecha por Escape.
- Não contém ações nem informação essencial. Permanece disponível para teclado, não bloqueia o alvo e usa role tooltip.

### Preview Card / Hover Card `[Extended]`

- Preview rico de link/entidade com conteúdo navegável opcional; trigger continua sendo link ou elemento focável.
- Delay com grace area evita fechamento acidental; touch usa press/click explícito. Não substitui Dialog para tarefa.

### Popover `[Core]`

- Conteúdo interativo não modal ancorado; partes Trigger, Anchor, Content, Arrow, Close e Title/Description opcionais.
- Placement, colisão, foco inicial e retorno são configuráveis. Escape, outside press e Close emitem solicitações com razão; a política aceita ou cancela cada uma. Não captura foco global quando não modal.

### Menu e Menubar `[Core]`

- Ações, checkbox/radio items, grupos, separators, submenus e atalhos; items têm ID, label, disabled e handler.
- Roving focus, typeahead, setas e Escape seguem APG. Submenu possui intent/grace area; ação fecha por padrão.
- Menu não é navegação genérica nem Select; itens representam comandos.

### Context Menu `[Extended]`

- Mesmo núcleo de Menu, aberto por secondary click ou tecla de contexto/Shift+F10 no alvo.
- Ações essenciais também ficam disponíveis por outro caminho; posicionamento por ponto não elimina retorno de foco.

### Dialog `[Core]`

- **Anatomia:** Overlay, Content, Title, Description, Body, Footer, Close.
- **Contrato:** estado atual/inicial de abertura, tamanho, initialFocus, resultado e política cancelável para solicitações `closeButton`, `escape`, `outsidePress` e `programmatic`.
- Modal torna fundo inert, bloqueia scroll, contém e restaura foco. Em mobile pode ocupar tela; conteúdo longo rola no body, não perde footer.

### Alert Dialog `[Core]`

- Confirma ação destrutiva ou decisão irreversível; título e descrição são obrigatórios e foco inicial evita confirmação acidental.
- Outside press não solicita fechamento; Escape só é aceito quando cancelar é seguro. Labels descrevem ações concretas, não “Sim/Não”.

### Drawer / Sheet `[Core]`

- Overlay lateral/inferior para tarefa secundária, detalhe ou filtros; modal ou persistente conforme viewport.
- Lado usa `start/end`, extent com limites, resize opcional, header/body/footer e a mesma política cancelável de fechamento/foco de Dialog.
- Bottom sheet suporta snap points somente quando acrescentam valor e continuam operáveis por teclado.

### Action Sheet `[Extended]`

- Variante mobile de menu com ações curtas, cancelamento explícito e safe area; pode ser modal.
- Não duplica Dialog com formulário nem esconde ação primária frequente.

### Floating Window `[Specialized]`

- Janela modeless com move, resize, minimize/maximize opcional, z-order, limites de viewport e persistência.
- Precisa de operação por teclado, heading e foco previsível; use apenas em aplicações desktop-like que realmente exigem multitarefa.

### Fullscreen `[Extended]`

- Solicita/sai de fullscreen nativo, expõe estado/erro e restaura contexto; label e ícone acompanham o estado.
- Oferece fallback de “expandir no layout” quando API não existe e nunca bloqueia Escape do navegador.

## 9. Feedback e estados

### Alert / Callout / Banner `[Core]`

- Uma família com recipes por alcance: Alert contextual, Callout editorial e Banner de página/sistema.
- **Contrato:** tone, title, description, icon, ações, dismissible, persistência opcional e live behavior.
- `error`, `warning`, `success`, `info` e `neutral` usam texto/ícone além de cor. Alert já presente na montagem normalmente não precisa live region; atualização assíncrona pode precisar.
- Dismiss é ação real, com label; banner crítico não desaparece automaticamente.

### Toast / Notification `[Core]`

- Feedback transitório de uma operação concluída ou evento não bloqueante; não substitui erro junto ao campo nem confirmação crítica.
- **Contrato:** id, tone, title, description, ações, duration, dismissible, placement e política de deduplicação/limite.
- Pausa em hover, foco e documento inativo; ordem e tempo são previsíveis. Ação permanece focável sem fazer o toast sumir durante uso.
- Serviço imperativo é fachada conveniente; também deve existir host declarativo e modelo observável.

### Inline Message `[Core]`

- Mensagem ligada a um campo, seção ou ação: ajuda, erro, warning, success ou progresso.
- Possui ID estável e política de anúncio; não cria layout shift severo nem usa tooltip para erro obrigatório.

### Progress Indicator `[Core]`

- Uma família comportamental com recipes linear, circular e spinner.
- **Contrato:** determinado (`value`, min/max) ou indeterminado, label, valueText, size e delay antes de aparecer.
- Determinado anuncia progresso com moderação; indeterminado comunica tarefa em andamento. Spinner isolado exige nome acessível ou fica oculto quando o texto vizinho já nomeia.
- Não use spinner para conteúdo com estrutura conhecida: prefira Skeleton.

### Skeleton `[Core]`

- Reserva a geometria aproximada do conteúdo, com recipes de texto, avatar, bloco e composição.
- Fica oculto da árvore acessível; a região anuncia loading uma vez. Motion respeita reduced motion e não imita conteúdo real com detalhe excessivo.

### Empty / Error / Result State `[Core]`

- Uma família visual com semânticas distintas: ausência de dados, nenhum resultado de filtro, falha recuperável, permissão negada, offline e conclusão.
- **Anatomia:** ícone/ilustração opcional, título, descrição, ação primária e secundária.
- Texto explica contexto e próximo passo; “nenhum resultado” oferece limpar filtros. Erro preserva dados válidos e retry quando possível.
- Ilustração não domina telas operacionais densas; estado compacto existe para card, painel e célula.

### Loading Overlay `[Extended]`

- Bloqueia temporariamente uma região mantendo sua geometria; escopo, label, progress e cancelamento opcional.
- Usa somente quando interação parcial seria insegura. Não torna a página inteira inacessível para uma operação local.

### Status Indicator `[Core]`

- Ponto, ícone ou label curto para estado operacional; sempre tem texto acessível e alternativa não cromática.
- Presença/pulse só anima para mudança viva relevante e respeita reduced motion.

## 10. Identidade, metadados e conteúdo

### Typography `[Core]`

- **Text:** elemento semântico, size, weight, tone, align, transform, wrap, truncate/line-clamp e números tabulares; truncamento sempre permite acesso ao conteúdo completo quando ele importa.
- **Heading:** nível semântico separado do estilo visual, balance opcional e ID/anchor; contexto pode sugerir, mas nunca saltar a hierarquia silenciosamente.
- **Prose:** recipe para conteúdo editorial/gerado com ritmo de headings, listas, links, tabelas, quotes e código; não sanitiza conteúdo por conta própria.

### Icon `[Core]`

- Registry tree-shakeable, tamanho, stroke/fill, tone e mirror em RTL somente para ícones direcionais.
- Decorativo fica oculto; significativo exige label ou texto adjacente. Não aceita HTML/SVG não sanitizado de fonte remota.

### Avatar e Avatar Group `[Core]`

- **Contrato:** source, alt/name, initials, fallback icon, size, shape, tone determinístico e status/badge opcional.
- Ordem de fallback: imagem válida → iniciais → ícone; falha de imagem não expõe ícone quebrado. Imagem decorativa usa alt vazio quando o nome adjacente já identifica.
- Group controla overlap, limite e resumo “+N”; membros continuam identificáveis por tooltip/lista acessível.

### Badge `[Core]`

- Contagem, status ou metadado curto não editável; variantes solid/soft/outline, tone, size, dot e max count.
- Contagem atualizada define política de anúncio; zero pode ocultar ou aparecer conforme significado. Não use Badge como botão sem semântica explícita.

### Tag / Chip `[Core]`

- Representa entidade, filtro ou valor compacto; pode ser estático, selecionável, removível ou navegável — nunca vários comportamentos implícitos ao mesmo tempo.
- **Contrato:** label, tone, selected, disabled, removeLabel, avatar/icon e eventos press/remove separados.
- Remoção é operável por teclado e devolve foco ao item lógico seguinte; tag input segue regras próprias de coleção.

### Description List `[Core]`

- Pares termo–descrição em uma ou mais colunas; suporta grupos, ações e estados vazios sem perder `<dl>/<dt>/<dd>` ou equivalente semântico.
- Labels e valores alinham pela leitura, não por tabela visual rígida; mobile empilha. Valores longos podem copiar/revelar, não truncar sem acesso.

### List e List Item `[Core]`

- Lista estática ou interativa com leading visual, conteúdo, metadados, trailing action e estados selected/disabled/loading.
- Item com uma ação pode ser todo acionável; múltiplas ações exigem alvos independentes e foco claro. Coleção interativa usa Listbox/Grid conforme semântica, não `role=list` com teclado inventado.

### Timeline / Activity Feed `[Extended]`

- Eventos ordenados com timestamp, ator, título, descrição, ícone/status e conteúdo expansível.
- **Contrato:** orientação, agrupamento por período, loading incremental e marcador atual.
- Ordem temporal e timezone são explícitos; visual da linha não substitui lista/heading semânticos. Activity feed oferece novos itens, filtros e ações apenas quando necessárias.

### Highlight / Search Match `[Extended]`

- Realça trechos encontrados preservando texto original, diacríticos e leitura por screen reader.
- Recebe ranges ou matcher substituível; não injeta HTML e não usa marcação quando query está vazia.

### Markdown Renderer `[Extended]`

- Renderização segura com allowlist de elementos/URLs, headings com IDs estáveis, links externos, tabelas, código e conteúdo vazio/erro.
- Sanitização é obrigatória; plugins são opt-in. Estilo tipográfico é escopado e impressão/cópia continuam funcionais.

### Code Block `[Extended]`

- Linguagem, destaque, números de linha opcionais, wrap, copy, filename e linhas destacadas.
- Código permanece texto copiável; contraste e foco do scroll são adequados. Highlight engine é pacote opcional.

## 11. Coleções e seleção

### Listbox `[Core]`

- Primitivo de seleção para Select, Combobox e pickers; items/sections, selectionMode, selectedKeys, disabledKeys e typeahead.
- Roving focus ou `aria-activedescendant`, Home/End, seleção por teclado e foco virtualizado são coerentes. Não é apresentado isoladamente sem label/contexto.

### Tree `[Extended]`

- Nós com `id`, children ou `hasChildren`, label, icon, disabled e metadata; expanded/selected/check states independentes.
- Setas navegam hierarquia; Home/End e typeahead funcionam; lazy loading mantém foco e anuncia progresso.
- Seleção simples/múltipla/check cascade define regras de pais/filhos explicitamente. Drag, edição e virtualização são capacidades opcionais.

### Transfer / Dual List `[Extended]`

- Move itens entre disponíveis e selecionados, com busca, contagens, seleção em massa, disabled e ordem opcional.
- **Contrato:** sourceItems, targetKeys, selectedKeys por painel e evento de move com direção/reason.
- Não use para poucas escolhas — Checkbox/MultiSelect é mais simples. Mobile pode virar duas etapas; ações têm labels além de setas.

### Entity Picker `[Extended]`

- Combobox orientado a entidades remotas, com busca, resultado rico, filtros, criação opcional, recente/favoritos e seleção simples/múltipla.
- Valor público é ID/objeto normalizado; query, paginação e resolução de IDs são adapters. Resultado mostra identificadores suficientes para desambiguar pessoas, clientes ou recursos.

### Selection Toolbar / Bulk Action Bar `[Extended]`

- Surge quando existe seleção, mostra contagem, select-all do conjunto filtrado, clear e ações permitidas.
- Diferencia “itens desta página” de “todos os resultados”; ações destrutivas confirmam escopo. Foco e layout não saltam inesperadamente.

## 12. Tabelas e dados densos

### Table `[Core]`

- Tabela semântica para dados tabulares moderados; caption/label, columns, rows, header/footer, alinhamento por tipo e estado vazio/loading.
- Ordenação simples, seleção e ação de linha podem ser capabilities, mas não justificam transformar toda Table em Data Grid.
- Header usa `scope`; ordenação anuncia direção. Conteúdo truncado continua acessível e números alinham por tabular figures quando disponíveis.
- Responsivo: scroll com affordance, colunas prioritárias ou recipe Data List; nunca converte células em cards sem labels.

### Data Grid `[Extended]`

- Subsistema para grande volume e interação rica; comportamento deve ser modular.
- **Dados:** `rowId`, rows/dataSource, columns, totalCount conhecido/desconhecido, estado de query controlado e atualização incremental.
- **Colunas:** id, label, type, align, width/min/max, sortable, filterable, editable, hidden, pinned, renderer/editor e value accessor/formatter.
- **Query:** sorting múltiplo, filtros tipados, busca, paginação por página/cursor e grouping; servidor e cliente usam o mesmo modelo serializável.
- **Interação:** seleção single/multiple/range, select-all filtrado, row activation separado de selection, teclado em células/linhas, resize, reorder, show/hide, pin e autofit.
- **Edição:** cell/row mode, validação sync/async, commit/cancel, conflito e optimistic update; erro não descarta valor digitado.
- **Escala:** virtualização de linha/coluna opcional, overscan, altura variável com limites e loading incremental; foco e IDs sobrevivem à reciclagem.
- **Visual:** density, sticky header, column manager, row detail e aggregate footer. Hover actions também aparecem por foco.
- **Acessibilidade:** escolha explícita entre table e grid pattern; setas, Home/End/Page, headers operáveis, `aria-sort`, contagens e seleção anunciadas.
- Exportação, charts, pivot e Excel ficam em adapters/pacotes; não pesam no núcleo.

### Tree Grid `[Specialized]`

- Combina hierarquia e colunas; nós, parent/children, expansion, lazy loading e seleção seguem Tree, enquanto colunas seguem Data Grid.
- Primeira coluna identifica nível/expander; teclado integra setas horizontais de expansão e verticais de navegação.

### Data List `[Extended]`

- Recipe responsivo para conjuntos tabulares pequenos quando uma tabela não cabe; cada item mostra labels e valores prioritários.
- Mantém ordenação/filtros/seleção do modelo de dados, mas não finge oferecer navegação de grid.

### Column Manager `[Extended]`

- Lista pesquisável de colunas, visibilidade, ordem, pin e reset; impede ocultar colunas obrigatórias.
- Alterações podem aplicar ao vivo ou em confirmação, mas a política é consistente; preferências são serializáveis e versionadas.

### Filter Builder `[Extended]`

- Regras tipadas por campo: operador, valor, grupos AND/OR, presets, validação e serialização.
- Operadores dependem do tipo; valores usam controles apropriados. Expressão textual legível resume o filtro e permite remover regras pelo teclado.

### Pivot Grid `[Specialized]`

- Dimensões, medidas, agregações, rows/columns, drill-down, totals, reorder e estado serializável.
- Exige virtualização e acessibilidade específicas; versão simplificada não deve ser chamada de pivot. Export e chart são integrações opcionais.

### Spreadsheet `[Specialized]`

- Grade editável com seleção/range, fórmulas, fill, clipboard, undo/redo, formatos, sheets e import/export.
- É produto próprio, não variante de Data Grid. Precisa de modelo de cálculo, segurança contra fórmulas maliciosas e alternativas de teclado/leitor de tela documentadas.

## 13. Visualização de dados

### Chart System `[Extended]`

- **Contrato comum:** data, series, dimensions, measures, encodings, scales, axes, legend, tooltip, annotations, locale e events.
- Estados empty/loading/error/no-data são nativos. Cores vêm de escala semântica e continuam distinguíveis com deficiência cromática.
- Resize é responsivo; labels não colidem silenciosamente. Todo chart oferece resumo e alternativa tabular acessível.
- Tooltip aparece por pointer e teclado; seleção/zoom/brush têm reset e anúncio. Engine gráfica é adapter opcional.

Escolha o tipo pela pergunta:

| Tipo              | Use para                           | Evite quando                                   |
| ----------------- | ---------------------------------- | ---------------------------------------------- |
| Linha/área        | tendência e séries temporais       | eixo temporal irregular não tratado            |
| Barras/colunas    | comparação e ranking               | dezenas de categorias sem scroll/agregação     |
| Barras empilhadas | composição e total                 | comparar segmentos intermediários com precisão |
| Scatter/bubble    | relação, distribuição e outliers   | tamanho/cor não têm legenda clara              |
| Heatmap           | matriz, intensidade e sazonalidade | células são poucas e leitura textual é melhor  |
| Pie/donut         | poucas partes de um total          | muitas fatias, negativos ou comparação precisa |
| Treemap           | hierarquia e proporção             | valores próximos precisam ser comparados       |
| Funnel            | redução sequencial real            | etapas não formam o mesmo fluxo/coorte         |

### Sparkline `[Extended]`

- Tendência compacta dentro de stat/tabela; data, tipo line/bar, reference, trend tone e descrição textual.
- Não possui eixos interativos nem substitui chart completo. Deve comunicar último valor/tendência fora da forma visual.

### Stat / KPI Card `[Extended]`

- Label, valor, unidade, delta, período, trend, comparação, sparkline, status e ação de detalhe.
- Distingue aumento de “bom”: tone deriva da semântica da métrica, não do sinal matemático. Loading/erro preservam layout.

### Gauge / Bullet `[Specialized]`

- Gauge mostra posição contra faixa quando contexto justifica espaço; Bullet compara valor, meta e ranges com maior eficiência.
- Min/max/meta/unidade são explícitos e há valor textual. Não use velocímetro decorativo para KPI simples.

### Map `[Specialized]`

- Viewport, layers, markers, clusters, selection, search, legend, controls e evento de feature; provider cartográfico é adapter.
- Teclado, lista alternativa, attribution, contraste e reduced motion são obrigatórios. Não carrega mapa pesado até a região ser necessária.

### Diagram / Flow Editor `[Specialized]`

- Nós, portas, edges, groups, viewport, seleção, pan/zoom, connect, validation, minimap e undo/redo.
- Operações possuem alternativa por teclado e modelo serializável independente do renderer. Auto-layout é plugin; conexões inválidas explicam o motivo.

## 14. Arquivos, mídia e edição

### Image `[Extended]`

- Source/srcset, alt, aspect ratio, fit, position, loading, fallback e estado error.
- Reserva espaço, usa lazy loading quando apropriado e não repete caption no alt. Zoom/preview é capability separada.

### Carousel `[Specialized]`

- Slides, active index, loop, autoplay opcional, controls, indicators, orientation e drag.
- Pausa por interação/hover/foco, respeita reduced motion e oferece anterior/próximo por teclado. Autoplay nunca é default em produto operacional.
- Conteúdo essencial não fica acessível apenas por swipe.

### Upload `[Core]`

- Uma família substitui File Input, Dropzone e Upload Manager duplicados.
- **Partes:** Trigger/Input, Dropzone, FileList, FileItem, Preview, Progress, Retry, Remove e ValidationMessage.
- **Contrato:** files controlados/default, accept, multiple, min/max count, max size, directory opcional, disabled, validation e upload adapter.
- **Fluxo:** seleção, validação, queued, uploading, paused, success, error, canceled; retry/cancel/remove são eventos distintos.
- Drag-and-drop tem alternativa de botão; erros são por arquivo; preview limpa object URLs. Chunking, resumable e vírus scan são capabilities de adapter.

### Rich Text Editor `[Specialized]`

- Documento estruturado, toolbar, headings, listas, links, mídia, tabelas opcionais, history, paste sanitizado e modo readonly.
- Valor usa schema/AST ou HTML sanitizado explicitamente versionado; plugins declaram comandos e nós.
- Teclado, headings, labels de toolbar e anúncio de estado são completos. Não use contenteditable cru como contrato.

### Code Editor `[Specialized]`

- Value, language, theme, readonly, diagnostics, completion, formatting, diff e model URI; engine é carregada sob demanda.
- Oferece textarea/fallback acessível, atalhos documentados e opção de escapar do tab trapping.

### Document / PDF Viewer `[Specialized]`

- Source, page, zoom, fit, search, thumbnails, outline, rotate, download/print e seleção de texto.
- Loading/erro/password são estados explícitos; navegação por teclado e texto alternativo/OCR dependem do documento e são comunicados.

### Audio / Video Player `[Specialized]`

- Source/tracks, captions, transcript, controls, volume, speed, picture-in-picture/fullscreen e estado de rede.
- Teclado, labels, contraste e captions são obrigatórios; autoplay com som é proibido. Player nativo é o fallback.

### Barcode / QR Code `[Specialized]`

- Valor, formato, correção, tamanho, quiet zone, foreground/background e label/valor textual alternativo.
- Valida capacidade do formato e contraste; não trata QR como controle clicável nem esconde dado essencial apenas na imagem.

## 15. Padrões compostos para SaaS e enterprise

Padrões usam os componentes anteriores; não devem criar uma segunda implementação de comportamento.

### App Shell `[Core]`

- Skip link, header, side nav/rail, main, breadcrumbs/contexto e regiões de overlay/toast.
- Suporta navegação responsiva, sessão, tenant/workspace e permissões sem acoplar autenticação ao design system.
- Persistência de sidebar e densidade é preferência do produto; landmarks e ordem de foco permanecem corretos.

### Action Bar `[Core]`

- Ações de uma página/painel com primária, secundárias, danger e overflow por prioridade.
- Pode ficar sticky sem cobrir conteúdo; dirty state, loading e permissões não deslocam ações principais.

### Filter Bar `[Extended]`

- Busca, filtros rápidos, filtros avançados, chips ativos, contagem, apply/clear, presets e estado serializável na URL.
- Desktop expande campos prioritários; mobile usa drawer. Clear diferencia filtro atual de default obrigatório.

### Data Entry Form `[Core]`

- Seções com headings, grid responsivo, ajuda contextual, validação, dirty state, autosave opcional, ações e resumo de erros.
- Campos condicionais derivam validade do modelo, não da visibilidade. Ao ocultar, política de manter/resetar valor é explícita.
- Submit duplicado é bloqueado; sair com mudanças pede confirmação somente quando há perda real.

### Wizard `[Extended]`

- Etapas, dados acumulados, validação por etapa, back/next/submit, save draft, retomada e erro global.
- Navegação direta depende de etapas concluídas; estado vive fora do Stepper. URL/reload e recuperação são políticas explícitas para fluxos longos.

### CRUD List `[Core]`

- Page Header + Filter Bar + Table/Data Grid + Pagination + Bulk Actions + Empty/Error + create/edit/detail.
- Estado de query é único e serializável; retorno de detalhe preserva filtros, página, seleção e scroll.

### Detail / Inspect Panel `[Extended]`

- Resumo, metadados, status, tabs/sections, ações e histórico; abre em página, drawer ou master–detail conforme profundidade.
- URL e foco tornam abertura compartilhável e reversível; painel raso não tenta hospedar fluxo longo de edição.

### Notification Center `[Extended]`

- Lista persistente de notificações com unread/read, grupos, filtros, mark all, ações e paginação incremental.
- Badge, popover e página completa compartilham o mesmo modelo; live updates não roubam foco nem reordenam enquanto o usuário lê.

### Audit Log `[Extended]`

- Evento imutável com ator, ação, alvo, timestamp/timezone, origem e diff acessível.
- Busca/filtro/export são adapters; dados sensíveis e IDs técnicos seguem política de permissão. Diff tem versão textual e não depende apenas de vermelho/verde.

### Permission Matrix `[Specialized]`

- Recursos × papéis/ações, estados allow/deny/inherited/indeterminate, busca, grupos e mudanças pendentes.
- Bulk edit deixa escopo explícito, confirma efeitos amplos e oferece revisão antes de salvar. Tabela acessível e resumo textual são obrigatórios.

### Workflow / Process Tracker `[Extended]`

- Etapas atuais/concluídas/bloqueadas, responsáveis, prazos, transições e histórico.
- Distingue visão de progresso de editor de workflow; ações inválidas explicam pré-condições. Timeline/Stepper são recipes visuais possíveis.

### Import / Export Job Center `[Extended]`

- Jobs com tipo, arquivo, progresso, status, erros por linha, cancel/retry e download do resultado.
- Operação continua fora da página; toast apenas aponta para o job. Expiração e permissões do arquivo são comunicadas.

### Search Results `[Extended]`

- Query, escopo, filtros, ordenação, facets, sugestões, resultados, highlight, paginação/infinite load e estados sem resultado/erro.
- Mantém URL e foco, anuncia contagem sem verbosidade e oferece correção de query sem substituir silenciosamente.

## 16. Componentes especializados

### Event Calendar / Agenda `[Extended]`

- Vistas month/week/day/list, timezone, eventos, all-day, recurrence, navegação temporal, filtros e abertura de detalhe.
- Seleção de data/range é opcional; eventos sobrepostos e DST têm política explícita. Não deriva de Date Picker, cujo propósito é entrada de valor.
- Em telas estreitas prioriza agenda/lista; cada evento é acessível sem depender de posição ou cor.

### Resource Scheduler `[Specialized]`

- Acrescenta recursos, disponibilidade, create/edit, drag/resize, conflitos, recurrence avançada, virtualização e vistas de timeline.
- Toda ação de pointer tem alternativa por dialog/teclado; optimistic update e conflito preservam a edição do usuário.
- Modelo de recursos, calendário de trabalho e regras de conflito pertencem ao pacote, não ao Event Calendar comum.

### Kanban `[Specialized]`

- Colunas, cards, swimlanes, WIP limits, seleção, filtro, drag/reorder e loading incremental.
- Move por teclado/menu alternativo, anuncia origem/destino e trata optimistic update/conflito. Virtualização preserva ordem lógica.

### Gantt `[Specialized]`

- Tarefas hierárquicas, duração, dependências, milestones, baseline, recursos, critical path, zoom e calendário de trabalho.
- Grid e timeline compartilham seleção/foco; edição e dependências têm alternativa não gráfica. É pacote próprio, não Chart genérico.

### Organizational Chart `[Specialized]`

- Hierarquia, expansão, busca, zoom/pan, seleção e detalhe; layouts grandes usam virtualização ou progressive disclosure.
- Oferece Tree/List alternativa e não transmite reporting line somente pela geometria.

### AI Conversation `[Specialized]`

- **Partes:** Conversation, Message, Prompt Composer, Attachments, Tool/Reasoning Status, Sources, Actions e Scroll Anchor.
- **Contrato:** mensagens com IDs/roles/content parts, streaming, status, stop, retry, edit/resubmit, feedback, citations e errors.
- Preserva conteúdo parcial em erro, anuncia streaming sem ler token a token e mantém controle de scroll quando o usuário sobe.
- Tool calls e reasoning mostram estado útil sem expor dados sensíveis; fontes são navegáveis. Modelo/provider fica fora do componente.

### Prompt Composer `[Specialized]`

- Entrada multiline, submit/stop, attachments, mention/commands, voice opcional, token/size limits e status de disponibilidade.
- Enter/Shift+Enter são configuráveis e visíveis; submit não ocorre durante composição IME. Upload e validação reutilizam componentes existentes.

### Speech Input `[Specialized]`

- Start/stop, permissão, listening, partial/final transcript, locale, error e fallback manual.
- Indicador claro de gravação e privacidade; nunca inicia sem ação explícita. Transcript pode ser revisado antes de enviar.

## 17. Decisões sobre a baseline Sirius UI

### Manter e generalizar

- **Tokens CSS em runtime, densidade, superfícies, marcas e contraste:** boa base; renomear para papéis neutros da nova biblioteca.
- **Field shell e separação entre required mark e validação:** manter como contrato global de Field.
- **Overlay stack, focus, dismissal e serviços de dialog/drawer/toast:** manter comportamento; oferecer API declarativa e fachada imperativa.
- **Profundidade de Table, Date/Time, Upload, Filter Bar e Action Bar:** preservar capacidades, redistribuindo responsabilidades.
- **Stories orientadas a estados, edge cases, contexto e theming:** usar como formato mínimo de documentação e aceite.

### Consolidar

- `dropzone`, `file-input` e `upload` viram partes/recipes da família **Upload**.
- `loader`, `spinner` e `progress` viram recipes de **Progress Indicator**; **Skeleton** permanece separado por representar estrutura.
- `empty-state` e `error-state` compartilham a família visual **Result State**, mantendo semânticas e mensagens distintas.
- `select`, `combobox`, `listbox`, `tree select` e transfer reutilizam **Collection Engine**, sem forçar a mesma UX.
- `badge` e `tag` compartilham tokens, mas continuam componentes diferentes: Badge comunica metadata/status; Tag representa valor/entidade.

### Dividir

- A `table` da Sirius deve virar **Table**, **Data Grid** e plugins de filter/export/column manager; um único bundle não deve carregar tudo.
- `chart` deve ser contrato + adapters de engine; Sparkline e Stat permanecem recipes leves.
- Campos CPF, CNPJ, CEP, telefone e moeda pertencem a pacote de locale/domínio brasileiro construído sobre Field e adapters de formato/validação, não ao core global.
- `page`, `page-header`, `page-info`, `section` e `actionbar` formam padrões de composição; não precisam compartilhar uma classe base visual.

### Não perpetuar

- APIs públicas Angular como signals, injection tokens ou content projection no contrato comum. `ControlValueAccessor` também não integra esse contrato, mas o binding Angular deve implementá-lo para Reactive Forms/ngModel quando aplicável.
- Serviços imperativos como única forma de abrir overlays.
- Strings PT-BR fixas dentro de componentes; toda mensagem vem da camada de locale.
- `mask` como mini-linguagem acoplada ao Text Field; use adapters tipados de parse/format/validate.
- exportadores XLSX/PDF e engine ECharts dentro do bundle principal.
- breakpoint e responsividade definidos isoladamente por componente sem contrato comum.
- referências globais a PrimeNG/Nebular ou estilos de terceiros dentro do design system.
- `console.*`, TODOs de comportamento e estados ARIA implícitos como parte aceitável de um componente publicado.

## 18. Critérios de pronto por componente

Um componente só está completo quando possui:

1. propósito, casos de uso e antiuso;
2. anatomia e partes públicas estáveis;
3. contrato controlado/não controlado e eventos com razão;
4. matriz de estados e combinações;
5. teclado, foco, ARIA, touch e leitor de tela documentados/testados;
6. recipes de size/density/variant/tone via tokens;
7. comportamento responsivo, RTL, locale e reduced motion;
8. loading, empty, error, disabled e conteúdo extremo quando aplicáveis;
9. SSR/hidratação, performance e virtualização avaliados;
10. exemplos básicos, composição real, edge cases, theming e uso em contexto;
11. testes de comportamento compartilhados entre bindings React e Angular;
12. changelog, estabilidade e estratégia de migração para quebra de contrato.

## 19. Fontes analisadas

### Baseline local

- `libs/sirius-ui/src/components/` — implementação, stories e contratos da Sirius UI.
- `libs/sirius-ui/src/styles/sirius/` — tokens, densidade, superfícies, marcas e contraste.
- `libs/sirius-ui/src/public-api.ts` — superfície pública atual.

### Comportamento, composição e acessibilidade

- [Base UI](https://base-ui.com/react/overview/accessibility)
- [React Aria Components](https://react-spectrum.adobe.com/react-aria/components.html)
- [React Aria Collections](https://react-spectrum.adobe.com/react-aria/collections.html)
- [Ark UI](https://ark-ui.com/docs/overview/about)
- [Bits UI](https://bits-ui.com/docs/state-management)
- [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [Chakra UI v3](https://chakra-ui.com/docs/theming/overview)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [HeroUI](https://www.heroui.com/docs/react/components/table)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)

### Normas

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) — contraste, reflow, foco, target size mínimo de 24 × 24 CSS px e critério enhanced de 44 × 44 CSS px.
- [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) e [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) — roles, estados, propriedades e padrões de teclado.
- [W3C Internationalization: direção de texto](https://www.w3.org/International/questions/qa-html-dir) — `dir`, bidi e conteúdo RTL.
- [CSS Logical Properties](https://www.w3.org/TR/css-logical-1/) e [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/) — layout lógico e forced colors.

### Design systems e suítes de produto

- [React Spectrum](https://react-spectrum.adobe.com/react-spectrum/getting-started.html)
- [Mantine](https://mantine.dev/x/extensions/)
- [MUI Core](https://mui.com/material-ui/getting-started/supported-components/)
- [MUI X](https://mui.com/x/introduction/)
- [Ant Design](https://ant.design/components/overview/)
- [Fluent UI](https://fluent2.microsoft.design/components/web/react/)
- [Carbon Design System](https://carbondesignsystem.com/components/data-table/usage/)
- [Vaadin Components](https://vaadin.com/docs/latest/components)
- [UI5 Web Components](https://ui5.github.io/webcomponents/)
- [PatternFly](https://www.patternfly.org/components/all-components)
- [Kendo UI](https://www.telerik.com/kendo-angular-ui/components)

As fontes serviram para comparar capacidades e padrões. Nomes, APIs, modelos comerciais e detalhes específicos de framework não foram copiados como contrato. Consulta realizada em 31 de agosto de 2026.
