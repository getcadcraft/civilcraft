---
title: Skärmen, del för del
summary: En rundtur bland alla fält och paneler i CivilCraft med deras namn på skärmen, från verktygsfältet till statusfältet.
keywords: gränssnitt, skärm, verktygsfält, paneler, egenskaper, statusfält, profilvy, layout, rundtur, ui
from: 76272010
---

CivilCraft har en enda skärm. Det finns inga flikar och inga layouter. Sidopanelerna kan flyttas, frigöras eller läggas i ett eget fönster: se [Ordna panelerna och använd en andra skärm](common:arrange-panels). Uppifrån och ned och från vänster till höger:

- **appfältet** (CadCraft-märket, appens namn, version, Om, skärmläge, Hjälp, Spara för offline, Papper och Modell)
- **verktygsfältet** med sju grupper av knappar
- **vänstra panelen**: Plats, Punkter, Terrängmodell, Visning och, när du har importerat några, GIS-lager
- **planen** i mitten, med **profilvyn** under sig när den är öppen
- **högra panelen**: Egenskaper för det som är markerat
- **statusfältet** längs nederkanten

## Appfältet

Det tunna fältet allra överst hör till CadCraft-webbplatsen, inte till CivilCraft självt.

- Versionsmenyn visar vilken version du kör.
- {{ui:Om CivilCraft}} öppnar appens sida på webbplatsen.
- {{ui:Helskärm}} växlar mellan skärmlägena: helskärm, sedan helskärm med fälten dolda, sedan tillbaka till normalt. {{key:Ctrl+Shift+F}} gör detsamma på alla plattformar, även på en Mac (där är det Control-tangenten, inte Cmd). När fälten är dolda för du pekaren till överkanten för att få fram dem igen.
- {{ui:Hjälp}} (eller {{key:F1}}) öppnar den här hjälpen i en sidopanel; {{key:F1}} eller {{key:Esc}} stänger den.
- {{ui:Spara för offline}} sparar CivilCraft i den här webbläsaren så att det öppnas utan uppkoppling; då visas {{ui:Redo för offline}}. Se [Filer du kan öppna, spara och exportera](topic:files#online-and-offline).
- {{ui:Papper}} och {{ui:Modell}} växlar mellan ett ljust och ett mörkt tema. Planen och profilen följer temat; PDF-filer skrivs alltid ut på vitt.

## Verktygsfältet

Varje grupp har en liten etikett ovanför sina knappar. Håll pekaren över en knapp för att se dess verktygstips och tangent.

| Grupp | Knappar | Vad de gör |
|---|---|---|
| Fil | {{ui:Ny}}, {{ui:Öppna}}, {{ui:Spara}} | Börja om, öppna en punktfil, LandXML eller ett projekt, spara projektet som en nedladdning |
| Exportera | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Skriv LandXML 1.2, en R12-DXF eller en DWG av planen, eller plotta planen till PDF |
| Terrängmodell | {{ui:Brytlinje}}, {{ui:Gräns}} | Rita en brytlinje genom inmätningspunkter; rita ytterkanten |
| Projektering | {{ui:Linjeföring}}, {{ui:Byggplatta}}, {{ui:Ledningar}}, {{ui:Profil}} | Rita en linjeföring, en byggplatta, en ledningssträcka; visa eller dölj profilvyn |
| Redigera | {{ui:Ångra}}, {{ui:Gör om}}, {{ui:Kopiera}}, {{ui:Klistra in}}, {{ui:Mer}} | Ångra, gör om, kopiera och klistra in inmätningspunkter; {{ui:Mer}} innehåller Klipp ut, Klistra in på plats, Duplicera, Ta bort, Markera alla punkter och Avmarkera |
| GIS | {{ui:Koordinater}}, {{ui:Importera}}, {{ui:Exportera}}, {{ui:Karta}} | Ange koordinatsystemet, importera och exportera GIS-filer, visa kartlager under planen |
| Vy | {{ui:Markera}}, {{ui:Anpassa}}, {{ui:3D}} | Välj och flytta saker; zooma så att allt syns; visa platsen i 3D ([Visa platsen i 3D](topic:site-3d)) |

Ett ritverktyg förblir nedtryckt medan det är aktivt. Om du klickar på det igen, trycker på {{key:Esc}} eller trycker på {{key:V}} återgår du till {{ui:Markera}}. {{ui:Ångra}}, {{ui:Gör om}}, {{ui:Kopiera}} och posterna under {{ui:Mer}} är gråade när de inte kan användas; verktygstipset säger varför (till exempel ”Markera inmätningspunkter först”). Varje knapp finns i [Verktygsfältsreferens](topic:toolbar).

I ett smalt fönster rullar verktygsfältet i sidled.

## Vänstra panelen

### Plats

- **Namn**: projektets namn. Det ger namn åt varje fil du sparar eller exporterar och skrivs ut i PDF-filens titelremsa.
- **Enheter**: {{ui:US feet}} eller {{ui:Meter}}. Det anger vad talen betyder. Att ändra det omvandlar **inte** koordinaterna; se [Enheter, stationer och talformat](topic:units-and-stations).

### Punkter

När den är tom berättar den hur du öppnar en punktfil. Med punkter visar den filnamnet, antalet punkter och hur många som har en höjd, därefter en tabell med **punktgrupper**: en rad för varje första ord i beskrivningen (GRD, FL, TBS …), med ett antal och ett val under **Terrängmodell**:

- {{ui:Punkter}}: punkterna ingår i terrängmodellen (standard för varje grupp).
- {{ui:Brytlinje}}: gruppens punkter sammanbinds, i punktnummerordning, till en brytlinje.
- {{ui:Utelämnas}}: gruppen påverkar inte terrängmodellen.

### Terrängmodell

Fakta om befintlig mark: punkter, trianglar, lägsta och högsta höjd, medelhöjd, 2D- och 3D-area, brytlinjer och om det finns en gräns. Under faktan listar en ruta allt som terrängmodellsbyggaren var tvungen att rätta eller inte kunde göra. Därefter:

- **Längsta yttre kant**: 0 behåller varje yttre triangel; ett tal trimmar bort långa smala trianglar utanför.
- Länkar som visas när de är aktuella: {{ui:Ta bort gränsen}}, {{ui:Ta bort ritade brytlinjer}} och, för en terrängmodell som lästs från LandXML, {{ui:Bygg om terrängmodellen från punkterna}}.

### Visning

- **Terrängmodell**: {{ui:Befintlig mark}} eller {{ui:Projekterad (planerad)}}. Den andra blir tillgänglig när en byggplatta eller korridor planerar utan problem.
- **Höjdkurvor var**, **Huvudkurva var** och **Band** (antalet färgband).
- Kryssrutor: {{ui:Höjdkurvor}}, {{ui:Höjdkurveetiketter}}, {{ui:Trianglar}}, {{ui:Höjdband}}, {{ui:Lutningspilar}}, {{ui:Punkter}}, {{ui:Punktetiketter}}, {{ui:Brytlinjer}}, {{ui:Terrängmodellens kant}}, {{ui:Ledningar}}.
- En teckenförklaring med bandens höjder visas när band är på.

Visningsinställningar sparas med projektet men är inte ångra-steg: {{key:Mod+Z}} slår aldrig tillbaka en kryssruta.

## Planen

Planen visar punkterna, terrängmodellen och allt du projekterar, i planvy med norr uppåt. Zooma med hjulet vid pekaren och panorera genom att dra i tomt utrymme. Hela listan finns i [Tangenter och mus](topic:keyboard).

- På ett tomt projekt listar en ruta med rubriken **Börja med inmätningspunkter** de första stegen och erbjuder {{ui:Öppna exempelplatsen}}.
- När ett ritverktyg är aktivt säger en ledtråd överst på planen vad du ska klicka på och hur du avslutar.
- Om du drar en fil över planen visas ”Släpp en punktfil, LandXML eller ett projekt”.
- Markerade objekt framhävs. En markerad linjeföring eller byggplatta visar fyrkantiga handtag vid sina PI eller hörn; en markerad konstruktion visar ett handtag. Dra i ett handtag för att flytta det.
- Markerade inmätningspunkter har en ring. {{key:Shift}} och ett klick lägger till eller tar bort en punkt; {{key:Shift}} och en dragning ritar en ruta (eller, dragen runt dem, ett lasso) som lägger till punkterna innanför. Se [Markera, kopiera och klistra in inmätningspunkter](topic:copy-paste-points).

## Profilvyn

Tryck på {{key:R}} eller klicka på {{ui:Profil}} för att öppna den under planen. Dess fält har:

- en lista över linjeföringar (aktiv när det finns två eller fler)
- {{ui:Lägg till PVI}}: medan den är nedtryckt lägger ett klick i profilen till en PVI ({{key:I}} växlar den)
- en avläsning av station, mark, projekterad höjd, lutning och schakt eller fyllning under pekaren
- en stängknapp

Profilen visar befintlig mark, projekteringsprofilen, lutningar på varje raksträcka, varje PVI:s station och höjd, varje vertikalkurvas L och K med dess BVC och EVC, höga och låga punkter samt överhöjningen i höjdled. Den anpassas alltid till hela linjeföringen: den zoomas eller panoreras inte. När du för pekaren längs den hamnar en prick på linjeföringen i planen.

## Högra panelen: Egenskaper

Rubriken säger vad den visar.

- **Projekt** (inget markerat): linjeföringarna och byggplattorna som länkar, blocket **Markarbeten** och blocket **Ledningsnät** med dess regler och problem.
- **Linjeföring**: namn, startstation, längd, PI-tabellen, kurvorna, projekteringsprofilens PVI-tabell och fakta samt inställningarna för **Korridor**.
- **Byggplatta**: namn, höjd, schakt- och fyllningslutningar, area, fakta om släntkrön och markarbeten.
- **Konstruktion** eller **Ledning**: dimensioner, överkanter, bottennivåer, lutning, täckning och eventuella problem.
- **Punkt** och dess nummer: punktens koordinater, höjd, beskrivning och grupp (skrivskyddat).

Fälten träder i kraft när du trycker på {{key:Enter}} eller lämnar fältet. Ett värde som inte godtas markeras som ogiltigt och inget ändras.

## Statusfältet

- **E** och **N**: östvärde och nordvärde under pekaren.
- Höjden för **Mark** där (och **Planerad** där en byggplatta eller korridor har ändrat den), eller ”Utanför terrängmodellen”.
- Närmaste linjeföring (eller den markerade) med **Sta** och avstånd (**V** eller **H**) under pekaren.
- Till höger meddelanden: vad som just hände, eller varför något avvisades. Ett meddelande försvinner av sig självt efter några sekunder.

## Dialogrutor

- **Importera punkter**: öppnas för varje punktfil. Se [Importera inmätningspunkter](topic:import-points).
- **Plotta planen till PDF**: se [Plotta planen till PDF](topic:plot-pdf).
- **Osparade ändringar**: frågar innan {{ui:Ny}} eller öppnandet av ett projekt eller en LandXML-fil kastar osparat arbete. {{ui:Spara en kopia}} laddar först ner projektet.

## Små skärmar

Upp till 760 pixlars bredd, till exempel på en telefon, behåller planen skärmen: verktygsfältet är en enda rad som rullar i sidled, och panelerna öppnas som blad från ett fält längst ned. {{ui:Verktyg}} döljer verktygsfältet och {{ui:Flytta}} placerar det längst ned.
