---
title: "Opbyg og finjustér overfladen"
summary: "Sådan triangulerer CivilCraft det eksisterende terræn, og hvordan du former det med brudlinjegrupper, tegnede brudlinjer, en ydre afgrænsning og den længste ydre kant."
keywords: tin, overflade, triangulering, brudlinje, afgrænsning, eksisterende terræn, fx, opret overflade, delaunay, trekanter, maks. kant, ydre afgrænsning
from: b9eea3f3
---

CivilCraft har én eksisterende terrænoverflade pr. projekt. Den er et TIN (uregelmæssigt trekantnet) bygget af dine punkter, og den genopbygges automatisk hver gang en inddata ændrer sig. Der er ingen »genopbyg«-kommando og ingen forældet overflade.

## Hvad der går ind i overfladen

- Hvert punkt med en kote i en gruppe sat til {{ui:Punkter}}.
- Hver gruppe sat til {{ui:Brudlinje}}, forbundet i punktnummerrækkefølge.
- Hver brudlinje du tegner med værktøjet {{ui:Brudlinje}}.
- Den ydre afgrænsning, hvis du tegner en.
- Indstillingen **Længste ydre kant**.

Trekanter krydser aldrig en brudlinje: overfladen tvinges til at følge den og gøres derefter så jævn som muligt omkring den (Delaunay alle andre steder).

## Gør kodede linjer til brudlinjer

1. I venstre panel under **Punkter** finder du gruppen (for eksempel FL).
2. Sæt dens valg **Overflade** til {{ui:Brudlinje}}.
   Overfladen genopbygges, linjen tegnes med orange (med {{ui:Brudlinjer}} slået til under **Visning**), og **Brudlinjer** i overfladens fakta går op med én.
3. Kontrollér linjen på planen. Den skal løbe punkt til punkt i den rækkefølge linjen blev målt. Hvis den zig-zagger, indeholder gruppen mere end én linje, eller punkterne er ikke nummereret i rækkefølge: sæt gruppen tilbage til {{ui:Punkter}} og tegn linjerne i hånden (næste afsnit).

## Tegn en brudlinje gennem punkter

1. Tryk på {{key:B}}, eller klik på {{ui:Brudlinje}} i gruppen **Overflade**.
   Hintet siger »Brudlinje: klik opmålingspunkter i rækkefølge (den tager deres koter). Enter afslutter.«
2. Flyt markøren tæt på et punkt. En lille orange firkant markerer det punkt den tager.
3. Klik på linjens punkter ét efter ét. Hvert klik navngiver punktet og dets kote i statuslinjen.
4. Tryk på {{key:Enter}} for at afslutte.
   Statuslinjen siger »Brudlinje 1 tilføjet; overfladen blev genopbygget.«

Klik skal ramme et opmålingspunkt der har en kote; et klik andetsteds afvises med »Klik på et opmålingspunkt med en kote: en brudlinje tager punkternes koter.« {{key:Backspace}} fjerner det sidste punkt; {{key:Esc}} annullerer hele linjen.

:::warning
Afslut med {{key:Enter}}. Dobbeltklik afslutter også, men i denne build fjerner det punktet du dobbeltklikkede på. Klik en gang på det sidste punkt, og tryk derefter på {{key:Enter}}.
:::

For at fjerne alle tegnede brudlinjer på én gang, klik på {{ui:Fjern tegnede brudlinjer}} i afsnittet **Overflade**. For kun at fjerne den sidste, brug {{key:Mod+Z}}. Tegnede brudlinjer kan endnu ikke vælges eller redigeres enkeltvis.

## Tegn den ydre afgrænsning

En afgrænsning beskærer overfladen til det område du stoler på, for eksempel opmålingens grænser, så lange trekanter over umålte hjørner forsvinder.

1. Tryk på {{key:O}}, eller klik på {{ui:Afgrænsning}}.
2. Klik på hjørnerne i rækkefølge rundt om området. En stiplet linje viser formen.
3. Tryk på {{key:Enter}}.
   Statuslinjen siger »Afgrænsning sat; trekanter uden for den er væk.« **Afgrænsning** i overfladens fakta siger »Ja« og antallet af hjørner.

Ting du skal vide:

- Der er én afgrænsning. Tegner du en ny, erstatter den den gamle. {{ui:Fjern afgrænsningen}} tager den væk.
- Den kan kun fjerne: en afgrænsning der rækker ud over punkterne beskæres tilbage til deres kontur, med noten »Afgrænsningen rækker ud over punkterne; den blev beskåret tilbage til deres kontur.«
- Dens hjørner tager deres koter fra overfladen, så kanten følger terrænet nøjagtigt.
- Skjulte (indre) afgrænsninger er ikke tilgængelige endnu.

## Beskær lange ydre trekanter

Uden en afgrænsning udfylder overfladen hele konturen af punkterne, inklusive lange tynde trekanter over konkave kanter.

1. Under **Overflade** skriver du en længde i **Længste ydre kant** og trykker på {{key:Enter}}. Start med omkring to eller tre gange din typiske målafstand.
2. Ydre trekanter hvis yderkant er længere end det, fjernes, og der arbejdes indad, indtil hver ydre kant er kort nok. En kant der er en brudlinje skrælles aldrig.
3. Skriv 0 for at beholde alle trekanter igen.

## Læs overfladerapporten

Under overfladens fakta lister en boks det bygge-værktøjet gjorde. Med en okkerfarvet bjælke til venstre er det information; med en rød bjælke indeholder den en fejl, og der er ingen overflade.

| Meddelelse | Betydning |
|---|---|
| »3 punkter lå samme sted som et andet og blev forbundet med det.« | Punkter tættere end 0.0001 i plan blev til ét hjørnepunkt (det første beholdes). |
| »2 steder har to forskellige koter …« | Punkter oven på hinanden, eller krydsende brudlinjer, er uenige i højde. Brudlinjens kote vinder, derefter den første. |
| »1 brudlinjestykke kunne ikke tvinges ind i overfladen.« | Et meget kort eller næsten overlappende brudlinjestykke passede ikke; kontrollér det sted. |
| »En overflade kræver mindst tre punkter med koter.« | For få punkter: kontrollér kolonnerækkefølgen og grupperne. |
| »Punkterne ligger alle på én linje: ingen trekanter.« | Punkterne har ingen bredde, for eksempel en enkelt polygontrækslinje. |
| »Afgrænsningen overlapper ikke punkterne.« | Afgrænsningen ligger et andet sted, ofte en blanding af enheder eller koordinater. |
| »Der er ingen trekanter tilbage inden for afgrænsningen.« | Afgrænsningen er for lille eller forkert placeret. |

## En overflade læst fra LandXML

Når du åbner LandXML, bruges dens første TIN-overflade som den er: overskriften **Overflade** siger »Overflade (fra LandXML)«, og **Længste ydre kant** er gråtonet. Mens den overflade er i brug, ændrer brudlinjegrupper, tegnede brudlinjer og en ny afgrænsning den ikke. For at bygge overfladen ud fra filens punkter i stedet, klik på {{ui:Genopbyg overfladen fra punkterne}}. {{key:Mod+Z}} bringer LandXML-overfladen tilbage.

## Relateret

- [Læs højdekurver, koter og hældninger](topic:contours).
- [Importér opmålingspunkter](topic:import-points).
