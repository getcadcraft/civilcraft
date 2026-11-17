---
title: Calcula les hores de sol en un emplaçament
summary: Trieu un dia (o una estació) i un fus horari, i vegeu les hores de sol directe a cada mur de cada massa i al terreny del voltant, amb el terreny dibuixat al plànol i els números en CSV.
keywords: sol, hores de sol, ombra, ombrejat, accés solar, hores de llum, façana, mur, estació, solstici, equinocci, fus horari, horari d'estiu, latitud, longitud, CSV, ràster
from: 4e32a314
---

**Hores de sol** compta les hores de sol directe que arriben a cada mur de cada massa d'edifici i al terreny del voltant, en un dia que trieu o com a mitjana d'una estació. Les masses i el terreny projecten ombra; res més no ho fa (ni arbres, ni veïns que no heu dibuixat). La llum del cel que no és sol directe no es compta.

## Abans de començar

La posició del sol surt de la latitud i la longitud de l'emplaçament, que venen del **sistema de coordenades** del projecte. Un projecte sense sistema es rebutja amb un missatge: establiu-lo primer (**Coordenades** al grup GIS). Una latitud i una longitud escrites a mà serien una suposició, per això no hi ha caixa per escriure-les.

## Calcula-ho

A **Propietats**, sota **Masses d'edifici**, **Hores de sol**:

1. Trieu el **Dia**. Comença amb el dia en què el sol és més baix on sou (21 de desembre, o 21 de juny a l'hemisferi sud). Per a una estació, marqueu **Sobre una estació**, trieu l'**Últim dia** i cada quants dies s'han de prendre mostres.
2. Escriviu el **Fus horari**: un nom com `America/Mexico_City`, o un desfasament respecte de l'UTC com `-6`. Un nom segueix les regles d'horari d'estiu d'aquell fus per al dia; un desfasament que escriviu s'usa tal com l'escriviu, de manera que useu el que està en vigor aquell dia. La línia sota la caixa us indica quin desfasament ha trobat.
3. Trieu cada quan se situa el sol (cada 5, 10, 15 o 30 minuts), i després premeu **Calcula les hores de sol**. Una estació s'executa en processos de fons; **Atura** la cancel·la.

## Què obteniu

- Una taula per massa: el **mur pitjor**, la **mitjana** i el **mur millor**, en hores per dia, i una taula de cada mur amb la seva orientació i les seves hores planta per planta.
- El terreny al voltant de les masses, dibuixat al plànol del fosc (sense sol) al groc (el màxim que rep cap cel·la), amb una clau. Les cel·les sota una massa queden en blanc. **Mostra el terreny al plànol** ho apaga.
- **Murs en CSV** i **Terreny en CSV** desen els números.

Per a una estació, les xifres són la mitjana per dia dels dies mostrejats. No es desa res al projecte: el resultat és per mirar-lo, i tornar-lo a executar en crea un de nou.

## Coses a saber

- Un mur compta un moment com a assolellat només quan mira al sol i no hi ha res pel mig. Un mur que mira d'esquena no en rep res.
- El terreny es mostreja en una quadrícula que depèn de la mida de l'emplaçament, i la posició del sol es calcula al mig de cada pas de temps, de manera que les hores són correctes fins a l'aproximació del pas que heu triat.
- La posició del sol és una fórmula astronòmica publicada, exacta fins a aproximadament un minut d'arc.
