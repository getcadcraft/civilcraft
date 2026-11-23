---
title: Vzorčne črte in prečni prerezi
summary: Izrežite prereze pravokotno na traso, si oglejte teren, projekt ter izkop in nasip na vsaki stacionaži in dobite prostornine po metodi povprečnih končnih površin.
keywords: masni diagram, ravnotežna točka, krčenje, nabrekanje, razdalja prevoza, izposojevališče, deponija, listi prerezov, listi prečnih prerezov, pdf prerezov, prerezi, prečni prerezi, vzorčne črte, pogled prereza, izkop, nasip, površine, končne površine, prostornine po končnih površinah, zemeljska dela, stacionaža, odmik, csv
from: 09639ce2
---

Prečni prerez prikazuje cesto tako, kot bo zgrajena: čez traso na eni stacionaži obstoječi teren, projekt (koridor ali ploščad, izravnana vanj) ter izkop in nasip med njima.

## Dodajanje vzorčnih črt

1. Izberite traso. V **Lastnostih** pod **Vzorčne črte** kliknite {{ui:Dodaj prečne črte}}.
2. Nastavite **Na vsakih** (razmik: na začetku 50 ft ali 20 m), **Širina levo** in **Širina desno** (kako daleč vsak prerez sega od osrednje črte).
3. Če želite prerez izrezati na določeni stacionaži, jo vnesite v **Dodaj stacionažo** (na primer `2+35`) in pritisnite {{key:Enter}}.

Prerezi se izrežejo na vsakem celem večkratniku razmika, na obeh koncih trase, na začetku in koncu vsake krivine (PC in PT) ter na stacionažah, ki jih dodate. Vzorčne črte so v načrtu prikazane kot sive črte čez traso; prav tako gredo v DXF, DWG in PDF na sloj C-ROAD-SCTN. Vsaka sprememba je en korak: {{key:Mod+Z}} ga razveljavi.

## Pogled prereza

Odprite ga z {{ui:Pogled prereza}} v **Lastnostih** trase, {{ui:Prerezi}} pod **Površje** › {{ui:Več}} ali s {{key:X}}. Zavzame mesto pogleda profila pod načrtom.

- Med prerezi se premikate s puščicami v njegovi vrstici, s seznamom stacionaž ali s {{key:Left}} in {{key:Right}}, ko je pogled prereza v fokusu ({{key:Home}} in {{key:End}} za prvi in zadnji).
- Siva črta je obstoječi teren, rdeča projekt. Izkop je osenčen oranžno, nasip zeleno. Točke koridorja so označene: CL (osrednja črta), EOP (rob vozišča), SH (bankina) in DL (linija preseka z terenom).
- Glava prikazuje stacionažo, površine izkopa in nasipa tega prereza ter navpično povečavo. **Prilagodi** zapolni podokno; izberite 1×, da vidite prerez v pravem merilu.
- Debela črta v načrtu prikazuje, kateri prerez je na zaslonu.
- **Povečava in pomik:** kolešček povečuje okoli kazalca, povlek premakne pogled. {{ui:Prilagodi}} (ali {{key:F}}, ali dvojni klik) znova prilagodi celoten prerez.

## Merjenje v prerezu

1. Kliknite {{ui:Meri}} v vrstici prereza ali pritisnite {{key:M}}. Namig pravi „Kliknite prvo točko, nato drugo.“
2. Kliknite dve točki. Vsaka se pripne na konec črte ali točko koridorja (CL, EOP, SH, DL); za prosto točko držite {{key:Alt}}.
3. Izpis prikaže vodoravno razdaljo (ΔH), navpično razdaljo (ΔV), naklon v procentih z razmerjem ter ravno dolžino v enotah projekta.

Ponovni klik začne novo meritev. {{key:Esc}} jo izbriše, {{key:M}} pa izklopi orodje Meri.

## Listi prerezov

{{ui:Listi prerezov (PDF)}} pod **Vzorčne črte** postavi vsak prerez na strani PDF, v vrstah od leve proti desni in od zgoraj navzdol v vrstnem redu stacionaž. Izberite **Papir**, **Merilo načrta** (vodoravno merilo prerezov) in **Povečava profila** (1×, 2×, 5× ali 10×); pogovorno okno pove, koliko prerezov se prilega na stran in koliko strani to naredi.

Vsak prerez prikazuje mrežo z odmiki in višinami, teren (črtkano), projekt, izkop in nasip (osenčena oranžno in zeleno), točke koridorja ter pod njim svojo stacionažo in površine izkopa in nasipa. Vsi prerezi na listih so narisani enako veliki, dovolj visoki za največjega; če to pri vaši povečavi ne ustreza strani, CivilCraft uporabi največji, ki ustreza, in to pove. Naslovna vrstica navaja traso, stacionaže na tej strani, merila in „List 1 od 3“.

## Do česa se meri izkop in nasip

Koridor lahko ima sloje pod voziščem: voziščne sloje, sestavne dele predloge, progo. Izbirnik **Prostornine merjene do** v vrstici prereza izbere, do česa segata izkop in nasip:

- **Spodnja površina** (privzeto): do spodnjega roba teh sestavnih delov, tako da izkop vključuje globino sestave vozišča.
- **Zgornja površina**: samo do vrha projekta, kot je bilo prej, preden so se sestavni deli šteli.

Površine v glavi, prostornine spodaj, CSV in masni prevoz vsi sledijo tej izbiri, ta pa se shrani s projektom.

## Prostornine po povprečnih končnih površinah

Med dvema sosednjima prerezoma je prostornina povprečje njunih površin, pomnoženo z razdaljo med njunima stacionažama. Vrstica prikaže skupne vsote za traso, {{ui:CSV}} pa prenese površine in prostornine vsakega prereza s tekočimi vsotami (kubični jardi za projekte v čevljih, kubični metri za metrične).

**Lastnosti** prikazujejo enake vsote poleg prostornin po metodi mreže iz [Prostornine zemeljskih del](topic:volumes). Obe sta različni aproksimaciji: bližje ležeči prerezi ju zbližata, na ravni cesti na ravnem terenu pa sta enaki.

:::note
Izkop in nasip se štejeta samo znotraj izravnanih površin (linij preseka z terenom koridorja ali ploščadi), kot pri metodi mreže. Brez koridorja ali ploščadi je projekt teren, zato prerez ne prikazuje izkopa ali nasipa.
:::

## Masni prevoz

**Masni prevoz** pod **Vzorčne črte** nariše diagram masnega prevoza iz istih prostornin po končnih površinah: vzdolž stacionaž tekoča vsota izkopa manj nasipa.

- **Krčenje (−) ali nabrekanje (+) izkopa** pove, kaj naredi kubični jard izkopa, ko je vgrajen kot nasip: −10 % (začetna vrednost, nadomestna) pomeni, da se skrči na 0.9; kamnina, ki nabrekne, bi lahko bila +5 %. Uporabite vrednost iz vašega geotehničnega poročila.
- Kjer črta narašča, je cesta v izkopu; kjer pada, v nasipu. Nad ničlo (osenčeno oranžno) zemlja se premika navzgor po stacionaži; pod ničlo (zeleno) navzdol po stacionaži.
- **Ravnotežne točke** so mesta, kjer črta seka ničlo: med dvema takima sta izkop in nasip uravnotežena. Tabela navaja vsak uravnotežen odsek, premaknjeno prostornino (njena najvišja ali najnižja točka) in povprečno razdaljo prevoza (osenčena površina, deljena s to prostornino).
- Kjer črta konča izven ničle, je ostanek **deponija** (nad) ali **izposojevališče** (pod). Na zadnjem odseku se kot premaknjena šteje samo zemlja, ki presega nivo, na katerem črta konča.

**CSV** shrani masno ordinato na vsakem prerezu, odseke in faktor.
