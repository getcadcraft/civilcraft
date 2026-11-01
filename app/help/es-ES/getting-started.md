---
title: Primeros pasos con CivilCraft
summary: Qué hace CivilCraft, cómo abrirlo y los primeros diez minutos con el sitio de ejemplo, de los puntos a las curvas de nivel, una carretera y un proyecto guardado.
keywords: inicio, primer uso, sitio de ejemplo, introducción, inicio rápido, tutorial, empezar, nuevo proyecto
from: c9b6dd8e
---

CivilCraft es la aplicación de diseño civil y de emplazamientos de la familia CadCraft. Toma puntos topográficos y los convierte en una superficie (una TIN) con curvas de nivel; después le permite trazar alineaciones con perfiles de proyecto, barrer un corredor de carretera sencillo, explanar plataformas de edificios hasta la línea de ceros, comprobar una red de tuberías por gravedad con sus reglas y ver los volúmenes de desmonte y terraplén. Lee y escribe LandXML, exporta la planta como DXF y la traza en PDF.

Si ha usado Civil 3D, las ideas le resultarán familiares: puntos, grupos de puntos, líneas de ruptura, alineaciones por PI, perfiles por PIV, obras lineales, explanación, redes de tuberías. La forma de trabajar es distinta, y mucho más reducida: no hay línea de comandos, ni estilos, ni archivo de dibujo. Lea [Si viene de otro programa de ingeniería civil](topic:coming-from) una vez antes de su primer trabajo real.

## Qué necesita

- Un navegador de escritorio reciente: Chrome, Edge, Firefox o Safari. Consulte [Navegadores](common:browsers).
- Un ratón o trackpad y un teclado, o una pantalla táctil: al dibujar, en ella hay botones en pantalla {{ui:Terminar}}, {{ui:Deshacer punto}} y {{ui:Cancelar}} (consulte [Ratón, trackpad y pantalla táctil](topic:keyboard#mouse-trackpad-and-touch)).
- La planta se dibuja en 2D con el lienzo del navegador. La [vista 3D](topic:site-3d) usa los gráficos WebGL del navegador; si no puede iniciarse, la barra de estado explica el motivo y la planta sigue funcionando.
- Sin cuenta y sin subir nada. Los archivos se abren en su ordenador y se guardan como descargas. Consulte [Sus archivos](common:your-files).

:::note
CivilCraft funciona hoy como una versión temprana en el navegador que aún se está desarrollando. Todavía no hay versiones de escritorio, y el guardado en la nube aún no está disponible. Todo lo que haga permanece en su ordenador hasta que lo guarde o lo exporte.
:::

## Abrir CivilCraft

1. Abra CivilCraft en su navegador.
2. Espere a que se rellene la pantalla: una barra de herramientas arriba, un panel a la izquierda, la planta en el centro y un panel **Propiedades** a la derecha.
3. En una planta vacía verá un cuadro titulado **Empiece con puntos topográficos**. Enumera los primeros pasos y tiene un enlace, {{ui:Abrir el sitio de ejemplo}}.

Para usar CivilCraft más adelante sin conexión, pulse {{ui:Guardar para uso sin conexión}} en la barra de la aplicación y espere a que aparezca {{ui:Listo sin conexión}}. Incluye esta ayuda, el sitio de ejemplo y las bibliotecas 3D y GIS. Consulte [Sin conexión](common:offline). Pulse {{key:F1}} o {{ui:Ayuda}} en cualquier momento para abrir esta ayuda junto a la aplicación.

## Sus primeros diez minutos: el sitio de ejemplo

El sitio de ejemplo es un pequeño levantamiento en pies de EE. UU.: 276 puntos en coordenadas de plano estatal, una loma, una vaguada con una línea de flujo y dos coronaciones de talud. Viene con la aplicación, de modo que puede seguir los pasos sin un archivo propio.

1. Pulse {{ui:Abrir el sitio de ejemplo}} en el cuadro de la planta.
   Se abre el cuadro de diálogo **Importar puntos**. Indica "276 puntos leídos como PNEZD (de la fila de encabezado), separados por comas." y muestra las primeras filas.
2. Pulse {{ui:Importar}}.
   La planta se llena de puntos, curvas de nivel y el borde de la superficie. La barra de estado, abajo, indica que los puntos se han importado y cuántos triángulos tiene la superficie (546).
3. Mire el panel izquierdo, en **Puntos**. Los puntos están agrupados por la primera palabra de su descripción: CP, FL, GRD, RIDGE, TBN, TBS y TREE.
4. En la columna **Superficie** de esa tabla, ponga **FL**, **RIDGE**, **TBN** y **TBS** en {{ui:Línea de ruptura}}.
   La superficie se reconstruye al instante. Los datos de **Superficie** indican ahora "Líneas de ruptura: 4", y las curvas de nivel se quiebran con nitidez a lo largo de la línea de flujo y de la loma, en lugar de cortarlas en diagonal.
5. Mueva el puntero sobre la planta. La barra de estado muestra la coordenada Este y la Norte bajo el puntero y la cota del terreno en ese punto.
6. En **Visualización**, ponga {{ui:Curvas de nivel cada}} en 0.5 ft y active {{ui:Bandas de elevación}}. Aparece una rampa de colores con una leyenda bajo las casillas. Desactive las bandas cuando termine.

Ya tiene una superficie de terreno existente. A continuación, una carretera.

## Trazar una carretera corta

1. Pulse {{key:A}} (o pulse {{ui:Alineación}} en el grupo **Diseño**).
2. Haga clic en tres puntos del sitio, uno tras otro. Una línea roja sigue al puntero y muestra la longitud y el rumbo de la siguiente tangente.
3. Pulse {{key:Enter}} para terminar.
   La alineación aparece con su estacionado. El panel derecho muestra **Alineación**: su longitud, la tabla de PI y la curva del PI central (radio de 100 ft, o menor si 100 ft no cabe).
4. En el panel derecho, en **Perfil de proyecto**, pulse {{ui:Iniciar desde el terreno}}.
   La vista de perfil se abre bajo la planta con el terreno existente y una rasante de proyecto recta de un extremo a otro.
5. Pulse {{key:I}} para activar {{ui:Añadir PIV}} y haga clic una vez en la vista de perfil, cerca del centro. Aparece un PIV.
6. En la tabla de PIV de la derecha, escriba una longitud de curva (por ejemplo, 100) en el cuadro **L de curva** del PIV central y pulse {{key:Enter}}. El perfil tiene ahora una curva vertical, con su valor K rotulado.
7. En **Obra lineal**, marque **Barrer una sección tipo a lo largo del perfil de proyecto**.
   La carretera se explana sobre el terreno: carriles, arcenes y taludes laterales hasta la línea de ceros. El bloque **Movimiento de tierras** muestra el desmonte y el terraplén.

No se preocupe por los valores exactos. Todos los números se pueden cambiar en el panel derecho, y {{key:Mod+Z}} deshace el último cambio.

## Guardar su trabajo

1. Escriba un nombre en **Nombre**, en la parte superior del panel izquierdo.
2. Pulse {{key:Mod+S}} (o pulse {{ui:Guardar}}).
   El navegador descarga un archivo con el nombre del sitio y la terminación `.civilcraft.json`. Contiene los puntos, los ajustes de la superficie, las alineaciones, los perfiles, las obras lineales, las plataformas y las tuberías.
3. Para continuar más tarde, pulse {{ui:Abrir}} (o pulse {{key:Mod+O}}) y elija ese archivo, o suéltelo sobre la planta.

:::warning
No hay guardado automático. Si cierra la pestaña con cambios sin guardar, el navegador le pregunta si desea salir; si sale, los cambios se pierden. Guarde a menudo.
:::

## Adónde ir después

- [Importe puntos topográficos](topic:import-points) con sus propios archivos.
- [Construya y refine la superficie](topic:build-surface) con líneas de ruptura y un contorno.
- [La pantalla, parte por parte](topic:workspace).
- [Teclas y ratón](topic:keyboard).
