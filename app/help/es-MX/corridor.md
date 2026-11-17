---
title: Barrido de una obra lineal de carretera
summary: Active una obra lineal para una alineación, establezca los valores de carril, acotamiento y talud, y lea las secciones, las líneas de empate y el movimiento de tierras que produce.
keywords: peralte, súper, peraltado, transición, transición de salida, tabla de tasas, pendiente transversal, rotación, obra lineal, conjunto, subconjunto, sección tipo, carretera, carril, acotamiento, pendiente transversal, talud, empate, corte, terraplén, secciones, objetivo, objetivos, objetivo de ancho, objetivo de elevación, objetivo de desfase, ensanchamiento, borde del pavimento, seguir otra obra lineal
from: 91303189
---

Una obra lineal barre una sección tipo sencilla (un conjunto) a lo largo de una alineación y su perfil de proyecto, la asienta sobre el terreno existente y agrega el resultado a la superficie proyectada. Una alineación puede tener varias obras lineales en rangos de estaciones distintos, y una obra lineal puede construirse con plantillas reutilizables por estación ([Plantillas de obra lineal](topic:corridor-templates)). El conjunto sencillo siguiente es igual en ambos lados; para dar a cada lado sus propias partes, vea [Construya cada lado con partes](topic:corridor#build-each-side-from-parts).

## La sección tipo

Desde el eje hacia afuera, en cada lado:

1. un **carril** de un ancho dado, que baja desde la cresta con la **pendiente del carril**
2. un **acotamiento** de un ancho dado, con la **pendiente del acotamiento**
3. un **talud** desde el borde del acotamiento hasta donde toca el terreno: el **talud de corte** donde el terreno está arriba, y el **talud de terraplén** donde está abajo

Los valores iniciales son marcadores de posición, no una norma de diseño:

| Valor | Pies de EE. UU. | Metros |
|---|---|---|
| Ancho de carril | 12 ft | 3.6 m |
| Pendiente de carril | 2% | 2% |
| Ancho de acotamiento | 4 ft | 1.2 m |
| Pendiente de acotamiento | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

Las pendientes de los taludes son horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Construya la obra lineal

Necesita una alineación sin errores y un perfil de proyecto con al menos dos PVI y sin errores.

1. Seleccione la alineación.
2. En el panel derecho, bajo **Obra lineal**, marque **Barrer un conjunto a lo largo del perfil de proyecto**.
   Aparecen los campos y la obra lineal se construye de inmediato. El plano muestra los bordes de carril y acotamiento y las líneas de empate; con {{ui:Proyecto (rasante)}} elegido bajo **Visualización**, las curvas muestran el terreno nuevo.
3. Cambie cualquier valor: **Ancho de carril**, **Pendiente de carril**, **Ancho de acotamiento**, **Pendiente de acotamiento**, **Talud de corte**, **Talud de terraplén**, **Sección cada**. Pulse {{key:Enter}} después de cada uno. El corte, el terraplén y el espaciado de secciones deben ser mayores que 0.
4. Lea la línea bajo los campos, por ejemplo "39 secciones de 0+00.00 a 3+86.36; corte 240.2 cu yd, terraplén 556.0 cu yd."

Las secciones se cortan en cada paso de **Sección cada**, en los extremos, y al inicio y al final de cada curva horizontal y vertical. Cada sección y las líneas que pasan por ellas (eje, bordes de carril y acotamiento, empate) se convierten en líneas de ruptura de la superficie proyectada.

Para desactivar la obra lineal, desmarque la casilla. Sus valores se conservan para la próxima vez.

## Cuando no se construye

Un recuadro rojo bajo los campos indica el motivo:

| Mensaje | Qué hacer |
|---|---|
| "La obra lineal necesita un perfil de proyecto sin errores." | Agregue PVI, o corrija las curvas verticales que se traslapan (vea [Diseñe un perfil vertical](topic:profile)). |
| "El perfil de proyecto no se traslapa con la alineación." | Mueva los PVI al rango de estaciones de la alineación. |
| "La obra lineal necesita al menos dos secciones en la superficie." | La mayor parte de la obra lineal está fuera del terreno existente. |
| "4 taludes laterales salen de la superficie antes de tocar el terreno." | Cerca del borde de la superficie, el talud no puede alcanzar el terreno. Aleje el camino del borde, o baje la altura del terraplén o del corte ahí. |
| "Las líneas de empate de la obra lineal se cruzan (las secciones se traslapan, por ejemplo en el lado interior de una curva cerrada). Use un radio mayor o un conjunto más angosto." | Las secciones en el lado interior de una curva cerrada se traslapan. Aumente el radio o angoste el conjunto. |

Una obra lineal con un problema no se asienta ni cuenta en el movimiento de tierras.

## Obras lineales y plataformas juntas

La superficie proyectada se construye en orden: primero cada obra lineal, luego cada plataforma. Donde el rasante de una plataforma se traslapa con una obra lineal, gana la plataforma. Los volúmenes se calculan dentro de todas las líneas de empate juntas; vea [Volúmenes de movimiento de tierras](topic:volumes).

## Peralte

En una curva, el camino puede inclinarse hacia el interior, de modo que el tránsito se empuja menos hacia el exterior. Marque **Peraltar las curvas** bajo **Peralte** en las **Propiedades** de la alineación:

- Cada curva circular toma una tasa **e** de la tabla de tasas: la primera fila cuyo radio alcanza la curva (una fila con tasa vacía mantiene el bombeo normal). La tabla y la **Pendiente relativa máxima** (0.5 % al inicio) son marcadores de posición, no una norma: fíjelos con sus propios criterios de diseño. Agregue o quite filas según necesite.
- Los carriles giran alrededor del eje. Antes de la curva, el carril exterior se aplana en la **transición de salida** (bombeo normal ÷ e × transición de salida); luego, en la **transición** (ancho del carril × e ÷ la pendiente), el carril exterior sigue girando hasta que todo el camino baja con e hacia el interior. Dos tercios de la transición quedan antes de la curva y un tercio sobre ella. Después de la curva ocurre lo mismo a la inversa.
- Un acotamiento del lado bajo nunca es más plano que su carril; en el lado alto conserva su propia pendiente (se voltea).
- La tabla debajo enumera el radio, la tasa, la transición y la transición de salida de cada curva, y dónde empiezan y terminan el peralte pleno. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de las estaciones (el carril izquierdo sólido, el derecho punteado).
- Una curva demasiado corta para alcanzar el peralte pleno, o dos curvas cuyas transiciones se traslapan, se indica en un recuadro sobre la tabla.

Las secciones, los volúmenes, la vista 3D y las presentaciones muestran el camino inclinado. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo mueve un punto de un lado del camino hasta una línea: el **Borde del pavimento** o el **Borde del acotamiento**, a la **Izquierda** o a la **Derecha**. Cada sección toca la línea en ángulo recto con el eje, saliendo solo hacia ese lado, así que un objetivo a la derecha nunca mueve el lado izquierdo.

| Ajusta | Qué pasa donde una sección toca la línea |
|---|---|
| **Ancho** | El punto queda sobre la línea: el carril (o el acotamiento) se ensancha o se estrecha hasta ella, conservando su pendiente transversal. |
| **Elevación** | El punto toma la elevación de la línea ahí, en su propio desfase: la pendiente transversal del carril (o del acotamiento) sigue a la línea. |

La línea puede ser una línea característica (cualquiera que sea su **Uso**) o una línea de otra obra lineal: su eje, sus bordes de pavimento, sus bordes de acotamiento o sus líneas de empate. La línea de una obra lineal sigue a esa obra: cambie el otro camino y este lo sigue. CivilCraft construye primero la otra obra lineal; dos obras lineales que se apuntaran en bucle entre sí se rechazan de un lado, y la tabla indica cuál.

1. Seleccione la alineación y active su obra lineal.
2. Bajo **Objetivos**, haga clic en {{ui:Agregar un objetivo}}.
3. Elija el **Lado**, el **Punto**, qué **Ajusta** y la **Línea**. Cada cambio es un paso de deshacer.

**Resultado** indica en cuántas secciones se alcanzó la línea. Las secciones que no la alcanzan (más allá de sus extremos, o donde está detrás del eje) conservan los valores de la sección tipo. Una línea que se borra deja la obra lineal como estaba antes del objetivo, y la tabla lo indica. Un lado puede tener un objetivo de ancho y un objetivo de elevación por cada punto.

## Construya cada lado con partes

Active **Construir cada lado con partes** en la configuración de la obra lineal. Cada lado tiene entonces su propia lista, desde el eje hacia afuera: carriles, un acotamiento, un arroyo, una guarnición, una franja verde, una banqueta y, al final, el talud hasta el terreno (con sus propias relaciones de corte y terraplén). Empiece desde {{ui:Camino rural}} o {{ui:Calle urbana}}, agregue y quite partes, muévalas con las flechas, y use {{ui:Copiar}} para pasar un lado al otro. Cada cambio es un paso de deshacer.

Una pendiente transversal es la caída que se aleja del camino, así que una banqueta que drena hacia el camino tiene pendiente negativa. Una guarnición es una cara de la altura que dé, una cima del ancho que dé y una caída opcional en la parte posterior. El peralte gira cada carril de la primera fila; el arroyo, la guarnición, la franja y la banqueta cuelgan del borde de los carriles tal como se construyeron. Los objetivos siguen moviendo el extremo de los carriles y la última parte. Las secciones transversales marcan la línea de flujo del arroyo, la cima y el dorso de la guarnición, y el resto. En una curva con espirales, la transición es la espiral: bombeo nivelado en el TS, peralte pleno en el SC.

## Capas de pavimento

Un carril, acotamiento, arroyo, franja verde o banqueta puede llevar su paquete de capas. Bajo la parte, {{ui:Agregar una capa}} agrega una capa con un nombre, un material, un espesor y su tipo (rodadura, intermedia, base, subbase, subrasante u otra), de arriba hacia abajo. Las capas no mueven la superficie del camino (su cima es la superficie de diseño); cada una queda bajo su parte, con su profundidad medida en vertical. Las secciones transversales dibujan la base de cada capa como una línea punteada, y {{ui:Capas del pavimento: cantidades}} enumera el área en planta y el volumen de cada capa (área a lo largo de la obra lineal desde sus secciones, volumen = área × espesor). La exportación IFC escribe cada capa como su propio elemento con su espesor y material (vea [Exportación e importación IFC](topic:ifc)). El espesor que escribe es suyo: CivilCraft no dimensiona pavimentos.

## Lo que aún no se construye

Los objetivos para la pendiente del empate todavía no están disponibles. Para una obra lineal que cambia a lo largo del camino, con izquierda y derecha separadas, use [Plantillas de obra lineal](topic:corridor-templates). Vea [Aún no construido](topic:not-built-yet).
