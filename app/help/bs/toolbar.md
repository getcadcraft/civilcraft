---
title: Referenca za traku alata
summary: Svako dugme na traci alata u programu CivilCraft, šta radi, njegova tipka i kada je zasivljeno ili odbija rad.
keywords: traka alata, dugmad, naredbe, alati, datoteka, izvoz, površina, projektovanje, uređivanje, pogled, meni, GIS
from: 4c4352bc
---

Traka alata ide preko vrha programa u sedam grupa. Svako dugme pokazuje svoj savjet i tipku kada pređete mišem preko njega.

## Datoteka

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Novo}} | nema | Počinje prazan projekat. Prvo pita ako ima nesačuvanih promjena. |
| {{ui:Otvori}} | {{key:Mod+O}} | Otvara datoteku tačaka (CSV, TXT), LandXML ili projekat programa CivilCraft. |
| {{ui:Spasi}} | {{key:Mod+S}} | Preuzima projekat kao `<name>.civilcraft.json`. |

## Izvoz

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:LandXML}} | nema | Preuzima `<name>.xml`: tačke, površine, trase, profile i mrežu cijevi kao LandXML 1.2. „Još nema ničega za izvoz.“ kada je projekat prazan. |
| {{ui:DXF}} | nema | Preuzima `<name>.dxf`: linije plana kao R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Otvara **Iscrtaj plan u PDF**. „Još nema ničega za iscrtavanje.“ kada je projekat prazan. |

## Površina

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Prelomna linija}} | {{key:B}} | Klikni geodetske tačke redom, {{key:Enter}} za završetak. Prelomna linija preuzima kote tačaka. |
| {{ui:Granica}} | {{key:O}} | Klikni uglove vanjske granice, {{key:Enter}} za završetak. Zamjenjuje svaku granicu. |

Oba kažu „Još nema površine: prvo otvorite geodetske tačke.“ kada nema površine.

## Projektovanje

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Trasa}} | {{key:A}} | Klikni PI-jeve redom, {{key:Enter}} za završetak. |
| {{ui:Plato}} | {{key:G}} | Klikni uglove plata, {{key:Enter}} za završetak. Kao i alati za površinu, upozorava kada nema površine; plato se nivelira samo na njoj. |
| {{ui:Cijevi}} | {{key:P}} | Klikni objekte od uzvodno nizvodno (klikni postojeći da se pridružiš), {{key:Enter}} za završetak. |
| {{ui:Uzdužni profil}} | {{key:R}} | Prikazuje ili skriva prikaz profila ispod plana. |

## Uređivanje

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Poništi}} | {{key:Mod+Z}} | Poništava posljednju promjenu (do 200). Zasivljeno kada nema šta poništiti. |
| {{ui:Ponovi}} | {{key:Mod+Y}} | Ponavlja ono što je poništeno. Zasivljeno kada nema šta ponoviti. |
| {{ui:Kopiraj}} | {{key:Mod+C}} | Kopira odabrane geodetske tačke i stavlja ih u međuspremnik kao redove tačaka koje proračunska tabela može preuzeti. Zasivljeno dok nisu odabrane tačke. |
| {{ui:Zalijepi}} | {{key:Mod+V}} | Lijepi tačke: prate pokazivač, a klik ih spušta s brojevima koje nijedna druga tačka nema. Redovi tačaka kopirani u proračunskoj tabeli se također lijepe. |
| {{ui:Više}} | nema | Otvara meni ispod. |

Meni {{ui:Više}}:

| Stavka | Tipka | Šta radi |
|---|---|---|
| {{ui:Izreži}} | {{key:Mod+X}} | Kopira odabrane tačke i briše ih (jedan korak poništavanja). |
| {{ui:Kopiraj}} | {{key:Mod+C}} | Kao dugme {{ui:Kopiraj}}. |
| {{ui:Zalijepi}} | {{key:Mod+V}} | Kao dugme {{ui:Zalijepi}}. |
| {{ui:Zalijepi na mjesto}} | {{key:Mod+Shift+V}} | Lijepi tačke na njihove vlastite koordinate, s brojevima koje nijedna druga tačka nema. |
| {{ui:Dupliciraj}} | {{key:Mod+D}} | Kopija odabranih tačaka prati pokazivač; klikni gdje ide. Međuspremnik ostaje netaknut. |
| {{ui:Izbriši}} | {{key:Delete}} | Briše odabrane geodetske tačke, ili odabranu trasu, plato, objekat (s njegovim cijevima), cijev ili PVI. |
| {{ui:Odaberi sve tačke}} | {{key:Mod+A}} | Odabira svaku geodetsku tačku. |
| {{ui:Poništi odabir}} | {{key:Esc}} | Briše odabir. |

Stavka koja ne može da djeluje u tom trenutku je zasivljena, a njen savjet kaže zašto. Detalji: [Odabir, kopiranje i lijepljenje geodetskih tačaka](topic:copy-paste-points).

Poništavanje obuhvata izmjene projekta, postavki površine i geodetskih tačaka (lijepljenje, izrezivanje, dupliciranje, brisanje). Ne obuhvata postavke prikaza, a otvaranje ili uvoz bilo koje datoteke ga briše.

## GIS

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Koordinate}} | nema | Otvara dijalog **Koordinatni sistem**: reci u kojem je sistemu projekat, ili koristi koordinate terena ili lokalne. Vidi [Postavi koordinatni sistem projekta](topic:coordinate-systems) i [Koordinate terena i lokalne koordinate](topic:ground-and-local-coordinates). |
| {{ui:Uvezi}} | nema | Uvozi GIS podatke: shapefile, GeoJSON, GeoPackage, mreže visina i LiDAR. Vidi [Uvoz GIS podataka](topic:gis-import). |
| {{ui:Izvoz}} | nema | Izvozi podatke snimljenog stanja za odjel GIS-a. Vidi [Izvoz snimljenog stanja za GIS](topic:gis-export). |
| {{ui:Analiziraj}} | nema | Otvara panel GIS analize: bafer, preklapanje, prostorno spajanje, odabir po atributu, mjerenje. Vidi [Analiza GIS slojeva](topic:gis-analysis). |
| {{ui:Tabela atributa}} | nema | U Površina › Više. Otvara tabelu atributa GIS sloja: sortiranje, filtriranje, odabir, uređivanje, dodavanje polja, računanje, čuvanje kao CSV. Vidi [Rad s tabelom atributa sloja](topic:gis-table). |
| {{ui:Karta}} | nema | Otvara dijalog **Slojevi karte**: georeferencirana slika ili serveri karata koje dodate, iscrtani ispod plana. Vidi [Prikaz slojeva karte ispod plana](topic:map-layers). |

Alati GIS-a učitavaju se prvi put kada upotrijebite jedno od ovih dugmadi, otvorite GIS datoteku ili otvorite projekat koji ima koordinatni sistem ili GIS slojeve.

## Pogled

| Dugme | Tipka | Šta radi |
|---|---|---|
| {{ui:Odaberi}} | {{key:V}} ili {{key:Esc}} | Klikni za odabir trasa, plateva, objekata, cijevi i tačaka ({{key:Shift}} i klik ili prevlačenje dodaje tačke); prevuci hvatišta da pomjeriš PI-jeve, uglove plata i objekte. |
| {{ui:Uklopi}} | {{key:F}} | Zumira plan da prikaže površinu, tačke, trase i platoe (u 3D prikazu: prikazuje sve). |
| {{ui:3D}} | {{key:D}} | Prikazuje lokaciju u 3D preko plana ili se vraća na plan. Traka iznad 3D prikaza postavlja pogled, pojačanje, bojenje i šta se prikazuje, i izvozi GLB ili OBJ. Vidi [Pregled lokacije u 3D](topic:site-3d). |

## Dugmad u panelima

| Dugme | Gdje | Šta radi |
|---|---|---|
| {{ui:Otvori primjer lokacije}} | Okvir na praznom planu | Učitava primjer geodetskog snimanja (potrebna veza, osim ako je CivilCraft sačuvan za rad van mreže) |
| {{ui:Ukloni granicu}} | Lijevi panel, Površina | Uklanja vanjsku granicu |
| {{ui:Ukloni nacrtane linije loma}} | Lijevi panel, Površina | Uklanja svaku prelomnu liniju nacrtanu alatom (ne grupe prelomnih linija) |
| {{ui:Ponovo izgradi površinu iz tačaka}} | Lijevi panel, Površina (samo površina LandXML) | Odbacuje LandXML TIN i gradi iz tačaka; ne može se poništiti |
| {{ui:Počni od terena}} | Desni panel, Trasa | Počinje projektovani profil s PVI na terenu na svakom kraju |
| {{ui:Otvori prikaz profila}} | Desni panel, Trasa | Otvara prikaz profila za ovu trasu |
| {{ui:Dodaj PVI}} | Traka profila | Dok je pritisnuto, klik u profilu dodaje PVI |
| {{ui:Postavi sva dna iz pravila}} | Desni panel, Mreža cijevi | Postavlja dna svih cijevi iz pravila |
| {{ui:Postavi dna iz pravila}} | Desni panel, Cijev | Postavlja dna ove cijevi iz pravila |
