---
title: Referenca trake alatki
summary: Svako dugme na traci alatki u CivilCraft-u, šta radi, njegova prečica, i kada je zasivljeno ili odbija da radi.
keywords: traka alatki, dugmad, komande, alatke, datoteka, izvoz, teren, projektovanje, uređivanje, prikaz, meni
from: 4c4352bc
---

Traka alatki ide preko vrha aplikacije u sedam grupa. Svako dugme prikazuje svoj opis i prečicu kada pređete mišem preko njega.

## Datoteka

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:New}} | nema | Pokreće prazan projekat. Prvo pita ako ima nesačuvanih izmena. |
| {{ui:Open}} | {{key:Mod+O}} | Otvara datoteku tačaka (CSV, TXT), LandXML ili CivilCraft projekat. |
| {{ui:Save}} | {{key:Mod+S}} | Preuzima projekat kao `<name>.civilcraft.json`. |

## Izvoz

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:LandXML}} | nema | Preuzima `<name>.xml`: tačke, površine, trase, profile i mrežu cevi kao LandXML 1.2. "Još nema ničega za izvoz." kada je projekat prazan. |
| {{ui:DXF}} | nema | Preuzima `<name>.dxf`: linije plana kao R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Otvara **Iscrtaj plan u PDF**. "Još nema ničega za iscrtavanje." kada je projekat prazan. |

## Teren

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Kliknite geodetske tačke redom, {{key:Enter}} za kraj. Linija loma preuzima kote tačaka. |
| {{ui:Boundary}} | {{key:O}} | Kliknite ćoškove spoljne granice, {{key:Enter}} za kraj. Zamenjuje svaku granicu. |

Oba kažu "Još nema površine: prvo otvorite geodetske tačke." kada nema površine.

## Projektovanje

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Kliknite PI tačke redom, {{key:Enter}} za kraj. |
| {{ui:Pad}} | {{key:G}} | Kliknite ćoškove platoa, {{key:Enter}} za kraj. Kao i alati za površinu, upozorava kada nema površine; plato se nivelira samo na njoj. |
| {{ui:Pipes}} | {{key:P}} | Kliknite objekte od uzvodnog ka nizvodnom (kliknite postojeći da mu se pridružite), {{key:Enter}} za kraj. |
| {{ui:Profile}} | {{key:R}} | Prikazuje ili skriva prikaz profila ispod plana. |

## Uređivanje

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Opoziva poslednju promenu (do 200). Zasivljeno kada nema šta da se opozove. |
| {{ui:Redo}} | {{key:Mod+Y}} | Ponavlja ono što je opozvano. Zasivljeno kada nema šta da se ponovi. |
| {{ui:Copy}} | {{key:Mod+C}} | Kopira izabrane geodetske tačke i stavlja ih u ostavu kao redove tačaka koje tabelarna aplikacija može da primi. Zasivljeno dok tačke nisu izabrane. |
| {{ui:Paste}} | {{key:Mod+V}} | Nalepljuje tačke: prate pokazivač, a klik ih spušta sa brojevima koje nijedna druga tačka nema. Redovi tačaka kopirani u tabelarnoj aplikaciji takođe se nalepljuju. |
| {{ui:More}} | nema | Otvara meni ispod. |

Meni {{ui:More}}:

| Stavka | Prečica | Šta radi |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Kopira izabrane tačke i briše ih (jedan korak opozivanja). |
| {{ui:Copy}} | {{key:Mod+C}} | Kao dugme {{ui:Copy}}. |
| {{ui:Paste}} | {{key:Mod+V}} | Kao dugme {{ui:Paste}}. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Nalepljuje tačke na njihovim sopstvenim koordinatama, sa brojevima koje nijedna druga tačka nema. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Kopija izabranih tačaka prati pokazivač; kliknite gde ide. Ostava ostaje netaknuta. |
| {{ui:Delete}} | {{key:Delete}} | Briše izabrane geodetske tačke, ili izabranu trasu, plato, objekat (sa njegovim cevima), cev ili PVI. |
| {{ui:Select all points}} | {{key:Mod+A}} | Bira svaku geodetsku tačku. |
| {{ui:Select none}} | {{key:Esc}} | Briše izbor. |

Stavka koja ne može da deluje u datom trenutku je zasivljena, a njen opis kaže zašto. Detalji: [Izaberi, kopiraj i nalepi geodetske tačke](topic:copy-paste-points).

Opozivanje obuhvata izmene projektovanja, podešavanja površine i geodetske tačke (nalepljivanje, sečenje, dupliranje, brisanje). Ne obuhvata podešavanja prikaza, a otvaranje ili uvoz bilo koje datoteke ga briše.

## GIS

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:Coordinates}} | nema | Otvara dijalog **Koordinatni sistem**: recite u kom je sistemu projekat, ili koristite terenske ili lokalne koordinate. Videti [Podesi koordinatni sistem projekta](topic:coordinate-systems) i [Terenske i lokalne koordinate](topic:ground-and-local-coordinates). |
| {{ui:Import}} | nema | Uvozi GIS podatke: shapefile, GeoJSON, GeoPackage, mreže kota i LiDAR. Videti [Uvoz GIS podataka](topic:gis-import). |
| {{ui:Export}} | nema | Izvozi podatke o izvedenom stanju za GIS odeljenje. Videti [Izvoz podataka o izvedenom stanju za GIS](topic:gis-export). |
| {{ui:Analyze}} | nema | Otvara panel GIS analize: bafer, preklapanje, prostorno spajanje, izbor po atributu, merenje. Videti [Analiza GIS slojeva](topic:gis-analysis). |
| {{ui:Attribute table}} | nema | U Teren › Više. Otvara tabelu atributa GIS sloja: sortiranje, filtriranje, izbor, izmena, dodavanje polja, računanje, čuvanje kao CSV. Videti [Rad sa tabelom atributa sloja](topic:gis-table). |
| {{ui:Map}} | nema | Otvara dijalog **Slojevi karte**: georeferencirana slika ili serveri karata koje dodate, iscrtani ispod plana. Videti [Prikaz slojeva karte ispod plana](topic:map-layers). |

Alati za GIS se učitavaju prvi put kada upotrebite jedno od ovih dugmadi, otvorite GIS datoteku ili otvorite projekat koji ima koordinatni sistem ili GIS slojeve.

## Prikaz

| Dugme | Prečica | Šta radi |
|---|---|---|
| {{ui:Select}} | {{key:V}} ili {{key:Esc}} | Kliknite da izaberete trase, platoe, objekte, cevi i tačke ({{key:Shift}} i klik ili prevlačenje dodaje tačke); prevucite hvataljke da pomerite PI tačke, ćoškove platoa i objekte. |
| {{ui:Fit}} | {{key:F}} | Uvećava plan da prikaže površinu, tačke, trase i platoe (u 3D prikazu: prikazuje sve). |
| {{ui:3D}} | {{key:D}} | Prikazuje lokaciju u 3D preko plana, ili se vraća na plan. Traka iznad 3D prikaza podešava pogled, preterivanje, bojenje i šta se prikazuje, i izvozi GLB ili OBJ. Videti [Pregled lokacije u 3D](topic:site-3d). |

## Dugmad na pločama

| Dugme | Gde | Šta radi |
|---|---|---|
| {{ui:Open the sample site}} | Kutija na praznom planu | Učitava primer geodetskog snimka (potrebna je veza, osim ako je CivilCraft sačuvan za rad van mreže) |
| {{ui:Remove the boundary}} | Leva ploča, Teren | Uklanja spoljnu granicu |
| {{ui:Remove drawn breaklines}} | Leva ploča, Teren | Uklanja svaku liniju loma nacrtanu alatom (ne grupe linija loma) |
| {{ui:Rebuild the surface from the points}} | Leva ploča, Teren (samo površina iz LandXML-a) | Odbacuje LandXML TIN i gradi iz tačaka; ne može se opozvati |
| {{ui:Start from the ground}} | Desna ploča, Trasa | Počinje projektovani profil sa PVI na terenu na svakom kraju |
| {{ui:Profile view}} | Desna ploča, Trasa | Otvara prikaz profila za ovu trasu |
| {{ui:Add PVIs}} | Traka profila | Dok je pritisnuto, klik u profilu dodaje PVI |
| {{ui:Set every invert from the rules}} | Desna ploča, Mreža cevi | Postavlja dna svake cevi prema pravilima |
| {{ui:Set its inverts from the rules}} | Desna ploča, Cev | Postavlja dna ove cevi prema pravilima |
