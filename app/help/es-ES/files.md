---
title: Archivos que puede abrir, guardar y exportar
summary: Entrada de archivos de puntos, LandXML y proyectos de CivilCraft; salida de proyectos, LandXML, DXF y PDF. Qué conserva cada uno, dónde se guardan los archivos y qué cambia sin conexión.
keywords: abrir, guardar, exportar, importar, formatos de archivo, csv, txt, landxml, xml, dxf, pdf, json, descargar, archivo de proyecto
from: 82bff559
---

CivilCraft abre archivos de su equipo y guarda descargándolos de nuevo al equipo. No se sube nada y no se conserva nada en un servidor. Véase también [Sus archivos](common:your-files).

## Qué abre

Haga clic en {{ui:Abrir}} (o pulse {{key:Mod+O}}) y elija un archivo, o arrastre el archivo desde {{pick:mac=Finder|windows=Explorador de archivos|linux=su gestor de archivos}} hasta el plano. Un archivo cada vez; los archivos de más de 200 MB se rechazan. Un archivo LandXML o de proyecto de más de 32 MB se lee en fragmentos de unos 4 MB, nunca como un único bloque de texto. Mientras se abre un LandXML, cuente con que use en memoria unas 13 veces el tamaño del archivo (un archivo de 69 MB usó unos 0,9 GB en nuestra prueba).

| Tipo | Nombres de archivo | Qué ocurre |
|---|---|---|
| Archivo de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (cualquier archivo de texto) | Se abre el cuadro de diálogo **Importar puntos**. Los puntos sustituyen a los del proyecto; los alineamientos, las plataformas y las tuberías se mantienen. |
| LandXML | `.xml`, `.landxml` | Se crea un **proyecto nuevo** a partir del archivo (antes se le pregunta si el proyecto actual tiene cambios sin guardar). |
| Proyecto de CivilCraft | `.civilcraft.json` (cualquier `.json`) | El proyecto se abre tal como se guardó (antes se le pregunta si el proyecto actual tiene cambios sin guardar). |

CivilCraft decide según la terminación del archivo y, después, según sus primeros caracteres: un texto que empieza por `{` se lee como proyecto, uno que empieza por `<` como LandXML, y cualquier otro como archivo de puntos. Un archivo que el cuadro de apertura muestra atenuado todavía puede soltarse sobre el plano.

:::note
Importar un archivo de puntos en un proyecto que ya tiene puntos los sustituye sin preguntar, y borra el historial de deshacer (abrir cualquier archivo es un inicio nuevo para deshacer). Si la superficie procedía de un LandXML, importar puntos la vuelve a convertir en una superficie construida a partir de los puntos. Guarde antes si puede que necesite recuperar los puntos anteriores.
:::

Detalles: [Formatos de archivo de puntos](topic:point-file-formats), [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

## Qué guarda

{{ui:Guardar}} ({{key:Mod+S}}) escribe dos archivos juntos, con el nombre indicado en **Nombre** del panel izquierdo: `<nombre>.civilcraft.json`, el proyecto que sigue editando, y `<nombre>.ifc`, el mismo diseño en IFC 4.3 para otros programas (véase [Exportación e importación de IFC](topic:ifc)). Cada archivo hace referencia al otro, y el IFC además incluye una copia comprimida del proyecto, de modo que un IFC enviado por separado se sigue abriendo totalmente editable.

- **En Studio** ambos archivos se escriben uno junto al otro, en su sitio.
- **En Chrome y Edge** el primer guardado pide una carpeta y escribe ambos en ella; los guardados posteriores van a la misma carpeta. Cancele la pregunta de carpeta para descargar ambos archivos.
- **En otros navegadores** ambos archivos se descargan, primero el archivo de proyecto.

Al abrir cualquiera de los dos archivos se busca el otro. Abra ambos a la vez (o suéltelos juntos), o abra uno solo: en Studio el otro se encuentra en la misma carpeta; en un navegador CivilCraft le pide que lo añada, o que continúe solo con el que tiene. Si otro programa modificó el IFC después de que CivilCraft lo guardara, o si un archivo es más antiguo que el otro, el proyecto se abre desde el diseño más reciente y el panel de Problemas explica lo ocurrido, con **Guardar ahora** (vuelve a escribir ambos archivos) y **Mostrar la geometría del IFC como referencia**. Un IFC aislado que otro programa modificó se abre desde su copia del proyecto con lo que aún coincide: los alineamientos que modificó toman su geometría, los objetos que eliminó se omiten y el resto de sus cambios se enumera, pero no se aplica. Un archivo de proyecto anterior a la versión 0.7.1 se abre como antes.

El archivo de proyecto conserva:

- cada punto (número, coordenadas, cota, descripción) y el nombre del archivo de puntos del que procedían
- los ajustes de la superficie: opciones de grupo, líneas de rotura dibujadas, el contorno, el borde exterior más largo y una TIN leída de LandXML
- los ajustes de visualización
- los alineamientos con sus PI, radios y estación inicial, sus perfiles de proyecto (PVI y longitudes de curva) y los ajustes de corredor
- las plataformas y la red de tuberías con sus reglas

No conserva el historial de deshacer. Las superficies, las curvas de nivel, las líneas de terraplén y los volúmenes no se guardan; se recalculan a partir de los datos guardados al abrir el proyecto. Un archivo de proyecto de una versión más reciente de CivilCraft se rechaza con un mensaje que indica su versión.

## Qué exporta

| Botón | Archivo | Contenido |
|---|---|---|
| {{ui:LandXML}} | `<nombre>.xml` | LandXML 1.2: puntos, el terreno existente (y la superficie proyectada cuando existe) como superficies TIN, alineamientos, perfiles del terreno y de proyecto, la red de tuberías |
| {{ui:DXF}} | `<nombre>.dxf` | DXF R12 de las líneas del plano tal como se muestran, en capas con nombre |
| {{ui:DWG}} | `<nombre>.dwg` | Las mismas líneas como dibujo DWG, en el formato que elija (de 2000 a 2018) |
| {{ui:PDF}} | `<nombre>.pdf` | Un trazado vectorial del plano en una hoja, a la escala que elija |
| {{ui:GLB}} u {{ui:OBJ}} (en la barra de la vista 3D) | `<nombre>-3d.glb`, `<nombre>-3d.obj` | Lo que muestra la vista 3D como modelo 3D: en metros, eje Y hacia arriba, escala real, alrededor de un origen local registrado |

Lo que deja fuera cada uno: [LandXML de intercambio](topic:landxml), [Exportar el plano a DXF](topic:dxf-export) (también DWG), [Trazar el plano a PDF](topic:plot-pdf), [Exportar el emplazamiento en 3D](topic:export-3d).

## Dónde van los archivos

Los archivos guardados y exportados van a donde su navegador coloca las descargas, normalmente la carpeta Descargas. Para elegir una carpeta cada vez:

:::chromium
Abra la **Configuración** del navegador, luego **Descargas**, y active **Preguntar dónde guardar cada archivo antes de descargarlo**.
:::

:::firefox
Abra **Configuración**, luego **General**, y en **Archivos y aplicaciones** elija **Preguntar siempre dónde guardar los archivos**.
:::

:::safari
Abra **Safari > Configuración > General** y ponga **Ubicación de descarga de archivos** en **Preguntar en cada descarga**.
:::

Si guarda dos veces con el mismo nombre, el navegador puede añadir un número al segundo archivo, por ejemplo `Sitio (1).civilcraft.json`. La próxima vez, abra el más reciente.

## En línea y sin conexión

CivilCraft funciona solo en su equipo en cualquier caso: al abrir se lee el archivo en el navegador, y al guardar se descarga. Para abrir CivilCraft sin ninguna conexión, guárdelo antes para uso sin conexión:

1. Estando en línea, haga clic en {{ui:Guardar para uso sin conexión}} en la barra de aplicación superior.
2. El botón va contando ("Guardando 12 de 30") y después muestra {{ui:Listo sin conexión}}. CivilCraft es pequeño (unos 0,6 MB), así que tarda un momento. La copia guardada incluye esta ayuda y el sitio de ejemplo.
3. Sin conexión, abra la misma dirección (o un marcador de ella). Todo funciona, incluido {{ui:Abrir el sitio de ejemplo}}.

Los demás estados del botón:

- {{ui:No se pudo guardar}}: algunos archivos no se descargaron. Compruebe la conexión y haga clic para volver a intentarlo.
- {{ui:Sin conexión no disponible}}: esta ventana del navegador no puede conservar una copia sin conexión (las ventanas privadas y algunos equipos administrados lo bloquean). Use una ventana normal.

Haga clic en {{ui:Listo sin conexión}} para ver cuándo se guardó la copia, con dos opciones: {{ui:Guardar de nuevo (obtener la versión más reciente)}} y {{ui:Quitar la copia sin conexión}}. Guarde de nuevo antes de una visita a obra para que la copia coincida con la versión más reciente. Más información en [Sin conexión](common:offline).

:::offline
Ahora mismo no tiene conexión. Si CivilCraft se guardó para uso sin conexión, todo funciona, incluido el sitio de ejemplo. Si no, siga trabajando en esta pestaña, pero no la recargue hasta que vuelva a tener conexión; sin una copia guardada, {{ui:Abrir el sitio de ejemplo}} falla con «No se pudo cargar la muestra».
:::

:::tip
Para uso en campo, guarde CivilCraft para uso sin conexión y lleve los archivos de puntos en el propio portátil. Los proyectos y las exportaciones se guardan como descargas sin conexión, así que puede importar las mediciones de un día, revisar la superficie y guardar el proyecto en obra.
:::

Todavía no hay guardado en la nube, y las versiones de escritorio aún no están disponibles. Por ahora, los archivos que guarda son la única copia: guárdelos en un lugar que tenga copia de seguridad.

## Complementos que usa un archivo

Cuando guarda un proyecto que contiene datos de un complemento (las casillas de normativa de construcción, o una fuente de dirección a emplazamiento), el archivo registra qué complementos y qué versiones. Si lo abre en un equipo que no tiene alguno, una barra sobre el plano lo indica y ofrece añadirlo desde la lista de su cuenta. El registro es solo una nota: el archivo se abre de todos modos.

## Deshacer desde Studio

Dentro de CadCraft Studio, cada paso que termina en CivilCraft se comunica a Studio, de modo que su deshacer a nivel de proyecto puede anular el último paso entre aplicaciones. Studio solo deshace un paso cuando la pila de deshacer de CivilCraft está exactamente como ese paso la dejó; después de abrir otro archivo, omite esta ventana.

## Cerrar con cambios sin guardar

Cuando el proyecto tiene cambios sin guardar y cierra la pestaña, recarga la página o sale de ella, el navegador pregunta si quiere salir. Su texto y su aspecto son del navegador y CivilCraft no puede cambiarlos. {{ui:Nuevo}}, y abrir un proyecto o un archivo LandXML, preguntan en cambio en el cuadro propio de CivilCraft **Cambios sin guardar**, con {{ui:Cancelar}}, {{ui:No guardar}} y {{ui:Guardar una copia}}.
