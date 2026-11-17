---
title: Permitir que un asistente de IA trabaje con su sitio
summary: Active los asistentes en Configuración para que un asistente de su computadora lea el sitio abierto (puntos, superficies, volúmenes, perfiles, parcelas), agregue puntos de control, guarde y exporte LandXML o DWG, a través de CadCraft Studio. Desactivado hasta que lo active.
keywords: ia, asistente, mcp, script, automatización, studio, puntos, elevación, estación, desfase, alineación, volumen, corte, relleno, perfil, parcela, landxml, dwg, usd, carpetas, permisos, desconectar, actividad
from: d0356582
---

## Qué aprenderá

Cómo permitir que un asistente de IA (cualquier asistente que hable MCP) trabaje con el sitio que tiene abierto, qué puede y qué no puede hacer, y cómo detenerlo.

## Qué puede hacer un asistente en CivilCraft

| Lo que pide | Lo que obtiene | Requiere |
|---|---|---|
| El sitio | Nombre, unidades, sistema de coordenadas, grupos de puntos, alineaciones, superficies, plataformas, parcelas y tuberías | Leer |
| Puntos de levantamiento | Número, este, norte, elevación y descripción, por grupo, por descripción o dentro de un recuadro | Leer |
| Elevaciones de superficie | El terreno existente (o la superficie nivelada) en cualquier punto que indique | Leer |
| Estaciones y desfases | La estación y el desfase de puntos a lo largo de una alineación, o las coordenadas y la elevación del terreno de las estaciones | Leer |
| Un perfil | Elevaciones del terreno, del perfil de diseño y de la superficie nivelada a lo largo de una alineación, cada cierto número de pies o metros | Leer |
| Corte y relleno | Volúmenes entre el terreno existente y la superficie nivelada (también de cada plataforma y corredor), o entre el terreno y un nivel | Leer |
| Parcelas | Esquinas, área (con acres o hectáreas), perímetro y la descripción legal | Leer |
| Una selección | Los puntos que nombra se seleccionan en la planta, como si usted los hubiera elegido | Editar |
| Nuevos puntos de levantamiento | Puntos agregados con los números que indique, o los siguientes libres. Cada llamada es un paso que puede deshacer | Editar |
| Guardar | El {{ui:Guardar}} propio de CivilCraft | Guardar |
| LandXML o DWG | Los mismos archivos que los botones {{ui:LandXML}} y {{ui:DWG}} | Exportar |
| El sitio en 3D | OpenUSD (.usdz, .usda o .usdc) del terreno, la superficie nivelada, las plataformas y las tuberías, tal como lo exporta la vista 3D | Exportar |
| Plantas y el cuadro de plantas | Plantas encontradas en la lista de plantas por cualquier nombre, y los conteos del cuadro de plantas | Leer |
| Plantación y nivelación | Plantas, un macizo o un seto colocados, o una plataforma, berma, cuneta o área de nivelación agregada, cada uno como un paso que puede deshacer, con su corte y relleno | Editar |
| Revisión de riego | El caudal de cada zona, la presión necesaria en su válvula y en el suministro, la altura de carga del peor caso, los tiempos de funcionamiento, los problemas y la lista de materiales, como ayuda de cálculo que un diseñador de riego verifica | Leer |

Funciona con el sitio que está abierto. En Studio también puede guardar y exportar en las carpetas que usted elija (abajo); sin carpeta, sus archivos se descargan como lo hacen los botones.

## Activarlo

Los asistentes llegan a CivilCraft a través de CadCraft Studio en su computadora; el navegador normal no tiene forma de entrar.

1. Abra {{ui:Configuración}} y elija la pestaña **CivilCraft**.
2. En **Asistentes**, marque **Permitir que los asistentes de IA y los scripts usen CivilCraft**.
3. **Leer** ya está marcado para usted. Marque **Editar**, **Guardar** o **Exportar** solo cuando el asistente los necesite.
4. Para permitir que guarde y exporte en una carpeta, elija {{ui:Agregar una carpeta…}} bajo **Carpetas que puede usar** y elija la carpeta en el cuadro de diálogo de Studio. {{ui:Quitar}} la retira de inmediato; cualquier otra ruta se rechaza.
5. Conecte el asistente en Studio (Studio muestra la dirección y la configuración que debe pegar en él).

## Mientras un asistente está conectado

Una nota en la parte superior del panel derecho indica qué asistente está conectado y qué puede hacer. Haga clic en {{ui:Desconectar}} para terminar su sesión de inmediato; tendrá que volver a conectarse para continuar.

**Actividad**, bajo **Asistentes** en Configuración, lista cada llamada que hizo el asistente, la más reciente primero, con indicación de si funcionó.

:::tip
Pregunte con palabras sencillas, por ejemplo "¿cuál es la elevación del terreno cada 50 pies a lo largo de la calle Principal?", "¿cuánto corte y relleno necesitan las plataformas?" o "agregue un punto de control en estas coordenadas". El asistente lee el sitio y responde, o hace el cambio como un paso que usted puede deshacer.
:::

## Sin abrir CivilCraft

El servidor de archivos de CadCraft para asistentes (`npx @getcadcraft/mcp`) y la línea de comandos `cadcraft` abren proyectos de CivilCraft guardados (`.civilcraft.json`) y archivos de puntos con el código propio de CivilCraft, sin ventana: las mismas herramientas de lectura, agregar puntos, guardar el proyecto, LandXML y el sitio en 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escribe LandXML desde la línea de comandos. Abrir LandXML, la exportación DWG y las herramientas del espacio de trabajo Paisaje todavía necesitan la ventana de CivilCraft.

## Desactivarlo

Desmarque **Permitir que los asistentes de IA y los scripts usen CivilCraft**. Cada asistente se desconecta de inmediato, y la configuración se conserva para la próxima vez.

## Ver también

- [Recetas para asistentes de IA](common:assistants-recipes): ejemplos resueltos, cada uno con las herramientas que llama.
- [Trazar una alineación horizontal](topic:alignment)
- [Construir y refinar la superficie](topic:build-surface)
- [Seleccionar, copiar y pegar puntos de levantamiento](topic:copy-paste-points)
- [Configuración de CivilCraft](topic:settings)
