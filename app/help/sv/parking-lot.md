---
title: Layout för parkeringsplats
summary: Lägg ut parkeringsrutor, körgångar, tillgänglighetsplatser och skåpbilsplatser samt refuger inom en avgränsning, planera ytan med fall till brunnar mot befintlig mark, och lägg sedan beläggning och plantering. Finns även tillgängligt för en assistent.
keywords: parkering, parkeringsplats, parkeringsruta, körgång, tillgänglig, ada, skåpbil, refug, brunn, fall, planering, schakt, fyllning, beläggning, markplattor, plantering, träd, terräng, punktmoln, mcp, assistent
from: 06c14da9
---

Passa in en parkeringsplats i en fastighet, en byggplatta eller en sluten funktionslinje, och få antalen, planeringen och beläggningen i ett steg.

## Lägg ut den

1. Markera en fastighet, en byggplatta eller en sluten funktionslinje på planen.
2. Öppna **Terrängmodell, Mer, Parkeringsplats...**
3. Välj reglerna, parkeringsrutans vinkel (90, 75, 60, 45, 30 grader eller parallellt) och envägs- eller tvåvägs körgångar. Storlekarna för rutor, körgångar och refuger utgår från tabellen och kan alla skrivas över.
4. Välj **Lägg ut**.

Raderna går längs avgränsningens kant som ger flest rutor (eller i den vinkel du skriver). En ruta räknas bara om den ligger helt inom avgränsningen. Där det finns plats för en rad och en körgång läggs ett enkelbelagt band till. Fönstret listar platser, tillgänglighetsplatser och skåpbilsplatser, refuger, brunnar och ytan per plats, och planen visar rutor, tillgänglighetsplatser med deras skraffererade åtkomstgångar, refuger, körgångarnas mittlinjer och brunnar på egna lager (C-PARK-...), så att de når PDF, DXF och DWG.

## Tillgänglighetsplatser

Med amerikanska regler följer antalet 2010 ADA Standards tabell 208.2 för de platser som finns (en av sex, avrundat uppåt, är en skåpbilsplats), placerade närmast avgränsningens första hörn (infarten), vardera med en åtkomstgång; två delar på en. En ruta som är smalare än den tillgängliga bredden, eller ett fall brantare än 1:48 på tillgänglighetsplatser, visas som ett problem. **Dessa tal skrevs in från standarden såsom de minns den och har inte kontrollerats mot den tryckta standarden.** Typiska mått för rutor och körgångar kommer från handböcker för parkeringsdesign och är likaså okontrollerade. Kontrollera båda, och din lokala byggnorm, innan du förlitar dig på dem. Välj **Anpassad** för att ange ditt eget antal tillgänglighetsplatser.

## Fall mot brunnar, schakt och fyllning

Om du inte stänger av det blir platsen ett planeringsområde i arbetsytan Landskap. Brunnar sätts på körgångarnas mittlinjer ungefär var 100 feet (30 m); ytan stiger från varje brunn med det fall du anger (1.5 procent till att börja med), så att varje punkt faller mot närmaste brunn. Nivån väljs så att platsens schakt och fyllning balanserar mot befintlig mark. Befintlig mark är projektets befintliga yta, som kan komma från mätpunkter, LandXML, ett lidar- eller skanningspunktmoln som gjorts om till en yta, eller höjdkurvor. Fönstret visar uppskattningen av schakt och fyllning; projektets egna volymer visar det exakta värdet efteråt. Planeringsområdet behåller sin kant mot befintlig mark, så där den nya ytan skiljer sig från marken vid kanten får du ett steg, och fönstret säger hur stort det är.

## Beläggning och plantering

Hela avgränsningen får en plattbeläggning (ett löpande förbandsmönster du kan ändra under Landskap, Hårdgjorda ytor) och varje refug får en buskbädd och, där den är tillräckligt bred, ett träd, hämtat från växtlistan. Allt är efteråt ett vanligt landskapsobjekt: redigera det, eller välj **Lägg ut igen** för att ersätta det platsen skapade. Att ta bort platsen tar bort det den skapade.

## Från en assistent

Samma plats kan begäras över MCP: `parking_layout` visar en förhandsvisning, `parking_build` skriver, `parking_remove` tar bort en plats. Begär med fastighetens namn eller skicka avgränsningen.

## Vad som inte är gjort

Det kontrolleras inte om körgångarna når en gata. Beläggningen täcker hela avgränsningen, så dess yta inkluderar refugerna. Materialval för beläggning från biblioteket och ett biblioteksobjekt för rutor är inte byggda; beläggningsmönstret är det från Hårdgjorda ytor. Inga andra länders regler är byggda.
