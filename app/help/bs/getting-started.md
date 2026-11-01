---
title: Početak rada s CivilCraft-om
summary: Šta CivilCraft radi, kako ga otvoriti i prvih deset minuta s primjerom lokacije: od tačaka do izohipsi, puta i spašenog projekta.
keywords: početak, prvo pokretanje, primjer lokacije, uvod, brzi početak, vodič, počni, novi projekat
from: c9b6dd8e
---

CivilCraft je aplikacija za projektovanje građevinskih radova i lokacija iz porodice CadCraft. Uzima tačke snimanja i pretvara ih u površinu (TIN) s izohipsama, zatim vam omogućava da iscrtate trase s projektovanim profilima, provučete jednostavan koridor puta, nivelišete platoe za zgrade do presjeka s terenom, provjerite mrežu gravitacionih cijevi prema vašim pravilima i pogledate zapremine iskopa i nasipa. Čita i piše LandXML, izvozi plan kao DXF i iscrtava ga u PDF.

Ako ste koristili Civil 3D, ideje će vam biti poznate: tačke, grupe tačaka, prelomne linije, trase po PI, profili po PVI, koridori, nivelacija, mreže cijevi. Način rada je drugačiji i mnogo manji: nema komandne linije, nema stilova i nema crtežne datoteke. Pročitajte jednom [Dolazak iz drugog građevinskog softvera](topic:coming-from) prije prvog pravog posla.

## Šta vam treba

- Noviji pregledač za računar: Chrome, Edge, Firefox ili Safari. Pogledajte [Pregledači](common:browsers).
- Miš ili touchpad i tastatura, ili ekran osjetljiv na dodir: crtanje tada ima dugmad na ekranu {{ui:Završi}}, {{ui:Poništi tačku}} i {{ui:Otkaži}} (vidi [Miš, touchpad i dodir](topic:keyboard#mouse-trackpad-and-touch)).
- Plan se crta u 2D na platnu pregledača. [3D prikaz](topic:site-3d) koristi WebGL grafiku pregledača; ako ne može da počne, statusna traka kaže zašto, a plan i dalje radi.
- Bez računa i bez otpremanja. Datoteke se otvaraju na vašem računaru i spašavaju kao preuzimanja. Pogledajte [Vaše datoteke](common:your-files).

:::note
CivilCraft danas radi kao rana verzija za pregledač koja se još pravi. Desktop verzije još nisu dostupne, a spašavanje u oblaku još nije dostupno. Sve što napravite ostaje na vašem računaru dok ga ne spasite ili izvezete.
:::

## Otvaranje CivilCraft-a

1. Otvorite CivilCraft u pregledaču.
2. Sačekajte da se ekran popuni: alatna traka na vrhu, panel s lijeve strane, plan u sredini i panel **Svojstva** s desne strane.
3. Na praznom planu vidite okvir naslova **Počni s tačkama snimanja**. Navodi prve korake i ima vezu {{ui:Otvori primjer lokacije}}.

Da biste kasnije koristili CivilCraft bez veze, kliknite {{ui:Spasi za rad van mreže}} na traci aplikacije i sačekajte {{ui:Spremno za rad van mreže}}. Uključuje ovu pomoć, primjer lokacije, te 3D i GIS biblioteke. Pogledajte [Van mreže](common:offline). Pritisnite {{key:F1}} ili kliknite {{ui:Pomoć}} u bilo kom trenutku da otvorite ovu pomoć pored aplikacije.

## Prvih deset minuta: primjer lokacije

Primjer lokacije je malo snimanje u US stopama: 276 tačaka u koordinatama državne ravni, greben, odvodni jarak s linijom toka i dva vrha obale. Dolazi uz aplikaciju, pa možete pratiti bez vlastite datoteke.

1. Kliknite {{ui:Otvori primjer lokacije}} u okviru na planu.
   Otvara se dijalog **Uvezi tačke**. Piše "276 tačaka pročitano kao PNEZD (iz zaglavlja reda), odvojeno zarezima." i prikazuje prve redove.
2. Kliknite {{ui:Uvezi}}.
   Plan se popuni tačkama, izohipsama i rubom površine. Statusna traka na dnu kaže da su tačke uvezene i koliko trouglova ima površina (546).
3. Pogledajte lijevi panel ispod **Tačke**. Tačke su grupisane prema prvoj riječi njihovog opisa: CP, FL, GRD, RIDGE, TBN, TBS i TREE.
4. U koloni **Površina** te tabele postavite **FL**, **RIDGE**, **TBN** i **TBS** na {{ui:Prelomna linija}}.
   Površina se odmah ponovo gradi. Podaci o **Površini** sada kažu "Linije prijeloma: 4", a izohipse se oštro savijaju uz liniju toka i greben umjesto da ih sijeku.
5. Pomjerite pokazivač preko plana. Statusna traka pokazuje I i S (istok i sjever) ispod pokazivača i kotu terena na tom mjestu.
6. Ispod **Prikaz**, postavite {{ui:Izohipse na svakih}} na 0.5 ft i uključite {{ui:Pojasi kota}}. Pojavljuje se skala boja s legendom ispod polja za označavanje. Kada završite, ponovo isključite pojase.

Sada imate postojeću površinu terena. Zatim put.

## Iscrtavanje kratkog puta

1. Pritisnite {{key:A}} (ili kliknite {{ui:Trasa}} u grupi **Projektovanje**).
2. Kliknite tri tačke preko lokacije, jednu za drugom. Crvena linija prati pokazivač i pokazuje dužinu i azimut sljedeće tangente.
3. Pritisnite {{key:Enter}} da završite.
   Trasa se pojavljuje sa stacionažom. Desni panel prikazuje **Trasu**: njenu dužinu, tabelu PI tačaka i krivinu u srednjoj PI tački (radijus 100 ft, ili manji ako 100 ft ne stane).
4. U desnom panelu, ispod **Projektovani profil**, kliknite {{ui:Počni od terena}}.
   Prikaz profila se otvara ispod plana s postojećim terenom i pravim projektovanim nagibom od kraja do kraja.
5. Pritisnite {{key:I}} da uključite {{ui:Dodaj PVI}}, zatim kliknite jednom u prikazu profila blizu sredine. Pojavljuje se PVI.
6. U tabeli PVI s desne strane, upišite dužinu krivine (na primjer 100) u polje **Krivina L** srednje PVI tačke i pritisnite {{key:Enter}}. Profil sada ima vertikalnu krivinu, s označenom vrijednošću K.
7. Ispod **Koridor** označite **Provuci sklop duž projektovanog profila**.
   Put se nivelira u teren: trake, bankine i bočni nagibi do presjeka s terenom. Blok **Zemljani radovi** prikazuje iskop i nasip.

Ne brinite o tačnim vrijednostima. Svaki broj se može promijeniti u desnom panelu, a {{key:Mod+Z}} poništava posljednju promjenu.

## Spasite svoj rad

1. Upišite naziv u polje **Naziv** na vrhu lijevog panela.
2. Pritisnite {{key:Mod+S}} (ili kliknite {{ui:Spasi}}).
   Pregledač preuzima datoteku nazvanu po lokaciji, s nastavkom `.civilcraft.json`. Sadrži tačke, postavke površine, trase, profile, koridore, platoe i cijevi.
3. Da nastavite kasnije, kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i odaberite tu datoteku, ili je prevucite na plan.

:::warning
Nema automatskog spašavanja. Ako zatvorite karticu s nespašenim promjenama, pregledač pita želite li da odete; ako odete, promjene su izgubljene. Spašavajte često.
:::

## Šta dalje

- [Uvoz tačaka snimanja](topic:import-points) sa vlastitim datotekama.
- [Izgradnja i dorada površine](topic:build-surface) s prelomnim linijama i granicom.
- [Ekran, dio po dio](topic:workspace).
- [Tasteri i miš](topic:keyboard).
