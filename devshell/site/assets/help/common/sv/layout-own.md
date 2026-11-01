---
title: Ordna din egen layout och spara dina uppsättningar
summary: Välj vilken panel som visar projektwebbläsaren, Egenskaper eller panelens eget innehåll, var verktygslådan hamnar och vad fälten innehåller, spara det som din egen layout och behåll hela uppsättningar under ett namn för att växla mellan dem.
keywords: layout, arbetsyta, ordna, anpassa, min layout, egen layout, paneler, redigerare, projektwebbläsare, egenskaper, verktygslåda, snabbfält, infobox, arbetsmiljö, uppsättning, profil, spara uppsättning, växla uppsättning, exportera uppsättning, importera uppsättning, ccenv
from: 2a71af43
---

Förutom de tre inbyggda layouterna kan du ordna en egen och spara hela din uppsättning under ett namn, så att du kan växla tillbaka till den i ett enda steg.

## Ordna din egen layout

1. Öppna {{ui:Inställningar}} (kugghjulet, eller {{key:Mod+,}}), välj {{ui:Globalt}} och sedan {{ui:Layout}}.
2. Välj {{ui:Ordna din egen layout…}}. Dialogrutan utgår från den layout du använder nu.
3. Ge den ett namn och välj sedan:
   - **Över ritningen:** appens verktygsfält, en menyflik eller ingetdera; ett namnfält; en infobox och vilka kontroller den innehåller.
   - **Bredvid ritningen:** verktygslådan till vänster, till höger eller inte alls, med eller utan {{ui:Mina verktyg}}; vilken panel som innehåller paletterna, vilken som ligger överst (till exempel projektwebbläsaren eller Egenskaper) och vilka som är flikar under den.
   - **Ritytan:** vyflikar, ett snabbfält och ett vyfält med de kontroller du kryssar i, redigeringspaletten, ett statusfält.
   - **Utseende:** storlek, knappkonturer och flikstil.
4. Välj {{ui:Använd den här layouten}}. Appen byter till den direkt, och alla appar som har layouter använder den också.

Bara det som den här appen har erbjuds. Din layout listas under {{ui:Från tillägg och filer}}; {{ui:Exportera den här layouten}} sparar den som en fil du kan ge en kollega, och knappen Ta bort tar bort den. Panelerna den fyller kan fortfarande dockas, frigöras och flyttas till egna fönster, som i [Ordna panelerna](common:arrange-panels).

## Spara din uppsättning som en arbetsmiljö

En arbetsmiljö är hela din uppsättning för alla appar i den här webbläsaren: layouten, menystilen och dina tangenter, verktygsfältets stil, panelerna och deras storlekar samt {{ui:Mina verktyg}}. Temat och språket ingår inte.

- **Spara:** skriv ett namn under {{ui:Arbetsmiljöer}} och välj {{ui:Spara min uppsättning}}. Om du sparar under ett namn som redan finns ersätts den uppsättningen.
- **Växla:** välj en uppsättning i listan och välj {{ui:Växla till den}}. Appen läses in på nytt i den uppsättningen; om du har osparat arbete frågar appen först, som vid varje omladdning.
- **Dela:** {{ui:Exportera}} sparar den valda uppsättningen som en `.ccenv.json`-fil; {{ui:Importera en uppsättning…}} lägger till en från en fil. En fil ställer bara in dessa val, ingenting annat.
- **Ta bort:** välj en uppsättning och välj {{ui:Ta bort}}.

Du kan behålla upp till tolv uppsättningar.

Om du först vill prova de inbyggda arrangemangen, se [layouten med verktygslåda och infobox](common:layout-toolbox) och [layouten med menyflik och projektwebbläsare](common:layout-ribbon).
