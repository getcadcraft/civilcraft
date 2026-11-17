---
title: Redes de utilidades e OpenStreetMap
summary: Troços de água, saneamento, pluviais, gás, eletricidade e telecomunicações, com material, dimensão, recobrimento e proprietário; dados do OpenStreetMap a partir de um ficheiro JSON do Overpass; cruzamentos, secções de vala e volumes; camadas de serviços em DWG, DXF e PDF; segmentos de tubagem e de cabo em IFC.
keywords: utilidade, utilidades, rede, osm, openstreetmap, overpass, tubagem, cabo, gás, saneamento, pluvial, telecomunicações, energia, água, boca de incêndio, câmara de visita, vala, cruzamento, folga, recobrimento, profundidade, dwg, ifc, georreferenciado, camadas
from: 8a85dace
---

Desenhe os serviços enterrados de um local como uma rede por serviço, verifique onde se cruzam e envie-os como camadas de desenho e como IFC.

## Criar troços

Abra **Superfície, Mais, Redes de utilidades...**

- **Criar um troço a partir da seleção** transforma o alinhamento, a linha característica ou a tubagem selecionados num troço do serviço escolhido. Depois preencha o material, a dimensão (mm), o recobrimento (a profundidade até ao topo do tubo ou do cabo) e o proprietário na tabela.
- **Ler dados do OpenStreetMap** lê um ficheiro JSON do Overpass que tenha guardado (uma consulta com `out geom;`). O projeto precisa primeiro de um sistema de coordenadas, porque as posições do OpenStreetMap são latitude e longitude. São lidas as tubagens (por substância), os cabos subterrâneos de energia e de telecomunicações, as bocas de incêndio, as câmaras de visita e os coletores pluviais. Tudo o resto é contado como omitido e indicado na mensagem. As linhas aéreas são omitidas.
- **Adicionar o mapa do OpenStreetMap** acrescenta o mapa do OpenStreetMap por baixo da planta. Só é desenhado enquanto as camadas de mapas da internet estiverem ativas nas Definições.

## Verificações e saídas

- **Cruzamentos**: os troços de serviços diferentes que se cruzam em planta são listados com a altura livre entre eles, quando existe uma superfície do terreno; o mínimo é um valor provisório que define, não um número de uma norma.
- **Vala**: cada troço tem uma vala (dimensão do tubo mais a folga de cada lado, inclinação do talude, leito de assentamento) com um volume. O total aparece na janela e no CSV.
- **Desenho**: os troços e os pontos ficam em camadas de serviço (por exemplo, U-WATR-RUN, U-POWR-RUN), para chegarem ao PDF, DXF e DWG.
- **IFC**: os troços entram na exportação IFC como segmentos de tubagem e segmentos de cabo, com bocas de incêndio, válvulas e câmaras, um sistema por serviço, no sistema de coordenadas do projeto.

## Dados do OpenStreetMap

Os dados do OpenStreetMap são protegidos por direitos de autor dos contribuidores do OpenStreetMap e licenciados ao abrigo da ODbL. A atribuição é acrescentada ao desenho, ao CSV e ao IFC. Se partilhar um ficheiro que contenha dados do OpenStreetMap, mantenha a atribuição e leia as cláusulas de partilha em condições idênticas da licença.

## O que não está feito

Os troços ainda não são desenhados ponto a ponto na planta com uma ferramenta, e os cruzamentos ainda não são desenhados na vista de perfil (o cálculo está construído). As profundidades, as dimensões e as folgas começam como valores provisórios: use os números da sua própria norma.
