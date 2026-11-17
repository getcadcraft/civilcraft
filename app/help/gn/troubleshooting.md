---
title: Solución de problemas
summary: Síntomas, causas y soluciones para los problemas que se encuentran en CivilCraft, con los mensajes exactos que muestra la aplicación.
keywords: problemas, errores, no funciona, solución, ayuda, mensajes, solucionar, rechazado, falta, incorrecto, intercambiado, faltan curvas de nivel
from: a9f7dedc
---

Los mensajes aparecen en la barra de estado abajo a la derecha, en cuadros de los paneles izquierdo y derecho, y en los diálogos. Se citan aquí tal como los muestra la aplicación.

## Abrir archivos

**"Ese archivo pesa más de 200 MB; CivilCraft todavía no abre archivos tan grandes."**
Dividí el archivo de puntos, o reducí los datos antes de abrirlo.

**"No se pudo abrir site.json: Este no es un archivo de proyecto de CivilCraft."**
El archivo termina en `.json` o empieza con `{`, pero no es un proyecto de CivilCraft. Los archivos de puntos no deben empezar con `{`.

**"No se pudo abrir … Este archivo de proyecto es de un CivilCraft más nuevo (versión 2)."**
El proyecto fue guardado con una versión más nueva. Abrilo ahí, o exportá LandXML desde ahí.

**"No se pudo abrir … Esto es XML pero no LandXML (su elemento raíz es <…>)."**
El archivo es otro tipo de XML. Exportá LandXML desde el otro programa.

**"… no tiene puntos, superficies TIN ni trazados que CivilCraft pueda leer."**
Todo lo que hay en el archivo es algo que CivilCraft omite (por ejemplo, solo superficies de grilla, o solo trazados en espiral). El resto del mensaje dice qué había. Ver [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

**"No se pudo cargar el ejemplo: …"**
{{ui:Open the sample site}} lee un archivo del sitio de CadCraft. Sin conexión funciona solo si CivilCraft fue guardado para uso sin conexión (el botón de la barra de la aplicación muestra {{ui:Offline ready}}). Conectate, hacé clic en {{ui:Save for offline}}, y desde entonces funciona sin conexión. Ver [Sin conexión](common:offline).

**{{ui:Save for offline}} muestra {{ui:Could not save}}.**
Algunos archivos no se descargaron. Revisá la conexión y hacé clic en el botón otra vez.

**{{ui:Save for offline}} muestra {{ui:Offline not available}}.**
Esta ventana del navegador no puede guardar una copia sin conexión, generalmente porque es una ventana privada o la computadora está administrada. Abrí CivilCraft en una ventana normal.

**Sin conexión, la aplicación no se abre para nada.**
No fue guardada para uso sin conexión en este navegador, o el navegador borró sus datos del sitio (Safari hace esto con los sitios que no se visitan durante varias semanas). Conectate, abrí CivilCraft y hacé clic en {{ui:Save for offline}}.

**La copia sin conexión es de una versión anterior.**
Hacé clic en {{ui:Offline ready}}, y después en {{ui:Save again (get the newest version)}} estando conectado.

**Un archivo aparece en gris en el cuadro de abrir.**
El cuadro solo lista archivos de puntos, LandXML y de proyecto según sus terminaciones. Arrastrá el archivo sobre el plano, o cambiale el nombre a `.txt`.

## Importar puntos

**"No se pudo leer ningún punto de este archivo."**
Elegí el orden de las columnas a mano en **Columnas**. Si nada funciona, abrí el archivo en un editor de texto y verificá que tenga un punto por línea, con números.

**El sitio se ve espejado, rotado o estirado en una línea.**
El norte y el este están intercambiados. El resumen decía "adivinado por la cantidad de columnas". Elegí PENZD en lugar de PNEZD (o al revés) en **Columnas**, o importá otra vez.

**Puntos muy lejos del resto, y el plano alejado hasta un punto.**
Una fila tiene un error de tipeo en una coordenada, o el archivo mezcla sistemas de coordenadas. Buscá el punto (hacé clic para ver su número) y corregí el archivo.

**Filas listadas en "Filas no leídas".**
Ver la tabla en [Importar puntos de relevamiento](topic:import-points#rows-that-are-not-read).

**Mis puntos anteriores desaparecieron.**
Importar un archivo de puntos reemplaza todos los puntos y borra el deshacer. Abrí tu proyecto guardado para recuperarlos.

## La superficie

**"Superficie: No construida" con un cuadro rojo.**
El cuadro dice por qué: "Una superficie necesita al menos tres puntos con cotas.", "Los puntos están todos sobre una línea: no hay triángulos.", "No hay puntos con cotas.", "El límite no se superpone con los puntos." o "No quedan triángulos dentro del límite." Revisá el orden de las columnas, los grupos de puntos (¿están en {{ui:Left out}}?) y el límite.

**Las curvas de nivel cruzan en línea recta una zanja o una loma.**
Esa línea no es una línea de quiebre. Poné su grupo en {{ui:Breakline}}, o dibujala con la herramienta {{ui:Breakline}}. Ver [Construir y refinar la superficie](topic:build-surface).

**Un grupo de línea de quiebre dibuja un zigzag.**
El grupo tiene más de una línea, o sus puntos no están numerados a lo largo de la línea. Volvé el grupo a {{ui:Points}} y dibujá cada línea con la herramienta {{ui:Breakline}}.

**Triángulos largos y finos por el borde exterior.**
Dibujá un límite ({{key:O}}) o configurá **Longest outside edge**.

**No hay curvas de nivel, aunque la superficie esté construida.**
O {{ui:Contours}} está desactivado en **Display**, o el intervalo es tan chico que habría más de 2,000 niveles de curvas. Elegí un intervalo mayor.

**Las líneas de quiebre o un límite no cambian nada.**
La superficie vino de LandXML ("Superficie (desde LandXML)"). Se usa tal cual. Hacé clic en {{ui:Rebuild the surface from the points}} para construirla desde los puntos.

**"Todavía no hay superficie: abrí primero los puntos de relevamiento."**
La línea de quiebre, el límite y la plataforma necesitan una superficie de terreno existente. Importá primero los puntos.

**"Hacé clic en un punto de relevamiento con cota: una línea de quiebre toma las cotas de los puntos."**
La herramienta {{ui:Breakline}} solo elige puntos de relevamiento. Acercate y hacé clic en un punto (un cuadrado naranja muestra cuál tomará).

## Dibujo

**Mi último punto desapareció cuando hice doble clic para terminar.**
En esta versión, el doble clic termina el trazado, la plataforma, la línea de quiebre o el límite, pero descarta el punto en el que hiciste doble clic. Hacé clic una vez en el último punto y presioná {{key:Enter}}. Usá {{key:Mod+Z}} si ya pasó, y después dibujá otra vez.

**No puedo terminar un dibujo en una tableta.**
Para terminar hace falta {{key:Enter}}; todavía no hay botón en pantalla. Conectá un teclado. Ver [Ratón, trackpad y toque](topic:keyboard#mouse-trackpad-and-touch).

**Arrastrar para colocar un punto desplaza la vista.**
Un arrastre de más de unos pocos píxeles desplaza el plano en todas las herramientas. Hacé clic sin moverte.

**"Un trazado necesita al menos dos puntos." / "Una plataforma necesita al menos tres esquinas." / "Un tramo de caños necesita al menos dos estructuras."**
Presionaste {{key:Enter}} demasiado pronto. El dibujo se descarta; empezá de nuevo.

**Las teclas como A o G no hacen nada.**
Un cuadro de texto o una lista del panel todavía tiene el foco, así que las letras van ahí. Hacé clic una vez en el plano y después presioná la tecla. En una Mac, la tecla de borrar es Backspace para el navegador: usá Fn y suprimir para borrar una selección.

## Trazados y perfiles

**"Las curvas en PI 2 y PI 3 se superponen: … Usá radios más chicos."**
Dos curvas necesitan más tangente de la que hay entre sus PI. Bajá uno o ambos radios en la tabla de PI, o alejá los PI.

**"El PI 3 da vuelta en seco; no puede llevar una curva."**
El trazado vuelve sobre sí mismo en ese PI. Mové o quitá el PI.

**"Este trazado no tiene terreno debajo desde donde empezar."**
El trazado está fuera de la superficie. Movelo sobre la superficie, o agregá PVI haciendo clic con {{ui:Add PVIs}} activado.

**"La curva vertical en PVI 3 (L = …) empieza antes de que termine la curva o el PVI anterior." / "… pasa del siguiente PVI."**
Acortá la longitud de la curva o alejá los PVI.

**"Ya hay un PVI en …"**
Hay un PVI en esa progresiva. Hacé clic en otro lugar, o arrastrá el existente.

**La vista de perfil está vacía: "Dibujá un trazado para ver su perfil."**
No hay trazado, o el seleccionado tiene errores.

## Corredores y plataformas

**"El corredor necesita un perfil de diseño sin errores."**
Empezá un perfil de diseño ({{ui:Start from the ground}}) y corregí las superposiciones de curvas.

**"… los taludes laterales salen de la superficie antes de encontrar el terreno." / "… las líneas de talud salen de la superficie antes de encontrarla …"**
El movimiento de suelo llega al borde de la superficie antes de encontrar el terreno. Alejá el diseño del borde, o acercalo al terreno. Una plataforma nueva dibujada en parte fuera de la superficie puede empezar en cota 0: ingresá una cota real.

**"Las líneas de intersección del corredor cruzan …" / "La línea de intersección se cruza a sí misma …"**
Los taludes de lados distintos chocan entre sí: curvas cerradas, plataformas angostas, cortes profundos o rellenos altos. Usá un radio mayor, un conjunto más angosto, una plataforma más ancha o taludes más empinados.

**"Todavía no hay volúmenes: una plataforma necesita hacer movimiento de suelo sin problemas."**
Corregí los problemas listados en el cuadro rojo de arriba.

**{{ui:Proposed (graded)}} aparece en gris.**
Todavía ninguna plataforma o corredor tiene movimiento de suelo.

## Caños

**"P2 todavía no tiene cotas de fondo."**
Hacé clic en {{ui:Set its inverts from the rules}} o ingresá las cotas de fondo.

**"P1: no hay terreno en S1 desde donde empezar."**
La estructura aguas arriba está fuera de la superficie y no tiene brocal. Ingresá un brocal para ella.

**Todos los caños quedan marcados después de mover una estructura.**
Mover una estructura no cambia las cotas de fondo. Hacé clic en {{ui:Set every invert from the rules}}.

Todos los mensajes de la red se explican en [Trazar una red de caños por gravedad](topic:pipe-network#read-and-fix-problems).

## Guardar y exportar

**"Todavía no hay nada para exportar." / "Todavía no hay nada para imprimir."**
El proyecto está vacío. Importá primero los puntos.

**No encuentro el archivo guardado.**
Está en las descargas del navegador (generalmente la carpeta Descargas). Ver [Archivos que podés abrir, guardar y exportar](topic:files#where-the-files-go).

**La escala del PDF está mal en el papel.**
Imprimí al 100% o en tamaño real, no con "ajustar a la página".

**Signos de interrogación en el texto del PDF.**
Los nombres o descripciones usan caracteres fuera del conjunto de Europa occidental. El mensaje de estado los cuenta. Renombralos con caracteres simples.

**La impresión queda cortada en los bordes.**
La escala es demasiado grande para la hoja. Elegí la escala marcada "(entra)", una hoja más grande, o {{ui:What is on screen}}.

**{{key:Mod+P}} abrió el diálogo de impresión del navegador.**
La página no tenía el foco. Cerrá el diálogo, hacé clic en el plano y presioná {{key:Mod+P}} otra vez, o hacé clic en {{ui:PDF}}.

## La aplicación en sí

**La pantalla está en blanco o la barra de herramientas no hace nada.**
Usá una versión actual de Chrome, Edge, Firefox o Safari, y recargá. Ver [Navegadores](common:browsers).

**La aplicación va lenta con un archivo de puntos grande.**
Desactivá {{ui:Triangles}}, {{ui:Point labels}} y {{ui:Elevation bands}}, y usá un intervalo de curvas de nivel mayor. Las superficies muy grandes tardan un momento en reconstruirse después de cada cambio.

**El navegador pregunta "¿Salir del sitio?"**
El proyecto tiene cambios sin guardar. Quedate, guardá con {{key:Mod+S}} y después salí.
