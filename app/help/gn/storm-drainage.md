---
title: Ojeporeka tormenta flujo, caño tamaño ha línea de gradiente hidráulico
summary: Dibujar cuencas oguatava cada estructura-pe, ojuaʼẽ flujo red-pe método racional rupi, oñemoĩ caños ecuación de Manning rupi, ha ohechakuaa mávapa línea de gradiente hidráulico lleno térã superficie-pe ojuhu.
keywords: drenaje pluvial, cuenca, área de drenaje, método racional, coeficiente de escorrentía, tiempo de concentración, intensidad de lluvia, idf, manning, dimensionado de caños, línea de gradiente hidráulico, hgl, línea de energía, egl, sobrecarga, inundación, nivel de salida
from: e44872ec
---

Drenaje pluvial ojapo [red de caños](topic:pipe-network): dibujá red primero, upe rire área oguatava chupe. Oñemoĩ **Drenaje pluvial** panel derecho-pe ndaipóri oiporavóva.

## Dibujar cuenca

1. Eapreta **Dibujar una cuenca** **Drenaje pluvial** rapeʼỹ.
2. Eapreta área esquinas oguatava peteĩ estructura-pe. {{key:Enter}} térã doble clic oñemboty; {{key:Backspace}} omboguejy última esquina, {{key:Esc}} omboty.
3. Cuenca oguatava estructura-pe ndive oĩva, ndaipóri jave hetãvéva. Ipropiedades **Propiedades** oñepyrũ: emoĩ réra, **Coeficiente de escorrentía C** (lluvia ojeikéva porcentaje, 0 ha 1), **Tiempo de concentración** minuto-pe, ha máva estructura **Desagua a**.

**Dibujar otra cuenca** ipropiedades-pe oñepyrũ upe próxima. Eapreta cuenca plano-pe oiko-pe select-ha; {{key:Delete}} oñeʼẽ. Peteĩteĩ cambio ha'e peteĩ paso: {{key:Mod+Z}} oñeʼẽ.

## Emoĩ tormenta diseño

Lluvia intensidad ha'e i = a ÷ (tc + b) potencia c, pulgada hora-pe proyecto pie-pe ha milímetro hora-pe proyecto metro-pe. Ajusta **Intensidad a**, **b** ha **c** tu propia curva intensidad-duración-frecuencia período de retorno-pe.

:::warning
Intensidad inicial, Manning n (0.013) ha pérdida de unión (0.5) ha'e marcador, ndaha'éi estándar. Emoĩ tu propia datos de lluvia ha criterio de diseño-pe.
:::

- **Tiempo de concentración más corto**: ojeikeʼỹ caño ndaipóri tiempo menor (10 minuto-pe oñepyrũ).
- **Manning n**: caño rugosidad.
- **Pérdida de unión**: cabeza omboyke peteĩteĩ estructura-pe, velocidad cabeza V²/2g caño mboyva-pe porcentaje.
- **Nivel de agua en la salida**: nivel de cola, último caño ojeupe. Ndaiporiva ojapo jave salida libre.

## Mba'éichapa flujos oñeʼẽ

Caño peteĩteĩ oguata oĩva ipokatu cuenca kuéra. Q = C × i × A, C × A oñemboyke red rupi ha i ha'e intensidad tiempo de concentración más largo, mboyve ohupytýva agua: cuenca tiempo ha'e, térã tiempo cuenca hetãvéva ndive más viaje caño rupi (largo ÷ velocidad lleno). Q ha'e pie cúbico por segundo (A acre-pe) térã metro cúbico por segundo (A hectárea-pe).

## Oñemoĩ caños tamaño

Tabla **Flujos y líneas de gradiente** ohechauka peteĩteĩ caño-pe flujo, mba'e oguata lleno ipendiente-pe, velocidad, gradiente hidráulico ipokatu ha ipýpe, ha mávapa hondo oguata.

**Oñemoĩ caños tamaño ko'ã flujo-pe** ome'ẽ peteĩteĩ caño-pe tamaño estándar michĩvéva oguatáva flujo ipendiente-pe (12 ha 72 pulgada, térã 300 ha 1800 milímetro). Peteĩ paso ha'e. Cota de fondo oiko upéicha: tamaño oñemoambue jave, eapreta **Fijar todas las cotas de fondo según las reglas** ojuaʼẽ cobertura, upe rire tabla eha'ã jey.

## Mba'éichapa línea de gradiente oñeʼẽ

Línea de gradiente hidráulico (HGL) oñeʼẽ salida-gui trazado-pe:

- Caño oguata mitã lleno-pe ipHGL oĩ agua superficie-pe: cota de fondo más hondo normal.
- Agua ipokatu ipyta ipeteĩ parte gui, térã ojeikeʼỹ lleno-pe jave, oguata lleno (sobrecargado) ha ipHGL oñemboguahẽ fricción pendiente rupi ipo rehe.
- Peteĩteĩ estructura-pe HGL ha'e caño mboyva ipokatu HGL más pérdida de unión.
- Línea de energía (EGL) ha'e HGL más velocidad cabeza.

Caño oguata lleno oñemoĩ listado-pe, ha estructura oĩva HGL borde ári: agua superficie-pe oguahẽ, ha estructura plano-pe pytã-pe oñemboʼy. Peteĩ caño térã estructura select-ha ohechauka flujo, hondo, velocidad ha línea gradiente ipropiedades-pe.

## Mba'éichapa tormenta oñemboguata

Método racional ome'ẽ peteĩ pico caño-pe. **Route the storm** (resultado mbytépe, red ipropiedades-pe) oñeʼẽ tormenta entero: peteĩteĩ cuenca escorrentía tiempo rupi, caño rupi tiempo viaje ha almacenamiento ndive, ha mboyve ojoaju.

1. Eheja **Rain lasts** ha **Rain intensity** vacío ha'e tiempo concentración más largo ha lluvia curva, térã emoñeʼẽ tu propio.
2. Eapreta **Enrutar la tormenta**. Tabla ohechauka peteĩteĩ caño-pe flujo más alto ingreso ha salida, mávapa mboyve pico salida, caño capacidad lleno porcentaje ha minuto pico.
3. Peteĩteĩ salida-pe gráfico pequeño flujo tiempo rehe ha **Descargar el hidrograma (CSV)**.

Cuenca ohasa lluvia promedio tiempo concentración rupi, upévare tormenta menor ojeikeʼỹ pico menor C × i × A-gui. Peteĩteĩ caño Muskingum–Cunge método oñeʼẽ, método racional jurumi profundidad usado. Dos ramas tiempo concentración diferente ndaipóri pico mboyvémbi, upévare suma menor que pico suma.

Ndaha'éi modelo sobrecarga, contracorriente, almacenamiento estructura-pe ni inundación. Caño pico oñeʼẽva capacidad lleno gui oguahẽva oñemoĩ listado-pe, ha agua oñemboguata oñemoĩ jepe ojeikéva. Upe ojapo tiempo ha atenuación ohechauka-pe, ndaha'éi caño tamaño-pe. Ha'e ayuda cálculo: ingeniero ohechakuaa.

## Oñongatu proyecto-pe

Cuenca ha tormenta configuración oñongatu proyecto archivo-pe. Ndaipóri todavía PDF plot, DWG, DXF ni LandXML-pe: ver [Todavía no construido](topic:not-built-yet).
