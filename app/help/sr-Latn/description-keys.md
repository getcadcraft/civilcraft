---
title: Ključevi opisa i kodovi linija
summary: Pretvori kodove polja u grupe tačaka sa opisima i poveži kodirane tačke u linije (početak, kraj, zatvaranje) koje postaju linije loma.
keywords: ključevi opisa, kodovi polja, kodovi linija, figure, linije, početak, kraj, zatvaranje, grupe tačaka, kodovi, geodetski kodovi, sakupljač podataka, linije loma, ivičnjak, ivica kolovoza
from: b3d1af8d
---

Geodetske ekipe kodiraju svaki snimak na terenu: `EP` za ivicu kolovoza, `TC` za vrh ivičnjaka, `BLDG` za ugao zgrade. Kod je prva reč opisa tačke. CivilCraft grupiše tačke po njemu i pretvara kodove linija iza njega u linije.

## Kodovi linija

Kod linije je reč odmah posle koda polja:

| Opis | Značenje |
|---|---|
| `EP B` | Počni novu liniju ivice kolovoza u ovoj tački |
| `EP` | Nastavi tekuću EP liniju |
| `EP E` | Završi tekuću EP liniju u ovoj tački |
| `BLDG C` | Zatvori zgradu: spoji ovu tačku nazad sa prvom tačkom linije |

Tačke sa istim kodom spajaju se po redosledu brojeva tačaka. Različiti kodovi su različite linije, čak i kad dele grupu, pa `EP1` i `EP2` daju dve ivice odjednom. Kod koji nikad ne koristi kod linije spaja se kroz sve svoje tačke, kao u ranijim verzijama.

Linije u grupi koja se koristi kao **Linija loma** postaju linije loma, po jedna za svaku liniju, pa se ivičnjak sa prekidom ne razvlači preko praznine. Linije u drugim grupama crtaju se u planu (sloj V-NODE-LINE) i izlaze u DXF, DWG i PDF.

Reči za početak, kraj i zatvaranje su `B`, `BEG`, `START`; `E`, `END`; i `C`, `CLO`, `CLOSE`. Promeni ih ili isključi kodove linija u dijalogu ispod.

## Ključevi opisa

Ključ opisa pretvara kod u grupu tačaka, namenu i dug opis.

1. Pod **Tačke** klikni {{ui:Ključevi opisa i kodovi linija}}.
2. Klikni {{ui:Dodaj ključ}} i popuni red:
   - **Kod**: kod polja koji se poklapa. `*` označava bilo koje znakove, a `?` jedan znak, pa `EP*` hvata EP, EP1 i EP12.
   - **Grupa**: grupa tačaka kojoj se ove tačke pridružuju (prazno = sam kod). `EP*` sa grupom `EP` stavlja EP1 i EP2 u jednu grupu, a one ostaju odvojene linije.
   - **Namena**: Tačke, Linija loma ili Izostavi, za kad se grupa prvi put pojavi (ili prepusti to tabeli **Tačke**).
   - **Opis**: dug naziv, prikazuje se u **Svojstvima** tačke.
3. Kolona **Tačke** broji tačke koje svaki ključ hvata dok kucaš. Prvi ključ koji se poklapa sa kodom pobeđuje.
4. Klikni {{ui:Primeni}}. Grupe, površ i plan prate u jednom koraku: {{key:Mod+Z}} to poništava.

Grupa zadržava namenu koju si joj dao u tabeli **Tačke**; namena ključa je postavlja samo za grupu koja je nova. Ključevi i kodovi linija čuvaju se u datoteci projekta.
