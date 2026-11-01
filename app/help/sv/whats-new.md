---
title: Nyheter i 0.7
summary: CivilCraft 0.7 lägger till en arbetsyta för kraftledningar (luftledningar och markkablar med egna bibliotek, hängning och spänning, kontroller av frihöjd och hållfasthet, dragningstabeller, mängder, blad och GIS), en arbetsyta för landskap (växtförteckning, planteringsplaner och förteckningar, landskapsplanering, beläggning, murar och trappsteg, ett beräkningsstöd för bevattning, landskapsblad och frihandsobjekt), byggnadsvolymer med zonbestämmelser som du skriver in och soltimmar, klotoider, korridorer byggda av delar på varje sida, USD-export och fler verktyg för AI-assistenter.
keywords: nyheter, vad är nytt, versionsanteckningar, ändringslogg, ändringar, 0.7, version, nya funktioner, landskap, arbetsyta landskap, växtförteckning, växter, plantering, planteringsförteckning, bädd, häck, planering, plattform, vall, svacka, höjdkota, lutningsanalys, vattensamling, hårdgjorda ytor, beläggning, gångväg, mur, kantsten, ramp, trappsteg, bevattning, sprinkler, dropp, landskapsblad, frihandsobjekt, byggnadsvolym, volymstudie, bruttoarea, zonbestämmelser, byggnadsavstånd, byggrätt, skyddsplan mot solljus, exploateringsgrad, byggnadsarea, soltimmar, skugga, ifc, utveckla i bimcraft, spiral, klotoid, övergångskurva, sammansättning, kantsten, rännsten, trottoar, usd, assistenter, enheter, portugisiska
from: 3c9d79db
---

Det här är vad som ändrats i CivilCraft 0.7 jämfört med 0.6. De största nyheterna är arbetsytorna Kraftledningar och Landskap samt byggnadsvolymer.

## Nytt

### Arbetsytan Landskap

- **En arbetsyta för landskap på samma plats.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Landskap}} lägger till verktyg för plantering, planering, hårdgjorda ytor och bevattning på den plats du redan har: samma inmätningspunkter, terrängmodeller och projektfil. Välj **Civil** under **Arbetsyta** för att gå tillbaka. Se [Arbetsytan Landskap](topic:landscape).
- **En växtförteckning.** Omkring 420 vanliga träd, buskar, häckar, gräs, perenner, marktäckare och klätterväxter för tempererat och medelhavsklimat, med deras storlekar vid plantering och i fullvuxet skick, härdighetszon, ljus, vatten och avstånd. Sök på valfritt namn på engelska, spanska eller portugisiska. Importera din egen lista som CSV; den sparas med projektet. De inbyggda storlekarna är typiska och avrundade: kontrollera dem med en lokal plantskola. Se [Växtförteckningen](topic:plant-list).
- **Planteringsplaner.** {{ui:Växt}} placerar enstaka växter som sitter på marken och följer senare planering, {{ui:Bädd}} fyller en kontur med växternas avstånd och en blandning i procent, och {{ui:Häck}} lägger en eller två rader längs en linje. Växterna märks ut på planen. Se [Planteringsplaner och förteckningar](topic:planting).
- **En planteringsförteckning.** Mer › {{ui:Växtförteckning…}} räknar växterna per art och planteringsstorlek. Spara den som CSV eller XLSX, eller skicka den till TakeoffCraft för prissättning. Se [Planteringsförteckningen](topic:planting#the-plant-schedule).
- **Planering för landskap.** {{ui:Planera}} har plattformar (plana eller med fall), vallar, svackor och planeringsytor med höjdkotor och höjdkurvor som du drar i. Schakt och fyllning visas medan du arbetar. **Lutningsanalys** färgar terrängmodellen efter dina egna två gränser, och **Flödespilar och vattensamling** visar var vatten rinner och var det skulle samlas. Allt går in i samma projekterade terrängmodell som byggplattor och korridorer. Se [Planering för landskap](topic:landscape-grading).
- **Beläggning, gångar, murar, kantstenar, ramper och trappsteg.** {{ui:Hårdgjorda ytor}} ritar beläggning med tvärfall eller fall mot en brunn, ett mönster och dess lager; gångar som följer marken; stödmurar och fristående murar med trappade fundament; kantstenar; samt ramper och trappsteg som kontrolleras mot gränser du anger. En stödmur över 1,2 m (4 ft) flaggas för en ingenjör. Se [Beläggning, murar och trappsteg](topic:hardscape).
- **Ett beräkningsstöd för bevattning.** {{ui:Bevattning}} placerar sprinklerhuvuden, grenledningar, huvudledningen, ventiler, droppslangar och anslutningspunkten. {{ui:Kontrollera systemet…}} hittar zonerna utifrån rören och räknar ut varje zons flöde, trycket som behövs vid dess ventil och vid tillförseln (Hazen–Williams), nederbörd, gångtider, täckning och en materiallista. Det är ett beräkningsstöd, inte ett projekteringsintyg: en bevattningsprojektör kontrollerar varje resultat. Huvudena är generiska typer, eller dina egna från en fil. Se [Bevattningsprojektering](topic:irrigation).
- **Landskapsblad.** Mer › {{ui:Landskapsblad…}} gör plantering-, planerings- och bevattningsplaner med sina teckenförklaringar, samt ett detaljblad med murssektioner, beläggningsuppbyggnader och trappsteg, som en enda PDF. Se [Landskapsblad](topic:landscape-sheets).
- **Frihandsobjekt.** Mer › {{ui:Frihandsobjekt…}} placerar ett STL-, OBJ- eller biblioteksobjekt som nät och är gjort i en annan app, till exempel en planteringslåda eller en skulptur. Det ligger på marken eller skär in i den, och dess volym, area och fotavtryck räknas. Se [Frihandsobjekt](topic:freeform-objects).
- **IFC för landskap.** Mer › {{ui:Exportera landskaps-IFC}} sparar växter (som vegetation med sina egenskaper), hårdgjorda ytor och frihandsobjekt som IFC 4.3 för en BIM-modell. Se [IFC](topic:planting#ifc).
- **Från start till mål.** [Projektera en trädgård, från start till mål](topic:landscape-walkthrough) går igenom hela arbetsytan på exempelplatsen.

### Arbetsytan Kraftledningar

- **Luftledningar och markkablar på din plats.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Kraftledningar}}: rita en ledning utifrån dess stolpar, kablar i diken, utrustning och hinder, på samma mark och i samma projektfil. Se [Arbetsytan Kraftledningar](topic:power-lines).
- **Dina egna bibliotek.** Ledare, kablar, stolpar, utrustning (traverser, isolatorer, beslag, stag, transformatorer, skåp, skarvar) och dikestyper, i kategorier som du namnger, delade som en fil eller ett kalkylblad. Inget lands eller någon tillverkares katalog är inbyggd; exemplen säger att de är exempel. Se [Ditt bibliotek för kraftledningar](topic:power-line-library).
- **Hängning och spänning under dina lastfall.** Temperatur, vind, is och is på ena sidan; spänningsgränser som en andel av brottlasten; den exakta kedjekurvan i varje spann, lutningar inräknade; dragningstabeller. Se [Hängning och spänning](topic:sag-and-tension).
- **Kontroller som alltid är aktuella.** Frihöjd över marken och hinder, fasavstånd, isolatorsvängning, lyftkraft, stolplaster med dimensionering från ditt bibliotek, stag, beslag, fundament, saknade data, frånkopplade kablar, överlaster och spänningsfall, flaggade på planen och i ledningsprofilen. Ett projekteringsstöd: en ingenjör kontrollerar det. Se [Kontroller av kraftledningar](topic:power-line-checks).
- **Tabeller, blad och GIS.** Dragnings- och stolptabeller, mängder (CSV, Excel, TakeoffCraft), plan- och profilblad med en studierapport i en PDF, GIS-lager med varje anläggningsdels data. Se [Tabeller, mängder, blad och GIS för kraftledningar](topic:power-line-outputs).
- **Efter de första försöken.** Ledningsprofilen följer den ledning du markerar, har en lista **Ledning**, läser av mark, ledare och frihöjd under pekaren och mäter mellan två punkter. Växter och murar i landskapet räknas som hinder under ledningar; kabelsträckor och rör visas i ledningsprofilen och korsar med en frihöjdsregel som du väljer; **Regler…** bredvid varje frihöjd öppnar dina egna regler; och regeluppsättningar med ett bibliotek sparas som paket att dela per land. Se [Kontroller av kraftledningar](topic:power-line-checks) och [Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Dina egna filformat.** Kraftledningar sparas i CivilCraft-projektfilen, bibliotek i `.cclines.json` eller CSV, regeluppsättningar och paket i egna JSON-filer: öppna format som vem som helst kan läsa eller omvandla. Studiefilen `.DON` är en extra import och export vid sidan av dem.
- **Studiefiler (.DON), otestade.** Spara en ledning som en `.DON`-studiefil för ett annat ledningsprogram, eller läs en fils stolpar; byggt utifrån formatets fältnamn, ännu inte testat med det programmet. Se [Studiefiler](topic:power-line-study-file).

### Mätning

- **Ett Mät-verktyg.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Mät}} (eller {{key:M}}) mäter på planen: varje sidas längd och riktning, löpande summa, längden längs marken och lutningen, samt area och omkrets när du sluter figuren. Inget ritas in i projektet. Se [Mät](topic:measure).

### Byggnadsvolymer

- **Rita byggnadsvolymer.** I Egenskaper, under **Byggnadsvolymer**, {{ui:Rita en volym}} (även {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Volymer}}). Ge en volym våningar och en våningshöjd och läs av dess bruttoarea. Välj hur den placeras på sluttande mark (trappad, podium eller nedschaktad) och se fyllningen och schaktet. Volymer visas på planen, i PDF-filen och i DWG och DXF på egna lager. Se [Rita byggnadsvolymer på en plats](topic:building-masses).
- **Tryck och dra i 3D.** I 3D-vyn drar du en markerad volyms tak, eller trycker på {{key:PageUp}} och {{key:PageDown}}, för att ändra den en våning i taget, i ett enda ångra-steg. **Sol** kastar volymernas skuggor. Se [I 3D-vyn](topic:building-masses#in-the-3d-view).
- **Zonbestämmelser som du skriver in.** Byggnadsavstånd rad för rad från gatulinjen, en höjdgräns, ett skyddsplan mot solljus, en exploateringsgrad och en byggnadsarea. Den bebyggbara ytan ritas på planen, och varje volym får en bock eller ett kryss för varje gräns. CivilCraft har ingen zonkod inbyggd: varje tal är ett som du skriver in från din egen bestämmelse. Se [Kontrollera volymer mot zonbestämmelser som du skriver in](topic:zoning-limits).
- **Soltimmar.** Välj en dag, eller en årstid, och en tidszon med namn eller förskjutning, och läs av timmarna med direkt sol på varje vägg i varje volym, våning för våning, och på marken runt omkring, ritat på planen. Spara väggarna och marken som CSV. Projektet behöver ett koordinatsystem. Se [Räkna ut soltimmarna på en plats](topic:sun-hours).
- **Volymer som IFC, och vidare till BimCraft.** {{ui:Volymer som IFC}} sparar volymerna som IFC4, placerade på kartan när projektet har ett koordinatsystem. {{ui:Utveckla i BimCraft}} öppnar BimCraft i en ny flik med volymerna, där **Utveckla den här volymen** bygger väggar på varje nivå och ett golv av fotavtrycket. Inget laddas upp. Se [Skicka vidare](topic:building-masses#send-it-on).

### Linjeföringar

- **Klotoider.** Skriv en längd i **Klotoid in** och **Klotoid ut** i PI-tabellen för en kurva: raksträcka, klotoid, kurva, klotoid, raksträcka, med lika eller olika längder. Planen märker TS, SC, CS och ST, kurvlistan anger θs samt tangent- och ytteravstånd, och stationer och avstånd löper genom klotoiderna. Se [Klotoider](topic:alignment#spirals).
- **Klotoider i LandXML.** LandXML skriver och läser klotoider. Linjeföringar med klotoider, som CivilCraft tidigare hoppade över vid import, öppnas nu. Se [Utbyt LandXML](topic:landxml).

### Korridorer

- **Bygg varje sida av delar.** Slå på **Bygg varje sida av delar** för att ge varje sida en egen lista från mittlinjen och utåt: körfält, en vägren, en rännsten, en kantsten, en planteringsremsa, en trottoar och en slänt med egen schakt och fyllning. Börja från {{ui:Landsväg}} eller {{ui:Stadsgata}} och kopiera en sida till den andra. Tvärsektioner markerar rännlinjen, kantstenen och gångytan, och den planerade terrängmodellen har kantstenen. Se [Bygg varje sida av delar](topic:corridor#build-each-side-from-parts).
- **Överhöjning över klotoider.** På en kurva med klotoider löper överhöjningens övergång över klotoiden: plan vägbana vid TS, full överhöjning vid SC. Se [Överhöjning](topic:corridor#superelevation).

### 3D-filer

- **USD-export.** I 3D-vyn skriver {{ui:USD}} platsen som `.usda`, `.usdc` eller `.usdz` i sann skala och med sina projektkoordinater: terrängmodeller, ledningar och konstruktioner som nät, linjer, varje linjeföring och inmätningspunkter med sina nummer. Se [Exportera 3D-platsen som USD](topic:usd).

### AI-assistenter

- **Mer för assistenter.** Med assistenter påslagna i {{ui:Inställningar}} › {{ui:CivilCraft}} kan en assistent nu även läsa fastigheter, schakt och fyllning och profiler, lägga till inmätningspunkter, spara projektet, exportera LandXML, DWG och USD samt arbeta i mappar som du väljer i CadCraft Studio. Arbetsytan Landskap lägger till verktyg för att hitta växter, placera växter, bäddar och häckar, planera och kontrollera bevattningen. Filservern och kommandoraden `cadcraft` öppnar sparade projekt utan fönstret. Se [Låt en AI-assistent arbeta med din plats](topic:assistants).

## I alla appar

- **Enheter.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Enheter}} har en lista vardera för längd, area, volym, vinkel och lutning, med de exakta storlekar som enheternas definitioner ger (den amerikanska inmätningsfoten är en egen enhet). Slå av enheter du aldrig använder så försvinner de ur enhetslistorna; markera en med stjärna så börjar nytt arbete i den. En fil behåller alltid sin egen enhet. I CivilCraft följer projektets lista **Enheter** reglagen; en stjärna på en metrisk längd startar nya projekt i meter (annars fot, som är amerikanska inmätningsfot), en stjärna på area eller volym anger enheten som areor och volymer redovisas i, och en längdruta tar vilken enhets beteckning som helst, till exempel `3 ch` eller `450 mm`. Se [Enheter, inskrivna värden och enhetslistorna](common:unit-lists).
- **Tätare layout och paneler som städas undan.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Layouttäthet}} › {{ui:Kompakt}} ger plats för mer på skärmen (pekskärmar och telefoner behåller sina stora knappar). Varje sidopanel har ett smalt namnfält: dra det för att docka eller frigöra panelen, släpp det på en annan panels fält för att dela en ram som flikar, fäst det så att det glider undan till kanten, eller dölj det och hämta tillbaka det från kanten. Se [Ordna panelerna](common:arrange-panels#make-the-layout-denser).
- **Dialogrutor flyttas.** Dra en dialogruta i dess namnfält åt sidan så att den inte skymmer ritningen; den kommer tillbaka där du lämnade den. Dubbelklicka på namnfältet för att centrera den igen. Se [Flytta en dialogruta](common:arrange-panels#move-a-dialog).
- **Recept för AI-assistenter.** Tio genomarbetade förfrågningar för din egen assistent (städa en ritning, plotta en sats, kontrollera ritningar, ställa frågor till en modell, summera en mängdavtagning, prova en delvariant …), var och en med de verktyg den anropar och de behörigheter den behöver, och var och en återspelad av våra tester. Apparna innehåller ingen AI. Se [Recept för AI-assistenter](common:assistants-recipes).
- **Språk.** **Português (Portugal)** är nytt under {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Språk}}. Det, **Português (Brasil)**, **Español (México)** och **Bahasa Indonesia** har nu varje ord i apparna, som utkast som ännu inte granskats av en modersmålstalare. Hjälpämnena är på engelska, några på spanska.
- **CadCraft Studio** anger varför en uppdateringskontroll misslyckades (ännu ingen fil för ditt system, inget nätverk, en felaktig signatur) i stället för bara ”Klart”, och slutar ta tillbaka ett Nyheter-kort som du stängt tills det finns en nyare version.

## Inte i den här versionen ännu

- **0.7 är inte kodsignerad.** Signering och Microsoft Store-paketet flyttades till 0.8 eftersom certifikatvalideringen ännu inte har gått igenom. Kontrollera SHA-256 vid varje fil på getcadcraft.com/download. Om SmartScreen stoppar installationsprogrammet i Windows väljer du {{ui:Mer information}} och sedan {{ui:Kör ändå}}. På en Mac högerklickar du första gången på CadCraft Studio och väljer {{ui:Öppna}}. CadCraft Studio finns inte i någon appbutik ännu, och det finns ännu ingen version för iPad eller iPhone.
- Vinkel- och lutningslistorna under {{ui:Enheter}} sparas, men ingen ruta läser dem ännu.
- Tillverkares bevattningshuvuden: bara generiska huvuden och dina egna huvuden från en fil. Tillverkares data kommer in först med deras tillstånd, och inget har getts ännu.
- BimCraft och ModelCraft har växtförteckningen, men deras Placera från bibliotek erbjuder inga växter ännu. Växter når BimCraft via landskaps-IFC.
- Landskapsverktygen för assistenter fungerar med CivilCraft-fönstret öppet; filservern och kommandoraden har dem inte ännu.
- Byggnadsvolymer: ingen dagsljus- eller vindberäkning för fasader, ingen skugga från träd eller något som inte ritats som en volym, inga takformer, och soltimmar visas på planen, inte i 3D-vyn. Utveckla i BimCraft bygger enkla väggar och ett golv, utan öppningar eller tak.
- Kraftledningar: ingen lands standard är inbyggd (du anger lastfall, gränser och frihöjder); ingen ledarkryp, termisk märkström för nedgrävda kablar, kortslutnings-, skydds- eller jordningsstudier; inga ledningar i 3D-vyn eller IFC. Studiefilen `.DON` har inte testats med programmet som läser den.
- Andra spiraler än klotoider, en spiral mellan två kurvor och spiraler i funktionslinjer. Klotoiderna har kontrollerats mot formlerna och LandXML-schemat, ännu inte mot en LandXML-fil med klotoider från ett annat program.
- Korridorsammansättningar som ändras längs vägen, regioner och mål för släntlutningen.
- Vattenledningar och tryckledningsnät (nästa markarbete), flöden som ändras över tid och länkar mellan vatten- och dagvattennät.
- Bågar i ritade brytlinjer. Standardtabeller för dimensionerande fordon: de fem fordon som följer med är märkta platshållare. Funktionslinjer som delas mellan projekt väntar på teamprojekt.

Allt annat finns i [Finns inte ännu](topic:not-built-yet).
