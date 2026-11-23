---
title: Barrido de una obra lineal vial
summary: Active una obra lineal para una alineación, defina los valores de carril, acotamiento y talud lateral, y lea las secciones, las líneas de liga y el movimiento de tierras que produce.
keywords: intersección, cruce, vía con vía, vía secundaria, unión en T, cruce, nivel de plataforma, unir, conexión, peralte, súper, bombeo, transición, salida, tabla de tasas, pendiente transversal, rotación, obra lineal, ensamblaje, subensamblaje, sección tipo, vía, carril, acotamiento, pendiente transversal, talud lateral, línea de liga, corte, terraplén, secciones, objetivo, objetivos, objetivo de ancho, objetivo de elevación, objetivo de desfase, ensanche, borde de pavimento, seguir otra obra lineal
from: 6dcb92b3
---

Una obra lineal barre una sección tipo sencilla (un ensamblaje) a lo largo de una alineación y de su perfil de diseño, la ajusta al terreno existente y agrega el resultado a la superficie proyectada. Una alineación puede tener varias obras lineales en distintos rangos de estaciones, y una obra lineal puede construirse con plantillas reutilizables por estación ([Plantillas de obra lineal](topic:corridor-templates)). El ensamblaje sencillo siguiente es igual en ambos lados; para dar a cada lado sus propios elementos, vea [Construir cada lado con elementos](topic:corridor#build-each-side-from-parts).

## El ensamblaje

Desde el eje hacia afuera, en cada lado:

1. un **carril** de un ancho dado, que desciende desde el bombeo con la **pendiente del carril**
2. un **acotamiento** de un ancho dado con la **pendiente del acotamiento**
3. un **talud lateral** desde el borde del acotamiento hasta encontrar el terreno: el **talud de corte** donde el terreno está por encima, el **talud de terraplén** donde está por debajo

Los valores iniciales son provisionales, no una norma de diseño:

| Valor | Pies (EE. UU.) | Metros |
|---|---|---|
| Ancho del carril | 12 ft | 3.6 m |
| Pendiente del carril | 2% | 2% |
| Ancho del acotamiento | 4 ft | 1.2 m |
| Pendiente del acotamiento | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

Los taludes laterales se expresan de horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Construir la obra lineal

Necesita una alineación sin errores y un perfil de diseño con al menos dos PIV y sin errores.

1. Seleccione la alineación.
2. En el panel derecho, bajo **Obra lineal**, marque **Barrer un ensamblaje a lo largo del perfil de diseño**.
   Aparecen los campos y la obra lineal se construye de inmediato. La planta muestra los bordes del carril y del acotamiento y las líneas de liga; con {{ui:Proyecto (rasante)}} elegido en **Visualización**, las curvas de nivel muestran el terreno nuevo.
3. Cambie cualquier valor: **Ancho del carril**, **Pendiente del carril**, **Ancho del acotamiento**, **Pendiente del acotamiento**, **Talud de corte**, **Talud de terraplén**, **Sección cada**. Pulse {{key:Enter}} después de cada uno. Los taludes de corte y de terraplén y el espaciamiento de secciones deben ser mayores que 0.
4. Lea la línea bajo los campos, por ejemplo "39 secciones de 0+00.00 a 3+86.36; corte 240.2 cu yd, terraplén 556.0 cu yd."

Las secciones se cortan en cada paso de **Sección cada**, en los extremos, y al inicio y al final de cada curva horizontal y vertical. Cada sección y las líneas que pasan por ellas (eje, bordes del carril y del acotamiento, línea de liga) se convierten en líneas de ruptura de la superficie proyectada.

Para desactivar la obra lineal, desmarque la casilla. Sus valores se conservan para la próxima vez.

## Cuando no se construye

Un recuadro rojo bajo los campos indica el motivo:

| Mensaje | Qué hacer |
|---|---|
| "La obra lineal necesita un perfil de diseño sin errores." | Agregue PIV o corrija las curvas verticales que se traslapan (vea [Diseñar un perfil vertical](topic:profile)). |
| "El perfil de diseño no se traslapa con la alineación." | Mueva los PIV al rango de estaciones de la alineación. |
| "La obra lineal necesita al menos dos secciones sobre la superficie." | La mayor parte de la obra lineal está fuera del terreno existente. |
| "4 taludes laterales salen de la superficie antes de encontrar el terreno." | Cerca del borde de la superficie, el talud no alcanza el terreno. Aleje la vía del borde, o baje la altura del terraplén o del corte en ese punto. |
| "Las líneas de liga de la obra lineal se cruzan (las secciones se traslapan, por ejemplo en el interior de una curva cerrada). Use un radio mayor o un ensamblaje más angosto." | Las secciones en el interior de una curva cerrada se traslapan. Aumente el radio o reduzca el ensamblaje. |

Una obra lineal con algún problema no se ajusta al terreno y no cuenta en el movimiento de tierras.

## Obras lineales y plataformas juntas

La superficie proyectada se construye en orden: primero cada obra lineal y luego cada plataforma. Donde la nivelación de una plataforma se traslapa con una obra lineal, gana la plataforma. Donde un elemento posterior se traslapa con una vía, solo se reemplaza la parte de la vía dentro de la línea de liga del elemento posterior; el resto de la vía, y cualquier línea de ruptura del terreno que la vía cruce, conservan su forma. Los volúmenes se calculan dentro de todas las líneas de liga en conjunto; vea [Volúmenes de movimiento de tierras](topic:volumes).

## Peralte

En una curva la vía puede inclinarse hacia el interior, de modo que el tránsito se empuja menos hacia el exterior. Marque **Peraltar las curvas** bajo **Peralte** en las **Propiedades** de la alineación:

- Cada curva circular toma una tasa **e** de la tabla de tasas: la primera fila cuyo radio alcanza la curva (una fila con tasa vacía conserva el bombeo normal). La tabla y la **Pendiente relativa máxima** (0.5 % al inicio) son provisionales, no una norma: defínalas con sus propios criterios de diseño. Agregue o quite filas según necesite.
- Los carriles giran alrededor del eje. Antes de la curva, el carril exterior se aplana a lo largo de la **transición del bombeo** (bombeo normal ÷ e × transición), y luego a lo largo de la **transición del peralte** (ancho del carril × e ÷ la pendiente): el carril exterior sigue girando hasta que toda la vía tiene una pendiente e hacia el interior. Dos tercios de la transición quedan antes de la curva y un tercio sobre ella. Después de la curva ocurre lo mismo en sentido inverso.
- Un acotamiento del lado bajo nunca es más plano que su carril; en el lado alto conserva su propia pendiente (se invierte).
- La tabla bajo él enumera el radio, la tasa, la transición del peralte y la transición del bombeo de cada curva, y dónde empieza y termina el peralte completo. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de las estaciones (el carril izquierdo en línea continua, el derecho en línea discontinua).
- Una curva demasiado corta para alcanzar el peralte completo, o dos curvas cuyas transiciones se traslapan, se indica en un recuadro sobre la tabla.

Las secciones, los volúmenes, la vista 3D y las hojas muestran la vía inclinada. Cada cambio es un paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo mueve un punto de un lado de la vía hacia una línea: el **Borde de pavimento** o el **Borde del acotamiento**, en la **Izquierda** o la **Derecha**. Cada sección encuentra la línea en ángulo recto con el eje, saliendo solo por ese lado, de modo que un objetivo en la derecha nunca mueve el lado izquierdo.

| Establece | Qué pasa donde una sección encuentra la línea |
|---|---|
| **Ancho** | El punto queda sobre la línea: el carril (o el acotamiento) se ensancha o se reduce hasta ella, conservando su pendiente transversal. |
| **Elevación** | El punto toma la elevación de la línea en ese lugar, conservando su propio desfase: la pendiente transversal del carril (o del acotamiento) sigue a esa elevación. |

La línea puede ser una línea característica (sea cual sea su **Uso**) o una línea de otra obra lineal: su eje, sus bordes de pavimento, bordes de acotamiento o líneas de liga. La línea de una obra lineal sigue a esa obra: si cambia la otra vía, esta sigue el cambio. CivilCraft construye primero la otra obra lineal; dos obras lineales que se apuntarían entre sí en un ciclo se rechazan de un lado, y la tabla indica cuál.

1. Seleccione la alineación y active su obra lineal.
2. En **Objetivos**, haga clic en {{ui:Agregar un objetivo}}.
3. Elija el **Lado**, el **Punto**, qué **Establece** y **A la línea**. Cada cambio es un paso de deshacer.

**Resultado** indica en cuántas secciones se alcanzó la línea. Las secciones que no la alcanzan (más allá de sus extremos, o donde queda detrás del eje) conservan los valores del ensamblaje. Una línea que se borra deja la obra lineal como estaba antes del objetivo, y la tabla lo indica. Un lado puede tener un objetivo de ancho y un objetivo de elevación por cada punto.

## Construir cada lado con elementos

Active **Construir cada lado con elementos** en la configuración de la obra lineal. Cada lado tiene entonces su propia lista, desde el eje hacia afuera: carriles, un acotamiento, un arroyo, una guarnición, una franja de plantación, una banqueta y, al final, el talud lateral hasta el terreno (con sus propias relaciones de corte y de terraplén). Comience desde {{ui:Camino rural}} o {{ui:Calle urbana}}, agregue y quite elementos, muévalos con las flechas y {{ui:Copiar}} un lado al otro. Cada cambio es un paso de deshacer.

La pendiente transversal es la caída que se aleja de la vía, así que una banqueta que desagua hacia la vía tiene valor negativo. Una guarnición es una cara de la altura que usted indique, una corona del ancho que indique y una caída opcional en la parte posterior. El peralte gira cada carril de la primera fila; el arroyo, la guarnición, la franja y la banqueta cuelgan del borde de los carriles tal como se construyeron. Los objetivos siguen moviendo el extremo de los carriles y la última parte. Las secciones transversales marcan la línea de flujo del arroyo, la parte superior y la parte posterior de la guarnición, y el resto. En una curva con espirales, la transición es la espiral: bombeo nivelado en el TS, peralte completo en el SC.

## Capas del pavimento

Un carril, un acotamiento, un arroyo, una franja de plantación o una banqueta pueden tener su propia estructura: bajo el elemento, {{ui:Agregar una capa}} agrega una capa con un nombre, un material, un espesor y su tipo (superficie, liga, base, subbase, subrasante u otro), de arriba hacia abajo. Las capas no mueven la superficie de la vía (su parte superior es la superficie de diseño); cada una queda bajo su elemento, con su profundidad medida en línea recta hacia abajo. Las secciones transversales dibujan la base de cada capa con una línea discontinua, y {{ui:Capas del pavimento: cantidades}} enumera el área en planta y el volumen de cada capa (área a lo largo de la obra lineal a partir de sus secciones, volumen = área × espesor). La exportación IFC escribe cada capa como su propio elemento, con su espesor y material (vea [Exportación e importación IFC](topic:ifc)). El espesor que escriba es suyo: CivilCraft no dimensiona pavimentos.

## Donde las vías se encuentran con vías, plataformas y senderos

Con {{ui:Unir las vías y plataformas con las que se encuentra}} activado (lo está en cada obra lineal), CivilCraft une una obra lineal con lo que encuentra en planta:

- **Una vía que termina en otra vía** (el final de su alineación queda sobre la otra vía, o a menos de la mitad de su propio ancho de pavimento del borde de esa vía) es la vía secundaria de una intersección. La vía que encuentra abre su borde para el pavimento de la vía secundaria: a lo ancho de la boca, el acotamiento, la guarnición, la franja y la banqueta se tienden con la pendiente transversal del carril y se dibujan como pavimento. La vía secundaria se tiende sobre la superficie de la vía principal donde se traslapan, y se suaviza subiendo o bajando hasta ella a lo largo de la aproximación.
- **Dos vías que se cruzan** se unen de la misma forma en ambos lados. La vía que aparece primero en Alineaciones es la vía continua; la otra sigue su superficie a través del cruce.
- **Una vía que termina en una plataforma** (dentro de ella, o a menos de la mitad de su ancho de pavimento de su borde) llega al nivel de la plataforma y se suaviza hasta él a lo largo de la aproximación.
- **Un sendero** (Paisajismo › Elementos duros) se detiene en el borde exterior de una vía, al nivel de la banqueta o del acotamiento en ese punto, en lugar de quedar sobre la vía. Un sendero que cruza una vía se convierte en dos piezas. Un extremo dibujado un poco antes de una vía (dentro del doble del ancho del sendero) se prolonga hasta su borde.

**Propiedades** indica qué unió cada obra lineal, cuánto se subió o bajó allí y en qué longitud. Esa longitud es el mayor entre 10 m (30 ft) y veinte veces el cambio, y nunca más del 45 % de la obra lineal. **El perfil de diseño no cambia**: la vista de perfil sigue mostrando la línea de pendiente que dibujó, y las secciones, la superficie proyectada, los volúmenes y la vista 3D muestran la vía tal como quedó unida. Para que la unión sea exacta por diseño, mueva el último PIV al nivel que indica Propiedades.

Desactive el interruptor de una obra lineal para dejarla exactamente como indican su perfil y su ensamblaje; entonces no participa en ninguna intersección, ni como vía secundaria ni como vía continua. Las vías que se encuentran casi en línea (con menos de unos 20°) se dejan intactas, y lo mismo ocurre con los caminos de terracería.

Lo que una intersección todavía no hace: no hay retornos de guarnición (las esquinas son rectas), no hay carriles de giro ni islas, el extremo de la vía secundaria se corta a escuadra respecto a su propia alineación, y una obra lineal construida con plantillas abre su borde de la misma forma sencilla (un canal o un muro en su condición de extremo se nivela a través de la boca, sin alcantarilla). Para retornos de guarnición en planta, triángulos de visibilidad y señalización, vea [Suelos, vías, topografía, minas y enlaces](topic:soils-roads-survey-mines-links).

## Lo que todavía no está disponible

Los objetivos para el talud hasta la línea de liga todavía no están disponibles. Para una obra lineal que cambia a lo largo de la vía, con izquierda y derecha separadas, use [Plantillas de obra lineal](topic:corridor-templates). Vea [Aún no disponible](topic:not-built-yet).
