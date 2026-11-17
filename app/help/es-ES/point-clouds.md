---
title: Nubes de puntos de un dron o escáner
summary: Con el complemento Nubes de puntos, abra un archivo LAS o LAZ de millones de puntos, examínelo entero, límpielo, clasifíquelo en terreno, vegetación y edificios, y genere a partir de él el terreno, las curvas de nivel y los volúmenes.
keywords: nube de puntos, las, laz, dron, fotogrametría, recap, lidar, escaneo, terreno, clasificar, ruido, acopio, volumen, desmonte y terraplén, curvas de nivel, línea de rotura, eye-dome, ortomosaico, ortho, proyectar, capa de mapa, exportar las, exportar laz, comprimir
from: e4a4901f
---

La mayoría de los usuarios no lo necesita, por eso es un complemento. Active {{ui:Nubes de puntos}} en Configuración › Complementos; aparecerá una pestaña {{ui:Nubes de puntos}} en el panel derecho. El archivo se lee en su navegador y se divide en teselas que se guardan en el almacenamiento propio del navegador (o en una carpeta que usted elija). **No se sube nada.**

:::warning
Todo lo que muestra esta pestaña es un número obtenido de sus datos, no un certificado. Se probó con un emplazamiento ficticio, todavía no con un vuelo real de dron: lea los primeros resultados con cuidado e infórmenos de lo que encuentre. El técnico habilitado decide cuál es el valor del terreno, de las curvas de nivel y de los volúmenes.
:::

## Abrir una nube

Bajo {{ui:Abrir una nube}} elija un archivo LAS o LAZ. La pestaña indica cuántos puntos contiene, su sistema de coordenadas y sus unidades, y cuánto espacio necesita la generación; pulse {{ui:Construir la nube}}. La generación puede detenerse y se reanuda con {{ui:Reanudar}} (elija de nuevo el mismo archivo). El archivo nunca se modifica. Un archivo de 100 millones de puntos se genera en minutos en una estación de trabajo y necesita aproximadamente el mismo espacio que el archivo.

Bajo {{ui:Nubes en este equipo}} abre o elimina una nube. {{ui:Guardar nubes en una carpeta…}} (Chrome, Edge y la aplicación Studio) guarda las teselas en una carpeta que usted elija, por ejemplo una carpeta de nubes de CadCraft en Documentos, de modo que una nube de 10 GB no tenga que caber en el almacenamiento del navegador; las nubes generadas antes permanecen donde se generaron. Tras un reinicio, el navegador vuelve a pedir permiso: pulse {{ui:Usar la carpeta … de nuevo}}.

## Visualizarla

{{ui:Ver en 3D}} dibuja la nube a partir de teselas gruesas y la afina al acercarse, sin superar nunca {{ui:Máximo de puntos dibujados}} a la vez (2.5 millones; 500 mil en un teléfono). Colorear por el color propio del archivo, por la altura, la clase, la intensidad o el residuo. {{ui:Iluminación eye-dome}} sombrea los bordes según la profundidad para que se distinga la forma sin normales (desactivada en un teléfono); {{ui:Puntos más pequeños con la distancia}} hace los puntos lejanos más pequeños y los cercanos más grandes; {{ui:Tamaño de punto}} fija el tamaño. El plano muestra la nube como una trama bajo su dibujo y **se afina al acercar el zoom** a una parte de ella.

## Limpiar la nube

Bajo {{ui:Limpiar}} dibuje un lazo, un rectángulo o un polígono en el plano (o en 3D desde la vista superior: en 3D el contorno se proyecta directamente hacia abajo, por lo que solo es exacto desde arriba). La pestaña muestra cuántos puntos hay dentro **antes** de aplicar: {{ui:Eliminar estos puntos}}, {{ui:Cambiar su clase}}, {{ui:Restaurar puntos eliminados}} o {{ui:Recortar a este contorno}}. {{ui:Deshacer}} y {{ui:Rehacer}} recorren el registro de cambios; el archivo en sí nunca se modifica. {{ui:Filtro de ruido…}} marca los puntos aislados como puntos bajos (clase 7) o ruido alto (clase 18).

## Clasificar la nube

{{ui:Buscar el terreno}} trabaja tesela a tesela y marca como terreno (clase 2) y puntos bajos; la tolerancia es de 0.15 m, o de 0.08 m con el interruptor de precisión topográfica. Informa de las juntas entre teselas que no coinciden. {{ui:Clasificar vegetación y edificios}} marca después la vegetación baja, media y alta y los edificios según la altura sobre el terreno y lo llano que sea el entorno. No hay aprendizaje automático, así que un cobertizo de cubierta plana bajo árboles puede estar mal clasificado: compruébelo.

## Terreno, curvas de nivel, líneas de rotura

{{ui:Construir terreno}} crea el terreno existente a partir de los puntos de suelo y lo añade al proyecto del mismo modo que una importación de LAS (un paso de deshacer). Después compara los puntos con él: la media, el RMS, el percentil 95, la proporción dentro de la tolerancia y los diez lugares que más difieren, cada uno con {{ui:Ir allí}}. Colorear por {{ui:Residuo}} muestra dónde no coinciden el terreno y la nube.

Una **línea de rotura** (un bordillo, una cuneta o la coronación de un talud) se elige sobre la nube: {{ui:Elegir una línea de rotura en la nube}} en la vista 3D toma el punto dibujado más cercano en cada pulsación, y {{ui:Elegir una línea de rotura en el plano}} toma el punto de la nube más cercano (primero el terreno) bajo cada pulsación; haga doble clic o pulse Intro para terminar la línea. El siguiente {{ui:Construir terreno}} la utiliza. {{ui:Mostrar curvas de nivel}} dibuja las curvas sobre la nube en una pequeña imagen y fija el intervalo del proyecto.

## Volúmenes

{{ui:Volumen de acopio…}} calcula el volumen de la superficie sobre una base dentro de un contorno que usted dibuja. Dibuje el contorno sobre terreno llano alrededor del montón y elija la base: el punto más bajo del contorno, un plano, una base curva suave, una superficie que pase por el contorno o una cota que escriba. En terreno inclinado o curvo use el plano o la base curva; el punto más bajo da un valor demasiado alto. Los puntos del contorno que sobresalen del resto (un árbol en la línea) se excluyen de la base. {{ui:De vuelo a vuelo}} da el desmonte y el terraplén entre dos nubes. Ambos pueden guardarse como CSV.

## Ortomosaico

Bajo {{ui:Ortomosaico (imagen desde arriba)}} elija el ortomosaico del dron junto con su archivo de georreferencia y su `.prj` cuando los tenga: un GeoTIFF, o un PNG o JPEG. Se convierte en una **capa de mapa** del proyecto, de modo que el plano la muestra bajo su dibujo, y la vista 3D (color {{ui:Mapa}}) la pinta sobre el terreno que ha generado, así que primero use {{ui:Construir terreno}}. La pestaña indica qué parte de la nube cubre la imagen, y avisa cuando no cubre ninguna: la causa habitual es un sistema de coordenadas distinto, así que indique también el archivo `.prj`. Si no hay `.prj`, el programa le pregunta dónde están las coordenadas. La imagen se guarda dentro del archivo del proyecto; un GeoTIFF de más de 200 MB se rechaza y un mosaico muy grande se reduce a 16 megapíxeles, así que para un levantamiento grande recorte antes el mosaico al emplazamiento.

## Exportar

{{ui:Exportar}} escribe la nube limpia y clasificada como un archivo nuevo (todos los puntos, las clases limpias o solo el terreno). Bajo {{ui:Tipo de archivo}} elija:

- **LAS 1.4 (sin comprimir)**: formato de punto 6, o 7 con color.
- **LAZ (comprimido)**: los mismos puntos comprimidos sin pérdida, de modo que cada punto se recupera exactamente. Se escribe como formato de punto 0, o 2 con color, en un archivo LAS 1.4. En el emplazamiento ficticio de 300 m el LAZ ocupó aproximadamente una quinta parte del tamaño del archivo LAS 1.4. Los formatos LAZ 0 y 2 solo contienen las clases de 0 a 31: un punto con una clase superior se rechaza con un mensaje, así que exporte esa nube como LAS 1.4.

El LAZ lo escribe el compresor propio de CadCraft, basado en la especificación LAZ publicada. Hemos comprobado que nuestro propio lector y dos lectores LAZ independientes (laz-perf, que la aplicación usa para abrir archivos LAZ, y laspy con lazrs) leen cada punto exactamente, y que los archivos LAZ generados por laspy salen idénticos byte a byte al volver a escribir sus puntos. Aún no se han probado otros programas, así que si alguno no abre un archivo, díganos cuál.

Cuando el navegador puede escribir un archivo a medida que avanza, elija primero el archivo: una nube muy grande se escribe en él tesela a tesela, en lugar de reunirse en memoria. Si no, el archivo se reúne y se descarga, lo cual vale hasta unos pocos cientos de megabytes.

## Lo que no hace

Solo lee LAS y LAZ (E57, PLY y PCD aún no están conectados a esta pestaña, y varios archivos de un mismo vuelo no se unen), no reproyecta una nube (se supone el sistema del proyecto y los metros), no lee archivos RCP o RCS de Autodesk, no crea una superficie a partir de fotografías y no encuentra postes, bordillos ni tuberías por sí mismo.
