---
title: Calcular os caudais de deseño de saneamento e comprobar o colector
summary: Introduza as persoas e a superficie que entran en cada pozo de rexistro dunha rede de saneamento; CivilCraft as suma augas abaixo na rede, calcula o caudal punta cun factor de punta e infiltración, e comproba a capacidade e a velocidade de cada tubaxe.
keywords: saneamento, colector, colector de saneamento, augas residuais, caudal de deseño, caudal punta, factor de punta, harmon, babbitt, infiltración, poboación, per cápita, porcentaxe de enchemento, autolimpeza, velocidade, dimensionamento de tubaxes, folla de deseño
from: 73ba197a
---

Os caudais de deseño de saneamento traballan sobre a [rede de tubaxes](topic:pipe-network) cando o seu {{ui:Tipo}} é {{ui:Saneamento}}. Sen nada seleccionado, o panel dereito mostra entón **Caudais de deseño de saneamento**, onde unha rede pluvial mostra a drenaxe pluvial.

## Introducir o que entra

1. Seleccione un pozo de rexistro. Baixo **Caudais de deseño de saneamento**, escriba {{ui:Persoas que entran aquí}} e {{ui:Superficie que entra aquí}} (hectáreas nun proxecto métrico, acres nun proxecto en pés).
2. Para tendas, oficinas ou industria, escriba persoas equivalentes: a superficie por as persoas por hectárea (ou acre) que use a súa axencia. A superficie conta para a infiltración en calquera dos dous casos.
3. Repita para cada pozo onde se conecta unha rúa ou unha parcela. Un pozo onde non se conecta nada mantén os dous valores en 0.

Cada tubaxe leva todo o que entra no seu pozo superior e por riba del. Seleccione un pozo para ver o que pasa por el.

## A configuración

| Configuración | Que significa |
|---|---|
| {{ui:Caudal por persoa}} | o caudal medio dunha persoa ao día: litros (proxecto métrico) ou galóns US (proxecto en pés) |
| {{ui:Infiltración}} | auga do subsolo que se filtra: litros por segundo e hectárea, ou galóns ao día por acre |
| {{ui:Factor de punta}} | Harmon, 1 + 14 / (4 + √P), ou Babbitt, 5 / P^0,2, sendo P a poboación en miles |
| {{ui:Factor de punta como mínimo}} / {{ui:Factor de punta como máximo}} | o factor mantense entre estes dous valores |
| {{ui:Manning n}} | para a capacidade e a velocidade |
| {{ui:Velocidade mínima}} / {{ui:Velocidade máxima}} | á profundidade propia do caudal punta na tubaxe |
| {{ui:Máximo da capacidade plena}} | canto pode encherse unha tubaxe no punto, como porcentaxe do que leva cheo |

Os valores de partida son marcadores de posición, non unha norma. Use os valores que publique a súa axencia.

## O que calcula

Para cada tubaxe, por orde de caudal:

- caudal punta = persoas × caudal por persoa × factor de punta + superficie × infiltración
- capacidade cheo (ecuación de Manning á pendente da tubaxe), e canto enche o punto
- o calado normal do caudal punta e a velocidade alí

A táboa **Resultados de saneamento** lista as persoas de cada tubaxe, o factor de punta, o caudal punta (L/s, ou gpm e pés cúbicos por segundo), a porcentaxe de enchemento e a velocidade. Os problemas listanse debaixo: unha tubaxe máis chea do límite, máis lenta que a velocidade mínima (pode non autolimparse), máis rápida que a máxima, ou sen caída. {{ui:Dimensione as tubaxes para estes caudais}} escolle para cada tubaxe o tamaño normalizado máis pequeno (de 200 mm ou 8 pulgadas en diante) que leva o seu punta dentro do límite; un {{key:Mod+Z}} desfai.

:::note
Este é o caudal punta permanente que calcula unha folla de deseño, comprobado contra unha folla de deseño publicada ata o seu redondeo impreso. Non é un modelo do colector no tempo: sen hidrogramas, almacenamento, bombas nin desbordamentos. Vexa [Aínda non construído](topic:not-built-yet).
:::

As velocidades usan a ecuación de Manning co mesmo n a cada calado. Algunhas axencias usan gráficos de parcial enchemento nos que n cambia co calado, o que dá unha velocidade algo menor nunha tubaxe que vai ao 60 ao 70 por cento de enchemento (uns 3 por cento menos).
