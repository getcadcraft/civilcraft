---
title: Coordenadas de terreo e locais
summary: Traballar en coordenadas de terreo (superficie) escaladas desde a cuadrícula por un factor de escala combinado que escribe ou calcula nun punto, ou nunha cuadrícula de sitio asumida ligada ao sistema por dous puntos de control.
keywords: coordenadas de terreo, coordenadas de superficie, cuadrícula a terreo, factor de escala combinado, csf, factor combinado, factor de cuadrícula, factor de altitude, factor de nivel do mar, converxencia, ángulo de proxección, factor de escala, coordenadas asumidas, coordenadas locais, cuadrícula de sitio, 5000 5000, puntos de control, localización, calibración, dous puntos, erro de peche
from: 3d7453de
---

As coordenadas de plano estatal e UTM son coordenadas de **cuadrícula**: unha proxección cartográfica estende ou encolle as distancias un pouco (decenas de partes por millón), e canto máis alto está o sitio, máis difiere unha distancia medida no terreo da distancia en cuadrícula. Por iso moitos levantamentos entregan coordenadas de **terreo**, escaladas para que as distancias na planta sexan iguais ás medidas sobre o terreo, ou unha cuadrícula de sitio **asumida** (5000, 5000 nun punto de control). CivilCraft mantén os seus números tal como están e rexistra como se relacionan coa cuadrícula, así que a latitude e a lonxitude, os ficheiros GIS e as capas de mapa seguen caendo no lugar correcto.

Abra {{ui:Coordenadas}} no grupo {{ui:GIS}}, escolla (ou manteña) o sistema, e despois escolla baixo **Coordenadas de cuadrícula, de terreo ou locais**:

| Opción | As súas coordenadas son | Como se relacionan coa cuadrícula |
|---|---|---|
| {{ui:Cuadrícula}} | As do propio sistema (o punto de partida) | Os mesmos números |
| {{ui:Terreo}} | Escaladas ás distancias do terreo | cuadrícula = base + factor combinado × (terreo − base) |
| {{ui:Local}} | Unha cuadrícula de sitio asumida | Desprazadas, xiradas e escaladas sobre a cuadrícula por dous puntos de control |

Sexa cal sexa a opción, gárdase co proxecto, é un paso de desfacer, e nada se move.

## Coordenadas de terreo

1. Escolla {{ui:Terreo}}.
2. Escriba o **Factor de escala combinado** do levantamento (por exemplo `0.99987`), ou calcúleo:
   1. Baixo **Calcular o factor nun punto**, o punto comeza no centro do proxecto. Escolla {{ui:Escoller un punto na planta}} e prema o lugar (un clic preto dun punto de levantamento toma ese punto), ou escriba E e N.
   2. A cota vén da superficie ali; escriba outra se a precisa.
   3. Escolla {{ui:Calcular}}. CivilCraft amosa:
      - **Factor de escala en cuadrícula k**: canto estende a proxección cartográfica as distancias alí.
      - **Factor de altitude**: canto máis curtas son as distancias no elipsoide que a esa altura.
      - **Factor combinado** = k × factor de altitude: distancia en cuadrícula = distancia no terreo × isto.
      - **Converxencia**: o ángulo desde o norte de cuadrícula ata o norte verdadeiro alí (acimut xeodésico = acimut de cuadrícula + converxencia).
   4. Escolla o botón {{ui:Uso}} baixo os números para poñer o factor combinado na caixa.
3. Fixe o **Punto base**, onde as coordenadas de terreo e de cuadrícula son iguais. Comeza en 0, 0: a maioría das xurisdicións que publican coordenadas de terreo escalan arredor da orixe, así que as coordenadas de terreo seguen sendo recoñecibles preto das de cuadrícula. Algúns levantamentos escalan arredor do punto de control do proxecto: use o que indique o levantamento.
4. Escolla {{ui:Aplicar}}.

:::warning
A cota tómase como altura sobre o elipsoide. CivilCraft non ten modelo de xeoide, así que onde o xeoide está 30 m (100 ft) por baixo ou por riba do elipsoide, o factor de altitude erra uns 5 ppm. Cando o levantamento indique o seu factor combinado, escriba ese.
:::

## Coordenadas locais (asumidas)

1. Escolla {{ui:Local}}.
2. En **Punto de control 1**, escriba o número do punto do levantamento (ou escolla {{ui:Escoller}} e prema nel na planta). As súas coordenadas locais amósanse ao seu lado.
3. Escriba as súas E e N de **cuadrícula**, ou a súa latitude e lonxitude na terceira caixa (por exemplo `30.2672, -97.7431`).
4. Faga o mesmo para o **Punto de control 2**, o máis lonxe posible do primeiro.
5. CivilCraft amosa a **Escala** e a **Rotación** atopadas, e lembra: **Dous puntos encaixan sempre exactamente: comprobe un terceiro.**
6. Indique un **Punto de comprobación** do mesmo xeito. CivilCraft amosa canto o axuste o pon lonxe das coordenadas de cuadrícula que escribiu (o seu erro de peche, en unidades do proxecto e en partes por millón). Un erro de peche grande indica un punto errado, un erro de escritura ou coordenadas noutra unidade.
7. Escolla {{ui:Aplicar}}.

Unha escala moi lonxe de 1 (fóra do intervalo de 0,5 a 2) recházase: comprobe os puntos e as súas unidades.

## Que se comprobou

- O factor de escala e a converxencia coinciden con PROJ (pyproj 3.7.1 con PROJ 9.5.1), a biblioteca de coordenadas que usan a maioría dos programas de GIS, ata 1 parte en mil millóns en máis de 300 sistemas con proxeccións conformes (plano estatal, UTM, Mercator transversa, cónica conforme de Lambert), e no navegador nun punto escollido na planta.
- Os pasos de terreo e locais convértense en ida e volta ata 1 parte en mil millóns; dous puntos de control devolven a escala e a rotación coas que se fixeron; un punto de comprobación desviado 0,05 ft amosa un erro de peche de 0,05 ft.
