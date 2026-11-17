---
title: Ordna din egen layout och spara dina uppsättningar
summary: Välj vilken panel som visar projektwebbläsaren, Egenskaper eller panelens eget innehåll, var verktygslådan ska ligga och vad fälten innehåller. Spara layouten som din egen och behåll hela uppsättningar under ett namn för att byta mellan dem.
keywords: layout, arbetsyta, ordna, anpassa, min layout, egen layout, paneler, redigerare, projektwebbläsare, egenskaper, verktygslåda, snabbfält, infobox, arbetsmiljö, uppsättning, profil, spara uppsättning, byt uppsättning, exportera uppsättning, importera uppsättning, ccenv
from: 6af528e0
---

Utöver de tre inbyggda layouterna kan du ordna en egen, och spara hela din uppsättning under ett namn så att du kan byta tillbaka till den med ett steg.

## Ordna din egen layout

1. Öppna {{ui:Settings}} (kugghjulet, eller {{key:Mod+,}}), välj {{ui:Global}} och sedan {{ui:Layout}}.
2. Välj {{ui:Arrange your own layout…}}. Dialogrutan utgår från layouten du använder nu.
3. Ge den ett namn och välj sedan:
   - **Över ritningen:** appens verktygsfält, en menyflik eller inget av dem; en namnlist; en infobox och vilka kontroller den innehåller.
   - **Bredvid ritningen:** verktygslådan till vänster, till höger eller inte alls, med eller utan {{ui:My tools}}; vilken panel som har paletterna, vilken som ligger överst (projektwebbläsaren eller Egenskaper, till exempel) och vilka som är flikar under den.
   - **Ritningsytan:** vyflikar, ett snabbfält och ett vyfält med de kontroller du bockar för, redigeringspaletten och ett statusfält.
   - **Utseende:** storlek, knappkonturer och flikstil.
4. Välj {{ui:Use this layout}}. Appen växlar till den direkt, och varje app som har layouter använder den också.

Endast det som den här appen har erbjuds. Din layout visas under {{ui:From add-ons and files}}. {{ui:Export this layout}} sparar den som en fil som du kan ge till en kollega, och borttagningsknappen tar bort den. Panelerna som layouten fyller dockas, frigörs och flyttas till egna fönster fortfarande, som i [Ordna panelerna](common:arrange-panels).

## Spara din uppsättning som en arbetsmiljö

En arbetsmiljö är hela din uppsättning för varje app i den här webbläsaren: layouten, menystilen och dina tangenter, verktygsfältets stil, panelerna och deras storlekar, och {{ui:My tools}}. Temat och språket ingår inte.

- **Spara:** skriv ett namn under {{ui:Work environments}} och välj {{ui:Save my setup}}. Att spara under ett namn som redan finns ersätter den uppsättningen.
- **Byt:** välj en uppsättning i listan och välj {{ui:Switch to it}}. Appen laddas om i den uppsättningen. Om du har osparat arbete frågar appen först, precis som vid alla omladdningar.
- **Dela:** {{ui:Export}} sparar den valda uppsättningen som en `.ccenv.json`-fil. {{ui:Import a setup…}} lägger till en uppsättning från en fil. En fil ställer bara in dessa val, inget annat.
- **Ta bort:** välj en uppsättning och välj {{ui:Remove}}.

Du kan ha upp till tolv uppsättningar.

För att ändra en layout utan att öppna dialogrutan (dra ett block, högerklicka på ett verktyg) se [Ändra en layout på skärmen](common:layout-edit). Om du vill prova de inbyggda layouterna först, se [layouten verktygslåda och infobox](common:layout-toolbox), [layouten menyflik och projektwebbläsare](common:layout-ribbon) och [Ritlayouten](common:layout-drafting).
