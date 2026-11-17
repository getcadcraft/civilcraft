---
title: Valores iniciales y marcadores
summary: Cada valor con el que empieza CivilCraft, para proyectos nuevos, visualización, trazados, plataformas, corredores, redes de caños, volúmenes e impresión, y cuáles son marcadores para reemplazar.
keywords: valores por defecto, configuración, valores iniciales, marcadores, criterios de diseño, normas, reglas, supuestos
from: fbfc7432
---

CivilCraft no tiene diálogo ni plantilla de configuración. Estos son los valores con los que empiezan las cosas. Los valores marcados **marcador** no se toman de ninguna norma: reemplazalos por los criterios de tu proyecto antes de confiar en una verificación o una cantidad.

## Proyecto nuevo

| Ajuste | Valor |
|---|---|
| Nombre | Sitio sin título (el nombre del primer archivo de puntos lo reemplaza) |
| Unidades | US feet |
| Nombre de la superficie | Terreno existente |
| Grupos de puntos | Cada grupo empieza como {{ui:Puntos}} |
| Borde exterior más largo | 0 (conservar cada triángulo) |
| Pasos de deshacer conservados | 200 |

## Visualización

| Ajuste | Valor |
|---|---|
| Superficie | {{ui:Terreno existente}} |
| Curvas cada | 1 (ft o m) |
| Maestras cada | 5.ª curva |
| Bandas | 8 |
| {{ui:Encendido}} | Curvas, rótulos de curvas, puntos, líneas de quiebre, borde de superficie, caños |
| Apagado | Triángulos, bandas de cota, flechas de pendiente, rótulos de puntos |

## Trazados y perfiles

| Ajuste | Valor |
|---|---|
| Nombre | Trazado 1, Trazado 2 … |
| Estación inicial | 0+00 |
| Radio de curva en cada PI interior | 100 ft o 30 m, menor si eso no entra en la mitad de cada tangente |
| Perfil de diseño | Ninguno hasta que empieces uno; {{ui:Comenzar desde el terreno}} pone un PVI sobre el terreno en cada extremo |
| Longitud de curva vertical | 0 (sin curva) hasta que escribas una |

## Plataformas

| Ajuste | Valor |
|---|---|
| Nombre | Plataforma 1, Plataforma 2 … |
| Cota | El terreno en el medio de la plataforma, redondeado a 0.1 (0 si el medio está fuera de la superficie) |
| Talud de corte | 2 : 1 (marcador) |
| Talud de relleno | 3 : 1 (marcador) |

## Ensamble del corredor (marcadores)

| Ajuste | US feet | Metros |
|---|---|---|
| Ancho de carril | 12 ft | 3.6 m |
| Pendiente de carril | 2% | 2% |
| Ancho de berma | 4 ft | 1.2 m |
| Pendiente de berma | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de relleno | 3 : 1 | 3 : 1 |
| Corte cada | 10 ft | 5 m |

## Red de caños

| Ajuste | US feet | Metros |
|---|---|---|
| Nombre y tipo | Pluvial, pluvial | Pluvial, pluvial |
| Pendiente mínima (marcador) | 0.50% | 0.50% |
| Recubrimiento mínimo (marcador) | 2 ft | 0.6 m |
| Caída en estructuras (marcador) | 0.10 ft | 0.03 m |
| Diámetro de estructura nueva | 48 in | 1200 mm |
| Diámetro de caño nuevo | 12 in | 300 mm |
| Profundidad de pozo de bombeo | 0 | 0 |
| Borde | Desde la superficie | Desde la superficie |

Una red de caños abierta desde LandXML usa estas reglas también, porque LandXML no las trae.

## Volúmenes

| Ajuste | Valor |
|---|---|
| Método | Grilla, muestreada en los centros de celda dentro de las líneas de empate |
| Tamaño de celda | Elegido para que el rectángulo envolvente de la superficie nivelada tenga unas 250 000 celdas (1, 2 o 5 veces una potencia de diez) |
| Abultamiento y contracción | Ninguno |

## Impresión

| Ajuste | Valor |
|---|---|
| Superficie | {{ui:Todo}} |
| Papel | Tabloid 11 × 17 in (proyectos en pies), ISO A3 (proyectos en metros); siempre horizontal |
| Escala | La mayor escala de la lista que entra |
| Tinta | {{ui:Colores de capa}} |

Los rótulos DXF se dimensionan para la escala a la que todo entra en Tabloid (pies) o A3 (metros).
