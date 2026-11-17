---
title: Barrer una sección de carretera
summary: Active un corredor para una alineación, defina los valores de carril, arcén y talud lateral, y lea las secciones, las líneas de talud y el movimiento de tierras que produce.
keywords: peralte, super, peraltado, transición, transición del bombeo, tabla de tasas, pendiente transversal, rotación, corredor, ensamblaje, subensamblaje, sección tipo, carretera, carril, arcén, pendiente transversal, talud lateral, intersección con el terreno, desmonte, terraplén, secciones, objetivo, objetivos, objetivo de ancho, objetivo de cota, objetivo de desplazamiento, ensanche, borde del firme, seguir otro corredor
from: 91303189
---

Un corredor barre una sección tipo sencilla (un ensamblaje) a lo largo de una alineación y de su perfil de proyecto, la rasantea en el terreno existente y añade el resultado a la superficie proyectada. Una alineación puede llevar varios corredores en distintos rangos de P.K., y un corredor puede construirse a partir de plantillas reutilizables por P.K. ([Plantillas de corredor](topic:corridor-templates)). El ensamblaje sencillo de abajo es el mismo en ambos lados; para dar a cada lado sus propias partes, véase [Construir cada lado a partir de partes](topic:corridor#build-each-side-from-parts).

## El ensamblaje

Desde el eje hacia fuera, en cada lado:

1. un **carril** de un ancho dado, que desciende desde la cresta con la **pendiente del carril**
2. un **arcén** de un ancho dado, con la **pendiente del arcén**
3. un **talud lateral** desde el borde del arcén hasta encontrar el terreno: el **talud de desmonte** donde el terreno está por encima, y el **talud de terraplén** donde está por debajo

Los valores de partida son marcadores, no una norma de diseño:

| Valor | Pies (EE. UU.) | Metros |
|---|---|---|
| Ancho del carril | 12 ft | 3.6 m |
| Pendiente del carril | 2% | 2% |
| Ancho del arcén | 4 ft | 1.2 m |
| Pendiente del arcén | 4% | 4% |
| Talud de desmonte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

Las pendientes de los taludes laterales son horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Construir el corredor

Necesita una alineación sin errores y un perfil de proyecto con al menos dos PVI y sin errores.

1. Seleccione la alineación.
2. En el panel derecho, bajo **Corredor**, marque **Barrer un ensamblaje a lo largo del perfil de proyecto**.
   Aparecen los campos y el corredor se construye de inmediato. El plano muestra los bordes de carril y arcén y las líneas de talud; con {{ui:Proyecto (rasante)}} elegido en **Visualización**, las curvas muestran el nuevo terreno.
3. Cambie cualquier valor: **Ancho del carril**, **Pendiente del carril**, **Ancho del arcén**, **Pendiente del arcén**, **Talud de desmonte**, **Talud de terraplén**, **Sección cada**. Pulse {{key:Enter}} tras cada uno. El talud de desmonte, el de terraplén y el espaciado de secciones deben ser mayores que 0.
4. Lea la línea bajo los campos, por ejemplo «39 secciones desde 0+00.00 hasta 3+86.36; desmonte 240.2 cu yd, terraplén 556.0 cu yd».

Las secciones se cortan cada paso de **Sección cada**, en los extremos y en el inicio y el final de cada curva horizontal y vertical. Cada sección y las líneas que pasan por ellas (eje, bordes de carril y arcén, líneas de talud) se convierten en líneas de ruptura de la superficie proyectada.

Para desactivar el corredor, desmarque la casilla. Sus valores se conservan para la próxima vez.

## Cuando no se construye

Un recuadro rojo bajo los campos indica el motivo:

| Mensaje | Qué hacer |
|---|---|
| «El corredor necesita un perfil de proyecto sin errores.» | Añada PVI o corrija las curvas verticales que se solapan (véase [Diseñar un perfil vertical](topic:profile)). |
| «El perfil de proyecto no se solapa con la alineación.» | Mueva los PVI al rango de P.K. de la alineación. |
| «El corredor necesita al menos dos secciones sobre la superficie.» | La mayor parte del corredor está fuera del terreno existente. |
| «4 taludes laterales salen de la superficie antes de encontrar el terreno.» | Cerca del borde de la superficie el talud no alcanza el terreno. Aleje la carretera del borde, o baje la altura de terraplén o de desmonte allí. |
| «Las líneas de talud del corredor se cruzan (las secciones se solapan, por ejemplo en el interior de una curva cerrada). Use un radio mayor o un ensamblaje más estrecho.» | Las secciones en el interior de una curva pronunciada se solapan. Aumente el radio o estreche el ensamblaje. |

Un corredor con un problema no se rasante en el terreno y no cuenta en el movimiento de tierras.

## Corredores y plataformas juntos

La superficie proyectada se construye en orden: primero todos los corredores y luego todas las plataformas. Donde la explanación de una plataforma se solapa con un corredor, gana la plataforma. Los volúmenes se calculan dentro de todas las líneas de talud a la vez; véase [Volúmenes de movimiento de tierras](topic:volumes).

## Peralte

En una curva la carretera puede inclinarse hacia el interior, de modo que el tráfico se empuja menos hacia el exterior. Marque **Peraltar las curvas** bajo **Peralte** en las **Propiedades** de la alineación:

- Cada curva circular toma una tasa **e** de la tabla de tasas: la primera fila cuyo radio alcanza la curva (una fila con tasa vacía mantiene el bombeo normal). La tabla y la **Pendiente relativa máxima** (0.5 % para empezar) son marcadores, no una norma: defínalos según sus propios criterios de diseño. Añada o quite filas según necesite.
- Los carriles giran alrededor del eje. Antes de la curva, el carril exterior se aplana en la **transición del bombeo** (bombeo normal ÷ e × transición), y luego en la **transición del peralte** (ancho del carril × e ÷ la pendiente) el carril exterior sigue girando hasta que toda la carretera tiene pendiente e hacia el interior; dos tercios de la transición quedan antes de la curva y un tercio sobre ella. Después de la curva ocurre lo mismo en sentido inverso.
- Un arcén en el lado bajo nunca es más plano que su carril; en el lado alto mantiene su propia pendiente (se vuelca).
- La tabla bajo él lista el radio, la tasa, la transición del peralte y la transición del bombeo de cada curva, y dónde empieza y termina el peralte completo. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de los P.K. (el carril izquierdo en línea continua, el derecho discontinuo).
- Una curva demasiado corta para alcanzar el peralte completo, o dos curvas cuyas transiciones se solapan, se indica en un recuadro sobre la tabla.

Las secciones, los volúmenes, la vista 3D y las láminas muestran la carretera inclinada. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo mueve un punto de un lado de la carretera hasta una línea: el **Borde del firme** o el **Borde del arcén**, a la **Izquierda** o a la **Derecha**. Cada sección encuentra la línea en ángulo recto con el eje, saliendo solo hacia ese lado, de modo que un objetivo a la derecha nunca mueve el lado izquierdo.

| Fija | Qué pasa donde una sección encuentra la línea |
|---|---|
| **Ancho** | El punto se sitúa sobre la línea: el carril (o el arcén) se ensancha o se estrecha hasta ella, conservando su pendiente transversal. |
| **Cota** | El punto toma la cota de la línea allí, a su propio desplazamiento: la pendiente transversal del carril (o del arcén) sigue a esa cota. |

La línea puede ser una línea característica (sea cual sea su **Uso**) o una línea de otro corredor: su eje, bordes de firme, bordes de arcén o líneas de talud. La línea de un corredor sigue a ese corredor: si cambia la otra carretera, esta sigue el cambio. CivilCraft construye primero el otro corredor; dos corredores que se apuntarían en un bucle se rechazan en un lado, y la tabla indica cuál.

1. Seleccione la alineación y active su corredor.
2. Bajo **Objetivos**, haga clic en {{ui:Añadir un objetivo}}.
3. Elija el **Lado**, el **Punto**, qué **Fija** y **A la línea**. Cada cambio es un paso de deshacer.

**Resultado** indica en cuántas secciones se alcanzó la línea. Las secciones que no la alcanzan (más allá de sus extremos, o donde queda detrás del eje) conservan los valores del ensamblaje. Si se elimina una línea, el corredor vuelve a su estado anterior al objetivo, y la tabla lo indica. Un lado puede tener un objetivo de ancho y un objetivo de cota por cada punto.

## Construir cada lado a partir de partes

Active **Construir cada lado a partir de partes** en la configuración del corredor. Cada lado tiene entonces su propia lista, desde el eje hacia fuera: carriles, un arcén, una cuneta, un bordillo, una franja ajardinada, una acera y, por último, el talud lateral hasta el terreno (con sus propias relaciones de desmonte y terraplén). Empiece con {{ui:Carretera rural}} o {{ui:Calle urbana}}, añada y quite partes, muévalas con las flechas y {{ui:Copiar}} un lado al otro. Cada cambio es un paso de deshacer.

Una pendiente transversal es la caída que se aleja de la carretera, así que una acera que desagua hacia la carretera es negativa. Un bordillo es una cara de la altura que dé, una coronación del ancho que dé y una caída opcional en la parte posterior. El peralte inclina todos los carriles de la primera fila; la cuneta, el bordillo, la franja y la acera cuelgan del borde de los carriles tal como están construidos. Los objetivos siguen moviendo el extremo de los carriles y la última parte. Las secciones transversales marcan la línea de agua de la cuneta, la coronación y el dorso del bordillo, y el resto. En una curva con espirales, la transición es la espiral: bombeo nivelado en la TS, peralte completo en la SC.

## Capas del firme

A un carril, arcén, cuneta, franja ajardinada o acera puede asignársele su paquete de capas: bajo la parte, {{ui:Añadir una capa}} añade una capa con un nombre, un material, un espesor y su tipo (superficial, de unión, base, subbase, coronación u otra), de arriba abajo. Las capas no modifican la superficie de la carretera (su coronación es la superficie de proyecto); cada una se sitúa bajo su parte, y su profundidad se mide en vertical. Las secciones transversales dibujan la base de cada capa como una línea discontinua, y {{ui:Capas del firme: mediciones}} lista el área en planta y el volumen de cada capa (área a lo largo del corredor a partir de sus secciones, volumen = área × espesor). La exportación IFC escribe cada capa como su propio elemento con su espesor y su material (véase [Exportación y importación IFC](topic:ifc)). El espesor que escriba es el suyo: CivilCraft no dimensiona firmes.

## Lo que aún no se construye

Los objetivos para la pendiente de la intersección con el terreno todavía no están disponibles. Para un corredor que cambia a lo largo de la carretera, con izquierda y derecha separadas, use [Plantillas de corredor](topic:corridor-templates). Véase [Aún no implementado](topic:not-built-yet).
