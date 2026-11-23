---
title: Nyheder i 0.9 (tidligere)
summary: Korridor- og terrænskabeloner, fang- og Vælg-knapper ved tegning, GIS-analyse med attributtabel, skygge-, solenergi-, komfort- og vindundersøgelser for et sted, en 3D-renderingsvisning og tilføjelserne Punktskyer og WaterCraft.
keywords: nyheder 0.9, tidligere udgivelse, nyheder, 0.9, udgivelsesnoter, korridorskabeloner, terrænskabeloner, skabelonredigering, typisk tværsnit, flere korridorer, fang, vælg, flyt, kopiér, roter, tangent, render, 3d-render, gis-analyse, buffer, overlay, rumlig sammenkobling, attributtabel, stil efter attribut, skyggeundersøgelse, solenergi, utci, udendørs komfort, vindundersøgelse, openfoam, punktskyer, las, laz, watercraft, brandflow, brandhane, vandalder, klor, behov, tooltips, layout, changelog, ændringer, 0.8, 0.8.1, version, nye funktioner, regn, storm, oversvømmelse, overløb, jordarbejde, balance, afgravning og opfyld, transport, bedste rute, mindste omkostning, tracé, opholdsbassin, udløb, tømning, fribord, fremskridt, opmåling, drone, jordlager, adresse til område, matrikel, jord, skråningsstabilitet, bishop, sætning, kryds, afmærkning, sigtafstand, udjævning, mindste kvadrater, polygontræk, åbent brud, blokmodel, radiolink, fresnel, sporskifte, sprog, problemer, live, dwg
from: 4664522c
---

Dette er hvad der ændrede sig i CivilCraft 0.9 sammenlignet med 0.8.1. CivilCraft 0.9 er en del af CadCraft Studio 0.9 og dets otte apps. De store dele er korridor- og terrænskabeloner, fang mens du tegner, GIS-analyse, undersøgelser af et steds sol, solenergi, komfort og vind samt to tilføjelser: Punktskyer og WaterCraft.

## Nyt

### Korridor- og terrænskabeloner

- **Korridorskabeloner.** Åbn {{ui:Overflade}} › {{ui:Mere}} › {{ui:Korridorskabeloner…}} (eller skriv {{cmd:TEMPLATES}}). En skabelon er et lille tværsnit med komponenter, forskydninger, hældninger, materialer og punktkoder. Gem dem i projektet, i {{ui:Mit bibliotek}} eller som en `.cctemplates.json`-fil. Skabelonredigeringen viser en tegning i sand skala og lister problemer, mens du skriver.
- **Byg ud fra skabeloner efter station.** Vælg et tracé og slå {{ui:Byg ud fra skabeloner efter station}} til i dets Egenskaber. Hver side af hver region har sin egen belægningsliste og sin egen endebetingelse. {{ui:Tilføj en korridor}} under {{ui:Korridorer på dette tracé}} sætter flere korridorer på ét tracé.
- **Terrænskabeloner.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Terrænskabeloner…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) lægger lagdelte materialer såsom muldjord eller belægning og bund over et terræn med areal og volumen pr. lag. Se [Korridorskabeloner og terrænskabeloner](topic:corridor-templates).

### Tegning

- **Fang.** Værktøjerne Tracé, Plateau, Matrikel, Masse, Feature-linje, Mål, Grænse og Opland fanger til opmålingspunkter, PI'er, hjørner, hjørnepunkter og konstruktioner, med en etiket ved markøren. Hold {{key:Alt}} for et frit punkt.
- **Vælg-knapper, tangent og flyt, kopiér, roter.** Plateau-, matrikel- og feature-linje-hjørner har skrevne Øst- og Nord-felter og en korsmarkør-knap Vælg. Egenskaber har også {{ui:Tangent ud fra to punkter}} for tracéer og {{ui:Flyt, kopiér og roter}} for tracéer, plateauer, matrikler og feature-linjer. Se [Tegn med fang, valgte hjørner og flyt, kopiér, roter](topic:draft-with-snaps).
- **Renderingsvisning i 3D.** Knappen {{ui:Render}} på 3D-bjælken tegner landet med naturlige farver, himmel, dis og bløde skygger. Den ændrer ikke modellen. {{ui:Sol}}-menuen har nu knapperne {{ui:Anvend}} og {{ui:Luk}}. Se [Vis stedet i 3D](topic:site-3d).
- **Paneler åbner én sektion ad gangen.** Venstre panel og Egenskaber-panelet åbner én sektion og lukker de andre, og Landskab-båndets fliser, der rummer flere værktøjer, er opdelte knapper.

### GIS-analyse

- **Analyse.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Analysér}} tilbyder buffer, overlay, rumlig sammenkobling, valg efter attribut eller form og måling. Hvert værktøj laver et nyt lag i ét fortrydelsestrin.
- **Attributtabel.** Et lags menu med tre prikker har {{ui:Attributtabel…}} og {{ui:Stil efter attribut…}}. Se [Analysér GIS-lag](topic:gis-analysis) og [Arbejd med et lags attributtabel](topic:gis-table).

### Stedet: sol, solenergi, komfort og vind

- **Miljøsektion.** Vælg en masse: sektionen {{ui:Miljø}} sidder under {{ui:Soltimer}} i dens Egenskaber. Den har en skyggeundersøgelse (kort, tabel, animation, CSV), solenergi fra en typisk-års vejrfil (.epw) og udendørs komfort (UTCI).
- **Vind, kun til screening.** {{ui:Kør vindundersøgelse}} farver jorden fra siddende til ubehagelig for hver vindretning i vejrfilen. Den er ikke valideret, og panelet siger det.
- **Fodgængervind (OpenFOAM)-tilføjelse.** Slået fra, indtil du slår den til i {{ui:Indstillinger}} › {{ui:Add-ons}}. OpenFOAM er software, du selv installerer. Se [Skygge, solenergi og udendørs komfort](topic:environment).

### Punktskyer (tilføjelse)

- Slå {{ui:Punktskyer}} til i {{ui:Indstillinger}} › {{ui:Add-ons}}; en Punktskyer-fane vises i højre panel. Åbn en LAS- eller LAZ-fil, rens den, sorter den i terræn, vegetation og bygninger, byg terræn, højdekurver og volumener, og eksportér LAS eller LAZ. Se [Punktskyer fra drone eller scanner](topic:point-clouds).

### WaterCraft (tilføjelse)

- Slå {{ui:WaterCraft (vanddistribution)}} til i {{ui:Indstillinger}} › {{ui:Add-ons}}; en WaterCraft-fane vises. Den har behov fra kunder, brandflow ved hver brandhane, hvilken ledningsafbrydelse der betyder mest, og vandalder og klor, hver gemt som CSV. Se [WaterCraft: behov, brandflow, afbrydelser og vandalder](topic:watercraft).

### Arbejd sammen

- I en live-session ser du hinandens markører og navne i planen. Bibliotekplanter: CivilCraft Landskab starter fra sin standardsamling i biblioteket, {{ui:CivilCraft landskab}}.

## I alle apps

- Hints vises som Bootstrap-tooltips, og startens tip kan lukkes.
- En faneliste i et panel, der ikke passer, scroller i stedet for at blive klippet af.
- Faneblads-titler i browseren læses `<dokument> - CivilCraft | CadCraft`.
- {{ui:Indstillinger}} har et afsnit Layout, hvor layouts er en rullemenu med tolinjede valg.
- Vægt- og temperaturenheder ligger i {{ui:Indstillinger}} › {{ui:Global}} › {{ui:Enheder}}.
- Sprogmenuen viser de sprog, buildet har filer til. Andre sprog end engelsk er maskinoversatte kladder.

## Rettet

- Adresseopslaget og tilføjelserne EnergyPlus-kontrol kunne ikke slås til; nu kan de.
- Hjælpen siger nu, at tilføjelsen Punktskyer skriver en renset sky som LAS 1.4 eller LAZ.
- Klik på det valgte objekts eget greb starter ikke længere en gribetræk, der stoppede et ventende Vælg.

## Ærlige begrænsninger

- Eksempelkorridorskabelonerne er pladsholdere uden standard; en ingeniør skal kontrollere dem. Terrænskabeloner tilføjer ingen overflade og tegnes ikke i 3D eller i tværprofilvisningen. Den anden korridor på et tracé er ikke med i IFC-eksporten. Der er ingen overgang mellem to skabeloner efter station.
- Punktskyer er testet på opdigtede filer, ikke en rigtig drone-opmåling. Kun LAS og LAZ læses.
- GIS-analyse er testet på opdigtede lag.
- Skygge, sol og komfort er planlægningsskøn; vind er ikke-valideret screening. Intet af det er en projekteringsværdi.
- WaterCraft er et beregningshjælpemiddel, kontrolleret på opdigtede net. En vandingeniør afgør, hvad tallene er værd.
- Sprog ud over engelsk er maskinoversatte kladder.
- Windows-installationsprogrammer er ikke kodesignerede, og macOS-diskbilledet er ikke notariseret.

## Tidligere: 0.8 og 0.8.1

Dette er hvad der ændrede sig i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02), sammenlignet med 0.7. De store nye dele er værktøjer, der tester din planering og dit sted (regn, jordarbejde, ruter, bassiner, fremskridt), og seks beregningsvinduer for terræn, veje, opmåling, miner, forbindelser og bane.

### Nyt

**Test din planering**

- **Lad det regne.** {{ui:Lad det regne…}} (under {{ui:Overflade}}) sender en storm over det planerede terræn. Du ser vandet løbe af plateauerne, samle sig i de lave hjørner og overløbe de bassiner, der er for små. Kørslen er animeret og giver volumenerne, den maksimale udstrømning og en CSV med hvert bassin. Standardcellen er grov, så et første kig er hurtigt; en finere celle er langsommere. Bassiner, der overløber, vises også i panelet Problemer.
- **Jordarbejdsbalance.** {{ui:Jordarbejdsbalance…}} hæver eller sænker et plateau, til afgravning er lig opfyld, og viser transporttabellen mellem dem.
- **Bedste rute.** {{ui:Bedste rute…}}: vælg en start og en slutning, og CivilCraft finder den billigste vej hen over terrænet, der holder sig inden for dine hældnings- og kurvegrænser, og laver derefter et tracé ud af den.
- **Opholdsbassiner.** {{ui:Forsinkelsesbassiner…}} beregner trin og lagring ud fra dit terræn, tager udløbsanordninger (blænde, overløb, V-udløb, overløbsrende), dirigerer en storm gennem bassinet og kontrollerer den holdte spidsafstrømning, tømningstiden og fribordet.
- **Fremskridt fra opmålinger.** {{ui:Fremskridt fra opmålinger…}} sammenligner drone- eller scanningsoverflader fra forskellige datoer med terrænet, som det var, og med projektet: procent færdig efter volumen, over-gravede og over-fyldte områder, jordlagre og hvornår arbejdet er færdigt i dette tempo (markeret som et skøn).

**Kend stedet**

- **Adresse til område.** {{ui:Adresse til område…}} samler åbne data om matrikel, bygning, zonering, jord, oversvømmelse og terræn for ét sted. Du kan gemme stedet i projektfilen: den indtastede adresse, hver kilde med dagen du hentede den og dens licens, og hvad der kom tilbage. Åbn eller del projektet igen, og stedet er der stadig, uden at noget hentes igen. Du kan også gemme det som en stedfil eller sende det til BimCraft. Se [Adresse til område](topic:address-to-site).

**Terræn, veje, opmåling, miner, forbindelser og bane**

- **Jordbund og skråninger.** {{ui:Jordbund og skråninger…}} tegner jordprofilet mellem boringer, du indtaster. Bishops metode søger derefter den kritiske cirkel på dit terræn, med en grundvandsstand, en overbelastning og en jordskælvskoefficient; sætning af et fundament får konsolidering, øjeblikkelig sætning og tid.
- **Kryds og afmærkning.** {{ui:Kryds og afmærkning…}} samler ben med kantstensradier (én radius pr. ben, eller tre-centrede radier), sigtafstanden for projekteringshastigheden, en kontrol af sigtetrekanter, fodgængerfelter, stopstreger, markeringer og skilte med en skiltliste. De tegnes i planen og gemmes som en .dxf med navngivne lag.
- **Opmålingsudjævning.** {{ui:Opmålingsudjævning…}} kører en mindste-kvadraters-udjævning af et polygontræk eller net: udjævnede koordinater, fejlellipser, chi-i-anden-testen og et flag på målingen, der ikke passer. Frie net, lukning af et polygontræk efter kompasreglen og RW5-, GSI-, JobXML- eller CSV-feltfiler er med, og de udjævnede punkter gemmes som CSV.
- **Åbne brud.** {{ui:Åbne brud…}} omdanner boreprøver til en blokmodel og den endelige grube inden for din skråningsvinkel, med afdækningsforholdet, en tabel pr. bænk og en gehalt- og tonnagekurve. Indlejrede gruber efter indtægtsfaktor og en produktionsplan med diskonteret pengestrøm er også med.
- **Radiolinks.** {{ui:Radiolinks…}} kontrollerer sigtelinjen over dit terræn med jordens krumning, den første Fresnel-zone, linkbudget, fading-margin og multipath-udfald, og giver den mastehøjde, der ville rydde stien. Den laver også fiberbudgetter for tab, mængder til ruter og vinden på et tårn.
- **Sporskifter.** {{ui:Sporskifter…}} laver et sporskifte ud fra dets tungenummer, krydsningsspor mellem parallelle spor og en profilramme, hældet af kant og bredere i en kurve. Et sporskifte kan ligge ved en station på et tracé.

Se [Jord, kryds, opmålingsudjævning, miner, radiolinks og sporskifter](topic:soils-roads-survey-mines-links).

### I alle apps

- **Sprog.** 54 sprog, ti af dem nye. Andre sprog end engelsk er maskinoversatte kladder, indtil en indfødt taler læser dem. Hjælpeemner er stadig for det meste på engelsk.
- **Værktøjslinjens rækker.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Værktøjslinjens rækker}}: Brydning (som før), 2 rækker eller 1 række. Båndet i CivilCraft viser det mest brugte værktøj stort, de næste små, og resten bag gruppenavnets pil.
- **Inputenheder.** Trackpad, pen, 3D-mus, controller og MIDI kan styre appsene.
- **Problemer.** Et panel Problemer, der advarer i hver app, med kontroller, der læser reguleringspakker.
- **Live.** En visning af hvem der er hvor i en live-session.
- **Add-ons.** En liste over tilføjelser, med belysnings-tilføjelser.
- **Forbind din AI.** Enhver assistent du forbinder, kan styre CivilCraft's værktøjer. Den følger med en note om, at forbindelse med ét klik i CadCraft Studio og den hostede connector endnu ikke er klar. Se [Lad en AI-assistent arbejde med dit sted](topic:assistants).

### Rettet i 0.8.1

- **DWG-klasseafsnit.** Det blev læst som den forkerte type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skift af sprog under kørsel.** CadCraft Studio og de pakkede udgaver kan skifte sprog under kørsel. Det var før kun engelsk. Ikke endnu testet på alle platforme: sig til, hvis sproget ikke skifter.

### Ikke i denne version endnu

- **Dette er beregningshjælpemidler.** Hvert resultat i de nye vinduer kræver en ingeniørs kontrol. Jordstyrker starter fra typiske værdier for jordgruppen, og vinduet siger det.
- **Lad det regne.** En kørsel på eksempelstedet kan tage over to minutter i browseren ved en fin celle. Den er kontrolleret mod håndcases og en V-formet opland, ikke endnu på et rigtigt planeret sted.
- **Adresse til område.** Den læser åbne datafiler, du selv medbringer, og er kun testet på vores egne filer. Træer er ikke en kilde. Hentning af kilder for dig afventer formuleringen om privatliv.
- **Fremskridt fra opmålinger.** Testet på opdigtede opmålinger kun. Fremskridt på ark og markeringer (MarkupCraft) og scanning mod model (BimCraft) er ikke bygget.
- **Jord og skråninger.** Kun cirkulære flader: ingen kile- eller blokssøgning og ingen trækrevner.
- **Kryds.** Én radius pr. ben, ingen svingbaner for lastbiler, og de går endnu ikke ind i korridoren.
- **Feltfiler.** Læserne er skrevet ud fra offentlige formatbeskrivelser og afprøvet på filer, vi selv har lavet. Rigtige instrumentfiler efterspørges.
- **Radiolinks og bane.** Radiolinks: kun frirums-tab og multipath (ingen regnfading eller antennediagrammer), og ingen jernbanestandard: hver banegrænse er en pladsholder med udkastede tal, som ingen jernbaneingeniør har kontrolleret.
- **Windows og macOS.** 0.8 er ikke kodesigneret. Windows kan advare, og macOS beder om højreklik og derefter Åbn.

Alt andet står i [Ikke lavet endnu](topic:not-built-yet). For den tidligere udgivelse, se [Nyheder i 0.7](topic:whats-new-0-7).
