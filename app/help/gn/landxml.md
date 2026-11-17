---
title: Intercambiar LandXML
summary: Abrir LandXML de otro software civil como un proyecto nuevo, exportar puntos, superficies, alineaciones, perfiles y la red de caños como LandXML 1.2, y saber qué no viaja.
keywords: landxml, xml, importar, exportar, intercambio, tin, superficie, alineación, perfil, red de caños, interoperabilidad, intercambio de datos
from: 870d5ece
---

LandXML es el formato de intercambio abierto que la mayoría de los programas civiles leen y escriben. CivilCraft lee y escribe LandXML 1.2. Si usaste Civil 3D, sus diálogos de importación y exportación de LandXML son lo más parecido; acá no hay opciones que elegir, y las notas te dicen qué quedó afuera.

## Abrir un archivo LandXML

1. Hacé clic en {{ui:Open}} (o presioná {{key:Mod+O}}) y elegí el archivo `.xml` o `.landxml`, o soltalo sobre el plano.
2. Si el proyecto actual tiene cambios sin guardar, CivilCraft pregunta primero. Elegí {{ui:Save a copy}}, {{ui:Don’t save}} o {{ui:Cancel}}.
3. Se crea un **proyecto nuevo**. La barra de estado dice qué se leyó, por ejemplo "Opened site.xml: 412 points, 2 surfaces, 3 alignments."
4. Mirá el cuadro debajo de los datos de la **Superficie**. Lista todo lo que se omitió o cambió, por ejemplo:
   - "Only the first surface ("EG") was opened; the file has 1 more."
   - "Alignment "Ramp A" has elements CivilCraft cannot draw yet (not lines, arcs or clothoid spirals); it was skipped."
   - "Pipe network rules were not in the file; the placeholders are in use — set yours under Project."

Qué se convierte en qué:

| En el archivo | En CivilCraft |
|---|---|
| Units (Imperial o Metric) | Las **Unidades** del proyecto (pies o metros) |
| Project name | El **Nombre** del proyecto |
| CgPoints | Los puntos del proyecto; la descripción (o código) indica el grupo |
| La primera superficie TIN | El terreno existente, usado tal cual ("Surface (from LandXML)") |
| Cada alineación de líneas, arcos y espirales clotoides | Una alineación con sus PI, radios y longitudes de espiral reconstruidos desde las curvas |
| El primer perfil de diseño de cada alineación | Su perfil de diseño, con curvas verticales parabólicas |
| La primera red de caños | La red de caños, con sus bordes, sumideros y cotas de fondo |
| Líneas de elemento de líneas y arcos | Líneas de elemento, arcos conservados; desde otro programa empiezan como **Solo dibujado** |

La lista completa de elementos y atributos está en [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

:::note
Una superficie leída desde LandXML no se reconstruye cuando cambiás grupos de puntos o dibujás líneas de quiebre. Hacé clic en {{ui:Rebuild the surface from the points}} en la sección **Superficie** para construirla desde los puntos en su lugar ({{key:Mod+Z}} devuelve la superficie de LandXML).
:::

## Exportar LandXML

1. Hacé clic en {{ui:LandXML}} en el grupo **Exportar**.
2. El navegador descarga `<name>.xml`. La barra de estado dice qué se incluyó, por ejemplo "Exported LandXML 1.2: 276 points, 2 surfaces, 1 alignment, the pipe network. Pads are not part of LandXML here; the graded surface is."

El archivo contiene:

- **Units**: pies de relevamiento de EE. UU. o metros.
- **CgPoints**: cada punto con su número como nombre, su descripción y su grupo como código.
- **Surfaces**: el terreno existente como TIN, con sus líneas de quiebre y su límite exterior como datos de origen; y, cuando las plataformas o corredores nivelan, una segunda superficie TIN llamada "Proposed".
- **Alignments**: líneas, arcos y espirales clotoides con sus estaciones, cada uno con un perfil que contiene el terreno existente muestreado a lo largo y el perfil de diseño (PVI y curvas parabólicas) cuando tiene al menos dos PVI.
- **PipeNetworks**: estructuras con sus bordes, sumideros y cota de fondo por caño, y los caños con diámetro, longitud y pendiente.
- **PlanFeatures**: cada línea de elemento como líneas y arcos con la elevación en cada extremo, y para qué se usa.

## Qué no viaja

- Plataformas y corredores como objetos. Su resultado está en la superficie "Proposed".
- Alineaciones con errores (por ejemplo, curvas que se superponen): quedan afuera y se cuentan en el mensaje de estado.
- Caños sin ambas cotas de fondo, y redes con menos de dos estructuras.
- Un borde tomado de la superficie se escribe como borde fijo. Al volver a abrirlo, la estructura conserva ese número aunque la superficie cambie.
- Reglas de red (pendiente mínima, recubrimiento, caída): LandXML no tiene lugar para ellas.
- Configuraciones de pantalla y las opciones de superficie de los grupos de puntos: guardá un proyecto de CivilCraft para eso.

Al abrir, CivilCraft no lee espirales que no sean clotoides, superficies de grilla, puntos que solo se refieren a otros puntos, parcelas, espirales en líneas de elemento, vías o datos de relevamiento. Cada uno se nombra en las notas, nunca se adivina.

## Ida y vuelta

Para pasarle trabajo a alguien que usa otro software civil y recuperarlo, exportá LandXML, dejá que lo edite, y abrí su LandXML como proyecto nuevo. Guardá también tu `.civilcraft.json`: es el único archivo que conserva todo lo que CivilCraft sabe.
