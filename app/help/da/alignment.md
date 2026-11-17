---
title: "Læg et vandret tracé ud"
summary: "Tegn et tracé ud fra dets PI'er, sæt kurveradier og startstation, flyt PI'er, og læs kurvedata samt station og forskydning."
keywords: tracé, ingen løsning, kurve passer ikke, største radius, mindste radius, minimumsradius, designhastighed, overlap, centerlinje, PI, vandret kurve, radius, stationering, tangent, opret tracé, tracélayout, PC, PT, station forskydning
from: 8c5df4aa
---

Et tracé i CivilCraft er en kæde af tangenter gennem skæringspunkter (PI'er), med en cirkelbue i ethvert indre PI der har en radius. Det er stationeret fra en startstation du vælger. Et projekt kan indeholde mange tracéer.

## Tegn tracéet

1. Tryk på {{key:A}}, eller klik på {{ui:Tracé}} i gruppen **Design**.
   Hintet siger »Tracé: klik PI'erne i rækkefølge. Enter eller dobbeltklik afslutter, Backspace fjerner den sidste, Esc annullerer.«
2. Klik på det første PI (tracéets start).
3. Klik på hvert efterfølgende PI i rækkefølge. En rød linje følger markøren og viser længden og retningen på den tangent du tegner, for eksempel »212.40 ft  N 63°12'05" E«.
4. Klik på det sidste PI (tracéets slutning).
5. Tryk på {{key:Enter}}.
   Tracéet tegnes med stationering og er valgt. Statuslinjen siger for eksempel »Tracé 1: 386.36 ft, kurver med 100 ft radius hvor de passer. Ret radier i Egenskaber; Længdeprofil (R) til at designe dets fald.«

Under tegning: {{key:Backspace}} fjerner det sidste PI, {{key:Esc}} annullerer, og træk på tomt område panorerer uden at tilføje et PI.

:::warning
Afslut med {{key:Enter}}. Dobbeltklik afslutter også, men i denne build fjerner det PI'et du dobbeltklikkede på. Klik en gang på det sidste PI, og tryk derefter på {{key:Enter}}.
:::

Hvert indre PI får en kurve på 100 ft (30 m i et meterprojekt), eller den største hele radius der passer i halvdelen af hver tangent, hvis 100 ft ikke passer. Meget skarpe PI'er, og PI'er der ligger lige igennem, får ingen kurve.

## Sæt radier og koordinater

Med tracéet valgt viser højre panel **Tracé**:

1. **Navn** og **Startstation**. Skriv en station som `10+00` (fod) eller `0+500` (meter), eller som et helt tal. Se [Enheder, stationer og talformater](topic:units-and-stations).
2. **Længde** og **Slutstation** beregnes for dig.
3. Tabellen **PI'er** viser hvert PI's **Øst** og **Nord**, og en **Radius** for hvert indre PI. Skriv en ny værdi og tryk på {{key:Enter}}.
   - En radius på 0 giver et knækpunkt uden kurve.
   - Første og sidste PI får aldrig en radius.
   - Det lille x i enden af en række fjerner det PI (et tracé har mindst to).
4. Læs listen **Kurver**: for hver kurve dens PC- og PT-stationer, radius R, drejningsvinkel Δ og retning (venstre eller højre), længde L, tangent T, ydre E og korde.
5. Linjen under kurverne giver retningen af den første tangent.

## Når en kurve ikke passer

Hvis kurverne behøver mere tangent end der er mellem deres PI'er, har tracéet ingen løsning: det tegnes ikke korrekt før du retter det, og det udelades af LandXML-eksport. En rød boks siger hvorfor, med tal, og tilbyder hvad der ville passe:

- »Kurverne ved PI 2 og PI 3 kræver 240.00 ft tangent mellem sig (130.00 + 110.00), men PI'erne ligger 180.00 ft fra hinanden.« — eller, når kun én af dem har en kurve, »Kurven ved PI 2 kræver 240.00 ft tangent mod PI 1 …«.
- En knap for hvert PI sætter **den største radius der passer** der, med den anden kurve som den er (den skal også passe til PI'ets anden tangent). Hvor begge PI'er har kurver, krymper **Begge** de to radier forholdsmæssigt, så de lige netop mødes.
- Når én kurve alene er længere end tangenten, siger boksen at ingen kurve ved det andet PI kan passe, mens den er så stor.
- Et PI der drejer lige tilbage kan ikke få en kurve; boksen tilbyder **Ingen kurve ved PI n**.

Hver knap er ét trin: {{key:Mod+Z}} sætter radierne tilbage. Tilbudte radier afrundes nedad til 0.01, så de altid passer.

### En minimumsradius for designet

Skriv en **Mindste designradius** (for eksempel ud fra din designhastighed) for at få hver kurve kontrolleret mod den; lad feltet stå tomt for ingen. En kurve under den vises med en knap til **den mindste radius der opfylder minimum**, når den radius passer. Passer den ikke, siger boksen det og giver den største radius tangenterne tillader, så du ved at du skal flytte et PI eller sænke minimum.

## Flyt PI'er på planen

1. Med {{ui:Vælg}} aktivt klikker du på tracéet for at vælge det. Firkantede greb vises ved dets PI'er.
2. Træk et greb. Tracéet, dets stationering, længdeprofil og korridor følger med.
3. Slip. Flytningen er ét fortrydelsestrin.

At tilføje et PI mellem to eksisterende er ikke tilgængeligt endnu: slet tracéet og tegn det igen, eller skriv nye koordinater for de PI'er du har.

## Læs station og forskydning

Flyt markøren hen over planen. Statuslinjen viser det nærmeste tracé (eller det valgte) med station og forskydning, **V** eller **H** set op ad stationeringen, for eksempel »Tracé 1: Sta 2+15.30, forskydning 18.42 H«. Ud over en af enderne tilføjes »(ud over enden)«.

## Hvad der tegnes

På planen, i DXF og i PDF: centerlinjen (tangenter som linjer, kurver som rigtige buer), et mærke hver 50 ft (20 m) med et længere mærke og en stationsetiket hver 100 enheder, og PC- og PT-mærker med deres stationer som etiket.

## Slet et tracé

Vælg det og tryk på {{key:Delete}}, eller klik på {{ui:Slet}} i værktøjslinjen eller nederst i højre panel. Dets længdeprofil og korridor går med. {{key:Mod+Z}} bringer det tilbage.

:::mac
På et Mac-tastatur er tasten mærket **delete** i browseren {{key:Backspace}} og sletter ikke et valg. Tryk på {{key:Delete}} (Fn og delete), eller brug knappen {{ui:Slet}}.
:::

## Næste

- [Design en lodret længdeprofil](topic:profile).

## Designhastighed og klasse

Under tracéets Egenskaber gemmes **Designhastighed** (km/h eller mph) og **Designklasse** sammen med tracéet, gemmes i projektet og skrives til IFC (Pset_RoadDesignCriteriaCommon). CivilCraft har ingen tabel der knytter en hastighed til en minimumsradius, så intet kontrolleres ud fra dem: sæt **Mindste radius** ud fra din egen designstandard.

## Spiraler

En kurve kan have en klothoide-overgangskurve i hver ende: tangent, overgangskurve, kurve, overgangskurve, tangent. I PI-tabellen skriver du en længde i **Overgangskurve ind** og **Overgangskurve ud** for et PI der har en radius. PI'et bliver liggende; kurven flytter sig ind for at skabe plads, så tangentafstanden vokser med overgangskurvens forskydning. De to længder kan være forskellige, og et PI med kun én længde får en overgangskurve i den ende alene.

Kurvelisten viser så TS, SC, CS og ST (tangent til overgangskurve, overgangskurve til kurve, kurve til overgangskurve, overgangskurve til tangent) med overgangskurvens vinkel θs, tangentafstandene og den ydre afstand. Stationer løber langs overgangskurverne ligesom ellers. Overgangskurver der tilsammen drejer mere end kurven, afvises med PI'et navngivet; en overgangskurve længere end tangenten tillader er et overlap, som for enhver kurve. Overhøjde bruger overgangskurven som sin udløbsstrækning (se [Korridor](topic:corridor)).
