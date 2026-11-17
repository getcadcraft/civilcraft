---
title: WaterCraft: demandas, caudal de incendio, cortes ha antigüedad del agua
summary: Ojeporu complemento WaterCraft rupi, clientes ojapo demandas red de caños de agua pe, ojuhu caudal disponible cada boca de incendio, ohechauka mávapa caño corte ohasa tuichave ha ojuhu antigüedad del agua ha cloro peteĩ ára rupi.
keywords: watercraft, distribución de agua, demandas, clientes, factor de punta, patrón de demanda, caudal de incendio, boca de incendio, presión residual, criticidad, corte, sección con válvulas, antigüedad del agua, cloro, residual, trazado de origen, extremo ciego, csv, complemento
from: 76809f01
---

WaterCraft ha'e complemento ojapóva red de agua ojapova'ekue Caños de agua herramientas rupi. Oñemoañete panel derecho rupi pestaña ha irundy sección.

:::warning
Ko'ã mba'e ha'e tembiapo cálculo rehegua nomaʼẽ. Oñemoñe'ẽ modelo ojapova'ekue mba'e pyahu rupi, ndaha'éi modelo real de empresa de agua. Ingeniero de agua ohechakuaa opa resultado. Ndaipóri estaciones de bombeo, ndaipóri descomposición de segundo orden ha ndaipóri escenarios aún.
:::

## Mba'épa rejapóta

- Oñemoĩ clientes red-pe como demandas.
- Ejuhu bocas de incendio ojeguerekóva caudal ndojotavéiva.
- Ejuhu caño cuyo corte ohasa tuichave.
- Ejuhu agua vieja ha cloro bajo.

## Pasos

1. Abrir {{ui:Configuración}} › {{ui:Complementos}} ha emoañete {{ui:WaterCraft (distribución de agua)}}. Oñemoĩ pestaña {{ui:WaterCraft}} panel derecho rupi.
2. Ejapo primero reservorio, nudos ha caños Caños de agua herramientas rupi (ver [Caños de agua](topic:water-mains)). Red ndaipóri rupi, pestaña ohechauka mba'épa rejapo.
3. Bajo {{ui:Demandas}}, pegar peteĩ cliente por línea: id, x, y, tipo, cantidad. Elegir {{ui:Factor de punta}} ha {{ui:Patrón horario}} (día residencial, día comercial, plano térã mantener patrón tal como oĩ). Apretar {{ui:Revisar}} ohechauka mávapa nudo ojeguerekóva cada cliente (nudo más próximo), upéi {{ui:Poner en la red}}. Deshacer omboguejy demandas.
4. Bajo {{ui:Caudal de incendio}}, ajusta caudal necesario ha presión residual, elegí si residual ohupyty {{ui:Solo en la boca de incendio}} térã {{ui:En todo el sistema (más estricto)}}, ha apretar {{ui:Recorrido}}. Cada boca de incendio ohechauka peor primero, como cumple térã falta.
5. Bajo {{ui:Qué caño importa más}}, elegí {{ui:un caño por vez}} térã {{ui:una sección con válvula por vez}} ha apretar {{ui:Recorrido}}. Cada corte ohechauka demanda cortada, nudos cortados, nudos nuevos bajo presión mínima ha presión más baja quedada.
6. Bajo {{ui:Antigüedad del agua y cloro}}, elegí mba'épa jajuhu (antigüedad del agua, cloro térã trazado de origen), ajusta horas a correr ha límites que querés, ha apretar {{ui:Recorrido}}. Ohechakuaa nudos ojepe'áva fuera de tus límites.
7. Apretar {{ui:Guardar como CSV}} bajo cualquier tabla para guardarla.

## Nota

- Caudal de incendio necesario ha uso por casa térã por acre ha'e valores de inicio, ndaha'éi normas. Ojeporu cifras propias de tu empresa de agua.
- Caño cortado en parte por válvula ojeñeʼẽ entero, upévare corte ohechauka apenas peor que el real.
- Corré la sección de calidad del agua el tiempo suficiente hasta que el patrón diario se repita antes de leer el último día.
- {{ui:Detener}} ohepyta recorrido largo antes; upéi lista ohechauka solo lo ojapóva.
- Tu red ojekyhyje ko proyecto ha ko computadora. Nada ndojehasái a ningún lugar.
