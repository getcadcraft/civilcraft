---
title: Arbeta i layouten med menyflik och projektwebbläsare
summary: Växla appen till en menyflik med flikar över ritningen, med Egenskaper och en projektwebbläsare till vänster och en flik för varje öppen vy, och växla tillbaka till den klassiska layouten när du vill.
keywords: layout, arbetsyta, menyflik, menyflikar, projektwebbläsare, webbläsare, paletter, egenskapspalett, vyflikar, statusfält, snabbåtkomst, fäll ihop menyfliken, minimera menyfliken, menyfliksfönster, klassisk layout, byt layout, växla layout, dockad
from: c1a6eccc
---

**Menyflik och projektwebbläsare** är en av appens tre arbetsytelayouter. En menyflik med flikar löper längs överkanten, Egenskaper och en projektwebbläsare delar den vänstra panelen, varje vy du öppnar får en flik över ritningen och ett statusfält finns längst ned. Verktygen är appens egna: allt du kan göra i den klassiska layouten fungerar också här, och din ritning, din menystil och dina tangenter förblir som de är.

## Välj den

1. Öppna {{ui:Inställningar}} (kugghjulet, eller {{key:Mod+,}}).
2. Välj fliken {{ui:Globalt}} och gå sedan till {{ui:Layout}} › {{ui:Arbetsyta}}.
3. Välj {{ui:Menyflik och projektwebbläsare}}.

Layouten ändras direkt. Valet gäller alla appar i den här webbläsaren: varje app öppnas i den från och med nu, och den är på plats innan sidan ritas, så du ser aldrig den klassiska layouten först.

## Vad som finns var

- **Namnfält:** appens namn, snabbåtkomstknappar (öppna, spara, ångra, gör om), namnet på den öppna filen, {{ui:Vad varje verktyg gör här}} (en lista över alla verktyg med en sökruta, som säger vilka som är redo nu och varför de andra inte är det), helskärm, {{ui:Hjälp}} och {{ui:Inställningar}}. I den här layouten ersätter namnfältet appfältet.
- **Menyflik:** appens verktyg i flikar, varje flik i grupper. {{ui:Arkiv}} längst till vänster öppnar, sparar och så vidare. Vissa appar lägger till en egen flik medan du arbetar i ett visst läge eller en viss arbetsyta; den är tänd medan den gäller och försvinner efteråt.
- **Alternativfält:** under menyfliken, det som verktyget som körs behöver av dig, eller det som är markerat.
- **Vänster panel:** {{ui:Egenskaper}} överst och under den paletterna (projektwebbläsaren och panelens eget innehåll) som flikar. Dra linjen mellan dem för att fördela utrymmet.
- **Vyflikar:** en flik för varje vy du har öppnat (ett blad, en planritning, en scen …). Stäng en med dess stängknapp; filen förblir öppen.
- **Vyfält och statusfält:** under ritningen vyns egna kontroller (skala, zoom); längst ned appens meddelanden.

Ett verktyg som inte kan köras just nu är gråtonat, och dess verktygstips säger varför (till exempel ”Öppna en fil först”, eller att appen inte har det verktyget ännu). Klicka på det, eller tryck på {{key:Enter}} på det, för att läsa orsaken i en ruta.

## Använd menyfliken från tangentbordet

Med en menyflik fokuserad flyttar {{key:Left}} och {{key:Right}} mellan flikarna och {{key:Home}} och {{key:End}} går till den första och den sista. {{key:Esc}} avslutar först verktyget som körs, som i den klassiska layouten, och alla kortkommandon och {{key:Ctrl+Shift+F}} (skärmlägen) fungerar som förut.

## Fäll ihop menyfliken eller ge den ett eget fönster

- Dubbelklicka på en menyflik för att fälla ihop menyfliken till sina flikar; ett klick på en flik visar då dess verktyg tills du går vidare. Dubbelklicka igen för att hålla den öppen. Knappen {{ui:Flytta menyfliken}} i menyflikens högra ände har också {{ui:Fäll ihop menyfliken}} och {{ui:Behåll menyfliken öppen}}. Varje app kommer ihåg valet.
- {{ui:Flytta menyfliken}} › {{ui:Flytta till ett nytt fönster}} lägger menyfliken i ett eget fönster, till exempel på en andra skärm. Tangenter som trycks där når appen. {{ui:Lägg tillbaka menyfliken}}, eller att stänga det fönstret, tar hem den.

Verktygsfältets inställningar gäller menyfliken: {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Verktygsfält}} › {{ui:Ikoner och etiketter}}, {{ui:Bara ikoner}} (menyfliken visar då två rader små ikoner per grupp) eller {{ui:Bara etiketter}}, och {{ui:Visa gruppnamn (Arkiv, Rita, …)}}.

## Dina paneler förblir dina

Den vänstra och den högra panelen behåller allt som beskrivs i [Ordna panelerna](common:arrange-panels): docka, frigöra, fästa, dölja, flikar, {{ui:Flytta till ett nytt fönster}} och {{ui:Återställ layout}}.

## Gå tillbaka till den klassiska layouten

Öppna {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Layout}} › {{ui:Arbetsyta}} och välj {{ui:CadCraft klassisk}}. Varje verktygsfält, flik och panel går tillbaka dit den var.

:::note
På en telefon, eller i ett fönster som är 760 pixlar brett eller smalare, använder appen sin telefonlayout oavsett vad du valde. Ett bredare fönster ger tillbaka din layout.
:::

Om du vill prova ett annat arrangemang, se [layouten med verktygslåda och infobox](common:layout-toolbox).
