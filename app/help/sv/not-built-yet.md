---
title: Finns inte ännu
summary: Vad den här versionen av CivilCraft inte gör ännu, och vad du gör i stället idag.
keywords: saknas, begränsningar, färdplan, inte tillgänglig, spiraler, breddning, dwg, dxf, inlopp, fördröjning, tvärsektioner, kommer senare, gränser
from: a2d970ef
---

CivilCraft är tidigt i sin utveckling. Den här sidan listar vad den nuvarande versionen inte gör, så att du inte letar efter det. Inget här är utlovat till ett datum.

## Punkter

| Finns inte ännu | I stället, idag |
|---|---|
| Lägga till en andra punktfil till den första | Slå ihop filerna i en textredigerare eller ett kalkylblad först |
| Exportera en punkttextfil | Exportera LandXML (punkterna går ut som CgPoints), använd GIS {{ui:Exportera}} (punkter med fälten P, N, E, Z och D) eller {{ui:Kopiera}} punkterna till ett kalkylblad |
| Etikettstilar för punkter, symboler per beskrivningsnyckel, kurvor (bågar) från linjekoder, en beskrivningsnyckelfil att dela mellan projekt | Etiketter visar numret, höjden och beskrivningen, eller mindre ([CivilCraft-inställningar](topic:settings)); nycklar sparas i projektfilen |
| Enhetsomvandling | Konvertera filen innan du importerar; **Enheter** ändrar bara etiketten |

## Terrängmodeller

| Finns inte ännu | I stället, idag |
|---|---|
| Mer än en terrängmodell byggd av punkter | En projektfil per terrängmodell |
| Dölja (inre) avgränsningar | Använd **Längsta yttre kant** eller en yttre avgränsning |
| Markera eller redigera en ritad brytlinje | {{key:Mod+Z}}, eller {{ui:Ta bort ritade brytlinjer}} och rita om |
| Redigera en terrängmodell läst från LandXML (brytlinjer, avgränsning) | {{ui:Bygg om terrängmodellen från punkterna}} |
| Redigera en terrängmodell gjord av ett höjdrutnät | Importera rutnätet igen med andra val |
| Konvertera en terrängmodell läst från LandXML när koordinatsystemet ändras | Först {{ui:Bygg om terrängmodellen från punkterna}} |
| Märkta höjdkoter och lutningsvärden | Läs dem i statusfältet, eller färglägg terrängmodellen efter lutning med **Lutningsanalys** i arbetsytan Landskap ([Planering för landskap](topic:landscape-grading#grading-checks)) |

## Linjeföringar och profiler

| Finns inte ännu | I stället, idag |
|---|---|
| Spiraler annat än klotoid; en spiral mellan två kurvor (sammansatta övergångar) | Klotoidspiraler vid kurvans ändar finns; de övriga namnges och hoppas över vid LandXML-import |
| Infoga en PI mellan två andra | Rita om linjeföringen, eller skriv in PI-koordinaterna på nytt |
| Linjeföringar från objekt, förskjutningar, breddningar | Rita med PI:er |
| Skriva K för en vertikalkurva | Skriv L (K visas) |
| Cirkulära och osymmetriska vertikalkurvor | Endast symmetriska parabelkurvor |
| Mer än en projekterad profil per linjeföring | En linjeföring per variant |
| Zooma profilvyn, profilband under profilen | Profilvyn anpassas till hela linjeföringen; plotta den på [plan- och profilblad](topic:plan-profile-sheets) |
| Tvärsektioner i DWG eller LandXML | Tvärsektionsblad som PDF; {{ui:CSV}} av areorna och volymerna |
| Provlinjer i vinkel, eller med olika bredd längs vägen | En bredd på varje sida för hela linjeföringen |

## Korridorer

| Finns inte ännu | I stället, idag |
|---|---|
| Mittremsor, barriärer och en överhöjning som vrider mallar | Rita dem som mallar ([Korridormallar](topic:corridor-templates)); mallar per station tar ännu inte hänsyn till överhöjning |
| En gradvis övergång mellan två regioners mallar (övergångar, avsmalningar) | Byt mall vid en station, eller ge en punkt ett breddmål till en linje som ritas som avsmalningen |
| Rotation kring en kant, överhöjning i LandXML | Överhöjning roterar kring mittlinjen i cirkelkurvor; bred ut ett körfält med ett breddmål till en funktionslinje |
| Mål för släntlutningarna (dagljus mot en linje eller en terrängmodell), egna korridorterrängmodeller | Mål flyttar kanterna på vägbanan och axelremsorna ([Korridorer](topic:corridor)); korridoren planeras in i den projekterade terrängmodellen |
| Korridorer exporterade som LandXML-vägar; en andra korridor på en linjeföring i IFC-exporten | Den projekterade terrängmodellen exporteras |
| Terrängmallar som ändrar den projekterade terrängmodellen, i 3D eller i tvärsektionerna | De ger areor och volymer för varje lager ([Terrängmallar](topic:corridor-templates#terrain-templates)) |
| Svepkurvor med hastighet, däckglidning, styrtid, styrsläpvagnar eller kaross-frigång; ett bibliotek med standardiserade dimensionerande fordon; en svepkurva ritad genom att dra fordonet | Svepkurvor vid låg hastighet längs en funktionslinje eller linjeföring, med egna fordonsmått ([Fordonets svepkurvor](topic:swept-paths)) |

## Planering och volymer

| Finns inte ännu | I stället, idag |
|---|---|
| Bänkar, öppna funktionslinjer planerade in i projekteringen, planering mot en funktionslinje från någon annanstans | Stäng funktionslinjen ([Funktionslinjer](topic:feature-lines)), eller använd den som brytlinje för befintlig mark |
| Infoga eller ta bort en hörnpunkt på en funktionslinje | Rita linjen igen, eller gör en stegvis förskjutning av den |
| Bågar i ritade brytlinjer (genom mätpunkter), spiraler i funktionslinjer | Rita en funktionslinje med bågar och använd den som brytlinje för befintlig mark |
| Planering till ett avstånd, en höjd eller en annan terrängmodell | Dagljus mot befintlig mark endast |
| Lägga till eller ta bort ett hörn på en byggplatta | Ta bort plattan och rita den igen |
| TIN-till-TIN-volymer (prismor), val av rutnätscellens storlek | Rutnätsmetod, cellstorlek vald åt dig |
| Svällning och krympning, matjord, beläggningsdjup | Använd faktorerna på de rapporterade talen själv |
| Kostnader för fri och överlastad transport, transport mellan olika linjeföringar, låne- och deponiplatser placerade i planen | Massdiagrammet med balanspunkter, flyttade volymer och genomsnittliga transportsträckor |

## Ledningsnät

| Finns inte ännu | I stället, idag |
|---|---|
| Mer än ett nät per projekt | Separata projekt för dagvatten och spillvatten |
| Vattenledningar: vattnets kvalitet och ålder, regelbaserade styrningar, andra ventiltyper (flödesreglering, strypning, uppehållsventiler), pumpar angivna med effekt, efterfrågan som beror på tryck, ett Darcy–Weisbach-alternativ, en rörkatalog med väggtjocklekar och tryckklasser. Resten av trycknäten finns i labbet: [Vattenledningar](topic:water-mains) | Kontrollera dem i programvara för vattenfördelning; dimensionerande flöden för spillvatten finns i [Dimensionerande flöden för spillvatten](topic:sanitary-design) |
| Flöden i avloppsnät över tid (hydrografer, dynamisk ruttning, magasin, pumpar, överfall) | [Dimensionerande flöden för spillvatten](topic:sanitary-design) ger det stationära toppflöde som ett dimensioneringsblad använder |
| Inloppskapacitet, rännspridning, fördröjningsruttning, hydrografer, energiförluster utöver en knutpunktskoefficient | Kontrollera dem i annan programvara; flöden, dimensioner och trycklinjerna finns i [Dagvattendränering](topic:storm-drainage) |
| Upptagningsområden i PDF-plottet, DWG, DXF eller LandXML; upptagningsområden från terrängmodellen (vattendelare) | Rita upptagningsområden för hand; de sparas i projektfilen |
| Rörkataloger, icke-runda rör, konstruktioner som inte är upprätta lådor eller cylindrar (koner, steg, bänkning), en dräneringskategori i biblioteket | Konstruktionstyper från parametrar ([Ledningsnät](topic:pipe-network)); rör med en diameter |
| Rör i profilvyn, krökta rör | Läs bottennivåer och täckning i den högra panelen |

## Fastigheter

| Finns inte ännu | I stället, idag |
|---|---|
| Indelning av tomter efter area eller framkant, fastigheter från linjerna runt dem, vägrätt | Rita varje fastighet med dess hörn, eller ange dess avståndsangivelser |
| Kurvtabeller och linjetabeller på planen; etiketter flyttade för hand | Varje sträcka märks längs sig själv |
| Fastigheter i LandXML | Fastigheter sparas i projektfilen och går till PDF, DWG och DXF |

## Polygontåg

| Finns inte ännu | I stället, idag |
|---|---|
| Minsta kvadratmetodens utjämning, transitregeln, vägning av vinklar mot avstånd | Kompassregeln |
| Avvikelsevinklar, zenitvinklar och snedavstånd, höjder genom trigonometrisk avvägning | Reducera till horisontella avstånd och vinklar rätt, eller använd riktningar |
| Sidoobservationer, rådatafiler från datainsamlare | Importera punkterna som en punktfil |

## Utsättning

| Finns inte ännu | I stället, idag |
|---|---|
| Förskjutna pålar (referenspunkter satta bakom pålen), slänt-pålar vid anfallspunkten | Sätt ut vid de förskjutningar du behöver, även bortom axelremsen |
| Att skicka pålar direkt i en datainsamlares eget format | CSV-filen öppnas i kontorsprogrammet hos de flesta datainsamlare |
| Utsättning av rör, plattor och fastigheter | Använd mätpunkter nära en linjeföring, eller fastighetens sträckor |

## Filer och utdata

| Finns inte ännu | I stället, idag |
|---|---|
| Text, skraffering och mått från DWG eller DXF; pappersrum; länkade ritningar (externreferenser); binär DXF | Linjer från modellrummet öppnas ([Öppna en DWG eller DXF som linjer](topic:open-dwg-dxf)); öppna länkade ritningar var för sig |
| Flytta flera punkter samtidigt genom att dra | Klipp ut och klistra in dem, eller redigera dem en i taget |
| Porträttblad, egna ritningshuvuden, vyportar du ordnar, plan- och profilblad i DWG | Ett liggande planblad per PDF, eller plan- och profilblad längs en linjeföring (PDF) |
| Plottning av höjdband och profiler | Band finns bara på skärmen; ta en skärmbild om du behöver dem |
| Ändra lagernamn, färger eller etikettstilar | Ändra dem i ett CAD-program efter DXF-export |
| Molnsparande och versionshistorik | Spara `.civilcraft.json`-filer och säkerhetskopiera dem; för att arbeta tillsammans på ett projekt, använd en live-session i CadCraft Studio ([Planera en plats tillsammans, live](topic:work-live)) |
| CadCraft Studio för iPad och iPhone, och från Google Play | Använd CivilCraft i webbläsaren på enheten; på Android installeras CadCraft Studio från dess APK på getcadcraft.com/download |
| Öppna flera punkt- eller projektfiler samtidigt | En fil i taget (GIS-filer som hör ihop, till exempel delarna i en shapefil, öppnas tillsammans) |

## Landskap

| Finns inte ännu | I stället, idag |
|---|---|
| Tillverkares huvuden och munstycken | Generiska huvuden, eller lägg till egna från en fil; tillverkarnas data kommer in när de ger tillstånd |
| Maximala sidolängder för droppledningar, flöden över tid, pumpar, slingade rörnät | Håll droppsträckor till tillverkarens publicerade längd; kontrollen kräver ett förgreningsnät |
| Den exakta konturen av ett konkavt fritt objekt; dess volym under mark mätt exakt | Det konvexa höljet planeras och volymen under mark är en uppskattning (anges i Egenskaper) |
| Växter i BimCrafts och ModelCrafts egna Placera från bibliotek | Exportera landskaps-IFC och öppna den i BimCraft bredvid byggnaden |
| Detaljerade växtmodeller (löv, grenar, årstider) i 3D-vyn; fria objekt och bevattning i 3D-vyn | Växter visas i 3D som enkla former i storlek efter växtlistan ([Visa platsen i 3D](topic:site-3d)); ModelCrafts spridning gör planteringsbilder |
| Hårdgjorda murar som håller en planerad nivå bakom sig på terrängmodellen | Ge en plattform eller byggplatta lodräta sidor: då är de stödmurar på terrängmodellen ([Planering](topic:grading)) |
| SVG-transformationer i egna symboler; texturer och färger på egna GLB-växtmodeller; komprimerad GLB-geometri | Platta ut transformationer i ditt ritningsprogram först; modeller ritas i växtens färg; exportera GLB utan komprimering ([Växtgrafik](topic:plant-graphics)) |
| Din egen växtlista sparad på ditt bibliotekskonto (redigeras i appen) | Redigera projektets egna lista i växttabellen och spara den som en växtfil |
| Landskapsverktygen för assistenter utan fönstret (filservern och kommandoraden) | De fungerar när CivilCraft-fönstret är öppet ([Låt en AI-assistent arbeta med din plats](topic:assistants)) |

## Kraftledningar

| Finns inte ännu | I stället, idag |
|---|---|
| Ett lands standard inbyggd (lastfall, avstånd, faktorer) | Ange din standards värden i {{ui:Lastfall och gränser…}} och spara dem, med ditt bibliotek, som ett paket att återanvända och dela ([Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Det sidledes avståndet från en ledare till en trädkrona eller en mur bredvid linjen | Det lodräta avståndet rakt upp över växter och murar som linjen korsar ([Kraftledningskontroller](topic:power-line-checks#clearances)) |
| Ledarkrypning och en ny ledares töjning | Räkna in dem genom temperaturerna i spännvidstabellen |
| Termisk klassning av nedgrävda kablar (strömklassning utifrån hur de läggs) | Ange din leverantörs strömklassning på kabelposten |
| Kortslutnings-, skydds- och jordningsstudier | Använd ett särskilt elprogram; CivilCraft ger nätets längder och kablar |
| Gittertorn dimensionerade stång för stång, och spännankare i marken | Stolpar kontrolleras med sin nominella last; stag med sin märklast |
| En `.DON`-studiefil kontrollerad i programmet som läser den | Kontrollera filen där; skicka oss ett exempel så att vi kan testa mot en riktig fil |
| Kraftledningar i 3D-vyn och i IFC | Planen, linjeprofilen, bladen och GIS-lagren |
| Kraftledningsverktygen för assistenter utan fönstret | De fungerar när CivilCraft-fönstret är öppet ([Låt en AI-assistent arbeta med din plats](topic:assistants)) |

## Byggnadsvolymer

| Finns inte ännu | I stället, idag |
|---|---|
| Ett bibliotek med zonkoder eller någon stads regler | Skriv in gränserna från din egen förordning ([Zongränser](topic:zoning-limits)) |
| Himmelsljus på väggarna (fasaddagsljus), vind | [Soltimmar](topic:sun-hours) räknar endast direkt sol |
| Skugga från träd, växter eller allt som inte ritats som en volym | Rita grannbyggnader som volymer |
| Takformer på volymer | Volymer med platt topp |
| Öppningar, tak och väggtyper när en volym utvecklas i BimCraft | BimCraft bygger enkla yttervägar på varje våningsplan och ett bjälklag; lägg till resten där |

## GIS och koordinatsystem

| Finns inte ännu | I stället, idag |
|---|---|
| File Geodatabase; KML-stilar, ikoner, marköverlägg och nätverkslänkar | Konvertera först till GeoPackage, shapefile eller GeoJSON; KML-platsmärken läses utan sina stilar |
| Redigera GIS-objekt eller deras attribut | Redigera dem i ett GIS-program och importera igen. Analyspanelen skapar nya lager (buffert, överlagring, koppling, markering) och lägger till fält för area och längd, men den redigerar inte ett objekt på plats |
| Nätverks- och rasteranalys, buffertar med platta eller kvadratiska ändar och enkelsidiga buffertar, lägga till eller ta bort rader och ändra ett fälts typ i attributtabellen, egna klassfärger för hand, en stilförklaring i plottar | Använd Markera för att välja objekt och skapa ett lager av dem; platta ändar erbjuds inte. Färgläggning efter attribut och attributtabellen finns: se [Stila ett lager efter ett attribut](topic:gis-symbology) och [Arbeta med ett lagers attributtabell](topic:gis-table) |
| Etikettstilar (storlek, placering) och etiketter som undviker varandra | Etiketter har en storlek och kan överlappa där objekten är täta |
| Vertikala datum och geoidmodeller | Höjder används så som filen anger dem; kontrollera det vertikala datumet själv |
| Rutnätsförskjutningar utöver NAD83 från NAD27 som föreslås per område (OSTN15; NTv2 för andra datum fungerar när du lägger till filen), flera rutnät samtidigt, vertikala rutnät | Lägg till rutnätsfilen för ditt datum själv; ett rutnät per projekt |
| Kartlager i DXF- eller 3D-exporter | Kartlager går in i PDF-plottet, och bredvid DWG som en bild |
| Kartservrar som kräver inloggning, nyckel eller token | Använd publika tjänster, eller en georefererad bildfil |
| Skriva LAS- eller LAZ-filer från en terrängmodell, markmodellen eller höjdrutnäts- och LiDAR-verktygen | Exportera terrängmodeller som ett GeoTIFF-höjdrutnät. Tillägget [Punktmoln](topic:point-clouds) skriver ett rensat moln som LAS 1.4 eller LAZ |
| LiDAR-intensitet, färg och returer; höjdrutnät med flera band; rutnät- eller LiDAR-filer över 200 MB | LiDAR filtreras endast efter klass, och rutnät använder sitt första band; dela upp stora filer i rutor först |

## Inmatning

| Finns inte ännu | I stället, idag |
|---|---|
| Boxmarkering med touch (den kräver {{key:Shift}}) | Tryck länge på varje mätpunkt för att lägga till den |
| Skrivna koordinater eller avstånd medan du ritar | Rita ungefärligt, skriv sedan in exakta PI-koordinater i linjeföringens PI-tabell |
| Skriva koordinater för byggplattans hörn och konstruktioner | Dra deras handtag; zooma in för precision och följ E och N i statusfältet |
| Fångst till objekt (utom mätpunkter för brytlinjer) | Zooma in och följ statusfältet |

## 3D-vyn

| Finns inte ännu | I stället, idag |
|---|---|
| Rita eller redigera i 3D-vyn | Rita och redigera i planen; 3D-vyn följer varje redigering |
| Markera korridorfunktionslinjer eller GIS-objekt genom att klicka i 3D | Klicka på dem i planen |
| Exportera den överdrivna vyn eller i fot | Exporterna är i verklig skala i meter; se [Exportera platsen i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-exporter, etikettstorlekar och -stilar i 3D | Etiketter visas endast i 3D-vyn, i en storlek; se [Visa platsen i 3D](topic:site-3d) |
| Texturer från foton, inspelning av en körning som video, skuggor från bortom platsen, soltimmar visade i 3D-vyn | Kartlager draperade på terrängmodellerna; körningen och solens position vid en tidpunkt; [soltimmar](topic:sun-hours) för en dag eller säsong i planen |
