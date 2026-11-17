---
title: Ključevi opisa i kodovi linija
summary: Pretvorite šifre terena u grupe tačaka s opisima i spojite kodirane tačke u linije (početak, kraj, zatvaranje) koje postaju linije prijeloma.
keywords: ključevi opisa, šifre terena, kodovi linija, figure, linijski radovi, početak, kraj, zatvaranje, grupe tačaka, šifre, geodetske šifre, terenski uređaj, linije prijeloma, ivičnjak, ivica kolovoza
from: b3d1af8d
---

Geodetske ekipe kodiraju svako mjerenje na terenu: `EP` za ivicu kolovoza, `TC` za vrh ivičnjaka, `BLDG` za ugao zgrade. Šifra je prva riječ u opisu tačke. CivilCraft grupiše tačke po njoj i pretvara kodove linija iza nje u linije.

## Kodovi linija

Kod linije je riječ odmah iza šifre terena:

| Opis | Značenje |
|---|---|
| `EP B` | Počinje nova linija ivice kolovoza u ovoj tački |
| `EP` | Nastavlja tekuću EP liniju |
| `EP E` | Završava tekuću EP liniju u ovoj tački |
| `BLDG C` | Zatvara zgradu: spaja ovu tačku nazad na prvu tačku linije |

Tačke s istom šifrom spajaju se po redoslijedu brojeva tačaka. Različite šifre su različite linije čak i kad dijele grupu, pa `EP1` i `EP2` daju dvije ivice odjednom. Šifra koja nikad ne koristi kod linije spaja se kroz sve svoje tačke, kao u ranijim verzijama.

Linije u grupi korištenoj kao **Linija prijeloma** postaju linije prijeloma, po jedna za svaku liniju, pa se ivičnjak s prekidom ne razvlači preko praznine. Linije u drugim grupama crtaju se na planu (sloj V-NODE-LINE) i ulaze u DXF, DWG i PDF.

Riječi za početak, kraj i zatvaranje su `B`, `BEG`, `START`; `E`, `END`; i `C`, `CLO`, `CLOSE`. Promijenite ih, ili isključite kodove linija, u dijalogu ispod.

## Ključevi opisa

Ključ opisa pretvara šifru u grupu tačaka, upotrebu i dugi opis.

1. Pod **Tačke** kliknite {{ui:Ključevi opisa i kodovi linija}}.
2. Kliknite {{ui:Dodaj ključ}} i popunite red:
   - **Šifra**: šifra terena za poklapanje. `*` označava bilo koje znakove, a `?` jedan, pa `EP*` hvata EP, EP1 i EP12.
   - **Grupa**: grupa tačaka kojoj se ove tačke pridružuju (prazno = sama šifra). `EP*` s grupom `EP` stavlja EP1 i EP2 u jednu grupu, a one ostaju odvojene linije.
   - **Upotreba**: Tačke, Linija prijeloma ili Izostavi, za trenutak kad se grupa prvi put pojavi (ili ostavite tabeli **Tačke** da odluči).
   - **Opis**: dugi naziv, prikazan u **Svojstvima** tačke.
3. Kolona **Tačke** broji tačke koje svaki ključ hvata dok kucate. Prvi ključ koji se poklopi sa šifrom pobjeđuje.
4. Kliknite {{ui:Primijeni}}. Grupe, površina i plan slijede u jednom koraku: {{key:Mod+Z}} to poništava.

Grupa zadržava upotrebu koju ste joj dali u tabeli **Tačke**; upotreba ključa je postavlja samo za novu grupu. Ključevi i kodovi linija se čuvaju u datoteci projekta.
