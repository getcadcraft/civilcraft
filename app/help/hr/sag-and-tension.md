---
title: Progib i napetost
summary: Vaši slučajevi opterećenja (temperatura, vjetar, led) i granice napetosti, kako CivilCraft računa napetost svakog presjeka te tablice zatezanja.
keywords: progib, napetost, slučaj opterećenja, temperatura, vjetar, led, asimetrični led, mjerodavni raspon, ekvivalentni raspon, promjena stanja, lančanica, tablica zatezanja, prekidna čvrstoća, svakodnevno naprezanje
from: f8876c35
---

## Slučajevi opterećenja i granice

{{ui:Više}} › {{ui:Slučajevi opterećenja i granice…}} uređuje pravila koja slijedi svaki vod u projektu.

- **Slučajevi opterećenja**: temperatura, tlak vjetra na vodič (Pa) i radijalni led (mm, s njegovom gustoćom). Prvi slučaj je referentni.
- **Granice napetosti**: udio prekidne čvrstoće vodiča, na vodoravnu napetost ili na najveću napetost na stupu, u jednom slučaju opterećenja. Ili sami zadajte vodoravnu napetost.
- **Visinski razmaci**: razmak koji vodič održava iznad terena, ceste, zgrade i tako dalje. Dodajte, preimenujte i uklonite ih: vaši su. Ispod njih odaberite pravila za **Biljke u krajobrazu ispod voda**, **Zidovi u krajobrazu ispod voda** i **Podzemna križanja**.
- **Slučajevi koje provjere koriste**: koji slučaj daje najveći progib (vruće), otklon izolatora (vjetar), led i led s jedne strane stupa.
- **Faktori**: faktor razmaka faza k, najveći otklon izolatora, faktor na opterećenja stupova i spojnica, kutovi skretanja koji čine kutne i krajnje stupove, najmanji pokrov nad zakopanim kabelima, najveći pad napona.

## Paketi: pravila i knjižnica za državu

Pravila nijedne države nisu ugrađena u CivilCraft. **Paket** čuva skup pravila i knjižnicu zajedno u jednoj datoteci (`.cclinepack.json`), za državu, operatera mreže ili tvrtku:

- **Spremi kao paket…** u {{ui:Slučajevi opterećenja i granice…}} zapisuje prikazani skup pravila i vašu knjižnicu (ili, ako u knjižnici još nema ničega, stavke koje ovaj projekt koristi). Najprije upišite **Državu ili regiju**.
- **Otvori skup pravila ili paket…** čita paket, datoteku pravila ili datoteku knjižnice. Pravila paketa prikazuju se u dijaloškom okviru (kliknite **Primijeni** da ih koristite), a njegove stavke idu u vašu knjižnicu.
- Paketi koje drugi dijele navedeni su na stranici dodataka pod **Paketi za dalekovode**. Dva primjera paketa pokazuju format; nisu pravila nijedne države.

Svaki paket provjerava se pri otvaranju, kao i svaka datoteka. Provjerite svaku vrijednost prema važećoj normi prije nego što se bilo što izgradi.

Dva primjera skupova pravila tu su za početak: **Primjer: hladna klima** i **Primjer: blaga klima**. Njihovi brojevi ne dolaze ni iz jedne norme: postavite vrijednosti koje daje vaša norma. {{ui:Spremi pravila}} i {{ui:Otvori pravila…}} dijele skup pravila kao datoteku.

## Kako se računa napetost

Za svaki presjek između krajnjih stupova:

1. **Mjerodavni raspon** je √(ΣL³ ÷ ΣL) njegovih raspona.
2. Svaka granica pretvara se u vodoravnu napetost u referentnom slučaju kroz **jednadžbu promjene stanja** na mjerodavnom rasponu: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Najstrože ograničenje postavlja napetost.
3. Napetost svakog slučaja opterećenja slijedi iz te, a oblik svakog raspona je točna **lančanica** kroz njegove dvije točke vješanja (uključujući raspone na nagibu): progib od tetive, duljina i napetost na svakom kraju.

Opterećenje po metru u slučaju: težina plus led (površina leda × gustoća × g) okomito; tlak vjetra × promjer s ledom vodoravno.

## Tablice zatezanja

{{ui:Više}} › {{ui:Tablice zatezanja…}} navodi, za svaki presjek, vodoravnu napetost i progib svakog raspona pri svakoj temperaturi skupa pravila (−5 °C do 40 °C u koracima od 5 °C na početku), u mirnom zraku. Spremite ih, kao i tablicu stupova, kao CSV.

Nisu uračunati: puzanje vodiča tijekom godina i istezanje novog vodiča. Dodajte ih kroz temperature pri kojima zatežete.
