---
title: "Futurs climàtics: inundació, calor i incendi forestal el 2050 i el 2080"
summary: A De l'adreça a l'emplaçament, pujar el nivell d'inundació de l'emplaçament per a un clima futur, fer el cribratge de l'exposició a incendis forestals i transformar un fitxer meteorològic, i presentar el present al costat del futur, a partir d'un paquet de dades climàtiques (SSP2-4.5 i SSP5-8.5, 2050 i 2080).
keywords: clima, canvi climàtic, futur, 2050, 2080, ssp, cmip6, escenari, nivell del mar, inundació, cota d'inundació de base, bfe, fema, calor, fitxer meteorològic, epw, morfització, incendi forestal, incendi de vegetació
from: b0d2ee38
---

Les xifres climàtiques vénen d'un **paquet de dades**, no de l'aplicació. Activeu el complement {{ui:Futurs climàtics}} a Configuració › Complements, o carregueu un fitxer de paquet propi al bloc {{ui:Futur climàtic}}.

:::warning
El paquet que ve amb el complement és una **mostra**: tres llocs (Denver, Miami, Johannesburg), un model climàtic, cinc anys en cada període de 20 anys. Serveix per provar les eines, **no per al disseny**. Un paquet complet es construeix amb `tools/climate/build-pack.mjs` a partir de les dades NEX-GDDP-CMIP6 de la NASA.
:::

## On és

Superfície › Més › De l'adreça a l'emplaçament. Definiu el punt, afegiu les capes (una capa d'inundació de la FEMA dona la cota d'inundació de base) i premeu el botó que llegeix l'emplaçament. Sota les files de l'emplaçament hi ha el bloc {{ui:Futur climàtic}}: trieu un **Escenari** (SSP2-4.5 o SSP5-8.5) i un **Any** (2050 = 2041-2060, 2080 = 2071-2090, tots dos respecte a 1995-2014). S'usa el lloc del paquet més proper al punt, o el que trieu; si és lluny de tots, s'usen els canvis mitjans globals i el panell ho indica.

## Cota de disseny d'inundació

El nivell actual és la cota d'inundació de base de la FEMA quan la capa d'inundació en tenia una (en peus, NAVD 88); altrament, escriviu-ne el vostre. Trieu el tipus d'inundació (costanera, de riu o de pluja intensa, o totes dues), la profunditat de la inundació a l'emplaçament per a la part de pluja, i un franc si en voleu un. {{ui:Puja el nivell d'inundació}} mostra el nivell actual i el futur un al costat de l'altre, les parts del nivell del mar i de pluja, i les hipòtesis: tot l'ascens del nivell del mar s'afegeix a un nivell costaner; el cabal del riu puja a la mateixa mesura que la pluja del dia més plujós, i la profunditat segueix el cabal elevat a 0.6 (Manning, canal ample); les parts se sumen.

:::warning
Un cribratge del canvi, no un estudi d'inundació. La cota de disseny d'inundació és la de l'autoritat o la del vostre enginyer.
:::

## Exposició a incendis forestals (només cribratge)

La vegetació més propera, la pendent cap amunt des d'ella i la distància donen una banda, de molt baixa a extrema, en present i en futur (el futur multiplica pel canvi de l'índex meteorològic d'incendi del paquet). **Només cribratge**: escala relativa pròpia per saber si un emplaçament necessita una avaluació de risc d'incendi forestal adequada; no és una qualificació normativa.

## Calor: un fitxer meteorològic futur

Trieu un fitxer `.epw` d'avui i {{ui:Crea el fitxer meteorològic futur}}: es morfitza amb el mètode de desplaçament i estirament publicat (Belcher, Hacker i Powell 2005) i es compara la calor (temperatura mitjana i més alta, temperatures de disseny, hores per sobre de 30 °C i 35 °C, graus-dia). {{ui:Desa el fitxer meteorològic futur}} el desa per al panell d'Entorn, per a la comprovació energètica de BimCraft o per a les vostres pròpies eines.

## D'on surten les dades

NASA NEX-GDDP-CMIP6 (sortida de models CMIP6 regionalitzada, CC BY 4.0 per model) per a la temperatura, la humitat, el sol, la pluja i el temps d'incendi; la mitjana global de l'AR6 de l'IPCC per a l'ascens del nivell del mar, tret que el paquet porti xifres locals. El panell mostra la font, la llicència i la data del paquet.
