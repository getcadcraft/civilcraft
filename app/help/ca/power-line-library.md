---
title: La vostra biblioteca de línies elèctriques
summary: Creeu els vostres conductors, cables subterranis, suports, equips i tipus de rasa, en categories que decidiu, i compartiu-los com a fitxers.
keywords: biblioteca, conductor, cable, pal, suport, braç transversal, aïllador, accessori, tirant, transformador, armari, unió, rasa, categoria, csv, importa, exporta
from: 88733744
---

La secció **Biblioteca** de l'espai de treball de línies elèctriques conté tots els elements que pot fer servir una línia o un cable. Cap element d'aquesta biblioteca no depèn d'un país ni d'un fabricant: creeu els elements amb què treballeu.

## Tres tipus d'elements

| Tipus | On es guarda | Es pot canviar? |
|---|---|---|
| **Exemples** | Inclosos amb CivilCraft, amb valors genèrics que hem calculat a partir de les propietats dels materials | No: primer cal {{ui:Copia a la meva biblioteca}} |
| **Al projecte** | Venen amb el fitxer del projecte que heu obert | No: primer cal {{ui:Copia a la meva biblioteca}} |
| **Els meus** | Els vostres propis elements, guardats en aquest navegador | Sí, i els canvis es desen de seguida |

Cada projecte guarda una còpia de cada element que fa servir, de manera que un projecte s'obre en qualsevol ordinador amb els seus propis conductors i pals.

:::warning
Els elements d'exemple són només això, exemples: comproveu cada número amb les dades del vostre proveïdor. Els cables subterranis no tenen capacitat de corrent a propòsit, perquè depèn de com es posa el cable.
:::

## Creeu un element

1. A **Biblioteca**, trieu el **Tipus** (conductors aeris, cables subterranis, suports, equips o tipus de rasa).
2. Feu clic a {{ui:Element nou}}, o trieu un exemple i feu clic a {{ui:Copia a la meva biblioteca}} o {{ui:Duplica}}.
3. Ompliu-ne els camps. Els camps marcats amb `*` són els que necessiten les comprovacions; un element al qual en falti algun es marca amb `!` i apareix a **Comprovacions** quan una línia l'utilitza.
4. Assigneu-li una **Categoria**, amb `/` entre nivells: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. L'arbre segueix les vostres categories.

Què necessita cada tipus:

| Tipus | Necessari per a les comprovacions |
|---|---|
| Conductor aeri | secció, diàmetre, massa per metre, resistència a trencament, mòdul d'elasticitat, dilatació tèrmica |
| Cable subterrani | nuclis, secció, tensió, diàmetre, resistència, capacitat de corrent |
| Suport | longitud total, càrrega nominal (presa en un punt per sota del cim), profunditat al terreny |
| Equip | el seu tipus; una càrrega nominal per als braços transversals, accessoris i tirants; separació de fases i caiguda per als braços transversals; longitud per als aïlladors; l'angle per als tirants |
| Tipus de rasa | profunditat, amplada, recobriment sobre els cables |

## Compartiu-la

- {{ui:Desa la meva biblioteca}} desa tots els vostres elements en un sol fitxer `.cclines.json`; {{ui:Obre una biblioteca…}} en torna a llegir un (els elements amb la mateixa clau se substitueixen).
- {{ui:Desa com a CSV}} desa el tipus que esteu veient com a full de càlcul; {{ui:Obre una biblioteca…}} en torna a llegir un CSV d'aquest tipus. Les columnes poden venir en qualsevol ordre; un fitxer separat per punt i coma pot fer servir la coma decimal.
