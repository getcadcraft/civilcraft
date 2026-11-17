---
title: Izradite koridor puta
summary: Uključite koridor za trasu, postavite vrijednosti traka, bankina i bočnih nagiba, i očitajte presjeke, linije presjeka s terenom i zemljane radove koje proizvodi.
keywords: nadvišenje, super, nagib u krivini, rasterećenje, izlazna dionica, tabela stopa, poprečni nagib, rotacija, koridor, sklop, podsklop, tipični presjek, put, traka, bankina, poprečni nagib, bočni nagib, presjek s terenom, usjek, nasip, presjeci, cilj, ciljevi, ciljana širina, ciljana kota, ciljani pomak, proširenje, ivica kolovoza, prati drugi koridor
from: 91303189
---

Koridor provlači jedan jednostavan tipični presjek (sklop) duž trase i njenog projektovanog uzdužnog profila, prilagođava ga postojećem terenu i dodaje rezultat predloženoj površini. Trasa može nositi više koridora na različitim rasponima stacionaže, a koridor se može izgraditi iz višekratnih šablona po stacionaži ([Šabloni koridora](topic:corridor-templates)). Jednostavan sklop ispod je isti s obje strane; da biste svakoj strani dali vlastite dijelove, vidi [Izgradnja svake strane od dijelova](topic:corridor#build-each-side-from-parts).

## Sklop

Od osovine prema van, na svakoj strani:

1. **traka** date širine, koja se spušta od kolovozne krune pod **nagibom trake**
2. **bankina** date širine pod **nagibom bankine**
3. **bočni nagib** od ivice bankine do mjesta gdje dodiruje teren: **nagib usjeka** tamo gdje je teren iznad, **nagib nasipa** tamo gdje je ispod

Početne vrijednosti su mjesta za zamjenu, nisu projektni standard:

| Vrijednost | US stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib usjeka | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

Nagibi bočnih strana su horizontalno prema vertikalno (H:V): 3 : 1 znači 3 horizontalno za 1 vertikalno.

## Izgradnja koridora

Potrebna vam je trasa bez grešaka i projektovani profil s najmanje dvije PVI tačke i bez grešaka.

1. Odaberite trasu.
2. U desnom panelu, pod **Koridor**, označite **Provucite sklop duž projektovanog profila**.
   Polja se pojavljuju i koridor se odmah gradi. Plan prikazuje ivice trake i bankine i linije presjeka s terenom; s izabranim {{ui:Projektovano (nivelisano)}} pod **Prikaz**, izohipse prikazuju novi teren.
3. Promijenite bilo koju vrijednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Nagib usjeka**, **Nagib nasipa**, **Presjek svakih**. Pritisnite {{key:Enter}} nakon svake. Usjek, nasip i razmak presjeka moraju biti veći od 0.
4. Pročitajte red ispod polja, na primjer "39 presjeka od 0+00.00 do 3+86.36; usjek 240.2 cu yd, nasip 556.0 cu yd."

Presjeci se seku na svakom koraku **Presjek svakih**, na krajevima, i na početku i kraju svake horizontalne i vertikalne krivine. Svaki presjek i linije kroz njih (osovina, ivice trake i bankine, presjek s terenom) postaju linije prijeloma projektovane površine.

Da isključite koridor, odznačite kućicu. Njegove vrijednosti se čuvaju za sljedeći put.

## Kad se ne gradi

Crveni okvir ispod polja kaže zašto:

| Poruka | Šta uraditi |
|---|---|
| "Koridor treba projektovani profil bez grešaka." | Dodajte PVI, ili popravite preklapajuće vertikalne krivine (vidi [Projektovanje vertikalnog profila](topic:profile)). |
| "Projektovani profil se ne preklapa s trasom." | Pomjerite PVI na raspon stacionaže trase. |
| "Koridor treba najmanje dva presjeka na površini." | Veći dio koridora je van postojećeg terena. |
| "4 bočna nagiba izlaze van površine prije nego što dodirnu teren." | Blizu ivice površine nagib ne može doći do terena. Držite put dalje od ivice ili smanjite visinu nasipa ili usjeka tamo. |
| "Linije presjeka s terenom koridora se sijeku (presjeci se preklapaju, na primjer s unutrašnje strane oštre krivine). Koristite veći radijus ili užu konstrukciju." | Presjeci s unutrašnje strane oštre krivine se preklapaju. Povećajte radijus ili suzite sklop. |

Koridor s problemom se ne uvodi u teren i ne računa se u zemljanim radovima.

## Koridori i platoi zajedno

Projektovana površina se gradi redom: prvo svaki koridor, zatim svaki plato. Gdje uređenje platoa preklapa koridor, plato ima prednost. Zapremine se računaju unutar svih linija presjeka s terenom zajedno; vidi [Zapremine zemljanih radova](topic:volumes).

## Nadvišenje

Kroz krivinu put se može nagnuti prema unutrašnjosti, pa je saobraćaj manje gurnut prema vani. Označite **Nadvisite krivine** pod **Nadvišenje** u **Svojstvima** trase:

- Svaka kružna krivina uzima stopu **e** iz tabele stopa: prvi red čiji radijus krivina dostiže (red s praznom stopom zadržava normalnu krunu). Tabela i **Maksimalni relativni nagib** (0.5 % na početku) su mjesta za zamjenu, nisu standard: postavite ih prema vlastitim projektnim kriterijumima. Dodajte ili uklonite redove po potrebi.
- Trake se rotiraju oko osovine. Prije krivine vanjska traka se izravnava preko **izlazne dionice** (normalna kruna ÷ e × dužina prelaza), zatim preko **prelaza** (širina trake × e ÷ nagib) vanjska traka nastavlja da se okreće dok cijeli put ne padne pod e prema unutrašnjosti; dvije trećine prelaza leži prije krivine, a jedna trećina na njoj. Poslije krivine isto se dešava obrnutim redom.
- Bankina na niskoj strani nikad nije ravnija od svoje trake; na visokoj strani zadržava svoj nagib (preklapa se).
- Tabela ispod navodi radijus, stopu, prelaz i izlaznu dionicu svake krivine i gdje počinje i završava puno nadvišenje. **Dijagram nadvišenja** crta poprečne nagibe obje trake duž stacionaža (lijeva traka puna, desna isprekidana).
- Krivina koja je prekratka da dostigne puno nadvišenje, ili dvije krivine čiji se prelazi preklapaju, navodi se u okviru iznad tabele.

Presjeci, zapremine, 3D prikaz i listovi prikazuju nagnuti put. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Ciljevi

Cilj pomjera jednu tačku jedne strane puta do linije: **Ivica kolovoza** ili **Ivica bankine**, na **Lijevoj** ili **Desnoj** strani. Svaki presjek sijeće liniju pod pravim uglom prema osovini, idući prema vani samo s te strane, pa cilj na desnoj strani nikad ne pomjera lijevu.

| Postavlja | Šta se dešava tamo gdje presjek sijeće liniju |
|---|---|
| **Širina** | Tačka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Kota** | Tačka uzima kotu linije tamo, na svom pomaku: poprečni nagib trake (ili bankine) prati tu kotu. |

Linija može biti linija obilježja (bilo koja njena **Upotreba**) ili linija drugog koridora: njegova osovina, ivice kolovoza, ivice bankine ili linije presjeka s terenom. Linija koridora prati taj koridor: promijenite drugi put i ovaj ga prati. CivilCraft prvo gradi drugi koridor; dva koridora koja bi ciljala jedan drugi u petlji odbijaju se s jedne strane, a tabela kaže koji.

1. Odaberite trasu i uključite njen koridor.
2. Pod **Ciljevi** kliknite {{ui:Dodaj cilj}}.
3. Odaberite **Stranu**, **Tačku**, šta **Postavlja** i **Do linije**. Svaka promjena je jedan korak poništavanja.

**Rezultat** kaže na koliko presjeka je linija dostignuta. Presjeci koji ne dostižu (van njenih krajeva, ili gdje je iza osovine) zadržavaju vrijednosti sklopa. Linija koja se obriše ostavlja koridor kakav je bio prije cilja, a tabela to kaže. Jedna strana može imati jedan cilj širine i jedan cilj kote za svaku tačku.

## Izgradnja svake strane od dijelova

Uključite **Izgradi svaku stranu od dijelova** pod postavkama koridora. Svaka strana tada ima vlastitu listu, od osovine prema van: trake, bankinu, slivnik, ivičnjak, pojas za zelenilo, pješački hodnik i, na kraju, bočni nagib do terena (s vlastitim odnosima usjeka i nasipa). Počnite od {{ui:Seoski put}} ili {{ui:Gradska ulica}}, dodajte i uklonite dijelove, pomjerajte ih strelicama, i {{ui:Kopiraj}} jednu stranu na drugu. Svaka promjena je jedan korak poništavanja.

Poprečni nagib je pad od puta, pa je pješački hodnik koji se odvodi prema putu negativan. Ivičnjak je lice visine koju date, vrh širine koju date i opcioni pad na zadnjoj strani. Nadvišenje okreće svaku traku u prvom redu; slivnik, ivičnjak, pojas i pješački hodnik vise s ivice izgrađenih traka. Ciljevi i dalje pomjeraju kraj traka i posljednji dio. Poprečni presjeci obilježavaju dno slivnika, vrh i zadnju stranu ivičnjaka, i ostalo. Na krivini sa spiralama prelaz je spirala: ravna kruna na TS, puno nadvišenje na SC.

## Kolovozni slojevi

Traka, bankina, slivnik, pojas za zelenilo ili pješački hodnik mogu nositi svoju konstrukciju: pod dijelom, {{ui:Dodaj sloj}} dodaje sloj s nazivom, materijalom, debljinom i vrstom (površinski, vezni, nosivi, podložni, zaštitni ili ostali), odozgo prema dolje. Slojevi ne mijenjaju površinu puta (njen vrh je projektovana površina); svaki leži pod svojim dijelom, a njegova dubina se mjeri pravo dolje. Poprečni presjeci crtaju donju ivicu svakog sloja isprekidanom linijom, a {{ui:Slojevi kolovozne konstrukcije: količine}} navodi površinu u planu i zapreminu svakog sloja (površina duž koridora iz njegovih presjeka, zapremina = površina × debljina). Izvoz IFC zapisuje svaki sloj kao vlastiti element s njegovom debljinom i materijalom (vidi [IFC izvoz i uvoz](topic:ifc)). Debljina koju upišete je vaša: CivilCraft ne dimenzioniše kolovoze.

## Šta još nije izgrađeno

Ciljevi za nagib presjeka s terenom još nisu dostupni. Za koridor koji se mijenja duž puta, s lijevom i desnom stranom odvojeno, koristite [Šablone koridora](topic:corridor-templates). Vidi [Još nije izgrađeno](topic:not-built-yet).
