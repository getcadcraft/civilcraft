---
title: Introducir unha poligonal e compensala pola regra da brúxula
summary: Escriba os ángulos ou os rumbos e as distancias, comprobe o peche angular e lineal e a precisión, compense pola regra da brúxula e engada as estacións como puntos de levantamento ou o circuíto como parcela.
keywords: poligonal, poligonal pechada, circuíto, ángulos á dereita, visada atrás, rumbos, distancias, peche, erro de peche, precisión, regra da brúxula, bowditch, compensación, levantamento
from: 56ce5a8c
---

Unha poligonal é unha serie de tramos medidos: en cada estación, un ángulo (ou un rumbo) e unha distancia até a seguinte. Prema **Introducir unha poligonal** en **Poligonal** no panel dereito cando non haxa nada seleccionado.

## Onde comeza e onde remata

1. **Comezar no punto de levantamento**: o seu número. Ou escriba un norte e un leste.
2. **Tramos como**: **Ángulos á dereita e distancias**, ou **Rumbos e distancias**.
3. Cos ángulos, indique de onde parten: un **Punto de levantamento de visada atrás**, ou **o seu acimut** (desde a primeira estación cara á visada atrás, no sentido das agullas do reloxo desde o norte).
4. **Remate**: **de volta ao inicio (un circuíto)**, ou **nun punto de levantamento** e o seu número (unha poligonal aberta entre puntos coñecidos).

## Escriba os tramos

Un tramo por liña: primeiro o ángulo ou o rumbo, despois a distancia e, se quere, un nome para a estación á que chega:

- Ángulos á dereita, xirados no sentido das agullas do reloxo na estación de onde sae o tramo, desde a estación de atrás até a seguinte: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` e `270.0028` tamén funcionan.
- Rumbos: `N 45°30'15" E 125.50 B`, ou un acimut como unha soa palabra: `AZ 45-30-15 125.50 B`.
- Nun circuíto con ángulos, remate con `close` e de novo o ángulo do inicio, xirado desde a última estación até a segunda: `close 270°00'05"`. Iso é o que comproba os ángulos.

As liñas que non se poden ler indícanse cos seus números de liña. "feet", as comas e as liñas de comentario con `#` son admisibles.

## Lea o peche

Segundo escribe, o diálogo mostra:

- **Erro de peche angular**: canto se separan os ángulos do peche e a parte que corresponde a cada ángulo. Sen ángulo de peche non se comprobán os ángulos, e calquera erro neles aparece no erro de peche lineal.
- **Erro de peche lineal**: a distancia entre onde remata a poligonal e onde debería rematar, e en que dirección.
- **Precisión**: a lonxitude da poligonal dividida polo erro de peche lineal: 1 : 10 000 significa 1 ft en 10 000 ft.
- As estacións despois da compensación, e canto se desprazou cada unha.

## A compensación

Primeiro o erro de peche angular repártese por igual entre os ángulos. Despois o erro de peche lineal repártese entre os tramos pola regra da brúxula (Bowditch): cada estación se despraza en sentido contrario ao erro, en proporción á lonxitude percorrida para chegar a ela, de xeito que a poligonal remata exactamente onde debe.

:::note
A regra da brúxula é unha compensación estándar, non polos mínimos cadrados, e non pondera os ángulos fronte ás distancias. Se a precisión é suficiente cabe decidilo segundo as súas normas e as da súa xurisdición.
:::

## Use o resultado

- **Engadir como puntos de levantamento**: as estacións compensadas convértense en puntos de levantamento cos nomes que deu (se non, os seguintes números libres), descrición `TRAV`, sen cota. A última estación dun circuíto é o seu inicio, polo que non se engade dúas veces. Un só paso: {{key:Mod+Z}} desfai a operación.
- **Engadir como parcela** (circuítos): as estacións compensadas convértense nunha [parcela](topic:parcels), coas súas etiquetas e a súa descrición legal.
- **Informe (CSV)**: as liñas de peche e, despois, o rumbo, a distancia, as coordenadas sen compensar e compensadas e as correccións de cada estación.
