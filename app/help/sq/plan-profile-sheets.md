---
title: Fletët e planit dhe profilit
summary: Vizato një aks si grup fletësh planimetrie dhe profili në një PDF, me vija përputhjeje ndërmjet tyre.
keywords: plan dhe profil, fletë, vizatim, pdf, vijë përputhjeje, prodhim planesh, planet e rrugës, vizatim profili, zmadhim vertikal, grup fletësh
from: 34b4ec78
---

Fletët e planit dhe profilit janë mënyra si zakonisht vizatohen planet e rrugëve: çdo fletë tregon një pjesë të rrugës dy herë, planin lart dhe profilin poshtë, në të njëjtën shkallë horizontale, kështu që një stacion ndodhet në të njëjtin vend në të dyja.

## Krijo fletët

1. Përzgjidh aksin. Te **Vetitë**, kliko {{ui:Fletët e planit dhe profilit}}.
2. Zgjidh **Letrën**, **Shkallën e planit** dhe **Zmadhimin e profilit** (sa herë më i lartë vizatohet profili se sa është i gjatë; fillo me 10×). Dialogu tregon sa fletë krijohen dhe sa nga aksi tregon secila.
3. Për të vizatuar një pjesë të aksit, ndrysho **Nga stacioni** dhe **Deri te stacioni**.
4. Kliko {{ui:Shkarko PDF}}. PDF-ja ka një faqe për çdo fletë.

## Çfarë ka në një fletë

| Pjesa | Çfarë tregon |
|---|---|
| Plani | Gjithçka në plan (izoipsët, pikat e rilevimit, aksi dhe stacionimi i tij, korridoret, platformat, vijat karakteristike, tubat, vijat e mostrave), e rrotulluar që kjo pjesë të shtrihet horizontalisht në fletë, me një shigjetë veriu të rrotulluar përputhur |
| Vijat e përputhjes | Një vijë pika-vizë pingul me aksin në çdo skaj që vazhdon në një fletë tjetër, me etiketën "Vijë përputhjeje sta 5+50.00, shih fletën 2" |
| Profili | Terreni ekzistues (me vija), profili projektues (i kuq), pjerrësia e çdo tangjenteje dhe PVI, kota, L dhe K e çdo kurbe vertikale; stacionet poshtë, kotat në të dy anët |
| Shiriti i titullit | Emri i projektit, aksi dhe intervali i stacioneve, "Fleta 1 nga 3", shkallët horizontale dhe vertikale dhe zmadhimi |

Pjesa për çdo fletë është aq e gjatë sa lejon dritarja e planit në atë shkallë, e rrumbullakosur poshtë në 50 ft (20 m) të plotë në pjesë të gjata, ose në 10 ft (5 m) të plotë në ato të shkurtra.

:::note
Kur kotat e profilit nuk do të futeshin me zmadhimin që keni zgjedhur, CivilCraft vizaton çdo fletë me më të madhin nga 10×, 5×, 4×, 2× dhe 1× që futet, dhe shiriti i statusit e thotë këtë. Një aks i lakuar rrotullohet sipas drejtimit nga fillimi në fundin e çdo pjese, kështu që rruga mund të ngjitet ose të zbresë pak në fletë.
:::
