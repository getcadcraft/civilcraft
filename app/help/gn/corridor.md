---
title: Barrido de un corredor vial
summary: Activá un corredor para un trazado, fijá los valores de carril, berma y talud lateral, y leé las secciones, líneas de corte y movimiento de suelo que produce.
keywords: empalme, intersección, camino que encuentra a otro camino, camino lateral, empalme en T, cruce, nivel de pad, unir, empalme, peralte, súper, inclinación, transición, rampa de transición, tabla de tasas, pendiente transversal, rotación, corredor, ensamblaje, subensamblaje, sección típica, camino, carril, berma, pendiente transversal, talud lateral, línea de corte, corte, relleno, secciones, objetivo, objetivos, objetivo de ancho, objetivo de cota, objetivo de desplazamiento, ensanche, borde del pavimento, seguir otro corredor
from: 6dcb92b3
---

Un corredor barre una sección típica simple (un ensamblaje) a lo largo de un trazado y de su perfil de diseño, la ajusta al terreno existente y agrega el resultado a la superficie propuesta. Un trazado puede llevar varios corredores en distintos rangos de estaciones, y un corredor puede construirse desde plantillas reutilizables por estación ([Plantillas del corredor](topic:corridor-templates)). El ensamblaje simple de abajo es igual en ambos lados; para dar a cada lado sus propias partes, mirá [Construir cada lado desde partes](topic:corridor#build-each-side-from-parts).

## El ensamblaje

Desde el eje hacia afuera, en cada lado:

1. un **carril** de un ancho dado, que baja desde la cresta con la **pendiente del carril**
2. una **berma** de un ancho dado, con la **pendiente de la berma**
3. un **talud lateral** desde el borde de la berma hasta encontrar el terreno: el **talud de corte** donde el terreno está por encima, el **talud de relleno** donde está por debajo

Los valores iniciales son provisorios, no son una norma de diseño:

| Valor | Pies (US) | Metros |
|---|---|---|
| Ancho del carril | 12 ft | 3.6 m |
| Pendiente del carril | 2% | 2% |
| Ancho de la berma | 4 ft | 1.2 m |
| Pendiente de la berma | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de relleno | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

Las pendientes de los taludes laterales son horizontal a vertical (H:V): 3 : 1 quiere decir 3 en horizontal por 1 en vertical.

## Construir el corredor

Necesitás un trazado sin errores y un perfil de diseño con al menos dos PVI y sin errores.

1. Seleccioná el trazado.
2. En el panel derecho, bajo **Corredor**, marcá **Barrer un ensamblaje a lo largo del perfil de diseño**.
   Aparecen los campos y el corredor se construye de una vez. El plano muestra los bordes del carril y la berma y las líneas de corte; con {{ui:Propuesto (con pendientes)}} elegido en **Visualización**, las curvas de nivel muestran el terreno nuevo.
3. Cambiá cualquier valor: **Ancho del carril**, **Pendiente del carril**, **Ancho de la berma**, **Pendiente de la berma**, **Talud de corte**, **Talud de relleno**, **Sección cada**. Presioná {{key:Enter}} después de cada uno. El corte, el relleno y el espaciado de las secciones deben ser mayores que 0.
4. Leé la línea debajo de los campos, por ejemplo "39 secciones desde 0+00.00 hasta 3+86.36; corte 240.2 cu yd, relleno 556.0 cu yd".

Las secciones se cortan en cada paso de **Sección cada**, en los extremos, y en el inicio y el final de cada curva horizontal y vertical. Cada sección y las líneas que pasan por ellas (eje, bordes del carril y la berma, línea de corte) se convierten en líneas de quiebre de la superficie propuesta.

Para apagar el corredor, desmarcá la casilla. Sus valores se guardan para la próxima vez.

## Cuando no se construye

Un recuadro rojo debajo de los campos dice por qué:

| Mensaje | Qué hacer |
|---|---|
| "El corredor necesita un perfil de diseño sin errores." | Agregá PVI, o corregí las curvas verticales que se superponen (mirá [Diseñar un perfil vertical](topic:profile)). |
| "El perfil de diseño no se superpone con el trazado." | Mové los PVI al rango de estaciones del trazado. |
| "El corredor necesita al menos dos secciones sobre la superficie." | La mayor parte del corredor está fuera del terreno existente. |
| "4 taludes laterales salen de la superficie antes de encontrar el terreno." | Cerca del borde de la superficie el talud no llega al terreno. Alejá el camino del borde, o bajá la altura del relleno o del corte ahí. |
| "Las líneas de corte del corredor se cruzan (las secciones se superponen, por ejemplo en la parte interna de una curva cerrada). Usá un radio mayor o un ensamblaje más angosto." | Las secciones en la parte interna de una curva cerrada se superponen. Aumentá el radio o angostá el ensamblaje. |

Un corredor con un problema no se incorpora al terreno y no cuenta en el movimiento de suelo.

## Corredores y pads juntos

La superficie propuesta se construye en orden: primero cada corredor, después cada pad. Donde la nivelación de un pad se superpone con un corredor, gana el pad. Donde un elemento posterior se superpone con un camino, solo se reemplaza la parte del camino dentro de la línea de corte del elemento posterior; el resto del camino, y cualquier línea de quiebre del terreno que el camino cruce, conserva su forma. Los volúmenes se calculan dentro de todas las líneas de corte juntas; mirá [Volúmenes de movimiento de suelo](topic:volumes).

## Peralte

En una curva el camino puede inclinarse hacia adentro, de modo que el tránsito sea empujado menos hacia afuera. Marcá **Peraltar las curvas** bajo **Peralte** en las **Propiedades** del trazado:

- Cada curva circular toma una tasa **e** de la tabla de tasas: la primera fila cuyo radio alcanza la curva (una fila con tasa vacía mantiene la cresta normal). La tabla y la **Pendiente relativa máxima** (0.5 % al inicio) son provisorias, no un estándar: fijalas según tus propios criterios de diseño. Agregá o quitá filas según necesites.
- Los carriles rotan alrededor del eje. Antes de la curva, el carril exterior se aplana en la **rampa de transición** (cresta normal ÷ e × longitud de transición), luego, en la **transición** (ancho del carril × e ÷ la pendiente), el carril exterior sigue girando hasta que todo el camino baja con e hacia adentro; dos tercios de la transición quedan antes de la curva y un tercio sobre ella. Después de la curva ocurre lo mismo en sentido inverso.
- Una berma del lado bajo nunca es más plana que su carril; del lado alto mantiene su propia pendiente (se vuelca).
- La tabla debajo lista el radio, la tasa, la transición y la rampa de cada curva, y dónde empieza y termina el peralte completo. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de las estaciones (el carril izquierdo en línea continua, el derecho en línea de trazos).
- Una curva demasiado corta para alcanzar el peralte completo, o dos curvas cuyas transiciones se superponen, se indica en un recuadro sobre la tabla.

Las secciones, los volúmenes, la vista 3D y las planillas muestran el camino inclinado. Cada cambio es un solo paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo mueve un punto de un lado del camino hasta una línea: el **Borde del pavimento** o el **Borde de la berma**, en la **Izquierda** o la **Derecha**. Cada sección encuentra la línea en ángulo recto con el eje, yendo hacia afuera solo de ese lado, de modo que un objetivo a la derecha nunca mueve el lado izquierdo.

| Fija | Qué pasa donde una sección encuentra la línea |
|---|---|
| **Ancho** | El punto queda sobre la línea: el carril (o la berma) se ensancha o se angosta hasta ella, manteniendo su pendiente transversal. |
| **Cota** | El punto toma la cota de la línea en ese lugar, a su propio desplazamiento: la pendiente transversal del carril (o de la berma) sigue a la línea. |

La línea puede ser una línea de rasgo (cualquiera sea su **Uso**) o una línea de otro corredor: su eje, bordes del pavimento, bordes de la berma o líneas de corte. La línea de un corredor sigue a ese corredor: si cambiás el otro camino, este también se mueve. CivilCraft construye primero el otro corredor; dos corredores que se apuntaran entre sí en un bucle se rechazan de un lado, y la tabla indica cuál.

1. Seleccioná el trazado y activá su corredor.
2. Bajo **Objetivos**, hacé clic en {{ui:Agregar un objetivo}}.
3. Elegí el **Lado**, el **Punto**, qué **Fija** y **A la línea**. Cada cambio es un paso de deshacer.

**Resultado** dice en cuántas secciones se llegó a la línea. Las secciones que no llegan (más allá de sus extremos, o donde la línea queda detrás del eje) mantienen los valores del ensamblaje. Si la línea se elimina, el corredor queda como estaba antes del objetivo, y la tabla lo indica. Un lado puede tener un objetivo de ancho y un objetivo de cota por cada punto.

## Construir cada lado desde partes

Activá **Construir cada lado desde partes** en la configuración del corredor. Cada lado tiene entonces su propia lista, desde el eje hacia afuera: carriles, una berma, una cuneta, un cordón, una franja de plantación, una vereda y, por último, el talud lateral hasta el terreno (con sus propias relaciones de corte y relleno). Empezá desde {{ui:Camino rural}} o {{ui:Calle urbana}}, agregá y quitá partes, movelas con las flechas, y {{ui:Copiar}} un lado al otro. Cada cambio es un paso de deshacer.

Una pendiente transversal es la caída que se aleja del camino, de modo que una vereda que desagua hacia el camino es negativa. Un cordón es una cara de la altura que indiques, una parte superior del ancho que indiques y un desnivel opcional en la parte de atrás. El peralte inclina todos los carriles de la primera fila; la cuneta, el cordón, la franja y la vereda cuelgan del borde de los carriles tal como quedaron construidos. Los objetivos siguen moviendo el extremo de los carriles y la última parte. Las secciones transversales marcan la línea de fondo de la cuneta, la parte superior y la parte de atrás del cordón, y lo demás. En una curva con espirales, la transición es la espiral: cresta nivelada en el TS, peralte completo en el SC.

## Capas de pavimento

Un carril, una berma, una cuneta, una franja de plantación o una vereda puede llevar su estructura: bajo la parte, {{ui:Agregar una capa}} agrega una capa con un nombre, un material, un espesor y su tipo (superficie, ligante, base, subbase, coronamiento u otro), de arriba hacia abajo. Las capas no mueven la superficie del camino (su parte superior es la superficie de diseño); cada una queda bajo su parte, y su profundidad se mide en línea recta hacia abajo. Las secciones transversales dibujan la base de cada capa como una línea de trazos, y {{ui:Capas de pavimento: cantidades}} lista el área en planta y el volumen de cada capa (área a lo largo del corredor desde sus secciones, volumen = área × espesor). La exportación IFC escribe cada capa como su propio elemento con su espesor y su material (mirá [Exportación y importación IFC](topic:ifc)). El espesor que escribas es tuyo: CivilCraft no dimensiona pavimentos.

## Dónde los caminos se encuentran con caminos, pads y senderos

Con {{ui:Ojunta rutas ha pads ojoavahápe}} activado (lo está para cada corredor), CivilCraft une un corredor con lo que encuentra en planta:

- **Un camino que termina sobre otro camino** (su extremo de trazado está sobre el otro camino, o a menos de aproximadamente la mitad del ancho de su propio pavimento del borde de ese camino) es el camino lateral de una intersección. El camino que encuentra abre su borde para el pavimento del camino lateral: a través de la boca, la berma, el cordón, la franja y la vereda se tienden con la pendiente transversal del carril y se dibujan como pavimento. El camino lateral se apoya sobre la superficie del camino principal donde ambos se superponen, y se suaviza hacia arriba o hacia abajo hasta ella en la aproximación.
- **Dos caminos que se cruzan** se unen de la misma manera en ambos lados. El camino listado primero bajo Trazados es el camino de paso; el otro sigue su superficie a través del cruce.
- **Un camino que termina en un pad** (dentro de él, o a menos de aproximadamente la mitad del ancho de su pavimento de su borde) llega a la cota del pad y se suaviza hasta ella en la aproximación.
- **Un sendero** (Paisajismo › Obras duras) se detiene en el borde exterior de un camino, a la cota de la vereda o la berma ahí, en lugar de quedar sobre el camino. Un sendero que cruza un camino se convierte en dos piezas. Un extremo dibujado un poco antes de un camino (a menos del doble del ancho del sendero) se prolonga hasta su borde.

Propiedades dice qué unió cada corredor, cuánto se subió o bajó allí y sobre qué longitud. Esa longitud es mayor entre 10 m (30 ft) y veinte veces el cambio, y nunca más del 45% del corredor. **El perfil de diseño no se modifica**: la vista de perfil sigue mostrando la línea de pendiente que dibujaste, y las secciones, la superficie propuesta, los volúmenes y la vista 3D muestran el camino tal como quedó unido. Para que la unión sea exacta por diseño, movés el último PVI a la cota que indican las Propiedades.

Apagá el interruptor de un corredor para dejarlo exactamente como indican su perfil y su ensamblaje; entonces no participa en ninguna unión, ni como camino lateral ni como camino de paso. Los caminos que se encuentran casi en línea (menos de unos 20°) no se tocan, y tampoco las pistas.

Lo que una unión todavía no hace: no hay retornos de cordón (las esquinas son cuadradas), no hay carriles de giro ni islas, el extremo del camino lateral se corta cuadrado respecto de su propio trazado, y un corredor construido desde plantillas abre su borde de la misma manera simple (una zanja o un muro en su condición de extremo se nivela a través de la boca, sin alcantarilla). Para los retornos de cordón en planta, los triángulos de visibilidad y el señalamiento, mirá [Suelos, caminos, relevamiento, minas y enlaces](topic:soils-roads-survey-mines-links).

## Lo que todavía no está construido

Los objetivos para la pendiente de la línea de corte todavía no están disponibles. Para un corredor que cambia a lo largo del camino, con izquierda y derecha separadas, usá [Plantillas del corredor](topic:corridor-templates). Mirá [Todavía no construido](topic:not-built-yet).
