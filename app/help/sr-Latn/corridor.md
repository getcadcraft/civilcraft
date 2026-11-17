---
title: Provlačenje koridora puta
summary: Uključi koridor za trasu, podesi vrednosti trake, bankine i bočnog nagiba i očitaj preseke, linije preseka sa terenom i zemljane radove koje daje.
keywords: superelevacija, super, nagib u krivini, prelaz, izlazna dužina, tabela stopa, rotacija, koridor, sklop, podsklop, tipični presek, put, traka, bankina, poprečni nagib, bočni nagib, presek sa terenom, iskop, nasip, preseci, cilj, ciljevi, cilj širine, cilj kote, cilj odstupanja, proširenje, ivica kolovoza, prati drugi koridor
from: 91303189
---

Koridor provlači jedan prost tipični presek (sklop) duž trase i njenog projektnog profila, nivelise ga u postojeći teren i rezultat dodaje predloženoj površi. Trasa može da nosi više koridora na različitim opsezima stacionaža, a koridor može da se gradi od višekratno upotrebljivih šablona po stacionaži ([Šabloni koridora](topic:corridor-templates)). Jednostavan sklop ispod je isti sa obe strane; da bi svaka strana imala sopstvene delove, videti [Izrada svake strane od delova](topic:corridor#build-each-side-from-parts).

## Sklop

Od osovine spolja, sa svake strane:

1. **traka** zadate širine, koja se spušta od krune pod **nagibom trake**
2. **bankina** zadate širine pod **nagibom bankine**
3. **bočni nagib** od ivice bankine do mesta gde se sastaje sa terenom: **nagib iskopa** gde je teren iznad, **nagib nasipa** gde je ispod

Početne vrednosti su privremene, nisu projektni standard:

| Vrednost | Američke stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib iskopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presek na svakih | 10 ft | 5 m |

Nagibi bočnih strana su horizontalno prema vertikalnom (H:V): 3 : 1 znači 3 po horizontali za 1 po vertikali.

## Izgradnja koridora

Potrebna ti je trasa bez grešaka i projektni profil sa najmanje dve PVI tačke i bez grešaka.

1. Izaberi trasu.
2. U desnom panelu, pod **Koridor**, štikliraj **Provuci sklop duž projektnog profila**.
   Polja se pojavljuju i koridor se odmah gradi. Plan prikazuje ivice trake i bankine i linije preseka sa terenom; uz {{ui:Predloženo (sa nagibom)}} izabrano pod **Prikaz**, izohipse prikazuju novi teren.
3. Promeni bilo koju vrednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Nagib iskopa**, **Nagib nasipa**, **Presek na svakih**. Posle svake pritisni {{key:Enter}}. Nagibi iskopa i nasipa i razmak preseka moraju biti veći od 0.
4. Pročitaj red ispod polja, na primer „39 preseka od 0+00.00 do 3+86.36; iskop 240.2 cu yd, nasip 556.0 cu yd.“

Preseci se seku na svakom koraku **Presek na svakih**, na krajevima i na početku i kraju svake horizontalne i vertikalne krivine. Svaki presek i linije kroz njih (osovina, ivice trake i bankine, presek sa terenom) postaju linije loma predložene površi.

Da isključiš koridor, skini štiklu sa polja. Njegove vrednosti se čuvaju za sledeći put.

## Kad se ne gradi

Crveno polje ispod polja kaže zašto:

| Poruka | Šta treba uraditi |
|---|---|
| „Koridor treba projektni profil bez grešaka.“ | Dodaj PVI tačke ili ispravi preklapajuće vertikalne krivine (videti [Projektovanje vertikalnog profila](topic:profile)). |
| „Projektni profil se ne preklapa sa trasom.“ | Pomeri PVI tačke na opseg stacionaža trase. |
| „Koridor treba najmanje dva preseka na površi.“ | Veći deo koridora je van postojećeg terena. |
| „4 bočna nagiba izlaze sa površi pre nego što se sastanu sa terenom.“ | Blizu ivice površi nagib ne može da dostigne teren. Drži put dalje od ivice ili smanji visinu nasipa ili iskopa tamo. |
| „Linije preseka sa terenom koridora se seku (preseci se preklapaju, na primer sa unutrašnje strane oštre krivine). Koristi veći radijus ili uži sklop.“ | Preseci sa unutrašnje strane oštre krivine se preklapaju. Povećaj radijus ili suzi sklop. |

Koridor sa problemom se ne nivelise u površ i ne ulazi u zemljane radove.

## Koridori i plato zajedno

Predložena površ se gradi redom: prvo svaki koridor, pa svaki plato. Tamo gde se nivelisanje plata preklapa sa koridorom, plato ima prednost. Zapremine se računaju unutar svih linija preseka sa terenom zajedno; videti [Zapremine zemljanih radova](topic:volumes).

## Superelevacija

Kroz krivinu put može da se nagne ka unutrašnjosti, pa je saobraćaj manje gurnut ka spolja. Štikliraj **Superelevacija krivina** pod **Superelevacija** u **Svojstvima** trase:

- Svaka kružna krivina uzima stopu **e** iz tabele stopa: prvi red čiji poluprečnik krivina dostiže (red sa praznom stopom zadržava normalnu krunu). Tabela i **Najveći relativni nagib** (na početku 0.5 %) su privremeni, nisu standard: postavi ih prema sopstvenim projektnim kriterijumima. Dodaj ili ukloni redove po potrebi.
- Trake se rotiraju oko osovine. Pre krivine spoljašnja traka se izravnava na **izlaznoj dužini** (normalna kruna ÷ e × prelaz), a zatim na **prelazu** (širina trake × e ÷ nagib) spoljašnja traka se nastavlja da okreće dok se cela cesta ne nagne pod e ka unutrašnjosti; dve trećine prelaza leži pre krivine, a jedna trećina na njoj. Posle krivine dešava se isto, u obrnutom redosledu.
- Bankina na niskoj strani nikad nije ravnija od svoje trake; na visokoj strani zadržava sopstveni nagib (preliva se).
- Tabela ispod navodi poluprečnik, stopu, prelaz i izlaznu dužinu svake krivine i gde počinje i završava puna superelevacija. **Dijagram superelevacije** crta poprečne nagibe obe trake duž stacionaža (leva traka punom, desna isprekidanom linijom).
- Krivina prekratka da dostigne punu superelevaciju, ili dve krivine čiji se prelazi preklapaju, navodi se u polju iznad tabele.

Preseci, zapremine, 3D prikaz i listovi prikazuju nagnut put. Svaka promena je jedan korak: {{key:Mod+Z}} je poništava.

## Ciljevi

Cilj pomera jednu tačku jedne strane puta do linije: **ivica kolovoza** ili **ivica bankine**, na **levoj** ili **desnoj** strani. Svaki presek seče liniju normalno na osovinu, idući spolja samo na toj strani, pa cilj na desnoj nikad ne pomera levu stranu.

| Postavlja | Šta se dešava tamo gde presek seče liniju |
|---|---|
| **Širinu** | Tačka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Kotu** | Tačka tamo preuzima kotu linije, na svom odstupanju: poprečni nagib trake (ili bankine) prati je. |

Linija može biti linija obeležja (kakva god joj je **Namena**) ili linija drugog koridora: njegova osovina, ivice kolovoza, ivice bankine ili linije preseka sa terenom. Linija koridora prati taj koridor: promeni drugi put i ovaj će da prati. CivilCraft prvo gradi drugi koridor; dva koridora koja bi ciljala jedan drugog u krugu se odbijaju s jedne strane, a tabela kaže koja.

1. Izaberi trasu i uključi njen koridor.
2. Pod **Ciljevi** klikni {{ui:Dodaj cilj}}.
3. Izaberi **Stranu**, **Tačku**, šta **Postavlja** i **Do linije**. Svaka promena je jedan korak za opozivanje.

**Rezultat** kaže na koliko preseka je linija dostignuta. Preseci koji je ne dostižu (preko njenih krajeva ili gde je iza osovine) zadržavaju vrednosti sklopa. Linija koja je obrisana ostavlja koridor kakav je bio pre cilja, a tabela to kaže. Jedna strana može imati jedan cilj širine i jedan cilj kote za svaku tačku.

## Izrada svake strane od delova

Uključi **Izrada svake strane od delova** pod podešavanjima koridora. Svaka strana tada ima sopstveni spisak, od osovine spolja: trake, bankinu, slivnik, ivičnjak, zelenu traku, trotoar i, na kraju, bočni nagib do terena (sa sopstvenim odnosima iskopa i nasipa). Počni od {{ui:Seoski put}} ili {{ui:Gradska ulica}}, dodaj i ukloni delove, pomeraj ih strelicama i {{ui:Kopiraj}} jednu stranu na drugu. Svaka promena je jedan korak za opozivanje.

Poprečni nagib je pad od puta, pa je trotoar koji se odvodnjava ka putu negativan. Ivičnjak je lice zadate visine, vrh zadate širine i opcioni pad na zadnjoj strani. Superelevacija okreće svaku traku u prvom redu; slivnik, ivičnjak, zelena traka i trotoar vise od ivice izgrađenih traka. Ciljevi i dalje pomeraju kraj traka i poslednjeg dela. Poprečni preseci obeležavaju liniju toka slivnika, vrh i zadnju stranu ivičnjaka i ostalo. Na krivini sa spiralama prelaz je spirala: ravna kruna u TS, puna superelevacija u SC.

## Slojevi kolovoza

Traka, bankina, slivnik, zelena traka ili trotoar mogu da nose svoj sloj građenja: pod delom, {{ui:Dodaj sloj}} dodaje sloj sa nazivom, materijalom, debljinom i vrstom (habajući, vezni, nosivi, donji nosivi, zaštitni ili drugi), odozgo nadole. Slojevi ne pomeraju površ puta (njen vrh je projektna površ); svaki leži ispod svog dela, a njegova dubina se meri pravo nadole. Poprečni preseci crtaju donju ivicu svakog sloja isprekidanom linijom, a {{ui:Slojevi kolovoza: količine}} navodi površinu u planu i zapreminu svakog sloja (površina duž koridora iz njegovih preseka, zapremina = površina × debljina). IFC izvoz upisuje svaki sloj kao sopstveni element sa debljinom i materijalom (videti [IFC izvoz i uvoz](topic:ifc)). Debljinu koju ukucaš određuješ ti: CivilCraft ne dimenzioniše kolovoze.

## Šta još nije izgrađeno

Ciljevi za nagib preseka sa terenom još nisu dostupni. Za koridor koji se menja duž puta, sa odvojenom levom i desnom stranom, koristi [Šabloni koridora](topic:corridor-templates). Videti [Još nije izgrađeno](topic:not-built-yet).
