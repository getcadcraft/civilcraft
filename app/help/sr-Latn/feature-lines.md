---
title: Linije obeležja
summary: Crtajte 3D linije koje nivelišete temeno po temeno, pravite stepenaste ofsete i koristite ih kao linije loma terena ili kao nagnute platoe u projektu.
keywords: luk, kriva, poluprečnik, 3D luk, heliks, zakrivljeni ivičnjak, prikaz nagiba, prikaz kote, strelice nagiba, linija obeležja, nagib, kota, stepenasti ofset, ofset, linija loma, ivičnjak, jarak, nasip, nagnuti plato, linija dnevnog svetla, nivelacija, 3D polilinija
from: d55b25fb
---

Linija obeležja je linija sa kotom u svakom temenu: ivičnjak, linija toka jarka, vrh nasipa, ivica nagnutog platoa. Kote postavljate brojem ili nagibom, kopirate je u stranu sa korakom gore ili dole, i birate šta površi rade sa njom.

## Crtanje

1. Izaberite **Površ** › {{ui:Više}} › {{ui:Linija obeležja}}, ili pritisnite {{key:L}}.
2. Kliknite njena temena na planu. Klik na tačku snimanja zauzima mesto i kotu te tačke; bilo gde drugde teme dobija kotu postojećeg terena na tom mestu.
3. Pritisnite {{key:Enter}} da završite otvorenu liniju, ili kliknite prvo teme ponovo da je zatvorite.

Nova linija je izabrana i počinje kao linija loma postojećeg terena, koja leži na terenu.

## Lukovi

Segment može biti luk u planu čiji krajevi leže na različitim kotama: povratna ivica ivičnjaka, zakrivljeni jarak, rampa koja skreće. Njegov nagib teče ravnomerno duž luka, a njegova dužina se meri duž krive.

- **Dok crtate:** pritisnite {{key:C}} (na ekranu osetljivom na dodir, {{ui:Luk}} na traci iznad plana) da uključite lukove. Posle temena kliknite tačku na krivi, pa kliknite gde luk završava. Pritisnite {{key:C}} opet za prave segmente. {{key:Backspace}} prvo odbacuje tačku na krivi.
- **Posle:** u **Svojstvima** upišite poluprečnik i smer skretanja u polje **Luk** temena, na primer `50 L` ili `50 R` (levo ili desno dok idete linijom), i pritisnite {{key:Enter}}. Ispraznite polje da segment ponovo bude prav. Poluprečnik manji od polovine segmenta se odbija.

Izabrana linija prikazuje poluprečnik svakog luka pored njegovog nagiba. **Dužina** ide duž lukova u planu; **3D dužina** računa i uspon i pad. Stepenasti ofseti zadržavaju lukove: luk sa spoljne strane krivine raste, onaj sa unutrašnje se smanjuje, a ofset preko centra luka se odbija.

Površi, 3D prikaz, DXF i DWG uzimaju svaki luk kao kratke prave delove koji ostaju unutar 0.01 od krive. LandXML ih čuva kao lukove (videti **Lukovi u drugim datotekama** ispod).

## Postavljanje kota i nagiba

**Svojstva** navode temena sa njihovom udaljenošću duž linije, njihovu **Kotu** i **Nagib do sledećeg** (u procentima). Upišite bilo koje i pritisnite {{key:Enter}}:

- Kota pomera samo to teme.
- Nagib postavlja kotu na daljem kraju njegovog segmenta; temena posle njega ostaju tu gde jesu, pa se nagib sledećeg segmenta menja.

Takođe u **Svojstvima**:

| Radnja | Šta radi |
|---|---|
| **Podigni ili spusti sve za** | Dodaje visinu koju upišete svakom temenu. |
| {{ui:Kote sa terena}} | Vraća svako teme na postojeći teren (temena van površi zadržavaju svoju kotu i navode se). |
| {{ui:Jedan nagib, od prvog do poslednjeg}} | Zadržava prvu i poslednju kotu, a temena između stavlja na jedan ravnomeran nagib. |

Izabrana linija prikazuje svoje kote na temenima i nagibe duž segmenata na planu. Prevucite teme alatom {{ui:Izaberi}} da ga pomerite; njegova kota ostaje ista.

## Stepenasti ofseti

Pod **Stepenasti ofset** upišite **Razmak** (pozitivan desno od smera linije, negativan levo), zatim visinu (gore ili dole za) ili nagib u procentima, i kliknite {{ui:Napravi liniju ofseta}}. Kopija je nova linija obeležja: na primer zadnja strana ivičnjaka 0.5 ft u stranu i 0.5 ft više, ili ivica jarka 6 ft napolju pod 2 %. Razmak koji bi preklopio kopiju preko same sebe na uskoj krivini se odbija.

## Nagibi i kote na ekranu

Pritisnite {{key:E}}, ili označite **Nagibi i kote na linijama obeležja** pod **Prikaz**, da vidite nagib svake linije obeležja duž svakog segmenta (sa malom strelicom koja pokazuje nizbrdo) i njenu kotu na temenima. Oni se prikazuju samo na ekranu: ništa se ne dodaje na crtež, a PDF, DXF i DWG ostaju kakvi jesu. Kratki segmenti i zbijena temena ostaju bez oznaka dok ne uvećate prikaz. Izabrana linija uvek prikazuje sopstvene nagibe i kote.

## U pogledu profila

Linija obeležja koja seče trasu prikazuje se u pogledu profila te trase, sa svojim nazivom i kotom na preseku; linije koje idu pored nje mogu se takođe prikazati. Videti [Projektovanje vertikalnog profila](topic:profile).

## Šta površi rade sa njom

Izaberite **Upotreba**:

| Upotreba | Šta se dešava |
|---|---|
| Linija loma postojećeg terena | Postojeći teren prolazi kroz liniju na svojim kotama, kao nacrtana linija loma. |
| Nivelisano u projekat | **Zatvorena** linija postaje nagnuti plato: projektovana površ unutar nje se nivelise do njene ivice. Uključite **Dnevno svetlo do terena** da pustite kosine useka i nasipa (horizontalno prema 1 vertikalno) od njene ivice do terena, kao što to radi plato; svaka kosina počinje na sopstvenoj koti ivice tu. |
| Samo nacrtano | Ostaje na planu i ide u DXF, DWG i PDF (sloj C-GRAD-FEAT, 3D polilinije), ali površi je ignorišu. |

Zapremine, preseci i 3D prikaz uključuju linije obeležja nivelisane u projekat, kao platoe. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Deljenje linija sa timom

U crtežu otvorenom iz vaših datoteka u oblaku u CadCraft Studiju, na timskom planu, **Svojstva** projekta (ništa nije izabrano) imaju odeljak **Tim** sa {{ui:Linije tima…}}: linije koje je vaš tim podelio, svaka sa svojom revizijom, bez prethodnog biranja linije obeležja. Izaberite liniju da je podelite, pošaljete novu reviziju, povučete timsku ili prestanete da je delite. Van te postavke odeljak kaže šta mu je potrebno.

## Lukovi u drugim datotekama

| Datoteka | Šta se dešava sa linijom obeležja sa lukovima |
|---|---|
| Projekat CivilCraft | Čuva se tačno. |
| LandXML | Upisuje se kao plansko obeležje sa linijama i lukovima i njihovim kotama, i čita se nazad sa lukovima. Linija obeležja iz drugog programa dolazi kao **Samo nacrtano**: izaberite njenu **Upotreba** da je stavite u površ. |
| DWG i DXF | 3D polilinija ne može da sadrži luk, pa se linija upisuje kao kratki delovi unutar 0.01 od svakog luka. CivilCraft takođe beleži u crtežu koji su delovi bili lukovi: kada otvorite crtež kao linije, {{ui:Linije obeležja}} vraća linije kao linije obeležja sa njihovim lukovima. Drugi programi vide običnu 3D poliliniju. |
