---
title: Izdelava cestnega koridorja
summary: Vklopite koridor za trasо, nastavite vrednosti voznega pasu, bankine in stranskega naklona ter preberite prereze, dnevne črte in zemeljska dela, ki nastanejo.
keywords: nadvišanje, super, nagib v ovinku, izravnava, izhodna dolžina, tabela stopenj, prečni naklon, zasuk, koridor, sestav, podsestav, tipični prerez, cesta, vozni pas, bankina, stranski naklon, dnevna črta, izkop, nasip, prerezi, cilj, cilji, cilj širine, cilj višine, cilj odmika, razširitev, rob vozišča, sledi drugemu koridorju
from: 91303189
---

Koridor potegne en preprost tipični prerez (sestav) vzdolž trase in njenega projektnega profila, ga izravna v obstoječi teren in rezultat doda predvidenemu površju. Trasa lahko nosi več koridorjev na različnih obsegih stacionaže, koridor pa je mogoče zgraditi iz ponovno uporabnih predlog po stacionaži ([Predloge koridorjev](topic:corridor-templates)). Spodnji preprost sestav je na obeh straneh enak; če želite, da ima vsaka stran svoje dele, glejte [Gradnja vsake strani iz delov](topic:corridor#build-each-side-from-parts).

## Sestav

Od osi navzven, na vsaki strani:

1. **vozni pas** dane širine, ki se pada od tečaja ceste pri **naklonu voznega pasu**
2. **bankina** dane širine pri **naklonu bankine**
3. **stranski nagib** od roba bankine do mesta, kjer se srečuje s terenom: **nagib useka**, kjer je teren nad, in **nagib nasipa**, kjer je pod njim

Začetne vrednosti so začasne, niso projektni standard:

| Vrednost | Ameriški čevlji | Metri |
|---|---|---|
| Širina voznega pasu | 12 ft | 3.6 m |
| Naklon voznega pasu | 2% | 2% |
| Širina bankine | 4 ft | 1.2 m |
| Naklon bankine | 4% | 4% |
| Nagib useka | 2 : 1 | 2 : 1 |
| Nagib nasipa | 3 : 1 | 3 : 1 |
| Prerez vsakih | 10 ft | 5 m |

Nakloni stranskih nagibov so vodoravno proti navpično (V:N): 3 : 1 pomeni 3 vodoravno za 1 navpično.

## Izdelava koridorja

Potrebujete trasо brez napak in projektni profil z vsaj dvema PVI in brez napak.

1. Izberite trasо.
2. V desni plošči pod **Koridor** označite **Potegni sestav vzdolž projektnega profila**.
   Polja se prikažejo in koridor se takoj zgradi. Načrt prikazuje robove voznega pasu in bankine ter dnevne črte; če pod **Prikaz** izberete {{ui:Predvideno (izravnano)}}, plastnice prikazujejo novi teren.
3. Spremenite katerokoli vrednost: **Širina voznega pasu**, **Naklon voznega pasu**, **Širina bankine**, **Naklon bankine**, **Nagib useka**, **Nagib nasipa**, **Prerez vsakih**. Po vsaki pritisnite {{key:Enter}}. Nagiba useka in nasipa ter razmik prerezov morajo biti večji od 0.
4. Preberite vrstico pod polji, na primer "39 prerezov od 0+00.00 do 3+86.36; izkop 240.2 cu yd, nasip 556.0 cu yd."

Prerezi so narisani na vsakem koraku **Prerez vsakih**, na koncih ter na začetku in koncu vsakega horizontalnega in vertikalnega loka. Vsak prerez in črte skozi njega (os, robovi voznega pasu in bankine, dnevna črta) postanejo prelomnice predvidenega površja.

Če želite koridor izklopiti, odznačite polje. Njegove vrednosti se ohranijo za naslednjič.

## Ko se ne zgradi

Rdeče polje pod polji pove razlog:

| Sporočilo | Kaj storiti |
|---|---|
| „Koridor potrebuje projektni profil brez napak.“ | Dodajte PVI ali popravite prekrivajoče se vertikalne loke (glejte [Oblikovanje vertikalnega profila](topic:profile)). |
| „Projektni profil se ne prekriva s trasо.“ | Premaknite PVI na obseg stacionaže trase. |
| „Koridor potrebuje vsaj dva prereza na površju.“ | Večina koridorja je zunaj obstoječega terena. |
| „4 stranski nagibi izstopajo iz površja, preden dosežejo teren.“ | Blizu roba površja nagib ne doseže terena. Cesto držite stran od roba ali tam znižajte višino nasipa ali useka. |
| „Dnevne črte koridorja se križajo (prerezi se prekrivajo, na primer na notranji strani ostrega ovinka). Uporabite večji polmer ali ožji sestav.“ | Prerezi na notranji strani ostrega ovinka se prekrivajo. Povečajte polmer ali zožite sestav. |

Koridor s težavo ni vključen v izravnavo in se ne šteje v zemeljska dela.

## Koridorji in ploščadi skupaj

Predvideno površje se izdela po vrstnem redu: najprej vsak koridor, nato vsaka ploščad. Kjer izravnava ploščadi prekriva koridor, zmaga ploščad. Prostornine se izračunajo znotraj vseh dnevnih črt skupaj; glejte [Prostornine zemeljskih del](topic:volumes).

## Nadvišanje

Skozi ovinek se lahko cesta nagne proti notranji strani, tako da je promet manj potisnjen navzven. V **Lastnostih** trase pod **Nadvišanje** označite **Nadvišaj ovinke**:

- Vsak krožni ovinek dobi stopnjo **e** iz tabele stopenj: prva vrstica, katere polmer ovinek doseže (vrstica s prazno stopnjo ohrani normalni tečaj). Tabela in **Največji relativni nagib** (na začetku 0.5 %) sta začasni, nista standard: nastavite ju glede na svoja projektna merila. Vrstice dodajajte ali odstranjujte po potrebi.
- Vozni pasovi se zasukajo okoli osi. Pred ovinkom se zunanji vozni pas zravna čez **izhodno dolžino** (normalni tečaj ÷ e × prehod), nato čez **prehod** (širina voznega pasu × e ÷ nagib) zunanji vozni pas še naprej obrača, dokler vsa cesta ne pada z e proti notranji strani; dve tretjini prehoda sta pred ovinkom, ena tretjina na njem. Za ovinkom se enako zgodi obratno.
- Bankina na nizki strani nikoli ni bolj ravna od svojega voznega pasu; na visoki strani ohrani svoj naklon (se prevrne čez).
- Tabela pod njo navaja polmer, stopnjo, prehod in izhodno dolžino vsakega ovinka ter kje se polno nadvišanje začne in konča. **Diagram nadvišanja** nariše prečne nagibe obeh voznih pasov vzdolž stacionaže (levi vozni pas polno, desni črtkano).
- Ovinek, ki je prekratek za polno nadvišanje, ali dva ovinka, katerih prehoda se prekrivata, je navedena v polju nad tabelo.

Prerezi, prostornine, pogled 3D in listi vsi prikazujejo nagnjeno cesto. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Cilji

Cilj premakne eno točko ene strani ceste na črto: **Rob vozišča** ali **Rob bankine**, na **levi** ali **desni** strani. Vsak prerez se s črto sreča pravokotno na os, pri čemer gre samo na tisto stran, zato cilj na desni nikoli ne premakne leve strani.

| Nastavi | Kaj se zgodi tam, kjer prerez sreča črto |
|---|---|
| **Širino** | Točka leži na črti: vozni pas (ali bankina) se do nje razširi ali zoži in ohrani svoj prečni naklon. |
| **Višino** | Točka tam prevzame višino črte pri svojem odmiku: sledi prečni naklon voznega pasu (ali bankine). |

Črta je lahko karakteristična črta (ne glede na njen **Namen**) ali črta drugega koridorja: njegova os, robovi vozišča, robovi bankine ali dnevne črte. Črta koridorja sledi temu koridorju: spremenite drugo cesto in ta sledi. CivilCraft najprej zgradi drugi koridor; dva koridorja, ki bi se v krogu ciljala drug na drugega, sta na eni strani zavrnjena, tabela pa pove, katera.

1. Izberite trasо in vklopite njen koridor.
2. Pod **Cilji** kliknite {{ui:Dodaj cilj}}.
3. Izberite **Stran**, **Točko**, kaj **Nastavi** in **Do črte**. Vsaka sprememba je en korak razveljavitve.

**Rezultat** pove, na koliko prerezih je bila črta dosežena. Prerezi, ki je ne dosežejo (zunaj njenih koncev ali za osjo), ohranijo vrednosti sestava. Izbrisana črta pusti koridor takšen, kot je bil pred ciljem, in tabela to pove. Ena stran lahko za vsako točko ima eno ciljno širino in eno ciljno višino.

## Gradnja vsake strani iz delov

Pod nastavitvami koridorja vklopite **Gradnja vsake strani iz delov**. Vsaka stran nato dobi svoj seznam od osi navzven: vozni pasovi, bankina, obcestni jarek, robnik, zelenic pas, pločnik in na koncu stranski nagib do terena (s svojima nagiboma useka in nasipa). Začnite z {{ui:Podeželska cesta}} ali {{ui:Mestna ulica}}, dodajajte in odstranjujte dele, premikajte jih s puščicami ter {{ui:Kopiraj}} kopirajte eno stran na drugo. Vsaka sprememba je en korak razveljavitve.

Prečni nagib je padec stran od ceste, zato je pločnik, ki odteka proti cesti, negativen. Robnik je ploskev z višino, ki jo vnesete, vrhom s širino, ki jo vnesete, in neobveznim padcem zadaj. Nadvišanje obrne vsak vozni pas v prvi vrstici; obcestni jarek, robnik, zelenic pas in pločnik visijo od roba voznih pasov, kot so zgrajeni. Cilji še vedno premikajo konec voznih pasov in zadnjega dela. Prečni prerezi označijo dno jarka, vrh in zadnjo stran robnika ter ostalo. Na ovinku s spiralami je prehod spirala: ravni tečaj pri TS, polno nadvišanje pri SC.

## Sloji vozišča

Vozni pas, bankina, obcestni jarek, zelenic pas ali pločnik lahko nosi svojo sestavo: pod delom {{ui:Dodaj sloj}} doda sloj z imenom, materialom, debelino in svojo vrsto (površinski, vezni, nosilni, podložni, zaščitni ali drugi), od zgoraj navzdol. Sloji ne premaknejo površja ceste (njen vrh je projektno površje); vsak leži pod svojim delom, njegova globina je merjena navpično navzdol. Prečni prerezi narišejo spodnjo ploskev vsakega sloja s črtkano črto, {{ui:Voziščni sloji: količine}} pa navaja tlorisno površino in prostornino vsakega sloja (površina vzdolž koridorja iz njegovih prerezov, prostornina = površina × debelina). Izvoz IFC zapiše vsak sloj kot svoj element z njegovo debelino in materialom (glejte [Izvoz in uvoz IFC](topic:ifc)). Debelina, ki jo vnesete, je vaša: CivilCraft ne dimenzionira vozišč.

## Še ni izdelano

Cilji za naklon dnevne črte še niso na voljo. Za koridor, ki se spreminja vzdolž ceste, z ločenima levo in desno stranjo uporabite [Predloge koridorjev](topic:corridor-templates). Glejte [Še ni izdelano](topic:not-built-yet).
