---
title: Fitxers d'estudi per a un altre programa de línies (.DON)
summary: Deseu una línia aèria com a fitxer d'estudi .DON, o llegiu-hi els suports d'una per crear una línia nova. Sense provar amb el programa que els llegeix.
keywords: don, .don, fitxer d'estudi, xml, exporta, importa, programa de línies aèries, tesat, cantó
from: 1abc4d07
---

Alguns programes de línies aèries guarden un estudi en un fitxer `.DON` (text XML). CivilCraft pot escriure una línia com a fitxer d'aquest tipus i llegir-ne els suports d'un d'aquests fitxers.

:::warning
**Sense provar.** Ho hem construït a partir d'una llista de noms de camp del format que va compartir un usuari, no a partir d'un fitxer real, i encara no hem obert els nostres fitxers al programa que els llegeix. Obriu-lo en aquest programa i comproveu cada valor abans de confiar-hi. Si podeu compartir un fitxer `.DON` (amb les dades del client eliminades), ens ajuda a fer-ho bé.
:::

## Desa un fitxer d'estudi

1. Doneu un conductor a la línia i assegureu-vos que té resultats (cap "no calculat" a les seves Propietats).
2. {{ui:Més}} › {{ui:Desa un fitxer d'estudi (.DON)…}}, trieu la línia, afegiu-hi una descripció i un número d'obra.
3. {{ui:Desa el fitxer d'estudi}}.

El fitxer conté els suports de la línia (coordenades, terreny, alçades, funcions, braç transversal, el suport que es conserva o es suggereix, càrregues per cas de càrrega, fonamentació), una secció per cada tram entre amarratges (conductor, tensió, van de regulació, vans, paràmetre de tensió i de catenària, la tensió més gran per cas de càrrega) i les taules de tesat. Les longituds són en metres i les forces en daN; el text s'escriu en Latin-1, de manera que un caràcter fora d'aquest conjunt esdevé `?`.

## Llegeix un fitxer d'estudi

{{ui:Més}} › {{ui:Obre un fitxer d'estudi (.DON)…}} llegeix els suports en una línia nova. El conductor, els suports i els braços transversals es fan coincidir amb la vostra biblioteca pel nom; el que no es trobi queda perquè el trieu a Propietats.
