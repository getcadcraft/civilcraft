---
title: Rad sa tabelom atributa sloja
summary: Pogledajte svaki objekat GIS sloja kao tabelu, sortirajte i filtrirajte je, birajte redove i objekte zajedno, ispravljajte vrednosti, dodajte polja, računajte nove vrednosti i sačuvajte tabelu kao CSV.
keywords: tabela atributa, tabela, polja, kolone, redovi, sortiranje, filtriranje, izraz, izbor, izmena, kalkulator polja, računaj, dodaj polje, preimenuj polje, ukloni polje, csv, izvoz, gis, shapefile, geopackage, simbologija
from: fd9d6c11
---

Otvorite tabelu sloja iz menija **tri tačke** u listi GIS slojeva ({{ui:Tabela atributa…}}), iz Površ › Više › {{ui:Tabela atributa}}, ili kucanjem `ATTRIBUTES`, `ATTTABLE` ili `TABLE`. Tabela se otvara pored osnove i ostaje otvorena dok radite. Crtaju se samo redovi koje vidite, pa sloj sa hiljadama objekata se otvara i pomera brzo.

## Sortiranje, filtriranje i izbor

- **Sortiranje:** kliknite naslov kolone. Drugi klik okreće redosled, a treći vraća redosled iz datoteke. Prazne vrednosti uvek ostaju na dnu. Sortiranje menja samo ono što vidite, nikad sloj.
- **Filtriranje:** kucajte u polje za filtriranje. Izraz kao `AREA > 500 and USE = 'Res'` zadržava redove u kojima je tačan (iste reči kao kartica Izbor u [Analiza GIS slojeva](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ono što nije izraz, kao `oak maple`, traži te reči u svakoj koloni.
- **Izbor redova:** kliknite red. Ctrl+klik dodaje ili uklanja jedan, Shift+klik bira niz, a {{ui:Izaberi prikazane redove}} uzima svaki red koji prolazi filter. Izabrani objekti se crtaju na osnovi, a klik na objekat na osnovi bira njegov red ovde.
- Sa izabranim redovima možete {{ui:Zumiraj}} na njih, napraviti **sloj od izbora**, i pročitati ukupnu površinu ili dužinu u statusnoj liniji.

## Ispravka vrednosti

Dvokliknite ćeliju (ili se pomerite do nje strelicama i pritisnite Enter), ukucajte novu vrednost i pritisnite Enter. Esc poništava izmenu i vraća staru vrednost. Vrednost mora da odgovara koloni: brojevi kao brojevi, datumi kao `YYYY-MM-DD`, da/ne kao yes, no, true ili false. Vrednost koja ne odgovara biva odbijena uz rečenicu, i ništa se ne menja. Prazno polje čini vrednost praznom. Svaka izmena je jedan korak opozivanja: {{ui:Opozovi}} i {{ui:Ponovi}} stoje na dnu tabele, a Ctrl+Z radi na osnovi.

## Polja

Pod **Polja** možete dodati polje (tekst, broj, datum ili da/ne), preimenovati ga ili ukloniti. Novo polje počinje prazno. Preimenovanje se prenosi: polje za oznake i [stil po atributu](topic:gis-symbology) sloja prelaze na novi naziv, a uklanjanje polja briše oznaku i stil koji su ga koristili. Svaka radnja je jedan korak opozivanja koji sve vraća.

## Kalkulator polja

Upisuje vrednost u svaki red (ili samo u izabrane redove) iz ostalih polja reda, njegove geometrije i nekoliko funkcija. Izaberite postojeće polje ili **Novo polje…** i zadajte mu naziv i tip. Ništa se ne izvršava kao kod: izraz čita mali analizator sa fiksnim spiskom funkcija.

| Grupa | Reči |
|---|---|
| Brojevi | `+ - * /`, zagrade, `abs round(x, digits) floor ceil sqrt pow min max` |
| Tekst | `upper lower trim len substr(text, from, count) left right replace concat` (tekst ide u 'jednostruke navodnike'; naziv polja sa razmacima ide u "dvostruke navodnike" ili [uglaste zagrade]) |
| Biranje | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datumi | `year month day` vrednosti `YYYY-MM-DD` |
| Geometrija | `$area $perimeter $length $x $y $vertices`, u jedinicama projekta |

Rezultat koji ne može da se sačuva u tipu polja (tekst u brojčanom polju) ostavlja se prazan i broji se u poruci. Deljenje nulom daje praznu vrednost. Na primer, `round($area / 43560, 2)` upisuje akre iz kvadratnih stopa.

## Izvoz

{{ui:Izvezi CSV}} čuva redove koje vidite (posle filtera i sortiranja) kao UTF-8 CSV datoteku, sa nazivima polja u prvom redu. Tekst koji počinje sa `=`, `+`, `-` ili `@` dobija vodeći apostrof, da ga tabelarna aplikacija ne bi izvršila kao formulu. Da sačuvate sam sloj, koristite [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export).

## Ograničenja

Tabela prikazuje sloj u jednom redosledu sortiranja i jednom filteru istovremeno. Redovi se ovde ne mogu dodavati ni brisati (napravite novi sloj iz izbora), geometrija se ne menja, a tip polja se ne može promeniti nakon što je napravljeno.
