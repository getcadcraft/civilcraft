---
title: Valores iniciais e marcadores de posición
summary: Cada valor con que CivilCraft comeza, para proxectos novos, visualización, trazados, plataformas, corredores, redes de tubaxes, volumes e impresión, e cales son marcadores de posición que hai que substituír.
keywords: predeterminados, configuración, valores iniciais, marcadores de posición, criterios de deseño, normas, regras, supostos
from: fbfc7432
---

CivilCraft non ten un diálogo de configuración nin unha plantilla. Estes son os valores cos que comezan as cousas. Os valores marcados como **marcador de posición** non proveñen de ningunha norma: substitúaos polos criterios do seu proxecto antes de confiar nunha comprobación ou nunha cantidade.

## Proxecto novo

| Axuste | Valor |
|---|---|
| Nome | Terreo sen título (o nome do primeiro ficheiro de puntos substitúeo) |
| Unidades | Pés EUA |
| Nome da superficie | Terreo existente |
| Grupos de puntos | Cada grupo comeza como {{ui:Puntos}} |
| Aresta exterior máis longa | 0 (conserva todos os triángulos) |
| Pasos de desfacer conservados | 200 |

## Visualización

| Axuste | Valor |
|---|---|
| Superficie | {{ui:Terreo existente}} |
| Curvas cada | 1 (ft ou m) |
| Directora cada | 5.ª curva |
| Bandas | 8 |
| Activado | Curvas, etiquetas de curvas de nivel, puntos, liñas de quebra, bordo da superficie, tubaxes |
| Desactivado | Triángulos, bandas de altitude, frechas de pendente, etiquetas de puntos |

## Trazados e perfís

| Axuste | Valor |
|---|---|
| Nome | Trazado 1, Trazado 2 … |
| Estaca inicial | 0+00 |
| Raio da curva en cada PI interior | 100 ft ou 30 m, máis pequeno se non cabe na metade de cada tanxente |
| Perfil de proxecto | Ningún ata que comece un; {{ui:Comezar desde o terreo}} pon un PVI no terreo en cada extremo |
| Lonxitude da curva vertical | 0 (sen curva) ata que escriba un valor |

## Plataformas

| Axuste | Valor |
|---|---|
| Nome | Plataforma 1, Plataforma 2 … |
| Cota | O terreo no centro da plataforma, redondeado a 0,1 (0 se o centro está fóra da superficie) |
| Pendente de desmonte | 2 : 1 (marcador de posición) |
| Pendente de terraplén | 3 : 1 (marcador de posición) |

## Conxunto do corredor (marcadores de posición)

| Axuste | Pés EUA | Metros |
|---|---|---|
| Anchura da faixa | 12 ft | 3,6 m |
| Pendente da faixa | 2% | 2% |
| Anchura do arcén | 4 ft | 1,2 m |
| Pendente do arcén | 4% | 4% |
| Pendente de desmonte | 2 : 1 | 2 : 1 |
| Pendente de terraplén | 3 : 1 | 3 : 1 |
| Seccións cada | 10 ft | 5 m |

## Rede de tubaxes

| Axuste | Pés EUA | Metros |
|---|---|---|
| Nome e tipo | Pluvial, pluvial | Pluvial, pluvial |
| Pendente mínima (marcador de posición) | 0,50% | 0,50% |
| Recubrimento mínimo (marcador de posición) | 2 ft | 0,6 m |
| Desnivel nas estruturas (marcador de posición) | 0,10 ft | 0,03 m |
| Diámetro da nova estrutura | 48 in | 1200 mm |
| Diámetro do novo tubo | 12 in | 300 mm |
| Profundidade do pozo de sumidoiro | 0 | 0 |
| Borde | Desde a superficie | Desde a superficie |

Unha rede de tubaxes aberta desde LandXML usa tamén estas regras, porque LandXML non as inclúe.

## Volumes

| Axuste | Valor |
|---|---|
| Método | Malla, mostreada nos centros das celas dentro das liñas de talude |
| Tamaño da cela | Escollido para que o rectángulo envolvente da área nivelada conteña uns 250.000 celas (1, 2 ou 5 veces unha potencia de dez) |
| Esponxamento e contracción | Ningún |

## Impresión

| Axuste | Valor |
|---|---|
| Área | {{ui:Todo}} |
| Papel | Tabloid 11 × 17 in (proxectos en pés), ISO A3 (proxectos en metros); sempre en horizontal |
| Escala | A maior escala da lista que caiba |
| Tinta | {{ui:Cores das capas}} |

As etiquetas DXF dimensionanse á escala á que todo cabe en Tabloid (pés) ou en A3 (metros).
