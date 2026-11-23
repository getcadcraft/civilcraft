---
title: Koridor puta duž trase
summary: Uključi koridor za osu trase, postavi vrijednosti za traku, bankinu i nagib strane, te pročitaj presjeke, linije dnevnog svjetla i zemljane radove koje daje.
keywords: raskrsnica, križanje, put koji susreće put, sporedni put, T raskrsnica, ukrštanje, kota platoa, spajanje, veza, nadvišenje, super, nagib u krivini, izlazna dionica, prelaz, tabela stopa, poprečni nagib, rotacija, koridor, sklop, tipičan presjek, put, traka, bankina, poprečni nagib, nagib strane, dnevno svjetlo, iskop, nasip, presjeci, cilj, ciljevi, cilj širine, cilj kote, cilj ofseta, proširenje, ivica kolovoza, prati drugi koridor
from: 6dcb92b3
---

Koridor provlači jedan jednostavan tipičan presjek (sklop) duž osi trase i njenog projektovanog profila, uklapa ga u postojeći teren i dodaje rezultat na projektovanu površinu. Jedna osa trase može nositi više koridora na različitim rasponima stacionaža, a koridor se može izgraditi od višekratnih šablona po stacionaži ([Šabloni koridora](topic:corridor-templates)). Jednostavan sklop ispod je isti na obje strane; da bi svaka strana imala svoje dijelove, pogledaj [Izgradi svaku stranu od dijelova](topic:corridor#build-each-side-from-parts).

## Sklop

Od osovine prema van, na svakoj strani:

1. **traka** zadate širine, koja se spušta od tjemena na **nagibu trake**
2. **bankina** zadate širine na **nagibu bankine**
3. **nagib strane** od ivice bankine do mjesta gdje dodiruje teren: **nagib iskopa** tamo gdje je teren iznad, **nagib nasipa** tamo gdje je ispod

Početne vrijednosti su privremene, nisu projektantski standard:

| Vrijednost | US stope | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib iskopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presjek svakih | 10 ft | 5 m |

Nagibi strana su horizontalno prema vertikalnom (H:V): 3 : 1 znači 3 horizontalno za 1 vertikalno.

## Izgradi koridor

Potrebna je osa trase bez grešaka i projektovani profil s najmanje dva PVI i bez grešaka.

1. Odaberi osu trase.
2. U desnom panelu, pod **Koridor**, označi **Provuci sklop duž projektovanog profila**.
   Polja se pojavljuju i koridor se odmah izgrađuje. Plan prikazuje ivice trake i bankine te linije dnevnog svjetla; kada je pod **Prikaz** odabrano {{ui:Projektovano (nivelisano)}}, izohipse prikazuju novi teren.
3. Promijeni bilo koju vrijednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Nagib iskopa**, **Nagib nasipa**, **Presjek svakih**. Nakon svake pritisni {{key:Enter}}. Nagibi iskopa i nasipa i razmak presjeka moraju biti veći od 0.
4. Pročitaj red ispod polja, na primjer „39 presjeka od 0+00.00 do 3+86.36; iskop 240.2 cu yd, nasip 556.0 cu yd.“

Presjeci se seku na svakom koraku **Presjek svakih**, na krajevima, te na početku i kraju svake horizontalne i vertikalne krivine. Svaki presjek i linije kroz njih (osovina, ivice trake i bankine, dnevno svjetlo) postaju linije loma projektovane površine.

Da isključiš koridor, odznači polje. Njegove vrijednosti se čuvaju za sljedeći put.

## Kada se ne izgrađuje

Crveni okvir ispod polja kaže zašto:

| Poruka | Šta uraditi |
|---|---|
| Koridor treba projektovani profil bez grešaka. | Dodaj PVI ili ispravi preklapajuće vertikalne krivine (pogledaj [Projektovanje vertikalnog profila](topic:profile)). |
| Projektovani profil se ne preklapa s osom trase. | Pomjeri PVI na raspon stacionaža osi trase. |
| Koridor treba najmanje dva presjeka na površini. | Veći dio koridora je van postojećeg terena. |
| 4 nagiba strana izlaze s površine prije nego što dodirnu teren. | Blizu ivice površine nagib ne može doseći teren. Drži put dalje od ivice ili spusti visinu nasipa ili iskopa na tom mjestu. |
| Linije dnevnog svjetla koridora se ukrštaju (presjeci se preklapaju, na primjer na unutrašnjoj strani oštre krivine). | Presjeci na unutrašnjoj strani oštre krivine se preklapaju. Povećaj poluprečnik ili sužen sklop. |

Koridor sa problemom se ne uklapa u teren i ne ulazi u zemljane radove.

## Koridori i platoi zajedno

Projektovana površina se gradi redom: prvo svi koridori, pa zatim svi platoi. Tamo gdje se nivelacija platoa preklapa s koridorom, plato ima prednost. Tamo gdje kasniji element preklapa put, zamjenjuje se samo dio puta unutar linije dnevnog svjetla kasnijeg elementa; ostatak puta i svaka linija loma terena koju put presijeca zadržava svoj oblik. Zapremine se računaju unutar svih linija dnevnog svjetla zajedno; pogledaj [Zapremine zemljanih radova](topic:volumes).

## Nadvišenje

Kroz krivinu put se može nagnuti prema unutrašnjosti, pa je saobraćaj manje gurnut prema vani. Označi **Nadvisi krivine** pod **Nadvišenje** u **Svojstvima** osi trase:

- Svaka kružna krivina uzima stopu **e** iz tabele stopa: prvi red čiji poluprečnik krivina dostiže (red s praznom stopom zadržava normalni poprečni nagib). Tabela i **Najveći relativni nagib** (0.5 % na početku) su privremeni, nisu standard: postavi ih prema svojim projektantskim kriterijumima. Dodaj ili ukloni redove po potrebi.
- Trake se rotiraju oko osovine. Prije krivine vanjska traka se izravnava preko **izravnavanja** (normalni poprečni nagib ÷ e × prelazna dionica), zatim preko **prelazne dionice** (širina trake × e ÷ nagib) vanjska traka nastavlja da se okreće dok cijeli put ne padne pod nagibom e prema unutra; dvije trećine prelazne dionice leži prije krivine, a jedna trećina na njoj. Nakon krivine isto se događa obrnutim redom.
- Bankina na nižoj strani nikada nije ravnija od svoje trake; na višoj strani zadržava svoj nagib (prelazi preko).
- Tabela ispod navodi poluprečnik, stopu, prelaznu dionicu i izravnavanje svake krivine te mjesto gdje počinje i završava puno nadvišenje. **Dijagram nadvišenja** crta poprečne nagibe obje trake duž stacionaža (lijeva traka puna, desna isprekidana).
- Krivina prekratka da dostigne puno nadvišenje, ili dvije krivine čiji se prelazi preklapaju, navodi se u okviru iznad tabele.

Presjeci, zapremine, 3D prikaz i listovi svi prikazuju nagnuti put. Svaka promjena je jedan korak: {{key:Mod+Z}} je poništava.

## Ciljevi

Cilj pomjera jednu tačku jedne strane puta na liniju: **Ivicu kolovoza** ili **Ivicu bankine**, na **Lijevoj** ili **Desnoj** strani. Svaki presjek susreće liniju pod pravim uglom prema osovini, idući prema van samo na toj strani, tako da cilj na desnoj strani nikada ne pomjera lijevu stranu.

| Postavlja | Šta se dešava tamo gdje presjek susreće liniju |
|---|---|
| **Širina** | Tačka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Kota** | Tačka tamo preuzima kotu linije, na svom ofsetu: poprečni nagib trake (ili bankine) slijedi. |

Linija može biti linija obilježja (bez obzira na njenu **Namjenu**) ili linija drugog koridora: njena osovina, ivice kolovoza, ivice bankine ili linije dnevnog svjetla. Linija koridora prati taj koridor: promijeni drugi put, a ovaj slijedi. CivilCraft prvo gradi drugi koridor; dva koridora koja bi ciljala jedan na drugog u petlji odbijaju se s jedne strane, a tabela kaže koja.

1. Odaberi osu trase i uključi njen koridor.
2. Pod **Ciljevi** klikni {{ui:Dodaj cilj}}.
3. Izaberi **Stranu**, **Tačku**, šta **Postavlja** i **Do linije**. Svaka promjena je jedan korak poništavanja.

**Rezultat** kaže na koliko presjeka je linija dostignuta. Presjeci koji je ne dostižu (van njenih krajeva ili tamo gdje je iza osovine) zadržavaju vrijednosti sklopa. Linija koja je obrisana ostavlja koridor kakav je bio prije cilja, a tabela to kaže. Jedna strana može imati jednu ciljanu širinu i jednu ciljanu kotu za svaku tačku.

## Izgradi svaku stranu od dijelova

Uključi **Izgradi svaku stranu od dijelova** u postavkama koridora. Svaka strana tada ima svoj spisak, od osovine prema van: trake, bankinu, kanal uz ivicu, ivičnjak, zelenu traku, trotoar i, na kraju, nagib strane do terena (sa svojim nagibima iskopa i nasipa). Počni od {{ui:Seoski put}} ili {{ui:Gradska ulica}}, dodaj i ukloni dijelove, pomjeri ih strelicama i {{ui:Kopiraj}} jednu stranu na drugu. Svaka promjena je jedan korak poništavanja.

Poprečni nagib je pad od puta, pa je trotoar koji se odvodi prema putu negativan. Ivičnjak je lice zadate visine, gornja strana zadate širine i opcioni pad na zadnjoj strani. Nadvišenje okreće svaku traku u prvom redu; kanal uz ivicu, ivičnjak, zelena traka i trotoar vise s ivice izgrađenih traka. Ciljevi i dalje pomjeraju kraj traka i zadnji dio. Poprečni presjeci obilježavaju dno kanala uz ivicu, gornju i zadnju stranu ivičnjaka i ostalo. Na krivini sa spiralama prelaz je spirala: ravan poprečni nagib u TS, puno nadvišenje u SC.

## Slojevi kolovozne konstrukcije

Traka, bankina, kanal uz ivicu, zelena traka ili trotoar mogu nositi svoj sastav slojeva: pod dijelom, {{ui:Dodaj sloj}} dodaje sloj s nazivom, materijalom, debljinom i vrstom (habajući, vezni, nosivi, posteljica, zaštitni ili drugi), odozgo prema dolje. Slojevi ne pomjeraju površinu puta (njen vrh je projektovana površina); svaki leži pod svojim dijelom, a dubina se mjeri pravo naniže. Poprečni presjeci crtaju donju stranu svakog sloja isprekidanom linijom, a {{ui:Slojevi kolovozne konstrukcije: količine}} navodi tlocrtnu površinu i zapreminu svakog sloja (površina duž koridora iz njegovih presjeka, zapremina = površina × debljina). IFC izvoz zapisuje svaki sloj kao zaseban element s njegovom debljinom i materijalom (pogledaj [IFC izvoz i uvoz](topic:ifc)). Debljina koju upišeš je tvoja: CivilCraft ne dimenzioniše kolovoze.

## Gdje se putevi spajaju s putevima, platoima i stazama

Kada je uključeno {{ui:Spoji ceste i platoe na koje nailazi}} (uključeno je za svaki koridor), CivilCraft spaja koridor s onim s čim se susreće u planu:

- **Put koji se završava na drugom putu** (kraj njegove osi leži na drugom putu, ili unutar otprilike polovine vlastite širine kolovoza od ivice tog puta) je sporedni put raskrsnice. Put na koji nailazi otvara svoju ivicu za kolovoz sporednog puta: preko ušća bankina, ivičnjak, zelena traka i staza polažu se na poprečni nagib trake i crtaju kao kolovoz. Sporedni put se polaže na površinu glavnog puta tamo gdje se preklapaju, i ublažava se gore ili dolje do nje preko pristupa.
- **Dva puta koja se ukrštaju** spajaju se na isti način s obje strane. Put naveden prvi pod Osi trase je prolazni put; drugi prati njegovu površinu preko.
- **Put koji se završava na platou** (unutar njega ili unutar otprilike polovine svoje širine kolovoza od njegove ivice) dolazi do kote platoa i ublažava se do nje preko pristupa.
- **Staza** (Pejzaž › Tvrdo uređenje) staje na vanjskoj ivici puta, na koti šetnice ili bankine tamo, umjesto da leži preko puta. Staza koja presijeca put postaje dva dijela. Kraj nacrtan malo kraće od puta (unutar dvostruke širine staze) nastavlja se do njegove ivice.

**Svojstva** kažu šta je svaki koridor spojio, za koliko je tamo podignut ili spušten i na kojoj dužini. Ta dužina je veća od 10 m (30 ft) i dvadeset puta promjene, i nikada više od 45 % koridora. **Projektovani profil se ne mijenja**: prikaz profila i dalje pokazuje liniju nivelete koju si nacrtao, a presjeci, projektovana površina, zapremine i 3D prikaz pokazuju put kako je spojen. Da spoj bude tačan po projektu, pomjeri posljednji PVI na kotu koju Svojstva navode.

Isključi prekidač na koridoru da ostane tačno kako kažu njegov profil i sklop; tada ne učestvuje ni u jednoj raskrsnici, ni kao sporedni ni kao prolazni put. Putevi koji se susreću gotovo u pravcu (ispod otprilike 20°) ostavljaju se netaknuti, kao i kolski putevi.

Šta raskrsnica još ne radi: nema zaobilaznih ivičnjaka (uglovi su pravi), nema skretnih traka ili ostrva, kraj sporednog puta je odsječen pravo prema vlastitoj osi, a koridor izgrađen od šablona otvara svoju ivicu na isti jednostavan način (jarak ili zid u svom krajnjem stanju izravnavaju se preko ušća, bez propusta). Za tlocrtne zaobilazne ivičnjake, trouglove preglednosti i oznake na kolovozu pogledaj [Tla, putevi, snimanje, rudnici i veze](topic:soils-roads-survey-mines-links).

## Šta još nije izgrađeno

Ciljevi za nagib dnevnog svjetla još nisu dostupni. Za koridor koji se mijenja duž puta, s odvojenim lijevom i desnom stranom, koristi [Šabloni koridora](topic:corridor-templates). Pogledaj [Još nije izgrađeno](topic:not-built-yet).
