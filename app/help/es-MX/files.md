---
title: Archivos que puede abrir, guardar y exportar
summary: Archivos de puntos, LandXML y proyectos de CivilCraft de entrada; proyectos, LandXML, DXF y PDF de salida; qué conserva cada uno, a dónde van los archivos y qué cambia sin conexión.
keywords: abrir, guardar, exportar, importar, formatos de archivo, csv, txt, landxml, xml, dxf, pdf, json, descargar, archivo de proyecto
from: a7debb61
---

CivilCraft abre archivos de su computadora y guarda descargándolos de vuelta a ella. No se sube nada y nada se guarda en un servidor. Vea también [Sus archivos](common:your-files).

## Qué abre

Haga clic en {{ui:Abrir}} (o pulse {{key:Mod+O}}) y elija un archivo, o arrastre el archivo desde {{pick:mac=Finder|windows=Explorador de archivos|linux=su administrador de archivos}} hasta el plano. Un archivo a la vez; los archivos de más de 200 MB se rechazan.

| Tipo | Nombres de archivo | Qué sucede |
|---|---|---|
| Archivo de puntos | `.csv`, `.txt`, `.pnt`, `.xyz` (cualquier archivo de texto) | Se abre el cuadro **Importar puntos**. Los puntos reemplazan los puntos del proyecto; las alineaciones, las plataformas y las tuberías se conservan. |
| LandXML | `.xml`, `.landxml` | Se crea un **proyecto nuevo** a partir del archivo (antes se le pregunta si el actual tiene cambios sin guardar). |
| Proyecto de CivilCraft | `.civilcraft.json` (cualquier `.json`) | El proyecto se abre tal como se guardó (antes se le pregunta si el actual tiene cambios sin guardar). |

CivilCraft decide por la terminación del archivo y luego por sus primeros caracteres: el texto que empieza con `{` se lee como proyecto, el que empieza con `<` como LandXML, y cualquier otro como archivo de puntos. Un archivo que el cuadro de abrir muestra en gris todavía puede soltarse sobre el plano.

:::note
Importar un archivo de puntos a un proyecto que ya tiene puntos los reemplaza sin preguntar, y borra el historial de deshacer (abrir cualquier archivo es un inicio nuevo para deshacer). Si la superficie vino de LandXML, al importar puntos vuelve a ser una superficie construida a partir de los puntos. Guarde primero si después podría querer los puntos anteriores.
:::

Detalles: [Formatos de archivo de puntos](topic:point-file-formats), [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

## Qué guarda

{{ui:Guardar}} ({{key:Mod+S}}) escribe dos archivos uno junto al otro, con el nombre indicado en **Nombre** en el panel izquierdo: `<nombre>.civilcraft.json`, el proyecto que sigue editando, y `<nombre>.ifc`, el mismo diseño en IFC 4.3 para cualquier otro programa (vea [Exportación e importación de IFC](topic:ifc)). Cada archivo registra al otro, y el IFC también lleva una copia comprimida del proyecto, de modo que un IFC enviado solo se sigue abriendo completo y editable.

- **En Studio** ambos archivos se escriben uno junto al otro, en su lugar.
- **En Chrome y Edge** el primer guardado pide una carpeta y escribe ambos en ella; los guardados posteriores van a la misma carpeta. Cancele la pregunta de la carpeta para descargar ambos en cambio.
- **En otros navegadores** ambos archivos se descargan, primero el archivo del proyecto.

Al abrir cualquiera de los dos archivos se busca el otro. Abra ambos juntos (o suéltelos juntos), o abra uno solo: en Studio el otro se encuentra en la misma carpeta; en un navegador CivilCraft le pide que lo agregue, o que continúe con el que tiene. Si otro programa cambió el IFC después de que CivilCraft lo guardó, o si uno de los archivos es más antiguo que el otro, el proyecto se abre desde el diseño más reciente y el panel Problemas explica lo ocurrido, con **Guardar ahora** (vuelve a escribir ambos archivos) y **Mostrar la geometría del IFC como referencia**. Un IFC solo que otro programa cambió se abre desde su copia del proyecto con lo que todavía coincide: las alineaciones que cambió toman su geometría, los objetos que eliminó se dejan fuera, y el resto de sus cambios se listan, no se aplican. Un archivo de proyecto anterior a la 0.7.1 se abre como antes.

El archivo de proyecto conserva:

- cada punto (número, coordenadas, elevación y descripción) y el nombre del archivo de puntos del que venían
- la configuración de la superficie: opciones de grupo, líneas de quiebre dibujadas, el límite, el borde exterior más largo y una TIN leída de LandXML
- la configuración de visualización
- las alineaciones con sus PI, radios y estación inicial, sus perfiles de diseño (PVI y longitudes de curva) y la configuración de obra lineal
- las plataformas y la red de tuberías con sus reglas

No conserva el historial de deshacer. Las superficies, las curvas de nivel, las líneas de corte y los volúmenes no se guardan; se reconstruyen a partir de los datos guardados cuando se abre el proyecto. Un archivo de proyecto de un CivilCraft más nuevo se rechaza con un mensaje que indica su versión.

## Qué exporta

| Botón | Archivo | Contenido |
|---|---|---|
| {{ui:LandXML}} | `<nombre>.xml` | LandXML 1.2: puntos, el terreno existente (y la superficie de diseño cuando existe) como superficies TIN, alineaciones, perfiles del terreno y de diseño, y la red de tuberías |
| {{ui:DXF}} | `<nombre>.dxf` | DXF R12 de la planta tal como se muestra, en capas con nombre |
| {{ui:DWG}} | `<nombre>.dwg` | La misma geometría como dibujo DWG, en el formato que elija (2000 a 2018) |
| {{ui:PDF}} | `<nombre>.pdf` | Trazado vectorial de la planta en una hoja, a la escala que elija |
| {{ui:GLB}} u {{ui:OBJ}} (en la barra de la vista 3D) | `<nombre>-3d.glb`, `<nombre>-3d.obj` | Lo que muestra la vista 3D como modelo 3D: metros, eje Y hacia arriba, escala real, alrededor de un origen local registrado |

Lo que deja fuera cada uno: [Intercambio LandXML](topic:landxml), [Exportar la planta a DXF](topic:dxf-export) (DWG también), [Trazar la planta a PDF](topic:plot-pdf), [Exportar el sitio en 3D](topic:export-3d).

## Dónde van los archivos

Los archivos guardados y exportados van a donde su navegador ponga las descargas, normalmente la carpeta Descargas. Para elegir una carpeta cada vez:

:::chromium
Abra la **Configuración** del navegador, luego **Descargas**, y active **Preguntar dónde guardar cada archivo antes de descargarlo**.
:::

:::firefox
Abra **Configuración**, luego **General**, y en **Archivos y aplicaciones** elija **Preguntar siempre dónde guardar los archivos**.
:::

:::safari
Abra **Safari > Configuración > General** y ajuste **Ubicación de descarga de archivos** en **Preguntar en cada descarga**.
:::

Si guarda dos veces con el mismo nombre, el navegador puede agregar un número al segundo archivo, por ejemplo `Sitio (1).civilcraft.json`. La próxima vez, abra el más reciente.

## En línea y sin conexión

CivilCraft funciona solo en su computadora en cualquier caso: abrir lee el archivo en el navegador, y guardar lo descarga. Para abrir CivilCraft sin ninguna conexión, guárdelo primero para uso sin conexión:

1. Estando en línea, haga clic en {{ui:Guardar para usar sin conexión}} en la barra de la aplicación, arriba.
2. El botón cuenta hacia arriba ("Guardando 12 de 30") y luego muestra {{ui:Lista sin conexión}}. CivilCraft es pequeño (unos 0.6 MB), así que esto toma un momento. La copia guardada incluye esta ayuda y el sitio de ejemplo.
3. Sin conexión, abra la misma dirección (o un marcador de ella). Todo funciona, incluido {{ui:Abrir el sitio de ejemplo}}.

Los otros estados del botón son:

- {{ui:No se pudo guardar}}: algunos archivos no se descargaron. Revise la conexión y haga clic para intentarlo de nuevo.
- {{ui:Sin conexión no disponible}}: esta ventana del navegador no puede guardar una copia sin conexión (las ventanas privadas y algunas computadoras administradas lo bloquean). Use una ventana normal.

Haga clic en {{ui:Lista sin conexión}} para ver cuándo se guardó la copia, con dos opciones: {{ui:Guardar de nuevo (obtener la versión más reciente)}} y {{ui:Quitar la copia sin conexión}}. Guarde de nuevo antes de una visita a obra para que la copia coincida con la versión más reciente. Más en [Sin conexión](common:offline).

:::offline
Ahora mismo no tiene conexión. Si CivilCraft se guardó para uso sin conexión, todo funciona, incluido el sitio de ejemplo. Si no, siga trabajando en esta pestaña, pero no la recargue hasta tener conexión de nuevo; sin una copia guardada, {{ui:Abrir el sitio de ejemplo}} falla con "El ejemplo no se pudo cargar".
:::

:::tip
Para trabajo en campo, guarde CivilCraft para uso sin conexión y lleve sus archivos de puntos en la propia laptop. Los proyectos y las exportaciones se guardan como descargas sin conexión, así que puede importar las mediciones del día, revisar la superficie y guardar el proyecto en obra.
:::

Todavía no está disponible el guardado en la nube, y las versiones de escritorio aún no salen. Por ahora, los archivos que guarda son la única copia: guárdelos en un lugar que tenga respaldo.

## Complementos que usa un archivo

Cuando guarda un proyecto que contiene datos de un complemento (las casillas de Reglamentos de construcción, o una fuente Dirección a sitio), el archivo registra qué complementos y qué versiones. Ábralo en una computadora que no los tenga, y una barra sobre el plano lo indica y ofrece agregarlos desde la lista de su cuenta. El registro es solo una nota: el archivo se abre de todos modos.

## Deshacer desde Studio

Dentro de CadCraft Studio, cada paso que termina en CivilCraft se informa a Studio, de modo que su deshacer a nivel de proyecto puede revertir el último paso entre aplicaciones. Studio solo deshace un paso cuando la pila de deshacer de CivilCraft está exactamente como ese paso la dejó; después de abrir otro archivo, omite esta ventana.

## Cierre con cambios sin guardar

Cuando el proyecto tiene cambios sin guardar y cierra la pestaña, recarga la página o sale de ella, el navegador pregunta si desea salir. Su redacción y apariencia son del navegador, y CivilCraft no puede cambiarlas. {{ui:Nuevo}}, y abrir un proyecto o un archivo LandXML, en cambio, piden confirmación en el cuadro **Cambios sin guardar** propio de CivilCraft, con {{ui:Cancelar}}, {{ui:No guardar}} y {{ui:Guardar una copia}}.
