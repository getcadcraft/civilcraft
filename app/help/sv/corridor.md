---
title: Dra en vägkorridor
summary: Slå på en korridor för en linjeföring, ange värden för körfält, vägren och sidolutning, och läs sektionerna, släntkrönslinjerna och jordarbetena den ger.
keywords: korsning, anslutning, väg möter väg, sidoväg, T-korsning, passage, plattnivå, anslut, koppla ihop, överhöjning, super, kurvlutning, övergång, avplaning, värdetabell, tvärlutning, rotation, korridor, sektionsuppbyggnad, delsektion, typisk tvärsektion, väg, körfält, vägren, tvärlutning, sidolutning, släntkrön, schakt, fyllning, sektioner, mål, breddmål, höjdmål, förskjutningsmål, breddning, vägkant, följ en annan korridor
from: 6dcb92b3
---

En korridor sveper en enkel typisk tvärsektion (en sektionsuppbyggnad) längs en linjeföring och dess projekterade längdprofil, anpassar resultatet till den befintliga marken och lägger till det i den projekterade ytan. En linjeföring kan ha flera korridorer på olika stationsintervall, och en korridor kan byggas från återanvändbara mallar per station ([Korridormallar](topic:corridor-templates)). Den enkla sektionsuppbyggnaden nedan är densamma på båda sidor. Om du vill ge varje sida egna delar, se [Bygg varje sida av delar](topic:corridor#build-each-side-from-parts).

## Sektionsuppbyggnaden

Från mittlinjen och utåt, på varje sida:

1. ett **körfält** med en given bredd, som faller bort från krönet med **körfältslutningen**
2. ett **vägren** med en given bredd i **vägrenslutningen**
3. en **sidolutning** från vägrenskanten till där den möter marken: **skärningslutningen** där marken ligger över, **fyllningslutningen** där den ligger under

Startvärdena är platshållare, inte en konstruktionsstandard:

| Värde | US-fot | Meter |
|---|---|---|
| Körfältsbredd | 12 ft | 3.6 m |
| Körfältslutning | 2 % | 2 % |
| Vägrenbredd | 4 ft | 1.2 m |
| Vägrenslutning | 4 % | 4 % |
| Skärningslutning | 2 : 1 | 2 : 1 |
| Fyllningslutning | 3 : 1 | 3 : 1 |
| Sektion var | 10 ft | 5 m |

Lutningar för sidolutningar anges horisontellt mot vertikalt (H:V): 3 : 1 betyder 3 horisontellt för 1 vertikalt.

## Bygg korridoren

Du behöver en linjeföring utan fel och en projekterad längdprofil med minst två PVI-er och inga fel.

1. Markera linjeföringen.
2. I högerpanelen, under **Korridor**, bocka i **Svepa en uppbyggnad längs den projekterade längdprofilen**.
   Fälten visas och korridoren byggs direkt. Planen visar kanterna för körfält och vägren samt släntkrönslinjerna. Med {{ui:Projekterad (planerad)}} valt under **Visa** visar höjdkurvorna den nya marken.
3. Ändra valfritt värde: **Körfältsbredd**, **Körfältslutning**, **Vägrenbredd**, **Vägrenslutning**, **Skärningslutning**, **Fyllningslutning** eller **Sektion var**. Tryck på {{key:Enter}} efter varje. Schakt, fyllning och sektionsavstånd måste vara större än 0.
4. Läs raden under fälten, till exempel "39 sektioner från 0+00.00 till 3+86.36; schakt 240.2 cu yd, fyllning 556.0 cu yd."

Sektioner skärs vid varje steg av **Sektion var**, vid ändarna och vid början och slutet av varje horisontell och vertikal kurva. Varje sektion och linjerna genom dem (mittlinjen, kanterna på körfält och vägren, släntkrönet) blir brytlinjer i den projekterade ytan.

För att stänga av korridoren, bocka ur rutan. Dess värden sparas till nästa gång.

## När den inte byggs

En röd ruta under fälten anger varför:

| Meddelande | Vad du gör |
|---|---|
| "Korridoren behöver en projekterad längdprofil utan fel." | Lägg till PVI-er, eller rätta överlappande vertikalkurvor (se [Projektera en längdprofil](topic:profile)). |
| "Den projekterade längdprofilen överlappar inte linjeföringen." | Flytta PVI-erna till linjeföringens stationsintervall. |
| "Korridoren behöver minst två sektioner på ytan." | Större delen av korridoren ligger utanför den befintliga marken. |
| "4 sidolutningar går utanför ytan innan de möter marken." | Nära ytans kant kan lutningen inte nå marken. Håll vägen borta från kanten, eller sänk fyll- eller schaktdjupet där. |
| "Korridorens släntkrönslinjer korsar varandra (sektioner överlappar, till exempel på insidan av en skarp kurva). Använd en större radie eller en smalare sektionsuppbyggnad." | Sektioner på insidan av en skarp kurva överlappar. Öka radien eller gör sektionsuppbyggnaden smalare. |

En korridor med ett problem räknas inte in i ytan och ingår inte i jordarbetena.

## Korridorer och plattor tillsammans

Den projekterade ytan byggs i ordning: först alla korridorer, sedan alla plattor. Där en plattas planering överlappar en korridor vinner plattan. Där ett senare objekt överlappar en väg ersätts bara den del av vägen som ligger inom det senare objektets släntkrönslinje. Resten av vägen, och varje markbrytlinje som vägen korsar, behåller sin form. Volymerna räknas inom alla släntkrönslinjer tillsammans. Se [Jordarbetsvolymer](topic:volumes).

## Överhöjning

I en kurva kan vägen luta mot insidan, så att trafiken pressas mindre utåt. Bocka i **Överhöj kurvorna** under **Överhöjning** i linjeföringens **Egenskaper**:

- Varje cirkulär kurva får en värde **e** från värdetabellen: den första raden vars radie kurvan når (en rad med tomt värde behåller normal tvärlutning). Tabellen och **Största relativa lutning** (0.5 % till att börja med) är platshållare, inte en standard. Ange dem utifrån dina egna dimensioneringskriterier. Lägg till eller ta bort rader efter behov.
- Körfälten roterar kring mittlinjen. Före kurvan planas det yttre körfältet ut över **avplaningen** (normal tvärlutning ÷ e × övergång), sedan över **övergångssträckan** (körfältsbredd × e ÷ lutningen). Därefter fortsätter det yttre körfältet att vridas tills hela vägen lutar med e mot insidan. Två tredjedelar av övergångssträckan ligger före kurvan och en tredjedel i den. Efter kurvan sker samma sak baklänges.
- Ett vägren på den låga sidan är aldrig flatare än sitt körfält. På den höga sidan behåller det sin egen lutning (det rullar över).
- Tabellen under visar varje kurvas radie, värde, övergång och avplaning samt var full överhöjning börjar och slutar. **Överhöjningsdiagrammet** ritar båda körfältens tvärlutningar längs stationerna (vänster körfält heldraget, höger streckat).
- En kurva som är för kort för att nå full överhöjning, eller två kurvor vars övergångar överlappar, anges i en ruta ovanför tabellen.

Sektioner, volymer, 3D-vyn och ritningsbladen visar alla den lutande vägen. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

## Mål

Ett mål flyttar en punkt på ena sidan av vägen till en linje: **Vägkant** eller **Vägrenskant**, på **Vänster** eller **Höger** sida. Varje sektion möter linjen vinkelrätt mot mittlinjen och går bara utåt på den sidan, så ett mål på höger sida flyttar aldrig vänster sida.

| Sätter | Vad som händer där en sektion möter linjen |
|---|---|
| **Bredd** | Punkten hamnar på linjen: körfältet (eller vägrenet) breddas eller smalnar av till den och behåller sin tvärlutning. |
| **Höjd** | Punkten får linjens höjd där, på sitt eget avstånd från mittlinjen: körfältets (eller vägrenets) tvärlutning följer efter. |

Linjen kan vara en funktionslinje (oavsett dess **Användning**) eller en linje för en annan korridor: dess mittlinje, vägkanter, vägrenskanter eller släntkrönslinjer. En korridors linje följer den korridoren: ändrar du den andra vägen följer denna med. CivilCraft bygger den andra korridoren först. Två korridorer som skulle rikta mål mot varandra i en cirkel nekas på ena sidan, och tabellen anger vilken.

1. Markera linjeföringen och slå på dess korridor.
2. Under **Mål**, klicka på {{ui:Lägg till ett mål}}.
3. Välj **Sida**, **Punkt**, vad den **Sätter** och **Till linjen**. Varje ändring är ett steg som kan ångras.

**Resultat** anger vid hur många sektioner linjen nåddes. Sektioner som inte når den (förbi dess ändar, eller där den ligger bakom mittlinjen) behåller sektionsuppbyggnadens värden. En linje som tas bort lämnar korridoren som den var före målet, och tabellen säger det. En sida kan ha ett breddmål och ett höjdmål per punkt.

## Bygg varje sida av delar

Slå på **Bygg varje sida av delar** under korridorens inställningar. Varje sida får då sin egen lista, från mittlinjen och utåt: körfält, ett vägren, ett avrinningsstråk, en kantsten, en planteringsremsa, en gångbana och sist sidolutningen mot marken (med egna värden för skärning och fyllning). Börja från {{ui:Landsväg}} eller {{ui:Stadsgata}}, lägg till och ta bort delar, flytta dem med pilarna och {{ui:Kopiera}} en sida till den andra. Varje ändring är ett steg som kan ångras.

En tvärlutning är fallet bort från vägen, så en gångbana som leder vatten mot vägen har negativ lutning. En kantsten är en front med den höjd du anger, en krön med den bredd du anger och ett valfritt fall på baksidan. Överhöjningen vrider alla körfält på första raden. Avrinningsstråket, kantstenen, remsan och gångbanan hänger från körfältens kant som de är byggda. Mål flyttar fortfarande körfältens ände och den sista delen. Tvärsektioner markerar avrinningsstråkets nivålinje, kantstenens överkant och baksida samt resten. I en kurva med klotoider är övergången klotoiden: nivå tvärlutning vid TS och full överhöjning vid SC.

## Överbyggnadslager

Ett körfält, vägren, avrinningsstråk, planteringsremsa eller gångbana kan ha sin uppbyggnad. Under delen lägger {{ui:Lägg till ett lager}} till ett lager med namn, material, tjocklek och sort (slitlager, bindlager, bärlager, förstärkningslager, skyddslager eller annat), uppifrån och ner. Lagren ändrar inte vägens yta, eftersom dess överkant är den projekterade ytan. Varje lager ligger under sin del, och dess djup mäts rakt nedåt. Tvärsektioner ritar varje lagers underkant som en streckad linje. {{ui:Överbyggnadslager: kvantiteter}} listar planarean och volymen för varje lager (area längs korridoren från dess sektioner, volym = area × tjocklek). IFC-exporten skriver varje lager som ett eget element med sin tjocklek och sitt material (se [IFC-export och -import](topic:ifc)). Tjockleken du skriver är din egen: CivilCraft dimensionerar inte beläggningar.

## Där vägar möter vägar, plattor och stigar

Med {{ui:Anslut vägarna och plattorna den möter}} på (den är på för varje korridor) ansluter CivilCraft en korridor till det den möter i plan:

- **En väg som slutar på en annan väg** (där linjeföringens ände ligger på den andra vägen, eller inom ungefär halva dess egna körbanebredd från den vägens kant) är sidoväg i en korsning. Vägen den möter öppnar sin kant för sidovägens körbana: över mynningen läggs vägrenet, kantstenen, remsan och gångbanan på körfältets tvärlutning och ritas som beläggning. Sidovägen läggs på huvudvägens yta där de överlappar och jämnas av mot den över infarten.
- **Två vägar som korsar varandra** ansluts på samma sätt på båda sidor. Vägen som står först under Linjeföringar är genomfartsvägen. Den andra följer dess yta över korsningen.
- **En väg som slutar vid en platta** (inne i den, eller inom ungefär halva dess körbanebredd från dess kant) når plattans nivå och jämnas av mot den över infarten.
- **En stig** (Landskap › Hårdgjorda ytor) slutar vid vägens yttre kant, i höjd med gångbanan eller vägrenet där, i stället för att ligga över vägen. En stig som korsar en väg blir två delar. En ände som ritats något kort av en väg (inom två gånger stigens bredd) förs vidare till vägkanten.

Egenskaper säger vad varje korridor anslöt, med hur mycket den höjdes eller sänktes där och över vilken längd. Längden är det större av 10 m (30 ft) och tjugo gånger ändringen, och aldrig mer än 45 % av korridoren. **Den projekterade längdprofilen ändras inte**: profilvyn visar fortfarande den gradient du ritade, och sektionerna, den projekterade ytan, volymerna och 3D-vyn visar vägen så som den anslutits. För att göra anslutningen exakt i projekteringen, flytta den sista PVI:n till den nivå som Egenskaper anger.

Stäng av omkopplaren på en korridor för att lämna den exakt som dess profil och sektionsuppbyggnad anger. Den deltar då inte i någon korsning, varken som sidoväg eller genomfartsväg. Vägar som möts nästan i linje (under ungefär 20°) lämnas ifred, och det gäller även spår.

Det en korsning ännu inte gör: det finns inga kantstensradier (hörnen är raka), inga svängfiler eller refuger, sidovägens ände skärs rakt mot dess egen linjeföring, och en korridor byggd från mallar öppnar sin kant på samma enkla sätt (ett dike eller en mur i dess ändvillkor jämnas av över mynningen, utan trumma). För kantstensradier i plan, siktrianglar och målning, se [Jord, vägar, mätning, gruvor och länkar](topic:soils-roads-survey-mines-links).

## Det som ännu inte är byggt

Mål för släntkrönets lutning finns inte ännu. För en korridor som ändras längs vägen, med vänster och höger sida åtskilda, använd [Korridormallar](topic:corridor-templates). Se [Finns inte ännu](topic:not-built-yet).
