---
title: Viene de otro software civil
summary: Cómo los flujos de trabajo de diseño civil conocidos se corresponden con CivilCraft, y las diferencias que confunden a los usuarios experimentados en la primera hora.
keywords: cambio, migrar, conocido, diferencias, flujo de trabajo, comandos, correspondencia, cogo, obra lineal, nivelación, red de tuberías, estilos, línea de comandos
from: feae37d6
---

Si ha usado Civil 3D, ya conoce las ideas de CivilCraft: puntos y grupos de puntos, superficies TIN con líneas de ruptura y contornos, alineaciones por PI, perfiles por PIV, ensambles barridos en obras lineales, nivelación hasta empatar con el terreno, redes de tuberías por gravedad, LandXML. Lo que es distinto es casi todo lo que los rodea: no hay archivo de dibujo, no hay línea de comandos (salvo que elija el estilo de menú {{ui:Dibujo clásico}}), no hay estilos, no hay Prospector y no hay cuadros de configuración. CivilCraft es una herramienta pequeña y enfocada que funciona en un navegador, y en esta versión hace una fracción de lo que hace un paquete civil completo. Esta página relaciona lo que ya sabe con lo que hay aquí.

:::tip
Si le gusta la cinta de Civil 3D, elija el estilo de menú {{ui:Cinta civil}} en {{ui:Configuración}} › {{ui:CivilCraft}} › {{ui:Menús, teclas y ratón}}: pestañas Inicio, Superficies, Modificar, Geolocalización, Vista y Salida; el botón central encuadra, y {{key:Shift}} con el botón central orbita la vista 3D. Si escribe comandos, {{ui:Dibujo clásico}} agrega una línea de comandos (ALIGNMENT, PAD, PROFILE, ZOOM …). Vea [Menús, teclas y ratón](topic:menus-keys-and-mouse).
:::

## Mapa de flujo de trabajo

| Lo que quiere hacer | Forma conocida | En CivilCraft |
|---|---|---|
| Importar puntos de levantamiento | Importar puntos con un formato de archivo de puntos | {{ui:Abrir}}, luego revise el orden de columnas en **Importar puntos** ([Importar puntos de levantamiento](topic:import-points)) |
| Ordenar puntos | Grupos de puntos, claves de descripción | Grupos automáticos por la primera palabra de la descripción; sin claves de descripción |
| Editar un punto | Editor de puntos, pinzamientos | Haga clic en él y escriba en Propiedades, o arrástrelo ([Editar un punto de levantamiento](topic:edit-points)) |
| Construir el terreno existente | Crear superficie, agregar grupos de puntos como datos | Automático: la superficie se reconstruye cuando cambian sus entradas |
| Agregar líneas de ruptura | Agregar líneas de ruptura desde polilíneas o líneas de elemento | Establezca un grupo de puntos en {{ui:Línea de ruptura}}, o haga clic en puntos con la herramienta {{ui:Línea de ruptura}} ({{key:B}}) |
| Recortar la superficie | Contorno exterior, contorno de ocultación, longitud máxima de triángulo | {{ui:Contorno}} ({{key:O}}, solo exterior) y **Arista exterior más larga** |
| Mostrar curvas de nivel | Estilo de superficie | **Visualización** en el panel izquierdo: intervalo, cada cuántas mayores, etiquetas, bandas, flechas de pendiente |
| Trazar un eje | Herramientas de creación de alineaciones, configuración de curvas y espirales | {{ui:Alineación}} ({{key:A}}): haga clic en los PI, {{key:Enter}}; radios y longitudes de espiral en la tabla de PI |
| Crear una vista de perfil | Asistente de vista de perfil, bandas | {{ui:Perfil}} ({{key:R}}): una vista de perfil bajo la planta, siempre ajustada |
| Diseñar la pendiente | Herramientas de diseño de perfil | {{ui:Iniciar desde el terreno}}, {{ui:Agregar PIV}} ({{key:I}}), arrastrar PIV, escribir **Curva L** |
| Construir una vía | Ensamble, subensambles, corredor, objetivos, regiones | Marque **Barrer un ensamble a lo largo del perfil de diseño** bajo la alineación; un carril, un acotamiento y un talud a cada lado, o cada lado construido con partes (cuneta, guarnición, banqueta …) |
| Nivelar una plataforma | Líneas de elemento, grupos de nivelación, criterios de nivelación | {{ui:Plataforma}} ({{key:G}}): una plataforma plana con taludes de corte y relleno hasta empatar con el terreno |
| Calcular movimiento de tierras | Superficies de volumen, tablero de volúmenes | **Movimiento de tierras** en el panel derecho, método de malla, se actualiza en vivo |
| Trazar drenaje pluvial o sanitario | Red de tuberías con lista de partes, reglas | {{ui:Tuberías}} ({{key:P}}): haga clic en las estructuras aguas abajo; tres reglas que usted define; cotas de fondo automáticas |
| Intercambiar con otros | Importación y exportación LandXML | {{ui:Abrir}} un archivo LandXML; {{ui:LandXML}} para exportar ([Intercambiar LandXML](topic:landxml)) |
| Enviar trazos a CAD | Exportar a DWG | {{ui:DWG}} (formato 2000 a 2018) o {{ui:DXF}} (R12) |
| Trazado | Presentaciones, ventanas gráficas, juegos de hojas | {{ui:PDF}}: una hoja horizontal de la planta a una escala elegida; hojas de planta, de perfil y de sección como PDF |
| Compartir trabajo entre archivos | Accesos de datos, referencias | No disponible: un proyecto por archivo |
| Deshacer | Deshacer | {{key:Mod+Z}} y {{key:Mod+Y}}, 200 pasos; los ajustes de visualización no son pasos de deshacer |

## Diferencias que confunden a la gente

**No hay línea de comandos** a menos que elija el estilo de menú {{ui:Dibujo clásico}}. Las herramientas son botones de la barra de herramientas y letras sueltas: {{key:A}} alineación, {{key:G}} plataforma, {{key:P}} tuberías, {{key:B}} línea de ruptura, {{key:O}} contorno, {{key:R}} perfil, {{key:I}} agregar PIV, {{key:V}} seleccionar, {{key:F}} ajustar. En los otros estilos de menú, escribir un nombre de comando no hace nada. Vea [Teclas y ratón](topic:keyboard).

**Enter termina; el doble clic es riesgoso.** Haga clic una vez en el último punto y luego pulse {{key:Enter}}. En esta versión un doble clic también termina, pero elimina el punto en el que hizo doble clic. El clic derecho no termina ni repite; solo encuadra cuando arrastra con él.

**Todo es dinámico, todo el tiempo.** Cambie un grupo de puntos, un radio, un PIV o la pendiente de una plataforma, y la superficie, las curvas de nivel, el corredor, las líneas de corte y relleno y los volúmenes se actualizan de inmediato. No hay nada que reconstruir y nada queda desactualizado.

**Nada es un objeto de dibujo.** La planta es una vista del diseño, no un dibujo que pueda editar con comandos CAD. No puede agregar sus propias líneas o textos, cambiar el color de una capa ni descomponer nada. Exporte a DXF y termine el dibujo en un programa CAD.

**Sin estilos.** Colores, grosores de línea, tamaños de etiqueta y nombres de capa son fijos (vea [Capas de la planta](topic:plan-layers)). Papel y Modelo en la barra de la aplicación alternan entre una pantalla clara y una oscura.

**Uno de cada uno.** Una superficie de terreno existente, un resultado nivelado y una red de tuberías por proyecto. Muchas alineaciones y plataformas están bien.

**Las unidades son etiquetas.** Elegir {{ui:Pies de EE. UU.}} o {{ui:Metros}} no convierte nada. No hay escala de dibujo. Un sistema de coordenadas es opcional: establézcalo en {{ui:Coordenadas}} y nada se mueve; solo indica qué significan los números (vea [Establecer el sistema de coordenadas del proyecto](topic:coordinate-systems)). Los pies se tratan como pies de agrimensura de EE. UU. al escribirse en LandXML.

**Los grupos de líneas de ruptura se unen en orden de número de punto.** Un grupo configurado como {{ui:Línea de ruptura}} se convierte en una sola línea que pasa por todos sus puntos, en orden numérico. Los códigos compartidos (dos líneas de flujo codificadas como "FL") forman una sola línea en zigzag; dibújelas a mano.

**Las estaciones se ven igual; los metros cambian.** Los pies usan estaciones de 100 ft (12+34.56); los metros usan estaciones de 1000 m (1+234.567).

**Eliminar en un Mac.** La tecla marcada *delete* equivale a Backspace en el navegador. Use Fn y delete, o el botón {{ui:Eliminar}}, para borrar una selección.

**Los archivos son descargas.** {{ui:Guardar}} descarga un archivo `.civilcraft.json` cada vez; no existe "guardar sobre el archivo abierto". Una copia de recuperación de los cambios sin guardar se conserva en este navegador ([Recuperar cambios sin guardar](common:recover)). Abrir un archivo de puntos reemplaza los puntos sin preguntar. Vea [Archivos que puede abrir, guardar y exportar](topic:files).

**Las reglas son suyas.** Las reglas de la red de tuberías y el ensamble del corredor empiezan con valores de ejemplo que no son una norma. Establezca los suyos antes de confiar en cualquier verificación.

**Los volúmenes se basan en malla.** El corte y el relleno provienen de una malla fina entre las dos superficies, dentro de las líneas de corte y relleno, sin abundamiento ni contracción. Son parecidos, pero no iguales, a un volumen TIN a TIN.

## Lo que falta

Espirales distintas de la clotoide, ensambles que cambian a lo largo de la vía, plataformas inclinadas, capacidad de coladeras y de retención, catálogos de partes, tuberías en perfil, diseño de parcelas y dimensionamiento de lotes, ajuste por mínimos cuadrados y bases de datos topográficas, abrir DWG, y más. La lista completa, con lo que debe hacer hoy, está en [Aún no construido](topic:not-built-yet).
