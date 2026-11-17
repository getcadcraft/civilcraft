---
title: Arbeta i layouten verktygslåda och infobox
summary: Byt appen till en kolumn med verktyg till vänster, med platser för egna verktyg. En infobox över toppen följer det pågående verktyget eller det du valt. En navigator till höger, en flik för varje vy, snabbalternativ och en redigeringspalett. Byt tillbaka till den klassiska layouten när du vill.
keywords: layout, arbetsyta, verktygslåda, verktygskolumn, infobox, infofält, navigator, projektkarta, snabbfält, snabbalternativ, redigeringspalett, mina verktyg, favoritverktyg, vyflikar, verktygslådefönster, klassisk layout, byt layout
from: ec341666
---

**Verktygslåda och infobox** är en av appens tre arbetsytelayouter. Ritverktygen står i en kolumn till vänster, en infobox över toppen visar vad det pågående verktyget behöver eller vad du valt, varje vy har en flik, och ett snabbfält under ritningen innehåller några vardagliga alternativ. Verktygen är appens egna: allt du kan göra i den klassiska layouten fungerar här också, och din ritning, din menystil och dina tangenter förblir som de är.

## Välj den

1. Öppna {{ui:Settings}} (kugghjulet, eller {{key:Mod+,}}).
2. Välj fliken {{ui:Global}} och gå sedan till {{ui:Layout}} › {{ui:Workspace}}.
3. Välj {{ui:Toolbox and info box}}.

Layouten ändras direkt. Valet gäller för alla appar i den här webbläsaren: varje app öppnas i den från och med då, och den är på plats innan sidan ritas, så du ser aldrig den klassiska layouten först.

## Vad som finns var

- **Verktygsfält:** appens eget verktygsfält står kvar överst i ritningsytan, med sina menyer.
- **Infobox:** under verktygsfältet. Medan ett verktyg körs visar den verktyget och vad det kräver. När du väljer något visar den dess huvudinställningar (för en vägg: typ, tjocklek, längd, placeringslinje och höjd), och du kan ändra dem direkt där. En ändring där är densamma som i Egenskaper, och {{key:Mod+Z}} tar tillbaka den. Utan något valt står det ”Inget markerat”. Varje app lägger till sina egna rutor här, till exempel det aktuella lagret eller den aktuella nivån, eller det öppna dokumentet.
- **Verktygslåda:** kolumnen till vänster, med appens verktyg i grupper. Klicka på en grupps namn för att fälla ihop den eller öppna den igen. Verktyget som körs är tänt.
- **Mina verktyg:** första gruppen i verktygslådan, med åtta tomma platser för de verktyg du använder mest. Klicka på en tom plats för att välja valfritt verktyg eller kommando i appen. Du kan också högerklicka på ett verktyg i verktygslådan och välja {{ui:Add to My tools}}, eller dra ett verktyg till en plats. Högerklicka på en plats för att ändra den eller tömma den. Dina platser sparas för varje app i den här webbläsaren.
- **Navigator:** den högra panelen. Appens projektwebbläsare ligger överst (planer, sektioner, fasader, 3D-vyer, förteckningar och blad, så som appen har dem). Klicka på en för att öppna den. Under den ligger {{ui:Properties}} och en flik med den högra panelens övriga innehåll.
- **Vyflikar:** en flik för varje vy i den öppna filen (ett blad, en plan, en scen …), över ritningen.
- **Snabbfält:** under ritningen de vyinställningar och vardagliga alternativ som appen har, till exempel skala, detaljnivå, vyomfång, anpassa, plan, delad vy eller 3D, fångst och enheter.
- **Redigeringspalett:** klicka på något i ritningen så visas en liten palett vid pekaren. Den innehåller appens redigeringskommandon för det du klickat på, till exempel flytta, kopiera, rotera, spegla, duplicera eller ta bort, och {{ui:Properties}}. {{key:Esc}}, musens hjul, ett nytt klick eller dess stängknapp döljer den.

Ett verktyg som inte kan köras just nu är gråtonat, och dess verktygstips anger varför. Klicka på det, eller tryck på {{key:Enter}} när det har fokus, för att läsa skälet i en ruta.

{{key:Esc}} avslutar först det pågående verktyget, precis som i den klassiska layouten. Alla genvägar och {{key:Ctrl+Shift+F}} (skärmlägen) fungerar som förut.

## Ge verktygslådan ett eget fönster

Knappen {{ui:Move the toolbox}} överst i verktygslådan har {{ui:Move to a new window}}. Verktygslådan öppnas då i ett smalt eget fönster som du kan placera bredvid appen eller på en andra skärm. Tangenter som trycks där når appen. {{ui:Put the toolbox back}}, eller att stänga fönstret, tar hem den igen.

Verktygsfältsinställningarna gäller verktygslådan också: {{ui:Settings}} › {{ui:Global}} › {{ui:Toolbar}} › {{ui:Icons and labels}}, {{ui:Icons only}} eller {{ui:Labels only}}, och {{ui:Show group names (File, Draw, …)}}.

## Dina paneler förblir dina

Vänster och höger panel behåller allt som beskrivs i [Ordna panelerna](common:arrange-panels): docka, frigör, fäst, dölj, flikar, {{ui:Move to a new window}} och {{ui:Reset layout}}.

## Gå tillbaka till den klassiska layouten

Öppna {{ui:Settings}} › {{ui:Global}} › {{ui:Layout}} › {{ui:Workspace}} och välj {{ui:CadCraft classic}}. Varje verktygsfält, flik och panel går tillbaka dit den var.

:::note
På en telefon, eller i ett fönster 760 bildpunkter brett eller smalare, använder appen sin telefonlayout oavsett vad du valt. Ett bredare fönster ger tillbaka din layout.
:::

För att prova en annan uppställning, se [layouten menyflik och projektwebbläsare](common:layout-ribbon).

För att ändra vad den här layouten visar, se [Ändra en layout på skärmen](common:layout-edit). För en mörk uppställning med menyrad och menyflik, se [Ritlayouten](common:layout-drafting).
