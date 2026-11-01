---
title: Ekran, dio po dio
summary: Obilazak svake trake i panela u CivilCraft-u po njihovom nazivu na ekranu, od alatne trake do statusne trake.
keywords: sučelje, ekran, alatna traka, paneli, svojstva, statusna traka, prikaz profila, raspored, obilazak, ui
from: 76272010
---

CivilCraft ima jedan ekran. Nema kartica ni rasporeda. Bočni paneli mogu se pomjerati, lebdjeti ili ići u vlastiti prozor: pogledajte [Raspored panela i korištenje drugog monitora](common:arrange-panels). Odozgo prema dolje i slijeva nadesno:

- **traka aplikacije** (CadCraft oznaka, naziv aplikacije, verzija, O programu, režim prikaza, Pomoć, Spasi za rad van mreže, Papir i Model)
- **alatna traka** sa sedam grupa dugmadi
- **lijevi panel**: Lokacija, Tačke, Površina, Prikaz i, kada uvezete neke, GIS slojevi
- **plan** u sredini, sa **prikazom profila** ispod njega kada je otvoren
- **desni panel**: Svojstva onoga što je odabrano
- **statusna traka** pri dnu

## Traka aplikacije

Tanka traka na samom vrhu pripada CadCraft sajtu, a ne samom CivilCraft-u.

- Meni verzije pokazuje koju verziju pokrećete.
- {{ui:O CivilCraft-u}} otvara stranicu aplikacije na sajtu.
- {{ui:Puni ekran}} mijenja režime ekrana: puni ekran, zatim puni ekran sa sakrivenim trakama, pa nazad na normalno. {{key:Ctrl+Shift+F}} radi isto na svakoj platformi, uključujući Mac (tamo je to taster Control, a ne Command). Kada su trake sakrivene, pomjerite pokazivač na gornju ivicu da ih vratite.
- {{ui:Pomoć}} (ili {{key:F1}}) otvara ovu pomoć u bočnom panelu; {{key:F1}} ili {{key:Esc}} je zatvara.
- {{ui:Spasi za rad van mreže}} čuva CivilCraft u ovom pregledaču da se otvara bez veze; zatim prikazuje {{ui:Spremno za rad van mreže}}. Pogledajte [Datoteke koje možete otvoriti, spasiti i izvesti](topic:files#online-and-offline).
- {{ui:Papir}} i {{ui:Model}} prebacuju između svijetle i tamne teme. Plan i profil prate temu; PDF-ovi se uvijek štampaju na bijeloj podlozi.

## Alatna traka

Svaka grupa ima malu oznaku iznad svojih dugmadi. Zadržite pokazivač na dugmetu da vidite njegov savjet i taster.

| Grupa | Dugmad | Šta rade |
|---|---|---|
| Datoteka | {{ui:Novo}}, {{ui:Otvori}}, {{ui:Spasi}} | Počni ispočetka, otvori datoteku tačaka, LandXML ili projekat, spasi projekat kao preuzimanje |
| Izvoz | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Upisuje LandXML 1.2, R12 DXF ili DWG plana, ili iscrtava plan u PDF |
| Površina | {{ui:Prelomna linija}}, {{ui:Granica}} | Crta prelomnu liniju kroz tačke snimanja; crta vanjsku granicu |
| Projektovanje | {{ui:Trasa}}, {{ui:Plato}}, {{ui:Cijevi}}, {{ui:Uzdužni profil}} | Crta trasu, plato, dionicu cijevi; prikazuje ili skriva prikaz profila |
| Uređivanje | {{ui:Poništi}}, {{ui:Ponovi}}, {{ui:Kopiraj}}, {{ui:Zalijepi}}, {{ui:Više}} | Poništava, ponavlja, kopira i lijepi tačke snimanja; {{ui:Više}} sadrži Izreži, Zalijepi na mjestu, Dupliraj, Izbriši, Odaberi sve tačke i Ne odaberi ništa |
| GIS | {{ui:Koordinate}}, {{ui:Uvezi}}, {{ui:Izvoz}}, {{ui:Karta}} | Postavlja koordinatni sistem, uvozi i izvozi GIS datoteke, prikazuje slojeve karte ispod plana |
| Prikaz | {{ui:Odaberi}}, {{ui:Uklopi}}, {{ui:3D}} | Bira i pomjera stvari; zumira da prikaže sve; prikazuje lokaciju u 3D ([Pogledajte lokaciju u 3D](topic:site-3d)) |

Alat za crtanje ostaje pritisnut dok je aktivan. Ponovni klik na njega, pritisak na {{key:Esc}} ili na {{key:V}} vraća na {{ui:Odaberi}}. {{ui:Poništi}}, {{ui:Ponovi}}, {{ui:Kopiraj}} i stavke pod {{ui:Više}} su sive kada ne mogu da djeluju; savjet kaže zašto (na primjer "Prvo odaberite tačke snimanja"). Svako dugme je navedeno u [Referenca alatne trake](topic:toolbar).

U uskom prozoru alatna traka se pomjera bočno.

## Lijevi panel

### Lokacija

- **Naziv**: naziv projekta. Daje ime svakoj datoteci koju spašavate ili izvozite i štampa se u naslovnoj traci PDF-a.
- **Jedinice**: {{ui:US stope}} ili {{ui:Metri}}. Ovo kaže šta brojevi znače. Promjena ovoga **ne** pretvara koordinate; pogledajte [Jedinice, stacionaže i formati brojeva](topic:units-and-stations).

### Tačke

Kada je prazno, kaže vam kako da otvorite datoteku tačaka. Sa tačkama prikazuje naziv datoteke, broj tačaka i koliko ih ima kotu, zatim tabelu **grupa tačaka**: jedan red po prvoj riječi opisa (GRD, FL, TBS …), sa brojem i izborom **Površina**:

- {{ui:Tačke}}: tačke idu u površinu (podrazumijevano za svaku grupu).
- {{ui:Prelomna linija}}: tačke grupe se spajaju, redom po broju tačke, u jednu prelomnu liniju.
- {{ui:Izostavljeno}}: grupa ne dodiruje površinu.

### Površina

Podaci o postojećem terenu: tačke, trouglovi, najniža i najviša kota, srednja kota, 2D i 3D površina, prelomne linije i da li postoji granica. Ispod podataka, okvir navodi sve što je graditelj površine morao popraviti ili nije mogao uraditi. Zatim:

- **Najduži vanjski rub**: 0 zadržava svaki vanjski trougao; broj odsijeca duge tanke trouglove sa vanjske strane.
- Veze koje se pojavljuju kada se primjenjuju: {{ui:Ukloni granicu}}, {{ui:Ukloni nacrtane linije loma}} i, za površinu pročitanu iz LandXML-a, {{ui:Ponovo izgradi površinu iz tačaka}}.

### Prikaz

- **Površina**: {{ui:Postojeći teren}} ili {{ui:Projektovano (nivelisano)}}. Druga je dostupna kada plato ili koridor nivelišu bez problema.
- **Izohipse na svakih**, **Glavne na svakih** i **Pojasi** (broj pojasa boja).
- Polja za označavanje: {{ui:Izohipse}}, {{ui:Oznake izohipsi}}, {{ui:Trouglovi}}, {{ui:Pojasi kota}}, {{ui:Strelice nagiba}}, {{ui:Tačke}}, {{ui:Oznake tačaka}}, {{ui:Linije prijeloma}}, {{ui:Rub površine}}, {{ui:Cijevi}}.
- Legenda kota pojasa se pojavljuje kada su pojasi uključeni.

Postavke prikaza se spašavaju uz projekat, ali nisu koraci poništavanja: {{key:Mod+Z}} nikada ne vraća polje za označavanje.

## Plan

Plan prikazuje tačke, površinu i sve što projektujete, u pogledu odozgo sa sjeverom gore. Točkić za zumiranje na pokazivaču, prevlačenje praznog prostora za pomjeranje. Potpuni spisak je u [Tasteri i miš](topic:keyboard).

- Na praznom projektu okvir naslova **Počni s tačkama snimanja** navodi prve korake i nudi {{ui:Otvori primjer lokacije}}.
- Dok je alat za crtanje aktivan, savjet na vrhu plana kaže šta da kliknete i kako da završite.
- Prevlačenje datoteke preko plana prikazuje "Ispustite datoteku tačaka, LandXML ili projekat".
- Odabrane stvari su istaknute. Odabrana trasa ili plato pokazuje kvadratne ručke na svojim PI tačkama ili uglovima; odabrana konstrukcija pokazuje jednu ručku. Prevucite ručku da je pomjerite.
- Odabrane tačke snimanja imaju prsten. {{key:Shift}} i klik dodaje ili uklanja tačku; {{key:Shift}} i prevlačenje crta okvir (ili, prevučen oko njih, lasso) koji dodaje tačke unutar njega. Pogledajte [Odabir, kopiranje i lijepljenje tačaka snimanja](topic:copy-paste-points).

## Prikaz profila

Pritisnite {{key:R}} ili kliknite {{ui:Uzdužni profil}} da ga otvorite ispod plana. Njegova traka ima:

- listu trasa (aktivnu kada ima dvije ili više trasa)
- {{ui:Dodaj PVI}}: dok je pritisnuto, klik u profilu dodaje PVI ({{key:I}} ga uključuje ili isključuje)
- očitavanje stacionaže, terena, projektovane kote, nagiba i iskopa ili nasipa ispod pokazivača
- dugme za zatvaranje

Profil prikazuje postojeći teren, projektovani profil, nagibe na svakoj tangenti, stacionažu i kotu svake PVI, L i K svake vertikalne krivine s njenim BVC i EVC, visoke i niske tačke i vertikalno uvećanje. Uvijek stane cijela trasa: ne zumira se niti pomjera. Pomjeranje pokazivača duž njega stavlja tačku na trasu u planu.

## Desni panel: Svojstva

Njegov naslov kaže šta prikazuje.

- **Projekat** (ništa nije odabrano): trase i platoi kao veze, blok **Zemljani radovi** i blok **Mreža cijevi** sa njenim pravilima i problemima.
- **Trasa**: naziv, početna stacionaža, dužina, tabela PI, krivine, tabela PVI i podaci projektovanog profila, te postavke **Koridor**.
- **Plato**: naziv, kota, nagibi iskopa i nasipa, površina, podaci o presjeku s terenom i zemljani radovi.
- **Konstrukcija** ili **Cijev**: dimenzije, obodi, dna, nagib, pokrivenost i svi problemi.
- **Tačka** i njen broj: koordinate tačke, kota, opis i grupa (samo za čitanje).

Polja se primjenjuju kada pritisnete {{key:Enter}} ili napustite polje. Vrijednost koja nije prihvaćena označava se kao neispravna i ništa se ne mijenja.

## Statusna traka

- **I** i **S**: istok i sjever ispod pokazivača.
- **Teren** kota tu (i **Nivelisano** gdje je plato ili koridor promijenio), ili "Van površine".
- Najbliža trasa (ili odabrana) sa **Sta** i odmakom (**L** ili **D**) ispod pokazivača.
- S desne strane, poruke: šta se upravo desilo ili zašto je nešto odbijeno. Poruka se sama briše nakon nekoliko sekundi.

## Dijalozi

- **Uvezi tačke**: otvara se uz svaku datoteku tačaka. Pogledajte [Uvoz tačaka snimanja](topic:import-points).
- **Iscrtaj plan u PDF**: pogledajte [Iscrtavanje plana u PDF](topic:plot-pdf).
- **Nespašene promjene**: pita prije nego što {{ui:Novo}} ili otvaranje projekta ili LandXML datoteke odbaci nespašeni rad. {{ui:Spasi kopiju}} prvo preuzima projekat.

## Mali ekrani

Do 760 piksela širine, kao na telefonu, plan zauzima ekran: alatna traka je jedan red koji se pomjera bočno, a paneli se otvaraju kao listovi s trake pri dnu. {{ui:Alati}} sakriva alatnu traku, a {{ui:Premjesti}} je stavlja pri dnu.
