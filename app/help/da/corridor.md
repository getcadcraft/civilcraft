---
title: Lav en vejkorridor langs tracéet
summary: Tænd en korridor for et tracé, angiv værdier for kørebane, skulder og sideskråning, og læs de snit, skærelinjer og jordarbejde, den giver.
keywords: overhøjning, super, banking, udrulning, udløb, satstabel, tværfald, rotation, korridor, samling, delsamling, typisk tværsnit, vej, kørebane, skulder, sideskråning, skæring i terræn, afgravning, fyldning, snit, mål, bredde-mål, kote-mål, forskydningsmål, udvidelse, kant af belægning, følg en anden korridor
from: 91303189
---

En korridor sweeper et enkelt typisk tværsnit (en samling) langs et tracé og dets designprofil, planerer det ind i det eksisterende terræn og lægger resultatet til den planerede overflade. Et tracé kan have flere korridorer på forskellige stationsintervaller, og en korridor kan bygges af genbrugelige skabeloner efter station ([Korridorskabeloner](topic:corridor-templates)). Den enkle samling nedenfor er den samme på begge sider; for at give hver side sine egne dele, se [Byg hver side af dele](topic:corridor#build-each-side-from-parts).

## Samlingen

Fra midtlinjen udad, på hver side:

1. en **kørebane** med en given bredde, der falder væk fra kronen med **kørebanehældningen**
2. en **skulder** med en given bredde ved **skulderhældningen**
3. en **sideskråning** fra skulderkanten, indtil den møder terrænet: **skærehældningen**, hvor terrænet ligger over, og **fyldningshældningen**, hvor det ligger under

Startværdierne er pladsholdere, ikke en designstandard:

| Værdi | US feet | Meter |
|---|---|---|
| Kørebanebredde | 12 ft | 3.6 m |
| Kørebanehældning | 2 % | 2 % |
| Skulderbredde | 4 ft | 1.2 m |
| Skulderhældning | 4 % | 4 % |
| Skærehældning | 2 : 1 | 2 : 1 |
| Fyldningshældning | 3 : 1 | 3 : 1 |
| Snit hver | 10 ft | 5 m |

Hældninger for sideskråninger er vandret til lodret (V:L): 3 : 1 betyder 3 vandret for 1 lodret.

## Byg korridoren

Du skal bruge et tracé uden fejl og et designprofil med mindst to PVI'er og ingen fejl.

1. Vælg tracéet.
2. I højre panel, under **Korridor**, sæt kryds i **Sweep en samling langs designprofilet**.
   Felterne vises, og korridoren bygges med det samme. Planen viser kanterne af kørebane og skulder og skærelinjerne; med {{ui:Projekteret (planeret)}} valgt under **Visning** viser højdekurverne det nye terræn.
3. Ændr en værdi: **Kørebanebredde**, **Kørebanehældning**, **Skulderbredde**, **Skulderhældning**, **Skærehældning**, **Fyldningshældning**, **Snit hver**. Tryk {{key:Enter}} efter hver. Afgravning, fyldning og snitafstand skal være større end 0.
4. Læs linjen under felterne, for eksempel »39 snit fra 0+00.00 til 3+86.36; afgravning 240.2 cu yd, fyldning 556.0 cu yd.«

Snit tages ved hvert **Snit hver**-trin, ved enderne og ved start og slutning af hver vandret og lodret kurve. Hvert snit og linjerne gennem dem (midtlinje, kanter af kørebane og skulder, skærelinjer) bliver brudlinjer i den planerede overflade.

Slå korridoren fra ved at fjerne krydset. Dens værdier gemmes til næste gang.

## Når den ikke bygges

En rød boks under felterne siger, hvorfor:

| Besked | Hvad du gør |
|---|---|
| »Korridoren kræver et designprofil uden fejl.« | Tilføj PVI'er, eller ret overlappende lodrette kurver (se [Design et lodret profil](topic:profile)). |
| »Designprofilet overlapper ikke tracéet.« | Flyt PVI'erne over tracéets stationsinterval. |
| »Korridoren kræver mindst to snit på overfladen.« | Det meste af korridoren ligger uden for det eksisterende terræn. |
| »4 sideskråninger løber ud af overfladen, før de møder terrænet.« | Tæt på overfladens kant kan skråningen ikke nå terrænet. Hold vejen væk fra kanten, eller sænk fyldnings- eller skærehøjden der. |
| »Korridorens skærelinjer krydser hinanden (snit overlapper, for eksempel på indersiden af en snæver kurve). Brug en større radius eller en smallere samling.« | Snit på indersiden af en skarp kurve overlapper. Forøg radius eller gør samlingen smallere. |

En korridor med et problem planeres ikke ind og tæller ikke med i jordarbejdet.

## Korridorer og byggeplateauer sammen

Den planerede overflade bygges i rækkefølge: først alle korridorer, derefter alle byggeplateauer. Hvor et byggeplateaus planering overlapper en korridor, vinder byggeplateauet. Volumener beregnes inden for alle skærelinjerne samlet; se [Jordarbejdsvolumener](topic:volumes).

## Overhøjning

Gennem en kurve kan vejen hælde mod indersiden, så trafikken presses mindre mod ydersiden. Sæt kryds i **Overhøj kurverne** under **Overhøjning** i tracéets **Egenskaber**:

- Hver cirkulær kurve får en sats **e** fra satstabellen: den første række, hvis radius kurven når (en række med tom sats beholder normal krone). Tabellen og **Maks. relativ hældning** (0.5 % at starte med) er pladsholdere, ikke en standard: angiv dem ud fra dine egne designkriterier. Tilføj eller fjern rækker efter behov.
- Kørebanerne roterer om midtlinjen. Før kurven fladdes ydersiden af kørebanen ud over **udløbet** (normal krone ÷ e × udrulning), og derefter over **udrulningen** (kørebanebredde × e ÷ hældningen) drejer ydersiden videre, indtil hele vejen hælder med e mod indersiden; to tredjedele af udrulningen ligger før kurven og en tredjedel på den. Efter kurven sker det samme i omvendt rækkefølge.
- En skulder på den lave side er aldrig fladere end sin kørebane; på den høje side beholder den sin egen hældning (den ruller over).
- Tabellen under den viser hver kurves radius, sats, udrulning og udløb og hvor fuld overhøjning starter og slutter. **Overhøjningsdiagrammet** tegner begge kørebaners tværfald langs stationerne (venstre kørebane fuldt optrukket, højre stiplet).
- En kurve, der er for kort til at nå fuld overhøjning, eller to kurver, hvis overgange overlapper, siges i en boks over tabellen.

Snit, mængder, 3D-visningen og arkene viser alle den hældede vej. Hver ændring er ét trin: {{key:Mod+Z}} fortryder det.

## Mål

Et mål flytter ét punkt på én side af vejen hen til en linje: **Kant af belægning** eller **Skulderkant**, på **Venstre** eller **Højre**. Hvert snit møder linjen vinkelret på midtlinjen og går kun ud på den side, så et mål på højre side aldrig flytter venstre side.

| Sætter | Hvad der sker, hvor et snit møder linjen |
|---|---|
| **Bredde** | Punktet ligger på linjen: kørebanen (eller skulderen) bliver bredere eller smallere til den og beholder sin tværhældning. |
| **Kote** | Punktet får linjens kote der, i sin egen forskydning: kørebanens (eller skulderens) tværhældning følger med. |

Linjen kan være en feature-linje (uanset dens **Anvendelse**) eller en linje fra en anden korridor: dens midtlinje, kanter af belægning, skulderkanter eller skærelinjer. En korridors linje følger den korridor: ændrer du den anden vej, følger denne med. CivilCraft bygger den anden korridor først; to korridorer, der ville målrette hinanden i en løkke, afvises på den ene side, og tabellen siger hvilken.

1. Vælg tracéet og tænd dets korridor.
2. Under **Mål** klikker du på {{ui:Tilføj et mål}}.
3. Vælg **Side**, **Punkt**, hvad det **Sætter**, og **Til linjen**. Hver ændring er ét fortrydelsestrin.

**Resultat** siger ved hvor mange snit linjen blev nået. Snit, der ikke når den (forbi dens ender, eller hvor den ligger bag midtlinjen), beholder samlingens værdier. En linje, der slettes, efterlader korridoren, som den var før målet, og tabellen siger det. En side kan have ét bredde-mål og ét kote-mål for hvert punkt.

## Byg hver side af dele

Slå **Byg hver side af dele** til under korridorens indstillinger. Hver side får så sin egen liste fra midtlinjen udad: kørebaner, en skulder, en rendesten, en kantsten, en plantestrimmel, et fortov og til sidst sideskråningen til terrænet (med sine egne skære- og fyldningsforhold). Start fra {{ui:Landevej}} eller {{ui:Bygade}}, tilføj og fjern dele, flyt dem med pilene, og {{ui:Kopiér}} den ene side til den anden. Hver ændring er ét fortrydelsestrin.

Et tværfald er faldet væk fra vejen, så et fortov, der afvander mod vejen, er negativt. En kantsten er en flade med den højde, du angiver, en top med den bredde, du angiver, og et valgfrit fald på bagsiden. Overhøjning drejer alle kørebaner i første række; rendestenen, kantstenen, strimlen og fortovet hænger fra kørebanernes kant, som de er bygget. Mål flytter stadig kørebanernes ende og den sidste del. Tværsnit markerer rendestensbundlinjen, kantstenens top og bagkant og resten. På en kurve med overgangskurver er udrulningen overgangskurven: fladt tværfald ved TS, fuld overhøjning ved SC.

## Belægningslag

En kørebane, skulder, rendesten, plantestrimmel eller et fortov kan have sin opbygning: under delen tilføjer {{ui:Tilføj et lag}} et lag med et navn, et materiale, en tykkelse og en type (slidlag, bindelag, bærelag, underbærelag, forstøbning eller andet), ovenfra og ned. Lagene flytter ikke vejens overflade (dens top er den projekterede overflade); hvert ligger under sin del, med dybden målt lodret nedad. Tværsnit tegner hver laggrundlinje som en stiplet linje, og {{ui:Belægningslag: mængder}} lister planarealet og volumenet for hvert lag (areal langs korridoren fra dens snit, volumen = areal × tykkelse). IFC-eksporten skriver hvert lag som sit eget element med sin tykkelse og materiale (se [IFC-eksport og -import](topic:ifc)). Tykkelsen, du angiver, er din egen: CivilCraft dimensionerer ikke belægninger.

## Ikke lavet endnu

Mål for skæringshældningen er ikke tilgængelige endnu. For en korridor, der ændrer sig langs vejen, med venstre og højre hver for sig, brug [Korridorskabeloner](topic:corridor-templates). Se [Ikke lavet endnu](topic:not-built-yet).
