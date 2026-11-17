---
title: Slobodni objekti
summary: Unesite oblik napravljen u drugoj aplikaciji (STL, OBJ ili stavka biblioteke) na lokaciju; stoji na terenu ili je useca u njega, a njegova zapremina, površina i otisak se računaju kao i ostalo.
keywords: slobodni oblik, prilagođeni objekat, skulptura, saksija, klupa, mreža, stl, obj, stavka biblioteke, prati teren, useca u teren, količine, zapremina, ifc
from: ec835f33
---

Jednokratni element (saksija, zid za sedenje, skulptura, brežuljak za igru) može se napraviti u ModelCraft-u ili PartCraft-u i postaviti ovde, da stoji u istom modelu i specifikacijama kao sve ostalo.

1. Pejzaž › Više › {{ui:Slobodan objekat…}} i izaberite **STL** ili **OBJ** datoteku (u jedinicama projekta: stope u projektu u stopama, metri u projektu u metrima) ili stavku biblioteke CadCraft-a (`.json`) sa telom mreže.
2. Kliknite gde ide.

## Njegova osnova

- **Prati teren**: njegova najniža tačka leži na najnižem terenu pod njegovim otiskom, pa ništa ne lebdi. Svojstva procenjuju koliki je deo ispod terena.
- **Useca teren**: njegova osnova se postavlja na kotu, a teren unutar njegovog otiska se nivelise do nje kosinama dnevnog svetla, i računa se u Zemljanim radovima kao plato.

Okrenite ga dugmetom **Okreni**, a prevucite ga na planu da ga pomerite.

## Obračunavanje

Svojstva daju njegovu **zapreminu** (za zatvoreno telo), **površinu**, **otisak** i **visinu**, izmerene iz mreže. IFC izvoz ga upisuje sa **IFC klasom** koju izaberete i tim količinama.

:::note
Otisak je konveksni omotač obrisa: konkavan oblik (saksija u obliku slova L) nivelise se kao da je popunjen.
:::
