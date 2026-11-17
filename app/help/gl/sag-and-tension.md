---
title: Frecha e tensión
summary: As súas hipóteses de carga (temperatura, vento, xeo) e os límites de tensión, como calcula CivilCraft a tensión de cada sección, e as táboas de tendido.
keywords: frecha, tensión, hipótese de carga, temperatura, vento, xeo, xeo asimétrico, vano de cálculo, vano equivalente, cambio de estado, catenaria, táboa de tendido, resistencia á rotura, tensión habitual
from: f8876c35
---

## Hipóteses de carga e límites

{{ui:Máis}} › {{ui:Hipóteses de carga e límites…}} edita as regras que segue cada liña do proxecto.

- **Hipóteses de carga**: unha temperatura, unha presión de vento sobre o condutor (Pa) e xeo radial (mm, coa súa densidade). A primeira hipótese é a de referencia.
- **Límites de tensión**: unha parte da resistencia á rotura do condutor, sobre a tensión horizontal ou sobre a maior tensión nun apoio, nunha hipótese de carga. Ou dea vostede a tensión horizontal.
- **Distancias libres**: a distancia libre que o condutor mantén sobre o chan, unha estrada, un edificio e demais. Engada, renomee e elimine: son súas. Por debaixo delas, escolla as regras para **Plantas de paisaxismo baixo unha liña**, **Muros de paisaxismo baixo unha liña** e **Cruzamentos subterráneos**.
- **Hipóteses que usan as comprobacións**: que hipótese dá a maior frecha (calor), o balanceo do illador (vento), o xeo e o xeo nun só lado dun apoio.
- **Factores**: factor de separación entre fases k, o balanceo máximo do illador, un factor sobre as cargas dos apoios e das pezas de unión, os ángulos de xiro que fan os apoios de ángulo e de fin de liña, a cuberta mínima sobre os cables enterrados e a maior caída de tensión.

## Paquetes: regras e unha biblioteca para un país

Non hai regras dun país integradas en CivilCraft. Un **paquete** garda un conxunto de regras e unha biblioteca nun só ficheiro (`.cclinepack.json`), para un país, un operador de rede ou unha empresa:

- **Gardar como paquete…** en {{ui:Hipóteses de carga e límites…}} escribe o conxunto de regras mostrado e a súa biblioteca (ou, se a biblioteca aínda está baleira, os elementos que usa este proxecto). Escriba primeiro o **País ou rexión**.
- **Abrir un conxunto de regras ou paquete…** lee un paquete, un ficheiro de regras ou un ficheiro de biblioteca. As regras dun paquete mostráronse no diálogo (prema **Aplicar** para usalas) e os seus elementos pasan á súa biblioteca.
- Os paquetes que comparten outros lístanse na páxina de complementos baixo **Paquetes de liñas eléctricas**. Dous paquetes de exemplo mostran o formato; non son as regras de ningún país.

Cada paquete se comproba ao abrilo, como calquera ficheiro. Compruebe cada valor coa norma que corresponda antes de construír nada.

Hai dous conxuntos de regras de exemplo para comezar: **Exemplo: clima frío** e **Exemplo: clima temperado**. Os seus números non proceden de ningunha norma: estableza os valores que indique a súa norma. {{ui:Gardar regras}} e {{ui:Abrir regras…}} comparten un conxunto de regras como ficheiro.

## Como se calcula a tensión

Para cada sección entre fins de liña:

1. O **vano de cálculo** é √(ΣL³ ÷ ΣL) dos seus vanos.
2. Cada límite convértese nunha tensión horizontal na hipótese de referencia mediante a **ecuación de cambio de estado** sobre o vano de cálculo: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. O máis restritivo fixa a tensión.
3. A tensión de cada hipótese de carga sae desa, e a forma de cada vano é a **catenaria** exacta que pasa polos seus dous puntos de suxeición (incluídos os vanos en pendente): a frecha desde a corda, a lonxitude e a tensión en cada extremo.

A carga por metro nunha hipótese: o peso máis o xeo (área de xeo × densidade × g) na vertical; presión do vento × o diámetro con xeo na horizontal.

## Táboas de tendido

{{ui:Máis}} › {{ui:Táboas de tendido…}} lista, para cada sección, a tensión horizontal e a frecha de cada vano a cada temperatura do conxunto de regras (de −5 °C a 40 °C de 5 °C en 5 °C para comezar), en aire en calma. Gárdeas, e a táboa de apoios, en CSV.

Non se contan: a fluencia do condutor ao longo dos anos, nin o estiramento dun condutor novo. Engádaos a través das temperaturas coas que tende.
