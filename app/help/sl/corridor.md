---
title: Cestni koridor s potegom
summary: Vklopite koridor za traso, nastavite vrednosti pasu, bankine in bočnih nagibov ter preberite prereze, linije preseka z terenom in zemeljska dela, ki jih koridor ustvari.
keywords: križišče, presečišče, cesta na cesti, stranska cesta, T-križišče, prečkanje, višina ploščadi, stik, navezava, nadvišanje, super, nagib v ovinku, prehod, iztek, tabela stopenj, prečni naklon, zasuk, koridor, sestav, podsestav, tipični prerez, cesta, pas, bankina, bočni nagib, linija preseka, izkop, nasip, prerezi, cilj, cilji, cilj širine, cilj višine, cilj odmika, razširitev, rob vozišča, sledi drugemu koridorju
from: 6dcb92b3
---

Koridor potegne en preprost tipični prerez (sestav) vzdolž trase in njenega projektnega vzdolžnega profila, ga izravna v obstoječi teren in rezultat doda predvidenemu površju. Na trasi je lahko več koridorjev na različnih območjih stacionaže, koridor pa lahko zgradite tudi iz večkrat uporabnih predlog po stacionaži ([Predloge koridorjev](topic:corridor-templates)). Preprost sestav spodaj je na obeh straneh enak; če želite, da ima vsaka stran svoje dele, glejte [Gradnja vsake strani iz delov](topic:corridor#build-each-side-from-parts).

## Sestav

Od osrednje črte navzven, na vsaki strani:

1. **vozni pas** dane širine, ki se od sredine vozišča spušča z **naklonom pasu**
2. **bankina** dane širine z **naklonom bankine**
3. **bočni nagib** od roba bankine do mesta, kjer se stakne s terenom: **nagib izkopa**, kjer je teren višje, in **nagib nasipa**, kjer je nižje

Začetne vrednosti so nadomestne, niso projektni standard:

| Vrednost | US feet | Metri |
|---|---|---|
| Širina pasu | 12 ft | 3.6 m |
| Naklon pasu | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Naklon bankine | 4% | 4% |
| Nagib izkopa | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Prerez na vsakih | 10 ft | 5 m |

Nagibi bočnih nagibov so podani vodoravno proti navpičnemu (H:V): 3 : 1 pomeni 3 vodoravno na 1 navpično.

## Izdelava koridorja

Potrebujete traso brez napak in projektni vzdolžni profil z vsaj dvema PVI brez napak.

1. Izberite traso.
2. V desnem podoknu pod **Koridor** označite **Potegni sestav po projektnem profilu**.
   Polja se prikažejo in koridor se takoj zgradi. Načrt prikazuje robove pasu in bankine ter linije preseka z terenom; če pod **Prikaz** izberete {{ui:Predvideno (izravnano)}}, plastnice prikazujejo novi teren.
3. Spremenite katero koli vrednost: **Širina pasu**, **Naklon pasu**, **Širina bankine**, **Naklon bankine**, **Nagib izkopa**, **Nagib nasipa**, **Prerez na vsakih**. Po vsaki pritisnite {{key:Enter}}. Nagiba izkopa in nasipa ter razmik prerezov morajo biti večji od 0.
4. Preberite vrstico pod polji, na primer „39 prerezov od 0+00.00 do 3+86.36; izkop 240.2 cu yd, nasip 556.0 cu yd.“

Prerezi se izrežejo na vsakem koraku **Prerez na vsakih**, na koncih ter na začetku in koncu vsake horizontalne in vertikalne krivine. Vsak prerez in črte skozi njega (osrednja črta, robovi pasu in bankine, linija preseka z terenom) postanejo prelomnice predvidenega površja.

Koridor izklopite tako, da odznačite potrditveno polje. Njegove vrednosti se shranijo za naslednjič.

## Ko se ne zgradi

Rdeče polje pod polji pove razlog:

| Sporočilo | Kaj storiti |
|---|---|
| „Koridor potrebuje projektni vzdolžni profil brez napak.“ | Dodajte PVI ali popravite prekrivajoče se vertikalne krivine (glejte [Oblikovanje vertikalnega profila](topic:profile)). |
| „Projektni profil se ne prekriva s traso.“ | Premaknite PVI na območje stacionaže trase. |
| „Koridor na površju potrebuje vsaj dva prereza.“ | Večina koridorja je izven obstoječega terena. |
| „4 bočni nagibi izstopijo s površja, preden se staknejo s terenom.“ | Ob robu površja nagib ne doseže terena. Cesto oddaljite od roba ali tam zmanjšajte višino nasipa ali izkopa. |
| „Linije preseka z terenom koridorja se križajo (prerezi se prekrivajo, na primer na notranji strani ostre krivine). Uporabite večji polmer ali ožji sestav.“ | Prerezi na notranji strani ostre krivine se prekrivajo. Povečajte polmer ali zožite sestav. |

Koridor s težavo se ne izravna v teren in se ne šteje v zemeljska dela.

## Koridorji in ploščadi skupaj

Predvideno površje se gradi po vrstnem redu: najprej vsi koridorji, nato vse ploščadi. Kjer se izravnava ploščadi prekriva s koridorjem, zmaga ploščad. Kjer se kasnejši element prekriva s cesto, se nadomesti le del ceste znotraj linije preseka z terenom kasnejšega elementa; preostanek ceste in vsaka terenska prelomnica, ki jo cesta seka, ohranita svojo obliko. Prostornine se izračunajo znotraj vseh linij preseka skupaj; glejte [Prostornine zemeljskih del](topic:volumes).

## Nadvišanje

V krivini se lahko cesta nagne proti notranji strani, tako da je promet manj potisnjen navzven. V **Lastnostih** trase označite **Nadvišaj krivine** pod **Nadvišanje**:

- Vsaka krožna krivina prevzame stopnjo **e** iz tabele stopenj: prvo vrstico, katere polmer krivina doseže (vrstica s prazno stopnjo ohrani običajno sredino vozišča). Tabela in **Največji relativni naklon** (na začetku 0.5 %) sta nadomestni vrednosti, ne standard: nastavite ju glede na lastna projektna merila. Vrstice dodajajte ali odstranjujte po potrebi.
- Vozni pasovi se zasukajo okoli osrednje črte. Pred krivino se zunanji vozni pas izravna na **iztoku** (običajna sredina vozišča ÷ e × prehod), nato se po **prehodu** (širina pasu × e ÷ naklon) zunanji vozni pas še naprej zasuka, dokler celotna cesta ne nagne za e proti notranji strani; dve tretjini prehoda sta pred krivino, ena tretjina na njej. Za krivino se enako dogaja v obratnem vrstnem redu.
- Bankina na nizki strani ni nikoli bolj položna od svojega pasu; na visoki strani ohrani lasten naklon (se prevesi).
- Tabela pod njim navaja polmer, stopnjo, prehod in iztek vsake krivine ter mesto, kjer se polno nadvišanje začne in konča. **Diagram nadvišanja** riše prečne naklone obeh pasov vzdolž stacionaž (levi pas polno, desni črtkano).
- Krivina, ki je prekratka za polno nadvišanje, ali dve krivini, katerih prehoda se prekrivata, je navedena v polju nad tabelo.

Prerezi, prostornine, pogled 3D in listi vsi prikazujejo nagnjeno cesto. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Cilji

Cilj premakne eno točko ene strani ceste na črto: **rob vozišča** ali **rob bankine**, na **levi** ali **desni** strani. Vsak prerez seka črto pravokotno na osrednjo črto in gre ven samo na tisti strani, zato cilj na desni nikoli ne premakne leve strani.

| Nastavi | Kaj se zgodi, kjer prerez seka črto |
|---|---|
| **Širina** | Točka leži na črti: vozni pas (ali bankina) se do nje razširi ali zoži in ohrani svoj prečni naklon. |
| **Višina** | Točka tam prevzame višino črte pri svojem odmiku: prečni naklon pasu (ali bankine) se prilagodi. |

Črta je lahko karakteristična črta (ne glede na njeno **Uporabo**) ali črta drugega koridorja: njegova osrednja črta, robovi vozišč, robovi bankin ali linije preseka z terenom. Črta koridorja sledi temu koridorju: spremenite drugo cesto in ta jo bo sledila. CivilCraft najprej zgradi drugi koridor; dva koridorja, ki bi se ciljala v zanki, se na eni strani zavrneta, tabela pa pove katera.

1. Izberite traso in vklopite njen koridor.
2. Pod **Cilji** kliknite {{ui:Dodaj cilj}}.
3. Izberite **Stran**, **Točko**, kaj **Nastavi** in **Do črte**. Vsaka sprememba je en korak razveljavitve.

**Rezultat** pove, pri koliko prerezih je bila črta dosežena. Prerezi, ki je ne dosežejo (zunaj njenih koncev ali tam, kjer je za osrednjo črto), ohranijo vrednosti sestava. Izbrisana črta pusti koridor takšen, kot je bil pred ciljem, tabela pa to navede. Ena stran lahko ima za vsako točko eno ciljno širino in eno ciljno višino.

## Gradnja vsake strani iz delov

V nastavitvah koridorja vklopite **Gradi vsako stran iz delov**. Vsaka stran ima nato svoj seznam od osrednje črte navzven: vozne pasove, bankino, obcestni žleb, robnik, zelenico, pločnik in nazadnje bočni nagib do terena (z lastnimi razmerji izkopa in nasipa). Začnite pri {{ui:Podeželska cesta}} ali {{ui:Mestna ulica}}, dodajajte in odstranjujte dele, jih premikajte s puščicami in {{ui:Kopiraj}} eno stran na drugo. Vsaka sprememba je en korak razveljavitve.

Prečni naklon je padec stran od ceste, zato je pločnik, ki odvaja proti cesti, negativen. Robnik je ploskev z višino, ki jo vnesete, zgornjim delom s širino, ki jo vnesete, in izbirnim padcem na zadnji strani. Nadvišanje obrne vsak vozni pas v prvi vrstici; žleb, robnik, zelenica in pločnik visijo z roba pasov, kot so zgrajeni. Cilji še vedno premaknejo konec pasov in zadnjega dela. Prečni prerezi označijo dno žleba, zgornji in zadnji rob robnika ter ostalo. Na krivini s spiralami je prehod spirala: ravna sredina vozišča pri TS, polno nadvišanje pri SC.

## Voziščni sloji

Vozni pas, bankina, žleb, zelenica ali pločnik lahko nosi svojo sestavo: pod delom {{ui:Dodaj sloj}} doda sloj z imenom, materialom, debelino in vrsto (površinski, vezni, nosilni, podložni, zaporni ali drug), od zgoraj navzdol. Sloji ne premaknejo površja ceste (njen zgornji del je projektno površje); vsak leži pod svojim delom, njegova globina je izmerjena navpično navzdol. Prečni prerezi narišejo spodnji rob vsakega sloja črtkano, {{ui:Voziščni sloji: količine}} pa navaja tlorisno površino in prostornino vsakega sloja (površina vzdolž koridorja iz njegovih prerezov, prostornina = površina × debelina). Izvoz IFC zapiše vsak sloj kot svoj element z debelino in materialom (glejte [Izvoz in uvoz IFC](topic:ifc)). Debelina, ki jo vnesete, je vaša: CivilCraft ne določa velikosti vozišč.

## Kjer se ceste stikajo s cestami, ploščadmi in potmi

Ob vklopljenem {{ui:Poveži ceste in ploščadi, na katere naleti}} (vklopljeno je pri vsakem koridorju) CivilCraft poveže koridor s tem, na kar naleti v tlorisu:

- **Cesta, ki se konča na drugi cesti** (konec njene trase leži na drugi cesti ali v okviru približno polovice lastne širine vozišča od roba te ceste) je stranska cesta križišča. Cesta, na katero naleti, odpre svoj rob za vozišče stranske ceste: čez ustje se bankina, robnik, zelenica in pločnik položijo na prečni naklon pasu in narišejo kot vozišče. Stranska cesta se položi na površje glavne ceste tam, kjer se prekrivata, in se nanj postopoma dvigne ali spusti čez dovoz.
- **Dve cesti, ki se križata**, sta povezani na obeh straneh na enak način. Cesta, navedena prva pod **Trase**, je glavna cesta; druga sledi njenemu površju čez.
- **Cesta, ki se konča na ploščadi** (znotraj nje ali v okviru približno polovice širine vozišča od njenega roba), doseže nivo ploščadi in se nanj postopoma prilagodi čez dovoz.
- **Pot** (Krajina › Utrjene površine) se ustavi na zunanjem robu ceste, na nivoju pločnika ali bankine tam, namesto da bi ležala čez cesto. Pot, ki seka cesto, postane dva kosa. Konec, narisan nekoliko pred cesto (v okviru dvakratne širine poti), se podaljša do njenega roba.

**Lastnosti** povedo, kaj je posamezni koridor povezal, za koliko je bil tam dvignjen ali spuščen in po kakšni dolžini. Ta dolžina je večja od 10 m (30 ft) in dvajsetkratne spremembe ter nikoli ne presega 45 % koridorja. **Projektni profil ostane nespremenjen**: pogled profila še vedno prikazuje naklonsko črto, ki ste jo narisali, prerezi, predvideno površje, prostornine in pogled 3D pa prikazujejo cesto kot povezano. Če želite, da je spoj natančen že v projektu, premaknite zadnji PVI na nivo, ki ga navedejo **Lastnosti**.

Stikalo na koridorju izklopite, da ostane točno tak, kot ga določata njegov profil in sestav; nato ne sodeluje v nobenem križišču, niti kot stranska ali glavna cesta. Ceste, ki se stikajo skoraj v ravni črti (pod približno 20°), se pustijo pri miru, prav tako poljske poti.

Česa križišče še ne počne: ni zaokrožitev robnikov (vogali so pravokotni), ni zavijalnih pasov ali otokov, konec stranske ceste je pravokotno odrezan glede na lastno traso, koridor, zgrajen iz predlog, pa odpre svoj rob na enak preprost način (jarek ali zid v končnem stanju se čez ustje poravna brez prepusta). Za zaokrožitve robnikov v tlorisu, preglednostne trikotnike in označbe glejte [Tla, ceste, geodezija, rudniki in povezave](topic:soils-roads-survey-mines-links).

## Še ni izdelano

Cilji za nagib linije preseka z terenom še niso na voljo. Za koridor, ki se spreminja vzdolž ceste, z ločeno levo in desno stranjo, uporabite [Predloge koridorjev](topic:corridor-templates). Glejte [Še ni izdelano](topic:not-built-yet).
