---
title: Plantillas de corredor y plantillas de terreno
summary: Cree plantillas pequeñas y reutilizables (bordillo y cuneta, acera, muro, zanja), construya un corredor a partir de ellas por P.K. con izquierda y derecha separadas, divida una alineación en varios corredores y extienda capas de materiales sobre un terreno.
keywords: plantilla, plantillas, biblioteca de plantillas, creación de plantillas, sección tipo, ensamblaje, subensamblaje, componentes, códigos de punto, condición final, intersección con el terreno, zanja, muro de contención, bordillo, cuneta, acera, tramos, rango de P.K., varios corredores, izquierda y derecha, plantilla de terreno, capa vegetal, firme, base, extender, materiales, mediciones
from: ce70e58b
---

Una **plantilla** es una pequeña sección transversal que dibuja una vez y reutiliza: puntos con desplazamientos, pendientes y códigos de punto, y componentes con materiales. Un corredor puede construirse a partir de plantillas por P.K., con cada lado con sus propias plantillas de firme y su propia condición final, y las mismas plantillas pueden extenderse sobre un terreno.

:::warning
Las plantillas de ejemplo son marcadores para empezar. Sus valores no se toman de ninguna norma ni de ningún organismo. Un ingeniero debe revisar cada plantilla y cada valor que le dé antes de usarlos en un diseño.
:::

## Abrir las plantillas

Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de corredor…}} (o escriba {{cmd:TEMPLATES}}). La ventana tiene tres listas:

- **En este proyecto**: las plantillas que usan los corredores y las plantillas de terreno de este proyecto. Se guardan en el archivo del proyecto.
- **Mi biblioteca**: plantillas guardadas en este navegador y ofrecidas en todos los proyectos. Use {{ui:Guardar en Mi biblioteca}} sobre una plantilla del proyecto para conservarla.
- **Ejemplos**: dos carriles con capas, bordillo y cuneta, acera, intersección con el terreno, zanja, muro de contención, capa vegetal bajo el terreno y firme sobre el terreno. Cada una está marcada como «Para revisión por un ingeniero».

{{ui:Usar en este proyecto}} copia una plantilla de la biblioteca o de los ejemplos al proyecto. {{ui:Exportar las plantillas de este proyecto}} las guarda en un archivo `.cctemplates.json`, y {{ui:Importar un archivo}} lee uno en el proyecto y en Mi biblioteca. Use el archivo para compartir plantillas o llevarlas a otro ordenador.

## Crear una plantilla

{{ui:Nueva plantilla}} (o {{ui:Edición}} sobre una plantilla del proyecto) abre el editor de plantillas. Dibuje el lado derecho, hacia fuera desde el punto 0,0 de la plantilla; el lado izquierdo usa la misma plantilla hacia fuera a la izquierda.

1. Dé un nombre y un tipo: **Firme** (la siguiente plantilla se une a su final), **Condición final** (se encuentra con el terreno) o **Plantilla de terreno**.
2. Añada **valores**: números con nombre, como un ancho `w` o una pendiente `s`. Un cuadro numérico en cualquier parte de la plantilla acepta un número o el nombre de un valor; `-t` es el valor `t` cambiado de signo. Un corredor puede dar a cada uso de la plantilla sus propios valores, de modo que una misma plantilla de bordillo sirva para cada altura de bordillo.
3. Añada **puntos** en orden. Cada uno se sitúa a partir de un punto anterior (o del punto 0,0) según su restricción:

| Restricción | Sitúa el punto |
|---|---|
| Desplazamiento con pendiente | Un desplazamiento hacia fuera y una pendiente (desnivel por distancia; −0.02 baja un 2 %) |
| Desplazamiento y desnivel | Un desplazamiento y un desnivel |
| Recto hacia arriba o hacia abajo | Solo un desnivel |
| Talud lateral hasta el terreno | Hacia fuera desde su punto hasta el terreno, con la relación de desmonte donde el terreno está por encima y la de terraplén donde está por debajo |
| Hasta el terreno | Un desplazamiento y luego recto hacia arriba o hacia abajo hasta el terreno |
| Muro de contención | Un muro del espesor que dé: en desmonte, su parte superior llega al terreno en la cara de la carretera; en terraplén, la carretera pasa por encima y su cara exterior baja hasta el terreno |

   Marque **Superior** en los puntos por los que pasa la superficie terminada. El último punto superior es donde empieza la siguiente plantilla de ese lado. Un **Objetivo** permite que un corredor mueva el punto: su desplazamiento o su cota vienen de una línea.
4. Añada **componentes**: formas cerradas a través de códigos de punto (`0` es el punto 0,0), cada una con un nombre, un material y un tipo. Sus áreas dan los volúmenes.

El dibujo sigue cada cambio a escala real, y la lista bajo él indica lo que está mal (un punto que llega al terreno antes del final, un valor que la plantilla no tiene, un componente sin área). {{ui:Añadir a este proyecto}} o {{ui:Guardar}} la conserva, como un solo paso de deshacer.

## Construir un corredor a partir de plantillas

Seleccione una alineación con un corredor y, en sus **Propiedades**, active {{ui:Construir a partir de plantillas por P.K.}}. El corredor empieza con los ejemplos de dos carriles e intersección con el terreno en ambos lados.

- **Tramos.** Cada tramo empieza en un P.K. y llega hasta el del tramo siguiente. {{ui:Añadir un tramo}} añade uno; cambie su P.K. inicial en su cuadro.
- **Izquierda y derecha separadas.** Cada lado de cada tramo tiene su propia lista de **Firme**, desde el eje hacia fuera, y su propia **Condición final**: intersección con el terreno, una zanja, un muro o cualquier plantilla que llegue al terreno. Sin condición final, el lado se intersecta con los taludes de desmonte y terraplén del corredor. {{ui:Copiar de izquierda a derecha}} copia un lado.
- **Valores y objetivos.** Bajo cada plantilla de un lado, un cuadro por valor (vacío = el valor propio de la plantilla) y, para un punto que admite objetivo, la línea característica u otra línea de corredor que lo mueve.
- **Desde y Hasta** limitan el corredor a una parte de la alineación.

Las secciones, las líneas en planta de cada código de punto, la superficie proyectada, el replanteo y el movimiento de tierras siguen todo esto. Las **Propiedades** muestran el volumen de cada componente por lado y tramo (áreas medias de extremos a lo largo del eje). El peralte y los objetivos de borde del corredor no se usan mientras el corredor se construye a partir de plantillas.

## Varios corredores en una alineación

Bajo **Corredores en esta alineación**, {{ui:Añadir un corredor}} añade un corredor en el resto de la alineación: al primer corredor se le da un P.K. final en el centro (o conserva el suyo), y el nuevo empieza allí con el último tramo de plantillas del primero. Cada corredor tiene su propio nombre, rango de P.K., plantillas y movimiento de tierras. Desactive uno con su casilla {{ui:Activadas}}. Donde dos rangos se solapan, el corredor posterior se rasantea sobre el anterior.

## Plantillas de terreno

Una plantilla de terreno extiende las capas de una plantilla sobre un terreno desde su punto 0,0: una capa bajo el punto 0,0 entra en el terreno (capa vegetal a retirar), y una capa por encima de él se asienta sobre el terreno (base y firme en un aparcamiento). Los anchos y las pendientes no importan; solo importa la profundidad de cada componente por encima o por debajo del punto 0,0.

Abra {{ui:Superficie}} › {{ui:Más}} › {{ui:Plantillas de terreno…}} (o escriba {{cmd:TERRAINTEMPLATES}}); el bloque también está en las Propiedades del proyecto. {{ui:Añadir una plantilla de terreno}} añade una con el ejemplo de capa vegetal. Para cada una elija:

- la **plantilla** (sus valores pueden cambiarse para esta),
- el **terreno**: el terreno natural o la superficie proyectada,
- la **forma** que la recorta: el terreno completo, una parcela, una plataforma o una línea característica cerrada. Varias plantillas de terreno pueden usar formas distintas sobre el mismo terreno.

Cada capa indica su espesor, su área en planta y su volumen. El volumen es el área en planta por el espesor, medido en vertical; el área se mide sobre una malla, y también se da el área extendida (inclinada). Las formas se dibujan en el plano en la capa C-TOPO-TMPL. Las plantillas de terreno no modifican la superficie proyectada.

## Materiales y mediciones

El bloque Movimiento de tierras del proyecto lista los **Materiales de plantillas**: cada componente del corredor y cada capa de plantilla de terreno con su volumen. {{ui:Enviar a TakeoffCraft}} los escribe en el archivo de mediciones tras el desmonte y el terraplén, un elemento por cada uno, en yardas cúbicas (proyectos en pies) o en metros cúbicos.

## Archivos

Las plantillas, los tramos, los corredores adicionales y las plantillas de terreno se guardan en el archivo del proyecto. Un proyecto que no usa nada de esto se guarda exactamente igual que antes, y las versiones anteriores de CivilCraft abren un proyecto que sí los usa (ignoran las plantillas y construyen el ensamblaje propio del corredor).
