---
title: Intercambiar LandXML
summary: Abra LandXML de otro software civil como proyecto nuevo, exporte puntos, superficies, trazados, perfiles y la red de tuberías como LandXML 1.2, y sepa qué no viaja.
keywords: landxml, xml, importar, exportar, intercambio, tin, superficie, trazado, perfil, red de tuberías, interoperabilidad, intercambio de datos
from: 870d5ece
---

LandXML es el formato de intercambio abierto que leen y escriben la mayoría de los programas civiles. CivilCraft lee y escribe LandXML 1.2. Si ha usado Civil 3D, sus diálogos de importación y exportación de LandXML son lo más parecido; aquí no hay opciones que elegir, y las notas le indican lo que se ha dejado fuera.

## Abrir un archivo LandXML

1. Haga clic en {{ui:Open}} (o pulse {{key:Mod+O}}) y elija el archivo `.xml` o `.landxml`, o suéltelo sobre la planta.
2. Si el proyecto actual tiene cambios sin guardar, CivilCraft pregunta antes. Elija {{ui:Save a copy}}, {{ui:Don’t save}} o {{ui:Cancel}}.
3. Se crea un **proyecto nuevo**. La barra de estado indica lo que se ha leído, por ejemplo "Abierto site.xml: 412 puntos, 2 superficies, 3 trazados."
4. Mire el recuadro bajo los datos de la **Superficie**. Enumera todo lo que se ha omitido o cambiado, por ejemplo:
   - "Solo se abrió la primera superficie ("EG"); el archivo tiene 1 más."
   - "El trazado "Rampa A" tiene elementos que CivilCraft todavía no puede dibujar (no son líneas, arcos ni espirales de clotoide); se omitió."
   - "Las reglas de la red de tuberías no estaban en el archivo; se usan valores provisionales; defina las suyas en Proyecto."

Esto es lo que se convierte en qué:

| En el archivo | En CivilCraft |
|---|---|
| Unidades (Imperial o Metric) | Las **Unidades** del proyecto (pies o metros) |
| Nombre del proyecto | El **Nombre** del proyecto |
| CgPoints | Los puntos del proyecto; la descripción (o el código) indica el grupo |
| La primera superficie TIN | El terreno existente, usado tal cual ("Surface (from LandXML)") |
| Cada trazado de líneas, arcos y espirales de clotoide | Un trazado con sus PI, radios y longitudes de espiral, reconstruidos a partir de las curvas |
| El primer perfil de proyecto de cada trazado | Su perfil de proyecto, con curvas verticales parabólicas |
| La primera red de tuberías | La red de tuberías, con sus brocales, sumideros y soleras |
| Elementos de planta de líneas y arcos | Líneas de elemento, con los arcos conservados; desde otro programa empiezan como **Solo dibujada** |

La lista completa de elementos y atributos está en [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

:::note
Una superficie leída de LandXML no se reconstruye al cambiar los grupos de puntos ni al dibujar líneas de rotura. Haga clic en {{ui:Rebuild the surface from the points}} en la sección **Superficie** para construirla a partir de los puntos ({{key:Mod+Z}} devuelve la superficie de LandXML).
:::

## Exportar LandXML

1. Haga clic en {{ui:LandXML}} en el grupo **Exportar**.
2. El navegador descarga `<name>.xml`. La barra de estado indica lo que se ha incluido, por ejemplo "Exportado LandXML 1.2: 276 puntos, 2 superficies, 1 trazado, la red de tuberías. Las plataformas no forman parte de LandXML aquí; sí la superficie explanada."

El archivo contiene:

- **Unidades**: pies de topografía de EE. UU. o metros.
- **CgPoints**: cada punto con su número como nombre, su descripción y su grupo como código.
- **Superficies**: el terreno existente como TIN, con sus líneas de rotura y su límite exterior como datos de origen; y, cuando las plataformas o los corredores explanan, una segunda superficie TIN llamada "Proposed".
- **Trazados**: líneas, arcos y espirales de clotoide con sus estaciones, cada uno con un perfil que contiene el terreno existente muestreado a lo largo de él, y el perfil de proyecto (PVI y curvas parabólicas) cuando tiene al menos dos PVI.
- **PipeNetworks**: estructuras con sus brocales, sumideros y solera por tubería, y las tuberías con diámetro, longitud y pendiente.
- **PlanFeatures**: cada línea de elemento como líneas y arcos, con la cota en cada extremo y para qué se usa.

## Lo que no viaja

- Plataformas y corredores como objetos. Su resultado está en la superficie "Proposed".
- Trazados con errores (por ejemplo, curvas que se solapan): se dejan fuera y se cuentan en el mensaje de estado.
- Tuberías sin ambas soleras, y redes con menos de dos estructuras.
- Un brocal tomado de la superficie se escribe como brocal fijo. Al abrirlo de nuevo, la estructura conserva ese número aunque la superficie cambie.
- Reglas de la red (pendiente mínima, recubrimiento, salto): LandXML no tiene lugar para ellas.
- Ajustes de visualización y las opciones de superficie de los grupos de puntos: guarde un proyecto de CivilCraft para eso.

Al abrir, CivilCraft no lee espirales distintas de la clotoide, superficies de malla, puntos que solo se refieren a otros puntos, parcelas, espirales en los elementos de planta, carreteras ni datos de levantamiento. Cada una se indica en las notas; nunca se adivina.

## Ida y vuelta

Para entregar un trabajo a alguien que usa otro software civil y recuperarlo, exporte LandXML, deje que lo edite y abra su LandXML como proyecto nuevo. Guarde también su propio `.civilcraft.json`: es el único archivo que conserva todo lo que CivilCraft sabe.
