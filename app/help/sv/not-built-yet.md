---
title: Finns inte ännu
summary: Vad den här versionen av CivilCraft ännu inte gör, och vad du gör i stället idag.
keywords: saknas, begränsningar, färdplan, inte tillgänglig, spiraler, breddning, dwg, dxf, inlopp, fördröjning, tvärsektioner, kommer senare, gränser
from: b91588d4
---

CivilCraft är tidigt i sin utveckling. Den här sidan listar vad den nuvarande versionen inte gör, så att du inte letar efter det. Inget här är utlovat till något datum.

## Punkter

| Finns inte ännu | I stället, idag |
|---|---|
| Att lägga till en andra punktfil till den första | Slå ihop filerna i en textredigerare eller ett kalkylblad först |
| Att exportera en punkttextfil | Exportera LandXML (punkterna går ut som CgPoints), använd GIS-{{ui:Exportera}} (punkter med fälten P, N, E, Z och D) eller {{ui:Kopiera}} punkterna till ett kalkylblad |
| Etikettformat för punkter, symboler per beskrivningsnyckel, kurvor (bågar) från linjekoder, en beskrivningsnyckelfil att dela mellan projekt | Etiketterna visar nummer, höjd och beskrivning, eller mindre ([CivilCraft-inställningar](topic:settings)). Nycklar sparas i projektfilen |
| Enhetsomvandling | Konvertera filen innan import. **Enheter** ändrar bara etiketterna |

## Ytor

| Finns inte ännu | I stället, idag |
|---|---|
| Mer än en yta byggd från punkter | Ett projekt per yta |
| Att dölja inre gränser | Använd **Längsta yttre kant** eller en yttre gräns |
| Att markera eller redigera en ritad brytlinje | {{key:Mod+Z}}, eller {{ui:Ta bort ritade brytlinjer}} och rita om |
| Att redigera en yta som lästs från LandXML (brytlinjer, gräns) | {{ui:Bygg om terrängmodellen från punkterna}} |
| Att redigera en yta gjord av ett höjdrutnät | Importera rutnätet igen med andra val |
| Att konvertera en yta som lästs från LandXML när koordinatsystemet ändras | Först {{ui:Bygg om terrängmodellen från punkterna}} |
| Märkta punkthöjder och lutningsvärden | Läs dem i statusfältet, eller färglägg ytan efter lutning med **Lutningsanalys** i arbetsytan Landskap ([Planering för landskap](topic:landscape-grading#grading-checks)) |

## Linjeföringar och profiler

| Finns inte ännu | I stället, idag |
|---|---|
| Spiraler annat än klotoid; en spiral mellan två kurvor (sammansatta övergångar) | Klotoidspiraler i kurvans ändar finns; de andra namnges och hoppas över vid LandXML-import |
| Att infoga en PI mellan två andra | Rita om linjeföringen, eller skriv om PI-koordinaterna |
| Linjeföringar från objekt, förskjutningar, breddningar | Rita med PI:er |
| Att skriva K för en vertikalkurva | Skriv L (K visas) |
| Cirkulära och osymmetriska vertikalkurvor | Endast symmetriska parabolkurvor |
| Mer än en projekterad längdprofil per linjeföring | En linjeföring per variant |
| Zoomning i profilvyn, profilband under profilen | Profilvyn passar hela linjeföringen; skriv ut den på [plan- och profilblad](topic:plan-profile-sheets) |
| Sektioner i DWG eller LandXML | Sektionsblad som PDF; {{ui:CSV}} för areorna och volymerna |
| Provlinjer i en vinkel, eller med olika bredder längs vägen | En bredd per sida för hela linjeföringen |

## Korridorer

| Finns inte ännu | I stället, idag |
|---|---|
| Mittrefuger, barriärer och en överhöjning som vrider mallar | Rita dem som mallar ([Korridormallar](topic:corridor-templates)); mallar per station tar ännu inte emot överhöjning |
| En gradvis övergång mellan två regioners mallar (övergångar, avsmalningar) | Byt mall vid en station, eller ge en punkt ett breddmål mot en linje ritad som avsmalningen |
| Rotation kring en kant, överhöjning i LandXML | Överhöjning roterar kring mittlinjen i cirkulära kurvor; bredda ett körfält med ett breddmål mot en funktionslinje |
| Mål för sidolutningar (släntkrön mot en linje eller yta), egna korridorytor | Mål flyttar beläggningskanter och vägrenskanter ([Korridorer](topic:corridor)); korridoren jämnas in i den projekterade ytan |
| Kantstensradier, svängfiler och refuger inlagda i en korsning; en sidovägs ände skuren mot huvudvägens kant på sned; en stig som ansluts till en väg i planen, i dess längd och area | Vägar som möts ansluts i rät vinkel, med huvudvägens kant öppnad och sidovägen jämnad av mot den ([Där vägar möts](topic:corridor#where-roads-meet-roads-pads-and-paths)); en stig stannar vid vägkanten i den projekterade ytan och i 3D |
| Korridorer exporterade som LandXML-vägar; en andra korridor på en linjeföring i IFC-exporten | Den projekterade ytan exporteras |
| Terrängmallar som ändrar den projekterade ytan, i 3D eller i sektionerna | De ger areor och volymer för varje lager ([Terrängmallar](topic:corridor-templates#terrain-templates)) |
| Svepta körvägar med hastighet, däckglidning, styrtid, styrda släpvagnar eller kroppsfrigång; ett bibliotek med standardfordon; en svept körväg ritad genom att dra fordonet | Svepta körvägar i låg hastighet längs en funktionslinje eller en linjeföring, med egna fordonsmått ([Fordons svepta körvägar](topic:swept-paths)) |

## Planering och volymer

| Finns inte ännu | I stället, idag |
|---|---|
| Bänkar, öppna funktionslinjer inlagda i projekteringen, planering till en funktionslinje från någon annanstans | Stäng funktionslinjen ([Funktionslinjer](topic:feature-lines)), eller använd den som en brytlinje i den befintliga marken |
| Att infoga eller ta bort ett hörn i en funktionslinje | Rita linjen igen, eller gör en trappad förskjutning av den |
| Bågar i ritade brytlinjer (genom mätpunkter), spiraler i funktionslinjer | Rita en funktionslinje med bågar och använd den som en brytlinje i den befintliga marken |
| Planering till ett avstånd, en höjd eller en annan yta | Släntkrön mot befintlig mark endast |
| Att lägga till eller ta bort ett hörn på en platta | Ta bort plattan och rita den igen |
| TIN-till-TIN-volymer (prisma), val av rutnätscellens storlek | Rutnätsmetoden, cellstorlek vald åt dig |
| Svällning och krympning, matjord, beläggningsdjup | Använd faktorer på de redovisade talen själv |
| Kostnader för fri transport och överkörning, transport mellan olika linjeföringar, upplag och deponier utplacerade i planen | Massdiagrammet med balanspunkter, flyttade volymer och genomsnittliga transportsträckor |

## Ledningsnät

| Finns inte ännu | I stället, idag |
|---|---|
| Mer än ett nät per projekt | Separata projekt för dagvatten och spillvatten |
| Vattenledningar: vattnets kvalitet och ålder, regelbaserade styrningar, andra ventiltyper (flödesreglering, struptning, uppehållande), pumpar angivna med effekt, efterfrågan som beror på tryck, ett Darcy–Weisbach-alternativ, en rörkatalog med väggtjocklekar och tryckklasser. Resten av tryckledningsnät finns i labbet: [Vattenledningar](topic:water-mains) | Kontrollera dem i programvara för vattenfördelning; dimensionerande spillvattenflöden finns i [Dimensionerande spillvattenflöden](topic:sanitary-design) |
| Spillvattenflöden över tid (hydrografer, dynamisk dirigering, magasin, pumpar, överfall) | [Dimensionerande spillvattenflöden](topic:sanitary-design) ger det stationära toppflödet som ett dimensioneringsblad använder |
| Inloppskapacitet, rännans spridning, dirigering i fördröjningsmagasin, hydrografer, energiförluster annat än en korsningskoefficient | Kontrollera dem i annan programvara; flöden, dimensioner och gradienter finns i [Dagvattendränering](topic:storm-drainage) |
| Avrinningsområden i PDF-utskriften, DWG, DXF eller LandXML; avrinningsområden från ytan (vattendelare) | Rita avrinningsområden för hand; de sparas i projektfilen |
| Rörkataloger, icke-runda rör, konstruktioner som inte är stående lådor eller cylindrar (koner, steg, bänkning), en dräneringskategori i biblioteket | Konstruktionstyper från parametrar ([Ledningsnät](topic:pipe-network)); rör med en diameter |
| Rör i profilvyn, krökta rör | Läs bottennivåer och täckning i högerpanelen |

## Fastigheter

| Finns inte ännu | I stället, idag |
|---|---|
| Indelning av tomter efter area eller framkant, fastigheter från linjerna runt dem, markrätt | Rita varje fastighet efter dess hörn, eller ange dess strängar |
| Kurvtabeller och linjetabeller i planen; etiketter flyttade för hand | Varje sträcka märks längs sig själv |
| Fastigheter i LandXML | Fastigheter sparas i projektfilen och går till PDF, DWG och DXF |

## Polygontåg

| Finns inte ännu | I stället, idag |
|---|---|
| Minsta kvadratmetodens utjämning, transitregeln, viktning av vinklar mot avstånd | Kompassregeln |
| Avvikelsevinklar, zenitvinklar och lutande avstånd, höjder genom trigonometrisk avvägning | Reducera till horisontella avstånd och vinklar, eller riktningsvinklar |
| Sidoobservationer, råa datafiler från datainsamlare | Importera punkterna som en punktfil |

## Utsättning

| Finns inte ännu | I stället, idag |
|---|---|
| Förskjutna utsättningspunkter (referenspunkter satta bakom pålen), släntpålar vid fångstpunkten | Sätt ut på de förskjutningar du behöver, även bortom vägrenet |
| Att skicka pålar direkt i en datainsamlares eget format | CSV-filen öppnas i kontorsprogrammet hos de flesta datainsamlare |
| Utsättning av rör, plattor och fastigheter | Använd mätpunkter nära en linjeföring, eller fastighetens strängar |

## Filer och utdata

| Finns inte ännu | I stället, idag |
|---|---|
| Text, skraffering och mått från DWG eller DXF; pappersrum; länkade ritningar (xrefs); binär DXF | Linjearbete från modellrummet öppnas ([Öppna en DWG eller DXF som linjearbete](topic:open-dwg-dxf)); öppna länkade ritningar var för sig |
| Att flytta flera punkter samtidigt genom att dra | Klipp ut och klistra in dem, eller redigera en i taget |
| Stående ritningsblad, egna namnlister, vyportar du ordnar själv, plan- och profilblad i DWG | Ett liggande planblad per PDF, eller plan- och profilblad längs en linjeföring (PDF) |
| Utskrift av höjdband och profiler | Band visas bara på skärmen; ta en skärmbild om du behöver dem |
| Ändring av lagernamn, färger eller etikettformat | Ändra dem i ett CAD-program efter DXF-export |
| Molnlagring och versionshistorik | Spara `.civilcraft.json`-filer och säkerhetskopiera dem; för att arbeta tillsammans i ett projekt, använd en live-session i CadCraft Studio ([Arbeta live på en plats tillsammans](topic:work-live)) |
| CadCraft Studio för iPad och iPhone, och från Google Play | Använd CivilCraft i webbläsaren på enheten; på Android installeras CadCraft Studio från dess APK på getcadcraft.com/download |
| Att öppna flera punkt- eller projektfiler samtidigt | En fil åt gången (GIS-filer som hör ihop, till exempel delarna i en shapefile, öppnas tillsammans) |

## Landskap

| Finns inte ännu | I stället, idag |
|---|---|
| Tillverkarnas sprinklerhuvuden och munstycken | Generiska huvuden, eller lägg till egna huvuden från en fil; tillverkarnas data kommer in i takt med att de ger tillstånd |
| Största laterala längder för droppledningar, flöden över tid, pumpar, slingrade ledningsnät | Håll droppledningar inom tillverkarens publicerade längd; kontrollen kräver ett grenat nät |
| Den exakta konturen av ett konkavt fritt objekt; dess volym under mark mätt exakt | Det konvexa höljet planeras och volymen under mark är en uppskattning (anges i Egenskaper) |
| Växter i BimCrafts och ModelCrafts egna Placera från bibliotek | Exportera landskaps-IFC och öppna den i BimCraft bredvid byggnaden |
| Detaljerade växtmodeller (löv, grenar, årstider) i 3D-vyn; fria objekt och bevattning i 3D-vyn | Växter visas i 3D som enkla former i storlek efter växtlistan ([Visa platsen i 3D](topic:site-3d)); ModelCrafts spridning gör planteringsbilder |
| Hårdgjorda murar som håller en planerad nivå bakom sig på ytan | Ge en plattform eller platta lodräta sidor: de är stödmurar på ytan ([Planering](topic:grading)) |
| SVG-transformationer i egna symboler; texturer och färger på egna GLB-växtmodeller; komprimerad GLB-geometri | Platta ut transformationer i ditt ritningsprogram först; modeller ritas i växtens färg; exportera GLB utan komprimering ([Växtgrafik](topic:plant-graphics)) |
| Din egen växtlista sparad i ditt Library-konto (redigerad i appen) | Redigera projektets egna lista i Växttabellen och spara den som en växtfil |
| Landskapsverktygen för assistenter utan fönstret (filservern och kommandoraden) | De fungerar när CivilCraft-fönstret är öppet ([Låt en AI-assistent arbeta med din plats](topic:assistants)) |

## Kraftledningar

| Finns inte ännu | I stället, idag |
|---|---|
| Ett lands standard inbyggd (lastfall, frigångar, faktorer) | Ange din standards värden i {{ui:Lastfall och gränser…}} och spara dem, tillsammans med ditt bibliotek, som ett paket att återanvända och dela ([Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Det sidledes avståndet från en ledare till en trädkrona eller en vägg bredvid linjen | Frigången rakt upp över växter och väggar som linjen korsar ([Kraftledningskontroller](topic:power-line-checks#clearances)) |
| Krypning hos ledare och töjning hos en ny ledare | Ta hänsyn till dem genom temperaturerna i spännningstabellen |
| Termisk märkning av nedgrävda kablar (strömtålighet från hur de läggs) | Ange leverantörens strömtålighet på kabelposten |
| Kortslutnings-, skydds- och jordningsstudier | Använd ett särskilt elprogram; CivilCraft ger nätets längder och kablar |
| Gallerstolpar dimensionerade stång för stång, och förankringar i marken | Stöd kontrolleras mot nominell last; stag mot märklast |
| En `.DON`-studiefil kontrollerad i programmet som läser den | Kontrollera filen där; skicka ett exempel till oss så att vi kan testa mot en riktig fil |
| Kraftledningar i 3D-vyn och i IFC | Planen, linjeprofilen, bladen och GIS-lagren |
| Kraftledningsverktygen för assistenter utan fönstret | De fungerar när CivilCraft-fönstret är öppet ([Låt en AI-assistent arbeta med din plats](topic:assistants)) |

## Byggnadsvolymer

| Finns inte ännu | I stället, idag |
|---|---|
| Ett bibliotek med zonkoder eller någon stads regler | Skriv in gränserna från din egen förordning ([Zongränser](topic:zoning-limits)) |
| Ljus från himlen på väggarna (fasadljus), vind | [Soltimmar](topic:sun-hours) räknar endast direkt sol |
| Skugga från träd, växter eller allt som inte ritats som en volym | Rita grannbyggnader som volymer |
| Takformer på volymer | Volymer med plant tak |
| Öppningar, tak och väggtyper när en volym utvecklas i BimCraft | BimCraft bygger enkla yttervägger på varje våningsplan och en bottenplatta; lägg till resten där |

## GIS och koordinatsystem

| Finns inte ännu | I stället, idag |
|---|---|
| File Geodatabase; KML-stilar, ikoner, marköverlägg och nätverkslänkar | Konvertera till GeoPackage, shapefile eller GeoJSON först; KML-platsmärken läses utan sina stilar |
| Redigering av GIS-objekt eller deras attribut | Redigera dem i ett GIS-program och importera igen. Analyspanelen skapar nya lager (buffert, överlagring, koppling, markering) och lägger till fält för area och längd, men den redigerar inte ett objekt på plats |
| Nätverks- och rasteranalys, buffertar med platta eller kvadratiska ändar och enkelsidiga buffertar, lägga till eller ta bort rader och ändra ett fälts typ i attributtabellen, egna klassfärger, en stilförklaring i utskrifter | Använd Markera för att välja objekt och skapa ett lager av dem; platta ändar erbjuds inte. Färgläggning efter attribut och attributtabellen finns: se [Formatera ett lager efter ett attribut](topic:gis-symbology) och [Arbeta med ett lagers attributtabell](topic:gis-table) |
| Etikettformat (storlek, placering) och etiketter som undviker varandra | Etiketterna har en storlek och kan överlappa där objekten är tätt |
| Vertikala datum och geoidmodeller | Höjder används så som filen anger dem; kontrollera det vertikala datumet själv |
| Rutnätsförskjutningar annat än till NAD83 från NAD27 föreslagna per område (OSTN15, NTv2 för andra datum fungerar när du lägger till filen), flera rutnät samtidigt, vertikala rutnät | Lägg själv till rutnätsfilen för ditt datum; ett rutnät per projekt |
| Kartlager i DXF eller i 3D-exporter | Kartlager går in i PDF-utskriften, och bredvid DWG som en bild |
| Kartservrar som kräver inloggning, nyckel eller token | Använd publika tjänster, eller en georefererad bildfil |
| Att skriva LAS- eller LAZ-filer från en yta, markmodellen eller höjdrutnäts- och LiDAR-verktygen | Exportera ytor som ett GeoTIFF-höjdrutnät. Tillägget [Punktmoln](topic:point-clouds) skriver ett rensat moln som LAS 1.4 eller LAZ |
| LiDAR-intensitet, färg och returer; höjdrutnät med flera band; rutnäts- eller LiDAR-filer över 200 MB | LiDAR filtreras endast efter klass, och rutnät använder sitt första band; dela stora filer i rutor först |

## Inmatning

| Finns inte ännu | I stället, idag |
|---|---|
| Rutmarkering med touch (den kräver {{key:Shift}}) | Håll ned på varje mätpunkt för att lägga till den |
| Skrivna koordinater eller avstånd vid ritning | Rita ungefärligt, och skriv sedan exakta PI-koordinater i linjeföringens PI-tabell |
| Att skriva koordinater för plattors hörn och konstruktioner | Dra i deras handtag; zooma in för precision och följ E och N i statusfältet |
| Fästning mot objekt (annat än mätpunkter för brytlinjer) | Zooma in och följ statusfältet |

## 3D-vy

| Finns inte ännu | I stället, idag |
|---|---|
| Att rita eller redigera i 3D-vyn | Rita och redigera i planen; 3D-vyn följer varje ändring |
| Att markera korridorens funktionslinjer eller GIS-objekt genom att klicka i 3D | Klicka på dem i planen |
| Att exportera den överdrivna vyn eller i fot | Exporter är i verklig skala i meter; se [Exportera platsen i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-exporter, etikettstorlekar och stilar i 3D | Etiketter visas endast i 3D-vyn, i en storlek; se [Visa platsen i 3D](topic:site-3d) |
| Texturer från foton, inspelning av en körning som video, skuggor från bortom platsen, soltimmar i 3D-vyn | Kartlager draperade över ytorna; kör och solens läge vid en tidpunkt; [soltimmar](topic:sun-hours) för en dag eller en säsong i planen |
