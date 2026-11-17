---
title: Redes de utilidades e OpenStreetMap
summary: Trechos de água, esgoto, drenagem, gás, energia e telecomunicações com material, diâmetro, cobrimento e proprietário; dados do OpenStreetMap a partir de um arquivo JSON do Overpass; cruzamentos, seções de vala e volumes; camadas de serviço em DWG, DXF e PDF; segmentos de tubo e cabo em IFC.
keywords: utilidade, utilidades, rede, osm, openstreetmap, overpass, tubo, cabo, gás, esgoto, drenagem, telecomunicações, energia, água, hidrante, poço de visita, vala, cruzamento, folga, cobrimento, profundidade, dwg, ifc, georreferenciado, camadas
from: 8a85dace
---

Desenhe os serviços enterrados de um local como uma rede por serviço, verifique onde elas se cruzam e exporte-as como camadas de desenho e como IFC.

## Criar trechos

Abra **Superfície, Mais, Redes de utilidades...**

- **Criar um trecho a partir da seleção** transforma o alinhamento, a linha de feição ou o tubo selecionado em um trecho do serviço escolhido. Depois preencha material, diâmetro (mm), cobrimento (a profundidade até o topo do tubo ou cabo) e proprietário na tabela.
- **Ler dados do OpenStreetMap** lê um arquivo JSON do Overpass que você salvou (uma consulta com `out geom;`). O projeto precisa de um sistema de coordenadas primeiro, porque as posições do OpenStreetMap são de latitude e longitude. São lidos os tubos (por substância), os cabos subterrâneos de energia e telecomunicações, os hidrantes, os poços de visita e as galerias de drenagem; qualquer outro item é contado como deixado de fora, e isso é informado na mensagem. As linhas aéreas são deixadas de fora.
- **Adicionar o mapa do OpenStreetMap** adiciona o mapa do OpenStreetMap abaixo da planta. Ele só é desenhado enquanto as camadas de mapa da internet estiverem ativadas em Configurações.

## Verificações e saídas

- **Cruzamentos**: trechos de serviços diferentes que se cruzam em planta são listados com a altura livre entre eles, onde há uma superfície do terreno; o mínimo é um valor provisório que você define, não o número de uma norma.
- **Vala**: cada trecho recebe uma vala (diâmetro do tubo mais folga em cada lado, talude, berço) com um volume. O total aparece na janela e no CSV.
- **Desenho**: trechos e pontos ficam em camadas de serviço (por exemplo U-WATR-RUN, U-POWR-RUN), de modo que sejam incluídos em PDF, DXF e DWG.
- **IFC**: os trechos entram na exportação IFC como segmentos de tubo e segmentos de cabo, com hidrantes, válvulas e câmaras, um sistema por serviço, no sistema de coordenadas do projeto.

## Dados do OpenStreetMap

Os dados do OpenStreetMap têm copyright dos colaboradores do OpenStreetMap e são licenciados sob a ODbL. A atribuição é adicionada ao desenho, ao CSV e ao IFC. Se você compartilhar um arquivo que contenha dados do OpenStreetMap, mantenha a atribuição e leia os termos de compartilhamento sob a mesma licença previstos na ODbL.

## O que ainda não está implementado

Os trechos ainda não são desenhados ponto a ponto na planta com uma ferramenta, e os cruzamentos ainda não são desenhados na vista de perfil (o cálculo está implementado). Profundidades, diâmetros e folgas começam como valores provisórios: use os números da sua norma.
