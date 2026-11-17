---
title: Unidades, estacións e formatos numéricos
summary: Proxectos en pés e en metros, como se escriben e se escriben as estacións, as pendentes, os taludes, os rumbos, as áreas, os volumes e os tamaños de tubaxe, e o que fai cambiar as unidades.
keywords: escribir unha lonxitude, aritmética, calculadora, suma, fracción, pés e polgadas, 4+7/16, unidades, pés, pés US, metros, métrico, imperial, formato de estacións, estacionamento, pendente, percentaxe, talude, h:v, rumbo, iardas cúbicas, diámetro
from: 0b9b5b6b
---

## Unidades do proxecto

Un proxecto está en **pés US** ou en **metros** ({{ui:Unidades}} no panel esquerdo). Todas as coordenadas, cotas, lonxitudes e estacións do proxecto están nesa unidade.

:::warning
Cambiar {{ui:Unidades}} cambia as etiquetas, o formato das estacións, os valores por defecto e a forma en que se escriben os ficheiros. **Non** converte ningún número. Un sitio medido en pés e cambiado a metros conserva os mesmos números, agora lidos como metros. A barra de estado indica "As unidades son agora metros. As coordenadas non se converteron." Estableza as unidades para que coincidan cos seus datos antes de deseñar.
:::

Que depende das unidades:

| | Pés US | Metros |
|---|---|---|
| Formato de estacións | `12+34.56` (estacións de 100 ft) | `1+234.567` (estacións de 1000 m) |
| Intervalos de curvas de nivel ofrecidos | 0,25 a 20 ft | 0,1 a 10 m |
| Área | sq ft | sq m |
| Volume | cu yd | cu m |
| Diámetro de tubaxe e estrutura | polgadas | milímetros |
| Radio de curva por defecto | 100 ft | 30 m |
| Marcas de estacións no plano | cada 50 ft, etiquetas cada 100 ft | cada 20 m, etiquetas cada 100 m |
| Escalas de impresión | 1" = 5' a 1" = 1000' | 1:50 a 1:10000 |
| Unidade lineal de LandXML | USSurveyFoot | meter |

Un proxecto novo comeza en pés, ou en metros cando a unidade de lonxitude marcada con estrela en {{ui:Configuración}} › {{ui:Xeral}} › {{ui:Unidades}} é unha métrica. A lista **Unidades** mostra as unidades activadas alí, e sempre as do propio proxecto. Cando hai marcada alí unha unidade de área ou de volume (acres, hectáreas, acre-pés …), as áreas e os volumes informan nela en lugar da columna de arriba. Vexa [Unidades, valores escritos e as listas de unidades](common:unit-lists).

Cando abre un LandXML, o proxecto toma as unidades do ficheiro. Un ficheiro en pés internacionais abre como proxecto en pés; os números non se cambian.

## Escribir lonxitudes e sumas

Calquera caixa que admita unha lonxitude ou unha cota le algo máis que un número simple: prema {{key:Enter}} e a caixa mostra o resultado nas unidades do proxecto.

| Escribe | En proxecto en pés | En proxecto en metros |
|---|---|---|
| `12.5` | 12,5 ft | 12,5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12,5 ft, 12,54 ft, 0,5 ft, 3,5 ft | as mesmas lonxitudes en metros |
| `4 7/16`, `4-7/16` | 4,4375 ft | 4,4375 m |
| `450 mm`, `1.2 m`, `90 cm` | en pés | 0,45 m, 1,2 m, 0,9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, e as demais en pés US de levantamento | as mesmas lonxitudes en metros |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | a suma, en pés | a suma, en metros |

Funciona calquera marca de lonxitude da táboa de unidades compartida, co seu tamaño exacto: os pés dun proxecto son pés US de levantamento, polo que `10 US ft` vale 10 e `3 ch` (a cadea de pé internacional) vale 197,9996. Use `+ - * /` e parénteses, e `abs`, `round`, `ceil` e `floor`. Un guion escrito dentro dunha lonxitude forma parte dela (`24'-6"`, `6-1/2`); con espazos ao seu redor, resta (`24' - 6"` = 23,5 ft). Un número simple multiplica ou divide unha lonxitude, e é unha lonxitude nas unidades do proxecto cando se suma a unha. Se CivilCraft non pode ler o que escribiu, a caixa márcase e a barra de estado indica onde está o erro.

As estacións non son sumas: `10+00` nunha caixa de estación é a estación 10+00. As pendentes en percentaxe, os números de punto e as descricións lense tal como están.

## Estacións

Unha estación é unha distancia ao longo dun trazado, escrita cun signo máis:

- En pés: a parte anterior ao máis son centenares de pés. `12+34.56` é 1 234,56 ft.
- En metros: a parte anterior ao máis son miles de metros. `1+234.567` é 1 234,567 m.
- As estacións negativas conservan o signo diante: `-0+50.00`.

En calquera lugar onde escriba unha estación (**Estación inicial**, a **Estación** dun PVI), pode escribila co máis (`12+34.56`) ou como número simple (`1234.56`). Os espazos ignóranse.

## Pendentes e taludes

- **Pendentes** (perfís, tubaxes, taludes de carril e de arcén) están en percentaxe: `+1.25%` sobe no sentido das estacións crecentes, `-0.50%` baixa.
- **Taludes laterais** (desmonte e terraplén de plataforma, desmonte e terraplén de corredor) son horizontal fronte a vertical: `3` significa 3 : 1, tres en horizontal por un en vertical, cara arriba ou cara abaixo.
- **K** para unha curva vertical é a súa lonxitude dividida pola variación da pendente en percentaxe.

## Rumbos e ángulos

Os rumbos son rumbos de cuadrante en graos, minutos e segundos: `N 63°12'05" E`. As deflexións das curvas (Δ) usan os mesmos graos, minutos e segundos, con "left" ou "right" (esquerda ou dereita).

## Desfasamentos

Os desfasamentos respecto a un trazado son distancias perpendiculares a el, marcadas **L** (esquerda) ou **R** (dereita) mirando cara ás estacións crecentes.

## Visualización de números

- As coordenadas e as cotas mostran 2 decimais nos paneis e na barra de estado (3 para un punto de levantamento seleccionado).
- As áreas e os volumes agrúpanse por millares: `128 250 sq ft`, `454,9 cu yd`.
- As coordenadas nunca se agrupan, para que se poidan copiar tal como están.

## Coordenadas

CivilCraft traballa nun plano: leste cara á dereita, norte cara arriba. O deseño fanse sempre en coordenadas proxectadas (plano estatal, UTM ou unha cuadrícula local). Pode indicarlle a CivilCraft en que sistema de coordenadas están, e se son coordenadas de cuadrícula, de terreo ou locais; entón mostra a latitude e a lonxitude e sitúa os ficheiros GIS e as capas de mapa, pero nunca cambia as unidades nin move as coordenadas por conta propia. Vexa [Definir o sistema de coordenadas do proxecto](topic:coordinate-systems) e [Coordenadas de terreo e locais](topic:ground-and-local-coordinates). Os valores de plano estatal grandes (millóns de pés) son correctos; CivilCraft traballa internamente en relación ao sitio para manter a precisión.
