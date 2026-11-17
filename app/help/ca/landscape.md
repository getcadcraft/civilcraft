---
title: L'espai de treball de Paisatgisme
summary: Plànols de plantació, explanació, paviments, murs, escales, reg i fulls de paisatgisme sobre el mateix lloc, les mateixes superfícies i el mateix fitxer que l'obra civil.
keywords: paisatgisme, arquitectura del paisatge, jardí, plantació, plantes, arbres, explanació, paviment, reg, aspersors, espai de treball, disseny del lloc, plànol de paisatgisme
from: eea929d1
---

L'espai de treball de Paisatgisme posa les eines de disseny de paisatgisme sobre el lloc de CivilCraft que ja teniu: els mateixos punts topogràfics, el mateix terreny existent, la mateixa superfície projectada i el mateix fitxer de projecte.

## Obrir-lo

Trieu {{ui:Superfície}} › {{ui:Més}} › {{ui:Espai de treball de paisatgisme}}. La barra d'eines mostra aleshores una opció **Espai de treball** i un grup **Paisatgisme**, i els grups Superfície, Disseny i SIG s'aparten per fer lloc. Trieu **Civil** a Espai de treball per tornar enrere. CivilCraft recorda l'espai de treball que heu usat per últim en aquest ordinador.

El tauler de l'esquerra guanya tres seccions a dalt:

- **Plantes**: la llista de plantes, per cercar i triar el que col·loqueu. Vegeu [La llista de plantes](topic:plant-list).
- **Comprovacions d'explanació**: anàlisi de pendents, fletxes de flux i embassament. Vegeu [Explanació](topic:landscape-grading).
- **Reg**: els aspersors i les canonades que col·loqueu a continuació, i la configuració del subministrament d'aigua. Vegeu [Reg](topic:irrigation).

## Què hi ha al grup Paisatgisme

| Eina | Què fa | Tema |
|---|---|---|
| **Planta**, **Bancal**, **Seto** | Plantes soles, bancals de plantació omplerts a la separació de les plantes, setos al llarg d'una línia | [Plantació](topic:planting) |
| **Explana** | Plataformes, bermes, rases de drenatge, àrees d'explanació amb cotes puntuals i corbes de nivell, comprovacions de pendent i de flux | [Explanació](topic:landscape-grading) |
| **Paviments i elements construïts** | Paviment, camins, murs, vorades, rampes i escales que segueixen el terreny | [Paviments i elements construïts](topic:hardscape) |
| **Àrees** | Àrees plantades: prats, bancals, prats alts i cobertura vegetal amb una composició, retallades al voltant dels elements construïts | [Àrees plantades](topic:planted-areas) |
| **Cotes** | Modificadors del terreny en ordre amb desmunt i terraplè, cotes puntuals, fletxes de pendent, línies de secció | [Modificadors del terreny](topic:ground-modifiers), [Seccions](topic:landscape-sections) |
| **Reg** | Aspersors, canonades, vàlvules, línies de degoteig, el subministrament, la cobertura i una comprovació hidràulica | [Reg](topic:irrigation) |
| **Més** | Des d'una línia (objectes enllaçats a les línies de dibuix), el quadre de plantes, la taula de plantes, els quadres, la representació de plantes, els objectes de forma lliure, els fulls de paisatgisme i el joc de publicació, l'exportació IFC, la mida i les etiquetes de les plantes | [Objectes a partir de línies](topic:objects-from-lines), [Registres de plantes](topic:plant-records), [Quadres](topic:worksheets), [Fulls de paisatgisme](topic:landscape-sheets), [Objectes de forma lliure](topic:freeform-objects) |

Tot el que afegiu és un sol pas per desfer, es desa al fitxer de projecte i dibuixa al plànol en capes anomenades `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` i `L-IRRG-…`, de manera que les exportacions DXF, DWG i PDF també ho porten.

## Una sola superfície per a tot

Plataformes, bermes, rases de drenatge, àrees d'explanació, paviments i camins s'expliquen dins de la **superfície projectada**, la mateixa que usen els corredors i les plataformes d'edificació. El **terreny existent** no canvia mai. Les plantes es col·loquen sobre el terreny que hi ha a sota, de manera que es mouen quan canvia l'explanació. El moviment de terres compta l'explanació de paisatgisme juntament amb tota la resta.

:::tip
Nou en això? [Dissenyar un jardí, de principi a fi](topic:landscape-walkthrough) repassa tot l'espai de treball al lloc d'exemple.
:::
