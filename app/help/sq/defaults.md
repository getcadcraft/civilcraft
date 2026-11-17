---
title: Vlerat fillestare dhe vendmbajtësit
summary: Çdo vlerë me të cilën fillon CivilCraft, për projektet e reja, shfaqjen, aksët, platformat, koridoret, rrjetet e tubave, vëllimet dhe grafikët, dhe cilat janë vende-mbajtëse që duhet zëvendësuar.
keywords: parazgjedhjet, cilësimet, vlerat fillestare, vende-mbajtëse, kritere projektimi, standarde, rregulla, supozime
from: fbfc7432
---

CivilCraft nuk ka dialog cilësimesh apo shabllon. Këto janë vlerat me të cilat fillojnë gjërat. Vlerat e shënuara **vend-mbajtës** nuk janë marrë nga asnjë standard: zëvendësojini me kriteret e projektit tuaj përpara se t'u besoni një kontrolli ose një sasie.

## Projekt i ri

| Cilësimi | Vlera |
|---|---|
| Emri | Vend pa emër (emri i skedarit të parë të pikave e zëvendëson) |
| Njësitë | US feet |
| Emri i sipërfaqes | Terreni ekzistues |
| Grupet e pikave | Çdo grup fillon si {{ui:Pikat}} |
| Skaji më i gjatë i jashtëm | 0 (mbaj çdo trekëndësh) |
| Hapat e zhbërjes të mbajtura | 200 |

## Shfaqja

| Cilësimi | Vlera |
|---|---|
| Sipërfaqja | {{ui:Terreni ekzistues}} |
| Izoipsat çdo | 1 (ft ose m) |
| Kryesoret çdo | izoipsa e 5-t |
| Brezat | 8 |
| Të ndezura | Izoipsat, etiketat e izoipsave, pikat, vijat e thyerjes, skaji i sipërfaqes, tubat |
| Të fikura | Trekëndëshat, brezat e kotës, shigjetat e pjerrësisë, etiketat e pikave |

## Aksët dhe profilet

| Cilësimi | Vlera |
|---|---|
| Emri | Aksi 1, Aksi 2 … |
| Stacioni i fillimit | 0+00 |
| Rrezja e kurbës te çdo PI e brendshme | 100 ft ose 30 m, më e vogël nëse nuk përshtatet në gjysmën e secilës tangjente |
| Profili i projektimit | Asnjë derisa të filloni një; {{ui:Nis nga terreni}} vendos një PVI mbi terren në çdo skaj |
| Gjatësia e kurbës vertikale | 0 (pa kurbë) derisa të shkruani një |

## Platformat

| Cilësimi | Vlera |
|---|---|
| Emri | Platforma 1, Platforma 2 … |
| Kota | Terreni në mes të platformës, i rrumbullakosur në 0.1 (0 nëse mesi është jashtë sipërfaqes) |
| Pjerrësia e gërmimit | 2 : 1 (vend-mbajtës) |
| Pjerrësia e mbushjes | 3 : 1 (vend-mbajtës) |

## Montimi i koridorit (vende-mbajtës)

| Cilësimi | US feet | Metra |
|---|---|---|
| Gjerësia e korsisë | 12 ft | 3.6 m |
| Pjerrësia e korsisë | 2% | 2% |
| Gjerësia e bankinës | 4 ft | 1.2 m |
| Pjerrësia e bankinës | 4% | 4% |
| Pjerrësia e gërmimit | 2 : 1 | 2 : 1 |
| Pjerrësia e mbushjes | 3 : 1 | 3 : 1 |
| Prerje çdo | 10 ft | 5 m |

## Rrjeti i tubave

| Cilësimi | US feet | Metra |
|---|---|---|
| Emri dhe lloji | Stuhi, stuhi | Stuhi, stuhi |
| Pjerrësia minimale (vend-mbajtës) | 0.50% | 0.50% |
| Mbulesa minimale (vend-mbajtës) | 2 ft | 0.6 m |
| Rënia në strukturat (vend-mbajtës) | 0.10 ft | 0.03 m |
| Diametri i strukturës së re | 48 in | 1200 mm |
| Diametri i tubit të ri | 12 in | 300 mm |
| Thellësia e gropës së mbledhjes | 0 | 0 |
| Buza | Nga sipërfaqja | Nga sipërfaqja |

Një rrjet tubash i hapur nga LandXML përdor këto rregulla gjithashtu, sepse LandXML nuk i mban ato.

## Vëllimet

| Cilësimi | Vlera |
|---|---|
| Metoda | Rrjet, i marrë në mostër në qendrat e qelizave brenda vijave të kontaktit |
| Madhësia e qelizës | Zgjidhet që drejtkëndëshi kufizues i sipërfaqes së niveluar të mbajë rreth 250,000 qeliza (1, 2 ose 5 herë një fuqi e dhjetës) |
| Fryrja dhe tkurrja | Asnjë |

## Plani

| Cilësimi | Vlera |
|---|---|
| Zona | {{ui:Gjithçka}} |
| Letra | Tabloid 11 × 17 in (projekte në këmbë), ISO A3 (projekte në metra); gjithmonë horizontale |
| Shkalla | Shkalla më e madhe e listuar që përshtatet |
| Boja | {{ui:Ngjyra e shtresave}} |

Etiketat DXF dimensionohen për shkallën në të cilën gjithçka përshtatet në Tabloid (feet) ose A3 (metra).
