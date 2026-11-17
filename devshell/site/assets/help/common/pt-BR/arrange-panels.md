---
title: Organize os painéis e use um segundo monitor
summary: Acople os painéis laterais à esquerda, à direita ou embaixo, empilhe-os, agrupe-os como guias, fixe-os ou oculte-os, flutue-os sobre o desenho, deixe o layout mais denso, escolha quantas linhas a barra de ferramentas usa ou mova-os para a própria janela em outra tela.
keywords: painéis, acoplar, flutuar, mover painel, arrastar, layout, guias, grupo de guias, empilhar, fixar, ocultação automática, ocultar painel, fechar painel, compacto, densidade do layout, denso, linhas da barra de ferramentas, quebrar, 1 linha, 2 linhas, linhas da barra, segundo monitor, duas telas, monitor duplo, vários monitores, janela, pop-up, redefinir layout
from: 49530239
---

Os painéis ao lado do desenho podem ser movidos. Coloque-os onde preferir, ou dê a eles uma janela própria em um segundo monitor, para que o desenho ocupe todo o primeiro.

:::note
Cada painel tem uma barra de título: uma barra fina com o nome do painel, um menu {{ui:⋯}}, um botão de fixar e um botão de fechar no topo do painel. As versões anteriores à 0.7 têm apenas o nome e o menu {{ui:⋯}}.
:::

## Mover um painel na janela

1. Arraste o painel pelo nome, no topo.
2. Enquanto arrasta, aparecem áreas com contorno à esquerda, à direita e embaixo do desenho. Solte o painel sobre uma delas para acoplá-lo ali. A área sob o cursor escurece.
3. Solte-o em qualquer outro ponto sobre o desenho para que flutue.

Os painéis podem dividir um mesmo lado: eles são empilhados, e cada linha entre dois deles pode ser arrastada para dividir o espaço (com a linha em foco, as teclas de seta a movem, e clicar duas vezes nela divide o espaço igualmente). Arraste a borda interna de um lado acoplado para torná-lo mais largo ou mais estreito; clique duas vezes na borda para recolocá-la no lugar.

Um painel flutuante fica sempre sobre o desenho. Mova-o pelo nome e redimensione-o arrastando o canto inferior direito (ou use {{key:Tab}} até o canto e as teclas de seta). Clique duas vezes no nome para acoplá-lo de novo onde estava.

:::touch
Arraste com um dedo pelo nome do painel. Arraste o canto inferior direito de um painel flutuante com um dedo para redimensioná-lo, e as bordas entre painéis acoplados da mesma forma. Para flutuar ou acoplar sem arrastar, use o menu {{ui:⋯}}.
:::

## Agrupar painéis como guias

Dois painéis podem compartilhar uma mesma moldura e mostrar um de cada vez. Arraste um painel pelo nome até a barra de título de outro painel (a barra fica com contorno enquanto você está sobre ela) e solte: a moldura passa a ter uma guia para cada painel, na barra de título. Clique em uma guia para mostrar aquele painel. Com uma guia em foco, {{key:Left}} e {{key:Right}} trocam de guia, e {{key:Home}} e {{key:End}} vão para a primeira e a última.

Para tirar um painel do grupo, escolha {{ui:Sair do grupo de guias}} no menu {{ui:⋯}} dele, ou arraste-o para outro lugar. Escolha {{ui:Agrupar com}} e o nome de um painel para agrupá-los sem arrastar.

## Fixar, ocultar e trazer de volta

- O botão de fixar na barra de título de um painel o torna de **ocultação automática**: o painel sai do seu lado acoplado e vira uma pequena guia nessa borda. Aponte para a guia, foque-a ou clique nela, e o painel desliza sobre o desenho; ao afastar-se (ou pressionar {{key:Esc}}), ele volta. Pressione o botão de fixar de novo, ou escolha {{ui:Desafixar}}, para acoplá-lo definitivamente.
- O botão de fechar, ou {{ui:Ocultar este painel}} no menu, oculta o painel e fecha o espaço do seu lado acoplado. Uma guia tracejada na borda o traz de volta: clique nela, ou foque-a e pressione {{key:Enter}}.

## Deixar o layout mais denso

{{ui:Configurações}} › {{ui:Geral}} › {{ui:Densidade do layout}} tem duas opções. {{ui:Confortável}} é o padrão. {{ui:Compacta}} reduz a altura das linhas, o espaçamento dos painéis, os botões da barra de ferramentas e o texto dos painéis daquele aplicativo, para que caiba mais na tela. A configuração é mantida para cada aplicativo. Uma tela de toque mantém os botões grandes nas duas, e um celular mantém o próprio layout. {{ui:Redefinir layout}} não altera a densidade que você definiu.

## Escolher quantas linhas a barra de ferramentas usa

{{ui:Configurações}} › {{ui:Geral}} › {{ui:Linhas da barra de ferramentas}} tem três opções. {{ui:Quebrar}} é o padrão: todos os grupos de ferramentas aparecem, em quantas linhas forem necessárias. {{ui:2 linhas}} mantém a barra de ferramentas em duas linhas e {{ui:1 linha}} em uma, para que o desenho ganhe altura; os grupos que não cabem rolam para os lados dentro da barra (use a roda do mouse, um deslize com dois dedos ou {{key:Tab}} até uma ferramenta). Uma barra que já cabe em duas linhas continua como está em {{ui:2 linhas}}, porque uma grade só a deixaria mais alta. A escolha é mantida para cada aplicativo. Uma tela de toque e um celular mantêm o próprio layout. O CadCraft tem uma configuração própria para a barra de ferramentas, em {{ui:Configurações}} › {{ui:CadCraft}}.

## Usar o teclado

O botão {{ui:⋯}} de cada painel abre um menu: {{ui:Acoplar à esquerda}}, {{ui:Acoplar à direita}}, {{ui:Acoplar embaixo}}, {{ui:Flutuar sobre o desenho}}, {{ui:Fixar na borda}}, {{ui:Ocultar este painel}}, {{ui:Agrupar com}} outro painel, {{ui:Mover para uma nova janela}} e {{ui:Recolocar}}. Use {{key:Tab}} até o botão, pressione {{key:Enter}}, mova-se com as teclas de seta e pressione {{key:Enter}} de novo. {{key:Esc}} fecha o menu.

## Colocar os painéis em um segundo monitor

1. Escolha {{ui:⋯}} em um painel e, depois, {{ui:Mover todos os painéis para uma nova janela}}. Você também pode escolher {{ui:Mover painéis para uma nova janela}} em {{ui:Configurações}}.
2. Uma pequena janela se abre com os painéis. Arraste-a para o outro monitor e deixe-a do tamanho que preferir.
3. Continue trabalhando: os painéis agem sobre o desenho como antes, e o desenho ocupa a janela principal.

Os atalhos continuam funcionando enquanto a janela de painéis está em primeiro plano: as teclas pressionadas ali, exceto ao digitar em uma caixa, vão para o desenho. Perguntas e caixas de diálogo que o aplicativo exibe continuam abrindo na janela principal; olhe lá quando uma aparecer. O tema e o tamanho do texto dos painéis seguem a janela principal.

:::chromium
O Chrome e o Edge podem posicionar a janela na outra tela para você. Com uma segunda tela conectada, escolha {{ui:Colocar na minha outra tela}} na janela de painéis (ou {{ui:Colocar os painéis na minha outra tela}} no menu {{ui:⋯}} de um painel). O navegador pergunta uma vez se este site pode ver suas telas; depois que você permitir, a janela de painéis abre nessa tela sempre.
:::

:::firefox safari
Arraste a janela de painéis para o outro monitor você mesmo. Ela abre no mesmo lugar e com o mesmo tamanho na próxima vez.
:::

## Mais de uma janela de painéis

Cada painel pode ter uma janela própria: até quatro janelas de painéis, por exemplo uma por monitor.

- No menu {{ui:⋯}} de um painel, {{ui:Mover para uma nova janela}} abre outra janela para esse painel, e {{ui:Mover para a janela de painéis 2}} (e assim por diante) o move para uma que já esteja aberta. A segunda janela se chama "painéis 2".
- Arraste um painel pelo nome de uma janela para outra: solte sobre a janela principal para acoplá-lo ali (as áreas com contorno aparecem enquanto você está sobre ela) ou para que flutue, e sobre outra janela de painéis para movê-lo para lá. Solte em qualquer outro ponto e ele continua onde estava.
- Uma janela de painéis sem painéis restantes se fecha sozinha.

Depois de recarregar a página, o aplicativo oferece de novo as suas janelas de painéis. Os navegadores abrem uma janela por clique, então escolha {{ui:Abrir a próxima}} uma vez para cada janela.

## O mesmo modo para cada parte do layout

A faixa de opções, a caixa de ferramentas, as linhas de ferramentas e a barra de status saem para uma janela própria do mesmo jeito que um painel: abra o menu {{ui:⋯}} da parte e escolha {{ui:Mover para uma nova janela}}; {{ui:Recolocar}} (ou fechar a janela) a traz de volta. As teclas pressionadas nessa janela chegam ao aplicativo, como acontece na janela de painéis. Cada parte tem um menu desses.

## Mover uma caixa de diálogo

Toda caixa de diálogo pode ser movida para longe do desenho: pressione e arraste a sua barra de título. A caixa lembra onde você a deixou, cada uma por conta própria, e volta a esse lugar na próxima vez que abrir. Clique duas vezes na barra de título para centralizá-la de novo.

Pelo teclado, pressione {{key:Alt}}+{{key:Shift}}+uma tecla de seta com o foco dentro da caixa para movê-la 16 pixels por vez; adicione {{key:Ctrl}} para 64 pixels. Uma caixa que fique fora da tela (depois de uma janela ou tela menor) é trazida de volta.

Em um celular, as caixas de diálogo continuam ocupando toda a largura e não são movidas.

No CadCraft Studio, a caixa de diálogo {{ui:Plotar para PDF}} do CadCraft, que você pode deixar aberta enquanto trabalha, tem um botão na barra de título, {{ui:Abrir em uma janela própria}}. A caixa passa para uma janela própria que você pode colocar em outro monitor. Fechar a caixa fecha a janela, e fechar a janela fecha a caixa.

## Recolocar os painéis

- Escolha {{ui:Recolocar os painéis}} na janela de painéis, ou simplesmente feche-a. Os painéis voltam para onde estavam.
- Fechar ou recarregar a janela principal também fecha a janela de painéis. Quando o aplicativo abre de novo, ele informa que seus painéis estavam em uma janela própria; escolha {{ui:Abrir}} para trazer a janela de volta, ou {{ui:Manter aqui}}.
- {{ui:Configurações}} › {{ui:Geral}} › {{ui:Redefinir layout}} devolve cada painel ao lugar em que começou.

:::tip
Se nada se abrir ao mover os painéis para uma nova janela, o navegador bloqueou o pop-up. O aplicativo avisa e mantém os painéis onde estavam. Permita pop-ups para getcadcraft.com e tente de novo.
:::

O layout é mantido para cada aplicativo neste navegador, junto com as suas outras configurações.
