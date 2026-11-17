---
title: Nyt i 0.9
summary: Skabeloner til korridorer og terræn, fangst og valgknapper ved tegning, GIS-analyse med en attributtabel, skygge, soludbytte, komfort- og vindstudier for et område, en 3D-renderingsvisning samt add-on'ene Punktsky og WaterCraft.
keywords: nyheder, 0.9, udgivelsesnoter, korridorskabeloner, terrænskabeloner, skabelonredigering, typisk snit, flere korridorer, fangst, fangster, vælg, flyt, kopiér, roter, tangent, render, 3d-render, gis-analyse, buffer, overlay, rumlig sammenføjning, attributtabel, stil efter attribut, skyggestudie, soludbytte, utci, udendørs komfort, vindstudie, openfoam, punktskyer, las, laz, watercraft, brandvandsmængde, brandhane, vandalder, klor, forbrug, værktøjstips, layout, nyheder, hvad er nyt, udgivelsesnoter, ændringslog, ændringer, 0.8, 0.8.1, version, nye funktioner, regn, storm, vandansamling, overløb, jordarbejde, balance, afgravning og opfyld, transport, bedste forløb, mindste omkostning, tracé, forsinkelsesbassin, udløb, dræning, fribord, fremdrift, opmåling, drone, oplag, adresse til område, matrikel, jordbund, oversvømmelse, skråningsstabilitet, bishop, sætning, kryds, afmærkning, skilte, sigtlængde, udjævning, mindste kvadrater, polygontræk, åbent brud, blokmodel, radiolink, fresnel, sporskifte, krydsning, sprog, problemer, live, dwg
from: d7ac5b14
---

Dette er, hvad der er ændret i CivilCraft 0.9 sammenlignet med 0.8.1. CivilCraft 0.9 er en del af CadCraft Studio 0.9 og dets otte programmer. De store dele er skabeloner til korridorer og terræn, snap ved tegning, GIS-analyse, studier af et områdes sol, soludbytte, komfort og vind samt to add-on'er: Punktsky og WaterCraft.

## Nyt

### Skabeloner til korridorer og terræn

- **Korridorskabeloner.** Åbn {{ui:Overflade}} › {{ui:Mere}} › {{ui:Korridorskabeloner…}} (eller skriv {{cmd:TEMPLATES}}). En skabelon er et lille tværsnit med komponenter, forskydninger, hældninger, materialer og punktkoder. Gem dem i projektet, i {{ui:Mit bibliotek}} eller som en `.cctemplates.json`-fil. Skabelonredigeringen viser en tegning i rigtig størrelse og lister problemer, mens du skriver.
- **Byg ud fra skabeloner efter station.** Vælg et tracé og slå {{ui:Byg ud fra skabeloner efter station}} til i dets Egenskaber. Hver side af hver region har sin egen befæstelsesliste og sin egen slutbetingelse. {{ui:Tilføj en korridor}} under {{ui:Korridorer på dette tracé}} sætter flere korridorer på ét tracé.
- **Terrænskabeloner.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Terrænskabeloner…}} (eller skriv {{cmd:TERRAINTEMPLATES}}) lægger lagdelte materialer som muldjord eller belægning og underlag ned på et terræn med areal og volumen pr. lag. Se [Korridorskabeloner og terrænskabeloner](topic:corridor-templates).

### Tegning

- **Snap.** Værktøjerne Tracé, Plads, Matrikel, Masse, Feature-linje, Mål, Grænse og Opland snapper til opmålingspunkter, PI'er, hjørner, hjørnepunkter og konstruktioner, med en etiket ved markøren. Hold {{key:Alt}} nede for et frit punkt.
- **Valgknapper, tangent og flyt, kopiér, roter.** Hjørner på plads, matrikel og feature-linjer har skrevne felter for Øst og Nord og en krydsvalgsknap. Egenskaber har også {{ui:Tangent ud fra to punkter}} for tracéer og {{ui:Flyt, kopiér og roter}} for tracéer, pladser, matrikler og feature-linjer. Se [Tegn med snap, valgte hjørner og flyt, kopiér, roter](topic:draft-with-snaps).
- **Renderingsvisning i 3D.** Knappen {{ui:Render}} på 3D-linjen tegner landet med naturlige farver, himmel, dis og bløde skygger. Den ændrer ikke modellen. Menuen {{ui:Sol}} har nu knapperne {{ui:Anvend}} og {{ui:Luk}}. Se [Vis området i 3D](topic:site-3d).
- **Paneler åbner ét afsnit ad gangen.** Venstre panel og Egenskabspanelet åbner ét afsnit og lukker de andre, og Landskabsbåndets fliser, der rummer flere værktøjer, er delte knapper.

### GIS-analyse

- **Analysér.** {{ui:Overflade}} › {{ui:Mere}} › {{ui:Analysér}} tilbyder buffer, overlay, rumlig sammenføjning, valg efter attribut eller form og måling. Hvert værktøj laver et nyt lag i ét fortrydelsestrin.
- **Attributtabel.** Et lags menu med tre prikker har {{ui:Attributtabel…}} og {{ui:Stil efter attribut…}}. Se [Analysér GIS-lag](topic:gis-analysis) og [Arbejd med et lags attributtabel](topic:gis-table).

### Området: sol, solenergi, komfort og vind

- **Miljøafsnit.** Vælg en masse: afsnittet {{ui:Miljø}} sidder under {{ui:Soltimer}} i dens Egenskaber. Det har et skyggestudie (kort, tabel, animation, CSV), soludbytte ud fra en typisk års vejrfil (.epw) og udendørs komfort (UTCI).
- **Vind, kun til screening.** {{ui:Kør vindstudie}} farver terrænet fra siddende til ubehageligt for hver vindretning i vejrfilen. Den er ikke valideret, og panelet siger det.
- **Gangvind (OpenFOAM) add-on.** Slukket, indtil du slår den til i {{ui:Indstillinger}} › {{ui:Add-ons}}. OpenFOAM er et program, du selv installerer. Se [Skygge, soludbytte og udendørs komfort](topic:environment).

### Punktsky (add-on)

- Slå {{ui:Punktsky}} til i {{ui:Indstillinger}} › {{ui:Add-ons}}; et Punktsky-faneblad vises i højre panel. Åbn en LAS- eller LAZ-fil, rens den, sortér den i terræn, vegetation og bygninger, byg terrænet, konturer og volumener, og eksportér LAS eller LAZ. Se [Punktsky fra en drone eller scanner](topic:point-clouds).

### WaterCraft (add-on)

- Slå {{ui:WaterCraft (vandfordeling)}} til i {{ui:Indstillinger}} › {{ui:Add-ons}}; et WaterCraft-faneblad vises. Det har forbrug fra kunder, brandvandsmængde ved hver brandhane, hvilken hovedledningsafbrydelse der betyder mest, samt vandalder og klor, som hver gemmes som CSV. Se [WaterCraft: forbrug, brandvand, afbrydelser og vandalder](topic:watercraft).

### Arbejde sammen

- I en Live-session ser I hinandens markører og navne i planen. Bibliotekets planter: CivilCraft Landskab starter fra sin standardsamling i biblioteket, {{ui:CivilCraft-landskab}}.

## I alle programmer

- Hints vises som Bootstrap-værktøjstips, og starttippet kan lukkes.
- Et panels fanerække, der ikke får plads, ruller i stedet for at blive klippet af.
- Titler på browserfaner lyder `<dokument> - CivilCraft | CadCraft`.
- {{ui:Indstillinger}} har et afsnit Layout, hvor layouterne er en rulleliste med to-linjers valg.
- Vægt- og temperaturenheder ligger i {{ui:Indstillinger}} › {{ui:Globalt}} › {{ui:Enheder}}.
- Språllisten viser de sprog, som bygningen har filer til. Andre sprog end engelsk er maskinkladder.

## Rettet

- Add-ons til adresseopslag og EnergyPlus-kontrol kunne ikke slås til; nu kan de det.
- Hjælpen siger nu, at add-on'et Punktsky skriver en renset sky som LAS 1.4 eller LAZ.
- Klik på det valgte objekts eget greb starter ikke længere et gribertræk, der stoppede et ventende Valg.

## Ærlige begrænsninger

- Eksempelskabelonerne til korridorer er pladsholdere uden standard; en ingeniør skal kontrollere dem. Terrænskabeloner tilføjer ingen overflade og tegnes ikke i 3D eller i snitvisningen. Den anden korridor på et tracé er ikke med i IFC-eksporten. Der er ingen indsnævring mellem to skabeloner efter station.
- Punktsky er testet på opdigtede filer, ikke på en rigtig dronemåling. Kun LAS og LAZ læses.
- GIS-analysen er testet på opdigtede lag.
- Sol, solenergi og komfort er planlægningsestimater; vind er ikke-valideret screening. Intet af det er en dimensionerende værdi.
- WaterCraft er en beregningshjælp, kontrolleret på opdigtede net. En vandteknisk ingeniør afgør, hvad tallene er værd.
- Sprog ud over engelsk er maskinkladder.
- Windows-installationsprogrammer er ikke kodesignéret, og macOS-diskbilledet er ikke notariseret.

## Tidligere: 0.8 og 0.8.1

Dette er, hvad der er ændret i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02) sammenlignet med 0.7. De store nye dele er værktøjer, der tester din planering og dit område (regn, jordarbejde, forløb, bassiner, fremdrift), og seks beregningsvinduer til terræn, veje, opmåling, miner, forbindelser og bane.

### Nyt

**Test din planering**

- **Lad det regne.** {{ui:Lad det regne…}} (under {{ui:Overflade}}) slipper en storm løs på den planerede jord. Du ser vandet løbe af pladserne, samle sig i de lave hjørner og flyde over de bassiner, der er for små. Kørslen animeres og giver volumenerne, den største afløbsstrøm og en CSV med hvert bassin. Standardcellen er grov, så en første kig går hurtigt; en finere celle er langsommere. Bassiner, der flyder over, dukker også op i panelet Problemer.
- **Jordarbejdsbalance.** {{ui:Jordarbejdsbalance…}} hæver eller sænker en plads, indtil afgravning er lig opfyld, og viser transporttabellen mellem dem.
- **Bedste forløb.** {{ui:Bedste forløb…}}: vælg en start og en slutning, og CivilCraft finder den billigste vej hen over terrænet, der holder sig inden for dine hældnings- og kurvegrænser, og laver derefter et tracé ud fra den.
- **Forsinkelsesbassiner.** {{ui:Forsinkelsesbassiner…}} beregner trin og lager ud fra dit terræn, tager udløbsanordninger (blænde, overløb, V-udskæring, overløbsrende), sender en storm gennem bassinet og kontrollerer den tilbageholdte afløbsspids, tømningstiden og fribordet.
- **Fremdrift fra opmålinger.** {{ui:Fremdrift fra opmålinger…}} sammenligner drone- eller scanningsoverflader fra forskellige datoer med terrænet, som det var, og med projektet: procent færdigt efter volumen, områder, der er gravet for dybt og fyldt for meget, oplag og hvornår arbejdet er færdigt i dette tempo (markeret som et estimat).

**Kend området**

- **Adresse til område.** {{ui:Adresse til område…}} samler åbne data om matrikel, bygning, zonering, jordbund, oversvømmelse og terræn for ét område. Du kan gemme området i projektfilen: den indtastede adresse, hver kilde med den dag, du hentede den, og dens licens, og det der kom tilbage. Genåbn eller del projektet, og området er stadig der, uden at noget hentes igen. Du kan også gemme det som en områdefil eller sende det til BimCraft. Se [Adresse til område](topic:address-to-site).

**Terræn, veje, opmåling, miner, forbindelser og bane**

- **Jordbund og skråninger.** {{ui:Jordbund og skråninger…}} tegner jordprofilen mellem de borehuller, du skriver. Bishops metode søger derefter den kritiske cirkel på dit terræn, med en grundvandsstand, en overbelastning og en jordskælvskoefficient; sætning af et fundament får konsolidering, øjeblikkelig sætning og tid.
- **Kryds og afmærkning.** {{ui:Kryds og afmærkning…}} samler ben med kantstensafslutninger (én radius pr. ben, eller tre-centrede afslutninger), sigtlængden for den dimensionerende hastighed, en kontrol af sigtetrekanterne, fodgængerfelter, stopstreger, markeringer og skilte med en skiltliste. De tegnes på planen og gemmes som en .dxf med navngivne lag.
- **Opmålingsudjævning.** {{ui:Opmålingsudjævning…}} kører en udjævning efter mindste kvadraters metode af et polygontræk eller et net: udjævnede koordinater, fejlellipser, chi-i-kvadrat-testen og et flag på målingen, der ikke passer. Frie net, lukning af et polygontræk efter kompasreglen og RW5-, GSI-, JobXML- eller CSV-markfiler er med, og de udjævnede punkter gemmes som CSV.
- **Åbne brud.** {{ui:Åbne brud…}} gør boreprøver til en blokmodel og det endelige brud inden for din skråningsvinkel, med forholdet mellem afdække og malm, en tabel pr. bænk og en kurve for gehalt og tonnage. Indlejrede brud efter indtægtsfaktor og en produktionsplan med diskonteret pengestrøm findes også.
- **Radiolinks.** {{ui:Radiolinks…}} kontrollerer frit udsyn over dit terræn med jordens krumning, den første Fresnel-zone, linkbudget, fadingmargen og multipath-afbrydelse, og giver den mastehøjde, der ville rydde stien. Den laver også fiberbudgetter for tab, mængder for ruten og vinden på et tårn.
- **Sporskifter.** {{ui:Sporskifter…}} laver et sporskifte ud fra dets krydsningsnummer, krydsninger mellem parallelle spor og en profilramme, der hældes af overhøjde og udvides i en kurve. Et sporskifte kan ligge ved en station på et tracé.

Se [Jordbund, kryds, opmålingsudjævning, miner, radiolinks og sporskifter](topic:soils-roads-survey-mines-links).

### I alle programmer

- **Sprog.** 54 sprog, ti af dem nye. Andre sprog end engelsk er maskinkladder, indtil en indfødt taler har læst dem. Hjælpeemner er stadig for det meste på engelsk.
- **Værktøjslinjens rækker.** {{ui:Indstillinger}} › {{ui:Generelt}} › {{ui:Værktøjslinjens rækker}}: Bryd linjen (som før), 2 rækker eller 1 række. CivilCribs Bånd viser det mest brugte værktøj stort, de næste små, og resten bag pilen i gruppenavnet.
- **Inputenheder.** Touchpad, pen, 3D-mus, controller og MIDI kan styre programmerne.
- **Problemer.** Et panel med problemer, der advarer i alle programmer, med kontroller, der læser regelsæt.
- **Live.** En visning af, hvem der er hvor i en Live-session.
- **Add-ons.** En liste over add-ons, med belysnings-add-ons.
- **Forbind din AI.** Enhver assistent, du forbinder, kan styre CivilCraft-værktøjerne. Den følger med en note om, at forbindelse med ét klik i CadCraft Studio og den hostede forbindelse endnu ikke er klar. Se [Lad en AI-assistent arbejde med dit område](topic:assistants).

### Rettet i 0.8.1

- **Afsnittet DWG-klasser.** Det blev læst som den forkerte type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skift af sprog mens programmet kører.** CadCraft Studio og de pakkede udgaver kan skifte sprog under kørsel. De var kun på engelsk før. Ikke endnu testet på alle platforme: sig til, hvis sproget ikke skifter.

### Ikke i denne version endnu

- **Det er beregningshjælpemidler.** Hvert resultat i de nye vinduer kræver en ingeniørs kontrol. Jordstyrker starter fra typiske værdier for jordgruppen, og vinduet siger det.
- **Lad det regne.** En kørsel på eksempelområdet kan tage over to minutter i browseren ved en fin celle. Den er kontrolleret mod håndregnede cases og et V-formet opland, endnu ikke på et rigtigt planeret område.
- **Adresse til område.** Den læser åbne datafiler, du selv medbringer, og er kun testet på vores egne filer. Træer er ikke en kilde. Hentning af kilder for dig venter på formuleringen om privatlivet.
- **Fremdrift fra opmålinger.** Testet på opdigtede opmålinger kun. Fremdrift på ark og markeringer (MarkupCraft) og skanning mod model (BimCraft) er ikke bygget.
- **Jordbund og skråninger.** Kun cirkulære flader: ingen kile- eller blokssøgning og ingen trækrevne.
- **Kryds.** En radius pr. ben, ingen kørespor for lastbiler, og de går endnu ikke ind i korridoren.
- **Markfiler.** Læserne er skrevet ud fra offentlige formatbeskrivelser og afprøvet på filer, vi har lavet. Rigtige instrumentfiler er ønskede.
- **Forbindelser og bane.** Radiolinks: kun tab i frit rum og multipath (ingen regnfading eller antennediagrammer), og ingen jernbanestandard: hver banegrænse er en pladsholder med udkaststal, som ingen jernbaneingeniør har kontrolleret.
- **Windows og macOS.** 0.8 er ikke kodesignéret. Windows kan advare, og macOS beder om højreklik og derefter Åbn.

Alt andet står i [Ikke bygget endnu](topic:not-built-yet). For den tidligere udgivelse, se [Nyt i 0.7](topic:whats-new-0-7).
