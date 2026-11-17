---
title: Nyt i 0.7 (tidligere)
summary: CivilCraft 0.7 tilføjer et arbejdsområde for elledninger (luftledninger og jordkabler med dine egne biblioteker, gennemhæng og spænding, kontrol af frihøjde og styrke, stringing-tabeller, mængder, ark og GIS), et landskabsarbejdsområde (en planteliste, beplantningsplaner og -lister, landskabsplanering, belægning, mure og trin, en beregningshjælp til vanding, landskabsark og frie objekter), bygningsmasser med zoneringsgrænser, du selv indtaster, og soltimer, klothoide-overgangskurver, korridorer bygget af dele på hver side, USD-eksport og flere værktøjer til AI-assistenter.
keywords: nyheder 0.7, tidligere udgivelse, udgivelsesnoter, ændringslog, ændringer, 0.7, version, nye funktioner, landskab, landskabsarbejdsområde, planteliste, planter, beplantning, plantetabel, bed, hæk, planering, plateau, vold, grøft, koteangivelse, hældningsanalyse, vandansamling, befæstelse, belægning, sti, mur, kantsten, rampe, trin, vanding, sprinkler, dryp, landskabsark, frit objekt, bygningsmasse, masseopbygning, bruttoetageareal, zonering, tilbagetrækning, byggefelt, lysplan, udnyttelsesgrad, bebyggelsesprocent, soltimer, skygge, ifc, udvikl i bimcraft, overgangskurve, klothoide, overgang, samling, kantsten, rendesten, fortov, usd, assistenter, enheder, portugisisk
from: 797d2f2f
---

Dette er, hvad der er ændret i CivilCraft 0.7 sammenlignet med 0.6. De største nye dele er arbejdsområderne for elledninger og landskab samt bygningsmasser.

## Nyt

### Landskabsarbejdsområdet

- **Et landskabsarbejdsområde på samme område.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Landskabsarbejdsområde}} tilføjer værktøjer til beplantning, planering, befæstelse og vanding til det område, du allerede har: de samme opmålingspunkter, overflader og den samme projektfil. Vælg **Civil** under **Arbejdsområde** for at gå tilbage. Se [Landskabsarbejdsområdet](topic:landscape).
- **En planteliste.** Ca. 420 almindelige tempererede og middelhavsagtige træer, buske, hække, græsser, stauder, jorddækkere og klatreplanter med deres størrelser ved plantning og ved modenhed, plantezone, lys, vand og afstand. Søg med et navn på engelsk, spansk eller portugisisk. Importér din egen liste som CSV; den gemmes sammen med projektet. De indbyggede størrelser er typiske og afrundede: kontrollér dem hos en lokal planteskole. Se [Planteliste](topic:plant-list).
- **Beplantningsplaner.** {{ui:Plante}} placerer enkeltplanter, der står på jorden og følger senere planering, {{ui:Bed}} udfylder en kontur med planterne i deres afstand og en blanding efter procent, og {{ui:Hæk}} sætter én eller to rækker langs en linje. Planterne er markeret på planen. Se [Beplantningsplaner og -tabeller](topic:planting).
- **En plantetabel.** Mere › {{ui:Planteliste…}} tæller planterne efter art og plantestørrelse. Gem den som CSV eller XLSX, eller send den til TakeoffCraft for at prissætte. Se [Plantetabellen](topic:planting#the-plant-schedule).
- **Planering til landskab.** {{ui:Planér}} har plateauer (plane eller faldende), volde, grøfter og planeringsområder med koteangivelser og konturer, som du trækker. Afgravning og opfyld vises efterhånden. **Hældningsanalyse** farver overfladen efter dine egne to grænser, og **Flowpile og vandansamling** viser, hvor vandet løber, og hvor det ville samle sig. Alt det går ind i den samme foreslåede overflade som pladser og korridorer. Se [Planering til landskab](topic:landscape-grading).
- **Belægning, stier, mure, kantsten, ramper og trin.** {{ui:Befæstelse}} tegner belægning med tværfald eller fald til et afløb, et mønster og dets lag; stier, der følger terrænet; støttemure og frit stående mure med trinvise fundamenter; kantsten; og rampe og trin, kontrolleret mod grænser, du selv sætter. En støttemur over 1,2 m (4 ft) markeres til en ingeniør. Se [Belægning, mure og trin](topic:hardscape).
- **En beregningshjælp til vanding.** {{ui:Vanding}} placerer sprinklerhoveder, sideledninger, hovedledningen, ventiler, dryplinjer og tilslutningspunktet. {{ui:Kontrollér anlægget…}} finder zonerne ud fra rørene og beregner hver zones flow, det tryk, der kræves ved dens ventil og ved forsyningen (Hazen–Williams), nedbør, kørselstider, dækning og en stykliste. Det er en beregningshjælp, ikke en designgodkendelse: en vandingsdesigner kontrollerer hvert resultat. Hovederne er generiske typer eller dine egne fra en fil. Se [Vandingsdesign](topic:irrigation).
- **Landskabsark.** Mere › {{ui:Landskabsark…}} laver beplantnings-, planerings- og vandingsplaner med deres signaturforklaringer samt et detaljeark med murenes snit, belægningsopbygninger og trin, som én PDF. Se [Landskabsark](topic:landscape-sheets).
- **Frie objekter.** Mere › {{ui:Frit objekt…}} placerer en net-model i STL, OBJ eller et bibliotekselement, lavet i et andet program, fx en urtekasse eller en skulptur. Den står på jorden eller skærer ned i den, og dens volumen, areal og fodaftryk tælles. Se [Frie objekter](topic:freeform-objects).
- **Landskabs-IFC.** Mere › {{ui:Eksportér landskabs-IFC}} gemmer planter (som vegetation med deres egenskaber), befæstelse og frie objekter som IFC 4.3 til en BIM-model. Se [IFC](topic:planting#ifc).
- **Fra start til slut.** [Design en have fra start til slut](topic:landscape-walkthrough) gennemgår hele arbejdsområdet på eksempelområdet.

### Arbejdsområdet for elledninger

- **Luftledninger og jordkabler på dit område.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Arbejdsområde for elledninger}}: tegn en linje ud fra dens master, kabler i kabelgrave, udstyr og forhindringer, på samme terræn og i samme projektfil. Se [Arbejdsområdet for elledninger](topic:power-lines).
- **Dine egne biblioteker.** Ledere, kabler, master, udstyr (tværarme, isolatorer, beslag, barduner, transformere, skabe, muffer) og kabelgravstyper, i kategorier du selv navngiver, deles som en fil eller et regneark. Ingen lands eller producents katalog er indbygget; eksemplerne siger, at de er eksempler. Se [Dit elledningsbibliotek](topic:power-line-library).
- **Gennemhæng og spænding under dine lasttilfælde.** Temperatur, vind, is og is på den ene side; spændingsgrænser som en andel af brudstyrken; den nøjagtige kædelinje på hvert spænd, også ved hældninger; stringing-tabeller. Se [Gennemhæng og spænding](topic:sag-and-tension).
- **Kontroller, altid opdaterede.** Frihøjde over terræn og forhindringer, faseafstand, isolatorudsving, optrækning, mastelaster med dimensionering fra dit bibliotek, barduner, beslag, fundamenter, manglende data, afbrudte kabler, overbelastninger og spændingsfald, markeret på planen og på linjeprofilet. En beregningshjælp: en ingeniør kontrollerer den. Se [Kontroller for elledninger](topic:power-line-checks).
- **Tabeller, ark og GIS.** Stringing- og mastetabeller, mængder (CSV, Excel, TakeoffCraft), plan- og profilark med en studierapport i én PDF, GIS-lag med alle aktivers data. Se [Tabeller, mængder, ark og GIS for elledninger](topic:power-line-outputs).
- **Efter de første forsøg.** Linjeprofilet følger den linje, du vælger, har en liste **Linje**, læser terræn, leder og frihøjde under markøren og måler mellem to punkter. Landskabsplanter og mure tæller som forhindringer under linjer; kabelruter og rør vises i linjeprofilet og krydser med en frihøjderegel, du vælger; **Regler…** ved siden af hver frihøjde åbner dine egne regler; og regelsæt med et bibliotek gemmes som pakker, der kan deles efter land. Se [Kontroller for elledninger](topic:power-line-checks) og [Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country).
- **Dine egne filformater.** Elledninger gemmes i CivilCraft-projektfilen, bibliotekerne i `.cclines.json` eller CSV, og regelsæt og pakker i deres egne JSON-filer: åbne formater, som alle kan læse eller konvertere. `.DON`-studiefilen er en ekstra import og eksport ved siden af dem.
- **Studiefiler (.DON), ikke testet.** Gem en linje som en `.DON`-studiefil til et andet linjeprogram, eller læs en anden linjes master; bygget ud fra formatets feltnavne og endnu ikke testet med det program. Se [Studiefiler](topic:power-line-study-file).

### Måling

- **Et måleværktøj.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Mål}} (eller {{key:M}}) måler på planen: hver sides længde og retning, den løbende sum, længden langs terrænet og hældningen, samt areal og omkreds, når du lukker formen. Intet tegnes ind i projektet. Se [Mål](topic:measure).

### Bygningsmasser

- **Tegn bygningsmasser.** I Egenskaber, under **Bygningsmasser**, {{ui:Tegn en masse}} (også {{ui:Overflade}} › {{ui:Mere}} › {{ui:Masser}}). Giv en masse etager og en etagehøjde, og læs dens bruttoetageareal. Vælg hvordan den står på skrånende terræn (trinvis, podium eller afgravet), og se opfyld og afgravning. Masser vises på planen, i PDF'en og i DWG og DXF på deres egne lag. Se [Tegn bygningsmasser på et område](topic:building-masses).
- **Skub og træk i 3D.** I 3D-visningen trækker du i en valgt masses tag, eller trykker {{key:PageUp}} og {{key:PageDown}}, for at ændre den en etage ad gangen, i ét fortrydelsestrin. **Sol** kaster masserne skygger. Se [I 3D-visningen](topic:building-masses#in-the-3d-view).
- **Zoneringsgrænser, du selv indtaster.** Tilbagetrækninger linje for linje fra vejlinjen, en højdegrænse, et lysplan, en udnyttelsesgrad og en bebyggelsesprocent. Byggefeltet tegnes på planen, og hver masse får et flueben eller et kryds for hver grænse. CivilCraft har ingen zoneringsregler indbygget: hvert tal er et, du selv indtaster fra din egen lokalplan. Se [Kontrollér masser mod de zoneringsgrænser, du indtaster](topic:zoning-limits).
- **Soltimer.** Vælg en dag eller en årstid og en tidszone ved navn eller forskel, og læs timerne med direkte sol på hver væg på hver masse, etage for etage, og på terrænet omkring dem, tegnet på planen. Gem væggene og terrænet som CSV. Projektet kræver et koordinatsystem. Se [Beregn soltimerne på et område](topic:sun-hours).
- **Masser som IFC, og videre til BimCraft.** {{ui:Masser som IFC}} gemmer masserne som IFC4, placeret på kortet, når projektet har et koordinatsystem. {{ui:Udvikl i BimCraft}} åbner BimCraft i et nyt faneblad med masserne, hvor **Udvikl denne masse** bygger vægge på hver etage og et dæk ud fra fodaftrykket. Intet uploades. Se [Send det videre](topic:building-masses#send-it-on).

### Tracéer

- **Klothoide-overgangskurver.** Skriv en længde i **Overgang ind** og **Overgang ud** i PI-tabellen for en kurve: tangent, overgangskurve, bue, overgangskurve, tangent, med lige eller forskellige længder. Planen markerer TS, SC, CS og ST, kurvelisten giver θs og tangent- og ydre afstande, og stationer og forskydninger løber gennem overgangskurverne. Se [Overgangskurver](topic:alignment#spirals).
- **Overgangskurver i LandXML.** LandXML skriver og læser klothoide-overgangskurver. Tracéer med overgangskurver, som CivilCraft tidligere sprang over ved import, åbnes nu. Se [Udveksl LandXML](topic:landxml).

### Korridorer

- **Byg hver side af dele.** Slå **Byg hver side af dele** til for at give hver side sin egen liste fra midterlinjen og udad: kørebaner, en skulder, en rendesten, en kantsten, en plantestrimmel, et fortov og en sideskråning med sin egen afgravning og opfyld. Start fra {{ui:Landevej}} eller {{ui:Bygade}} og kopiér den ene side til den anden. Tværsnittene markerer flowlinjen, kantstenen og gangarealet, og den planerede overflade har kantstenen. Se [Byg hver side af dele](topic:corridor#build-each-side-from-parts).
- **Overhøjde over overgangskurver.** På en kurve med overgangskurver løber overhøjdens overgang over overgangskurven: vandret tværfald i TS, fuld overhøjde i SC. Se [Overhøjde](topic:corridor#superelevation).

### 3D-filer

- **USD-eksport.** I 3D-visningen skriver {{ui:USD}} området som `.usda`, `.usdc` eller `.usdz` i rigtig størrelse og i dets projektkoordinater: overflader, rør og konstruktioner som net, linjer, hvert tracé og opmålingspunkter med deres numre. Se [Eksportér det 3D-område som USD](topic:usd).

### AI-assistenter

- **Mere til assistenter.** Når assistenter er slået til i {{ui:Indstillinger}} › {{ui:CivilCraft}}, kan en assistent nu også læse matrikler, afgravning og opfyld og profiler, tilføje opmålingspunkter, gemme projektet, eksportere LandXML, DWG og USD og arbejde i mapper, du vælger, i CadCraft Studio. Landskabsarbejdsområdet tilføjer værktøjer til at finde planter, placere planter, bede og hække, planere og kontrollere vanding. Filserveren og kommandolinjen `cadcraft` åbner gemte projekter uden vinduet. Se [Lad en AI-assistent arbejde med dit område](topic:assistants).

## I alle programmer

- **Enheder.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Enheder}} har én liste hver for længde, areal, volumen, vinkel og hældning, med de nøjagtige størrelser, enhedernes definitioner giver (amerikansk landmålerfod er sin egen enhed). Slå de enheder, du aldrig bruger, fra, så forsvinder de fra enhedslisterne; sæt en stjerne ved en, og nyt arbejde starter i den. En fil beholder altid sin egen enhed. I CivilCraft følger projektets liste **Enheder** kontakterne; en stjerne ved en metrisk længde starter nye projekter i meter (ellers fod, som er amerikanske landmålerfod), en stjerne ved areal eller volumen sætter den enhed, arealer og volumener angives i, og et længdefelt tager enhver enheds mærke, fx `3 ch` eller `450 mm`. Se [Enheder, skrevne værdier og enhedslisterne](common:unit-lists).
- **Tættere layout og paneler, der ryddes væk.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Layouttæthed}} › {{ui:Kompakt}} får plads til mere på skærmen (berøringsskærme og telefoner beholder deres store knapper). Hvert sidepanel har en smal titellinje: træk den for at fastgøre eller frigøre panelet, slip den på en anden panels linje for at dele én ramme som faner, fastgør den for at skubbe den væk mod kanten, eller skjul den og hent den tilbage fra kanten. Se [Arrangér panelerne](common:arrange-panels#make-the-layout-denser).
- **Dialogbokse kan flyttes.** Træk en dialogboks i dens titellinje væk fra tegningen; den vender tilbage, hvor du slap den. Dobbeltklik på titellinjen for at centrere den igen. Se [Flyt en dialogboks](common:arrange-panels#move-a-dialog).
- **Opskrifter til AI-assistenter.** Ti gennemarbejdede forespørgsler til din egen assistent (ryd op i en tegning, plot et sæt, kontrollér tegninger, stil en model spørgsmål, summér et mængdeudtræk, prøv en delvariant …), hver med de værktøjer, den kalder, og de tilladelser den kræver, og hver afspilles af vores tests. Programmerne indeholder ingen AI. Se [Opskrifter til AI-assistenter](common:assistants-recipes).
- **Sprog.** **Português (Portugal)** er nyt i {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Sprog}}. Det, **Português (Brasil)**, **Español (México)** og **Bahasa Indonesia** har nu alle programmernes ord, som kladder, der ikke er gennemlæst af en indfødt taler. Hjælpeemnerne er på engelsk, med få på spansk.
- **CadCraft Studio** siger, hvorfor en opdateringskontrol mislykkedes (ingen fil til dit system endnu, intet netværk, en ugyldig signatur) i stedet for blot »Færdig«, og holder op med at vise et Nyheder-kort, du har lukket, indtil der er en nyere udgivelse.

## Ikke i denne version endnu

- **0.7 er ikke kodesignéret.** Signering og Microsoft Store-pakken er flyttet til 0.8, fordi certifikatvalideringen endnu ikke er kommet igennem. Kontrollér SHA-256-værdien ved siden af hver fil på getcadcraft.com/download. På Windows, hvis SmartScreen stopper installationsprogrammet, vælg {{ui:Flere oplysninger}} og derefter {{ui:Kør alligevel}}. På en Mac skal du første gang højreklikke på CadCraft Studio og vælge {{ui:Åbn}}. CadCraft Studio er endnu ikke i en app-butik, og der er endnu ingen iPad- eller iPhone-version.
- Vinkel- og hældningslisterne i {{ui:Enheder}} gemmes, men ingen felt læser dem endnu.
- Producenters vandingshoveder: kun generiske hoveder og dine egne hoveder fra en fil. Producenters data kommer kun med deres tilladelse, og der er endnu ikke givet nogen.
- BimCraft og ModelCraft har planteListen, men deres Placér fra bibliotek tilbyder endnu ikke planter. Planter når BimCraft gennem landskabs-IFC.
- Landskabsværktøjerne til assistenter virker, mens CivilCraft-vinduet er åbent; filserveren og kommandolinjen har dem ikke endnu.
- Bygningsmasser: ingen dagslys eller vind på facader, ingen skygge fra træer eller noget, der ikke er tegnet som en masse, ingen tagformer, og soltimerne vises på planen, ikke i 3D-visningen. Udvikl i BimCraft bygger simple vægge og et dæk uden åbninger eller tag.
- Elledninger: ingen lands standard indbygget (du sætter lasttilfælde, grænser og frihøjder selv); ingen studier af lederkryb, termisk belastning af nedgravede kabler, kortslutning, beskyttelse eller jording; ingen linjer i 3D-visningen eller IFC. `.DON`-studiefilen er ikke testet med det program, der læser den.
- Overgangskurver ud over klothoider, en overgangskurve mellem to kurver og overgangskurver i feature-linjer. Overgangskurverne er kontrolleret mod formlerne og LandXML-skemaet, endnu ikke mod en LandXML-fil med overgangskurver fra et andet program.
- Korridorsamlinger, der ændrer sig langs vejen, regioner og mål for sideskråningen.
- Vandledninger og trykledningsnet (det næste civilarbejde), flow, der ændrer sig over tid, og forbindelser mellem vand- og regnvandsnet.
- Buer i tegnede brudlinjer. Standardtabeller for dimensionerende køretøjer: de fem køretøjer, der følger med, er pladsholdere. Feature-linjer delt mellem projekter venter på teamprojekter.

Alt andet står i [Ikke bygget endnu](topic:not-built-yet).
