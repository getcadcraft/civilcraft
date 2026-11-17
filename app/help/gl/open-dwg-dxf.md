---
title: Abrir un DWG ou DXF como liñas
summary: Abra as liñas dun debuxo no plano, capa por capa, use os seus contornos, polilíneas 3D e contornos pechados para a superficie, e converta os seus bloques de puntos en puntos de levantamento.
keywords: comprobación do levantamento, cotas de texto, dwg, dxf, cad, debuxo, liñas, contornos, liñas de rotura, límite, polilínea, polilínea 3D, capas, plano base, topo, debuxo de levantamento, bloques, referencias de bloque, puntos de levantamento a partir de bloques, atributos, bloques de puntos, punto de inserción
from: da0f4c58
---

Un levantamento topográfico adoita chegar como un debuxo: curvas de nivel como polilíneas á súa cota, liñas de rotura como polilíneas 3D, o contorno do terreo como polilínea pechada. CivilCraft abre o **espazo modelo** do debuxo como capas no plano, e pode converter esas liñas directamente en superficie.

## Abra o debuxo

1. Prema {{ui:Linework}} no grupo **Superficie** (ou {{ui:Open}}, ou solte o ficheiro no plano) e escolla un ficheiro `.dwg` ou `.dxf`. O debuxo lese neste ordenador; non se envía nada. Lense os DWG de 2000 a 2018 e os DXF ASCII.
2. O diálogo **Liñas de debuxo** lista as capas do debuxo que conteñen liñas, formas pechadas ou puntos, e se teñen **cotas**. As capas desactivadas no debuxo comezan sen marcar. Texto, tramas, cotas e outros obxectos que non son liñas contanse e omítense (o diálogo indica cales).
3. Comprobe **Unidades do debuxo**. Cando o debuxo indica as súas unidades, CivilCraft convértaas ás do proxecto (milímetros a metros, metros a pés, polgadas a pés). Un debuxo en pés léese como pés de topografía dos EUA sen escalar: os dous difiren en 2 partes por millón, e escalar as coordenadas de plano estatal con esa diferenza desplazaríaas uns pés. Cando o debuxo non indica as súas unidades, os seus números léense nas unidades do proxecto; escolla as unidades correctas na lista se non o son.
4. En **Usar para a superficie**, escolla o que dá cada capa á superficie (ou deixe **Só amosala**). As capas con nome de curvas de nivel (TOPO, CONT, CNTR) que teñen cotas comezan como liñas de rotura.
5. Prema {{ui:Add}}. As capas aparecen baixo **Capas GIS** no panel esquerdo; cada uso mételo na superficie. Cada parte é un paso propio: {{key:Mod+Z}} retíraas unha a unha.

## Que pode dar cada tipo de capa

| A capa contén | Usar para a superficie |
|---|---|
| Curvas de nivel (polilíneas a unha cota) | Liñas de rotura á cota propia das liñas, ou ao campo ELEV |
| Polilíneas 3D | Liñas de rotura nas súas propias cotas |
| Un contorno pechado | O límite da superficie (a forma pechada máis grande, ou a que seleccionou) |
| Puntos con cota | Puntos de levantamento, descritos co nome da capa |
| Liñas á cota 0 (liñas de plano) | Nada: queda no plano como debuxo base |

Un debuxo que CivilCraft escribiu contén as súas liñas de elemento como polilíneas 3D que lembran os seus arcos. O diálogo entón amosa **Liñas de elemento**: déixeo marcado para devolvelas como liñas de elemento cos seus arcos e usos (un paso de desfacer), ou desmárqueo para lelas como liñas normais, como calquera outra capa.

Máis tarde, use {{ui:Use for the surface}} no menú da capa baixo **Capas GIS** para facer o mesmo cunha capa que só amosou.

## Puntos de levantamento a partir de bloques

Os debuxos de levantamento adoitan traer os seus puntos como bloques: un pequeno símbolo en cada visada, con atributos para o número do punto, a descrición e a cota. Cando o debuxo ten referencias de bloque, o diálogo ten unha sección **Puntos de levantamento a partir de bloques**:

1. Marque os bloques a tomar (a táboa indica cantas referencias ten cada un, en que capas e que atributos), ou marque capas para tomar todas as referencias de bloque nelas.
2. Escolla de onde veñen o **número**, a **descrición** e a **cota** de cada punto: un atributo, o nome do bloque ou da capa, os seguintes números libres, ou a Z do punto de inserción. CivilCraft comeza nos atributos probables (PT, DESC, ELEV e similares), e toma a cota dun atributo só cando os bloques están na cota cero.
3. Desmarque as capas de liñas se só quere os puntos, e logo prema {{ui:Add}}.

Cada referencia convértese nun punto de levantamento no seu punto de inserción. Só contan as referencias colocadas no espazo modelo; os bloques aniñados dentro doutros bloques non. Os números que xa hai no proxecto, ou usados dúas veces no debuxo, reciben números novos despois do máis alto, e un atributo de cota que non é un número deixa ese punto sen cota; a liña de estado conta ambos casos. O debuxo nunca se cambia, e cada punto recorda o seu bloque: as súas Propiedades amosan **Desde bloque** co bloque, a capa e o identificador. Engadir os puntos é un só paso, así que {{key:Mod+Z}} os retira todos.

## Cotas escritas como texto, e a comprobación

As cotas puntuais escritas como texto (ou nun atributo de bloque que non é un bloque de puntos de levantamento) non son liñas. A sección **Cotas de levantamento e comprobación** pode tomalas como puntos de levantamento, e enumera o que parece mal no debuxo: unidades, sistema de coordenadas, distancia ao cero, curvas de nivel planas, cotas anómalas, puntos duplicados. Vexa [Comprobar un debuxo de levantamento na importación](topic:survey-check).

## Como se lee o debuxo

- Arcos, círculos, elipses, segmentos de polilínea con abultamento e splines convértense en pezas rectas curtas (como moito cada 5°).
- As referencias de bloque debúxanse onde están colocadas, tamén as aniñadas; o que un bloque contén na capa 0 toma a capa da referencia.
- Os obxectos debuxados noutro plano (outra dirección de extrusión) colócanse en coordenadas do mundo.
- Cada obxecto recibe tres campos: LAYER, TYPE (o tipo de obxecto) e ELEV (a súa cota cando todos os seus puntos comparten unha).
- As coordenadas tómanse tal como están: o debuxo debe usar as mesmas coordenadas que o proxecto (por exemplo, a mesma zona de plano estatal). Os debuxos ligados (xrefs) non se abren: ábraos por separado.

:::tip
Un debuxo de curvas de nivel dá a mellor superficie con algunhas cotas puntuais nos cumes e nas depresións, onde as curvas por si soas deixan triángulos planos. Engádaas como puntos de levantamento, ou desde unha capa de puntos do debuxo.
:::
