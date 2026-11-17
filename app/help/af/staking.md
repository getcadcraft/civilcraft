---
title: Maak 'n afsteekverslag
summary: Lys stokke langs 'n belyning by stasies en afsettings, of die opmetingspunte daarby, met stasie, afsetting, noord- en ooskoördinate, ontwerp- en grondhoogtes en sny of vul, en stoor die verslag as CSV of PDF.
keywords: afsteek, afsteekverslag, stokverslag, snyblad, peilblad, stasie, afsetting, sny, vul, uitleg, konstruksie-afsteek, soos gebou
from: d8a4e9f1
---

Kies 'n belyning en klik **Afsteekverslag** in sy **Eienskappe**.

## Stokke by stasies en afsettings

1. **Van** en **tot**: die stasies om af te steek (1+50 of 150).
2. **elke**: die interval. Stokke kom by elke veelvoud daarvan, aan albei kante, en (met die blokkie gemerk) waar die belyning se krommes begin en eindig.
3. **Afsettings**: links en regs van die belyning, kyk stasie-op: `12 L, 0, 12 R`, `L12 CL R12` of `-12, 0, 12` (links is minus). 'n Belyning met 'n korridor begin met sy rande van plaveisel en skouers.
4. **Nommer vanaf** en **met voorvoegsel** benoem die stokke: 1, 2, 3, of S101, S102.

## Opmetingspunte naby die belyning

Kies **opmetingspunte naby die belyning** en hoe naby. Elke punt binne daardie afstand kry sy stasie en afsetting, die ontwerp daar, en sy eie hoogte as die grond: 'n kontrole van punte wat as gebou afgesteek of ingemeet is.

## Wat die verslag sê

| Kolom | Wat dit is |
|---|---|
| Punt | Die stok se naam, of die opmetingspunt se nommer |
| Stasie, Afsetting | Waar dit langs die belyning is: L links, R regs |
| Noord, Oos | Sy koördinate |
| Ontwerphoogte | Die oppervlak van die uitgegrawe korridor daar (van dagligtlyn tot dagligtlyn), anders die ontwerpprofiel op die middellyn |
| Grondhoogte | Die bestaande oppervlak daar, of die opmetingspunt se eie hoogte |
| Sny/vul | C wanneer die grond bo die ontwerp is (afgrawe), F wanneer onder (opvul), tot die honderdste |

'n Stok sonder 'n ontwerphoogte (buite die korridor, of op 'n belyning sonder een weg van die middellyn) het geen sny of vul nie; die dialoog sê hoeveel.

## Stoor dit

- **CSV**: 'n titellyn, dan die kolomme hierbo, plus die sny of vul as 'n geteekende getal (grond minus ontwerp) vir sigblaaie en dataversamelaars.
- **PDF**: tabelbladsye op die papier wat jy kies, een stok per ry, afgrawings in oranje en opvullings in groen, met die titelstrook van die ander blaaie.

:::note
Stokke word uit die ontwerp in die projek bereken. Kontroleer hulle teen die goedgekeurde planne voordat enigiets gebou word.
:::
