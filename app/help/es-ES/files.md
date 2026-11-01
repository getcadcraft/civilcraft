---
title: Archivos que puede abrir, guardar y exportar
summary: Archivos de puntos, LandXML y proyectos de CivilCraft de entrada; proyectos, LandXML, DXF y PDF de salida; qué conserva cada uno, dónde se guardan los archivos y qué cambia sin conexión.
keywords: abrir, guardar, exportar, importar, formatos de archivo, csv, txt, landxml, xml, dxf, pdf, json, descargar, archivo de proyecto
from: a7debb61
---

CivilCraft abre archivos de su ordenador y guarda descargándolos de nuevo en él. No se sube nada y nada se conserva en un servidor. Véase también [Sus archivos](common:your-files).

## Qué abre

Haga clic en {{ui:Abrir}} (o pulse {{key:Mod+O}}) y elija un archivo, o arrastre el archivo desde {{pick:mac=Finder|windows=Explorador de archivos|linux=su gestor de archivos}} hasta el plano. Un archivo cada vez; los archivos de más de 200 MB se rechazan.

| Tipo | Nombres de archivo | Qué ocurre |
|---|---|---|
| Archivo de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (cualquier archivo de texto) | Se abre el cuadro **Importar puntos**. Los puntos sustituyen a los puntos del proyecto; los alineamientos, las plataformas y las tuberías se mantienen. |
| LandXML | `.xml`, `.landxml` | Se crea un **nuevo proyecto** a partir del archivo (antes se le pregunta si el actual tiene cambios sin guardar). |
| Proyecto de CivilCraft | `.civilcraft.json` (cualquier `.json`) | El proyecto se abre tal como se guardó (antes se le pregunta si el actual tiene cambios sin guardar). |

CivilCraft decide por la extensión del archivo y, después, por sus primeros caracteres: el texto que empieza por `{` se lee como proyecto, el que empieza por `<` como LandXML, y cualquier otro como archivo de puntos. Un archivo que el cuadro de apertura muestra atenuado todavía se puede soltar sobre el plano.

:::note
Importar un archivo de puntos en un proyecto que ya tiene puntos los sustituye sin preguntar, y borra el historial de deshacer (abrir cualquier archivo es un inicio nuevo para deshacer). Si la superficie procedía de un LandXML, importar puntos la vuelve a convertir en una superficie construida a partir de los puntos. Guarde antes si puede que desee recuperar los puntos anteriores.
:::

Más detalles: [Formatos de archivo de puntos](topic:point-file-formats), [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

## Qué guarda

{{ui:Guardar}} ({{key:Mod+S}}) escribe dos archivos uno junto a otro, con el nombre indicado en **Nombre** del panel izquierdo: `<nombre>.civilcraft.json`, el proyecto que sigue editando, y `<nombre>.ifc`, el mismo diseño en IFC 4.3 para cualquier otro programa (véase [Exportación e importación IFC](topic:ifc)). Cada archivo registra al otro, y el IFC también incluye una copia comprimida del proyecto, de modo que un IFC enviado por sí solo sigue abriéndose por completo y editable.

- **En Studio** ambos archivos se escriben uno al lado del otro, en su sitio.
- **En Chrome y Edge** el primer guardado pide una carpeta y escribe ambos en ella; los guardados posteriores van a la misma carpeta. Cancele la pregunta de la carpeta para descargar ambos en su lugar.
- **En otros navegadores** ambos archivos se descargan, primero el de proyecto.

Al abrir cualquiera de los dos archivos, CivilCraft busca el otro. Abra ambos a la vez (o suéltelos juntos), o abra uno: en Studio el otro se encuentra en la misma carpeta; en un navegador CivilCraft le pide que lo añada, o que continúe con el que tiene. Si otro programa modificó el IFC después de que CivilCraft lo guardara, o si un archivo es más antiguo que el otro, el proyecto se abre a partir del diseño más reciente y el panel de Problemas explica lo ocurrido, con **{{ui:Guardar ahora}}** (vuelve a escribir ambos archivos) y **{{ui:Mostrar la geometría del IFC como referencia}}**. Un IFC por sí solo que otro programa modificó se abre desde su copia del proyecto con lo que todavía coincide: los alineamientos que cambió toman su geometría, los objetos que eliminó se dejan fuera, y el resto de sus cambios se listan, sin aplicarse. Un archivo de proyecto anterior a la versión 0.7.1 se abre como antes.

El archivo de proyecto conserva:

- cada punto (número, coordenadas, cota y descripción) y el nombre del archivo de puntos de donde proceden
- los ajustes de la superficie: opciones de grupo, líneas de rotura dibujadas, el contorno, el borde exterior más largo y una TIN leída de LandXML
- los ajustes de visualización
- los alineamientos con sus PI, radios y estación inicial, sus perfiles de proyecto (PVI y longitudes de curva) y los ajustes de corredor
- las plataformas y la red de tuberías con sus reglas

No conserva el historial de deshacer. Las superficies, curvas de nivel, líneas de talud y volúmenes no se almacenan; se reconstruyen a partir de los datos guardados cuando se abre el proyecto. Un archivo de proyecto de una versión más reciente de CivilCraft se rechaza con un mensaje que indica su versión.

## Qué exporta

| Botón | Archivo | Contenido |
|---|---|---|
| {{ui:LandXML}} | `<nombre>.xml` | LandXML 1.2: puntos, el terreno existente (y la superficie explanada, si la hay) como superficies TIN, alineamientos, perfiles del terreno y de proyecto, la red de tuberías |
| {{ui:DXF}} | `<nombre>.dxf` | DXF R12 de la geometría del plano tal como se muestra, en capas con nombre |
| {{ui:DWG}} | `<nombre>.dwg` | La misma geometría como dibujo DWG, en el formato que elija (de 2000 a 2018) |
| {{ui:PDF}} | `<nombre>.pdf` | Un trazado vectorial del plano en una hoja, a la escala que elija |
| {{ui:GLB}} u {{ui:OBJ}} (en la barra de la vista 3D) | `<nombre>-3d.glb`, `<nombre>-3d.obj` | Lo que muestra la vista 3D como modelo 3D: metros, eje Y hacia arriba, escala real, alrededor de un origen local registrado |

Lo que omite cada uno: [LandXML de intercambio](topic:landxml), [Exportar el plano a DXF](topic:dxf-export) (también DWG), [Trazar el plano a PDF](topic:plot-pdf), [Exportar el terreno en 3D](topic:export-3d).

## Dónde se guardan los archivos

Los archivos guardados y exportados van a donde su navegador coloque las descargas, normalmente la carpeta Descargas. Para elegir una carpeta cada vez:

:::chromium
Abra la **Configuración** del navegador, después **Descargas**, y active **Preguntar dónde guardar cada archivo antes de descargarlo**.
:::

:::firefox
Abra **Ajustes**, después **General**, y en **Archivos y aplicaciones** elija **Preguntar siempre dónde guardar los archivos**.
:::

:::safari
Abra **Safari > Ajustes > General** y en **Ubicación de descarga de archivos** elija **Preguntar en cada descarga**.
:::

Si guarda dos veces con el mismo nombre, el navegador puede añadir un número al segundo archivo, por ejemplo `Obra (1).civilcraft.json`. Abra la más reciente la próxima vez.

## Con y sin conexión

CivilCraft funciona solo en su ordenador en cualquier caso: al abrir se lee el archivo en el navegador, y al guardar se descarga. Para abrir CivilCraft sin ninguna conexión, guárdelo primero para uso sin conexión:

1. Con conexión, haga clic en {{ui:Guardar para uso sin conexión}} en la barra superior de la aplicación.
2. El botón cuenta ("Guardando 12 de 30") y después muestra {{ui:Listo sin conexión}}. CivilCraft es pequeño (unos 0,6 MB), así que esto tarda un momento. La copia guardada incluye esta ayuda y el sitio de ejemplo.
3. Sin conexión, abra la misma dirección (o un marcador de ella). Todo funciona, incluido {{ui:Abrir el sitio de ejemplo}}.

Los otros estados del botón:

- {{ui:No se pudo guardar}}: algunos archivos no se descargaron. Compruebe la conexión y haga clic para volver a intentarlo.
- {{ui:Sin conexión no disponible}}: esta ventana del navegador no puede conservar una copia sin conexión (las ventanas privadas y algunos equipos administrados lo bloquean). Use una ventana normal.

Haga clic en {{ui:Listo sin conexión}} para ver cuándo se guardó la copia, con dos opciones: {{ui:Guardar de nuevo (obtener la versión más reciente)}} y {{ui:Quitar la copia sin conexión}}. Guarde de nuevo antes de una visita a obra para que la copia coincida con la versión más reciente. Más información en [Sin conexión](common:offline).

:::offline
Ahora mismo no tiene conexión. Si CivilCraft se guardó para uso sin conexión, todo funciona, incluido el sitio de ejemplo. Si no, siga trabajando en esta pestaña, pero no la recargue hasta que vuelva a tener conexión; sin una copia guardada, {{ui:Abrir el sitio de ejemplo}} falla con "El ejemplo no se pudo cargar".
:::

:::tip
Para trabajar en obra, guarde CivilCraft para uso sin conexión y lleve sus archivos de puntos en el propio portátil. Los proyectos y las exportaciones se guardan como descargas sin conexión, así que puede importar las mediciones de un día, revisar la superficie y guardar el proyecto en obra.
:::

El guardado en la nube todavía no está disponible, y las versiones de escritorio tampoco. Por ahora, los archivos que guarde son la única copia: guárdelos en un lugar con copia de seguridad.

## Complementos que usa un archivo

Cuando guarda un proyecto que contiene datos de un complemento (las casillas de normativa de edificación, o una fuente «Dirección a emplazamiento»), el archivo registra qué complementos y qué versiones. Si lo abre en un equipo que no tiene alguno, una barra sobre el plano lo indica y ofrece añadirlo desde la lista de su cuenta. El registro es solo una nota: el archivo se abre de todos modos.

## Deshacer desde Studio

Dentro de CadCraft Studio, cada paso que termina en CivilCraft se comunica a Studio, de modo que su función de deshacer a nivel de proyecto puede revertir el último paso entre aplicaciones. Studio solo deshace un paso cuando la pila de deshacer de CivilCraft está exactamente como ese paso la dejó; después de abrir otro archivo, omite esta ventana.

## Cierre con cambios sin guardar

Cuando el proyecto tiene cambios sin guardar y cierra la pestaña, recarga la página o sale de ella, el navegador pregunta si desea salir. Su redacción y su aspecto corresponden al navegador y CivilCraft no puede cambiarlos. {{ui:Nuevo}}, y abrir un proyecto o un archivo LandXML, preguntan en cambio en el propio cuadro **Cambios sin guardar** de CivilCraft, con {{ui:Cancelar}}, {{ui:No guardar}} y {{ui:Guardar una copia}}.
