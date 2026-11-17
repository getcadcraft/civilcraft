---
title: Profili vodne površine rijeke
summary: Modelirajte rijeku iz površine terena i izračunajte stacionarne profile vodne površine metodom standardnog koraka: nivoe vode, energiju, brzine, Frudove brojeve i obuhvat poplave na planu. Laboratorijska funkcija; svaki rezultat zahtijeva pregled inženjera.
keywords: nasip, neefektivno područje tečenja, uređivač presjeka, rijeka, hidraulika, profil vodne površine, uspor, standardni korak, stacionarno tečenje, 1D, poprečni presjeci, manning, hrapavost, provodnost, kritična dubina, normalna dubina, frud, linija energije, obuhvat poplave, poplavna ravnica, plavljenje, granice obale, dužine dionica, sužavanje, proširenje, podkritično, nadkritično, mješoviti režim, hidraulički skok
from: fb8bf425
---

CivilCraft računa stacionarne, jednodimenzionalne profile vodne površine duž rijeke: za svaki protok koji unesete, nivo vode na svakom poprečnom presjeku, iz bilansa energije između susjednih presjeka (metoda standardnog koraka). Funkcija je u laboratoriji dok se provjerava.

**Samo pomoćno sredstvo za projektovanje.** Nivoi vode zahtijevaju pregled kvalifikovanog inženjera prije nego se iko na njih osloni: jednodimenzionalni model vrijedi onoliko koliko vrijede njegovi presjeci, vrijednosti hrapavosti, dužine dionica i granični uslovi, a ne zna za mostove, propuste ili tečenje koje izlazi iz rijeke.

## Nacrtajte rijeku

1. Prvo izgradi postojeću površinu terena (tačke, linije prijeloma ili TIN koji si otvorio).
2. Pod **Površina** › {{ui:More}}, odaberi {{ui:River}}.
3. Klikni duž ose rijeke **od uzvodnog do nizvodnog kraja**, zatim pritisni {{key:Enter}} ili dvaput klikni.

CivilCraft siječe presjek normalno na osu svakih 50 m (200 ft), po 100 m (300 ft) na svaku stranu, iz terena. Stacionaže rijeke se mjere od nizvodnog kraja, pa rastu uzvodno. Obale se u početku pretpostavljaju 10 m (30 ft) s obje strane najniže tačke svakog presjeka.

Da dodate presjek tamo gdje se rijeka sužava ili gdje stoji građevina, odaberi rijeku, klikni {{ui:Dodaj presjek}} i nacrtaj liniju reza preko nje (u oba smjera: okreće se da ide slijeva nadesno gledajući nizvodno).

## Postavite rijeku

Odaberi rijeku da je vidiš u {{ui:Svojstva}}:

- **Režim tečenja**: podkritično (uobičajeno: računa se uzvodno od nizvodne granice), nadkritično (računa se nizvodno od uzvodne granice) ili mješovito (oboje, zatim onaj s većom specifičnom silom na svakom presjeku; pregled).
- **Profili tečenja**: naziv i protok za svaki (na primjer protok od 10 godina i od 100 godina), te granica na nizvodnom kraju (i na uzvodnom kada režim nije podkritičan): **Normalna dubina** s nagibom energije (nagib dna je prva pretpostavka), **Poznata kota vodne površine** ili **Kritična dubina**.
- **Presjeci iz terena**: razmak, koliko lijevo i desno, pretpostavka obale i dvije vrijednosti Manningovog koeficijenta n; {{ui:Ponovo izreži presjeke}} zamjenjuje presjeke (jedan korak poništavanja).
- **Tabela presjeka**: za svaki presjek, pomak lijeve i desne obale, n korita i n poplavnog dijela, dužine dionica do sljedećeg presjeka nizvodno (lijevi poplavni dio, korito, desni poplavni dio; mjereno iz plana za početak) i koeficijenti sužavanja i proširenja (0,1 i 0,3 za početak: postepeni prelazi). {{ui:Uredi}} otvara uređivač presjeka (sljedeće); tačka iza njega znači da presjek ima nasip ili neefektivno područje.

Svaka promjena je jedan korak poništavanja ({{key:Mod+Z}}).

## Uredite presjek: obale, nasipi i neefektivna područja

{{ui:Uredi}} na presjeku crta njegov teren i dopušta vam da prevlačite ono što rješavač čita: **lijevu i desnu obalu** (dijele presjek na lijevi poplavni dio, glavno korito i desni poplavni dio), **nasip** s bilo koje strane i **neefektivna područja tečenja**. Svaka ručica se može pomjerati strelicama na tastaturi, a svaki broj se može upisati pored grafikona. {{ui:Primijeni}} je jedan korak poništavanja.

- **Nasip** ima mjesto (pomak) i kotu krune. Teren iza njega, dalje od rijeke, odvojen je od rijeke dok je vodna površina ispod krune: njegova površina, močeni obim i provodnost se izostavljaju. Iznad krune cijeli presjek se ponovo računa. Nasip stoji izvan obale koju štiti; onaj unutar obala je označen.
- **Neefektivno područje tečenja** zadržava vodu, ali ne nosi protok (džep iza nasipa, mrtva voda pored prilaza mostu). Upiši njegova dva pomaka i, ako želite, nivo vode ispod kojeg je neefektivno ({{ui:uvijek}} ako je prazno): iznad tog nivoa ono teče kao ostatak. Ono koje pokriva dio glavnog korita je označeno.
- Između dva presjeka, obuhvat poplave ostavlja suvo tlo iza nasipa koji oba presjeka imaju, dok je vodna površina tamo ispod krune (linija između dvije krune je prava).

## Izračunajte i pročitajte rezultate

Klikni {{ui:Profili vodne površine}}. Za profil koji izabereš dobijaš:

- **dijagram** duž rijeke (protok slijeva nadesno): dno korita, obale, vodnu površinu, liniju energije i vodnu površinu kritične dubine; presjeci držani na kritičnoj dubini su zaokruženi;
- **tabelu** za svaki presjek: stacionažu rijeke, protok, dno korita, vodnu površinu, vodnu površinu kritične dubine, liniju energije, dubinu, brzinu u koritu i ukupnu, Frudov broj korita, površinu tečenja, širinu po vrhu, protok u svakom poplavnom dijelu i u koritu, nagib energije i upozorenja;
- **upozorenja** običnim riječima, na primjer presjek postavljen na kritičnu dubinu, voda iznad krajeva presjeka, ili veliku promjenu provodnosti između dva presjeka (dodaj presjeke između).

{{ui:Tabela (CSV)}}, {{ui:Izvještaj}} (običan tekst s metodom, granicama i svakom tabelom) i {{ui:Dijagram (SVG)}} se spašavaju u vaša preuzimanja. Svaki nosi liniju za pregled.

Označi {{ui:Prikaži obuhvat poplave}} u {{ui:Svojstva}} da zasjeniš mokro područje na planu za izabrani profil, s linijom vodnog lica tamo gdje je dubina nula. Između presjeka vodna površina je ravna preko rijeke i mijenja se linearno sa stacionažom rijeke. Teren iza nasipa ostaje suv dok je voda ispod njegove krune. Drugo nisko zemljište unutar koridora rijeke koje voda ne može dosegnuti (iza nasipa puta, recimo) se i dalje zasjenjuje: provjeri ga.

## Na crtežu i u Problemima

Linije rijeke idu na plan, PDF i DWG na svojim slojevima: **C-WATR-CNTR** (osa), **C-WATR-SCTN** (svaka linija reza, sa stacionažom rijeke) i **C-WATR-FLOD** (linija vodnog lica obuhvata poplave, kada je {{ui:Prikaži obuhvat poplave}} označeno za profil). Upozorenja rijeke (presjek postavljen na kritičnu dubinu, voda iznad krajeva presjeka, promjena provodnosti koja traži više presjeka, bilans energije koji se nije zatvorio, nasip unutar obala) također idu u panel **Problemi**, vezana za rijeku i postavljena na presjek iz kojeg potiču.

## Kako se računa

- Energija između dva presjeka: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Provodnost po podjeli: svaki poplavni dio se dijeli tamo gdje se mijenja njegovo n, K = Σ (1/n)·A·R^(2/3) (1,486/n u američkim jedinicama); korito je jedan dio, sa složenim n kada se njegovo n mijenja. α dolazi iz načina na koji se provodnost dijeli.
- Nagib trenja prema prosječnoj provodnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², preko dužine dionice ponderisane protokom.
- Koeficijent sužavanja kada se tečenje nizvodno ubrzava, proširenja kada usporava.
- Kritična dubina = najmanja specifična energija. Svaki nivo vode se rješava na intervalu, pa nikad ne skoči na pogrešnu stranu kritične; kada rješenja nema, postavlja se na kritičnu dubinu i označava.

Program je provjeren prema Manningovoj normalnoj dubini, kritičnoj dubini u pravougaonom koritu i Čowovom primjeru uspora (*Open-Channel Hydraulics*, 1959, poglavlje 10), nezavisno integrisanom. Istu metodu koriste uobičajeni jednodimenzionalni programi za rijeke, pa se ručni proračun ili bilješke studenta mogu prenijeti.

## Propusti i mostovi

U {{ui:Svojstva}} rijeke, pod **Propusti i mostovi**, {{ui:Dodaj propust}} ili {{ui:Dodaj most}} postavlja jedan između dva presjeka (svaka dionica zadržava najmanje dva). Profil ispod njega se ne mijenja; vodna površina odmah iznad dolazi iz građevine, a profil se nastavlja uzvodno od nje. **Rezultati** dodaju tabelu za svaku građevinu: donju vodu, nivo uzvodne vode, koja kontrola vlada, protok kroz otvor i protok preko puta ili kolovoza. Samo podkritično tečenje.

- **Propust** (kutijasti ili okrugli, jedan ili više jednakih otvora). Kontrola na ulazu je tečenje preko preliva dok je ulaz slobodan, a tečenje kroz otvor kada je potopljen, miješano između uzvodnog nivoa od jedan i jedan i po puta visine. Kontrola na izlazu je bilans energije: gubitak na ulazu, trenje i brzinska visina na izlazu, preko višeg od donje vode i srednje visine kritične dubine i krune, umanjeno za pad duž otvora. Uzvodna voda je veća od te dvije. Označi **Voda može preći preko puta** i tečenje preko preliva puta dijeli protok s otvorima.
- **Most.** Otvor je presjek ispod mosta, presječen na osloncima, a svaki stub je površina koja ne nosi protok. Vodna površina u otvoru dolazi iz presjeka ispod (koeficijent proširenja), a presjek iznad iz otvora (koeficijent sužavanja). Ako otvor ne može propustiti protok pri toj donjoj vodi, radi na kritičnoj dubini i most se označava kao zagušenje. Ako voda dosegne donju tetivu, tečenje je pod pritiskom (tip ustave dok je donja voda ispod donje tetive, potopljeno iznad nje), a voda preko kolovoza dodaje tečenje preko preliva; uzvodni nivo je onaj pri kojem se oni zbrajaju u protok.

Koeficijenti (protok, gubitak na ulazu, preliv) su unaprijed zadane okrugle vrijednosti. Promijeni ih za svoj projekat. Nisu to ugrađeni dijagrami koje štampaju priručnici za projektovanje propusta, pa tretiraj uzvodnu vodu propusta blizu njegove granice kao procjenu. Voda preko puta ili kolovoza, potopljen ulaz, zagušen otvor i brzo tečenje u otvoru prikazuju se u **Problemima**.

## Nestacionarno tečenje

{{ui:Nestacionarno tečenje…}} u {{ui:Svojstva}} rijeke provodi hidrogram poplave kroz presjeke. Upiši ulaz kao sate i protoke, po jedan par po redu, nizvodni nagib (normalna dubina) i koliko dugo se računa. Počinje od stacionarne vodne površine pri prvom protoku i rješava pune jednodimenzionalne jednačine (implicitna četvorotačkasta šema, težina 0,6 u vremenu). Dobijaš najviši nivo vode i protok na svakom presjeku sa satom kada se svaki pojavi, dijagram protoka na dva kraja i provjeru zapremine (ulaz, izlaz i promjenu uskladištenu). Provjerava se da stacionarno tečenje ostaje stacionarno, da skok u ulazu završava na stacionarnom profilu novog protoka, da se zapremina zatvara i brzina poplavnog talasa prema kinematskom talasu. Podkritično tečenje, jedna dionica, bez bočnog ulaza, i bez propusta ili mostova unutar računanja.

## Spojevi

Dionice koje se spajaju u jedan izlaz: protoci se zbrajaju, a vodna površina na početku nizvodne dionice se prenosi do krajeva dionica koje se u nju spajaju (ista vodna površina na spoju, jednostavna metoda: bez ugla, bez količine kretanja, pa pristaje za male Frudove brojeve). Model i testovi su na mjestu (`river-structures.js`); panel za spajanje dvije rijeke na planu još nije izgrađen.

## Još nije izgrađeno

Prelivi i ustave kao zasebne građevine, panel za spojeve, građevine unutar nestacionarnog računanja i nestacionarno nadkritično tečenje. Računanje u mješovitom režimu označava hidraulički skok između dva presjeka, ali ga ne postavlja.

**Gdje se rijeke spajaju.** U {{ui:Svojstva}} rijeke, „Teče u" imenuje rijeku s kojom se spaja. Rijeke koje se spajaju rješavaju se zajedno: rijeka u koju teku nosi zbir njihovih protoka, a svaka od njih završava na vodnoj površini prvog presjeka te rijeke (metoda jednakih vodnih površina; izostavlja ugao i količinu kretanja tokova). Da spojiš glavnu rijeku i potok, nacrtaj kratku rijeku ispod spoja i neka obje teku u nju. Rezultati prikazuju tabelu spoja. Podrazumijevane vrijednosti u ovim rezultatima (sužavanje 0,1, proširenje 0,3, korito u jednom dijelu sa složenom hrapavošću, mješoviti režim po specifičnoj sili) ostaju dok ih inženjer ne pregleda, a Rezultati to kažu.
