---
title: Analiziranje GIS-slojev
summary: Pas okoli, prekrivanje (presek, unija, izbris, raztopitev), prostorsko združevanje, izbor po atributu in merjenje GIS-slojev v projektu, vsak kot nov sloj, ki ga lahko razveljavite.
keywords: gis, analiza, pas okoli, buffer, prekrivanje, presek, unija, izbris, odrez, raztopitev, prostorsko združevanje, združevanje, izbor po atributu, poizvedba, pogoj, izraz, statistika, površina, dolžina, obseg, merjenje, parcele, služnost, zamik od meje, shapefile, geopackage, tabela atributov
from: a6b2d3f9
---

Ko ima projekt GIS-sloje (glejte [Uvoz podatkov GIS](topic:gis-import)), gumb **Analiziraj** v skupini GIS (vpisan kot `GISANALYSIS`, `ANALYZE` ali `BUFFER`) odpre podokno s petimi zavihki. Ostane odprto ob načrtu, zato je vse, kar izberete, izrisano na načrtu med delom.

Vsako orodje, ki kaj ustvari, **doda nov sloj** in pusti sloje, iz katerih je bral, točno take, kot so bili. Vsako dejanje je en korak razveljavitve: {{ui:Razveljavi}} v podoknu (ali Ctrl+Z) odstrani novi sloj. Rezultat izvozite kot kateri koli sloj z [Izvoz podatkov o stanju po izvedbi za GIS](topic:gis-export) v shapefile, GeoJSON ali GeoPackage.

Celotna tabela sloja z razvrščanjem, urejanjem in računalom polj je v [Delo s tabelo atributov sloja](topic:gis-table); barvanje glede na polje je v [Obarvanje sloja glede na atribut](topic:gis-symbology).

Vse se obdeluje na načrtu, v enotah projekta (feet ali metri). Projekt je vedno v projiciranem ali lokalnem sistemu, zato razdalja 50 pomeni 50 feet ali 50 metrov, nikoli stopinj. Višine (z) se v rezultatih ne ohranijo.

## Pas okoli (buffer)

Nariše območje določene razdalje okoli vsake značilnice kot nov poligonski sloj. Točke postanejo krogi, črte koridorji z zaobljenima koncema, poligoni se povečajo. **Negativna** razdalja poligone skrči (kvadrat 100 krat 100, skrčen za 5, je 90 krat 90; skrčen za 60, ne ostane nič in podokno to pove). Razdaljo vzemite iz številskega polja, da dobi vsaka značilnica svojo, ali označite **Združi vse pasove v eno obliko**, da se raztopijo.

Zaobljeni deli so narisani kot ravni odseki znotraj prave krivulje, zato je pas malenkost manjši od natančnega kroga: približno 0.6 % površine pri običajni nastavitvi, 0.16 % pri Fino. Za vse, kar boste merili, uporabite Fino.

## Prekrivanje

| Orodje | Kaj dobite |
|---|---|
| Presek | Kosi, kjer vhodni sloj seka poligone prekrivanja, vsak z polji obeh slojev. Črte in točke so odrezane na poligone. |
| Unija | Oba poligonska sloja sta razrezana po robovih drug drugega: skupni kosi imajo polja obeh slojev, preostali pa polja enega sloja (polja drugega so prazna). |
| Izbris | Vhodni poligoni brez poligonov prekrivanja. Polja ostanejo pri vhodnem sloju. Značilnica, izbrisana v celoti, je izpuščena (podokno jih šteje). |
| Raztopitev | Združi poligone, ki se dotikajo ali prekrivajo, vse skupaj ali eno obliko za vsako vrednost polja. Doda `COUNT` in `AREA`. |

Ime polja, ki ga imata oba sloja, ostane pri prvem sloju, drugega pa se zapiše z `_2`. Značilnice znotraj enega sloja se ne bi smele prekrivati: kjer se, unija prešteje prekrivanje v obeh.

## Prostorsko združevanje

Prostorsko združevanje kopira atribute iz **vira** sloja na vsako **ciljno** značilnico, ki ga seka, in da nov sloj z oblikami cilja. Izberite, kdaj se stikata: dotikata ali prekrivata se, cilj leži znotraj poligona vira, cilj vsebuje značilnico vira, najbližja značilnica vira (z možno mejo) ali katera koli značilnica vira v dani razdalji.

Če se ujema več značilnic vira, vzamete atribute prve (najbližje, pri združevanjih z najbližjo ali razdaljo; doda se `DISTANCE`), ali **jih preštejete in seštejete njihova številska polja**: `COUNT` ter `SUM_`, `MEAN_`, `MIN_`, `MAX_` za vsako številsko polje. Odznačite **Ohrani ciljne značilnice, ki niso našle ujemanja**, če jih želite izpustiti. Združena polja so prazna tam, kjer ujemanja ni, podokno pa šteje neujemajoče.

## Izbor

Vpišite vprašanje o atributih ali obliki, pritisnite **Izberi**, značilnice se narišejo na načrtu s svojim številom, tabelo in skupno površino, dolžino ali številom. Nato jih lahko spremenite v lasten sloj, povečate nanje ali prekličete izbor.

| Lahko zapišete | Primer |
|---|---|
| Polje po imenu; če ime vsebuje presledke, uporabite „narekovaje“ ali [oglate oklepaje] | `VALUE`, `"Lot Number"` |
| Števila, 'besedilo', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (besedilo ne upošteva velikosti črk; pri `like` je `%` poljubni niz in `_` ena črka) | `Notes contains 'corner'` |
| `is null`, `is not null` (prazna vrednost šteje kot null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` in oklepaji | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Vrednosti oblike `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Vprašanje, ki je nepopolno ali navaja polje, ki ga sloj nima, je zavrnjeno s stavkom, ki pove, kje je težava.

## Merjenje

Pokaže skupno površino in obseg, dolžino ali število sloja ter **doda polja** vanj: `AREA` in `PERIMETER` za poligone, `LENGTH` za črte (dolžina na načrtu), `X` in `Y` za točke. Polje, ki že obstaja, nikoli ni prepisano: novo se imenuje `AREA_2`. To je en korak razveljavitve. **Statistika** poda število, vsoto, povprečje, najmanjšo in največjo vrednost številskega polja, po želji za vsako vrednost drugega polja.

:::note
Preverjanja za ta orodja so ročno izračunana v testu (`node bin/test-civilcraft-gisanalysis.mjs`): na primer parcele 100 krat 100 pod območjem 100 krat 80 se sekajo v 3,000 plus 3,000, črta dolžine 100, obdana s pasom 10, pa meri 2,000 plus krog.
:::
