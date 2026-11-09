---
title: Nyheder i 0.8 og 0.8.1
summary: CivilCraft 0.8 tilføjer Lad det regne (en stormkørsel over din terrænplanering), en jordarbejdsbalancer, en finder til bedste forløb, forsinkelsesbassiner, fremdrift fra opmålinger, en importør fra adresse til område, der bevarer området i projektet, og vinduer til jord og skråninger, kryds og afmærkning, opmålingsudjævning, åbne brud, radiolinks og sporskifter. 0.8.1 retter, hvordan DWG-filer læses.
keywords: nyheder, hvad er nyt, udgivelsesnoter, ændringslog, ændringer, 0.8, 0.8.1, version, nye funktioner, regn, storm, vandopsamling, overløb, jordarbejde, balance, afgravning og opfyld, transport, bedste forløb, laveste omkostning, tracé, forsinkelsesbassin, udløb, tømning, frihøjde, fremdrift, opmåling, drone, lager, adresse til område, matrikel, jord, oversvømmelse, skråningsstabilitet, Bishop, sætning, kryds, afmærkning, skilte, sigtafstand, udjævning, mindste kvadrater, polygontræk, åbent brud, blokmodel, radiolink, Fresnel, sporskifte, sporforbindelse, sprog, problemer, live, dwg
from: b0932cf0
---

Dette er ændringerne i CivilCraft 0.8 (2026-11-01) og 0.8.1 (2026-11-02) sammenlignet med 0.7. De store nye dele er værktøjer, der tester din terrænplanering og dit område (regn, jordarbejde, forløb, bassiner, fremdrift), og seks beregningsvinduer til terræn, veje, opmåling, brud, radiolinks og bane.

## Nyt

### Test din terrænplanering

- **Lad det regne.** {{ui:Make it rain…}} (under {{ui:Surface}}) sender en storm ned over det planerede terræn. Du ser vandet løbe af plateauerne, samle sig i de lave hjørner og flyde over de bassiner, der er for små. Forløbet er animeret og giver volumenerne, spidsudstrømningen og en CSV med hvert bassin. Standardcellen er grov, så en første gennemgang går hurtigt; en finere celle er langsommere. Bassiner, der flyder over, vises også i panelet med problemer.
- **Jordarbejdsbalance.** {{ui:Earthwork balancer…}} hæver eller sænker et plateau, indtil afgravning er lig med opfyld, og viser transporttabellen mellem dem.
- **Bedste forløb.** {{ui:Best route…}}: vælg et start- og et slutpunkt, og CivilCraft finder den billigste vej hen over terrænet, der holder sig inden for dine fald- og kurvegrænser, og laver derefter et tracé ud fra den.
- **Forsinkelsesbassiner.** {{ui:Detention ponds…}} beregner trin og lager ud fra dit terræn, tager udløbsenheder (åbning, overløb, V-udskæring, overløbsrende), lader en storm løbe gennem bassinet og kontrollerer den tilbageholdte spidsvandføring, tømningstiden og frihøjden.
- **Fremdrift fra opmålinger.** {{ui:Progress from surveys…}} sammenligner drone- eller scanningsflader fra forskellige datoer med terrænet, som det var, og med projektet: procent færdigt efter volumen, områder der er gravet for dybt eller fyldt for meget, lagerpladser, og hvornår arbejdet er færdigt i dette tempo (markeret som et estimat).

### Kend området

- **Adresse til område.** {{ui:Address to site…}} samler åbne data om matrikel, bygning, zonering, jord, oversvømmelse og terræn på ét område. Du kan gemme området i projektfilen: den indtastede adresse, hver kilde med den dag, du hentede den, og dens licens, samt hvad der kom tilbage. Genåbner eller deler du projektet, er området der stadig, uden at noget hentes igen. Du kan også gemme det som en områdefil eller sende det til BimCraft. Se [Adresse til område](topic:address-to-site).

### Terræn, veje, opmåling, brud, radiolinks og bane

- **Jord og skråninger.** {{ui:Soils and slopes…}} tegner jordprofilet mellem de boringer, du skriver ind. Bishops metode finder derefter den kritiske cirkel på dit terræn, med et grundvandsspejl, en overlast og en jordskælvskoefficient; sætning under et fundament får konsolidering, øjeblikkelig sætning og tid.
- **Kryds og afmærkning.** {{ui:Junctions and striping…}} samler ben med kantstensafslutninger (én radius pr. ben, eller tre-centrede afslutninger), sigtafstanden for projekteringshastigheden, en kontrol af sigttrekanterne, fodgængerfelter, stopstreger, markeringer og skilte med en skiltliste. De tegnes på planen og gemmes som en .dxf med navngivne lag.
- **Opmålingsudjævning.** {{ui:Survey adjustment…}} kører en mindste kvadraters udjævning af et polygontræk eller et netværk: udjævnede koordinater, fejlellipser, chi-i-anden-testen og et flag på den måling, der ikke passer. Frie netværk, lukning af et polygontræk med kompasreglen og markfiler i RW5, GSI, JobXML eller CSV er med, og de udjævnede punkter gemmes som CSV.
- **Åbne brud.** {{ui:Open pits…}} omsætter boreprøver til en blokmodel og det endelige brud inden for din skråningsvinkel, med strip-forholdet, en tabel pr. bænk og en kurve for gehalt og tonnage. Indlejrede brud efter indtægtsfaktor og en produktionsplan med diskonteret cashflow findes også.
- **Radiolinks.** {{ui:Radio links…}} kontrollerer sigtelinjen over dit terræn med jordens krumning, den første Fresnel-zone, linkbudget, fadingmargen og multipath-udfald, og angiver den masthøjde, der giver fri passage. Det laver også budgetter for fiberdæmpning, mængder for ruten og vinden på et tårn.
- **Sporskifter.** {{ui:Rail turnouts…}} laver et sporskifte ud fra dets krydsningsnummer, sporforbindelser mellem parallelle spor og en konstruktionsprofil, der hælder med overhøjden og udvides i en kurve. Et sporskifte kan ligge ved en station på et tracé.

Se [Jord, kryds, opmålingsudjævning, brud, radiolinks og sporskifter](topic:soils-roads-survey-mines-links).

## I alle apps

- **Sprog.** 54 sprog, ti af dem nye. Sprog ud over engelsk er maskinoversættelser, indtil en indfødt taler har læst dem. Hjælpeemnerne er stadig for det meste på engelsk.
- **Værktøjslinjens rækker.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Ombryd (som før), 2 rækker eller 1 række. CivilCrafts bånd viser det mest brugte værktøj stort, de næste småt, og resten bag gruppenavnets pil.
- **Inputenheder.** Trackpad, pen, 3D-mus, controller og MIDI kan styre programmerne.
- **Problemer.** Et panel med problemer, der advarer i alle apps, med kontroller, der læser reguleringspakker.
- **Live.** En visning af, hvem der er hvor i en Live-session.
- **Add-ons.** En liste over add-ons, med belysnings-add-ons.
- **Forbind din AI.** Enhver assistent, du forbinder, kan styre CivilCrafts værktøjer. Den følger med en note om, at forbindelse med ét klik inde i CadCraft Studio og den hostede connector endnu ikke er klar. Se [Lad en AI-assistent arbejde med dit område](topic:assistants).

## Rettet i 0.8.1

- **Afsnittet DWG-klasser.** Det blev læst som den forkerte type (GitHub cadcraft#5). Rettet i CivilCraft sammen med CadCraft, BimCraft, ModelCraft og TakeoffCraft.
- **Skift sprog under kørsel.** CadCraft Studio og de pakkede udgaver kan skifte sprog under kørsel. Før var de kun på engelsk. Endnu ikke testet på alle platforme: giv os besked, hvis sproget ikke skifter.

## Ikke i denne version endnu

- **Dette er beregningshjælpemidler.** Alle resultater i de nye vinduer kræver en ingeniørs kontrol. Jordstyrker starter fra typiske værdier for jordgruppen, og vinduet siger det.
- **Lad det regne.** En kørsel på eksempelområdet kan tage over to minutter i browseren ved en fin celle. Den er kontrolleret mod håndregnede cases og et V-formet opland, men endnu ikke på et rigtigt planeret område.
- **Adresse til område.** Den læser åbne datafiler, du selv medbringer, og er kun testet på vores egne filer. Træer er ikke en kilde. Hentning af kilder for dig afventer formuleringen om privatlivet.
- **Fremdrift fra opmålinger.** Testet på opdigtede opmålinger kun. Fremdrift på ark og markeringer (MarkupCraft) og scanning mod model (BimCraft) er ikke lavet.
- **Jord og skråninger.** Kun cirkulære flader: ingen kile- eller blokssøgning og ingen trækrevner.
- **Kryds.** Én radius pr. ben, ingen kørekurver for lastbiler, og de går endnu ikke ind i korridoren.
- **Markfiler.** Læserne er skrevet ud fra offentlige formatbeskrivelser og afprøvet på filer, vi har lavet. Rigtige instrumentfiler er ønsket.
- **Links og bane.** Radiolinks: kun fri-rum-dæmpning og multipath (ingen regnfading eller antennediagrammer), og ingen jernbanestandard: hver banegrænse er en pladsholder med foreløbige tal, som ingen jernbaneingeniør har kontrolleret.
- **Windows og macOS.** 0.8 er ikke kodesigneret. Windows kan advare, og macOS beder om højreklik og derefter Åbn.

Alt andet står i [Ikke lavet endnu](topic:not-built-yet). For den tidligere udgivelse, se [Nyheder i 0.7](topic:whats-new-0-7).
