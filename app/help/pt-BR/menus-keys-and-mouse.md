---
title: Menus, teclas e mouse
summary: Escolha um estilo de menu que combine com o seu jeito de trabalhar, dê a qualquer comando a sua própria tecla, mova comandos entre as guias da faixa de opções e defina o que a roda e os botões do mouse fazem no plano e no 3D.
keywords: estilo de menu, menus, ribbon, ribbon civil, barra de ferramentas, linha de comando, desenho clássico, atalhos de teclado, teclas de atalho, teclas, personalizar, redefinir, mouse, roda, cota, direção do zoom, botão do meio, botão direito, pan, órbita, exportar, importar, troca, familiar
from: 07ac73a0
---

Os comandos do CivilCraft são os mesmos, não importa como você os acessa. Um **estilo de menu** define apenas onde eles ficam na tela, como são chamados ali e quais teclas os executam, para que você mantenha os hábitos que já tem. Escolha um em {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; a mudança é imediata, e este navegador a guarda.

## Os três estilos

| Estilo | O que você obtém |
|---|---|
| {{ui:CivilCraft}} | A barra de ferramentas própria do CivilCraft (Arquivo, Exportar, Superfície, Projeto, Editar, GIS, Exibir) e teclas simples: {{key:A}} alinhamento, {{key:G}} plataforma, {{key:P}} tubos, {{key:B}} linha de quebra, {{key:O}} limite, {{key:L}} linha de feição, {{key:R}} perfil, {{key:X}} seções, {{key:E}} greides, {{key:D}} 3D, {{key:F}} ajustar, {{key:V}} selecionar. O ponto de partida. |
| {{ui:Drafting classic}} | Uma faixa de opções pequena ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) e uma linha de comando, para quem digita os comandos: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (desfazer), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Comece a digitar em qualquer lugar e as letras vão para a linha de comando; {{key:Enter}} executa, {{key:Enter}} sem nada repete o último comando, {{key:Esc}} limpa. O botão do meio faz pan. |
| {{ui:Civil ribbon}} | Guias de botões grandes, do jeito que os programas de projeto civil agrupam suas ferramentas: {{ui:Home}} (dados do terreno, criar projeto, vistas de perfil e de seção), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} e {{ui:Output}}, com um menu {{ui:File}} e botões rápidos à direita. As teclas simples continuam valendo. No plano, o botão do meio faz pan; no 3D, o botão do meio faz pan e {{key:Shift}} com o botão do meio faz órbita. |

Todos os estilos mantêm as teclas {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Uma tecla que pertence ao layout próprio do CivilCraft, mas que seu estilo deu a outro comando, não faz nada, e a linha de status informa para onde o comando foi (por exemplo, "Em Minhas teclas, Plataforma é Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} e as setas sempre mantêm o seu significado, e, enquanto você desenha uma linha, os pontos dela mantêm as suas teclas ({{key:Backspace}}, {{key:Enter}}).
:::

## Faça do seu jeito

1. Escolha o estilo mais próximo do que você quer e clique em {{ui:Customize…}}.
2. Em {{ui:Keys and menus}}, encontre um comando (a caixa de busca ajuda). Clique em {{ui:Add a key}} e pressione a tecla, ou duas teclas em sequência para uma tecla de duas letras. Clique em uma tecla para removê-la.
3. Com uma faixa de opções, {{ui:Where it sits}} move o comando para outra guia e painel, para o menu {{ui:File}} ou para {{ui:Keys only}}.
4. Em {{ui:Mouse}}, defina a roda, os botões que fazem pan no plano e o que cada botão faz na vista 3D.
5. Dê um nome e clique em {{ui:Save}}.

Salvar um estilo embutido cria a sua própria cópia ("Meu Ribbon civil"); o embutido nunca muda. Uma tecla atribuída a dois comandos, ou uma tecla que executaria antes de uma tecla de duas letras poder ser digitada, aparece em vermelho e precisa ser corrigida antes de você salvar.

## Mouse

- **Roda do mouse**: {{ui:Scroll up zooms in}} (o ponto de partida) ou {{ui:Scroll up zooms out}}, e a velocidade, no plano e no 3D. A pinça no trackpad sempre dá zoom no sentido em que os dedos se movem.
- **Fazer pan no plano com**: o botão do meio, o botão direito, ou os dois. {{key:Space}} e arrastar também fazem pan. O botão esquerdo sempre seleciona e desenha.
- **Arrastar na vista 3D**: {{ui:Each view's own}} mantém os botões do CivilCraft (esquerdo gira em órbita, direito faz pan). Ou defina cada botão para órbita, pan, zoom ou nenhum; {{key:Shift}} com o botão troca órbita e pan. Um clique sem arrastar ainda seleciona.

## Leve com você

{{ui:Export}} salva o estilo em uso como um pequeno arquivo `.ccinput.json`; {{ui:Import…}} adiciona um, vindo de outro computador ou de um colega. Um arquivo importado só pode apontar para os comandos do próprio CivilCraft: o restante é deixado de fora e contado na linha de status. {{ui:Delete this style}} remove um dos seus.

:::note
Estas configurações ficam neste navegador. {{ui:Use this style in every app}}, abaixo dos cartões de estilo, faz todos os apps abrirem no estilo correspondente (a barra própria, uma faixa de opções ou o Desenho clássico), com as mudanças que você fez em cada app. O CivilCraft não tem estilo de barra de menus: quando a barra de menus de outro app é escolhida para todos os apps, o CivilCraft mantém a sua própria barra de ferramentas.
:::

Relacionados: [Teclado e mouse](topic:keyboard) · [Configurações do CivilCraft](topic:settings) · [Vindo de outros programas de projeto civil](topic:coming-from)
