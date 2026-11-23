---
title: Projektera en längdprofil
summary: Öppna profilvyn, starta en projekterad profil från marken, lägg till och dra PVI-er, ange längder för vertikalkurvor, och läs lutningar, K-värden och höga och låga punkter.
keywords: profil, vertikal linjeföring, pvi, vertikalkurva, lutning, k-värde, krön, sluttning, bvc, evc, profilvy, färdig nivå, fg, befintlig markprofil, funktionslinjer i profil, korsningar, projicerad, kantsten, dike, etiketter
from: dbb1f32d
---

Varje linjeföring har en projekterad längdprofil: en lista med PVI:er (station och höjd) sammanbundna av raka lutningar, med en symmetrisk parabolisk vertikalkurva vid varje mellanliggande PVI som har en längd. Den befintliga markprofilen hämtas från ytan åt dig.

## Öppna profilvyn

1. Markera linjeföringen (klicka på den med {{ui:Markera}}).
2. Tryck på {{key:R}}, eller klicka på {{ui:Profil}} i verktygsfältet, eller på {{ui:Profilvy}} längst ner i högerpanelen.
   Profilvyn öppnas under planen med den befintliga marken längs linjeföringen. Med två eller fler linjeföringar väljer du en i listan till vänster i profilfältet.

Vyn börjar med att visa hela linjeföringen och sträcker höjderna så att de fyller panelen. Överdrivningen skrivs i nedre vänstra hörnet, till exempel "Vertikal överdrivning 10×".

## Zooma och panorera profilen

- **Zooma:** rulla mushjulet (eller nyp på styrplattan) så zoomar vyn kring pekaren. Håll ned {{key:Shift}} för att zooma endast stationerna, eller {{key:Alt}} för att zooma endast höjderna (det ändrar överdrivningen). När profilvyn har fokus zoomar plus- och minustangenterna kring mitten.
- **Panorera:** dra med höger eller mittersta musknappen, eller svep med två fingrar på styrplattan.
- **Anpassa:** dubbelklicka på profilen eller tryck på {{key:F}} för att visa hela linjeföringen igen.

Att redigera en PVI behåller zoomen du valt. Vyn hoppar inte tillbaka till helbild.

Flytta pekaren längs profilen: fältet visar station, befintlig och projekterad höjd, lutningen och av- eller påfyllningen där, och en prick följer linjeföringen i planen.

## Starta den projekterade profilen

1. Under **Projekterad profil** i högerpanelen, klicka på {{ui:Starta från marken}}.
   Två PVI:er placeras på marken vid linjeföringens två ändar, sammanbundna av en rak lutning. Statusfältet säger "Projekterad profil startad på marken i båda ändar. Slå på Lägg till PVI och klicka för att lägga till lutningsbrytningar; ge dem en kurvlängd i tabellen."

Om linjeföringen inte korsar ytan får du "Den här linjeföringen har ingen mark under sig att starta från." Lägg då till PVI:er genom att klicka i stället (nästa avsnitt).

## Lägg till PVI:er

1. Tryck på {{key:I}}, eller klicka på {{ui:Lägg till PVI}} i profilfältet. Knappen förblir nedtryckt.
2. Klicka i profilen där du vill ha en lutningsbrytning. En PVI läggs till vid den stationen och höjden, avrundad till 0.01, och markeras.
3. Lägg till så många du behöver, och tryck sedan på {{key:I}} igen för att sluta lägga till.

Ett klick där det redan finns en PVI avvisas ("Det finns redan en PVI vid …"). PVI:erna ligger alltid i stationsordning.

## Fångst när du lägger till eller drar

Knappen **Fångst** i profilfältet är på från början. Medan den är på hamnar en PVI som du lägger till eller drar på närmaste PVI, markpunkt, PVI-station eller markens linje, och en etikett vid markören säger vilken. Håll ned {{key:Alt}} för en fri punkt, var som helst.

## Justera PVI:er

- **Dra** en PVI i profilen för att flytta den. Den kan inte passera sina grannar. Flytten är ett steg som kan ångras.
- **Skriv** exakta värden i PVI-tabellen i högerpanelen: **Station**, **Höjd**, **Lutning %** och **Kurva L** (vertikalkurvans längd). Tryck på {{key:Enter}} efter varje.
- **Välj** ett värde i profilen: den lilla knappen bredvid en PVI:s station eller höjd väntar på ett klick i profilvyn och fyller i värdet. Klicket fångar som vid Lägg till PVI:er. Håll ned {{key:Alt}} för en fri punkt. {{key:Esc}} avbryter.
- **Lutning %** är lutningen på tangenten som startar vid den PVI:n och går till nästa. Om du skriver den flyttas **nästa** PVI:s höjd (dess station flyttas aldrig). Om nästa PVI är låst flyttas i stället den föregående PVI:ns höjd.
- **Lås** en PVI med hänglåset i slutet av dess rad. En låst PVI dras inte, och en ändring av lutning flyttar den inte. Om båda ändarna av en tangent är låsta kan dess lutning inte ändras: statusfältet säger det, och du låser upp den ena änden först. Låset sparas i filen.
- **Ta bort** en PVI med x:et i slutet av dess rad, eller markera den (klicka på den) och tryck på {{key:Delete}}. När profilvyn har fokus tar {{key:Backspace}} också bort den.

Första och sista PVI:n får aldrig en kurva.

## Vertikalkurvor

1. Skriv en längd i **Kurva L** för en mellanliggande PVI, till exempel 200.
2. Kurvan ritas centrerad på PVI:n. Profilen och högerpanelen visar dess typ (krön eller sänka), L och K, BVC- och EVC-stationerna och höjderna, samt dess höga eller låga punkt när den har en inne i kurvan.

K beräknas från L (K = L delat med den algebraiska skillnaden i lutning, i procent). Du skriver L; att skriva K direkt finns inte ännu.

Om en vertikalkurva inte ryms visar en röd ruta varför: den går tillbaka in i PVI:n eller kurvan före, eller förbi nästa PVI, och hur mycket plats det finns på den sidan (en kurva behöver hälften av sin längd på var sida om sin PVI). Knappen i rutan sätter **den längsta kurva som ryms**, med dess K, som ett steg ({{key:Mod+Z}} ångrar det). Eller flytta PVI:erna längre från varandra.

## Läs fakta

Under PVI-tabellen ger en lista varje lutning i procent ("Lutning 1: +1.25 %") och varje kurva, till exempel "Krön vid 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", följt av "Höga punkten 1+62.40, 254.12".

Om PVI:erna inte når båda ändarna av linjeföringen säger en notering det. En korridor byggs bara där profilen och linjeföringen överlappar.

## Funktionslinjer i profilen

Funktionslinjer visas även i profilvyn, så att du kan se en kantsten, ett dike eller en murkrön mot vägens profil.

- Där en funktionslinje **korsar** linjeföringen visar profilen en liten romb vid den stationen och höjden, märkt med linjens namn och dess höjd där (linjens egen höjd, beräknad längs segmentet som korsar).
- Skriv ett avstånd i {{ui:Bredvid inom}} för att även rita de funktionslinjer som **löper bredvid** linjeföringen inom det avståndet, som streckade linjer på sina egna höjder. Tomt eller 0 visar bara korsningarna.
- Märkena och etiketterna följer varje ändring: flytta ett hörn, skriv en lutning eller höj linjen, så visar profilen de nya höjderna direkt.
- Klicka på en korsnings romb för att markera den funktionslinjen; den markerade linjen ritas i markeringsfärgen.
- {{ui:Funktionslinjer}} i profilfältet döljer eller visar alla. Båda inställningarna sparas med projektet.

Se [Funktionslinjer](topic:feature-lines).

## Nästa

- [Dra en vägkorridor](topic:corridor) längs linjeföringen och denna profil.
- Profilen skrivs till LandXML tillsammans med linjeföringen; se [Exportera LandXML](topic:landxml).
