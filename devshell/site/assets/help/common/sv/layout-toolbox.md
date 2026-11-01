---
title: Arbeta i layouten med verktygslåda och infobox
summary: Växla appen till en kolumn med verktyg till vänster med platser för dina egna, en infobox över hela överkanten som följer verktyget som körs eller det du har valt, en navigator till höger, en flik för varje vy, snabbalternativ och en redigeringspalett, och växla tillbaka till den klassiska layouten när du vill.
keywords: layout, arbetsyta, verktygslåda, verktygskolumn, infobox, infofält, navigator, projektkarta, snabbfält, snabbalternativ, redigeringspalett, husdjurspalett, mina verktyg, favoritverktyg, vyflikar, verktygslådefönster, klassisk layout, byt layout, växla layout
from: 2f807c9c
---

**Verktygslåda och infobox** är en av appens tre arbetsytelayouter. Ritverktygen står i en kolumn till vänster, en infobox över hela överkanten visar vad verktyget som körs behöver eller vad du har markerat, varje vy har en flik och ett snabbfält under ritningen innehåller några vardagsalternativ. Verktygen är appens egna: allt du kan göra i den klassiska layouten fungerar också här, och din ritning, din menystil och dina tangenter förblir som de är.

## Välj den

1. Öppna {{ui:Inställningar}} (kugghjulet, eller {{key:Mod+,}}).
2. Välj fliken {{ui:Globalt}} och gå sedan till {{ui:Layout}} › {{ui:Arbetsyta}}.
3. Välj {{ui:Verktygslåda och infobox}}.

Layouten ändras direkt. Valet gäller alla appar i den här webbläsaren: varje app öppnas i den från och med nu, och den är på plats innan sidan ritas, så du ser aldrig den klassiska layouten först.

## Vad som finns var

- **Verktygsfält:** appens eget verktygsfält ligger kvar överst i ritytan, med sina menyer.
- **Infobox:** under verktygsfältet. Medan ett verktyg körs visar den verktyget och vad det ber om. När du markerar något visar den dess viktigaste inställningar (för en vägg: typ, tjocklek, längd, placeringslinje och höjd), och du kan ändra dem direkt där: en ändring där är samma sak som i Egenskaper, och {{key:Mod+Z}} ångrar den. När ingenting är markerat står det ”Inget markerat”. Varje app lägger till egna rutor här, till exempel aktuellt lager eller plan, eller det öppna dokumentet.
- **Verktygslåda:** kolumnen till vänster, appens verktyg i grupper. Klicka på en grupps namn för att fälla ihop eller öppna den igen. Verktyget som körs är tänt.
- **Mina verktyg:** verktygslådans första grupp, åtta tomma platser för de verktyg du använder mest. Klicka på en tom plats för att välja valfritt verktyg eller kommando i appen; eller högerklicka på ett verktyg i verktygslådan och välj {{ui:Lägg till i Mina verktyg}}; eller dra ett verktyg till en plats. Högerklicka på en plats för att ändra eller tömma den. Dina platser sparas för varje app i den här webbläsaren.
- **Navigator:** den högra panelen. Appens projektwebbläsare ligger överst (planer, sektioner, fasader, 3D-vyer, scheman, blad, så som appen har dem): klicka på en för att öppna den. Under den finns {{ui:Egenskaper}} och en flik med den högra panelens övriga innehåll.
- **Vyflikar:** en flik för varje vy i den öppna filen (ett blad, en planritning, en scen …), över ritningen.
- **Snabbfält:** under ritningen, vyinställningarna och vardagsalternativen som appen har, till exempel skala, detaljnivå, siktområde, anpassa, plan, delad vy eller 3D, fångster och enheter.
- **Redigeringspalett:** klicka på något i ritningen så kommer en liten palett fram vid pekaren med appens redigeringskommandon för det, till exempel flytta, kopiera, rotera, spegla, duplicera eller ta bort, samt {{ui:Egenskaper}}. {{key:Esc}}, mushjulet, ett nytt klick eller dess stängknapp lägger undan den.

Ett verktyg som inte kan köras just nu är gråtonat, och dess verktygstips säger varför. Klicka på det, eller tryck på {{key:Enter}} på det, för att läsa orsaken i en ruta.

{{key:Esc}} avslutar först verktyget som körs, som i den klassiska layouten, och alla kortkommandon och {{key:Ctrl+Shift+F}} (skärmlägen) fungerar som förut.

## Ge verktygslådan ett eget fönster

Knappen {{ui:Flytta verktygslådan}} överst i verktygslådan har {{ui:Flytta till ett nytt fönster}}: verktygslådan öppnas i ett smalt eget fönster som du kan placera bredvid appen eller på en andra skärm. Tangenter som trycks där når appen. {{ui:Lägg tillbaka verktygslådan}}, eller att stänga det fönstret, tar hem den.

Verktygsfältets inställningar gäller också verktygslådan: {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Verktygsfält}} › {{ui:Ikoner och etiketter}}, {{ui:Bara ikoner}} eller {{ui:Bara etiketter}}, och {{ui:Visa gruppnamn (Arkiv, Rita, …)}}.

## Dina paneler förblir dina

Den vänstra och den högra panelen behåller allt som beskrivs i [Ordna panelerna](common:arrange-panels): docka, frigöra, fästa, dölja, flikar, {{ui:Flytta till ett nytt fönster}} och {{ui:Återställ layout}}.

## Gå tillbaka till den klassiska layouten

Öppna {{ui:Inställningar}} › {{ui:Globalt}} › {{ui:Layout}} › {{ui:Arbetsyta}} och välj {{ui:CadCraft klassisk}}. Varje verktygsfält, flik och panel går tillbaka dit den var.

:::note
På en telefon, eller i ett fönster som är 760 pixlar brett eller smalare, använder appen sin telefonlayout oavsett vad du valde. Ett bredare fönster ger tillbaka din layout.
:::

Om du vill prova ett annat arrangemang, se [layouten med menyflik och projektwebbläsare](common:layout-ribbon).
