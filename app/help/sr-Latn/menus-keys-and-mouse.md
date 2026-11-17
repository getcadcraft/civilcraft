---
title: Meniji, tasteri i miš
summary: Izaberi stil menija koji odgovara načinu na koji već radiš, dodeli bilo kojoj komandi sopstveni taster, premesti komande između kartica trake i podesi šta točkić i dugmad miša rade u planu i u 3D.
keywords: stil menija, meniji, traka, civilna traka, alatka, linija komandi, klasičan crtački, prečice, tasteri, prilagodi, ponovo dodeli, miš, točkić, obrni, smer zumiranja, srednje dugme, desno dugme, pomeri pogled, orbita, izvoz, uvoz, prebacivanje, poznato
from: 07ac73a0
---

CivilCraft-ove komande su iste bez obzira na to kako do njih dođeš. **Stil menija** određuje samo gde se komande nalaze na ekranu, kako se zovu i koji tasteri ih pokreću, pa možeš zadržati navike koje već imaš. Izaberi ga u {{ui:Podešavanja}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Meniji, tasteri i miš}}; promena važi odmah, a ovaj pregledač je pamti.

## Tri stila

| Stil | Šta dobijaš |
|---|---|
| {{ui:CivilCraft}} | CivilCraft-ova sopstvena traka ({{ui:Datoteka}}, {{ui:Izvoz}}, {{ui:Površ}}, Projektovanje, Uređivanje, GIS, {{ui:Pogled}}) i pojedinačni tasteri: {{key:A}} trasa, {{key:G}} plato, {{key:P}} cevi, {{key:B}} linija loma, {{key:O}} granica, {{key:L}} karakteristična linija, {{key:R}} profil, {{key:X}} preseci, {{key:E}} nivelacija, {{key:D}} 3D, {{key:F}} uklopi, {{key:V}} izaberi. Početak. |
| {{ui:Klasičan crtački}} | Mala traka ({{ui:Početna}}, {{ui:Umetanje}}, {{ui:Izlaz}}) i linija komandi, za ljude koji kucaju komande: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (opozovi), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Počni da kucaš bilo gde i slova idu u liniju komandi; {{key:Enter}} pokreće, {{key:Enter}} bez unosa ponavlja poslednju komandu, {{key:Esc}} briše unos. Srednje dugme pomera pogled. |
| {{ui:Civilna traka}} | Kartice velikih dugmadi, grupisanih kao što civilni projektni programi grupišu alatke: {{ui:Početna}} (podaci o terenu, kreiranje projekta, prikazi profila i preseka), {{ui:Površi}}, {{ui:Izmena}}, {{ui:Geolokacija}}, {{ui:Pogled}} i {{ui:Izlaz}}, sa menijem {{ui:Datoteka}} i brzim dugmadima desno. Pojedinačni tasteri ostaju. Srednje dugme pomera plan; u 3D srednje dugme pomera pogled, a {{key:Shift}} sa srednjim dugmetom vrši orbitu. |

Svaki stil zadržava tastere {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Taster koji pripada CivilCraft-ovom rasporedu, ali ga tvoj stil dodeljuje drugoj komandi, ne radi ništa, a statusna linija kaže gde je otišla njegova komanda („U Mojim tasterima, Plato je Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} i strelice uvek zadržavaju svoje značenje, a dok crtaš liniju, njene tačke zadržavaju svoje tastere ({{key:Backspace}}, {{key:Enter}}).
:::

## Napravi po svom

1. Izaberi stil koji je najbliži onome što želiš, pa klikni {{ui:Prilagodi…}}.
2. Na {{ui:Tasteri i meniji}} nađi komandu (polje za pretragu pomaže). {{ui:Dodaj ključ}} i pritisni taster, ili dva tastera zaredom za dvoslovni taster. Klikni taster da ga ukloniš.
3. Uz traku, {{ui:Gde se nalazi}} premešta komandu na drugu karticu i panel, u meni {{ui:Datoteka}}, ili na {{ui:Samo tasteri}}.
4. Na {{ui:Miš}} podesi točkić, dugmad koja pomeraju plan, i šta svako dugme radi u 3D prikazu.
5. Daj mu ime i klikni {{ui:Sačuvaj}}.

Čuvanje ugrađenog stila pravi tvoju kopiju („Moja civilna traka“); ugrađeni se nikad ne menja. Taster dodeljen dvema komandama, ili onaj koji bi se izvršio pre nego što se dvoslovni taster može ukucati, prikazuje se crveno i mora se ispraviti pre čuvanja.

## Miš

- **Točkić miša**: {{ui:Scroll up zooms in}} (početno podešavanje) ili {{ui:Scroll up zooms out}}, i koliko brzo, u planu i u 3D. Štipanje na touchpadu uvek zumira u smeru pokreta prstiju.
- **Pomeri plan pomoću**: srednjeg dugmeta, desnog dugmeta, ili oba. {{key:Space}} i prevlačenje takođe pomeraju. Levo dugme uvek bira i crta.
- **Prevlačenje u 3D prikazu**: {{ui:Svaki prikaz zasebno}} zadržava CivilCraft-ova dugmad (levo vrši orbitu, desno pomera). Ili postavi svako dugme na orbitu, pomeranje, zumiranje ili ništa; {{key:Shift}} sa dugmetom menja orbitu i pomeranje. Klik bez prevlačenja i dalje bira.

## Ponesi sa sobom

{{ui:Izvoz}} čuva stil u upotrebi kao mali fajl `.ccinput.json`; {{ui:Uvezi…}} dodaje jedan, sa drugog računara ili od kolege. Uvezeni fajl može ukazivati samo na CivilCraft-ove sopstvene komande: sve ostalo se izostavlja i prijavljuje u statusnoj liniji. {{ui:Izbriši ovaj stil}} uklanja jedan tvoj stil.

:::note
Ova podešavanja ostaju u ovom pregledaču. {{ui:Koristi ovaj stil u svakoj aplikaciji}} ispod kartica stilova čini da se svaka aplikacija otvara u odgovarajućem stilu (sopstvena traka, traka ili {{ui:Klasičan crtački}}), sa izmenama koje si napravio u svakoj aplikaciji. CivilCraft nema stil sa menijskom trakom: kada se menijska traka druge aplikacije izabere za sve aplikacije, CivilCraft zadržava sopstvenu traku.
:::

Povezano: [Tastatura i miš](topic:keyboard) · [CivilCraft podešavanja](topic:settings) · [Dolazak sa drugog građevinskog softvera](topic:coming-from)
