---
title: Teclas e rato
summary: Todos os atalhos de teclado e todas as ações de rato, trackpad e toque no CivilCraft, agrupados, com as diferenças de navegador e de plataforma.
keywords: teclado, atalhos, teclas de atalho, teclas, rato, trackpad, toque, deslocar a vista, zoom, pinça, roda, clique com o botão direito, mac, tecla command
from: a9756f46
---

As teclas de uma só letra funcionam quando não está a escrever numa caixa. Os atalhos com {{key:Mod}} usam Command no Mac e Ctrl nos restantes. Veja também [Teclas no navegador](common:keys).

## Ficheiros e edição

| Tecla | Ação |
|---|---|
| {{key:Mod+O}} | Abrir um ficheiro de pontos, LandXML ou projeto |
| {{key:Mod+S}} | Guardar o projeto (transfere um ficheiro `.civilcraft.json`) |
| {{key:Mod+P}} | Imprimir a planta para PDF (abre a caixa de diálogo de impressão, não a do navegador) |
| {{key:Mod+Z}} | Anular |
| {{key:Mod+Y}} | Refazer |
| {{key:Delete}} | Eliminar os pontos de levantamento, a diretriz, a plataforma, a estrutura, o coletor ou o PVI selecionados |
| {{key:Mod+C}} | Copiar os pontos de levantamento selecionados (também como linhas de pontos para uma folha de cálculo) |
| {{key:Mod+X}} | Cortar os pontos de levantamento selecionados |
| {{key:Mod+V}} | Colar pontos: seguem o ponteiro; clique onde devem ficar |
| {{key:Mod+Shift+V}} | Colar no mesmo sítio: nas próprias coordenadas dos pontos |
| {{key:Mod+D}} | Duplicar os pontos selecionados: uma cópia segue o ponteiro |
| {{key:Mod+A}} | Selecionar todos os pontos de levantamento |
| {{key:Esc}} | Limpar a seleção (e cancelar uma colagem) |

{{key:Mod+S}}, {{key:Mod+O}} e {{key:Mod+P}} funcionam mesmo enquanto está a escrever numa caixa. {{key:Mod+Z}} e {{key:Mod+Y}} numa caixa de texto anulam ou refazem a escrita, como é habitual, e o mesmo acontece com {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} e {{key:Mod+A}}: numa caixa copiam, cortam, colam e selecionam o seu texto. Com texto selecionado na página (num painel), {{key:Mod+C}} copia esse texto. {{key:Mod+Shift+Z}} não faz nada no CivilCraft: use {{key:Mod+Y}} ou o botão {{ui:Refazer}}.

:::mac
Para o navegador, a tecla do Mac com a indicação **delete** corresponde a {{key:Backspace}}. Para eliminar uma seleção, prima {{key:Delete}} (Fn e delete), ou escolha {{ui:Eliminar}} no menu {{ui:Mais}} da barra de ferramentas.
:::

## Ferramentas

| Tecla | Ferramenta |
|---|---|
| {{key:V}} | {{ui:Selecionar}} |
| {{key:M}} | {{ui:Medir}}: distâncias, áreas e inclinações na planta ([Medir](topic:measure)) |
| {{key:A}} | {{ui:Diretriz}} |
| {{key:G}} | {{ui:Plataforma}} |
| {{key:P}} | {{ui:Coletores}} |
| {{key:B}} | {{ui:Linha de quebra}} |
| {{key:O}} | {{ui:Limite}} |
| {{key:R}} | Mostrar ou ocultar a vista de perfil |
| {{key:I}} | Ativar ou desativar {{ui:Adicionar PVI}} (abre a vista de perfil se estiver fechada) |
| {{key:F}} | {{ui:Ajustar}}: mostrar tudo |
| {{key:D}} | {{ui:3D}}: mostrar o local em 3D, ou voltar à planta |
| {{key:E}} | Mostrar ou ocultar as inclinações e cotas ao longo de todas as linhas características (apenas no ecrã) |

Premir de novo a tecla da ferramenta ativa volta a {{ui:Selecionar}}. As letras com Shift não fazem nada.

## Durante o desenho

| Tecla | Ação |
|---|---|
| {{key:Enter}} | Concluir a diretriz, a plataforma, o percurso da tubagem, a linha de quebra ou o limite |
| {{key:Backspace}} | Remover o último ponto clicado |
| {{key:C}} | Linha característica: ativar ou desativar arcos (depois de um vértice, clique num ponto da curva e depois no seu fim) |
| {{key:Esc}} | Cancelar o desenho (ou a colagem); premido de novo (ou sem nada desenhado), volta a {{ui:Selecionar}} e limpa a seleção |

## Vista em planta

| Tecla ou ação | Resultado |
|---|---|
| Roda | Aproximar ou afastar o zoom no ponteiro |
| Arrastar num espaço vazio | Deslocar a vista (em qualquer ferramenta; um clique curto continua a clicar; com {{key:Shift}} premida, desenha uma caixa de seleção) |
| Arrastar com o botão do meio | Deslocar a vista |
| Arrastar com o botão direito | Deslocar a vista (nenhum menu abre) |
| {{key:Space}} e arrastar | Deslocar a vista |
| Clique | Selecionar (com {{ui:Selecionar}}), ou colocar um ponto (com uma ferramenta de desenho) |
| {{key:Shift}} e clique | Acrescentar um ponto de levantamento à seleção, ou retirá-lo |
| {{key:Shift}} e arrastar | Desenhar uma caixa: os pontos de levantamento dentro dela são acrescentados à seleção. Arraste à volta deles para um [laço](topic:lasso-selection) |
| {{key:Space}} enquanto desenha um laço | Janela, depois cruzamento, depois vedação |
| Clique ao colar | Coloca ali os pontos colados ({{key:Enter}} coloca-os nas suas próprias coordenadas) |
| Arrastar um grip (ponto de controlo) | Mover uma PI, um canto da plataforma ou uma estrutura (um passo de anulação) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Deslocar a vista, quando a planta tem o foco (clique primeiro nela) |
| {{key:Plus}} e {{key:Minus}} | Aproximar e afastar o zoom ao centro, quando a planta tem o foco |

A tecla = aproxima o zoom como {{key:Plus}}, por isso não precisa de Shift.

## Vista de perfil

| Ação | Resultado |
|---|---|
| Clique com {{ui:Adicionar PVI}} ativado | Adiciona um PVI ali |
| Clique num PVI | Seleciona-o |
| Arrastar um PVI | Move-o (um passo de anulação) |
| {{key:Delete}} ou {{key:Backspace}} | Remove o PVI selecionado (Backspace só quando a vista de perfil tem o foco) |

A vista de perfil não aproxima o zoom nem desloca a vista.

## Ecrã e ajuda

| Tecla | Ação |
|---|---|
| {{key:F1}} | Abrir ou fechar esta ajuda (o painel lateral); {{ui:Ajuda}} na barra da aplicação faz o mesmo |
| {{key:Esc}} | Fechar o painel de ajuda quando está aberto |
| {{key:Ctrl+Shift+F}} | Alternar os modos de ecrã: ecrã inteiro, ecrã inteiro com as barras ocultas, normal |
| {{key:Esc}} | Sair do ecrã inteiro (a tecla própria do navegador) |

{{key:F1}} chega à ajuda antes de o CivilCraft a ver, por isso funciona em qualquer ferramenta. Na maioria dos teclados Mac, prima fn com F1, ou clique em {{ui:Ajuda}}. {{key:Ctrl+Shift+F}} usa a tecla Control em todas as plataformas, incluindo o Mac. Veja [Utilizar a ajuda](common:help) para saber como pesquisar nesta ajuda.

## Rato, trackpad e toque

:::mouse
- A roda aproxima o zoom no ponteiro. Um rato com roda de rotação livre aproxima depressa: dê voltas curtas.
- Desloque a vista com qualquer arrasto num espaço vazio, com o botão do meio, com o botão direito, ou com {{key:Space}} e arrastar.
:::

:::mac
No trackpad de um Mac:

- Deslizar com dois dedos **aproxima o zoom** (não desloca a vista), e o gesto de pinça também.
- Para deslocar a vista, prima e arraste num espaço vazio com um dedo, ou mantenha {{key:Space}} premida e arraste.
- Um clique com dois dedos (botão direito) não abre menu e não faz nada por si só.
:::

:::touch
Num ecrã tátil:

- O primeiro toque torna os botões e as linhas de menu do tamanho de um dedo.
- Toque para selecionar ou para colocar um ponto; um dedo arrastado num espaço vazio desloca a vista. Um toque pode oscilar um pouco: só desloca a vista depois de o dedo se mover cerca de 10 pixels.
- Dois dedos fazem pinça para aproximar o zoom e movem-se juntos para deslocar a vista.
- Arraste um grip ou um PVI com um dedo. Os grips têm a largura de um dedo à volta deles.
- Enquanto desenha uma diretriz, plataforma, linha de quebra, limite, percurso de tubagem, linha característica ou parcela, uma barra sobre a planta oferece {{ui:Concluir}} ({{key:Enter}}), {{ui:Anular ponto}} ({{key:Backspace}}) e {{ui:Cancelar}} ({{key:Esc}}). Uma pressão prolongada (meio segundo sem mover) também conclui.
- Em {{ui:Selecionar}}, uma pressão prolongada num ponto de levantamento acrescenta-o à seleção, ou retira-o, como faz {{key:Shift}}+clique.
- Na vista 3D, um dedo orbita, dois fazem pinça e deslocam, e um toque escolhe.
- No toque não existe passar o ponteiro por cima, pelo que as leituras da barra de estado só se atualizam enquanto um dedo estiver pressionado.
:::

## Teclas do navegador com prioridade

Algumas teclas pertencem ao navegador e nunca chegam ao CivilCraft, por exemplo {{key:Mod+W}} (fechar separador), {{key:Mod+T}} (novo separador), {{key:Mod+N}} (nova janela) e {{key:F11}} (ecrã inteiro nos navegadores do Windows e do Linux). O CivilCraft não as usa. Se um atalho abrir algo no navegador, clique uma vez na planta para a página ter o foco e tente de novo.

## Onde fica o Mover

Não existe o comando Mover: escolha {{ui:Selecionar}} e arraste um ponto ou um vértice, ou edite as suas coordenadas em {{ui:Propriedades}}. Veja [Editar pontos](topic:edit-points).
