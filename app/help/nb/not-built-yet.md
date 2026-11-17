---
title: Ikke bygget ennå
summary: Hva denne versjonen av CivilCraft ikke gjør ennå, og hva du kan gjøre i stedet i dag.
keywords: mangler, begrensninger, veikart, ikke tilgjengelig, spiraler, utvidelse, dwg, dxf, innløp, fordrøyning, tverrprofiler, kommer senere, grenser
from: a2d970ef
---

CivilCraft er tidlig i utviklingen. Denne siden lister hva den nåværende versjonen ikke gjør, slik at du ikke leter etter det. Ingenting her er lovet til en bestemt dato.

## Punkter

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Å legge til en andre punktfil til den første | Slå sammen filene i en tekstredigerer eller et regneark først |
| Eksportere en punkttekstfil | Eksporter LandXML (punktene går ut som CgPoints), bruk GIS-{{ui:Eksporter}} (punkter med P-, N-, E-, Z- og D-felt), eller {{ui:Kopier}} punktene til et regneark |
| Stiler for punktetiketter, symboler per beskrivelsesnøkkel, kurver (buer) fra linjekoder, en beskrivelsesnøkkelfil å dele mellom prosjekter | Etiketter viser nummer, kote og beskrivelse, eller mindre ([CivilCraft-innstillinger](topic:settings)); nøklene lagres i prosjektfilen |
| Enhetskonvertering | Konverter filen før import; **Enheter** endrer bare merkingen |

## Terrengmodeller

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Mer enn én terrengmodell bygget fra punkter | Ett prosjekt per terrengmodell |
| Skjule (indre) grenser | Bruk **Lengste ytre kant** eller en ytre grense |
| Velge eller redigere én tegnet bruddlinje | {{key:Mod+Z}}, eller {{ui:Fjern tegnede bruddlinjer}} og tegn på nytt |
| Redigere en terrengmodell lest fra LandXML (bruddlinjer, grense) | {{ui:Bygg terrengmodellen på nytt fra punktene}} |
| Redigere en terrengmodell laget av et høydegrid | Importer griddet på nytt med andre valg |
| Konvertere en terrengmodell lest fra LandXML når koordinatsystemet endres | {{ui:Bygg terrengmodellen på nytt fra punktene}} først |
| Kotehøyder med etiketter og helningsverdier | Les dem i statuslinjen, eller fargelegg terrengmodellen etter helning med **Helningsanalyse** i arbeidsområdet Landskap ([Terrengforming for landskap](topic:landscape-grading#grading-checks)) |

## Veglinjer og lengdeprofiler

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Spiraler annet enn klotoide; en spiral mellom to kurver (sammensatte overganger) | Klotoidespiraler i endene av en kurve er tilgjengelige; de andre navnes og hoppes over ved LandXML-import |
| Å sette inn et PI mellom to andre | Tegn veglinjen på nytt, eller skriv inn PI-koordinatene på nytt |
| Veglinjer fra objekter, forskyvninger, utvidelser | Tegn med PI-er |
| Å skrive K for en vertikalkurve | Skriv L (K vises) |
| Sirkulære og usymmetriske vertikalkurver | Bare symmetriske parabolske kurver |
| Mer enn ett designlengdeprofil per veglinje | Én veglinje per variant |
| Zoom i lengdeprofilvisningen, profilbånd under profilen | Lengdeprofilvisningen tilpasses hele veglinjen; plott den på [plan- og profilark](topic:plan-profile-sheets) |
| Snitt i DWG eller LandXML | Snittark som PDF; {{ui:CSV}} av arealene og volumene |
| Profillinjer i vinkel, eller med ulik bredde langs veien | Én bredde på hver side for hele veglinjen |

## Korridorer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Midtdelere, rekkverk og en overhøyde som roterer maler | Tegn dem som maler ([Korridormaler](topic:corridor-templates)); maler etter profilnummer tar ikke overhøyde ennå |
| En gradvis overgang mellom to regioners maler (overganger, tilspissing) | Endre malen ved et profilnummer, eller gi et punkt en breddemål til en linje tegnet som tilspissingen |
| Rotasjon om en kant, overhøyde i LandXML | Overhøyde roterer om senterlinjen i sirkelkurver; utvid et felt med et breddemål til en formlinje |
| Mål for sideskråningene (dagslinje til en linje eller en flate), egne korridorflater | Mål flytter kantene på kjørebane og skulder ([Korridorer](topic:corridor)); korridoren planeres inn i den foreslåtte terrengmodellen |
| Korridorer eksportert som LandXML-veier; en andre korridor på en veglinje i IFC-eksporten | Den foreslåtte terrengmodellen eksporteres |
| Terrengmaler som endrer den foreslåtte terrengmodellen, i 3D eller i snittene | De gir arealer og volumer for hvert lag ([Terrengmaler](topic:corridor-templates#terrain-templates)) |
| Kjøresporing med fart, dekkglidning, styretid, styrende tilhenger eller klaring for kjøretøyet; et bibliotek med standard dimensjonerende kjøretøyer; en kjøresporing tegnet ved å dra kjøretøyet | Kjøresporing ved lav fart langs en formlinje eller en veglinje, med dine egne kjøretøystørrelser ([Kjøretøyers kjøresporing](topic:swept-paths)) |

## Terrengforming og volumer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Benker, åpne formlinjer planert inn i designet, planering til en formlinje fra et annet sted | Lukk formlinjen ([Formlinjer](topic:feature-lines)), eller bruk den som en bruddlinje i det eksisterende terrenget |
| Å sette inn eller fjerne et hjørnepunkt i en formlinje | Tegn linjen på nytt, eller lag en trinnvis forskyvning av den |
| Buer i tegnede bruddlinjer (gjennom landmålingspunkter), spiraler i formlinjer | Tegn en formlinje med buer og bruk den som en bruddlinje i det eksisterende terrenget |
| Planering til en avstand, kote eller en annen flate | Dagslinje til eksisterende terreng bare |
| Å legge til eller fjerne et hjørne på en byggeplate | Slett byggeplaten og tegn den på nytt |
| TIN-til-TIN-volumer (prisme), valg av rutenettcellestørrelse | Rutenettmetoden, med cellestørrelse valgt for deg |
| Svell og krymp, matjord, dybder på dekke | Bruk faktorer på de rapporterte tallene selv |
| Fri transport og overtransport, transport på tvers av ulike veglinjer, uttak og deponier plassert i planen | Massetransportdiagrammet med balansepunkter, flyttede volumer og gjennomsnittlig transportavstand |

## Rørnett

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Mer enn ett nett per prosjekt | Egne prosjekter for overvann og spillvann |
| Vannledninger: vannkvalitet og alder, regelbaserte styringer, andre ventiltyper (strømningskontroll, struping, opprettholdelse), pumper gitt med effekt, et behov som avhenger av trykk, et Darcy–Weisbach-alternativ, en rørkatalog med veggtykkelser og trykkklasser. Resten av trykknettene er i laboratoriet: [Vannledninger](topic:water-mains) | Kontroller disse i programvare for vannfordeling; dimensjonerende spillvannsstrømmer finnes i [Dimensjonerende spillvannsstrømmer](topic:sanitary-design) |
| Avløpsstrømmer over tid (hydrografer, dynamisk rutesetting, lagring, pumper, overløp) | [Dimensjonerende spillvannsstrømmer](topic:sanitary-design) gir den jevne toppstrømmen et designark bruker |
| Innløpskapasitet, rennespredning, fordrøyningsrutesetting, hydrografer, energitap annet enn én koeffisient i en kumkobling | Kontroller dem i annen programvare; strømninger, dimensjoner og trykklinjene finnes i [Overvannsdrenering](topic:storm-drainage) |
| Nedbørfelt i PDF-plottet, DWG, DXF eller LandXML; nedbørfelt fra terrengmodellen (vannskiller) | Tegn nedbørfelt for hånd; de lagres i prosjektfilen |
| Rørkataloger, ikke-runde rør, konstruksjoner som ikke er rette bokser eller sylindre (kjegler, trinn, benker), en dreneringskategori i biblioteket | Konstruksjonstyper fra parametere ([Rørnett](topic:pipe-network)); rør med en diameter |
| Rør i lengdeprofilvisningen, krumme rør | Les bunnkoter og dekning i høyre panel |

## Eiendommer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Oppdeling av tomter etter areal eller front, eiendommer fra linjene rundt dem, veirett | Tegn hver eiendom etter hjørnene, eller skriv inn målene |
| Kurvetabeller og linjetabeller i planen; etiketter flyttet for hånd | Hver strekning merkes langs seg selv |
| Eiendommer i LandXML | Eiendommer lagres i prosjektfilen og går til PDF, DWG og DXF |

## Polygontog

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Minste kvadraters utjevning, transittregelen, vekting av vinkler mot avstander | Kompassregelen |
| Avbøyningsvinkler, zenitvinkler og skråavstander, høyder ved trigonometrisk nivellering | Reduser til horisontale avstander og vinkler riktig, eller retninger |
| Sideskudd, rådatafiler fra datainnsamlere | Importer punktene som en punktfil |

## Utsetting

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Forskjøvne påler (referansepunkter satt tilbake fra pelen), skråpåler ved fangstpunktet | Sett ut ved forskyvningene du trenger, også forbi skulderen |
| Sende påler direkte i en datainnsamlers eget format | CSV-filen åpnes i kontorprogramvaren til de fleste datainnsamlere |
| Utsetting av rør, byggeplater og eiendommer | Bruk landmålingspunkter nær en veglinje, eller eiendommens strekninger |

## Filer og utdata

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Tekst, skravurer og måltilsettinger fra DWG eller DXF; papirrom; koblede tegninger (xrefer); binær DXF | Tegningslinjer fra modellrommet åpnes ([Åpne en DWG eller DXF som tegningslinjer](topic:open-dwg-dxf)); åpne koblede tegninger hver for seg |
| Å flytte flere punkter samtidig ved å dra | Klipp ut og lim inn dem, eller rediger dem ett om gangen |
| Stående ark, egne tegningshoder, visningsområder du ordner selv, plan- og profilark i DWG | Ett liggende planark per PDF, eller plan- og profilark langs en veglinje (PDF) |
| Plotting av høydebånd og profiler | Bånd vises bare på skjermen; ta et skjermbilde hvis du trenger dem |
| Endre layernavn, farger eller etikettstiler | Endre dem i et CAD-program etter DXF-eksport |
| Skylagring og versjonshistorikk | Lagre `.civilcraft.json`-filer og ta sikkerhetskopi; for å jobbe sammen på ett prosjekt, bruk en direkte økt i CadCraft Studio ([Planlegg ett område sammen, direkte](topic:work-live)) |
| CadCraft Studio for iPad og iPhone, og fra Google Play | Bruk CivilCraft i nettleseren på enheten; på Android installeres CadCraft Studio fra APK-filen på getcadcraft.com/download |
| Åpne flere punkt- eller prosjektfiler samtidig | Én fil per åpning (GIS-filer som hører sammen, som delene i en shapefil, åpnes sammen) |

## Landskap

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Produsentenes hoder og dyser | Generiske hoder, eller legg til egne hoder fra en fil; produsentdata kommer inn etter hvert som de gir tillatelse |
| Maksimale sidelengder for dryppslanger, strømninger over tid, pumper, sløyfede rørnett | Hold dryppkjøringer til produsentens publiserte lengde; kontrollen krever et forgrenet nett |
| Den eksakte konturen til et konkavt frittformobjekt; dets volum under bakken målt eksakt | Det konvekse skallet planeres, og volumet under bakken er et anslag (oppgitt i Egenskaper) |
| Planter i BimCrafts og ModelCrafts egen Plasser fra bibliotek | Eksporter landskaps-IFC og åpne den i BimCraft ved siden av bygget |
| Detaljerte plantemodeller (blader, grener, årstider) i 3D-visningen; frittformobjekter og vanning i 3D-visningen | Planter vises i 3D som enkle former tilpasset størrelsen fra plantelisten ([Vis tomten i 3D](topic:site-3d)); ModelCrafts spredning lager plantebilder |
| Hardscape-murer som holder et planert nivå bak seg på terrengmodellen | Gi en plattform eller byggeplate loddrette sider: de er støttemurer på terrengmodellen ([Planering](topic:grading)) |
| SVG-transformasjoner i egne symboler; teksturer og farger på egne GLB-plantemodeller; komprimert GLB-geometri | Flat ut transformasjoner i tegneprogrammet først; modellene tegnes i plantens farge; eksporter GLB uten komprimering ([Plantegrafikk](topic:plant-graphics)) |
| Din egen plantliste lagret i Bibliotek-kontoen din (redigert i appen) | Rediger prosjektets egen liste i plantetabellen og lagre den som en plantefil |
| Landskapsverktøyene for assistenter uten vinduet (filserveren og kommandolinjen) | De fungerer med CivilCrafts vindu åpent ([La en KI-assistent jobbe med tomten din](topic:assistants)) |

## Kraftledninger

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Et lands standard innebygd (lasttilfeller, avstander, faktorer) | Angi verdiene for din standard i {{ui:Lasttilfeller og grenser…}} og lagre dem, sammen med biblioteket ditt, som en pakke du kan gjenbruke og dele ([Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Den sideveis avstanden fra en leder til en tretopp eller en vegg ved siden av ledningen | Klaringen rett opp over planter og vegger ledningen krysser ([Kraftledningskontroller](topic:power-line-checks#clearances)) |
| Lederkryp og strekkingen av en ny leder | Ta hensyn til dem gjennom temperaturene i strekktabellen |
| Termisk kapasitet for nedgravde kabler (strømkapasitet ut fra hvordan de er lagt) | Skriv inn leverandørens strømkapasitet på kabelelementet |
| Kortslutnings-, vern- og jordingsberegninger | Bruk et dedikert elektrisk program; CivilCraft gir nettets lengder og kabler |
| Gittermaster dimensjonert stav for stav, og stagankre i grunnen | Mastene kontrolleres etter nominell last; stag etter merkelast |
| En `.DON`-studiefil kontrollert i programmet som leser den | Kontroller filen der; send oss en prøve så vi kan teste mot en ekte en |
| Kraftledninger i 3D-visningen og i IFC | Planen, linjeprofilen, arkene og GIS-lagene |
| Kraftledningsverktøyene for assistenter uten vinduet | De fungerer med CivilCrafts vindu åpent ([La en KI-assistent jobbe med tomten din](topic:assistants)) |

## Bygningsvolumer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Et bibliotek med soneplaner eller en by sine regler | Skriv inn grensene fra din egen forskrift ([Soneplangrenser](topic:zoning-limits)) |
| Himmellys på veggene (fasadedagslys), vind | [Solmengde](topic:sun-hours) teller bare direkte sol |
| Skygge fra trær, planter eller alt som ikke er tegnet som en masse | Tegn nabobygninger som masser |
| Takformer på masser | Masser med flat topp |
| Åpninger, tak og veggtyper når en masse utvikles i BimCraft | BimCraft bygger enkle yttervegger på hver etasje og en dekke; legg til resten der |

## GIS og koordinatsystemer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| File Geodatabase; KML-stiler, ikoner, bakkeoverlegg og nettverkskoblinger | Konverter til GeoPackage, shapefile eller GeoJSON først; KML-merkesteder leses uten stilene sine |
| Redigere GIS-objekter eller deres attributter | Rediger dem i et GIS-program og importer på nytt. Analyse-panelet lager nye lag (buffer, overlegg, sammenføyning, utvalg) og legger til areal- og lengdefelt, men det redigerer ikke et objekt på stedet |
| Nettverks- og rasteranalyse, buffere med flate eller kvadratiske ender og ensidige buffere, legge til eller slette rader og endre et felts type i attributttabellen, manuelle klassefarger, en tegnforklaring i plott | Bruk Velg for å plukke objekter og lage et lag av dem; flate ender tilbys ikke. Farging etter attributt og attributttabellen er bygget: se [Stil et lag etter en attributt](topic:gis-symbology) og [Arbeid med et lags attributttabell](topic:gis-table) |
| Etikettstiler (størrelse, plassering) og etiketter som unngår hverandre | Etiketter har én størrelse og kan overlappe der objektene er tette |
| Vertikale datum og geoidmodeller | Høyder brukes slik filen gir dem; kontroller det vertikale datumet selv |
| Rasterforskyvninger annet enn til NAD83 fra NAD27 foreslått etter område (OSTN15, NTv2 for andre datum fungerer når du legger til filen), flere rutenett samtidig, vertikale rutenett | Legg til rutenettfilen for ditt datum selv; ett rutenett per prosjekt |
| Kartlag i DXF- eller 3D-eksporter | Kartlag går inn i PDF-plottet, og ved siden av DWG som et bilde |
| Kartservere som krever innlogging, nøkkel eller token | Bruk offentlige tjenester, eller en georeferert bildefil |
| Skriving av LAS- eller LAZ-filer fra en terrengmodell, bakkemodellen eller høydegrid- og LiDAR-verktøyene | Eksporter terrengmodeller som et GeoTIFF-høydegrid. [Punktskyer](topic:point-clouds)-tillegget skriver en renset sky som LAS 1.4 eller LAZ |
| LiDAR-intensitet, farge og retur; høydegrid med flere bånd; grid- eller LiDAR-filer over 200 MB | LiDAR filtreres bare etter klasse, grid bruker sitt første bånd; del store filer i fliser først |

## Inndata

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Boksvalg med berøring (det krever {{key:Shift}}) | Trykk lenge på hvert landmålingspunkt for å legge det til |
| Skrevne koordinater eller avstander mens du tegner | Tegn omtrentlig, og skriv deretter inn eksakte PI-koordinater i veglinjens PI-tabell |
| Skrive koordinater for hjørner på byggeplater og konstruksjoner | Dra håndtakene deres; zoom inn for presisjon og følg E og N i statuslinjen |
| Fangst til objekter (annet enn landmålingspunkter for bruddlinjer) | Zoom inn og følg statuslinjen |

## 3D-visning

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Tegning eller redigering i 3D-visningen | Tegn og rediger i planen; 3D-visningen følger hver redigering |
| Velge korridorformlinjer eller GIS-objekter ved å klikke i 3D | Klikk dem i planen |
| Eksportere den overdrevne visningen eller i fot | Eksporter er i sann målestokk i meter; se [Eksporter tomten i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-eksporter, etikettstørrelser og -stiler i 3D | Etiketter vises bare i 3D-visningen, én størrelse; se [Vis tomten i 3D](topic:site-3d) |
| Teksturer fra bilder, opptak av en kjøring som video, skygger fra utenfor tomten, solmengde vist i 3D-visningen | Kartlag lagt over terrengmodellene; kjøring og solens posisjon på ett tidspunkt; [solmengde](topic:sun-hours) for en dag eller en årstid i planen |
