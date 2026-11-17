---
title: Ikke lavet endnu
summary: Hvad denne version af CivilCraft endnu ikke kan, og hvad du i stedet kan gøre i dag.
keywords: mangler, begrænsninger, færdplan, ikke tilgængelig, spiraler, udvidelse, dwg, dxf, indløb, tilbageholdelse, tværprofiler, kommer senere, grænser
from: a2d970ef
---

CivilCraft er tidligt i udviklingen. Denne side lister, hvad den aktuelle version ikke gør, så du ikke leder efter det. Intet her er lovet til en bestemt dato.

## Punkter

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| At tilføje en anden punktfil til den første | Slå filerne sammen i en teksteditor eller et regneark først |
| Eksport af en punkttekstfil | Eksportér LandXML (punkterne går ud som CgPoints), brug GIS {{ui:Eksportér}} (punkter med felterne P, N, E, Z og D), eller {{ui:Kopiér}} punkterne ind i et regneark |
| Stilarter for punktetiketter, symboler pr. beskrivelsesnøgle, buer fra linjekoder, en beskrivelsesnøglefil, der kan deles mellem projekter | Etiketter viser nummer, kote og beskrivelse, eller mindre ([CivilCraft-indstillinger](topic:settings)); nøgler gemmes i projektfilen |
| Enhedsomregning | Konvertér filen, før du importerer; **Enheder** ændrer kun mærkaten |

## Overflader

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mere end én overflade bygget ud fra punkter | Ét projekt pr. overflade |
| Skjul (indre) grænser | Brug **Længste ydre kant** eller en ydre grænse |
| Valg eller redigering af én tegnet brudlinje | {{key:Mod+Z}}, eller {{ui:Fjern tegnede brudlinjer}} og tegn igen |
| Redigering af en overflade læst fra LandXML (brudlinjer, grænse) | {{ui:Genopbyg overfladen fra punkterne}} |
| Redigering af en overflade lavet af et kotegitter | Importér gitteret igen med andre valg |
| Konvertering af en overflade læst fra LandXML, når koordinatsystemet ændres | {{ui:Genopbyg overfladen fra punkterne}} først |
| Mærkede punktkoter og hældningsværdier | Læs dem i statuslinjen, eller farvelæg overfladen efter hældning med **Hældningsanalyse** i arbejdsområdet Landskab ([Planering til landskab](topic:landscape-grading#grading-checks)) |

## Tracéer og længdeprofiler

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Spiraler andet end klothoider; en spiral mellem to kurver (sammensatte overgange) | Klothoidespiraler i enderne af en kurve er tilgængelige; de andre navngives og springes over ved LandXML-import |
| Indsættelse af et PI mellem to andre | Tegn tracéet igen, eller skriv PI-koordinaterne om |
| Tracéer fra objekter, forskydninger, udvidelser | Tegn ud fra PI'er |
| At skrive K for en lodret kurve | Skriv L (K vises) |
| Cirkulære og usymmetriske lodrette kurver | Kun symmetriske parabolske kurver |
| Mere end én projekteret længdeprofil pr. tracé | Ét tracé pr. variant |
| Zoom i længdeprofilvisningen, profilbånd under profilen | Længdeprofilvisningen passer hele tracéet; plot den på [plan- og profilark](topic:plan-profile-sheets) |
| Snit i DWG eller LandXML | Snitark som PDF; {{ui:CSV}} af arealerne og volumenerne |
| Snitlinjer i en vinkel, eller med forskellige bredder langs vejen | Én bredde på hver side for hele tracéet |

## Korridorer

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Midterrabatter, barrierer og en overhøjde, der drejer skabeloner | Tegn dem som skabeloner ([Korridorskabeloner](topic:corridor-templates)); skabeloner efter station tager endnu ikke overhøjde med |
| En gradvis overgang mellem to områders skabeloner (overgange, udtyndinger) | Skift skabelon ved en station, eller giv et punkt en breddemålsætning til en linje tegnet som udtyndingen |
| Rotation om en kant, overhøjde i LandXML | Overhøjde drejer om midterlinjen på cirkulære kurver; udvid en kørebane med en breddemålsætning til en feature-linje |
| Målsætninger for sideskråninger (dagslys til en linje eller en overflade), egne korridoroverflader | Målsætninger flytter kanterne på kørebaner og skuldre ([Korridorer](topic:corridor)); korridoren planeres ind i den projekterede overflade |
| Korridorer eksporteret som LandXML-vejbaner; en anden korridor på et tracé i IFC-eksporten | Den projekterede overflade eksporteres |
| Terrænskabeloner, der ændrer den projekterede overflade, i 3D eller i snittene | De giver arealer og volumener for hvert lag ([Terrænskabeloner](topic:corridor-templates#terrain-templates)) |
| Svepekurver med hastighed, dækslip, styretid, styrende anhængere eller karrosseriudhæng; et bibliotek med standard-dimensionerende køretøjer; en svepekurve tegnet ved at trække i køretøjet | Svepekurver ved lav hastighed langs en feature-linje eller et tracé, med dine egne køretøjsstørrelser ([Køretøjers svepekurver](topic:swept-paths)) |

## Planering og mængder

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Bænke, åbne feature-linjer planeret ind i projektet, planering til en feature-linje fra et andet sted | Luk feature-linjen ([Feature-linjer](topic:feature-lines)), eller brug den som brudlinje for det eksisterende terræn |
| Indsættelse eller fjernelse af et hjørnepunkt på en feature-linje | Tegn linjen igen, eller lav en trinvis forskydning af den |
| Buer i tegnede brudlinjer (gennem målepunkter), spiraler i feature-linjer | Tegn en feature-linje med buer, og brug den som brudlinje for det eksisterende terræn |
| Planering til en afstand, kote eller en anden overflade | Dagslys til det eksisterende terræn alene |
| Tilføjelse eller fjernelse af et hjørne på et plateau | Slet plateauet, og tegn det igen |
| Volumener mellem TIN og TIN (prisme), valg af gitterets cellestørrelse | Gittermetode, cellestørrelse valgt for dig |
| Svelning og krympning, muldjord, befæstelsesdybder | Anvend faktorer på de rapporterede tal selv |
| Fri transport og omkostninger for overtransport, transport over forskellige tracéer, lånegrave og deponier placeret i planen | Massetransportdiagrammet med balancepunkter, flyttede volumener og gennemsnitlige transportafstande |

## Rørnetværk

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mere end ét netværk pr. projekt | Separate projekter for regnvand og spildevand |
| Vandledninger: vandkvalitet og alder, regelbaserede styringer, andre ventiltyper (flowregulering, strubning, fastholdelse), pumper givet ved effekt, efterspørgsel der afhænger af trykket, en Darcy–Weisbach-mulighed, en rørkatalog med vægtykkelser og trykklasser. Resten af trykledningsnettene er i laboratoriet: [Vandledninger](topic:water-mains) | Kontrollér dem i software til vandforsyning; spildevandsdimensionerende flow er i [Spildevandsdimensionerende flow](topic:sanitary-design) |
| Kloakflow over tid (hydrografer, dynamisk routing, lagring, pumper, overløb) | [Spildevandsdimensionerende flow](topic:sanitary-design) giver det stationære spidsflow, et dimensioneringsark bruger |
| Indløbskapacitet, rendespredning, tilbageholdelsesrouting, hydrografer, energitab andet end én koefficient for et knudepunkt | Kontrollér dem i anden software; flow, størrelser og trykniveaulinjerne står i [Regnvandsafledning](topic:storm-drainage) |
| Befæstede områder i PDF-plottet, DWG, DXF eller LandXML; befæstede områder fra overfladen (vandskel) | Tegn befæstede områder i hånden; de gemmes i projektfilen |
| Rørkataloger, ikke-runde rør, konstruktioner der ikke er lodrette kasser eller cylindre (kegler, trin, bænke), en dræningskategori i biblioteket | Konstruktionstyper ud fra parametre ([Rørnetværk](topic:pipe-network)); rør med en diameter |
| Rør i længdeprofilvisningen, buede rør | Læs bundkoter og dækning i højre panel |

## Matrikler

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Udlæg af grunde efter areal eller frontage, matrikler ud fra de linjer omkring dem, rettighedsbælter | Tegn hver matrikel ud fra dens hjørner, eller indtast dens angivelser |
| Kurvetabeller og linjetabeller i planen; etiketter flyttet i hånden | Hvert forløb mærkes langs sig selv |
| Matrikler i LandXML | Matrikler gemmes i projektfilen og går til PDF, DWG og DXF |

## Polygontræk

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Mindste kvadraters udjævning, transitreglen, vægtning af vinkler mod afstande | Bowditch-reglen |
| Afbøjningsvinkler, zenitvinkler og skråafstande, koter ved trigonometrisk nivellement | Reducér til vandrette afstande og vinkler rigtigt, eller retninger |
| Sidemålinger, rådatafiler fra dataopsamlere | Importér punkterne som en punktfil |

## Afsætning

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Forskudte pæle (referencepunkter sat tilbage fra pælen), skråningspæle ved opfangningspunktet | Afsæt ved de forskydninger, du har brug for, også forbi skuldren |
| At sende pæle direkte i en dataopsamlers eget format | CSV'en åbner i kontorsoftwaren hos de fleste dataopsamlere |
| Afsætning af rør, plateauer og matrikler | Brug målepunkter nær et tracé, eller matrikelforløbene |

## Filer og output

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Tekst, skravering og målsætninger fra DWG eller DXF; papirrum; eksterne tegninger (xrefs); binær DXF | Stregtegning fra modelrummet åbner ([Åbn en DWG eller DXF som stregtegning](topic:open-dwg-dxf)); åbn eksterne tegninger hver for sig |
| At flytte flere punkter på én gang ved at trække | Klip og indsæt dem, eller redigér dem ét ad gangen |
| Stående ark, egne tegningshoveder, viewports du selv arrangerer, plan- og længdeprofilark i DWG | Ét liggende planark pr. PDF, eller plan- og længdeprofilark langs et tracé (PDF) |
| Plot af kotebånd og profiler | Bånd vises kun på skærmen; tag et skærmbillede, hvis du har brug for dem |
| Ændring af lagnavne, farver eller etiketstilarter | Ændr dem i et CAD-program efter DXF-eksport |
| Skylagring og versionshistorik | Gem `.civilcraft.json`-filer og hold dem sikkerhedskopieret; for at arbejde på ét projekt sammen, brug en live-session i CadCraft Studio ([Designe ét område sammen, live](topic:work-live)) |
| CadCraft Studio til iPad og iPhone, og fra Google Play | Brug CivilCraft i browseren på enheden; på Android installeres CadCraft Studio fra sin APK på getcadcraft.com/download |
| Åbning af flere punkt- eller projektfiler på én gang | Én fil pr. åbning (GIS-filer, der hører sammen, såsom en shapefils dele, åbnes sammen) |

## Landskab

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Producenters hoveder og dyser | Generiske hoveder, eller tilføj dine egne hoveder fra en fil; producenternes data kommer ind, efterhånden som de giver tilladelse |
| Maksimale sidelængder for dryprør, flow over tid, pumper, lukkede rørnetværk | Hold dryprør til producentens offentliggjorte længde; kontrollen kræver et forgrenet netværk |
| Den præcise kontur af et konkavt frit objekt; dets volumen under terræn målt nøjagtigt | Konveks hylster planeres, og volumenet under terræn er et skøn (oplyst i Egenskaber) |
| Planter i BimCraft's og ModelCraft's egne Placér fra bibliotek | Eksportér landskabs-IFC og åbn den i BimCraft ved siden af bygningen |
| Detaljerede plantemodeller (blade, grene, årstider) i 3D-visningen; frie objekter og vanding i 3D-visningen | Planter vises i 3D som enkle former dimensioneret ud fra plantelisten ([Vis området i 3D](topic:site-3d)); ModelCraft's spredning laver plantebilleder |
| Hårdbelægningsmure, der holder et planeret niveau bagved på overfladen | Giv et plateau eller et plateau lodrette sider: de er støttemure på overfladen ([Planering](topic:grading)) |
| SVG-transformationer i dine egne symboler; teksturer og farver på dine egne GLB-plantemodeller; komprimeret GLB-geometri | Udflad transformationer i dit tegneprogram først; modeller tegnes i plantens farve; eksportér GLB uden komprimering ([Plantegrafik](topic:plant-graphics)) |
| Din egen plantliste gemt på din Library-konto (redigeret i appen) | Redigér projektets egen liste i plantetabellen, og gem den som en plantefil |
| Landskabsværktøjerne til assistenter uden vinduet (filserveren og kommandolinjen) | De virker, når CivilCraft-vinduet er åbent ([Lad en AI-assistent arbejde med dit område](topic:assistants)) |

## Højspændingsledninger

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Et lands standard indbygget (lasttilfælde, frihøjder, faktorer) | Angiv din standards værdier i {{ui:Lasttilfælde og grænser…}} og gem dem, med dit bibliotek, som en pakke til genbrug og deling ([Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Den vandrette afstand fra en leder til et træs krone eller en mur ved siden af ledningen | Den lodrette frihøjde over planter og mure, ledningen krydser ([Højspændingstjek](topic:power-line-checks#clearances)) |
| Lederkryb og en ny leders udstrækning | Tag højde for dem gennem temperaturerne i udspændingstabellen |
| Termisk ratering af nedgravede kabler (strømbelastning ud fra hvordan de lægges) | Angiv din leverandørs strømbelastning på kabelposten |
| Kortslutnings-, beskyttelses- og jordingsberegninger | Brug et dedikeret elprogram; CivilCraft giver netværkets længder og kabler |
| Gitter-master dimensioneret led for led, og forankringer i jorden | Master kontrolleres mod deres nominelle last; stag mod deres mærkelast |
| En `.DON`-studiefil kontrolleret i det program, der læser den | Kontrollér filen der; send os en prøve, så vi kan teste mod en rigtig |
| Højspændingsledninger i 3D-visningen og i IFC | Planen, ledningens længdeprofil, arkene og GIS-lagene |
| Højspændingsværktøjerne til assistenter uden vinduet | De virker, når CivilCraft-vinduet er åbent ([Lad en AI-assistent arbejde med dit område](topic:assistants)) |

## Bygningsmasser

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Et bibliotek med zoneringskoder eller nogen bys regler | Skriv grænserne fra din egen lokalplan ([Zoneringsgrænser](topic:zoning-limits)) |
| Himmellys på væggene (facadedagslys), vind | [Solt timer](topic:sun-hours) tæller kun direkte sol |
| Skygge fra træer, planter eller alt, der ikke er tegnet som en masse | Tegn nabobygninger som masser |
| Tagformer på masser | Masser med fladt top |
| Åbninger, tage og vægtyper, når en masse udvikles i BimCraft | BimCraft bygger simple ydervægge på hver etage og en dæk; tilføj resten dér |

## GIS og koordinatsystemer

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| File Geodatabase; KML-stilarter, ikoner, jordoverlejringer og netværkslinks | Konvertér til GeoPackage, shapefile eller GeoJSON først; KML-placemarks læses uden deres stilarter |
| Redigering af GIS-elementer eller deres attributter | Redigér dem i et GIS-program og importér igen. Analyse-panelet laver nye lag (buffer, overlay, join, valg) og tilføjer areal- og længdefelter, men det redigerer ikke et element på stedet |
| Netværks- og rasteranalyse, buffere med flade eller kvadratiske ender og ensidede buffere, tilføjelse eller sletning af rækker og ændring af et felts type i attributtabellen, manuelle klassefarver, en stilforklaring i plot | Brug Vælg til at vælge elementer og lav et lag af dem; flade ender tilbydes ikke. Farvelægning efter attribut og attributtabellen er bygget: se [Stil et lag efter en attribut](topic:gis-symbology) og [Arbejd med et lags attributtabel](topic:gis-table) |
| Etiketstilarter (størrelse, placering) og etiketter, der undgår hinanden | Etiketter har én størrelse og kan overlappe, hvor elementerne er tætte |
| Vertikale datummer og geoidemodeller | Koter bruges, som filen giver dem; kontrollér det vertikale datum selv |
| Gitterforskydninger andre end til NAD83 fra NAD27 foreslået efter område (OSTN15; NTv2 for andre datummer virker, når du tilføjer filen), flere gitter på én gang, vertikale gitter | Tilføj gitterfilen for dit datum selv; ét gitter pr. projekt |
| Kortlag i DXF eller i 3D-eksporter | Kortlag går ind i PDF-plottet og ved siden af DWG som et billede |
| Kortservere, der kræver login, nøgle eller token | Brug offentlige tjenester, eller en georefereret billedfil |
| Skrivning af LAS- eller LAZ-filer fra en overflade, terrænmodellen eller højdegitter- og LiDAR-værktøjerne | Eksportér overflader som et GeoTIFF-højdegitter. [Punktskyer](topic:point-clouds)-tilføjelsen skriver en renset sky som LAS 1.4 eller LAZ |
| LiDAR-intensitet, farve og retur; højdegitre med flere bånd; gitter- eller LiDAR-filer over 200 MB | LiDAR filtreres kun efter klasse, gitre bruger deres første bånd; del store filer op i fliser først |

## Input

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Boksvalg med berøring (det kræver {{key:Shift}}) | Hold længe på hvert målepunkt for at tilføje det |
| Skrevne koordinater eller afstande, mens du tegner | Tegn cirka, og skriv derefter præcise PI-koordinater i tracéets PI-tabel |
| Skrivning af koordinater for plateauhjørner og konstruktioner | Træk deres greb; zoom ind for præcision, og følg E og N i statuslinjen |
| Fangst til objekter (andre end målepunkter til brudlinjer) | Zoom ind, og følg statuslinjen |

## 3D-visning

| Ikke lavet endnu | I stedet, i dag |
|---|---|
| Tegning eller redigering i 3D-visningen | Tegn og redigér i planen; 3D-visningen følger hver redigering |
| Valg af korridorfeature-linjer eller GIS-elementer ved at klikke i 3D | Klik på dem i planen |
| Eksport af den overdrevne visning eller i fod | Eksporter er i sand skala i meter; se [Eksportér området i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-eksporter, etiketstørrelser og -stilarter i 3D | Etiketter vises kun i 3D-visningen, én størrelse; se [Vis området i 3D](topic:site-3d) |
| Teksturer fra fotos, optagelse af en kørsel som video, skygger fra uden for området, solt timer vist i 3D-visningen | Kortlag draperet over overfladerne; kør og solens position på ét tidspunkt; [solt timer](topic:sun-hours) for en dag eller en sæson i planen |
