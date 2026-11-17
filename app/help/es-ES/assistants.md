---
title: Deje que un asistente de IA trabaje con su emplazamiento
summary: Active los asistentes en Configuración para que un asistente en su ordenador lea el emplazamiento abierto (puntos, superficies, volúmenes, perfiles, parcelas), añada puntos topográficos, guarde y exporte LandXML o DWG, a través de CadCraft Studio. Desactivado hasta que lo active.
keywords: ia, asistente, mcp, script, automatización, studio, puntos, cota, estación, desplazamiento, alineación, volumen, desmonte, terraplén, perfil, parcela, landxml, dwg, usd, carpetas, permisos, desconectar, actividad
from: d0356582
---

## Lo que aprenderá

Cómo dejar que un asistente de IA (cualquier asistente que hable MCP) trabaje con el emplazamiento abierto, qué puede y qué no puede hacer, y cómo detenerlo.

## Lo que puede hacer un asistente en CivilCraft

| Lo que pide | Lo que obtiene | Necesita |
|---|---|---|
| El emplazamiento | Nombre, unidades, sistema de coordenadas, grupos de puntos, alineaciones, superficies, plataformas, parcelas y tuberías | Leer |
| Puntos topográficos | Número, este, norte, cota y descripción, por grupo, por descripción o dentro de un recuadro | Leer |
| Cotas de superficie | El terreno existente (o el terreno explanado) en los puntos que nombre | Leer |
| Estaciones y desplazamientos | La estación y el desplazamiento de puntos a lo largo de una alineación, o las coordenadas y la cota del terreno de unas estaciones | Leer |
| Un perfil | Cotas del terreno, del perfil de proyecto y de la superficie explanada a lo largo de una alineación, cada tantos pies o metros | Leer |
| Desmonte y terraplén | Volúmenes entre el terreno existente y la superficie explanada (también cada plataforma y corredor), o entre el terreno y un nivel | Leer |
| Parcelas | Vértices, superficie (con acres o hectáreas), perímetro y descripción legal | Leer |
| Una selección | Los puntos que nombre se seleccionan en el plano, como si los hubiera elegido usted | Editar |
| Nuevos puntos topográficos | Puntos añadidos con los números que indique, o los siguientes libres. Cada llamada es un paso que puede deshacer | Editar |
| Guardar | El {{ui:Guardar}} propio de CivilCraft | Guardar |
| LandXML o DWG | Los mismos archivos que los botones {{ui:LandXML}} y {{ui:DWG}} | Exportar |
| El emplazamiento en 3D | OpenUSD (.usdz, .usda o .usdc) del terreno, la superficie explanada, las plataformas y las tuberías, tal como lo exporta la vista 3D | Exportar |
| Plantas y el calendario de plantas | Plantas encontradas en la lista de plantas por cualquier nombre, y los recuentos del calendario de plantas | Leer |
| Plantación y explanación | Plantas, un parterre o un seto colocados, o una plataforma, un caballón, una cuneta o una zona de explanación añadidos, cada uno un paso que puede deshacer, con su desmonte y terraplén | Editar |
| Una comprobación de riego | El caudal de cada zona, la presión necesaria en su válvula y en el suministro, la altura de carga en el peor caso, los tiempos de funcionamiento, los problemas y la lista de materiales, como ayuda de cálculo que un diseñador de riego revisa | Leer |

Funciona con el emplazamiento que esté abierto. En Studio también puede guardar y exportar en carpetas que usted elija (más abajo); sin carpeta, sus archivos se descargan como lo hacen los botones.

## Activarlo

Los asistentes llegan a CivilCraft a través de CadCraft Studio en su ordenador; el navegador normal no tiene forma de acceso.

1. Abra {{ui:Configuración}} y elija la pestaña **CivilCraft**.
2. En **Asistentes**, marque **Permitir que los asistentes de IA y los scripts usen CivilCraft**.
3. **Leer** ya está marcado para usted. Marque **Editar**, **Guardar** o **Exportar** solo cuando el asistente los necesite.
4. Para permitir que guarde y exporte en una carpeta, elija {{ui:Añadir una carpeta…}} en **Carpetas que puede usar** y elija la carpeta en el diálogo de Studio. {{ui:Quitar}} la retira de inmediato; cualquier otra ruta se rechaza.
5. Conecte el asistente en Studio (Studio muestra la dirección y la configuración que debe pegar en él).

## Mientras un asistente está conectado

Una nota en la parte superior del panel derecho indica qué asistente está conectado y lo que puede hacer. Haga clic en {{ui:Desconectar}} para terminar su sesión de inmediato; tendrá que volver a conectarse para continuar.

**Actividad**, bajo **Asistentes** en Configuración, enumera cada llamada que hizo el asistente, de la más reciente a la más antigua, e indica si funcionó.

:::tip
Pida con palabras sencillas, por ejemplo «¿cuál es la cota del terreno cada 50 pies a lo largo de Main Street?», «¿cuánto desmonte y terraplén necesitan las plataformas?» o «añada un punto de control en estas coordenadas». El asistente lee el emplazamiento y responde, o hace el cambio como un paso que puede deshacer.
:::

## Sin abrir CivilCraft

El servidor de archivos de CadCraft para asistentes (`npx @getcadcraft/mcp`) y la línea de comandos `cadcraft` abren proyectos de CivilCraft guardados (`.civilcraft.json`) y archivos de puntos con el propio código de CivilCraft, sin ventana: las mismas herramientas de lectura, añadir puntos, guardar el proyecto, LandXML y el emplazamiento en 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escribe LandXML desde la línea de comandos. Abrir LandXML, la exportación DWG y las herramientas del espacio de trabajo Paisajismo siguen necesitando la ventana de CivilCraft.

## Desactivarlo

Desmarque **Permitir que los asistentes de IA y los scripts usen CivilCraft**. Cada asistente se desconecta de inmediato, y el ajuste se guarda para la próxima vez.

## Ver también

- [Recetas para asistentes de IA](common:assistants-recipes): ejemplos prácticos, cada uno con las herramientas que llama.
- [Trazar una alineación horizontal](topic:alignment)
- [Construir y refinar la superficie](topic:build-surface)
- [Seleccionar, copiar y pegar puntos topográficos](topic:copy-paste-points)
- [Configuración de CivilCraft](topic:settings)
