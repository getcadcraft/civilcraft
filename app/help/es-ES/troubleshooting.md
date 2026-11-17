---
title: Solución de problemas
summary: Síntomas, causas y soluciones de los problemas que surgen en CivilCraft, con los mensajes exactos que muestra la aplicación.
keywords: problemas, errores, no funciona, solución, ayuda, mensajes, solucionar, rechazado, falta, incorrecto, intercambiado, curvas de nivel ausentes
from: a9f7dedc
---

Los mensajes aparecen en la barra de estado, abajo a la derecha, en cuadros de los paneles izquierdo y derecho, y en los cuadros de diálogo. Aquí se citan tal como los muestra la aplicación.

## Abrir archivos

**"Ese archivo supera los 200 MB; CivilCraft todavía no abre archivos tan grandes."**
Divida el archivo de puntos, o reduzca los datos antes de abrirlo.

**"No se pudo abrir site.json: no es un archivo de proyecto de CivilCraft."**
El archivo termina en `.json` o empieza por `{`, pero no es un proyecto de CivilCraft. Los archivos de puntos no deben empezar por `{`.

**"No se pudo abrir … Este archivo de proyecto es de un CivilCraft más reciente (versión 2)."**
El proyecto se guardó con una versión más nueva. Ábralo allí, o exporte LandXML desde él.

**"No se pudo abrir … Es XML, pero no LandXML (su elemento raíz es <…>)."**
El archivo es otro tipo de XML. Exporte LandXML desde el otro programa.

**"… no tiene puntos, superficies TIN ni alineaciones que CivilCraft pueda leer."**
Todo lo del archivo es algo que CivilCraft omite (por ejemplo, solo superficies de malla, o solo alineaciones de espirales). El resto del mensaje indica qué había. Consulte [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

**"No se pudo cargar el ejemplo: …"**
{{ui:Abrir el sitio de ejemplo}} lee un archivo del sitio de CadCraft. Sin conexión, solo funciona si CivilCraft se guardó para uso sin conexión (el botón de la barra superior muestra {{ui:Listo sin conexión}}). Conéctese, haga clic en {{ui:Guardar para uso sin conexión}} y, desde entonces, funcionará sin conexión. Consulte [Uso sin conexión](common:offline).

**{{ui:Guardar para uso sin conexión}} muestra {{ui:No se pudo guardar}}.**
Algunos archivos no se descargaron. Compruebe la conexión y haga clic de nuevo en el botón.

**{{ui:Guardar para uso sin conexión}} muestra {{ui:Sin conexión no disponible}}.**
Esta ventana del navegador no puede guardar una copia sin conexión, normalmente porque es una ventana privada o porque el equipo está administrado. Abra CivilCraft en una ventana normal.

**Sin conexión, la aplicación no se abre.**
No se guardó para uso sin conexión en este navegador, o el navegador borró los datos del sitio (Safari lo hace con los sitios que no se visitan durante varias semanas). Conéctese, abra CivilCraft y haga clic en {{ui:Guardar para uso sin conexión}}.

**La copia sin conexión es de una versión anterior.**
Haga clic en {{ui:Listo sin conexión}} y, estando conectado, en {{ui:Guardar de nuevo (obtener la versión más reciente)}}.

**Un archivo aparece atenuado en el cuadro de abrir.**
El cuadro solo muestra archivos de puntos, LandXML y de proyecto según su extensión. Arrastre el archivo al plano, o cambie su nombre a `.txt`.

## Importar puntos

**"No se pudo leer ningún punto de este archivo."**
Elija a mano el orden de las columnas en **Columnas**. Si nada funciona, abra el archivo en un editor de texto y compruebe que hay un punto por línea y que contiene números.

**El emplazamiento aparece reflejado, girado o estirado hasta formar una línea.**
El norte y el este están intercambiados. El resumen decía "adivinado por el número de columnas". Elija PENZD en lugar de PNEZD (o al revés) en **Columnas**, o vuelva a importar.

**Puntos muy alejados del resto, y el plano alejado hasta parecer un punto.**
Una fila tiene una errata en una coordenada, o el archivo mezcla sistemas de coordenadas. Localice el punto (haga clic en él para ver su número) y corrija el archivo.

**Filas listadas en "Filas no leídas".**
Consulte la tabla en [Importar puntos de levantamiento](topic:import-points#rows-that-are-not-read).

**Mis puntos antiguos han desaparecido.**
Importar un archivo de puntos sustituye todos los puntos y borra el historial de deshacer. Abra su proyecto guardado para recuperarlos.

## La superficie

**"Superficie: no construida" con un cuadro rojo.**
El cuadro indica el motivo: "Una superficie necesita al menos tres puntos con cota.", "Los puntos están todos en una línea: no hay triángulos.", "No hay puntos con cota.", "El límite no se superpone a los puntos." o "No queda ningún triángulo dentro del límite." Compruebe el orden de las columnas, los grupos de puntos (¿están en {{ui:Omitido}}?) y el límite.

**Las curvas de nivel cortan en línea recta una zanja o una cresta.**
Esa línea no es una línea de ruptura. Asigne a su grupo {{ui:Línea de ruptura}}, o dibújela con la herramienta {{ui:Línea de ruptura}}. Consulte [Construir y refinar la superficie](topic:build-surface).

**Un grupo de línea de ruptura dibuja un zigzag.**
El grupo contiene más de una línea, o sus puntos no están numerados a lo largo de la línea. Devuelva el grupo a {{ui:Puntos}} y dibuje cada línea con la herramienta {{ui:Línea de ruptura}}.

**Triángulos largos y finos a lo largo del exterior.**
Dibuje un límite ({{key:O}}) o ajuste **Arista exterior más larga**.

**No hay curvas de nivel, aunque la superficie esté construida.**
O bien {{ui:Curvas de nivel}} está desactivado en **Visualización**, o el intervalo es tan pequeño que habría más de 2.000 niveles de curva. Elija un intervalo mayor.

**Las líneas de ruptura o un límite no cambian nada.**
La superficie procede de LandXML ("Superficie (desde LandXML)"). Se usa tal cual. Haga clic en {{ui:Reconstruir la superficie a partir de los puntos}} para construirla a partir de los puntos.

**"Todavía no hay superficie: abra antes los puntos de levantamiento."**
La línea de ruptura, el límite y la plataforma necesitan una superficie de terreno existente. Importe antes los puntos.

**"Haga clic en un punto de levantamiento con cota: una línea de ruptura toma las cotas de los puntos."**
La herramienta {{ui:Línea de ruptura}} solo selecciona puntos de levantamiento. Amplíe la vista y haga clic en un punto (un cuadrado naranja indica cuál tomará).

## Dibujo

**Mi último punto desapareció al hacer doble clic para terminar.**
En esta versión, el doble clic termina la alineación, la plataforma, la línea de ruptura o el límite, pero descarta el punto en el que hizo doble clic. Haga clic una vez en el último punto y pulse {{key:Enter}}. Use {{key:Mod+Z}} si ya ocurrió, y dibuje de nuevo.

**No puedo terminar un dibujo en una tableta.**
Para terminar hace falta {{key:Enter}}; todavía no hay un botón en pantalla. Conecte un teclado. Consulte [Ratón, panel táctil y pantalla táctil](topic:keyboard#mouse-trackpad-and-touch).

**Arrastrar para colocar un punto desplaza la vista.**
Un arrastre de más de unos pocos píxeles desplaza el plano en todas las herramientas. Haga clic sin mover.

**"Una alineación necesita al menos dos puntos." / "Una plataforma necesita al menos tres esquinas." / "Un tramo de tubería necesita al menos dos estructuras."**
Pulsó {{key:Enter}} demasiado pronto. El dibujo se descarta; empiece de nuevo.

**Teclas como A o G no hacen nada.**
Un cuadro de texto o una lista del panel todavía tiene el foco, y las letras van a él. Haga clic una vez en el plano y después pulse la tecla. En Mac, la tecla delete equivale a Backspace para el navegador: use Fn y delete para borrar una selección.

## Alineaciones y perfiles

**"Las curvas en PI 2 y PI 3 se solapan: … Use radios menores."**
Dos curvas necesitan más tangente de la que hay entre sus PI. Reduzca uno o los dos radios en la tabla de PI, o separe los PI.

**"El PI 3 da media vuelta; no puede tener una curva."**
La alineación retrocede sobre sí misma en ese PI. Mueva o elimine el PI.

**"Esta alineación no tiene terreno debajo desde el que empezar."**
La alineación está fuera de la superficie. Muévala sobre la superficie, o añada PIV haciendo clic con {{ui:Añadir PIV}} activado.

**"La curva vertical en PIV 3 (L = …) empieza antes de que termine la curva o el PIV anterior." / "… sobrepasa el PIV siguiente."**
Acorte la longitud de la curva o separe los PIV.

**"Ya hay un PIV en …"**
Hay un PIV en esa estación. Haga clic en otro lugar, o arrastre el existente.

**La vista de perfil está vacía: "Dibuje una alineación para ver su perfil."**
No hay ninguna alineación, o la seleccionada tiene errores.

## Corredores y plataformas

**"El corredor necesita un perfil de proyecto sin errores."**
Inicie un perfil de proyecto ({{ui:Iniciar desde el terreno}}) y corrija los solapamientos de curvas.

**"… los taludes laterales salen de la superficie antes de encontrar el terreno." / "… las líneas de talud salen de la superficie antes de encontrarla …"**
La explanación llega al borde de la superficie antes de encontrar el terreno. Aleje el diseño del borde, o acérquelo al terreno. Una plataforma nueva dibujada en parte fuera de la superficie puede empezar en cota 0: escriba una cota real.

**"Las líneas de talud del corredor cruzan …" / "La línea de talud se cruza a sí misma …"**
Los taludes de lados distintos se encuentran: curvas cerradas, plataformas estrechas, desmontes profundos o terraplenes altos. Use un radio mayor, una sección más estrecha, una plataforma más ancha o taludes más tendidos.

**"Todavía no hay volúmenes: una plataforma debe nivelarse sin problemas."**
Corrija los problemas indicados en el cuadro rojo de arriba.

**{{ui:Proyecto (rasante)}} aparece atenuado.**
Todavía no hay ninguna plataforma ni corredor nivelado.

## Tuberías

**"P2 todavía no tiene cotas de batea."**
Haga clic en {{ui:Establecer sus plantillas según las reglas}} o escriba las cotas de batea.

**"P1: no hay terreno en S1 desde el que empezar."**
La estructura aguas arriba está fuera de la superficie y no tiene brocal. Escriba un brocal para ella.

**Todos los tramos aparecen marcados después de mover una estructura.**
Mover una estructura no cambia las cotas de batea. Haga clic en {{ui:Establecer todas las plantillas según las reglas}}.

Todos los mensajes de la red se explican en [Diseñar una red de tuberías por gravedad](topic:pipe-network#read-and-fix-problems).

## Guardar y exportar

**"Todavía no hay nada que exportar." / "Todavía no hay nada que imprimir."**
El proyecto está vacío. Importe antes los puntos.

**No encuentro el archivo guardado.**
Está en las descargas del navegador (normalmente la carpeta Descargas). Consulte [Archivos que puede abrir, guardar y exportar](topic:files#where-the-files-go).

**La escala del PDF es incorrecta en el papel.**
Imprima al 100 % o a tamaño real, no con "ajustar a la página".

**Signos de interrogación en el texto del PDF.**
Los nombres o las descripciones usan caracteres fuera del juego de caracteres de Europa occidental. El mensaje de estado los cuenta. Renómbrelos con caracteres sencillos.

**El plano sale recortado por los bordes.**
La escala es demasiado grande para la hoja. Elija la escala marcada "(cabe)", una hoja más grande, o {{ui:Lo que está en pantalla}}.

**{{key:Mod+P}} abrió el cuadro de impresión del navegador.**
La página no tenía el foco. Cierre el cuadro, haga clic en el plano y pulse {{key:Mod+P}} de nuevo, o haga clic en {{ui:PDF}}.

## La aplicación

**La pantalla está en blanco o la barra de herramientas no hace nada.**
Use una versión actual de Chrome, Edge, Firefox o Safari, y recargue la página. Consulte [Navegadores](common:browsers).

**La aplicación va lenta con un archivo de puntos grande.**
Desactive {{ui:Triángulos}}, {{ui:Etiquetas de puntos}} y {{ui:Bandas de elevación}}, y use un intervalo de curvas de nivel mayor. Las superficies muy grandes tardan un momento en reconstruirse tras cada cambio.

**El navegador pregunta "¿Salir del sitio?"**
El proyecto tiene cambios sin guardar. Quédese en la página, guarde con {{key:Mod+S}} y después salga.
