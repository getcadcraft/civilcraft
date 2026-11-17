---
title: Lê 'n swaartekrag-pypnetwerk uit
summary: Teken storm- of sanitêre pyplope struktuur vir struktuur, stel jou helling-, dekking- en daalreëls, laat CivilCraft die binnepeile stel, en los die probleme wat dit lys op.
keywords: struktuurbouer, struktuurtipe, reghoekige struktuur, opvangput, raam, dekking, wanddikte, biblioteekitem, pypnetwerk, storm, sanitêr, riool, strukture, inspeksiegate, inlate, binnepeile, helling, daling, rand, sompput, swaartekragpype
from: 10a3c14d
---

'n Projek hou een swaartekrag-pypnetwerk, storm of sanitêr. Dit bestaan uit strukture (inspeksiegate, inlate) en reguit pype tussen hulle. Vloei loop in die rigting wat jy teken. CivilCraft kontroleer elke pyp en struktuur teen drie reëls wat jy stel, en kan elke binnepeil uit daardie reëls stel.

## Teken 'n loop

Jy kan pype teken sonder 'n oppervlak, maar rande, dekking en outomatiese binnepeile benodig een.

1. Druk {{key:P}}, of klik {{ui:Pype}} in die **Ontwerp**-groep.
   Die wenk sê "Pype: klik strukture van die bokant van die loop af (klik 'n bestaande een om aan te sluit). Enter voltooi."
2. Klik waar die stroomop-struktuur kom. 'n Struktuur word geplaas.
3. Klik elke volgende struktuur stroomaf. Om aan 'n struktuur wat reeds bestaan te koppel, klik daarop: die statusbalk sê "Aangesluit by S3."
4. Druk {{key:Enter}}.
   Die pype word geteken, hul binnepeile word uit die reëls gestel, en die statusbalk sê byvoorbeeld "3 pype geteken, 12 binnepeile volgens die reëls gestel; elke kontrole slaag."

Nuwe strukture kry die name S1, S2 … met 'n deursnee van 48 duim (1200 mm). Nuwe pype kry die name P1, P2 … met 'n deursnee van 12 duim (300 mm). Deursnee is in duim in 'n voetprojek en in millimeter in 'n meterprojek.

Voltooi met {{key:Enter}}. Dubbelklik werk ook, maar wanneer jy op 'n bestaande struktuur dubbelklik om die loop daar te beëindig, val die aansluiting weg: klik dit een keer, en druk dan {{key:Enter}}.

## Stel jou reëls

Met niks gekies nie, het die regterpaneel (**Projek**) 'n **Pypnetwerk**-blok:

| Instelling | Beginwaarde | Betekenis |
|---|---|---|
| Tipe | Storm | {{ui:Storm}} of {{ui:Sanitêr}}; geskryf na LandXML |
| Kleinste helling | 0.50% | Elke pyp moet minstens soveel daal |
| Kleinste dekking | 2 ft (0.6 m) | Grond tot pypkruin, heeltemal langs die pyp |
| Daling in strukture | 0.10 ft (0.03 m) | Die uitlaat-binnepeil moet minstens so ver onder elke inlaat-binnepeil wees |

**Hierdie beginwaardes is plekhouers, nie 'n standaard nie.** Stel die waardes wat jou agentskap of projek vereis. Dekking word gemeet van die grond tot die kruin (binnepeil plus binnedeursnee); wanddikte word nie getel nie. Waar plato of korridors gegradeer is, is die gegradeerde oppervlak die grond.

## Laat CivilCraft binnepeile stel

- {{ui:Stel elke binnepeil volgens die reëls}} (in die **Pypnetwerk**-blok) stel alle pype.
- {{ui:Stel sy binnepeile volgens die reëls}} (met een pyp gekies) stel net daardie pyp.

Stroomaf werkend, begin elke loop minstens dekking by sy boonste struktuur, daal minstens die kleinste helling, daal minstens die daling deur elke struktuur, en gaan dieper waar die grond langs die pyp minder as die kleinste dekking sou laat. Binnepeile word na 0.01 afgerond, nooit op nie. Die statusbalk sê "Binnepeile gestel: kleinste dekking by die bokant van elke loop, minstens die kleinste helling, minstens die daling in elke struktuur." of noem wat dit nie kon doen nie.

## Wysig strukture en pype

Klik 'n struktuur of pyp met {{ui:Kies}} om dit in die regterpaneel te sien.

**Struktuur**: **Naam**, **Rand**, **Sompdiepte**, **Deursnee**, dan **Rand gebruik**, **Somp**, **Oos** en **Noord**, en die pype in en uit met hul binnepeile.

- Laat **Rand** leeg om dit uit die oppervlak te neem; die blokkie wys dan die oppervlakwaarde in grys. Tik 'n waarde om die rand vas te stel.
- Sleep die struktuur se handvatsel op die plan om hom te skuif. Sy pype volg; hul binnepeile bly soos hulle was, dus kontroleer die probleme daarna.

**Tipe**: kies een van die netwerk se strukturtipes (hieronder), of geen, vir 'n ronde struktuur van sy eie deursnee.

**Pyp**: **Naam**, die strukture waartussen dit loop, **Deursnee**, **Boonste binnepeil**, **Onderste binnepeil**, dan **Lengte**, **Helling** en **Kleinste dekking**.

Druk {{key:Enter}} na elke waarde.

## Lees en los probleme op

Die **Pypnetwerk**-blok lys elke probleem (tot 40); klik een om die pyp of struktuur te kies. 'n Gekose pyp of struktuur lys sy eie. Met niks gekies nie, sê dit "Elke pyp en struktuur slaag die reëls."

| Boodskap (voorbeelde) | Wat om te doen |
|---|---|
| "P2 loop bergop (-0.40%)." of "… loop plat …" | Ruil die binnepeile om, of stel hulle volgens die reëls. |
| "P2 by 0.30% is platter as die minimum 0.50%." | Verlaag die stroomaf-binnepeil of verhoog die stroomop-een. |
| "P3 het 1.40 dekking 35 langs hom, minder as die minimum 2." | Verlaag die pyp; stel sy binnepeile volgens die reëls. |
| "In S3 verlaat P4 by 245.20, minder as 0.1 onder P3 wat by 245.25 inkom." | Verlaag die uitlaatpyp se boonste binnepeil. |
| "P1 se kruin is bo S1 se rand." | Die pyp is te hoog vir die struktuur. |
| "S2 het 2 pype wat daarvan wegloop; 'n swaartekragnetwerk behoort een uitweg uit elke struktuur te hê." | Verwyder een uitgaande pyp, of teken dit weer in die regte rigting. |
| "Die pype vorm 'n lus; vloei moet by 'n uitlaat eindig." | 'n Loop is terug in homself geteken; skrap 'n pyp. |
| "S5 is buite die oppervlak en het geen randhoogte nie." | Tik 'n rand, of skuif die struktuur op die oppervlak. |
| "P6 loop gedeeltelik buite die oppervlak; dekking daar is onbekend." | Brei die oppervlak uit, of aanvaar dat dekking daar nie nagegaan word nie. |
| "P7 het nog geen binnepeile nie." | Tik hulle in, of stel hulle volgens die reëls. |

Probleempype en -strukture word ook rooi op die plan gemerk.

## Strukturtipes

'n Strukturtipe is 'n struktuur wat uit sy parameters gebou is: 'n inspeksiegat, inlaat, aansluitkas of uitlaat, **ronde** (binnedeursnee) of **reghoekige** (binnewydte en -lengte), met sy **wanddikte**, **vloerplaat**, 'n **somp** onder die laagste pyp en 'n **raam en deksel** (ronde of reghoekige opening, raamhoogte). Tipes hoort by die netwerk, onder **Strukturtipes** in die projek se Eienskappe.

1. Klik {{ui:Nuwe strukturtipe}}. Die dialoog teken die struktuur op die plan en in snit terwyl jy tik.
2. Klik {{ui:Voeg die tipe by}}.
3. Kies 'n struktuur en kies die tipe onder **Tipe**. Dit neem die tipe se grootte en somp; sy eie somp kan steeds verander word.

Wysig 'n tipe en elke struktuur van daardie tipe volg sy groottes. Verwyder 'n tipe en sy strukture bly as ronde strukture van dieselfde wydte. Elke verandering is een stap: {{key:Mod+Z}} doen dit ongedaan.

'n Reghoekige struktuur word op die plan, in DXF, DWG en PDF, en in 3D as 'n reghoek geteken met sy lengte langs sy uitlaatpyp; pype begin by sy muur. LandXML skryf dit as 'n reghoekige struktuur (`RectStruct`) met sy wanddikte, en lees sulke strukture terug as tipes.

### Deel 'n tipe deur die biblioteek

{{ui:Stoor as biblioteekitem}} skryf die tipe as 'n CadCraft-biblioteekitem (`.json`-lêer): sy plansimbool, 'n 3D-liggaam tot 'n tipiese diepte, en elke grootte. Laai dit op na die biblioteek om dit te deel. {{ui:Maak 'n biblioteekitem oop}} lees 'n struktuur wat so gestoor is terug in die netwerk, omgeskakel na die projek se eenhede. Biblioteekitems wat nie strukture is wat in CivilCraft gemaak is nie, word geweier, met die rede.

## Skrap

Kies 'n pyp en druk {{key:Delete}} om dit te verwyder. Die skrap van 'n struktuur verwyder ook die pype wat daaraan gekoppel is. Op 'n Mac, druk Fn en skrap, of klik {{ui:Skrap}}.

## Nog nie gebou nie

Vloeie, pyp-groottes en die hidrouliese graadlyn is in [Stormdreinering](topic:storm-drainage). Pypkataloë, nie-ronde pype, pype in die profielaansig, geboë pype en meer as een netwerk per projek is nog nie beskikbaar nie. Sien [Nog nie gebou nie](topic:not-built-yet).
