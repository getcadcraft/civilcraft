---
title: O ecrã, parte por parte
summary: Uma visita a todas as barras e painéis do CivilCraft pelo nome que têm no ecrã, da barra de ferramentas à barra de estado.
keywords: interface, ecrã, barra de ferramentas, painéis, propriedades, barra de estado, vista do perfil, disposição, visita, ui
from: 76272010
---

O CivilCraft tem um único ecrã. Não há separadores nem layouts. Os painéis laterais podem mover-se, flutuar ou passar para uma janela própria: consulte [Organizar os painéis e utilizar um segundo monitor](common:arrange-panels). De cima para baixo e da esquerda para a direita:

- a **barra da aplicação** (marca CadCraft, nome da aplicação, versão, Acerca de, modo de ecrã, Ajuda, Guardar para offline, Papel e Modelo)
- a **barra de ferramentas** com sete grupos de botões
- o **painel da esquerda**: Local, Pontos, Superfície, Visualização e, depois de importar algumas, Camadas SIG
- a **planta** ao centro, com a **vista do perfil** por baixo quando está aberta
- o **painel da direita**: Propriedades do que está selecionado
- a **barra de estado** ao longo de baixo

## Barra da aplicação

A barra fina no topo pertence ao site do CadCraft, não ao próprio CivilCraft.

- O menu de versões mostra a compilação que está a executar.
- {{ui:Acerca do CivilCraft}} abre a página da aplicação no site.
- {{ui:Ecrã inteiro}} alterna os modos de ecrã: ecrã inteiro, depois ecrã inteiro com as barras ocultas, e depois de volta ao normal. {{key:Ctrl+Shift+F}} faz o mesmo em todas as plataformas, incluindo um Mac (é a tecla Control aí, não Command). Com as barras ocultas, mova o ponteiro para o limite superior para as fazer voltar.
- {{ui:Ajuda}} (ou {{key:F1}}) abre esta ajuda num painel lateral; {{key:F1}} ou {{key:Esc}} fecha-o.
- {{ui:Guardar para offline}} mantém o CivilCraft neste navegador para que se abra sem ligação; passa então a mostrar {{ui:Pronto para offline}}. Consulte [Ficheiros que pode abrir, guardar e exportar](topic:files#online-and-offline).
- {{ui:Papel}} e {{ui:Modelo}} alternam entre um tema claro e um escuro. A planta e o perfil seguem o tema; os PDF imprimem-se sempre em branco.

## Barra de ferramentas

Cada grupo tem uma pequena etiqueta por cima dos botões. Pare o ponteiro sobre um botão para ver a sua descrição e tecla.

| Grupo | Botões | O que fazem |
|---|---|---|
| Ficheiro | {{ui:Novo}}, {{ui:Abrir}}, {{ui:Guardar}} | Recomeçar, abrir um ficheiro de pontos, LandXML ou projeto, guardar o projeto como transferência |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Escrever LandXML 1.2, um DXF R12 ou um DWG da planta, ou imprimir a planta para PDF |
| Superfície | {{ui:Linha de quebra}}, {{ui:Limite}} | Desenhar uma linha de quebra por pontos de levantamento; desenhar o limite exterior |
| Projeto | {{ui:Diretriz}}, {{ui:Plataforma}}, {{ui:Coletores}}, {{ui:Perfil}} | Desenhar uma diretriz, uma plataforma, um troço de coletores; mostrar ou ocultar a vista do perfil |
| Editar | {{ui:Anular}}, {{ui:Refazer}}, {{ui:Copiar}}, {{ui:Colar}}, {{ui:Mais}} | Anular, refazer, copiar e colar pontos de levantamento; {{ui:Mais}} contém Cortar, Colar no mesmo sítio, Duplicar, Eliminar, Selecionar todos os pontos e Limpar seleção |
| SIG | {{ui:Coordenadas}}, {{ui:Importar}}, {{ui:Exportar}}, {{ui:Mapa}} | Definir o sistema de coordenadas, importar e exportar ficheiros SIG, mostrar camadas de mapa por baixo da planta |
| Ver | {{ui:Selecionar}}, {{ui:Ajustar}}, {{ui:3D}} | Escolher e mover coisas; zoom para mostrar tudo; mostrar o local em 3D ([Ver o local em 3D](topic:site-3d)) |

Uma ferramenta de desenho fica premida enquanto está ativa. Clicar nela outra vez, premir {{key:Esc}} ou premir {{key:V}} volta a {{ui:Selecionar}}. {{ui:Anular}}, {{ui:Refazer}}, {{ui:Copiar}} e os itens de {{ui:Mais}} ficam a cinzento quando não podem atuar; a descrição diz porquê (por exemplo "Selecione primeiro pontos do levantamento"). Todos os botões estão listados em [Referência da barra de ferramentas](topic:toolbar).

Numa janela estreita, a barra de ferramentas desloca-se para os lados.

## Painel da esquerda

### Local

- **Nome**: o nome do projeto. Dá nome a todos os ficheiros que guarda ou exporta e é impresso na faixa de título do PDF.
- **Unidades**: {{ui:Pés dos EUA}} ou {{ui:Metros}}. Diz o que os números significam. Alterá-las **não** converte as coordenadas; consulte [Unidades, PK e formatos de números](topic:units-and-stations).

### Pontos

Vazio, diz como abrir um ficheiro de pontos. Com pontos mostra o nome do ficheiro, o número de pontos e quantos têm cota, e depois uma tabela de **grupos de pontos**: uma linha por primeira palavra da descrição (GRD, FL, TBS …), com uma contagem e uma escolha **Superfície**:

- {{ui:Pontos}}: os pontos entram na superfície (a predefinição para todos os grupos).
- {{ui:Linha de quebra}}: os pontos do grupo são unidos, por ordem de número de ponto, numa só linha de quebra.
- {{ui:Deixado de fora}}: o grupo não toca na superfície.

### Superfície

Dados sobre o terreno natural: pontos, triângulos, cota mais baixa e mais alta, cota média, área 2D e 3D, linhas de quebra e se há um limite. Por baixo dos dados, uma caixa lista tudo o que o construtor da superfície teve de corrigir ou não conseguiu fazer. Depois:

- **Maior aresta exterior**: 0 mantém todos os triângulos exteriores; um número elimina do exterior os triângulos compridos e finos.
- Ligações que aparecem quando se aplicam: {{ui:Remover o limite}}, {{ui:Remover as linhas de quebra desenhadas}} e, para uma superfície lida de LandXML, {{ui:Reconstruir a superfície a partir dos pontos}}.

### Visualização

- **Superfície**: {{ui:Terreno natural}} ou {{ui:Proposta (modelada)}}. A segunda fica disponível quando uma plataforma ou um corredor modela sem problemas.
- **Curvas de nível a cada**, **Mestra a cada** e **Faixas** (o número de faixas de cor).
- Caixas de verificação: {{ui:Curvas de nível}}, {{ui:Etiquetas das curvas de nível}}, {{ui:Triângulos}}, {{ui:Faixas de cota}}, {{ui:Setas de inclinação}}, {{ui:Pontos}}, {{ui:Etiquetas dos pontos}}, {{ui:Linhas de quebra}}, {{ui:Limite da superfície}}, {{ui:Coletores}}.
- Uma legenda das cotas das faixas aparece quando as faixas estão ligadas.

As definições de visualização são guardadas com o projeto, mas não são passos de anulação: {{key:Mod+Z}} nunca desfaz uma caixa de verificação.

## Planta

A planta mostra os pontos, a superfície e tudo o que projetar, em planta com o norte para cima. A roda aproxima ou afasta no ponteiro, arraste o espaço vazio para deslocar a vista. A lista completa está em [Teclas e rato](topic:keyboard).

- Num projeto vazio, uma caixa com o título **Comece com pontos do levantamento** lista os primeiros passos e oferece {{ui:Abrir o local de exemplo}}.
- Enquanto uma ferramenta de desenho está ativa, uma sugestão no topo da planta diz onde clicar e como terminar.
- Arrastar um ficheiro sobre a planta mostra "Largue um ficheiro de pontos, LandXML ou um projeto".
- As coisas selecionadas ficam realçadas. Uma diretriz ou plataforma selecionada mostra grips quadrados nos seus PI ou cantos; um órgão selecionado mostra um grip. Arraste um grip para o mover.
- Os pontos de levantamento selecionados têm um anel. {{key:Shift}} e um clique acrescenta ou retira um ponto; {{key:Shift}} e um arrastamento desenha uma caixa (ou, arrastado à volta deles, um laço) que acrescenta os pontos que ficam dentro. Consulte [Selecionar, copiar e colar pontos de levantamento](topic:copy-paste-points).

## Vista do perfil

Prima {{key:R}} ou clique em {{ui:Perfil}} para a abrir por baixo da planta. A sua barra tem:

- uma lista de diretrizes (ativa quando há duas ou mais diretrizes)
- {{ui:Adicionar PVI}}: enquanto está premido, um clique no perfil acrescenta um PVI ({{key:I}} alterna-o)
- uma leitura do PK, do terreno, da cota de projeto, da inclinação e da escavação ou aterro sob o ponteiro
- um botão de fechar

O perfil mostra o terreno natural, o perfil de projeto, as inclinações em cada alinhamento reto, o PK e a cota de cada PVI, o L e o K de cada curva vertical com o seu BVC e EVC, os pontos altos e baixos, e o exagero vertical. Ajusta-se sempre a toda a diretriz: não faz zoom nem desloca a vista. Mover o ponteiro ao longo dele põe um ponto na diretriz da planta.

## Painel da direita: Propriedades

O seu título diz o que mostra.

- **Projeto** (nada selecionado): as diretrizes e plataformas como ligações, o bloco **Movimento de terras** e o bloco **Rede de coletores** com as suas regras e problemas.
- **Diretriz**: nome, PK inicial, comprimento, a tabela de PI, as curvas, a tabela de PVI do perfil de projeto e os seus dados, e as definições do **Corredor**.
- **Plataforma**: nome, cota, taludes de escavação e de aterro, área, dados da intersecção do talude e movimento de terras.
- **Órgão** ou **Coletor**: dimensões, cotas de topo, cotas de soleira, inclinação, recobrimento e quaisquer problemas.
- **Ponto** e o seu número: as coordenadas, a cota, a descrição e o grupo do ponto (só de leitura).

Os campos têm efeito quando prime {{key:Enter}} ou sai do campo. Um valor que não é aceite é assinalado como inválido e nada muda.

## Barra de estado

- **E** e **N**: este e norte sob o ponteiro.
- A cota do **Terreno** nesse ponto (e **Modelada** onde uma plataforma ou um corredor a alterou), ou "Fora da superfície".
- A diretriz mais próxima (ou a selecionada) com o **PK** e o afastamento (**L** ou **R**) sob o ponteiro.
- À direita, mensagens: o que acabou de acontecer, ou porque algo foi recusado. Uma mensagem desaparece sozinha ao fim de alguns segundos.

## Caixas de diálogo

- **Importar pontos**: abre-se com todos os ficheiros de pontos. Consulte [Importar pontos de levantamento](topic:import-points).
- **Imprimir a planta para PDF**: consulte [Imprimir a planta para PDF](topic:plot-pdf).
- **Alterações não guardadas**: pergunta antes de {{ui:Novo}} ou de abrir um ficheiro de projeto ou LandXML deitar fora o trabalho não guardado. {{ui:Guardar uma cópia}} transfere primeiro o projeto.

## Ecrãs pequenos

Até 760 píxeis de largura, como num telemóvel, a planta fica com o ecrã: a barra de ferramentas é uma só fila que se desloca para os lados, e os painéis abrem-se como folhas a partir de uma barra em baixo. {{ui:Ferramentas}} oculta a barra de ferramentas e {{ui:Mover}} coloca-a em baixo.
