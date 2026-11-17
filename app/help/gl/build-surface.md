---
title: Construír e afinar a superficie
summary: Como CivilCraft triangula o terreo existente e como o dar forma con grupos de liñas de ruptura, liñas debuxadas, un límite exterior e a aresta exterior máis longa.
keywords: tin, superficie, triangulación, liña de ruptura, límite, terreo existente, eg, crear superficie, delaunay, triángulos, aresta máxima, límite exterior
from: b9eea3f3
---

CivilCraft ten unha superficie de terreo existente por proxecto. É un TIN (rede irregular triangulada) construído a partir dos seus puntos, e reconstrúese automaticamente cada vez que cambia unha entrada. Non hai ningún comando de «reconstruír» nin superficie desactualizada.

## Que entra na superficie

- Cada punto con cota nun grupo configurado como {{ui:Puntos}}.
- Cada grupo configurado como {{ui:Liña de ruptura}}, unido por orde de número de punto.
- Cada liña de ruptura que debuxe coa ferramenta {{ui:Liña de ruptura}}.
- O límite exterior, se debuxa un.
- O axuste **Aresta exterior máis longa**.

Os triángulos nunca cruzan unha liña de ruptura: a superficie é obrigada a seguila e logo faise o máis regular posible ao seu redor (Delaunay no resto).

## Converter liñas codificadas en liñas de ruptura

1. No panel esquerdo, baixo **Puntos**, busque o grupo (por exemplo FL).
2. Estableza a súa opción **Superficie** en {{ui:Liña de ruptura}}.
   A superficie reconstrúese, a liña debúxase en laranxa (con {{ui:Liñas de quebra}} activado en **Visualización**) e **Liñas de quebra** nos datos da superficie sobe en un.
3. Comprobe a liña no plano. Ten que ir de punto a punto na orde en que se tomou. Se fai zigzag, o grupo contén máis dunha liña ou os puntos non están numerados por orde: volva configurar o grupo como {{ui:Puntos}} e debuxe as liñas á man (sección seguinte).

## Debuxar unha liña de ruptura por puntos

1. Prema {{key:B}}, ou faga clic en {{ui:Liña de ruptura}} no grupo **Superficie**.
   A suxestión di: «Liña de ruptura: faga clic nos puntos de levantamento por orde (toma as súas cotas). Enter remata».
2. Mova o punteiro cerca dun punto. Un pequeno cadrado laranxa marca o punto que vai tomar.
3. Faga clic nos puntos da liña un tras outro. Cada clic nomea o punto e a súa cota na barra de estado.
4. Prema {{key:Enter}} para rematar.
   A barra de estado di: «Liña de ruptura 1 engadida; a superficie reconstruíuse».

Os clics deben caer nun punto de levantamento que teña cota; un clic noutro sitio recházase con «Faga clic nun punto de levantamento con cota: unha liña de ruptura toma as cotas dos puntos». {{key:Backspace}} elimina o último punto; {{key:Esc}} cancela toda a liña.

:::warning
Remate con {{key:Enter}}. Un dobre clic tamén remata, pero nesta versión elimina o punto no que fixo dobre clic. Faga clic unha vez no último punto e logo prema {{key:Enter}}.
:::

Para eliminar todas as liñas de ruptura debuxadas dunha vez, faga clic en {{ui:Eliminar liñas de rotura debuxadas}} na sección **Superficie**. Para eliminar só a última, use {{key:Mod+Z}}. As liñas de ruptura debuxadas aínda non se poden seleccionar nin editar unha a unha.

## Debuxar o límite exterior

Un límite recorta a superficie á zona en que confía, por exemplo os límites do levantamento, para que desaparezan os triángulos longos que cruzan esquinas sen levantar.

1. Prema {{key:O}}, ou faga clic en {{ui:Límite}}.
2. Faga clic nas esquinas por orde ao redor da zona. Unha liña de trazos mostra a forma.
3. Prema {{key:Enter}}.
   A barra de estado di: «Límite definido; os triángulos fóra del desapareceron». **Límite** nos datos da superficie di «Si» e o número de esquinas.

Cousas que cómpre saber:

- Hai un só límite. Debuxar outro substitúeo. {{ui:Eliminar o límite}} retírao.
- Só pode quitar: un límite que vai máis aló dos puntos recórtase ata o seu contorno, coa nota «O límite vai máis aló dos puntos; recortouse ata o seu contorno».
- As súas esquinas toman as cotas da superficie, así que a beira segue o terreo exactamente.
- Os límites ocultos (interiores) aínda non están dispoñibles.

## Recortar triángulos exteriores longos

Sen límite, a superficie cobre todo o contorno dos puntos, incluídos os triángulos longos e finos que cruzan bordos cóncavos.

1. En **Superficie**, escriba unha lonxitude en **Aresta exterior máis longa** e prema {{key:Enter}}. Comece con uns dous ou tres veces a súa separación habitual entre tomas.
2. Elimínanse os triángulos exteriores cuxa aresta exterior sexa máis longa que iso, avanzando cara ao interior ata que cada aresta exterior sexa o bastante curta. Unha aresta que é liña de ruptura nunca se retira.
3. Escriba 0 para volver conservar todos os triángulos.

## Ler o informe da superficie

Baixo os datos da superficie, unha caixa lista o que fixo o construtor. Cunha barra ocre á esquerda é información; cunha barra vermella contén un erro e non hai superficie.

| Mensaxe | Significado |
|---|---|
| «3 puntos estaban no mesmo sitio que outro e uníronse a el.» | Os puntos máis próximos de 0.0001 no plano convertéronse nun só vértice (conservouse o primeiro). |
| «2 lugares teñen dúas cotas diferentes …» | Puntos superpostos, ou liñas de ruptura que se cruzan, non coinciden en altura. Gaña a cota da liña de ruptura e despois a primeira. |
| «1 tramo de liña de ruptura non se puido forzar na superficie.» | Un tramo de liña de ruptura moi curto ou case solapado non cabía; comprobe ese punto. |
| «A superficie necesita polo menos tres puntos con cota.» | Hai poucos puntos: comprobe a orde das columnas e os grupos. |
| «Os puntos están todos nunha liña: sen triángulos.» | Os puntos non teñen anchura, por exemplo unha única liña de poligonal. |
| «O límite non se solapa cos puntos.» | O límite está noutro sitio, a miúdo por unha confusión de unidades ou de coordenadas. |
| «Non queda ningún triángulo dentro do límite.» | O límite é demasiado pequeno ou está mal colocado. |

## Unha superficie lida desde LandXML

Ao abrir LandXML, úsase a súa primeira superficie TIN tal como está: o título **Superficie** di «Superficie (desde LandXML)» e **Aresta exterior máis longa** aparece atenuada. Mentres esa superficie estea en uso, os grupos de liñas de ruptura, as liñas debuxadas e un novo límite non a cambian. Para construír a superficie a partir dos puntos do ficheiro, faga clic en {{ui:Reconstruír a superficie a partir dos puntos}}. {{key:Mod+Z}} devolve a superficie LandXML.

## Relacionado

- [Ler curvas de nivel, cotas e pendentes](topic:contours).
- [Importar puntos de levantamento](topic:import-points).
