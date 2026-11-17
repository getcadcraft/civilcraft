---
title: Valores iniciales y marcadores de posición
summary: Cada valor con el que empieza CivilCraft, para proyectos nuevos, visualización, alineaciones, plataformas, obras lineales, redes de tuberías, volúmenes y trazados, y cuáles son marcadores de posición que debe reemplazar.
keywords: valores predeterminados, configuración, valores iniciales, marcadores de posición, criterios de diseño, normas, reglas, supuestos
from: fbfc7432
---

CivilCraft no tiene un cuadro de configuración ni una plantilla. Estos son los valores con los que empiezan las cosas. Los valores marcados como **marcador de posición** no se toman de ninguna norma: reemplácelos con los criterios de su proyecto antes de confiar en una verificación o en una cantidad.

## Proyecto nuevo

| Ajuste | Valor |
|---|---|
| Nombre | Sitio sin título (el nombre del primer archivo de puntos lo reemplaza) |
| Unidades | Pies de EE. UU. |
| Nombre de la superficie | Terreno natural |
| Grupos de puntos | Cada grupo empieza como {{ui:Puntos}} |
| Borde exterior más largo | 0 (conservar cada triángulo) |
| Pasos de deshacer guardados | 200 |

## Visualización

| Ajuste | Valor |
|---|---|
| Superficie | {{ui:Terreno natural}} |
| Curvas de nivel cada | 1 (ft o m) |
| Mayores cada | 5.ª curva |
| Bandas | 8 |
| Activadas | Curvas de nivel, etiquetas de curvas, puntos, líneas de ruptura, borde de superficie, tuberías |
| Desactivadas | Triángulos, bandas de elevación, flechas de pendiente, etiquetas de puntos |

## Alineaciones y perfiles

| Ajuste | Valor |
|---|---|
| Nombre | Alineación 1, Alineación 2 … |
| Estación inicial | 0+00 |
| Radio de curva en cada PI interior | 100 ft o 30 m, más corto si eso no cabe en la mitad de cada tangente |
| Perfil de proyecto | Ninguno hasta que inicie uno; {{ui:Iniciar desde el terreno}} pone un PVI sobre el terreno en cada extremo |
| Longitud de la curva vertical | 0 (sin curva) hasta que escriba una |

## Plataformas

| Ajuste | Valor |
|---|---|
| Nombre | Plataforma 1, Plataforma 2 … |
| Elevación | El terreno en el centro de la plataforma, redondeado a 0.1 (0 si el centro está fuera de la superficie) |
| Talud de corte | 2 : 1 (marcador de posición) |
| Talud de terraplén | 3 : 1 (marcador de posición) |

## Conjunto de la obra lineal (marcadores de posición)

| Ajuste | Pies de EE. UU. | Metros |
|---|---|---|
| Ancho de carril | 12 ft | 3.6 m |
| Pendiente de carril | 2% | 2% |
| Ancho de acotamiento | 4 ft | 1.2 m |
| Pendiente de acotamiento | 4% | 4% |
| Talud de corte | 2 : 1 | 2 : 1 |
| Talud de terraplén | 3 : 1 | 3 : 1 |
| Sección cada | 10 ft | 5 m |

## Red de tuberías

| Ajuste | Pies de EE. UU. | Metros |
|---|---|---|
| Nombre y tipo | Pluvial, pluvial | Pluvial, pluvial |
| Pendiente mínima (marcador de posición) | 0.50% | 0.50% |
| Cubierta mínima (marcador de posición) | 2 ft | 0.6 m |
| Caída en estructuras (marcador de posición) | 0.10 ft | 0.03 m |
| Diámetro de estructura nueva | 48 in | 1200 mm |
| Diámetro de tubería nueva | 12 in | 300 mm |
| Profundidad del sumidero | 0 | 0 |
| Brocal | Desde la superficie | Desde la superficie |

Una red de tuberías abierta desde LandXML también usa estas reglas, porque LandXML no las lleva.

## Volúmenes

| Ajuste | Valor |
|---|---|
| Método | Rejilla, muestreada en los centros de celda dentro de las líneas de empate |
| Tamaño de celda | Elegido para que el rectángulo envolvente del área rasante contenga unas 250,000 celdas (1, 2 o 5 veces una potencia de diez) |
| Hinchamiento y contracción | Ninguno |

## Trazado

| Ajuste | Valor |
|---|---|
| Área | {{ui:Todo}} |
| Papel | Tabloide 11 × 17 in (proyectos en pies), ISO A3 (proyectos en metros); siempre horizontal |
| Escala | La escala más grande de la lista que quepa |
| Tinta | {{ui:Colores de capa}} |

Las etiquetas DXF se dimensionan para la escala a la que todo cabe en Tabloide (pies) o A3 (metros).
