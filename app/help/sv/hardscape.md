---
title: Beläggning, murar och trappor
summary: Beläggning med fall till brunn eller tvärfall, mönster och uppbyggnad; gångvägar som följer marken; stödmurar och fristående murar med trappade plintar; kantstöd; ramper och trappor kontrollerade mot deras gränsvärden; export till IFC.
keywords: hårdgjord yta, beläggning, markplattor, uteplats, terrass, fall, brunn, tvärfall, fiskbensmönster, löpande förband, gångväg, promenadstig, stödmur, trädgårdsmur, plint, avtäckning, kantsten, kantstöd, kantning, ramp, tillgänglighet, trappsteg, trappa, sättsteg, steg, vilplan
from: 51475877
---

Hårdgjord yta räknas om från marken varje gång, så den följer terrängen och byggs om när marken eller dess linje flyttas. Dra dess hörn på planen som vilken linje som helst. Öppna den från {{ui:Hårdgjorda ytor}} i gruppen Landskap.

## Beläggning

Klicka ut hörnen och tryck på {{key:Enter}}. I Egenskaper:

- **Nivå**: tom = markens medelnivå under den.
- **Fall**: nivå, ett **tvärfall** (en % mot en riktning) eller **till en brunn**: CivilCraft ber dig klicka var brunnen ska ligga, därefter stiger varje hörn från brunnen med fallet. Pilar på planen visar fallen.
- **Mönster** (rutnät, löpande förband, fiskben) med enhetsstorlek, fog och vinkel; **Kantning** med bredd. På ett blad utelämnas fogar som är mindre än en millimeter.
- Beläggningen är en del av den planerade ytan. Dess lager (plattor, bädd, underbygg) går in i IFC och i mängderna.

## Gångvägar

Klicka längs gångvägen och tryck på {{key:Enter}}. Den följer marken, med sitt **Tvärfall** på sin högra sida. En gångväg som är brantare än **Tillåten maxlutning** markeras med `!` på planen där den är, och Egenskaper säger hur brant den blir.

## Murar

Klicka längs muren och tryck på {{key:Enter}}. En mur är **stödmur** eller **fristående**. Utan **Överkant** står den sin **Höjd** över marken hela vägen; skriv en överkant för att hålla den jämn. Dess **plint** ligger ett inställt djup under marken och trappas ned i hela steg, så den är jämn mellan stegen. Egenskaper anger dess längd, höjder, fasadyta och plintsteg; planen märker ut murens över- och underkant (TW / BW) vid varje ände.

:::warning
En stödmur som är högre än 1.2 m (4 ft) flaggas: en ingenjör projekterar den.
:::

## Kantstöd

Klicka längs kantstödet och tryck på {{key:Enter}}; ange dess bredd och uppstick.

## Ramper

Klicka från nedre till övre änden och tryck på {{key:Enter}}. Nivåerna hämtas från marken i varje ände om du inte skriver in dem. En ramp får ett vilplan för varje stigning på 750 mm (2.5 ft) och kontrolleras mot **Tillåten maxlutning** (1:12 till att börja med) samt en minsta bredd; Egenskaper säger hur lång den skulle behöva vara.

## Trappor

Klicka på nedersta trappstegets framkant, sedan där trappan når upp, och tryck på {{key:Enter}}. Antalet sättsteg kommer från höjden och **Största sättsteg**; stegdjupet från komfortregeln 2R + G ≈ 630 mm, aldrig under **Minsta stegdjup**; ett vilplan efter varje **Högst sättsteg per trapplopp**. Egenskaper säger om de ryms mellan de två punkterna eller hur mycket längre de måste vara.

:::note
Gränsvärdena för ramper och trappor är märkta standardvärden. Ange de som din byggnorm kräver.
:::

## Ut ur CivilCraft

- Mer › {{ui:Exportera landskaps-IFC}}: beläggning och gångvägar som `IfcPavement`, murar som `IfcWall` (stödmurar som RETAININGWALL) med deras lager, kantstöd som `IfcKerb`, ramper som `IfcRamp`, trappor som `IfcStair` med sina sättsteg och steg.
- Växtförteckningens **Skicka till TakeoffCraft** tar med beläggningsytorna och lagervolymerna, murarnas fasadytor och längder, kantstödens längder och antal trappsteg.
- Detaljbladet ritar varje murs sektion, varje beläggnings uppbyggnad och varje trapplopp. Se [Landskapsblad](topic:landscape-sheets).
