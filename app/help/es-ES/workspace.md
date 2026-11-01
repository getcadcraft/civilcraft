---
title: La pantalla, parte por parte
summary: Un recorrido por cada barra y panel de CivilCraft según su nombre en pantalla, de la barra de herramientas a la barra de estado.
keywords: interfaz, pantalla, barra de herramientas, paneles, propiedades, barra de estado, vista de perfil, disposición, recorrido, ui
from: 76272010
---

CivilCraft tiene una sola pantalla. No hay pestañas ni disposiciones. Los paneles laterales pueden moverse, flotar o pasar a una ventana propia: consulte [Organice los paneles y use un segundo monitor](common:arrange-panels). De arriba abajo y de izquierda a derecha:

- la **barra de la aplicación** (marca de CadCraft, nombre de la aplicación, versión, Acerca de, modo de pantalla, Ayuda, Guardar para uso sin conexión, Papel y Modelo)
- la **barra de herramientas** con siete grupos de botones
- el **panel izquierdo**: Sitio, Puntos, Superficie, Visualización y, cuando importe alguna, Capas SIG
- la **planta** en el centro, con la **vista de perfil** debajo cuando está abierta
- el **panel derecho**: Propiedades de lo seleccionado
- la **barra de estado** a lo largo de la parte inferior

## Barra de la aplicación

La barra fina de la parte más alta pertenece al sitio de CadCraft, no a CivilCraft en sí.

- El menú de versión indica qué compilación está usando.
- {{ui:Acerca de CivilCraft}} abre la página de la aplicación en el sitio.
- {{ui:Pantalla completa}} recorre los modos de pantalla: pantalla completa, después pantalla completa con las barras ocultas y de nuevo normal. {{key:Ctrl+Shift+F}} hace lo mismo en todas las plataformas, también en un Mac (allí es la tecla Control, no Comando). Con las barras ocultas, lleve el puntero al borde superior para recuperarlas.
- {{ui:Ayuda}} (o {{key:F1}}) abre esta ayuda en un panel lateral; {{key:F1}} o {{key:Esc}} la cierra.
- {{ui:Guardar para uso sin conexión}} conserva CivilCraft en este navegador para que se abra sin conexión; después muestra {{ui:Listo sin conexión}}. Consulte [Archivos que puede abrir, guardar y exportar](topic:files#online-and-offline).
- {{ui:Papel}} y {{ui:Modelo}} alternan entre un tema claro y uno oscuro. La planta y el perfil siguen el tema; los PDF siempre se imprimen sobre blanco.

## Barra de herramientas

Cada grupo tiene una pequeña etiqueta sobre sus botones. Sitúe el puntero sobre un botón para ver su información y su tecla.

| Grupo | Botones | Qué hacen |
|---|---|---|
| Archivo | {{ui:Nuevo}}, {{ui:Abrir}}, {{ui:Guardar}} | Empezar de nuevo, abrir un archivo de puntos, LandXML o un proyecto, guardar el proyecto como descarga |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Escribir LandXML 1.2, un DXF R12 o un DWG de la planta, o trazar la planta en PDF |
| Superficie | {{ui:Línea de ruptura}}, {{ui:Contorno}} | Dibujar una línea de ruptura a través de puntos topográficos; dibujar el contorno exterior |
| Diseño | {{ui:Alineación}}, {{ui:Plataforma}}, {{ui:Tuberías}}, {{ui:Perfil}} | Dibujar una alineación, una plataforma, un tramo de tuberías; mostrar u ocultar la vista de perfil |
| Edición | {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}}, {{ui:Pegar}}, {{ui:Más}} | Deshacer, rehacer, copiar y pegar puntos topográficos; {{ui:Más}} contiene Cortar, Pegar en el mismo sitio, Duplicar, Eliminar, Seleccionar todos los puntos y No seleccionar nada |
| SIG | {{ui:Coordenadas}}, {{ui:Importar}}, {{ui:Exportar}}, {{ui:Mapa}} | Fijar el sistema de coordenadas, importar y exportar archivos SIG, mostrar capas de mapa bajo la planta |
| Vista | {{ui:Seleccionar}}, {{ui:Ajustar}}, {{ui:3D}} | Elegir y desplazar elementos; hacer zoom para ver todo; mostrar el sitio en 3D ([Ver el sitio en 3D](topic:site-3d)) |

Una herramienta de dibujo permanece pulsada mientras está activa. Volver a pulsarla, pulsar {{key:Esc}} o pulsar {{key:V}} devuelve a {{ui:Seleccionar}}. {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}} y los elementos de {{ui:Más}} aparecen atenuados cuando no pueden actuar; la información emergente explica el motivo (por ejemplo, "Seleccione primero puntos topográficos"). Todos los botones están enumerados en [Referencia de la barra de herramientas](topic:toolbar).

En una ventana estrecha, la barra de herramientas se desplaza lateralmente.

## Panel izquierdo

### Sitio

- **Nombre**: el nombre del proyecto. Da nombre a cada archivo que guarda o exporta y se imprime en la franja de título del PDF.
- **Unidades**: {{ui:Pies topográficos de EE. UU.}} o {{ui:Metros}}. Indica qué significan los números. Cambiarla **no** convierte las coordenadas; consulte [Unidades, estaciones y formatos de número](topic:units-and-stations).

### Puntos

Vacío, indica cómo abrir un archivo de puntos. Con puntos, muestra el nombre del archivo, el número de puntos y cuántos tienen cota, y después una tabla de **grupos de puntos**: una fila por primera palabra de la descripción (GRD, FL, TBS …), con un recuento y una opción de **Superficie**:

- {{ui:Puntos}}: los puntos entran en la superficie (el valor por defecto de cada grupo).
- {{ui:Línea de ruptura}}: los puntos del grupo se unen, por orden de número de punto, en una línea de ruptura.
- {{ui:Omitido}}: el grupo no interviene en la superficie.

### Superficie

Datos del terreno existente: puntos, triángulos, cota mínima y máxima, cota media, área en 2D y en 3D, líneas de ruptura y si hay contorno. Bajo los datos, un cuadro enumera todo lo que el generador de la superficie tuvo que corregir o no pudo hacer. Después:

- **Arista exterior más larga**: 0 conserva todos los triángulos exteriores; un número recorta los triángulos largos y delgados del exterior.
- Enlaces que aparecen cuando son aplicables: {{ui:Quitar el contorno}}, {{ui:Quitar líneas de ruptura dibujadas}} y, para una superficie leída de LandXML, {{ui:Reconstruir la superficie a partir de los puntos}}.

### Visualización

- **Superficie**: {{ui:Terreno natural}} o {{ui:Proyecto (rasante)}}. La segunda está disponible cuando una plataforma o una obra lineal se explana sin problemas.
- **Curvas de nivel cada**, **Principales cada** y **Bandas** (el número de bandas de color).
- Casillas: {{ui:Curvas de nivel}}, {{ui:Etiquetas de curvas de nivel}}, {{ui:Triángulos}}, {{ui:Bandas de elevación}}, {{ui:Flechas de pendiente}}, {{ui:Puntos}}, {{ui:Etiquetas de puntos}}, {{ui:Líneas de ruptura}}, {{ui:Borde de la superficie}}, {{ui:Tuberías}}.
- Aparece una leyenda de elevaciones de las bandas cuando las bandas están activadas.

Los ajustes de visualización se guardan con el proyecto, pero no son pasos de deshacer: {{key:Mod+Z}} nunca desmarca una casilla.

## Planta

La planta muestra los puntos, la superficie y todo lo que diseña, en vista en planta con el norte arriba. Con la rueda se hace zoom en el puntero y arrastrando por un espacio vacío se desplaza la vista. La lista completa está en [Teclas y ratón](topic:keyboard).

- En un proyecto vacío, un cuadro titulado **Empiece con puntos topográficos** enumera los primeros pasos y ofrece {{ui:Abrir el sitio de ejemplo}}.
- Mientras una herramienta de dibujo está activa, una indicación en la parte superior de la planta dice dónde hacer clic y cómo terminar.
- Al arrastrar un archivo sobre la planta se muestra "Suelte un archivo de puntos, LandXML o un proyecto".
- Los elementos seleccionados se resaltan. Una alineación o plataforma seleccionada muestra pinzamientos cuadrados en sus PI o esquinas; una estructura seleccionada muestra un pinzamiento. Arrastre un pinzamiento para moverlo.
- Los puntos topográficos seleccionados tienen un anillo. {{key:Shift}} y un clic añaden o quitan un punto; {{key:Shift}} y un arrastre dibujan un rectángulo (o, si se rodean, un lazo) que añade los puntos que contiene. Consulte [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points).

## Vista de perfil

Pulse {{key:R}} o {{ui:Perfil}} para abrirla bajo la planta. Su barra tiene:

- una lista de alineaciones (activa cuando hay dos o más alineaciones)
- {{ui:Añadir PIV}}: mientras está pulsado, un clic en el perfil añade un PIV ({{key:I}} lo activa y desactiva)
- una lectura de estación, terreno, cota de proyecto, pendiente y desmonte o terraplén bajo el puntero
- un botón de cierre

El perfil muestra el terreno existente, el perfil de proyecto, las pendientes de cada tangente, la estación y la cota de cada PIV, la L y la K de cada curva vertical con su PCV y su PTV, los puntos altos y bajos, y la exageración vertical. Siempre se ajusta a toda la alineación: no hace zoom ni se desplaza. Al mover el puntero a lo largo de él aparece un punto sobre la alineación en la planta.

## Panel derecho: Propiedades

Su encabezado indica lo que muestra.

- **Proyecto** (nada seleccionado): las alineaciones y las plataformas como enlaces, el bloque **Movimiento de tierras** y el bloque **Red de tuberías** con sus reglas y problemas.
- **Alineación**: nombre, estación inicial, longitud, la tabla de PI, las curvas, la tabla de PIV y los datos del perfil de proyecto, y los ajustes de **Obra lineal**.
- **Plataforma**: nombre, cota, taludes de desmonte y terraplén, área, datos de la línea de ceros y movimiento de tierras.
- **Estructura** o **Tubería**: dimensiones, cotas de tapa, cotas de fondo, pendiente, recubrimiento y los problemas que tenga.
- **Punto** y su número: las coordenadas, la cota, la descripción y el grupo del punto (solo lectura).

Los campos surten efecto al pulsar {{key:Enter}} o al salir del campo. Un valor que no se acepta se marca como no válido y no cambia nada.

## Barra de estado

- **E** y **N**: coordenada Este y Norte bajo el puntero.
- Cota del **Terreno** en ese punto (y **Rasante** donde una plataforma o una obra lineal la modificó), o "Fuera de la superficie".
- La alineación más cercana (o la seleccionada) con la **Est** y el desfase (**I** o **D**) bajo el puntero.
- A la derecha, mensajes: lo que acaba de ocurrir o el motivo por el que algo se rechazó. Un mensaje desaparece solo al cabo de unos segundos.

## Cuadros de diálogo

- **Importar puntos**: se abre con cada archivo de puntos. Consulte [Importar puntos topográficos](topic:import-points).
- **Trazar la planta en PDF**: consulte [Trazar la planta en PDF](topic:plot-pdf).
- **Cambios sin guardar**: pregunta antes de que {{ui:Nuevo}} o abrir un proyecto o un archivo LandXML descarte el trabajo sin guardar. {{ui:Guardar una copia}} descarga antes el proyecto.

## Pantallas pequeñas

Hasta 760 píxeles de ancho, como en un teléfono, la planta ocupa la pantalla: la barra de herramientas es una sola fila que se desplaza lateralmente y los paneles se abren como hojas desde una barra en la parte inferior. {{ui:Herramientas}} oculta la barra de herramientas y {{ui:Mover}} la coloca abajo.
