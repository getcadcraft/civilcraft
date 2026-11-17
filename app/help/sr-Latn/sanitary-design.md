---
title: Proračun fekalnih protoka i provera kanalizacije
summary: Unesite ljude i površinu koji ulaze u svakom šahtu fekalne mreže; CivilCraft ih sabira nizvodno kroz mrežu, računa vršni protok sa faktorom vršnog opterećenja i infiltracijom i proverava kapacitet i brzinu svake cevi.
keywords: fekalna, kanalizacija, fekalna kanalizacija, otpadna voda, proračunski protok, vršni protok, faktor vršnog opterećenja, Harmon, Babbitt, infiltracija, stanovništvo, po stanovniku, procenat popunjenosti, samočišćenje, brzina, dimenzionisanje cevi, proračunski list
from: 73ba197a
---

Proračun fekalnih protoka radi na [mreži cevi](topic:pipe-network) kad je njen {{ui:Tip}} {{ui:Fekalna}}. Kad ništa nije izabrano, desni panel tada prikazuje **Proračun fekalnih protoka** tamo gde atmosferska mreža prikazuje atmosfersku drenažu.

## Unesite što ulazi

1. Izaberite šaht. Pod **Proračun fekalnih protoka** upišite {{ui:Stanovnici koji ulaze ovde}} i {{ui:Površina koja ulazi ovde}} (hektari u projektu u metrima, akri u projektu u stopama).
2. Za radnje, kancelarije ili industriju upišite ekvivalentne stanovnike: površina puta broj stanovnika po hektaru (ili akru) koji koristi vaša agencija. Površina se u oba slučaja računa za infiltraciju.
3. Ponovite za svaki šaht na koji se spaja ulica ili parcela. Šaht na koji ništa ne utiče ostaje na 0 za oba.

Svaka cev nosi sve što ulazi u njen gornji šaht i iznad njega. Izaberite šaht da vidite šta kroz njega prolazi.

## Podešavanja

| Podešavanje | Šta znači |
|---|---|
| {{ui:Protok po osobi}} | prosečan dnevni protok jedne osobe: litri (projekat u metrima) ili američki galoni (projekat u stopama) |
| {{ui:Infiltracija}} | podzemna voda koja curi unutra: litri u sekundi po hektaru, ili galoni dnevno po akru |
| {{ui:Faktor vršnog opterećenja}} | Harmon, 1 + 14 / (4 + √P), ili Babbitt, 5 / P^0.2, gde je P broj stanovnika u hiljadama |
| {{ui:Faktor vršnog opterećenja najmanje}} / {{ui:Faktor vršnog opterećenja najviše}} | faktor se drži između ove dve vrednosti |
| {{ui:Manningov koeficijent n}} | za kapacitet i brzinu |
| {{ui:Najmanja brzina}} / {{ui:Najveća brzina}} | pri dubini samog vršnog protoka u cevi |
| {{ui:Najveći deo punog kapaciteta}} | koliko puna sme cev da bude pri vrhu, kao procenat onoga što nosi kad teče punim presekom |

Početne vrednosti su privremene, a ne standard. Koristite vrednosti koje vaša agencija objavljuje.

## Šta računa

Za svaku cev, po redosledu toka:

- vršni protok = ljudi × protok po osobi × faktor vršnog opterećenja + površina × infiltracija
- kapacitet pri punom toku (Manningova jednačina na nagibu cevi), i koliko je popunjena pri vrhu
- normalna dubina vršnog protoka i brzina na njoj

Tabela **Rezultati fekalne kanalizacije** navodi za svaku cev stanovnike, faktor vršnog opterećenja, vršni protok (l/s, ili gpm i kubne stope u sekundi), procenat popunjenosti i brzinu. Problemi su navedeni ispod nje: cev punija od granice, sporija od najmanje brzine (možda se neće samoočistiti), brža od najveće ili bez pada. {{ui:Odredi dimenzije cevi za ove protoke}} bira za svaku cev najmanju standardnu veličinu (200 mm ili 8 inča i više) koja nosi njen vrh unutar granice; jedan {{key:Mod+Z}} to opoziva.

:::note
Ovo je ustaljeni vršni protok koji računa proračunski list, proveren prema objavljenom proračunskom listu do njegovog štampanog zaokruživanja. Nije model kanalizacije u vremenu: nema hidrograma, skladištenja, pumpi ni preliva. Pogledajte [Još nije izgrađeno](topic:not-built-yet).
:::

Brzine koriste Manningovu jednačinu sa istim n na svakoj dubini. Neke agencije u svojim dijagramima za delimično punu cev dozvoljavaju da se n menja s dubinom, što daje nešto nižu brzinu u cevi koja teče 60 do 70 procenata punog (oko 3 procenta manje).
