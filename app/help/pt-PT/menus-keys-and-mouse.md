---
title: Menus, teclas e rato
summary: Escolha um estilo de menus que corresponda à forma como já trabalha, atribua a qualquer comando a sua própria tecla, mova comandos entre separadores do friso e defina o que a roda e os botões do rato fazem na planta e em 3D.
keywords: estilo de menus, menus, friso, friso civil, barra de ferramentas, linha de comandos, desenho clássico, atalhos de teclado, teclas de atalho, teclas, personalizar, reatribuir, rato, roda, inverter, sentido do zoom, botão do meio, botão direito, deslocar, orbitar, exportar, importar, mudança, familiar
from: 07ac73a0
---

Os comandos do CivilCraft são os mesmos, seja qual for a forma como lhes chega. Um **estilo de menus** só decide onde ficam no ecrã, como se chamam aí e que teclas os executam, para que possa manter os hábitos que já tem. Escolha-o em {{ui:Definições}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, teclas e rato}}; a alteração é imediata, e este navegador guarda-a.

## Os três estilos

| Estilo | O que obtém |
|---|---|
| {{ui:CivilCraft}} | A barra de ferramentas própria do CivilCraft (Ficheiro, Exportar, Superfície, Desenho, Editar, GIS, Ver) e teclas simples: {{key:A}} diretriz, {{key:G}} plataforma, {{key:P}} coletores, {{key:B}} linha de quebra, {{key:O}} limite, {{key:L}} linha característica, {{key:R}} perfil, {{key:X}} secções, {{key:E}} modelação, {{key:D}} 3D, {{key:F}} ajustar, {{key:V}} selecionar. O ponto de partida. |
| {{ui:Desenho clássico}} | Um pequeno friso ({{ui:Base}}, {{ui:Inserir}}, {{ui:Saída}}) e uma linha de comandos, para quem escreve comandos: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (anular), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Comece a escrever em qualquer parte e as letras vão para a linha de comandos; {{key:Enter}} executa, {{key:Enter}} sem nada repete o último comando, {{key:Esc}} limpa-a. O botão do meio desloca a vista. |
| {{ui:Friso civil}} | Separadores com botões grandes, como as aplicações de projeto civil agrupam as suas ferramentas: {{ui:Base}} (dados do terreno, criar o projeto, vistas de perfil e de secção), {{ui:Superfícies}}, {{ui:Modify}}, {{ui:Geolocalização}}, {{ui:Ver}} e {{ui:Saída}}, com um menu {{ui:Ficheiro}} e botões rápidos à direita. As teclas simples mantêm-se. O botão do meio desloca a planta; em 3D, o botão do meio desloca e {{key:Shift}} com o botão do meio orbita. |

Todos os estilos mantêm as teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Uma tecla que pertence ao layout próprio do CivilCraft mas que o seu estilo atribuiu a outro comando não faz nada, e a linha de estado indica para onde foi o comando ("Em Minhas teclas, Plataforma é Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} e as setas mantêm sempre o seu significado, e enquanto desenha uma linha os seus pontos mantêm as suas teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Personalizar

1. Escolha o estilo mais próximo do que pretende e clique em {{ui:Personalizar…}}.
2. Em {{ui:Teclas e menus}}, encontre um comando (a caixa de pesquisa ajuda). Clique em {{ui:Acrescentar um código}} e prima a tecla, ou duas teclas seguidas para uma tecla de duas letras. Clique numa tecla para a retirar.
3. Com um friso, {{ui:Onde fica}} move o comando para outro separador e painel, para o menu {{ui:Ficheiro}}, ou para {{ui:Só teclas}}.
4. Em {{ui:Rato}}, defina a roda, os botões que deslocam a planta, e o que cada botão faz na vista 3D.
5. Dê-lhe um nome e clique em {{ui:Guardar}}.

Guardar um estilo incluído cria uma cópia sua (por exemplo, "O meu friso civil"); o original nunca muda. Uma tecla atribuída a dois comandos, ou uma que se executaria antes de se poder escrever uma tecla de duas letras, aparece a vermelho e tem de ser corrigida antes de guardar.

## Rato

- **Roda do rato**: {{ui:Rodar para cima aproxima}} (o ponto de partida) ou {{ui:Rodar para cima afasta}}, e a velocidade, na planta e em 3D. Um gesto de pinça no trackpad faz sempre zoom no sentido em que os dedos se movem.
- **Deslocar a planta com**: o botão do meio, o botão direito, ou ambos. {{key:Space}} e arrastar também desloca. O botão esquerdo escolhe e desenha sempre.
- **Arrastar na vista 3D**: {{ui:Próprio de cada vista}} mantém os botões do CivilCraft (o esquerdo orbita, o direito desloca). Ou defina cada botão para orbitar, deslocar, fazer zoom ou nada; {{key:Shift}} com o botão troca orbitar e deslocar. Um clique sem arrastar continua a escolher.

## Levar consigo

{{ui:Exportar}} guarda o estilo em uso num pequeno ficheiro `.ccinput.json`; {{ui:Importar…}} acrescenta um, de outro computador ou de um colega. Um ficheiro importado só pode apontar para comandos do próprio CivilCraft: o resto é deixado de fora e contado na linha de estado. {{ui:Eliminar este estilo}} remove um dos seus.

:::note
Estas definições ficam neste navegador. {{ui:Utilizar este estilo em todas as aplicações}} nas fichas de estilo faz com que cada aplicação abra no seu estilo correspondente (a sua própria barra de ferramentas, um friso ou Desenho clássico), com as alterações que fez em cada aplicação. O CivilCraft não tem um estilo de barra de menus: quando a barra de menus de outra aplicação é escolhida para todas as aplicações, o CivilCraft mantém a sua própria barra de ferramentas.
:::

Relacionados: [Teclado e rato](topic:keyboard) · [Definições do CivilCraft](topic:settings) · [Vindo de outro software de engenharia civil](topic:coming-from)
