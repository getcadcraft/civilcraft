---
title: Slobodni objekti
summary: Unesite oblik napravljen u drugoj aplikaciji (STL, OBJ ili stavka iz biblioteke) na teren; stoji na tlu ili je usječen u njega, a njegova zapremina, površina i tlocrt se računaju kao i ostalo.
keywords: slobodni objekat, prilagođeni objekat, skulptura, sadilica, klupa, mreža, stl, obj, stavka biblioteke, prati teren, usjeci u teren, količine, zapremina, ifc
from: ec835f33
---

Jednokratni element (sadilica, zid klupe, skulptura, brežuljak za igru) može se napraviti u ModelCraft ili PartCraft i postaviti ovdje, da bude u istom modelu i specifikacijama kao sve ostalo.

1. Uređenje terena › {{ui:Više}} › {{ui:Slobodan objekt…}} i odaberite **STL** ili **OBJ** datoteku (u jedinicama projekta: stope u projektu u stopama, metri u projektu u metrima) ili CadCraft **stavku biblioteke** (`.json`) s mrežastim tijelom.
2. Kliknite gdje ide.

## Njegova osnova

- **Prati teren**: njegova najniža tačka sjedi na najnižem terenu pod njegovim tlocrtom, tako da ništa ne lebdi. Svojstva procjenjuju koliki dio je ispod terena.
- **Usijeca u teren**: njegova osnova je postavljena na jednu kotu, a teren unutar njegovog tlocrta se izravnava do nje s nagibima presijecanja, i računa se u **Zemljani radovi** kao platforma.

Okrenite ga pomoću **Okreni**, a prevucite ga na planu da ga pomjerite.

## Obračunato

Svojstva daju njegovu **zapreminu** (za zatvoreno tijelo), **površinu**, **tlocrt** i **visinu**, izmjereno iz mreže. IFC izvoz ga zapisuje s **IFC klasom** koju odaberete i tim količinama.

:::note
Tlocrt je konveksni omotač obrisa: konkavan oblik (sadilica u obliku slova L) se izravnava kao da je popunjen.
:::
