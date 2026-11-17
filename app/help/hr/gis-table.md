---
title: Rad s tablicom atributa sloja
summary: Pogledajte svaku značajku GIS sloja kao tablicu, sortirajte je i filtrirajte, odabirite retke i značajke zajedno, ispravljajte vrijednosti, dodajte polja, izračunavajte nove vrijednosti i spremite tablicu kao CSV.
keywords: tablica atributa, tablica, polja, stupci, reci, sortiranje, filtar, izraz, odabir, uređivanje, kalkulator polja, izračunaj, dodaj polje, preimenuj polje, ukloni polje, csv, izvoz, gis, shapefile, geopackage, simbologija
from: fd9d6c11
---

Otvorite tablicu sloja iz izbornika **tri točkice** u popisu GIS slojeva ({{ui:Tablica atributa…}}), iz Teren › Više › {{ui:Tablica atributa}}, ili upisivanjem `ATTRIBUTES`, `ATTTABLE` ili `TABLE`. Tablica se otvara uz tlocrt i ostaje otvorena dok radite. Crtaju se samo retci koje vidite, pa se sloj s tisućama značajki otvara i pomiče brzo.

## Sortiranje, filtriranje i odabir

- **Sortiranje:** kliknite naslov stupca. Drugi klik obrće redoslijed, a treći vraća redoslijed iz datoteke. Prazne vrijednosti uvijek ostaju na dnu. Sortiranje mijenja samo ono što vidite, nikad sloj.
- **Filtar:** upišite u okvir za filtar. Izraz poput `AREA > 500 and USE = 'Res'` zadržava retke u kojima je istinit (iste riječi kao kartica Odabir u [Analiziraj GIS slojeve](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ono što nije izraz, poput `oak maple`, traži te riječi u svakom stupcu.
- **Odabir redaka:** kliknite redak. Ctrl+klik dodaje ili uklanja jedan, Shift+klik odabire niz, a {{ui:Odaberi prikazane retke}} uzima svaki redak koji prolazi filtar. Odabrane značajke crtaju se na tlocrtu, a klik na značajku na tlocrtu odabire njezin redak ovdje.
- S odabranim retcima možete {{ui:Zumiranje}} na njih, napraviti **sloj iz odabira** i pročitati ukupnu površinu ili duljinu u statusnoj liniji.

## Ispravljanje vrijednosti

Dvaput kliknite ćeliju (ili dođite do nje tipkama sa strelicama i pritisnite Enter), upišite novu vrijednost i pritisnite Enter. Escape ostavlja kakva je bila. Vrijednost mora odgovarati stupcu: brojevi kao brojevi, datumi kao `YYYY-MM-DD`, da/ne kao `yes`, `no`, `true` ili `false`. Vrijednost koja ne odgovara se odbija rečenicom i ništa se ne mijenja. Prazan okvir čini vrijednost praznom. Svaka izmjena je jedan korak poništavanja: {{ui:Poništi}} i {{ui:Ponovi}} su na dnu tablice, a Ctrl+Z radi na tlocrtu.

## Polja

Pod **Polja** možete dodati polje (tekst, broj, datum ili da/ne), preimenovati ga ili ukloniti. Novo polje počinje prazno. Preimenovanje se prenosi: polje oznake i [stil prema atributu](topic:gis-symbology) sloja prelaze na novi naziv, a uklanjanje polja odbacuje oznaku i stil koji su ga koristili. Svaka radnja je jedan korak poništavanja koji sve vraća.

## Kalkulator polja

Upisuje vrijednost u svaki redak (ili samo u odabrane retke) iz ostalih polja retka, njegove geometrije i nekoliko funkcija. Odaberite postojeće polje ili **Novo polje…** i zadajte mu naziv i vrstu. Ništa se ne izvršava kao kod: izraz čita mali raščlanjivač s fiksnim popisom funkcija.

| Skupina | Riječi |
|---|---|
| Brojevi | `+ - * /`, zagrade, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst ide u 'jednostruke navodnike'; naziv polja s razmacima ide u "dvostruke navodnike" ili [uglate zagrade]) |
| Odabir | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datumi | `year month day` od vrijednosti `YYYY-MM-DD` |
| Geometrija | `$area $perimeter $length $x $y $vertices`, u jedinicama projekta |

Rezultat koji se ne može spremiti u vrstu polja (tekst u brojčanom polju) ostaje prazan i broji se u poruci. Dijeljenje nulom daje praznu vrijednost. Na primjer, `round($area / 43560, 2)` zapisuje akre iz kvadratnih stopa.

## Izvoz

{{ui:Izvezi CSV}} sprema retke koje vidite (nakon filtra i sortiranja) kao UTF-8 CSV datoteku s nazivima polja u prvom retku. Tekst koji počinje sa `=`, `+`, `-` ili `@` dobiva vodeći apostrof da ga tablična kalkulacija ne bi izvršila kao formulu. Da biste spremili sam sloj, koristite [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export).

## Ograničenja

Tablica prikazuje sloj u jednom redoslijedu sortiranja i s jednim filtrom odjednom. Retci se ovdje ne mogu dodavati ni brisati (napravite novi sloj iz odabira), geometrija se ne uređuje, a vrsta polja se ne može promijeniti nakon što je stvoreno.
