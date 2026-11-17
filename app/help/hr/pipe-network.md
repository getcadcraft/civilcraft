---
title: Izradite gravitacijsku mrežu cijevi
summary: Nacrtajte oborinske ili fekalne dionice cijevi objekt po objekt, postavite pravila nagiba, nadsloja i pada, pustite CivilCraft da postavi dna cijevi i ispravite probleme koje navede.
keywords: graditelj objekata, vrsta objekta, pravokutni objekt, slivnik, okvir, nadsloj, debljina zida, stavka knjižnice, mreža cijevi, oborinska, fekalna, kanalizacija, objekti, revizijska okna, slivnici, dna cijevi, nadsloj, nagib, pad, rub, taložnik, gravitacijske cijevi
from: 10a3c14d
---

Projekt sadrži jednu gravitacijsku mrežu cijevi, oborinsku ili fekalnu. Sastoji se od objekata (revizijskih okana, slivnika) i ravnih cijevi između njih. Tok ide u smjeru u kojem crtate. CivilCraft provjerava svaku cijev i objekt prema tri pravila koja postavite i može postaviti sva dna cijevi prema tim pravilima.

## Nacrtajte dionicu

Cijevi možete crtati bez terena, ali rubovi, nadsloj i automatska dna trebaju teren.

1. Pritisnite {{key:P}} ili kliknite {{ui:Cijevi}} u grupi **Projektiranje**.
   Savjet kaže: „Cijevi: kliknite objekte od vrha dionice prema dolje (kliknite postojeći da se spojite). Enter završava.“
2. Kliknite gdje ide uzvodni objekt. Objekt je postavljen.
3. Kliknite svaki sljedeći objekt nizvodno. Za spoj na postojeći objekt kliknite na njega: statusna traka kaže „Spojeno: S3.“
4. Pritisnite {{key:Enter}}.
   Cijevi se crtaju, njihova dna se postavljaju prema pravilima, a statusna traka kaže „Nacrtano cijevi: 3, 12“, dna postavljena prema pravilima; sve provjere prolaze.

Novi objekti nazivaju se S1, S2 … s promjerom 48 in (1200 mm). Nove cijevi nazivaju se P1, P2 … s promjerom 12 in (300 mm). Promjeri su u palcima u projektu u stopama, a u milimetrima u projektu u metrima.

Završite s {{key:Enter}}. Dvostruki klik također radi, ali kad dvaput kliknete na postojeći objekt da završite dionicu tamo, spoj se odbacuje: kliknite ga jednom, zatim pritisnite {{key:Enter}}.

## Postavite svoja pravila

Kad ništa nije odabrano, desna ploča (**Projekt**) ima blok **Mreža cijevi**:

| Postavka | Početna vrijednost | Značenje |
|---|---|---|
| Vrsta | Oborinska | {{ui:Oborinska}} ili {{ui:Fekalna}}; zapisuje se u LandXML |
| Najmanji nagib | 0.50% | Svaka cijev mora padati barem toliko |
| Najmanji nadsloj | 2 ft (0.6 m) | Od terena do tjemena cijevi, duž cijele cijevi |
| Pad u objektima | 0.10 ft (0.03 m) | Dno izlaza mora biti barem toliko ispod svakog dna ulaza |

**Ove početne vrijednosti su privremene, a ne standard.** Postavite vrijednosti koje traži vaša agencija ili projekt. Nadsloj se mjeri od terena do tjemena (dno cijevi plus unutarnji promjer); debljina zida se ne računa. Gdje se platoi ili koridori uređuju, uređena površina je teren.

## Neka CivilCraft postavi dna cijevi

- {{ui:Postavi svako dno cijevi prema pravilima}} (u bloku **Mreža cijevi**) postavlja sve cijevi.
- {{ui:Postavi njezina dna prema pravilima}} (uz jednu odabranu cijev) postavlja samo tu cijev.

Radeći nizvodno, svaka dionica na svom gornjem objektu počinje s najmanje nadslojem, pada najmanje za najmanji nagib, pada najmanje za pad kroz svaki objekt i ide dublje gdje bi teren uz cijev ostavio manje od najmanjeg nadsloja. Dna se zaokružuju na 0.01 dolje, nikad gore. Statusna traka kaže „Dna cijevi postavljena: najmanji nadsloj na vrhu svake dionice, najmanji nagib i najmanji pad u svakom objektu.“ ili imenuje što nije mogla učiniti.

## Uredite objekte i cijevi

Kliknite objekt ili cijev alatom {{ui:Odaberi}} da je vidite u desnoj ploči.

**Objekt**: **Naziv**, **Rub**, **Dubina taložnika**, **Promjer**, zatim **Korišteni rub**, **Taložnik**, **Istok (E)** i **Sjever (N)**, te cijevi koje ulaze i izlaze s njihovim dnima.

- Ostavite **Rub** prazno da ga uzme s površine; okvir tada prikazuje vrijednost površine sivom bojom. Upišite vrijednost da fiksirate rub.
- Povucite ručku objekta na tlocrtu da ga pomaknete. Njegove cijevi slijede; njihova dna ostaju kakva su bila, pa poslije provjerite probleme.

**Vrsta**: odaberite jednu od vrsta objekata mreže (dolje) ili nijednu za okrugli objekt vlastitog promjera.

**Cijev**: **Naziv**, objekti između kojih teče, **Promjer**, **Gornje dno cijevi**, **Donje dno cijevi**, zatim **Duljina**, **Nagib** i **Najmanji nadsloj**.

Pritisnite {{key:Enter}} nakon svake vrijednosti.

## Čitajte i ispravite probleme

Blok **Mreža cijevi** popisuje svaki problem (do 40); kliknite jedan da odaberete cijev ili objekt. Odabrana cijev ili objekt popisuje svoje. Kad ništa nije odabrano, piše „Svaka cijev i objekt prolaze pravila.“

| Poruka (primjeri) | Što učiniti |
|---|---|
| „P2 teče uzbrdo (-0.40%).“ ili „… teče ravno …“ | Zamijenite dna ili ih postavite prema pravilima. |
| „P2 s 0.30% ima nagib manji od najmanjeg 0.50%.“ | Spustite nizvodno dno ili podignite uzvodno. |
| „P3 ima 1.40 nadsloja 35 duž sebe, manje od najmanjeg 2.“ | Spustite cijev; postavite joj dna prema pravilima. |
| „U S3, P4 izlazi na 245.20, manje od 0.1 ispod P3 koja ulazi na 245.25.“ | Spustite gornje dno izlazne cijevi. |
| „Tjeme P1 je iznad ruba S1.“ | Cijev je previsoka za objekt. |
| „Iz S2 izlaze 2 cijevi; gravitacijska mreža treba imati jedan izlaz iz svakog objekta.“ | Uklonite jednu odlaznu cijev ili je ponovno nacrtajte u ispravnom smjeru. |
| „Cijevi čine petlju; tok mora završiti na ispustu.“ | Dionica je nacrtana natrag u samu sebe; izbrišite cijev. |
| „S5 je izvan površine i nema kotu ruba.“ | Upišite rub ili pomaknite objekt na površinu. |
| „P6 dijelom prolazi izvan površine; nadsloj tamo nije poznat.“ | Proširite površinu ili prihvatite da se nadsloj tamo ne provjerava. |
| „P7 još nema dna.“ | Upišite ih ili ih postavite prema pravilima. |

Problematične cijevi i objekti također su na tlocrtu označeni crveno.

## Vrste objekata

Vrsta objekta je objekt izgrađen iz svojih parametara: revizijsko okno, slivnik, spojna kutija ili ispust, **okrugao** (unutarnji promjer) ili **pravokutan** (unutarnja širina i duljina), s **debljinom zida**, **podnom pločom**, **taložnikom** ispod najniže cijevi i **okvirom i poklopcem** (okrugli ili pravokutni otvor, visina okvira). Vrste pripadaju mreži, pod **Vrste objekata** u Svojstvima projekta.

1. Kliknite {{ui:Nova vrsta objekta}}. Dijaloški okvir crta objekt u tlocrtu i presjeku dok upisujete.
2. Kliknite {{ui:Dodaj vrstu}}.
3. Odaberite objekt i izaberite vrstu pod **Vrsta**. Preuzima veličinu vrste i njezin taložnik; vlastiti taložnik se i dalje može mijenjati.

Uredite vrstu i svaki objekt te vrste slijedi njezine veličine. Uklonite vrstu i njezini objekti ostaju kao okrugli objekti iste širine. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

Pravokutni objekt crta se u tlocrtu, DXF-u, DWG-u i PDF-u te u 3D-u kao pravokutnik s duljinom uz svoju izlaznu cijev; cijevi počinju od njegova zida. LandXML ga zapisuje kao pravokutni objekt (`RectStruct`) s debljinom zida i čita takve objekte natrag kao vrste.

### Dijelite vrstu kroz knjižnicu

{{ui:Spremi kao stavku knjižnice}} zapisuje vrstu kao stavku knjižnice CadCrafta (datoteku `.json`): njezin simbol u tlocrtu, 3D tijelo do tipične dubine i sve veličine. Učitajte je u knjižnicu da je podijelite. {{ui:Otvori stavku knjižnice}} čita tako spremljen objekt natrag u mrežu, pretvoren u jedinice projekta. Stavke knjižnice koje nisu objekti napravljeni u CivilCraftu odbijaju se, uz razlog.

## Brisanje

Odaberite cijev i pritisnite Delete da je uklonite. Brisanje objekta uklanja i cijevi spojene na njega. Na Macu pritisnite Fn i Delete, ili kliknite {{ui:Izbriši}}.

## Još nije izrađeno

Tokovi, veličine cijevi i linija hidrauličkog nagiba su u [Oborinskoj odvodnji](topic:storm-drainage). Katalozi cijevi, necirkularne cijevi, cijevi u prikazu profila, zakrivljene cijevi i više od jedne mreže po projektu još nisu dostupni. Vidi [Još nije izrađeno](topic:not-built-yet).
