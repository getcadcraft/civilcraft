---
title: Nytt i 0.7 (tidigare)
summary: CivilCraft 0.7 lägger till en arbetsyta för kraftledningar (luftledningar och markkablar med egna bibliotek, hängning och spänning, kontroll av frigång och hållfasthet, utläggningstabeller, mängder, blad och GIS), en arbetsyta för landskap (växtlista, planteringsplaner och förteckningar, planering av landskap, beläggning, murar och trappsteg, en beräkningshjälp för bevattning, landskapsblad och frihandsobjekt), byggnadsvolymer med planbestämmelser du skriver in och soltimmar, klotoidövergångar, korridorer byggda av delar på varje sida, USD-export och fler verktyg för AI-assistenter.
keywords: nytt 0.7, tidigare version, versionsnoter, ändringslogg, ändringar, 0.7, version, nya funktioner, landskap, arbetsytan landskap, växtlista, växter, plantering, växtförteckning, bädd, häck, planering, plattform, vall, gräsdike, höjdkota, slänttanalys, vattenansamling, hårdgjorda ytor, beläggning, gångväg, mur, kantsten, ramp, trappsteg, bevattning, sprinkler, droppbevattning, landskapsblad, frihandsobjekt, byggnadsvolym, volymstudie, bruttoarea, planbestämmelser, avstånd, byggbar yta, himmelsplan, exploateringstal, bebyggelsegrad, soltimmar, skugga, ifc, utveckla i bimcraft, klotoid, övergång, sammansättning, trottoar, usd, assistenter, enheter, portugisiska
from: 797d2f2f
---

Det här är vad som ändrats i CivilCraft 0.7, jämfört med 0.6. De största nya delarna är arbetsytorna för Kraftledningar och Landskap samt byggnadsvolymer.

## Nytt

### Arbetsytan Landskap

- **En arbetsyta för Landskap på samma tomt.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Landskap}} lägger till verktyg för plantering, planering, hårdgjorda ytor och bevattning på den tomt du redan har: samma mätpunkter, ytor och projektfil. Välj **Civil** under **Arbetsyta** för att gå tillbaka. Se [Arbetsytan Landskap](topic:landscape).
- **En växtlista.** Cirka 420 vanliga tempererade och medelhavsväxter: träd, buskar, häckar, gräs, perenner, markskydd och klätterväxter, med storlek vid plantering och vid mognad, zon för härdighet, ljus, vatten och avstånd. Sök på valfritt namn på engelska, spanska eller portugisiska. Importera din egen lista som CSV; den sparas med projektet. De inbyggda storlekarna är typiska och avrundade: kontrollera dem med en lokal växtskola. Se [Växtlistan](topic:plant-list).
- **Planteringsplaner.** {{ui:Växt}} placerar enskilda växter som står på marken och följer senare planering, {{ui:Bädd}} fyller en kontur med växter i deras avstånd med en blandning i procent, och {{ui:Häck}} sätter en eller två rader längs en linje. Växterna märks ut i planen. Se [Planteringsplaner och förteckningar](topic:planting).
- **En växtförteckning.** Mer › {{ui:Växtförteckning…}} räknar växterna per art och planteringsstorlek. Spara den som CSV eller XLSX, eller skicka den till TakeoffCraft för prissättning. Se [Växtförteckningen](topic:planting#the-plant-schedule).
- **Planering för landskap.** {{ui:Planera}} har plattformar (plana eller fallande), vallar, gräsdiken och planeringsområden med höjdkotor och höjdkurvor som du drar. Schakt och fyllning visas medan du arbetar. **Slänttanalys** färgar ytan efter dina två egna gränser, och **Flödespilar och vattenansamling** visar var vattnet rinner och var det skulle samlas. Allt går in i samma föreslagna yta som byggplattor och korridorer. Se [Planering för landskap](topic:landscape-grading).
- **Beläggning, gångvägar, murar, kantstenar, ramper och trappsteg.** {{ui:Hårdgjorda ytor}} ritar beläggning med tvärfall eller fall mot en brunn, ett mönster och dess lager; gångvägar som följer marken; stödmurar och fristående murar med trappade grundsulor; kantstenar; och ramper och trappsteg kontrollerade mot gränser du anger. En stödmur över 1,2 m (4 ft) flaggas för en ingenjör. Se [Beläggning, murar och trappsteg](topic:hardscape).
- **En beräkningshjälp för bevattning.** {{ui:Bevattning}} placerar sprinklerhuvuden, laterala ledningar, huvudledningen, ventiler, droppledningar och anslutningspunkten. {{ui:Kontrollera systemet…}} hittar zonerna från ledningarna och räknar ut varje zons flöde, trycket som behövs vid dess ventil och vid tillförseln (Hazen–Williams), nederbörd, körtider, täckning och en stycklista. Det är ett beräkningsstöd, inte ett godkännande av en design: en bevattningskonstruktör kontrollerar varje resultat. Huvudena är allmänna typer, eller dina egna från en fil. Se [Bevattningsdesign](topic:irrigation).
- **Landskapsblad.** Mer › {{ui:Landskapsblad…}} gör planteringsplaner, planeringsplaner och bevattningsplaner med deras teckenförklaringar, och ett detaljblad med mursektioner, beläggningsuppbyggnader och trappsteg, som en PDF. Se [Landskapsblad](topic:landscape-sheets).
- **Frihandsobjekt.** Mer › {{ui:Frihandsobjekt…}} placerar ett STL-, OBJ- eller biblioteksobjekt som är ett nät gjort i ett annat program, till exempel en planteringslåda eller en skulptur. Det står på marken eller skärs in i den, och dess volym, area och fotavtryck räknas. Se [Frihandsobjekt](topic:freeform-objects).
- **Landskaps-IFC.** Mer › {{ui:Exportera landskaps-IFC}} sparar växter (som vegetation med sina egenskaper), hårdgjorda ytor och frihandsobjekt som IFC 4.3 för en BIM-modell. Se [IFC](topic:planting#ifc).
- **Från början till slut.** [Designa en trädgård, från början till slut](topic:landscape-walkthrough) går igenom hela arbetsytan på exempeltomten.

### Arbetsytan Kraftledningar

- **Luftledningar och markkablar på din tomt.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Arbetsytan Kraftledningar}}: rita en linje med dess stolpar, kablar i schakt, utrustning och hinder, på samma mark och i samma projektfil. Se [Arbetsytan Kraftledningar](topic:power-lines).
- **Egna bibliotek.** Ledare, kablar, stolpar, utrustning (tvärarmar, isolatorer, beslag, stag, transformatorer, skåp, skarvar) och schakttyper, i kategorier du namnger, delas som en fil eller ett kalkylblad. Inget lands eller tillverkares katalog är inbyggd; exemplen säger att de är exempel. Se [Ditt bibliotek för kraftledningar](topic:power-line-library).
- **Hängning och spänning under dina lastfall.** Temperatur, vind, is och is på ena sidan; spänningsgränser som en andel av brottstyrkan; den exakta kedjelinjen i varje spann, även i sluttningar; utläggningstabeller. Se [Hängning och spänning](topic:sag-and-tension).
- **Kontroller, alltid uppdaterade.** Frigång över marken och hinder, fasavstånd, isolatorns utsvängning, uppåtlyft, stolpbelastningar med dimensionering från ditt bibliotek, stag, beslag, grundläggningar, saknade data, frånkopplade kablar, överbelastningar och spänningsfall, flaggade i planen och i linjeprofilen. Ett designstöd: en ingenjör kontrollerar det. Se [Kontroller för kraftledningar](topic:power-line-checks).
- **Tabeller, blad och GIS.** Utläggnings- och stolpetabeller, mängder (CSV, Excel, TakeoffCraft), plan- och profilblad med en studierapport i en PDF, GIS-lager med varje tillgångs data. Se [Kraftledningstabeller, mängder, blad och GIS](topic:power-line-outputs).
- **Efter de första försöken.** Linjeprofilen följer den linje du markerar, har en lista **Linje**, läser marken, ledaren och frigången under pekaren och mäter mellan två punkter. Planterade växter och murar på landskapet räknas som hinder under linjer; kabelsträckningar och rör visas i linjeprofilen och korsar med en frigångsregel du väljer; **Regler…** bredvid varje frigång öppnar dina egna regler, och regeluppsättningar med ett bibliotek sparas som paket att dela per land. Se [Kontroller för kraftledningar](topic:power-line-checks) och [Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Dina egna filformat.** Kraftledningar sparas i CivilCraft-projektfilen, bibliotek i `.cclines.json` eller CSV, regeluppsättningar och paket i egna JSON-filer: öppna format som vem som helst kan läsa eller konvertera. `.DON`-studiefilen är en extra import och export vid sidan av dem.
- **Studiefiler (.DON), otestade.** Spara en linje som en `.DON`-studiefil för ett annat linjeprogram, eller läs in dess stolpar; byggd från formatets fältnamn, ännu inte testad med programmet. Se [Studiefiler](topic:power-line-study-file).

### Mätning

- **Ett mätverktyg.** {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Mät}} (eller {{key:M}}) mäter i planen: varje sidas längd och riktning, den löpande summan, längden längs marken och lutningen, och area och omkrets när du sluter formen. Ingenting ritas in i projektet. Se [Mät](topic:measure).

### Byggnadsvolymer

- **Rita byggnadsvolymer.** Under **Egenskaper**, under **Byggnadsvolymer**: {{ui:Rita en volym}} (även {{ui:Terrängmodell}} › {{ui:Mer}} › {{ui:Volymer}}). Ge en volym våningar och en våningshöjd och läs dess bruttoarea. Välj hur den sitter på sluttande mark (trappad, sockel eller urgrävd) och se fyllning och schakt. Volymerna visas i planen, i PDF och i DWG och DXF på egna lager. Se [Rita byggnadsvolymer på en tomt](topic:building-masses).
- **Skjut och dra i 3D.** I 3D-vyn drar du i takets handtag på en markerad volym, eller trycker på {{key:PageUp}} och {{key:PageDown}}, för att ändra den en våning i taget, i ett enda steg för ångra. {{ui:Sol}} kastar volymernas skuggor. Se [I 3D-vyn](topic:building-masses#in-the-3d-view).
- **Planbestämmelser du skriver in.** Avstånd rad för rad från gatulinjen, en höjdbegränsning, ett himmelsexponeringsplan, ett exploateringstal och en bebyggelsegrad. Den byggbara ytan ritas i planen, och varje volym får en bock eller ett kryss för varje gräns. CivilCraft har inga planbestämmelser i sig: varje siffra är en du skriver in från dina egna bestämmelser. Se [Kontrollera volymer mot de planbestämmelser du skriver in](topic:zoning-limits).
- **Soltimmar.** Välj en dag, eller en årstid, och en tidszon med namn eller förskjutning, och läs timmarna med direkt sol på varje vägg i varje volym, våning för våning, och på marken runt dem, ritade i planen. Spara väggarna och marken som CSV. Projektet behöver ett koordinatsystem. Se [Räkna ut soltimmarna på en tomt](topic:sun-hours).
- **Volymer som IFC, och vidare till BimCraft.** {{ui:Volymer som IFC}} sparar volymerna som IFC4, placerade på kartan när projektet har ett koordinatsystem. {{ui:Utveckla i BimCraft}} öppnar BimCraft i en ny flik med volymerna, där **Utveckla den här volymen** bygger väggar på varje plan och en golvyta från fotavtrycket. Ingenting laddas upp. Se [Skicka vidare](topic:building-masses#send-it-on).

### Linjeföringar

- **Klotoidövergångar.** Skriv en längd i **Övergång in** och **Övergång ut** i PI-tabellen för en kurva: tangent, övergång, kurva, övergång, tangent, med lika eller olika längder. Planen märker ut TS, SC, CS och ST, kurvlistan ger θs och tangent- och externa avstånd, och stationer och förskjutningar går genom övergångarna. Se [Övergångar](topic:alignment#spirals).
- **Övergångar i LandXML.** LandXML skriver och läser klotoidövergångar. Linjeföringar med övergångar, som CivilCraft tidigare hoppade över vid import, öppnas nu. Se [Exportera LandXML](topic:landxml).

### Korridorer

- **Bygg varje sida av delar.** Slå på **Bygg varje sida av delar** för att ge varje sida sin egen lista från mittlinjen och utåt: körfält, vägren, rännsten, kantsten, planteringsremsa, trottoar och en sidoslänt med egen schakt och fyllning. Börja från {{ui:Landsväg}} eller {{ui:Stadsgata}} och kopiera en sida till den andra. Tvärsektioner märker ut flödeslinjen, kantstenen och gångbanan, och den planerade ytan har kantstenen. Se [Bygg varje sida av delar](topic:corridor#build-each-side-from-parts).
- **Överhöjning över övergångar.** På en kurva med övergångar löper överhöjningens övergång över övergången: plan tvärprofil vid TS, full överhöjning vid SC. Se [Överhöjning](topic:corridor#superelevation).

### 3D-filer

- **USD-export.** I 3D-vyn skriver {{ui:USD}} platsen som `.usda`, `.usdc` eller `.usdz` i verklig skala och med sina projektkoordinater: ytor, rör och konstruktioner som nät, linjer, varje linjeföring och mätpunkter med sina nummer. Se [Exportera den 3D-platsen som USD](topic:usd).

### AI-assistenter

- **Mer för assistenter.** Med assistenter påslagna i {{ui:Inställningar}} › {{ui:CivilCraft}} kan en assistent nu även läsa fastigheter, schakt och fyllning och profiler, lägga till mätpunkter, spara projektet, exportera LandXML, DWG och USD, och arbeta i mappar du väljer i CadCraft Studio. Arbetsytan Landskap lägger till verktyg för att hitta växter, placera växter, bäddar och häckar, planera och kontrollera bevattningen. Filservern och kommandoraden `cadcraft` öppnar sparade projekt utan fönstret. Se [Låt en AI-assistent arbeta med din plats](topic:assistants).

## I alla appar

- **Enheter.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Enheter}} har en lista var för längd, area, volym, vinkel och lutning, med de exakta storlekarna som enheternas definitioner ger (US survey foot är en egen enhet). Stäng av de enheter du aldrig använder så lämnar de enhetslistorna; markera en och nytt arbete startar i den. En fil behåller alltid sin egen enhet. I CivilCraft följer projektets lista **Enheter** strömbrytarna; en stjärna på en metrisk längd startar nya projekt i meter (annars i fot, som är US survey foot), en stjärna på en area eller volym väljer enheten areor och volymer redovisas i, och en längdruta tar vilken enhets beteckning som helst, till exempel `3 ch` eller `450 mm`. Se [Enheter, skrivna värden och enhetslistorna](common:unit-lists).
- **En tätare layout och paneler som städar undan sig.** {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Layouttäthet}} › {{ui:Kompakt}} får plats med mer på skärmen (pekskärmar och telefoner behåller sina stora knappar). Varje sidopanel har en smal namnlist: dra den för att docka eller frigöra panelen, släpp den på en annan panels lista för att dela en ram som flikar, fäst den för att glida undan mot kanten, eller dölj den och hämta tillbaka den från kanten. Se [Ordna panelerna](common:arrange-panels#make-the-layout-denser).
- **Dialogrutor flyttas.** Dra en dialogruta i namnlisten ur vägen för ritningen; den kommer tillbaka dit du lämnade den. Dubbelklicka på namnlisten för att centrera den igen. Se [Flytta en dialogruta](common:arrange-panels#move-a-dialog).
- **Recept för AI-assistenter.** Tio genomarbetade förfrågningar för din egen assistent (städa upp en ritning, plotta en sats, kontrollera ritningar, ställa frågor till en modell, summera en mängdavtagning, prova en variant av en del …), var och en med de verktyg den anropar och de behörigheter den behöver, och var och en körd igen av våra tester. Apparna innehåller ingen AI. Se [Recept för AI-assistenter](common:assistants-recipes).
- **Språk.** **Português (Portugal)** är nytt i {{ui:Inställningar}} › {{ui:Allmänt}} › {{ui:Språk}}. Det, **Português (Brasil)**, **Español (México)** och **Bahasa Indonesia** har nu varje ord i apparna, som utkast som ännu inte granskats av en modersmålstalare. Hjälpavsnitten finns på engelska, några på spanska.
- **CadCraft Studio** säger varför en uppdateringskontroll misslyckades (ingen fil för ditt system ännu, inget nätverk, en felaktig signatur) i stället för bara "Klar", och slutar visa ett kort för Nytt som du stängt förrän det finns en nyare version.

## Inte i den här versionen ännu

- **0.7 är inte kodsignerad.** Signering och Microsoft Store-paketet flyttades till 0.8 eftersom certifikatvalideringen ännu inte kommit fram. Kontrollera SHA-256-värdet bredvid varje fil på getcadcraft.com/download. På Windows, om SmartScreen stoppar installationsprogrammet, välj {{ui:Mer information}} och sedan {{ui:Kör ändå}}. På en Mac: första gången högerklickar du på CadCraft Studio och väljer {{ui:Öppna}}. CadCraft Studio finns inte i någon appbutik ännu, och det finns ingen iPad- eller iPhone-version ännu.
- Vinkel- och lutningslistorna i {{ui:Enheter}} sparas, men ingen ruta läser dem ännu.
- Tillverkarnas bevattningshuvuden: bara allmänna huvuden och dina egna huvuden från en fil. Tillverkarnas data kommer in först med deras tillstånd, och inget har getts ännu.
- BimCraft och ModelCraft har växtlistan, men deras Placera från bibliotek erbjuder inga växter ännu. Växter når BimCraft genom landskaps-IFC.
- Landskapsverktygen för assistenter fungerar med CivilCraft-fönstret öppet; filservern och kommandoraden har dem inte ännu.
- Byggnadsvolymer: ingen dagsljus eller vind på fasader, ingen skugga från träd eller allt som inte ritats som en volym, inga takformer, och soltimmarna visas i planen, inte i 3D-vyn. Utveckla i BimCraft bygger enkla väggar och ett golv, utan öppningar eller tak.
- Kraftledningar: ingen lands standard är inbyggd (du anger lastfallen, gränserna och frigångarna); inga studier av krypning i ledare, termisk belastning för nedgrävda kablar, kortslutning, skydd eller jordning; inga linjer i 3D-vyn eller IFC. `.DON`-studiefilen har inte testats med programmet som läser den.
- Övergångar som inte är klotoider, en övergång mellan två kurvor, och övergångar i brytlinjer. Övergångarna har kontrollerats mot formlerna och LandXML-schemat, inte ännu mot en LandXML-fil med övergångar från ett annat program.
- Korridorsammansättningar som ändras längs vägen, regioner och mål för sidoslänten.
- Vattenledningar och tryckledningsnät (nästa civila arbete), flöden som ändras över tid, och kopplingar mellan vatten- och dagvattennät.
- Bågar i ritade brytlinjer. Standardtabeller för dimensionerande fordon: de fem fordon som levereras är platshållare. Funktionslinjer som delas mellan projekt väntar på teamprojekt.

Allt annat finns i [Inte byggt ännu](topic:not-built-yet).
