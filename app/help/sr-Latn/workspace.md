---
title: Ekran, deo po deo
summary: Obilazak svake trake i panela u CivilCraft-u po njihovim nazivima na ekranu, od trake sa alatkama do statusne trake.
keywords: sučelje, ekran, traka sa alatkama, paneli, svojstva, statusna traka, prikaz profila, raspored, obilazak, ui
from: 76272010
---

CivilCraft ima jedan ekran. Nema kartica i nema rasporeda. Bočni paneli mogu da se pomeraju, otkače ili idu u sopstveni prozor: pogledajte [Raspored panela i korišćenje drugog monitora](common:arrange-panels). Odozgo nadole i sleva nadesno:

- **traka aplikacije** (oznaka CadCraft, naziv aplikacije, verzija, O programu, režim ekrana, Pomoć, Sačuvaj za rad van mreže, Papir i Model)
- **traka sa alatkama** sa sedam grupa dugmadi
- **levi panel**: Lokacija, Tačke, Površ, Prikaz i, kada uvezete neke podatke, GIS slojevi
- **plan** u sredini, sa **prikazom profila** ispod njega kada je otvoren
- **desni panel**: Svojstva onoga što je izabrano
- **statusna traka** pri dnu

## Traka aplikacije

Tanka traka na samom vrhu pripada sajtu CadCraft, a ne samom CivilCraft-u.

- Meni verzije pokazuje koju verziju pokrećete.
- {{ui:O programu CivilCraft}} otvara stranicu aplikacije na sajtu.
- {{ui:Ceo ekran}} prolazi kroz režime ekrana: ceo ekran, pa ceo ekran sa skrivenim trakama, pa nazad na normalan prikaz. {{key:Ctrl+Shift+F}} radi isto na svakoj platformi, uključujući Mac (tu je to taster Control, a ne Command). Kada su trake skrivene, pomerite pokazivač do gornje ivice da se vrate.
- {{ui:Pomoć}} (ili {{key:F1}}) otvara ovu pomoć u bočnom panelu; {{key:F1}} ili {{key:Esc}} je zatvara.
- {{ui:Sačuvaj za rad van mreže}} čuva CivilCraft u ovom pregledaču da se otvara bez veze; tada prikazuje {{ui:Spremno za rad van mreže}}. Pogledajte [Datoteke koje možete otvoriti, sačuvati i izvesti](topic:files#online-and-offline).
- {{ui:Papir}} i {{ui:Model}} prebacuju između svetle i tamne teme. Plan i profil prate temu; PDF-ovi se uvek štampaju na belom.

## Traka sa alatkama

Svaka grupa ima mali naslov iznad svojih dugmadi. Zadržite pokazivač na dugmetu da vidite njegov opis i taster.

| Grupa | Dugmad | Šta rade |
|---|---|---|
| Datoteka | {{ui:Novo}}, {{ui:Otvori}}, {{ui:Sačuvaj}} | Počinju ispočetka, otvaraju datoteku sa tačkama, LandXML ili projekat, čuvaju projekat kao preuzimanje |
| Izvoz | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Pišu LandXML 1.2, R12 DXF ili DWG plana, ili štampaju plan u PDF |
| Površ | {{ui:Linija loma}}, {{ui:Granica}} | Crtaju liniju loma kroz geodetske tačke; crtaju spoljnu granicu |
| Projektovanje | {{ui:Trasa}}, {{ui:Plato}}, {{ui:Cevi}}, {{ui:Profil}} | Crtaju trasu, plato, deonicu cevi; prikazuju ili sakrivaju prikaz profila |
| Uređivanje | {{ui:Opozovi}}, {{ui:Ponovi}}, {{ui:Kopiraj}}, {{ui:Nalepi}}, {{ui:Više}} | Opozivaju, ponavljaju, kopiraju i lepe geodetske tačke; {{ui:Više}} sadrži Iseci, Nalepi na mestu, Dupliraj, Izbriši, Izaberi sve tačke i Poništi izbor |
| GIS | {{ui:Koordinate}}, {{ui:Uvezi}}, {{ui:Izvoz}}, {{ui:Mapa}} | Podešavaju koordinatni sistem, uvoze i izvoze GIS datoteke, prikazuju slojeve karte ispod plana |
| Prikaz | {{ui:Izaberi}}, {{ui:Uklopi}}, {{ui:3D}} | Biraju i pomeraju stvari; zumiraju da prikažu sve; prikazuju lokaciju u 3D ([Pogledajte lokaciju u 3D](topic:site-3d)) |

Alat za crtanje ostaje pritisnut dok je aktivan. Kada ga ponovo kliknete, pritisnete {{key:Esc}} ili pritisnete {{key:V}}, vraćate se na {{ui:Izaberi}}. {{ui:Opozovi}}, {{ui:Ponovi}}, {{ui:Kopiraj}} i stavke u {{ui:Više}} su zasivljene kada ne mogu da deluju; opis kaže zašto (na primer „Prvo izaberite geodetske tačke”). Svako dugme je navedeno u [Referenca trake sa alatkama](topic:toolbar).

Na uskom prozoru traka sa alatkama se pomera u stranu.

## Levi panel

### Lokacija

- **Naziv**: naziv projekta. Daje ime svakoj datoteci koju sačuvate ili izvezete i štampa se u naslovnoj traci PDF-a.
- **Jedinice**: {{ui:Američke stope}} ili {{ui:Metri}}. Ovo kaže šta brojevi znače. Promena **ne** pretvara koordinate; pogledajte [Jedinice, stacionaže i formati brojeva](topic:units-and-stations).

### Tačke

Kada je prazno, kaže vam kako da otvorite datoteku sa tačkama. Sa tačkama prikazuje naziv datoteke, broj tačaka i koliko njih ima kotu, zatim tabelu **grupa tačaka**: jedan red po prvoj reči opisa (GRD, FL, TBS …), sa brojem i izborom za **Površ**:

- {{ui:Tačke}}: tačke ulaze u površ (podrazumevano za svaku grupu).
- {{ui:Linija loma}}: tačke grupe se povezuju, po redosledu brojeva tačaka, u jednu liniju loma.
- {{ui:Izostavljeno}}: grupa ne dira površ.

### Površ

Podaci o postojećem terenu: tačke, trouglovi, najniža i najviša kota, srednja kota, 2D i 3D površina, linije loma i da li postoji granica. Ispod podataka, okvir navodi sve što je graditelj površi morao da popravi ili nije mogao da uradi. Zatim:

- **Najduža spoljna ivica**: 0 zadržava svaki spoljašnji trougao; broj skida duge tanke trouglove sa spoljne strane.
- Veze koje se pojavljuju kada važe: {{ui:Ukloni granicu}}, {{ui:Ukloni nacrtane linije loma}} i, za površ pročitanu iz LandXML-a, {{ui:Ponovo izgradi površ iz tačaka}}.

### Prikaz

- **Površ**: {{ui:Postojeći teren}} ili {{ui:Predloženo (sa nagibom)}}. Druga je dostupna kada plato ili koridor nivelišu bez problema.
- **Konture na svakih**, **Glavne na svakih** i **Pojasevi** (broj pojaseva boja).
- Štikle: {{ui:Izohipse}}, {{ui:Oznake izohipsi}}, {{ui:Trouglovi}}, {{ui:Pojasevi kota}}, {{ui:Strelice nagiba}}, {{ui:Tačke}}, {{ui:Oznake tačaka}}, {{ui:Linije loma}}, {{ui:Ivica površine}}, {{ui:Cevi}}.
- Legenda kota pojaseva se pojavljuje kada su pojasevi uključeni.

Podešavanja prikaza se čuvaju uz projekat, ali nisu koraci opozivanja: {{key:Mod+Z}} nikad ne vraća štiklu.

## Plan

Plan prikazuje tačke, površ i sve što projektujete, u pogledu odozgo sa severom nagore. Točkić miša za zumiranje na pokazivaču, prevlačenje praznog prostora za pomeranje. Pun spisak je u [Tasteri i miš](topic:keyboard).

- Na praznom projektu okvir pod naslovom **Počni sa geodetskim tačkama** navodi prve korake i nudi {{ui:Otvori primer lokacije}}.
- Dok je alat za crtanje aktivan, savet pri vrhu plana kaže šta da kliknete i kako da završite.
- Prevlačenje datoteke preko plana prikazuje „Ispusti datoteku sa tačkama, LandXML ili projekat”.
- Izabrane stvari su istaknute. Izabrana trasa ili plato pokazuju kvadratne hvataljke na svojim PI-jevima ili uglovima; izabrani objekat pokazuje jednu hvataljku. Prevucite hvataljku da je pomerite.
- Izabrane geodetske tačke imaju prsten. {{key:Shift}} i klik dodaje ili uklanja tačku; {{key:Shift}} i prevlačenje crta okvir (ili, prevučen oko njih, lasso) koji dodaje tačke unutra. Pogledajte [Izbor, kopiranje i lepljenje geodetskih tačaka](topic:copy-paste-points).

## Prikaz profila

Pritisnite {{key:R}} ili kliknite {{ui:Profil}} da ga otvorite ispod plana. Njegova traka ima:

- listu trasa (aktivna kada ima dve ili više trasa)
- {{ui:Dodaj PVI}}: dok je pritisnut, klik u profilu dodaje PVI ({{key:I}} ga uključuje i isključuje)
- očitavanje stacionaže, terena, projektovane kote, nagiba i iskopa ili nasipa ispod pokazivača
- dugme za zatvaranje

Profil prikazuje postojeći teren, projektovani profil, nagibe na svakoj tangenti, stacionažu i kotu svakog PVI-ja, L i K svake vertikalne krivine sa njenim BVC i EVC, najviše i najniže tačke i vertikalno preterivanje. Uvek prikazuje celu trasu: ne zumira i ne pomera se. Pomeranje pokazivača duž njega stavlja tačku na trasu u planu.

## Desni panel: Svojstva

Njegov naslov kaže šta prikazuje.

- **Projekat** (ništa nije izabrano): trase i platoi kao linkovi, blok **Zemljani radovi** i blok **Mreža cevi** sa njenim pravilima i problemima.
- **Trasa**: naziv, početna stacionaža, dužina, tabela PI-jeva, krivine, tabela PVI-jeva i podaci projektovanog profila, i podešavanja **Koridora**.
- **Plato**: naziv, kota, nagibi iskopa i nasipa, površina, podaci o izlasku na teren i zemljani radovi.
- **Objekat** ili **Cev**: dimenzije, šahte, kote dna, nagib, nadsloj i svi problemi.
- **Tačka** i njen broj: koordinate tačke, kota, opis i grupa (samo za čitanje).

Polja stupaju na snagu kada pritisnete {{key:Enter}} ili napustite polje. Vrednost koja nije prihvaćena se označava kao neispravna i ništa se ne menja.

## Statusna traka

- **E** i **N**: istočna i severna koordinata ispod pokazivača.
- **Kota terena** tamo (i **Nivelisano** gde plato ili koridor menja teren), ili „Van površi”.
- Najbliža trasa (ili izabrana) sa **Sta** i odstupanjem (**L** ili **R**) ispod pokazivača.
- Desno, poruke: šta se upravo dogodilo ili zašto je nešto odbijeno. Poruka se sama briše posle nekoliko sekundi.

## Dijalozi

- **Uvezi tačke**: otvara se uz svaku datoteku sa tačkama. Pogledajte [Uvoz geodetskih tačaka](topic:import-points).
- **Štampaj plan u PDF**: pogledajte [Ispis plana u PDF](topic:plot-pdf).
- **Nesačuvane izmene**: pita pre nego što {{ui:Novo}} ili otvaranje projekta ili LandXML datoteke odbaci nesačuvan rad. {{ui:Sačuvaj kopiju}} prvo preuzima projekat.

## Mali ekrani

Do 760 piksela širine, na primer na telefonu, plan zadržava ekran: traka sa alatkama je jedan red koji se pomera u stranu, a paneli se otvaraju kao listovi sa trake pri dnu. {{ui:Alatke}} sakriva traku sa alatkama, a {{ui:Premesti}} je stavlja pri dnu.
