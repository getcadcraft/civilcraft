---
title: Profili vodne gladine v rekah
summary: Modelirajte reko iz površja terena in izračunajte stacionarne profile vodne gladine po metodi standardnega koraka: višine vode, energijo, hitrosti, Froudova števila in obseg poplave na tlorisu. Laboratorijska funkcija; vsak rezultat potrebuje pregled inženirja.
keywords: nasip, neučinkovita pretočna površina, urejevalnik prerezov, reka, hidravlika, profil vodne gladine, vzvratni vpliv, metoda standardnega koraka, stacionarni tok, 1D, prečni prerezi, manning, hrapavost, prevodnost, kritična globina, normalna globina, froude, energijska črta, obseg poplave, poplavna ravnica, poplavljanje, brežine, dolžine odsekov, zoženje, razširitev, podkritični, nadkritični, mešani režim, hidravlični skok
from: fb8bf425
---

CivilCraft izračuna stacionarne, enodimenzionalne profile vodne gladine vzdolž reke: za vsak pretok, ki ga podate, višino vode na vsakem prečnem prerezu iz energijske bilance med sosednjima prerezoma (metoda standardnega koraka). Funkcija je v laboratoriju, dokler se preverja.

**Samo pomoč pri projektiranju.** Višine vode potrebujejo pregled usposobljenega inženirja, preden se nanje kdo zanese: 1D model je dober samo toliko, kolikor so dobri njegovi prerezi, vrednosti hrapavosti, dolžine odsekov in robni pogoji, in ne pozna mostov, prepustov ali toka, ki zapusti reko.

## Narišite reko

1. Najprej zgradite obstoječo površino terena (točke, prelomnice ali TIN, ki ste ga odprli).
2. Pod **Površje** › {{ui:Več}} izberite {{ui:Reka}}.
3. Kliknite vzdolž središnice reke **od zgornjega proti spodnjemu toku**, nato pritisnite {{key:Enter}} ali dvakrat kliknite.

CivilCraft na vsakih 50 m (200 ft) izreže prerez pravokotno na središnico, 100 m (300 ft) na vsako stran, iz terena. Stacionaže reke se merijo od spodnjega konca, zato rastejo proti zgornjemu toku. Brežine se na začetku ocenijo 10 m (30 ft) na obeh straneh najnižje točke vsakega prereza.

Da dodate prerez tam, kjer se reka zoži ali stoji objekt, izberite reko, kliknite {{ui:Dodaj prerez}} in narišite rezno črto čez njo (v katerikoli smeri: obrne se, da teče z leve proti desni, gledano navzdol po toku).

## Nastavite reko

Izberite reko, da jo vidite v **Lastnostih**:

- **Režim toka**: podkritični (običajni primer: izračunan navzgor od spodnje robne meje), nadkritični (izračunan navzdol od zgornje robne meje) ali mešani (oboje, nato tisti z večjo specifično silo na vsakem prerezu; predogled).
- **Profili pretoka**: ime in pretok za vsakega (na primer 10-letni in 100-letni pretok) ter robna meja na spodnjem koncu (in na zgornjem, kadar režim ni podkritičen): **Normalna globina** z energijskim naklonom (naklon dna je prvi približek), **Znana kota vodne gladine** ali **Kritična globina**.
- **Prerezi iz terena**: razmik, kako daleč levo in desno, domneva brežine in dve vrednosti Manningovega n; {{ui:Znova izreži prereze}} zamenja prereze (en korak razveljavitve).
- **Tabela prerezov**: za vsak prerez zamiki levih in desnih brežin, n struge in n poplavnega dela, dolžine odsekov do naslednjega prereza navzdol (levi poplavni del, struga, desni poplavni del; merjeno iz tlorisa na začetku) ter koeficienta zoženja in razširitve (na začetku 0.1 in 0.3: postopna prehoda). {{ui:Urejanje}} odpre urejevalnik prereza (naslednje); pika za njim pomeni, da ima prerez nasip ali neučinkovito območje.

Vsaka sprememba je en korak razveljavitve ({{key:Mod+Z}}).

## Uredite prerez: brežine, nasipi in neučinkovita območja

{{ui:Urejanje}} na prerezu nariše njegov teren in omogoča vleči to, kar reševalnik bere: **levo in desno brežino** (razdelita prerez na levi poplavni del, glavno strugo in desni poplavni del), **nasip** na katerikoli strani in **neučinkovita pretočna območja**. Vsak ročaj lahko premaknete tudi s puščičnimi tipkami, vsako številko pa lahko vpišete poleg grafa. {{ui:Uporabi}} je en korak razveljavitve.

- **Nasip** ima mesto (zamik) in višino krone. Teren za njim, stran od reke, je odrezan od reke, dokler je vodna gladina pod krono: njegova površina, omočeni obod in prevodnost so izpuščeni. Nad krono se celoten prerez spet šteje. Nasip stoji zunaj brežine, ki jo ščiti; tistega znotraj brežin se označi.
- **Neučinkovito pretočno območje** zadržuje vodo, vendar ne prenaša pretoka (zajeda za nasipom, mrtva voda ob dostopu do mosta). Vpišite njegova dva zamika in, če želite, vodno raven, pod katero je neučinkovito ({{ui:vedno}}, kadar je prazno): nad to ravnjo teče kot ostalo. Tisto, ki pokriva del glavne struge, se označi.
- Med dvema prerezoma obseg poplave pusti suh teren za nasipom, ki ga imata oba prereza, medtem ko je vodna gladina tam pod krono (črta med obema krono je ravna).

## Izračun in branje rezultatov

Kliknite {{ui:Profili vodne gladine}}. Za izbrani profil dobite:

- **graf** vzdolž reke (tok z leve proti desni): dno struge, brežine, vodno gladino, energijsko črto in kritično vodno gladino; prerezi, držani pri kritični globini, so obkroženi;
- **tabelo** za vsak prerez: stacionaža reke, pretok, dno struge, vodna gladina, kritična vodna gladina, energijska črta, globina, hitrost v strugi in skupaj, Froudovo število struge, pretočna površina, zgornja širina, pretok v vsakem poplavnem delu in v strugi, energijski naklon in opozorila;
- **opozorila** z navadnimi besedami, na primer prerez nastavljen na kritično globino, voda nad koncema prereza ali velika sprememba prevodnosti med dvema prerezoma (dodajte vmesne prereze).

{{ui:Tabela (CSV)}}, {{ui:Poročilo}} (navadno besedilo z metodo, robnimi pogoji in vsemi tabelami) in {{ui:Diagram (SVG)}} shranijo v prenose. Vsak nosi pregledno vrstico.

Označite {{ui:Prikaži obseg poplave}} v **Lastnostih**, da na tlorisu za izbrani profil osenčite mokro območje, z vodno črto tam, kjer je globina nič. Med prerezi je vodna gladina vodoravna čez reko in se linearno spreminja s stacionažo reke. Teren za nasipom ostane suh, dokler je voda pod njegovo krono. Drugo nizko območje znotraj koridorja reke, ki ga voda ne doseže (na primer za cestnim nasipom), se še vedno osenči: preverite ga.

## Na risbi in v podoknu Težave

Črte reke gredo na tloris, v PDF in DWG na lastne plasti: **C-WATR-CNTR** (središnica), **C-WATR-SCTN** (vsaka rezna črta z njeno stacionažo reke) in **C-WATR-FLOD** (vodna črta obsega poplave, kadar je za profil označeno {{ui:Prikaži obseg poplave}}). Opozorila reke (prerez nastavljen na kritično globino, voda nad koncema prereza, sprememba prevodnosti, ki zahteva več prerezov, energijska bilanca, ki se ni sklenila, nasip znotraj brežin) gredo tudi v podokno **Težave**, vezana na reko in postavljena pri prerezu, iz katerega izhajajo.

## Kako se izračuna

- Energija med dvema prerezoma: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Prevodnost po razdelitvi: vsak poplavni del se razdeli tam, kjer se spremeni njegov n, K = Σ (1/n)·A·R^(2/3) (1.486/n v enotah ZDA); struga je en kos, s sestavljenim n, kadar se njen n spremeni. α izhaja iz razdelitve prevodnosti.
- Naklon trenja po povprečni prevodnosti, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², čez dolžino odseka, uteženo s pretokom.
- Koeficient zoženja, kadar se tok pospeši navzdol, razširitve, kadar upočasni.
- Kritična globina = najmanjša specifična energija. Vsaka vodna gladina se reši na intervalu, zato nikoli ne skoči na napačno stran kritične; kadar odgovora ni, se nastavi na kritično globino in označi.

Program je preverjen z Manningovo normalno globino, kritično globino v pravokotni strugi in Chowovim primerom vzvratnega vpliva (*Open-Channel Hydraulics*, 1959, poglavje 10), neodvisno integriranim. Enaka metoda se uporablja v običajnih 1D programih za reke, zato ročni izračun ali študentski zapiski ostanejo uporabni.

## Prepusti in mostovi

V **Lastnostih** reke, pod **Prepusti in mostovi**, {{ui:Dodaj prepust}} ali {{ui:Dodaj most}} postavi enega med dva prereza (vsak odsek ohrani vsaj dva). Profil pod njim ostane nespremenjen; vodna gladina tik nad njim pride iz objekta, profil pa se nadaljuje navzgor od tam. **Rezultati** dodajo tabelo za vsak objekt: spodnjo vodo, višino zgornje vode, katera kontrola prevlada, pretok skozi odprtino in pretok čez cesto ali krov. Samo podkritični tok.

- **Prepust** (pravokoten ali okrogel, ena ali več enakih cevi). Krmiljenje vtoka je pretok preko jezu, dokler je vtok prost, in pretok skozi odprtino, ko je potopljen, zlit med zgornjo vodo enako ena in ena in pol višine. Krmiljenje iztoka je energijska bilanca: izguba na vtoku, trenje in višina hitrostne energije na iztoku, nad višjim od spodnje vode in sredine kritične globine ter temena, minus padec vzdolž cevi. Zgornja voda je večja od obeh. Označite **Voda lahko teče čez cesto**, in pretok preko jezu ceste si pretok deli s cevmi.
- **Most.** Odprtina je prerez pod mostom, izrezan na opornikih, vsak steber pa je območje, ki ne prenaša pretoka. Vodna gladina v odprtini pride iz prereza pod njo (koeficient razširitve), prerez nad njo pa iz odprtine (koeficient zoženja). Če odprtina ne prenese pretoka pri tej spodnji vodi, teče pri kritični globini in most se označi kot zamašen. Če voda doseže spodnji rob nosilca, je tok tlačni (tip zapornice, dokler je spodnja voda pod spodnjim robom, potopljen nad njim), voda čez krov pa doda pretok preko jezu; zgornja raven je tista, pri kateri se seštejejo na pretok.

Koeficienti (pretok, izguba na vtoku, jez) so vpisane okrogle privzete vrednosti. Spremenite jih za vaš projekt. Niso prilagojeni diagrami, ki jih tiskajo priročniki za projektiranje prepustov, zato obravnavajte zgornjo vodo blizu omejitve prepusta kot oceno. Voda čez cesto ali krov, potopljen vtok, zamašena odprtina in hitri tok v cevi so prikazani v **Težavah**.

## Neustaljeni tok

{{ui:Neustaljeni tok …}} v **Lastnostih** reke vodi poplavni hidrogram po prerezih. Vpišite dotok kot ure in pretoke, po en par na vrstico, naklon navzdol (normalna globina) in čas teka. Začne se pri stacionarni vodni gladini pri prvem pretoku in reši celotne enodimenzionalne enačbe (implicitna štirotočkovna shema, časovna utež 0.6). Dobite najvišjo višino vode in pretok na vsakem prerezu z uro, ob kateri se zgodi, graf pretoka na obeh koncih in preverjanje volumna (vstop, izstop in spremembo shranjeno). Preverja se, ali stacionarni tok ostane stacionaren, skok v dotoku, ki se konča pri stacionarnem profilu novega pretoka, zaprtje volumna in hitrost poplavnega vala v primerjavi s kinematičnim valom. Podkritični tok, en odsek, brez stranskega dotoka in brez prepustov ali mostov znotraj izračuna.

## Stiki

Odseki, ki se združijo v en iztok: pretoki se seštejejo, vodna gladina na začetku spodnjega odseka pa se prenese navzgor do koncev odsekov, ki se nanj priključijo (ista vodna gladina na stiku, preprosta metoda: brez kota, brez gibalne količine, zato je primerna pri nizkih Froudovih številih). Model in preskusi so pripravljeni (`river-structures.js`); podokno za združevanje dveh rek na tlorisu še ni izdelano.

## Še ni izdelano

Jezovi in zapornice kot lastni objekti, podokno za stike, objekti znotraj neustaljenega izračuna in nadkritični neustaljeni tok. Izračun z mešanim režimom označi hidravlični skok med dvema prerezoma, vendar ga ne postavi.

**Kje se reke združujejo.** V Lastnostih reke ime „Teče v“ imenuje reko, s katero se združuje. Reke, ki se združujejo, se rešujejo skupaj: reka, v katero tečejo, nosi vsoto njihovih pretokov, vsaka od njih pa se konča pri vodni gladini na prvem prerezu te reke (metoda enake vodne gladine; izpusti kot in gibalno količino pretokov). Za združitev glavne reke in potoka narišite kratko reko pod stikom in naj obe tečeta vanjo. Rezultati prikažejo tabelo stikov. Privzete vrednosti v teh rezultatih (zoženje 0.1, razširitev 0.3, struga iz enega kosa s sestavljeno hrapavostjo, mešani režim po specifični sili) ostanejo, dokler inženir ne pregleda, in Rezultati to povedo.
