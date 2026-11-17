---
title: Lägg ut en horisontell linjeföring
summary: Rita en linjeföring efter dess PI:er, ange kurvradier och startstation, flytta PI:er och läs av kurvdata samt station och sidoavstånd.
keywords: linjeföring, ingen lösning, kurva passar inte, största radie, minsta radie, minimiradie, designhastighet, överlappning, mittlinje, pi, cirkelkurva, radie, stationering, raksträcka, skapa linjeföring, linjeföringslayout, pc, pt, station sidoavstånd
from: 8c5df4aa
---

En linjeföring i CivilCraft är en kedja av raksträckor genom skärningspunkter (PI), med en cirkelkurva vid varje inre PI som har en radie. Den stationeras från en startstation som du väljer. Ett projekt kan innehålla många linjeföringar.

## Rita linjeföringen

1. Tryck på {{key:A}}, eller klicka på {{ui:Linjeföring}} i gruppen **Design**.
   Hjälptexten säger "Linjeföring: klicka på PI:erna i ordning. Enter eller dubbelklick avslutar, Backspace tar bort den sista, Esc avbryter."
2. Klicka på den första PI:n (linjeföringens början).
3. Klicka på varje följande PI i ordning. En röd linje följer pekaren och visar längd och riktning för raksträckan du ritar, till exempel "212.40 ft  N 63°12'05" E".
4. Klicka på den sista PI:n (linjeföringens slut).
5. Tryck på {{key:Enter}}.
   Linjeföringen ritas med stationering och är markerad. Statusfältet säger till exempel "Linjeföring 1: 386.36 ft, kurvor med 100 ft radie där de får plats. Ändra radier i Egenskaper; Profil (R) för att utforma dess lutning."

Under ritning: {{key:Backspace}} tar bort den sista PI:n, {{key:Esc}} avbryter, och att dra på tom yta panorerar utan att lägga till en PI.

:::warning
Avsluta med {{key:Enter}}. Dubbelklick avslutar också, men i den här versionen tar den bort PI:n du dubbelklickade på. Klicka en gång på den sista PI:n och tryck sedan på {{key:Enter}}.
:::

Varje inre PI får en kurva på 100 ft (30 m i ett projekt i meter), eller den största hela radien som får plats i halva varje raksträcka om 100 ft inte får plats. Mycket skarpa PI:er eller PI:er där linjen går rakt igenom får ingen kurva.

## Ange radier och koordinater

Med linjeföringen markerad visar den högra panelen **Linjeföring**:

1. **Namn** och **Startstation**. Skriv en station som `10+00` (fot) eller `0+500` (meter), eller som ett vanligt tal. Se [Enheter, stationer och talformat](topic:units-and-stations).
2. **Längd** och **Slutstation** räknas ut åt dig.
3. Tabellen **PI** listar varje PI:s **Easting** och **Northing**, och en **Radie** för varje inre PI. Skriv ett nytt värde och tryck på {{key:Enter}}.
   - Radie 0 ger en vinkelpunkt utan kurva.
   - Första och sista PI:n har aldrig någon radie.
   - Det lilla x:et i slutet av en rad tar bort den PI:n (en linjeföring har minst två).
4. Läs listan **Kurvor**: för varje kurva dess PC- och PT-stationer, radie R, deflektionsvinkel Δ och riktning (vänster eller höger), längd L, tangentlängd T, externt avstånd E och korda.
5. Raden under kurvorna anger riktningen för den första raksträckan.

## När en kurva inte får plats

Om kurvor behöver mer raksträcka än det finns mellan deras PI:er har linjeföringen ingen lösning: den ritas inte rätt förrän du åtgärdar den, och den utelämnas i LandXML-exporter. En röd ruta säger varför, i siffror, och föreslår vad som skulle få plats:

- "Kurvorna vid PI 2 och PI 3 behöver 240.00 ft raksträcka mellan sig (130.00 + 110.00), men PI:erna ligger 180.00 ft från varandra." — eller, när bara en av dem har en kurva, "Kurvan vid PI 2 behöver 240.00 ft raksträcka mot PI 1 …".
- En knapp för varje PI sätter **den största radie som får plats** där, med den andra kurvan kvar som den är (den måste också få plats med PI:ns andra raksträcka). Där båda PI:erna har kurvor krymper **Båda** de två radierna i proportion så att de precis möts.
- När en enda kurva är längre än raksträckan säger rutan att ingen kurva vid den andra PI:n kan få plats medan den är så stor.
- En PI som vänder rakt tillbaka kan inte ta en kurva; rutan erbjuder **Ingen kurva vid PI n**.

Varje knapp är ett steg: {{key:Mod+Z}} återställer radierna. Erbjudna radier avrundas nedåt till 0.01 så att de alltid får plats.

### En minimiradie för design

Skriv en **Minimiradie för design** (till exempel från din designhastighet) för att kontrollera varje kurva mot den; lämna fältet tomt för ingen. En kurva under den listas med en knapp för **den minsta radie som uppfyller minimum**, när den radien får plats. När den inte får plats säger rutan det och ger den största radie raksträckorna tillåter, så att du vet att du måste flytta en PI eller sänka minimum.

## Flytta PI:er i planen

1. Med {{ui:Markera}} aktivt, klicka på linjeföringen för att markera den. Kvadratiska handtag visas vid dess PI:er.
2. Dra ett handtag. Linjeföringen, dess stationering, profil och korridor följer med.
3. Släpp. Flytten är ett enda steg att ångra.

Att lägga till en PI mellan två befintliga stöds ännu inte: ta bort linjeföringen och rita den igen, eller skriv nya koordinater för de PI:er du har.

## Läs station och sidoavstånd

För pekaren över planen. Statusfältet visar närmaste linjeföring (eller den markerade) med station och sidoavstånd, **L** eller **R** sett i stationsriktningen, till exempel "Linjeföring 1: Sta 2+15.30, sidoavstånd 18.42 R". Bortom någon av ändarna läggs "(bortom änden)" till.

## Vad som ritas

I planen, i DXF och i PDF: mittlinjen (raksträckor som linjer, kurvor som sanna bågar), en markering var 50 ft (20 m) med en längre markering och en stationsetikett var 100 enheter, samt PC- och PT-markeringar med sina stationer som etiketter.

## Ta bort en linjeföring

Markera den och tryck på {{key:Delete}}, eller klicka på {{ui:Ta bort}} i verktygsfältet eller längst ner i den högra panelen. Dess profil och korridor följer med. {{key:Mod+Z}} hämtar tillbaka den.

:::mac
På ett Mac-tangentbord motsvarar tangenten märkt **delete** {{key:Backspace}} i webbläsaren och tar inte bort en markering. Tryck på {{key:Delete}} (Fn och delete), eller använd knappen {{ui:Ta bort}}.
:::

## Nästa

- [Utforma en vertikal profil](topic:profile).
## Designhastighet och klass

Under linjeföringens egenskaper hålls **Designhastighet** (km/h eller mph) och **Designklass** kvar med linjeföringen, sparas i projektet och skrivs till IFC (Pset_RoadDesignCriteriaCommon). CivilCraft har ingen tabell som kopplar en hastighet till en minimiradie, så ingenting kontrolleras utifrån dem: ange **Minimiradie** utifrån din egen designstandard.

## Klotoider

En kurva kan ha en klotoid i vardera änden: raksträcka, klotoid, kurva, klotoid, raksträcka. I PI-tabellen skriver du en längd i **Klotoid in** och **Klotoid ut** för en PI som har en radie. PI:n står kvar där den är; kurvan rör sig inåt för att göra plats, så tangentavståndet växer med klotoidens förskjutning. De två längderna kan skilja sig, och en PI med bara en längd får en klotoid bara i den änden.

Kurvlistan visar då TS, SC, CS och ST (raksträcka till klotoid, klotoid till kurva, kurva till klotoid, klotoid till raksträcka) med klotoidens vinkel θs, tangentavstånden och det externa avståndet. Stationer löper längs klotoiderna som överallt annars. Klotoider som tillsammans vänder mer än kurvan gör nekas, med PI:n utpekad; en klotoid längre än raksträckan tillåter är en överlappning, som för alla kurvor. Överhöjning använder klotoiden som utjämningssträcka (se [Korridor](topic:corridor)).
