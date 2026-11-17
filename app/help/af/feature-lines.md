---
title: Kenmerklyne
summary: Teken 3D-lyne wat jy hoekpunt-vir-hoekpunt van hellings voorsien, maak trapvormige verskuiwings daarvan, en gebruik hulle as breeklyne van die grond of as hellende platforms in die ontwerp.
keywords: boog, kurwe, radius, 3D-boog, heliks, geboë randsteen, helling-oorlegsel, hoogte-oorlegsel, helling-pyltjies, kenmerklyn, helling, hoogte, trapvormige verskuiwing, verskuiwing, breeklyn, randsteen, sloot, berm, hellende platform, daglig, grondwerk, 3D-polilyn
from: d55b25fb
---

'n Kenmerklyn is 'n lyn met 'n hoogte by elke hoekpunt: 'n randsteen, 'n sloot se vloeilyn, die bopunt van 'n berm, die rand van 'n hellende platform. Jy stel sy hoogtes met 'n getal of met helling, kopieer hom sywaarts met 'n trap op of af, en kies wat die oppervlaktes met hom doen.

## Teken een

1. Kies **Oppervlak** › {{ui:Meer}} › {{ui:Kenmerklyn}}, of druk {{key:L}}.
2. Klik sy hoekpunte op die plan. 'n Klik op 'n opmetingspunt neem die punt se plek en hoogte oor; enige plek anders gee die hoekpunt die bestaande grond se hoogte daar.
3. Druk {{key:Enter}} om 'n oop lyn klaar te maak, of klik die eerste hoekpunt weer om hom toe te maak.

Die nuwe lyn is gekies en begin as 'n breeklyn van die bestaande grond, wat op die grond lê.

## Boë

'n Segment kan 'n boog in die plan wees waarvan die eindpunte op verskillende hoogtes sit: 'n randsteen-draai, 'n geboë sloot, 'n ramp wat draai. Sy helling loop eweredig langs die boog, en sy lengte word langs die kromme gemeet.

- **Terwyl jy teken:** druk {{key:C}} (op 'n aanraakskerm, {{ui:Boog}} in die balk bo die plan) om bôe aan te skakel. Na 'n hoekpunt, klik 'n punt op die kromme, en klik dan waar die boog eindig. Druk {{key:C}} weer vir reguit segmente. {{key:Backspace}} laat die punt op die kromme eers vaar.
- **Daarna:** in **Eienskappe**, tik 'n radius en die rigting waarin dit draai in die hoekpunt se **Boog**-blokkie, byvoorbeeld `50 L` of `50 R` (links of regs soos jy langs die lyn loop), en druk {{key:Enter}}. Maak die blokkie leeg om die segment weer reguit te maak. 'n Radius kleiner as die helfte van die segment word geweier.

Die gekose lyn wys elke boog se radius langs sy helling. **Lengte** is langs die bôe in die plan; **3D-lengte** tel ook die styging en daling. Trapvormige verskuiwings hou die bôe: 'n boog aan die buitekant van 'n draai groei, een aan die binnekant krimp, en 'n verskuiwing verby 'n boog se middelpunt word geweier.

Die oppervlaktes, die 3D-aansig en DXF en DWG neem elke boog as kort reguit stukke wat binne 0.01 van die kromme bly. LandXML hou hulle as bôe (sien **Bôe in ander lêers** hieronder).

## Stel hoogtes en hellings

**Eienskappe** lys die hoekpunte met hul afstand langs die lyn, hul **Hoogte** en die **Helling na volgende** (in persent). Tik enige een en druk {{key:Enter}}:

- 'n Hoogte skuif net daardie hoekpunt.
- 'n Helling stel die hoogte aan die verre einde van sy segment; die hoekpunte daarna bly waar hulle is, so die volgende segment se helling verander.

Ook in **Eienskappe**:

| Aksie | Wat dit doen |
|---|---|
| **Hef of verlaag almal met** | Tel die hoogte wat jy tik by elke hoekpunt. |
| {{ui:Hoogtes uit die grond}} | Plaas elke hoekpunt terug op die bestaande grond (hoekpunte af van die oppervlak hou hulle, en word gelys). |
| {{ui:Een helling, eerste tot laaste}} | Hou die eerste en laaste hoogtes en plaas die hoekpunte tussenin op een gelyke helling. |

Die gekose lyn wys sy hoogtes by die hoekpunte en sy hellings langs die segmente op die plan. Sleep 'n hoekpunt met {{ui:Kies}} om hom te skuif; sy hoogte bly.

## Trapvormige verskuiwings

Onder **Trapvormige verskuiwing**, tik 'n **Afstand** (positief regs van die lyn se rigting, negatief links), dan 'n hoogte (op of af met) of 'n helling in persent, en klik {{ui:Maak die verskuiwingslyn}}. Die kopie is 'n nuwe kenmerklyn: byvoorbeeld die agterkant van 'n randsteen 0.5 ft sywaarts en 0.5 ft hoër, of 'n sloot se rand 6 ft uit teen 2 %. 'n Afstand wat die kopie by 'n stywe draai oor homself sou vou, word geweier.

## Hellings en hoogtes op die skerm

Druk {{key:E}}, of merk **Hellings en hoogtes op kenmerklyne** onder Vertoning af, om elke kenmerklyn se helling langs elke segment te sien (met 'n klein pyltjie wat afwaarts wys) en sy hoogte by die hoekpunte. Hulle wys net op die skerm: niks word by die tekening gevoeg nie, en die PDF, DXF en DWG bly soos hulle is. Kort segmente en opeengepakte hoekpunte word sonder etikette gelaat totdat jy inzoem. Die gekose lyn wys altyd sy eie hellings en hoogtes.

## In die lengteprofiel-aansig

'n Kenmerklyn wat 'n belyning kruis, wys in daardie belyning se lengteprofiel-aansig, met sy naam en hoogte by die kruising; lyne wat langs hom loop kan ook gewys word. Sien [Ontwerp 'n vertikale lengteprofiel](topic:profile).

## Wat die oppervlaktes daarmee doen

Kies **Gebruik**:

| Gebruik | Wat gebeur |
|---|---|
| Breeklyn van die bestaande grond | Die bestaande grond loop deur die lyn op sy hoogtes, soos 'n getekende breeklyn. |
| Gegradeer in die ontwerp | 'n **geslote** lyn word 'n hellende platform: die voorgestelde oppervlak binne dit word gegradeer tot by sy rand. Skakel **Daglig na die grond** aan om sny- en vulhellings (horisontaal tot 1 vertikaal) vanaf sy rand na die grond te laat loop, soos 'n platform doen; elke helling begin daar op die rand se eie hoogte. |
| Slegs geteken | Dit bly op die plan en gaan uit in DXF, DWG en PDF (laag C-GRAD-FEAT, 3D-polilyne), maar die oppervlaktes ignoreer dit. |

Volumes, snitte en die 3D-aansig sluit kenmerklyne in wat in die ontwerp gegradeer is, soos platforms. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

## Lyne met jou span deel

In 'n tekening wat uit jou wolklêers in CadCraft Studio oopgemaak is, op 'n span-plan, het die projek se Eienskappe (niks gekies nie) 'n **Span**-afdeling met {{ui:Span-lyne…}}: die lyne wat jou span gedeel het, elk met sy hersiening, sonder dat jy eers 'n kenmerklyn kies. Kies 'n lyn om hom te deel, stoot 'n nuwe hersiening, trek die span s'n, of hou op om te deel. Buite daardie instelling sê die afdeling wat dit nodig het.

## Bôe in ander lêers

| Lêer | Wat gebeur met 'n kenmerklyn met bôe |
|---|---|
| CivilCraft-projek | Presies behou. |
| LandXML | Geskryf as 'n planfunksie van lyne en bôe met hul hoogtes, en teruggelees met sy bôe. 'n Kenmerklyn van 'n ander program kom in as **Slegs geteken**: kies sy **Gebruik** om hom in 'n oppervlak te plaas. |
| DWG en DXF | 'n 3D-polilyn kan nie 'n boog hou nie, so die lyn word geskryf as kort stukke binne 0.01 van elke boog. CivilCraft merk ook in die tekening aan watter stukke bôe was: wanneer jy die tekening as lynwerk oopmaak, bring {{ui:Kenmerklyne}} die lyne terug as kenmerklyne met hul bôe. Ander programme sien 'n gewone 3D-polilyn. |
