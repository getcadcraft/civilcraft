---
title: Sveip en veikorridor
summary: Slå på en korridor for en veglinje, angi verdier for kjørefelt, skulder og sideskråning, og les snittene, dagslinjene og jordarbeidene den lager.
keywords: overhøyde, super, skråstilling, overgang, utløp, satstabell, tverrfall, rotasjon, korridor, sammenstilling, delsammenstilling, typisk tverrprofil, vei, kjørefelt, skulder, tverrfall, sideskråning, dagslinje, skjæring, fylling, snitt, mål, mål, breddemål, høydemål, forskyvningsmål, utvidelse, kant av kjørebane, følg en annen korridor
from: 91303189
---

En korridor sveiper ett enkelt typisk tverrprofil (en sammenstilling) langs en veglinje og dens prosjekteringsprofil, tilpasser det til det eksisterende terrenget og legger resultatet til den prosjekterte terrengmodellen. En veglinje kan ha flere korridorer på ulike stasjonsområder, og en korridor kan bygges av gjenbrukbare maler etter stasjon ([Korridormaler](topic:corridor-templates)). Den enkle sammenstillingen nedenfor er lik på begge sider. For å gi hver side sine egne deler, se [Bygg hver side av deler](topic:corridor#build-each-side-from-parts).

## Sammenstillingen

Fra senterlinjen utover, på hver side:

1. et **kjørefelt** med en gitt bredde, som faller bort fra kronen med **kjørefeltshelningen**
2. en **skulder** med en gitt bredde ved **skulderhelningen**
3. en **sideskråning** fra skulderkanten til der den møter terrenget: **skjæringshelningen** der terrenget er over, og **fyllingshelningen** der det er under

Startverdiene er plassholdere, ikke en prosjekteringsstandard:

| Verdi | US feet | Meter |
|---|---|---|
| Kjørefeltbredde | 12 ft | 3.6 m |
| Kjørefeltshelning | 2 % | 2 % |
| Skulderbredde | 4 ft | 1.2 m |
| Skulderhelning | 4 % | 4 % |
| Skjæringshelning | 2 : 1 | 2 : 1 |
| Fyllingshelning | 3 : 1 | 3 : 1 |
| Snitt hver | 10 ft | 5 m |

Sideskråninger angis horisontalt til vertikalt (H:V): 3 : 1 betyr 3 horisontalt for 1 vertikalt.

## Bygg korridoren

Du trenger en veglinje uten feil og en prosjekteringsprofil med minst to PVI-er og uten feil.

1. Velg veglinjen.
2. I høyre panel, under **Korridor**, kryss av **Sveip en sammenstilling langs prosjekteringsprofilen**.
   Feltene vises, og korridoren bygges med én gang. Planen viser kantene av kjørefelt og skulder og dagslinjene. Med {{ui:Prosjektert (formet)}} valgt under **Visning** viser kurvene den nye terrengmodellen.
3. Endre en verdi: **Kjørefeltbredde**, **Kjørefeltshelning**, **Skulderbredde**, **Skulderhelning**, **Skjæringshelning**, **Fyllingshelning** eller **Snitt hver**. Trykk {{key:Enter}} etter hver. Skjæring, fylling og snittavstand må være mer enn 0.
4. Les linjen under feltene, for eksempel «39 snitt fra 0+00.00 til 3+86.36; skjæring 240.2 cu yd, fylling 556.0 cu yd».

Snitt tas ved hvert **Snitt hver**-steg, ved endene, og ved start og slutt på hver horisontal- og vertikalkurve. Hvert snitt og linjene gjennom dem (senterlinjen, kantene av kjørefelt og skulder, dagslinjen) blir bruddlinjer i den prosjekterte terrengmodellen.

Slå av korridoren ved å fjerne krysset i boksen. Verdiene beholdes til neste gang.

## Når den ikke bygges

En rød boks under feltene sier hvorfor:

| Melding | Hva du gjør |
|---|---|
| «Korridoren trenger en prosjekteringsprofil uten feil.» | Legg til PVI-er, eller rett opp overlappende vertikalkurver (se [Tegn en vertikalprofil](topic:profile)). |
| «Prosjekteringsprofilen overlapper ikke veglinjen.» | Flytt PVI-ene inn i veglinjens stasjonsområde. |
| «Korridoren trenger minst to snitt på terrengmodellen.» | Det meste av korridoren er utenfor det eksisterende terrenget. |
| «4 sideskråninger går ut av terrengmodellen før de møter terrenget.» | Nær kanten av terrengmodellen kan ikke skråningen nå terrenget. Hold veien unna kanten, eller senk fyllings- eller skjæringshøyden der. |
| «Korridorens dagslinjer krysser hverandre (snitt overlapper, for eksempel på innsiden av en skarp kurve). Bruk en større radius eller en smalere sammenstilling.» | Snitt på innsiden av en skarp kurve overlapper. Øk radiusen eller gjør sammenstillingen smalere. |

En korridor med et problem formes ikke inn i terrenget og teller ikke i jordarbeidene.

## Korridorer og byggeplater sammen

Den prosjekterte terrengmodellen bygges i rekkefølge: først alle korridorer, deretter alle byggeplater. Der formingen av en byggeplate overlapper en korridor, vinner byggeplaten. Volumene regnes ut innenfor alle dagslinjene samlet; se [Jordarbeidsvolumer](topic:volumes).

## Overhøyde

Gjennom en kurve kan veien helle mot innsiden, slik at trafikken presses mindre mot utsiden. Kryss av **Overhøy kurvene** under **Overhøyde** i veglinjens **Egenskaper**:

- Hver sirkelkurve får en sats **e** fra satstabellen: den første raden hvis radius kurven når. En rad med tom sats beholder vanlig tverrfall. Tabellen og **Maks relativ stigning** (0.5 % til å begynne med) er plassholdere, ikke en standard: sett dem etter dine egne prosjekteringskrav. Legg til eller fjern rader etter behov.
- Kjørefeltene roteres om senterlinjen. Før kurven flater den ytre kjørefeltet ut over **utløpet** (normalt tverrfall ÷ e × utløpslengde), deretter over **overgangen** (kjørefeltbredde × e ÷ stigningen), og det ytre kjørefeltet fortsetter å dreie til hele veien heller med e mot innsiden. To tredeler av overgangen ligger før kurven, og en tredel på den. Etter kurven skjer det samme i motsatt rekkefølge.
- En skulder på lavsiden er aldri flatere enn kjørefeltet; på høysiden beholder den sin egen helning (den ruller over).
- Tabellen under lister hver kurves radius, sats, overgang og utløp, og hvor full overhøyde starter og slutter. **Overhøydediagrammet** tegner begge kjørefeltenes tverrfall langs stasjonene (venstre kjørefelt heltrukket, høyre stiplet).
- En kurve som er for kort til å nå full overhøyde, eller to kurver hvis overganger overlapper, meldes i en boks over tabellen.

Snitt, volumer, 3D-visningen og arkene viser alle den skrånende veien. Hver endring er ett trinn: {{key:Mod+Z}} angrer den.

## Mål

Et mål flytter ett punkt på én side av veien til en linje: **Kant av kjørebane** eller **Skulderkant**, på **Venstre** eller **Høyre**. Hvert snitt møter linjen rett på senterlinjen, og går bare ut på den siden. Et mål på høyre side flytter dermed aldri venstre side.

| Setter | Hva som skjer der et snitt møter linjen |
|---|---|
| **Bredde** | Punktet ligger på linjen: kjørefeltet (eller skulderen) utvides eller smalnes til den, og beholder sitt tverrfall. |
| **Høyde** | Punktet tar linjens høyde der, i sin egen forskyvning: kjørefeltets (eller skulderens) tverrfall følger etter. |

Linjen kan være en formlinje (uansett **Bruk**) eller en linje fra en annen korridor: dens senterlinje, kanter av kjørebane, skulderkanter eller dagslinjer. En korridors linje følger den korridoren: endrer du den andre veien, følger denne med. CivilCraft bygger den andre korridoren først. To korridorer som ville målrettet hverandre i en løkke, nektes på den ene siden, og tabellen sier hvilken.

1. Velg veglinjen og slå på korridoren.
2. Under **Mål**, klikk {{ui:Legg til et mål}}.
3. Velg **Side**, **Punkt**, hva det **Setter** og **Til linjen**. Hver endring er ett angretrinn.

**Resultat** sier på hvor mange snitt linjen ble nådd. Snitt som ikke når den (forbi endene, eller der den er bak senterlinjen), beholder sammenstillingens verdier. En linje som slettes, etterlater korridoren slik den var før målet, og tabellen sier det. En side kan ha ett bredde- og ett høydemål for hvert punkt.

## Bygg hver side av deler

Slå på **Bygg hver side av deler** under korridorens innstillinger. Hver side får da sin egen liste, fra senterlinjen utover: kjørefelt, en skulder, en renne, en kantstein, et plantebelte, et fortau og til slutt sideskråningen til terrenget (med sine egne skjærings- og fyllingsforhold). Start fra {{ui:Landeveg}} eller {{ui:Bygate}}, legg til og fjern deler, flytt dem med pilene, og {{ui:Kopier}} den ene siden til den andre. Hver endring er ett angretrinn.

Et tverrfall er fallet bort fra veien, så et fortau som drenerer mot veien er negativt. En kantstein er en flate med høyden du angir, en topp med bredden du angir og eventuelt et fall på baksiden. Overhøyde snur alle kjørefelt i den første raden. Renne, kantstein, plantebelte og fortau henger fra kanten av kjørefeltene slik de er bygget. Mål flytter fortsatt enden av kjørefeltene og den siste delen. Tverrsnitt markerer rennebunnen, toppen og bakre kant av kantsteinen, og resten. I en kurve med spiraler er overgangen spiralen: flatt tverrfall ved TS, full overhøyde ved SC.

## Overbygningslag

Et kjørefelt, en skulder, en renne, et plantebelte eller et fortau kan ha sin oppbygging. Under delen legger {{ui:Legg til et lag}} til et lag med navn, materiale, tykkelse og type (overflate, bindlag, bærelag, forsterkningslag, frostsikring eller annet), ovenfra og ned. Lagene flytter ikke veiens overflate (toppen er den prosjekterte overflaten). Hvert ligger under sin del, og dybden måles rett ned. Tverrsnitt tegner bunnen av hvert lag som en stiplet linje, og {{ui:Overbygningslag: mengder}} lister planarealet og volumet for hvert lag (areal langs korridoren fra snittene, volum = areal × tykkelse). IFC-eksporten skriver hvert lag som sitt eget element med tykkelse og materiale (se [IFC-eksport og -import](topic:ifc)). Tykkelsen du skriver, er din: CivilCraft dimensjonerer ikke overbygninger.

## Ikke bygget ennå

Mål for dagslinjens helning er ikke tilgjengelig ennå. For en korridor som endrer seg langs veien, med venstre og høyre side hver for seg, bruk [Korridormaler](topic:corridor-templates). Se [Ikke bygget ennå](topic:not-built-yet).
