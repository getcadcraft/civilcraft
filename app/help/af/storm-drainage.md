---
title: Bereken stormvloeie, pypgroottes en die hidrouliese gradiëntlyn
summary: Teken die opvanggebiede wat na elke struktuur dreineer, tel die vloeie langs die netwerk op met die rasionale metode, bepaal pypgroottes volgens Manning se vergelyking, en sien waar die hidrouliese gradiëntlyn vol loop of die oppervlak bereik.
keywords: stormdrenering, opvanggebied, dreineringsgebied, rasionale metode, afloopkoëffisiënt, konsentrasietyd, reënintensiteit, idf, manning, pypgrootte, hidrouliese gradiëntlyn, hgl, energiegradiëntlyn, egl, oorlading, oorstroming, uitvloeiwater
from: e44872ec
---

Stormdrenering werk op die [pypnetwerk](topic:pipe-network): teken eers die netwerk, dan die gebiede wat daarin dreineer. Alles verskyn onder **Stormdrenering** in die regterpaneel wanneer niks gekies is nie.

## Teken 'n opvanggebied

1. Klik **Teken 'n opvanggebied** onder **Stormdrenering**.
2. Klik die hoeke van die gebied wat na een struktuur dreineer. {{key:Enter}} of 'n dubbelklik voltooi; {{key:Backspace}} neem die laaste hoek terug, {{key:Esc}} stop.
3. Die opvanggebied dreineer na 'n struktuur binne dit, anders na die naaste een. Sy **Eienskappe** maak oop: stel sy naam, die **Afloopkoëffisiënt C** (die deel van die reën wat afloop, 0 tot 1), die **Konsentrasietyd** in minute, en watter struktuur hy **Dreineer na**.

**Teken nog 'n opvanggebied** in sy Eienskappe begin die volgende een. Klik binne 'n opvanggebied op die plan om dit te kies; {{key:Delete}} verwyder dit. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

## Stel die ontwerpstorm

Die reënintensiteit is i = a ÷ (tc + b) tot die mag c, in duim per uur vir 'n voet-projek en millimeter per uur vir 'n meter-projek. Pas **Intensiteit a**, **b** en **c** aan jou eie intensiteit-duur-frekwensiekromme vir die herhalingstydperk waarvoor jy ontwerp.

:::warning
Die beginintensiteitskromme, Manning n (0.013) en aansluitingsverlies (0.5) is plekhouers, nie 'n standaard nie. Stel hulle volgens jou eie reëndata en ontwerpkriteria.
:::

- **Kortste konsentrasietyd**: geen pyp word teen 'n korter tyd bereken nie (10 minute om mee te begin).
- **Manning n**: die ruheid van die pype.
- **Aansluitingsverlies**: die drukhoogte wat in elke struktuur verloor word, as 'n deel van die snelheidshoogte V²/2g van die pyp wat dit verlaat.
- **Waterpeil by die uitlaat**: die uitvloeiwater, waar die laaste pyp leegloop. Laat dit leeg wanneer die uitlaat vry loop.

## Hoe die vloeie optel

Elke pyp dra elke opvanggebied bo dit. Q = C × i × A, waar C × A langs die netwerk afgetel word, en i die intensiteit is by die langste konsentrasietyd van die water wat aankom: die opvanggebied se eie tyd, of die tyd vanaf 'n opvanggebied hoër op plus die reistyd deur die pype (lengte ÷ die vol vloeisnelheid). Q is in kubieke voet per sekonde (A in akker) of kubieke meter per sekonde (A in hektaar).

## Bepaal die pypgroottes

Die tabel onder **Vloeie en gradiëntlyne** wys, vir elke pyp, die vloei, wat dit vol vloeiend by sy helling dra, die snelheid, die hidrouliese gradiënt by sy bo- en voetpunt, en hoe diep dit vloei.

**Bepaal die pype vir hierdie vloeie** gee elke pyp die kleinste standaardgrootte wat sy vloei by sy eie helling dra (12 tot 72 duim, of 300 tot 1800 mm). Dit is een stap. Die binnepeile bly waar hulle is: as groottes verander, gebruik **Stel elke binnepeil volgens die reëls** om die dekking te behou, en kontroleer dan die tabel weer.

## Lees die gradiëntlyne

Die hidrouliese gradiëntlyn (HGL) word vanaf die uitlaat opstroom bereken:

- 'n Pyp wat gedeeltelik vol vloei, het sy HGL by die watervlak: die binnepeil plus die normale diepte.
- Wanneer die water onder hom hoër is as sy kruin, of hy meer dra as wat hy vol vloeiend kan, vloei hy vol (oorlaai), en sy HGL styg met die wrywingshelling oor sy lengte.
- By elke struktuur is die HGL die verlatende pyp se boonste HGL plus die aansluitingsverlies.
- Die energiegradiëntlyn (EGL) is die HGL plus die snelheidshoogte.

'n Pyp wat vol vloei, word gelys, en so ook enige struktuur waar die HGL bo die rand lê: water bereik daar die oppervlak, en die struktuur word rooi op die plan omlyn. Kies 'n pyp of 'n struktuur om sy vloei, diepte, snelheid en albei gradiëntlyne in sy Eienskappe te sien.

## Roeteer 'n storm

Die rasionale metode gee een piek vir elke pyp. {{ui:Roeteer die storm}} (onder die resultate, in die netwerk se Eienskappe) bereken eerder die hele storm: elke opvanggebied se afloop oor tyd, langs die pype gedra met hul reistyd en berging, en bygetel waar hulle ontmoet.

1. Laat {{ui:Reën duur}} en {{ui:Reënintensiteit}} leeg om die langste konsentrasietyd en die reënkromme hierbo te gebruik, of tik jou eie.
2. Druk {{ui:Roeteer die storm}}. Die tabel lys, vir elke pyp, die hoogste vloei in en uit, hoeveel laer die uitgaande piek is, hoeveel van die pyp se volle kapasiteit dit gebruik, en die minuut waarop dit piek.
3. Elke uitlaat kry 'n klein vloei-oor-tyd-grafiek en {{ui:Laai die hidrograaf af (CSV)}}.

'n Opvanggebied stuur die reën uit wat oor sy konsentrasietyd gemiddeld is, dus piek 'n storm wat korter as dit is, laer as C × i × A. Elke pyp word met die Muskingum–Cunge-metode geroeteer, deur die vloeidiepte te gebruik wat die rasionale metode reeds gevind het. Twee takke met verskillende konsentrasietye piek nie saam nie, so hul som is laer as die som van hul pieke.

Dit modelleer nie oorlaai, terugwaterstuwing, berging in strukture of oorstroming nie. 'n Pyp waarvan die geroeteerde piek bo sy volle kapasiteit lê, word gelys, en sy water word aangestuur asof dit pas. Gebruik dit om tydsberekening en demping te sien, nie om die pyp te dimensioneer nie. Dit is 'n berekeningshulp: 'n ingenieur kontroleer dit.

## Gestoor saam met die projek

Opvanggebiede en die storminstellings word in die projeklêer gestoor. Hulle is nog nie in die PDF-plot, die DWG of DXF, of LandXML nie: sien [Nog nie gebou nie](topic:not-built-yet).
