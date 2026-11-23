---
title: Tegn en vejkorridor
summary: Slå en korridor til for et tracé, angiv værdier for kørebane, skulder og sideskråning, og læs de tværprofiler, dagslinjer og jordarbejder den giver.
keywords: kryds, skæring, vej møder vej, sidevej, T-kryds, krydsning, plateaukote, samling, tilslutning, overhøjde, super, banking, udløb, udløbsstrækning, satstabel, tværfald, rotation, korridor, tværsnit, underelement, typisk tværsnit, vej, kørebane, skulder, tværfald, sideskråning, dagslinje, afgravning, opfyld, snit, mål, målbredde, målkote, målforskydning, udvidelse, kant af kørebane, følg en anden korridor
from: 6dcb92b3
---

En korridor fører et enkelt typisk tværsnit (et tværsnit) langs et tracé og dets projekterede længdeprofil, planerer det ind i det eksisterende terræn og lægger resultatet til den projekterede overflade. Et tracé kan bære flere korridorer på forskellige stationsintervaller, og en korridor kan bygges ud fra genbrugelige skabeloner efter station ([Korridorskabeloner](topic:corridor-templates)). Det enkle tværsnit nedenfor er det samme på begge sider; for at give hver side sine egne dele, se [Byg hver side af dele](topic:corridor#build-each-side-from-parts).

## Tværsnittet

Fra midterlinjen og udad, på hver side:

1. en **kørebane** med en given bredde, der falder fra vejens midte med **kørebanens fald**
2. en **skulder** med en given bredde ved **skulderfaldet**
3. en **sideskråning** fra skulderkanten til hvor den møder terrænet: **skæreskråningen** hvor terrænet er over, **fyldskråningen** hvor det er under

Startværdierne er pladsholdere, ikke en projekteringsnorm:

| Værdi | US feet | Meter |
|---|---|---|
| Kørebanebredde | 12 ft | 3.6 m |
| Kørebanens fald | 2% | 2% |
| Skulderbredde | 4 ft | 1.2 m |
| Skulderfald | 4% | 4% |
| Skæreskråning | 2 : 1 | 2 : 1 |
| Fyldskråning | 3 : 1 | 3 : 1 |
| Snit hver | 10 ft | 5 m |

Skråninger for sideskråninger angives som vandret til lodret (H:V): 3 : 1 betyder 3 vandret for 1 lodret.

## Byg korridoren

Du skal bruge et tracé uden fejl og et projekteret længdeprofil med mindst to PVI'er og ingen fejl.

1. Vælg tracéet.
2. I højre panel, under **Korridor**, sæt flueben ved **Før et tværsnit langs det projekterede længdeprofil**.
   Felterne vises, og korridoren bygges med det samme. Planen viser kanterne af kørebane og skulder samt dagslinjerne; når {{ui:Projekteret (planeret)}} er valgt under **Visning**, viser højdekurverne det nye terræn.
3. Ændr en værdi: **Kørebanebredde**, **Kørebanens fald**, **Skulderbredde**, **Skulderfald**, **Skæreskråning**, **Fyldskråning**, **Snit hver**. Tryk {{key:Enter}} efter hver. Skæreskråning, fyldskråning og snitafstand skal være større end 0.
4. Læs linjen under felterne, for eksempel »39 snit fra 0+00.00 til 3+86.36; afgravning 240.2 cu yd, opfyld 556.0 cu yd.«

Snit tages ved hvert **Snit hver**-trin, i enderne og ved start og slut på hver vandret og lodret kurve. Hvert snit og linjerne gennem dem (midterlinje, kanter af kørebane og skulder, dagslinje) bliver brudlinjer i den projekterede overflade.

For at slukke korridoren, fjern fluebenet. Dens værdier gemmes til næste gang.

## Når den ikke bygges

En rød boks under felterne forklarer hvorfor:

| Meddelelse | Hvad du gør |
|---|---|
| » Korridoren kræver et projekteret længdeprofil uden fejl. « | Tilføj PVI'er, eller ret overlappende lodrette kurver (se [Tegn et lodret længdeprofil](topic:profile)). |
| » Det projekterede længdeprofil overlapper ikke tracéet. « | Flyt PVI'erne over til tracéets stationsinterval. |
| » Korridoren kræver mindst to snit på overfladen. « | Det meste af korridoren ligger uden for det eksisterende terræn. |
| » 4 sideskråninger løber af overfladen, før de møder terrænet. « | Nær kanten af overfladen kan skråningen ikke nå terrænet. Hold vejen væk fra kanten, eller sænk fyld- eller skærehøjden dér. |
| » Korridorens dagslinjer krydser hinanden (snit overlapper, for eksempel på indersiden af en skarp kurve). Brug en større radius eller et smallere tværsnit. « | Snit på indersiden af en skarp kurve overlapper. Forøg radius eller gør tværsnittet smallere. |

En korridor med et problem planeres ikke ind og tælles ikke med i jordarbejdet.

## Korridorer og plateauer sammen

Den projekterede overflade bygges i rækkefølge: først alle korridorer, derefter alle plateauer. Hvor et plateaus planering overlapper en korridor, vinder plateauet. Hvor et senere element overlapper en vej, erstattes kun den del af vejen, der ligger inden for det senere elements dagslinje; resten af vejen og enhver terrænbrudlinje, som vejen krydser, beholder sin form. Mængder beregnes inden for alle dagslinjer samlet; se [Jordarbejdsmængder](topic:volumes).

## Overhøjde

I en kurve kan vejen hælde indad, så trafikken presses mindre ud mod ydersiden. Sæt flueben ved **Giv kurverne overhøjde** under **Overhøjde** i tracéets **Egenskaber**:

- Hver cirkulær kurve får en sats **e** fra satstabellen: den første række, hvis radius kurven når (en række med tom sats beholder normalt tværfald). Tabellen og **Maks. relativ hældning** (0.5 % til start) er pladsholdere, ikke en norm: angiv dem ud fra dine egne projekteringskriterier. Tilføj eller fjern rækker efter behov.
- Kørebanerne roterer om midterlinjen. Før kurven udjævnes den yderste kørebane over **udløbet** (normalt tværfald ÷ e × overgang), derefter over **overgangen** (kørebanebredde × e ÷ hældningen) fortsætter den yderste kørebane med at dreje, indtil hele vejen hælder med e indad; to tredjedele af overgangen ligger før kurven og en tredjedel på den. Efter kurven sker det samme i omvendt rækkefølge.
- En skulder på den lave side er aldrig fladere end sin kørebane; på den høje side beholder den sin egen hældning (den ruller over).
- Tabellen under den viser hver kurves radius, sats, overgang og udløb samt hvor fuld overhøjde begynder og slutter. **Overhøjdediagrammet** tegner tværfaldet for begge kørebaner langs stationerne (venstre kørebane som fuld linje, højre som stiplet).
- En kurve, der er for kort til at nå fuld overhøjde, eller to kurver, hvis overgange overlapper, meldes i en boks over tabellen.

Snit, mængder, 3D-visningen og arkene viser alle den hældende vej. Hver ændring er ét trin: {{key:Mod+Z}} fortryder den.

## Mål

Et mål flytter ét punkt på ét vejsidet til en linje: **Kant af kørebane** eller **Skulderkant**, på **Venstre** eller **Højre**. Hvert snit møder linjen vinkelret på midterlinjen og går kun ud på den side, så et mål på højre side aldrig flytter venstre side.

| Angiver | Hvad sker, hvor et snit møder linjen |
|---|---|
| **Bredde** | Punktet ligger på linjen: kørebanen (eller skulderen) bliver bredere eller smallere til den og beholder sit tværfald. |
| **Kote** | Punktet får linjens kote dér, i sin egen forskydning: kørebanens (eller skulderens) tværfald følger efter. |

Linjen kan være en feature-linje (uanset dens **Anvendelse**) eller en linje fra en anden korridor: dens midterlinje, kanter af kørebane, skulderkanter eller dagslinjer. En korridors linje følger den korridor: ændr den anden vej, og denne følger med. CivilCraft bygger den anden korridor først; to korridorer, der ville pege på hinanden i en løkke, afvises på den ene side, og tabellen siger hvilken.

1. Vælg tracéet og slå dets korridor til.
2. Under **Mål** klik på {{ui:Tilføj et mål}}.
3. Vælg **Side**, **Punkt**, hvad det **Angiver** og **Til linjen**. Hver ændring er ét fortrydelsestrin.

**Resultat** angiver ved hvor mange snit linjen blev nået. Snit, der ikke når den (ud over dens ender, eller hvor den ligger bag midterlinjen), beholder tværsnittets værdier. En slettet linje efterlader korridoren, som den var før målet, og tabellen siger det. Den ene side kan have én bredde- og én kotemål for hvert punkt.

## Byg hver side af dele

Slå **Byg hver side af dele** til under korridorens indstillinger. Hver side har så sin egen liste, fra midterlinjen og udad: kørebaner, en skulder, en rendesten, en kantsten, et beplantningsbælte, et fortov og til sidst sideskråningen ned til terrænet (med egne skære- og fyldforhold). Start fra {{ui:Landevej}} eller {{ui:Bygade}}, tilføj og fjern dele, flyt dem med pilene, og {{ui:Kopiér}} den ene side til den anden. Hver ændring er ét fortrydelsestrin.

Et tværfald er faldet væk fra vejen, så et fortov, der leder vand mod vejen, har negativt fald. En kantsten er en flade med den højde du angiver, en top med den bredde du angiver og et valgfrit fald på bagsiden. Overhøjde vender alle kørebaner i første række; rendestenen, kantstenen, bæltet og fortovet hænger fra kanten af kørebanerne som bygget. Mål flytter stadig enden af kørebanerne og den sidste del. Tværsnit markerer rendestenens flowlinje, kantstenens top og bagside og resten. På en kurve med overgangskurver er overgangen selve spiralen: vandret tværfald ved TS, fuld overhøjde ved SC.

## Belægningslag

En kørebane, skulder, rendesten, beplantningsbælte eller et fortov kan bære sin opbygning: under delen tilføjer {{ui:Tilføj et lag}} et lag med et navn, et materiale, en tykkelse og dets type (slidlag, bindlag, bærelag, forbærelag, underbundslag eller andet), ovenfra og ned. Lagene flytter ikke vejens overflade (dens top er den projekterede overflade); hvert lag ligger under sin del, og dets dybde måles lodret nedad. Tværsnit tegner hvert lags underside som en stiplet linje, og {{ui:Belægningslag: mængder}} lister planareal og volumen for hvert lag (areal langs korridoren fra dens snit, volumen = areal × tykkelse). IFC-eksporten skriver hvert lag som sit eget element med dets tykkelse og materiale (se [IFC-eksport og -import](topic:ifc)). Den tykkelse du indtaster, er din: CivilCraft dimensionerer ikke belægninger.

## Hvor veje møder veje, plateauer og stier

Med {{ui:Forbind de veje og plateauer, den møder}} slået til (det er slået til for hver korridor), forbinder CivilCraft en korridor med det, den møder i planen:

- **En vej, der ender på en anden vej** (tracéets ende ligger på den anden vej eller inden for ca. halvdelen af sin egen kørebanebredde fra denne vejs kant) er sidevejen i et kryds. Den vej, den møder, åbner sin kant for sidevejens kørebane: over munningen lægges skulder, kantsten, bælte og fortov på kørebanens tværfald og tegnes som belægning. Sidevejen lægges på hovedvejens overflade, hvor de to overlapper, og jævnes op eller ned til den over tilkørslen.
- **To veje, der krydser hinanden**, forbindes på samme måde på begge sider. Den vej, der står først under Tracéer, er gennemkørselsvejen; den anden følger dens overflade over krydset.
- **En vej, der ender ved et plateau** (inde i det, eller inden for ca. halvdelen af sin kørebanebredde fra dets kant) når plateauets kote og jævnes til den over tilkørslen.
- **En sti** (Landskab › Befæstelse) stopper ved vejens yderkant, i højde med fortovet eller skulderen dér, i stedet for at ligge over vejen. En sti, der krydser en vej, bliver til to stykker. En ende, der er tegnet lidt for kort fra en vej (inden for det dobbelte af stiens bredde), føres videre til dens kant.

**Egenskaber** viser, hvad hver korridor forbandt, med hvor meget den blev hævet eller sænket dér og over hvilken længde. Den længde er det største af 10 m (30 ft) og tyve gange ændringen, og aldrig mere end 45 % af korridoren. **Det projekterede længdeprofil ændres ikke**: længdeprofilvisningen viser stadig den linje med fald, du tegnede, mens snit, den projekterede overflade, mængderne og 3D-visningen viser vejen som forbundet. For at gøre forbindelsen eksakt ved projektering, flyt den sidste PVI til den kote, som Egenskaber angiver.

Slå kontakten fra på en korridor for at lade den være præcis, som dens profil og tværsnit siger; den deltager så ikke i noget kryds, hverken som sidevej eller gennemkørselsvej. Veje, der møder hinanden næsten i linje (under ca. 20°), lades være, ligesom spor.

Hvad et kryds ikke gør endnu: der er ingen kantstensradier (hjørnerne er firkantede), ingen svingbaner eller øer, sidevejens ende skæres vinkelret på dens eget tracé, og en korridor bygget af skabeloner åbner sin kant på samme enkle måde (en grøft eller mur i dens endebetingelse udjævnes over munningen, uden rørpassage). For kantstensradier i plan, sigtetrekanter og afmærkning, se [Jord, veje, opmåling, miner og forbindelser](topic:soils-roads-survey-mines-links).

## Ikke lavet endnu

Mål for dagslinjens skråning er endnu ikke tilgængelige. For en korridor, der ændrer sig langs vejen, med venstre og højre adskilt, brug [Korridorskabeloner](topic:corridor-templates). Se [Ikke lavet endnu](topic:not-built-yet).
