---
title: Neka AI pomoćnik radi s vašom lokacijom
summary: Uključite pomoćnike u Postavkama da pomoćnik na vašem računalu može čitati otvorenu lokaciju (točke, terene, količine, profile, katastarske čestice), dodavati geodetske točke, spremati i izvoziti LandXML ili DWG, kroz CadCraft Studio. Isključeno dok ga ne uključite.
keywords: ai, pomoćnik, mcp, skripta, automatizacija, studio, točke, kota, stacionaža, odmak, os trase, volumen, iskop, nasip, profil, katastarska čestica, landxml, dwg, usd, mape, dopuštenja, prekid veze, aktivnost
from: d0356582
---

## Što ćete naučiti

Kako dopustiti AI pomoćniku (bilo kojem pomoćniku koji govori MCP) da radi s lokacijom koju imate otvorenu, što smije, a što ne, i kako ga zaustaviti.

## Što pomoćnik može raditi u programu CivilCraft

| Što traži | Što dobiva | Treba |
|---|---|---|
| Lokacija | Naziv, jedinice, koordinatni sustav, skupine točaka, osi trase, tereni, platoi, katastarske čestice i cijevi | Čitanje |
| Geodetske točke | Broj, istok, sjever, kota i opis, po skupini, po opisu ili unutar okvira | Čitanje |
| Kote terena | Postojeći teren (ili uređeni teren) na bilo kojim točkama koje navede | Čitanje |
| Stacionaže i odmaci | Stacionaža i odmak točaka uz os trase, ili koordinate i kota terena stacionaža | Čitanje |
| Profil | Kote terena, projektnog profila i uređenog terena uz os trase, svakih toliko stopa ili metara | Čitanje |
| Iskop i nasip | Volumeni između postojećeg terena i uređenog terena (svakog platoa i koridora također), ili između terena i jedne razine | Čitanje |
| Katastarske čestice | Kutovi, površina (u acre ili hektarima), opseg i pravni opis | Čitanje |
| Odabir | Točke koje navede označuju se na planu, kao da ste ih sami odabrali | Uređivanje |
| Nove geodetske točke | Točke dodane s brojevima koje da ili sljedećim slobodnim. Svaki poziv je jedan korak koji možete poništiti | Uređivanje |
| Spremanje | Vlastiti {{ui:Spremi}} programa CivilCraft | Spremanje |
| LandXML ili DWG | Iste datoteke kao gumbi {{ui:LandXML}} i {{ui:DWG}} | Izvoz |
| Lokacija u 3D | OpenUSD (.usdz, .usda ili .usdc) terena, uređenog terena, platoa i cijevi, kako ih 3D prikaz izvozi | Izvoz |
| Biljke i popis biljaka | Biljke pronađene na popisu biljaka pod bilo kojim nazivom i brojevi iz popisa biljaka | Čitanje |
| Sadnja i uređenje | Biljke, gredica ili živica postavljene, ili platforma, nasip, jarak ili područje uređenja dodano, svaki korak koji možete poništiti, sa svojim iskopom i nasipom | Uređivanje |
| Provjera navodnjavanja | Protok svake zone, tlak potreban na njezinu ventilu i na dovodu, najnepovoljniji tlak, vremena rada, problemi i popis materijala, kao pomoć pri proračunu koji provjerava projektant navodnjavanja | Čitanje |

Radi s otvorenom lokacijom. U programu Studio može i spremati i izvoziti u mape koje odaberete (u nastavku); bez mape njegove se datoteke preuzimaju kao što to rade gumbi.

## Uključite ga

Pomoćnici dopiru do programa CivilCraft preko CadCraft Studija na vašem računalu; obični preglednik nema put do njega.

1. Otvorite {{ui:Postavke}} i odaberite karticu **CivilCraft**.
2. Pod **Pomoćnici** označite **Dopusti AI pomoćnicima i skriptama da koriste CivilCraft**.
3. **Čitanje** je već označeno za vas. Označite **Uređivanje**, **Spremanje** ili **Izvoz** tek kad ih pomoćnik treba.
4. Da mu dopustite spremanje i izvoz u mapu, odaberite {{ui:Dodaj mapu…}} pod **Mape koje smije koristiti** i odaberite mapu u dijaloškom okviru programa Studio. {{ui:Ukloni}} je odmah vraća; svaka druga putanja se odbija.
5. Povežite pomoćnika u programu Studio (Studio prikazuje adresu i postavke koje treba zalijepiti u njega).

## Dok je pomoćnik povezan

Napomena na vrhu desne ploče kaže koji je pomoćnik povezan i što smije. Kliknite {{ui:Prekini vezu}} da odmah završite njegovu sesiju; mora se ponovno povezati da nastavi.

**Aktivnost**, pod **Pomoćnici** u Postavkama, popisuje svaki poziv koji je pomoćnik napravio, od najnovijeg, s tim je li uspio.

:::tip
Pitajte običnim riječima, na primjer „kolika je kota terena svakih 50 ft duž Glavne ulice?“, „koliko iskopa i nasipa trebaju platoi?“ ili „dodaj kontrolnu točku na ove koordinate“. Pomoćnik čita lokaciju i odgovara ili napravi promjenu kao jedan korak koji možete poništiti.
:::

## Bez otvaranja aplikacije CivilCraft

CadCraft poslužitelj datoteka za pomoćnike (`npx @getcadcraft/mcp`) i naredbeni redak `cadcraft` otvaraju spremljene CivilCraft projekte (`.civilcraft.json`) i datoteke točaka vlastitim kodom programa CivilCraft, bez prozora: ista alata za čitanje, dodavanje točaka, spremanje projekta, LandXML i lokaciju u 3D kao OpenUSD. `cadcraft convert site.civilcraft.json site.xml` zapisuje LandXML iz naredbenog retka. Otvaranje LandXML-a, izvoz u DWG i alati radnog prostora Krajobraz i dalje trebaju prozor programa CivilCraft.

## Isključivanje

Poništite označavanje **Dopusti AI pomoćnicima i skriptama da koriste CivilCraft**. Svi pomoćnici se odmah odspajaju, a postavka se zadržava za sljedeći put.

## Vidi također

- [Primjeri za AI pomoćnike](common:assistants-recipes): primjeri koji rade, svaki s alatima koje poziva.
- [Iscrtavanje horizontalne osi trase](topic:alignment)
- [Izrada i dorada terena](topic:build-surface)
- [Odabir, kopiranje i lijepljenje geodetskih točaka](topic:copy-paste-points)
- [Postavke programa CivilCraft](topic:settings)
