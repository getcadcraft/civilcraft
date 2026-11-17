---
title: Dibujo de parcelas ha descripciones legales
summary: Dibujá parcela ha esquinas térã ingresá rumbos de escritura o plano, revisá cuán bien cierran los rumbos, marcá rumbos y distancias en plano, hacé curva cualquier rumbo ha copiá descripción legal borrador.
keywords: parcelas, lotes, líneas de propiedad, límite, escritura, plano, rumbo, distancia, cierre, error de cierre, precisión, descripción legal, punto de inicio, curva, radio, superficie, acres
from: 6793d6ce
---

Parcelas oĩ plano-pe rumbo ha distancia cada tramo recto (curva oñemoĩ radio, longitud ha ángulo central) ha nombre ha superficie medio-pe. Oho PDF ploteo ha exportaciones DWG ha DXF-pe, capas `V-PROP` (líneas) ha `V-PROP-TEXT` (etiquetas). Todo oĩ **Parcelas** panel derecha-pe cuando nada ndoeleijái.

## Dibujá parcela

1. Eprésiona **Dibujar parcela**.
2. Eprésiona esquinas, comenzando punto de inicio-gui. Clic cerca punto de medición toma exacto lugar ko punto.
3. Eprésiona primer esquina jey térã {{key:Enter}}, ha oñemyatyro. {{key:Backspace}} oguenohẽ última esquina; {{key:Esc}} omboty esquinas peteĩ; eprésiona jey herramienta mboyve.

## Ingresá rumbos de escritura

1. Eprésiona **Ingresar rumbos de escritura**.
2. Decí dónde oñepyrũ rumbos: número de punto de medición, térã norte y este.
3. Escribí térã pegá rumbos, peteĩ línea-pe:
   - línea: rumbo ha distancia, ejemplo `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` ha acimut (`AZ 45°30'15"`) avei oikóta, ha "thence", comas ha "feet" ndaikuaái.
   - curva: `C R 300 L 52.36 right` (radio ha longitud de arco), térã `C R 300 D 10°00'00" left` (radio ha ángulo central). Curva oñepyrũ rumbo anterior rupi; ndaiporiri, agrega rumbo cuerda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` oñepyrũ línea comentario.
4. Escribiendo, ventana omoñe'ẽ longitud rumbos, **error de cierre** (mbovy ojeiko inicio-gui ha mba'épa dirección), **precisión** (longitud dividido error de cierre, 1 : 10,000 ha ambue) ha superficie. Línea ndoikuaáva omombe'u número de línea.
5. **Agregar parcela**. Rumbos ndocierrei jave, parcela cierra recta línea brecha-pe: revisá rumbos escritura-pe. Error de recorrido de campo ajusta mboyve, ajustá primero.

## Curvas

Parcela **Propiedades**-pe, cada tramo oguereko **Radio**. Escribí peteĩ ojapo tramo curva ko mokõi esquina (radio ndahasávi mitad distancia mboyve ndoikóikuri, oñemboguejy), ha eleji **Derecha** térã **Izquierda** **Curvas**-pe: curva derecha centro oĩ dirección de avance derecha, escritura-pe ojeipe'a. Radio mboguejy ojapo recto jey. Cambio cada peteĩ paso: {{key:Mod+Z}} oñemboguejy.

## Descripción legal

Parcela **Propiedades** oñemyatyro descripción legal, dibujo-gui ojapóva:

- "Beginning at" **Punto de inicio** ojeikuaáva (ejemplo "esquina noreste de Lote 4"), ndaipóri ramo primera esquina norte y este, térã punto de medición oñepyrũva rumbos.
- "thence" cada tramo: rumbo ha distancia, térã curva radio, longitud de arco, ángulo central, ha rumbo y distancia cuerda.
- "Containing" superficie pies cuadrados ha acres (metros cuadrados ha hectáreas proyecto metro-pe).

**Copiar** oguenohẽ portapapeles-pe; **Descargar como texto** oguarda `.txt` archivo.

:::warning
Descripción legal ko dibujo-gui borrador ha'e, ndaha'éi mensura. Agrimensor autorizado oñeikotevẽ revisar registro-pe ha firmar antes de ojeporu.
:::

Plano-pe parcela ojeporu clic pe rupi para seleccionar; {{key:Delete}} omboguejy. Parcelas oguarda proyecto archivo-pe.
