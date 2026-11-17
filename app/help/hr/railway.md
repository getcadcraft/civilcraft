---
title: Projektiranje željezničke pruge
summary: Pretvorite trasu u prugu: prijelazne krivulje (klotoida, kubna parabola, Bloss, Helmert, poluval sinusa, sinus), nadvišenje u svakom luku s ravnotežnim nadvišenjem, manjkom i viškom, ograničenja nadvišenja i geometrije kolosijeka kao upozorenja, skretnice i ukrsne veze po stacionaži, omotnica slobodnog profila provučena uz trasu te kolosijek s tračnicama, pragovima i tucaničkom posteljicom izgrađen kao koridor, u tlocrtu, presjecima, uzdužnom profilu, 3D prikazu i količinama.
keywords: željeznica, pruga, željeznička pruga, kolosijek, vlak, metro, tramvaj, nadvišenje, superelevacija, manjak nadvišenja, višak nadvišenja, ravnotežno nadvišenje, prijelazna krivulja, prijelaz, klotoida, kubna parabola, bloss, helmert, poluval sinusa, kosinus, razmak tračnica, normalni kolosijek, široki kolosijek, metarski kolosijek, uski kolosijek, prag, pragovi, tucanik, podtucanik, posteljica, planum, banket, osni razmak kolosijeka, 60E1, 54E1, UIC60, 115RE, 136RE, gradijent nadvišenja, brzina promjene nadvišenja, skretnica, skretnica, jezičnica, ukrsna veza, srce, broj srca, dužina skretnice, zaokretni luk, brzina u skretanju, slobodni profil, omotnica slobodnog profila, gabarit, peron, razmak peron, osni razmak, nagib, vertikalno zaobljenje, najmanji polumjer, LandXML nadvišenje
from: 99de9745
---

Svaka trasa može biti željeznički kolosijek. Njezinim lukovima tada se dodaju prijelazne krivulje i nadvišenje (nadvišenje tračnica), a njezin koridor izgrađuje se kao pruga: tračnice na pragovima na tucaničkoj posteljici, uklopljene u teren kao cesta. Skretnice i ukrsne veze postavljaju se po stacionaži, a omotnica slobodnog profila može se provući uz trasu i provjeriti u odnosu na ono što stoji uz prugu.

Svi brojevi u nastavku su **privremene vrijednosti**, a ne standardi. Željeznice svoja ograničenja postavljaju prema brzini linije, vrsti kolosijeka i državi; postavite ih prema standardu vaše željeznice. CivilCraft ne sadrži nacionalnu tablicu.

## Pretvorba trase u prugu

1. Odaberite trasu i pronađite **Željeznica** u Svojstvima.
2. Označite **Ova trasa je željeznički kolosijek**. Svaka promjena je jedan korak poništavanja.
3. Postavite **Projektnu brzinu** na vrhu Svojstava trase: to je brzina na pruzi prema kojoj se provjerava nadvišenje. **Najsporiji vlakovi** (u bloku Željeznica) je brzina prema kojoj se provjerava višak nadvišenja.

## Prijelazne krivulje

Svakom luku dodijelite duljinu spirale na oba kraja u tablici točaka presjeka (**Spirala na ulazu**, **Spirala na izlazu**), zatim odaberite vrstu u tablici lukova bloka Željeznica ili upotrijebite **Prijelaz za svaki luk**:

| Vrsta | Zakrivljenost duž prijelaza |
|---|---|
| Klotoida | raste ravnomjerno (cestovna spirala) |
| Kubna parabola | y = x³ / (6·R·L), pri čemu se L mjeri duž tangente; sam luk je malo duži |
| Bloss | 3u² − 2u³ pune zakrivljenosti (u = udio duljine): počinje i završava blago |
| Helmert | dvije parabole, najprije 2u², zatim 1 − 2(1 − u)² |
| Poluval sinusa | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Svi osim kubne parabole skreću za L / 2R, kao i klotoida. Stacionaže teku duž stvarne duljine. LandXML čuva vrstu (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Nadvišenje

Upišite **Nadvišenje** svakog luka u milimetrima. Tablica za svaki luk prikazuje:

- **Ravnotežno nadvišenje** = G·v² / (g·R), pri čemu je G razmak između središta tračnica (**Osni razmak tračnica**, razmak kolosijeka plus širina glave tračnice, osim ako ga upišete). Uz G = 1500 mm to je poznata formula 11,8·V² / R (V u km/h, R u m).
- **Manjak** = ravnotežno nadvišenje pri projektnoj brzini pruge − primijenjeno nadvišenje.
- **Višak** = primijenjeno nadvišenje − ravnotežno nadvišenje pri brzini najsporijih vlakova.
- **Rampa**: najstrmiji gradijent nadvišenja duž njezinih rampi, u mm po metru.

Nadvišenje se povećava preko svakog prijelaza, oblikovano prema njegovoj zakrivljenosti: pravocrtno za klotoidu ili kubnu parabolu, u obliku Blossa za Bloss i tako dalje. Kraj luka bez prijelaza dobiva rampu na pravcu ispred njega, koliko god je potrebno prema ograničenju gradijenta nadvišenja, i to se navodi: nadvišenje se tada mijenja tamo gdje se zakrivljenost ne mijenja.

**Nadvišenje se okreće oko** određuje koja tračnica ostaje na projektnom profilu: **niska tračnica** (uobičajeno), **unutarnja tračnica** ili **os kolosijeka** (svaka tračnica pomiče se za polovinu nadvišenja). Projektni profil je gornji rub tračnice na tom mjestu.

**Dijagram nadvišenja** prikazuje visinu svake tračnice iznad profila duž stacionaža; pogled na profil te listovi tlocrta i profila dobivaju isto kao pojas ispod profila.

## Ograničenja nadvišenja i upozorenja

**Najveće primijenjeno nadvišenje**, **Najveći manjak nadvišenja**, **Najveći višak nadvišenja**, **Najstrmiji gradijent nadvišenja** i **Najbrža promjena nadvišenja** (gradijent pri brzini pruge, mm/s) provjeravaju se na svakom luku. Vrijednost iznad ograničenja je upozorenje u bloku Željeznica i na ploči Problemi, uz navedeno ograničenje i pronađenu vrijednost. Bez projektne brzine manjak i brzina promjene se ne provjeravaju (napomena to kaže).

## Kolosijek

Postavite **Razmak tračnica** (standardni 1435 mm, ili pretpostavke široki, metarski ili uski, ili vlastiti), **Profil tračnice** (60E1, 54E1, 49E1, 115RE, 136RE: samo njihove objavljene dimenzije), broj **Kolosijeka** i njihove **Osne razmake kolosijeka**, zatim **Pragovi i tucanik**: materijal pragova, duljina, širina, visina i razmak; debljina tucanika ispod praga (na niskoj tračnici), rame, nagib, koliko je njegov gornji rub niži od pragova; debljina podtucanika, banket iza nožice tucanika i poprečni pad posteljice.

Pritisnite **Izgradi kolosijek**. Uključuje se koridor trase, izgrađen kao pruga duž projektnog profila: tračnice i pragovi naginju s nadvišenjem, a posteljica ne. Nožice pokosa protežu se od ruba banketa na mjestu iskopa i nasipa koridora, a kolosijek se uklapa u projektirani teren kao cesta.

- **Tlocrt**: obje tračnice svakog kolosijeka (sloj C-RAIL-TRAK) i, uz više od jednog kolosijeka, os svakog kolosijeka (C-RAIL-CNTR), na zaslonu, u DXF, DWG, PDF i na listovima tlocrta i profila.
- **Presjeci**: pragovi, tračnice te donji rubovi tucanika i podtucanika u svakom presjeku.
- **3D**: tračnice, svaki prag i tucanička posteljica (Prikaži › Kolosijek), također u GLB, OBJ i USD.
- **Količine**: duljina kolosijeka, tračnica (obje tračnice svakog kolosijeka, duž vlastite linije svakog kolosijeka), pragovi, tucanička posteljica i tucanik bez pragova te podtucanik, metodom prosječnih površina između presjeka.

## Provjere geometrije kolosijeka

Uz nadvišenje, blok Željeznica provjerava samu liniju prema još šest ograničenja (sva su privremena, sva ih postavljate sami):

- **Najstrmiji nagib** projektnog profila, u mm po metru.
- **Najmanji polumjer vertikalnog zaobljenja**, kao faktor k u R ≥ k·V² (R u metrima, V u km/h). Parabolično vertikalno zaobljenje duljine L između dva nagiba ima polumjer L podijeljen promjenom nagiba.
- **Najkraće vertikalno zaobljenje**.
- **Najmanji polumjer luka** u tlocrtu (0 isključuje provjeru).
- **Najkraći luk ili pravac**, izražen kao sekunde vožnje pri brzini pruge: kružni luk ili pravac između dva luka kraći od te udaljenosti dobiva upozorenje. 1,8 s je poznato pravilo „polovina brzine u km/h, u metrima”.
- **Brzina promjene manjka nadvišenja** duž svakog prijelaza, u mm/s pri brzini pruge.

**Geometrija kolosijeka** navodi najstrmiji pronađeni nagib i svako vertikalno zaobljenje s njegovim polumjerom i polumjerom koji brzina pruge zahtijeva. Vertikalno zaobljenje koje leži na prijelazu ili rampi nadvišenja dobiva napomenu. Bez projektnog profila ili projektne brzine provjere koje ih trebaju preskaču se, a napomena to kaže.

## Skretnice i ukrsne veze

Pod **Skretnice i ukrsne veze** pritisnite **Dodaj skretnicu**. Ona se postavlja na najdulji pravac; postavite je u tablici:

- **Stacionaža početka skretnice**: mjesto na kojem skretnica počinje na ovoj trasi.
- **Srce**: broj srca N (1:N). Kut srca je 2·atan(1 / 2N).
- **Strana**: lijevo ili desno, gledano u smjeru rastuće stacionaže.
- **Razmak ukrsne veze** u metrima: iznad 0, skretnica postaje ukrsna veza s paralelnim kolosijekom na toj udaljenosti (dvije skretnice i pravac između njih).

Tablica prikazuje **Dužinu** skretnice (početak skretnice do srca), **Polumjer** zaokretnog luka i **Brzinu u skretanju** koju taj polumjer dopušta uz vaše ograničenje manjka nadvišenja i bez nadvišenja. **Izradi njezin kolosijek** pretvara skretnički put u vlastitu trasu (skretnica, zaokretni luk, zatim ravno kroz srce pod kutom srca) s istim postavkama željeznice, spremnu za produljenje.

Tlocrt crta dvije skretničke tračnice svake skretnice, njezinu os, oznaku na početku skretnice i na srcu te „1:N” (sloj C-RAIL-TURN), na zaslonu i u DXF, DWG, PDF i listovima. 3D prikaz crta skretničke tračnice na razini glavnog kolosijeka.

Oblik je **privremen**: ravna skretnica i jedan zaokretni luk prema broju srca. Izgrađena skretnica slijedi standard željeznice i crtež proizvođača. Upozorenja: skretnica koja izlazi iz trase, leži na luku, prijelazu, nadvišenju ili vertikalnom zaobljenju ili se preklapa s drugom; a napomena kada je brzina pruge veća od njezine brzine u skretanju.

## Omotnica slobodnog profila

Označite **Provuci omotnicu slobodnog profila duž ovog kolosijeka**. Odaberite **Obris** (dva privremena oblika ili **Vlastiti obris** upisan kao točke, jedna po retku: odmak od osi kolosijeka, zatim visina iznad gornjeg ruba tračnice, u metrima), **Duljinu vozila** i **Osne razmake osovinskih sklopova** te, ako postoji, **Rub perona** (strana, udaljenost od osi kolosijeka, visina iznad tračnice).

Na svakoj stacionaži obris se naginje s nadvišenjem oko niske tračnice i proširuje zakrivljenošću: sredina vozila pomiče se prema unutra za b² / 8R, a krajevi prema van za (L² − b²) / 8R (b su osni razmaci osovinskih sklopova, L duljina vozila, R polumjer na tom mjestu, slijedeći prijelaz). Blok crta presjek na pravcu i tamo gdje je najširi te navodi:

- **najširu omotnicu** i gdje se nalazi,
- **osne razmake kolosijeka** u usporedbi s razmacima koje zahtijevaju dvije susjedne omotnice,
- prostor koji ostaje uz **rub perona**, odnosno koliko je zadiranje u njega,
- svaku liniju objekta, cijevnu konstrukciju i drugu željezničku trasu pronađenu **unutar omotnice**.

Linija objekta s kotama procjenjuje se prema obrisu na njezinoj visini iznad tračnice; bez projektnog profila, ili za točku bez kote, procjenjuje se samo u tlocrtu, a popis to navodi. Tlocrt prikazuje dva ruba omotnice (sloj C-RAIL-CLRN) s križićem na svakoj stvari unutar nje.

Ponuđeni obrisi su **privremeni, nisu gabarit nijedne željeznice**. Prije oslanjanja na rezultat upišite gabarit konstrukcije vaše željeznice.

## U drugim programima

- **LandXML**: željeznička trasa zapisuje se s prijelazima (spiType) i blokom `Cant`: razmak, točka rotacije, brzina pruge i stacionaža na kojoj svaka rampa nadvišenja počinje i završava, s primijenjenim nadvišenjem, ravnotežnim nadvišenjem i manjkom. Otvaranje LandXML datoteke s blokom `Cant` čini tu trasu željezničkom prugom s tim nadvišenjima.
- **IFC**: trasa s njezinim segmentima nadvišenja, tračnicama, pragovima, tucanikom i podtucanikom.

## Još nije izrađeno

Skretnice u IFC izvozu, obitelji skretnica izvan jednog zaokretnog luka (zakrivljene skretnice, srca s pomičnim krilom, ukrsne skretnice, rombovi), pravila kinematičkog gabarita (omotnica je fiksni obris s otklonom luka), nadzemni vodovi i signalizacija.

**Koji standard.** U bloku Željeznica, „Standard za navođenje” nudi Nema ili Europski (UIC i EN). Odabir Europskog navodi dokumente koje europski projekt citira (EN 13803 za parametre trase, EN 13232 za skretnice i ukrsne veze, EN 15273 za gabarite, EN 13848 za kvalitetu geometrije kolosijeka) i svakom ograničenju daje polje za točku iz koje dolazi. Nijedan broj iz nijednog standarda nije ugrađen: ograničenja nadvišenja, manjka, viška, nagiba i brzine promjene, geometrija skretnica i gabarit konstrukcije i dalje su privremeni, a prozor to navodi. Inženjer željeznice provjerava svaku vrijednost prema samom tekstu standarda i uz nju upisuje točku prije nego se išta izgradi. Talijanske i južnoafričke tablice AREMA nisu u ovom izdanju.
