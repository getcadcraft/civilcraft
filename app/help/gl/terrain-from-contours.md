---
title: Terreo a partir de curvas de nivel
summary: Crear a superficie do terreo a partir dun mapa de curvas de nivel: escoller as capas de liñas, indicar de onde vén a cota de cada liña, comprobar cruzamentos e duplicados e construír. As curvas se converten en liñas de rotura, con triángulos planos en cristas e vales corrixidos. Un mapa trazado desde unha imaxe ou un PDF pode escalarse e situarse con dous puntos coñecidos.
keywords: curvas de nivel, liñas de curvas, terreo a partir de curvas, superficie a partir de curvas, mapa topográfico, mapa de levantamento, sen coordenadas, liñas de rotura, triángulos planos, cresta, vale, cume, curvas que se cruzan, curvas duplicadas, equidistancia, escalar un mapa, dous puntos, situar un mapa, DXF, DWG, shapefile
from: e6161653
---

Un topógrafo ás veces envía un mapa de curvas de nivel: liñas con cotas, pero sen puntos. CivilCraft constrúe o terreo existente a partir desas liñas.

## Traer as curvas

Abra o mapa como liñas de debuxo: un debuxo DXF ou DWG, un shapefile ou GeoJSON (**SIG** › {{ui:Import}}, ou solte o ficheiro no plano). As liñas entran como **capas de mapa**. Baixo **Superficie** › {{ui:More}}, escolla {{ui:Terrain from contours}}.

## Indicar de onde vén cada cota

Marque as capas que conteñen curvas, e logo escolla **Cota tomada de**:

- {{ui:The lines' own elevations}}: unha liña cuxos vértices teñen todos a mesma cota (unha polilínea 3D, ou unha polilínea cunha cota). Unha liña a 0 é debuxo en planta e non ten nivel.
- Un **campo numérico** da capa (por exemplo ELEV), cando o mapa veu cun.
- {{ui:A start and an interval, in the order the lines are listed}}: para liñas sen ningunha cota. A primeira liña listada recibe a **Cota da primeira liña**, a seguinte esa cota máis a **Equidistancia**, e así sucesivamente. Liste as liñas de menor a maior (ou reordénea na capa).

## Revisar e logo construír

{{ui:Check}} lista o que está mal, en palabras, antes de que cambie nada:

- unha liña **sen cota** ou con menos de dous puntos;
- unha liña **duplicada** (a mesma forma dúas veces, mesmo debuxada ao revés);
- dúas liñas que se **cruzan**, a diferentes cotas ou á mesma (tamén unha liña que se cruza a si mesma), indicando o lugar;
- unha cota que **non está na equidistancia** (un erro de escritura como 105,5 nun mapa de 1 m).

Marque {{ui:Leave out lines that cross another}} para retirar a liña que cruza a maioría das outras (despois a seguinte, ata que ningunha se cruce): a liña perdida que corta todas as curvas é a que se vai, non as curvas. **Simplificar liñas dentro de** elimina os vértices máis próximos a un percorrido recto que esa distancia.

{{ui:Build the ground}} engade as liñas ao terreo existente como liñas de rotura (un paso de desfacer), así que a superficie pasa exactamente por cada curva. Con {{ui:Fix flat triangles on ridges, valleys and hilltops}} marcado e unha equidistancia dada, CivilCraft tamén engade un punto dentro de cada triángulo plano (un triángulo cuxos vértices están todos nunha mesma curva) á altura que continúa a pendente xunto a el, nunca a máis de media equidistancia da curva. Sen iso, as cristas, os fondos de vale e os cumes saen como placas planas. Nun outeiro de proba, o erro respecto á superficie real baixou un cuarto; nunha crista, un 40 %.

## Un mapa sen coordenadas

Para un mapa de curvas trazado desde unha imaxe ou un PDF, abra **Escalar e situar as capas por dous puntos coñecidos**. Dea dous puntos do mapa e onde están realmente; as capas marcadas se escalan, xiran e móvense para encaixar (un paso de desfacer; as alturas non cambian). Os mesmos dous puntos dan a escala (amosada na mensaxe) e a rotación.

A superficie é tan boa como o mapa: entre dúas curvas é un plano, así que o terreo real entre elas non se coñece. Compare o resultado coas cotas puntuais antes de fiarse del.
