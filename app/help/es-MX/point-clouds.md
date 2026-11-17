---
title: Nubes de puntos de un dron o escáner
summary: Con el complemento Nubes de puntos, abra un archivo LAS o LAZ con millones de puntos, revíselo completo, límpielo, clasifíquelo en terreno, vegetación y edificios, y construya a partir de él el terreno, las curvas de nivel y los volúmenes.
keywords: nube de puntos, las, laz, dron, fotogrametría, recap, lidar, escaneo, terreno, clasificar, ruido, acopio, volumen, corte y relleno, curvas de nivel, línea de quiebre, eye-dome, ortomosaico, orto, proyectar, capa de mapa, exportar las, exportar laz, comprimir
from: e4a4901f
---

La mayoría de las personas nunca necesita esto, por eso es un complemento. Active {{ui:Nubes de puntos}} en Configuración › Complementos; aparecerá una pestaña {{ui:Nubes de puntos}} en el panel derecho. El archivo se lee en su navegador y se divide en mosaicos que se guardan en el almacenamiento propio del navegador (o en una carpeta que usted elija). **No se sube nada.**

:::warning
Todo lo que reporta esta pestaña es un número obtenido de sus datos, no un certificado. Se probó con un terreno ficticio, todavía no con un levantamiento real con dron: lea los primeros resultados con cuidado y díganos qué encuentra. El profesional registrado decide el valor del terreno, de las curvas de nivel y de los volúmenes.
:::

## Abrir una nube

En {{ui:Abrir una nube}} elija un archivo LAS o LAZ. La pestaña indica cuántos puntos contiene, su sistema de coordenadas y sus unidades, y cuánto espacio necesita una construcción; presione {{ui:Construir la nube}}. Una construcción puede detenerse y continuar con {{ui:Reanudar}} (elija de nuevo el mismo archivo). El archivo nunca se modifica. Un archivo de 100 millones de puntos se construye en minutos en una estación de trabajo y necesita aproximadamente el mismo espacio que el archivo.

En {{ui:Nubes en esta computadora}} abre o elimina una nube. {{ui:Guardar nubes en una carpeta…}} (Chrome, Edge y la aplicación Studio) guarda los mosaicos en una carpeta que usted elija, por ejemplo una carpeta de nubes de CadCraft en Documentos, de modo que una nube de 10 GB no tiene que caber en el almacenamiento del navegador; las nubes construidas antes permanecen donde se construyeron. Después de un reinicio, el navegador vuelve a pedir permiso: presione {{ui:Usar la carpeta … de nuevo}}.

## Verla

{{ui:Ver en 3D}} dibuja la nube a partir de mosaicos gruesos y la refina al acercarse, sin dibujar nunca más de {{ui:Puntos dibujados máximos}} a la vez (2.5 millones; 500 mil en un teléfono). Coloree por el color propio del archivo, la altura, la clase, la intensidad o el residuo. {{ui:Iluminación eye-dome}} sombrea los bordes según la profundidad para que la forma se lea sin normales (desactivada en un teléfono); {{ui:Puntos más pequeños con la distancia}} hace más pequeños los puntos lejanos y más grandes los cercanos; {{ui:Tamaño de punto}} define el tamaño. La planta muestra la nube como una ráster bajo su dibujo y **se refina al acercar el zoom** a una parte de ella.

## Limpiarla

En {{ui:Limpiar}} dibuje un lazo, un rectángulo o un polígono en la planta (o en 3D desde la vista superior: en 3D el contorno se toma en vertical, por lo que solo es exacto desde arriba). La pestaña muestra cuántos puntos hay dentro **antes** de aplicar: {{ui:Borrar estos puntos}}, {{ui:Cambiar su clase}}, {{ui:Restaurar puntos borrados}} o {{ui:Recortar a este límite}}. {{ui:Deshacer}} y {{ui:Rehacer}} recorren el registro de edición; el archivo en sí nunca se modifica. {{ui:Filtro de ruido…}} marca los puntos sueltos como puntos bajos (clase 7) o ruido alto (clase 18).

## Clasificarla

{{ui:Encontrar el terreno}} trabaja mosaico por mosaico y marca los puntos de terreno (clase 2) y los puntos bajos; la tolerancia es de 0.15 m, o de 0.08 m con el interruptor de grado topográfico. Informa las costuras entre mosaicos que no coinciden. Después, {{ui:Clasificar vegetación y edificios}} marca la vegetación baja, media y alta, y los edificios, a partir de la altura sobre el terreno y de qué tan plano es el entorno. No hay aprendizaje automático, así que un cobertizo de techo plano bajo los árboles puede quedar mal clasificado: revíselo.

## Terreno, curvas de nivel y líneas de quiebre

{{ui:Construir terreno}} crea el terreno existente a partir de los puntos de terreno y lo agrega al proyecto igual que lo hace una importación LAS (un solo paso de deshacer). Después compara los puntos con él: la media, el RMS, el percentil 95, la proporción dentro de la tolerancia y los diez lugares que más difieren, cada uno con {{ui:Ir allí}}. Colorear por {{ui:Residuo}} muestra dónde no coinciden el terreno y la nube.

Una **línea de quiebre** (una guarnición, una cuneta o la corona de un talud) se designa sobre la nube: {{ui:Designar una línea de quiebre en la nube}} en la vista 3D toma el punto dibujado más cercano en cada clic, y {{ui:Designar una línea de quiebre en la planta}} toma el punto de la nube más cercano (primero el terreno) bajo cada clic; haga doble clic o presione Enter para terminar la línea. La siguiente {{ui:Construir terreno}} la usa. {{ui:Mostrar curvas de nivel}} dibuja las curvas sobre la nube en una imagen pequeña y fija el intervalo del proyecto.

## Volúmenes

{{ui:Volumen de acopio…}} calcula el volumen de la superficie sobre una base, dentro de un límite que usted dibuja. Dibuje el límite sobre terreno nivelado alrededor de la pila y elija la base: el punto más bajo del límite, un plano, una base curva suave, una superficie que pasa por el límite, o un nivel que usted escribe. En terreno con pendiente o curvo use el plano o la base curva; el punto más bajo da un valor demasiado alto. Los puntos del límite que sobresalen de los demás (un árbol sobre la línea) se excluyen de la base. {{ui:De vuelo a vuelo}} da el corte y el relleno entre dos nubes. Ambos resultados se pueden guardar como CSV.

## Ortomosaico

En {{ui:Ortomosaico (imagen desde arriba)}} elija el ortomosaico del dron junto con su archivo de georreferencia y su `.prj` cuando los tenga: un GeoTIFF, o un PNG o JPEG. Se convierte en una **capa de mapa** del proyecto, así que la planta lo muestra bajo su dibujo, y la vista 3D (color {{ui:Mapa}}) lo pinta sobre el terreno construido; por eso primero use {{ui:Construir terreno}}. La pestaña indica qué parte de la nube cubre la imagen y avisa cuando no cubre ninguna: la causa habitual es un sistema de coordenadas distinto, así que incluya el archivo `.prj`. Si no hay `.prj`, el programa pregunta dónde están las coordenadas. La imagen se guarda dentro del archivo del proyecto; un GeoTIFF de más de 200 MB se rechaza, y un mosaico muy grande se reduce a 16 megapíxeles, así que en un levantamiento grande recorte primero el mosaico al sitio.

## Exportar

{{ui:Exportar}} escribe la nube limpia y clasificada como un archivo nuevo (todos los puntos, las clases limpias o solo el terreno). En {{ui:Tipo de archivo}} elija:

- **LAS 1.4 (sin comprimir)**: formato de punto 6, o 7 con color.
- **LAZ (comprimido)**: los mismos puntos comprimidos sin pérdida, de modo que cada punto se recupera exactamente. Se escribe como formato de punto 0, o 2 con color, en un archivo LAS 1.4. En el terreno ficticio de 300 m, el LAZ pesó cerca de una quinta parte del archivo LAS 1.4. Los formatos LAZ 0 y 2 solo admiten las clases 0 a 31: un punto con una clase mayor se rechaza con un mensaje, así que exporte esa nube como LAS 1.4.

El LAZ lo escribe el compresor propio de CadCraft, hecho a partir de la especificación LAZ publicada. Hemos verificado que nuestro propio lector y dos lectores LAZ independientes (laz-perf, que la aplicación usa para abrir archivos LAZ, y laspy con lazrs) leen cada punto de vuelta exactamente, y que los archivos LAZ hechos con laspy salen idénticos byte por byte cuando volvemos a escribir sus puntos. Todavía no se han probado otros programas, así que si alguno no abre un archivo, díganos cuál.

Cuando el navegador puede escribir un archivo sobre la marcha, usted elige primero el archivo, y una nube muy grande se escribe en él mosaico por mosaico en lugar de reunirse en la memoria; de lo contrario, el archivo se reúne y se descarga, lo cual funciona bien hasta unos cientos de megabytes.

## Lo que no hace

Solo lee LAS y LAZ (E57, PLY y PCD todavía no están conectados a esta pestaña, y varios archivos de un mismo vuelo no se unen); no reproyecta una nube (se supone el sistema del proyecto y metros); no lee archivos RCP o RCS de Autodesk; no crea una superficie a partir de fotografías; y no encuentra postes, guarniciones ni tuberías por sí solo.
