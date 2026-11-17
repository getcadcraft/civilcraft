---
title: Ključevi opisa i kodovi linija
summary: Pretvorite terenske šifre u skupine točaka s opisima i spojite šifrirane točke u linije (početak, kraj, zatvaranje) koje postaju prijelomnice.
keywords: ključevi opisa, terenske šifre, kodovi linija, figure, linije, početak, kraj, zatvori, skupine točaka, šifre, geodetske šifre, zapisnik podataka, prijelomnice, rubnjak, rub kolnika
from: b3d1af8d
---

Geodetske ekipe na terenu šifriraju svaku snimku: `EP` za rub kolnika, `TC` za vrh rubnjaka, `BLDG` za kut zgrade. Šifra je prva riječ opisa točke. CivilCraft grupira točke po njoj i pretvara kodove linija iza nje u linije.

## Kodovi linija

Kod linije je riječ odmah nakon terenske šifre:

| Opis | Značenje |
|---|---|
| `EP B` | Počinje novu liniju ruba kolnika u ovoj točki |
| `EP` | Nastavlja trenutnu EP liniju |
| `EP E` | Završava trenutnu EP liniju u ovoj točki |
| `BLDG C` | Zatvara zgradu: spaja ovu točku natrag na prvu točku linije |

Točke s istom šifrom spajaju se po redoslijedu brojeva točaka. Različite šifre su različite linije čak i kad dijele skupinu, pa `EP1` i `EP2` daju dva ruba odjednom. Šifra koja nikad ne koristi kod linije spaja se kroz sve svoje točke, kao u ranijim verzijama.

Linije u skupini koja se koristi kao **Prijelomnica** postaju prijelomnice, po jedna za svaku liniju, pa se rubnjak s prekidom ne proteže preko prekida. Linije u drugim skupinama crtaju se na planu (sloj V-NODE-LINE) i izlaze u DXF, DWG i PDF.

Riječi za početak, kraj i zatvaranje su `B`, `BEG`, `START`; `E`, `END`; i `C`, `CLO`, `CLOSE`. Promijenite ih ili isključite kodove linija u dijaloškom okviru ispod.

## Ključevi opisa

Ključ opisa pretvara šifru u skupinu točaka, namjenu i dugi opis.

1. Pod **Točke** kliknite {{ui:Description keys and line codes}}.
2. Kliknite {{ui:Add a key}} i ispunite redak:
   - **Šifra**: terenska šifra za podudaranje. `*` znači bilo koje znakove, a `?` jedan, pa `EP*` hvata EP, EP1 i EP12.
   - **Skupina**: skupina točaka kojoj se ove točke pridružuju (prazno = sama šifra). `EP*` sa skupinom `EP` stavlja EP1 i EP2 u jednu skupinu, dok ostaju zasebne linije.
   - **Namjena**: Točke, Prijelomnica ili Izostavi, za kad se skupina prvi put pojavi (ili ostavite na tablici **Točke**).
   - **Opis**: dugi naziv, prikazan u **Svojstvima** točke.
3. Stupac **Točke** broji točke koje svaki ključ hvata dok tipkate. Prvi ključ koji se podudari s šifrom pobjeđuje.
4. Kliknite {{ui:Apply}}. Skupine, teren i plan slijede u jednom koraku: {{key:Mod+Z}} to poništava.

Skupina zadržava namjenu koju ste joj dali u tablici **Točke**; namjena ključa postavlja se samo za skupinu koja je nova. Ključevi i kodovi linija spremaju se u datoteku projekta.
