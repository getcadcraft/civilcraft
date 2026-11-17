---
title: Läs höjdkurvor, höjder och lutningar
summary: Ställ in höjdkurvsintervall och huvudkurvor, visa höjdband, lutningspilar och trianglar och läs av markhöjder under pekaren.
keywords: höjdkurvor, höjdkurvsintervall, huvudkurvor, etiketter, höjdband, lutningspilar, trianglar, höjdkota, ytanalys, höjdanalys, lutningsanalys
from: 585e500a
---

Terrängmodellen visas med höjdkurvor så snart den finns. Allt i det här ämnet ställs in under **Visning** i den vänstra panelen. Visningsinställningar ändrar bara det du ser (och det som exporteras); de är inga ångra-steg.

## Ställ in höjdkurvsintervallet

1. Under **Visning** väljer du ett värde i **Höjdkurvor varje**.
   - I fot: 0.25, 0.5, 1, 2, 5, 10 eller 20 ft.
   - I meter: 0.1, 0.25, 0.5, 1, 2, 5 eller 10 m.
2. Välj **Huvudkurvor varje**: var 2:a, 4:e, 5:e eller 10:e höjdkurva.
   Huvudkurvor ritas tjockare och märks med sin höjd. De ligger på hela multiplar av huvudavståndet (med 1 ft höjdkurvor och var 5:e huvudkurva: 245, 250, 255 …).
3. Stäng av {{ui:Höjdkurveetiketter}} om etiketterna trängs på en liten utskrift.

Ett nytt projekt börjar på 1 enhet med var 5:e höjdkurva som huvudkurva. Höjdkurvor böjs vid brytlinjer; om de skär rakt tvärs över en flödeslinje eller en åskam är den linjen ännu inte en brytlinje (se [Bygg och förfina terrängmodellen](topic:build-surface)).

:::note
Höjdkurvor ritas bara när det finns högst 2,000 nivåer mellan lägsta och högsta punkt. På en tomt med mycket höjdskillnad och ett mycket litet intervall visar planen inga höjdkurvor alls: välj ett större intervall.
:::

## Jämna ut höjdkurvorna

Höjdkurvor ritas som räta delar, en över varje triangel i terrängmodellen, så de får en liten krök vid varje trianglkant. **Höjdkurvsutjämning** under **Visning** rundar av dessa hörn:

- **Ingen (räta delar)**: de ritade linjerna som de är. Så visas en ny eller äldre ritning.
- **Lätt**: hörnen rundas lite. En linje rör sig aldrig mer än 10 % av vägen mot nästa höjdkurva och aldrig längre från sin räta del än en sjättedel av delens längd.
- **Stark**: en flytande kurva. En linje rör sig aldrig mer än 25 % av vägen mot nästa höjdkurva och aldrig längre från sin räta del än en tredjedel av delens längd.

Med endera valet korsar en utjämnad höjdkurva fortfarande varje trianglkant i samma punkt som den räta, ligger kvar inom den triangel varje del korsar och kan därför aldrig korsa eller röra en annan höjdkurva. Där en höjdkurva korsar en brytlinje eller gränsen behåller den sin skarpa krök. De utjämnade linjerna är de som ritas ut och exporteras (DXF, DWG, PDF, GIS och 3D), med fler hörnpunkter än de räta linjerna.

Utjämning ändrar bara de ritade linjerna. Höjder, volymer, profiler och sektioner läses fortfarande av terrängmodellen själv. En höjdkurva som går exakt genom mätpunkter (en punkt på 250.00 på höjdkurvan 250) behåller en liten krök vid varje sådan punkt.

## Hur terrängmodellen bakom höjdkurvorna skapas

Höjdkurvorna följer terrängmodellen, och terrängmodellen följer **Höjdkurvemetod** under **Terrängmodell** i den vänstra panelen. Standardvalet, **Triangulering med linjär interpolation**, förbinder dina punkter till trianglar och behåller varje punkt och brytlinje exakt. De andra metoderna anpassar först ett regelbundet rutnät till punkterna (kriging, minimal krökning, naturlig granne, omvänt avstånd och fler), vilket ger rundare höjdkurvor mellan punkterna men inte går exakt genom varje punkt. Ytrapporten under **Terrängmodell** visar hur långt resultatet ligger från dina punkter.

**ABOS (approximation baserad på utjämning)** är en av de rutnätsbaserade metoderna. Den har två egna inställningar: **Mjukhet** (0.5 från början; lägre är jämnare) och **Noggrannhet** (1 från början: terrängmodellen förs inom 1 % av platsens höjdomfång i dina punkter; skriv ett mindre tal för en tätare anpassning). Om den inte kan nå noggrannheten på det rutnät den har, säger ytrapporten det: skriv ett mindre **Rutnätsavstånd**.

## Läs av höjd var som helst

För pekaren över planen. Statusfältet visar:

- **E** och **N** under pekaren
- **Mark** och befintlig markhöjd där, interpolerad på triangeln under pekaren
- **Planerad** och den projekterade höjden, där en byggplatta eller korridor har ändrat marken
- ”Utanför terrängmodellen” utanför terrängmodellen

Om du vill läsa av en mätpunkt exakt väljer du {{ui:Markera}} och klickar på punkten: den högra panelen visar dess nummer, östvärde, nordvärde, höjd, beskrivning och grupp.

## Visa höjdband

1. Bocka för {{ui:Höjdband}}.
   Terrängmodellen fylls med färg från låg (blågrön) till hög (ockerbrun). En förklaring under kryssrutorna listar varje bands höjdintervall.
2. Välj hur många band i **Band**: 5, 8, 10 eller 12. Banden delar intervallet från lägsta till högsta höjd i lika steg.

Band är bara till för att titta på. De exporteras inte till DXF och ritas inte ut till PDF.

## Visa lutningspilar

Bocka för {{ui:Lutningspilar}}. En kort pil på varje triangel som är tillräckligt stor för att rymma en pekar nedåt i lutningen. Plana trianglar får ingen pil. Pilarna är en snabb kontroll av avrinningsriktningen; lutningsvärdet självt märks inte ut ännu.

## Visa trianglar, punkter och kanter

- {{ui:Trianglar}} ritar TIN:ens kanter. Slå på den för att kontrollera hur terrängmodellen förbinder punkterna, särskilt längs brytlinjer och vid ytterkanten.
- {{ui:Punkter}} ritar varje mätpunkt; {{ui:Punktetiketter}} lägger till dess nummer, höjd och beskrivning (eller mindre: se **Punktetiketter** i [CivilCraft-inställningar](topic:settings)).
- {{ui:Brytlinjer}} ritar brytlinjer (och gränsen) i orange.
- {{ui:Terrängmodellens kant}} ritar konturen av terrängmodellen.

## Befintlig eller projekterad

När en byggplatta eller korridor planerar marken utan problem erbjuder **Terrängmodell** under **Visning** {{ui:Projekterad (planerad)}}. Höjdkurvorna, banden och pilarna visar då den planerade terrängen, så att du ser den nya marken och släntkrönet runt den. Byt tillbaka till {{ui:Befintlig mark}} för att se mätningen.

## Vad som exporteras

DXF- och PDF-utdata följer dessa inställningar: det du har stängt av skrivs inte ut, och höjdkurvorna är de för terrängmodellen som visas. Höjdband exporteras aldrig.
