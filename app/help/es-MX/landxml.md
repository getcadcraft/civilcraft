---
title: Intercambiar LandXML
summary: Abra LandXML de otro software civil como un proyecto nuevo, exporte puntos, superficies, alineaciones, perfiles y la red de tuberías como LandXML 1.2, y sepa qué no sale en el viaje.
keywords: landxml, xml, importar, exportar, intercambio, tin, superficie, alineación, perfil, red de tuberías, interoperabilidad, intercambio de datos
from: 870d5ece
---

LandXML es el formato de intercambio abierto que la mayoría de los programas civiles leen y escriben. CivilCraft lee y escribe LandXML 1.2. Si ha usado Civil 3D, sus cuadros de diálogo de importación y exportación de LandXML son lo más parecido; aquí no hay opciones que elegir, y las notas le indican lo que se dejó fuera.

## Abrir un archivo LandXML

1. Haga clic en {{ui:Abrir}} (o presione {{key:Mod+O}}) y elija el archivo `.xml` o `.landxml`, o suéltelo sobre el plano.
2. Si el proyecto actual tiene cambios sin guardar, CivilCraft pregunta primero. Elija {{ui:Guardar una copia}}, {{ui:No guardar}} o {{ui:Cancelar}}.
3. Se crea un **proyecto nuevo**. La barra de estado indica lo que se leyó, por ejemplo "Se abrió site.xml: 412 puntos, 2 superficies, 3 alineaciones."
4. Revise el cuadro debajo de los datos de la **Superficie**. Enumera todo lo que se omitió o cambió, por ejemplo:
   - "Solo se abrió la primera superficie ("EG"); el archivo tiene 1 más."
   - "La alineación "Ramp A" tiene elementos que CivilCraft todavía no puede dibujar (no son líneas, arcos ni espirales clotoides); se omitió."
   - "Las reglas de la red de tuberías no estaban en el archivo; se usan marcadores de posición: defina las suyas en Proyecto."

Qué se convierte en qué:

| En el archivo | En CivilCraft |
|---|---|
| Unidades (Imperial o Metric) | Las **Unidades** del proyecto (pies o metros) |
| Nombre del proyecto | El **Nombre** del proyecto |
| CgPoints | Los puntos del proyecto; la descripción (o el código) indica el grupo |
| La primera superficie TIN | El terreno existente, usado tal cual ("Superficie (desde LandXML)") |
| Cada alineación de líneas, arcos y espirales clotoides | Una alineación con sus PI, radios y longitudes de espiral reconstruidos desde las curvas |
| El primer perfil de diseño de cada alineación | Su perfil de diseño, con curvas verticales parabólicas |
| La primera red de tuberías | La red de tuberías, con sus brocales, sumideros y plantillas |
| Elementos de planta de líneas y arcos | Líneas características, con los arcos conservados; desde otro programa empiezan como **Solo dibujada** |

La lista completa de elementos y atributos está en [LandXML: qué se lee y qué se escribe](topic:landxml-reference).

:::note
Una superficie leída de LandXML no se reconstruye cuando cambia los grupos de puntos o cuando dibuja líneas de quiebre. Haga clic en {{ui:Reconstruir la superficie a partir de los puntos}} en la sección **Superficie** para construirla a partir de los puntos ({{key:Mod+Z}} devuelve la superficie de LandXML).
:::

## Exportar LandXML

1. Haga clic en {{ui:LandXML}} en el grupo **Exportar**.
2. El navegador descarga `<name>.xml`. La barra de estado indica lo que se incluyó, por ejemplo "Se exportó LandXML 1.2: 276 puntos, 2 superficies, 1 alineación, la red de tuberías. Las plataformas no forman parte de LandXML aquí; sí la superficie nivelada."

El archivo contiene:

- **Units**: pies de agrimensura de EE. UU. o metros.
- **CgPoints**: cada punto con su número como nombre, su descripción y su grupo como código.
- **Surfaces**: el terreno existente como TIN, con sus líneas de quiebre y su límite exterior como datos de origen; y, cuando las plataformas o las obras lineales dan nivel, una segunda superficie TIN llamada "Proposed".
- **Alignments**: líneas, arcos y espirales clotoides con sus estaciones, cada una con un perfil que contiene el terreno existente muestreado a lo largo de ella y el perfil de diseño (PVI y curvas parabólicas) cuando tiene al menos dos PVI.
- **PipeNetworks**: estructuras con sus brocales, sumideros y plantilla por tubería, y las tuberías con diámetro, longitud y pendiente.
- **PlanFeatures**: cada línea característica como líneas y arcos, con la elevación en cada extremo y para qué se usa.

## Lo que no hace el viaje

- Plataformas y obras lineales como objetos. Su resultado está en la superficie "Proposed".
- Alineaciones con errores (por ejemplo, curvas superpuestas): se dejan fuera y se cuentan en el mensaje de estado.
- Tuberías sin sus dos plantillas, y redes con menos de dos estructuras.
- Un brocal tomado de la superficie se escribe como brocal fijo. Al abrirlo de nuevo, la estructura conserva ese número aunque la superficie cambie.
- Reglas de la red (pendiente mínima, recubrimiento, caída): LandXML no tiene un lugar para ellas.
- La configuración de pantalla y las opciones de superficie de los grupos de puntos: guarde un proyecto de CivilCraft para eso.

Al abrir, CivilCraft no lee espirales que no sean clotoides, superficies de cuadrícula, puntos que solo hacen referencia a otros puntos, parcelas, espirales en elementos de planta, vialidades ni datos de levantamiento. Cada uno se nombra en las notas; nunca se adivina.

## Viajes de ida y vuelta

Para entregar trabajo a alguien que usa otro software civil y recibirlo de vuelta, exporte LandXML, deje que lo edite y abra su LandXML como un proyecto nuevo. Conserve también su `.civilcraft.json`: es el único archivo que guarda todo lo que CivilCraft sabe.
