---
title: Radi s tabelom atributa sloja
summary: Pogledaj svaki objekat GIS sloja kao tabelu, sortiraj i filtriraj je, odaberi redove i objekte zajedno, popravi vrijednosti, dodaj polja, izračunaj nove vrijednosti i sačuvaj tabelu kao CSV.
keywords: tabela atributa, tabela, polja, kolone, redovi, sortiranje, filter, izraz, odabir, uređivanje, kalkulator polja, izračunaj, dodaj polje, preimenuj polje, ukloni polje, csv, izvoz, gis, shapefile, geopackage, simbologija
from: fd9d6c11
---

Otvori tabelu sloja iz njegovog menija **tri tačke** u listi GIS slojeva ({{ui:Tabela atributa…}}), iz Površ › Više › {{ui:Tabela atributa}}, ili upisivanjem `ATTRIBUTES`, `ATTTABLE` ili `TABLE`. Tabela se otvara pored plana i ostaje otvorena dok radiš. Crtaju se samo redovi koje vidiš, pa se sloj sa hiljadama objekata otvara i pomjera brzo.

## Sortiraj, filtriraj i odaberi

- **Sortiranje:** klikni naslov kolone. Drugi klik ga okreće, a treći vraća redoslijed iz datoteke. Prazne vrijednosti uvijek ostaju dolje. Sortiranje mijenja samo ono što vidiš, nikad sloj.
- **Filter:** upiši u polje za filter. Izraz kao `AREA > 500 and USE = 'Res'` zadržava redove u kojima je tačan (iste riječi kao u kartici Odaberi u [Analiziraj GIS slojeve](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Sve što nije izraz, kao `oak maple`, traži te riječi u svakoj koloni.
- **Odabir redova:** klikni red. Ctrl+klik dodaje ili uklanja jedan, Shift+klik odabire niz, a {{ui:Odaberi prikazane redove}} uzima svaki red koji prolazi filter. Odabrani objekti se crtaju na planu, a klik na objekat na planu odabira njegov red ovdje.
- Sa odabranim redovima možeš {{ui:Zumiranje}} na njih, napraviti **sloj od odabira** i pročitati ukupnu površinu ili dužinu u statusnoj liniji.

## Popravi vrijednosti

Dva puta klikni ćeliju (ili se pomjeri strelicama i pritisni Enter), upiši novu vrijednost i pritisni Enter. Esc ostavlja kako je bilo. Vrijednost mora odgovarati koloni: brojevi kao brojevi, datumi kao `YYYY-MM-DD`, da/ne kao yes, no, true ili false. Vrijednost koja ne odgovara se odbija uz rečenicu, i ništa se ne mijenja. Prazno polje čini vrijednost praznom. Svaka izmjena je jedan korak poništavanja: {{ui:Poništi}} i {{ui:Ponovi}} su na dnu tabele, a Ctrl+Z radi na planu.

## Polja

Pod **Polja** možeš dodati polje (tekst, broj, datum ili da/ne), preimenovati ga ili ukloniti. Novo polje počinje prazno. Preimenovanje se prenosi: polje oznake i [oblikovanje po atributu](topic:gis-symbology) sloja prelaze na novo ime, a uklanjanje polja briše oznaku i stil koji su ga koristili. Svaka radnja je jedan korak poništavanja koji sve vraća.

## Kalkulator polja

Upisuje vrijednost u svaki red (ili samo u odabrane redove) iz ostalih polja reda, njegove geometrije i nekoliko funkcija. Odaberi postojeće polje ili **Novo polje…**, pa mu daj ime i tip. Ništa se ne izvršava kao kod: izraz čita mali parser sa fiksnim spiskom funkcija.

| Grupa | Riječi |
|---|---|
| Brojevi | `+ - * /`, zagrade, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst ide u 'jednostruke navodnike'; ime polja sa razmacima ide u "dvostruke navodnike" ili [uglaste zagrade]) |
| Biranje | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datumi | `year month day` vrijednosti `YYYY-MM-DD` |
| Geometrija | `$area $perimeter $length $x $y $vertices`, u jedinicama projekta |

Rezultat koji se ne može sačuvati u tipu polja (tekst u numeričkom polju) ostaje prazan i broji se u poruci. Dijeljenje nulom daje praznu vrijednost. Na primjer, `round($area / 43560, 2)` upisuje akre iz kvadratnih stopa.

## Izvoz

{{ui:Izvezi CSV}} čuva redove koje vidiš (nakon filtera i sortiranja) kao UTF-8 CSV datoteku sa imenima polja u prvom redu. Tekst koji počinje sa `=`, `+`, `-` ili `@` dobija vodeći apostrof, da ga tabelarni program ne bi izvršio kao formulu. Da sačuvaš sam sloj, koristi [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export).

## Ograničenja

Tabela prikazuje sloj u jednom redoslijedu sortiranja i jednom filteru istovremeno. Redovi se ovdje ne mogu dodavati ni brisati (napravi novi sloj od odabira), geometrija se ne uređuje, a tip polja se ne može promijeniti nakon što je napravljeno.
