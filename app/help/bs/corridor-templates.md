---
title: Šabloni koridora i šabloni terena
summary: Napravite male višekratne šablone (ivičnjak i slivnik, pješački hodnik, zid, jarak), izgradite koridor iz njih po stacionaži s lijevom i desnom stranom odvojeno, podijelite trasu na više koridora i položite slojeve materijala na teren.
keywords: šablon, šabloni, biblioteka šablona, izrada šablona, tipični presjek, sklop, podsklop, komponente, šifre tačaka, završni uslov, presjek s terenom, jarak, potporni zid, ivičnjak, slivnik, pješački hodnik, zone, raspon stacionaže, više koridora, lijevo i desno, šablon terena, humus, kolovoz, podloga, polaganje, materijali, količine
from: ce70e58b
---

**Šablon** je mali poprečni presjek koji nacrtate jednom i ponovo koristite: tačke s pomacima, nagibima i šiframa tačaka, te komponente s materijalima. Koridor se može izgraditi iz šablona po stacionaži, pri čemu svaka strana ima svoje šablone kolovoza i svoj završni uslov, a isti šabloni se mogu položiti i na teren.

:::warning
Primjeri šablona su polazne tačke. Njihove vrijednosti nisu preuzete iz nikakvog standarda ili agencije. Inženjer mora provjeriti svaki šablon i svaku vrijednost koju mu date prije nego što se koristi za projekat.
:::

## Otvorite šablone

Otvorite {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni koridora…}} (ili upišite {{cmd:TEMPLATES}}). Prozor ima tri liste:

- **U ovom projektu**: šabloni koje koriste koridori i šabloni terena ovog projekta. Čuvaju se u datoteci projekta.
- **Moja biblioteka**: šabloni koji se čuvaju u ovom pregledniku i nude u svakom projektu. Koristite {{ui:Spasi u Moju biblioteku}} na šablonu projekta da ga sačuvate.
- **Primjeri**: dvije trake sa slojevima, ivičnjak i slivnik, pješački hodnik, presjek s terenom, jarak, potporni zid, humus ispod terena i kolovoz na terenu. Svaki je označen kao "Za provjeru od strane inženjera".

{{ui:Koristi u ovom projektu}} kopira šablon iz biblioteke ili primjera u projekat. {{ui:Izvezi šablone ovog projekta}} ih čuva kao datoteku `.cctemplates.json`, a {{ui:Uvezi datoteku}} čita jednu u projekat i u Moju biblioteku. Koristite datoteku da dijelite šablone ili ih prebacite na drugi računar.

## Napravite šablon

{{ui:Novi šablon}} (ili {{ui:Uredi}} na šablonu projekta) otvara uređivač šablona. Nacrtajte desnu stranu, prema van od tačke 0,0 šablona; lijeva strana koristi isti šablon prema van, ulijevo.

1. Dajte mu naziv i vrstu: **Kolovoz** (sljedeći šablon se priključuje na njegov kraj), **Završni uslov** (dodiruje teren) ili **Šablon terena**.
2. Dodajte **vrijednosti**: imenovane brojeve, kao što su širina `w` ili nagib `s`. Polje za broj bilo gdje u šablonu prima broj ili naziv vrijednosti; `-t` je vrijednost `t` s negativnim predznakom. Koridor može svakoj upotrebi šablona dati vlastite vrijednosti, pa jedan šablon ivičnjaka služi za svaku visinu ivičnjaka.
3. Dodajte **tačke** redom. Svaka se postavlja od ranije tačke (ili tačke 0,0) prema svom ograničenju:

| Ograničenje | Postavlja tačku |
|---|---|
| Pomak pod nagibom | Pomak prema van i nagib (uspon po dužini; −0.02 znači pad od 2%) |
| Pomak i uspon | Pomak i uspon |
| Pravo gore ili dolje | Samo uspon |
| Bočni nagib do terena | Od svoje tačke do terena, pri odnosu usjeka tamo gdje je teren iznad, a odnosu nasipa tamo gdje je ispod |
| Do terena | Pomak, zatim pravo gore ili dolje do terena |
| Potporni zid | Zid debljine koju date: u usjeku njegov vrh dodiruje teren na licu puta, u nasipu put ide preko njega, a njegova vanjska strana pada do terena |

   Označite **Vrh** za tačke kroz koje prolazi gotova površina. Posljednja tačka vrha je mjesto gdje počinje sljedeći šablon s te strane. **Cilj** omogućava koridoru da pomjeri tačku: njen pomak ili njena kota dolazi iz linije.
4. Dodajte **komponente**: zatvorene oblike kroz šifre tačaka (`0` je tačka 0,0), svaki s nazivom, materijalom i vrstom. Njihove površine daju zapremine.

Crtež prati svaku promjenu u tačnoj razmjeri, a lista ispod njega kaže šta nije u redu (tačka koja dodiruje teren prije kraja, vrijednost koju šablon nema, komponenta bez površine). {{ui:Dodaj u ovaj projekat}} ili {{ui:Spasi}} ga zadržava, kao jedan korak poništavanja.

## Izgradite koridor iz šablona

Odaberite trasu s koridorom i u njenim **Svojstvima** uključite {{ui:Izgradi iz šablona po stacionaži}}. Koridor počinje s primjerima dvije trake i presjeka s terenom na obje strane.

- **Zone.** Svaka zona počinje na stacionaži i ide do početka sljedeće zone. {{ui:Dodaj zonu}} dodaje jednu; promijenite njenu početnu stacionažu u njenom polju.
- **Lijevo i desno odvojeno.** Svaka strana svake zone ima svoju listu **Kolovoz**, od osovine prema van, i svoj **Završni uslov**: presjek s terenom, jarak, zid ili bilo koji šablon koji dodiruje teren. Bez završnog uslova strana se spaja s terenom na usjeku i nasipu koridora. {{ui:Kopiraj lijevo na desno}} kopira jednu stranu.
- **Vrijednosti i ciljevi.** Ispod svakog šablona s jedne strane, polje za svaku vrijednost (prazno = vlastita vrijednost šablona) i, za tačku koja prima cilj, linija trase ili linija drugog koridora koja je pomjera.
- **Od i Do** ograničavaju koridor na dio trase.

Presjeci, linije plana za svaku šifru tačke, predloženi teren, iskolčavanje i zemljani radovi slijede. Svojstva navode zapreminu svake komponente po strani i zoni (prosječne površine krajeva duž osovine). Nadvišenje i rubni ciljevi koridora se ne koriste dok je koridor izgrađen iz šablona.

## Više koridora na jednoj trasi

Pod **Koridori na ovoj trasi**, {{ui:Dodaj koridor}} dodaje koridor na ostatak trase: prvi koridor dobija završnu stacionažu na sredini (ili zadržava svoju), a novi počinje tu s posljednjom zonom šablona prvog. Svaki koridor ima svoj naziv, raspon stacionaže, šablone i zemljane radove. Isključite jedan pomoću njegove kućice {{ui:Uključeno}}. Gdje se dva raspona preklapaju, kasniji koridor se spušta preko ranijeg.

## Šabloni terena

Šablon terena polaže slojeve šablona na teren od njegove tačke 0,0: sloj ispod tačke 0,0 ide u zemlju (humus za skidanje), a sloj iznad nje leži na terenu (podloga i kolovoz na parkingu). Širine i nagibi nisu bitni, samo dubina svake komponente iznad ili ispod tačke 0,0.

Otvorite {{ui:Površina}} › {{ui:Više}} › {{ui:Šabloni terena…}} (ili upišite {{cmd:TERRAINTEMPLATES}}); blok je takođe u svojstvima projekta. {{ui:Dodaj šablon terena}} dodaje jedan s primjerom humusa. Za svaki odaberite:

- **šablon** (njegove vrijednosti se mogu promijeniti za ovaj)
- **teren**: postojeći teren ili predloženu površinu
- **oblik** koji ga siječe: cijeli teren, parcela, plato ili zatvorena linija obilježja. Više šablona terena može koristiti različite oblike na istom terenu.

Svaki sloj navodi svoju debljinu, površinu u planu i zapreminu. Zapremina je površina u planu pomnožena debljinom, pri čemu se debljina mjeri pravo dolje; površina se mjeri na mreži, a daje se i površina po nagibu. Oblici se crtaju na planu na sloju C-TOPO-TMPL. Šabloni terena ne mijenjaju predloženu površinu.

## Materijali i količine

Blok **Zemljani radovi** projekta navodi **Materijali iz šablona**: svaku komponentu koridora i svaki sloj šablona terena s njegovom zapreminom. {{ui:Pošalji u TakeoffCraft}} ih upisuje u datoteku količina nakon iskopa i nasipa, po jednu stavku, u kubnim jardima (cu yd) za projekte u stopama ili u kubnim metrima za projekte u metrima.

## Datoteke

Šabloni, zone, dodatni koridori i šabloni terena čuvaju se u datoteci projekta. Projekat koji ništa od toga ne koristi čuva se potpuno kao prije, a starije verzije CivilCraft-a otvaraju projekat koji ih koristi (ignorišu šablone i grade vlastiti sklop koridora).
