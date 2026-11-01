---
title: Nytt i 0.7
summary: CivilCraft 0.7 får et arbeidsområde for kraftlinjer (luftlinjer og jordkabler med egne biblioteker, sig og strekk, kontroller av avstander og styrke, strekketabeller, mengder, ark og GIS), et landskapsarbeidsområde (en planteliste, beplantningsplaner og lister, landskapsforming, belegg, murer og trapper, et beregningshjelpemiddel for vanning, landskapsark og frie objekter), bygningsmasser med reguleringsgrenser du skriver og soltimer, klotoide overgangskurver, korridorer bygget av deler på hver side, USD-eksport og flere verktøy for AI-assistenter.
keywords: nytt, hva er nytt, utgivelsesnotater, endringslogg, endringer, 0.7, versjon, nye funksjoner, landskap, landskapsarbeidsområde, planteliste, planter, beplantning, bed, hekk, terrengforming, plattform, voll, forsenkning, kotehøyde, helningsanalyse, vannansamling, harde flater, belegg, sti, mur, kantstein, rampe, trapper, vanning, sprinkler, dryppvanning, landskapsark, fritt objekt, bygningsmasse, massestudie, bruksareal, regulering, byggegrense, volumavgrensning, himmelplan, utnyttelsesgrad, dekningsgrad, soltimer, skygge, ifc, utvikle i bimcraft, overgangskurve, klotoide, oppbygging, kantstein, rennestein, fortau, usd, assistenter, enheter, portugisisk
from: 3c9d79db
---

Dette er det som er endret i CivilCraft 0.7 sammenlignet med 0.6. De største nye delene er arbeidsområdene for kraftlinjer og landskap, og bygningsmasser.

## Nytt

### Landskapsarbeidsområdet

- **Et landskapsarbeidsområde på samme område.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Landskapsarbeidsområde}} legger til verktøy for beplantning, terrengforming, harde flater og vanning på området du allerede har: de samme oppmålingspunktene, terrengmodellene og prosjektfilen. Velg **Anlegg** under **Arbeidsområde** for å gå tilbake. Se [Landskapsarbeidsområdet](topic:landscape).
- **En planteliste.** Omtrent 420 vanlige trær, busker, hekker, gress, stauder, bunndekkere og klatreplanter fra tempererte og mediterrane strøk, med størrelser ved planting og som fullvokst, herdighetssone, lys, vann og avstand. Søk på et hvilket som helst navn på engelsk, spansk og portugisisk. Importer din egen liste som CSV; den lagres med prosjektet. De innebygde størrelsene er typiske og avrundede: kontroller dem med et lokalt planteskole. Se [Plantelisten](topic:plant-list).
- **Beplantningsplaner.** {{ui:Plante}} plasserer enkeltplanter som står på bakken og følger senere terrengforming, {{ui:Bed}} fyller en kontur med plantenes avstand og en blanding i prosent, og {{ui:Hekk}} setter én eller to rader langs en linje. Plantene merkes på planen. Se [Beplantningsplaner og lister](topic:planting).
- **En planteliste som tabell.** Mer › {{ui:Planteliste…}} teller plantene etter art og plantestørrelse. Lagre den som CSV eller XLSX, eller send den til TakeoffCraft for prising. Se [Plantelisten som tabell](topic:planting#the-plant-schedule).
- **Terrengforming for landskap.** {{ui:Terrengforming}} har plattformer (flate eller med fall), voller, forsenkninger og formingsområder med kotehøyder og høydekurver du drar. Skjæring og fylling vises underveis. **Helningsanalyse** farger terrengmodellen etter dine egne to grenser, og **Strømningspiler og vannansamling** viser hvor vannet renner og hvor det ville samle seg. Alt går inn i den samme prosjekterte terrengmodellen som byggeplater og korridorer. Se [Terrengforming for landskap](topic:landscape-grading).
- **Belegg, stier, murer, kantstein, ramper og trapper.** {{ui:Harde flater}} tegner belegg med tverrfall eller fall mot et sluk, et mønster og lagene det består av; stier som følger terrenget; støttemurer og frittstående murer med trinnvise fundamenter; kantstein; og ramper og trapper kontrollert mot grenser du setter. En støttemur over 1,2 m (4 ft) flagges for en ingeniør. Se [Belegg, murer og trapper](topic:hardscape).
- **Et beregningshjelpemiddel for vanning.** {{ui:Vanning}} plasserer hoder, sidegrener, hovedledningen, ventiler, dryppslanger og tilkoblingspunktet. {{ui:Kontroller anlegget…}} finner sonene ut fra rørene og regner ut hver sones vannmengde, trykket som trengs ved ventilen og ved tilførselen (Hazen–Williams), nedbørsmengde, gangtider, dekning og en stykkliste. Det er et beregningshjelpemiddel, ikke en prosjekteringssertifisering: en vanningsprosjekterende kontrollerer hvert resultat. Hodene er generiske typer, eller dine egne fra en fil. Se [Prosjektering av vanning](topic:irrigation).
- **Landskapsark.** Mer › {{ui:Landskapsark…}} lager beplantnings-, terrengformings- og vanningsplaner med tegnforklaringene sine, og et detaljark med veggsnitt, belegguppbygginger og trapper, som én PDF. Se [Landskapsark](topic:landscape-sheets).
- **Frie objekter.** Mer › {{ui:Fritt objekt…}} plasserer et STL-, OBJ- eller bibliotekelementnett laget i en annen app, for eksempel en plantekasse eller en skulptur. Det står på bakken eller skjærer inn i den, og volum, areal og fotavtrykk telles. Se [Frie objekter](topic:freeform-objects).
- **Landskaps-IFC.** Mer › {{ui:Eksporter landskaps-IFC}} lagrer planter (som vegetasjon med egenskapene sine), harde flater og frie objekter som IFC 4.3 for en BIM-modell. Se [IFC](topic:planting#ifc).
- **Fra start til slutt.** [Design en hage, fra start til slutt](topic:landscape-walkthrough) går gjennom hele arbeidsområdet på eksempelområdet.

### Kraftlinjearbeidsområdet

- **Luftlinjer og jordkabler på området ditt.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Kraftlinjearbeidsområde}}: tegn en linje etter mastene, kabler i grøfter, utstyr og hindringer, på samme terreng og i samme prosjektfil. Se [Kraftlinjearbeidsområdet](topic:power-lines).
- **Egne biblioteker.** Ledere, kabler, master, utstyr (traverser, isolatorer, beslag, stag, transformatorer, skap, skjøter) og grøftetyper, i kategorier du navngir, delt som en fil eller et regneark. Intet lands eller produsents katalog er innebygd; eksemplene sier at de er eksempler. Se [Ditt kraftlinjebibliotek](topic:power-line-library).
- **Sig og strekk under dine lasttilfeller.** Temperatur, vind, is og is på én side; strekkgrenser som andel av bruddstyrken; den eksakte kjedekurven på hvert spenn, helninger medregnet; strekketabeller. Se [Sig og strekk](topic:sag-and-tension).
- **Kontroller, alltid oppdatert.** Avstand over terreng og hindringer, faseavstand, isolatorsvingning, løft, mastelaster med dimensjonering fra biblioteket ditt, stag, beslag, fundamenter, manglende data, frakoblede kabler, overbelastning og spenningsfall, flagget på planen og i linjeprofilet. Et prosjekteringshjelpemiddel: en ingeniør kontrollerer det. Se [Kontroller av kraftlinjer](topic:power-line-checks).
- **Tabeller, ark og GIS.** Strekke- og mastetabeller, mengder (CSV, Excel, TakeoffCraft), plan- og profilark med en studierapport i én PDF, GIS-layere med dataene til hver eiendel. Se [Tabeller, mengder, ark og GIS for kraftlinjer](topic:power-line-outputs).
- **Etter de første forsøkene.** Linjeprofilet følger linjen du velger, har en liste **Linje**, leser av terreng, leder og avstand under pekeren og måler mellom to punkter. Landskapets planter og murer teller som hindringer under linjer; kabeltraséer og rør vises i linjeprofilet og krysser med en avstandsregel du velger; **Regler…** ved siden av hver avstand åpner dine egne regler; og regelsett med et bibliotek lagres som pakker som deles per land. Se [Kontroller av kraftlinjer](topic:power-line-checks) og [Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Egne filformater.** Kraftlinjer lagres i CivilCraft-prosjektfilen, biblioteker i `.cclines.json` eller CSV, regelsett og pakker i sine egne JSON-filer: åpne formater som hvem som helst kan lese eller konvertere. Studiefilen `.DON` er en ekstra import og eksport ved siden av dem.
- **Studiefiler (.DON), ikke testet.** Lagre en linje som en `.DON`-studiefil for et annet linjeprogram, eller les mastene fra en; bygget ut fra formatets feltnavn, ennå ikke testet med det programmet. Se [Studiefiler](topic:power-line-study-file).

### Måling

- **Et Mål-verktøy.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Mål}} (eller {{key:M}}) måler på planen: hver sides lengde og retning, den løpende summen, lengden langs terrenget og helningen, og arealet og omkretsen når du lukker formen. Ingenting tegnes inn i prosjektet. Se [Mål](topic:measure).

### Bygningsmasser

- **Tegn bygningsmasser.** I Egenskaper, under **Bygningsmasser**, {{ui:Tegn en masse}} (også {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Masser}}). Gi en masse etasjer og en etasjehøyde og les av bruksarealet. Velg hvordan den står på skrånende terreng (trinnvis, podium eller skjæring) og se fyllingen og skjæringen. Masser vises på planen, i PDF-en og i DWG og DXF på egne layer. Se [Tegn bygningsmasser på en tomt](topic:building-masses).
- **Trykk og trekk i 3D.** I 3D-visningen drar du en valgt masses tak, eller trykker {{key:PageUp}} og {{key:PageDown}}, for å endre den en etasje om gangen, i ett angretrinn. **Sol** kaster massenes skygger. Se [I 3D-visningen](topic:building-masses#in-the-3d-view).
- **Reguleringsgrenser du skriver.** Byggegrenser linje for linje fra gatelinjen, en høydegrense, et himmelplan, en utnyttelsesgrad og en dekningsgrad. Det byggbare volumet tegnes på planen, og hver masse får en hake eller et kryss for hver grense. CivilCraft har ingen reguleringsbestemmelser i seg: hvert tall er et du skriver fra din egen plan. Se [Kontroller masser mot reguleringsgrensene du skriver](topic:zoning-limits).
- **Soltimer.** Velg en dag, eller en årstid, og en tidssone ved navn eller avvik, og les av timene med direkte sol på hver vegg på hver masse, etasje for etasje, og på bakken rundt dem, tegnet på planen. Lagre veggene og bakken som CSV. Prosjektet trenger et koordinatsystem. Se [Regn ut timene med sol på en tomt](topic:sun-hours).
- **Masser som IFC, og videre til BimCraft.** {{ui:Masser som IFC}} lagrer massene som IFC4, plassert på kartet når prosjektet har et koordinatsystem. {{ui:Utvikle i BimCraft}} åpner BimCraft i en ny fane med massene, der **Utvikle denne massen** bygger vegger på hvert nivå og et dekke fra fotavtrykket. Ingenting lastes opp. Se [Send den videre](topic:building-masses#send-it-on).

### Veglinjer

- **Klotoide overgangskurver.** Skriv en lengde i **Overgangskurve inn** og **Overgangskurve ut** i PI-tabellen for en kurve: rettstrekning, overgangskurve, kurve, overgangskurve, rettstrekning, med like eller ulike lengder. Planen merker TS, SC, CS og ST, kurvelisten gir θs og tangent- og ytre avstander, og profilnummer og avstander løper gjennom overgangskurvene. Se [Overgangskurver](topic:alignment#spirals).
- **Overgangskurver i LandXML.** LandXML skriver og leser klotoide overgangskurver. Veglinjer med overgangskurver, som CivilCraft tidligere hoppet over ved import, åpnes nå. Se [Utveksle LandXML](topic:landxml).

### Korridorer

- **Bygg hver side av deler.** Slå på **Bygg hver side av deler** for å gi hver side sin egen liste fra senterlinjen og utover: kjørefelt, en skulder, en rennestein, en kantstein, en grøntstripe, et fortau og en sideskråning med sin egen skjæring og fylling. Start fra {{ui:Landeveg}} eller {{ui:Bygate}} og kopier én side til den andre. Tverrprofiler merker bunnlinjen, kantsteinen og gangarealet, og den formede terrengmodellen har kantsteinen. Se [Bygg hver side av deler](topic:corridor#build-each-side-from-parts).
- **Overhøyde over overgangskurver.** På en kurve med overgangskurver løper overhøydens tilløp over overgangskurven: flat kronelinje ved TS, full overhøyde ved SC. Se [Overhøyde](topic:corridor#superelevation).

### 3D-filer

- **USD-eksport.** I 3D-visningen skriver {{ui:USD}} området som `.usda`, `.usdc` eller `.usdz` i sann skala og med prosjektkoordinatene: terrengmodeller, rør og konstruksjoner som nett, linjer, hver veglinje og oppmålingspunkter med nummerne sine. Se [Eksporter 3D-området som USD](topic:usd).

### AI-assistenter

- **Mer for assistenter.** Med assistenter slått på i {{ui:Innstillinger}} › {{ui:CivilCraft}} kan en assistent nå også lese eiendommer, skjæring og fylling og lengdeprofiler, legge til oppmålingspunkter, lagre prosjektet, eksportere LandXML, DWG og USD, og arbeide i mapper du velger i CadCraft Studio. Landskapsarbeidsområdet legger til verktøy for å finne planter, plassere planter, bed og hekker, forme terreng og kontrollere vanningen. Filtjeneren og kommandolinjen `cadcraft` åpner lagrede prosjekter uten vinduet. Se [La en AI-assistent arbeide med området ditt](topic:assistants).

## I alle apper

- **Enheter.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Enheter}} har én liste hver for lengde, areal, volum, vinkel og helling, med de eksakte størrelsene enhetenes definisjoner gir (den amerikanske målefoten er sin egen enhet). Slå av enhetene du aldri bruker, så forlater de enhetslistene; sett stjerne på én, så starter nytt arbeid i den. En fil beholder alltid sin egen enhet. I CivilCraft følger prosjektets liste **Enheter** bryterne; en stjerne på en metrisk lengde starter nye prosjekter i meter (ellers fot, som er amerikanske målefot), en stjerne på areal eller volum setter enheten arealer og volumer rapporteres i, og en lengdeboks tar merket til en hvilken som helst enhet, for eksempel `3 ch` eller `450 mm`. Se [Enheter, innskrevne verdier og enhetslistene](common:unit-lists).
- **Et tettere oppsett og paneler som ryddes bort.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Layouttetthet}} › {{ui:Kompakt}} får plass til mer på skjermen (berøringsskjermer og telefoner beholder de store knappene). Hvert sidepanel har en smal tittellinje: dra den for å feste eller frigjøre panelet, slipp den på et annet panels linje for å dele én ramme som faner, fest det for å gli bort til kanten, eller skjul det og hent det tilbake fra kanten. Se [Ordne panelene](common:arrange-panels#make-the-layout-denser).
- **Dialoger flyttes.** Dra en dialog etter tittellinjen ut av veien for tegningen; den kommer tilbake der du lot den stå. Dobbeltklikk tittellinjen for å sentrere den igjen. Se [Flytt en dialog](common:arrange-panels#move-a-dialog).
- **Oppskrifter for AI-assistenter.** Ti gjennomarbeidede forespørsler til din egen assistent (rydd en tegning, plott et sett, kontroller tegninger, still en modell spørsmål, summer et mengdeuttak, prøv en delvariant …), hver med verktøyene den kaller og tillatelsene den trenger, og hver avspilt av testene våre. Appene inneholder ingen AI. Se [Oppskrifter for AI-assistenter](common:assistants-recipes).
- **Språk.** **Português (Portugal)** er nytt i {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Språk}}. Det, **Português (Brasil)**, **Español (México)** og **Bahasa Indonesia** har nå hvert ord i appene, som utkast som ennå ikke er gjennomgått av en morsmålsbruker. Hjelpeemnene er på engelsk, noen få på spansk.
- **CadCraft Studio** sier hvorfor en oppdateringskontroll feilet (ingen fil for systemet ditt ennå, ingen nettverk, en ugyldig signatur) i stedet for bare «Ferdig», og slutter å hente tilbake et Nytt-kort du lukket før det finnes en nyere utgivelse.

## Ikke i denne versjonen ennå

- **0.7 er ikke kodesignert.** Signering, og Microsoft Store-pakken, ble flyttet til 0.8 fordi sertifikatvalideringen ikke har kommet gjennom ennå. Kontroller SHA-256 ved siden av hver fil på getcadcraft.com/download. På Windows, hvis SmartScreen stopper installasjonsprogrammet, velg {{ui:Mer informasjon}}, deretter {{ui:Kjør likevel}}. På en Mac høyreklikker du CadCraft Studio første gang og velger {{ui:Åpne}}. CadCraft Studio er ikke i en appbutikk ennå, og det finnes ingen iPad- eller iPhone-versjon ennå.
- Vinkel- og hellingslistene i {{ui:Enheter}} lagres, men ingen boks leser dem ennå.
- Produsenters vanningshoder: bare generiske hoder og dine egne hoder fra en fil. Produsentdata kommer bare inn med deres tillatelse, og ingen er gitt ennå.
- BimCraft og ModelCraft har plantelisten, men deres Plasser fra bibliotek tilbyr ikke planter ennå. Planter når BimCraft gjennom landskaps-IFC-en.
- Landskapsverktøyene for assistenter fungerer med CivilCraft-vinduet åpent; filtjeneren og kommandolinjen har dem ikke ennå.
- Bygningsmasser: ingen fasadedagslys eller vind, ingen skygge fra trær eller noe som ikke er tegnet som en masse, ingen takformer, og soltimer vises på planen, ikke i 3D-visningen. Utvikle i BimCraft bygger enkle vegger og et dekke, uten åpninger eller tak.
- Kraftlinjer: ingen lands standard er innebygd (du setter lasttilfellene, grensene og avstandene); ingen kryp i leder, termisk belastning av nedgravde kabler, kortslutnings-, vern- eller jordingsstudier; ingen linjer i 3D-visningen eller IFC. Studiefilen `.DON` er ikke testet med programmet som leser den.
- Andre overgangskurver enn klotoide, en overgangskurve mellom to kurver, og overgangskurver i formlinjer. Overgangskurvene er kontrollert mot formlene og LandXML-skjemaet, ennå ikke mot en LandXML-fil med overgangskurver fra et annet program.
- Korridoroppbygginger som endres langs veien, regioner og mål for sideskråningen.
- Vannledninger og trykknett (neste anleggsarbeid), strømninger som endres over tid, og koblinger mellom vann- og overvannsnett.
- Buer i tegnede bruddlinjer. Standardtabeller for dimensjonerende kjøretøy: de fem kjøretøyene som følger med, er merkede plassholdere. Formlinjer delt mellom prosjekter venter på teamprosjekter.

Alt annet står i [Ikke bygget ennå](topic:not-built-yet).
