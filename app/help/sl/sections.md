---
title: Prečne črte in prečni prerezi
summary: Prerežite prerez pravokotno na trase, poglejte teren, projekt ter izkop in nasip na vsaki postaji in dobite prostornine po povprečju prečnih ploskev.
keywords: masni diagram, ravnotežna točka, krčenje, nabrekanje, razdalja prenosa, izposojevališče, deponija, listi prerezov, prerezi PDF, prerezi, prečni prerezi, prečne črte, pogled prereza, izkop, nasip, površine, povprečje prečnih ploskev, prostornine po prečnih ploskvah, zemeljska dela, stacionaža, zamik, CSV
from: 5060173c
---

Prečni prerez prikaže cesto tako, kot bo zgrajena: prečno na trasa na eni stacionaži, obstoječi teren, projekt (koridor ali ploščad, izravnana v teren) ter izkop in nasip med njima.

## Dodajte prečne črte

1. Izberite trasa. V **Lastnostih**, pod **Prečne črte**, kliknite {{ui:Dodaj prečne črte}}.
2. Nastavite **Vsakih** (razmik: 50 ft ali 20 m na začetku), **Leva širina** in **Desna širina** (kako daleč vsak prerez seže od središnice).
3. Če želite prerez prerezati na določeni stacionaži, jo vpišite v **Dodaj postajo** (na primer `2+35`) in pritisnite {{key:Enter}}.

Prerezi so izrezani na vsakem celem večkratniku razmika, na obeh koncih trase, na začetku in koncu vsake krivine (PC in PT) ter na postajah, ki jih dodate. Prečne črte so na tlorisu prikazane kot sive črte čez trase; gredo tudi v DXF, DWG in PDF na plast C-ROAD-SCTN. Vsaka sprememba je en korak: {{key:Mod+Z}} jo razveljavi.

## Pogled prereza

Odprite ga z {{ui:Pogled prereza}} v **Lastnostih** trase, {{ui:Prerezi}} pod **Površje** › {{ui:Več}} ali {{key:X}}. Zamenja pogled profila pod tlorisom.

- Po prerezih se premikate s puščicami v njegovi vrstici, s seznamom postaj ali s {{key:Left}} in {{key:Right}}, ko je pogled prereza v fokusu ({{key:Home}} in {{key:End}} za prvi in zadnji).
- Siva črta je obstoječi teren, rdeča projekt. Izkop je osenčen oranžno, nasip zeleno. Točke koridorja so označene: CL (središnica), EOP (rob vozišča), SH (bankina) in DL (črta preseka z zemljo).
- Glava navede stacionažo, površine izkopa in nasipa tega prereza ter navpično povečavo. **Prilagodi** napolni podokno; izberite 1× za prikaz prereza v pravem merilu.
- Debela črta na tlorisu pokaže, kateri prerez je na zaslonu.

## Listi prerezov

{{ui:Listi prerezov (PDF)}} pod **Prečne črte** da vsak prerez na strani PDF, v vrsticah od leve proti desni in od zgoraj navzdol po vrstnem redu stacionaž. Izberite **Papir**, **Vodoravno merilo** (vodoravno merilo prerezov) in **Povečava profila** (1×, 2×, 5× ali 10×); pogovorno okno pove, koliko prerezov gre na stran in koliko strani to naredi.

Vsak prerez prikaže mrežo z zamiki in kotami, teren (črtkano), projekt, izkop in nasip osenčena (oranžna in zelena), točke koridorja ter pod njim njegovo stacionažo in površine izkopa in nasipa. Vsak prerez na listih je narisan enako velik, dovolj visok za največjega; kadar to ne gre na stran pri vaši povečavi, CivilCraft uporabi največjega, ki gre, in to pove. Naslovni trak navede trasa, stacionaže na tej strani, merila in »List 1 od 3«.

## Prostornine po povprečju prečnih ploskev

Med dvema sosednjima prerezoma je prostornina povprečje njunih dveh površin, pomnoženo z razdaljo med stacionažama. Vrstica prikaže skupne vsote za trase, {{ui:CSV}} pa prenese površine in prostornine vsakega prereza s tekočimi vsotami (kubični jardi za projekte v čevljih, kubični metri za metrične).

**Lastnosti** prikažejo iste vsote poleg prostornin po mrežni metodi iz [Prostornine zemeljskih del](topic:volumes). Obe sta različni približki: bližnji prerezi ju bolj zbližajo, na ravni cesti na ravnem terenu pa sta enaki.

:::note
Izkop in nasip se štejeta samo znotraj izravnanih območij (črte preseka koridorja ali ploščadi), kot pri mrežni metodi. Brez koridorja ali ploščadi je projekt enak terenu, zato prerez ne kaže izkopa ali nasipa.
:::

## Masni diagram

**Masni diagram** pod **Prečne črte** nariše masni diagram iz istih prostornin po povprečju prečnih ploskev: vzdolž stacionaž tekoča vsota izkopa minus nasip.

- **Krčenje (−) ali nabrekanje (+) izkopa** pove, kaj kubični meter izkopa da, ko je vgrajen kot nasip: −10 % (začetna vrednost, okvirna) pomeni, da se skrči na 0.9; kamnina, ki nabreka, je lahko +5 %. Uporabite vrednost iz vašega geotehničnega poročila.
- Kjer črta narašča, je cesta v izkopu; kjer pada, v nasipu. Nad ničlo (osenčeno oranžno) se zemlja premika navzgor po stacionaži; pod ničlo (zeleno) navzdol.
- **Ravnotežne točke** so mesta, kjer črta seka ničlo: med dvema od njih se izkop in nasip uravnotežita. Tabela navede vsak uravnotežen odsek, premaknjeno prostornino (njegova najvišja ali najnižja točka) in povprečno razdaljo prenosa (osenčena ploskev, deljena s to prostornino).
- Kjer se črta konča izven ničle, je preostanek **deponija** (nad) ali **izposojevališče** (pod). V tem zadnjem odseku se šteje za premaknjeno samo zemlja, ki presega raven, na kateri se konča.

**CSV** shrani masno ordinato pri vsakem prerezu, odseke in faktor.
