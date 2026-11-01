---
title: Primeros pasos con CivilCraft
summary: Qué hace CivilCraft, cómo abrirlo y sus primeros diez minutos con el sitio de ejemplo, desde los puntos hasta las curvas de nivel, un camino y un proyecto guardado.
keywords: inicio, primera vez, sitio de ejemplo, introducción, guía rápida, tutorial, comenzar, proyecto nuevo
from: c9b6dd8e
---

CivilCraft es la aplicación de diseño civil y de sitios de la familia CadCraft. Toma puntos topográficos y los convierte en una superficie (una TIN) con curvas de nivel; luego le permite trazar alineaciones con perfiles de proyecto, barrer un corredor de camino sencillo, nivelar plataformas de edificios hasta la línea de talud, revisar una red de tuberías por gravedad contra sus reglas y ver los volúmenes de corte y relleno. Lee y escribe LandXML, exporta el plano como DXF y lo traza a PDF.

Si ha usado Civil 3D, las ideas le resultarán conocidas: puntos, grupos de puntos, líneas de ruptura, alineaciones por PI, perfiles por PIV, obras lineales, nivelación, redes de tuberías. La forma de trabajar es distinta, y mucho más pequeña: no hay línea de comandos, ni estilos, ni archivo de dibujo. Lea una vez [Si viene de otro software civil](topic:coming-from) antes de su primer trabajo real.

## Qué necesita

- Un navegador de escritorio reciente: Chrome, Edge, Firefox o Safari. Vea [Navegadores](common:browsers).
- Un mouse o trackpad y un teclado, o una pantalla táctil: al dibujar hay botones en pantalla {{ui:Terminar}}, {{ui:Deshacer punto}} y {{ui:Cancelar}} (vea [Mouse, trackpad y pantalla táctil](topic:keyboard#mouse-trackpad-and-touch)).
- El plano se dibuja en 2D con el lienzo del navegador. La [vista 3D](topic:site-3d) usa los gráficos WebGL del navegador; si no puede iniciar, la barra de estado dice por qué y el plano sigue funcionando.
- Sin cuenta y sin subir nada. Los archivos se abren en su computadora y se guardan como descargas. Vea [Sus archivos](common:your-files).

:::note
Hoy CivilCraft funciona como una versión temprana en el navegador que aún se está haciendo. Todavía no hay versiones de escritorio ni guardado en la nube. Todo lo que haga permanece en su computadora hasta que lo guarde o lo exporte.
:::

## Abrir CivilCraft

1. Abra CivilCraft en su navegador.
2. Espere a que la pantalla se llene: una barra de herramientas arriba, un panel a la izquierda, el plano al centro y un panel **Propiedades** a la derecha.
3. En un plano vacío verá un cuadro titulado **Empiece con puntos topográficos**. Enumera los primeros pasos y tiene un enlace, {{ui:Abrir el sitio de ejemplo}}.

Para usar CivilCraft más adelante sin conexión, pulse {{ui:Guardar para usar sin conexión}} en la barra de la aplicación y espere a ver {{ui:Lista sin conexión}}. Incluye esta ayuda, el sitio de ejemplo y las bibliotecas 3D y SIG. Vea [Sin conexión](common:offline). Pulse {{key:F1}} o {{ui:Ayuda}} en cualquier momento para abrir esta ayuda junto a la aplicación.

## Sus primeros diez minutos: el sitio de ejemplo

El sitio de ejemplo es un levantamiento pequeño en pies de EE. UU.: 276 puntos en coordenadas de plano estatal, una loma, una hondonada con un eje de drenaje y dos cimas de talud. Viene con la aplicación, así que puede seguir los pasos sin un archivo propio.

1. Pulse {{ui:Abrir el sitio de ejemplo}} en el cuadro del plano.
   Se abre el cuadro **Importar puntos**. Dice "276 points read as PNEZD (from the header row), separated by commas." y muestra las primeras filas.
2. Pulse {{ui:Importar}}.
   El plano se llena de puntos, curvas de nivel y el borde de la superficie. La barra de estado, abajo, indica que se importaron los puntos y cuántos triángulos tiene la superficie (546).
3. Mire el panel izquierdo, bajo **Puntos**. Los puntos están agrupados por la primera palabra de su descripción: CP, FL, GRD, RIDGE, TBN, TBS y TREE.
4. En la columna **Superficie** de esa tabla, ponga **FL**, **RIDGE**, **TBN** y **TBS** en {{ui:Línea de ruptura}}.
   La superficie se reconstruye de inmediato. Los datos de **Superficie** ahora dicen "Breaklines: 4", y las curvas de nivel se quiebran con fuerza a lo largo del eje de drenaje y de la loma en lugar de cruzarlos.
5. Mueva el puntero sobre el plano. La barra de estado muestra el este y el norte bajo el puntero y la elevación del terreno en ese lugar.
6. En **Visualización**, ponga {{ui:Curvas de nivel cada}} en 0.5 ft y active {{ui:Bandas de elevación}}. Aparece una rampa de color con una leyenda bajo las casillas. Vuelva a desactivar las bandas al terminar.

Ya tiene una superficie de terreno existente. Ahora, un camino.

## Trazar un camino corto

1. Pulse {{key:A}} (o {{ui:Alineación}} en el grupo **Diseño**).
2. Haga clic en tres puntos del sitio, uno tras otro. Una línea roja sigue al puntero y muestra la longitud y el rumbo de la siguiente tangente.
3. Pulse {{key:Enter}} para terminar.
   La alineación aparece con su estacionamiento. El panel derecho muestra **Alineación**: su longitud, la tabla de PI y la curva en el PI intermedio (radio de 100 ft, o menor si 100 ft no cabe).
4. En el panel derecho, bajo **Perfil de proyecto**, pulse {{ui:Iniciar desde el terreno}}.
   La vista de perfil se abre bajo el plano con el terreno existente y una rasante de proyecto recta de un extremo al otro.
5. Pulse {{key:I}} para activar {{ui:Agregar PIV}} y haga clic una vez en la vista de perfil, cerca del centro. Aparece un PIV.
6. En la tabla de PIV de la derecha, escriba una longitud de curva (por ejemplo 100) en la casilla **L de curva** del PIV intermedio y pulse {{key:Enter}}. El perfil ahora tiene una curva vertical, con su valor K rotulado.
7. Bajo **Obra lineal**, marque **Barrer una sección tipo a lo largo del perfil de proyecto**.
   El camino se nivela dentro del terreno: carriles, acotamientos y taludes laterales hasta la línea de talud. El bloque **Movimiento de tierras** muestra el corte y el relleno.

No se preocupe por los valores exactos. Cada número se puede cambiar en el panel derecho, y {{key:Mod+Z}} deshace el último cambio.

## Guardar su trabajo

1. Escriba un nombre en **Nombre**, en la parte superior del panel izquierdo.
2. Pulse {{key:Mod+S}} (o {{ui:Guardar}}).
   El navegador descarga un archivo con el nombre del sitio, que termina en `.civilcraft.json`. Contiene los puntos, la configuración de la superficie, alineaciones, perfiles, obras lineales, plataformas y tuberías.
3. Para continuar más tarde, pulse {{ui:Abrir}} (o {{key:Mod+O}}) y elija ese archivo, o suéltelo sobre el plano.

:::warning
No hay guardado automático. Si cierra la pestaña con cambios sin guardar, el navegador pregunta si desea salir; si sale, los cambios se pierden. Guarde con frecuencia.
:::

## A dónde ir después

- [Importar puntos topográficos](topic:import-points) con sus propios archivos.
- [Construir y refinar la superficie](topic:build-surface) con líneas de ruptura y un contorno.
- [La pantalla, parte por parte](topic:workspace).
- [Teclas y mouse](topic:keyboard).
