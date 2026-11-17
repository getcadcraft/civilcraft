---
title: Delo s tabelo atributov sloja
summary: Oglejte si vsako značilnico sloja GIS kot tabelo, razvrščajte in filtrirajte jo, izbirajte vrstice in značilnice skupaj, popravljajte vrednosti, dodajajte polja, računajte nove vrednosti in shranite tabelo kot CSV.
keywords: tabela atributov, tabela, polja, stolpci, vrstice, razvrščanje, filter, izraz, izbor, urejanje, računalo polj, izračun, dodaj polje, preimenuj polje, odstrani polje, csv, izvoz, gis, shapefile, geopackage, simbologija
from: fd9d6c11
---

Odprite tabelo sloja iz menija **tri pike** v seznamu GIS-slojev ({{ui:Tabela atributov…}}), iz Površje › Več › {{ui:Tabela atributov}} ali z vpisom `ATTRIBUTES`, `ATTTABLE` ali `TABLE`. Tabela se odpre ob načrtu in ostane odprta med delom. Izrisane so samo vidne vrstice, zato se sloj s tisoči značilnic odpre in pomika hitro.

## Razvrščanje, filtriranje in izbor

- **Razvrščanje:** kliknite naslov stolpca. Drugi klik obrne vrstni red, tretji vrne vrstni red iz datoteke. Prazne vrednosti vedno ostanejo spodaj. Razvrščanje spremeni samo to, kar vidite, nikoli sloja.
- **Filter:** vpišite v polje za filter. Izraz, kot je `AREA > 500 and USE = 'Res'`, obdrži vrstice, kjer velja (iste besede kot na zavihku Izbor v [Analiziranje GIS-slojev](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Vse, kar ni izraz, kot je `oak maple`, išče te besede v vsakem stolpcu.
- **Izbor vrstic:** kliknite vrstico. Ctrl+klik doda ali odstrani eno, Shift+klik izbere zaporedje, {{ui:Izberi prikazane vrstice}} pa vzame vsako vrstico, ki prestane filter. Izbrane značilnice so izrisane na načrtu, klik na značilnico na načrtu pa izbere njeno vrstico tukaj.
- Z izbranimi vrsticami lahko uporabite {{ui:Povečava}} nanje, naredite **sloj iz izbora** in preberete skupno površino ali dolžino v vrstici stanja.

## Popravljanje vrednosti

Dvakrat kliknite celico (ali se s puščičnimi tipkami premaknite do nje in pritisnite Enter), vpišite novo vrednost in pritisnite Enter. Escape pusti vse, kot je bilo. Vrednost mora ustrezati stolpcu: števila kot števila, datumi kot `YYYY-MM-DD`, da/ne kot yes, no, true ali false. Vrednost, ki ne ustreza, je zavrnjena s stavkom, in nič se ne spremeni. Prazno polje pomeni prazno vrednost. Vsak popravek je en korak razveljavitve: {{ui:Razveljavi}} in {{ui:Uveljavi}} sta na dnu tabele, Ctrl+Z pa deluje na načrtu.

## Polja

Pod **Polja** lahko dodate polje (besedilo, število, datum ali da/ne), preimenujete ali odstranite polje. Novo polje je prazno. Preimenovanje se prenese: polje oznake in [slog glede na atribut](topic:gis-symbology) sloja se premaknejo na novo ime, odstranitev polja pa odstrani oznako in slog, ki ga je uporabljal. Vsako dejanje je en korak razveljavitve, ki vse vrne.

## Računalo polj

Zapiše vrednost v vsako vrstico (ali samo v izbrane vrstice) iz drugih polj vrstice, njene geometrije in nekaj funkcij. Izberite obstoječe polje ali **Novo polje …** in mu dajte ime in tip. Nič se ne zažene kot koda: izraz prebere majhen razčlenjevalnik s fiksnim seznamom funkcij.

| Skupina | Besede |
|---|---|
| Števila | `+ - * /`, oklepaji, `abs round(x, digits) floor ceil sqrt pow min max` |
| Besedilo | `upper lower trim len substr(text, from, count) left right replace concat` (besedilo gre v 'enojne narekovaje'; ime polja s presledki gre v „dvojne narekovaje“ ali [oglate oklepaje]) |
| Izbiranje | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Datumi | `year month day` vrednosti `YYYY-MM-DD` |
| Geometrija | `$area $perimeter $length $x $y $vertices`, v enotah projekta |

Rezultat, ki ga ni mogoče shraniti v tipu polja (besedilo v številskem polju), ostane prazen in je preštet v sporočilu. Deljenje z nič da prazno vrednost. Na primer `round($area / 43560, 2)` zapiše akre iz kvadratnih čevljev.

## Izvoz

{{ui:Izvozi CSV}} shrani vrstice, ki jih vidite (po filtru in razvrščanju), kot datoteko CSV v UTF-8 z imeni polj v prvi vrstici. Besedilo, ki se začne z `=`, `+`, `-` ali `@`, dobi vodilni apostrof, da preglednica ne zažene kot formule. Za shranjevanje samega sloja uporabite [Izvoz podatkov o stanju po izvedbi za GIS](topic:gis-export).

## Omejitve

Tabela prikaže sloj v enem vrstnem redu razvrščanja in enem filtru naenkrat. Vrstic tukaj ni mogoče dodajati ali brisati (naredite nov sloj iz izbora), geometrija se ne ureja, tip polja pa po nastanku ne more biti spremenjen.
