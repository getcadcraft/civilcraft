---
title: Šabloni koridora i šabloni terena
summary: Napravi male, višekratno upotrebljive šablone (ivičnjak i slivnik, trotoar, zid, jarak), izgradi koridor od njih po stacionaži sa odvojenim levom i desnom stranom, podeli trasu na više koridora i položi slojeve materijala na teren.
keywords: šablon, šabloni, biblioteka šablona, izrada šablona, tipični presek, sklop, podsklop, komponente, kodovi tačaka, uslov kraja, presek sa terenom, jarak, potporni zid, ivičnjak, slivnik, trotoar, oblasti, opseg stacionaže, više koridora, levo i desno, šablon terena, humus, kolovoz, podloga, polaganje, materijali, količine
from: ce70e58b
---

**Šablon** je mali poprečni presek koji nacrtaš jednom i ponovo koristiš: tačke sa odstupanjima, nagibima i kodovima tačaka, i komponente sa materijalima. Koridor može da se gradi od šablona po stacionaži, pri čemu svaka strana ima sopstvene šablone kolovoza i sopstveni uslov kraja, a isti šabloni mogu da se polože na teren.

:::warning
Primeri šablona su samo privremeni. Njihovi brojevi nisu preuzeti iz nijednog standarda ili propisa. Inženjer mora da proveri svaki šablon i svaku vrednost koju mu daš pre upotrebe u projektu.
:::

## Otvaranje šablona

Otvori {{ui:Površ}} › {{ui:Više}} › {{ui:Šabloni koridora…}} (ili ukucaj {{cmd:TEMPLATES}}). Prozor ima tri spiska:

- **U ovom projektu**: šabloni koje koriste koridori i šabloni terena ovog projekta. Čuvaju se u datoteci projekta.
- **Moja biblioteka**: šabloni sačuvani u ovom pregledaču i ponuđeni u svakom projektu. Koristi {{ui:Sačuvaj u Moju biblioteku}} na šablonu projekta da ga sačuvaš.
- **Primeri**: dve trake sa slojevima, ivičnjak i slivnik, trotoar, presek sa terenom, jarak, potporni zid, humus ispod terena i kolovoz na terenu. Svaki je obeležen sa „Za proveru od strane inženjera“.

{{ui:Koristi u ovom projektu}} kopira šablon iz biblioteke ili primera u projekat. {{ui:Izvezi šablone ovog projekta}} ih čuva kao datoteku `.cctemplates.json`, a {{ui:Uvezi datoteku}} učitava jednu u projekat i u Moju biblioteku. Koristi datoteku da deliš šablone ili ih prebaciš na drugi računar.

## Pravljenje šablona

{{ui:Novi šablon}} (ili {{ui:Uređivanje}} na šablonu projekta) otvara uređivač šablona. Nacrtaj desnu stranu, spolja od tačke 0,0 šablona; leva strana koristi isti šablon spolja ulevo.

1. Daj mu naziv i vrstu: **Kolovoz** (sledeći šablon se priključuje na njegov kraj), **Uslov kraja** (sastaje se sa terenom) ili **Šablon terena**.
2. Dodaj **vrednosti**: imenovane brojeve, kao širinu `w` ili nagib `s`. Polje za broj bilo gde u šablonu prima broj ili ime vrednosti; `-t` je vrednost `t` sa negativnim predznakom. Koridor može svakoj upotrebi šablona da dâ sopstvene vrednosti, pa jedan šablon ivičnjaka služi za svaku visinu ivičnjaka.
3. Dodaj **tačke** redom. Svaka se postavlja od ranije tačke (ili tačke 0,0) prema svom ograničenju:

| Ograničenje | Postavlja tačku |
|---|---|
| Odstupanje pod nagibom | Odstupanje spolja i nagib (uspon po pređenom putu; −0.02 znači pad od 2%) |
| Odstupanje i uspon | Odstupanje i uspon |
| Pravo gore ili dole | Samo uspon |
| Bočni nagib do terena | Spolja od svoje tačke do terena, pri odnosu iskopa gde je teren iznad i odnosu nasipa gde je ispod |
| Do terena | Odstupanje, pa pravo gore ili dole do terena |
| Potporni zid | Zid zadate debljine: u iskopu se njegova gornja ivica sastaje sa terenom na licu puta; u nasipu put prelazi preko njega, a njegova spoljna strana spušta se do terena |

   Štikliraj **Vrh** za tačke kroz koje prolazi gotova površ. Poslednja tačka vrha je mesto gde počinje sledeći šablon sa te strane. **Cilj** omogućava koridoru da pomeri tačku: njeno odstupanje ili kota dolazi iz linije.
4. Dodaj **komponente**: zatvorene oblike kroz kodove tačaka (`0` je tačka 0,0), svaka sa nazivom, materijalom i vrstom. Njihove površine daju zapremine.

Crtež prati svaku promenu u pravoj razmeri, a spisak ispod kaže šta nije u redu (tačka koja se sastaje sa terenom pre kraja, vrednost koju šablon nema, komponenta bez površine). {{ui:Dodaj u ovaj projekat}} ili {{ui:Sačuvaj}} ga čuva, kao jedan korak za opozivanje.

## Izrada koridora od šablona

Izaberi trasu sa koridorom i u njenim **Svojstvima** uključi {{ui:Gradi iz šablona po stacionaži}}. Koridor počinje sa primerima dve trake i preseka sa terenom sa obe strane.

- **Oblasti.** Svaka oblast počinje na stacionaži i ide do početka sledeće. {{ui:Dodaj oblast}} dodaje jednu; promeni njenu početnu stacionažu u njenom polju.
- **Levo i desno odvojeno.** Svaka strana svake oblasti ima sopstveni spisak **Kolovoz**, od osovine spolja, i sopstveni **Uslov kraja**: presek sa terenom, jarak, zid ili bilo koji šablon koji se sastaje sa terenom. Bez uslova kraja, strana se preseca sa terenom na nagibima iskopa i nasipa koridora. {{ui:Kopiraj levo na desno}} kopira jednu stranu.
- **Vrednosti i ciljevi.** Ispod svakog šablona sa jedne strane, po jedno polje za svaku vrednost (prazno = sopstvena vrednost šablona) i, za tačku koja ima cilj, linija obeležja ili linija drugog koridora koja je pomera.
- **Od** i **Do** ograničavaju koridor na deo trase.

Preseci, linije plana za svaki kod tačke, predložena površ, iskolčavanje i zemljani radovi prate sve to. Svojstva navode zapreminu svake komponente po strani i oblasti (prosečne površine krajnjih preseka duž osovine). Superelevacija i ivični ciljevi koridora se ne koriste dok je koridor izgrađen od šablona.

## Više koridora na jednoj trasi

Pod **Koridori na ovoj trasi** {{ui:Dodaj koridor}} dodaje koridor na ostatak trase: prvom koridoru se dodeljuje krajnja stacionaža na sredini (ili zadržava svoju), a novi počinje tu sa poslednjom oblašću šablona prvog. Svaki koridor ima sopstveni naziv, opseg stacionaža, šablone i zemljane radove. Isključi jedan njegovim poljem {{ui:Uključeno}}. Tamo gde se dva opsega preklapaju, kasniji koridor nivelise preko ranijeg.

## Šabloni terena

Šablon terena polaže slojeve šablona na teren od svoje tačke 0,0: sloj ispod tačke 0,0 ide u zemlju (humus za skidanje), a sloj iznad nje leži na terenu (podloga i kolovoz na parkingu). Širine i nagibi nisu bitni, samo dubina svake komponente iznad ili ispod tačke 0,0.

Otvori {{ui:Površ}} › {{ui:Više}} › {{ui:Šabloni terena…}} (ili ukucaj {{cmd:TERRAINTEMPLATES}}); blok je i u **Svojstvima** projekta. {{ui:Dodaj šablon terena}} dodaje jedan sa primerom humusa. Za svaki izaberi:

- **šablon** (njegove vrednosti mogu da se promene samo za ovaj),
- **teren**: postojeći teren ili predložena površ,
- **oblik** koji ga seče: ceo teren, parcela, plato ili zatvorena linija obeležja. Više šablona terena može na istom terenu da koristi različite oblike.

Svaki sloj navodi debljinu, površinu u planu i zapreminu. Zapremina je površina u planu puta debljina, a debljina se meri pravo nadole; površina se meri na mreži, a daje se i položena (nagnuta) površina. Oblici se crtaju u planu na sloju C-TOPO-TMPL. Šabloni terena ne menjaju predloženu površ.

## Materijali i količine

Blok zemljanih radova projekta navodi **Materijali iz šablona**: svaku komponentu koridora i svaki sloj šablona terena sa zapreminom. {{ui:Pošalji u TakeoffCraft}} ih upisuje u datoteku količina posle iskopa i nasipa, po jednu stavku, u kubnim jardima (projekti u stopama) ili kubnim metrima.

## Datoteke

Šabloni, oblasti, dodatni koridori i šabloni terena čuvaju se u datoteci projekta. Projekat koji ne koristi nijedno od toga čuva se tačno kao ranije, a starije verzije CivilCraft-a otvaraju projekat koji ih koristi (ignorišu šablone i grade sopstveni sklop koridora).
