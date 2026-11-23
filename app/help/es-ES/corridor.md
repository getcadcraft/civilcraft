---
title: Barrer un corredor de carretera
summary: Active un corredor para un trazado, defina los valores de carril, arcén y talud lateral, y lea las secciones, las líneas de encuentro con el terreno y el movimiento de tierras que produce.
keywords: cruce, intersección, carretera que encuentra a otra, vía secundaria, cruce en T, cruce, cota de plataforma, unir, enlazar, peralte, transición, longitud de transición, tabla de peraltes, bombeo, sección tipo, carretera, carril, arcén, bombeo transversal, talud lateral, encuentro con el terreno, desmonte, terraplén, secciones, objetivo, objetivos, objetivo de anchura, objetivo de cota, objetivo de desplazamiento, ensanche, borde de calzada, seguir otro corredor, corredor, giro
from: 6dcb92b3
---

Un corredor barre una sección tipo sencilla a lo largo de un trazado y de su perfil de proyecto, la ajusta al terreno existente y añade el resultado a la superficie de proyecto. Un trazado puede tener varios corredores en distintos tramos de P.K., y un corredor puede construirse a partir de plantillas reutilizables por P.K. ([Plantillas de corredor](topic:corridor-templates)). La sección tipo sencilla de abajo es igual en ambos lados; para dar a cada lado sus propios elementos, vea [Construir cada lado a partir de elementos](topic:corridor#build-each-side-from-parts).

## La sección tipo

Desde el eje hacia fuera, en cada lado:

1. un **carril** de una anchura dada, que desciende desde el bombeo con la **pendiente del carril**
2. un **arcén** de una anchura dada con la **pendiente del arcén**
3. un **talud lateral** desde el borde del arcén hasta el punto en que encuentra el terreno: el **talud de desmonte** donde el terreno está por encima, y el **talud de terraplén** donde está por debajo

Los valores iniciales son provisionales, no una norma de proyecto:

| Valor | Pies (EE. UU.) | Metros |
|---|---|---|
| Ancho del carril | 12 ft | 3.6 m |
| Pendiente del carril | 2% | 2% |
| Ancho del arcén | 4 ft | 1.2 m |
| Pendiente del arcén | 4% | 4% |
| Talud de desmonte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

Los taludes laterales se expresan en horizontal a vertical (H:V): 3 : 1 significa 3 en horizontal por 1 en vertical.

## Generar el corredor

Necesita un trazado sin errores y un perfil de proyecto con al menos dos PIV y sin errores.

1. Seleccione el trazado.
2. En el panel derecho, en **Corredor**, marque **Barrer una sección tipo a lo largo del perfil de proyecto**.
   Aparecen los campos y el corredor se genera de inmediato. La planta muestra los bordes del carril y del arcén y las líneas de encuentro con el terreno; con {{ui:Proyecto (rasante)}} elegido en **Visualización**, las curvas de nivel muestran el terreno nuevo.
3. Cambie cualquier valor: **Ancho del carril**, **Pendiente del carril**, **Ancho del arcén**, **Pendiente del arcén**, **Talud de desmonte**, **Talud de terraplén**, **Sección cada**. Pulse {{key:Enter}} después de cada uno. El talud de desmonte, el de terraplén y la separación de secciones deben ser mayores que 0.
4. Lea la línea bajo los campos, por ejemplo «39 secciones de 0+00.00 a 3+86.36; desmonte 240.2 cu yd, terraplén 556.0 cu yd».

Las secciones se cortan en cada paso de **Sección cada**, en los extremos y en el inicio y el final de cada curva horizontal y vertical. Cada sección y las líneas que pasan por ellas (eje, bordes del carril y del arcén, encuentro con el terreno) se convierten en líneas de rotura de la superficie de proyecto.

Para desactivar el corredor, desmarque la casilla. Sus valores se conservan para la próxima vez.

## Cuando no se genera

Un recuadro rojo bajo los campos indica el motivo:

| Mensaje | Qué hacer |
|---|---|
| «El corredor necesita un perfil de proyecto sin errores.» | Añada PIV, o corrija las curvas verticales que se solapan (vea [Diseñar un perfil vertical](topic:profile)). |
| «El perfil de proyecto no coincide con el trazado.» | Mueva los PIV al intervalo de P.K. del trazado. |
| «El corredor necesita al menos dos secciones sobre la superficie.» | La mayor parte del corredor queda fuera del terreno existente. |
| «4 taludes laterales salen de la superficie antes de encontrar el terreno.» | Cerca del borde de la superficie, el talud no puede alcanzar el terreno. Aleje la carretera del borde, o reduzca ahí la altura del terraplén o del desmonte. |
| «Las líneas de encuentro con el terreno del corredor se cruzan (las secciones se solapan, por ejemplo en el interior de una curva cerrada). Use un radio mayor o una sección tipo más estrecha.» | Las secciones en el interior de una curva cerrada se solapan. Aumente el radio o estreche la sección tipo. |

Un corredor con un problema no se ajusta al terreno y no cuenta en el movimiento de tierras.

## Corredores y plataformas juntos

La superficie de proyecto se genera en orden: primero todos los corredores y luego todas las plataformas. Donde el ajuste de una plataforma se solape con un corredor, prevalece la plataforma. Cuando un elemento posterior se solape con una carretera, solo se reemplaza la parte de la carretera que queda dentro de la línea de encuentro con el terreno del elemento posterior; el resto de la carretera, y cualquier línea de rotura del terreno que la carretera cruce, mantiene su forma. Los volúmenes se calculan dentro de todas las líneas de encuentro juntas; vea [Volúmenes de movimiento de tierras](topic:volumes).

## Peralte

En una curva, la carretera puede inclinarse hacia el interior, de modo que el tráfico es empujado menos hacia el exterior. Marque **Peraltar las curvas** en **Peralte**, en las **Propiedades** del trazado:

- Cada curva circular toma un peralte **e** de la tabla de peraltes: la primera fila cuyo radio alcanza la curva (una fila con el peralte vacío mantiene el bombeo normal). La tabla y la **Pendiente relativa máxima** (0.5 % al inicio) son provisionales, no una norma: fíjelas según sus propios criterios de proyecto. Añada o quite filas según necesite.
- Los carriles giran alrededor del eje. Antes de la curva, el carril exterior se aplana a lo largo de la **transición del bombeo** (bombeo normal ÷ e × transición del peralte); después, a lo largo de la **transición del peralte** (ancho del carril × e ÷ la pendiente), el carril exterior sigue girando hasta que toda la carretera tiene una pendiente e hacia el interior. Dos tercios de la transición del peralte quedan antes de la curva y un tercio sobre ella. Después de la curva ocurre lo mismo en sentido inverso.
- Un arcén del lado bajo nunca es más plano que su carril; en el lado alto mantiene su propia pendiente (gira con la carretera).
- La tabla bajo ella indica el radio, el peralte, la transición del peralte y la transición del bombeo de cada curva, y dónde empieza y termina el peralte completo. El **diagrama de peralte** dibuja las pendientes transversales de ambos carriles a lo largo de los P.K. (el carril izquierdo en línea continua y el derecho en línea discontinua).
- Una curva demasiado corta para alcanzar el peralte completo, o dos curvas cuyas transiciones se solapan, se indica en un recuadro sobre la tabla.

Las secciones, los volúmenes, la vista 3D y las hojas muestran todos la carretera inclinada. Cada cambio es un solo paso: {{key:Mod+Z}} lo deshace.

## Objetivos

Un objetivo desplaza un punto de un lado de la carretera hasta una línea: el **Borde de calzada** o el **Borde del arcén**, en la **Izquierda** o en la **Derecha**. Cada sección encuentra la línea en ángulo recto con el eje, saliendo solo por ese lado; así, un objetivo de la derecha nunca mueve el lado izquierdo.

| Fija | Qué ocurre donde una sección encuentra la línea |
|---|---|
| **Anchura** | El punto se sitúa sobre la línea: el carril (o el arcén) se ensancha o se estrecha hasta ella, manteniendo su pendiente transversal. |
| **Cota** | El punto toma la cota de la línea en ese lugar, a su propio desplazamiento: la pendiente transversal del carril (o del arcén) se adapta. |

La línea puede ser una línea característica (sea cual sea su **Uso**) o una línea de otro corredor: su eje, bordes de calzada, bordes de arcén o líneas de encuentro con el terreno. La línea de un corredor sigue a ese corredor: si cambia la otra carretera, esta también la sigue. CivilCraft genera primero el otro corredor; dos corredores que se apuntaran mutuamente en bucle se rechazan por un lado, y la tabla indica cuál.

1. Seleccione el trazado y active su corredor.
2. En **Objetivos**, haga clic en {{ui:Añadir un objetivo}}.
3. Elija el **Lado**, el **Punto**, qué **Fija** y **A la línea**. Cada cambio es un paso de deshacer.

**Resultado** indica en cuántas secciones se alcanzó la línea. Las secciones que no la alcanzan (más allá de sus extremos, o donde queda detrás del eje) conservan los valores de la sección tipo. Una línea que se borra deja el corredor como estaba antes del objetivo, y la tabla lo indica. Un lado puede tener un objetivo de anchura y uno de cota por cada punto.

## Construir cada lado a partir de elementos

Active **Construir cada lado a partir de elementos** en la configuración del corredor. Cada lado tiene entonces su propia lista, desde el eje hacia fuera: carriles, un arcén, una cuneta, un bordillo, una franja ajardinada, una acera y, por último, el talud lateral hasta el terreno (con sus propias relaciones de desmonte y terraplén). Parta de {{ui:Carretera rural}} o {{ui:Calle urbana}}, añada y quite elementos, muévalos con las flechas, y {{ui:Copiar}} un lado al otro. Cada cambio es un paso de deshacer.

La pendiente transversal es la caída que se aleja de la carretera, así que una acera que desagua hacia la carretera tiene valor negativo. Un bordillo es una cara de la altura que indique, una coronación de la anchura que indique y un desnivel opcional por detrás. El peralte gira todos los carriles de la primera fila; la cuneta, el bordillo, la franja y la acera cuelgan del borde de los carriles tal como se han construido. Los objetivos siguen moviendo el extremo de los carriles y el último elemento. Las secciones transversales marcan la línea de fondo de la cuneta, la parte superior y trasera del bordillo, y lo demás. En una curva con clotoides, la transición del peralte es la clotoide: bombeo nulo en la TS y peralte completo en la SC.

## Capas del firme

Un carril, arcén, cuneta, franja ajardinada o acera puede llevar su paquete de capas: bajo el elemento, {{ui:Añadir una capa}} añade una capa con un nombre, un material, un espesor y su tipo (rodadura, intermedia, base, subbase, coronación de explanada u otra), de arriba abajo. Las capas no mueven la superficie de la carretera (su parte superior es la superficie de proyecto); cada una queda bajo su elemento, con su profundidad medida en vertical. Las secciones transversales dibujan la base de cada capa como línea discontinua, y {{ui:Capas del firme: mediciones}} enumera la superficie en planta y el volumen de cada capa (superficie a lo largo del corredor a partir de sus secciones, volumen = superficie × espesor). La exportación IFC escribe cada capa como elemento propio con su espesor y material (vea [Exportación e importación IFC](topic:ifc)). El espesor que escriba es el suyo: CivilCraft no dimensiona los firmes.

## Donde las carreteras se encuentran con otras carreteras, plataformas y sendas

Con {{ui:Enlazar las carreteras y plataformas con las que se encuentra}} activado (lo está en todos los corredores), CivilCraft enlaza un corredor con lo que encuentra en planta:

- **Una carretera que termina en otra carretera** (el final de su trazado queda sobre la otra carretera, o a menos de aproximadamente la mitad de la anchura de su propia calzada del borde de esa carretera) es la vía secundaria de una intersección. La carretera con la que se encuentra abre su borde para la calzada de la vía secundaria: a través de la boca, el arcén, el bordillo, la franja y la acera se tienden con la pendiente transversal del carril y se dibujan como pavimento. La vía secundaria se tiende sobre la superficie de la carretera principal donde ambas se solapan, y se suaviza hacia arriba o hacia abajo hasta ella en la aproximación.
- **Dos carreteras que se cruzan** se enlazan de la misma forma por ambos lados. La carretera que aparece primero en Trazados es la carretera principal; la otra sigue su superficie a través del cruce.
- **Una carretera que termina en una plataforma** (dentro de ella, o a menos de aproximadamente la mitad de la anchura de su calzada de su borde) llega a la cota de la plataforma y se suaviza hasta ella en la aproximación.
- **Una senda** (Paisajismo › Pavimentos y obra dura) se detiene en el borde exterior de una carretera, a la cota de la acera o del arcén en ese punto, en lugar de quedar sobre la carretera. Una senda que cruza una carretera se convierte en dos tramos. Un extremo dibujado algo antes de una carretera (a menos del doble de la anchura de la senda) se prolonga hasta su borde.

**Propiedades** indica qué enlazó cada corredor, en cuánto se elevó o rebajó allí y en qué longitud. Esa longitud es el mayor valor entre 10 m (30 ft) y veinte veces el cambio, y nunca más del 45%  del corredor. **El perfil de proyecto no cambia**: la vista de perfil sigue mostrando la línea de rasante que dibujó, mientras que las secciones, la superficie de proyecto, los volúmenes y la vista 3D muestran la carretera tal como queda enlazada. Para que el enlace sea exacto por diseño, mueva el último PIV a la cota que indican las Propiedades.

Desactive el interruptor de un corredor para dejarlo exactamente como indican su perfil y su sección tipo; en ese caso no interviene en ninguna intersección, ni como vía secundaria ni como carretera principal. Las carreteras que se encuentran casi alineadas (con menos de unos 20°) no se modifican, como tampoco las pistas.

Lo que una intersección todavía no hace: no hay radios de bordillo en esquina (las esquinas son rectas), ni carriles de giro ni isletas; el final de la vía secundaria se corta en ángulo recto respecto a su propio trazado; y un corredor construido a partir de plantillas abre su borde de la misma forma sencilla (una cuneta o un muro en su condición final se nivela a través de la boca, sin alcantarilla). Para los radios de bordillo en planta, los triángulos de visibilidad y la señalización horizontal, vea [Suelos, carreteras, topografía, minas y enlaces](topic:soils-roads-survey-mines-links).

## Lo que aún no está disponible

Los objetivos para el talud de encuentro con el terreno aún no están disponibles. Para un corredor que cambia a lo largo de la carretera, con izquierda y derecha separadas, use [Plantillas de corredor](topic:corridor-templates). Vea [Aún no disponible](topic:not-built-yet).
