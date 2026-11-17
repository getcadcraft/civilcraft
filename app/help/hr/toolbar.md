---
title: Referenca alatne trake
summary: Svaki gumb alatne trake u CivilCraftu, što radi, njegova tipka te kada je zasivljen ili odbija raditi.
keywords: alatna traka, gumbi, naredbe, alati, datoteka, izvoz, teren, projektiranje, uređivanje, prikaz, izbornik
from: 4c4352bc
---

Alatna traka se proteže na vrhu aplikacije u sedam grupa. Svaki gumb pokazuje svoj savjet i tipku kada pređete mišem preko njega.

## Datoteka

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:New}} | nema | Pokreće prazan projekt. Prvo pita ako postoje nespremljene promjene. |
| {{ui:Open}} | {{key:Mod+O}} | Otvara datoteku točaka (CSV, TXT), LandXML ili CivilCraft projekt. |
| {{ui:Save}} | {{key:Mod+S}} | Preuzima projekt kao `<name>.civilcraft.json`. |

## Izvoz

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:LandXML}} | nema | Preuzima `<name>.xml`: točke, površine, osi trasa, profile i mrežu cijevi kao LandXML 1.2. „Još nema ničega za izvoz.“ kada je projekt prazan. |
| {{ui:DXF}} | nema | Preuzima `<name>.dxf`: linije tlocrta kao R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Otvara **Plotanje tlocrta u PDF**. „Još nema ničega za plotanje.“ kada je projekt prazan. |

## Teren

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Kliknite točke snimanja redom, {{key:Enter}} za završetak. Prijelomnica preuzima visine točaka. |
| {{ui:Boundary}} | {{key:O}} | Kliknite kutove vanjske granice, {{key:Enter}} za završetak. Zamjenjuje svaku granicu. |

Oba kažu „Teren još ne postoji: prvo otvorite točke snimanja.“ kada teren ne postoji.

## Projektiranje

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:Alignment}} | {{key:A}} | Kliknite PI-jeve redom, {{key:Enter}} za završetak. |
| {{ui:Pad}} | {{key:G}} | Kliknite kutove platoa, {{key:Enter}} za završetak. Kao i alati za teren, upozorava kada teren ne postoji; plato se planira samo na terenu. |
| {{ui:Pipes}} | {{key:P}} | Kliknite građevine od uzvodne prema nizvodnoj (kliknite postojeću da se spojite na nju), {{key:Enter}} za završetak. |
| {{ui:Profile}} | {{key:R}} | Prikazuje ili skriva prikaz profila ispod tlocrta. |

## Uređivanje

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:Undo}} | {{key:Mod+Z}} | Poništava zadnju promjenu (do 200). Zasivljeno kada nema što poništiti. |
| {{ui:Redo}} | {{key:Mod+Y}} | Ponavlja ono što je poništeno. Zasivljeno kada nema što ponoviti. |
| {{ui:Copy}} | {{key:Mod+C}} | Kopira odabrane točke snimanja i stavlja ih u međuspremnik kao retke točaka koje tablični kalkulator može prihvatiti. Zasivljeno dok se ne odaberu točke. |
| {{ui:Paste}} | {{key:Mod+V}} | Zalijepljuje točke: prate pokazivač, a klik ih spušta s brojevima koje nijedna druga točka nema. Retci točaka kopirani u tablici također se zalijepe. |
| {{ui:More}} | nema | Otvara izbornik ispod. |

Izbornik {{ui:More}}:

| Stavka | Tipka | Što radi |
|---|---|---|
| {{ui:Cut}} | {{key:Mod+X}} | Kopira odabrane točke i briše ih (jedan korak poništavanja). |
| {{ui:Copy}} | {{key:Mod+C}} | Kao gumb {{ui:Copy}}. |
| {{ui:Paste}} | {{key:Mod+V}} | Kao gumb {{ui:Paste}}. |
| {{ui:Paste in place}} | {{key:Mod+Shift+V}} | Zalijepljuje točke na njihove vlastite koordinate, s brojevima koje nijedna druga točka nema. |
| {{ui:Duplicate}} | {{key:Mod+D}} | Kopija odabranih točaka prati pokazivač; kliknite gdje ide. Međuspremnik ostaje nepromijenjen. |
| {{ui:Delete}} | {{key:Delete}} | Briše odabrane točke snimanja ili odabranu os trase, plato, građevinu (s njezinim cijevima), cijev ili PVI. |
| {{ui:Select all points}} | {{key:Mod+A}} | Odabire sve točke snimanja. |
| {{ui:Select none}} | {{key:Esc}} | Briše odabir. |

Stavka koja trenutno ne može raditi je zasivljena, a njezin savjet kaže zašto. Pojedinosti: [Odabir, kopiranje i lijepljenje točaka snimanja](topic:copy-paste-points).

Poništavanje obuhvaća izmjene projektiranja, postavki terena i točaka snimanja (lijepljenje, izrezivanje, dupliciranje, brisanje). Ne obuhvaća postavke prikaza, a otvaranje ili uvoz bilo koje datoteke ga briše.

## GIS

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:Coordinates}} | nema | Otvara dijaloški okvir **Koordinatni sustav**: navedite u kojem je sustavu projekt ili upotrijebite koordinate terena ili lokalne koordinate. Vidi [Postavljanje koordinatnog sustava projekta](topic:coordinate-systems) i [Koordinate terena i lokalne koordinate](topic:ground-and-local-coordinates). |
| {{ui:Import}} | nema | Uvozi GIS podatke: shapefile, GeoJSON, GeoPackage, mreže visina i LiDAR. Vidi [Uvoz GIS podataka](topic:gis-import). |
| {{ui:Export}} | nema | Izvozi podatke izvedenog stanja za odjel GIS-a. Vidi [Izvoz podataka izvedenog stanja za GIS](topic:gis-export). |
| {{ui:Analyze}} | nema | Otvara ploču GIS analize: zonu utjecaja, preklapanje, prostorno spajanje, odabir po atributu, mjerenje. Vidi [Analiza GIS slojeva](topic:gis-analysis). |
| {{ui:Attribute table}} | nema | Pod Teren › Više. Otvara tablicu atributa GIS sloja: razvrstavanje, filtriranje, odabir, uređivanje, dodavanje polja, izračun, spremanje kao CSV. Vidi [Rad s tablicom atributa sloja](topic:gis-table). |
| {{ui:Map}} | nema | Otvara dijaloški okvir **Slojevi karte**: georeferencirana slika ili poslužitelji karata koje dodate, iscrtani ispod tlocrta. Vidi [Prikaz slojeva karte ispod tlocrta](topic:map-layers). |

GIS alati se učitavaju prvi put kada upotrijebite jedan od ovih gumba, otvorite GIS datoteku ili otvorite projekt koji ima koordinatni sustav ili GIS slojeve.

## Prikaz

| Gumb | Tipka | Što radi |
|---|---|---|
| {{ui:Select}} | {{key:V}} ili {{key:Esc}} | Kliknite za odabir osi trasa, platoa, građevina, cijevi i točaka ({{key:Shift}} i klik ili povlačenje dodaje točke); povucite ručke za pomicanje PI-jeva, kutova platoa i građevina. |
| {{ui:Fit}} | {{key:F}} | Zumira tlocrt da prikaže teren, točke, osi trasa i platoe (u 3D prikazu: prikazuje sve). |
| {{ui:3D}} | {{key:D}} | Prikazuje lokaciju u 3D-u preko tlocrta ili se vraća na tlocrt. Traka iznad 3D prikaza postavlja pogled, vertikalno pretjerivanje, bojanje i što se prikazuje te izvozi GLB ili OBJ. Vidi [Prikaz lokacije u 3D-u](topic:site-3d). |

## Gumbi u pločama

| Gumb | Gdje | Što radi |
|---|---|---|
| {{ui:Open the sample site}} | Okvir na praznom tlocrtu | Učitava uzorak snimke (treba vezu, osim ako je CivilCraft spremljen za rad offline) |
| {{ui:Remove the boundary}} | Lijeva ploča, Teren | Uklanja vanjsku granicu |
| {{ui:Remove drawn breaklines}} | Lijeva ploča, Teren | Uklanja svaku prijelomnicu nacrtanu alatom (ne grupe prijelomnica) |
| {{ui:Rebuild the surface from the points}} | Lijeva ploča, Teren (samo LandXML površina) | Odbacuje LandXML TIN i izrađuje iz točaka; ne može se poništiti |
| {{ui:Start from the ground}} | Desna ploča, Os trase | Počinje projektni profil s PVI-jem na terenu na svakom kraju |
| {{ui:Profile view}} | Desna ploča, Os trase | Otvara prikaz profila za ovu os trase |
| {{ui:Add PVIs}} | Traka profila | Dok je pritisnut, klik u profilu dodaje PVI |
| {{ui:Set every invert from the rules}} | Desna ploča, Mreža cijevi | Postavlja dna svih cijevi prema pravilima |
| {{ui:Set its inverts from the rules}} | Desna ploča, Cijev | Postavlja dna ove cijevi prema pravilima |
