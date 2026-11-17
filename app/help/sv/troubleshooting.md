---
title: Felsökning
summary: Symtom, orsaker och åtgärder för problem man stöter på i CivilCraft, med de exakta meddelanden appen visar.
keywords: problem, fel, felmeddelanden, fungerar inte, åtgärda, hjälp, meddelanden, felsöka, avvisad, saknas, felaktig, ombytta, höjdkurvor saknas
from: a9f7dedc
---

Meddelanden visas i statusfältet nere till höger, i rutor i vänster och höger panel och i dialogrutorna. De citeras här så som appen visar dem.

## Öppna filer

**"Filen är över 200 MB; CivilCraft öppnar inte så stora filer ännu."**
Dela punktfilen eller minska datamängden innan du öppnar den.

**"Kunde inte öppna site.json: Det här är inte en CivilCraft-projektfil."**
Filen slutar på `.json` eller börjar med `{` men är inte ett CivilCraft-projekt. Punktfiler får inte börja med `{`.

**"Kunde inte öppna … Projektfilen är från en nyare CivilCraft (version 2)."**
Projektet sparades av en nyare version. Öppna det där, eller exportera LandXML från det.

**"Kunde inte öppna … Det här är XML men inte LandXML (rotelementet är <…>)."**
Filen är en annan sorts XML. Exportera LandXML från det andra programmet.

**"… saknar punkter, TIN-ytor eller linjeföringar som CivilCraft kan läsa."**
Allt i filen är något CivilCraft hoppar över (till exempel bara rutnätsytor, eller bara spiralformade linjeföringar). Resten av meddelandet säger vad som fanns. Se [LandXML: vad som läses och skrivs](topic:landxml-reference).

**"Exempelplatsen kunde inte läsas in: …"**
{{ui:Öppna exempelplatsen}} läser en fil från CadCraft-webbplatsen. Utan anslutning fungerar det bara om CivilCraft har sparats för offline-användning (knappen i appfältet visar {{ui:Redo för offline}}). Gå online, klicka på {{ui:Spara för offline}}, så fungerar det offline därefter. Se [Offline](common:offline).

**{{ui:Spara för offline}} visar {{ui:Kunde inte spara}}.**
Vissa filer hämtades inte. Kontrollera anslutningen och klicka på knappen igen.

**{{ui:Spara för offline}} visar {{ui:Offline är inte tillgängligt}}.**
Webbläsarfönstret kan inte spara en offlinekopia, oftast för att det är ett privat fönster eller för att datorn är administrerad. Öppna CivilCraft i ett vanligt fönster.

**Offline öppnas appen inte alls.**
Den sparades inte för offline-användning i den här webbläsaren, eller så rensade webbläsaren sina webbplatsdata (Safari gör så för webbplatser som inte besökts på flera veckor). Gå online, öppna CivilCraft och klicka på {{ui:Spara för offline}}.

**Offlinekopian är en äldre version.**
Klicka på {{ui:Redo för offline}}, och sedan på {{ui:Spara igen (hämta den senaste versionen)}} medan du är online.

**En fil är gråtonad i öppna-rutan.**
Rutan visar bara punktfiler, LandXML och projektfiler efter deras filändelser. Dra filen till planen i stället, eller byt namn på den till `.txt`.

## Importera punkter

**"Inga punkter kunde läsas från den här filen."**
Välj kolumnordningen i **Kolumner** för hand. Om inget fungerar, öppna filen i en textredigerare och kontrollera att det är en punkt per rad med siffror i.

**Platsen ser spegelvänd, roterad eller utdragen till en linje ut.**
Nordvärde och östvärde är ombytta. Sammanfattningen sa "gissat från antalet kolumner". Välj PENZD i stället för PNEZD (eller tvärtom) i **Kolumner**, eller importera igen.

**Punkter långt bort från resten, och planen zoomad ut till en prick.**
En rad har ett skrivfel i en koordinat, eller så blandar filen koordinatsystem. Hitta punkten (klicka på den för att se dess nummer) och rätta filen.

**Rader som listas under "Rader som inte lästes".**
Se tabellen i [Importera punkter](topic:import-points#rows-that-are-not-read).

**Mina gamla punkter är borta.**
Att importera en punktfil ersätter alla punkter och rensar ångra. Öppna ditt sparade projekt för att få tillbaka dem.

## Ytan

**"Yta: finns inte ännu" med en röd ruta.**
Rutan säger varför: "En yta behöver minst tre punkter med höjder.", "Punkterna ligger alla på en linje: inga trianglar.", "Inga punkter med höjder.", "Avgränsningen överlappar inte punkterna." eller "Inga trianglar finns kvar innanför avgränsningen." Kontrollera kolumnordningen, punktgrupperna (är de {{ui:Utelämnas}}?) och avgränsningen.

**Höjdkurvor skär rakt över ett dike eller en kam.**
Den linjen är inte en brytlinje. Ställ in dess grupp till {{ui:Brytlinje}}, eller rita den med verktyget {{ui:Brytlinje}}. Se [Bygg och förfina ytan](topic:build-surface).

**En brytlinjegrupp ritar ett sicksack-mönster.**
Gruppen innehåller mer än en linje, eller så är dess punkter inte numrerade längs linjen. Ställ tillbaka gruppen till {{ui:Punkter}} och rita varje linje med verktyget {{ui:Brytlinje}}.

**Långa smala trianglar längs utkanten.**
Rita en avgränsning ({{key:O}}) eller ställ in **Längsta yttre kant**.

**Inga höjdkurvor alls, trots att ytan är byggd.**
Antingen är {{ui:Höjdkurvor}} avstängt under **Visning**, eller så är intervallet så litet att det skulle bli fler än 2,000 höjdkurvenivåer. Välj ett större intervall.

**Brytlinjer eller en avgränsning ändrar ingenting.**
Ytan kommer från LandXML ("Yta (från LandXML)"). Den används som den är. Klicka på {{ui:Bygg om terrängmodellen från punkterna}} för att bygga från punkterna i stället.

**"Det finns ingen yta ännu: öppna punkter först."**
Brytlinje, avgränsning och platta behöver en befintlig markyta. Importera punkter först.

**"Klicka på en punkt med höjd: en brytlinje tar punkternas höjder."**
Verktyget {{ui:Brytlinje}} väljer bara punkter. Zooma in och klicka på en punkt (en orange kvadrat visar den som kommer att tas).

## Rita

**Min sista punkt försvann när jag dubbelklickade för att avsluta.**
I den här versionen avslutar dubbelklick linjeföringen, plattan, brytlinjen eller avgränsningen, men tar bort punkten du dubbelklickade på. Klicka en gång på den sista punkten och tryck på {{key:Enter}}. Använd {{key:Mod+Z}} om det redan har hänt och rita sedan igen.

**Jag kan inte avsluta en ritning på en surfplatta.**
Att avsluta kräver {{key:Enter}}; det finns ingen knapp på skärmen ännu. Anslut ett tangentbord. Se [Mus, styrplatta och touch](topic:keyboard#mouse-trackpad-and-touch).

**Att dra för att placera en punkt panorerar i stället.**
Ett drag på mer än några pixlar panorerar planen i alla verktyg. Klicka utan att flytta musen.

**"En linjeföring behöver minst två punkter." / "En platta behöver minst tre hörn." / "En ledningssträcka behöver minst två konstruktioner."**
Du tryckte på {{key:Enter}} för tidigt. Ritningen kasseras; börja om.

**Tangenter som A eller G gör ingenting.**
En textruta eller en lista i en panel har fortfarande fokus, så bokstäverna går dit. Klicka en gång på planen och tryck sedan på tangenten. På en Mac är raderingstangenten Backspace för webbläsaren: använd Fn och Delete för att ta bort ett markerat objekt.

## Linjeföringar och längdprofiler

**"Kurvorna vid PI 2 och PI 3 överlappar: … Använd mindre radier."**
Två kurvor behöver mer tangent än vad som finns mellan deras PI:n. Sänk en eller båda radierna i PI-tabellen, eller flytta isär PI:na.

**"PI 3 vänder rakt tillbaka; den kan inte ta en kurva."**
Linjeföringen viker tillbaka på sig själv vid det PI:t. Flytta eller ta bort PI:t.

**"Den här linjeföringen har ingen mark under sig att starta från."**
Linjeföringen ligger utanför ytan. Flytta den till ytan, eller lägg till PVI:n genom att klicka med {{ui:Lägg till PVI}} påslagen.

**"Vertikalkurvan vid PVI 3 (L = …) startar innan kurvan eller PVI:n före den slutar." / "… går förbi nästa PVI."**
Korta kurvlängden eller flytta isär PVI:na.

**"Det finns redan en PVI vid …"**
Det finns en PVI vid den stationen. Klicka någon annanstans, eller dra den befintliga.

**Profilvyn är tom: "Rita en linjeföring för att se dess profil."**
Det finns ingen linjeföring, eller så har den markerade fel.

## Korridorer och plattor

**"Korridoren behöver en projekterad profil utan fel."**
Starta en projekterad profil ({{ui:Starta från marken}}) och rätta eventuella kurvöverlapp.

**"… sidoslänter går utanför ytan innan de möter marken." / "… släntlinjer går utanför ytan innan de möter den …"**
Planeringen når ytans kant innan den möter marken. Flytta in projekteringen från kanten, eller för den närmare marken. En ny platta som ritas delvis utanför ytan kan starta på höjd 0: skriv in en verklig höjd.

**"Korridorens släntkrönslinjer korsar …" / "Släntkrönslinjen korsar sig själv …"**
Slänter från olika sidor möts: täta kurvor, smala plattor, djupa skärningar eller höga fyllningar. Använd en större radie, en smalare sektionsuppbyggnad, en bredare platta eller brantare slänter.

**"Inga volymer ännu: en platta måste planeras utan problem."**
Åtgärda problemen som listas i den röda rutan ovanför.

**{{ui:Projekterad (planerad)}} är gråtonad.**
Ingen platta eller korridor är planerad ännu.

## Ledningar

**"P2 har inga bottennivåer ännu."**
Klicka på {{ui:Sätt dess bottennivåer från reglerna}} eller skriv in bottennivåerna.

**"P1: ingen mark vid S1 att starta från."**
Konstruktionen uppströms ligger utanför ytan och har ingen kant. Skriv in en brunnskant för den.

**Varje ledning markeras efter att jag flyttat en konstruktion.**
Att flytta en konstruktion ändrar inte bottennivåerna. Klicka på {{ui:Sätt alla bottennivåer från reglerna}}.

Alla nätverksmeddelanden förklaras i [Lägg upp ett självfallsledningsnät](topic:pipe-network#read-and-fix-problems).

## Spara och exportera

**"Inget att exportera ännu." / "Inget att plotta ännu."**
Projektet är tomt. Importera punkter först.

**Jag hittar inte den sparade filen.**
Den finns i webbläsarens hämtade filer (oftast mappen Hämtade filer). Se [Filer du kan öppna, spara och exportera](topic:files#where-the-files-go).

**PDF-skalan stämmer inte på papper.**
Skriv ut med 100 % eller verklig storlek, inte "anpassa till sida".

**Frågetecken i PDF-texten.**
Namn eller beskrivningar använder tecken utanför den västeuropeiska teckenuppsättningen. Statusmeddelandet räknar dem. Byt namn med vanliga tecken.

**Plottningen är avklippt i kanterna.**
Skalan är för stor för arket. Välj skalan markerad "(passar)", ett större ark, eller {{ui:Det som syns på skärmen}}.

**{{key:Mod+P}} öppnade webbläsarens utskriftsdialog.**
Sidan hade inte fokus. Stäng dialogrutan, klicka på planen och tryck på {{key:Mod+P}} igen, eller klicka på {{ui:PDF}}.

## Appen i sig

**Skärmen är tom eller verktygsfältet gör ingenting.**
Använd en aktuell version av Chrome, Edge, Firefox eller Safari, och ladda om. Se [Webbläsare](common:browsers).

**Appen är långsam med en stor punktfil.**
Stäng av {{ui:Trianglar}}, {{ui:Punktetiketter}} och {{ui:Höjdband}}, och använd ett större höjdkurvintervall. Mycket stora ytor tar en stund att bygga om efter varje ändring.

**Webbläsaren frågar "Lämna webbplatsen?"**
Projektet har osparade ändringar. Stanna kvar, spara med {{key:Mod+S}} och lämna sedan.
