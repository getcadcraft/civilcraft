---
title: Projektovanje željezničkog kolosijeka
summary: Pretvorite osovinu u željezničku prugu: prijelazi šina (klotoida, kubna parabola, Bloss, Helmert, sinusni poluval, sinus), nadvišenje na svakoj krivini s njenim ravnotežnim nadvišenjem, manjak i višak, granice nadvišenja i geometrije kolosijeka kao upozorenja, skretnice i ukrsnice po stanici, gabaritni omotač koji se provlači duž linije, te kolosijek sa šinama, pragovima i slojem tucanika izgrađen kao koridor, u tlocrtu, presjecima, uzdužnom profilu, 3D prikazu i količinama.
keywords: železnica, šina, željeznički kolosijek, pruga, voz, metro, tramvaj, nadvišenje, nadvišenje šina, manjak nadvišenja, višak nadvišenja, ravnotežno nadvišenje, prijelaz, prijelazna krivina, klotoida, kubna parabola, Bloss, Helmert, sinusni poluval, kosinus, širina kolosijeka, standardna širina kolosijeka, široki kolosijek, metarski kolosijek, uski kolosijek, prag, tucanik, podtucanik, posteljica, berma, osni razmak kolosijeka, 60E1, 54E1, UIC60, 115RE, 136RE, nagib nadvišenja, brzina promjene nadvišenja, skretnica, ukrsnica, srce, broj srca, dužina skretnice, krivina zatvaranja, brzina skretanja, gabarit, gabaritni omotač, gabarit konstrukcije, kinematički omotač, peron, razmak perona, nagib, vertikalna krivina, najmanji radijus, LandXML nadvišenje
from: 99de9745
---

Bilo koja osovina može biti željeznički kolosijek. Njene krivine tada dobijaju prijelaze šina i nadvišenje (nadvišenje šina), a njen koridor se gradi kao kolosijek: šine na pragovima, na sloju tucanika, nivelisan u teren kao cesta. Skretnice i ukrsnice se postavljaju po stanici, a gabaritni omotač može se provući duž linije i provjeriti u odnosu na ono što stoji pored kolosijeka.

Svaki broj ispod je **privremena vrijednost**, a ne standard. Željeznice postavljaju svoje granice prema brzini linije, vrsti kolosijeka i državi; postavite ih prema standardu vaše željeznice. CivilCraft ne sadrži nacionalnu tabelu.

## Osovinu pretvorite u željezničku prugu

1. Odaberite osovinu i pronađite **Željeznica** u Svojstvima.
2. Označite **Ova osovina je željeznički kolosijek**. Svaka promjena je jedan korak za poništavanje.
3. Postavite **Projektnu brzinu** na vrhu Svojstava osovine: to je brzina linije prema kojoj se provjerava nadvišenje. **Najsporiji vozovi** (u bloku Željeznica) je brzina prema kojoj se provjerava višak nadvišenja.

## Prijelazi

Svakoj krivini zadajte dužinu spirale na oba kraja u tabeli PI (**Spirala ulaz**, **Spirala izlaz**), zatim izaberite njenu vrstu u tabeli krivina bloka Željeznica ili upotrijebite **Prijelaz za svaku krivinu**:

| Vrsta | Zakrivljenost duž prijelaza |
|---|---|
| Klotoida | raste ravnomjerno (cestovna spirala) |
| Kubna parabola | y = x³ / (6·R·L), pri čemu se L mjeri duž tangente; sama krivina je nešto duža |
| Bloss | 3u² − 2u³ punog zakrivljenja (u = udio dužine): počinje i završava blago |
| Helmert | dvije parabole, prvo 2u², zatim 1 − 2(1 − u)² |
| Sinusni poluval | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Svi osim kubne parabole skreću za L / 2R, kao klotoida. Stacionaže teku duž stvarne dužine. LandXML čuva vrstu (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Nadvišenje

Upišite **Nadvišenje** svake krivine u milimetrima. Tabela za svaku krivinu prikazuje:

- **Ravnotežno nadvišenje** = G·v² / (g·R), gdje je G razmak između središta šina (**Osni razmak šina**: širina kolosijeka plus širina glave šine, osim ako ga sami upišete). Uz G = 1500 mm ovo je poznatih 11.8·V² / R (V u km/h, R u m).
- **Manjak** = ravnotežno nadvišenje pri projektnoj brzini − primijenjeno nadvišenje.
- **Višak** = primijenjeno nadvišenje − ravnotežno nadvišenje pri brzini najsporijih vozova.
- **Rampa**: najstrmiji nagib nadvišenja duž njegovih rampi, u mm po metru.

Nadvišenje se podiže preko svakog prijelaza, oblikovano kao njegova zakrivljenost: pravolinijski za klotoidu ili kubnu parabolu, oblikom Bloss za Bloss, i tako dalje. Kraj krivine bez prijelaza ima rampu na pravcu ispred nje, koliko god granica nagiba nadvišenja zahtijeva, i to se navodi: nadvišenje se tada mijenja tamo gdje se zakrivljenost ne mijenja.

**Nadvišenje se okreće oko** kaže koja šina ostaje na projektnom profilu: **niža šina** (uobičajeno), **unutrašnja šina** ili **osa kolosijeka** (svaka šina se pomjera za polovinu nadvišenja). Projektni profil je gornja ivica šine na tom mjestu.

**Dijagram nadvišenja** crta visinu svake šine u odnosu na profil duž stanica; pogled na profil i listovi tlocrta i profila dobijaju isto kao pojas ispod profila.

## Granice nadvišenja i upozorenja

**Najveće primijenjeno nadvišenje**, **Najveći manjak nadvišenja**, **Najveći višak nadvišenja**, **Najstrmiji nagib nadvišenja** i **Najbrža promjena nadvišenja** (nagib pri brzini linije, mm/s) provjeravaju se na svakoj krivini. Vrijednost iznad granice je upozorenje u bloku Željeznica i u panelu Problemi, uz navedenu granicu i pronađenu vrijednost. Bez projektne brzine, manjak i brzina promjene se ne provjeravaju (napomena to kaže).

## Kolosijek

Postavite **Širinu kolosijeka** (standardna 1435 mm, široki, metarski ili uski prednastavljeni, ili vlastitu), **Profil šine** (60E1, 54E1, 49E1, 115RE, 136RE: samo njihove objavljene dimenzije), broj **Kolosijeka** i njihove **Osne razmake kolosijeka**, zatim **Pragove i tucanik**: materijal pragova, dužinu, širinu, debljinu i razmak; debljinu tucanika ispod praga (na nižoj šini), rame, nagib, koliko je njegov vrh niži od pragova; debljinu podtucanika, bermu iza ivice tucanika i poprečni nagib posteljice.

Pritisnite **Izgradi kolosijek**. Primjenjuje se na koridor osovine, izgrađen kao kolosijek duž projektnog profila: šine i pragovi naginju se s nadvišenjem, posteljica ne. Padine iskopa i nasipa teku od ivice berme na mjestu presjeka koridora, a kolosijek se nivelira u projektovanu površinu kao cesta.

- **Tlocrt**: obje šine svakog kolosijeka (sloj C-RAIL-TRAK) i, uz više od jednog kolosijeka, osa svakog kolosijeka (C-RAIL-CNTR), na ekranu, u DXF, DWG, PDF i listovima tlocrta i profila.
- **Presjeci**: pragovi, šine, donje strane tucanika i podtucanika u svakom presjeku.
- **3D**: šine, svaki prag i sloj tucanika (Prikaži › Kolosijek), također u GLB, OBJ i USD.
- **Količine**: dužina kolosijeka, šine (obje šine svakog kolosijeka, duž linije svakog kolosijeka), pragovi, sloj tucanika i tucanik bez pragova, te podtucanik, metodom prosječnih površina između presjeka.

## Provjere geometrije kolosijeka

Pored nadvišenja, blok Željeznica provjerava samu liniju prema još šest granica (sve su privremene vrijednosti, sve ih postavljate vi):

- **Najstrmiji nagib** projektnog profila, u mm po metru.
- **Najmanji radijus vertikalne krivine**, kao faktor k u R ≥ k·V² (R u metrima, V u km/h). Parabolička vertikalna krivina dužine L između dva nagiba ima radijus L podijeljen promjenom nagiba.
- **Najkraća vertikalna krivina**.
- **Najmanji radijus krivine** u tlocrtu (0 isključuje provjeru).
- **Najkraći luk ili pravac**, kao sekunde vožnje pri brzini linije: kružni luk ili pravac između dvije krivine kraći od te udaljenosti dobija upozorenje. 1.8 s je poznato pravilo „polovina brzine u km/h, u metrima".
- **Brzina promjene manjka nadvišenja** duž svakog prijelaza, u mm/s pri brzini linije.

**Geometrija kolosijeka** navodi pronađeni najstrmiji nagib i svaku vertikalnu krivinu s njenim radijusom i radijusom koji zahtijeva brzina linije. Vertikalna krivina koja leži na prijelazu ili rampi nadvišenja dobija napomenu. Bez projektnog profila ili projektne brzine, provjere koje ih zahtijevaju se preskaču, a napomena to kaže.

## Skretnice i ukrsnice

Pod **Skretnice i ukrsnice** pritisnite **Dodaj skretnicu**. Ona se postavlja na najduži pravac; podesite je u tabeli:

- **Stanica početka skretnice**: mjesto gdje skretnica počinje na ovoj osovini.
- **Srce**: broj srca N (1:N). Ugao srca je 2·atan(1 / 2N).
- **Strana**: lijeva ili desna, gledajući u smjeru rastuće stacionaže.
- **Razmak ukrsnice** u metrima: iznad 0, skretnica postaje ukrsnica prema paralelnom kolosijeku na toj udaljenosti (dvije skretnice i pravac između njih).

Tabela prikazuje **Dužinu** (od početka skretnice do srca), **Radijus** krivine zatvaranja i **Brzinu skretanja** koju taj radijus dozvoljava uz vašu granicu manjka nadvišenja i bez nadvišenja. **Izradi njen kolosijek** pretvara skretnički pravac u osovinu za sebe (skretnica, krivina zatvaranja, zatim pravo na ugao srca) s istim željezničkim postavkama, spremnu za produženje.

Tlocrt crta dva skretnička kraka svake skretnice, njenu osu, oznaku na početku skretnice i na srcu, te „1:N“ (sloj C-RAIL-TURN), na ekranu i u DXF, DWG, PDF i listovima. 3D prikaz crta skretničke krakove na nivou glavnog kolosijeka.

Oblik je **privremena vrijednost**: pravolinijska skretnica i jedna krivina zatvaranja iz broja srca. Izgrađena skretnica prati standard željeznice i crtež proizvođača. Upozorenja: skretnica koja izlazi van osovine, leži na krivini, prijelazu, nadvišenju ili vertikalnoj krivini, ili se preklapa s drugom; i napomena kad je brzina linije veća od njene brzine skretanja.

## Gabaritni omotač

Označite **Provuci gabaritni omotač duž ovog kolosijeka**. Izaberite **Obris** (dva privremena oblika ili **Vlastiti obris** upisan kao jedna tačka po liniji: odmak od osi kolosijeka, zatim visina iznad gornje ivice šine, u metrima), **Dužinu vozila** i **Osne razmake bogija**, i, ako postoji, **Ivicu perona** (strana, udaljenost od osi kolosijeka, visina iznad šine).

Na svakoj stanici obris se naginje s nadvišenjem oko niže šine i proširuje krivinom: sredina vozila pomjera se unutra za b² / 8R, a njeni krajevi van za (L² − b²) / 8R (b osni razmak bogija, L dužina vozila, R radijus na tom mjestu, prateći prijelaz). Blok crta presjek na pravcu i tamo gdje je najširi, i navodi:

- **najširi omotač** i gdje,
- **osne razmake kolosijeka** upoređene s razmacima koje zahtijevaju dva susjedna omotača,
- **prostor koji ostaje na ivici perona**, ili koliko je unutra,
- svaku liniju objekta, cijevnu konstrukciju i drugu željezničku osovinu pronađenu **unutar omotača**.

Linija objekta s kotama procjenjuje se prema obrisu na njenoj visini iznad šine; bez projektnog profila, ili za tačku bez kote, procjenjuje se samo u tlocrtu, a lista to navodi. Tlocrt prikazuje dvije ivice omotača (sloj C-RAIL-CLRN) s križićem na svakoj stvari unutar njega.

Ponuđeni obrisi su **privremene vrijednosti, a ne širina kolosijeka neke željeznice**. Upišite gabarit konstrukcije vaše željeznice prije nego se oslonite na rezultat.

## U drugim programima

- **LandXML**: željeznička osovina zapisuje se s prijelazima (spiType) i blokom `Cant`: širina kolosijeka, tačka rotacije, brzina linije i stanica na kojoj svaka rampa nadvišenja počinje i završava, s primijenjenim nadvišenjem, ravnotežnim nadvišenjem i manjkom. Otvaranje LandXML datoteke s blokom `Cant` čini tu osovinu željezničkim kolosijekom s tim nadvišenjima.
- **IFC**: osovina sa svojim segmentima nadvišenja, šinama, pragovima, tucanikom i podtucanikom.

## Još nije izgrađeno

Skretnice u IFC izvozu, porodice skretnica osim jedne krivine zatvaranja (zakrivljene skretnice, srca s pokretnim krilom, ukrsne skretnice, dijamantske ukrsnice), pravila kinematičkog gabarita (omotač je fiksni obris s pomakom krivine), nadzemni vodovi i signalizacija.

**Koji standard.** U bloku Željeznica, „Standard za navođenje“ uzima Nijedan ili Evropski (UIC i EN). Izbor Evropski navodi dokumente na koje se poziva evropski projekt (EN 13803 za parametre osovine, EN 13232 za skretnice i ukrsnice, EN 15273 za gabarite, EN 13848 za kvalitet geometrije kolosijeka) i svakoj granici daje polje za tačku iz koje potiče. Nijedan broj iz nekog standarda nije ugrađen: granice nadvišenja, manjka, viška, nagiba i brzine promjene, geometrija skretnica i gabarit konstrukcije i dalje su privremene vrijednosti, a prozor to kaže. Inženjer željeznice provjerava svaku vrijednost prema tekstu samog standarda i upisuje tačku pored nje prije nego se išta izgradi. Južnoafrički standard i AREMA tabele nisu u ovom izdanju.
