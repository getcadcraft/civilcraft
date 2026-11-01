---
title: Nyheder i 0.7
summary: CivilCraft får et arbejdsområde Landskab med plantelister, planering, befæstelse og vanding, et arbejdsområde Elledninger med hængning og spænding, bygningsmasser med zonebestemmelser og soltimer, en Mål-funktion, overgangskurver, en korridor opbygget af dele, USD-eksport og mere til AI-assistenter.
keywords: nyheder, hvad er nyt, udgivelsesnoter, ændringslog, ændringer, 0.7, version, nye funktioner, landskab, landskabsarbejdsområde, planteliste, planter, beplantning, bed, hæk, planering, platform, vold, lavning, koteangivelse, faldanalyse, vandansamling, befæstelse, belægning, sti, mur, kantsten, rampe, trin, vanding, sprinkler, dryp, landskabsark, frit objekt, bygningsmasse, masser, bruttoetageareal, zonebestemmelser, byggelinje, afstandsplan, bebyggelsesprocent, soltimer, skygge, ifc, udvikl i bimcraft, spiral, klotoide, overgang, samling, kantsten, rendesten, fortov, usd, assistenter, enheder, portugisisk
from: 3c9d79db
---

Det her er, hvad der ændrede sig i CivilCraft 0.7 i forhold til 0.6. De største nye dele er arbejdsområderne Elledninger og Landskab samt bygningsmasser.

## Nyt

### Arbejdsområdet Landskab

- **Et arbejdsområde Landskab på samme område.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Landskabsarbejdsområde}} tilføjer værktøjer til beplantning, planering, befæstelse og vanding til det område, du allerede har: de samme opmålingspunkter, overflader og projektfil. Vælg **Civil** under **Arbejdsområde** for at gå tilbage. Se [Arbejdsområdet Landskab](topic:landscape).
- **En planteliste.** Omkring 420 almindelige træer, buske, hække, græsser, stauder, bunddækkende planter og klatreplanter fra tempereret og middelhavsklima med deres størrelser ved plantning og som udvoksede, hårdførhedszone, lys, vand og afstand. Søg på ethvert navn på engelsk, spansk eller portugisisk. Importér din egen liste som CSV; den gemmes med projektet. De indbyggede størrelser er typiske og afrundede: kontrollér dem hos en lokal planteskole. Se [Plantelisten](topic:plant-list).
- **Beplantningsplaner.** {{ui:Plante}} placerer enkeltplanter, der sidder på jorden og følger senere planering, {{ui:Bed}} fylder en kontur ved planternes afstand med en blanding efter procent, og {{ui:Hæk}} sætter en eller to rækker langs en linje. Planter får etiketter på planen. Se [Beplantningsplaner og lister](topic:planting).
- **En planteliste til mængder.** Mere › {{ui:Planteliste…}} tæller planterne efter art og plantestørrelse. Gem den som CSV eller XLSX, eller send den til TakeoffCraft for at prissætte. Se [Plantelisten til mængder](topic:planting#the-plant-schedule).
- **Planering til landskab.** {{ui:Planér}} har platforme (vandrette eller faldende), volde, lavninger og planeringsområder med koteangivelser og højdekurver, du trækker i. Afgravning og opfyld vises, mens du arbejder. **Faldanalyse** farver overfladen efter dine egne to grænser, og **Strømningspile og vandansamling** viser, hvor vandet løber, og hvor det ville samle sig. Alt sammen indgår i den samme projekterede overflade som plateauer og korridorer. Se [Planering til landskab](topic:landscape-grading).
- **Belægning, stier, mure, kantsten, ramper og trin.** {{ui:Befæstelse}} tegner belægning med tværfald eller fald til et afløb, et mønster og dets lag; stier, der følger terrænet; støttemure og fritstående mure med trinvise fundamenter; kantsten; og ramper og trin kontrolleret mod grænser, du angiver. En støttemur over 1,2 m (4 ft) markeres til en ingeniør. Se [Belægning, mure og trin](topic:hardscape).
- **En hjælp til beregning af vanding.** {{ui:Vanding}} placerer hoveder, sidegrene, hovedledningen, ventiler, dryplinjer og tilslutningspunktet. {{ui:Kontrollér anlægget…}} finder zonerne ud fra rørene og udregner hver zones flow, det tryk der kræves ved dens ventil og ved forsyningen (Hazen–Williams), nedbør, driftstider, dækning og en stykliste. Det er en beregningshjælp, ikke en dimensioneringscertificering: en vandingsprojektant kontrollerer hvert resultat. Hovederne er generiske slags eller dine egne fra en fil. Se [Vandingsprojektering](topic:irrigation).
- **Landskabsark.** Mere › {{ui:Landskabsark…}} laver beplantnings-, planerings- og vandingsplaner med deres signaturforklaringer og et detaljeark med vægsnit, belægningsopbygninger og trin, som én PDF. Se [Landskabsark](topic:landscape-sheets).
- **Frie objekter.** Mere › {{ui:Frit objekt…}} placerer et STL-, OBJ- eller biblioteksnet lavet i en anden app, som en plantekasse eller en skulptur. Det sidder på jorden eller skærer ind i den, og dets rumfang, areal og fodaftryk tælles med. Se [Frie objekter](topic:freeform-objects).
- **Landskabs-IFC.** Mere › {{ui:Eksportér landskabs-IFC}} gemmer planter (som vegetation med deres egenskaber), befæstelse og frie objekter som IFC 4.3 til en BIM-model. Se [IFC](topic:planting#ifc).
- **Fra start til slut.** [Projektér en have, fra start til slut](topic:landscape-walkthrough) gennemgår hele arbejdsområdet på eksempelområdet.

### Arbejdsområdet Elledninger

- **Luftledninger og jordkabler på dit område.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Arbejdsområde for elledninger}}: tegn en ledning ud fra dens master, kabler i render, udstyr og forhindringer, på det samme terræn og i den samme projektfil. Se [Arbejdsområdet Elledninger](topic:power-lines).
- **Dine egne biblioteker.** Ledere, kabler, master, udstyr (tværarme, isolatorer, fittings, barduner, transformere, skabe, samlinger) og rendetyper, i kategorier du navngiver, delt som en fil eller et regneark. Intet lands eller producents katalog er indbygget; eksemplerne siger, at de er eksempler. Se [Dit bibliotek til elledninger](topic:power-line-library).
- **Hængning og spænding under dine lasttilfælde.** Temperatur, vind, is og is på den ene side; spændingsgrænser som en andel af brudstyrken; den nøjagtige kædelinje på hvert spænd, også med fald; optrækningstabeller. Se [Hængning og spænding](topic:sag-and-tension).
- **Kontroller, altid opdaterede.** Frihøjde over terræn og forhindringer, faseafstand, isolatorudsving, løft, mastelaster med dimensionering ud fra dit bibliotek, barduner, fittings, fundamenter, manglende data, afbrudte kabler, overbelastning og spændingsfald, markeret på planen og på ledningsprofilet. En projekteringshjælp: en ingeniør kontrollerer den. Se [Kontroller af elledninger](topic:power-line-checks).
- **Tabeller, ark og GIS.** Optræknings- og mastetabeller, mængder (CSV, Excel, TakeoffCraft), plan- og profilark med en undersøgelsesrapport i én PDF, GIS-lag med hvert aktivs data. Se [Tabeller, mængder, ark og GIS for elledninger](topic:power-line-outputs).
- **Efter de første forsøg.** Ledningsprofilet følger den ledning, du markerer, har en liste **Ledning**, aflæser terræn, leder og frihøjde under markøren og måler mellem to punkter. Landskabets planter og mure tæller som forhindringer under ledninger; kabelføringer og rør vises i ledningsprofilet og krydser med en frihøjderegel, du vælger; **Regler…** ved siden af hver frihøjde åbner dine egne regler; og regelsæt med et bibliotek gemmes som pakker, der kan deles pr. land. Se [Kontroller af elledninger](topic:power-line-checks) og [Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Dine egne filformater.** Elledninger gemmes i CivilCraft-projektfilen, biblioteker i `.cclines.json` eller CSV, regelsæt og pakker i deres egne JSON-filer: åbne formater, som alle kan læse eller konvertere. Undersøgelsesfilen `.DON` er en ekstra import og eksport ved siden af dem.
- **Undersøgelsesfiler (.DON), uprøvede.** Gem en ledning som en `.DON`-undersøgelsesfil til et andet ledningsprogram, eller læs et programs master; bygget ud fra formatets feltnavne, endnu ikke afprøvet med det program. Se [Undersøgelsesfiler](topic:power-line-study-file).

### Måling

- **Et værktøj Mål.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Mål}} (eller {{key:M}}) måler på planen: hver sides længde og retning, den løbende sum, længden langs terrænet og faldet samt areal og omkreds, når du lukker figuren. Intet tegnes ind i projektet. Se [Mål](topic:measure).

### Bygningsmasser

- **Tegn bygningsmasser.** I Egenskaber, under **Bygningsmasser**, {{ui:Tegn en masse}} (også {{ui:Overflade}} › {{ui:Mere}} › {{ui:Masser}}). Giv en masse etager og en etagehøjde, og aflæs dens bruttoetageareal. Vælg, hvordan den sidder på skrånende terræn (trinvis, sokkel eller afgravet), og se opfyldet og afgravningen. Masser vises på planen, i PDF'en og i DWG og DXF på deres egne lag. Se [Tegn bygningsmasser på et område](topic:building-masses).
- **Skub og træk i 3D.** I 3D-visningen trækker du i en markeret massens tag, eller trykker på {{key:PageUp}} og {{key:PageDown}}, for at ændre den en etage ad gangen, i ét fortrydelsestrin. **Sol** kaster massernes skygger. Se [I 3D-visningen](topic:building-masses#in-the-3d-view).
- **Zonebestemmelser, du skriver.** Byggelinjer linje for linje fra vejlinjen, en højdegrænse, et afstandsplan, en bebyggelsesprocent og en dækning. Den byggelige kappe tegnes på planen, og hver masse får et flueben eller et kryds for hver grænse. CivilCraft har ingen byggelov i sig: hvert tal er et, du skriver ud fra din egen bestemmelse. Se [Kontrollér masser mod de zonebestemmelser, du skriver](topic:zoning-limits).
- **Soltimer.** Vælg en dag eller en årstid og en tidszone ved navn eller forskydning, og aflæs timerne med direkte sol på hver væg af hver masse, etage for etage, og på jorden omkring dem, tegnet på planen. Gem væggene og jorden som CSV. Projektet har brug for et koordinatsystem. Se [Udregn timerne med sol på et område](topic:sun-hours).
- **Masser som IFC og videre til BimCraft.** {{ui:Masser som IFC}} gemmer masserne som IFC4, placeret på kortet, når projektet har et koordinatsystem. {{ui:Udvikl i BimCraft}} åbner BimCraft i en ny fane med masserne, hvor **Udvikl denne masse** bygger vægge på hvert niveau og et gulv ud fra fodaftrykket. Der uploades intet. Se [Send den videre](topic:building-masses#send-it-on).

### Tracéer

- **Klotoide-overgangskurver.** Skriv en længde i **Spiral ind** og **Spiral ud** i PI-tabellen for en kurve: ret linje, overgangskurve, cirkelbue, overgangskurve, ret linje, med lige eller forskellige længder. Planen viser TS, SC, CS og ST, kurvelisten giver θs samt tangent- og eksterne afstande, og stationer og afstande løber gennem overgangskurverne. Se [Overgangskurver](topic:alignment#spirals).
- **Overgangskurver i LandXML.** LandXML skriver og læser klotoide-overgangskurver. Tracéer med overgangskurver, som CivilCraft før sprang over ved import, åbnes nu. Se [Udveksl LandXML](topic:landxml).

### Korridorer

- **Opbyg hver side af dele.** Slå **Opbyg hver side af dele** til for at give hver side sin egen liste fra midterlinjen og udad: kørebaner, en rabat, en rendesten, en kantsten, en plantestribe, et fortov og en skråning med sin egen afgravning og opfyld. Start fra {{ui:Landevej}} eller {{ui:Bygade}}, og kopiér den ene side over på den anden. Tværprofilerne markerer flowlinen, kantstenen og fortovet, og den planerede overflade har kantstenen. Se [Opbyg hver side af dele](topic:corridor#build-each-side-from-parts).
- **Overhøjde over overgangskurver.** På en kurve med overgangskurver løber overhøjdens udjævning over overgangskurven: vandret tværfald ved TS, fuld overhøjde ved SC. Se [Overhøjde](topic:corridor#superelevation).

### 3D-filer

- **USD-eksport.** I 3D-visningen skriver {{ui:USD}} området som `.usda`, `.usdc` eller `.usdz` i sand målestok og i dets projektkoordinater: overflader, rør og konstruktioner som net, linjer, hvert tracé og opmålingspunkter med deres numre. Se [Eksportér 3D-området som USD](topic:usd).

### AI-assistenter

- **Mere til assistenter.** Med assistenter slået til i {{ui:Indstillinger}} › {{ui:CivilCraft}} kan en assistent nu også læse matrikler, afgravning og opfyld og profiler, tilføje opmålingspunkter, gemme projektet, eksportere LandXML, DWG og USD og arbejde i mapper, du vælger i CadCraft Studio. Arbejdsområdet Landskab tilføjer værktøjer til at finde planter, placere planter, senge og hække, planere og kontrollere vandingen. Filserveren og kommandolinjen `cadcraft` åbner gemte projekter uden vinduet. Se [Lad en AI-assistent arbejde med dit område](topic:assistants).

## I alle apps

- **Enheder.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Enheder}} har én liste hver for længde, areal, rumfang, vinkel og hældning, med de præcise størrelser, enhedernes definitioner giver (den amerikanske opmålingsfod er sin egen enhed). Slå de enheder fra, du aldrig bruger, og de forlader enhedslisterne; sæt en stjerne ved én, og nyt arbejde starter i den. En fil beholder altid sin egen enhed. I CivilCraft følger projektets liste **Enheder** kontakterne; en stjerne ved en metrisk længde starter nye projekter i meter (ellers fod, som er amerikanske opmålingsfod), en stjerne ved et areal eller rumfang sætter den enhed, arealer og rumfang opgives i, og et længdefelt tager enhver enheds tegn, som `3 ch` eller `450 mm`. Se [Enheder, indtastede værdier og enhedslister](common:unit-lists).
- **Et tættere layout og paneler, der ryddes af vejen.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Layouttæthed}} › {{ui:Kompakt}} får mere på skærmen (touchskærme og telefoner beholder deres store knapper). Hvert sidepanel har en slank titellinje: træk i den for at fastgøre eller frigøre panelet, slip den på et andet paneles linje for at dele ramme som faner, fastgør den, så den glider ud til kanten, eller skjul den og få den tilbage fra kanten. Se [Ordn panelerne](common:arrange-panels#make-the-layout-denser).
- **Dialogbokse flyttes.** Træk en dialogboks i titellinjen væk fra tegningen; den kommer tilbage, hvor du lod den. Dobbeltklik på titellinjen for at centrere den igen. Se [Flyt en dialogboks](common:arrange-panels#move-a-dialog).
- **Opskrifter til AI-assistenter.** Ti gennemarbejdede forespørgsler til din egen assistent (ryd op i en tegning, plot et sæt, kontrollér tegninger, stil en model spørgsmål, summér et mængdeudtræk, prøv en delvariant …), hver med de værktøjer, den kalder, og de tilladelser, den har brug for, og hver afspillet igen af vores tests. Apps'ene indeholder ingen AI. Se [Opskrifter til AI-assistenter](common:assistants-recipes).
- **Sprog.** **Português (Portugal)** er nyt i {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Sprog}}. Det, **Português (Brasil)**, **Español (México)** og **Bahasa Indonesia** har nu hvert ord i apps'ene, som kladder, der endnu ikke er gennemlæst af en modersmålstalende. Hjælpeemner er på engelsk, med nogle få på spansk.
- **CadCraft Studio** siger, hvorfor en opdateringskontrol mislykkedes (ingen fil til dit system endnu, intet netværk, en dårlig signatur) i stedet for blot "Færdig", og holder op med at bringe et Nyheder-kort tilbage, du lukkede, indtil der er en nyere udgivelse.

## Ikke i denne version endnu

- **0.7 er ikke kodesigneret.** Signering og Microsoft Store-pakken er flyttet til 0.8, fordi certifikatvalideringen ikke er kommet igennem endnu. Kontrollér SHA-256 ved siden af hver fil på getcadcraft.com/download. På Windows, hvis SmartScreen stopper installationsprogrammet, vælger du {{ui:Flere oplysninger}} og derefter {{ui:Kør alligevel}}. På en Mac højreklikker du første gang på CadCraft Studio og vælger {{ui:Åbn}}. CadCraft Studio er ikke i en app store endnu, og der er ingen iPad- eller iPhone-build endnu.
- Vinkel- og hældningslisterne i {{ui:Enheder}} gemmes, men intet felt læser dem endnu.
- Producenters vandingshoveder: kun generiske hoveder og dine egne hoveder fra en fil. Producenters data kommer kun med deres tilladelse, og ingen er givet endnu.
- BimCraft og ModelCraft bærer plantelisten, men deres Placér fra biblioteket tilbyder endnu ikke planter. Planter når BimCraft gennem landskabs-IFC.
- Landskabsværktøjerne til assistenter virker med CivilCraft-vinduet åbent; filserveren og kommandolinjen har dem endnu ikke.
- Bygningsmasser: ingen dagslys eller vind på facader, ingen skygge fra træer eller noget, der ikke er tegnet som en masse, ingen tagformer, og soltimer vises på planen, ikke i 3D-visningen. Udvikl i BimCraft bygger almindelige vægge og et gulv, uden åbninger eller tag.
- Elledninger: ingen landes standard indbygget (du angiver lasttilfælde, grænser og frihøjder); ingen leder-krybning, termisk belastning af nedgravede kabler, kortslutnings-, beskyttelses- eller jordingsstudier; ingen ledninger i 3D-visningen eller IFC. Undersøgelsesfilen `.DON` er ikke afprøvet med det program, der læser den.
- Andre overgangskurver end klotoide, en overgangskurve mellem to kurver og overgangskurver i feature-linjer. Overgangskurverne er kontrolleret mod formlerne og LandXML-skemaet, endnu ikke mod en LandXML-fil med overgangskurver fra et andet program.
- Korridorsamlinger, der ændrer sig langs vejen, regioner og mål for skråningen.
- Vandforsyningsledninger og trykførende net (det næste anlægsarbejde), flow der ændrer sig over tid og forbindelser mellem vand- og regnvandsnet.
- Buer i tegnede brudlinjer. Standardtabeller for dimensionsgivende køretøjer: de fem køretøjer, der følger med, er mærkede pladsholdere. Feature-linjer delt mellem projekter venter på teamprojekter.

Alt andet står i [Ikke lavet endnu](topic:not-built-yet).
