---
title: Veeg 'n padkoridor
summary: Skakel 'n koridor vir 'n belyning aan, stel rybaan-, skouer- en kanthellingwaardes in, en lees die snitte, daglyne en grondwerk wat dit oplewer.
keywords: aansluiting, kruising, pad ontmoet pad, syweg, T-aansluiting, kruising, platformpeil, verbind, aansluit, superhoogte, super, verhoging, oorgangslengte, uitloop, tarieftabel, dwarshelling, rotasie, koridor, samestelling, subsamestelling, tipiese snit, pad, rybaan, skouer, dwarshelling, kanthelling, daglyn, afgraving, opvulling, snitte, doel, doele, breedtedoel, elevasiedoel, afsettingsdoel, verbreding, plaveiselrand, volg 'n ander koridor
from: 6dcb92b3
---

'n Koridor veeg een eenvoudige tipiese snit ('n samestelling) langs 'n belyning en sy ontwerpprofiel, gradeer dit in die bestaande grond in en voeg die resultaat by die voorgestelde oppervlak. 'n Belyning kan verskeie koridors dra op verskillende stasiereekse, en 'n koridor kan gebou word uit herbruikbare sjablone volgens stasie ([Koridorsjablone](topic:corridor-templates)). Die eenvoudige samestelling hieronder is dieselfde aan albei kante; om elke kant sy eie dele te gee, sien [Bou elke kant uit dele](topic:corridor#build-each-side-from-parts).

## Die samestelling

Vanaf die middellyn uitwaarts, aan elke kant:

1. 'n **rybaan** van 'n gegewe breedte, wat van die kruin af wegval teen die **rybaanhelling**
2. 'n **skouer** van 'n gegewe breedte teen die **skouerhelling**
3. 'n **kanthelling** vanaf die skouerrand tot waar dit die grond raak: die **afgravingshelling** waar die grond bo is, die **opvullingshelling** waar dit onder is

Die beginwaardes is plekhouers, nie 'n ontwerpstandaard nie:

| Waarde | US feet | Meter |
|---|---|---|
| Rybaanbreedte | 12 ft | 3.6 m |
| Rybaanhelling | 2% | 2% |
| Skouerbreedte | 4 ft | 1.2 m |
| Skouerhelling | 4% | 4% |
| Afgravingshelling | 2 : 1 | 2 : 1 |
| Opvullingshelling | 3 : 1 | 3 : 1 |
| Snit elke | 10 ft | 5 m |

Hellings vir kanthellings is horisontaal tot vertikaal (H:V): 3 : 1 beteken 3 oor vir 1 af.

## Bou die koridor

Jy het 'n belyning sonder foute nodig en 'n ontwerpprofiel met ten minste twee PVI's en geen foute nie.

1. Kies die belyning.
2. In die regterpaneel, onder **Koridor**, merk **Veeg 'n samestelling langs die ontwerpprofiel**.
   Die velde verskyn en die koridor word dadelik gebou. Die plan wys die rande van rybaan en skouer en die daglyne; met {{ui:Voorgestelde (gegradeer)}} gekies onder **Vertoning**, wys die kontoere die nuwe grond.
3. Verander enige waarde: **Rybaanbreedte**, **Rybaanhelling**, **Skouerbreedte**, **Skouerhelling**, **Afgravingshelling**, **Opvullingshelling**, **Snit elke**. Druk {{key:Enter}} na elk. Afgraving-, opvulling- en snitafstand moet meer as 0 wees.
4. Lees die reël onder die velde, byvoorbeeld "39 snitte van 0+00.00 tot 3+86.36; afgraving 240.2 cu yd, opvulling 556.0 cu yd."

Snitte word gesny by elke stap van **Snit elke**, aan die einde, en by die begin en einde van elke horisontale en vertikale kromme. Elke snit en die lyne daardeur (middellyn, rande van rybaan en skouer, daglyn) word breeklyne van die voorgestelde oppervlak.

Om die koridor af te skakel, ontmerk die blokkie. Die waardes word vir die volgende keer behou.

## Wanneer dit nie bou nie

'n Rooi blokkie onder die velde sê waarom:

| Boodskap | Wat om te doen |
|---|---|
| "The corridor needs a design profile without errors." | "Die koridor benodig 'n ontwerpprofiel sonder foute." Voeg PVI's by, of herstel oorlappende vertikale krommes (sien [Ontwerp 'n vertikale profiel](topic:profile)). |
| "The design profile does not overlap the alignment." | "Die ontwerpprofiel oorvleuel nie die belyning nie." Skuif die PVI's na die belyning se stasiereeks. |
| "The corridor needs at least two sections on the surface." | "Die koridor benodig ten minste twee snitte op die oppervlak." Die meeste van die koridor is buite die bestaande grond. |
| "4 side slopes run off the surface before meeting the ground." | "4 kanthellings loop van die oppervlak af voordat hulle die grond raak." Naby die rand van die oppervlak kan die helling nie die grond bereik nie. Hou die pad weg van die rand, of verlaag die opvulling- of afgravingshoogte daar. |
| "The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly." | "Die koridor se daglyne kruis (snitte oorvleuel, byvoorbeeld aan die binnekant van 'n stywe kromme). Gebruik 'n groter radius of 'n smaller samestelling." Snitte aan die binnekant van 'n skerp kromme oorvleuel. Vergroot die radius of vernou die samestelling. |

'n Koridor met 'n probleem word nie ingegradeer nie en tel nie in die grondwerk mee nie.

## Koridors en platforms saam

Die voorgestelde oppervlak word in volgorde gebou: eers elke koridor, dan elke platform. Waar 'n platform se gradering 'n koridor oorvleuel, wen die platform. Waar 'n latere item 'n pad oorvleuel, word slegs die deel van die pad binne die latere item se daglyn vervang; die res van die pad, en enige grondbreeklyn wat die pad kruis, behou sy vorm. Volumes word binne al die daglyne saam bereken; sien [Grondwerkvolumes](topic:volumes).

## Superhoogte

In 'n kromme kan die pad na die binnekant kantel, sodat verkeer minder na die buitekant gedruk word. Merk **Superhoogte die krommes** onder **Superhoogte** in die belyning se **Eienskappe**:

- Elke sirkelkromme neem 'n tarief **e** uit die tarieftabel: die eerste ry waarvan die radius die kromme bereik ('n ry met 'n leë tarief hou die normale kruin). Die tabel en die **Maksimum relatiewe helling** (0.5 % om mee te begin) is plekhouers, nie 'n standaard nie: stel dit volgens jou eie ontwerpkriteria. Voeg rye by of verwyder hulle soos jy nodig het.
- Die rybane draai om die middellyn. Voor die kromme word die buitenste rybaan oor die **uitloop** plat gemaak (normale kruin ÷ e × oorgangslengte), dan oor die **oorgangslengte** (rybaanbreedte × e ÷ die helling) draai die buitenste rybaan voort totdat die hele pad teen e na die binnekant hel; twee derdes van die oorgangslengte lê voor die kromme en een derde daarop. Na die kromme gebeur dit omgekeerd.
- 'n Skouer aan die lae kant is nooit platter as sy rybaan nie; aan die hoë kant behou dit sy eie helling (dit rol oor).
- Die tabel daaronder lys elke kromme se radius, tarief, oorgangslengte en uitloop en waar volle superhoogte begin en eindig. Die **superhoogtediagram** teken albei rybane se dwarshellings langs die stasies (die linkerrybaan as 'n soliede lyn, die regterrybaan as 'n stippellyn).
- 'n Kromme wat te kort is om volle superhoogte te bereik, of twee krommes waarvan die oorgange oorlap, word in 'n blokkie bo die tabel aangedui.

Snitte, volumes, die 3D-aansig en die blaaie wys almal die gekantelde pad. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

## Doele

'n Doel skuif een punt van een kant van die pad na 'n lyn: die **Plaveiselrand** of die **Skouerrand**, aan die **Linkerkant** of die **Regterkant**. Elke snit ontmoet die lyn reghoekig op die middellyn, en gaan net aan daardie kant uit, sodat 'n doel aan die regterkant nooit die linkerkant skuif nie.

| Stel | Wat gebeur waar 'n snit die lyn ontmoet |
|---|---|
| **Breedte** | Die punt lê op die lyn: die rybaan (of die skouer) word wyer of smaller tot daar, met behoud van sy dwarshelling. |
| **Elevasie** | Die punt neem die lyn se elevasie daar, by sy eie afstand: die rybaan (of skouer) se dwarshelling volg. |

Die lyn kan 'n kenmerklyn wees (wat ook al sy **Gebruik** is) of 'n lyn van 'n ander koridor: sy middellyn, plaveiselrande, skouerrande of daglyne. 'n Koridor se lyn volg daardie koridor: verander die ander pad en hierdie een volg. CivilCraft bou eers die ander koridor; twee koridors wat mekaar in 'n lus sou teiken, word aan een kant geweier, en die tabel sê watter een.

1. Kies die belyning en skakel sy koridor aan.
2. Onder **Doele**, klik {{ui:Voeg 'n doel by}}.
3. Kies die **Kant**, die **Punt**, wat dit **Stel** en **Na die lyn**. Elke verandering is een ontdoenstap.

**Resultaat** sê by hoeveel snitte die lyn bereik is. Snitte wat dit nie bereik nie (verby sy einde, of waar dit agter die middellyn is) behou die samestelling se waardes. 'n Lyn wat uitgevee word, laat die koridor soos dit was voor die doel, en die tabel sê so. Een kant kan een breedte- en een elevasiedoel vir elke punt hê.

## Build each side from parts

Skakel **Build each side from parts** aan onder die koridor se instellings. Elke kant het dan sy eie lys, vanaf die middellyn uitwaarts: rybane, 'n skouer, 'n goot, 'n kerb, 'n plantstrook, 'n sypaadjie en, laaste, die kanthelling na die grond (met sy eie afgravings- en opvullingsverhoudings). Begin by {{ui:Landelike pad}} of {{ui:Stedelike straat}}, voeg dele by en verwyder dele, skuif hulle met die pyltjies, en {{ui:Kopieer}} een kant na die ander. Elke verandering is een ontdoenstap.

'n Dwarshelling is die val weg van die pad, dus is 'n sypaadjie wat na die pad dreineer negatief. 'n Kerb is 'n vlak van die hoogte wat jy gee, 'n bo van die breedte wat jy gee en 'n opsionele val aan die agterkant. Superhoogte draai elke rybaan in die eerste ry; die goot, kerb, strook en sypaadjie hang aan die rand van die rybane soos gebou. Doele skuif steeds die einde van die rybane en die laaste deel. Dwarssnitte merk die gootvloeilyn, bo en agterkant van die kerb, en die res. Op 'n kromme met spiraals is die oorgangslengte die spiraal: vlak kruin by die TS, volle superhoogte by die SC.

## Plaveiselbane

'n Rybaan, skouer, goot, plantstrook of sypaadjie kan sy opbou dra: onder die deel voeg {{ui:Voeg 'n laag by}} 'n laag by met 'n naam, 'n materiaal, 'n dikte en sy soort (oppervlak, bindlaag, basis, subbasis, deklaag of ander), van bo af. Die lae skuif nie die pad se oppervlak nie (die bo daarvan is die ontwerpoppervlak); elke laag lê onder sy deel, en sy diepte word reguit af gemeet. Dwarssnitte teken die onderkant van elke laag as 'n stippellyn, en {{ui:Plaveiselbane: hoeveelhede}} lys die grondplanarea en volume van elke laag (oppervlakte langs die koridor uit sy snitte, volume = oppervlakte × dikte). Die IFC-uitvoer skryf elke laag as sy eie element met sy dikte en materiaal (sien [IFC-uitvoer en -invoer](topic:ifc)). Die dikte wat jy tik is joune: CivilCraft dimensioneer nie plaveisels nie.

## Where roads meet roads, pads and paths

Met {{ui:Voeg die paaie en platforms waarby dit aansluit}} aan (dit is aan vir elke koridor), verbind CivilCraft 'n koridor met wat dit in plan ontmoet:

- **'n Pad wat op 'n ander pad eindig** (die einde van sy belyning lê op die ander pad, of binne ongeveer die helfte van sy eie plaveiselbreedte van daardie pad se rand af) is die syweg van 'n aansluiting. Die pad wat dit ontmoet maak sy rand oop vir die syweg se plaveisel: oor die mond word die skouer, kerb, strook en sypaadjie op die rybaan se dwarshelling gelê en as plaveisel geteken. Die syweg word op die hoofpad se oppervlak gelê waar die twee oorvleuel, en oor die nadering na daardie oppervlak op- of afgewerk.
- **Twee paaie wat kruis** word aan albei kante op dieselfde manier verbind. Die pad wat eerste onder Belynings gelys is, is die deurpad; die ander een volg sy oppervlak oor.
- **'n Pad wat by 'n platform eindig** (binne dit, of binne ongeveer die helfte van sy plaveiselbreedte van sy rand af) bereik die platform se peil en word oor die nadering daarheen afgewerk.
- **'n Paadjie** (Landskap › Verhardings) stop by 'n pad se buiterand, op die peil van die sypaadjie of skouer daar, in plaas van om oor die pad te lê. 'n Paadjie wat 'n pad kruis, word twee stukke. 'n Einde wat 'n bietjie kort van 'n pad getrek is (binne twee keer die paadjie se breedte) word tot by sy rand voortgesit.

**Eienskappe** sê wat elke koridor verbind het, met hoeveel dit daar opgehef of verlaag is en oor watter lengte. Daardie lengte is die groter van 10 m (30 ft) en twintig keer die verandering, en nooit meer as 45% van die koridor nie. **Die ontwerpprofiel word nie verander nie**: die profielaansig wys steeds die helling wat jy geteken het, en die snitte, die voorgestelde oppervlak, die volumes en die 3D-aansig wys die pad soos verbind. Om die aansluiting by ontwerp presies te maak, skuif die laaste PVI na die peil wat Eienskappe rapporteer.

Skakel die skakelaar af op 'n koridor om dit presies te laat soos sy profiel en samestelling sê; dit neem dan geen deel aan enige aansluiting nie, as syweg of deurpad. Paaie wat amper in 'n lyn ontmoet (onder ongeveer 20°) word met rus gelaat, en so ook veldpaaie.

Wat 'n aansluiting nog nie doen nie: daar is geen kerbafdraaiings nie (hoeke is reghoekig), geen draaibane of eilande nie, die syweg se einde word reghoekig op sy eie belyning afgesny, en 'n koridor wat uit sjablone gebou is, maak sy rand op dieselfde eenvoudige manier oop ('n sloot of muur in sy eindtoestand word oor die mond gelyk gemaak, sonder 'n duiker). Vir plan-kerbafdraaiings, sigthoeke en merkings sien [Grond, paaie, opmeting, myne en skakels](topic:soils-roads-survey-mines-links).

## Wat nog nie gebou is nie

Doele vir die daglynhelling is nog nie beskikbaar nie. Vir 'n koridor wat langs die pad verander, met links en regs apart, gebruik [Koridorsjablone](topic:corridor-templates). Sien [Nog nie gebou nie](topic:not-built-yet).
