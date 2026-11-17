---
title: Predloge koridorjev in predloge terena
summary: Izdelajte majhne, ponovno uporabne predloge (robnik in obcestni jarek, pločnik, zid, jarek), iz njih zgradite koridor po stacionaži z ločeno levo in desno stranjo, razdelite trasо na več koridorjev in položite plasti materialov na teren.
keywords: predloga, predloge, knjižnica predlog, izdelava predloge, tipični prerez, sestav, podsestav, komponente, točkovne kode, končni pogoj, dnevna črta, jarek, podporni zid, robnik, obcestni jarek, pločnik, območja, obseg stacionaže, več koridorjev, levo in desno, predloga terena, humus, vozišče, podlaga, položi, materiali, količine
from: ce70e58b
---

**Predloga** je majhen prečni prerez, ki ga narišete enkrat in ponovno uporabite: točke z odmiki, nakloni in točkovnimi kodami ter komponente z materiali. Koridor se lahko zgradi iz predlog po stacionaži, pri čemer ima vsaka stran svoje predloge vozišča in svoj končni pogoj, iste predloge pa je mogoče položiti tudi na teren.

:::warning
Primeri predlog so le začasne vrednosti, s katerimi začnete. Njihove številke niso vzete iz nobenega standarda ali agencije. Inženir mora preveriti vsako predlogo in vsako vrednost, ki jo vnesete, preden se uporabi za načrt.
:::

## Odprite predloge

Odprite {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge koridorjev…}} (ali vpišite {{cmd:TEMPLATES}}). Okno ima tri sezname:

- **V tem projektu**: predloge, ki jih uporabljajo koridorji in predloge terena tega projekta. Shranjene so v datoteki projekta.
- **Moja knjižnica**: predloge, shranjene v tem brskalniku in ponujene v vsakem projektu. Za shranitev predloge projekta uporabite {{ui:Shrani v Mojo knjižnico}}.
- **Primeri**: dva vozna pasu s sloji, robnik in obcestni jarek, pločnik, dnevna črta, jarek, podporni zid, humus pod terenom in vozišče na terenu. Vsak je označen z "Za preverjanje inženirja".

{{ui:Uporabi v tem projektu}} kopira predlogo iz knjižnice ali primerov v projekt. {{ui:Izvozi predloge tega projekta}} shrani predloge kot datoteko `.cctemplates.json`, {{ui:Uvozi datoteko}} pa prebere eno v projekt in v Mojo knjižnico. Datoteko uporabite za deljenje predlog ali za njihov prenos na drug računalnik.

## Izdelava predloge

{{ui:Nova predloga}} (ali {{ui:Urejanje}} pri predlogi projekta) odpre urejevalnik predlog. Narišite desno stran navzven od točke 0,0 predloge; leva stran uporabi isto predlogo navzven na levo.

1. Dajte ji ime in vrsto: **Vozišče** (naslednja predloga se priključi na njen konec), **Končni pogoj** (srečuje teren) ali **Predloga terena**.
2. Dodajte **vrednosti**: poimenovana števila, kot sta širina `w` ali naklon `s`. Polje za številko kjer koli v predlogi sprejme število ali ime vrednosti; `-t` je vrednost `t`, narejena negativna. Koridor lahko pri vsaki uporabi predloge dobi svoje vrednosti, tako da ena predloga robnika ustreza vsaki višini robnika.
3. Dodajte **točke** po vrsti. Vsaka je postavljena glede na prejšnjo točko (ali točko 0,0) po svoji omejitvi:

   | Omejitev | Postavi točko |
   |---|---|
   | Odmik pod naklonom | Odmik navzven in naklon (dvig na vodoravno enoto; −0.02 pomeni padec 2 %) |
   | Odmik in dvig | Odmik in dvig |
   | Naravnost navzgor ali navzdol | Samo dvig |
   | Stranski naklon do terena | Od svoje točke navzven do terena, pri razmerju useka, kjer je teren nad, in razmerju nasipa, kjer je pod |
   | Do terena | Odmik, nato naravnost navzgor ali navzdol do terena |
   | Podporni zid | Zid debeline, ki jo vnesete: v useku se njegov vrh stika s terenom na robu ceste, v nasipu cesta teče čez njega in njegova zunanja stran pade do terena |

   Označite **Vrh** za točke, skozi katere teče končno površje. Zadnja točka vrha je mesto, kjer se na tej strani začne naslednja predloga. **Cilj** koridorju omogoča premik točke: njen odmik ali višina prihaja iz črte.
4. Dodajte **komponente**: zaprte oblike prek točkovnih kod (`0` je točka 0,0), vsaka z imenom, materialom in vrsto. Njihove površine dajo prostornine.

Risba sledi vsaki spremembi v pravem merilu, seznam pod njo pa pove, kaj ni v redu (točka, ki sreča teren pred koncem, vrednost, ki je predloga nima, komponenta brez površine). {{ui:Dodaj v ta projekt}} ali {{ui:Shrani}} ga ohrani kot en korak razveljavitve.

## Zgradite koridor iz predlog

Izberite trasо s koridorjem in v njenih **Lastnostih** vklopite {{ui:Gradi iz predlog po stacionaži}}. Koridor se začne s primeroma dveh voznih pasov in dnevne črte na obeh straneh.

- **Območja.** Vsako območje se začne pri stacionaži in sega do začetka naslednjega. {{ui:Dodaj območje}} doda območje; začetno stacionažo spremenite v njegovem polju.
- **Levo in desno ločeno.** Vsaka stran vsakega območja ima svoj seznam **Vozišče** od osi navzven in svoj **Končni pogoj**: dnevna črta, jarek, zid ali katera koli predloga, ki srečuje teren. Brez končnega pogoja se stran zaključi z dnevno črto pri useku in nasipnih nakloninah koridorja. {{ui:Kopiraj z leve na desno}} kopira stran.
- **Vrednosti in cilji.** Pod vsako predlogo na strani je polje za vsako vrednost (prazno = lastna vrednost predloge) in, za točko, ki ima cilj, karakteristična črta ali črta drugega koridorja, ki jo premakne.
- **Od** in **Do** omejita koridor na del trase.

Prerezi, črte načrta za vsako točkovno kodo, predvideno površje, zakoličba in zemeljska dela sledijo vsi. **Lastnosti** navajajo prostornino vsake komponente na stran in območje (povprečne površine krajnih presekov vzdolž osi). Nadvišanje in robni cilji koridorja se ne uporabljajo, dokler je koridor zgrajen iz predlog.

## Več koridorjev na eni trasi

Pod **Koridorji na tej trasi** {{ui:Dodaj koridor}} doda koridor na preostali del trase: prvi koridor dobi končno stacionažo na sredini (ali obdrži svojo), novi pa se tam začne z zadnjim območjem predlog prvega. Vsak koridor ima svoje ime, obseg stacionaže, predloge in zemeljska dela. Izklopite enega s poljem {{ui:Vklopljeno}}. Kjer se obsega prekrivata, pozneje dodani koridor izravna preko prejšnjega.

## Predloge terena

Predloga terena položi plasti predloge na teren od svoje točke 0,0: plast pod točko 0,0 gre v zemljo (humus za odstranitev), plast nad njo leži na terenu (podlaga in vozišče na parkirišču). Širine in nakloni niso pomembni, pomembna je le globina vsake komponente nad ali pod točko 0,0.

Odprite {{ui:Površje}} › {{ui:Več}} › {{ui:Predloge terena…}} (ali vpišite {{cmd:TERRAINTEMPLATES}}); blok je tudi v **Lastnostih** projekta. {{ui:Dodaj predlogo terena}} doda eno s primerom humusa. Za vsako izberite:

- **predlogo** (njene vrednosti se lahko spremenijo samo za to),
- **teren**: obstoječi teren ali predvideno površje,
- **obliko**, ki jo omeji: ves teren, parcelo, ploščad ali zaprto karakteristično črto. Več predlog terena lahko na istem terenu uporablja različne oblike.

Vsaka plast navaja svojo debelino, tlorisno površino in prostornino. Prostornina je tlorisna površina krat debelina, debelina pa je merjena navpično navzdol; površina je izmerjena na mreži, navedena pa je tudi položena (nagnjena) površina. Oblike so narisane na načrtu na plasti C-TOPO-TMPL. Predloge terena ne spremenijo predvidenega površja.

## Materiali in količine

Blok zemeljskih del projekta navaja **Materiali iz predlog**: vsako komponento koridorja in vsako plast predloge terena z njeno prostornino. {{ui:Pošlji v TakeoffCraft}} jih zapiše v datoteko količin za izkopom in nasipom, vsak kot ločen element, v kubičnih yardih (projekti v čevljih) ali kubičnih metrih.

## Datoteke

Predloge, območja, dodatni koridorji in predloge terena se shranijo v datoteko projekta. Projekt, ki jih ne uporablja, se shrani povsem enako kot prej, starejše različice CivilCraft pa odprejo projekt, ki jih uporablja (predloge prezrejo in zgradijo lastni sestav koridorja).
