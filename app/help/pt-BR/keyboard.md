---
title: Teclas e mouse
summary: Todo atalho de teclado e toda ação de mouse, trackpad e toque no CivilCraft, agrupados, com as diferenças de navegador e de plataforma.
keywords: teclado, atalhos, teclas de atalho, teclas, mouse, trackpad, toque, pan, zoom, pinça, roda, clique com o botão direito, mac, tecla command
from: a9756f46
---

As teclas de uma letra funcionam quando você não está digitando em uma caixa. Atalhos com {{key:Mod}} usam Command no Mac e Ctrl nos demais. Veja também [Teclas no navegador](common:keys).

## Arquivos e edição

| Tecla | Ação |
|---|---|
| {{key:Mod+O}} | Abrir um arquivo de pontos, LandXML ou projeto |
| {{key:Mod+S}} | Salvar o projeto (baixa um arquivo `.civilcraft.json`) |
| {{key:Mod+P}} | Plotar a planta em PDF (abre a caixa de plotagem, não a impressão do navegador) |
| {{key:Mod+Z}} | Desfazer |
| {{key:Mod+Y}} | Refazer |
| {{key:Delete}} | Excluir os pontos de levantamento, o alinhamento, a plataforma, a estrutura, o tubo ou o PIV selecionados |
| {{key:Mod+C}} | Copiar os pontos de levantamento selecionados (também como linhas de pontos para uma planilha) |
| {{key:Mod+X}} | Recortar os pontos de levantamento selecionados |
| {{key:Mod+V}} | Colar pontos: eles seguem o ponteiro, clique onde devem ir |
| {{key:Mod+Shift+V}} | Colar no mesmo local: nas próprias coordenadas dos pontos |
| {{key:Mod+D}} | Duplicar os pontos selecionados: uma cópia segue o ponteiro |
| {{key:Mod+A}} | Selecionar todos os pontos de levantamento |
| {{key:Esc}} | Limpar a seleção (e cancelar uma colagem) |

{{key:Mod+S}}, {{key:Mod+O}} e {{key:Mod+P}} funcionam mesmo enquanto você digita em uma caixa. {{key:Mod+Z}} e {{key:Mod+Y}} em uma caixa de texto desfazem sua digitação, como de costume, e o mesmo fazem {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} e {{key:Mod+A}}: em uma caixa, copiam, recortam, colam e selecionam o texto dela. Com texto selecionado na página (em um painel), {{key:Mod+C}} copia esse texto. {{key:Mod+Shift+Z}} não faz nada no CivilCraft: use {{key:Mod+Y}} ou o botão {{ui:Refazer}}.

:::mac
A tecla rotulada **delete** no Mac é {{key:Backspace}} para o navegador. Para excluir uma seleção, pressione {{key:Delete}} (Fn e delete), ou escolha {{ui:Excluir}} na barra de ferramentas, no menu {{ui:Mais}}.
:::

## Ferramentas

| Tecla | Ferramenta |
|---|---|
| {{key:V}} | {{ui:Selecionar}} |
| {{key:M}} | {{ui:Medir}}: distâncias, áreas e declividades na planta ([Medir](topic:measure)) |
| {{key:A}} | {{ui:Alinhamento}} |
| {{key:G}} | {{ui:Plataforma}} |
| {{key:P}} | {{ui:Tubos}} |
| {{key:B}} | {{ui:Linha de quebra}} |
| {{key:O}} | {{ui:Limite}} |
| {{key:R}} | Mostrar ou ocultar a vista de perfil |
| {{key:I}} | Ligar ou desligar {{ui:Adicionar PIVs}} (abre a vista de perfil se ela estiver fechada) |
| {{key:F}} | {{ui:Ajustar}}: mostrar tudo |
| {{key:D}} | {{ui:3D}}: mostrar o local em 3D, ou voltar para a planta |
| {{key:E}} | Mostrar ou ocultar greides e elevações ao longo de cada linha de feição (somente na tela) |

Pressionar a tecla da ferramenta ativa outra vez volta para {{ui:Selecionar}}. Letras com Shift não fazem nada.

## Enquanto desenha

| Tecla | Ação |
|---|---|
| {{key:Enter}} | Concluir o alinhamento, a plataforma, o trecho de tubulação, a linha de quebra ou o limite |
| {{key:Backspace}} | Remover o último ponto clicado |
| {{key:C}} | Linha de feição: ligar ou desligar arcos (depois de um vértice, clique em um ponto da curva, depois no fim dela) |
| {{key:Esc}} | Cancelar o desenho (ou a colagem); pressionado de novo (ou com nada desenhado), volta para {{ui:Selecionar}} e limpa a seleção |

## Vista da planta

| Tecla ou ação | Resultado |
|---|---|
| Roda | Aproximar ou afastar (zoom) no ponteiro |
| Arrastar em espaço vazio | Pan (em qualquer ferramenta; um clique curto ainda clica; com {{key:Shift}} pressionada, desenha uma caixa de seleção) |
| Arrastar com o botão do meio | Pan |
| Arrastar com o botão direito | Pan (nenhum menu abre) |
| {{key:Space}} e arrastar | Pan |
| Clique | Selecionar (com {{ui:Selecionar}}), ou posicionar um ponto (com uma ferramenta de desenho) |
| {{key:Shift}} e clique | Adicionar um ponto de levantamento à seleção, ou retirá-lo |
| {{key:Shift}} e arrastar | Desenhar uma caixa: os pontos de levantamento dentro dela são adicionados à seleção. Arraste em volta deles para um [laço](topic:lasso-selection) |
| {{key:Space}} enquanto desenha um laço | Janela, depois cruzamento, depois cerca |
| Clique ao colar | Coloca os pontos colados ali ({{key:Enter}} os coloca em suas próprias coordenadas) |
| Arrastar um grip | Mover um PI, um canto de plataforma ou uma estrutura (uma etapa de desfazer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pan, quando a planta tem o foco (clique nela antes) |
| {{key:Plus}} e {{key:Minus}} | Aproximar e afastar no centro, quando a planta tem o foco |

A tecla = aproxima como {{key:Plus}}, então você não precisa de Shift.

## Vista de perfil

| Ação | Resultado |
|---|---|
| Clique com {{ui:Adicionar PIVs}} ligado | Adiciona um PIV ali |
| Clique em um PIV | Seleciona-o |
| Arrastar um PIV | Move-o (uma etapa de desfazer) |
| {{key:Delete}} ou {{key:Backspace}} | Remove o PIV selecionado (Backspace somente quando a vista de perfil tem o foco) |

A vista de perfil não faz zoom nem pan.

## Tela e ajuda

| Tecla | Ação |
|---|---|
| {{key:F1}} | Abrir ou fechar esta ajuda (o painel lateral); {{ui:Ajuda}} na barra do aplicativo faz o mesmo |
| {{key:Esc}} | Fechar o painel de ajuda quando ele estiver aberto |
| {{key:Ctrl+Shift+F}} | Alternar os modos de tela: tela cheia, tela cheia com as barras ocultas, normal |
| {{key:Esc}} | Sair da tela cheia (a tecla do próprio navegador) |

{{key:F1}} chega à ajuda antes que o CivilCraft o veja, então funciona em qualquer ferramenta. Na maioria dos teclados de Mac, pressione fn com F1, ou clique em {{ui:Ajuda}}. {{key:Ctrl+Shift+F}} usa a tecla Control em todas as plataformas, inclusive no Mac. Veja [Usando a ajuda](common:help) para saber como pesquisar nesta ajuda.

## Mouse, trackpad e toque

:::mouse
- A roda aproxima no ponteiro. Um mouse com roda de giro livre aproxima rápido: dê giros curtos.
- Faça pan com qualquer arraste em espaço vazio, com o botão do meio, com o botão direito, ou com {{key:Space}} e arrastar.
:::

:::mac
No trackpad de Mac:

- A rolagem com dois dedos **aproxima** (não faz pan), e o pinçar também aproxima.
- Para fazer pan, pressione e arraste em espaço vazio com um dedo, ou segure {{key:Space}} e arraste.
- Um clique com dois dedos (clique com o botão direito) não abre menu e não faz nada por si só.
:::

:::touch
Em uma tela de toque:

- O primeiro toque deixa os botões e as linhas de menu do tamanho de um dedo.
- Toque para selecionar ou para posicionar um ponto; um dedo arrastado em espaço vazio faz pan. Um toque pode tremer um pouco: só faz pan depois que o dedo se mover cerca de 10 pixels.
- Dois dedos pinçam para aproximar e se movem juntos para fazer pan.
- Arraste um grip ou um PIV com um dedo. Os grips têm a largura de um dedo ao redor deles.
- Ao desenhar um alinhamento, uma plataforma, uma linha de quebra, um limite, um trecho de tubulação, uma linha de feição ou um lote, uma barra sobre a planta oferece {{ui:Concluir}} ({{key:Enter}}), {{ui:Desfazer ponto}} ({{key:Backspace}}) e {{ui:Cancelar}} ({{key:Esc}}). Um toque longo (meio segundo sem mover) também conclui.
- Em {{ui:Selecionar}}, um toque longo em um ponto de levantamento o adiciona à seleção, ou o retira, como faz {{key:Shift}}+clique.
- Na vista 3D, um dedo orbita, dois pinçam e fazem pan, e um toque escolhe.
- Não há passagem do cursor no toque, então as leituras da barra de status só são atualizadas enquanto um dedo está pressionado.
:::

## Teclas do navegador que prevalecem

Algumas teclas pertencem ao navegador e nunca chegam ao CivilCraft, por exemplo {{key:Mod+W}} (fechar aba), {{key:Mod+T}} (nova aba), {{key:Mod+N}} (nova janela) e {{key:F11}} (tela cheia em navegadores no Windows e Linux). O CivilCraft não usa essas teclas. Se um atalho abrir algo no navegador, clique uma vez na planta para que a página tenha o foco e tente de novo.

## Onde fica o Mover

Não há comando Mover: escolha {{ui:Selecionar}} e arraste um ponto ou um vértice, ou edite suas coordenadas em {{ui:Propriedades}}. Veja [Editar pontos](topic:edit-points).
