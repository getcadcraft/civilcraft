---
title: Ikke bygget ennå
summary: Hva denne versjonen av CivilCraft ikke gjør ennå, og hva du kan gjøre i stedet i dag.
keywords: mangler, begrensninger, veikart, ikke tilgjengelig, spiraler, utvidelse, dwg, dxf, sluk, fordrøyning, tverrprofiler, kommer senere, grenser
from: b91588d4
---

CivilCraft er tidlig i utviklingen. Denne siden lister opp hva den nåværende versjonen ikke gjør, slik at du ikke leter etter det. Ingenting her er lovet til en bestemt dato.

## Punkter

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Legge til en andre punktfil til den første | Slå sammen filene i en teksteditor eller et regneark først |
| Eksportere en punkttekstfil | Eksporter LandXML (punktene går ut som CgPoints), bruk GIS {{ui:Eksporter}} (punkter med feltene P, N, E, Z og D), eller {{ui:Kopier}} punktene inn i et regneark |
| Stiler for punktetiketter, symboler per beskrivelsesnøkkel, kurver (buer) fra linjekoder, en beskrivelsesnøkkelfil som kan deles mellom prosjekter | Etiketter viser nummer, høyde og beskrivelse, eller mindre ([CivilCraft-innstillinger](topic:settings)); nøkler lagres i prosjektfilen |
| Enhetskonvertering | Konverter filen før import; **Enheter** endrer bare etiketten |

## Terrengmodeller

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Mer enn én terrengmodell bygget fra punkter | Ett prosjekt per terrengmodell |
| Skjule (indre) grenser | Bruk **Lengste ytre kant** eller en ytre grense |
| Velge eller redigere én tegnet bruddlinje | {{key:Mod+Z}}, eller {{ui:Fjern tegnede bruddlinjer}} og tegn på nytt |
| Redigere en terrengmodell lest fra LandXML (bruddlinjer, grense) | {{ui:Bygg terrengmodellen på nytt fra punktene}} |
| Redigere en terrengmodell laget fra et høydegrid | Importer gridet på nytt med andre valg |
| Konvertere en terrengmodell lest fra LandXML når koordinatsystemet endres | Bruk først {{ui:Bygg terrengmodellen på nytt fra punktene}} |
| Merkede punkthøyder og helningsverdier | Les dem i statuslinjen, eller farge terrengmodellen etter helning med **Skråningsanalyse** i arbeidsområdet Landskap ([Terrengforming for landskap](topic:landscape-grading#grading-checks)) |

## Veglinjer og lengdeprofiler

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Spiraler annet enn klotoide; en spiral mellom to kurver (sammensatte overganger) | Klotoidespiraler i endene av en kurve er tilgjengelige; de andre er nevnt med navn og hoppes over ved LandXML-import |
| Sette inn et PI mellom to andre | Tegn veglinjen på nytt, eller skriv inn PI-koordinatene på nytt |
| Veglinjer fra objekter, forskyvninger, utvidelser | Tegn med PI-er |
| Skrive inn K for en vertikalkurve | Skriv inn L (K vises) |
| Sirkulære og usymmetriske vertikalkurver | Bare symmetriske parabolske kurver |
| Mer enn ett prosjektert lengdeprofil per veglinje | Én veglinje per variant |
| Zoome lengdeprofilvisningen, profilbånd under profilet | Lengdeprofilvisningen tilpasses hele veglinjen; skriv den ut på [plan- og profilark](topic:plan-profile-sheets) |
| Tverrprofiler i DWG eller LandXML | Tverrprofilark som PDF; {{ui:CSV}} av arealene og volumene |
| Profillinjer i en vinkel, eller med ulike bredder langs veien | Én bredde på hver side for hele veglinjen |

## Korridorer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Midtdelere, autovern og en overhøyde som dreier maler | Tegn dem som maler ([Korridormaler](topic:corridor-templates)); maler etter profilnummer tar ikke overhøyde ennå |
| En jevn overgang mellom to områders maler (overganger, avsmalninger) | Endre malen ved et profilnummer, eller gi et punkt et bredde-mål til en linje tegnet som avsmalningen |
| Rotasjon om en kant, overhøyde i LandXML | Overhøyde roterer om senterlinjen i sirkelformede kurver; utvid et kjørefelt med et bredde-mål til en formlinje |
| Mål for sideskråningene (dagslinje til en linje eller en flate), egne korridorflater | Mål flytter kjørebanekanter og skuldre ([Korridorer](topic:corridor)); korridoren formes inn i den prosjekterte terrengmodellen |
| Kantsteinsavrundinger, svingefelt og trafikkøyer formet inn i et kryss; sidevegens ende kuttet til hovedvegens kant på skjev; en sti sammenkoblet med en veg i planen, i lengde og areal | Veier som møtes, kobles rettvinklet, med hovedvegens kant åpnet og sidevegen jevnet til den ([Der veier møter veier, byggeplater og stier](topic:corridor#where-roads-meet-roads-pads-and-paths)); en sti stopper ved vegens kant i den prosjekterte terrengmodellen og i 3D |
| Korridorer eksportert som LandXML-veier; en andre korridor på en veglinje i IFC-eksporten | Den prosjekterte terrengmodellen eksporteres |
| Terrengmaler som endrer den prosjekterte terrengmodellen, i 3D eller i tverrprofilene | De gir arealer og volumer for hvert lag ([Terrengmaler](topic:corridor-templates#terrain-templates)) |
| Sveipkurver med fart, dekkslir, styretid, styrende tilhengere eller karosseriklaring; et bibliotek med standard prosjekteringskjøretøy; en sveipkurve tegnet ved å dra kjøretøyet | Sveipkurver i lav fart langs en formlinje eller en veglinje, med egne kjøretøystørrelser ([Kjøretøyers sveipkurver](topic:swept-paths)) |

## Terrengforming og volumer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Benker, åpne formlinjer formet inn i prosjektet, forming til en formlinje fra et annet sted | Lukk formlinjen ([Formlinjer](topic:feature-lines)), eller bruk den som bruddlinje i eksisterende terreng |
| Sette inn eller fjerne et hjørnepunkt i en formlinje | Tegn linjen på nytt, eller lag en trinnvis forskyvning av den |
| Buer i tegnede bruddlinjer (gjennom oppmålingspunkter), spiraler i formlinjer | Tegn en formlinje med buer og bruk den som bruddlinje i eksisterende terreng |
| Forming til en avstand, høyde eller en annen flate | Dagslinje til eksisterende terreng bare |
| Legge til eller fjerne et hjørne på en byggeplate | Slett byggeplaten og tegn den på nytt |
| Volumer TIN-til-TIN (prisme), valg av rutenettcellestørrelse | Rutenettmetode, cellestørrelse valgt for deg |
| Svell og krymp, toppjord, dybder for veioppbygning | Bruk faktorer på de rapporterte tallene selv |
| Fri transport og overtransportkostnader, transport på tvers av ulike veglinjer, uttak og deponier plassert i planen | Massetransportdiagrammet med balansepunkter, flyttede volumer og gjennomsnittlige transportavstander |

## Ledningsnett

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Mer enn ett nett per prosjekt | Egne prosjekter for overvann og spillvann |
| Vannledninger: vannkvalitet og alder, regelbaserte styringer, andre ventiltyper (strømningsstyring, strupeventil, opprettholdelse), pumper gitt ved effekt, forbruk som avhenger av trykk, et Darcy–Weisbach-alternativ, en rørkatalog med veggtykkelser og trykkklasser. Resten av trykknett er i laboratoriet: [Vannledninger](topic:water-mains) | Kontroller dem i programvare for vannfordeling; spillvannets dimensjonerende strømninger er i [Dimensjonerende spillvannsmengder](topic:sanitary-design) |
| Spillvannsstrømninger over tid (hydrografer, dynamisk rutering, magasinering, pumper, overløp) | [Dimensjonerende spillvannsmengder](topic:sanitary-design) gir den stasjonære toppstrømmen et dimensjoneringsark bruker |
| Kapasitet på sluk, rennesteinsspredning, fordrøyningsrutering, hydrografer, energitap utover én kryssingskoeffisient | Kontroller dem i annen programvare; strømninger, dimensjoner og gradlinjene er i [Overvannsdrenering](topic:storm-drainage) |
| Nedbørfelt i PDF-plott, DWG, DXF eller LandXML; nedbørfelt fra terrengmodellen (vannskiller) | Tegn nedbørfelt for hånd; de lagres i prosjektfilen |
| Rørkataloger, ikke-runde rør, konstruksjoner som ikke er stående bokser eller sylindre (kjegler, trinn, benker), en dreneringskategori i biblioteket | Konstruksjonstyper fra parametere ([Ledningsnett](topic:pipe-network)); rør med diameter |
| Rør i lengdeprofilvisningen, buede rør | Les innvendig bunn og overdekning i høyre panel |

## Eiendommer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Å legge ut tomter etter areal eller frontlengde, eiendommer fra linjene rundt dem, vegrett | Tegn hver eiendom etter hjørnene, eller legg inn dens strekninger |
| Kurvetabeller og linjetabeller i planen; etiketter flyttet for hånd | Hver strekning er merket langs seg selv |
| Eiendommer i LandXML | Eiendommer lagres i prosjektfilen og går til PDF, DWG og DXF |

## Polygontog

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Minste kvadraters utjevning, transittregelen, vekting av vinkler mot avstander | Kompassregelen |
| Avvikingsvinkler, zenitvinkler og skråavstander, høyder ved trigonometrisk nivellement | Reduser til horisontale avstander og riktige vinkler, eller retninger |
| Sidesikter, rådatafiler fra datainnsamlere | Importer punktene som en punktfil |

## Utsetting

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Forskjøvne pæler (referansepunkter satt bak pælen), skråningspæler ved oppfangingspunktet | Sett ut i de forskyvningene du trenger, også utenfor skulderen |
| Sende pæler direkte i en datainnsamlers eget format | CSV-filen åpnes i kontorprogramvaren til de fleste datainnsamlere |
| Sette ut rør, byggeplater og eiendommer | Bruk oppmålingspunkter nær en veglinje, eller eiendommens strekninger |

## Filer og utdata

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Tekst, skravurer og mål fra DWG eller DXF; papirrom; koblede tegninger (xrefs); binær DXF | Linjeverk fra modellrom åpnes ([Åpne en DWG- eller DXF-fil som linjeverk](topic:open-dwg-dxf)); åpne koblede tegninger hver for seg |
| Flytte flere punkter samtidig ved å dra | Klipp ut og lim inn dem, eller rediger dem ett om gangen |
| Stående ark, egne tegningshoder, visningsområder du ordner selv, plan- og profilark i DWG | Ett liggende planark per PDF, eller plan- og profilark langs en veglinje (PDF) |
| Plotting av høydebånd og profiler | Bånd vises bare på skjermen; ta et skjermbilde hvis du trenger dem |
| Endre layernavn, farger eller etikettstiler | Endre dem i et CAD-program etter DXF-eksport |
| Skylagring og versjonshistorikk | Lagre `.civilcraft.json`-filer og ta sikkerhetskopi av dem; for å jobbe sammen på ett prosjekt, bruk en live-økt i CadCraft Studio ([Prosjekter ett område sammen, live](topic:work-live)) |
| CadCraft Studio for iPad og iPhone, og fra Google Play | Bruk CivilCraft i nettleseren på enheten; på Android installeres CadCraft Studio fra APK-filen på getcadcraft.com/download |
| Åpne flere punkt- eller prosjektfiler samtidig | Én fil om gangen (GIS-filer som hører sammen, for eksempel delene i en shapefil, åpnes sammen) |

## Landskap

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Produsentenes hoder og dyser | Generiske hoder, eller legg til egne hoder fra en fil; produsentdata kommer inn etter hvert som de gir tillatelse |
| Maksimale sidelengder for dryppslanger, strømninger over tid, pumper, sløyfede rørnett | Hold dryppstrekk innenfor produsentens oppgitte lengde; kontrollen krever et forgreinet nett |
| Den nøyaktige konturen til et konkavt frittformet objekt; volumet under terreng målt nøyaktig | Den konvekse omhyllingen formes, og volumet under terreng er et anslag (sies i Egenskaper) |
| Planter i BimCrafts og ModelCrafts egen Plasser fra bibliotek | Eksporter landskaps-IFC og åpne den i BimCraft ved siden av bygningen |
| Detaljerte plantemodeller (blader, grener, årstider) i 3D-visningen; frittformede objekter og vanning i 3D-visningen | Planter vises i 3D som enkle former dimensjonert etter plantelisten ([Vis området i 3D](topic:site-3d)); ModelCrafts spredning lager plantebilder |
| Murer i harde flater som holder et formet nivå bak seg på terrengmodellen | Gi en plattform eller byggeplate loddrette sider: de er støttemurer i terrengmodellen ([Terrengforming](topic:grading)) |
| SVG-transformasjoner i egne symboler; teksturer og farger på egne GLB-plantemodeller; komprimert GLB-geometri | Flat ut transformasjoner i tegneprogrammet først; modeller tegnes i plantens farge; eksporter GLB uten komprimering ([Plantegrafikk](topic:plant-graphics)) |
| Din egen plantliste i biblioteket på kontoen din (redigert i appen) | Rediger prosjektets egen liste i plantetabellen og lagre den som en plantefil |
| Landskapsverktøyene for assistenter uten vinduet (filtjeneren og kommandolinjen) | De fungerer når CivilCraft-vinduet er åpent ([La en assistent jobbe med området ditt](topic:assistants)) |

## Kraftledninger

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Et lands standard innebygd (lasttilfeller, klaringer, faktorer) | Angi standardens verdier i {{ui:Lasttilfeller og grenser…}} og lagre dem, sammen med biblioteket ditt, som en pakke du kan gjenbruke og dele ([Pakker](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Sideveis avstand fra en leder til en trekrone eller en mur ved siden av ledningen | Klaringen rett opp over planter og murer ledningen krysser ([Kontroll av kraftledninger](topic:power-line-checks#clearances)) |
| Lederkryp og strekking av en ny leder | Ta hensyn til dem gjennom temperaturene i strekkeplanen |
| Termisk klassifisering av nedgravde kabler (strømgrense fra hvordan de legges) | Skriv inn leverandørens strømgrense på kabelelementet |
| Kortslutnings-, vern- og jordingsstudier | Bruk et dedikert elektroprogram; CivilCraft gir nettets lengder og kabler |
| Fagverksmaster prosjektert stav for stav, og forankringer i grunnen | Master kontrolleres etter nominell last; stag etter klassifisert last |
| En `.DON`-studiefil kontrollert i programmet som leser den | Kontroller filen der; send oss en prøve så vi kan teste mot en ekte en |
| Kraftledninger i 3D-visningen og i IFC | Planen, ledningsprofilet, arkene og GIS-lagene |
| Kraftledningsverktøyene for assistenter uten vinduet | De fungerer når CivilCraft-vinduet er åpent ([La en assistent jobbe med området ditt](topic:assistants)) |

## Bygningsvolumer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Et bibliotek med reguleringsbestemmelser eller en by sine regler | Skriv inn grensene fra din egen forskrift ([Reguleringsgrenser](topic:zoning-limits)) |
| Himmellys på veggene (fasadedagslys), vind | [Soltimer](topic:sun-hours) teller bare direkte sol |
| Skygge fra trær, planter eller alt som ikke er tegnet som et volum | Tegn nabobygninger som volumer |
| Takformer på volumer | Volumer med flat topp |
| Åpninger, tak og veggtyper når et volum utvikles i BimCraft | BimCraft bygger enkle yttervegger på hver etasje og et gulv; legg til resten der |

## GIS og koordinatsystemer

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| File Geodatabase; KML-stiler, ikoner, bakkeoverlegg og nettverkslenker | Konverter til GeoPackage, shapefile eller GeoJSON først; KML-merker leses uten stiler |
| Redigere GIS-objekter eller egenskapene deres | Rediger dem i et GIS-program og importer på nytt. {{ui:Analyser}}-panelet lager nye lag (buffer, overlegg, sammenkobling, utvalg) og legger til areal- og lengdefelt, men redigerer ikke et objekt på stedet |
| Nett- og rasteranalyse, buffere med flate eller kvadratiske ender og ensidige buffere, legge til eller slette rader og endre et felts type i attributttabellen, manuelle klassefarger, en stilforklaring i plott | Bruk {{ui:Velg}} til å velge objekter og lag et lag av dem; flate ender tilbys ikke. Farging etter egenskap og attributttabellen er bygget: se [Stil et lag etter en egenskap](topic:gis-symbology) og [Arbeid med et lags attributttabell](topic:gis-table) |
| Etikettstiler (størrelse, plassering) og etiketter som unngår hverandre | Etiketter har én størrelse og kan overlappe der objektene er tett |
| Høydesystemer og geoidmodeller | Høyder brukes slik filen gir dem; kontroller høydesystemet selv |
| Rutenettforskyvninger annet enn til NAD83 fra NAD27 foreslått etter område (OSTN15, NTv2 for andre datum fungerer når du legger til filen), flere rutenett samtidig, vertikale rutenett | Legg til rutenettfilen for ditt datum selv; ett rutenett per prosjekt |
| Kartlag i DXF eller i 3D-eksporter | Kartlag går inn i PDF-plottet, og ved siden av DWG som et bilde |
| Kartservere som krever innlogging, nøkkel eller token | Bruk åpne tjenester, eller en georeferert bildefil |
| Skrive LAS- eller LAZ-filer fra en terrengmodell, bakkemodellen eller høydegrid- og LiDAR-verktøyene | Eksporter terrengmodeller som et GeoTIFF-høydegrid. Tillegget [Punktskyer](topic:point-clouds) skriver en renset sky som LAS 1.4 eller LAZ |
| LiDAR-intensitet, farge og retur; høydegrid med flere bånd; grid- eller LiDAR-filer over 200 MB | LiDAR filtreres bare etter klasse, grid bruker første bånd; del store filer i fliser først |

## Inndata

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Boksvalg med berøring (det krever {{key:Shift}}) | Trykk lenge på hvert oppmålingspunkt for å legge det til |
| Skrevne koordinater eller avstander under tegning | Tegn omtrentlig, og skriv deretter inn nøyaktige PI-koordinater i veglinjens PI-tabell |
| Skrive inn koordinater for hjørner på byggeplater og konstruksjoner | Dra håndtakene deres; zoom inn for presisjon og følg E og N i statuslinjen |
| Feste til objekter (annet enn oppmålingspunkter for bruddlinjer) | Zoom inn og følg statuslinjen |

## 3D-visning

| Ikke bygget ennå | I stedet, i dag |
|---|---|
| Tegne eller redigere i 3D-visningen | Tegn og rediger i planen; 3D-visningen følger hver endring |
| Velge korridorformlinjer eller GIS-objekter ved å klikke i 3D | Klikk dem i planen |
| Eksportere den overdrevne visningen eller i fot | Eksporter er i riktig målestokk i meter; se [Eksporter området i 3D](topic:export-3d) |
| Etiketter i GLB- eller OBJ-eksporter, etikettstørrelser og -stiler i 3D | Etiketter vises bare i 3D-visningen, i én størrelse; se [Vis området i 3D](topic:site-3d) |
| Teksturer fra bilder, opptak av en kjøring som video, skygger fra utenfor området, soltimer vist i 3D-visningen | Kartlag drapert over flatene; kjøring og solens posisjon på ett tidspunkt; [soltimer](topic:sun-hours) for en dag eller en årstid i planen |
