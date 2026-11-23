---
title: Ikke lavet endnu
summary: Hvad denne version af CivilCraft endnu ikke gør, og hvad du gør i stedet i dag.
keywords: mangler, begrænsninger, køreplan, ikke tilgængelig, spiraler, udvidelse, dwg, dxf, indløb, opholdsbassin, tværprofiler, kommer senere, grænser
from: b91588d4
---

CivilCraft er tidlig. Denne side lister, hvad den nuværende version ikke gør, så du ikke leder efter det. Intet her er lovet til en bestemt dato.

## Punkter

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Tilføjelse af en anden punktfil til den første | Sammenføj filerne i en teksteditor eller et regneark først |
| Eksport af en punkttekstfil | Eksportér LandXML (punkter går ud som CgPoints), brug GIS {{ui:Eksportér}} (punkter med felterne P, N, E, Z og D), eller {{ui:Kopiér}} punkterne ind i et regneark |
| Punktetiketstile, symboler pr. beskrivelsesnøgle, kurver (buer) fra linjekoder, en beskrivelsesnøglefil til deling mellem projekter | Etiketter viser nummer, kote og beskrivelse, eller mindre ([CivilCraft-indstillinger](topic:settings)); nøgler gemmes i projektfilen |
| Enhedskonvertering | Konvertér filen før import; **Enheder** ændrer kun mærkaten |

## Overflader

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mere end én overflade bygget af punkter | Ét projekt pr. overflade |
| Skjul (indre) grænser | Brug **Længste ydre kant** eller en ydre grænse |
| Valg eller redigering af én tegnet brudlinje | {{key:Mod+Z}}, eller {{ui:Fjern tegnede brudlinjer}} og tegn igen |
| Redigering af en overflade læst fra LandXML (brudlinjer, grænse) | {{ui:Genopbyg overfladen fra punkterne}} |
| Redigering af en overflade lavet af et kotenet | Importér nettet igen med andre valg |
| Konvertering af en overflade læst fra LandXML, når koordinatsystemet ændres | Først {{ui:Genopbyg overfladen fra punkterne}} |
| Mærkede punktkoter og hældningsværdier | Læs dem i statuslinjen, eller farvelæg overfladen efter hældning med **Hældningsanalyse** i arbejdsområdet Landskab ([Planering til landskab](topic:landscape-grading#grading-checks)) |

## Tracéer og længdeprofiler

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Spiraler andre end klotoider; en spiral mellem to kurver (sammensatte overgange) | Klotoidespiraler ved enderne af en kurve er tilgængelige; de andre er navngivet og springes over ved LandXML-import |
| Indsætning af et PI mellem to andre | Tegn tracéet igen, eller indtast PI-koordinaterne igen |
| Tracéer fra objekter, forskydninger, udvidelser | Tegn med PI'er |
| Indtastning af K for en lodret kurve | Indtast L (K vises) |
| Cirkulære og usymmetriske lodrette kurver | Kun symmetriske parabolske kurver |
| Mere end ét projekteret længdeprofil pr. tracé | Ét tracé pr. variant |
| Zoom i længdeprofilvisningen, profilbånd under profilet | Længdeprofilvisningen tilpasser hele tracéet; plot den på [plan- og profilark](topic:plan-profile-sheets) |
| Tværprofiler i DWG eller LandXML | Tværprofilark som PDF; {{ui:CSV}} af arealerne og volumenerne |
| Snitlinjer i en vinkel, eller med forskellige bredder langs vejen | Én bredde på hver side for hele tracéet |

## Korridorer

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mider, autoværn og en overhøjde, der roterer skabeloner | Tegn dem som skabeloner ([Korridorskabeloner](topic:corridor-templates)); skabeloner efter station tager endnu ikke overhøjde |
| En gradvis ændring mellem to områders skabeloner (overgange, tilspidsninger) | Skift skabelon ved en station, eller giv et punkt et breddemål til en linje tegnet som tilspidsningen |
| Rotation om en kant, overhøjde i LandXML | Overhøjde roterer om midterlinjen på cirkulære kurver; udvid en kørebane med et breddemål til en feature-linje |
| Mål for sideskråninger (dagslinje til en linje eller en overflade), egne korridoroverflader | Mål flytter kanterne af kørebane og skuldre ([Korridorer](topic:corridor)); korridoren planeres ind i den projekterede overflade |
| Kantstensradier, svingbaner og øer planeret ind i et kryds; en sidevejs ende skåret til hovedvejens kant i en skæv vinkel; en sti forbundet med en vej i planen, i dens længde og areal | Veje, der mødes, forbindes vinkelret, med hovedvejens kant åbnet og sidevejen jævnet til den ([Hvor veje mødes](topic:corridor#where-roads-meet-roads-pads-and-paths)); en sti stopper ved vejens kant i den projekterede overflade og i 3D |
| Korridorer eksporteret som LandXML-veje; en anden korridor på et tracé i IFC-eksporten | Den projekterede overflade eksporteres |
| Terrænskabeloner, der ændrer den projekterede overflade, i 3D eller i tværprofilerne | De giver arealer og volumener for hvert lag ([Terrænskabeloner](topic:corridor-templates#terrain-templates)) |
| Svingbaner med hastighed, dækslip, styretid, styrede anhængere eller karrosseriafstand; et bibliotek med standard-dimensioneringskøretøjer; en svingbane tegnet ved at trække køretøjet | Svingbaner ved lav hastighed langs en feature-linje eller et tracé, med dine egne køretøjsstørrelser ([Køretøjers svingbaner](topic:swept-paths)) |

## Planering og mængder

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Bænke, åbne feature-linjer planeret ind i projektet, planering til en feature-linje fra et andet sted | Luk feature-linjen ([Feature-linjer](topic:feature-lines)), eller brug den som brudlinje i det eksisterende terræn |
| Indsætning eller fjernelse af et hjørnepunkt på en feature-linje | Tegn linjen igen, eller lav en trinvis forskydning af den |
| Buer i tegnede brudlinjer (gennem opmålingspunkter), spiraler i feature-linjer | Tegn en feature-linje med buer og brug den som brudlinje i det eksisterende terræn |
| Planering til en afstand, kote eller en anden overflade | Kun dagslinje til eksisterende terræn |
| Tilføjelse eller fjernelse af et plateauhjørne | Slet plateauet og tegn det igen |
| Volumener TIN-til-TIN (prisme), valg af gittercellestørrelse | Gittermetode, cellestørrelse valgt for dig |
| Sammentrykning og udvidelse, muldjord, belægningsdybder | Anvend faktorer på de angivne tal selv |
| Frit transport- og overtransportomkostninger, transport på tværs af forskellige tracéer, lånegrave og deponier placeret i planen | Massediagrammet med balancepunkter, flyttede volumener og gennemsnitlige transportafstande |

## Rørnet

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mere end ét net pr. projekt | Separate projekter for regnvand og spildevand |
| Vandledninger: vandkvalitet og alder, regelbaserede styringer, andre ventiltyper (flowregulering, strubning, fastholdelse), pumper angivet ved effekt, efterspørgsel der afhænger af tryk, en Darcy–Weisbach-mulighed, et rørkatalog med vægtykkelser og trykklasser. Resten af trykledningsnettene er under udvikling: [Vandledninger](topic:water-mains) | Kontrollér dem i software til vanddistribution; spildevandets dimensionerende flow findes i [Spildevandets dimensionerende flow](topic:sanitary-design) |
| Spildevandsflow over tid (hydrografer, dynamisk rutning, lagring, pumper, overløb) | [Spildevandets dimensionerende flow](topic:sanitary-design) giver det stationære spidsflow, et dimensioneringsark bruger |
| Indløbskapacitet, rendestensspredning, opholdsrouting, hydrografer, energitab andet end én samlingskoefficient | Kontrollér dem i anden software; flow, dimensioner og hydrauliske kotelinjer er i [Regnvandsafledning](topic:storm-drainage) |
| Oplande i PDF-plot, DWG, DXF eller LandXML; oplande fra overfladen (vandskel) | Tegn oplande i hånden; de gemmes i projektfilen |
| Rørkataloger, ikke-runde rør, konstruktioner der ikke er lodrette kasser eller cylindre (kegler, trin, benk), en dræningskategori i biblioteket | Konstruktionstyper ud fra parametre ([Rørnet](topic:pipe-network)); rør med en diameter |
| Rør i længdeprofilvisningen, buede rør | Læs bundkoter og overdækning i højre panel |

## Matrikler

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Opdeling af grunde efter areal eller facadelængde, matrikler fra linjerne omkring dem, vejareal | Tegn hver matrikel efter dens hjørner, eller indtast dens opmålingsangivelser |
| Kurvetabeller og linjetabeller i planen; etiketter flyttet i hånden | Hver strækning er mærket langs sig selv |
| Matrikler i LandXML | Matrikler gemmes i projektfilen og går til PDF, DWG og DXF |

## Polygontræk

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mindste-kvadraters udjævning, transitreglen, vægtning af vinkler mod afstande | Kompasreglen |
| Afbøjningsvinkler, zenitvinkler og skrå afstande, koter ved trigonometrisk nivellement | Reducér til vandrette afstande og vinkler rigtigt, eller brug retninger |
| Sideskud, rådatafiler fra dataopsamlere | Importér punkterne som en punktfil |

## Afsætning

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Forskudte pæle (referencepunkter sat tilbage fra pælen), skråningspæle ved skæringspunktet | Afsæt i de forskydninger, du har brug for, også forbi skulderen |
| Afsendelse af pæle direkte i en dataopsamlers eget format | CSV-filen åbner i kontorsoftwaren hos de fleste dataopsamlere |
| Afsætning af rør, plateauer og matrikler | Brug opmålingspunkter nær et tracé, eller matriklens strækninger |

## Filer og output

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Tekst, skravering og målsætninger fra DWG eller DXF; papirrum; eksterne referencetegninger (xrefs); binær DXF | Linjeværk fra modelrum åbner ([Åbn en DWG eller DXF som linjeværk](topic:open-dwg-dxf)); åbn eksterne referencetegninger hver for sig |
| Flytning af flere punkter på én gang ved at trække | Klip og sæt dem ind, eller redigér dem ét ad gangen |
| Portrætark, egne tegningshoveder, viewports du arrangerer, plan- og profilark i DWG | Ét landskabsplanark pr. PDF, eller plan- og profilark langs et tracé (PDF) |
| Plot af kotebånd og profiler | Bånd vises kun på skærmen; tag et skærmbillede, hvis du har brug for dem |
| Ændring af lagnavne, farver eller etiketstile | Ændr dem i et CAD-program efter DXF-eksport |
| Skylagring og versionshistorik | Gem `.civilcraft.json`-filer og hold dem sikkert; for at arbejde på ét projekt sammen, brug en live-session i CadCraft Studio ([Projekter ét sted sammen, live](topic:work-live)) |
| CadCraft Studio til iPad og iPhone, og fra Google Play | Brug CivilCraft i browseren på enheden; på Android installeres CadCraft Studio fra sin APK på getcadcraft.com/download |
| Åbning af flere punkt- eller projektfiler på én gang | Én fil pr. åbning (GIS-filer, der hører sammen, såsom shapefilens dele, åbnes sammen) |

## Landskab

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Producenters hoveder og dyser | Generiske hoveder, eller tilføj dine egne hoveder fra en fil; producenternes data kommer ind, efterhånden som de giver tilladelse |
| Maksimale sidelængder for drypslanger, flow over tid, pumper, lukkede rørnet | Hold dryprækker inden for producentens publicerede længde; kontrollen kræver et forgrenet net |
| Den nøjagtige omrids af et konkavt frit objekt; dets volumen under jorden målt nøjagtigt | Den konvekse indhylning planeres, og volumen under jorden er et skøn (angivet i Egenskaber) |
| Planter i BimCraft og ModelCraft fra deres egen Placér fra bibliotek | Eksportér landskabs-IFC og åbn den i BimCraft ved siden af bygningen |
| Detaljerede plantemodeller (blade, grene, årstider) i 3D-visningen; frie objekter og vanding i 3D-visningen | Planter vises i 3D som enkle former dimensioneret ud fra plantelisten ([Vis stedet i 3D](topic:site-3d)); ModelCrafts spredning laver plantebilleder |
| Befæstelsesmure, der holder et planeret niveau bag dem på overfladen | Giv et plateau eller en plade lodrette sider: de er støttemure på overfladen ([Planering](topic:grading)) |
| SVG-transformationer i egne symboler; teksturer og farver på egne GLB-plantemodeller; komprimeret GLB-geometri | Gør transformationer flade i dit tegneprogram først; modeller tegnes i plantens farve; eksportér GLB uden komprimering ([Plantegrafik](topic:plant-graphics)) |
| Din egen plantliste gemt i din bibliotekskonto (redigeret i appen) | Redigér projektets egen liste i Planttabellen og gem den som en plantefil |
| Landskabsværktøjerne til assistenter uden vinduet (filserveren og kommandolinjen) | De virker, når CivilCraft-vinduet er åbent ([Lad en AI-assistent arbejde med dit sted](topic:assistants)) |

## Kraftledninger

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Et lands standard indbygget (lasttilfælde, afstande, faktorer) | Angiv din standards værdier i {{ui:Lasttilfælde og grænser…}} og gem dem, med dit bibliotek, som en pakke til genbrug og deling ([Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Den vandrette afstand fra en leder til en trækrone eller en mur ved siden af ledningen | Den lodrette afstand op over planter og mure, ledningen krydser ([Kontrol af kraftledninger](topic:power-line-checks#clearances)) |
| Lederkryb og en ny leders strækning | Tag højde for dem via temperaturerne i udspændingstabellen |
| Termisk mærkestrøm for nedgravede kabler (strømbærekapacitet ud fra hvordan de lægges) | Indtast din leverandørs mærkestrøm på kabelelementet |
| Kortslutnings-, beskyttelses- og jordingsstudier | Brug et dedikeret elprogram; CivilCraft giver netværkets længder og kabler |
| Gittermaster projekteret element for element, og forankringer i jorden | Master kontrolleres efter deres nominelle last; forankringer efter deres mærkelast |
| En `.DON`-studiefil kontrolleret i det program, der læser den | Kontrollér filen dér; send os en prøve, så vi kan teste mod en rigtig |
| Kraftledninger i 3D-visningen og i IFC | Planen, linjeprofilet, arkene og GIS-lagene |
| Kraftledningsværktøjerne til assistenter uden vinduet | De virker, når CivilCraft-vinduet er åbent ([Lad en AI-assistent arbejde med dit sted](topic:assistants)) |

## Bygningsvolumener

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Et bibliotek med zoneforskrifter eller nogen bys regler | Skriv grænserne fra din egen vedtægt ([Zoneringsgrænser](topic:zoning-limits)) |
| Himmellys på murene (facadedagslys), vind | [Solstunder](topic:sun-hours) tæller kun direkte sol |
| Skygge fra træer, planter eller alt, der ikke er tegnet som en masse | Tegn naboernes bygninger som masser |
| Tagformer på masser | Masser med flad top |
| Åbninger, tage og muretyper, når en masse udvikles i BimCraft | BimCraft bygger simple ydervægge på hver etage og en dæk; tilføj resten dér |

## GIS og koordinatsystemer

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| File Geodatabase; KML-stilarter, ikoner, jordoverlejringer og netværkslinks | Konvertér til GeoPackage, shapefile eller GeoJSON først; KML-placemarks læses uden deres stilarter |
| Redigering af GIS-elementer eller deres attributter | Redigér dem i et GIS-program og importér igen. Analyse-panelet laver nye lag (buffer, overlay, join, selektion) og tilføjer areal- og længdefelter, men det redigerer ikke et element på stedet |
| Netværks- og rasteranalyse, buffere med flade eller firkantede ender og ensidige buffere, tilføjelse eller sletning af rækker og ændring af et felts type i attributtabellen, manuelle klassefarver, en stilforklaring i plots | Brug {{ui:Vælg}} til at vælge elementer og lav et lag af dem; flade ender tilbydes ikke. Farvelægning efter attribut og attributtabellen er bygget: se [Stil et lag efter en attribut](topic:gis-symbology) og [Arbejd med et lags attributtabel](topic:gis-table) |
| Etiketstile (størrelse, placering) og etiketter, der undgår hinanden | Etiketter har én størrelse og kan overlappe, hvor elementerne er tætte |
| Vertikale datummer og geoidemodeller | Koter bruges, som filen angiver dem; kontrollér det vertikale datum selv |
| Gitterforskydninger andet end til NAD83 fra NAD27 foreslået efter område (OSTN15; NTv2 for andre datummer virker, når du tilføjer filen), flere gitre på én gang, vertikale gitre | Tilføj gitterfilen for dit datum selv; ét gitter pr. projekt |
| Kortlag i DXF eller i 3D-eksporter | Kortlag går ind i PDF-plottet og ved siden af DWG som et billede |
| Kortservere der kræver login, nøgle eller token | Brug offentlige tjenester, eller en georefereret billedfil |
| Skrivning af LAS- eller LAZ-filer fra en overflade, terrænmodellen eller kote-net- og LiDAR-værktøjerne | Eksportér overflader som en GeoTIFF-kotenet. [Punktskyer](topic:point-clouds)-tilføjelsen skriver en renset sky som LAS 1.4 eller LAZ |
| LiDAR-intensitet, farve og retur; kotenet med flere bånd; net- eller LiDAR-filer over 200 MB | LiDAR filtreres kun efter klasse, net bruger deres første bånd; skær store filer i fliser først |

## Input

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Boksvalg med berøring (det kræver {{key:Shift}}) | Langt tryk på hvert opmålingspunkt for at tilføje det |
| Indtastede koordinater eller afstande under tegning | Tegn groft, og indtast derefter præcise PI-koordinater i tracéets PI-tabel |
| Indtastning af koordinater for plateauhjørner og konstruktioner | Træk deres greb; zoom ind for præcision og følg E og N i statuslinjen |
| Fangst til objekter (andet end opmålingspunkter for brudlinjer) | Zoom ind og følg statuslinjen |

## 3D-visning

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Tegning eller redigering i 3D-visningen | Tegn og redigér i planen; 3D-visningen følger hver redigering |
| Valg af korridorers feature-linjer eller GIS-elementer ved at klikke i 3D | Klik på dem i planen |
| Eksport af den overdrevne visning eller i fod | Eksporter er i sand skala i meter; se [Eksportér stedet i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-eksporter, etikettørrelser og -stile i 3D | Etiketter vises kun i 3D-visningen, én størrelse; se [Vis stedet i 3D](topic:site-3d) |
| Teksturer fra fotos, optagelse af en køretur som video, skygger fra uden for stedet, solstunder vist i 3D-visningen | Kortlag lagt over overfladerne; kør igennem og solens position på ét tidspunkt; [solstunder](topic:sun-hours) for en dag eller en sæson i planen |
