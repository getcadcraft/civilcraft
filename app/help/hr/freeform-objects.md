---
title: Objekti slobodnog oblika
summary: Unesite oblik izrađen u drugoj aplikaciji (STL, OBJ ili stavka knjižnice) na lokaciju; stoji na terenu ili se u njega urezuje, a njegov volumen, površina i tlocrtna površina broje se kao i ostalo.
keywords: slobodni oblik, prilagođeni objekt, skulptura, korito za sadnju, klupa, mreža, stl, obj, stavka knjižnice, prati teren, urezan u teren, količine, volumen, ifc
from: ec835f33
---

Jednokratna značajka (korito za sadnju, zid za sjedenje, skulptura, humak za igru) može se izraditi u programu ModelCraft ili PartCraft i ovdje postaviti tako da bude u istom modelu i specifikacijama kao sve ostalo.

1. Krajobraz › Više › {{ui:Objekt slobodnog oblika…}} i odaberite **STL** ili **OBJ** datoteku (u jedinicama projekta: stope u projektu u stopama, metri u projektu u metrima) ili **stavku knjižnice** programa CadCraft (`.json`) s mrežnim tijelom.
2. Kliknite mjesto na koje ide.

## Njegova baza

- **Prati teren**: njegova najniža točka nalazi se na najnižem terenu ispod tlocrtne površine, pa ništa ne lebdi. Svojstva procjenjuju koliki dio je ispod terena.
- **Urezuje se u teren**: njegova baza postavlja se na visinu, a teren unutar njegove tlocrtne površine izravnava se do nje kosinama nožice pokosa, obračunato u Zemljanim radovima kao i platforma.

Zakrenite ga poljem **Zakretanje**, a povucite ga po tlocrtu da ga pomaknete.

## Obračunato

Svojstva daju njegov **volumen** (za zatvoreno tijelo), **površinu**, **tlocrtnu površinu** i **visinu**, izmjerene iz mreže. IFC izvoz zapisuje ga s **IFC klasom** koju odaberete i tim količinama.

:::note
Tlocrtna površina je konveksna ljuska obrisa: konkavan oblik (korito za sadnju u obliku slova L) izravnava se kao da je ispunjen.
:::
