---
title: Nytt i 0.7 (tidligere)
summary: CivilCraft 0.7 legger til et Kraftlinjearbeidsområde (luftledninger og jordkabler med egne bibliotek, sag og strekk, kontroll av frihøyde og styrke, strekktabeller, mengder, ark og GIS), et Landskapsarbeidsområde (en planteliste, beplantningsplaner og lister, terrengforming for landskap, belegg, murer og trapper, en beregningshjelp for vanning, landskapsark og fritt formede objekter), bygningsmasser med soneringsgrenser som skrives inn og soltimer, klotoidespiraler, korridorer bygget av deler på hver side, USD-eksport og flere verktøy for AI-assistenter.
keywords: nytt i 0.7, tidligere utgivelse, utgivelsesnotater, endringslogg, endringer, 0.7, versjon, nye funksjoner, landskap, landskapsarbeidsområde, planteliste, planter, beplantning, plantingsliste, bed, hekk, terrengforming, plattform, voll, grøft, kotehøyde, skråningsanalyse, oppdemming, harde flater, belegg, sti, mur, kantstein, rampe, trapper, vanning, sprinkler, dryppvanning, landskapsark, fritt objekt, bygningsmasse, volumstudie, bruttoareal, soning, tilbakerykking, byggbart område, frihimmelsplan, utnyttelsesgrad, bebygd areal, soltimer, skygge, ifc, utvikle i bimcraft, spiral, klotoide, overgang, sammenstilling, kantstein, renne, fortau, usd, assistenter, enheter, portugisisk
from: 797d2f2f
---

Dette er endringene i CivilCraft 0.7 sammenlignet med 0.6. De største nye delene er kraftlinje- og landskapsarbeidsområdene og bygningsmasser.

## Nytt

### Landskapsarbeidsområdet

- **Et landskapsarbeidsområde på samme område.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Landskapsarbeidsområde}} legger til verktøy for beplantning, terrengforming, harde flater og vanning på området du allerede har: de samme punktene, terrengflatene og prosjektfilen. Velg **Civil** under **Arbeidsområde** for å gå tilbake. Se [Landskapsarbeidsområdet](topic:landscape).
- **En planteliste.** Omtrent 420 vanlige tempererte og middelhavsplanter: trær, busker, hekker, gress, stauder, bakkedekkende planter og klatreplanter, med størrelser ved planting og ved modenhet, hardhetssone, lys, vann og avstand. Søk på ethvert navn på engelsk, spansk eller portugisisk. Egen liste kan importeres som CSV; den lagres med prosjektet. De innebygde størrelsene er typiske og avrundede: kontroller dem hos et lokalt planteskole. Se [Planteliste](topic:plant-list).
- **Beplantningsplaner.** {{ui:Plante}} plasserer enkeltplanter som står på bakken og følger senere terrengforming, {{ui:Bed}} fyller en kontur med planteavstanden og en blanding etter prosent, og {{ui:Hekk}} setter én eller to rader langs en linje. Plantene merkes i planen. Se [Beplantningsplaner og lister](topic:planting).
- **En plantingsliste.** Mer › {{ui:Planteliste…}} teller plantene per art og plantestørrelse. Lagre den som CSV eller XLSX, eller send den til TakeoffCraft for prising. Se [Plantelisten](topic:planting#the-plant-schedule).
- **Terrengforming for landskap.** {{ui:Terrengforming}} har plattformer (flate eller fallende), voller, grøfter og områder med kotehøyder og høydekurver som dras. Skjæring og fylling vises løpende. **Skråningsanalyse** fargelegger terrengflaten etter to egne grenser, og **Strømningspiler og oppdemming** viser hvor vannet renner og hvor det ville samle seg. Alt inngår i samme prosjekterte terrengflate som byggeplater og korridorer. Se [Terrengforming for landskap](topic:landscape-grading).
- **Belegg, stier, murer, kantsteiner, rampe og trapper.** {{ui:Harde flater}} tegner belegg med tverrfall eller fall mot sluk, et mønster og lagene i det; stier som følger terrenget; støttemurer og frittstående murer med trinnvise fundamenter; kantsteiner; og rampene og trappene kontrolleres mot grenser som settes selv. En støttemur over 1.2 m (4 ft) merkes for en ingeniør. Se [Belegg, murer og trapper](topic:hardscape).
- **En beregningshjelp for vanning.** {{ui:Vanning}} plasserer sprinklerhoder, sideledninger, hovedledningen, ventiler, dryppledninger og tilkoblingspunktet. {{ui:Kontroller anlegget…}} finner sonene ut fra rørene og beregner hver sones vannmengde, trykket som trengs ved ventilen og ved tilførselen (Hazen–Williams), nedbør, kjøretider, dekning og en materialliste. Dette er et beregningshjelpemiddel, ikke en godkjent prosjektering: en vanningsprosjekterer må kontrollere alle resultater. Hodene er generiske typer, eller egne hoder fra en fil. Se [Vanningsdesign](topic:irrigation).
- **Landskapsark.** Mer › {{ui:Landskapsark…}} lager beplantnings-, terrengforming- og vanningsplaner med tegnforklaringer, og et detaljark med snitt av murer, oppbygging av belegg og trapper, som én PDF. Se [Landskapsark](topic:landscape-sheets).
- **Fritt formede objekter.** Mer › {{ui:Fritt objekt…}} plasserer et nett i STL, OBJ eller som bibliotekselement laget i et annet program, for eksempel en plantekasse eller en skulptur. Det står på bakken eller skjæres inn i den, og volum, areal og fotavtrykk telles. Se [Fritt formede objekter](topic:freeform-objects).
- **Landskaps-IFC.** Mer › {{ui:Eksporter landskaps-IFC}} lagrer planter (som vegetasjon med sine egenskaper), harde flater og fritt formede objekter som IFC 4.3 for en BIM-modell. Se [IFC](topic:planting#ifc).
- **Fra start til slutt.** [Tegn en hage, fra start til slutt](topic:landscape-walkthrough) går gjennom hele arbeidsområdet på eksempelområdet.

### Kraftlinjearbeidsområdet

- **Luftledninger og jordkabler på området.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Kraftlinjearbeidsområde}}: tegn en linje etter dens master, kabler i grøfter, utstyr og hindringer, på samme terreng og i samme prosjektfil. Se [Kraftlinjearbeidsområdet](topic:power-lines).
- **Egne bibliotek.** Ledere, kabler, master, utstyr (tverrarmer, isolatorer, beslag, stag, transformatorer, skap, skjøter) og grøftetyper, i kategorier som navngis selv, delt som en fil eller et regneark. Ingen lands eller produsents katalog er innebygd; eksemplene oppgir at de er eksempler. Se [Ditt kraftlinjebibliotek](topic:power-line-library).
- **Sag og strekk under egne lastsituasjoner.** Temperatur, vind, is og is på én side; grenser for spenning som en andel av bruddstyrken; den eksakte kjettinglinjen for hvert spenn, også med helninger; strekktabeller. Se [Sag og strekk](topic:sag-and-tension).
- **Kontroller, alltid oppdatert.** Frihøyde over bakken og hindringer, fasemellomrom, isolatorutsving, oppløft, belastninger på master med dimensjonering fra biblioteket, stag, beslag, fundamenter, manglende data, frakoblede kabler, overbelastninger og spenningsfall, merket i planen og i linjeprofilet. Et prosjekteringshjelpemiddel: en ingeniør kontrollerer det. Se [Kontroller for kraftlinjer](topic:power-line-checks).
- **Tabeller, ark og GIS.** Strekktabeller og mastetabeller, mengder (CSV, Excel, TakeoffCraft), plan- og profilark med en utredningsrapport i én PDF, GIS-layer med data for hvert anlegg. Se [Kraftlinjetabeller, mengder, ark og GIS](topic:power-line-outputs).
- **Etter de første forsøkene.** Linjeprofilet følger linjen som velges, har en liste **Linje**, leser terreng, leder og frihøyde under pekeren og måler mellom to punkter. Planter og murer i landskapet regnes som hindringer under linjer; kabeltraseer og rør vises i linjeprofilet og krysser med en avstandsregel som velges; **Regler…** ved siden av hver frihøyde åpner egne regler; og regelsett med et bibliotek lagres som pakker som kan deles per land. Se [Kontroller for kraftlinjer](topic:power-line-checks) og [Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Egne filformater.** Kraftlinjer lagres i CivilCraft-prosjektfilen, bibliotekene i `.cclines.json` eller CSV, regelsett og pakker i egne JSON-filer: åpne formater som alle kan lese eller konvertere. `.DON`-utredningsfilen er en ekstra import og eksport ved siden av dem.
- **Utredningsfiler (.DON), ikke testet.** Lagre en linje som en `.DON`-utredningsfil for et annet kraftlinjeprogram, eller les master fra en slik fil. Den er bygget fra formatets feltnavn og er ennå ikke testet med det programmet. Se [Utredningsfiler](topic:power-line-study-file).

### Måling

- **Et måleverktøy.** {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Mål}} (eller {{key:M}}) måler i planen: lengden og retningen på hver side, den løpende summen, lengden langs bakken og helningen, og arealet og omkretsen når formen lukkes. Ingenting tegnes inn i prosjektet. Se [Mål](topic:measure).

### Bygningsmasser

- **Tegn bygningsmasser.** I **Egenskaper**, under **Bygningsmasser**, {{ui:Tegn en masse}} (også {{ui:Terrengmodell}} › {{ui:Mer}} › {{ui:Masser}}). Angi antall etasjer og etasjehøyde for en masse, og les bruttoarealet. Velg hvordan den står på skrånende terreng (trinnvis, sokkel eller skjæring), og se fylling og skjæring. Masser vises i planen, i PDF-en og i DWG og DXF på egne layer. Se [Tegn bygningsmasser på et område](topic:building-masses).
- **Trykk og trekk i 3D.** I 3D-visningen dras taket på en valgt masse, eller {{key:PageUp}} og {{key:PageDown}} trykkes, for å endre den én etasje om gangen, i ett angretrinn. {{ui:Sol}} kaster skygger fra massene. Se [I 3D-visningen](topic:building-masses#in-the-3d-view).
- **Soneringsgrenser som skrives inn.** Tilbakerykkinger linje for linje fra gatelinjen, en høydegrense, et frihimmelsplan, en utnyttelsesgrad og en bebygd andel. Det byggbare området tegnes i planen, og hver masse får en hake eller et kryss for hver grense. CivilCraft har ingen soneringsregler innebygd: alle tall skrives inn fra egen reguleringsbestemmelse. Se [Kontroller masser mot soneringsgrensene som skrives inn](topic:zoning-limits).
- **Soltimer.** Velg en dag eller en årstid, og en tidssone etter navn eller forskjell, og les timene med direkte sol på hver vegg i hver masse, etasje for etasje, og på bakken rundt dem, tegnet i planen. Lagre veggene og bakken som CSV. Prosjektet trenger et koordinatsystem. Se [Regn ut soltimer på et område](topic:sun-hours).
- **Masser som IFC, og videre til BimCraft.** {{ui:Masser som IFC}} lagrer massene som IFC4, plassert på kartet når prosjektet har et koordinatsystem. {{ui:Utvikle i BimCraft}} åpner BimCraft i en ny fane med massene, der **Utvikle denne massen** bygger vegger på hver etasje og et gulv fra fotavtrykket. Ingenting lastes opp. Se [Send det videre](topic:building-masses#send-it-on).

### Linjer

- **Klotoidespiraler.** Skriv inn en lengde i **Spiral inn** og **Spiral ut** i PI-tabellen for en kurve: tangent, spiral, kurve, spiral, tangent, med like eller ulike lengder. Planen merker TS, SC, CS og ST, kurvelisten gir θs og tangent- og ytre avstander, og profilnumre og forskyvninger går gjennom spiralene. Se [Spiraler](topic:alignment#spirals).
- **Spiraler i LandXML.** LandXML skriver og leser klotoidespiraler. Linjer med spiraler, som CivilCraft tidligere hoppet over ved import, åpnes nå. Se [Utveksling av LandXML](topic:landxml).

### Korridorer

- **Bygg hver side av deler.** Slå på **Bygg hver side av deler** for å gi hver side en egen liste fra senterlinjen og utover: kjørefelt, skulder, renne, kantstein, en plantestripe, et fortau og en sideskråning med egen skjæring og fylling. Start fra {{ui:Landeveg}} eller {{ui:Bygate}} og kopier én side over til den andre. Tverrprofiler merker rennelinjen, kantsteinen og gangsonen, og den terrengformede flaten har kantsteinen. Se [Bygg hver side av deler](topic:corridor#build-each-side-from-parts).
- **Superhøyde over spiraler.** På en kurve med spiraler går superhøydeoverganger over spiralen: flat tverrfall ved TS, full superhøyde ved SC. Se [Superhøyde](topic:corridor#superelevation).

### 3D-filer

- **USD-eksport.** I 3D-visningen skriver {{ui:USD}} området som `.usda`, `.usdc` eller `.usdz` i riktig målestokk og med prosjektkoordinatene: terrengflater, rør og konstruksjoner som nett, linjer, hver linje, og målepunkter med sine nummer. Se [Eksporter 3D-området som USD](topic:usd).

### AI-assistenter

- **Mer for assistenter.** Når assistenter er slått på i {{ui:Innstillinger}} › {{ui:CivilCraft}}, kan en assistent nå også lese eiendommer, skjæring og fylling og profiler, legge til målepunkter, lagre prosjektet, eksportere LandXML, DWG og USD, og arbeide i mapper som velges i CadCraft Studio. Landskapsarbeidsområdet legger til verktøy for å finne planter, plassere planter, bed og hekker, terrengforme og kontrollere vanningen. Filtjeneren og kommandolinjen `cadcraft` åpner lagrede prosjekter uten vinduet. Se [La en AI-assistent arbeide med området](topic:assistants).

## I alle apper

- **Enheter.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Enheter}} har én liste hver for lengde, areal, volum, vinkel og helning, med de nøyaktige størrelsene enhetenes definisjoner gir (US survey foot er en egen enhet). Enheter som aldri brukes, slås av og forsvinner fra listene; en enhet merkes med stjerne, og nytt arbeid starter i den. En fil beholder alltid sin egen enhet. I CivilCraft følger prosjektets **Enheter**-liste bryterne: en stjerne på metrisk lengde starter nye prosjekter i meter (ellers fot, som er US survey foot), en stjerne på areal eller volum angir enhetene som arealer og volumer rapporteres i, og en lengdeboks tar enhver enhets merke, som `3 ch` eller `450 mm`. Se [Enheter, skrevne verdier og enhetslistene](common:unit-lists).
- **Tettere oppsett og paneler som ryddes bort.** {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Layouttetthet}} › {{ui:Kompakt}} får plass til mer på skjermen (berøringsskjermer og telefoner beholder de store knappene). Hvert sidepanel har en smal tittellinje: dra den for å feste eller løsne panelet, slipp det på et annet panels linje for å dele én ramme som faner, la det gli unna til kanten, eller skjul det og hent det tilbake fra kanten. Se [Ordne panelene](common:arrange-panels#make-the-layout-denser).
- **Dialoger kan flyttes.** Dra en dialogboks etter tittellinjen ut av veien for tegningen; den kommer tilbake dit den ble sluppet. Dobbeltklikk på tittellinjen for å sentrere den igjen. Se [Flytt en dialogboks](common:arrange-panels#move-a-dialog).
- **Oppskrifter for AI-assistenter.** Ti utarbeidede forespørsler til en egen assistent (rydde en tegning, plotte et sett, kontrollere tegninger, stille spørsmål til en modell, summere et mengdeuttak, prøve en variant av en del …), hver med verktøyene den kaller og tillatelsene den trenger, og hver kjørt på nytt av testene. Appene inneholder ingen AI. Se [Oppskrifter for AI-assistenter](common:assistants-recipes).
- **Språk.** **Português (Portugal)** er ny i {{ui:Innstillinger}} › {{ui:Generelt}} › {{ui:Språk}}. Den, **Português (Brasil)**, **Español (México)** og **Bahasa Indonesia** har nå alle ordene i appene, som utkast som ennå ikke er gjennomgått av en morsmålstalende. Hjelpeemnene er på engelsk, med noen få på spansk.
- **CadCraft Studio** sier hvorfor en oppdateringssjekk mislyktes (ingen fil for systemet ennå, ingen nettverkstilkobling, en ugyldig signatur) i stedet for bare «Ferdig», og slutter å hente fram et kort for «Nytt» som er lukket, før det finnes en nyere utgave.

## Ikke med i denne versjonen ennå

- **0.7 er ikke kodesignert.** Signering og Microsoft Store-pakken er flyttet til 0.8, fordi sertifikatvalideringen ikke er kommet gjennom ennå. Kontroller SHA-256 ved siden av hver fil på getcadcraft.com/download. På Windows, hvis SmartScreen stopper installasjonsprogrammet, velg {{ui:Mer informasjon}}, og deretter {{ui:Kjør likevel}}. På en Mac høyreklikkes CadCraft Studio første gang, og {{ui:Åpne}} velges. CadCraft Studio finnes ikke i en appbutikk ennå, og det finnes ingen iPad- eller iPhone-utgave ennå.
- Vinkel- og helningslistene i {{ui:Enheter}} lagres, men ingen boks leser dem ennå.
- Produsenters vanningshoder: bare generiske hoder og egne hoder fra en fil. Produsentdata kommer inn bare med deres tillatelse, og ingen er gitt ennå.
- BimCraft og ModelCraft har planteliste, men deres {{ui:Plasser fra bibliotek}} tilbyr ikke planter ennå. Planter når BimCraft gjennom landskaps-IFC.
- Landskapsverktøyene for assistenter virker når CivilCraft-vinduet er åpent; filtjeneren og kommandolinjen har dem ikke ennå.
- Bygningsmasser: ingen fasadedagslys eller vind, ingen skygge fra trær eller noe som ikke er tegnet som en masse, ingen takformer, og soltimer vises i planen, ikke i 3D-visningen. Utvikle i BimCraft bygger enkle vegger og et gulv, uten åpninger eller tak.
- Kraftlinjer: ingen lands standard er innebygd (lastsituasjoner, grenser og frihøyder settes selv); ingen utredninger for lederkryp, termisk klassifisering av nedgravde kabler, kortslutning, vern eller jording; ingen linjer i 3D-visningen eller IFC. `.DON`-utredningsfilen er ikke testet med programmet som leser den.
- Spiraler som ikke er klotoider, en spiral mellom to kurver, og spiraler i formlinjer. Spiralene er kontrollert mot formlene og LandXML-skjemaet, men ikke ennå mot en LandXML-fil med spiraler fra et annet program.
- Korridorsammenstillinger som endrer seg langs veien, regioner og mål for sideskråningen.
- Vannledninger og trykknett (neste anleggsarbeid), vannmengder som endrer seg over tid, og koblinger mellom vann- og overvannsnett.
- Buer i tegnede bruddlinjer. Standardtabeller for dimensjonerende kjøretøy: de fem kjøretøyene som følger med, er merket som plassholdere. Formlinjer som deles mellom prosjekter, venter på teamprosjekter.

Alt annet står i [Ikke bygget ennå](topic:not-built-yet).
