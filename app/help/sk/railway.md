---
title: Návrh železničnej trate
summary: Premeňte os trasy na železnicu: prechodnice (klotoida, kubická parabola, Bloss, Helmert, sínusová polvlna, sínus), prevýšenie v každom oblúku s rovnovážnym prevýšením, nedostatkom a prebytkom, limity prevýšenia a geometrie trate ako upozornenia, výhybky a spojky podľa staničenia, priejazdný obrys pozdĺž trate a trať s koľajnicami, podvalmi a štrkovým lôžkom vytvorenú ako koridor v pôdoryse, rezoch, pozdĺžnom profile, 3D a množstvách.
keywords: železnica, koľajnica, železničná trať, trať, metro, električka, prevýšenie, nedostatok prevýšenia, prebytok prevýšenia, rovnovážne prevýšenie, prechodnica, prechodový oblúk, klotoida, kubická parabola, Bloss, Helmert, sínusová polvlna, kosínus, rozchod, normálny rozchod, širokorozchodný, metrový rozchod, úzkorozchodný, podvaly, priečne podvaly, štrkové lôžko, podkladová vrstva, pláň, bočný pás, osová vzdialenosť koľají, 60E1, 54E1, UIC60, 115RE, 136RE, sklon prevýšenia, rýchlosť zmeny prevýšenia, výhybka, výhybkový jazyk, hrot jazyka, spojka, srdcovka, číslo srdcovky, dĺžka výhybky, uzatvárací oblúk, rýchlosť v odbočke, priejazdnosť, priejazdný obrys, priejazdný profil, nakladací profil, kinematický obrys, nástupište, medzera nástupišťa, vzdialenosť koľají, sklon, zvislý oblúk, minimálny polomer, LandXML prevýšenie
from: 99de9745
---

Akákoľvek os trasy môže byť železničnou traťou. Jej oblúky potom dostanú prechodnice a prevýšenie (nadvýšenie koľajníc) a jej koridor sa vytvorí ako trať: koľajnice na podvaloch na štrkovom lôžku, zarovnané do terénu ako cesta. Výhybky a spojky sa na ňu umiestnia podľa staničenia a obrys priejazdnosti sa môže previesť pozdĺž nej a skontrolovať voči tomu, čo stojí vedľa trate.

Každé číslo nižšie je zástupná hodnota, nie norma. Železnice nastavujú svoje limity podľa traťovej rýchlosti, typu trate a krajiny; nastavte ich podľa normy vašej železnice. CivilCraft neobsahuje žiadnu národnú tabuľku.

## Nastavenie osi trasy ako železnice

1. Vyberte os trasy a v Vlastnostiach nájdite **Železnica**.
2. Zaškrtnite **Táto os trasy je železničná trať**. Každá zmena je jeden krok späť.
3. Nastavte **Návrhovú rýchlosť** v hornej časti Vlastností osi trasy: je to traťová rýchlosť, voči ktorej sa kontroluje prevýšenie. **Najpomalšie vlaky** (v bloku Železnica) je rýchlosť, voči ktorej sa kontroluje prebytok prevýšenia.

## Prechodnice

Zadajte každému oblúku dĺžku špirály na oboch koncoch v tabuľke PI (**Prechodnica na vstupe**, **Prechodnica na výstupe**), potom vyberte jej typ v tabuľke oblúkov bloku Železnica alebo použite **Prechodnica pre každý oblúk**:

| Typ | Krivosť pozdĺž prechodnice |
|---|---|
| Klotoida | rastie rovnomerne (špirála cesty) |
| Kubická parabola | y = x³ / (6·R·L), pričom L sa meria pozdĺž dotyčnice; samotný oblúk je o niečo dlhší |
| Bloss | 3u² − 2u³ z plnej krivosti (u = podiel dĺžky): začína a končí plynule |
| Helmert | dve paraboly, najprv 2u², potom 1 − 2(1 − u)² |
| Sínusová polvlna | (1 − cos πu) / 2 |
| Sínus | u − sin(2πu) / 2π |

Všetky okrem kubickej paraboly sa stáčajú o L / 2R, ako klotoida. Staničenie ide po skutočnej dĺžke. LandXML zachováva typ (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Prevýšenie

Zadajte **Prevýšenie** každého oblúka v milimetroch. Tabuľka ukazuje pre každý oblúk:

- **Rovnovážne prevýšenie** = G·v² / (g·R), kde G je vzdialenosť osí koľajníc (**Osová vzdialenosť koľajníc**, rozchod plus šírka hlavy koľajnice, pokiaľ ju nezadáte). Pri G = 1500 mm je to známy vzorec 11.8·V² / R (V v km/h, R v m).
- Nedostatok prevýšenia = rovnovážne prevýšenie pri traťovej rýchlosti − použité prevýšenie.
- Prebytok prevýšenia = použité prevýšenie − rovnovážne prevýšenie pri rýchlosti najpomalších vlakov.
- **Rampa**: najstrmší sklon prevýšenia pozdĺž jeho rámp, v mm na meter.

Prevýšenie sa zvyšuje počas každej prechodnice, tvarované ako jej krivosť: priamo pri klotoide alebo kubickej parabole, tvarom Bloss pri Bloss a podobne. Koniec oblúka bez prechodnice dostane rampu na priamke pred ním, dlhú, koľko vyžaduje limit sklonu prevýšenia, a program to oznámi: prevýšenie sa potom mení tam, kde sa krivosť nemení.

**Prevýšenie sa otáča okolo** určuje, ktorá koľajnica zostáva na projektovanom profile: **nižšia koľajnica** (obvyklá), **vnútorná koľajnica** alebo **os trate** (každá koľajnica sa posunie o polovicu prevýšenia). Projektovaný profil je tam horná hrana koľajnice.

**Diagram prevýšenia** kreslí výšku každej koľajnice nad profilom pozdĺž staničenia; pohľad na profil a listy pôdorysu a profilu dostanú to isté ako pás pod profilom.

## Limity prevýšenia a upozornenia

**Najväčšie použité prevýšenie**, **Najväčší nedostatok prevýšenia**, **Najväčší prebytok prevýšenia**, **Najstrmší sklon prevýšenia** a **Najrýchlejšia zmena prevýšenia** (sklon pri traťovej rýchlosti, mm/s) sa kontrolujú na každom oblúku. Hodnota nad limitom je upozornenie v bloku Železnica a v paneli Problémy, s uvedeným limitom a zistenou hodnotou. Bez návrhovej rýchlosti sa nedostatok a rýchlosť zmeny nekontrolujú (poznámka to hovorí).

## Trať

Nastavte **Rozchod** (predvoľby normálny 1435 mm, širokorozchodný, metrový alebo úzkorozchodný, alebo vlastný), **Typ koľajnice** (60E1, 54E1, 49E1, 115RE, 136RE: iba ich uverejnené rozmery), počet **Koľají** a ich **Osovú vzdialenosť koľají**, potom **Podvaly a štrkové lôžko**: materiál podvalov, dĺžka, šírka, výška a rozstup; hrúbka štrkového lôžka pod podvalom (pri nižšej koľajnici), rameno, sklon a ako ďaleko je jeho horná hrana pod podvalmi; hrúbka podkladovej vrstvy, bočný pás za pätou štrkového lôžka a priečny sklon pláne.

Stlačte **Vytvoriť trať**. Zapne sa koridor osi trasy, vytvorený ako trať pozdĺž projektovaného profilu: koľajnice a podvaly sa naklápajú s prevýšením, pláň nie. Napájacie svahy idú od hrany bočného pásu k svahom zárezu a násypu koridoru a trať sa napája na navrhovaný povrch ako cesta.

- **Pôdorys**: obe koľajnice každej koľaje (vrstva C-RAIL-TRAK) a pri viacerých koľajach os každej koľaje (C-RAIL-CNTR), na obrazovke, v DXF, DWG, PDF a v listoch pôdorysu a profilu.
- **Rezy**: podvaly, koľajnice a spodky štrkového lôžka a podkladovej vrstvy v každom reze.
- **3D**: koľajnice, každý podval a štrkové lôžko (Zobraziť › Trať), tiež v GLB, OBJ a USD.
- **Množstvá**: dĺžka trate, koľajnice (obe koľajnice každej koľaje, pozdĺž vlastnej osi každej koľaje), podvaly, štrkové lôžko a štrkové lôžko bez podvalov a podkladová vrstva, metódou priemerných koncových plôch medzi rezmi.

## Kontroly geometrie trate

Okrem prevýšenia blok Železnica kontroluje samotnú trať voči šiestim ďalším limitom (všetky zástupné, všetky nastavíte vy):

- **Najstrmší sklon** projektovaného profilu v mm na meter.
- **Najmenší polomer zvislého oblúka** ako koeficient k v R ≥ k·V² (R v metroch, V v km/h). Parabolický zvislý oblúk dĺžky L medzi dvoma sklonmi má polomer L delené zmenou sklonu.
- **Najkratší zvislý oblúk**.
- **Najmenší polomer oblúka** v pôdoryse (0 vypne kontrolu).
- **Najkratší oblúk alebo priamy úsek** ako sekundy jazdy pri traťovej rýchlosti: kružnicový oblúk alebo priamka medzi dvoma oblúkmi kratšia než táto vzdialenosť sa upozorní. 1.8 s je známe pravidlo „polovica rýchlosti v km/h, v metroch“.
- **Rýchlosť zmeny nedostatku prevýšenia** pozdĺž každej prechodnice v mm/s pri traťovej rýchlosti.

**Geometria trate** uvádza najstrmší zistený sklon a každý zvislý oblúk s jeho polomerom a polomerom, ktorý vyžaduje traťová rýchlosť. Zvislý oblúk ležiaci na prechodnici alebo na rampe prevýšenia dostane poznámku. Bez projektovaného profilu alebo bez návrhovej rýchlosti sa kontroly, ktoré ich potrebujú, preskočia a poznámka to oznámi.

## Výhybky a spojky

Pod **Výhybky a spojky** stlačte **Pridať výhybku**. Umiestni sa na najdlhšiu priamku; nastavte v tabuľke:

- **Staničenie hrotu jazyka**: kde výhybka začína na tejto osi trasy.
- **Srdcovka**: číslo srdcovky N (1:N). Uhol srdcovky je 2·atan(1 / 2N).
- **Strana**: vľavo alebo vpravo, pri pohľade v smere rastúceho staničenia.
- **Vzdialenosť spojky** v metroch: nad 0 sa výhybka stane spojkou na rovnobežnú trať vo vzdialenosti (dve výhybky a priamka medzi nimi).

Tabuľka ukazuje **Dĺžku výhybky** (hrot jazyka po srdcovku), **Polomer** uzatváracieho oblúka a **Rýchlosť v odbočke**, ktorú tento polomer dovoľuje pri vašom limite nedostatku prevýšenia a bez prevýšenia. **Vytvoriť jej trať** premení odbočnú trasu na vlastnú os (jazyk, uzatvárací oblúk, potom rovno pod uhlom srdcovky) s rovnakými nastaveniami železnice, pripravenú na predĺženie.

Pôdorys kreslí obe odbočné koľajnice každej výhybky, jej os, značku na hrote jazyka a na srdcovke a „1:N“ (vrstva C-RAIL-TURN), na obrazovke a v DXF, DWG, PDF a listoch. 3D pohľad kreslí odbočné koľajnice na úrovni hlavnej trate.

Tvar je zástupný: priamy jazyk a jeden uzatvárací oblúk podľa čísla srdcovky. Skutočná výhybka sa riadi normou železnice a výkresom výrobcu. Upozornenia: výhybka, ktorá presahuje os, leží na oblúku, prechodnici, prevýšení alebo zvislom oblúku, alebo sa prekrýva s inou výhybkou; a poznámka, keď je traťová rýchlosť vyššia než jej rýchlosť v odbočke.

## Priejazdný obrys

Zaškrtnite **Previesť priejazdný obrys pozdĺž tejto trate**. Zvoľte **Obrys** (dva zástupné tvary alebo **Vlastný obrys** zadaný ako jeden bod na riadok: vodorovné odsadenie od osi trate, potom výška nad hornou hranou koľajnice, v metroch), **Dĺžku vozidla** a **Osovú vzdialenosť podvozkov** a, ak existuje, **Hranu nástupišťa** (strana, vzdialenosť od osi trate, výška nad koľajnicou).

Na každej stanici sa obrys naklopí s prevýšením okolo nižšej koľajnice a rozšíri sa oblúkom: stred vozidla sa posunie dovnútra o b² / 8R, jeho konce von o (L² − b²) / 8R (b osová vzdialenosť podvozkov, L dĺžka vozidla, R polomer tam, podľa prechodnice). Blok kreslí rez na priamke a tam, kde je najširší, a uvádza:

- **najširší obrys** a kde,
- **osové vzdialenosti koľají** porovnané s osovými vzdialenosťami, ktoré potrebujú dva susedné obrysy,
- voľný priestor na **hrane nástupišťa**, alebo koľko zasahuje dovnútra,
- každý čiarový prvok, potrubnú konštrukciu a inú železničnú os nájdenú **vnútri obrysu**.

Čiarový prvok s kótami výšky sa posudzuje voči obrysu vo svojej výške nad koľajnicou; bez projektovaného profilu alebo pre bod bez výšky sa posudzuje len v pôdoryse a zoznam to uvedie. Pôdorys zobrazuje dve hrany obrysu (vrstva C-RAIL-CLRN) s krížikom pri každej veci vnútri.

Obrysy sú **zástupné, nie rozchod žiadnej železnice**. Pred použitím výsledku zadajte priejazdný profil vašej železnice.

## V iných programoch

- **LandXML**: železničná os sa zapisuje s prechodnicami (spiType) a blokom `Cant`: rozchod, bod otáčania, traťová rýchlosť a staničenie, kde každá rampa prevýšenia začína a končí, s použitým prevýšením, rovnovážnym prevýšením a nedostatkom. Otvorenie súboru LandXML s blokom `Cant` urobí túto os železnicou s týmito prevýšeniami.
- **IFC**: os s jej segmentmi prevýšenia, koľajnice, podvaly, štrkové lôžko a podkladová vrstva.

## Ešte nie je hotové

Výhybky v exporte IFC, typy výhybok nad rámec jedného uzatváracieho oblúka (zakrivené jazyky, srdcovky s pohyblivým hrotom, kríženie koľají, diamantové kríženie), pravidlá kinematického rozchodu (obrys je pevný tvar s odklonom v oblúku), trolejové vedenie a zabezpečovacie zariadenia.

**Ktorá norma.** V bloku Železnica má voľba **Citovaná norma** možnosti Žiadna alebo Európska (UIC a EN). Voľba Európska uvedie dokumenty, ktoré európsky projekt cituje (EN 13803 pre parametre osi, EN 13232 pre výhybky a kríženia, EN 15273 pre priejazdné profily, EN 13848 pre kvalitu geometrie trate) a každému limitu dá políčko pre článok, z ktorého pochádza. Žiadne číslo z normy nie je zabudované: limity prevýšenia, nedostatku, prebytku, sklonu a rýchlosti zmeny, geometria výhybky a priejazdný profil sú stále zástupné a okno to hovorí. Železničný inžinier overí každú hodnotu voči znenia normy a pred čímkoľvek zapíše článok vedľa nej. Južná Afrika a tabuľky AREMA nie sú v tejto verzii.
