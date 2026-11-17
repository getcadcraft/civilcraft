---
title: Viniendo de otro software civil
summary: Cómo los flujos de trabajo de diseño civil conocidos se corresponden con CivilCraft, y las diferencias que confunden a los usuarios experimentados en la primera hora.
keywords: cambio, migrar, conocido, diferencias, flujo de trabajo, comandos, correspondencia, cogo, corredor, nivelación, red de caños, estilos, línea de comandos
from: feae37d6
---

Si usaste Civil 3D, ya conocés las ideas de CivilCraft: puntos y grupos de puntos, superficies TIN con líneas de quiebre y límites, trazados por PI, perfiles por PVI, ensambles barridos en corredores, nivelación hasta empalmar con el terreno, redes de caños por gravedad, LandXML. Lo que cambia es casi todo lo que rodea eso: no hay archivo de dibujo, no hay línea de comandos (salvo que elijas el estilo de menú {{ui:Dibujo clásico}}), no hay estilos, no hay Prospector ni diálogos de configuración. CivilCraft es una herramienta pequeña y enfocada en un navegador, y en esta versión hace una fracción de lo que hace un paquete civil completo. Esta página relaciona lo que ya sabés con lo que hay acá.

:::tip
Si te gusta la cinta de Civil 3D, elegí el estilo de menú {{ui:Cinta de civil}} en {{ui:Configuración}} › {{ui:CivilCraft}} › {{ui:Menús, teclas y mouse}}: pestañas Inicio, Superficies, Modificar, Geolocalización, Vista y Salida, el botón del medio desplaza, y {{key:Shift}} con el botón del medio orbita la vista 3D. Si escribís comandos, {{ui:Dibujo clásico}} agrega una línea de comandos (ALIGNMENT, PAD, PROFILE, ZOOM …). Ver [Menús, teclas y mouse](topic:menus-keys-and-mouse).
:::

## Mapa de flujo de trabajo

| Lo que querés hacer | Forma conocida | En CivilCraft |
|---|---|---|
| Traer puntos de relevamiento | Importar puntos con un formato de archivo de puntos | {{ui:Abrir}}, después revisá el orden de columnas en **Importar puntos** ([Importar puntos de relevamiento](topic:import-points)) |
| Ordenar puntos | Grupos de puntos, claves de descripción | Grupos automáticos por la primera palabra de la descripción; sin claves de descripción |
| Editar un punto | Editor de puntos, agarraderas | Hacé clic y escribí en Propiedades, o arrastralo ([Editar un punto de relevamiento](topic:edit-points)) |
| Construir el terreno existente | Crear una superficie, agregar grupos de puntos como datos | Automático: la superficie se reconstruye cuando cambian sus entradas |
| Agregar líneas de quiebre | Agregar líneas de quiebre desde polilíneas o líneas de diseño | Poné un grupo de puntos en {{ui:Línea de quiebre}}, o hacé clic en puntos con la herramienta {{ui:Línea de quiebre}} ({{key:B}}) |
| Recortar la superficie | Límite exterior, límite de ocultar, longitud máxima de triángulo | {{ui:Límite}} ({{key:O}}, solo exterior) y **Borde exterior más largo** |
| Mostrar curvas de nivel | Estilo de superficie | **Pantalla** en el panel izquierdo: intervalo, mayor cada, etiquetas, bandas, flechas de pendiente |
| Trazar un eje | Herramientas de creación de alineaciones, configuración de curvas y espirales | {{ui:Trazado}} ({{key:A}}): hacé clic en PI, {{key:Enter}}; radios y longitudes de espiral en la tabla de PI |
| Crear una vista de perfil | Asistente de vista de perfil, bandas | {{ui:Perfil}} ({{key:R}}): una vista de perfil bajo el plano, siempre ajustada |
| Diseñar la pendiente | Herramientas de diseño de perfil | {{ui:Comenzar desde el terreno}}, {{ui:Agregar PVI}} ({{key:I}}), arrastrar PVI, escribir **Curva L** |
| Construir una ruta | Ensamble, subensambles, corredor, objetivos, regiones | Marcá **Barrer un ensamble a lo largo del perfil de diseño** bajo el trazado; un carril, una berma y un talud a cada lado, o cada lado armado con partes (cuneta, cordón, vereda …) |
| Nivelar una plataforma | Líneas de diseño, grupos de nivelación, criterios de nivelación | {{ui:Plataforma}} ({{key:G}}): una plataforma plana con taludes de corte y relleno hasta empalmar con el terreno |
| Calcular movimiento de suelo | Superficies de volumen, tablero de volúmenes | **Movimiento de suelo** en el panel derecho, método de grilla, se actualiza en vivo |
| Diseñar pluvial o cloacal | Red de caños con lista de partes, reglas | {{ui:Caños}} ({{key:P}}): hacé clic en las estructuras aguas abajo; tres reglas que fijás; cotas de fondo automáticas |
| Intercambiar con otros | Importación y exportación de LandXML | {{ui:Abrir}} un archivo LandXML; {{ui:LandXML}} para exportar ([Intercambiar LandXML](topic:landxml)) |
| Enviar líneas a CAD | Exportar a DWG | {{ui:DWG}} (formato 2000 a 2018) o {{ui:DXF}} (R12) |
| Imprimir | Presentaciones, viewports, conjuntos de hojas | {{ui:PDF}}: una hoja apaisada del plano a una escala elegida; hojas de plano y perfil y hojas de corte en PDF |
| Compartir trabajo entre archivos | Accesos a datos, referencias | No disponible: un proyecto por archivo |
| Deshacer | Deshacer | {{key:Mod+Z}} y {{key:Mod+Y}}, 200 pasos; las configuraciones de pantalla no son pasos de deshacer |

## Diferencias que confunden a la gente

**No hay línea de comandos** salvo que elijas el estilo de menú {{ui:Dibujo clásico}}. Las herramientas son botones de la barra y letras sueltas: {{key:A}} trazado, {{key:G}} plataforma, {{key:P}} caños, {{key:B}} línea de quiebre, {{key:O}} límite, {{key:R}} perfil, {{key:I}} agregar PVI, {{key:V}} seleccionar, {{key:F}} ajustar. En los otros estilos de menú, escribir un nombre de comando no hace nada. Ver [Teclas y mouse](topic:keyboard).

**Enter termina; el doble clic es riesgoso.** Hacé clic una vez en el último punto y después apretá {{key:Enter}}. En esta versión el doble clic también termina, pero quita el punto sobre el que hiciste doble clic. El clic derecho no termina ni repite; solo desplaza cuando lo arrastrás.

**Todo es dinámico, todo el tiempo.** Cambiá un grupo de puntos, un radio, un PVI o una pendiente de plataforma, y la superficie, las curvas de nivel, el corredor, las líneas de empalme y los volúmenes se actualizan de inmediato. No hay nada que reconstruir ni nada que quede desactualizado.

**Nada es un objeto de dibujo.** El plano es una vista del diseño, no un dibujo que puedas editar con comandos de CAD. No podés agregar tus propias líneas ni textos, cambiar el color de una capa ni descomponer nada. Exportá a DXF y terminá el dibujo en un programa de CAD.

**Sin estilos.** Colores, grosores de línea, tamaños de etiqueta y nombres de capa están fijos (ver [Capas del plano](topic:plan-layers)). Papel y Modelo en la barra de la aplicación cambian entre una pantalla clara y una oscura.

**Uno de cada uno.** Una superficie de terreno existente, un resultado nivelado, una red de caños por proyecto. Muchos trazados y plataformas están bien.

**Las unidades son solo etiquetas.** Elegir {{ui:pies US}} o {{ui:Metros}} no convierte nada. No hay escala de dibujo. Un sistema de coordenadas es opcional: fijalo en {{ui:Coordenadas}} y no se mueve nada, solo dice qué significan los números (ver [Fijar el sistema de coordenadas del proyecto](topic:coordinate-systems)). Los pies se tratan como pies de agrimensura de EE. UU. al escribir LandXML.

**Los grupos de línea de quiebre se unen en orden de número de punto.** Un grupo puesto en {{ui:Línea de quiebre}} se vuelve una sola línea que pasa por todos sus puntos, en orden numérico. Códigos compartidos (dos líneas de flujo codificadas "FL") forman una línea en zigzag; dibujalas a mano.

**Las estaciones se ven iguales, los metros difieren.** Los pies usan estaciones de 100 ft (12+34.56); los metros usan estaciones de 1000 m (1+234.567).

**Eliminar en Mac.** La tecla de Mac rotulada delete es Backspace para el navegador. Usá Fn y delete, o el botón {{ui:Eliminar}}, para eliminar una selección.

**Los archivos son descargas.** {{ui:Guardar}} descarga un archivo `.civilcraft.json` cada vez; no hay "guardar sobre el archivo abierto". Una copia de recuperación del trabajo no guardado se conserva en este navegador ([Recuperar trabajo no guardado](common:recover)). Abrir un archivo de puntos reemplaza los puntos sin preguntar. Ver [Archivos que podés abrir, guardar y exportar](topic:files).

**Las reglas son tuyas.** Las reglas de la red de caños y el ensamble del corredor empiezan con valores de marcador que no son una norma. Fijá los tuyos antes de confiar en cualquier verificación.

**Los volúmenes se calculan por grilla.** El corte y el relleno salen de una grilla fina entre las dos superficies, dentro de las líneas de empalme, sin esponjamiento ni contracción. Están cerca de un volumen TIN a TIN, pero no son lo mismo.

## Lo que falta

Espirales que no son clotoides, ensambles que cambian a lo largo de la ruta, plataformas con pendiente, capacidad de sumideros y retención, catálogos de partes, caños en perfil, diseño de parcelas y dimensionamiento de lotes, ajuste por mínimos cuadrados y bases de datos de relevamiento, abrir DWG, y más. La lista completa, con lo que conviene hacer hoy en su lugar, está en [Todavía no construido](topic:not-built-yet).
