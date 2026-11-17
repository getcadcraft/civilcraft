---
title: Ordna panelerna och använd en andra skärm
summary: Docka sidopanelerna till vänster, höger eller nederst, stapla dem, gruppera dem som flikar, fäst eller dölj dem, frigör dem över ritningen, gör layouten tätare, välj hur många rader verktygsfältet använder, eller flytta dem till ett eget fönster på en annan skärm.
keywords: paneler, docka, frigör, flytta panel, dra, layout, flikar, flikgrupp, stapla, fäst, automatiskt dölj, dölj panel, stäng panel, kompakt, layouttäthet, tät, verktygsfältsrader, radbryt, 1 rad, 2 rader, verktygsfältslinjer, andra skärm, två skärmar, dubbel skärm, flera skärmar, fönster, popup, återställ layout
from: 49530239
---

Panelerna bredvid ritningen kan flyttas. Placera dem där de passar dig, eller ge dem ett eget fönster på en andra skärm så att ritningen får hela den första.

:::note
Varje panel har en namnlist: en smal list med panelens namn, en {{ui:⋯}}-meny, en fästknapp och en stängknapp överst på panelen. Versioner före 0.7 har bara namnet och {{ui:⋯}}-menyn.
:::

## Flytta en panel i fönstret

1. Dra panelen i dess namn överst.
2. Medan du drar visas konturerade ytor till vänster, till höger och nederst om ritningen. Släpp panelen på en av dem för att docka den där. Ytan du är över mörknar.
3. Släpp panelen var som helst annars över ritningen för att frigöra den.

Panelerna kan dela en sida: de staplas, och varje linje mellan två av dem dras för att dela utrymmet. (När en linje har fokus flyttar piltangenterna den, och dubbelklick på den delar utrymmet lika.) Dra den inre kanten på en dockad sida för att göra den bredare eller smalare; dubbelklicka på kanten för att återställa den.

En frigjord panel ligger kvar över ritningen. Flytta den i dess namn, och ändra storlek genom att dra i det nedre högra hörnet (eller gå till hörnet med {{key:Tab}} och använda piltangenterna). Dubbelklicka på namnet för att docka den igen där den var.

:::touch
Dra med ett finger på panelens namn. Dra det nedre högra hörnet på en frigjord panel med ett finger för att ändra storlek, och kanterna mellan dockade paneler på samma sätt. För att frigöra eller docka utan att dra, använd {{ui:⋯}}-menyn.
:::

## Gruppera paneler som flikar

Två paneler kan dela en ram och visa en i taget. Dra en panel i dess namn till en annan panels namnlist (listen är konturerad när du är över den) och släpp. Ramen får nu en flik för varje panel, i namnlisten. Klicka på en flik för att visa den panelen. När en flik har fokus växlar {{key:Left}} och {{key:Right}} mellan flikarna, och {{key:Home}} och {{key:End}} går till den första respektive sista.

För att ta en panel ur gruppen, välj {{ui:Move out of the tab group}} i dess {{ui:⋯}}-meny, eller dra den någon annanstans. Välj {{ui:Tab with}} och en panels namn för att gruppera dem utan att dra.

## Fäst, dölj och hämta tillbaka

- Fästknappen i en panels namnlist gör den **automatiskt dold**: panelen lämnar sin docka och blir en liten flik vid den kanten. Peka på fliken, fokusera den eller klicka på den, så glider panelen ut över ritningen. Flytta bort (eller tryck på {{key:Esc}}) så glider den tillbaka. Tryck på fästknappen igen, eller välj {{ui:Unpin}}, för att docka den permanent.
- Stängknappen, eller {{ui:Hide this panel}} i menyn, döljer panelen och stänger dess docka. En streckad flik vid kanten hämtar tillbaka den: klicka på den, eller fokusera den och tryck på {{key:Enter}}.

## Gör layouten tätare

{{ui:Settings}} › {{ui:General}} › {{ui:Layout density}} har två val. {{ui:Comfortable}} är standard. {{ui:Compact}} drar ihop radhöjderna, panelernas utfyllnad, verktygsfältets knappar och panelens text i den appen så att mer ryms på skärmen. Valet sparas för varje app. En pekskärm behåller sina stora knappar i båda lägena, och en telefon behåller sin egen layout. {{ui:Reset layout}} behåller den täthet du har valt.

## Välj hur många rader verktygsfältet använder

{{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}} har tre val. {{ui:Wrap}} är standard: varje verktygsgrupp visas, på så många rader som det krävs. {{ui:2 rows}} håller verktygsfältet på två rader och {{ui:1 row}} på en, så att ritningen får höjden. Grupperna som inte får plats rullar åt sidan inne i verktygsfältet (använd musens hjul, en svep med två fingrar eller {{key:Tab}} till ett verktyg). Ett verktygsfält som redan ryms på två rader förblir oförändrat under {{ui:2 rows}}, eftersom ett rutnät bara skulle göra det högre. Valet sparas för varje app. En pekskärm och en telefon behåller sin egen layout. CadCraft har en egen inställning för sitt verktygsfält, under {{ui:Settings}} › {{ui:CadCraft}}.

## Använd tangentbordet

Varje panels {{ui:⋯}}-knapp öppnar en meny: {{ui:Dock on the left}}, {{ui:Dock on the right}}, {{ui:Dock at the bottom}}, {{ui:Float over the drawing}}, {{ui:Pin to the edge}}, {{ui:Hide this panel}}, {{ui:Tab with}} en annan panel, {{ui:Move to a new window}} och {{ui:Put it back}}. Gå till knappen med {{key:Tab}}, tryck på {{key:Enter}}, flytta med piltangenterna och tryck på {{key:Enter}} igen. {{key:Esc}} stänger menyn.

## Lägg panelerna på en andra skärm

1. Välj {{ui:⋯}} på en panel, och sedan {{ui:Move all panels to a new window}}. Du kan också välja {{ui:Move panels to a new window}} i {{ui:Settings}}.
2. Ett litet fönster öppnas med panelerna i. Dra det till din andra skärm och gör det så stort du vill.
3. Fortsätt arbeta: panelerna påverkar ritningen som förut, och ritningen fyller huvudfönstret.

Genvägarna fungerar medan panelfönstret är överst: tangenter du trycker där, utom när du skriver i en ruta, går till ritningen. Frågor och dialogrutor som appen ställer öppnas fortfarande i huvudfönstret, så titta där när en visas. Temat och textstorleken för panelerna följer huvudfönstret.

:::chromium
Chrome och Edge kan placera fönstret på den andra skärmen åt dig. När en andra skärm är ansluten, välj {{ui:Put it on my other screen}} i panelfönstret (eller {{ui:Put the panels on my other screen}} i en panels {{ui:⋯}}-meny). Webbläsaren frågar en gång om den här webbplatsen får se dina skärmar. När du har tillåtit det öppnas panelfönstret på den skärmen varje gång.
:::

:::firefox safari
Dra panelfönstret till den andra skärmen själv. Det öppnas på samma plats och i samma storlek nästa gång.
:::

## Mer än ett panelfönster

Varje panel kan ha ett eget fönster: upp till fyra panelfönster, till exempel ett per skärm.

- I en panels {{ui:⋯}}-meny öppnar {{ui:Move to a new window}} ett annat fönster för den panelen, och {{ui:Move to panels window 2}} (och så vidare) flyttar den till ett fönster som redan är öppet. Det andra fönstret kallas ”panelfönster 2”.
- Dra en panel i dess namn från ett fönster till ett annat. Släpp den över huvudfönstret för att docka den där (konturerade ytor visas när du är över det) eller för att frigöra den, och över ett annat panelfönster för att flytta in den. Släpp den var som helst annars så stannar den där den var.
- Ett panelfönster som inte har några paneler kvar stängs av sig självt.

Efter en omladdning erbjuder appen dina panelfönster igen. Webbläsare öppnar ett fönster per klick, så välj {{ui:Open the next one}} en gång för varje fönster.

## Samma sätt för alla delar av en layout

Menyfliken, verktygslådan, verktygsraderna och statusfältet går till ett eget fönster på samma sätt som en panel: öppna {{ui:⋯}}-menyn på delen och välj {{ui:Move to a new window}}. {{ui:Put it back}} (eller att stänga fönstret) tar den hem igen. Tangenter du trycker i det fönstret når appen, precis som från panelfönstret. Varje del har en sådan meny.

## Flytta en dialogruta

Varje dialogruta kan flyttas undan från ritningen: tryck och dra dess namnlist. Dialogrutan minns var du lämnade den, var och en för sig, och återgår till den platsen nästa gång den öppnas. Dubbelklicka på namnlisten för att centrera den igen.

Från tangentbordet trycker du på {{key:Alt}}+{{key:Shift}}+en piltangent när fokus är i dialogrutan för att flytta den 16 bildpunkter i taget. Lägg till {{key:Ctrl}} för 64. En dialogruta som hamnar utanför skärmen (efter ett mindre fönster eller en mindre skärm) förs tillbaka.

På en telefon förblir dialogrutor helskärmsblad och flyttas inte.

I CadCraft Studio har CadCraft:s dialogruta {{ui:Plotta till PDF}}, som du kan ha öppen medan du arbetar, en knapp i sin namnlist: {{ui:Open in its own window}}. Dialogrutan flyttas till ett eget fönster som du kan placera på en annan skärm. Om du stänger dialogrutan stängs fönstret, och om du stänger fönstret stängs dialogrutan.

## Lägg tillbaka panelerna

- Välj {{ui:Put the panels back}} i panelfönstret, eller stäng det helt enkelt. Panelerna går tillbaka dit de var.
- Om du stänger eller laddar om huvudfönstret stängs även panelfönstret. När appen öppnas igen säger den att dina paneler var i ett eget fönster. Välj {{ui:Open it}} för att få tillbaka fönstret, eller {{ui:Keep them here}}.
- {{ui:Settings}} › {{ui:General}} › {{ui:Reset layout}} lägger tillbaka varje panel där den började.

:::tip
Om inget öppnas när du flyttar paneler till ett nytt fönster har webbläsaren blockerat popup-fönstret. Appen säger till om det och behåller panelerna där de var. Tillåt popup-fönster för getcadcraft.com och försök igen.
:::

Layouten sparas för varje app i den här webbläsaren, tillsammans med dina andra inställningar.
