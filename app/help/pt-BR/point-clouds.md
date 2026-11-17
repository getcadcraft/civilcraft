---
title: Nuvens de pontos de um drone ou scanner
summary: Com o complemento Nuvens de pontos, abra um arquivo LAS ou LAZ com milhões de pontos, veja todo o conjunto, limpe-o, classifique-o em terreno, vegetação e edificações, e crie a partir dele o terreno, as curvas de nível e os volumes.
keywords: nuvem de pontos, las, laz, drone, fotogrametria, recap, lidar, escaneamento, terreno, classificar, ruído, pilha, volume, corte e aterro, curvas de nível, linha de quebra, eye-dome, ortomosaico, ortho, projetar, camada de mapa, exportar las, exportar laz, compactar
from: e4a4901f
---

A maioria das pessoas nunca precisa disto, por isso é um complemento. Ative {{ui:Nuvens de pontos}} em Configurações › Complementos; uma aba {{ui:Nuvens de pontos}} aparece no painel da direita. O arquivo é lido no seu navegador e dividido em blocos, que ficam armazenados no próprio armazenamento do navegador (ou em uma pasta que você escolher). **Nada é enviado.**

:::warning
Tudo o que esta aba informa é um número obtido dos seus dados, não um certificado. Ela foi testada em um terreno fictício, ainda não em um levantamento real com drone: leia os primeiros resultados com cuidado e nos diga o que encontrar. O profissional registrado decide o valor do terreno, das curvas de nível e dos volumes.
:::

## Abrir uma nuvem

Em {{ui:Abrir nuvem}}, escolha um arquivo LAS ou LAZ. A aba informa quantos pontos ele tem, seu sistema de coordenadas e unidades, e quanto espaço a construção precisa; pressione {{ui:Construir a nuvem}}. A construção pode ser interrompida e continua com {{ui:Retomar}} (escolha de novo o mesmo arquivo). O arquivo nunca é alterado. Um arquivo de 100 milhões de pontos é construído em minutos em uma estação de trabalho e ocupa um espaço aproximadamente igual ao do próprio arquivo.

Em {{ui:Nuvens neste computador}} você abre ou remove uma nuvem. {{ui:Manter nuvens em uma pasta…}} (Chrome, Edge e o aplicativo Studio) mantém os blocos em uma pasta escolhida por você, por exemplo uma pasta de nuvens do CadCraft em Documentos, para que uma nuvem de 10 GB não precise caber no armazenamento do navegador; nuvens construídas antes permanecem onde foram construídas. O navegador pede permissão de novo após uma reinicialização: pressione {{ui:Usar a pasta … novamente}}.

## Visualizar

{{ui:Ver em 3D}} desenha a nuvem a partir de blocos grosseiros e a refina conforme você se aproxima, nunca mais de {{ui:Máximo de pontos desenhados}} de cada vez (2.5 milhões; 500 mil em um celular). Colorir pela cor do arquivo, altura, classe, intensidade ou {{ui:Resíduo}}. {{ui:Iluminação eye-dome}} sombreia as bordas pela profundidade, para que a forma seja lida sem normais (desligada em celular); {{ui:Pontos diminuem com a distância}} torna os pontos distantes menores e os próximos maiores; {{ui:Tamanho do ponto}} define o tamanho. A planta mostra a nuvem como uma imagem raster sob o seu desenho e **refina ao dar zoom** em uma parte dela.

## Limpar

Em {{ui:Limpar}}, desenhe um laço, uma caixa ou um polígono na planta (ou em 3D, a partir da vista de cima: em 3D o contorno é tomado na vertical, por isso só é exato vista de cima). A aba mostra quantos pontos estão dentro **antes** de você aplicar: {{ui:Apagar estes pontos}}, {{ui:Alterar a classe deles}}, {{ui:Restaurar pontos apagados}} ou {{ui:Recortar para este limite}}. {{ui:Desfazer}} e {{ui:Refazer}} percorrem o registro de edições; o arquivo em si nunca é alterado. {{ui:Filtro de ruído…}} marca pontos isolados como pontos baixos (classe 7) ou ruído alto (classe 18).

## Classificar

{{ui:Encontrar o terreno}} trabalha bloco por bloco e marca o terreno (classe 2) e os pontos baixos; a tolerância é de 0.15 m, ou 0.08 m com a opção de precisão de levantamento. Ela informa as emendas entre blocos que não coincidem. Em seguida, {{ui:Classificar vegetação e edificações}} marca vegetação baixa, média e alta, e edificações, pela altura acima do terreno e pelo quanto o entorno é plano. Não há aprendizado de máquina, então um galpão de telhado plano sob árvores pode ser classificado errado: confira.

## Terreno, curvas de nível, linhas de quebra

{{ui:Construir terreno}} cria o terreno existente a partir dos pontos de terreno e o adiciona ao projeto da mesma forma que uma importação LAS (uma etapa de desfazer). Em seguida compara os pontos com ele: a média, o RMS, o percentil 95, a parcela dentro da tolerância e os dez pontos que mais diferem, cada um com {{ui:Ir até lá}}. Colorir por {{ui:Resíduo}} mostra onde o terreno e a nuvem não concordam.

Uma **linha de quebra** (um meio-fio, uma valeta ou o topo de um talude) é escolhida sobre a nuvem: {{ui:Escolher uma linha de quebra na nuvem}} na vista 3D pega o ponto desenhado mais próximo a cada clique, e {{ui:Escolher uma linha de quebra na planta}} pega o ponto da nuvem mais próximo (terreno primeiro) sob cada clique; clique duplo ou Enter encerra a linha. A próxima {{ui:Construir terreno}} a utiliza. {{ui:Mostrar curvas de nível}} desenha as curvas sobre a nuvem em uma pequena imagem e define o intervalo do projeto.

## Volumes

{{ui:Volume de pilha…}} calcula o volume da superfície acima de uma base, dentro de um limite que você desenha. Desenhe o limite em terreno plano ao redor da pilha e escolha a base: o ponto mais baixo do limite, um plano, uma base curva suave, uma superfície passando pelo limite, ou um nível que você digita. Em terreno inclinado ou curvo, use o plano ou a base curva; o ponto mais baixo fica alto demais. Pontos do limite que se erguem acima dos demais (uma árvore na linha) ficam de fora da base. {{ui:Voo a voo}} calcula corte e aterro entre duas nuvens. Ambos podem ser salvos como CSV.

## Ortomosaico

Em {{ui:Ortomosaico (imagem de cima)}}, escolha o ortomosaico do drone junto com seu arquivo de mundo e o `.prj`, quando houver: um GeoTIFF, ou um PNG ou JPEG. Ele se torna uma **camada de mapa** do projeto, de modo que a planta o mostra sob o seu desenho, e a vista 3D (cor {{ui:Mapa}}) o aplica sobre o terreno construído; por isso, primeiro {{ui:Construir terreno}}. A aba informa quanto da nuvem a imagem cobre e avisa quando ela não cobre nada: a causa comum é um sistema de coordenadas diferente, então informe o arquivo `.prj` junto. Sem `.prj`, o programa pergunta onde estão as coordenadas. A imagem fica guardada dentro do arquivo do projeto; um GeoTIFF acima de 200 MB é recusado, e um mosaico muito grande é reduzido a 16 megapixels. Por isso, para um levantamento grande, recorte o mosaico ao local antes.

## Exportar

{{ui:Exportar}} grava a nuvem limpa e classificada como um novo arquivo (todos os pontos, as classes limpas ou somente o terreno). Em {{ui:Tipo de arquivo}}, escolha:

- **LAS 1.4 (sem compactação)**: formato de ponto 6, ou 7 com cor.
- **LAZ (compactado)**: os mesmos pontos compactados sem perda, de modo que cada ponto volta exatamente igual. É gravado como formato de ponto 0, ou 2 com cor, em um arquivo LAS 1.4. No terreno fictício de 300 m, o LAZ teve cerca de um quinto do tamanho do arquivo LAS 1.4. Os formatos LAZ 0 e 2 comportam somente as classes 0 a 31: um ponto com classe maior é recusado com uma mensagem; então exporte essa nuvem como LAS 1.4.

O LAZ é gravado pelo compactador próprio do CadCraft, feito a partir da especificação LAZ publicada. Verificamos que o nosso leitor e dois leitores LAZ independentes (laz-perf, que o aplicativo usa para abrir arquivos LAZ, e laspy com lazrs) leem cada ponto de volta exatamente, e que arquivos LAZ feitos pelo laspy saem byte a byte iguais quando gravamos novamente os pontos deles. Outros programas ainda não foram testados; então, se algum não abrir um arquivo, nos diga qual.

Quando o navegador consegue gravar o arquivo à medida que avança, você escolhe o arquivo primeiro, e uma nuvem muito grande é gravada nele um bloco por vez, em vez de ser reunida na memória; caso contrário, o arquivo é reunido e baixado, o que funciona bem até algumas centenas de megabytes.

## O que não faz

Lê somente LAS e LAZ (E57, PLY e PCD ainda não estão ligados a esta aba, e vários arquivos de um mesmo voo não são unidos), não reprojeta uma nuvem (assume-se o sistema e os metros do projeto), não lê arquivos RCP ou RCS da Autodesk, não cria uma superfície a partir de fotografias e não encontra postes, meios-fios ou tubulações por conta própria.
