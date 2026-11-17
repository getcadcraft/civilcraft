---
title: Trek 'n padkoridor
summary: Skakel 'n koridor vir 'n belyning aan, stel baan-, skouer- en sywaartse hellingwaardes, en lees die snitte, dagliglyne en grondwerk wat dit lewer.
keywords: superhoogte, super, skuinsheid, aanloop, uitloop, neigingstabel, dwarshelling, rotasie, koridor, samestelling, subsamestelling, tipiese snit, pad, baan, skouer, sywaartse helling, daglig, sny, opvulling, snitte, teiken, teikens, wydteteiken, hoogteteiken, afsetteiken, verbreding, plaveiselrand, volg 'n ander koridor
from: 91303189
---

'n Koridor trek een eenvoudige tipiese snit (’n samestelling) langs 'n belyning en sy ontwerpprofiel, gradeer dit in die bestaande grond in en voeg die resultaat by die voorgestelde oppervlak. 'n Belyning kan verskeie koridors op verskillende stasiereekse dra, en 'n koridor kan volgens stasie uit herbruikbare sjablone gebou word ([Koridorsjablone](topic:corridor-templates)). Die eenvoudige samestelling hieronder is aan albei kante dieselfde; om elke kant sy eie dele te gee, sien [Bou elke kant uit dele](topic:corridor#build-each-side-from-parts).

## Die samestelling

Vanaf die middellyn uitwaarts, aan elke kant:

1. 'n **baan** van 'n gegewe breedte, wat van die kruin af daal teen die **baanhelling**
2. 'n **skouer** van 'n gegewe breedte teen die **skouerhelling**
3. 'n **sywaartse helling** vanaf die skouerrand tot waar dit die grond raak: die **snithelling** waar die grond bo is, die **opvulhelling** waar dit onder is

Die beginwaardes is plekhouers, nie 'n ontwerpstandaard nie:

| Waarde | US feet | Meter |
|---|---|---|
| Baanbreedte | 12 ft | 3.6 m |
| Baanhelling | 2% | 2% |
| Skouerbreedte | 4 ft | 1.2 m |
| Skouerhelling | 4% | 4% |
| Snithelling | 2 : 1 | 2 : 1 |
| Opvulhelling | 3 : 1 | 3 : 1 |
| Snit elke | 10 ft | 5 m |

Sywaartse hellings is horisontaal tot vertikaal (H:V): 3 : 1 beteken 3 horisontaal vir 1 vertikaal.

## Bou die koridor

Jy het 'n belyning sonder foute nodig en 'n ontwerpprofiel met ten minste twee PVI's en geen foute nie.

1. Kies die belyning.
2. In die regterpaneel, onder **Koridor**, merk **Trek 'n samestelling langs die ontwerpprofiel**.
   Die velde verskyn en die koridor word dadelik gebou. Die plan wys die rande van baan en skouer en die dagliglyne; met {{ui:Voorgestelde (gegradeer)}} gekies onder **Vertoon**, wys die kontoere die nuwe grond.
3. Verander enige waarde: **Baanbreedte**, **Baanhelling**, **Skouerbreedte**, **Skouerhelling**, **Snithelling**, **Opvulhelling**, **Snit elke**. Druk {{key:Enter}} na elkeen. Snit-, opvul- en snitafstand moet groter as 0 wees.
4. Lees die reël onder die velde, byvoorbeeld "39 sections from 0+00.00 to 3+86.36; cut 240.2 cu yd, fill 556.0 cu yd."

Snitte word by elke **Snit elke**-stap, aan die ente, en by die begin en einde van elke horisontale en vertikale kromme gesny. Elke snit en die lyne daardeur (middellyn, rande van baan en skouer, daglig) word breeklyne van die voorgestelde oppervlak.

Om die koridor af te skakel, haal die merkblokkie uit. Sy waardes word vir die volgende keer behou.

## Wanneer dit nie bou nie

'n Rooi kassie onder die velde sê waarom:

| Boodskap | Wat om te doen |
|---|---|
| "The corridor needs a design profile without errors." | Voeg PVI's by, of herstel oorvleuelende vertikale krommes (sien [Ontwerp 'n vertikale profiel](topic:profile)). |
| "The design profile does not overlap the alignment." | Skuif die PVI's na die belyning se stasiereeks. |
| "The corridor needs at least two sections on the surface." | Die meeste van die koridor is buite die bestaande grond. |
| "4 side slopes run off the surface before meeting the ground." | Naby die rand van die oppervlak kan die helling nie die grond bereik nie. Hou die pad weg van die rand, of verlaag die opvul- of snithoogte daar. |
| "The corridor’s daylight lines cross (sections overlap, for example on the inside of a tight curve). Use a larger radius or narrower assembly." | Snitte aan die binnekant van 'n skerp kromme oorvleuel. Vergroot die radius of maak die samestelling smaller. |

'n Koridor met 'n probleem word nie ingegradeer nie en tel nie in die grondwerk nie.

## Koridors en plataforms saam

Die voorgestelde oppervlak word in volgorde gebou: elke koridor eerste, dan elke plataform. Waar 'n plataform se gradering met 'n koridor oorvleuel, wen die plataform. Volumes word binne al die dagliglyne saam bereken; sien [Grondwerkvolumes](topic:volumes).

## Superhoogte

Deur 'n kromme kan die pad na die binnekant kantel, sodat verkeer minder na die buitekant gedruk word. Merk **Gee die krommes superhoogte** onder **Superhoogte** in die belyning se **Eienskappe**:

- Elke sirkelkromme neem 'n tarief **e** uit die tariefstabel: die eerste ry wie se radius die kromme bereik (’n ry met 'n leë tarief hou normale kruin). Die tabel en die **Maksimum relatiewe helling** (0.5 % by die begin) is plekhouers, nie 'n standaard nie: stel hulle volgens jou eie ontwerpkriteria. Voeg rye by of verwyder hulle soos jy nodig het.
- Die bane roteer om die middellyn. Voor die kromme word die buitebaan oor die **uitloop** (normale kruin ÷ e × aanloop) plat gemaak, dan oor die **aanloop** (baanbreedte × e ÷ die helling) draai die buitebaan aan totdat die hele pad teen e na die binnekant hel; twee derdes van die aanloop lê voor die kromme en een derde daarop. Ná die kromme gebeur dieselfde in omgekeerde volgorde.
- 'n Skouer aan die lae kant is nooit platter as sy baan nie; aan die hoë kant behou dit sy eie helling (dit rol oor).
- Die tabel daaronder lys elke kromme se radius, tarief, aanloop en uitloop en waar volle superhoogte begin en eindig. Die **superhoogte-diagram** teken albei baan se dwarshellings langs die stasies (die linkerbaan deurlopend, die regterbaan gestippel).
- 'n Kromme wat te kort is om volle superhoogte te bereik, of twee krommes wie se oorgange oorvleuel, word in 'n kassie bo die tabel gesê.

Snitte, volumes, die 3D-aansig en die bladsye wys almal die gekantelde pad. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

## Teikens

'n Teiken skuif een punt van een kant van die pad na 'n lyn: die **Plaveiselrand** of die **Skouerrand**, aan die **Links** of die **Regs**. Elke snit ontmoet die lyn reghoekig op die middellyn, en gaan net uit na daardie kant toe, so 'n teiken aan die regterkant skuif nooit die linkerkant nie.

| Stel | Wat gebeur waar 'n snit die lyn ontmoet |
|---|---|
| **Breedte** | Die punt sit op die lyn: die baan (of die skouer) word wyer of smaller tot daarby, met behoud van sy dwarshelling. |
| **Hoogte** | Die punt neem daar die lyn se hoogte, op sy eie afsetsel: die baan (of skouer) se dwarshelling volg. |

Die lyn kan 'n kenmerklyn wees (wat ook al sy **Gebruik** is) of 'n lyn van 'n ander koridor: sy middellyn, plaveiselrande, skouerrande of dagliglyne. 'n Koridor se lyn volg daardie koridor: verander die ander pad en hierdie een volg. CivilCraft bou eers die ander koridor; twee koridors wat mekaar in 'n lus sou teiken, word aan een kant geweier, en die tabel sê watter een.

1. Kies die belyning en skakel sy koridor aan.
2. Onder **Teikens**, klik {{ui:Voeg 'n teiken by}}.
3. Kies die **Kant**, die **Punt**, wat dit **Stel** en **Na die lyn**. Elke verandering is een ontdoenstap.

**Resultaat** sê by hoeveel snitte die lyn bereik is. Snitte wat dit nie bereik nie (verby sy eindes, of waar dit agter die middellyn is) behou die samestelling se waardes. 'n Lyn wat verwyder word, laat die koridor soos dit was voor die teiken, en die tabel sê so. Een kant kan een breedte- en een hoogteteiken vir elke punt hê.

## Bou elke kant uit dele

Skakel **Bou elke kant uit dele** aan onder die koridor se instellings. Elke kant het dan sy eie lys, vanaf die middellyn uitwaarts: bane, 'n skouer, 'n goot, 'n randsteen, 'n plantstrook, 'n sypaadjie en, laaste, die sywaartse helling na die grond (met sy eie sny- en opvulverhoudings). Begin van {{ui:Landelike pad}} of {{ui:Stedelike straat}}, voeg dele by en verwyder hulle, skuif hulle met die pyltjies, en {{ui:Kopieer}} een kant na die ander. Elke verandering is een ontdoenstap.

'n Dwarshelling is die val weg van die pad, so 'n sypaadjie wat na die pad dreineer, is negatief. 'n Randsteen is 'n vlak van die hoogte wat jy gee, 'n bo van die breedte wat jy gee en 'n opsionele val aan die agterkant. Superhoogte draai elke baan in die eerste ry; die goot, randsteen, strook en sypaadjie hang aan die rand van die banne soos gebou. Teikens skuif steeds die einde van die banne en die laaste deel. Dwarssnitte merk die gootvloeilyn, bo en agterkant van die randsteen, en die res. By 'n kromme met spiraal is die aanloop die spiraal: vlak kruin by die TS, volle superhoogte by die SC.

## Plaveiselbane

'n Baan, skouer, goot, plantstrook of sypaadjie kan sy opbou dra: onder die deel voeg {{ui:Voeg 'n laag by}} 'n laag by met 'n naam, 'n materiaal, 'n dikte en sy soort (oppervlak, bindlaag, basis, onderbasis, afdeklaag of ander), van bo af. Die lae skuif nie die pad se oppervlak nie (sy bo is die ontwerpoppervlak); elk lê onder sy deel, met sy diepte reguit af gemeet. Dwarssnitte teken elke laag se onderkant as 'n stippellyn, en {{ui:Plaveiselbane: hoeveelhede}} lys die plan-oppervlakte en volume van elke laag (oppervlakte langs die koridor vanaf sy snitte, volume = oppervlakte × dikte). Die IFC-uitvoer skryf elke laag as sy eie element met sy dikte en materiaal (sien [IFC-uitvoer en -invoer](topic:ifc)). Die dikte wat jy tik is joune: CivilCraft bepaal nie die plaveisels se afmetings nie.

## Wat nog nie gebou is nie

Teikens vir die daglighelling is nog nie beskikbaar nie. Vir 'n koridor wat langs die pad verander, met links en regs apart, gebruik [Koridorsjablone](topic:corridor-templates). Sien [Nog nie gebou nie](topic:not-built-yet).
