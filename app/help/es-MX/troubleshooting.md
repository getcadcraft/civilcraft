---
title: Solución de problemas
summary: Síntomas, causas y soluciones de los problemas que se presentan en CivilCraft, con los mensajes exactos que muestra la aplicación.
keywords: problemas, errores, no funciona, solucionar, ayuda, mensajes, solucionar problemas, rechazado, faltante, incorrecto, intercambiado, curvas de nivel faltantes
from: a9f7dedc
---

Los mensajes aparecen en la barra de estado, abajo a la derecha, en recuadros de los paneles izquierdo y derecho, y en los cuadros de diálogo. Aquí se citan tal como los muestra la aplicación.

## Abrir archivos

**"Ese archivo supera los 200 MB; CivilCraft todavía no abre archivos tan grandes."**
Divida el archivo de puntos, o reduzca los datos antes de abrirlo.

**"No se pudo abrir site.json: Este no es un archivo de proyecto de CivilCraft."**
El archivo termina en `.json` o empieza con `{`, pero no es un proyecto de CivilCraft. Los archivos de puntos no deben empezar con `{`.

**"No se pudo abrir … Este archivo de proyecto es de una versión más reciente de CivilCraft (versión 2)."**
El proyecto se guardó con una versión más reciente. Ábralo allí, o exporte LandXML desde él.

**"No se pudo abrir … Es XML, pero no LandXML (su elemento raíz es <…>)."**
El archivo es otro tipo de XML. Exporte LandXML desde el otro programa.

**"… no tiene puntos, superficies TIN ni alineaciones que CivilCraft pueda leer."**
CivilCraft omite todo lo que contiene el archivo (por ejemplo, solo superficies de cuadrícula, o solo alineaciones espirales). El resto del mensaje indica qué había. Consulte [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

**"No se pudo cargar el ejemplo: …"**
{{ui:Abrir el sitio de ejemplo}} lee un archivo del sitio de CadCraft. Sin conexión solo funciona si CivilCraft se guardó para uso sin conexión (el botón de la barra de la aplicación muestra {{ui:Lista sin conexión}}). Conéctese, haga clic en {{ui:Guardar para usar sin conexión}} y desde entonces funcionará sin conexión. Consulte [Sin conexión](common:offline).

**{{ui:Guardar para usar sin conexión}} muestra {{ui:No se pudo guardar}}.**
Algunos archivos no se descargaron. Revise la conexión y haga clic otra vez en el botón.

**{{ui:Guardar para usar sin conexión}} muestra {{ui:Sin conexión no disponible}}.**
Esta ventana del navegador no puede guardar una copia sin conexión, normalmente porque es una ventana privada o el equipo está administrado. Abra CivilCraft en una ventana normal.

**Sin conexión, la aplicación no se abre en absoluto.**
No se guardó para uso sin conexión en este navegador, o el navegador borró los datos del sitio (Safari hace esto con los sitios que no se visitan durante varias semanas). Conéctese, abra CivilCraft y haga clic en {{ui:Guardar para usar sin conexión}}.

**La copia sin conexión es una versión anterior.**
Haga clic en {{ui:Lista sin conexión}} y luego en {{ui:Guardar de nuevo (obtener la versión más reciente)}} mientras esté conectado.

**Un archivo aparece atenuado en el cuadro de abrir.**
El cuadro solo muestra archivos de puntos, LandXML y de proyecto según su extensión. Arrastre el archivo al plano en su lugar, o cambie su nombre a `.txt`.

## Importar puntos

**"No se pudo leer ningún punto de este archivo."**
Elija a mano el orden de las columnas en **Columnas**. Si nada funciona, abra el archivo en un editor de texto y compruebe que haya un punto por línea con números.

**El sitio se ve reflejado, girado o estirado hasta formar una línea.**
El norte y el este están intercambiados. El resumen decía "adivinado por el número de columnas". Elija PENZD en lugar de PNEZD (o al revés) en **Columnas**, o vuelva a importar.

**Puntos muy alejados del resto, y el plano alejado hasta ser un punto.**
Una fila tiene un error de escritura en una coordenada, o el archivo mezcla sistemas de coordenadas. Ubique el punto (haga clic en él para ver su número) y corrija el archivo.

**Filas enumeradas en "Filas no leídas".**
Consulte la tabla en [Importar puntos de levantamiento](topic:import-points#rows-that-are-not-read).

**Mis puntos anteriores desaparecieron.**
Importar un archivo de puntos reemplaza todos los puntos y borra el historial de deshacer. Abra su proyecto guardado para recuperarlos.

## La superficie

**"Superficie: no construida" con un recuadro rojo.**
El recuadro indica el motivo: "Una superficie necesita al menos tres puntos con elevaciones.", "Los puntos están todos en una línea: no hay triángulos.", "No hay puntos con elevaciones.", "El límite no se superpone a los puntos." o "No quedan triángulos dentro del límite." Revise el orden de las columnas, los grupos de puntos (¿están en {{ui:Omitido}}?) y el límite.

**Las curvas de nivel cruzan en línea recta una zanja o una cresta.**
Esa línea no es una línea de ruptura. Asigne su grupo a {{ui:Línea de ruptura}}, o dibújela con la herramienta {{ui:Línea de ruptura}}. Consulte [Construir y refinar la superficie](topic:build-surface).

**Un grupo de línea de ruptura dibuja un zigzag.**
El grupo contiene más de una línea, o sus puntos no están numerados a lo largo de la línea. Vuelva a asignar el grupo a {{ui:Puntos}} y dibuje cada línea con la herramienta {{ui:Línea de ruptura}}.

**Triángulos largos y delgados en el exterior.**
Dibuje un límite ({{key:O}}) o defina **Arista exterior más larga**.

**No hay curvas de nivel, aunque la superficie esté construida.**
O bien {{ui:Curvas de nivel}} está desactivado en **Visualización**, o el intervalo es tan pequeño que habría más de 2,000 niveles de curvas. Elija un intervalo mayor.

**Las líneas de ruptura o un límite no cambian nada.**
La superficie viene de LandXML ("Superficie (de LandXML)"). Se usa tal como está. Haga clic en {{ui:Reconstruir la superficie a partir de los puntos}} para construirla a partir de los puntos.

**"Todavía no hay superficie: primero abra los puntos de levantamiento."**
La línea de ruptura, el límite y la plataforma necesitan una superficie de terreno existente. Importe primero los puntos.

**"Haga clic en un punto de levantamiento con elevación: una línea de ruptura toma las elevaciones de los puntos."**
La herramienta {{ui:Línea de ruptura}} solo elige puntos de levantamiento. Acerque y haga clic en un punto (un cuadrado naranja muestra el que tomará).

## Dibujo

**Mi último punto desapareció al hacer doble clic para terminar.**
En esta versión, el doble clic termina la alineación, la plataforma, la línea de ruptura o el límite, pero descarta el punto en el que hizo doble clic. Haga clic una vez en el último punto y pulse {{key:Enter}}. Si ya ocurrió, use {{key:Mod+Z}} y vuelva a dibujar.

**No puedo terminar un dibujo en una tableta.**
Para terminar se necesita {{key:Enter}}; todavía no hay un botón en pantalla. Conecte un teclado. Consulte [Ratón, panel táctil y pantalla táctil](topic:keyboard#mouse-trackpad-and-touch).

**Al arrastrar para colocar un punto, en su lugar se desplaza la vista.**
Un arrastre de más de unos pocos píxeles desplaza el plano en todas las herramientas. Haga clic sin mover el puntero.

**"Una alineación necesita al menos dos puntos." / "Una plataforma necesita al menos tres esquinas." / "Un tramo de tubería necesita al menos dos estructuras."**
Pulsó {{key:Enter}} demasiado pronto. El dibujo se descarta; comience de nuevo.

**Las teclas como A o G no hacen nada.**
Un cuadro de texto o una lista de un panel todavía tiene el foco, así que las letras van a ese control. Haga clic una vez en el plano y luego pulse la tecla. En un Mac, la tecla delete envía Backspace al navegador: use Fn y delete para borrar una selección.

## Alineaciones y perfiles

**"Las curvas en PI 2 y PI 3 se superponen: … Use radios menores."**
Dos curvas necesitan más tangente de la que hay entre sus PI. Reduzca uno o ambos radios en la tabla de PI, o separe los PI.

**"El PI 3 regresa sobre sí mismo; no admite una curva."**
La alineación retrocede sobre sí misma en ese PI. Mueva o elimine el PI.

**"Esta alineación no tiene terreno debajo desde el cual empezar."**
La alineación está fuera de la superficie. Muévala sobre la superficie, o agregue PIV haciendo clic con {{ui:Agregar PIV}} activado.

**"La curva vertical en el PIV 3 (L = …) empieza antes de que termine la curva o el PIV anterior." / "… pasa del siguiente PIV."**
Acorte la longitud de la curva o separe los PIV.

**"Ya hay un PIV en …"**
Ya existe un PIV en esa estación. Haga clic en otro lugar, o arrastre el existente.

**La vista de perfil está vacía: "Dibuje una alineación para ver su perfil."**
No hay alineación, o la seleccionada tiene errores.

## Obras lineales y plataformas

**"La obra lineal necesita un perfil de diseño sin errores."**
Inicie un perfil de diseño ({{ui:Iniciar desde el terreno}}) y corrija cualquier superposición de curvas.

**"… los taludes laterales salen de la superficie antes de encontrar el terreno." / "… las líneas de talud salen de la superficie antes de encontrarla …"**
La rasante llega al borde de la superficie antes de encontrar el terreno. Aleje el diseño del borde, o acérquelo al terreno. Una plataforma nueva dibujada parcialmente fuera de la superficie puede empezar en la elevación 0: escriba una elevación real.

**"Las líneas de cierre de talud de la obra lineal se cruzan …" / "La línea de cierre de talud se cruza consigo misma …"**
Los taludes de lados distintos chocan entre sí: curvas cerradas, plataformas angostas, cortes profundos o rellenos altos. Use un radio mayor, un ensamble más angosto, una plataforma más ancha o taludes más empinados.

**"Todavía no hay volúmenes: una plataforma necesita rasantearse sin problemas."**
Corrija los problemas que aparecen en el recuadro rojo de arriba.

**{{ui:Proyecto (rasante)}} está atenuado.**
Todavía no hay plataformas ni obras lineales rasanteadas.

## Tuberías

**"P2 todavía no tiene plantillas."**
Haga clic en {{ui:Establecer sus plantillas según las reglas}} o escriba las plantillas.

**"P1: no hay terreno en S1 desde el cual empezar."**
La estructura aguas arriba está fuera de la superficie y no tiene brocal. Escriba un brocal para ella.

**Todas las tuberías se marcan después de mover una estructura.**
Mover una estructura no cambia las plantillas. Haga clic en {{ui:Establecer todas las plantillas según las reglas}}.

Todos los mensajes de la red se explican en [Trazar una red de tuberías por gravedad](topic:pipe-network#read-and-fix-problems).

## Guardar y exportar

**"Todavía no hay nada que exportar." / "Todavía no hay nada que trazar."**
El proyecto está vacío. Importe primero los puntos.

**No encuentro el archivo guardado.**
Está en las descargas del navegador (normalmente la carpeta Descargas). Consulte [Archivos que puede abrir, guardar y exportar](topic:files#where-the-files-go).

**La escala del PDF es incorrecta en el papel.**
Imprima al 100 % o a tamaño real, no "ajustar a la página".

**Signos de interrogación en el texto del PDF.**
Los nombres o descripciones usan caracteres fuera del conjunto de Europa occidental. El mensaje de estado los cuenta. Renómbrelos con caracteres simples.

**El trazado se corta en los bordes.**
La escala es demasiado grande para la hoja. Elija la escala marcada "(ajusta)", una hoja más grande, o {{ui:Lo que está en pantalla}}.

**{{key:Mod+P}} abrió el cuadro de impresión del navegador.**
La página no tenía el foco. Cierre el cuadro, haga clic en el plano y pulse {{key:Mod+P}} otra vez, o haga clic en {{ui:PDF}}.

## La aplicación

**La pantalla está en blanco o la barra de herramientas no hace nada.**
Use una versión actual de Chrome, Edge, Firefox o Safari, y recargue la página. Consulte [Navegadores](common:browsers).

**La aplicación va lenta con un archivo de puntos grande.**
Desactive {{ui:Triángulos}}, {{ui:Etiquetas de puntos}} y {{ui:Bandas de elevación}}, y use un intervalo de curvas mayor. Las superficies muy grandes tardan un momento en reconstruirse después de cada cambio.

**El navegador pregunta "¿Salir del sitio?"**
El proyecto tiene cambios sin guardar. Quédese, guarde con {{key:Mod+S}} y luego salga.
