---
title: Analiza GIS slojeva
summary: Bafer, preklapanje (presek, unija, brisanje, stapanje), prostorno spajanje, izbor po atributu i merenje GIS slojeva u projektu, svaki kao novi sloj koji možete opozvati.
keywords: gis, analiza, bafer, preklapanje, presek, unija, brisanje, stapanje, prostorno spajanje, spajanje, izbor po atributu, upit, uslov, izraz, statistika, površina, dužina, obim, merenje, parcele, služnost, odstupanje, shapefile, geopackage, tabela atributa
from: a6b2d3f9
---

Kada projekat ima GIS slojeve (vidi [Uvoz GIS podataka](topic:gis-import)), dugme **Analiziraj** u grupi GIS (kuca se `GISANALYSIS`, `ANALYZE` ili `BUFFER`) otvara panel sa pet kartica. Ostaje otvoren pored osnove, pa se ono što izaberete crta na osnovi dok radite.

Svaki alat koji nešto pravi **dodaje novi sloj** i ostavlja slojeve koje je čitao potpuno nepromenjene. Svaki je jedan korak opozivanja: {{ui:Opozovi}} u panelu (ili Ctrl+Z) uklanja novi sloj. Rezultat izvezite kao i svaki sloj pomoću [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export), kao shapefile, GeoJSON ili GeoPackage.

Potpunu tabelu sloja, sa sortiranjem, izmenom vrednosti i kalkulatorom polja, opisuje [Rad sa tabelom atributa sloja](topic:gis-table). Bojenje po polju opisano je u [Stilizovanje sloja po atributu](topic:gis-symbology).

Sve se radi u osnovi, u jedinicama projekta (stope ili metri). Projekat je uvek u projektovanom ili lokalnom sistemu, pa rastojanje 50 znači 50 stopa ili 50 metara, nikad stepene. Visine (z) se u rezultatima ne čuvaju.

## Bafer

Crta zonu zadatog rastojanja oko svakog objekta, kao novi poligonski sloj. Tačke postaju krugovi, linije postaju koridori sa zaobljenim krajevima, a poligoni se šire. **Negativno** rastojanje sužava poligone (kvadrat 100 × 100 sužen za 5 postaje 90 × 90; sužen za 60 ne ostaje ništa, i panel to kaže). Uzmite rastojanje iz brojčanog polja da svaki objekat dobije svoje, ili označite **Spoji sve bafere u jedan oblik** da ih stopite.

Zaobljeni delovi su prave dužine nacrtane unutar prave krive, pa je bafer malo manji od tačnog kruga: oko 0,6 % po površini pri normalnoj postavci, a 0,16 % pri Fino. Koristite Fino za sve što ćete meriti.

## Preklapanje

| Alat | Šta dobijate |
|---|---|
| Presek | Delovi u kojima ulazni sloj seče poligone preklapanja, svaki sa poljima oba sloja. Linije i tačke se seku po poligonima. |
| Unija | Oba poligonska sloja presečena po ivicama jedan drugog: zajednički delovi nose polja oba sloja, ostali nose polja jednog sloja (polja drugog su prazna). |
| Brisanje | Ulazni poligoni bez poligona preklapanja. Polja ostaju uz ulaz. Objekat koji je potpuno obrisan izostavlja se (panel ih broji). |
| Stapanje | Spaja poligone koji se dodiruju ili preklapaju, svi zajedno ili jedan oblik za svaku vrednost polja. Dodaje `COUNT` i `AREA`. |

Naziv polja koji postoji u oba sloja zadržava se za prvi sloj, a onaj iz drugog sloja upisuje se sa `_2`. Objekti unutar jednog sloja ne bi trebalo da se preklapaju: tamo gde se preklapaju, unija broji preklapanje u oba sloja.

## Spajanje

Prostorno spajanje kopira atribute iz **izvornog** sloja na svaki **ciljni** objekat koji ga dodiruje, i daje novi sloj sa oblicima ciljnog. Birate kada se objekti susreću: kada se dodiruju ili preklapaju, kada je ciljni unutar izvornog poligona, kada ciljni sadrži izvorni objekat, kada je najbliži izvorni objekat (uz opcioni limit) ili kada je bilo koji izvorni objekat unutar zadatog rastojanja.

Kada se poklopi više izvornih objekata, uzima se atribut prvog (najbližeg, kod spajanja po najbližem i po rastojanju; dodaje se `DISTANCE`), ili se **prebrojavaju i saberu se njihova brojčana polja**: `COUNT`, a `SUM_`, `MEAN_`, `MIN_`, `MAX_` za svako brojčano polje. Isključite **Zadrži ciljne objekte bez poklapanja** da ih izostavite. Spojena polja su prazna tamo gde se ništa nije poklopilo, a panel broji neuparene.

## Izbor

Ukucajte pitanje o atributima ili obliku, pritisnite **Izaberi**, i objekti se crtaju na osnovi sa brojem, tabelom i ukupnom površinom, dužinom ili brojem. Zatim od njih napravite sopstveni sloj, zumirajte na njih ili poništite izbor.

| Možete napisati | Primer |
|---|---|
| Polje po nazivu; koristite "navodnike" ili [uglaste zagrade] ako naziv ima razmake | `VALUE`, `"Lot Number"` |
| Brojeve, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst ne razlikuje velika i mala slova; u `like`, `%` je bilo koji niz, a `_` jedno slovo) | `Notes contains 'corner'` |
| `is null`, `is not null` (prazna vrednost računa se kao null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` i zagrade | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vrednosti oblika `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pitanje koje je nepotpuno ili imenuje polje koje sloj nema biće odbijeno, uz rečenicu koja kaže gde je problem.

## Merenje

Prikazuje ukupnu površinu i obim, dužinu ili broj sloja, i **dodaje polja** u njega: `AREA` i `PERIMETER` za poligone, `LENGTH` za linije (dužina na osnovi), `X` i `Y` za tačke. Postojeće polje se nikad ne menja: novo se zove `AREA_2`. Ovo je jedan korak opozivanja. **Statistika** daje broj, zbir, srednju vrednost, najmanju i najveću vrednost brojčanog polja, po želji za svaku vrednost drugog polja.

:::note
Provere iza ovih alata ručno su urađene u testu (`node bin/test-civilcraft-gisanalysis.mjs`): na primer, parcele 100 × 100 ispod zone 100 × 80 seku se u 3,000 plus 3,000, a linija dužine 100 sa baferom 10 je 2,000 plus krug.
:::
