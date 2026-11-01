---
title: Organizar os painéis e usar um segundo ecrã
summary: Ancorar os painéis laterais à esquerda, à direita ou em baixo, empilhá-los, agrupá-los em separadores, fixá-los ou ocultá-los, fazê-los flutuar sobre o desenho, tornar o esquema mais denso, escolher quantas linhas usa a barra de ferramentas ou movê-los para a sua própria janela noutro ecrã.
keywords: painéis, ancorar, flutuar, mover painel, arrastar, esquema, separadores, grupo de separadores, empilhar, fixar, ocultação automática, ocultar painel, fechar painel, compacto, densidade do esquema, denso, linhas da barra de ferramentas, quebrar, 1 linha, 2 linhas, linhas da barra, segundo monitor, dois ecrãs, monitor duplo, vários monitores, janela, janela pop-up, repor esquema
from: 32a8dae2
---

Os painéis ao lado do desenho podem ser movidos. Podem ser colocados onde melhor convier ou receber uma janela própria num segundo monitor, para que o desenho ocupe todo o primeiro monitor.

:::note
Cada painel tem uma barra de título: uma barra estreita com o nome do painel, um menu {{ui:⋯}}, um botão de fixar e um botão de fechar no topo do painel. As versões anteriores à 0.7 têm apenas o nome e o menu {{ui:⋯}}.
:::

## Mover um painel na janela

1. Arraste o painel pelo nome, no topo.
2. Enquanto arrasta, surgem áreas contornadas à esquerda, à direita e em baixo do desenho. Largue o painel numa delas para o ancorar aí. A área sobre a qual se encontra escurece.
3. Largue-o em qualquer outro ponto sobre o desenho para o fazer flutuar.

Os painéis podem partilhar um lado: empilham-se, e cada linha entre dois deles arrasta-se para dividir o espaço (com uma linha focada, as teclas de seta movem-na, e um duplo clique nela divide o espaço por igual). Arraste a borda interior de um lado ancorado para o tornar mais largo ou mais estreito; faça duplo clique na borda para a repor.

Um painel flutuante fica sempre sobre o desenho. Mova-o pelo nome e redimensione-o arrastando o canto inferior direito (ou prima {{key:Tab}} até ao canto e use as teclas de seta). Faça duplo clique no nome para o ancorar de novo onde estava.

:::touch
Arraste com um dedo pelo nome do painel. Arraste com um dedo o canto inferior direito de um painel flutuante para o redimensionar, e as bordas entre painéis ancorados do mesmo modo. Para flutuar ou ancorar sem arrastar, use o menu {{ui:⋯}}.
:::

## Agrupar painéis em separadores

Dois painéis podem partilhar uma moldura e mostrar um de cada vez. Arraste um painel pelo nome até à barra de título de outro painel (a barra fica contornada enquanto está sobre ela) e largue: a moldura passa a ter um separador para cada painel, na barra de título. Clique num separador para mostrar esse painel. Com um separador em foco, {{key:Left}} e {{key:Right}} mudam de separador, e {{key:Home}} e {{key:End}} vão para o primeiro e para o último.

Para retirar um painel do grupo, escolha {{ui:Sair do grupo de separadores}} no menu {{ui:⋯}} do painel, ou arraste-o para outro sítio. Escolha {{ui:Agrupar com}} e o nome de um painel para os agrupar sem arrastar.

## Fixar, ocultar e repor

- O botão de fixar na barra de título de um painel torna-o de **ocultação automática**: o painel sai da sua ancoragem e fica como um pequeno separador nessa borda. Aponte para o separador, dê-lhe foco ou clique nele, e o painel desliza para fora sobre o desenho; afaste-se (ou prima {{key:Esc}}) e ele volta a deslizar. Prima o botão de fixar de novo, ou escolha {{ui:Desafixar}}, para o ancorar de vez.
- O botão de fechar, ou {{ui:Ocultar este painel}} no menu, oculta o painel e fecha a ancoragem onde estava. Um separador tracejado na borda devolve-o: clique nele, ou dê-lhe foco e prima {{key:Enter}}.

## Tornar o esquema mais denso

{{ui:Definições}} › {{ui:Geral}} › {{ui:Densidade do esquema}} tem duas opções. {{ui:Confortável}} é a opção predefinida. {{ui:Compacta}} reduz a altura das linhas, o espaçamento dos painéis, os botões da barra de ferramentas e o texto dos painéis dessa aplicação, para que caiba mais no ecrã. Fica guardado para cada aplicação. Um ecrã tátil mantém os botões grandes nos dois modos, e um telemóvel mantém o esquema próprio. {{ui:Repor esquema}} deixa a densidade como foi definida.

## Escolher quantas linhas usa a barra de ferramentas

{{ui:Definições}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}} tem três opções. {{ui:Quebrar}} é a opção predefinida: cada grupo de ferramentas aparece, em tantas linhas quantas forem precisas. {{ui:2 linhas}} mantém a barra de ferramentas em duas linhas e {{ui:1 linha}} numa só, para que o desenho ganhe altura; os grupos que não cabem deslocam-se lateralmente dentro da barra (use a roda do rato, um deslize com dois dedos ou prima {{key:Tab}} até uma ferramenta). Uma barra que já cabe em duas linhas mantém-se como está com {{ui:2 linhas}}, porque uma grelha só a tornaria mais alta. A escolha fica guardada para cada aplicação. Um ecrã tátil e um telemóvel mantêm o esquema próprio. O CadCraft tem uma definição própria para a sua barra de ferramentas, em {{ui:Definições}} › {{ui:CadCraft}}.

## Usar o teclado

O botão {{ui:⋯}} de cada painel abre um menu: {{ui:Ancorar à esquerda}}, {{ui:Ancorar à direita}}, {{ui:Ancorar em baixo}}, {{ui:Flutuar sobre o desenho}}, {{ui:Fixar à borda}}, {{ui:Ocultar este painel}}, {{ui:Agrupar com}} outro painel, {{ui:Mover para uma nova janela}} e {{ui:Repor}}. Prima {{key:Tab}} até ao botão, prima {{key:Enter}}, mova com as teclas de seta e prima {{key:Enter}} de novo. {{key:Esc}} fecha o menu.

## Pôr os painéis num segundo monitor

1. Escolha {{ui:⋯}} num painel e, a seguir, {{ui:Mover todos os painéis para uma nova janela}}. Também pode escolher {{ui:Mover os painéis para uma nova janela}} em {{ui:Definições}}.
2. Abre-se uma pequena janela com os painéis. Arraste-a para o outro monitor e torne-a tão grande quanto desejar.
3. Continue a trabalhar: os painéis atuam sobre o desenho como antes, e o desenho ocupa a janela principal.

Os atalhos continuam a funcionar enquanto a janela dos painéis está à frente: as teclas que se premem aí, exceto quando se escreve numa caixa, vão para o desenho. As perguntas e as caixas de diálogo que a aplicação apresenta continuam a abrir na janela principal, por isso olhe para lá quando uma aparecer. O tema e o tamanho do texto dos painéis seguem a janela principal.

:::chromium
O Chrome e o Edge podem colocar a janela no outro ecrã automaticamente. Com um segundo ecrã ligado, escolha {{ui:Pô-la no meu outro ecrã}} na janela dos painéis (ou {{ui:Pôr os painéis no meu outro ecrã}} no menu {{ui:⋯}} de um painel). O navegador pergunta uma vez se este site pode ver os ecrãs; depois de permitir, a janela dos painéis abre nesse ecrã sempre.
:::

:::firefox safari
Arraste a janela dos painéis manualmente para o outro monitor. Da próxima vez, abre-se na mesma posição e com o mesmo tamanho.
:::

## Mais do que uma janela de painéis

Cada painel pode ter uma janela própria: até quatro janelas de painéis, por exemplo uma por monitor.

- No menu {{ui:⋯}} de um painel, {{ui:Mover para uma nova janela}} abre outra janela para esse painel, e {{ui:Mover para a janela de painéis 2}} (e assim por diante) move-o para uma que já esteja aberta. A segunda janela chama-se «painéis 2».
- Arraste um painel pelo nome de uma janela para outra: largue sobre a janela principal para o ancorar aí (as áreas contornadas aparecem enquanto está sobre ela) ou para o fazer flutuar, e sobre outra janela de painéis para o mover para lá. Se largar em qualquer outro sítio, ele fica onde estava.
- Uma janela de painéis sem painéis fecha-se sozinha.

Depois de recarregar, a aplicação volta a oferecer as janelas de painéis. Os navegadores abrem uma janela por cada clique, por isso escolha {{ui:Abrir a seguinte}} uma vez por cada janela.

## Mover uma caixa de diálogo

Cada caixa de diálogo pode ser afastada do desenho: prima e arraste a barra de título. A caixa de diálogo memoriza o sítio onde ficou, cada uma separadamente, e volta a esse sítio na próxima vez que abrir. Faça duplo clique na barra de título para a centrar de novo.

No teclado, com o foco dentro da caixa de diálogo, prima {{key:Alt}}+{{key:Shift}}+uma tecla de seta para a mover 16 píxeis de cada vez; acrescente {{key:Ctrl}} para 64. Uma caixa de diálogo que fique fora do ecrã (depois de uma janela ou ecrã mais pequeno) é trazida de volta.

Num telemóvel, as caixas de diálogo continuam a ocupar toda a largura e não são movidas.

No CadCraft Studio, a caixa de diálogo {{ui:Imprimir para PDF}} do CadCraft, que pode manter aberta enquanto trabalha, tem um botão na barra de título: {{ui:Abrir numa janela própria}}. A caixa de diálogo passa para uma janela própria que pode colocar noutro monitor. Fechar a caixa de diálogo fecha a janela, e fechar a janela fecha a caixa de diálogo.

## Repor os painéis

- Escolha {{ui:Repor os painéis}} na janela dos painéis, ou simplesmente feche-a. Os painéis voltam ao sítio onde estavam.
- Fechar ou recarregar a janela principal fecha também a janela dos painéis. Quando a aplicação voltar a abrir, indica que os painéis estavam numa janela própria; escolha {{ui:Abrir a janela}} para a trazer de volta, ou {{ui:Manter aqui}}.
- {{ui:Definições}} › {{ui:Geral}} › {{ui:Repor esquema}} põe cada painel de volta onde começou.

:::tip
Se nada abrir ao mover os painéis para uma nova janela, o navegador bloqueou a janela pop-up. A aplicação indica-o e mantém os painéis onde estavam. Permita as janelas pop-up para getcadcraft.com e tente de novo.
:::

O esquema fica guardado para cada aplicação neste navegador, juntamente com as outras definições.
