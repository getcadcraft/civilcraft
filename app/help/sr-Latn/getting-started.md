---
title: Početak rada sa CivilCraft-om
summary: Šta CivilCraft radi, kako se otvara i prvih deset minuta sa primerom lokacije, od tačaka do izohipsi, puta i sačuvanog projekta.
keywords: početak, prvo pokretanje, primer lokacije, uvod, brz početak, vodič, počni, novi projekat
from: c9b6dd8e
---

CivilCraft je aplikacija za projektovanje građevinskih i lokalnih terena iz porodice CadCraft. Uzima geodetske tačke i pretvara ih u površ (TIN) sa izohipsama, zatim dozvoljava da postavite trase sa projektovanim profilima, provučete jednostavan koridor puta, položite građevinske platoe do terena, proverite mrežu cevi na gravitacioni tok prema svojim pravilima i vidite zapremine iskopa i nasipa. Čita i piše LandXML, izvozi plan u DXF i štampa ga u PDF.

Ako ste koristili Civil 3D, ideje će vam biti poznate: tačke, grupe tačaka, linije loma, trase preko PI-jeva, profili preko PVI-jeva, koridori, nivelacija, mreže cevi. Način rada je drugačiji i mnogo manji: nema komandne linije, nema stilova i nema crtačke datoteke. Pročitajte [Dolazak iz drugog građevinskog softvera](topic:coming-from) jednom pre prvog pravog posla.

## Šta vam treba

- Noviji desktop pregledač: Chrome, Edge, Firefox ili Safari. Pogledajte [Pregledače](common:browsers).
- Miš ili tačpad i tastatura, ili ekran osetljiv na dodir: crtanje tu ima dugmad na ekranu {{ui:Završi}}, {{ui:Opozovi tačku}} i {{ui:Otkaži}} (pogledajte [Miš, tačpad i dodir](topic:keyboard#mouse-trackpad-and-touch)).
- Plan se crta u 2D preko platna pregledača. [3D prikaz](topic:site-3d) koristi WebGL pregledača; ako ne može da se pokrene, statusna traka kaže zašto, a plan i dalje radi.
- Nema naloga i nema otpremanja. Datoteke se otvaraju na vašem računaru i čuvaju kao preuzimanja. Pogledajte [Vaše datoteke](common:your-files).

:::note
CivilCraft danas radi kao rana verzija za pregledač koja se još pravi. Desktop verzije još nisu dostupne, a čuvanje u oblaku još nije dostupno. Sve što napravite ostaje na vašem računaru dok to ne sačuvate ili izvezete.
:::

## Otvaranje CivilCraft-a

1. Otvorite CivilCraft u pregledaču.
2. Sačekajte da se ekran popuni: traka sa alatkama pri vrhu, panel levo, plan u sredini i panel **Svojstva** desno.
3. Na praznom planu vidite okvir pod naslovom **Počni sa geodetskim tačkama**. Navodi prve korake i ima link {{ui:Otvori primer lokacije}}.

Da kasnije koristite CivilCraft bez veze, kliknite {{ui:Sačuvaj za rad van mreže}} u traci aplikacije i sačekajte {{ui:Spremno za rad van mreže}}. Sadrži ovu pomoć, primer lokacije i biblioteke za 3D i GIS. Pogledajte [Rad van mreže](common:offline). Pritisnite {{key:F1}} ili kliknite {{ui:Pomoć}} u bilo kom trenutku da otvorite ovu pomoć uz aplikaciju.

## Prvih deset minuta: primer lokacije

Primer lokacije je mali geodetski snimak u američkim stopama: 276 tačaka u koordinatama državne ravni, greben, udubljenje sa linijom toka i dve gornje ivice obale. Dolazi uz aplikaciju, pa možete da pratite bez sopstvene datoteke.

1. Kliknite {{ui:Otvori primer lokacije}} u okviru na planu.
   Otvara se dijalog **Uvezi tačke**. Piše „276 tačaka pročitano kao PNEZD (iz reda zaglavlja), odvojeno zarezima.” i prikazuje prve redove.
2. Kliknite {{ui:Uvezi}}.
   Plan se puni tačkama, izohipsama i ivicom površi. Statusna traka pri dnu kaže da su tačke uvezene i koliko trouglova ima površ (546).
3. Pogledajte levi panel pod **Tačke**. Tačke su grupisane po prvoj reči opisa: CP, FL, GRD, RIDGE, TBN, TBS i TREE.
4. U koloni **Površ** te tabele podesite **FL**, **RIDGE**, **TBN** i **TBS** na {{ui:Linija loma}}.
   Površ se odmah ponovo gradi. **Podaci o površi** sada kažu „Linije loma: 4”, a izohipse se naglo savijaju duž linije toka i grebena umesto da ih seku.
5. Pomerite pokazivač preko plana. Statusna traka pokazuje istočnu i severnu koordinatu ispod pokazivača i kotu terena tamo.
6. Pod **Prikaz** podesite {{ui:Konture na svakih}} na 0.5 ft i uključite {{ui:Pojasevi kota}}. Pojavljuje se paleta boja sa legendom ispod polja za štiklu. Kada završite, isključite pojaseve.

Sada imate površ postojećeg terena. Sledeće, put.

## Postavljanje kratkog puta

1. Pritisnite {{key:A}} (ili kliknite {{ui:Trasa}} u grupi **Projektovanje**).
2. Kliknite tri tačke preko lokacije, jednu za drugom. Crvena linija prati pokazivač i prikazuje dužinu i pravac sledeće tangente.
3. Pritisnite {{key:Enter}} da završite.
   Pojavljuje se trasa sa stacionažom. Desni panel prikazuje **Trasa**: njenu dužinu, tabelu PI-jeva i krivinu na srednjem PI-ju (radijus 100 ft, ili manji ako 100 ft ne staje).
4. U desnom panelu, pod **Projektovani profil**, kliknite {{ui:Počni od terena}}.
   Prikaz profila se otvara ispod plana, sa postojećim terenom i pravom projektovanom kotom od kraja do kraja.
5. Pritisnite {{key:I}} da uključite {{ui:Dodaj PVI}}, zatim kliknite jednom u prikazu profila blizu sredine. Pojavljuje se PVI.
6. U tabeli PVI-jeva desno, upišite dužinu krivine (na primer 100) u polje **Krivina L** srednjeg PVI-ja i pritisnite {{key:Enter}}. Profil sada ima vertikalnu krivinu, sa oznakom njene K vrednosti.
7. Pod **Koridor** štiklirajte **Provuci sklop duž projektovanog profila**.
   Put se useca u teren: trake, bankine i kosine do terena. Prikaz **Zemljani radovi** pokazuje iskop i nasip.

Ne brinite o tačnim vrednostima. Svaki broj može da se promeni u desnom panelu, a {{key:Mod+Z}} opoziva poslednju promenu.

## Čuvanje rada

1. Upišite ime u **Naziv** na vrhu levog panela.
2. Pritisnite {{key:Mod+S}} (ili kliknite {{ui:Sačuvaj}}).
   Pregledač preuzima datoteku nazvanu po lokaciji, sa nastavkom `.civilcraft.json`. Sadrži tačke, podešavanja površi, trase, profile, koridore, platoe i cevi.
3. Da nastavite kasnije, kliknite {{ui:Otvori}} (ili pritisnite {{key:Mod+O}}) i izaberite tu datoteku, ili je prevucite na plan.

:::warning
Nema automatskog čuvanja. Ako zatvorite karticu sa nesačuvanim izmenama, pregledač pita da li želite da odete; ako odete, izmene su izgubljene. Čuvajte često.
:::

## Gde dalje

- [Uvezite geodetske tačke](topic:import-points) sopstvenim datotekama.
- [Izgradite i doradite površ](topic:build-surface) sa linijama loma i granicom.
- [Ekran, deo po deo](topic:workspace).
- [Tasteri i miš](topic:keyboard).
