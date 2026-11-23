---
title: Beläggning, murar och trappor
summary: Beläggning med fall mot ett dräneringsstråk eller ett tvärfall, ett mönster och dess uppbyggnad; stigar som följer marken; stödmurar och fristående murar med trappade plintar; kantstenar; ramper och trappor kontrollerade mot sina gränser; IFC-export.
keywords: hårdgjord yta, beläggning, marksten, uteplats, terrass, fall, dränering, tvärfall, fiskbensmönster, förband, stig, gångväg, stödmur, trädgårdsmur, plint, krön, kantsten, kantband, ramp, tillgänglighet, trappor, steg, sättsteg, trappsteg, vilplan
from: d34b4466
---

Hårdgjorda ytor beräknas om från marken varje gång, så de följer terrängen och uppdateras när marken eller dess linje flyttas. Dra i hörnen i planen som i vilken annan linje som helst. Öppna den från {{ui:Hårdgjorda ytor}} i gruppen Landskap.

## Beläggning

Klicka ut hörnen och tryck på {{key:Enter}}. I Egenskaper:

- **Nivå**: tom = markens medelnivå under den.
- **Fall**: plan nivå, ett **tvärfall** (en procentsats mot en riktning) eller **mot ett dränage**: CivilCraft ber dig klicka där dräneringen ska gå, och sedan stiger varje hörn från dräneringen med fallet. Pilar i planen visar fallen.
- **Mönster** (rutnät, förband, fiskben) med enhetsstorlek, fog och vinkel; **Kantband** med bredd. På ett ritningsblad utelämnas fogar som är närmare än en millimeter.
- Beläggningen ingår i den projekterade ytan. Dess lager (marksten, bädd, bärlager) går in i IFC och i kvantiteterna.

## Stigar

Klicka längs stigen och tryck på {{key:Enter}}. Den följer marken, med sitt **tvärfall** åt höger sida. En stig som är brantare än **Största tillåtna lutning** markeras med `!` i planen där den är, och Egenskaper anger hur brant den blir.

Där en stig möter en väg som byggts av en korridor stannar den vid vägens yttre kant, i höjd med gångbanan eller vägrenet där, i den projekterade ytan och i 3D-vyn. En stig som korsar en väg jämnas av och visas som två delar, och en ände som ritats upp till två gånger stigens bredd kort av vägen förs vidare till dess kant. Planen visar fortfarande stigen så som du ritade den, och dess längd och area räknar hela linjen. Se [Dra en vägkorridor](topic:corridor).

## Murar

Klicka längs muren och tryck på {{key:Enter}}. En mur är **stödmur** eller **fristående**. Utan **Överkant** står den sin **Höjd** över marken hela vägen. Skriv en överkant för att hålla den plan. Dess **plint** sitter ett inställt djup under marken och trappas ner i hela steg, så att den är plan mellan stegen. Egenskaper anger muren längd, höjder, frontarea och plintstegen. Planen märker ut murens överkant och underkant (ÖM / UM) vid varje ände.

:::warning
En stödmur högre än 1.2 m (4 ft) flaggas: en ingenjör dimensionerar den.
:::

## Kantstenar

Klicka längs kantstenen och tryck på {{key:Enter}}. Ange dess bredd och höjd över körytan.

## Ramper

Klicka från nedre till övre änden och tryck på {{key:Enter}}. Nivåerna hämtas från marken vid varje ände om du inte skriver dem. En ramp får ett vilplan för varje stighöjd på 750 mm (2.5 ft) och kontrolleras mot **Största tillåtna lutning** (1:12 till att börja med) och en minsta bredd. Egenskaper anger hur lång den skulle behöva vara.

## Trappor

Klicka på nedre trappstegets framkant, sedan där trappan når upp, och tryck på {{key:Enter}}. Antalet sättsteg kommer från höjden och **Största steghöjd**. Inträdet kommer från komfortregeln 2R + G ≈ 630 mm, aldrig under **Minsta inträde**. Ett vilplan läggs var **Högst antal steg per trapplopp**. Egenskaper anger om de ryms mellan de två punkterna eller hur mycket längre de behöver vara.

:::note
Gränserna för ramper och trappor är märkta standardvärden. Ange de som din byggnadsnorm kräver.
:::

## Ut ur CivilCraft

- Mer › {{ui:Exportera landskaps-IFC}}: beläggning och stigar som `IfcPavement`, murar som `IfcWall` (stödmurar som RETAININGWALL) med sina lager, kantstenar som `IfcKerb`, ramper som `IfcRamp` och trappor som `IfcStair` med sina sättsteg och trappsteg.
- Växtlistans **Skicka till TakeoffCraft** tar med beläggningsareorna och lagervolymerna, murarnas frontareor och längder, kantstenslängderna och antalet trappsteg.
- Detaljbladet ritar varje murs sektion, varje beläggnings uppbyggnad och varje trapplopp. Se [Landskapsblad](topic:landscape-sheets).
