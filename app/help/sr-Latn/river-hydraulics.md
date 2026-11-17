---
title: Profili površine vode u reci
summary: Modelujte reku prema površini terena i izračunajte stabilne profile površine vode metodom standardnog koraka: nivoe vode, energiju, brzine, Frudove brojeve i obuhvat poplave na planu. Laboratorijska funkcija; svaki rezultat zahteva pregled inženjera.
keywords: nasip, neefikasna površina tečenja, uređivač preseka, reka, hidraulika, profil površine vode, uspor, metoda standardnog koraka, stabilno tečenje, 1D, poprečni preseci, Manning, hrapavost, provodnost, kritična dubina, normalna dubina, Frud, linija energije, obuhvat poplave, poplavna ravan, plavljenje, obale, dužine deonica, sužavanje, proširenje, podkritično, nadkritično, mešoviti režim, hidraulički skok
from: fb8bf425
---

CivilCraft računa stabilne, jednodimenzionalne profile površine vode duž reke: za svaki protok koji zadate, nivo vode na svakom poprečnom preseku, iz bilansa energije između susednih preseka (metoda standardnog koraka). Funkcija je u laboratoriji dok se proverava.

**Samo pomoćno sredstvo za proračun.** Nivoe vode mora da pregleda kvalifikovani inženjer pre nego što se iko na njih osloni: 1D model vredi koliko i njegovi preseci, vrednosti hrapavosti, dužine deonica i granični uslovi, a ne zna za mostove, propuste ni tok koji izlazi iz reke.

## Nacrtajte reku

1. Prvo izgradite postojeću površinu terena (tačke, linije loma ili TIN koji ste otvorili).
2. Pod **Površina** › {{ui:Više}}, izaberite {{ui:Reka}}.
3. Kliknite duž ose reke **od uzvodnog ka nizvodnom kraju**, zatim pritisnite {{key:Enter}} ili dvaput kliknite.

CivilCraft seče presek normalno na osu svakih 50 m (200 ft), 100 m (300 ft) na svaku stranu, od terena. Stacionaže reke mere se od nizvodnog kraja, pa rastu uzvodno. Obale počinju kao pretpostavka 10 m (30 ft) s obe strane najniže tačke svakog preseka.

Da dodate presek tamo gde se reka sužava ili stoji objekat, izaberite reku, kliknite {{ui:Dodaj presek}} i nacrtajte liniju preseka preko nje (u bilo kom smeru: okreće se da ide s leva na desno gledano nizvodno).

## Podesite reku

Izaberite reku da je vidite u **Svojstvima**:

- **Režim tečenja**: podkritično (uobičajeno: računa se uzvodno od nizvodne granice), nadkritično (računa se nizvodno od uzvodne granice) ili mešovito (oba, pa onaj s većom specifičnom silom na svakom preseku; pregled).
- **Profili tečenja**: naziv i protok za svaki (na primer 10-godišnji i 100-godišnji protok), i granica na nizvodnom kraju (i uzvodnom kraju kad režim nije podkritičan): **Normalna dubina** s nagibom energije (nagib dna je prva pretpostavka), **Poznata kota površine vode**, ili **Kritična dubina**.
- **Preseci iz terena**: razmak, koliko levo i desno, pretpostavka obale i dve Manningove vrednosti n; {{ui:Ponovo seci preseke}} zamenjuje preseke (jedan korak za opozivanje).
- **Tabela preseka**: za svaki presek, pomeraji leve i desne obale, n korita i n preko obala, dužine deonica do sledećeg preseka nizvodno (leva obala, korito, desna obala; mere se u planu od početka), i koeficijenti sužavanja i proširenja (0.1 i 0.3 na početku: postepeni prelazi). {{ui:Uređivanje}} otvara uređivač preseka (sledeće); tačka iza njega znači da presek ima nasip ili neefikasnu površinu.

Svaka promena je jedan korak za opozivanje ({{key:Mod+Z}}).

## Uredite presek: obale, nasipi i neefikasne površine

{{ui:Uređivanje}} na preseku crta njegov teren i dozvoljava vam da prevučete ono što rešavač čita: **levu i desnu obalu** (dele presek na levu obalu preko korita, glavno korito i desnu obalu preko korita), **nasip** s jedne ili druge strane i **neefikasne površine tečenja**. Svaka ručica može da se pomera i strelicama, a svaki broj može da se upiše pored grafikona. {{ui:Primeni}} je jedan korak za opozivanje.

- **Nasip** ima mesto (pomeraj) i kotu krune. Teren iza njega, dalje od reke, odvojen je od reke dok je površina vode ispod krune: njegova površina, močeni obim i provodnost se izostavljaju. Iznad krune ceo presek se ponovo računa. Nasip stoji van obale koju štiti; onaj unutar obala se označava.
- **Neefikasna površina tečenja** zadržava vodu, ali ne nosi protok (džep iza nasipa, mrtva voda pored prilaza mostu). Upišite njena dva pomeraja i, ako želite, nivo vode ispod kojeg je neefikasna ({{ui:uvek}} kad je prazno): iznad tog nivoa ona teče kao ostatak. Ona koja pokriva deo glavnog korita označava se.
- Između dva preseka obuhvat poplave ostavlja suv teren iza nasipa koji imaju oba preseka, dok je površina vode tamo ispod krune (linija između dve krune je prava).

## Izračunajte i čitajte rezultate

Kliknite {{ui:Profili površine vode}}. Za profil koji izaberete dobijate:

- **grafikon** duž reke (tok s leva udesno): dno korita, obale, površina vode, linija energije i kritična površina vode; preseci zadržani na kritičnoj dubini su zaokruženi;
- **tabelu** po preseku: stacionaža reke, protok, dno korita, površina vode, kritična površina vode, linija energije, dubina, brzina u koritu i ukupno, Frudov broj korita, površina tečenja, širina na vrhu, protok u svakoj obali i koritu, nagib energije i upozorenja;
- **upozorenja** običnim rečima, na primer presek postavljen na kritičnu dubinu, voda iznad krajeva preseka, ili velika promena provodnosti između dva preseka (dodajte preseke između).

{{ui:Tabela (CSV)}}, {{ui:Izveštaj}} (običan tekst s metodom, granicama i svim tabelama) i {{ui:Grafikon (SVG)}} čuvaju se u preuzimanja. Svaki od njih nosi red za pregled.

Označite {{ui:Prikaži obuhvat poplave}} u **Svojstvima** da obojite mokro područje na planu za izabrani profil, a vodena linija se crta tamo gde je dubina nula. Između preseka površina vode je ravna preko reke i menja se linearno sa stacionažom reke. Teren iza nasipa ostaje suv dok je voda ispod njegove krune. Ostali nizak teren unutar koridora reke, do kojeg voda ne može da dođe (iza nasipa puta, na primer), i dalje se boji: proverite ga.

## Na crtežu i u Problemima

Linije reke idu na plan, PDF i DWG na sopstvenim slojevima: **C-WATR-CNTR** (osa), **C-WATR-SCTN** (svaka linija preseka, sa stacionažom reke) i **C-WATR-FLOD** (vodena linija obuhvata poplave, kad je {{ui:Prikaži obuhvat poplave}} označeno za profil). Upozorenja reke (presek postavljen na kritičnu dubinu, voda iznad krajeva preseka, promena provodnosti koja traži više preseka, bilans energije koji se nije zatvorio, nasip unutar obala) idu i na panel **Problemi**, vezana za reku i postavljena na presek iz kog potiču.

## Kako se računa

- Energija između dva preseka: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Provodnost podelom: svaka obala je podeljena tamo gde se n menja, K = Σ (1/n)·A·R^(2/3) (1.486/n u američkim jedinicama); korito je jedan deo, sa složenim n kad se njegov n menja. α dolazi iz načina na koji se provodnost deli.
- Nagib trenja po srednjoj provodnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², preko dužine deonice ponderisane protokom.
- Koeficijent sužavanja kad se tok ubrzava nizvodno, proširenja kad usporava.
- Kritična dubina = najmanja specifična energija. Svaki nivo vode rešava se unutar zagrade, pa nikad ne skače na pogrešnu stranu kritične; kad rešenje ne postoji, postavlja se na kritičnu dubinu i označava se.

Program je proveren prema Manningovoj normalnoj dubini, kritičnoj dubini u pravougaonom koritu i Čouovom primeru uspora (*Open-Channel Hydraulics*, 1959, poglavlje 10), nezavisno integrisanom. Istu metodu koriste uobičajeni 1D programi za reke, pa ručni proračun ili beleške studenata prelaze bez problema.

## Propusti i mostovi

U **Svojstvima** reke, pod **Propusti i mostovi**, {{ui:Dodaj propust}} ili {{ui:Dodaj most}} stavlja jedan između dva preseka (svaka deonica zadržava najmanje dva). Profil ispod njega ostaje isti; površina vode odmah iznad dolazi iz objekta, a profil se nastavlja uzvodno od tog mesta. **Rezultati** dodaju tabelu za svaki objekat: nivo vode nizvodno, nivo vode uzvodno, koja kontrola vlada, protok kroz otvor i protok preko puta ili konstrukcije. Samo podkritično tečenje.

- **Propust** (kutijasti ili okrugli, jedan ili više jednakih otvora). Kontrola na ulazu je tečenje preko preliva dok je ulaz slobodan, a tečenje kroz otvor kad je potopljen, mešano između uzvodnog nivoa od jedne do jedne i po visine. Kontrola na izlazu je bilans energije: gubitak na ulazu, trenje i visina brzine na izlazu, iznad višeg od nivoa nizvodno i srednje visine kritične dubine i krune, manje pad duž otvora. Uzvodni nivo je veći od ova dva. Označite **Voda može preći preko puta** i tečenje preko preliva puta deli protok s otvorima.
- **Most.** Otvor je presek ispod mosta, presečen na osloncima, a svaki stub je površina koja ne nosi protok. Površina vode u otvoru dolazi iz preseka ispod (koeficijent proširenja), a presek iznad iz otvora (koeficijent sužavanja). Ako otvor ne može da propusti protok pri tom nivou nizvodno, teče na kritičnoj dubini i most se označava kao zagušenje. Ako voda dostigne donju pojasnicu, tečenje je pod pritiskom (tip ustave dok je nivo nizvodno ispod donje pojasnice, potopljeno iznad nje), a voda preko kolovoza dodaje tečenje preko preliva; uzvodni nivo je onaj pri kojem se oni zbrajaju u protok.

Koeficijenti (proticanje, gubitak na ulazu, preliv) su unapred zadate okrugle vrednosti. Promenite ih za svoj projekat. Nisu to ugrađeni dijagrami koje štampaju priručnici za projektovanje propusta, pa uzmite uzvodni nivo blizu granice propusta kao procenu. Voda preko puta ili konstrukcije, potopljen ulaz, zagušen otvor i brzo tečenje u otvoru prikazani su u **Problemima**.

## Nestacionarno tečenje

{{ui:Nestacionarno tečenje…}} u **Svojstvima** reke vodi hidrogram poplave niz preseke. Unesite ulaz kao sate i protoke, jedan par po redu, nagib nizvodno (normalna dubina) i koliko dugo se računa. Počinje od stabilne površine vode pri prvom protoku i rešava pune jednodimenzionalne jednačine (implicitna četvorotačkasta šema, težina 0.6 u vremenu). Dobijate maksimalni nivo vode i protok na svakom preseku, sa satom kad se svaki javlja, grafikon protoka na dva kraja i proveru zapremine (ulaz, izlaz i promenu uskladištenu). Proverava se da stabilno tečenje ostaje stabilno, da skok na ulazu završava na stabilnom profilu novog protoka, da se zapremina zatvara i brzina talasa poplave prema kinematičkom talasu. Podkritično tečenje, jedna deonica, bez bočnog ulaza i bez propusta ili mostova unutar računa.

## Spajanja

Deonice koje tok spajaju u jedan izlaz: protoci se zbrajaju, a površina vode na početku nizvodne deonice prenosi se do krajeva deonica koje se u nju uliva (ista površina vode na spoju, prosta metoda: bez ugla, bez količine kretanja, pa odgovara malim Frudovim brojevima). Model i testovi su na mestu (`river-structures.js`); panel za spajanje dve reke na planu još nije izgrađen.

## Još nije izgrađeno

Preliv i ustave kao sopstveni objekti, panel za spajanja, objekti unutar nestacionarnog računa i nadkritično nestacionarno tečenje. Računanje s mešovitim režimom označava hidraulički skok između dva preseka, ali ga ne postavlja.

**Gde se reke spajaju.** U Svojstvima reke, „Uliva se u” navodi reku s kojom se spaja. Reke koje se spajaju rešavaju se zajedno: reka u koju se uliva nosi zbir njihovih protoka, a svaka se završava na površini vode prvog preseka te reke (metoda jednakih površina vode; izostavlja ugao i količinu kretanja tokova). Da spojite glavnu reku i potok, nacrtajte kratku reku ispod spoja i neka obe utiču u nju. Rezultati prikazuju tabelu spajanja. Podrazumevane vrednosti u ovim rezultatima (sužavanje 0.1, proširenje 0.3, korito u jednom delu sa složenom hrapavošću, mešoviti režim po specifičnoj sili) ostaju dok ih inženjer ne pregleda, a Rezultati to kažu.
