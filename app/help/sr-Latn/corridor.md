---
title: Protezanje koridora puta
summary: Uključi koridor za osovinu trase, podesi vrednosti za traku, bankinu i bočni nagib, i pročitaj preseke, linije preseka sa terenom i zemljane radove koje on daje.
keywords: raskrsnica, ukrštanje, put koji se sreće sa putem, sporedni put, T raskrsnica, prelaz, nivo platoa, spajanje, priključak, nadvišenje, super, prelazna dužina, izlazna dužina, tabela stopa, poprečni nagib, rotacija, koridor, sklop, tipični poprečni presek, put, traka, bankina, bočni nagib, linija preseka sa terenom, usek, nasip, preseci, cilj, ciljevi, cilj širine, cilj visine, cilj ofseta, proširenje, ivica kolovoza, prati drugi koridor
from: 6dcb92b3
---

Koridor provlači jedan jednostavan tipični poprečni presek (sklop) duž osovine trase i njenog projektovanog podužnog profila, uklapa ga u postojeći teren i dodaje rezultat na projektovanu površ. Osovina trase može nositi više koridora na različitim opsezima stacionaža, a koridor može biti izrađen od višekratnih šablona po stacionaži ([Šabloni koridora](topic:corridor-templates)). Jednostavan sklop ispod je isti na obe strane; da bi svaka strana imala svoje delove, pogledaj [Izrada svake strane od delova](topic:corridor#build-each-side-from-parts).

## Poprečni sklop

Od osovine ka spolja, sa svake strane:

1. **traka** zadate širine, koja se od krune puta spušta pod **nagibom trake**
2. **bankina** zadate širine sa **nagibom bankine**
3. **bočni nagib** od ivice bankine do mesta gde susreće teren: **nagib useka** gde je teren iznad, **nagib nasipa** gde je ispod

Početne vrednosti su privremene, a ne projektni standard:

| Vrednost | US feet | Metri |
|---|---|---|
| Širina trake | 12 ft | 3.6 m |
| Nagib trake | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Nagib bankine | 4% | 4% |
| Nagib useka | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Presek na svakih | 10 ft | 5 m |

Nagibi bočnih nagiba su horizontalno prema vertikalnom (H:V): 3 : 1 znači 3 horizontalno za 1 vertikalno.

## Izrada koridora

Potrebna je osovina trase bez grešaka i projektovani podužni profil sa najmanje dve PVI tačke i bez grešaka.

1. Izaberi osovinu trase.
2. U desnom panelu, pod **Koridor**, označi **Provuci sklop duž projektovanog profila**.
   Polja se pojavljuju i koridor se odmah izrađuje. Osnova prikazuje ivice trake i bankine i linije preseka sa terenom; kada je pod **Prikaz** izabrano {{ui:Predloženo (sa nagibom)}}, izohipse prikazuju novi teren.
3. Promeni bilo koju vrednost: **Širina trake**, **Nagib trake**, **Širina bankine**, **Nagib bankine**, **Nagib useka**, **Nagib nasipa**, **Presek na svakih**. Posle svake pritisni {{key:Enter}}. Nagib useka, nagib nasipa i razmak preseka moraju biti veći od 0.
4. Pročitaj red ispod polja, na primer „39 preseka od 0+00.00 do 3+86.36; usek 240.2 cu yd, nasip 556.0 cu yd.“

Preseci se seku na svakom koraku **Presek na svakih**, na krajevima, i na početku i kraju svake horizontalne i vertikalne krivine. Svaki presek i linije kroz njih (osovina, ivice trake i bankine, linija preseka sa terenom) postaju linije loma projektovane površi.

Da isključiš koridor, odznači polje. Njegove vrednosti se čuvaju za sledeći put.

## Kada se ne izrađuje

Crveni okvir ispod polja kaže zašto:

| Poruka | Šta treba uraditi |
|---|---|
| „Koridoru je potreban projektovani profil bez grešaka.“ | Dodaj PVI tačke ili popravi preklapanje vertikalnih krivina (pogledaj [Projektovanje podužnog profila](topic:profile)). |
| „Projektovani profil se ne preklapa sa osovinom trase.“ | Pomeri PVI tačke na opseg stacionaža osovine trase. |
| „Koridoru su potrebna najmanje dva preseka na površi.“ | Veći deo koridora je van postojećeg terena. |
| „4 bočna nagiba izlaze sa površi pre nego što susretnu teren.“ | Blizu ivice površi nagib ne može da dostigne teren. Drži put dalje od ivice ili spusti visinu nasipa ili useka na tom mestu. |
| „Linije preseka sa terenom koridora se seku (preseci se preklapaju, na primer na unutrašnjoj strani uske krivine). Koristi veći poluprečnik ili uži sklop.“ | Preseci na unutrašnjoj strani oštre krivine se preklapaju. Povećaj poluprečnik ili sužavaj sklop. |

Koridor sa problemom se ne uklapa u teren i ne ulazi u zemljane radove.

## Koridori i platoi zajedno

Projektovana površ se gradi redom: prvo svi koridori, pa svi platoi. Gde se uklapanje platoa preklapa sa koridorom, plato ima prednost. Gde se kasniji element preklapa sa putem, menja se samo deo puta unutar linije preseka sa terenom tog kasnijeg elementa; ostatak puta i svaka linija loma terena koju put preseca zadržavaju svoj oblik. Količine se računaju unutar svih linija preseka sa terenom zajedno; pogledaj [Zapremine zemljanih radova](topic:volumes).

## Nadvišenje

Kroz krivinu put može da se nagne ka unutrašnjoj strani, tako da se saobraćaj manje gura ka spoljnoj. Označi **Nadvisi krivine** pod **Nadvišenje** u **Svojstvima** osovine trase:

- Svaka kružna krivina dobija stopu **e** iz tabele stopa: prvi red čiji poluprečnik krivina dostiže (red sa praznom stopom zadržava normalnu krunu). Tabela i **Najveći relativni nagib** (0.5 % na početku) su privremene vrednosti, a ne standard: postavi ih prema sopstvenim projektnim kriterijumima. Dodaj ili ukloni redove po potrebi.
- Trake se rotiraju oko osovine. Pre krivine spoljašnja traka se izravnava na **izlaznoj dužini** (normalna kruna ÷ e × dužina prelaza), zatim na **dužini prelaza** (širina trake × e ÷ nagib) spoljašnja traka nastavlja da se okreće dok cela dužina puta ne dobije nagib e ka unutrašnjoj strani; dve trećine dužine prelaza su pre krivine, a jedna trećina na njoj. Posle krivine dešava se isto, obrnutim redom.
- Bankina na nižoj strani nikad nije ravnija od svoje trake; na višoj strani zadržava sopstveni nagib (ona se prelama).
- Tabela ispod navodi poluprečnik, stopu, dužinu prelaza i izlaznu dužinu svake krivine i mesto gde počinje i završava puno nadvišenje. **Dijagram nadvišenja** crta poprečne nagibe obe trake duž stacionaža (leva traka punom linijom, desna isprekidanom).
- Krivina prekratka da dostigne puno nadvišenje, ili dve krivine čiji se prelazi preklapaju, navedena je u okviru iznad tabele.

Preseci, zapremine, 3D prikaz i listovi svi prikazuju nagnuti put. Svaka promena je jedan korak: {{key:Mod+Z}} je opoziva.

## Ciljevi

Cilj pomera jednu tačku jedne strane puta na liniju: **Ivicu kolovoza** ili **Ivicu bankine**, na **Levo** ili **Desno**. Svaki presek seče liniju normalno na osovinu, i ide samo na tu stranu, pa cilj desno nikad ne pomera levu stranu.

| Postavlja | Šta se dešava gde presek susreće liniju |
|---|---|
| **Širinu** | Tačka leži na liniji: traka (ili bankina) se širi ili sužava do nje, zadržavajući svoj poprečni nagib. |
| **Visinu** | Tačka tu preuzima visinu linije, na svom ofsetu: poprečni nagib trake (ili bankine) prati je. |

Linija može biti linija obeležja (bez obzira na njenu **Namenu**) ili linija drugog koridora: njegova osovina, ivice kolovoza, ivice bankine ili linije preseka sa terenom. Linija koridora prati taj koridor: promeni drugi put, a ovaj ga prati. CivilCraft prvo izrađuje drugi koridor; dva koridora koja bi ciljala jedan drugog u krugu se odbijaju sa jedne strane, a tabela kaže koja.

1. Izaberi osovinu trase i uključi njen koridor.
2. Pod **Ciljevi** klikni {{ui:Dodaj cilj}}.
3. Izaberi **Stranu**, **Tačku**, šta **Postavlja** i **Do linije**. Svaka promena je jedan korak opoziva.

**Rezultat** kaže na koliko preseka je linija dostignuta. Preseci koji je ne dostižu (van njenih krajeva ili tamo gde je iza osovine) zadržavaju vrednosti sklopa. Linija koja je obrisana ostavlja koridor onakvim kakav je bio pre cilja, a tabela to kaže. Jedna strana može imati jedan cilj širine i jedan cilj visine za svaku tačku.

## Izrada svake strane od delova

Uključi **Izrada svake strane od delova** u podešavanjima koridora. Svaka strana tada ima sopstvenu listu, od osovine ka spolja: trake, bankinu, oluk, ivičnjak, zelenu traku, trotoar i, na kraju, bočni nagib do terena (sa sopstvenim odnosima useka i nasipa). Počni od {{ui:Seoski put}} ili {{ui:Gradska ulica}}, dodaj i ukloni delove, pomeri ih strelicama i {{ui:Kopiraj}} prebaci jednu stranu na drugu. Svaka promena je jedan korak opoziva.

Poprečni nagib je pad od puta, pa je trotoar koji otiče ka putu negativan. Ivičnjak je lice visine koju zadaješ, gornja površ širine koju zadaješ i opcioni pad na zadnjoj strani. Nadvišenje okreće svaku traku u prvom redu; oluk, ivičnjak, zelena traka i trotoar vise od ivice izgrađenih traka. Ciljevi i dalje pomeraju kraj traka i poslednji deo. Poprečni preseci obeležavaju liniju toka oluka, vrh i zadnju stranu ivičnjaka i ostalo. Na krivini sa spiralama prelaz je spirala: ravna kruna u TS, puno nadvišenje u SC.

## Slojevi kolovoza

Traka, bankina, oluk, zelena traka ili trotoar mogu nositi svoj slojeviti sastav: ispod dela, {{ui:Dodaj sloj}} dodaje sloj sa nazivom, materijalom, debljinom i vrstom (habajući, vezni, nosivi, podložni, zaštitni ili drugi), odozgo nadole. Slojevi ne pomeraju površ puta (njen vrh je projektovana površ); svaki leži ispod svog dela, a dubina se meri pravo nadole. Poprečni preseci crtaju donju ivicu svakog sloja isprekidanom linijom, a {{ui:Slojevi kolovoza: količine}} navodi tlocrtnu površinu i zapreminu svakog sloja (površina duž koridora iz njegovih preseka, zapremina = površina × debljina). IFC izvoz piše svaki sloj kao poseban element sa njegovom debljinom i materijalom (pogledaj [IFC izvoz i uvoz](topic:ifc)). Debljinu koju unesete određujete vi: CivilCraft ne dimenzioniše kolovoze.

## Gde se putevi sreću sa putevima, platoima i stazama

Kada je uključeno {{ui:Poveži puteve i platoe koje dodiruje}} (uključeno je za svaki koridor), CivilCraft spaja koridor sa onim što sreće u osnovi:

- **Put koji se završava na drugom putu** (kraj njegove osovine leži na drugom putu, ili u okviru oko polovine sopstvene širine kolovoza od ivice tog puta) jeste sporedni put raskrsnice. Put na koji nailazi otvara svoju ivicu za kolovoz sporednog puta: preko ušća, bankina, ivičnjak, zelena traka i pešačka staza postavljaju se na poprečni nagib trake i crtaju se kao kolovoz. Sporedni put se postavlja na površ glavnog puta tamo gde se njih dvoje preklapaju, i postepeno se podiže ili spušta do nje na prilazu.
- **Dva puta koja se ukrštaju** spajaju se na isti način sa obe strane. Put naveden prvi pod Osovine trase je prolazni put; drugi prati njegovu površ preko ukrštanja.
- **Put koji se završava na platou** (unutar njega, ili u okviru oko polovine širine kolovoza od njegove ivice) dolazi na nivo platoa i postepeno se do njega dovodi na prilazu.
- **Staza** (Uređenje okoline › Tvrdo uređenje) staje na spoljnoj ivici puta, na nivou pešačke staze ili bankine tamo, umesto da leži preko puta. Staza koja preseca put postaje dva dela. Kraj nacrtan malo kraće od puta (unutar dvostruke širine staze) produžava se do njegove ivice.

**Svojstva** kažu šta je svaki koridor spojio, za koliko je tu podignut ili spušten i na kojoj dužini. Ta dužina je veća od 10 m (30 ft) i dvadeset puta većeg pomeranja i nikad nije veća od 45 % koridora. **Projektovani profil se ne menja**: prikaz profila i dalje prikazuje liniju nagiba koju si nacrtao, a preseci, projektovana površ, zapremine i 3D prikaz prikazuju put kako je spojen. Da spoj bude tačan po projektu, pomeri poslednju PVI tačku na nivo koji prijavljuju **Svojstva**.

Isključi prekidač na koridoru da bi ostao tačno onakav kakav kažu njegov profil i sklop; tada ne učestvuje ni u jednoj raskrsnici, ni kao sporedni ni kao prolazni put. Putevi koji se sreću gotovo u pravcu (pod oko 20°) ostavljaju se netaknuti, kao i poljski putevi.

Šta raskrsnica još ne radi: nema zaobljenja ivičnjaka (uglovi su pravi), nema skretnih traka ni ostrva, kraj sporednog puta se seče pravo u odnosu na sopstvenu osovinu, a koridor izrađen od šablona otvara svoju ivicu na isti običan način (jarak ili zid u svom krajnjem stanju se izravnava preko ušća, bez propusta). Za zaobljenja ivičnjaka u osnovi, trouglove preglednosti i horizontalnu signalizaciju pogledaj [Tlo, putevi, snimanje, rudnici i veze](topic:soils-roads-survey-mines-links).

## Šta još nije izrađeno

Ciljevi za nagib linije preseka sa terenom još nisu dostupni. Za koridor koji se menja duž puta, sa levom i desnom stranom odvojeno, koristi [Šabloni koridora](topic:corridor-templates). Pogledaj [Još nije izrađeno](topic:not-built-yet).
