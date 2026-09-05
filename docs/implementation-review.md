# Anotações de revisões, para ajustes de UI, usabilidade, correções de bugs graves, etc.


marcadores:
- (S) -> Severe problem
- #Component:checkbox-number -> menciona um problema existente em outro componente que também ocorre neste componente.
= (MAOC) -> may affect other components

## Geral

[ ] Em varios lugares o componente button ou icon button é usado dentro de outros componentes, como botões de limpezas, actions padrão, etc. Mas isso não é obrigatorio. Muitas vezes o componente de botão nem se encaixa para ser utilizado nessas situações dentro dos componentes, não combina.
[ ] Em muitos componentes para representar status de 'active' a IA coloca rails laterais, isso está no conjunto de itens que são AI-Slop e deveriam ser evitados como parte do design.
[ ] O ring de focus de alguns elementos em modo dark (botoes por exemplo) estão com cor branca, e nao na cor primary
[ ] Icones usados nos storybooks e em icones padrão da biblioteca foram desenhados a mão? não gosto muito disso


## Buttons e ButtonGroup

[ ] O feedback de click de botão não me agrada, talvez algo mais bem elaborado, mais bem feito, pegando ideias melhores?
[ ] O estado de hover, com a cor escurecendo não me agrada, as cores ficando mais escuras é feio. Procure algo mais bem feito.
[ ] O estado Unavailable se parece muito com o estado solid secondary, precisamos melhorar isso.
[ ] O spinner de icon button no loading está feio, fino, esquisito, melhore.
[ ] No button group quero remover a opção de separation, ele me desagrada não encaixou muito bem, prefiro deixar de fora por enquanto.
[ ] Button toggle está com pouca diferença, quase não consigo perceber a diferença visual entre os estados.

## Alert

[ ] Os icones do lado esquerdo me desagradam, esse icone solto na surface não me agrada, em todas as formas. E isso afeta varios lugares que os usam da mesma forma, em result state, toast, alert dialog, e varios outros lugares que usam esse tipo de icone. Precisamos pensar em um design mais elegante, mais bem feita.


## AvatarGroup

[ ] Em avatar group não temos nenhum estilo especial para o avatar que está em hover, que o destaque dos demais (alem do deslocamento vertical). Precisamos refinar esse design, animação e etc.


## Badge

[ ] Precisamos garantir que o badge possui uma maneira de modificar o offset da distancia de um badge quando ele é posicionado no canto de algum item (algum avatar por exemplo) pois nem sempre o badge fica perfeitamente posicionado e precisa de ajustes manuais nesse offset.

## Breadcrumb

[ ] O "botão" de expand está terrivel, ele não se encaixa bem no design do breadcrumb, suspeito que tenha a ver com #Geral:1, precisamos refinar esse design pois o alinhamento e design disso está pessimo, esse ellipsis.

## Card

[ ] As variações com checkboxes e radios estão muito feias, esses radios e checkbox mal estilizados, feios, mal feitos, mal posicionados, faltou capricho. (isso pode ter a ver com mudanças nos componentes de radio e checkbox também)


## Checkbox, Checkbox group, Radio, Radio group

[ ] Os checkbox estão feios, mal desenhados, não suportando bem as densidades pois o icone de dentro não se encaixa bem dentro em densidades menores, o espaçamento dentro do checkbox também é mal calculado, etc. Quero estado de hover e focus mais bem feitos também, por exemplo aquele que tem no MUI tem uma especie de circulo no hover: https://mui.com/material-ui/react-checkbox/
[ ] A variante de card em alguns exemplos do storybook possui um espaçamento gigante entre label e descrição. Isso não é o ideal
[ ] em densidade baixa os checkboxes e radios não precisam ser tão curtos
[ ] tanto nos radios quanto nos checkbox os itens centralizados no meio não ficam exatamente centralizados dependendo da densidade
[ ] design dos radios esta horrivel



## Select

[ ] (S) O overlay flutuante tem um comportamento esquisito nos stories, quando passo o mouse pelas opções o overlay flutuante está se deslocando infinitamente para a direita. Parece que isso ocorre quando o select está em um container sem padding, mas temos que resolver na raiz este problema de implementação para não afetar outros componentes.
[ ] A animação de abertura do overlay flutuante está vindo da esquerda para a direita, isso é ideal? vir de cima para baixo não seria mais ideal?
[ ] Em densidades compact e dense os icones da direita (como o de clear) aparecem extremamente pequenos, totalmente feio e não condiz com um design bem feito.
[ ] O preview de multiple no componente "Apple +1" não é legal, apenas um texto com um +1, +2, parece uma solução preguiçosa.
[ ] Uma variante plain era pra ter este drop shadow? (MAOC)
[ ] Para estado de loading faz sentido usar nosso loader (loader scene, com surface)?

## Combobox

[ ] #Select:1, por isso pode ter a ver com o core compartilhado.
[ ] #Select:2
[ ] #Select:3 provavelmente afeta aqui também.
[ ] #Select:4 provavelmente afeta aqui também.
[ ] #Select:6
[ ] O estilo do texto selecionado (o match do filtro) é horrivel, vamos precisar de uma refatoração completa nisso, e provavelmente em todos os outros lugares onde isso acontece. Possivelmente criando um componente para esse tipo de destaque de texto. O problema é que o texto não parece naturalmente encaixado, a mudança de weight e etc causa uma mudança de tamanho, o texto que da match parece deslocado, com padding entre as letras. Precisamos que o texto continue fazendo parte da palavra perfeitamente, e o destaque seja apenas de cores: um bg accent suave na seleção, o texto destacado com accent (sem mudar o weight do texto original) e uma underline ou borda em baixo da seleção. (MAOC)
[ ] Combobox não tem garantia de que o valor tem que existir no conjunto fornecido? a pessoa pode digitar o que quiser e deixar?
[ ] Combobox não tem a opção de adicionar um valor? criar novo valor? por exemplo num input de tags onde a tag nao existe e precisa ser criada...


## Currency Field

[ ] Existe um bug, com um valor como 0,00 no input, ao deixar o cursor na esquerda e digitar 2 o valor vira 20,00 e não 0,02. Os valores sempre deveriam ir para a direita, nao?
[ ] Valor vazio deveria ser permitido? ou deve sempre ser 0,00? Hoje da pra deixar o input vazio...


## Description List

[ ] Ao clicar no botão de copiar o texto é apenas selecionado, isso é esquisito, não é isso que vejo em componentes como os da SAP e etc...
[ ] o "-" de valor vazio não me agrada, e não parece encaixar bem.


## Dialog

[ ] As diferentes maneiras de fechar o dialog funcionam mesmo? nos stories ao clicar no backdrop nada acontece
[ ] Não vi um botão de full screen para os dialogs... Seria ideal eu acho para possibilitar fazer toggle ou não.
[ ] também não vi animações bem feitas, fading do backdrop, faltou todo esse cuidado...


## Drawer


[ ] As diferentes maneiras de fechar o drawer funcionam mesmo? nos stories ao clicar no backdrop nada acontece
[ ] também não vi animações bem feitas, fading do backdrop, faltou todo esse cuidado...
[ ] backdrop aparece e some do nada, drawer aparece do nada sem animação de entrada
[ ] em modo dark a borda lateral está muito clara, fugindo do padrao.
[ ] Os modos de resize não estão performaticos, e visualmente o resize vertical me desagradou muito. Um que me agrada é o componente splitter da sap https://sap.github.io/fundamental-styles/?path=/docs/sap-design-btp-splitter--docs&globals=styles-theme:sap_fiori_3
[ ] Falta carinho nesses detalhes...


## Field

[ ] o design das mensagens nao esta me agradando, acho que a descricao nao precisava desse simbolo de circulo, e talvez a de error mereça um weight maior.


## InlineMessage

[ ] Esse componente me parece meio inutil, alem de ser visualmente desagradavel


## KBD

[ ] a altura dos kbd está variando dependendo do simbolo que tem dentro, pode ficar estranho em alguns cenarios

## List item

esse tem muitos problemas visuais

[ ] pelo storie da pra ver alguns usos de rails laterais, voltando ao AI-slop que comentei
[ ] existem checkbox muito mal posicionados, extremamente desalinhados e feios
[ ] Tem inumeros problemas visuais desse tipo, sem polimento, terrivel
[ ] Esse componente inteiro está feio e inconsistente

## Listbox

[ ] O estado de selecionado com esse rail lateral está feio, é resquicio do AI-SLOP que falei
[ ] Na versão multiple fica muito feio pois todos os itens são 100% colados, e como tem border radius fica uma certa onda na lateral quando tem varios selecionados, visualmente muito feio.


## Menu

[ ] A escolha de animação está correta?
[ ] Submenus já nascem expandidos? isso é certo? esses submenus deveriam estar 100% colados nos outros menus de verdade?


## Popover 

[ ] Nos popovers onde o width é igual o do controle o popover parece estar deslocado para o lado, nao fica certamente alinhado com o controle real

## Slider

[ ] o slider na parte 'preenchida' tem a mesma borda da parte 'vazia' eu não queria isso. Por exemplo a parte preenchida tem a cor primary, queria que a borda nessa parte tivesse a cor primary tambem, pra borda não ficar estranha em relação a track preenchida. Apenas a track vazia deveria ter a borda de input normal.


# Stepper

[ ] garanta que está funcionando corretamente
[ ] A versão "compact" está quebrada, as linhas não estão centralizadas, etc.


## Switch

[ ] talvez adicionar um levissimo gap entre o switch e o label

## Tabs

[ ] o mesmo problemas já relatados, uso de icon button na tabs totalmente desalinhado, gigante, não encaixa esse icon button. nem em todo lugar precisa usar o componente feito, as vezes pode criar um do zero que se encaixe melhor naquela solução!

# TextFields (e varios outros)

[ ] varios dos problemas relatados nos outros inputs, como icones e botoes de limpar que não encaixam, etc


## Toast

[ ] o problema do icone já relatado

# Tooltip

[ ] http://devserver.local:6006/?path=/docs/components-tooltip--reference&globals=scheme:dark;density:dense por que nos story quando a pagina carrega os tooltips ja aparecem abertos? isso é um bug ou é apenas efeito do storie?

