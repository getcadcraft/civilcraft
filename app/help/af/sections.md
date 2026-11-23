---
title: Monsterlyne en dwarssnitte
summary: Sny snitte reghoek op 'n belyning, sien die grond, die ontwerp en die afgraving en opvulling by elke stasie, en kry volumes volgens gemiddelde eindareas.
keywords: massavervoer, massadiagram, balanspunt, krimp, swel, vervoerafstand, leen, afval, snitblaaie, dwarssnitblaaie, snitte-pdf, snitte, dwarssnitte, monsterlyne, snitaansig, afgraving, opvulling, areas, gemiddelde eindarea, eindareavolumes, grondwerk, stasie, afset, csv
from: 09639ce2
---

'n Dwarssnit wys die pad soos dit gebou gaan word: dwars oor die belyning by een stasie, die bestaande grond, die ontwerp (die koridor of platform wat ingegradeer is) en die afgraving en opvulling tussen hulle.

## Voeg monsterlyne by

1. Kies 'n belyning. In **Eienskappe**, onder **Monsterlyne**, klik {{ui:Voeg steekproeflyne by}}.
2. Stel **Elke** in (die spasiëring: 50 ft of 20 m om mee te begin), **Linkerbreedte** en **Regterbreedte** (hoe ver elke snit van die middellyn reik).
3. Om 'n snit by 'n bepaalde stasie te sny, tik dit in **Voeg 'n stasie by** (byvoorbeeld `2+35`) en druk {{key:Enter}}.

Snitte word gesny by elke heelveelvoud van die spasiëring, by albei eindes van die belyning, by die begin en einde van elke kromme (PC en PT), en by die stasies wat jy byvoeg. Die monsterlyne wys op die plan as grys lyne dwars oor die belyning; hulle gaan ook uit in DXF, DWG en PDF op laag C-ROAD-SCTN. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

## Die snitaansig

Maak dit oop met {{ui:Snitaansig}} in die belyning se **Eienskappe**, {{ui:Snitte}} onder **Oppervlak** › {{ui:Meer}}, of {{key:X}}. Dit neem die plek van die profielaansig onder die plan in.

- Stap deur die snitte met die pyltjies in sy balk, die stasielys, of {{key:Left}} en {{key:Right}} met die snitaansig in fokus ({{key:Home}} en {{key:End}} vir die eerste en laaste).
- Die grys lyn is die bestaande grond, die rooi lyn die ontwerp. Afgraving is oranje getint, opvulling groen. Koridorpunte word gemerk: CL (middellyn), EOP (plaveiselrand), SH (skouer) en DL (daglyn).
- Die kop gee die stasie, hierdie snit se afgravings- en opvullingsareas en die vertikale oordrywing. **Pas aan** vul die paneel; kies 1× om die snit ware skaal te sien.
- Die dik lyn op die plan wys watter snit op die skerm is.
- **Zoem en beweeg:** die wiel zoem om die wyser, en sleep beweeg die aansig. {{ui:Pas aan}} (of {{key:F}}, of 'n dubbelklik) pas die hele snit weer aan.

## Meet in 'n snit

1. Klik {{ui:Meet}} in die snitbalk, of druk {{key:M}}. Die wenk sê "Klik die eerste punt, dan die tweede."
2. Klik twee punte. Elkeen vasvang aan die einde van 'n lyn of 'n koridorpunt (CL, EOP, SH, DL); hou {{key:Alt}} vir 'n vrye punt.
3. Die aflesing gee die horisontale afstand (ΔH), die vertikale afstand (ΔV), die helling in persent met sy verhouding, en die reguit lengte, in die projek se eenhede.

Klik weer om 'n nuwe meting te begin. {{key:Esc}} wis dit uit, en {{key:M}} skakel Meet af.

## Snitblaaie

{{ui:Snitblaaie (PDF)}} onder **Monsterlyne** plaas elke snit op PDF-bladsye, in rye van links na regs en bo na onder in stasie-volgorde. Kies die **Papier**, die **Planskaal** (die horisontale skaal van die snitte) en die **Profieloordrywing** (1×, 2×, 5× of 10×); die dialoog sê hoeveel snitte op 'n bladsy pas en hoeveel bladsye dit maak.

Elke snit wys 'n rooster met afsettings en elevasies, die grond (stippel), die ontwerp, afgraving en opvulling getint (oranje en groen), die koridorpunte, en daaronder sy stasie en sy afgravings- en opvullingsareas. Elke snit op die blaaie word even groot geteken, hoog genoeg vir die grootste een; wanneer dit nie by jou oordrywing op die bladsy pas nie, gebruik CivilCraft die grootste een wat wel pas en sê so. Die titelstrook noem die belyning, die stasies op daardie bladsy, die skale en "Blad 1 van 3".

## Waarna afgraving en opvulling gemeet word

'n Koridor kan lae onder die plaveisel hê: plaveiselbane, sjabloonkomponente, spoor. Die keuse **Volumes gemeet tot** in die snitbalk kies waarheen afgraving en opvulling loop:

- **Onderste oppervlak** (die begin): tot die onderkant van daardie komponente, sodat die afgraving die diepte van die plaveiselopbou insluit.
- **Boonste oppervlak**: tot die bo van die ontwerp alleen, soos voorheen toe komponente getel is.

Die areas in die kop, die volumes hieronder, die CSV en die massavervoer volg almal hierdie keuse, en dit word saam met die projek gestoor.

## Volumes volgens gemiddelde eindareas

Tussen twee naburige snitte is die volume die gemiddelde van hul twee areas maal die afstand tussen hul stasies. Die balk wys die totale vir die belyning, en {{ui:CSV}} laai elke snit se areas en volumes af met lopende totale (kubieke yard vir voet-projekte, kubieke meter vir metriese projekte).

**Eienskappe** wys dieselfde totale langs die roostermetode-volumes uit [Grondwerkvolumes](topic:volumes). Die twee is verskillende benaderings: nader snitte bring hulle nader aan mekaar, en op 'n reguit pad op plat grond is hulle dieselfde.

:::note
Afgraving en opvulling word net binne die gegradeerde areas getel ('n koridor of platform se daglyne), soos die roostermetode doen. Sonder 'n koridor of platform is die ontwerp die grond, so 'n snit wys geen afgraving of opvulling nie.
:::

## Massavervoer

**Massavervoer** onder **Monsterlyne** teken die massavervoerdiagram uit dieselfde eindarea-volumes: langs die stasies, die lopende totaal van afgraving min opvulling.

- **Krimp (−) of swel (+) van die afgraving** sê wat 'n kubieke yard afgraving maak sodra dit as opvulling geplaas is: −10 % (die beginwaarde, 'n plekhouer) beteken dit krimp tot 0.9; rots wat swel kan +5 % wees. Gebruik die syfer uit jou geotegniese verslag.
- Waar die lyn styg, is die pad in afgraving; waar dit daal, in opvulling. Bo nul (oranje getint) beweeg grond op stasie; onder nul (groen), af stasie.
- **Balanspunte** is waar die lyn nul kruis: tussen twee daarvan balanseer afgraving en opvulling. Die tabel lys elke gebalanseerde stuk, die volume wat verskuif word (sy hoogste of laagste punt) en die gemiddelde vervoerafstand (die getinte area gedeel deur daardie volume).
- Waar die lyn af van nul eindig, is wat oorbly **afval** (bo) of **leen** (onder). In daardie laaste stuk tel net die grond bo die vlak waarop dit eindig as verskuif.

**CSV** stoor die massaordinaat by elke snit, die stukke en die faktor.
