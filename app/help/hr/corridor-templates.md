---
title: Predlošci koridora i predlošci terena
summary: Izradite male višekratne predloške (rubnjak i odvodni žlijeb, nogostup, zid, jarak), izgradite koridor od njih po stacionaži s odvojenom lijevom i desnom stranom, podijelite os na više koridora i položite slojeve materijala na teren.
keywords: predložak, predlošci, knjižnica predložaka, izrada predloška, tipični presjek, sklop, podsklop, komponente, šifre točaka, uvjet završetka, nožica pokosa, jarak, potporni zid, rubnjak, odvodni žlijeb, nogostup, područja, raspon stacionaže, više koridora, lijevo i desno, predložak terena, humus, kolnik, podloga, polaganje po terenu, materijali, količine
from: ce70e58b
---

**Predložak** je mali poprečni presjek koji nacrtate jednom i ponovno koristite: točke s odmacima, nagibima i šiframa točaka te komponente s materijalima. Koridor se može izgraditi od predložaka po stacionaži, a svaka strana s vlastitim predlošcima kolnika i vlastitim uvjetom završetka, a isti predlošci mogu se položiti i na teren.

:::warning
Primjerni predlošci su okvirne polazne točke. Njihove brojke nisu preuzete iz nijednog standarda ni tijela. Inženjer mora provjeriti svaki predložak i svaku vrijednost koju mu date prije nego što se upotrijebi u projektu.
:::

## Otvaranje predložaka

Otvorite {{ui:Surface}} › {{ui:More}} › {{ui:Corridor templates…}} (ili upišite {{cmd:TEMPLATES}}). Prozor ima tri popisa:

- **U ovom projektu**: predlošci koje koriste koridori i predlošci terena ovog projekta. Spremljeni su u datoteci projekta.
- **Moja knjižnica**: predlošci koji se čuvaju u ovom pregledniku i nude u svakom projektu. Upotrijebite {{ui:Save to My library}} na predlošku projekta da ga sačuvate.
- **Primjeri**: dvije trake s dijelovima, rubnjak i odvodni žlijeb, nogostup, nožica pokosa, jarak, potporni zid, humus ispod terena i kolnik na terenu. Svaki je označen s „Za provjeru od strane inženjera“.

{{ui:Use in this project}} kopira predložak iz knjižnice ili primjera u projekt. {{ui:Export this project's templates}} sprema ih kao datoteku `.cctemplates.json`, a {{ui:Import a file}} čita jednu u projekt i u Moju knjižnicu. Datoteku koristite za dijeljenje predložaka ili prebacivanje na drugo računalo.

## Izrada predloška

{{ui:New template}} (ili {{ui:Edit}} na predlošku projekta) otvara uređivač predložaka. Nacrtajte desnu stranu, počevši od točke 0,0 predloška prema van; lijeva strana koristi isti predložak prema van, ulijevo.

1. Dajte mu naziv i vrstu: **Kolnik** (sljedeći predložak se veže na njegov kraj), **Uvjet završetka** (dodiruje teren) ili **Predložak terena**.
2. Dodajte **vrijednosti**: imenovane brojeve poput širine `w` ili nagiba `s`. Polje za broj bilo gdje u predlošku prima broj ili naziv vrijednosti; `-t` je vrijednost `t` s negativnim predznakom. Koridor može svakoj upotrebi predloška dati vlastite vrijednosti, pa jedan predložak rubnjaka služi svakoj visini rubnjaka.
3. Dodajte **točke** redom. Svaka se postavlja iz ranije točke (ili točke 0,0) prema svom ograničenju:

| Ograničenje | Postavlja točku |
|---|---|
| Odmak pod nagibom | Odmak prema van i nagib (uspon po pružanju; −0.02 znači pad 2%) |
| Odmak i uspon | Odmak i uspon |
| Ravno gore ili dolje | Samo uspon |
| Bočni nagib do terena | Od svoje točke prema terenu, pri omjeru iskopa gdje je teren iznad i omjeru nasipa gdje je ispod |
| Do terena | Odmak, pa ravno gore ili dolje do terena |
| Potporni zid | Zid zadane debljine: u iskopu njegov vrh dodiruje teren na licu ceste, u nasipu cesta prelazi preko njega i njegova vanjska ploha pada do terena |

   Označite **Vrh** za točke kroz koje prolazi gotova površina. Posljednja točka vrha je mjesto gdje počinje sljedeći predložak s te strane. **Cilj** omogućuje koridoru da pomakne točku: njen odmak ili kota dolazi iz linije.
4. Dodajte **komponente**: zatvorene oblike kroz šifre točaka (`0` je točka 0,0), svaki s nazivom, materijalom i vrstom. Njihove površine daju volumene.

Prikaz predloška prati svaku promjenu u pravom mjerilu, a popis ispod njega kaže što nije u redu (točka koja dodiruje teren prije kraja, vrijednost koju predložak nema, komponenta bez površine). {{ui:Add to this project}} ili {{ui:Save}} ga zadržava, kao jedan korak poništavanja.

## Izgradnja koridora od predložaka

Odaberite os s koridorom i u njezinim **Svojstvima** uključite {{ui:Build from templates by station}}. Koridor počinje s primjerima dviju traka i nožice pokosa s obje strane.

- **Područja.** Svako područje počinje na stacionaži i ide do početka sljedećeg područja. {{ui:Add a region}} dodaje jedno; promijenite mu početnu stacionažu u njegovu polju.
- **Lijevo i desno odvojeno.** Svaka strana svakog područja ima vlastiti popis **Kolnik**, od osi prema van, i vlastiti **Uvjet završetka**: nožicu pokosa, jarak, zid ili bilo koji predložak koji dodiruje teren. Bez uvjeta završetka strana se spaja na nožicu pokosa na iskopu i nasipu koridora. {{ui:Copy left to right}} kopira jednu stranu.
- **Vrijednosti i ciljevi.** Ispod svakog predloška s jedne strane, polje za svaku vrijednost (prazno = vlastita vrijednost predloška) i, za točku koja prima cilj, linija značajke ili linija drugog koridora koja je pomiče.
- **Od** i **Do** ograničavaju koridor na dio osi.

Presjeci, linije u tlocrtu za svaku šifru točke, projektirana površina, iskolčenje i zemljani radovi slijede. Svojstva navode volumen svake komponente po strani i području (prosječne površine krajeva duž osi). Nadvišenje i rubni ciljevi koridora se ne koriste dok je koridor izgrađen od predložaka.

## Više koridora na jednoj osi

Pod **Koridori na ovoj osi**, {{ui:Add a corridor}} dodaje koridor na ostatku osi: prvi koridor dobiva krajnju stacionažu na sredini (ili zadržava svoju), a novi počinje tu s posljednjim područjem predložaka prvoga. Svaki koridor ima vlastiti naziv, raspon stacionaže, predloške i zemljane radove. Isključite jedan okvirom {{ui:On}}. Gdje se dva raspona preklapaju, kasniji koridor se planira preko ranijeg.

## Predlošci terena

Predložak terena polaže slojeve predloška na teren od njegove točke 0,0: sloj ispod točke 0,0 ide u teren (humus za skidanje), a sloj iznad nje leži na terenu (podloga i kolnik na parkiralištu). Širine i nagibi nisu važni, samo dubina svake komponente iznad ili ispod točke 0,0.

Otvorite {{ui:Surface}} › {{ui:More}} › {{ui:Terrain templates…}} (ili upišite {{cmd:TERRAINTEMPLATES}}); blok je i u **Svojstvima** projekta. {{ui:Add a terrain template}} dodaje jedan s primjerom humusa. Za svaki odaberite:

- **predložak** (njegove vrijednosti se mogu promijeniti za ovaj),
- **teren**: postojeći teren ili projektiranu površinu,
- **oblik** koji ga reže: cijeli teren, česticu, plato ili zatvorenu liniju značajke. Više predložaka terena može koristiti različite oblike na istom terenu.

Svaki sloj navodi svoju debljinu, površinu u tlocrtu i volumen. Volumen je površina u tlocrtu puta debljina, debljina mjerena ravno prema dolje; površina se mjeri na mreži, a daje se i površina položena po nagibu. Oblici se crtaju na planu na sloju C-TOPO-TMPL. Predlošci terena ne mijenjaju projektiranu površinu.

## Materijali i količine

Blok **Zemljani radovi** projekta navodi **Materijali iz predložaka**: svaku komponentu koridora i svaki sloj predloška terena s njihovim volumenom. {{ui:Send to TakeoffCraft}} ih zapisuje u datoteku količina nakon iskopa i nasipa, po jednu stavku, u kubičnim jardima (projekti u stopama) ili kubičnim metrima.

## Datoteke

Predlošci, područja, dodatni koridori i predlošci terena spremaju se u datoteku projekta. Projekt koji ih ne koristi sprema se točno kao prije, a starije verzije CivilCrafta otvaraju projekt koji ih koristi (ignoriraju predloške i grade vlastiti sklop koridora).
