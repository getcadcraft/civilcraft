---
title: Analiziraj GIS slojeve
summary: Bafer, preklapanje (presjek, unija, izuzimanje, rastapanje), prostorno spajanje, odabir po atributu i mjerenje GIS slojeva u projektu, svaki kao novi sloj koji možeš poništiti.
keywords: gis, analiza, bafer, preklapanje, presjek, unija, izuzmi, isjeci, rastopi, spajanje, prostorno spajanje, odabir po atributu, upit, gdje, izraz, statistika, površina, dužina, obim, mjerenje, parcele, služnost, odmak, shapefile, geopackage, tabela atributa
from: a6b2d3f9
---

Kad projekt ima GIS slojeve (vidi [Uvezi GIS podatke](topic:gis-import)), dugme **Analiziraj** u grupi GIS (upisuje se `GISANALYSIS`, `ANALYZE` ili `BUFFER`) otvara panel sa pet kartica. Ostaje otvoren pored plana, pa ono što odabereš bude prikazano na planu dok radiš.

Svaki alat koji nešto pravi **dodaje novi sloj** i ostavlja slojeve koje je čitao potpuno nepromijenjene. Svaki je jedan korak poništavanja: {{ui:Poništi}} u panelu (ili Ctrl+Z) uklanja novi sloj. Rezultat izvezi kao i svaki sloj pomoću [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export), kao shapefile, GeoJSON ili GeoPackage.

Cijela tabela sloja, sa sortiranjem, uređivanjem i kalkulatorom polja, opisana je u [Radi s tabelom atributa sloja](topic:gis-table); bojenje po polju je u [Oblikuj sloj po atributu](topic:gis-symbology).

Sve se radi na planu, u jedinicama projekta (stope ili metri). Projekt je uvijek u projektovanom ili lokalnom sistemu, pa udaljenost 50 znači 50 stopa ili 50 metara, nikad stepene. Visine (z) se u rezultatima ne čuvaju.

## Bafer

Crta zonu zadate udaljenosti oko svakog objekta, kao novi poligonski sloj. Tačke postaju krugovi, linije postaju koridori sa zaobljenim krajevima, poligoni se šire. **Negativna** udaljenost sužava poligone (kvadrat 100 po 100 sužen za 5 je 90 po 90; sužen za 60 ništa ne ostaje, a panel to kaže). Udaljenost uzmi iz numeričkog polja da svaki objekat dobije svoju, ili označi **Spoji sve bafere u jedan oblik** da ih spojiš.

Zaobljeni dijelovi su ravne linije povučene unutar prave krivine, pa je bafer malo manji od tačnog kruga: oko 0.6 % po površini pri normalnoj postavci, 0.16 % pri Fino. Koristi Fino za sve što ćeš mjeriti.

## Preklapanje

| Alat | Šta dobijaš |
|---|---|
| Presjek | Dijelovi gdje se ulazni sloj sastaje sa poligonima preklapanja, svaki sa poljima oba sloja. Linije i tačke se isijecaju po poligonima. |
| Unija | Oba poligonska sloja presječena po ivicama jedan drugog: zajednički dijelovi nose polja oba sloja, ostali nose polja jednog sloja (polja drugog su prazna). |
| Izuzmi | Ulazni poligoni bez poligona preklapanja. Polja ostaju uz ulazni sloj. Objekat potpuno izuzet se izostavlja (panel ih broji). |
| Rastopi | Spaja poligone koji se dodiruju ili preklapaju, svi zajedno ili jedan oblik za svaku vrijednost polja. Dodaje `COUNT` i `AREA`. |

Ime polja koje oba sloja imaju zadržava se za prvi sloj, a drugi sloj ga dobija sa `_2`. Objekti unutar jednog sloja ne bi se trebali preklapati jedni s drugima: gdje se preklapaju, unija ih broji u oba.

## Spajanje

Prostorno spajanje kopira atribute iz **izvornog** sloja na svaki **ciljni** objekat koji ga dodiruje, i daje novi sloj sa oblicima ciljnih objekata. Biraš kad se sastaju: dodiruju se ili preklapaju, ciljni leži unutar izvornog poligona, ciljni sadrži izvorni objekat, najbliži izvorni objekat (uz opcionalno ograničenje) ili bilo koji izvorni objekat unutar zadate udaljenosti.

Kad se podudari više izvornih objekata, uzimaš atribute prvog (najbližeg, kod spajanja po najbližem i po udaljenosti; dodaje se `DISTANCE`), ili ih **prebrojiš i saberi im numerička polja**: `COUNT`, i `SUM_`, `MEAN_`, `MIN_`, `MAX_` za svako numeričko polje. Odznači **Zadrži ciljne objekte koji nisu našli podudaranje** da ih izostaviš. Spojena polja su prazna gdje ništa nije pronađeno, a panel broji nepodudarne.

## Odabir

Upiši pitanje o atributima ili obliku, pritisni **Odaberi**, i objekti se prikazuju na planu sa brojem, tabelom i ukupnom površinom, dužinom ili brojem. Zatim od njih napravi zaseban sloj, zumiraj na njih ili poništi odabir.

| Možeš napisati | Primjer |
|---|---|
| Polje po imenu; koristi "navodnike" ili [uglaste zagrade] ako ime ima razmake | `VALUE`, `"Lot Number"` |
| Brojeve, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst ne razlikuje velika i mala slova; u `like`, `%` je bilo koji niz, a `_` jedno slovo) | `Notes contains 'corner'` |
| `is null`, `is not null` (prazna vrijednost se računa kao null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` i zagrade | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vrijednosti oblika `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pitanje koje je nepotpuno ili imenuje polje koje sloj nema biće odbijeno, uz rečenicu koja kaže gdje je greška.

## Mjerenje

Prikazuje ukupnu površinu i obim, dužinu ili broj objekata sloja, i **dodaje polja** u njega: `AREA` i `PERIMETER` za poligone, `LENGTH` za linije (dužina na planu), `X` i `Y` za tačke. Polje koje već postoji se nikad ne prepisuje: novo se zove `AREA_2`. Ovo je jedan korak poništavanja. **Statistika** daje broj, zbir, prosjek, minimum i maksimum numeričkog polja, po želji za svaku vrijednost drugog polja.

:::note
Provjere iza ovih alata ručno su urađene u testu (`node bin/test-civilcraft-gisanalysis.mjs`): na primjer, parcele 100 po 100 ispod zone 100 po 80 presijecaju se u 3,000 plus 3,000, a linija dužine 100 baferovana za 10 je 2,000 plus krug.
:::
