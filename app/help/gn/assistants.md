---
title: Dejá que un asistente de IA trabaje con tu sitio
summary: Activá los asistentes en Configuración para que un asistente de tu computadora lea el sitio abierto (puntos, superficies, volúmenes, perfiles, lotes), agregue puntos de control, guarde y exporte LandXML o DWG, a través de CadCraft Studio. Apagado hasta que lo actives.
keywords: ia, asistente, mcp, script, automatización, studio, puntos, elevación, estación, desfase, trazado, volumen, corte, relleno, perfil, lote, landxml, dwg, usd, carpetas, permisos, desconectar, actividad
from: d0356582
---

## Lo que vas a aprender

Cómo dejar que un asistente de IA (cualquier asistente que hable MCP) trabaje con el sitio que tenés abierto, qué puede y qué no puede hacer, y cómo detenerlo.

## Lo que un asistente puede hacer en CivilCraft

| Pide | Qué obtiene | Necesita |
|---|---|---|
| El sitio | Nombre, unidades, sistema de coordenadas, grupos de puntos, trazados, superficies, plataformas, lotes y caños | Leer |
| Puntos de relevamiento | Número, este, norte, elevación y descripción, por grupo, por descripción o dentro de un recuadro | Leer |
| Elevaciones de superficie | El terreno existente (o la superficie nivelada) en los puntos que nombre | Leer |
| Estaciones y desfases | La estación y el desfase de puntos a lo largo de un trazado, o las coordenadas y la elevación del terreno de estaciones | Leer |
| Un perfil | Elevaciones de terreno, perfil de diseño y superficie nivelada a lo largo de un trazado, cada tantos ft o metros | Leer |
| Corte y relleno | Volúmenes entre el terreno existente y la superficie nivelada (también cada plataforma y corredor), o entre el terreno y un nivel | Leer |
| Lotes | Esquinas, superficie (en acres o hectáreas), perímetro y la descripción legal | Leer |
| Una selección | Los puntos que nombre quedan seleccionados en el plano, como si los hubieras elegido | Editar |
| Puntos de relevamiento nuevos | Puntos agregados con los números que dé, o los siguientes libres. Cada llamada es un paso que podés deshacer | Editar |
| Guardar | El {{ui:Guardar}} propio de CivilCraft | Guardar |
| LandXML o DWG | Los mismos archivos que los botones {{ui:LandXML}} y {{ui:DWG}} | Exportar |
| El sitio en 3D | OpenUSD (.usdz, .usda o .usdc) del terreno, la superficie nivelada, plataformas y caños, tal como lo exporta la vista 3D | Exportar |
| Plantas y planilla de plantas | Plantas halladas en la lista de plantas por cualquier nombre, y los conteos de la planilla de plantas | Leer |
| Plantación y nivelación | Plantas, un cantero o un seto colocados, o una plataforma, berma, cuneta o área de nivelación agregada, cada una como un paso que podés deshacer, con su corte y relleno | Editar |
| Verificación de riego | El caudal de cada zona, la presión necesaria en su válvula y en el suministro, la altura del peor caso, tiempos de funcionamiento, problemas y la lista de materiales, como ayuda de cálculo que revisa un diseñador de riego | Leer |

Funciona con el sitio que está abierto. En Studio también puede guardar y exportar en carpetas que elijas (más abajo); sin carpeta, sus archivos se descargan como lo hacen los botones.

## Activarlo

Los asistentes llegan a CivilCraft a través de CadCraft Studio en tu computadora; el navegador común no tiene forma de entrar.

1. Abrí {{ui:Configuración}} y elegí la pestaña **CivilCraft**.
2. Bajo **Asistentes**, marcá **Permitir que los asistentes de IA y los scripts usen CivilCraft**.
3. **Leer** ya viene marcado. Marcá **Editar**, **Guardar** o **Exportar** solo cuando el asistente los necesite.
4. Para dejar que guarde y exporte en una carpeta, elegí {{ui:Agregar una carpeta…}} bajo **Carpetas que puede usar** y elegí la carpeta en el diálogo de Studio. {{ui:Eliminar}} la quita de inmediato; cualquier otra ruta se rechaza.
5. Conectá el asistente en Studio (Studio muestra la dirección y la configuración para pegar en él).

## Mientras un asistente está conectado

Una nota arriba del panel derecho indica qué asistente está conectado y qué puede hacer. Hacé clic en {{ui:Desconectar}} para terminar su sesión de inmediato; tiene que volver a conectarse para seguir.

**Actividad**, bajo **Asistentes** en Configuración, enumera cada llamada que hizo el asistente, de la más nueva a la más vieja, con si funcionó o no.

:::tip
Preguntá con palabras simples, por ejemplo "¿cuál es la elevación del terreno cada 50 feet a lo largo de la calle Main?", "¿cuánto corte y relleno necesitan las plataformas?" o "agregá un punto de control en estas coordenadas". El asistente lee el sitio y responde, o hace el cambio como un paso que podés deshacer.
:::

## Sin abrir CivilCraft

El servidor de archivos de CadCraft para asistentes (`npx @getcadcraft/mcp`) y la línea de comandos `cadcraft` abren proyectos de CivilCraft guardados (`.civilcraft.json`) y archivos de puntos con el código propio de CivilCraft, sin ventana: las mismas herramientas de lectura, agregar puntos, guardar el proyecto, LandXML y el sitio en 3D como OpenUSD. `cadcraft convert site.civilcraft.json site.xml` escribe LandXML desde la línea de comandos. Abrir LandXML, la exportación DWG y las herramientas del espacio de trabajo Paisaje todavía necesitan la ventana de CivilCraft.

## Desactivarlo

Desmarcá **Permitir que los asistentes de IA y los scripts usen CivilCraft**. Todos los asistentes se desconectan de inmediato, y la configuración queda guardada para la próxima vez.

## Ver también

- [Recetas para asistentes de IA](common:assistants-recipes): ejemplos resueltos, cada uno con las herramientas que llama.
- [Diseñar un trazado horizontal](topic:alignment)
- [Construir y refinar la superficie](topic:build-surface)
- [Seleccionar, copiar y pegar puntos de relevamiento](topic:copy-paste-points)
- [Configuración de CivilCraft](topic:settings)
