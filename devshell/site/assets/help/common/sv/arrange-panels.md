---
title: Ordna panelerna och använd en andra skärm
summary: Docka sidopanelerna till vänster, höger eller nederst, stapla dem, gruppera dem som flikar, fäst eller dölj dem, frigör dem över ritningen, gör layouten tätare, välj hur många rader verktygsfältet använder, eller flytta dem till ett eget fönster på en annan skärm.
keywords: paneler, docka, frigör, flytta panel, dra, layout, flikar, flikgrupp, stapla, fäst, dölj automatiskt, dölj panel, stäng panel, kompakt, layouttäthet, tät, verktygsfältsrader, radbryt, 1 rad, 2 rader, verktygsfältsrader, andra skärmen, två skärmar, dubbla skärmar, flera skärmar, fönster, popup-fönster, återställ layout
from: 32a8dae2
---

Panelerna bredvid ritningen kan flyttas. Placera dem där de passar dig, eller ge dem ett eget fönster på en andra skärm så att ritningen får hela den första skärmen.

:::note
Varje panel har en namnlist: en smal list med panelens namn, en {{ui:⋯}}-meny, en fästknapp och en stängknapp överst på panelen. Versioner före 0.7 har bara namnet och {{ui:⋯}}-menyn.
:::

## Flytta en panel i fönstret

1. Dra panelen i dess namn överst.
2. Medan du drar visas markerade områden till vänster, till höger och nederst om ritningen. Släpp panelen på ett av dem för att docka den där. Området du är över mörknas.
3. Släpp den var som helst annars över ritningen för att frigöra den.

Paneler kan dela en sida: de staplas, och varje linje mellan två av dem kan dras för att dela utrymmet (med en linje i fokus flyttar piltangenterna den, och dubbelklick på den delar utrymmet lika). Dra den inre kanten på en dockad sida för att göra den bredare eller smalare; dubbelklicka på kanten för att återställa den.

En frigjord panel stannar över ritningen. Flytta den i dess namn, och ändra storlek genom att dra i det nedre högra hörnet (eller tabba till hörnet och använda piltangenterna). Dubbelklicka på dess namn för att docka den igen där den var.

:::touch
Dra med ett finger i panelens namn. Dra i det nedre högra hörnet på en frigjord panel med ett finger för att ändra storlek, och kanterna mellan dockade paneler på samma sätt. För att frigöra eller docka utan att dra, använd {{ui:⋯}}-menyn.
:::

## Gruppera paneler som flikar

Två paneler kan dela en ram och visa en i taget. Dra en panel i dess namn till en annan panels namnlist (listen markeras medan du är över den) och släpp: ramen får nu en flik för varje panel, i sin namnlist. Klicka på en flik för att visa panelen. Med en flik i fokus byter {{key:Left}} och {{key:Right}} flik, och {{key:Home}} och {{key:End}} går till den första respektive sista.

För att ta ut en panel ur gruppen, välj {{ui:Flytta ut ur flikgruppen}} i dess {{ui:⋯}}-meny, eller dra den någon annanstans. Välj {{ui:Fäst vid kanten}}, {{ui:Flika med}} och en panels namn för att gruppera dem utan att dra.

## Fäst, dölj och hämta tillbaka

- Fästknappen i en panels namnlist gör den **automatiskt dold**: panelen lämnar sin docka och blir en liten flik vid den kanten. Peka på fliken, ge den fokus eller klicka på den så glider panelen ut över ritningen; flytta bort (eller tryck på {{key:Esc}}) så glider den tillbaka. Tryck på fästknappen igen, eller välj {{ui:Lossa fästet}}, för att docka den permanent.
- Stängknappen, eller {{ui:Dölj den här panelen}} i menyn, döljer panelen och stänger dess docka. En streckad flik vid kanten hämtar tillbaka den: klicka på den, eller ge den fokus och tryck på {{key:Enter}}.

## Gör layouten tätare

{{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Layouttäthet}} har två val. {{ui:Luftig}} är standard. {{ui:Kompakt}} minskar radhöjderna, panelernas utfyllnad, verktygsknapparna och panelernas text i just den appen, så att mer får plats på skärmen. Valet sparas för varje app. En pekskärm behåller sina stora knappar i båda, och en telefon behåller sin egen layout. {{ui:Återställ layout}} ändrar inte den täthet du har valt.

## Välj hur många rader verktygsfältet använder

{{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Verktygsfältsrader}} har tre val. {{ui:Radbryt}} är standard: alla verktygsgrupper visas, på så många rader som behövs. {{ui:2 rader}} håller verktygsfältet till två rader och {{ui:1 rad}} till en, så att ritningen får höjden; grupperna som inte får plats rullar åt sidan inne i verktygsfältet (använd musens hjul, en tvåfingersvepning eller {{key:Tab}} för att gå till ett verktyg). Ett verktygsfält som redan ryms på två rader ligger kvar som det är under {{ui:2 rader}}, eftersom ett rutnät bara skulle göra det högre. Valet sparas för varje app. En pekskärm och en telefon behåller sin egen layout. CadCraft har en egen inställning för sitt verktygsfält, under {{ui:Inställningar}} › {{ui:CadCraft}}.

## Använd tangentbordet

Varje panels {{ui:⋯}}-knapp öppnar en meny: {{ui:Docka till vänster}}, {{ui:Docka till höger}}, {{ui:Docka längst ned}}, {{ui:Frigör över ritningen}}, {{ui:Fäst vid kanten}}, {{ui:Dölj den här panelen}}, {{ui:Flika med}} en annan panel, {{ui:Flytta till ett nytt fönster}} och {{ui:Lägg tillbaka den}}. Gå till knappen med {{key:Tab}}, tryck på {{key:Enter}}, flytta med piltangenterna och tryck på {{key:Enter}} igen. {{key:Esc}} stänger menyn.

## Lägg panelerna på en andra skärm

1. Välj {{ui:⋯}} på en panel och sedan {{ui:Flytta alla paneler till ett nytt fönster}}. Du kan också välja {{ui:Flytta paneler till ett nytt fönster}} under {{ui:Inställningar}}.
2. Ett litet fönster öppnas med panelerna i. Dra det till din andra skärm och gör det så stort du vill.
3. Fortsätt arbeta: panelerna verkar på ritningen som tidigare, och ritningen fyller huvudfönstret.

Genvägar fungerar fortfarande när panelfönstret är i förgrunden: tangenter du trycker där, utom när du skriver i en ruta, går till ritningen. Frågor och dialogrutor som appen ställer öppnas fortfarande i huvudfönstret, så titta där när en visas. Temat och textstorleken i panelerna följer huvudfönstret.

:::chromium
Chrome och Edge kan placera fönstret på den andra skärmen åt dig. Med en andra skärm ansluten, välj {{ui:Lägg det på min andra skärm}} i panelfönstret (eller {{ui:Lägg panelerna på min andra skärm}} i en panels {{ui:⋯}}-meny). Webbläsaren frågar en gång om den här webbplatsen får se dina skärmar; när du har godkänt öppnas panelfönstret på den skärmen varje gång.
:::

:::firefox safari
Dra panelfönstret till den andra skärmen själv. Det öppnas på samma plats och i samma storlek nästa gång.
:::

## Mer än ett panelfönster

Varje panel kan ha ett eget fönster: upp till fyra panelfönster, till exempel ett per skärm.

- I en panels {{ui:⋯}}-meny öppnar {{ui:Flytta till ett nytt fönster}} ett annat fönster för den panelen, och {{ui:Flytta till panelfönster 2}} (och så vidare) flyttar den till ett fönster som redan är öppet. Det andra fönstret kallas ”paneler 2”.
- Dra en panel i dess namn från ett fönster till ett annat: släpp över huvudfönstret för att docka den där (de markerade områdena visas medan du är över det) eller för att frigöra den, och över ett annat panelfönster för att flytta in den. Släpper du någon annanstans stannar den där den var.
- Ett panelfönster som inte har några paneler kvar stängs av sig själv.

Efter en omladdning erbjuder appen dig dina panelfönster igen. Webbläsare öppnar ett fönster per klick, så välj {{ui:Öppna nästa}} en gång för varje fönster.

## Flytta en dialogruta

Varje dialogruta kan flyttas undan från ritningen: tryck och dra i dess namnlist. Dialogrutan minns var du lämnade den, var och en för sig, och återgår till den platsen nästa gång den öppnas. Dubbelklicka på namnlisten för att centrera den igen.

Med tangentbordet, tryck på {{key:Alt}}+{{key:Shift}}+en piltangent med fokus inne i dialogrutan för att flytta den 16 pixlar i taget; lägg till {{key:Ctrl}} för 64. En dialogruta som hamnar utanför skärmen (efter ett mindre fönster eller en mindre skärm) hämtas tillbaka.

På en telefon är dialogrutor kvar som helbreddsark och flyttas inte.

I CadCraft Studio har CadCrafts dialogruta {{ui:Plotta till PDF}}, som du kan ha öppen medan du arbetar, en knapp i sin namnlist, {{ui:Öppna i eget fönster}}. Dialogrutan flyttar in i ett eget fönster som du kan placera på en annan skärm. Stänger du dialogrutan stängs fönstret, och stänger du fönstret stängs dialogrutan.

## Lägg tillbaka panelerna

- Välj {{ui:Lägg tillbaka panelerna}} i panelfönstret, eller stäng det helt enkelt. Panelerna går tillbaka dit de var.
- Att stänga eller ladda om huvudfönstret stänger även panelfönstret. När appen öppnas igen säger den att dina paneler var i ett eget fönster; välj {{ui:Öppna den}} för att hämta tillbaka fönstret, eller {{ui:Behåll dem här}}.
- {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Återställ layout}} lägger tillbaka varje panel dit den började.

:::tip
Om inget öppnas när du flyttar paneler till ett nytt fönster har webbläsaren blockerat popup-fönstret. Appen säger till om det och behåller panelerna där de var. Tillåt popup-fönster för getcadcraft.com och försök igen.
:::

Layouten sparas för varje app i den här webbläsaren, tillsammans med dina andra inställningar.
