---
title: Arbeta i layouten menyflik och projektwebbläsare
summary: Byt appen till en menyflik med flikar över ritningen, med Egenskaper och en projektwebbläsare till vänster och en flik för varje öppen vy. Byt tillbaka till den klassiska layouten när du vill.
keywords: layout, arbetsyta, menyflik, menyflikar, projektwebbläsare, webbläsare, paletter, egenskapspalett, vyflikar, statusfält, snabbåtkomst, fäll ihop menyflik, minimera menyflik, menyflikfönster, klassisk layout, byt layout, dockad
from: 93700102
---

**Menyflik och projektwebbläsare** är en av appens tre arbetsytelayouter. En menyflik med flikar löper över överkanten, Egenskaper och en projektwebbläsare delar den vänstra panelen, varje vy du öppnar får en flik över ritningen, och ett statusfält sitter längst ned. Verktygen är appens egna: allt du kan göra i den klassiska layouten fungerar här också, och din ritning, din menystil och dina tangenter förblir som de är.

## Välj den

1. Öppna {{ui:Settings}} (kugghjulet, eller {{key:Mod+,}}).
2. Välj fliken {{ui:Global}} och gå sedan till {{ui:Layout}} › {{ui:Workspace}}.
3. Välj {{ui:Ribbon and project browser}}.

Layouten ändras direkt. Valet gäller för alla appar i den här webbläsaren: varje app öppnas i den från och med då, och den är på plats innan sidan ritas, så du ser aldrig den klassiska layouten först.

## Vad som finns var

- **Titelfält:** appens namn, snabbåtkomstknappar (öppna, spara, ångra, gör om), namnet på den öppna filen, {{ui:What each tool does here}} (en lista över alla verktyg med en sökruta, som visar vilka som är klara nu och varför de andra inte är det), helskärm, {{ui:Help}} och {{ui:Settings}}. I den här layouten ersätter titelfältet appfältet.
- **Menyflik:** appens verktyg i flikar, och varje flik i grupper. {{ui:File}} längst till vänster öppnar, sparar och så vidare. Vissa appar lägger till en egen flik medan du arbetar i ett visst läge eller en viss arbetsyta. Den lyser så länge den gäller och försvinner sedan.
- **Alternativfält:** under menyfliken visas vad det pågående verktyget behöver från dig, eller vad som är markerat.
- **Vänster panel:** {{ui:Properties}} överst, och under den paletterna (projektwebbläsaren och panelens eget innehåll) som flikar. Dra linjen mellan dem för att dela utrymmet.
- **Vyflikar:** en flik för varje vy du öppnat (ett blad, en plan, en scen …). Stäng en med dess stängknapp. Filen förblir öppen.
- **Vyfält och statusfält:** under ritningen vyns egna kontroller (skala, zoom). Längst ned appens meddelanden.

Ett verktyg som inte kan köras just nu är gråtonat, och dess verktygstips anger varför (till exempel ”Öppna en fil först”, eller att appen inte har det verktyget ännu). Klicka på det, eller tryck på {{key:Enter}} när det har fokus, för att läsa skälet i en ruta.

## Använd menyfliken från tangentbordet

Med en menyflik i fokus flyttar {{key:Left}} och {{key:Right}} mellan flikarna, och {{key:Home}} och {{key:End}} går till den första respektive sista. {{key:Esc}} avslutar först det pågående verktyget, precis som i den klassiska layouten. Alla genvägar och {{key:Ctrl+Shift+F}} (skärmlägen) fungerar som förut.

## Fäll ihop menyfliken eller ge den ett eget fönster

- Dubbelklicka på en menyflik för att fälla ihop menyfliken till sina flikar. Ett klick på en flik visar då dess verktyg tills du går vidare. Dubbelklicka igen för att behålla den öppen. Knappen {{ui:Move the ribbon}} längst till höger på menyfliken har också {{ui:Collapse the ribbon}} och {{ui:Keep the ribbon open}}. Varje app minns valet.
- {{ui:Move the ribbon}} › {{ui:Move to a new window}} lägger menyfliken i ett eget fönster, till exempel på en andra skärm. Tangenter som trycks där når appen. {{ui:Put the ribbon back}}, eller att stänga fönstret, tar hem den igen.

Verktygsfältsinställningarna gäller menyfliken: {{ui:Settings}} › {{ui:Global}} › {{ui:Toolbar}} › {{ui:Icons and labels}}, {{ui:Icons only}} (menyfliken visar då två rader små ikoner per grupp) eller {{ui:Labels only}}, och {{ui:Show group names (File, Draw, …)}}.

## Dina paneler förblir dina

Vänster och höger panel behåller allt som beskrivs i [Ordna panelerna](common:arrange-panels): docka, frigör, fäst, dölj, flikar, {{ui:Move to a new window}} och {{ui:Reset layout}}.

## Gå tillbaka till den klassiska layouten

Öppna {{ui:Settings}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Workspace}} och välj {{ui:CadCraft classic}}. Varje verktygsfält, flik och panel går tillbaka dit den var.

:::note
På en telefon, eller i ett fönster 760 bildpunkter brett eller smalare, använder appen sin telefonlayout oavsett vad du valt. Ett bredare fönster ger tillbaka din layout.
:::

För att prova en annan uppställning, se [layouten verktygslåda och infobox](common:layout-toolbox).

För att ändra vad den här layouten visar, se [Ändra en layout på skärmen](common:layout-edit). För en mörk uppställning med menyrad och menyflik, se [Ritlayouten](common:layout-drafting).
