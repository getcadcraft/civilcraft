---
title: Progib i zatezanje
summary: Vaši slučajevi opterećenja (temperatura, vjetar, led) i granice zatezanja, kako CivilCraft računa zatezanje svakog presjeka, i tablice zatezanja.
keywords: progib, zatezanje, slučaj opterećenja, temperatura, vjetar, led, asimetrično opterećenje ledom, mjerodavni raspon, ekvivalentni raspon, promjena stanja, lančanica, tablica zatezanja, prekidna čvrstoća, svakodnevno naprezanje
from: f8876c35
---

## Slučajevi opterećenja i granice

{{ui:More}} › {{ui:Slučajevi opterećenja i ograničenja…}} uređuje pravila kojih se svaki vod u projektu drži.

- **Slučajevi opterećenja**: temperatura, pritisak vjetra na vodič (Pa) i radijalni led (mm, sa svojom gustinom). Prvi slučaj je referentni.
- **Granice zatezanja**: udio prekidne čvrstoće vodiča, na horizontalnu silu zatezanja ili na najveću silu zatezanja na osloncu, u jednom slučaju opterećenja. Ili sami unesite horizontalnu silu zatezanja.
- **Vertikalni razmaci**: razmak koji vodič zadržava iznad terena, puta, zgrade i tako dalje. Dodajte, preimenujte i uklonite ih: vaši su. Ispod njih izaberite pravila za **Biljke ispod voda**, **Zidovi pejzaža ispod voda** i **Podzemna ukrštanja**.
- **Slučajevi koje provjere koriste**: koji slučaj daje najveći progib (vruće), zanjihanost izolatora (vjetar), led i led na jednoj strani oslonca.
- **Faktori**: faktor razmaka faza k, najveće zanjihavanje izolatora, faktor opterećenja oslonaca i spojnica, uglovi skretanja koji čine ugaone i krajnje oslonce, najmanja zaštitna debljina iznad podzemnih kablova i najveći pad napona.

## Paketi: pravila i biblioteka za državu

Nijedna država nema svoja pravila ugrađena u CivilCraft. **Paket** čuva skup pravila i biblioteku zajedno u jednoj datoteci (`.cclinepack.json`), za državu, operatera mreže ili kompaniju:

- **Spasi kao paket…** u {{ui:Slučajevi opterećenja i ograničenja…}} upisuje prikazani skup pravila i vašu biblioteku (ili, ako vaša biblioteka još ništa nema, stavke koje ovaj projekat koristi). Prvo upiši **Država ili region**.
- **Otvori skup pravila ili paket…** čita paket, datoteku pravila ili datoteku biblioteke. Pravila paketa se prikazuju u dijalogu (klikni **Primijeni** da ih koristiš), a njegove stavke idu u vašu biblioteku.
- Paketi koje drugi dijele navedeni su na stranici dodataka pod **Paketi za dalekovode**. Dva primjera paketa pokazuju format; nisu pravila nijedne države.

Svaki paket se provjerava pri otvaranju, kao i svaka datoteka. Provjeri svaku vrijednost prema standardu koji se primjenjuje prije nego se bilo šta izgradi.

Dva primjera skupova pravila su tu kao polazna tačka: **Primjer: hladna klima** i **Primjer: blaga klima**. Njihovi brojevi ne potiču iz nijednog standarda: postavite vrijednosti koje daje vaš standard. {{ui:Spasi pravila}} i {{ui:Otvori pravila…}} dijele skup pravila kao datoteku.

## Kako se računa zatezanje

Za svaki presjek između zateznih stubova:

1. **Mjerodavni raspon** je √(ΣL³ ÷ ΣL) njegovih raspona.
2. Svaka granica se pretvara u horizontalnu silu zatezanja u referentnom slučaju kroz **jednačinu promjene stanja** na mjerodavnom rasponu: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najrestriktivnija postavlja zatezanje.
3. Zatezanje svakog slučaja opterećenja slijedi iz te vrijednosti, a oblik svakog raspona je tačna **lančanica** kroz njegove dvije tačke vezivanja (uključujući raspone na padini): progib iz tetive, dužina i zatezanje na svakom kraju.

Opterećenje po metru u slučaju: težina plus led (površina leda × gustina × g) vertikalno; pritisak vjetra × obloženi prečnik horizontalno.

## Tablice zatezanja

{{ui:More}} › {{ui:Tablice zatezanja…}} navodi, za svaki presjek, horizontalnu silu zatezanja i progib svakog raspona pri svakoj temperaturi iz skupa pravila (−5 °C do 40 °C po 5 °C za početak), u mirnom vazduhu. Spasi ih, kao i tabelu oslonaca, kao CSV.

Nije uračunato: puzanje vodiča kroz godine i istezanje novog vodiča. Dodajte ih kroz temperature na kojima zatežete.
