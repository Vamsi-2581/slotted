# `dashboard-grid` — reimaginação

Data: 2026-09-25. Origem: revisão da entrega de 2026-09-24, recusada por inteiro. Substitui as
decisões §3.1, §3.2, §3.4 e §4 de `docs/history/designs/2026-09-24-dashboard-grid-design.md`.

## Achados da revisão

| Achado | Causa |
| ------ | ----- |
| Ícones viram bloco preto e o sparkline fica cinza durante o arraste | A pré-visualização é um clone anexado ao `body`, fora de `[data-slotted-theme] [data-slotted-scheme]`, onde os tokens são declarados. |
| Pega com aparência de botão | Botão fantasma no canto do cabeçalho. |
| Redimensionar só pela direita e por baixo | O modelo em fluxo decide o início de cada widget pelos anteriores; não há aresta inicial a puxar. |
| Guias de fundo feias | Células cheias em `surface-sunken`. |
| Destaque do cartão sem acabamento | Contorno tracejado e pastilha preta no centro. |
| Cartões num chão errado | Demos sobre `surface`; um painel vive em `surface-sunken`. |
| Conteúdo não ocupa a altura | Gráfico com a altura do seu passo, sparkline de tamanho fixo, corpo sem regra de preenchimento. |
| Não é responsivo nem funciona no telemóvel | Classe média divide spans ao meio; linhas fixas na compacta; `touch-action: none` no cabeçalho bloqueia a rolagem; alças só com hover. |

## Modelo

- `DashboardLayoutItem { key, x, y, w, h, hidden? }` em células da classe expandida.
- Gravidade vertical (compactação para cima), como react-grid-layout, gridstack e Grafana. Colisões
  empurram para baixo; um widget `movable=false` é estático na compactação.
- A ordem do DOM é a ordem `(y, x)`: a leitura e o Tab seguem a imagem.
- Classe média: fluxo pela ordem `(y, x)`, largura encaixada em um terço, metade ou largura total
  pela fração `w / columns`. Classe compacta: uma coluna, altura do conteúdo, sem alças de tamanho.

## Interação

- Arrastar: o próprio `li` levanta (escala 1.02, sombra `lg`) e segue o ponteiro; um marcador ocupa
  as células de destino; os vizinhos deslizam por FLIP a cada mudança. Sem clone.
- Pega: pílula com seis pontos sobre a aresta superior, centrada; é o alvo de teclado e o gatilho
  do menu. Rato: todo o cartão arrasta. Toque: só a pega (o cartão mantém a rolagem).
- Redimensionar: arestas inicial, final e inferior; cantos inferiores. O cartão segue o ponteiro
  em tamanho livre; o marcador mostra o encaixe; ao soltar, anima até ele. Pastilha de acento com
  "w × h" junto da alça ativa.
- Grelha: retícula de pontos nas interseções dos intervalos, com transição ao entrar em edição.
- Teclado: `Alt`+setas movem uma célula (com empurrão), `Shift`+setas redimensionam pela aresta
  final e inferior, `Delete` esconde, `Enter` abre o menu.

## Tarefas, por fatia

1. Core: motor 2D (`normalize`, `compact`, `move`, `resize`, ordem, classes, codec v2), testes
   primeiro.
2. Estilos e harness: chão `sunken`, retícula, pega, alças, elevação, marcador, pastilha, corpo que
   preenche, compacta por conteúdo, `pointer: coarse`. Capturas nos três esquemas, densidades, RTL.
3. Contrato: partes (`placeholder`, `resize-handle[data-edge]`), modelo, teclado.
4. React: binding refeita sobre o motor; histórias sobre `sunken`; cenário de ponteiro e de toque.
5. Gate de interação: harness e React ao vivo.
6. Angular, páginas, verificação, autoavaliação, gate de release, commits.
