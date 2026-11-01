---
title: Prvi koraci s CivilCraftom
summary: Što CivilCraft radi, kako ga otvoriti i prvih deset minuta s primjerom lokacije: od točaka do izohipsi, ceste i spremljenog projekta.
keywords: početak, prvo pokretanje, primjer lokacije, uvod, brzi početak, vodič, početi, novi projekt
from: c9b6dd8e
---

CivilCraft je aplikacija za građevinsko projektiranje i uređenje terena iz obitelji CadCraft. Uzima geodetske točke i pretvara ih u teren (TIN) s izohipsama, zatim vam omogućuje trasiranje osi s projektnim profilima, provlačenje jednostavnog cestovnog koridora, planiranje platoa zgrada do nožice pokosa, provjeru gravitacijske cijevne mreže prema vašim pravilima i pregled volumena iskopa i nasipa. Čita i piše LandXML, izvozi tlocrt kao DXF i ispisuje ga u PDF.

Ako ste koristili Civil 3D, ideje će vam biti poznate: točke, skupine točaka, prijelomnice, osi prema PI, profili prema PVI, koridori, planiranje terena, cijevne mreže. Način rada je drukčiji i mnogo manji: nema naredbenog retka, stilova ni datoteke crteža. Jednom pročitajte [Dolazite iz drugog softvera za građevinarstvo](topic:coming-from) prije prvog pravog posla.

## Što vam treba

- Aktualni preglednik za računalo: Chrome, Edge, Firefox ili Safari. Vidi [Preglednici](common:browsers).
- Miš ili trackpad i tipkovnica, ili zaslon osjetljiv na dodir: crtanje ondje ima gumbe {{ui:Završi}}, {{ui:Poništi točku}} i {{ui:Odustani}} na zaslonu (vidi [Miš, trackpad i dodir](topic:keyboard#mouse-trackpad-and-touch)).
- Tlocrt se crta u 2D-u pomoću canvasa preglednika. [3D prikaz](topic:site-3d) koristi WebGL grafiku preglednika; ako se ne može pokrenuti, statusna traka kaže zašto, a tlocrt i dalje radi.
- Bez računa i bez učitavanja. Datoteke se otvaraju na vašem računalu i spremaju kao preuzimanja. Vidi [Vaše datoteke](common:your-files).

:::note
CivilCraft danas radi kao rana verzija u pregledniku koja se još izrađuje. Verzije za radnu površinu još nisu dostupne, a spremanje u oblaku još nije dostupno. Sve što izradite ostaje na vašem računalu dok ne spremite ili izvezete.
:::

## Otvaranje CivilCrafta

1. Otvorite CivilCraft u pregledniku.
2. Pričekajte da se zaslon popuni: alatna traka preko vrha, ploča lijevo, tlocrt u sredini i ploča **Svojstva** desno.
3. Na praznom tlocrtu vidite okvir naslovljen **Počnite s geodetskim točkama**. Navodi prve korake i ima vezu {{ui:Otvorite primjer lokacije}}.

Da CivilCraft kasnije koristite bez veze, kliknite {{ui:Spremi za offline}} na traci aplikacije i pričekajte {{ui:Spremno za offline}}. Uključuje ovu pomoć, primjer lokacije te 3D i GIS knjižnice. Vidi [Offline](common:offline). Pritisnite {{key:F1}} ili kliknite {{ui:Pomoć}} u bilo kojem trenutku da ovu pomoć otvorite pored aplikacije.

## Vaših prvih deset minuta: primjer lokacije

Primjer lokacije je mala izmjera u američkim stopama: 276 točaka u koordinatama državne ravnine, hrbat, jarak s dnom i dva ruba pokosa. Dolazi s aplikacijom, pa možete pratiti bez vlastite datoteke.

1. Kliknite {{ui:Otvorite primjer lokacije}} u okviru na tlocrtu.
   Otvara se dijaloški okvir **Uvoz točaka**. Kaže „276 točaka pročitano kao PNEZD (iz retka zaglavlja), odvojeno: zarezima.“ i prikazuje prve retke.
2. Kliknite {{ui:Uvezi}}.
   Tlocrt se puni točkama, izohipsama i rubom terena. Statusna traka pri dnu kaže da su točke uvezene i koliko trokuta teren ima (546).
3. Pogledajte lijevu ploču pod **Točke**. Točke su grupirane prema prvoj riječi njihova opisa: CP, FL, GRD, RIDGE, TBN, TBS i TREE.
4. U stupcu **Teren** te tablice postavite **FL**, **RIDGE**, **TBN** i **TBS** na {{ui:Prijelomnica}}.
   Teren se odmah ponovno izgrađuje. Podaci o **Terenu** sada kažu „Prijelomnice: 4“, a izohipse oštro skreću uz dno jarka i hrbat umjesto da ih presijecaju.
5. Pomaknite pokazivač preko tlocrta. Statusna traka prikazuje istok i sjever ispod pokazivača te visinu terena ondje.
6. Pod **Prikaz** postavite {{ui:Izohipse svakih}} na 0,5 ft i uključite {{ui:Visinski pojasevi}}. Pojavljuje se skala boja s legendom ispod potvrdnih okvira. Ponovno isključite pojaseve kad završite.

Sada imate postojeći teren. Sljedeće, cesta.

## Trasiranje kratke ceste

1. Pritisnite {{key:A}} (ili kliknite {{ui:Os trase}} u skupini **Projekt**).
2. Kliknite tri točke preko lokacije, jednu za drugom. Crvena linija prati pokazivač i prikazuje duljinu i smjerni kut sljedećeg pravca.
3. Pritisnite {{key:Enter}} za završetak.
   Os trase pojavljuje se sa stacionažom. Desna ploča prikazuje **Os trase**: njezinu duljinu, tablicu PI i luk na srednjem PI (radijus 100 ft, ili manji ako 100 ft ne stane).
4. U desnoj ploči, pod **Projektni profil**, kliknite {{ui:Započni od terena}}.
   Prikaz profila otvara se ispod tlocrta s postojećim terenom i ravnom projektiranom niveletom od kraja do kraja.
5. Pritisnite {{key:I}} da uključite {{ui:Dodaj PVI}}, zatim jednom kliknite u prikazu profila blizu sredine. Pojavljuje se PVI.
6. U tablici PVI desno upišite duljinu luka (na primjer 100) u okvir **Duljina L** srednjeg PVI-ja i pritisnite {{key:Enter}}. Profil sada ima vertikalno zaobljenje s označenom vrijednošću K.
7. Pod **Koridor** označite **Provuci sklop duž projektnog profila**.
   Cesta se ukopava u teren: trake, bankine i pokosi do nožice. Blok **Zemljani radovi** prikazuje iskop i nasip.

Ne brinite o točnim vrijednostima. Svaki se broj može promijeniti u desnoj ploči, a {{key:Mod+Z}} poništava posljednju promjenu.

## Spremanje rada

1. Upišite naziv u **Naziv** pri vrhu lijeve ploče.
2. Pritisnite {{key:Mod+S}} (ili kliknite {{ui:Spremi}}).
   Preglednik preuzima datoteku nazvanu prema lokaciji, s nastavkom `.civilcraft.json`. Sadrži točke, postavke terena, osi, profile, koridore, platoe i cijevi.
3. Da nastavite kasnije, kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i odaberite tu datoteku ili je ispustite na tlocrt.

:::warning
Nema automatskog spremanja. Ako zatvorite karticu s nespremljenim promjenama, preglednik pita želite li otići; ako odete, promjene su izgubljene. Spremajte često.
:::

## Kamo dalje

- [Uvoz geodetskih točaka](topic:import-points) iz vlastitih datoteka.
- [Izgradnja i doradba terena](topic:build-surface) prijelomnicama i granicom.
- [Zaslon, dio po dio](topic:workspace).
- [Tipke i miš](topic:keyboard).
