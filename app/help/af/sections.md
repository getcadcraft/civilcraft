---
title: Steekproeflyne en dwarssnitte
summary: Snyd snitte vierkant op 'n belyning, sien die grond, die ontwerp en die afgrawing en ophoping by elke stasie, en kry volumes volgens gemiddelde eindoppervlaktes.
keywords: massa-vervoer, massadiagram, balanspunt, krimp, swel, vervoerafstand, leen, afval, snitblaaie, dwarssnitblaaie, snitte pdf, snitte, dwarssnitte, steekproeflyne, snitaansig, afgrawing, ophoping, oppervlaktes, gemiddelde eindoppervlakte, eindoppervlakvolumes, grondwerk, stasie, afstand van lyn, csv
from: 5060173c
---

'n Dwarssnit wys die pad soos hy gebou gaan word: dwars oor die belyning by een stasie, die bestaande grond, die ontwerp (die korridor of plataform wat ingegradeer is) en die afgrawing en ophoping tussen hulle.

## Voeg steekproeflyne by

1. Kies 'n belyning. Klik in **Eienskappe**, onder **Steekproeflyne**, op {{ui:Voeg steekproeflyne by}}.
2. Stel **Elke** (die spasiëring: 50 ft of 20 m om mee te begin), **Linkerwydte** en **Regterwydte** (hoe ver elke snit van die middellyn af reik).
3. Om by 'n bepaalde stasie 'n snit te sny, tik dit in **Voeg 'n stasie by** (byvoorbeeld `2+35`) en druk {{key:Enter}}.

Snitte word gesny by elke heelveelvoud van die spasiëring, aan albei eindes van die belyning, by die begin en einde van elke kromme (PC en PT), en by die stasies wat jy byvoeg. Die steekproeflyne wys op die plan as grys lyne oor die belyning; hulle gaan ook uit in DXF, DWG en PDF op laag C-ROAD-SCTN. Elke verandering is een stap: {{key:Mod+Z}} maak dit ongedaan.

## Die snitaansig

Open dit met {{ui:Snitaansig}} in die belyning se **Eienskappe**, {{ui:Snitte}} onder **Oppervlak** › {{ui:Meer}}, of {{key:X}}. Dit neem die plek van die profielaansig onder die plan in.

- Stap deur die snitte met die pyltjies in sy balk, die stasielys, of {{key:Left}} en {{key:Right}} wanneer die snitaansig fokus het ({{key:Home}} en {{key:End}} vir die eerste en laaste).
- Die grys lyn is die bestaande grond, die rooi lyn die ontwerp. Afgrawing is oranje getint, ophoping groen. Korridorpunte is gemerk: CL (middellyn), EOP (randlyn van die sypaadjie), SH (skouer) en DL (dagligte).
- Die kop gee die stasie, hierdie snit se afgrawing- en ophopingsoppervlaktes en die vertikale oordrywing. **Pas in** vul die paneel; kies 1× om die snit ware skaal te sien.
- Die dik lyn op die plan wys watter snit op die skerm is.

## Snitblaaie

{{ui:Snitblaaie (PDF)}} onder **Steekproeflyne** sit elke snit op PDF-bladsye, in rye van links na regs en bo na onder in stasievolgorde. Kies die **Papier**, die **Planskaal** (die horisontale skaal van die snitte) en die **Profieloordrywing** (1×, 2×, 5× of 10×); die dialoog sê hoeveel snitte op 'n bladsy pas en hoeveel bladsye dit maak.

Elke snit wys 'n rooster met afstande en hoogtes, die grond (gestippel), die ontwerp, afgrawing en ophoping geskadu (oranje en groen), die korridorpunte, en daaronder sy stasie en sy afgrawing- en ophopingsoppervlaktes. Elke snit op die blaaie word dieselfde grootte geteken, hoog genoeg vir die grootste een; wanneer dit nie by jou oordrywing op die bladsy pas nie, gebruik CivilCraft die grootste een wat pas en sê so. Die titelstrook noem die belyning, die stasies op daardie bladsy, die skale en "Blad 1 van 3".

## Volumes volgens gemiddelde eindoppervlaktes

Tussen twee naburige snitte is die volume die gemiddelde van hul twee oppervlaktes maal die afstand tussen hul stasies. Die balk wys die totale vir die belyning, en {{ui:CSV}} laai elke snit se oppervlaktes en volumes met lopende totale af (kubieke yard vir voetprojekte, kubieke meter vir metriese).

**Eienskappe** wys dieselfde totale naas die roosteremetode-volumes uit [Grondwerkvolumes](topic:volumes). Die twee is verskillende benaderings: nader snitte bring hulle nader, en op 'n reguit pad op plat grond is hulle dieselfde.

:::note
Afgrawing en ophoping word net binne die gegradeerde areas getel ('n korridor se of 'n plataform se dagligtelyne), soos die roostermetode doen. Sonder 'n korridor of plataform is die ontwerp die grond, so 'n snit wys geen afgrawing of ophoping nie.
:::

## Massa-vervoer

**Massa-vervoer** onder **Steekproeflyne** teken die massa-vervoerdiagram uit dieselfde eindoppervlakvolumes: langs die stasies, die lopende totaal van afgrawing minus ophoping.

- **Krimp (−) of swel (+) van die afgrawing** sê wat 'n kubieke yard afgrawing maak sodra hy as ophoping gelê is: −10 % (die beginwaarde, 'n plekhouer) beteken dit krimp tot 0.9; rots wat swel kan +5 % wees. Gebruik die syfer uit jou geotegniese verslag.
- Waar die lyn styg, is die pad in afgrawing; waar hy daal, in ophoping. Bo nul (oranje geskadu) beweeg grond op stasie; onder nul (groen), af stasie.
- **Balanspunte** is waar die lyn nul kruis: tussen twee daarvan balanseer afgrawing en ophoping. Die tabel lys elke gebalanseerde stuk, die volume wat beweeg word (sy hoogste of laagste punt) en die gemiddelde vervoerafstand (die geskaduwde oppervlakte gedeel deur daardie volume).
- Waar die lyn off nul eindig, is wat oorbly **afval** (bo) of **leen** (onder). In daardie laaste stuk tel net die grond verby die vlak waarop hy eindig as beweeg.

**CSV** stoor die massa-ordinaat by elke snit, die stukke en die faktor.
