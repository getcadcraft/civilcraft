---
title: Primeiros passos com o CivilCraft
summary: O que o CivilCraft faz, como o abrir, e os primeiros dez minutos com o local de exemplo, dos pontos às curvas de nível, uma estrada e um projeto guardado.
keywords: começar, primeira utilização, local de exemplo, introdução, início rápido, tutorial, iniciar, novo projeto
from: c9b6dd8e
---

O CivilCraft é a aplicação de engenharia civil e de projeto de locais da família CadCraft. Pega em pontos de levantamento e transforma-os numa superfície (um TIN) com curvas de nível, e depois permite traçar diretrizes com perfis de projeto, varrer um corredor rodoviário simples, modelar plataformas de edifícios até à intersecção com o terreno, verificar uma rede de coletores por gravidade segundo as suas regras e ver volumes de escavação e aterro. Lê e escreve LandXML, exporta a planta em DXF e imprime-a para PDF.

Se já utilizou o Civil 3D, as ideias serão familiares: pontos, grupos de pontos, linhas de quebra, diretrizes por PI, perfis por PVI, corredores, modelação do terreno, redes de coletores. A forma de trabalhar é diferente, e muito mais pequena: não há linha de comandos, nem estilos, nem ficheiro de desenho. Leia [Vindo de outro software de engenharia civil](topic:coming-from) uma vez antes do primeiro trabalho a sério.

## O que precisa

- Um navegador de ambiente de trabalho recente: Chrome, Edge, Firefox ou Safari. Consulte [Navegadores](common:browsers).
- Um rato ou trackpad e um teclado, ou um ecrã tátil: nele, o desenho tem botões {{ui:Concluir}}, {{ui:Anular ponto}} e {{ui:Cancelar}} no ecrã (consulte [Rato, trackpad e toque](topic:keyboard#mouse-trackpad-and-touch)).
- A planta é desenhada em 2D com o canvas do navegador. A [vista 3D](topic:site-3d) usa os gráficos WebGL do navegador; se não conseguir arrancar, a barra de estado diz porquê e a planta continua a funcionar.
- Sem conta e sem carregamentos. Os ficheiros abrem-se no seu computador e guardam-se como transferências. Consulte [Os seus ficheiros](common:your-files).

:::note
O CivilCraft corre hoje como uma versão inicial no navegador que ainda está a ser feita. Ainda não há versões para ambiente de trabalho nem gravação na nuvem. Tudo o que fizer fica no seu computador até guardar ou exportar.
:::

## Abrir o CivilCraft

1. Abra o CivilCraft no navegador.
2. Aguarde que o ecrã se encha: uma barra de ferramentas no topo, um painel à esquerda, a planta ao centro e um painel **Propriedades** à direita.
3. Numa planta vazia vê uma caixa com o título **Comece com pontos do levantamento**. Lista os primeiros passos e tem uma ligação, {{ui:Abrir o local de exemplo}}.

Para utilizar o CivilCraft mais tarde sem ligação, clique em {{ui:Guardar para offline}} na barra da aplicação e aguarde por {{ui:Pronto para offline}}. Inclui esta ajuda, o local de exemplo e as bibliotecas 3D e SIG. Consulte [Offline](common:offline). Prima {{key:F1}} ou clique em {{ui:Ajuda}} em qualquer altura para abrir esta ajuda ao lado da aplicação.

## Os seus primeiros dez minutos: o local de exemplo

O local de exemplo é um pequeno levantamento em pés dos EUA: 276 pontos em coordenadas de plano estadual, uma cumeada, uma vala com uma linha de talvegue e dois topos de talude. Vem com a aplicação, pelo que pode acompanhar sem ter um ficheiro seu.

1. Clique em {{ui:Abrir o local de exemplo}} na caixa da planta.
   Abre-se a caixa de diálogo **Importar pontos**. Diz "276 pontos lidos como PNEZD (pela linha de cabeçalho), separados por vírgulas." e mostra as primeiras linhas.
2. Clique em {{ui:Importar}}.
   A planta enche-se de pontos, curvas de nível e do limite da superfície. A barra de estado, em baixo, diz que os pontos foram importados e quantos triângulos tem a superfície (546).
3. Olhe para o painel da esquerda, em **Pontos**. Os pontos estão agrupados pela primeira palavra da descrição: CP, FL, GRD, RIDGE, TBN, TBS e TREE.
4. Na coluna **Superfície** dessa tabela, defina **FL**, **RIDGE**, **TBN** e **TBS** como {{ui:Linha de quebra}}.
   A superfície reconstrói-se de imediato. Os dados de **Superfície** dizem agora "Linhas de quebra: 4", e as curvas de nível dobram-se bruscamente ao longo do talvegue e da cumeada em vez de os atravessarem.
5. Mova o ponteiro sobre a planta. A barra de estado mostra o este e o norte sob o ponteiro e a cota do terreno nesse ponto.
6. Em **Visualização**, defina {{ui:Curvas de nível a cada}} como 0.5 ft e ligue {{ui:Faixas de cota}}. Aparece uma escala de cores com uma legenda por baixo das caixas de verificação. Volte a desligar as faixas quando acabar.

Já tem uma superfície de terreno natural. A seguir, uma estrada.

## Traçar uma estrada curta

1. Prima {{key:A}} (ou clique em {{ui:Diretriz}} no grupo **Projeto**).
2. Clique em três pontos ao longo do local, um a seguir ao outro. Uma linha vermelha acompanha o ponteiro e mostra o comprimento e o rumo do alinhamento reto seguinte.
3. Prima {{key:Enter}} para terminar.
   A diretriz aparece com os PK. O painel da direita mostra **Diretriz**: o seu comprimento, a tabela de PI e a curva no PI do meio (raio de 100 ft, ou menor se 100 ft não couber).
4. No painel da direita, em **Perfil de projeto**, clique em {{ui:Começar a partir do terreno}}.
   A vista do perfil abre-se por baixo da planta com o terreno natural e uma rasante de projeto reta de ponta a ponta.
5. Prima {{key:I}} para ligar {{ui:Adicionar PVI}} e depois clique uma vez na vista do perfil, perto do meio. Aparece um PVI.
6. Na tabela de PVI à direita, escreva um comprimento de curva (por exemplo 100) na caixa **L da curva** do PVI do meio e prima {{key:Enter}}. O perfil tem agora uma curva vertical, com o seu valor K indicado.
7. Em **Corredor**, assinale **Varrer um perfil tipo ao longo do perfil de projeto**.
   A estrada é modelada no terreno: vias, bermas e taludes até à intersecção com o terreno. O bloco **Movimento de terras** mostra a escavação e o aterro.

Não se preocupe com valores exatos. Todos os números podem ser alterados no painel da direita, e {{key:Mod+Z}} anula a última alteração.

## Guardar o trabalho

1. Escreva um nome em **Nome**, no topo do painel da esquerda.
2. Prima {{key:Mod+S}} (ou clique em {{ui:Guardar}}).
   O navegador transfere um ficheiro com o nome do local, terminado em `.civilcraft.json`. Contém os pontos, as definições da superfície, as diretrizes, os perfis, os corredores, as plataformas e os coletores.
3. Para continuar mais tarde, clique em {{ui:Abrir}} (ou prima {{key:Mod+O}}) e escolha esse ficheiro, ou largue-o na planta.

:::warning
Não há gravação automática. Se fechar o separador com alterações não guardadas, o navegador pergunta se quer sair; se sair, as alterações perdem-se. Guarde com frequência.
:::

## Para onde ir a seguir

- [Importar pontos de levantamento](topic:import-points) com os seus próprios ficheiros.
- [Construir e afinar a superfície](topic:build-surface) com linhas de quebra e um limite.
- [O ecrã, parte por parte](topic:workspace).
- [Teclas e rato](topic:keyboard).
