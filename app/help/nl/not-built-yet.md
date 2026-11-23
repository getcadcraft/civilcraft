---
title: Nog niet beschikbaar
summary: Wat deze versie van CivilCraft nog niet doet, en wat u nu in plaats daarvan kunt doen.
keywords: ontbrekend, beperkingen, roadmap, niet beschikbaar, spiralen, verbreding, dwg, dxf, inlaten, retentie, dwarsprofielen, later komend, grenzen
from: b91588d4
---

CivilCraft is nog in een vroeg stadium. Deze pagina somt op wat de huidige versie niet doet, zodat u er niet naar zoekt. Voor niets op deze lijst is een datum toegezegd.

## Punten

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Een tweede puntenbestand aan het eerste toevoegen | Voeg de bestanden eerst samen in een teksteditor of spreadsheet |
| Een puntentekstbestand exporteren | Exporteer LandXML (punten gaan eruit als CgPoints), gebruik GIS {{ui:Exporteren}} (punten met de velden P, N, E, Z en D), of {{ui:Kopiëren}} de punten naar een spreadsheet |
| Puntlabelstijlen, symbolen per beschrijvingssleutel, bogen uit lijncodes, een beschrijvingssleutelbestand om tussen projecten te delen | Labels tonen het nummer, de hoogte en de beschrijving, of minder ([CivilCraft-instellingen](topic:settings)); sleutels worden in het projectbestand bewaard |
| Eenheidsconversie | Converteer het bestand vóór het importeren; **{{ui:Eenheden}}** hernoemt alleen |

## Oppervlakken

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Meer dan één oppervlak uit punten | Eén project per oppervlak |
| Binnengrenzen verbergen | Gebruik **Langste buitenrand** of een buitengrens |
| Eén getekende breeklijn selecteren of bewerken | {{key:Mod+Z}}, of {{ui:Getekende breeklijnen verwijderen}} en opnieuw tekenen |
| Een oppervlak bewerken dat uit LandXML is gelezen (breeklijnen, grens) | {{ui:Het oppervlak opnieuw bouwen uit de punten}} |
| Een oppervlak bewerken dat uit een hoogteraster is gemaakt | Importeer het raster opnieuw met andere keuzes |
| Een uit LandXML gelezen oppervlak converteren wanneer het coördinatenstelsel verandert | Eerst {{ui:Het oppervlak opnieuw bouwen uit de punten}} |
| Gelabelde spothoogten en hellingwaarden | Lees ze in de statusbalk, of kleur het oppervlak op helling met **Hellingsanalyse** in de werkomgeving Landschap ([Afwerking voor landschap](topic:landscape-grading#grading-checks)) |

## Tracés en profielen

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Spiralen anders dan clothoïde; een spiraal tussen twee bogen (samengestelde overgangen) | Clothoïde-spiralen aan de uiteinden van een boog zijn beschikbaar; de andere worden benoemd en overgeslagen bij LandXML-import |
| Een PI tussen twee andere invoegen | Teken het tracé opnieuw, of typ de PI-coördinaten opnieuw |
| Tracés uit objecten, offsets, verbredingen | Teken met PI's |
| K typen voor een verticale boog | Typ L (K wordt getoond) |
| Cirkelvormige en asymmetrische verticale bogen | Alleen symmetrische parabolische bogen |
| Meer dan één ontwerpprofiel per tracé | Eén tracé per variant |
| Inzoomen op de profielweergave, profielbanden onder het profiel | De profielweergave past het hele tracé in beeld; plot het op [plan- en profielbladen](topic:plan-profile-sheets) |
| Doorsneden in DWG of LandXML | Doorsnedebladen als PDF; {{ui:CSV}} van de oppervlakken en volumes |
| Steekproeflijnen onder een hoek, of van verschillende breedten langs de weg | Eén breedte per zijde voor het hele tracé |

## Corridors

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Middenbermen, barrières en een overhoging die sjablonen draait | Teken ze als sjablonen ([Corridorsjablonen](topic:corridor-templates)); sjablonen per station nemen nog geen overhoging over |
| Een geleidelijke overgang tussen de sjablonen van twee gebieden (overgangen, taps) | Verander het sjabloon bij een station, of geef een punt een breedtedoel naar een lijn die als taps is getekend |
| Rotatie om een rand, overhoging in LandXML | Overhoging draait om de as bij cirkelbogen; verbreed een rijstrook met een breedtedoel naar een elementlijn |
| Doelen voor de zijhellingen (ontgraving naar een lijn of oppervlak), eigen corridoroppervlakken | Doelen verplaatsen de verhardingsranden en bermen ([Corridors](topic:corridor)); de corridor wordt in het voorgestelde oppervlak afgewerkt |
| Kantsteenbogen, afslaglanen en eilanden afgewerkt in een kruispunt; het einde van een zijweg afgesneden op de rand van de hoofdweg bij een scheve hoek; een pad dat in plan aan een weg is gekoppeld, in zijn lengte en oppervlak | Wegen die elkaar raken worden recht aangesloten, met de rand van de hoofdweg geopend en de zijweg ernaartoe getrokken ([Waar wegen elkaar raken](topic:corridor#where-roads-meet-roads-pads-and-paths)); een pad stopt aan de rand van de weg in het voorgestelde oppervlak en in 3D |
| Corridors geëxporteerd als LandXML-wegen; een tweede corridor op een tracé in de IFC-export | Het voorgestelde oppervlak wordt geëxporteerd |
| Terreinsjablonen die het voorgestelde oppervlak wijzigen, in 3D of in de doorsneden | Ze geven oppervlakken en volumes van elke laag ([Terreinsjablonen](topic:corridor-templates#terrain-templates)) |
| Gereden paden met snelheid, bandslip, stuurtijd, stuuraanhangers of carrosserievrijgang; een bibliotheek met standaardontwerpvoertuigen; een gereden pad getekend door het voertuig te slepen | Gereden paden bij lage snelheid langs een elementlijn of tracé, met uw eigen voertuigafmetingen ([Gereden paden van voertuigen](topic:swept-paths)) |

## Afwerking en volumes

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Banketten, open elementlijnen die in het ontwerp worden afgewerkt, afwerking naar een elementlijn van elders | Sluit de elementlijn ([Elementlijnen](topic:feature-lines)), of gebruik hem als breeklijn van het bestaande terrein |
| Een hoekpunt van een elementlijn invoegen of verwijderen | Teken de lijn opnieuw, of maak er een getrapte offset van |
| Bogen in getekende breeklijnen (door opmeetpunten), spiralen in elementlijnen | Teken een elementlijn met bogen en gebruik hem als breeklijn van het bestaande terrein |
| Afwerking tot een afstand, hoogte of een ander oppervlak | Alleen ontgravingslijn naar bestaand terrein |
| Een plateauhoek toevoegen of verwijderen | Verwijder het plateau en teken het opnieuw |
| TIN-naar-TIN (prisma-)volumes, kiezen van de rastercelgrootte | Rastermethode, celgrootte voor u gekozen |
| Zwelling en krimp, teelaarde, verhardingsdiktes | Pas de factoren zelf toe op de gerapporteerde getallen |
| Kosten voor vrije aanvoer en overhaul, aanvoer tussen verschillende tracés, leenputten en stortplaatsen op het plan | Het massaverdelingsdiagram met evenwichtspunten, verplaatste volumes en gemiddelde aanvoerafstanden |

## Leidingnetwerken

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Meer dan één netwerk per project | Afzonderlijke projecten voor regen- en vuilwater |
| Waterleidingen: waterkwaliteit en leeftijd, op regels gebaseerde regelingen, andere afsluiterstypes (debietregeling, smoorklep, instandhouding), pompen opgegeven met vermogen, vraag die van druk afhangt, een Darcy–Weisbach-optie, een leidingcatalogus met wanddiktes en drukklassen. Het overige van drukleidingnetwerken staat in het lab: [Waterleidingen](topic:water-mains) | Controleer die in waterdistributiesoftware; ontwerpdebieten voor vuilwater staan in [Ontwerpdebieten vuilwater](topic:sanitary-design) |
| Rioolstromen in de tijd (hydrogrammen, dynamische routering, berging, pompen, overstorten) | [Ontwerpdebieten vuilwater](topic:sanitary-design) geeft het stationaire piekdebiet dat een ontwerpblad gebruikt |
| Inlaatcapaciteit, goot-spreiding, retentie-routering, hydrogrammen, energieverliezen anders dan één knoopcoëfficiënt | Controleer ze in andere software; debieten, afmetingen en de gradiëntlijnen staan in [Hemelwaterafvoer](topic:storm-drainage) |
| Stroomgebieden in de PDF-plot, DWG, DXF of LandXML; stroomgebieden uit het oppervlak (waterscheidingen) | Teken stroomgebieden met de hand; ze worden in het projectbestand bewaard |
| Leidingcatalogi, niet-ronde leidingen, constructies die geen rechtopstaande dozen of cilinders zijn (kegels, trappen, banketten), een afwateringscategorie in de bibliotheek | Constructietypes uit parameters ([Leidingnetwerk](topic:pipe-network)); leidingen met een diameter |
| Leidingen in de profielweergave, gebogen leidingen | Lees de inverts en dekking in het rechterpaneel |

## Percelen

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Kavels uitzetten op oppervlakte of frontlengte, percelen uit de lijnen eromheen, recht van overpad | Teken elk perceel op zijn hoekpunten, of voer zijn strekkingen in |
| Curvetabellen en lijntabellen op het plan; labels met de hand verplaatst | Elke strekking wordt langs zichzelf gelabeld |
| Percelen in LandXML | Percelen worden in het projectbestand bewaard en gaan naar de PDF, DWG en DXF |

## Polygonen

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Kleinste-kwadratenvereffening, de transitregel, weging van hoeken tegen afstanden | De kompasregel |
| Afbuigingshoeken, zenithoeken en schuine afstanden, hoogten door trigonometrische nivellering | Herleid naar horizontale afstanden en hoeken, of peilingen |
| Zijschoten, ruwe gegevensbestanden van gegevensverzamelaars | Importeer de punten als puntbestand |

## Uitzetten

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Offsetpalen (referentiepunten teruggezet van de paal), taludpalen bij het aansluitpunt | Zet uit op de offsets die u nodig hebt, ook voorbij de berm |
| Palen direct naar het eigen formaat van een gegevensverzamelaar sturen | De CSV opent in de kantoorsoftware van de meeste gegevensverzamelaars |
| Pijpleidingen, plateaus en percelen uitzetten | Gebruik opmeetpunten nabij een tracé, of de strekkingen van het perceel |

## Bestanden en uitvoer

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Tekst, arceringen en maatvoering uit DWG of DXF; papierruimte; gekoppelde tekeningen (xrefs); binaire DXF | Lijnwerk uit modelruimte wordt geopend ([Een DWG of DXF openen als lijnwerk](topic:open-dwg-dxf)); open gekoppelde tekeningen op zichzelf |
| Meerdere punten tegelijk verplaatsen door te slepen | Knip en plak ze, of bewerk ze één voor één |
| Staande bladen, eigen titelblokken, viewports die u zelf rangschikt, plan- en profielbladen in DWG | Eén liggend planblad per PDF, of plan- en profielbladen langs een tracé (PDF) |
| Hoogtebanden en profielen plotten | Banden zijn alleen op het scherm; maak een schermafbeelding als u ze nodig hebt |
| Laagnamen, kleuren of labelstijlen wijzigen | Wijzig ze in een CAD-programma na DXF-export |
| Cloudopslag en versiegeschiedenis | Bewaar `.civilcraft.json`-bestanden en maak er back-ups van; om samen aan één project te werken, gebruikt u een live-sessie in CadCraft Studio ([Een terrein samen live ontwerpen](topic:work-live)) |
| CadCraft Studio voor iPad en iPhone, en vanuit Google Play | Gebruik CivilCraft in de browser op het apparaat; op Android installeert CadCraft Studio via zijn APK op getcadcraft.com/download |
| Meerdere punt- of projectbestanden tegelijk openen | Eén bestand per keer (GIS-bestanden die bij elkaar horen, zoals de delen van een shapefile, worden samen geopend) |

## Landschap

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Koppen en tuiten van fabrikanten | Generieke koppen, of voeg uw eigen koppen toe uit een bestand; gegevens van fabrikanten komen binnen zodra ze toestemming geven |
| Maximale zijlengtes voor druppelleidingen, stromingen in de tijd, pompen, lussen in leidingnetwerken | Houd druppelleidingen binnen de door de fabrikant gepubliceerde lengte; de controle vereist een vertakt netwerk |
| De exacte omtrek van een holle vrije vorm; het volume onder het maaiveld exact gemeten | De convexe romp wordt afgewerkt en het volume onder het maaiveld is een schatting (in Eigenschappen vermeld) |
| Planten uit de eigen Plaatsen uit bibliotheek van BimCraft en ModelCraft | Exporteer landschaps-IFC en open het in BimCraft naast het gebouw |
| Gedetailleerde plantmodellen (bladeren, takken, seizoenen) in de 3D-weergave; vrije vormen en beregening in de 3D-weergave | Planten worden in 3D als eenvoudige vormen getoond, bepaald door de plantenlijst ([De locatie in 3D bekijken](topic:site-3d)); de verspreiding van ModelCraft maakt plantbeelden |
| Verhardingsmuren die een afgewerkt niveau achter zich keren op het oppervlak | Geef een platform of plateau verticale zijden: het zijn keermuren op het oppervlak ([Afwerking](topic:grading)) |
| SVG-transformaties in eigen symbolen; texturen en kleuren van eigen GLB-plantmodellen; gecomprimeerde GLB-geometrie | Vlak transformaties eerst af in uw tekenprogramma; modellen worden in de kleur van de plant getekend; exporteer de GLB zonder compressie ([Plantgrafiek](topic:plant-graphics)) |
| Uw eigen plantenlijst in uw bibliotheekaccount (bewerkt in de app) | Bewerk de eigen lijst van het project in de plantentabel en sla hem op als plantenbestand |
| De landschapstools voor assistenten zonder het venster (de bestandsserver en de opdrachtregel) | Ze werken als het CivilCraft-venster open is ([Laat een AI-assistent met uw terrein werken](topic:assistants)) |

## Hoogspanningsleidingen

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Een standaard van een land ingebouwd (belastinggevallen, vrijhoudingen, factoren) | Stel de waarden van uw standaard in {{ui:Belastinggevallen en grenzen…}} en sla ze op, met uw bibliotheek, als pakket om te hergebruiken en te delen ([Pakketten](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| De zijdelingse afstand van een geleider tot een boomkruin of een muur naast de lijn | De vrije hoogte recht omhoog boven planten en muren die de lijn kruist ([Controles hoogspanningsleiding](topic:power-line-checks#clearances)) |
| Geleiderkruip en de rek van een nieuwe geleider | Houd er rekening mee via de temperaturen in de spantabel |
| Thermische belastbaarheid van begraven kabels (stroomsterkte uit de manier waarop ze liggen) | Voer de stroombelastbaarheid van uw leverancier in op het kabelitem |
| Kortsluit-, beveiligings- en aardingsstudies | Gebruik een speciaal elektrisch programma; CivilCraft geeft de lengten en kabels van het netwerk |
| Gitermasten die staaf voor staaf worden ontworpen, en spankabels (verankeringen) in de grond | Masten worden gecontroleerd op hun nominale belasting; spankabels op hun gegarandeerde belasting |
| Een `.DON`-studiebestand gecontroleerd in het programma dat het leest | Controleer het bestand daar; stuur ons een voorbeeld zodat we tegen een echt bestand kunnen testen |
| Hoogspanningsleidingen in de 3D-weergave en in IFC | Het plan, het lijnprofiel, de bladen en GIS-lagen |
| De hoogspanningstools voor assistenten zonder het venster | Ze werken als het CivilCraft-venster open is ([Laat een AI-assistent met uw terrein werken](topic:assistants)) |

## Gebouwvolumes

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Een bibliotheek van bestemmingsplannen of de regels van een stad | Typ de grenzen uit uw eigen verordening ([Zonegrenzen](topic:zoning-limits)) |
| Zonlicht op de muren (gevel-dagverlichting), wind | [Zonuren](topic:sun-hours) telt alleen direct zonlicht |
| Schaduw van bomen, planten of alles wat niet als massa is getekend | Teken buurgebouwen als massa's |
| Dakvormen op massa's | Massa's met platte bovenkant |
| Openingen, daken en wandtypes wanneer een massa in BimCraft wordt uitgewerkt | BimCraft bouwt eenvoudige buitenwanden op elke verdieping en een vloer; voeg de rest daar toe |

## GIS en coördinatenstelsels

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| File Geodatabase; KML-stijlen, pictogrammen, grondoverlays en netwerklinks | Converteer eerst naar GeoPackage, shapefile of GeoJSON; KML-placemarks worden zonder hun stijlen gelezen |
| GIS-objecten of hun attributen bewerken | Bewerk ze in een GIS-programma en importeer opnieuw. Het paneel Analyseren maakt nieuwe lagen (buffer, overlay, samenvoegen, selectie) en voegt oppervlakte- en lengtevelden toe, maar het bewerkt een object niet ter plaatse |
| Netwerk- en rasteranalyse, buffers met vlakke of vierkante uiteinden en eenzijdige buffers, rijen toevoegen of verwijderen en het type van een veld wijzigen in de attributentabel, handmatige klassenkleuren, een stijllegenda in plots | Gebruik Selecteren om objecten te kiezen en maak daar een laag van; vlakke uiteinden worden niet aangeboden. Kleuren op attribuut en de attributentabel zijn gebouwd: zie [Een laag opmaken op een attribuut](topic:gis-symbology) en [Werken met de attributentabel van een laag](topic:gis-table) |
| Labelstijlen (grootte, plaatsing) en labels die elkaar niet overlappen | Labels hebben één grootte en mogen overlappen waar objecten dicht op elkaar staan |
| Verticale datums en geoïdemodellen | Hoogten worden gebruikt zoals het bestand ze geeft; controleer de verticale datum zelf |
| Rasterverschuivingen anders dan naar NAD83 vanuit NAD27 (op gebied voorgesteld: OSTN15, NTv2 voor andere datums werken als u het bestand toevoegt), meerdere rasters tegelijk, verticale rasters | Voeg het rasterbestand voor uw datum zelf toe; één raster per project |
| Kaartlagen in de DXF of in 3D-exports | Kaartlagen gaan in de PDF-plot, en naast de DWG als afbeelding |
| Kaartservers die een aanmelding, sleutel of token vereisen | Gebruik openbare diensten, of een gegeorefereerd afbeeldingsbestand |
| LAS- of LAZ-bestanden schrijven uit een oppervlak, het terreinmodel of de hoogteraster- en LiDAR-tools | Exporteer oppervlakken als GeoTIFF-hoogteraster. De add-on [Puntenwolken](topic:point-clouds) schrijft een opgeschoonde wolk als LAS 1.4 of LAZ |
| LiDAR-intensiteit, kleur en retouren; hoogterasters met meerdere banden; raster- of LiDAR-bestanden groter dan 200 MB | LiDAR wordt alleen op klasse gefilterd, rasters gebruiken hun eerste band; knip grote bestanden eerst in tegels |

## Invoer

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Vakselectie met aanraking (het vereist {{key:Shift}}) | Houd elk opmeetpunt lang ingedrukt om het toe te voegen |
| Getypte coördinaten of afstanden tijdens het tekenen | Teken ruw, typ daarna exacte PI-coördinaten in de PI-tabel van het tracé |
| Coördinaten typen voor plateauhoeken en constructies | Sleep hun grepen; zoom in voor precisie en let op E en N in de statusbalk |
| Snappen op objecten (anders dan opmeetpunten voor breeklijnen) | Zoom in en let op de statusbalk |

## 3D-weergave

| Nog niet beschikbaar | In plaats daarvan, nu |
|---|---|
| Tekenen of bewerken in de 3D-weergave | Teken en bewerk in het plan; de 3D-weergave volgt elke bewerking |
| Corridor-elementlijnen of GIS-objecten selecteren door in 3D te klikken | Klik erop in het plan |
| De overdreven weergave of in voet exporteren | Exports zijn op ware schaal in meters; zie [Het terrein in 3D exporteren](topic:export-3d) |
| Labels in GLB- of OBJ-exports, labelgroottes en -stijlen in 3D | Labels worden alleen in de 3D-weergave getoond, in één grootte; zie [De locatie in 3D bekijken](topic:site-3d) |
| Texturen van foto's, een rit opnemen als video, schaduwen van buiten het terrein, zonuren in de 3D-weergave | Kaartlagen op de oppervlakken gedrapeerd; rijden en de stand van de zon op één moment; [zonuren](topic:sun-hours) voor een dag of seizoen op het plan |
