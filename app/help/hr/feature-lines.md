---
title: Značajne linije
summary: Crtajte 3D linije koje nagibate vrh po vrh, pravite stepenaste odmake i koristite ih kao prijelomnice terena ili kao nagnute platoe u projektu.
keywords: luk, krivulja, radijus, 3D luk, uzvojnica, zakrivljeni rub, prikaz nagiba, prikaz visina, strelice nagiba, značajna linija, nagib, visina, stepenasti odmak, odmak, prijelomnica, rub, jarak, nasip, nagnuti plato, nožica pokosa, izravnavanje, 3D polilinija
from: d55b25fb
---

Značajna linija je linija s visinom u svakom vrhu: rub ceste, linija toka jarka, vrh nasipa, rub nagnutog platoa. Visine postavljate brojem ili nagibom, kopirate je u stranu s korakom gore ili dolje, i birate što tereni rade s njom.

## Crtanje jedne

1. Odaberite **Teren** › {{ui:Više}} › {{ui:Značajna linija}}, ili pritisnite {{key:L}}.
2. Kliknite njezine vrhove na tlocrtu. Klik na geodetsku točku preuzima položaj i visinu te točke; bilo gdje drugdje vrh preuzima visinu postojećeg terena na tom mjestu.
3. Pritisnite {{key:Enter}} za završetak otvorene linije, ili ponovno kliknite prvi vrh da je zatvorite.

Nova linija je odabrana i počinje kao prijelomnica postojećeg terena, ležeći na terenu.

## Lukovi

Dionica može biti luk u tlocrtu čiji krajevi leže na različitim visinama: zaobljenje ruba ceste, zakrivljen jarak, rampa koja skreće. Njezin nagib teče ravnomjerno duž luka, a njezina duljina mjeri se duž krivulje.

- **Tijekom crtanja:** pritisnite {{key:C}} (na ekranu osjetljivom na dodir, {{ui:Luk}} u traci iznad tlocrta) da uključite lukove. Nakon vrha kliknite točku na krivulji, zatim kliknite mjesto gdje luk završava. Ponovno pritisnite {{key:C}} za ravne dionice. {{key:Backspace}} prvo odbacuje točku na krivulji.
- **Naknadno:** u **Svojstvima** upišite radijus i smjer skretanja u polje **Luk** vrha, na primjer `50 L` ili `50 R` (lijevo ili desno dok hodate linijom), i pritisnite {{key:Enter}}. Ispraznite polje da dionica ponovno bude ravna. Radijus manji od pola dionice se odbija.

Odabrana linija prikazuje radijus svakog luka uz njegov nagib. **Duljina** je duž lukova u tlocrtu; **3D duljina** uključuje i uspon i pad. Stepenasti odmaci zadržavaju lukove: luk na vanjskoj strani zavoja raste, onaj na unutarnjoj se smanjuje, a odmak preko središta luka se odbija.

Tereni, 3D prikaz te DXF i DWG uzimaju svaki luk kao kratke ravne dijelove koji ostaju unutar 0.01 od krivulje. LandXML ih zadržava kao lukove (vidi **Lukovi u drugim datotekama** u nastavku).

## Postavljanje visina i nagiba

**Svojstva** popisuju vrhove s njihovom udaljenosti duž linije, njihovom **Visinom** i **Nagibom do sljedećeg** (u postotcima). Upišite jedno od toga i pritisnite {{key:Enter}}:

- Visina pomiče samo taj vrh.
- Nagib postavlja visinu na udaljenom kraju svoje dionice; vrhovi nakon njega ostaju gdje jesu, pa se nagib sljedeće dionice mijenja.

Također u **Svojstvima**:

| Radnja | Što čini |
|---|---|
| **Podigni ili spusti sve za** | Dodaje visinu koju upišete svakom vrhu. |
| {{ui:Visine iz terena}} | Vraća svaki vrh na postojeći teren (vrhovi izvan terena zadržavaju svoje i navode se). |
| {{ui:Jedan nagib, od prvog do zadnjeg}} | Zadržava prvu i zadnju visinu, a vrhove između postavlja na jedan ravnomjeran nagib. |

Odabrana linija na tlocrtu prikazuje svoje visine u vrhovima i svoje nagibe duž dionica. Povucite vrh alatom {{ui:Odaberi}} da ga pomaknete; njegova visina ostaje.

## Stepenasti odmaci

Pod **Stepenasti odmak** upišite **Udaljenost** (pozitivno desno od smjera linije, negativno lijevo), zatim visinu (za koliko gore ili dolje) ili nagib u postotcima, i kliknite {{ui:Napravi liniju odmaka}}. Kopija je nova značajna linija: na primjer leđa ruba ceste 0.5 ft u stranu i 0.5 ft više, ili rub jarka 6 ft van na 2 %. Udaljenost koja bi kopiju preklopila preko same sebe na uskom zavoju se odbija.

## Nagibi i visine na zaslonu

Pritisnite {{key:E}} ili označite **Nagibi i visine na značajnim linijama** pod **Prikaz** da vidite nagib svake značajne linije duž svake dionice (s malom strelicom koja pokazuje nizbrdo) i njezinu visinu u vrhovima. Prikazuju se samo na zaslonu: ništa se ne dodaje crtežu, a PDF, DXF i DWG ostaju kakvi jesu. Kratke dionice i zgusnuti vrhovi ostaju bez oznaka dok ne uvećate prikaz. Odabrana linija uvijek prikazuje vlastite nagibe i visine.

## U prikazu profila

Značajna linija koja presijeca os trase prikazuje se u uzdužnom profilu te osi, s nazivom i visinom na presjeku; linije koje teku uz nju mogu se također prikazati. Vidi [Projektiranje uzdužnog profila](topic:profile).

## Što teren radi s njom

Odaberite **Namjenu**:

| Namjena | Što se događa |
|---|---|
| Prijelomnica postojećeg terena | Postojeći teren prolazi kroz liniju na svojim visinama, kao nacrtana prijelomnica. |
| Izravnato u projekt | **Zatvorena** linija postaje nagnuti plato: projektirani teren unutar nje izravnava se do njezina ruba. Uključite **Nožicu pokosa do terena** da od njezina ruba do terena vode kosine iskopa i nasipa (1 horizontalno prema 1 vertikalno), kao kod platoa; svaka kosina počinje na vlastitoj visini ruba na tom mjestu. |
| Samo nacrtano | Ostaje na tlocrtu i izlazi u DXF, DWG i PDF (sloj C-GRAD-FEAT, 3D polilinije), ali je tereni zanemaruju. |

Volumeni, presjeci i 3D prikaz uključuju značajne linije izravnate u projekt, kao platoe. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Dijeljenje linija s timom

U crtežu otvorenom iz vaših datoteka u oblaku u programu CadCraft Studio, uz timski plan, **Svojstva** projekta (ništa nije odabrano) imaju odjeljak **Tim** s {{ui:Linije tima…}}: linije koje je vaš tim podijelio, svaka sa svojom revizijom, bez prethodnog odabira značajne linije. Odaberite liniju da je podijelite, objavite novu reviziju, preuzmete timsku ili prestanete dijeliti. Izvan te postavke odjeljak navodi što mu treba.

## Lukovi u drugim datotekama

| Datoteka | Što se događa sa značajnom linijom s lukovima |
|---|---|
| CivilCraft projekt | Čuva se točno. |
| LandXML | Zapisuje se kao značajka tlocrta s linijama i lukovima i njihovim visinama, te se čita natrag s lukovima. Značajna linija iz drugog programa uvozi se kao **Samo nacrtano**: odaberite njezinu **Namjenu** da je stavite u teren. |
| DWG i DXF | 3D polilinija ne može sadržavati luk, pa se linija zapisuje kao kratki dijelovi unutar 0.01 od svakog luka. CivilCraft u crtežu također bilježi koji su dijelovi bili lukovi: kada otvorite crtež kao linije, {{ui:Značajne linije}} vraća linije natrag kao značajne linije s njihovim lukovima. Drugi programi vide običnu 3D poliliniju. |
