---
title: Organizar os painéis e usar um segundo monitor
summary: Ancorar os painéis laterais à esquerda, à direita ou em baixo, empilhá-los, agrupá-los em separadores, fixá-los ou ocultá-los, deixá-los flutuar sobre o desenho, tornar o layout mais denso, escolher quantas linhas usa a barra de ferramentas ou movê-los para uma janela própria noutro ecrã.
keywords: painéis, ancorar, flutuar, mover painel, arrastar, layout, separadores, grupo de separadores, empilhar, fixar, ocultação automática, ocultar painel, fechar painel, compacta, densidade do layout, denso, linhas da barra de ferramentas, quebrar, 1 linha, 2 linhas, linhas da barra, segundo monitor, dois ecrãs, monitor duplo, vários monitores, janela, pop-up, repor layout
from: 49530239
---

Os painéis ao lado do desenho podem ser movidos. Coloque-os onde melhor servirem, ou atribua-lhes uma janela própria num segundo monitor, para que o desenho ocupe todo o primeiro.

:::note
Cada painel tem uma barra de título: uma barra estreita com o nome do painel, um menu {{ui:⋯}}, um fixador e um botão de fechar no topo do painel. As versões anteriores à 0.7 têm apenas o nome e o menu {{ui:⋯}}.
:::

## Mover um painel na janela

1. Arraste o painel pelo nome, no topo.
2. Enquanto arrasta, aparecem áreas delineadas à esquerda, à direita e em baixo do desenho. Largue o painel sobre uma delas para o ancorar aí. A área sobre a qual está escurece.
3. Largue-o em qualquer outro ponto sobre o desenho para o fazer flutuar.

Os painéis podem partilhar um lado: empilham-se, e cada linha entre dois deles pode ser arrastada para repartir o espaço (com a linha em foco, as teclas de seta movem-na, e um duplo clique nela reparte o espaço por igual). Arraste a borda interior de um lado ancorado para o alargar ou estreitar; faça duplo clique na borda para a repor.

Um painel flutuante mantém-se sobre o desenho. Mova-o pelo nome e redimensione-o arrastando o canto inferior direito (ou avance com Tab até ao canto e use as teclas de seta). Faça duplo clique no nome para o ancorar de novo onde estava.

:::touch
Arraste com um dedo sobre o nome do painel. Arraste com um dedo o canto inferior direito de um painel flutuante para o redimensionar, e as bordas entre painéis ancorados da mesma forma. Para fazer flutuar ou ancorar sem arrastar, use o menu {{ui:⋯}}.
:::

## Agrupar painéis em separadores

Dois painéis podem partilhar uma mesma moldura e mostrar um de cada vez. Arraste um painel pelo nome até à barra de título de outro painel (a barra fica delineada enquanto está sobre ela) e solte: a moldura passa a ter um separador para cada painel, na sua barra de título. Clique num separador para mostrar esse painel. Com um separador em foco, {{key:Left}} e {{key:Right}} mudam de separador, e {{key:Home}} e {{key:End}} vão para o primeiro e para o último.

Para retirar um painel do grupo, escolha {{ui:Sair do grupo de separadores}} no respetivo menu {{ui:⋯}}, ou arraste-o para outro sítio. Escolha {{ui:Juntar em separador com}} e o nome de um painel para os agrupar sem arrastar.

## Fixar, ocultar e repor

- O fixador na barra de título de um painel torna-o de **ocultação automática**: o painel sai da sua ancoragem e passa a ser um pequeno separador nessa margem. Aponte para o separador, coloque-lhe o foco ou clique nele, e o painel desliza para fora, sobre o desenho; afaste o cursor (ou prima {{key:Esc}}) e ele volta a deslizar para dentro. Prima de novo o fixador, ou escolha {{ui:Desafixar}}, para o ancorar de forma permanente.
- O botão de fechar, ou {{ui:Ocultar este painel}} no menu, oculta o painel e fecha a sua ancoragem. Um separador tracejado na margem repõe-no: clique nele, ou dê-lhe o foco e prima {{key:Enter}}.

## Tornar o layout mais denso

{{ui:Definições}} › {{ui:Geral}} › {{ui:Densidade do esquema}} tem duas opções. {{ui:Confortável}} é a predefinição. {{ui:Compacta}} reduz a altura das linhas, o espaçamento interior dos painéis, os botões da barra de ferramentas e o texto dos painéis dessa aplicação, para caber mais no ecrã. É guardada para cada aplicação. Um ecrã tátil mantém os botões grandes nas duas opções, e um telemóvel mantém o seu próprio layout. {{ui:Repor esquema}} mantém a densidade que escolheu.

## Escolher quantas linhas usa a barra de ferramentas

{{ui:Definições}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}} tem três opções. {{ui:Quebrar}} é a predefinição: cada grupo de ferramentas aparece, em tantas linhas quantas forem necessárias. {{ui:2 linhas}} mantém a barra de ferramentas em duas linhas e {{ui:1 linha}} numa só, para que o desenho ganhe altura; os grupos que não cabem deslocam-se lateralmente dentro da barra (use a roda do rato, um deslize com dois dedos ou {{key:Tab}} até uma ferramenta). Uma barra que já cabe em duas linhas mantém-se como está com {{ui:2 linhas}}, porque uma grelha só a tornaria mais alta. A escolha é guardada para cada aplicação. Um ecrã tátil e um telemóvel mantêm o seu próprio layout. O CadCraft tem uma definição própria para a sua barra de ferramentas, em {{ui:Definições}} › {{ui:CadCraft}}.

## Usar o teclado

O botão {{ui:⋯}} de cada painel abre um menu: {{ui:Ancorar à esquerda}}, {{ui:Ancorar à direita}}, {{ui:Ancorar em baixo}}, {{ui:Flutuar sobre o desenho}}, {{ui:Fixar à margem}}, {{ui:Ocultar este painel}}, {{ui:Juntar em separador com}} outro painel, {{ui:Mover para uma nova janela}} e {{ui:Repor}}. Avance com {{key:Tab}} até ao botão, prima {{key:Enter}}, mova com as teclas de seta e prima {{key:Enter}} de novo. {{key:Esc}} fecha o menu.

## Pôr os painéis num segundo monitor

1. Escolha {{ui:⋯}} num painel e, depois, {{ui:Mover todos os painéis para uma nova janela}}. Pode também escolher {{ui:Mover os painéis para uma nova janela}} em {{ui:Definições}}.
2. Abre-se uma janela pequena com os painéis. Arraste-a para o outro monitor e aumente-a como preferir.
3. Continue a trabalhar: os painéis atuam sobre o desenho como antes, e o desenho ocupa a janela principal.

Os atalhos continuam a funcionar enquanto a janela dos painéis está em primeiro plano: as teclas que premir aí, exceto ao escrever numa caixa, vão para o desenho. As perguntas e caixas de diálogo que a aplicação apresenta continuam a abrir na janela principal, por isso procure-as lá quando uma aparecer. O tema e o tamanho do texto dos painéis seguem a janela principal.

:::chromium
O Chrome e o Edge conseguem colocar a janela no outro ecrã automaticamente. Com um segundo ecrã ligado, escolha {{ui:Pô-la no meu outro ecrã}} na janela dos painéis (ou {{ui:Pôr os painéis no meu outro ecrã}} no menu {{ui:⋯}} de um painel). O navegador pergunta uma vez se este site pode ver os ecrãs; depois de autorizar, a janela dos painéis abre sempre nesse ecrã.
:::

:::firefox safari
Arraste a janela dos painéis para o outro monitor. Na vez seguinte, abre-se no mesmo sítio e com o mesmo tamanho.
:::

## Mais do que uma janela de painéis

Cada painel pode ter uma janela própria: até quatro janelas de painéis, por exemplo uma por monitor.

- No menu {{ui:⋯}} de um painel, {{ui:Mover para uma nova janela}} abre outra janela para esse painel, e {{ui:Mover para a janela de painéis 2}} (e assim sucessivamente) move-o para uma que esteja aberta. A segunda janela chama-se « painéis 2 ».
- Arraste um painel pelo nome de uma janela para outra: solte-o sobre a janela principal para o ancorar aí (as áreas delineadas aparecem enquanto está sobre ela) ou para o fazer flutuar, e sobre outra janela de painéis para o mover para lá. Se o soltar em qualquer outro sítio, fica onde estava.
- Uma janela de painéis sem painéis fecha-se sozinha.

Depois de recarregar, a aplicação volta a oferecer as suas janelas de painéis. Os navegadores abrem uma janela por clique, por isso escolha {{ui:Abrir a seguinte}} uma vez por cada janela.

## O mesmo método para cada parte do layout

O friso, a caixa de ferramentas, as linhas de ferramentas e a barra de estado saem para uma janela própria da mesma forma que um painel: abra o menu {{ui:⋯}} da parte e escolha {{ui:Mover para uma nova janela}}; {{ui:Repor}} (ou fechar a janela) traz a parte de volta. As teclas que premir nessa janela chegam à aplicação, tal como a partir da janela dos painéis. Cada parte tem um menu desses.

## Mover uma caixa de diálogo

Qualquer caixa de diálogo pode ser afastada do desenho: prima e arraste a sua barra de título. A caixa de diálogo memoriza onde a deixou, cada uma por si, e volta a esse lugar na próxima vez que abrir. Faça duplo clique na barra de título para a centrar de novo.

Com o teclado, prima {{key:Alt}}+{{key:Shift}}+uma tecla de seta, com o foco dentro da caixa de diálogo, para a mover 16 pixels de cada vez; acrescente {{key:Ctrl}} para 64. Uma caixa de diálogo que fique fora do ecrã (depois de uma janela ou ecrã mais pequeno) é trazida de volta.

Num telemóvel, as caixas de diálogo ocupam toda a largura do ecrã e não são movidas.

No CadCraft Studio, a caixa de diálogo {{ui:Imprimir para PDF}} do CadCraft, que pode manter aberta enquanto trabalha, tem um botão na sua barra de título, {{ui:Abrir numa janela própria}}. A caixa de diálogo passa para uma janela própria, que pode colocar noutro monitor. Fechar a caixa de diálogo fecha a janela, e fechar a janela fecha a caixa de diálogo.

## Repor os painéis

- Escolha {{ui:Repor os painéis}} na janela dos painéis, ou simplesmente feche-a. Os painéis voltam ao sítio onde estavam.
- Fechar ou recarregar a janela principal também fecha a janela dos painéis. Quando a aplicação voltar a abrir, indica que os painéis estavam numa janela própria; escolha {{ui:Abrir}} para trazer a janela de volta, ou {{ui:Manter aqui}}.
- {{ui:Definições}} › {{ui:Geral}} › {{ui:Repor esquema}} repõe cada painel no sítio onde começou.

:::tip
Se nada abrir ao mover painéis para uma nova janela, o navegador bloqueou a janela pop-up. A aplicação indica-o e mantém os painéis onde estavam. Permita pop-ups para getcadcraft.com e tente de novo.
:::

O layout é guardado para cada aplicação neste navegador, juntamente com as outras definições.
