---
title: Projektovanje železničke pruge
summary: Pretvorite osovinu trase u železničku prugu: prelazne krivine (klotoida, kubna parabola, Bloss, Helmert, sinusna polutalasna, sinusna), nagib šina na svakoj krivini s ravnotežnim nagibom, manjak i višak, granice nagiba i geometrije pruge kao upozorenja, skretnice i ukrsnice po stacionaži, slobodni profil koji se povlači duž trase i kolosek sa šinama, pragovima i tučeničkom posteljicom, izgrađen kao koridor, u planu, presecima, podužnom profilu, 3D prikazu i količinama.
keywords: železnica, šina, pruga, kolosek, voz, metro, tramvaj, nagib šina, nagib, manjak nagiba, višak nagiba, ravnotežni nagib, prelazna krivina, klotoida, kubna parabola, bloss, helmert, sinusna polutalasna, kosinusna, raspon koloseka, normalni raspon, široki raspon, metarski raspon, uski raspon, prag, tučenik, donji stroj, zemljana posteljica, bankina, osovine koloseka, 60E1, 54E1, UIC60, 115RE, 136RE, gradijent nagiba, brzina promene nagiba, skretnica, kretnica, ukrsnica, srce, broj srca, vodeći deo, krivina zatvaranja, brzina u skretanju, slobodni profil, omotač slobodnog profila, gabarit, peron, razmak perona, osovinski razmak, vertikalna krivina, najmanji poluprečnik, LandXML nagib
from: 99de9745
---

Svaka osovina trase može biti železnički kolosek. Njene krivine tada dobijaju prelazne krivine i nagib (nadvišenje šina), a njen koridor se gradi kao kolosek: šine na pragovima, na tučeničkoj posteljici, zasečen u teren kao put. Skretnice i ukrsnice se postavljaju po stacionaži, a slobodni profil može da se povuče duž trase i proveri u odnosu na ono što stoji pored koloseka.

Svaki broj ispod je **privremena vrednost**, a ne standard. Železnice postavljaju svoje granice prema brzini na pruzi, vrsti koloseka i državi; postavite ih prema standardu vaše železnice. CivilCraft ne sadrži nacionalnu tabelu.

## Osovinu trase pretvorite u prugu

1. Izaberite osovinu trase i pronađite **Železnica** u **Svojstvima**.
2. Označite **Ova osovina trase je železnički kolosek**. Svaka promena je jedan korak za opozivanje.
3. Postavite **Projektnu brzinu** pri vrhu Svojstava osovine trase: to je brzina na pruzi prema kojoj se proverava nagib. **Najsporiji vozovi** (u bloku Železnica) je brzina prema kojoj se proverava višak nagiba.

## Prelazne krivine

Svakoj krivini dodelite dužinu spirale na oba kraja u tabeli PI (**Spirala ulaz**, **Spirala izlaz**), zatim izaberite njenu vrstu u tabeli krivina bloka Železnica, ili **Prelaz za svaku krivinu**:

| Vrsta | Zakrivljenost duž prelaza |
|---|---|
| Klotoida | raste ravnomerno (put spirala) |
| Kubna parabola | y = x³ / (6·R·L), gde se L meri duž tangente; sama krivina je malo duža |
| Bloss | 3u² − 2u³ pune zakrivljenosti (u = udeo dužine): počinje i završava se blago |
| Helmert | dve parabole, 2u² zatim 1 − 2(1 − u)² |
| Sinusna polutalasna | (1 − cos πu) / 2 |
| Sinusna | u − sin(2πu) / 2π |

Sve osim kubne parabole skreću za L / 2R, kao klotoida. Stacionaže idu po stvarnoj dužini. LandXML čuva vrstu (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Nagib

Upišite **Nagib** svake krivine u milimetrima. Tabela za svaku krivinu prikazuje:

- **Ravnotežni nagib** = G·v² / (g·R), gde je G rastojanje između osovina šina (**Osovine šina**: raspon koloseka plus širina glave šine, osim ako ga ne upišete). Uz G = 1500 mm ovo je poznata formula 11.8·V² / R (V u km/h, R u m).
- **Manjak** = ravnotežni nagib pri projektnoj brzini na pruzi − primenjeni nagib.
- **Višak** = primenjeni nagib − ravnotežni nagib pri brzini najsporijih vozova.
- **Rampa**: najstrmiji gradijent nagiba duž njenih rampi, u mm po metru.

Nagib se povećava preko svakog prelaza, oblikovan kao njegova zakrivljenost: pravo za klotoidu ili kubnu parabolu, u obliku Bloss-a za Bloss, i tako dalje. Kraj krivine bez prelaza dobija rampu na pravcu ispred nje, koliko god je potrebno da bi se zadovoljila granica gradijenta nagiba, i to se navodi: nagib se tada menja tamo gde se ne menja zakrivljenost.

**Nagib se obrće oko** određuje koja šina ostaje na projektnom profilu: **niža šina** (uobičajeno), **unutrašnja šina** ili **osovina koloseka** (svaka šina se pomeri za polovinu nagiba). Projektni profil je tada gornja ivica šine.

**Dijagram nagiba** crta visinu svake šine iznad profila duž stacionaža; prikaz profila i listovi plana i profila dobijaju isto kao traku ispod profila.

## Granice nagiba i upozorenja

**Najveći primenjeni nagib**, **Najveći manjak nagiba**, **Najveći višak nagiba**, **Najstrmiji gradijent nagiba** i **Najbrža promena nagiba** (gradijent pri brzini na pruzi, mm/s) proveravaju se na svakoj krivini. Vrednost preko granice je upozorenje u bloku Železnica i na panelu Problemi, sa granicom i nađenom vrednošću. Bez projektne brzine manjak i brzina promene se ne proveravaju (o tome stoji napomena).

## Kolosek

Postavite **Raspon koloseka** (standardni 1435 mm, široki, metarski ili uski unapred zadati, ili sopstveni), **Profil šine** (60E1, 54E1, 49E1, 115RE, 136RE: samo njihove objavljene dimenzije), broj **Koloseka** i njihov **Razmak osovina koloseka**, zatim **Pragove i tučenik**: materijal pragova, dužinu, širinu, dubinu i razmak; dubinu tučenika ispod praga (na nižoj šini), rame, nagib, koliko je njegov vrh niži od pragova; dubinu podtučenika, bankinu iza ivice tučenika i poprečni pad posteljice.

Pritisnite **Izgradi kolosek**. Ona se primenjuje na koridor osovine trase, izgrađen kao kolosek duž projektnog profila: šine i pragovi se naginju s nagibom, posteljica ne. Ivice useka i nasipa idu od bankine na mestu useka koridora, a kolosek se uklapa u novu površinu kao put.

- **Plan**: obe šine svakog koloseka (sloj C-RAIL-TRAK) i, sa više koloseka, osovina svakog koloseka (C-RAIL-CNTR), na ekranu, u DXF, DWG, PDF i listovima plana i profila.
- **Preseci**: pragovi, šine, donje ivice tučenika i podtučenika u svakom preseku.
- **3D**: šine, svaki prag i tučenička posteljica (Prikaz › Kolosek), i u GLB, OBJ i USD.
- **Količine**: dužina koloseka, šine (obe šine svakog koloseka, duž sopstvene linije svakog koloseka), pragovi, tučenička posteljica i tučenik bez pragova, i podtučenik, metodom prosečnih površina krajeva između preseka.

## Provere geometrije koloseka

Pored nagiba, blok Železnica proverava samu liniju prema još šest granica (sve privremene, sve vaše da ih postavite):

- **Najstrmiji nagib** projektnog profila, u mm po metru.
- **Najmanji poluprečnik vertikalne krivine**, kao faktor k u R ≥ k·V² (R u metrima, V u km/h). Parabolična vertikalna krivina dužine L između dva nagiba ima poluprečnik L podeljeno promenom nagiba.
- **Najkraća vertikalna krivina**.
- **Najmanji poluprečnik krivine** u planu (0 isključuje ovu proveru).
- **Najkraći luk ili pravac**, kao sekunde putovanja pri brzini na pruzi: kružni luk, ili pravac između dve krivine, kraći od te daljine dobija upozorenje. 1.8 s je poznato pravilo „polovina brzine u km/h, u metrima”.
- **Brzina promene manjka nagiba** duž svakog prelaza, u mm/s pri brzini na pruzi.

**Geometrija koloseka** navodi najstrmiji nađeni nagib i svaku vertikalnu krivinu sa njenim poluprečnikom i poluprečnikom koji zahteva brzina na pruzi. Vertikalna krivina koja leži na prelazu ili rampi nagiba dobija napomenu. Bez projektnog profila ili projektne brzine, provere koje ih zahtevaju se preskaču, o čemu stoji napomena.

## Skretnice i ukrsnice

Pod **Skretnice i ukrsnice** pritisnite **Dodaj skretnicu**. Ona se postavlja na najduži pravac; podesite u tabeli:

- **Stacionaža početka skretnice**: mesto gde skretnica počinje na ovoj osovini.
- **Srce**: broj srca N (1:N). Ugao srca je 2·atan(1 / 2N).
- **Strana**: levo ili desno, gledano u smeru rastuće stacionaže.
- **Razmak ukrsnice** u metrima: iznad 0, skretnica postaje ukrsnica sa paralelnim kolosekom na toj daljini (dve skretnice i pravac između njih).

Tabela prikazuje **Vodeći deo** (od početka skretnice do srca), **Poluprečnik** krivine zatvaranja i **Brzinu u skretanju** koju taj poluprečnik dopušta uz vašu granicu manjka nagiba i bez nagiba. **Napravi njen kolosek** pretvara skretnički pravac u osovinu trase za sebe (skretnica, krivina zatvaranja, pa pravo na srcu pod uglom srca) sa istim železničkim podešavanjima, spremnu za produženje.

Plan crta dve skretničke šine svake skretnice, njenu osovinu, oznaku na početku skretnice i na srcu, i „1:N” (sloj C-RAIL-TURN), na ekranu i u DXF, DWG, PDF i listovima. Prikaz 3D crta skretničke šine na nivou glavnog koloseka.

Oblik je **privremen**: prava skretnica i jedna krivina zatvaranja iz broja srca. Izgrađena skretnica prati standard železnice i crtež proizvođača. Upozorenja: skretnica koja izlazi iz osovine trase, leži na krivini, prelazu, nagibu ili vertikalnoj krivini, ili se preklapa s drugom; i napomena kad je brzina na pruzi iznad njene brzine u skretanju.

## Slobodni profil

Označite **Povuci slobodni profil duž ovog koloseka**. Izaberite **Obris** (dva privremena oblika, ili **Sopstveni obris** upisan kao jedna tačka po redu: pomeraj od osovine koloseka, pa visina iznad gornje ivice šine, u metrima), **Dužinu vozila** i **Osovinske razmake** i, ako postoji, **Ivicu perona** (strana, rastojanje od osovine koloseka, visina iznad šine).

Na svakoj stacionaži obris se naginje s nagibom oko niže šine i širi se zbog krivine: sredina vozila se pomera unutra za b² / 8R, a krajevi napolje za (L² − b²) / 8R (b su osovinski razmaci, L dužina vozila, R poluprečnik na tom mestu, prateći prelaz). Blok crta presek na pravcu i tamo gde je najširi, i navodi:

- **najširi slobodni profil** i gde,
- **osovine koloseka** upoređene sa osovinama koje traže dva susedna profila,
- prostor koji ostaje na **ivici perona**, ili koliko zadire unutra,
- svaku liniju objekta, cevnu konstrukciju i drugu železničku osovinu nađenu **unutar slobodnog profila**.

Linija objekta sa kotama procenjuje se prema obrisu na njenoj visini iznad šine; bez projektnog profila, ili za tačku bez kote, procenjuje se samo u planu, a spisak to kaže. Plan prikazuje dve ivice profila (sloj C-RAIL-CLRN) sa krstom na svakoj stvari unutar njega.

Ponuđeni obrisi su **privremeni, nisu gabarit nijedne železnice**. Upišite gabarit konstrukcije vaše železnice pre nego što se oslonite na rezultat.

## U drugim programima

- **LandXML**: osovina železničke pruge upisuje se sa svojim prelazima (spiType) i blokom `Cant`: raspon, osa obrtanja, brzina na pruzi, i stacionaža gde svaka rampa nagiba počinje i završava se, sa primenjenim nagibom, ravnotežnim nagibom i manjkom. Otvaranje LandXML datoteke sa blokom `Cant` čini tu osovinu železnicom s tim nagibima.
- **IFC**: osovina sa svojim segmentima nagiba, šine, pragovi, tučenik i podtučenik.

## Još nije izgrađeno

Skretnice u IFC izvozu, porodice skretnica preko jedne krivine zatvaranja (zakrivljene skretnice, srca s pokretnim krakom, ukrsne skretnice, dijamantske ukrsnice), pravila kinematskog gabarita (obris je fiksan s pomakom krivine), nadzemni vodovi i signalizacija.

**Koji standard.** U bloku Železnica, „Standard za navođenje” bira Nijedan ili Evropski (UIC i EN). Izbor Evropski navodi dokumente na koje se evropski projekt poziva (EN 13803 za parametre osovine, EN 13232 za skretnice i ukrštanja, EN 15273 za gabarite, EN 13848 za kvalitet geometrije koloseka) i daje svakoj granici polje za klauzulu iz koje potiče. Nijedan broj iz nijednog standarda nije ugrađen: granice nagiba, manjka, viška, gradijenta i brzine promene, geometrija skretnice i gabarit konstrukcije su i dalje privremeni, a prozor to kaže. Inženjer železnice proverava svaku vrednost prema tekstu samog standarda i upisuje klauzulu pored nje, pre nego što se išta izgradi. Južna Afrika i tabele AREMA nisu u ovom izdanju.
