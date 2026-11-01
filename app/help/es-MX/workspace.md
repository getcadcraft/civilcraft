---
title: La pantalla, parte por parte
summary: Un recorrido por cada barra y panel de CivilCraft según su nombre en pantalla, desde la barra de herramientas hasta la barra de estado.
keywords: interfaz, pantalla, barra de herramientas, paneles, propiedades, barra de estado, vista de perfil, distribución, recorrido, ui
from: 76272010
---

CivilCraft tiene una sola pantalla. No hay pestañas ni presentaciones. Los paneles laterales se pueden mover, dejar flotando o pasar a una ventana propia: vea [Acomodar los paneles y usar un segundo monitor](common:arrange-panels). De arriba abajo y de izquierda a derecha:

- la **barra de la aplicación** (marca de CadCraft, nombre de la aplicación, versión, Acerca de, modo de pantalla, Ayuda, Guardar para usar sin conexión, Papel y Modelo)
- la **barra de herramientas** con siete grupos de botones
- el **panel izquierdo**: Sitio, Puntos, Superficie, Visualización y, una vez que importe alguna, capas SIG
- el **plano** al centro, con la **vista de perfil** debajo cuando está abierta
- el **panel derecho**: Propiedades de lo que está seleccionado
- la **barra de estado** a lo largo de la parte inferior

## Barra de la aplicación

La barra delgada de hasta arriba pertenece al sitio de CadCraft, no a CivilCraft.

- El menú de versión muestra qué compilación está usando.
- {{ui:Acerca de CivilCraft}} abre la página de la aplicación en el sitio.
- {{ui:Pantalla completa}} recorre los modos de pantalla: pantalla completa, luego pantalla completa con las barras ocultas y de nuevo la normal. {{key:Ctrl+Shift+F}} hace lo mismo en todas las plataformas, incluida una Mac (ahí es la tecla Control, no Comando). Con las barras ocultas, mueva el puntero al borde superior para recuperarlas.
- {{ui:Ayuda}} (o {{key:F1}}) abre esta ayuda en un panel lateral; {{key:F1}} o {{key:Esc}} la cierra.
- {{ui:Guardar para usar sin conexión}} conserva CivilCraft en este navegador para que abra sin conexión; luego muestra {{ui:Lista sin conexión}}. Vea [Archivos que puede abrir, guardar y exportar](topic:files#online-and-offline).
- {{ui:Papel}} y {{ui:Modelo}} cambian entre un tema claro y uno oscuro. El plano y el perfil siguen el tema; los PDF siempre se imprimen sobre blanco.

## Barra de herramientas

Cada grupo tiene una pequeña etiqueta sobre sus botones. Pase el puntero sobre un botón para ver su información y su tecla.

| Grupo | Botones | Qué hacen |
|---|---|---|
| Archivo | {{ui:Nuevo}}, {{ui:Abrir}}, {{ui:Guardar}} | Empezar de nuevo, abrir un archivo de puntos, LandXML o un proyecto, guardar el proyecto como descarga |
| Exportar | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Escribir LandXML 1.2, un DXF R12 o un DWG del plano, o trazar el plano a PDF |
| Superficie | {{ui:Línea de ruptura}}, {{ui:Contorno}} | Dibujar una línea de ruptura por puntos topográficos; dibujar el contorno exterior |
| Diseño | {{ui:Alineación}}, {{ui:Plataforma}}, {{ui:Tuberías}}, {{ui:Perfil}} | Dibujar una alineación, una plataforma, un tramo de tuberías; mostrar u ocultar la vista de perfil |
| Edición | {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}}, {{ui:Pegar}}, {{ui:Más}} | Deshacer, rehacer, copiar y pegar puntos topográficos; {{ui:Más}} contiene Cortar, Pegar en el mismo lugar, Duplicar, Eliminar, Seleccionar todos los puntos y No seleccionar nada |
| SIG | {{ui:Coordenadas}}, {{ui:Importar}}, {{ui:Exportar}}, {{ui:Mapa}} | Definir el sistema de coordenadas, importar y exportar archivos SIG, mostrar capas de mapa bajo el plano |
| Vista | {{ui:Seleccionar}}, {{ui:Ajustar}}, {{ui:3D}} | Elegir y mover cosas; hacer zoom para mostrar todo; ver el sitio en 3D ([Ver el sitio en 3D](topic:site-3d)) |

Una herramienta de dibujo queda presionada mientras está activa. Pulsarla otra vez, pulsar {{key:Esc}} o pulsar {{key:V}} regresa a {{ui:Seleccionar}}. {{ui:Deshacer}}, {{ui:Rehacer}}, {{ui:Copiar}} y los elementos de {{ui:Más}} aparecen atenuados cuando no pueden actuar; la información del botón dice por qué (por ejemplo "Select survey points first"). Todos los botones están en [Referencia de la barra de herramientas](topic:toolbar).

En una ventana angosta la barra de herramientas se desplaza hacia los lados.

## Panel izquierdo

### Sitio

- **Nombre**: el nombre del proyecto. Da nombre a cada archivo que guarda o exporta y se imprime en la franja de título del PDF.
- **Unidades**: {{ui:Pies de EE. UU.}} o {{ui:Metros}}. Indica qué significan los números. Cambiarlo **no** convierte las coordenadas; vea [Unidades, estaciones y formatos de número](topic:units-and-stations).

### Puntos

Vacío, le dice cómo abrir un archivo de puntos. Con puntos, muestra el nombre del archivo, el número de puntos y cuántos tienen elevación, y luego una tabla de **grupos de puntos**: una fila por cada primera palabra de la descripción (GRD, FL, TBS …), con un conteo y una opción de **Superficie**:

- {{ui:Puntos}}: los puntos entran en la superficie (lo predeterminado para todos los grupos).
- {{ui:Línea de ruptura}}: los puntos del grupo se unen, en orden de número de punto, en una línea de ruptura.
- {{ui:Omitido}}: el grupo no afecta la superficie.

### Superficie

Datos del terreno existente: puntos, triángulos, elevación mínima y máxima, elevación media, área en 2D y en 3D, líneas de ruptura y si hay contorno. Bajo los datos, un cuadro enumera lo que el generador de la superficie tuvo que corregir o no pudo hacer. Luego:

- **Arista exterior más larga**: 0 conserva todos los triángulos exteriores; un número recorta los triángulos largos y delgados del exterior.
- Enlaces que aparecen cuando aplican: {{ui:Quitar el contorno}}, {{ui:Quitar líneas de ruptura dibujadas}} y, para una superficie leída de LandXML, {{ui:Reconstruir la superficie a partir de los puntos}}.

### Visualización

- **Superficie**: {{ui:Terreno existente}} o {{ui:Proyecto (rasante)}}. La segunda está disponible cuando una plataforma o una obra lineal se nivela sin problemas.
- **Curvas de nivel cada**, **Principales cada** y **Bandas** (el número de bandas de color).
- Casillas: {{ui:Curvas de nivel}}, {{ui:Etiquetas de curvas de nivel}}, {{ui:Triángulos}}, {{ui:Bandas de elevación}}, {{ui:Flechas de pendiente}}, {{ui:Puntos}}, {{ui:Etiquetas de puntos}}, {{ui:Líneas de ruptura}}, {{ui:Borde de superficie}}, {{ui:Tuberías}}.
- Una leyenda de elevaciones de las bandas aparece cuando las bandas están activas.

La configuración de visualización se guarda con el proyecto, pero no son pasos de deshacer: {{key:Mod+Z}} nunca revierte una casilla.

## Plano

El plano muestra los puntos, la superficie y todo lo que diseña, en planta con el norte arriba. Use la rueda para hacer zoom en el puntero y arrastre un espacio vacío para encuadrar. La lista completa está en [Teclas y mouse](topic:keyboard).

- En un proyecto vacío, un cuadro titulado **Empiece con puntos topográficos** enumera los primeros pasos y ofrece {{ui:Abrir el sitio de ejemplo}}.
- Mientras una herramienta de dibujo está activa, una sugerencia en la parte superior del plano dice dónde hacer clic y cómo terminar.
- Al arrastrar un archivo sobre el plano aparece "Drop a point file, LandXML or project".
- Lo seleccionado se resalta. Una alineación o plataforma seleccionada muestra pinzamientos cuadrados en sus PI o esquinas; una estructura seleccionada muestra un pinzamiento. Arrastre un pinzamiento para moverlo.
- Los puntos topográficos seleccionados tienen un anillo. {{key:Shift}} y un clic agrega o quita un punto; {{key:Shift}} y un arrastre dibuja un recuadro (o, si se arrastra alrededor de ellos, un lazo) que agrega los puntos de su interior. Vea [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points).

## Vista de perfil

Pulse {{key:R}} o {{ui:Perfil}} para abrirla bajo el plano. Su barra tiene:

- una lista de alineaciones (habilitada cuando hay dos o más)
- {{ui:Agregar PIV}}: mientras está presionado, un clic en el perfil agrega un PIV ({{key:I}} lo activa y desactiva)
- una lectura de estación, terreno, elevación de proyecto, pendiente y corte o relleno bajo el puntero
- un botón de cierre

El perfil muestra el terreno existente, el perfil de proyecto, las pendientes de cada tangente, la estación y elevación de cada PIV, la L y la K de cada curva vertical con su PCV y PTV, los puntos altos y bajos, y la exageración vertical. Siempre ajusta toda la alineación: no hace zoom ni encuadre. Al mover el puntero a lo largo de él aparece un punto sobre la alineación en el plano.

## Panel derecho: Propiedades

Su encabezado dice qué muestra.

- **Proyecto** (nada seleccionado): las alineaciones y plataformas como enlaces, el bloque **Movimiento de tierras** y el bloque **Red de tuberías** con sus reglas y problemas.
- **Alineación**: nombre, estación inicial, longitud, la tabla de PI, las curvas, la tabla de PIV del perfil de proyecto y sus datos, y la configuración de **Obra lineal**.
- **Plataforma**: nombre, elevación, taludes de corte y relleno, área, datos de la línea de talud y movimiento de tierras.
- **Estructura** o **Tubería**: tamaños, brocales, plantillas, pendiente, cobertura y los problemas que haya.
- **Punto** y su número: las coordenadas, elevación, descripción y grupo del punto (solo lectura).

Los campos surten efecto al pulsar {{key:Enter}} o al salir del campo. Un valor que no se acepta se marca como no válido y no cambia nada.

## Barra de estado

- **E** y **N**: este y norte bajo el puntero.
- Elevación del **Terreno** en ese lugar (y **Rasante** donde una plataforma u obra lineal la cambió), o "Off the surface".
- La alineación más cercana (o la seleccionada) con la **Est** y el desfase (**I** o **D**) bajo el puntero.
- A la derecha, mensajes: lo que acaba de pasar, o por qué se rechazó algo. Un mensaje se borra solo tras unos segundos.

## Cuadros de diálogo

- **Importar puntos**: se abre con cualquier archivo de puntos. Vea [Importar puntos topográficos](topic:import-points).
- **Trazar el plano a PDF**: vea [Trazar el plano a PDF](topic:plot-pdf).
- **Cambios sin guardar**: pregunta antes de que {{ui:Nuevo}} o abrir un proyecto o archivo LandXML descarte el trabajo sin guardar. {{ui:Guardar una copia}} descarga primero el proyecto.

## Pantallas pequeñas

Hasta 760 píxeles de ancho, como en un teléfono, el plano se queda con la pantalla: la barra de herramientas es una sola fila que se desplaza hacia los lados y los paneles se abren como hojas desde una barra en la parte inferior. {{ui:Herramientas}} oculta la barra de herramientas y {{ui:Mover}} la coloca abajo.
