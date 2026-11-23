---
title: Feie en veikorridor
summary: Slå på en korridor for en veglinje, angi verdier for kjørefelt, skulder og sideskråning, og les tverrprofilene, dagslinjene og jordarbeidene den gir.
keywords: kryss, skjæring, vei møter vei, sideveg, T-kryss, kryssing, byggeplatenivå, sammenkobling, koble til, overhøyde, super, skråstilling, overgang, utløp, satstabell, tverrfall, rotasjon, korridor, sammenstilling, underelement, typisk tverrprofil, vei, kjørefelt, skulder, tverrfall, sideskråning, dagslinje, skjæring, fylling, tverrprofiler, mål, bredde-mål, høyde-mål, forskyvningsmål, utvidelse, kant av kjørebane, følg en annen korridor
from: 6dcb92b3
---

En korridor feier ett enkelt typisk tverrprofil (en sammenstilling) langs en veglinje og dens prosjekterte lengdeprofil, former resultatet inn i eksisterende terreng og legger det til den prosjekterte terrengmodellen. En veglinje kan ha flere korridorer på ulike profilnummerintervaller, og en korridor kan bygges fra gjenbrukbare maler etter profilnummer ([Korridormaler](topic:corridor-templates)). Den enkle sammenstillingen under er lik på begge sider; for å gi hver side egne deler, se [Bygg hver side av deler](topic:corridor#build-each-side-from-parts).

## Sammenstillingen

Fra senterlinjen og utover, på hver side:

1. et **kjørefelt** med gitt bredde, som faller bort fra veikronen med **kjørefelt-tverrfallet**
2. en **skulder** med gitt bredde og **skulder-tverrfall**
3. en **sideskråning** fra skulderkanten til der den møter terrenget: **skjæringsskråningen** der terrenget er over, **fyllingsskråningen** der det er under

Startverdiene er plassholdere, ikke en prosjekteringsnorm:

| Verdi | US-fot | Meter |
|---|---|---|
| Kjørefeltbredde | 12 ft | 3.6 m |
| Kjørefelt-tverrfall | 2% | 2% |
| Skulderbredde | 4 ft | 1.2 m |
| Skulder-tverrfall | 4% | 4% |
| Skjæringsskråning | 2 : 1 | 2 : 1 |
| Fyllingsskråning | 3 : 1 | 3 : 1 |
| Tverrprofil hver | 10 ft | 5 m |

Sideskråninger angis som horisontalt til vertikalt (H:V): 3 : 1 betyr 3 horisontalt for 1 vertikalt.

## Bygg korridoren

Du trenger en veglinje uten feil og et prosjektert lengdeprofil med minst to PVI-er og uten feil.

1. Velg veglinjen.
2. I høyre panel, under **Korridor**, kryss av for **Feie en sammenstilling langs det prosjekterte lengdeprofilet**.
   Feltene vises, og korridoren bygges med én gang. Planen viser kantene for kjørefelt og skulder og dagslinjene; med {{ui:Proposed (graded)}} valgt under **Vis** viser høydekurvene det nye terrenget.
3. Endre en hvilken som helst verdi: **Kjørefeltbredde**, **Kjørefelt-tverrfall**, **Skulderbredde**, **Skulder-tverrfall**, **Skjæringsskråning**, **Fyllingsskråning**, **Tverrprofil hver**. Trykk {{key:Enter}} etter hver. Skjæring, fylling og avstand mellom tverrprofiler må være større enn 0.
4. Les linjen under feltene, for eksempel «39 tverrprofiler fra 0+00.00 til 3+86.36; skjæring 240.2 cu yd, fylling 556.0 cu yd.»

Tverrprofiler legges ved hvert trinn i **Tverrprofil hver**, ved endene, og ved start og slutt på hver horisontal- og vertikalkurve. Hvert tverrprofil og linjene gjennom dem (senterlinje, kanter for kjørefelt og skulder, dagslinje) blir bruddlinjer i den prosjekterte terrengmodellen.

For å slå av korridoren, fjern avkryssingen. Verdiene beholdes til neste gang.

## Når den ikke bygges

En rød boks under feltene forklarer hvorfor:

| Melding | Hva du gjør |
|---|---|
| «Korridoren trenger et prosjektert lengdeprofil uten feil.» | Legg til PVI-er, eller rett overlappende vertikalkurver (se [Prosjekter et vertikalt lengdeprofil](topic:profile)). |
| «Det prosjekterte lengdeprofilet overlapper ikke veglinjen.» | Flytt PVI-ene inn i veglinjens profilnummerintervall. |
| «Korridoren trenger minst to tverrprofiler på terrengmodellen.» | Mesteparten av korridoren ligger utenfor eksisterende terreng. |
| «4 sideskråninger går utenfor terrengmodellen før de møter terrenget.» | Nær kanten av terrengmodellen kan ikke skråningen nå terrenget. Hold veien unna kanten, eller senk fyllings- eller skjæringshøyden der. |
| «Korridorens dagslinjer krysser hverandre (tverrprofiler overlapper, for eksempel på innsiden av en skarp kurve). Bruk større radius eller smalere sammenstilling.» | Tverrprofiler på innsiden av en skarp kurve overlapper. Øk radiusen eller gjør sammenstillingen smalere. |

En korridor med et problem formes ikke inn i terrenget og telles ikke i jordarbeidene.

## Korridorer og byggeplater sammen

Den prosjekterte terrengmodellen bygges i rekkefølge: først alle korridorer, deretter alle byggeplater. Der terrengformingen til en byggeplate overlapper en korridor, vinner byggeplaten. Der et senere element overlapper en veg, erstattes bare den delen av veien som ligger innenfor det senere elementets dagslinje; resten av veien, og eventuelle terrengbruddlinjer veien krysser, beholder sin form. Volumene beregnes innenfor alle dagslinjene samlet; se [Jordarbeidsvolumer](topic:volumes).

## Overhøyde

Gjennom en kurve kan veien helle innover, slik at trafikken presses mindre utover. Kryss av for **Gi overhøyde i kurvene** under **Overhøyde** i veglinjens **Egenskaper**:

- Hver sirkelformede kurve får en sats **e** fra satstabellen: den første raden kurvens radius når (en rad med tom sats beholder normal veikrone). Tabellen og **Største relative stigning** (0.5 % til å begynne med) er plassholdere, ikke en norm: sett dem ut fra egne prosjekteringskriterier. Legg til eller fjern rader etter behov.
- Kjørefeltene roterer om senterlinjen. Før kurven flater det ytre kjørefeltet ut over **utløpsstrekningen** (normal veikrone ÷ e × overgangsstrekning), deretter over **overgangsstrekningen** (kjørefeltbredde × e ÷ stigningen) fortsetter det ytre kjørefeltet å dreie til hele veien heller med e innover; to tredeler av overgangsstrekningen ligger før kurven og en tredel på den. Etter kurven skjer det samme, bare omvendt.
- En skulder på lavsiden er aldri flatere enn kjørefeltet sitt; på høysiden beholder den egen helning (den ruller over).
- Tabellen under viser radius, sats, overgangsstrekning og utløpsstrekning for hver kurve, og hvor full overhøyde starter og slutter. **Overhøydediagrammet** tegner tverrfallet for begge kjørefelt langs profilnumrene (venstre kjørefelt heltrukket, høyre stiplet).
- En kurve som er for kort til å nå full overhøyde, eller to kurver der overgangene overlapper, meldes i en boks over tabellen.

Tverrprofiler, volumer, 3D-visningen og arkene viser alle den skråstilte veien. Hver endring er ett steg: {{key:Mod+Z}} angrer den.

## Mål

Et mål flytter ett punkt på ene siden av veien til en linje: **Kjørebanekant** eller **Skulderkant**, på **Venstre** eller **Høyre** side. Hvert tverrprofil møter linjen i rett vinkel på senterlinjen og går ut bare på den siden, så et mål til høyre flytter aldri venstre side.

| Setter | Hva skjer der et tverrprofil møter linjen |
|---|---|
| **Bredde** | Punktet ligger på linjen: kjørefeltet (eller skulderen) utvides eller smalnes inn til den, og beholder tverrfallet sitt. |
| **Høyde** | Punktet får linjens høyde der, i sin egen forskyvning: kjørefeltets (eller skulderens) tverrfall følger etter. |

Linjen kan være en formlinje (uansett **Bruk**) eller en linje fra en annen korridor: dens senterlinje, kjørebanekanter, skulderkanter eller dagslinjer. En korridors linje følger den korridoren: endrer du den andre veien, følger denne med. CivilCraft bygger den andre korridoren først; to korridorer som ville sikte mot hverandre i en løkke, avvises på den ene siden, og tabellen sier hvilken.

1. Velg veglinjen og slå på korridoren.
2. Under **Mål** klikker du {{ui:Legg til et mål}}.
3. Velg **Side**, **Punkt**, hva det **Setter** og **Til linjen**. Hver endring er ett angrestegg.

**Resultat** sier ved hvor mange tverrprofiler linjen ble nådd. Tverrprofiler som ikke når den (utenfor endene, eller der den ligger bak senterlinjen) beholder sammenstillingens verdier. En linje som slettes, lar korridoren stå slik den var før målet, og tabellen sier det. En side kan ha ett bredde-mål og ett høyde-mål for hvert punkt.

## Bygg hver side av deler

Slå på **Bygg hver side av deler** under korridorens innstillinger. Hver side får da sin egen liste, fra senterlinjen og utover: kjørefelt, en skulder, en rennestein, en kantstein, et grøntbelte, et fortau og til slutt sideskråningen ned til terrenget (med egne skjærings- og fyllingsforhold). Start fra {{ui:Landeveg}} eller {{ui:Bygate}}, legg til og fjern deler, flytt dem med pilene, og bruk {{ui:Kopier}} for å kopiere den ene siden til den andre. Hver endring er ett angrestegg.

Et tverrfall er fallet bort fra veien, så et fortau som drenerer mot veien, får negativt fortegn. En kantstein er en flate med høyden du gir, en topp med bredden du gir og et valgfritt fall på baksiden. Overhøyde dreier alle kjørefelt i første rad; rennesteinen, kantsteinen, grøntbeltet og fortauet henger fra kanten av kjørefeltene slik de er bygget. Mål flytter fortsatt enden av kjørefeltene og den siste delen. Tverrprofiler markerer rennesteinens flytlinje, topp og bakside av kantstein, og resten. I en kurve med overgangskurver er overgangsstrekningen selve overgangskurven: jevn veikrone ved TS, full overhøyde ved SC.

## Overbygningslag

Et kjørefelt, en skulder, en rennestein, et grøntbelte eller et fortau kan ha sin egen oppbygging: under delen legger {{ui:Legg til et lag}} til et lag med navn, materiale, tykkelse og type (slitelag, bindlag, bærelag, forsterkningslag, planumsforbedring eller annet), fra topp og ned.

Lagene flytter ikke veiens overflate (toppen er den prosjekterte flaten); hvert lag ligger under sin del, og dybden måles rett ned. Tverrprofiler tegner underkanten av hvert lag som en stiplet linje, og {{ui:Overbygningslag: mengder}} lister planarealet og volumet for hvert lag (areal langs korridoren fra tverrprofilene, volum = areal × tykkelse). IFC-eksporten skriver hvert lag som sitt eget element med tykkelse og materiale (se [IFC-eksport og -import](topic:ifc)). Tykkelsen du skriver inn, er din egen: CivilCraft dimensjonerer ikke veioppbygning.

## Der veier møter veier, byggeplater og stier

Med {{ui:Koble sammen veiene og byggeplatene den møter}} på (den er på for alle korridorer), kobler CivilCraft en korridor til det den møter i planen:

- **En veg som ender på en annen veg** (veglinjens ende ligger på den andre veien, eller innenfor omtrent halve sin egen kjørebanebredde fra kanten av den veien) er sideveg i et kryss. Veien den møter åpner sin kant for sidevegens kjørebane: over munningen legges skulder, kantstein, grøntbelte og gangvei på kjørefeltets tverrfall og tegnes som kjørebane. Sideveien legges på hovedvegens overflate der de to overlapper, og jevnes opp eller ned til den over tilnærmingen.
- **To veier som krysser** kobles på samme måte på begge sider. Veien som står først under Veglinjer, er gjennomgående veg; den andre følger overflaten over krysset.
- **En veg som ender ved en byggeplate** (inne i den, eller innenfor omtrent halve kjørebanebredden fra kanten) kommer til byggeplatens nivå og jevnes til det over tilnærmingen.
- **En sti** (Landskap › Harde flater) stopper ved veiens ytterkant, i nivå med gangveien eller skulderen der, i stedet for å ligge over veien. En sti som krysser en veg, blir to deler. En ende som er tegnet litt kort av en veg (innenfor to ganger stiens bredde), føres videre til kanten.

**Egenskaper** viser hva hver korridor koblet til, hvor mye den ble hevet eller senket der, og over hvilken lengde. Den lengden er det største av 10 m (30 ft) og tjuegangers endringen, og aldri mer enn 45 % av korridoren. **Det prosjekterte lengdeprofilet endres ikke**: lengdeprofilvisningen viser fortsatt stigningslinjen du tegnet, og tverrprofilene, den prosjekterte terrengmodellen, volumene og 3D-visningen viser veien slik den er koblet. For å gjøre koblingen eksakt ved prosjektering, flytt siste PVI til nivået Egenskaper oppgir.

Slå av bryteren på en korridor for å la den stå akkurat slik lengdeprofilet og sammenstillingen sier; den deltar da ikke i noe kryss, verken som sideveg eller gjennomgående veg. Veier som møtes nesten på linje (under omtrent 20°) røres ikke, og det samme gjelder spor.

Dette gjør ikke et kryss ennå: det finnes ingen kantsteinsavrundinger (hjørnene er rettvinklede), ingen svingefelt eller trafikkøyer, sidevegens ende kuttes rett på sin egen veglinje, og en korridor bygget fra maler åpner kanten sin på samme enkle måte (en grøft eller mur i sin endetilstand jevnes over munningen, uten kulvert). For kantsteinsavrundinger i plan, siktrekanter og oppmerking, se [Jord, veier, oppmåling, gruver og lenker](topic:soils-roads-survey-mines-links).

## Ikke bygget ennå

Mål for dagslinjens skråning er ikke tilgjengelig ennå. For en korridor som endrer seg langs veien, med venstre og høyre side adskilt, bruk [Korridormaler](topic:corridor-templates). Se [Ikke bygget ennå](topic:not-built-yet).
