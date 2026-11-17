---
title: Linije obilježja
summary: Crtajte 3D linije koje nivelišete tačku po tačku, pravite njihove stepenaste pomake i koristite ih kao prelomne linije terena ili kao nagnute platoe u projektu.
keywords: luk, kriva, poluprečnik, 3D luk, heliks, zakrivljeni ivičnjak, prikaz nagiba, prikaz kota, strelice nagiba, linija obilježja, nagib, kota, stepenasti pomak, pomak, prelomna linija, ivičnjak, jarak, nasip, nagnuti plato, presijecanje s terenom, nivelacija, 3D polilinija
from: d55b25fb
---

Linija obilježja je linija s kotom u svakom čvoru: ivičnjak, linija toka jarka, vrh nasipa, ivica nagnutog platoa. Kote postavljate brojem ili nagibom, kopirate je u stranu sa korakom gore ili dolje, i birate šta površine rade s njom.

## Nacrtajte je

1. Odaberite **Površina** › {{ui:Više}} › {{ui:Linija obilježja}}, ili pritisnite {{key:L}}.
2. Kliknite njene čvorove na planu. Klik na tačku snimanja preuzima njeno mjesto i kotu; bilo gdje drugdje čvor preuzima kotu postojećeg terena tamo.
3. Pritisnite {{key:Enter}} da završite otvorenu liniju, ili ponovo kliknite prvi čvor da je zatvorite.

Nova linija je odabrana i počinje kao prelomna linija postojećeg terena, koja leži na terenu.

## Lukovi

Segment može biti luk u planu čiji krajevi leže na različitim kotama: zaobljenje ivičnjaka, zakrivljeni jarak, rampa koja skreće. Njen nagib teče ravnomjerno duž luka, a njena dužina se mjeri duž krive.

- **Dok crtate:** pritisnite {{key:C}} (na ekranu osjetljivom na dodir, {{ui:Luk}} na traci iznad plana) da uključite lukove. Nakon čvora, kliknite tačku na krivoj, zatim kliknite mjesto gdje luk završava. Ponovo pritisnite {{key:C}} za prave segmente. {{key:Backspace}} prvo uklanja tačku na krivoj.
- **Poslije:** u **Svojstvima** upišite poluprečnik i smjer skretanja u polju **Luk** čvora, na primjer `50 L` ili `50 R` (lijevo ili desno dok idete linijom), i pritisnite {{key:Enter}}. Ispraznite polje da segment ponovo bude prav. Poluprečnik manji od polovine segmenta se odbija.

Odabrana linija pokazuje poluprečnik svakog luka pored njegovog nagiba. **Dužina** je duž lukova u planu; **3D dužina** računa i uspon i pad. Stepenasti pomaci zadržavaju lukove: luk s vanjske strane krivine raste, onaj s unutrašnje se smanjuje, a pomak koji prelazi središte luka se odbija.

Površine, 3D prikaz, DXF i DWG uzimaju svaki luk kao kratke prave dijelove koji ostaju unutar 0.01 od krive. LandXML ih zadržava kao lukove (vidi **Lukovi u drugim datotekama** ispod).

## Postavljanje kota i nagiba

**Svojstva** navode čvorove s njihovom udaljenošću duž linije, njihovom **Kotom** i **Nagibom do sljedećeg** (u procentima). Upišite bilo koje i pritisnite {{key:Enter}}:

- Kota pomjera samo taj čvor.
- Nagib postavlja kotu na udaljenom kraju njegovog segmenta; čvorovi nakon njega ostaju gdje jesu, pa se nagib sljedećeg segmenta mijenja.

Također u **Svojstvima**:

| Radnja | Šta radi |
|---|---|
| **Podigni ili spusti sve za** | Dodaje visinu koju upišete svakom čvoru. |
| {{ui:Kote s terena}} | Vraća svaki čvor na postojeći teren (čvorovi van površine zadržavaju svoje i navode se). |
| {{ui:Jedan nagib, od prvog do zadnjeg}} | Zadržava prvu i posljednju kotu, a čvorove između stavlja na jedan ravnomjeran nagib. |

Odabrana linija pokazuje svoje kote u čvorovima i nagibe duž segmenata na planu. Prevucite čvor pomoću {{ui:Odaberi}} da ga pomjerite; njegova kota ostaje.

## Stepenasti pomaci

Pod **Stepenasti pomak** upišite **Razmak** (pozitivan desno od smjera linije, negativan lijevo), zatim visinu (gore ili dolje za) ili nagib u procentima, i kliknite {{ui:Napravi pomaknutu liniju}}. Kopija je nova linija obilježja: na primjer, zadnja strana ivičnjaka 0.5 ft sa strane i 0.5 ft više, ili ivica jarka 6 ft van linije na 2 %. Razmak koji bi kopiju preklopio preko same sebe na oštroj krivini se odbija.

## Nagibi i kote na ekranu

Pritisnite {{key:E}}, ili označite **Nagibi i kote na linijama obilježja** pod **Prikaz**, da vidite nagib svake linije obilježja duž svakog segmenta (s malom strelicom koja pokazuje nizbrdo) i njenu kotu u čvorovima. Prikazuju se samo na ekranu: ništa se ne dodaje u crtež, a PDF, DXF i DWG ostaju kakvi jesu. Kratki segmenti i zbijeni čvorovi ostaju bez oznaka dok ne uvećate. Odabrana linija uvijek pokazuje svoje nagibe i kote.

## U pogledu profila

Linija obilježja koja presijeca trasu prikazuje se u pogledu profila te trase, s nazivom i kotom na presjeku; linije koje teku pored nje također se mogu prikazati. Vidi [Projektovanje uzdužnog profila](topic:profile).

## Šta površine rade s njom

Odaberite **Koristi**:

| Koristi | Šta se dešava |
|---|---|
| Prelomna linija postojećeg terena | Postojeći teren prolazi kroz liniju na njenim kotama, kao nacrtana prelomna linija. |
| Izravnata u projekat | **Zatvorena** linija postaje nagnuti plato: projektovana površina unutar nje se izravnava do njene ivice. Uključite **Presijecanje s terenom** da vodite nasipe i usjeke (horizontalno na 1 vertikalno) od njene ivice do terena, kao što to radi plato; svaki nagib počinje na samoj koti ivice tamo. |
| Samo nacrtana | Ostaje na planu i izlazi u DXF, DWG i PDF (sloj C-GRAD-FEAT, 3D polilinije), ali površine je ignorišu. |

Zapremine, presjeci i 3D prikaz uključuju linije obilježja izravnate u projekat, kao platoe. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Dijeljenje linija s timom

U crtežu otvorenom iz vaših oblačnih datoteka u CadCraft Studiu, na timskom planu, odjeljak **Svojstva** projekta (ništa nije odabrano) ima dio **Tim** s {{ui:Linije tima…}}: linije koje je vaš tim podijelio, svaka sa svojom revizijom, bez prethodnog odabira linije obilježja. Odaberite liniju da je podijelite, objavite novu reviziju, preuzmete timsku ili prestanete dijeliti. Izvan te postavke odjeljak navodi šta mu treba.

## Lukovi u drugim datotekama

| Datoteka | Šta se dešava s linijom obilježja s lukovima |
|---|---|
| CivilCraft projekat | Zadržava se tačno. |
| LandXML | Zapisuje se kao plansko obilježje od linija i lukova s njihovim kotama, i čita se nazad s lukovima. Linija obilježja iz drugog programa dolazi kao **Samo nacrtana**: odaberite njen **Koristi** da je stavite u površinu. |
| DWG i DXF | 3D polilinija ne može sadržati luk, pa se linija zapisuje kao kratki dijelovi unutar 0.01 od svakog luka. CivilCraft također bilježi u crtežu koji su dijelovi bili lukovi: kad otvorite crtež kao linijsku grafiku, {{ui:Linije obilježja}} vraća linije kao linije obilježja s njihovim lukovima. Drugi programi vide običnu 3D poliliniju. |
