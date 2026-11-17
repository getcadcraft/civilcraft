---
title: Calcular os caudais pluviais, os diámetros das tubaxes e a liña piezométrica
summary: Debuxar as concas que desembocan en cada estrutura, sumar os caudais pola rede coa fórmula racional, dimensionar as tubaxes pola ecuación de Manning e ver onde a liña piezométrica vai chea ou chega á superficie.
keywords: drenaxe pluvial, conca, área de drenaxe, fórmula racional, coeficiente de escorrentía, tempo de concentración, intensidade da chuvia, IDF, Manning, dimensionamento de tubaxes, liña piezométrica, LP, liña de enerxía, LE, funcionamento en carga, inundación, nivel aguas abaixo
from: e44872ec
---

A drenaxe pluvial traballa sobre a [rede de tubaxes](topic:pipe-network): debuxe primeiro a rede, despois as áreas que desaugan nela. Todo aparece baixo **Drenaxe pluvial** no panel dereito cando non hai nada seleccionado.

## Debuxar unha conca

1. Prema **Debuxar unha conca** en **Drenaxe pluvial**.
2. Prema os vértices da área que desemboca nunha estrutura. {{key:Enter}} ou un dobre clic remata; {{key:Backspace}} retira o último vértice, {{key:Esc}} para.
3. A conca desemboca nunha estrutura dentro dela, senón na máis próxima. Ábrense as súas **Propiedades**: estableza o seu nome, o **Coeficiente de escorrentía C** (a parte da chuvia que escorre, de 0 a 1), o **Tempo de concentración** en minutos e a estrutura á que **Desemboca en**.

**Debuxar outra conca** nas súas Propiedades inicia a seguinte. Prema dentro dunha conca no plano para seleccionala; {{key:Delete}} a elimina. Cada cambio é un paso: {{key:Mod+Z}} desfai o cambio.

## Fixar a tormenta de cálculo

A intensidade da chuvia é i = a ÷ (tc + b) elevado a c, en polgadas por hora para un proxecto en pés e en milímetros por hora para un proxecto en metros. Axuste **Intensidade a**, **b** e **c** á súa propia curva intensidade-duración-frecuencia para o período de retorno para o que deseña.

:::warning
A curva de intensidade inicial, o n de Manning (0,013) e a perda na unión (0,5) son valores provisionais, non unha norma. Fíxeos a partir dos seus propios datos de chuvia e criterios de deseño.
:::

- **Tempo de concentración máis curto**: ningunha tubaxe se calcula cun tempo máis curto (10 minutos para comezar).
- **n de Manning**: a rugosidade das tubaxes.
- **Perda na unión**: a altura perdida en cada estrutura, como parte da altura de velocidade V²/2g da tubaxe que sae dela.
- **Cota da auga na saída**: o nivel aguas abaixo, onde a última tubaxe descarga. Déixeo baleiro cando a saída descarga libre.

## Como se suman os caudais

Cada tubaxe leva todas as concas por riba dela. Q = C × i × A, onde C × A se suma pola rede e i é a intensidade no tempo de concentración máis longo da auga que chega: o tempo propio dunha conca, ou o tempo dende unha conca augas arriba máis o tempo de percorrido pola tubaxe (lonxitude ÷ velocidade a seción chea). Q está en pés cúbicos por segundo (A en acres) ou metros cúbicos por segundo (A en hectáreas).

## Dimensionar as tubaxes

A táboa baixo **Caudais e liñas piezométricas** amosa, para cada tubaxe, o caudal, o que leva a seción chea coa súa pendente, a velocidade, a liña piezométrica na súa cabeza e no seu pé, e a altura á que vai a auga.

**Dimensionar as tubaxes para estes caudais** dálle a cada tubaxe o menor tamaño normalizado que leva o seu caudal coa súa propia pendente (de 12 a 72 polgadas, ou de 300 a 1800 mm). É un único paso. As cotas de fondo quedan onde están: se cambian os tamaños, use **Fixar todas as cotas de fondo segundo as regras** para manter o recubrimento e volva revisar a táboa.

## Ler as liñas piezométricas

A liña piezométrica (LP) calcúlase desde o desaugadoiro augas arriba:

- Unha tubaxe que leva parte chea ten a súa LP na superficie da auga: a cota de fondo máis a altura normal.
- Cando a auga de abaixo está máis alta que a coroa, ou leva máis do que pode levar a seción chea, vai chea (en carga) e a súa LP sobe pola pendente de fricción ao longo da súa lonxitude.
- En cada estrutura a LP é a LP da cabeza da tubaxe que sae, máis a perda na unión.
- A liña de enerxía (LE) é a LP máis a altura de velocidade.

Unha tubaxe que vai chea aparece listada, e tamén calquera estrutura onde a LP está por riba do bordo: a auga chega alí á superficie e a estrutura se marca cun círculo vermello no plano. Seleccione unha tubaxe ou unha estrutura para ver o seu caudal, altura, velocidade e as dúas liñas nas súas Propiedades.

## Encamiñar unha tormenta

A fórmula racional dá un pico para cada tubaxe. **Encamiñar a tormenta** (baixo os resultados, nas Propiedades da rede) calcula toda a tormenta: a escorrentía de cada conca no tempo, levada pola rede de tubaxes co seu tempo de percorrido e almacenamento, e sumada onde se xuntan.

1. Deixe baleiros {{ui:Rain lasts}} e {{ui:Rain intensity}} para usar o tempo de concentración máis longo e a curva de chuvia de arriba, ou escriba os seus.
2. Prema {{ui:Route the storm}}. A táboa lista, para cada tubaxe, o caudal máximo de entrada e de saída, en canto baixa o pico de saída, que parte da súa capacidade chea usa e o minuto no que alcanza o pico.
3. Cada saída recibe un pequeno gráfico de caudal no tempo e {{ui:Download the hydrograph (CSV)}}.

Unha conca envía a chuvia promediada sobre o seu tempo de concentración, así que unha tormenta máis curta que ese tempo acada un pico máis baixo que C × i × A. Cada tubaxe se encamiña co método Muskingum–Cunge, usando a altura de caudal que xa atopara a fórmula racional. Dúas ramas con tempos de concentración distintos non alcanzan o pico á vez, así que a súa suma é menor que a suma dos seus picos.

Isto non modela a sobrecarga en carga, o remanso, o almacenamento nas estruturas nin as inundacións. Unha tubaxe cuxo pico encamiñado supera a súa capacidade chea aparece listada, e a súa auga pásase como se cabese. Use esta ferramenta para ver o tempo e a atenuación, non para dimensionar a tubaxe. É unha axuda de cálculo: un enxeñeiro debe revisala.

## Gardado co proxecto

As concas e os axustes da tormenta gárdanse no ficheiro do proxecto. Aínda non están no trazado PDF, no DWG nin no DXF, nin en LandXML: vexa [Aínda non implementado](topic:not-built-yet).
