---
title: Nuvens de pontos de um drone ou scanner
summary: Com o suplemento Nuvens de pontos, abra um ficheiro LAS ou LAZ com milhões de pontos, observe a nuvem toda, limpe-a, separe-a em terreno, vegetação e edifícios, e construa a partir dela o terreno, as curvas de nível e os volumes.
keywords: nuvem de pontos, las, laz, drone, fotogrametria, recap, lidar, digitalização, terreno, classificar, ruído, depósito, volume, escavação e aterro, curvas de nível, linha de quebra, eye-dome, ortomosaico, ortho, drape, camada de mapa, exportar las, exportar laz, comprimir
from: e4a4901f
---

Poucas pessoas precisam disto, por isso é um suplemento. Ative {{ui:Nuvens de pontos}} em Definições › Suplementos; surge um separador {{ui:Nuvens de pontos}} no painel da direita. O ficheiro é lido no navegador e dividido em blocos que ficam guardados no armazenamento do próprio navegador (ou numa pasta que escolha). **Nada é carregado.**

:::warning
Tudo o que este separador apresenta é um número dos seus dados, não um certificado. Foi testado num local fictício, ainda não num levantamento real com drone: leia os primeiros resultados com cuidado e diga-nos o que encontrar. O técnico inscrito na ordem profissional decide o valor do terreno, das curvas de nível e dos volumes.
:::

## Abrir uma nuvem

Em {{ui:Abrir uma nuvem}} escolha um ficheiro LAS ou LAZ. O separador indica quantos pontos tem, o seu sistema de coordenadas e unidades, e o espaço necessário para uma construção; prima {{ui:Construir a nuvem}}. Uma construção pode ser interrompida e continua com {{ui:Retomar}} (escolha de novo o mesmo ficheiro). O ficheiro nunca é alterado. Um ficheiro de 100 milhões de pontos constrói-se em minutos numa estação de trabalho e ocupa aproximadamente o mesmo espaço que o ficheiro.

Em {{ui:Nuvens neste computador}} abre ou remove uma nuvem. {{ui:Manter as nuvens numa pasta…}} (Chrome, Edge e a aplicação Studio) mantém os blocos numa pasta escolhida, por exemplo uma pasta de nuvens do CadCraft em Documentos, para que uma nuvem de 10 GB não tenha de caber no armazenamento do navegador; as nuvens construídas antes continuam onde foram construídas. O navegador volta a pedir autorização após um reinício: prima {{ui:Utilizar a pasta … novamente}}.

## Ver a nuvem

{{ui:Ver em 3D}} desenha a nuvem a partir de blocos grosseiros e refina à medida que se aproxima, sem nunca ultrapassar {{ui:Máximo de pontos desenhados}} de cada vez (2.5 milhões; 500 mil num telemóvel). Colorir pela cor do ficheiro, pela altura, pela classe, pela intensidade ou pelo resíduo. {{ui:Iluminação eye-dome}} sombreia as arestas pela profundidade para que a forma se perceba sem normais (desligada num telemóvel); {{ui:Pontos diminuem com a distância}} torna os pontos distantes mais pequenos e os próximos maiores; {{ui:Tamanho do ponto}} define o tamanho. A planta mostra a nuvem como uma imagem raster sob o desenho e **refina ao aproximar o zoom** de uma parte dela.

## Limpar

Em {{ui:Limpar}} desenhe um laço, uma caixa ou um polígono na planta (ou em 3D a partir da vista de topo: em 3D o contorno é projetado na vertical, por isso só é exato vista de cima). O separador mostra quantos pontos estão dentro **antes** de aplicar: {{ui:Eliminar estes pontos}}, {{ui:Alterar a classe}}, {{ui:Repor pontos eliminados}} ou {{ui:Recortar a este limite}}. {{ui:Anular}} e {{ui:Refazer}} percorrem o registo de edições; o ficheiro em si nunca é alterado. {{ui:Filtro de ruído…}} marca os pontos isolados como pontos baixos (classe 7) ou ruído alto (classe 18).

## Separar

{{ui:Encontrar o terreno}} trabalha bloco a bloco e marca o terreno (classe 2) e os pontos baixos; a tolerância é de 0.15 m, ou 0.08 m com o interruptor de qualidade de levantamento. Assinala as costuras entre blocos que não coincidem. {{ui:Classificar vegetação e edifícios}} marca depois a vegetação baixa, média e alta e os edifícios, a partir da altura acima do terreno e de quão plano é o envolvente. Não há aprendizagem automática, por isso um anexo de topo plano sob árvores pode estar errado: verifique.

## Terreno, curvas de nível, linhas de quebra

{{ui:Construir terreno}} cria o terreno existente a partir dos pontos do solo e acrescenta-o ao projeto da mesma forma que uma importação LAS (um passo de anulação). Depois compara os pontos com ele: a média, o RMS, o percentil 95, a parte dentro da tolerância e os dez locais que mais diferem, cada um com {{ui:Ir para lá}}. Colorir por {{ui:Resíduo}} mostra onde o terreno e a nuvem não coincidem.

Uma **linha de quebra** (um lancil, uma valeta ou a crista de um talude) é escolhida na nuvem: {{ui:Escolher uma linha de quebra na nuvem}} na vista 3D toma o ponto desenhado mais próximo em cada clique, e {{ui:Escolher uma linha de quebra na planta}} toma o ponto da nuvem mais próximo (o terreno primeiro) sob cada clique; duplo clique ou Enter termina a linha. A seguinte {{ui:Construir terreno}} usa-a. {{ui:Mostrar curvas de nível}} desenha as curvas de nível sobre a nuvem numa pequena imagem e define o intervalo do projeto.

## Volumes

{{ui:Volume de depósito…}} calcula o volume da superfície acima de uma base dentro de um limite que desenha. Desenhe o limite em terreno plano à volta da pilha e escolha a base: o ponto mais baixo do limite, um plano, uma base curva suave, uma superfície que passa pelo limite, ou um nível que escreve. Em terreno inclinado ou curvo use o plano ou a base curva; o ponto mais baixo dá um valor alto demais. Os pontos do limite que estão acima dos restantes (uma árvore na linha) ficam fora da base. {{ui:De voo para voo}} dá a escavação e o aterro entre duas nuvens. Ambos podem ser guardados como CSV.

## Ortomosaico

Em {{ui:Ortomosaico (imagem vista de cima)}} escolha o ortomosaico do drone junto com o seu world file e o `.prj`, quando os tiver: um GeoTIFF, ou um PNG ou JPEG. Passa a ser uma **camada de mapa** do projeto, por isso a planta a mostra sob o desenho, e a vista 3D (cor {{ui:Mapa}}) pinta-a no terreno que construiu, por isso primeiro {{ui:Construir terreno}}. O separador indica quanto da nuvem a imagem cobre, e avisa quando não cobre nenhuma: a causa habitual é outro sistema de coordenadas, por isso indique o ficheiro `.prj` junto com ela. Quando não há `.prj`, o programa pergunta onde estão as coordenadas. A imagem fica guardada dentro do ficheiro do projeto; um GeoTIFF com mais de 200 MB é recusado e um mosaico muito grande é reduzido a 16 megapixels, por isso, num levantamento grande, recorte primeiro o mosaico para o local.

## Exportar

{{ui:Exportar}} escreve a nuvem limpa e classificada como um ficheiro novo (todos os pontos, as classes limpas, ou apenas o terreno). Em {{ui:Tipo de ficheiro}} escolha:

- **LAS 1.4 (sem compressão)**: formato de ponto 6, ou 7 com cor.
- **LAZ (comprimido)**: os mesmos pontos comprimidos sem perda, por isso cada ponto volta exatamente. É escrito como formato de ponto 0, ou 2 com cor, num ficheiro LAS 1.4. No local fictício de 300 m o LAZ teve cerca de um quinto do tamanho do ficheiro LAS 1.4. Os formatos LAZ 0 e 2 só contêm as classes 0 a 31: um ponto com classe superior é recusado com uma mensagem, por isso exporte essa nuvem como LAS 1.4.

O LAZ é escrito pelo compressor próprio do CadCraft, feito a partir da especificação LAZ publicada. Verificámos que o nosso próprio leitor e dois leitores LAZ independentes (laz-perf, que a aplicação usa para abrir ficheiros LAZ, e laspy com lazrs) leem cada ponto de volta exatamente, e que os ficheiros LAZ feitos pelo laspy saem byte a byte iguais quando voltamos a escrever os pontos deles. Outros programas ainda não foram testados, por isso, se um não abrir um ficheiro, diga-nos qual.

Onde o navegador consegue escrever um ficheiro à medida que avança, escolhe-se primeiro o ficheiro e uma nuvem muito grande é escrita nele um bloco de cada vez, em vez de ser reunida em memória; caso contrário o ficheiro é reunido e transferido, o que é adequado até cerca de algumas centenas de megabytes.

## O que não faz

Lê apenas LAS e LAZ (E57, PLY e PCD ainda não estão ligados a este separador, e vários ficheiros de um mesmo voo não são unidos), não reprojeta uma nuvem (assume-se o sistema e os metros do projeto), não lê os ficheiros RCP ou RCS da Autodesk, não faz uma superfície a partir de fotografias, e não encontra sozinho postes, lancis ou tubagens.
