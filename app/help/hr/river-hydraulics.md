---
title: Profili vodnog lica rijeke
summary: Modelirajte rijeku iz površine terena i izračunajte ustaljene profile vodnog lica standardnom metodom koraka: razine vode, energiju, brzine, Froudove brojeve i opseg poplave na tlocrtu. Laboratorijska značajka; svaki rezultat zahtijeva pregled inženjera.
keywords: nasip, područje neučinkovitog protoka, uređivač presjeka, rijeka, hidraulika, profil vodnog lica, uspor, standardna metoda koraka, ustaljeni tok, 1d, poprečni presjeci, manning, hrapavost, provodnost, kritična dubina, normalna dubina, froude, linija energije, opseg poplave, poplavno područje, plavljenje, obalne točke, duljine dionica, sužavanje, proširenje, podkritično, nadkritično, mješoviti režim, hidraulički skok
from: fb8bf425
---

CivilCraft računa ustaljene, jednodimenzionalne profile vodnog lica duž rijeke: za svaki protok koji zadate, razinu vode u svakom poprečnom presjeku, iz bilance energije između susjednih presjeka (metoda standardnih koraka). Dok se provjerava, nalazi se u laboratoriju.

**Samo pomoćno sredstvo za projektiranje.** Razine vode trebaju pregled kvalificiranog inženjera prije nego se itko na njih osloni: 1D model vrijedi koliko i njegovi presjeci, vrijednosti hrapavosti, duljine dionica i rubni uvjeti, a ne poznaje mostove, propuste ni tok koji izlazi iz rijeke.

## Nacrtajte rijeku

1. Prvo izradite postojeću površinu terena (točke, prijelomnice ili TIN koji ste otvorili).
2. U **Teren** › {{ui:Više}} odaberite {{ui:Rijeka}}.
3. Kliknite duž središnje linije rijeke **od uzvodnog prema nizvodnom dijelu**, zatim pritisnite {{key:Enter}} ili dvaput kliknite.

CivilCraft iz terena siječe presjek okomit na središnju liniju svakih 50 m (200 ft), 100 m (300 ft) na svaku stranu. Stacionaže rijeke mjere se od nizvodnog kraja, pa rastu uzvodno. Obale su u početku procijenjene na 10 m (30 ft) s obje strane najniže točke svakog presjeka.

Za dodavanje presjeka tamo gdje se rijeka sužava ili gdje stoji građevina, odaberite rijeku, kliknite {{ui:Dodaj presjek}} i nacrtajte liniju presjeka preko nje (bilo kojim smjerom: okreće se da ide slijeva nadesno gledajući nizvodno).

## Postavite rijeku

Odaberite rijeku da je vidite u **Svojstvima**:

- **Režim toka**: podkritični (uobičajeni slučaj: računa se uzvodno od nizvodne granice), nadkritični (računa se nizvodno od uzvodne granice) ili mješoviti (oba, zatim onaj s većom specifičnom silom na svakom presjeku; pregled).
- **Profili protoka**: naziv i protok za svaki (na primjer protok za 10 godina i za 100 godina) te granica na nizvodnom kraju (i uzvodnom kad režim nije podkritičan): **Normalna dubina** s nagibom energije (nagib korita je prva procjena), **Poznata razina vodnog lica** ili **Kritična dubina**.
- **Presjeci iz terena**: razmak, koliko lijevo i desno, procjena obale i dvije vrijednosti Manningova n; {{ui:Ponovno izreži presjeke}} zamjenjuje presjeke (jedan korak poništavanja).
- **Tablica presjeka**: za svaki presjek, odmaci lijeve i desne obale, n korita i n poplavnog dijela, duljine dionica do sljedećeg nizvodnog presjeka (lijevi poplavni dio, korito, desni poplavni dio; mjereno s tlocrta na početku) te koeficijenti sužavanja i proširenja (0.1 i 0.3 na početku: postupni prijelazi). {{ui:Uređivanje}} otvara uređivač presjeka (sljedeće); točka iza njega znači da presjek ima nasip ili područje neučinkovitog protoka.

Svaka promjena je jedan korak poništavanja ({{key:Mod+Z}}).

## Uređivanje presjeka: obale, nasipi i neučinkovita područja

{{ui:Uređivanje}} na presjeku crta njegov teren i omogućuje povlačenje onoga što rješavač čita: **lijeva i desna obala** (dijele presjek na lijevi poplavni dio, glavno korito i desni poplavni dio), **nasip** s bilo koje strane i **područja neučinkovitog protoka**. Svaka ručka može se pomicati i strelicama, a svaki broj može se upisati pored dijagrama. {{ui:Primijeni}} je jedan korak poništavanja.

- **Nasip** ima položaj (odmak) i kotu krune. Teren iza njega, dalje od rijeke, odvojen je od rijeke dok je vodno lice ispod krune: njegova površina, omočeni opseg i provodnost se ne uzimaju u obzir. Iznad krune cijeli presjek ponovno se računa. Nasip stoji izvan obale koju štiti; onaj unutar obala je označen.
- **Područje neučinkovitog protoka** zadržava vodu, ali ne nosi protok (džep iza nasipa, mrtva voda pored prilaza mostu). Zadajte njegova dva odmaka i, ako želite, razinu vode ispod koje je neučinkovito ({{ui:uvijek}} kad je prazno): iznad te razine teče kao ostatak. Ono koje pokriva dio glavnog korita je označeno.
- Između dva presjeka opseg poplave ostavlja suhim teren iza nasipa koji imaju oba presjeka, dok je vodno lice tamo ispod krune (linija između dviju kruna je ravna).

## Izračunajte i čitajte rezultate

Kliknite {{ui:Profili vodnog lica}}. Za odabrani profil dobit ćete:

- **dijagram** duž rijeke (tok slijeva nadesno): dno korita, obale, vodno lice, linija energije i kritično vodno lice; presjeci zadržani na kritičnoj dubini su zaokruženi;
- **tablicu** po presjeku: stacionaža rijeke, protok, dno korita, vodno lice, kritično vodno lice, linija energije, dubina, brzina u koritu i ukupna, Froudov broj korita, površina toka, gornja širina, protok u svakom poplavnom dijelu i u koritu, nagib energije te upozorenja;
- **upozorenja** običnim riječima, na primjer presjek postavljen na kritičnu dubinu, voda iznad krajeva presjeka ili velika promjena provodnosti između dva presjeka (dodajte presjeke između).

{{ui:Tablica (CSV)}}, {{ui:Izvještaj}} (običan tekst s metodom, granicama i svakom tablicom) i {{ui:Dijagram (SVG)}} spremaju se u vaša preuzimanja. Svaki od njih nosi redak o pregledu.

Označite {{ui:Prikaži opseg poplave}} u **Svojstvima** da zasjenčite mokro područje na tlocrtu za odabrani profil, s linijom vodostaja tamo gdje je dubina nula. Između presjeka vodno lice je vodoravno preko rijeke i mijenja se linearno sa stacionažom rijeke. Teren iza nasipa ostaje suh dok je voda ispod njegove krune. Ostali niski teren unutar koridora rijeke koji voda ne može doseći (na primjer iza cestovnog nasipa) i dalje je zasjenčen: provjerite ga.

## Na crtežu i u Problemima

Linije rijeke idu na tlocrt, u PDF i DWG na vlastitim slojevima: **C-WATR-CNTR** (središnja linija), **C-WATR-SCTN** (svaka linija presjeka, s njezinom stacionažom rijeke) i **C-WATR-FLOD** (linija vodostaja opsega poplave, kad je za profil označeno {{ui:Prikaži opseg poplave}}). Upozorenja rijeke (presjek postavljen na kritičnu dubinu, voda iznad krajeva presjeka, promjena provodnosti koja traži više presjeka, bilanca energije koja se nije zatvorila, nasip unutar obala) također idu na panel **Problemi**, vezano uz rijeku i postavljeno na presjek iz kojeg potječu.

## Kako se računa

- Energija između dva presjeka: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Provodnost podjelom: svaki poplavni dio dijeli se na mjestu gdje se mijenja njegov n, K = Σ (1/n)·A·R^(2/3) (1.486/n u američkim jedinicama); korito je jedan dio, s ukupnim n kad se njegov n mijenja. α proizlazi iz načina na koji se provodnost dijeli.
- Nagib trenja prema srednjoj provodnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², preko duljine dionice ponderirane protokom.
- Koeficijent sužavanja kad se tok nizvodno ubrzava, proširenja kad usporava.
- Kritična dubina = najmanja specifična energija. Svaka razina vode rješava se unutar zagrade, pa nikad ne skoči na krivu stranu kritične; kad rješenje ne postoji, postavlja se na kritičnu dubinu i označava.

Program je provjeren prema Manningovoj normalnoj dubini, kritičnoj dubini u pravokutnom koritu i Chowovu primjeru uspora (*Open-Channel Hydraulics*, 1959., poglavlje 10), neovisno integriranom. Istu metodu koriste uobičajeni 1D programi za rijeke, pa se ručni izračun ili bilješke studenata mogu prenijeti.

## Propusti i mostovi

U **Svojstvima** rijeke, pod **Propusti i mostovi**, {{ui:Dodaj propust}} ili {{ui:Dodaj most}} postavlja jedan između dva presjeka (svaka dionica zadržava najmanje dva). Profil ispod njega ostaje nepromijenjen; vodno lice neposredno iznad njega dolazi iz građevine, a profil se od tamo nastavlja uzvodno. **Rezultati** dodaju tablicu za svaku građevinu: donja voda, razina gornje vode, koja kontrola vlada, protok kroz otvor te protok preko ceste ili kolnika. Samo podkritični tok.

- **Propust** (kutijasti ili okrugli, jedna ili više jednakih cijevi). Kontrola ulaza je preljevni tok dok je ulaz slobodan, a otvorni tok kad je potopljen, stapa se između gornje vode od jedan do jedan i pol puta visine otvora. Kontrola izlaza je bilanca energije: gubitak na ulazu, trenje i visina brzine na izlazu, iznad višeg od donje vode i sredine kritične dubine i tjemena, umanjeno za pad duž cijevi. Gornja voda je veća od to dvoje. Označite **Voda može prelaziti cestu** i preljevni tok ceste dijeli protok s cijevima.
- **Most.** Otvor je presjek ispod mosta, odrezan na obalnim stupovima, s time da je svaki stup područje koje ne nosi protok. Vodno lice u otvoru dolazi iz presjeka ispod (koeficijent proširenja), a presjek iznad iz otvora (koeficijent sužavanja). Ako otvor ne može propustiti protok pri toj donjoj vodi, teče na kritičnoj dubini i most je označen kao zagušen. Ako voda dosegne donji pojas, protok je tlačni (tip zapornice dok je donja voda ispod donjeg pojasa, potopljen iznad njega), a voda preko kolnika dodaje preljevni tok; razina uzvodno je ona na kojoj se oni zbrajaju u protok.

Koeficijenti (protoka, gubitka na ulazu, preljeva) su zaokružene zadane vrijednosti. Promijenite ih za svoj projekt. To nisu ugrađeni dijagrami koje tiskaju priručnici za projektiranje propusta, pa gornju vodu propusta blizu njegove granice smatrajte procjenom. Voda preko ceste ili kolnika, potopljen ulaz, zagušen otvor i brz tok u cijevi prikazuju se u **Problemima**.

## Nestacionarni tok

{{ui:Nestacionarno tečenje…}} u **Svojstvima** rijeke provodi hidrogram poplave kroz presjeke. Upišite dotok kao sate i protoke, po jedan par u retku, nizvodni nagib (normalna dubina) i koliko dugo se računa. Kreće od ustaljenog vodnog lica pri prvom protoku i rješava pune jednodimenzionalne jednadžbe (implicitna četverotočkovna shema, težina 0.6 u vremenu). Dobivate najvišu razinu vode i protok na svakom presjeku uz sat kad se svaki događa, dijagram protoka na dva kraja i provjeru volumena (ulaz, izlaz i pohranjena promjena). Provjerava se da ustaljeni tok ostaje ustaljen, da skok u dotoku završava na ustaljenom profilu novog protoka, da se volumen zatvara te brzina poplavnog vala u odnosu na kinematički val. Podkritični tok, jedna dionica, bez bočnog dotoka i bez propusta ili mostova unutar izračuna.

## Spojevi

Dionice koje spajaju tok u jedan izlaz: protoci se zbrajaju, a vodno lice na početku nizvodne dionice prenosi se do krajeva dionica koje se spajaju na nju (isto vodno lice na spoju, jednostavna metoda: bez kuta i količine gibanja, pa odgovara malim Froudovim brojevima). Model i testovi su na mjestu (`river-structures.js`); panel za spajanje dviju rijeka na tlocrtu još nije izrađen.

## Još nije izrađeno

Preljevi i zapornice kao zasebne građevine, panel za spojeve, građevine unutar nestacionarnog izračuna i nadkritični nestacionarni tok. Izračun mješovitog režima označava hidraulički skok između dva presjeka, ali ga ne postavlja.

**Gdje se rijeke spajaju.** U Svojstvima rijeke, „Utječe u“ navodi rijeku s kojom se spaja. Rijeke koje se spajaju rješavaju se zajedno: rijeka u koju utječu nosi zbroj njihovih protoka, a svaka od njih završava na vodnom licu prvog presjeka te rijeke (metoda jednakog vodnog lica; izostavlja kut i količinu gibanja protoka). Za spajanje glavne rijeke i potoka, nacrtajte kratku rijeku nizvodno od spoja i neka u nju utječu oba. Rezultati prikazuju tablicu spoja. Zadane vrijednosti u tim rezultatima (sužavanje 0.1, proširenje 0.3, korito u jednom dijelu s ukupnom hrapavošću, mješoviti režim prema specifičnoj sili) ostaju dok ih inženjer ne pregleda, a Rezultati to navode.
