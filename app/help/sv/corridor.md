---
title: Svep en vägkorridor
summary: Slå på en korridor för en linjeföring, ställ in värden för körfält, vägren och sidoslänt och läs av tvärsektionerna, släntkrönslinjerna och jordarbetet den ger.
keywords: överhöjning, super, banking, övergång, utjämning, satstabell, tvärlutning, rotation, korridor, sammansättning, delsammansättning, typisk tvärsektion, väg, körfält, vägren, tvärlutning, sidoslänt, släntkrön, skärning, fyllning, tvärsektioner, mål, breddmål, höjdmål, förskjutningsmål, breddning, beläggningskant, följ en annan korridor
from: 91303189
---

En korridor sveper en enkel typisk tvärsektion (ett tvärsnitt) längs en linjeföring och dess projekterade längdprofil, anpassar den till den befintliga marken och lägger resultatet till den planerade terrängmodellen. En linjeföring kan bära flera korridorer på olika stationsintervall, och en korridor kan byggas av återanvändbara mallar per station ([Korridormallar](topic:corridor-templates)). Det enkla tvärsnittet nedan är detsamma på båda sidor; för att ge varje sida egna delar, se [Bygg varje sida av delar](topic:corridor#build-each-side-from-parts).

## Tvärsnittet

Från mitten av vägen utåt, på varje sida:

1. ett **körfält** med en given bredd, som faller bort från krönet med **körfältslutningen**
2. en **vägren** med en given bredd vid **vägrenslutningen**
3. en **sidoslänt** från vägrenskanten till där den möter marken: **skärningslutningen** där marken är över, och **fyllningslutningen** där den är under

Startvärdena är platshållare, inte en projekteringsstandard:

| Värde | US-fot | Meter |
|---|---|---|
| Körfältsbredd | 12 ft | 3.6 m |
| Körfältslutning | 2 % | 2 % |
| Vägrensbredd | 4 ft | 1.2 m |
| Vägrenslutning | 4 % | 4 % |
| Skärningsslänt | 2 : 1 | 2 : 1 |
| Fyllningsslänt | 3 : 1 | 3 : 1 |
| Tvärsektion var | 10 ft | 5 m |

Lutningar för sidosläntar är horisontellt mot vertikalt (H:V): 3 : 1 betyder 3 utåt för 1 nedåt.

## Bygg korridoren

Du behöver en linjeföring utan fel och en projekterad längdprofil med minst två PVI och inga fel.

1. Markera linjeföringen.
2. I högra panelen, under **Korridor**, bocka för **Svep ett tvärsnitt längs den projekterade längdprofilen**.
   Fälten visas och korridoren byggs direkt. Planen visar kanterna på körfält och vägren samt släntkrönslinjerna; med {{ui:Projekterad (planerad)}} valt under **Visning** visar höjdkurvorna den nya marken.
3. Ändra ett värde: **Körfältsbredd**, **Körfältslutning**, **Vägrensbredd**, **Vägrenslutning**, **Skärningsslänt**, **Fyllningsslänt**, **Tvärsektion var**. Tryck på {{key:Enter}} efter varje. Skärnings-, fyllnings- och tvärsektionsavstånd måste vara större än 0.
4. Läs raden under fälten, till exempel ”39 tvärsektioner från 0+00.00 till 3+86.36; skärning 240.2 cu yd, fyllning 556.0 cu yd.”

Tvärsektioner skärs vid varje steg av **Tvärsektion var**, vid ändarna och vid början och slutet av varje horisontell och vertikal kurva. Varje tvärsektion och linjerna genom dem (mittlinje, kanter på körfält och vägren, släntkrön) blir brytlinjer i den planerade terrängmodellen.

För att stänga av korridoren avbockar du rutan. Dess värden sparas till nästa gång.

## När den inte byggs

En röd ruta under fälten säger varför:

| Meddelande | Vad du ska göra |
|---|---|
| ”Korridoren behöver en projekterad längdprofil utan fel.” | Lägg till PVI, eller rätta överlappande vertikalkurvor (se [Projektera en vertikalprofil](topic:profile)). |
| ”Den projekterade längdprofilen överlappar inte linjeföringen.” | Flytta PVI:erna till linjeföringens stationsintervall. |
| ”Korridoren behöver minst två tvärsektioner på terrängmodellen.” | Större delen av korridoren ligger utanför den befintliga marken. |
| ”4 sidoslänter går utanför terrängmodellen innan de når marken.” | Nära terrängmodellens kant kan släntlutningen inte nå marken. Håll vägen borta från kanten, eller sänk fyllnings- eller skärningshöjden där. |
| ”Korridorens släntkrönslinjer korsar varandra (tvärsektioner överlappar, till exempel på insidan av en skarp kurva). Använd en större radie eller ett smalare tvärsnitt.” | Tvärsektioner på insidan av en skarp kurva överlappar. Öka radien eller smalna av tvärsnittet. |

En korridor med ett problem planeras inte in och räknas inte i jordarbetet.

## Korridorer och byggplattor tillsammans

Den planerade terrängmodellen byggs i ordning: först varje korridor, sedan varje byggplatta. Där en byggplattas planering överlappar en korridor vinner byggplattan. Volymer räknas inom alla släntkrönslinjer tillsammans; se [Jordarbetsvolymer](topic:volumes).

## Överhöjning

Genom en kurva kan vägen luta mot insidan, så att trafiken trycks mindre mot utsidan. Bocka för **Överhöj kurvorna** under **Överhöjning** i linjeföringens **Egenskaper**:

- Varje cirkulär kurva tar en lutning **e** från satstabellen: den första raden vars radie kurvan når (en rad med tom lutning behåller normal tvärlutning). Tabellen och **Största relativa lutning** (0.5 % från början) är platshållare, inte en standard: ställ in dem efter dina egna projekteringskriterier. Lägg till eller ta bort rader efter behov.
- Körfälten roterar kring mittlinjen. Före kurvan planas det yttre körfältet ut över **utjämningssträckan** (normal tvärlutning ÷ e × övergång), sedan över **övergångssträckan** (körfältsbredd × e ÷ lutningen) fortsätter det yttre körfältet att vridas tills hela vägen lutar med e mot insidan; två tredjedelar av övergångssträckan ligger före kurvan och en tredjedel på den. Efter kurvan sker detsamma baklänges.
- En vägren på den låga sidan är aldrig plattare än sitt körfält; på den höga sidan behåller den sin egen lutning (den rullar över).
- Tabellen under den listar varje kurvas radie, lutning, övergångs- och utjämningssträcka samt var full överhöjning börjar och slutar. **Överhöjningsdiagrammet** ritar båda körfältens tvärlutningar längs stationerna (vänstra körfältet heldraget, det högra streckat).
- En kurva som är för kort för att nå full överhöjning, eller två kurvor vars övergångar överlappar, anges i en ruta ovanför tabellen.

Tvärsektioner, volymer, 3D-vyn och ritningarna visar alla den lutade vägen. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

## Mål

Ett mål flyttar en punkt på en sida av vägen till en linje: **Beläggningskanten** eller **Vägrenskanten**, på **Vänster** eller **Höger**. Varje tvärsektion möter linjen rätvinkligt mot mittlinjen, och går bara ut på den sidan, så ett mål på höger sida flyttar aldrig vänster sida.

| Sätter | Vad som händer där en tvärsektion möter linjen |
|---|---|
| **Bredd** | Punkten hamnar på linjen: körfältet (eller vägrenen) breddas eller smalnas till den, och behåller sin tvärlutning. |
| **Höjd** | Punkten får linjens höjd där, på sin egen förskjutning: körfältets (eller vägrenens) tvärlutning följer efter. |

Linjen kan vara en funktionslinje (oavsett dess **Användning**) eller en linje från en annan korridor: dess mittlinje, beläggningskanter, vägrenskanter eller släntkrönslinjer. En korridors linje följer den korridoren: ändrar du den andra vägen följer den här. CivilCraft bygger den andra korridoren först; två korridorer som skulle rikta mål mot varandra i en slinga avvisas på ena sidan, och tabellen säger vilken.

1. Markera linjeföringen och slå på dess korridor.
2. Under **Mål** klickar du på {{ui:Lägg till ett mål}}.
3. Välj **Sida**, **Punkt**, vad den **Sätter** och **Till linjen**. Varje ändring är ett ångra-steg.

**Resultat** anger vid hur många tvärsektioner linjen nåddes. Tvärsektioner som inte når den (förbi dess ändar, eller där den ligger bakom mittlinjen) behåller tvärnittets värden. En linje som tas bort lämnar korridoren som den var före målet, och tabellen säger det. En sida kan ha en bredd- och en höjdpunkt per punkt.

## Bygg varje sida av delar

Slå på **Bygg varje sida av delar** under korridorens inställningar. Varje sida får då sin egen lista, från mitten av vägen utåt: körfält, en vägren, en rännsten, en kantsten, en planteringsremsa, en gångbana och sist sidosläntan mot marken (med sina egna skärnings- och fyllningsförhållanden). Börja från {{ui:Landsväg}} eller {{ui:Stadsgata}}, lägg till och ta bort delar, flytta dem med pilarna, och {{ui:Kopiera}} en sida till den andra. Varje ändring är ett ångra-steg.

En tvärlutning är fallet bort från vägen, så att en gångbana som avleder vatten mot vägen är negativ. En kantsten är en front med den höjd du anger, en krön med den bredd du anger och ett valfritt fall på baksidan. Överhöjning vrider varje körfält i den första raden; rännstenen, kantstenen, remsan och gångbanan hänger från körfältens kant som de byggts. Mål flyttar fortfarande slutet av körfälten och den sista delen. Tvärsektioner markerar rännstenens flödeslinje, kantstenens över- och baksida och resten. I en kurva med övergångsbågar är övergångssträckan bågen: nivåkrön vid TS, full överhöjning vid SC.

## Beläggningslager

Ett körfält, en vägren, en rännsten, en planteringsremsa eller en gångbana kan ha sin uppbyggnad: under delen lägger {{ui:Lägg till ett lager}} till ett lager med ett namn, ett material, en tjocklek och sin typ (yta, bindlager, bärlager, förstärkningslager, skyddslager eller annat), uppifrån och ner. Lagren flyttar inte vägens yta (dess överkant är den projekterade ytan); varje lager ligger under sin del, med sitt djup mätt rakt nedåt. Tvärsektioner ritar varje lagers underkant som en streckad linje, och {{ui:Överbyggnadslager: kvantiteter}} listar plan area och volym för varje lager (area längs korridoren från dess tvärsektioner, volym = area × tjocklek). IFC-exporten skriver varje lager som ett eget element med sin tjocklek och sitt material (se [IFC-export och -import](topic:ifc)). Tjockleken du skriver är din egen: CivilCraft dimensionerar inte beläggningar.

## Finns inte ännu

Mål för släntkrönet finns ännu inte. För en korridor som ändras längs vägen, med vänster och höger åtskilda, använd [Korridormallar](topic:corridor-templates). Se [Finns inte ännu](topic:not-built-yet).
