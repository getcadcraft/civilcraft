---
title: Barrer un corredor vial
summary: Activá un corredor para un trazado, fijá los valores de carril, berma y talud lateral, y leé los cortes, líneas de empate y movimiento de suelo que produce.
keywords: peralte, super, peralte banking, transición, transición de salida, tabla de tasas, pendiente transversal, rotación, corredor, ensamble, subensamble, sección típica, camino, carril, berma, pendiente transversal, talud lateral, línea de empate, corte, relleno, cortes, objetivo, objetivos, objetivo de ancho, objetivo de cota, objetivo de desplazamiento, ensanche, borde de calzada, seguir otro corredor
from: 91303189
---

Un corredor barre un ensamble típico simple a lo largo de un trazado y de su perfil de diseño, lo ajusta al terreno existente y agrega el resultado a la superficie propuesta. Un trazado puede tener varios corredores en distintos rangos de estaciones, y un corredor puede armarse desde plantillas reutilizables por estación ([Plantillas de corredor](topic:corridor-templates)). El ensamble simple de abajo es igual en ambos lados; para dar a cada lado sus propias partes, ver [Armar cada lado con partes](topic:corridor#build-each-side-from-parts).

## El ensamble

Desde el eje hacia afuera, en cada lado:

1. un **carril** de un ancho dado, que baja desde la cresta con la **pendiente de carril**
2. una **berma** de un ancho dado con la **pendiente de berma**
3. un **talud lateral** desde el borde de la berma hasta donde encuentra el terreno: el **talud de corte** donde el terreno está arriba, el **talud de relleno** donde está abajo

Los valores iniciales son marcadores, no una norma de diseño:

| Valor | US feet | Metros |
|---|---|---|
| Ancho de carril | 12 ft | 3.6 m |
| Pendiente de carril | 2% | 2% |
| Ancho de berma | 4 ft | 1.2 m |
| Pendiente de berma | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de relleno | 3 : 1 | 3 : 1 |
| Corte cada | 10 ft | 5 m |

Las pendientes de los taludes laterales son horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Armar el corredor

Necesitás un trazado sin errores y un perfil de diseño con al menos dos PVI y sin errores.

1. Seleccioná el trazado.
2. En el panel derecho, bajo **Corredor**, marcá **Barrer un ensamble a lo largo del perfil de diseño**.
   Aparecen los campos y el corredor se arma de inmediato. El plano muestra los bordes de carril y berma y las líneas de empate; con {{ui:Propuesto (con pendientes)}} elegido en **Visualización**, las curvas muestran el terreno nuevo.
3. Cambiá cualquier valor: **Ancho de carril**, **Pendiente de carril**, **Ancho de berma**, **Pendiente de berma**, **Talud de corte**, **Talud de relleno**, **Corte cada**. Presioná {{key:Enter}} después de cada uno. El talud de corte, el de relleno y el espaciado de cortes deben ser mayores que 0.
4. Leé la línea debajo de los campos, por ejemplo "39 cortes desde 0+00.00 hasta 3+86.36; corte 240.2 cu yd, relleno 556.0 cu yd."

Los cortes se hacen en cada paso de **Corte cada**, en los extremos, y al inicio y fin de cada curva horizontal y vertical. Cada corte y las líneas que pasan por ellos (eje, bordes de carril y berma, línea de empate) se convierten en líneas de quiebre de la superficie propuesta.

Para apagar el corredor, desmarcá la casilla. Sus valores se conservan para la próxima vez.

## Cuando no se arma

Una caja roja debajo de los campos indica el motivo:

| Mensaje | Qué hacer |
|---|---|
| "El corredor necesita un perfil de diseño sin errores." | Agregá PVI, o corregí las curvas verticales superpuestas (ver [Diseñar un perfil vertical](topic:profile)). |
| "El perfil de diseño no se superpone con el trazado." | Mové los PVI al rango de estaciones del trazado. |
| "El corredor necesita al menos dos cortes sobre la superficie." | La mayor parte del corredor está fuera del terreno existente. |
| "4 taludes laterales salen de la superficie antes de encontrar el terreno." | Cerca del borde de la superficie el talud no alcanza el terreno. Alejá la vía del borde, o bajá la altura de relleno o corte allí. |
| "Las líneas de empate del corredor se cruzan (los cortes se superponen, por ejemplo en el interior de una curva cerrada). Usá un radio mayor o un ensamble más angosto." | Los cortes en el interior de una curva cerrada se superponen. Aumentá el radio o angostá el ensamble. |

Un corredor con un problema no se nivela y no cuenta en el movimiento de suelo.

## Corredores y plataformas juntos

La superficie propuesta se arma en orden: primero cada corredor, después cada plataforma. Donde la nivelación de una plataforma se superpone con un corredor, gana la plataforma. Los volúmenes se calculan dentro de todas las líneas de empate juntas; ver [Volúmenes de movimiento de suelo](topic:volumes).

## Peralte

En una curva la vía puede inclinarse hacia el interior, así el tránsito se empuja menos hacia afuera. Marcá **Peraltar las curvas** bajo **Peralte** en las **Propiedades** del trazado:

- Cada curva circular toma una tasa **e** de la tabla de tasas: la primera fila cuyo radio alcanza la curva (una fila con tasa vacía mantiene la cresta normal). La tabla y el **Gradiente relativo máximo** (0.5 % para empezar) son marcadores, no una norma: fijalos según tus propios criterios de diseño. Agregá o quitá filas según necesites.
- Los carriles rotan alrededor del eje. Antes de la curva, el carril exterior se aplana sobre la **transición de salida** (cresta normal ÷ e × transición); luego, sobre la **transición** (ancho de carril × e ÷ el gradiente), el carril exterior sigue girando hasta que toda la vía tiene pendiente e hacia el interior. Dos tercios de la transición quedan antes de la curva y un tercio sobre ella. Después de la curva pasa lo mismo al revés.
- Una berma del lado bajo nunca es más plana que su carril; en el lado alto mantiene su propia pendiente (se inclina).
- La tabla debajo lista el radio, la tasa, la transición y la transición de salida de cada curva, y dónde empieza y termina el peralte completo. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de las estaciones (el carril izquierdo sólido, el derecho punteado).
- Una curva demasiado corta para llegar al peralte completo, o dos curvas cuyas transiciones se superponen, se indica en una caja encima de la tabla.

Los cortes, los volúmenes, la vista 3D y las hojas muestran todos la vía inclinada. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo mueve un punto de un lado de la vía hasta una línea: el **Borde de calzada** o el **Borde de berma**, en la **Izquierda** o la **Derecha**. Cada corte encuentra la línea en ángulo recto con el eje, saliendo solo de ese lado, así que un objetivo a la derecha nunca mueve el lado izquierdo.

| Fija | Qué pasa donde un corte encuentra la línea |
|---|---|
| **Ancho** | El punto queda sobre la línea: el carril (o la berma) se ensancha o angosta hasta ella, manteniendo su pendiente transversal. |
| **Cota** | El punto toma la cota de la línea allí, con su propio desplazamiento: la pendiente transversal del carril (o de la berma) sigue. |

La línea puede ser una línea de rasgo (cualquiera sea su **Uso**) o una línea de otro corredor: su eje, bordes de calzada, bordes de berma o líneas de empate. La línea de un corredor sigue a ese corredor: si cambiás la otra vía, esta sigue. CivilCraft arma primero el otro corredor; dos corredores que se apuntarían en un ciclo se rechazan de un lado, y la tabla indica cuál.

1. Seleccioná el trazado y activá su corredor.
2. Bajo **Objetivos**, hacé clic en {{ui:Agregar un objetivo}}.
3. Elegí el **Lado**, el **Punto**, qué **Fija** y **Hasta la línea**. Cada cambio es un paso de deshacer.

**Resultado** indica en cuántos cortes se alcanzó la línea. Los cortes que no llegan (más allá de sus extremos, o donde quedan detrás del eje) conservan los valores del ensamble. Una línea que se elimina deja el corredor como estaba antes del objetivo, y la tabla lo indica. Un lado puede tener un objetivo de ancho y uno de cota para cada punto.

## Armar cada lado con partes

Activá **Armar cada lado con partes** en la configuración del corredor. Cada lado tiene entonces su propia lista, desde el eje hacia afuera: carriles, una berma, una cuneta, un cordón, una franja de plantación, una vereda y, al final, el talud lateral hasta el terreno (con sus propias relaciones de corte y relleno). Empezá desde {{ui:Camino rural}} o {{ui:Calle urbana}}, agregá y quitá partes, movélas con las flechas, y {{ui:Copiar}} un lado al otro. Cada cambio es un paso de deshacer.

Una pendiente transversal es la caída que se aleja de la vía, así que una vereda que desagua hacia la vía es negativa. Un cordón es una cara de la altura que des, una superficie superior del ancho que des y una caída opcional en la parte trasera. El peralte gira cada carril de la primera fila; la cuneta, el cordón, la franja y la vereda cuelgan del borde de los carriles tal como se armaron. Los objetivos siguen moviendo el extremo de los carriles y la última parte. Los cortes transversales marcan la línea de flujo de la cuneta, la parte superior y trasera del cordón, y lo demás. En una curva con espirales, la transición es la espiral: cresta nivelada en el TS, peralte completo en el SC.

## Capas de pavimento

Un carril, berma, cuneta, franja de plantación o vereda puede llevar su estructura: bajo la parte, {{ui:Agregar una capa}} agrega una capa con un nombre, un material, un espesor y su tipo (superficie, ligante, base, subbase, coronamiento u otro), de arriba hacia abajo. Las capas no mueven la superficie de la vía (su parte superior es la superficie de diseño); cada una queda bajo su parte, con su profundidad medida recto hacia abajo. Los cortes transversales dibujan el fondo de cada capa como línea punteada, y {{ui:Capas de pavimento: cantidades}} lista la superficie en planta y el volumen de cada capa (superficie a lo largo del corredor desde sus cortes, volumen = superficie × espesor). La exportación IFC escribe cada capa como su propio elemento con su espesor y material (ver [Exportación e importación IFC](topic:ifc)). El espesor que escribas es tuyo: CivilCraft no dimensiona pavimentos.

## Lo que todavía no se arma

Los objetivos para la pendiente de la línea de empate todavía no están disponibles. Para un corredor que cambia a lo largo de la vía, con izquierda y derecha separadas, usá [Plantillas de corredor](topic:corridor-templates). Ver [Todavía no armado](topic:not-built-yet).
