---
title: Calcula els cabals de disseny residuals i revisa el clavegueram
summary: Introduïu les persones i l'àrea que entren a cada pou de registre d'una xarxa residual; CivilCraft les suma xarxa avall, calcula el cabal punta amb un factor de punta i la infiltració, i revisa la capacitat i la velocitat de cada tub.
keywords: residual, clavegueram, clavegueram residual, aigües residuals, cabal de disseny, cabal punta, factor de punta, harmon, babbitt, infiltració, població, per càpita, percentatge d'ompliment, autonetejant, velocitat, dimensionament de tubs, full de càlcul de disseny
from: 73ba197a
---

Els cabals de disseny residual funcionen sobre la [xarxa de tubs](topic:pipe-network) quan el seu {{ui:Tipus}} és {{ui:Residual}}. Sense res seleccionat, el panell de la dreta mostra aleshores **Cabals de disseny residual** on una xarxa pluvial mostra drenatge pluvial.

## Introduïu el que hi entra

1. Seleccioneu un pou de registre. Sota **Cabals de disseny residual**, escriviu {{ui:Persones que hi entren}} i {{ui:Àrea que hi entra}} (hectàrees en un projecte mètric, acres en un projecte en peus).
2. Per a botigues, oficines o indústria, escriviu les persones equivalents: l'àrea per les persones per hectàrea (o acre) que fa servir la vostra agència. L'àrea compta per a la infiltració en tots dos casos.
3. Repetiu-ho per a cada pou on es connecta un carrer o una parcel·la. Un pou on no es connecta res es manté a 0 en tots dos camps.

Cada tub porta tot el que entra al seu pou superior i per sobre seu. Seleccioneu un pou per veure què hi passa.

## La configuració

| Opció | Què significa |
|---|---|
| {{ui:Cabal per persona}} | el cabal mitjà d'una persona al dia: litres (projecte mètric) o galons US (projecte en peus) |
| {{ui:Infiltració}} | aigua subterrània que s'infiltra: litres per segon per hectàrea, o galons al dia per acre |
| {{ui:Factor de punta}} | Harmon, 1 + 14 / (4 + √P), o Babbitt, 5 / P^0.2, amb P la població en milers |
| {{ui:Factor de punta com a mínim}} / {{ui:Factor de punta com a màxim}} | el factor es manté entre aquests dos valors |
| {{ui:Manning n}} | per a la capacitat i la velocitat |
| {{ui:Velocitat mínima}} / {{ui:Velocitat màxima}} | a l'alçada pròpia del cabal punta dins del tub |
| {{ui:Màxim de la capacitat plena}} | quant pot omplir-se un tub en punta, com a percentatge del que transporta a plena secció |

Els valors inicials són provisionals, no una norma. Useu els valors que publica la vostra agència.

## Què calcula

Per a cada tub, en ordre de flux:

- cabal punta = persones × cabal per persona × factor de punta + àrea × infiltració
- capacitat a plena secció (equació de Manning amb la pendent del tub), i quant l'omple el punt
- el calat normal del cabal punta i la velocitat allà

La taula de **Resultats residuals** llista les persones de cada tub, el factor de punta, el cabal punta (L/s, o gpm i peus cúbics per segon), el percentatge d'ompliment i la velocitat. Els problemes es llisten a sota: un tub més ple que el límit, més lent que la velocitat mínima (potser no es neteja sol), més ràpid que la màxima, o sense pendent. {{ui:Dimensioneu els tubs per a aquests cabals}} tria per a cada tub la mida normalitzada més petita (200 mm o 8 polzades i més) que transporta el seu punt dins del límit; un {{key:Mod+Z}} ho desfà.

:::note
Aquest és el cabal punta permanent que calcula un full de càlcul de disseny, comprovat amb un full de disseny publicat fins a l'arrodoniment imprès. No és un model del clavegueram en el temps: no hi ha hidrogrames, emmagatzematge, bombes ni desbordaments. Vegeu [Encara no implementat](topic:not-built-yet).
:::

Les velocitats fan servir l'equació de Manning amb el mateix n a totes les alçades. Algunes agències deixen que n canviï amb l'alçada en els seus gràfics de tub parcialment ple, cosa que dona una velocitat lleugerament més baixa en un tub que funciona al 60 a 70 per cent d'ompliment (uns 3 per cent menys).
