---
title: Zaslon, dio po dio
summary: Obilazak svake trake i ploče u CivilCraftu po nazivu na zaslonu, od alatne trake do statusne trake.
keywords: sučelje, zaslon, alatna traka, ploče, svojstva, statusna traka, prikaz profila, raspored, obilazak, ui
from: 76272010
---

CivilCraft ima jedan zaslon. Nema kartica ni layouta. Bočne ploče se mogu pomicati, odvajati ili staviti u vlastiti prozor: vidi [Raspored ploča i drugi monitor](common:arrange-panels). Odozgo prema dolje i slijeva nadesno:

- **traka aplikacije** (znak CadCraft, naziv aplikacije, verzija, O aplikaciji, način zaslona, Pomoć, Spremi za offline, Papir i Model)
- **alatna traka** sa sedam skupina gumba
- **lijeva ploča**: Lokacija, Točke, Teren, Prikaz i, kada uvezete neke, GIS slojevi
- **tlocrt** u sredini, s **prikazom profila** ispod njega kada je otvoren
- **desna ploča**: Svojstva onoga što je odabrano
- **statusna traka** uz dno

## Traka aplikacije

Tanka traka na samom vrhu pripada web-mjestu CadCraft, a ne samom CivilCraftu.

- Izbornik verzija prikazuje koju verziju koristite.
- {{ui:O aplikaciji CivilCraft}} otvara stranicu aplikacije na web-mjestu.
- {{ui:Cijeli zaslon}} mijenja načine zaslona: cijeli zaslon, zatim cijeli zaslon sa skrivenim trakama, zatim natrag na uobičajeni. {{key:Ctrl+Shift+F}} radi isto na svakoj platformi, uključujući Mac (ondje je to tipka Control, a ne Command). Sa skrivenim trakama pomaknite pokazivač na gornji rub da ih vratite.
- {{ui:Pomoć}} (ili {{key:F1}}) otvara ovu pomoć u bočnoj ploči; {{key:F1}} ili {{key:Esc}} je zatvara.
- {{ui:Spremi za offline}} čuva CivilCraft u ovom pregledniku da se otvara bez veze; zatim prikazuje {{ui:Spremno za offline}}. Vidi [Datoteke koje možete otvoriti, spremiti i izvesti](topic:files#online-and-offline).
- {{ui:Papir}} i {{ui:Model}} prebacuju između svijetle i tamne teme. Tlocrt i profil prate temu; PDF-ovi se uvijek ispisuju na bijelom.

## Alatna traka

Svaka skupina ima malu oznaku iznad svojih gumba. Zadržite pokazivač na gumbu da vidite njegov opis alata i tipku.

| Skupina | Gumbi | Što rade |
|---|---|---|
| Datoteka | {{ui:Novo}}, {{ui:Otvori}}, {{ui:Spremi}} | Početi iznova, otvoriti datoteku točaka, LandXML ili projekt, spremiti projekt kao preuzimanje |
| Izvoz | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Zapisati LandXML 1.2, R12 DXF ili DWG tlocrta ili ispisati tlocrt u PDF |
| Teren | {{ui:Prijelomnica}}, {{ui:Granica}} | Nacrtati prijelomnicu kroz geodetske točke; nacrtati vanjsku granicu |
| Projekt | {{ui:Os trase}}, {{ui:Plato}}, {{ui:Cijevi}}, {{ui:Profil}} | Nacrtati os trase, plato, cijevnu dionicu; prikazati ili sakriti prikaz profila |
| Uređivanje | {{ui:Poništi}}, {{ui:Ponovi}}, {{ui:Kopiraj}}, {{ui:Zalijepi}}, {{ui:Više}} | Poništiti, ponoviti, kopirati i zalijepiti geodetske točke; {{ui:Više}} sadrži Izreži, Zalijepi na isto mjesto, Dupliciraj, Izbriši, Odaberi sve točke i Poništi odabir |
| GIS | {{ui:Koordinate}}, {{ui:Uvezi}}, {{ui:Izvezi}}, {{ui:Karta}} | Postaviti koordinatni sustav, uvoziti i izvoziti GIS datoteke, prikazati slojeve karte ispod tlocrta |
| Prikaz | {{ui:Odaberi}}, {{ui:Prilagodi}}, {{ui:3D}} | Birati i pomicati stvari; zumirati da se vidi sve; prikazati lokaciju u 3D-u ([Prikaz lokacije u 3D-u](topic:site-3d)) |

Alat za crtanje ostaje pritisnut dok je aktivan. Ponovni klik na njega, pritisak na {{key:Esc}} ili pritisak na {{key:V}} vraća na {{ui:Odaberi}}. {{ui:Poništi}}, {{ui:Ponovi}}, {{ui:Kopiraj}} i stavke u {{ui:Više}} zasivljene su kada ne mogu djelovati; opis alata kaže zašto (na primjer „Najprije odaberite geodetske točke“). Svaki je gumb naveden u [Referenci alatne trake](topic:toolbar).

U uskom prozoru alatna traka se pomiče postrance.

## Lijeva ploča

### Lokacija

- **Naziv**: naziv projekta. Imenuje svaku datoteku koju spremite ili izvezete i ispisuje se u naslovnoj traci PDF-a.
- **Jedinice**: {{ui:Američke stope}} ili {{ui:Metri}}. To kaže što brojevi znače. Promjena **ne** pretvara koordinate; vidi [Jedinice, stacionaže i formati brojeva](topic:units-and-stations).

### Točke

Kada je prazna, govori kako otvoriti datoteku točaka. S točkama prikazuje naziv datoteke, broj točaka i koliko ih ima visinu, zatim tablicu **skupina točaka**: jedan redak po prvoj riječi opisa (GRD, FL, TBS …), s brojem i izborom **Teren**:

- {{ui:Točke}}: točke ulaze u teren (zadano za svaku skupinu).
- {{ui:Prijelomnica}}: točke skupine spajaju se, redom brojeva točaka, u jednu prijelomnicu.
- {{ui:Izostavljeno}}: skupina ne dira teren.

### Teren

Podaci o postojećem terenu: točke, trokuti, najniža i najviša visina, srednja visina, 2D i 3D površina, prijelomnice i postoji li granica. Ispod podataka okvir navodi sve što je graditelj terena morao popraviti ili nije mogao učiniti. Zatim:

- **Najdulji vanjski brid**: 0 zadržava svaki vanjski trokut; broj reže duge tanke trokute izvana.
- Veze koje se pojavljuju kada se odnose: {{ui:Ukloni granicu}}, {{ui:Ukloni nacrtane prijelomnice}} i, za teren pročitan iz LandXML-a, {{ui:Ponovno izradi teren iz točaka}}.

### Prikaz

- **Teren**: {{ui:Postojeći teren}} ili {{ui:Projektirano (planirano)}}. Drugo je dostupno kada plato ili koridor planira bez problema.
- **Izohipse svakih**, **Glavna svaka** i **Pojasevi** (broj bojnih pojaseva).
- Potvrdni okviri: {{ui:Izohipse}}, {{ui:Oznake izohipsa}}, {{ui:Trokuti}}, {{ui:Visinski pojasevi}}, {{ui:Strelice nagiba}}, {{ui:Točke}}, {{ui:Oznake točaka}}, {{ui:Prijelomnice}}, {{ui:Rub terena}}, {{ui:Cijevi}}.
- Legenda visina pojaseva pojavljuje se kada su pojasevi uključeni.

Postavke prikaza spremaju se s projektom, ali nisu koraci poništavanja: {{key:Mod+Z}} nikada ne vraća potvrdni okvir.

## Tlocrt

Tlocrt prikazuje točke, teren i sve što projektirate, u tlocrtnom prikazu sa sjeverom gore. Kotačić zumira na pokazivaču, povlačenje praznog prostora pomiče prikaz. Cijeli popis je u [Tipke i miš](topic:keyboard).

- Na praznom projektu okvir naslovljen **Počnite s geodetskim točkama** navodi prve korake i nudi {{ui:Otvorite primjer lokacije}}.
- Dok je alat za crtanje aktivan, savjet pri vrhu tlocrta govori što kliknuti i kako završiti.
- Povlačenje datoteke preko tlocrta prikazuje „Ispustite datoteku točaka, LandXML ili projekt“.
- Odabrane stvari su istaknute. Odabrana os trase ili plato prikazuje četvrtaste ručke na svojim PI-jevima ili kutovima; odabrani objekt prikazuje jednu ručku. Povucite ručku da je pomaknete.
- Odabrane geodetske točke imaju prsten. {{key:Shift}} i klik dodaje ili uklanja točku; {{key:Shift}} i povlačenje crta okvir (ili, povučeno oko njih, laso) koji dodaje točke unutar njega. Vidi [Odabir, kopiranje i lijepljenje geodetskih točaka](topic:copy-paste-points).

## Prikaz profila

Pritisnite {{key:R}} ili kliknite {{ui:Profil}} da ga otvorite ispod tlocrta. Njegova traka ima:

- popis osi (omogućen kada postoje dvije ili više osi)
- {{ui:Dodaj PVI}}: dok je pritisnut, klik u profilu dodaje PVI ({{key:I}} ga prebacuje)
- očitanje stacionaže, terena, projektne kote, nagiba te iskopa ili nasipa ispod pokazivača
- gumb za zatvaranje

Profil prikazuje postojeći teren, projektni profil, nagibe na svakom pravcu, stacionažu i visinu svakog PVI-ja, L i K svakog vertikalnog zaobljenja s njegovim BVC i EVC, visoke i niske točke te vertikalno pretjerivanje. Uvijek prilagođava cijelu os trase: ne zumira i ne pomiče se. Pomicanje pokazivača duž njega stavlja točku na os trase u tlocrtu.

## Desna ploča: Svojstva

Njezin naslov kaže što prikazuje.

- **Projekt** (ništa nije odabrano): osi i platoi kao veze, blok **Zemljani radovi** i blok **Cijevna mreža** s pravilima i problemima.
- **Os trase**: naziv, početna stacionaža, duljina, tablica PI, lukovi, tablica PVI projektnog profila i podaci te postavke **Koridora**.
- **Plato**: naziv, visina, nagibi iskopa i nasipa, površina, podaci o nožici pokosa i zemljani radovi.
- **Objekt** ili **Cijev**: veličine, rubovi poklopca, dna cijevi, nagib, nadsloj i svi problemi.
- **Točka** i njezin broj: koordinate, visina, opis i skupina točke (samo za čitanje).

Polja stupaju na snagu kad pritisnete {{key:Enter}} ili napustite polje. Vrijednost koja se ne prihvaća označava se kao nevažeća i ništa se ne mijenja.

## Statusna traka

- **E** i **N**: istok i sjever ispod pokazivača.
- **Teren** visina ondje (i **Planirano** gdje ju je promijenio plato ili koridor), ili „Izvan terena“.
- Najbliža os trase (ili odabrana) sa **Stac.** i odmakom (**L** ili **D**) ispod pokazivača.
- Desno, poruke: što se upravo dogodilo ili zašto je nešto odbijeno. Poruka se sama briše nakon nekoliko sekundi.

## Dijaloški okviri

- **Uvoz točaka**: otvara se sa svakom datotekom točaka. Vidi [Uvoz geodetskih točaka](topic:import-points).
- **Plotanje tlocrta u PDF**: vidi [Plotanje tlocrta u PDF](topic:plot-pdf).
- **Nespremljene promjene**: pita prije nego {{ui:Novo}} ili otvaranje projekta ili LandXML datoteke odbaci nespremljeni rad. {{ui:Spremi kopiju}} prvo preuzima projekt.

## Mali zasloni

Do 760 piksela širine, primjerice na mobitelu, tlocrt zadržava zaslon: alatna traka je jedan redak koji se pomiče postrance, a ploče se otvaraju kao listovi s trake pri dnu. {{ui:Alati}} skriva alatnu traku, a {{ui:Pomakni}} je stavlja na dno.
