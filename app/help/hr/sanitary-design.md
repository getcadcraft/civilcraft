---
title: Izračunajte projektne protoke fekalne odvodnje i provjerite kanalizaciju
summary: Upišite stanovnike i površinu koji ulaze u svako revizijsko okno fekalne mreže; CivilCraft ih zbraja niz mrežu, računa vršni protok s faktorom vršnog opterećenja i infiltracijom te provjerava kapacitet i brzinu svake cijevi.
keywords: fekalna, kanalizacija, fekalna kanalizacija, otpadne vode, projektni protok, vršni protok, faktor vršnog opterećenja, harmon, babbitt, infiltracija, stanovništvo, po stanovniku, postotak punjenja, samočišćenje, brzina, dimenzioniranje cijevi, proračunski list
from: 73ba197a
---

Projektni protoci fekalne odvodnje rade na [mreži cijevi](topic:pipe-network) kad je njezina {{ui:Vrsta}} {{ui:Fekalna}}. Kad ništa nije odabrano, desna ploča tada prikazuje **Projektne protoke fekalne odvodnje**, dok oborinska mreža prikazuje oborinsku odvodnju.

## Upišite što dolazi

1. Odaberite revizijsko okno. Pod **Projektnim protocima fekalne odvodnje** upišite {{ui:Ljudi koji ovdje ulaze}} i {{ui:Površina koja ovdje ulazi}} (hektara u projektu u metrima, akara u projektu u stopama).
2. Za trgovine, urede ili industriju upišite ekvivalentne ljude: površina puta broj ljudi po hektaru (ili akru) koji koristi vaša agencija. Površina se u svakom slučaju računa za infiltraciju.
3. Ponovite za svako revizijsko okno na koje se priključuje ulica ili parcela. Revizijsko okno na koje ništa nije priključeno zadržava obje vrijednosti na 0.

Svaka cijev nosi sve što ulazi u svoje gornje revizijsko okno i iznad njega. Odaberite revizijsko okno da vidite što kroz njega prolazi.

## Postavke

| Postavka | Što znači |
|---|---|
| {{ui:Protok po osobi}} | prosječni dnevni protok jedne osobe: litara (projekt u metrima) ili američkih galona (projekt u stopama) |
| {{ui:Infiltracija}} | podzemna voda koja curi unutra: litara u sekundi po hektaru, ili galona dnevno po akru |
| {{ui:Faktor vršnog opterećenja}} | Harmon, 1 + 14 / (4 + √P), ili Babbitt, 5 / P^0.2, pri čemu je P stanovništvo u tisućama |
| {{ui:Faktor vršnog opterećenja najmanje}} / {{ui:Faktor vršnog opterećenja najviše}} | faktor se zadržava između ove dvije vrijednosti |
| {{ui:Manningov n}} | za kapacitet i brzinu |
| {{ui:Najmanja brzina}} / {{ui:Najveća brzina}} | pri dubini vršnog protoka u samoj cijevi |
| {{ui:Najviše od pune propusnosti}} | koliko puna cijev smije biti pri vršnom protoku, kao postotak onoga što nosi kad teče punim presjekom |

Početne vrijednosti su privremene, a ne norma. Koristite vrijednosti koje objavljuje vaša agencija.

## Što se računa

Za svaku cijev, redom po toku:

- vršni protok = ljudi × protok po osobi × faktor vršnog opterećenja + površina × infiltracija
- kapacitet pri punom toku (Manningova jednadžba pri nagibu cijevi) i koliko vršni protok puni cijev
- normalna dubina vršnog protoka i brzina pri njoj

Tablica **Rezultati fekalne odvodnje** navodi za svaku cijev ljude, faktor vršnog opterećenja, vršni protok (L/s, ili gpm i kubičnih stopa u sekundi), postotak punjenja i brzinu. Ispod nje navedeni su problemi: cijev punija od granice, sporija od najmanje brzine (možda se neće sama očistiti), brža od najveće ili bez pada. {{ui:Dimenzioniraj cijevi za ove protoke}} za svaku cijev bira najmanju standardnu veličinu (200 mm ili 8 inča i više) koja nosi njezin vršni protok unutar granice; jedan {{key:Mod+Z}} to poništava.

:::note
Ovo je ustaljeni vršni protok koji računa proračunski list, provjeren prema objavljenom proračunskom listu do njegova tiskanog zaokruživanja. To nije model kanalizacije kroz vrijeme: nema hidrograma, akumulacije, crpki ni preljeva. Vidi [Još nije izrađeno](topic:not-built-yet).
:::

Brzine koriste Manningovu jednadžbu s istim n pri svakoj dubini. Neke agencije u dijagramima za djelomično punjenje dopuštaju da se n mijenja s dubinom, što daje nešto nižu brzinu u cijevi koja je punjena 60 do 70 posto (oko 3 posto manje).
