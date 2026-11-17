---
title: Analiziraj GIS slojeve
summary: Puferiranje, preklapanje (presjek, unija, oduzimanje, stapanje), prostorno spajanje, odabir prema atributu i mjerenje GIS slojeva u projektu, svaki kao novi sloj koji možete poništiti.
keywords: gis, analiza, puferiranje, preklapanje, presjek, unija, oduzimanje, odsijecanje, stapanje, prostorno spajanje, spajanje, odabir prema atributu, upit, where, izraz, statistika, površina, duljina, opseg, mjerenje, parcele, služnost, udaljenost od građevinske linije, shapefile, geopackage, tablica atributa
from: a6b2d3f9
---

Kad projekt ima GIS slojeve (vidi [Uvoz GIS podataka](topic:gis-import)), gumb **Analiziraj** u grupi GIS (upisuje se `GISANALYSIS`, `ANALYZE` ili `BUFFER`) otvara ploču s pet kartica. Ona ostaje otvorena uz tlocrt, pa se ono što odaberete crta na tlocrtu dok radite.

Svaki alat koji nešto stvara **dodaje novi sloj** i ostavlja slojeve koje čita potpuno nepromijenjenima. Svaki je jedan korak poništavanja: {{ui:Poništi}} na ploči (ili Ctrl+Z) uklanja novi sloj. Rezultat izvezite kao i svaki sloj pomoću [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export) kao shapefile, GeoJSON ili GeoPackage.

Puna tablica sloja, sa sortiranjem, uređivanjem i kalkulatorom polja, opisana je u [Rad s tablicom atributa sloja](topic:gis-table); bojanje prema polju u [Oblikovanje sloja prema atributu](topic:gis-symbology).

Sve se radi u tlocrtu, u jedinicama projekta (stope ili metri). Projekt je uvijek u projiciranom ili lokalnom sustavu, pa udaljenost 50 znači 50 stopa ili 50 metara, nikad stupnjeve. Visine (z) se u rezultatima ne čuvaju.

## Puferiranje

Crta zonu zadane udaljenosti oko svake značajke, kao novi poligonski sloj. Točke postaju kružnice, linije postaju koridori sa zaobljenim krajevima, a poligoni se šire. **Negativna** udaljenost sužava poligone (kvadrat 100 × 100 sužen za 5 ima 90 × 90; sužen za 60 ne ostaje ništa, o čemu ploča javlja). Udaljenost uzmite iz brojčanog polja da svaka značajka dobije svoju, ili označite **Spoji sve puferske zone u jedan oblik** da ih stopite.

Zaobljeni dijelovi su ravni dijelovi nacrtani unutar stvarne krivulje, pa je puferska zona nešto manja od točne kružnice: oko 0.6 % u površini pri uobičajenoj postavci, a 0.16 % pri postavci Fino. Za sve što ćete mjeriti koristite Fino.

## Preklapanje

| Alat | Što dobivate |
|---|---|
| Presjek | Dijelovi u kojima ulazni sloj susreće poligone preklapanja, svaki s poljima oba sloja. Linije i točke se odsijecaju na poligonima. |
| Unija | Oba poligonska sloja izrezana su duž rubova jedan drugoga: zajednički dijelovi nose polja oba sloja, a ostali nose polja jednog sloja (polja drugoga su prazna). |
| Oduzimanje | Ulazni poligoni bez poligona preklapanja. Polja ostaju uz ulazni sloj. Značajka potpuno oduzeta izostavlja se (ploča ih broji). |
| Stapanje | Spaja poligone koji se dodiruju ili preklapaju, svi zajedno ili jedan oblik za svaku vrijednost polja. Dodaje `COUNT` i `AREA`. |

Naziv polja koje oba sloja imaju zadržava se za prvi sloj, a polje drugoga sloja zapisuje se s `_2`. Značajke unutar jednog sloja ne bi se trebale preklapati: gdje se preklapaju, unija ih broji u oba sloja.

## Spajanje

Prostorno spajanje kopira atribute iz **izvornog** sloja na svaku **ciljnu** značajku koja ga dotiče i daje novi sloj s oblicima ciljne značajke. Odaberite kada se susreću: dodiruju se ili preklapaju, ciljna leži unutar izvornog poligona, ciljna sadrži izvornu značajku, najbliža izvorna značajka (uz neobavezno ograničenje) ili bilo koja izvorna značajka unutar zadane udaljenosti.

Kad se podudara više izvornih značajki, uzimaju se atributi prve (najbliže, za spajanja po najbližoj i po udaljenosti; dodaje se `DISTANCE`), ili se **prebrojavaju i zbrajaju njihova brojčana polja**: `COUNT`, te `SUM_`, `MEAN_`, `MIN_`, `MAX_` za svako brojčano polje. Isključite **Zadrži ciljne značajke koje nisu pronašle podudaranje** da ih izostavite. Spojena polja su prazna tamo gdje ništa nije pronađeno, a ploča broji nepodudarne.

## Odabir

Upišite pitanje o atributima ili obliku, pritisnite **Odaberi**, i značajke se crtaju na tlocrtu s brojem, tablicom i ukupnom površinom, duljinom ili brojem. Zatim od njih napravite zaseban sloj, zumirajte na njih ili poništite odabir.

| Možete napisati | Primjer |
|---|---|
| Polje po imenu; upotrijebite "navodnike" ili [uglate zagrade] ako ime ima razmake | `VALUE`, `"Lot Number"` |
| Brojevi, 'tekst', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (tekst ne razlikuje velika i mala slova; u `like`, `%` je bilo koji niz, a `_` jedno slovo) | `Notes contains 'corner'` |
| `is null`, `is not null` (prazna vrijednost broji se kao null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` i zagrade | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vrijednosti oblika `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pitanje koje je nepotpuno ili navodi polje koje sloj nema odbija se rečenicom koja kaže gdje je problem.

## Mjerenje

Prikazuje ukupnu površinu i opseg, duljinu ili broj sloja te **dodaje polja** u njega: `AREA` i `PERIMETER` za poligone, `LENGTH` za linije (duljina u tlocrtu), `X` i `Y` za točke. Postojeće polje se nikad ne prepisuje: novo se zove `AREA_2`. Ovo je jedan korak poništavanja. **Statistika** daje broj, zbroj, srednju vrijednost, najmanju i najveću vrijednost brojčanog polja, po izboru za svaku vrijednost drugog polja.

:::note
Provjere iza ovih alata ručno se izvode u testu (`node bin/test-civilcraft-gisanalysis.mjs`): primjerice, parcele 100 × 100 pod zonom 100 × 80 presijecaju se u 3,000 plus 3,000, a linija duga 100 puferirana za 10 ima 2,000 plus kružnicu.
:::
