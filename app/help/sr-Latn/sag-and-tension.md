---
title: Ugib i zatezanje
summary: Vaši slučajevi opterećenja (temperatura, vetar, led) i granice zatezanja, kako CivilCraft računa zatezanje svakog preseka i tabele zatezanja.
keywords: ugib, zatezanje, slučaj opterećenja, temperatura, vetar, led, asimetrični led, merodavni raspon, ekvivalentni raspon, promena stanja, lančanica, tabela zatezanja, prekidna čvrstoća, svakodnevno naprezanje
from: f8876c35
---

## Slučajevi opterećenja i granice

{{ui:Više}} › {{ui:Slučajevi opterećenja i ograničenja…}} uređuje pravila kojih se svaka linija u projektu pridržava.

- **Slučajevi opterećenja**: temperatura, pritisak vetra na provodnik (Pa) i radijalni led (mm, sa svojom gustinom). Prvi slučaj je referentni.
- **Granice zatezanja**: udeo prekidne čvrstoće provodnika, na horizontalnom zatezanju ili na najvećem zatezanju na osloncu, u jednom slučaju opterećenja. Ili sami upišite horizontalno zatezanje.
- **Razmaci**: slobodan prostor koji provodnik ostavlja iznad terena, puta, zgrade i tako dalje. Dodajte, preimenujte i uklonite ih: vaši su. Ispod njih izaberite pravila za **Biljke pod linijom u zelenilu**, **Zidove pod linijom u zelenilu** i **Podzemna ukrštanja**.
- **Slučajevi koje provere koriste**: koji slučaj daje najveći ugib (vruće), otklon izolatora (vetar), led i led na jednoj strani oslonca.
- **Faktori**: faktor razmaka faza k, najveći otklon izolatora, faktor na opterećenja oslonaca i pribora, uglovi skretanja koji čine uglovne i krajnje oslonce, najmanji pokrivni sloj nad podzemnim kablovima, najveći pad napona.

## Paketi: pravila i biblioteka za državu

Nijedna pravila država nisu ugrađena u CivilCraft. **Paket** čuva skup pravila i biblioteku zajedno u jednoj datoteci (`.cclinepack.json`), za državu, operatera mreže ili kompaniju:

- **Sačuvaj kao paket…** u {{ui:Slučajevi opterećenja i ograničenja…}} upisuje prikazani skup pravila i vašu biblioteku (ili, ako je biblioteka još prazna, stavke koje ovaj projekat koristi). Prvo upišite **Država ili region**.
- **Otvori skup pravila ili paket…** čita paket, datoteku pravila ili datoteku biblioteke. Pravila paketa prikazuju se u dijalogu (kliknite **Primeni** da ih koristite), a njegove stavke idu u vašu biblioteku.
- Paketi koje drugi dele navedeni su na stranici dodataka pod **Paketi za dalekovode**. Dva primera paketa pokazuju format; nisu ničija pravila država.

Svaki paket se proverava kad se otvori, kao svaka datoteka. Proverite svaku vrednost prema standardu koji se primenjuje pre nego što se išta izgradi.

Dva primera skupa pravila su tu da se od njih počne: **Primer: hladna klima** i **Primer: umerena klima**. Njihovi brojevi ne potiču iz nijednog standarda: unesite vrednosti koje daje vaš standard. {{ui:Sačuvaj pravila}} i {{ui:Otvori pravila…}} dele skup pravila kao datoteku.

## Kako se računa zatezanje

Za svaki odsek između krajnjih oslonaca:

1. **Merodavni raspon** je √(ΣL³ ÷ ΣL) njegovih raspona.
2. Svaka granica se pretvara u horizontalno zatezanje u referentnom slučaju kroz **jednačinu promene stanja** na merodavnom rasponu: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najrestriktivnija postavlja zatezanje.
3. Zatezanje svakog slučaja opterećenja sledi iz tog, a oblik svakog raspona je tačna **lančanica** kroz njegove dve tačke vezivanja (uključujući raspone na padu): ugib iz tetive, dužina i zatezanje na svakom kraju.

Opterećenje po metru u slučaju: sopstvena težina plus led (površina leda × gustina × g) vertikalno; pritisak vetra × ledeni prečnik horizontalno.

## Tabele zatezanja

{{ui:Više}} › {{ui:Tabele zatezanja…}} navodi, za svaki odsek, horizontalno zatezanje i ugib svakog raspona pri svakoj temperaturi iz skupa pravila (−5 °C do 40 °C po 5 °C za početak), u mirnom vazduhu. Sačuvajte ih, kao i tabelu oslonaca, kao CSV.

Nije uračunato: puzanje provodnika tokom godina i istezanje novog provodnika. Dodajte ih kroz temperature na kojima zatežete.
