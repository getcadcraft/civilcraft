---
title: Valores iniciales y marcadores
summary: Todos los valores con los que empieza CivilCraft, para proyectos nuevos, visualización, alineaciones, plataformas, corredores, redes de tuberías, volúmenes y planos, y cuáles son marcadores que hay que sustituir.
keywords: valores predeterminados, configuración, valores iniciales, marcadores, criterios de diseño, normas, reglas, supuestos
from: fbfc7432
---

CivilCraft no tiene un cuadro de configuración ni una plantilla. Estos son los valores con los que empiezan las cosas. Los valores marcados como **marcador** no proceden de ninguna norma: sustitúyalos por los criterios de su proyecto antes de fiarse de una comprobación o de una medición.

## Proyecto nuevo

| Ajuste | Valor |
|---|---|
| Nombre | Emplazamiento sin título (el nombre del primer archivo de puntos lo sustituye) |
| Unidades | Pies de EE. UU. |
| Nombre de la superficie | Terreno natural |
| Grupos de puntos | Cada grupo empieza como {{ui:Puntos}} |
| Borde exterior más largo | 0 (conservar cada triángulo) |
| Pasos de deshacer conservados | 200 |

## Visualización

| Ajuste | Valor |
|---|---|
| Superficie | {{ui:Terreno natural}} |
| Curvas cada | 1 (ft o m) |
| Maestras cada | 5.ª curva |
| Bandas | 8 |
| Activadas | Curvas, etiquetas de curvas, puntos, líneas de ruptura, borde de superficie, tuberías |
| Desactivadas | Triángulos, bandas de elevación, flechas de pendiente, etiquetas de puntos |

## Alineaciones y perfiles

| Ajuste | Valor |
|---|---|
| Nombre | Alineación 1, Alineación 2 … |
| P.K. inicial | 0+00 |
| Radio de curva en cada PI interior | 100 ft o 30 m, menor si no cabe en la mitad de cada tangente |
| Perfil de proyecto | Ninguno hasta que empiece uno; {{ui:Iniciar desde el terreno}} pone un PVI sobre el terreno en cada extremo |
| Longitud de curva vertical | 0 (sin curva) hasta que escriba una |

## Plataformas

| Ajuste | Valor |
|---|---|
| Nombre | Plataforma 1, Plataforma 2 … |
| Cota | El terreno en el centro de la plataforma, redondeado a 0.1 (0 si el centro está fuera de la superficie) |
| Talud de desmonte | 2 : 1 (marcador) |
| Talud de terraplén | 3 : 1 (marcador) |

## Ensamblaje del corredor (marcadores)

| Ajuste | Pies (EE. UU.) | Metros |
|---|---|---|
| Ancho del carril | 12 ft | 3.6 m |
| Pendiente del carril | 2% | 2% |
| Ancho del arcén | 4 ft | 1.2 m |
| Pendiente del arcén | 4% | 4% |
| Talud de desmonte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

## Red de tuberías

| Ajuste | Pies (EE. UU.) | Metros |
|---|---|---|
| Nombre y tipo | Pluvial, pluvial | Pluvial, pluvial |
| Pendiente mínima (marcador) | 0.50% | 0.50% |
| Recubrimiento mínimo (marcador) | 2 ft | 0.6 m |
| Salto en las estructuras (marcador) | 0.10 ft | 0.03 m |
| Diámetro de estructura nueva | 48 in | 1200 mm |
| Diámetro de tubería nueva | 12 in | 300 mm |
| Profundidad de sumidero | 0 | 0 |
| Brocal | Desde la superficie | Desde la superficie |

Una red de tuberías abierta desde LandXML usa también estas reglas, porque LandXML no las incluye.

## Volúmenes

| Ajuste | Valor |
|---|---|
| Método | Malla, muestreada en los centros de celda dentro de las líneas de talud |
| Tamaño de celda | Elegido para que el rectángulo envolvente del área rasanteada contenga unas 250,000 celdas (1, 2 o 5 veces una potencia de diez) |
| Hinchamiento y contracción | Ninguno |

## Plano

| Ajuste | Valor |
|---|---|
| Área | {{ui:Todo}} |
| Papel | Tabloide 11 × 17 in (proyectos en pies), ISO A3 (proyectos en metros); siempre apaisado |
| Escala | La mayor escala de la lista que quepa |
| Tinta | {{ui:Colores de capa}} |

Las etiquetas DXF se dimensionan para la escala a la que todo cabe en Tabloide (pies) o en A3 (metros).
