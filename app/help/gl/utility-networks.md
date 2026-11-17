---
title: Redes de servizos e OpenStreetMap
summary: Traxectos de auga, saneamento, pluviais, gas, electricidade e telecomunicacións, con material, diámetro, recubrimento e propietario; datos de OpenStreetMap a partir dun ficheiro JSON de Overpass; cruzamentos, seccións de zanxa e volumes; capas de servizo en DWG, DXF e PDF; segmentos de tubaxe e cable en IFC.
keywords: rede, redes, servizo, servizos, osm, openstreetmap, overpass, tubaxe, cable, gas, saneamento, pluviais, telecomunicacións, electricidade, auga, hidrante, pozo de rexistro, zanxa, cruzamento, distancia libre, recubrimento, profundidade, dwg, ifc, xeorreferenciado, capas
from: 8a85dace
---

Debuxe os servizos enterrados dunha obra como unha rede por servizo, comprobe onde se cruzan e expórteos como capas de debuxo e como IFC.

## Crear traxectos

Abra **Superficie, Máis, Redes de servizos...**

- **Crear un traxecto a partir da selección** converte o aliñamento, a liña de elemento ou a tubaxe seleccionados nun traxecto do servizo que escolla. Despois, complete o material, o diámetro (mm), o recubrimento (a profundidade até a parte superior da tubaxe ou do cable) e o propietario na táboa.
- **Ler datos de OpenStreetMap** lee un ficheiro JSON de Overpass que gardou (unha consulta con `out geom;`). O proxecto necesita primeiro un sistema de coordenadas, porque as posicións de OpenStreetMap son latitude e lonxitude. Lense as tubaxes (segundo a substancia), os cables subterráneos de electricidade e telecomunicacións, os hidrantes, os pozos de rexistro e os desaugadoiros pluviais; o resto cóntase como excluído e así se indica na mensaxe. As liñas aéreas quedan excluídas.
- **Engadir o mapa de OpenStreetMap** engade o mapa de OpenStreetMap baixo a planta. Só se debuxa cando as capas de mapas da internet están activadas en Configuración.

## Comprobacións e saídas

- **Cruzamentos**: os traxectos de servizos distintos que se cruzan en planta enuméranse coa distancia libre vertical entre eles cando hai unha superficie do terreo; o mínimo é un valor provisional que vostede define, non o número dunha norma.
- **Zanxa**: cada traxecto recibe unha zanxa (diámetro da tubaxe máis a distancia libre a cada lado, pendente dos taludes, leito) cun volume. O total móstrase na xanela e no CSV.
- **Debuxo**: os traxectos e os puntos están nas capas de servizo (por exemplo, U-WATR-RUN, U-POWR-RUN), de modo que chegan a PDF, DXF e DWG.
- **IFC**: os traxectos pasan á exportación IFC como segmentos de tubaxe e segmentos de cable, con hidrantes, válvulas e cámaras, un sistema por servizo, no sistema de coordenadas do proxecto.

## Datos de OpenStreetMap

Os datos de OpenStreetMap son propiedade dos colaboradores de OpenStreetMap e están licenciados baixo a ODbL. A atribución engádese ao debuxo, ao CSV e ao IFC. Se comparte un ficheiro que contén datos de OpenStreetMap, conserve a atribución e lea as condicións de compartir igual da licenza.

## O que non está feito

Os traxectos aínda non se debuxan punto por punto na planta cunha ferramenta, e os cruzamentos aínda non se debuxan na vista de perfil (o cálculo está construído). As profundidades, os diámetros e as distancias libres comezan como valores provisionais: use os números da súa propia norma.
