---
title: Si viene de otro software civil
summary: Cómo los flujos de trabajo de diseño civil conocidos se corresponden con CivilCraft, y las diferencias que confunden a los usuarios experimentados en la primera hora.
keywords: cambio, migración, familiar, diferencias, flujo de trabajo, comandos, correspondencia, cogo, corredor, explanación, red de tuberías, estilos, línea de comandos
from: feae37d6
---

Si ha usado Civil 3D, ya conoce las ideas de CivilCraft: puntos y grupos de puntos, superficies TIN con líneas de ruptura y contornos, alineaciones por PI, perfiles por PIV, ensamblajes barridos en corredores, explanación hasta el terreno natural, redes de tuberías por gravedad, LandXML. Lo que cambia es casi todo lo que las rodea: no hay archivo de dibujo, no hay línea de comandos (salvo que elija el estilo de menú {{ui:Dibujo clásico}}), no hay estilos, no hay Prospector ni diálogos de configuración. CivilCraft es una herramienta pequeña y centrada, en un navegador, y en esta versión hace una fracción de lo que hace un paquete civil completo. Esta página relaciona lo que ya sabe con lo que hay aquí.

:::tip
Si le gusta la cinta de Civil 3D, elija el estilo de menú {{ui:Cinta civil}} en {{ui:Configuración}} › {{ui:CivilCraft}} › {{ui:Menús, teclas y ratón}}: pestañas Inicio, Superficies, Modificar, Geolocalización, Vista y Salida; el botón central desplaza la vista, y {{key:Shift}} con el botón central orbita la vista 3D. Si escribe comandos, {{ui:Dibujo clásico}} añade una línea de comandos (ALIGNMENT, PAD, PROFILE, ZOOM …). Consulte [Menús, teclas y ratón](topic:menus-keys-and-mouse).
:::

## Mapa de flujos de trabajo

| Lo que quiere hacer | Forma habitual | En CivilCraft |
|---|---|---|
| Importar puntos topográficos | Importar puntos con un formato de archivo de puntos | {{ui:Abrir}}, y después revise el orden de las columnas en **Importar puntos** ([Importar puntos topográficos](topic:import-points)) |
| Ordenar puntos | Grupos de puntos, claves de descripción | Grupos automáticos por la primera palabra de la descripción; no hay claves de descripción |
| Editar un punto | Editor de puntos, agarres | Haga clic en él y escriba en Propiedades, o arrástrelo ([Editar un punto topográfico](topic:edit-points)) |
| Construir el terreno existente | Crear una superficie, añadir grupos de puntos como datos | Automático: la superficie se reconstruye cada vez que cambian sus entradas |
| Añadir líneas de ruptura | Añadirlas desde polilíneas o líneas características | Ponga un grupo de puntos en {{ui:Línea de ruptura}}, o haga clic en puntos con la herramienta {{ui:Línea de ruptura}} ({{key:B}}) |
| Recortar la superficie | Contorno exterior, contorno de ocultación, longitud máxima de triángulo | {{ui:Contorno}} ({{key:O}}, solo exterior) y **Arista exterior más larga** |
| Mostrar curvas de nivel | Estilo de superficie | **Visualización** en el panel izquierdo: intervalo, principal cada, etiquetas, bandas, flechas de pendiente |
| Trazar un eje | Herramientas de creación de alineaciones, ajustes de curva y espiral | {{ui:Alineación}} ({{key:A}}): haga clic en los PI, {{key:Enter}}; radios y longitudes de espiral en la tabla de PI |
| Crear una vista de perfil | Asistente de vista de perfil, bandas | {{ui:Perfil}} ({{key:R}}): una vista de perfil bajo el plano, siempre ajustada |
| Diseñar la rasante | Herramientas de diseño de perfil | {{ui:Iniciar desde el terreno}}, {{ui:Añadir PIV}} ({{key:I}}), arrastrar PIV, escribir **Curva L** |
| Construir una carretera | Ensamblaje, subensamblajes, corredor, objetivos, regiones | Marque **Barrer un ensamblaje a lo largo del perfil de proyecto** bajo la alineación; un carril, arcén y talud a cada lado, o cada lado construido con partes (cuneta, bordillo, acera …) |
| Explanar una plataforma | Líneas características, grupos de explanación, criterios de explanación | {{ui:Plataforma}} ({{key:G}}): una plataforma plana con taludes de desmonte y terraplén hasta el terreno |
| Calcular movimiento de tierras | Superficies de volumen, panel de volúmenes | **Movimiento de tierras** en el panel derecho, método de malla, se actualiza en vivo |
| Trazar pluviales o saneamiento | Red de tuberías con lista de piezas, reglas | {{ui:Tuberías}} ({{key:P}}): haga clic en las estructuras aguas abajo; tres reglas que usted define; cotas de solera automáticas |
| Intercambiar con otros | Importación y exportación LandXML | {{ui:Abrir}} un archivo LandXML; {{ui:LandXML}} para exportar ([Intercambiar LandXML](topic:landxml)) |
| Enviar líneas a CAD | Exportar a DWG | {{ui:DWG}} (formato 2000 a 2018) o {{ui:DXF}} (R12) |
| Imprimir | Presentaciones, ventanas gráficas, conjuntos de hojas | {{ui:PDF}}: una hoja apaisada del plano a una escala elegida; hojas de planta y de perfil, y hojas de secciones en PDF |
| Compartir trabajo entre archivos | Accesos a datos, referencias | No disponible: un proyecto por archivo |
| Deshacer | Deshacer | {{key:Mod+Z}} y {{key:Mod+Y}}, 200 pasos; los ajustes de visualización no son pasos de deshacer |

## Diferencias que confunden a la gente

**No hay línea de comandos** salvo que elija el estilo de menú {{ui:Dibujo clásico}}. Las herramientas son botones de la barra y letras sueltas: {{key:A}} alineación, {{key:G}} plataforma, {{key:P}} tuberías, {{key:B}} línea de ruptura, {{key:O}} contorno, {{key:R}} perfil, {{key:I}} añadir PIV, {{key:V}} seleccionar, {{key:F}} ajustar. En los otros estilos de menú, escribir un nombre de comando no hace nada. Consulte [Teclas y ratón](topic:keyboard).

**Intro termina; el doble clic es arriesgado.** Haga clic una vez en el último punto y después pulse {{key:Enter}}. En esta versión el doble clic también termina, pero elimina el punto sobre el que lo hizo. El clic derecho no termina ni repite la orden; solo desplaza la vista si lo arrastra.

**Todo es dinámico, siempre.** Cambie un grupo de puntos, un radio, un PIV o la pendiente de una plataforma, y la superficie, las curvas de nivel, el corredor, las líneas de talud y los volúmenes se actualizan al instante. No hay nada que reconstruir ni nada que quede desactualizado.

**Nada es un objeto de dibujo.** El plano es una vista del diseño, no un dibujo que pueda editar con comandos de CAD. No puede añadir sus propias líneas o textos, cambiar el color de una capa ni descomponer nada. Exporte a DXF y termine el dibujo en un programa de CAD.

**Sin estilos.** Los colores, los grosores de línea, los tamaños de etiqueta y los nombres de capa son fijos (consulte [Capas del plano](topic:plan-layers)). Papel y Modelo en la barra superior cambian entre una pantalla clara y una oscura.

**Uno de cada.** Una superficie de terreno existente, un resultado explanado y una red de tuberías por proyecto. Muchas alineaciones y plataformas están bien.

**Las unidades son etiquetas.** Elegir {{ui:Pies topográficos de EE. UU.}} o {{ui:Metros}} no convierte nada. No hay escala de dibujo. Un sistema de coordenadas es opcional: defínalo en {{ui:Coordenadas}} y nada se mueve; solo indica qué significan los números (consulte [Definir el sistema de coordenadas del proyecto](topic:coordinate-systems)). Los pies se tratan como pies topográficos de EE. UU. al escribir LandXML.

**Los grupos de línea de ruptura se unen en orden de número de punto.** Un grupo puesto en {{ui:Línea de ruptura}} se convierte en una sola línea que pasa por todos sus puntos, en orden numérico. Códigos compartidos (dos líneas de flujo codificadas como «FL») forman una línea en zigzag; dibújelas a mano.

**Las estaciones se ven igual, los metros difieren.** Los pies usan estaciones de 100 ft (12+34.56); los metros usan estaciones de 1000 m (1+234.567).

**Eliminar en un Mac.** La tecla marcada como delete en un Mac equivale a Backspace para el navegador. Use Fn y delete, o el botón {{ui:Eliminar}}, para borrar una selección.

**Los archivos son descargas.** {{ui:Guardar}} descarga un archivo `.civilcraft.json` cada vez; no hay «guardar sobre el archivo abierto». Una copia de recuperación del trabajo no guardado se conserva en este navegador ([Recuperar trabajo no guardado](common:recover)). Abrir un archivo de puntos sustituye los puntos sin preguntar. Consulte [Archivos que puede abrir, guardar y exportar](topic:files).

**Las reglas son suyas.** Las reglas de la red de tuberías y el ensamblaje del corredor empiezan con valores de marcador que no son una norma. Defina los suyos antes de confiar en cualquier comprobación.

**Los volúmenes se calculan por malla.** El desmonte y el terraplén salen de una malla fina entre las dos superficies, dentro de las líneas de talud, sin esponjamiento ni contracción. Son cercanos a, pero no iguales a, un volumen TIN a TIN.

## Lo que falta

Espirales distintas de la clotoide, ensamblajes que cambian a lo largo de la carretera, plataformas inclinadas, capacidad de sumideros y de retención, catálogos de piezas, tuberías en perfil, distribución de parcelas y dimensionado de lotes, ajuste por mínimos cuadrados y bases de datos topográficas, abrir DWG, y más. La lista completa, con lo que se puede hacer hoy en su lugar, está en [Aún no construido](topic:not-built-yet).
