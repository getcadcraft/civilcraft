---
title: Nog niet beschikbaar
summary: Wat deze versie van CivilCraft nog niet doet, en wat u er vandaag voor kunt doen.
keywords: ontbrekend, beperkingen, routekaart, niet beschikbaar, spiralen, verbreding, dwg, dxf, straatkolken, bergbezinking, dwarsprofielen, later beschikbaar, grenzen
from: a2d970ef
---

CivilCraft is nog vroeg in de ontwikkeling. Deze pagina somt op wat de huidige versie niet doet, zodat u er niet naar zoekt. Voor niets hier is een datum toegezegd.

## Punten

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Een tweede puntenbestand aan het eerste toevoegen | Voeg de bestanden eerst samen in een teksteditor of spreadsheet |
| Een puntentekstbestand exporteren | Exporteer LandXML (punten gaan eruit als CgPoints), gebruik GIS {{ui:Exporteren}} (punten met de velden P, N, E, Z en D), of {{ui:Kopiëren}} de punten naar een spreadsheet |
| Puntlabelstijlen, symbolen per beschrijvingssleutel, bogen uit lijncodes, een beschrijvingssleutelbestand om tussen projecten te delen | Labels tonen het nummer, de hoogte en de beschrijving, of minder ([Instellingen van CivilCraft](topic:settings)); sleutels worden bewaard in het projectbestand |
| Eenhedenconversie | Converteer het bestand voor het importeren; **Eenheden** wijzigt alleen de labels |

## Oppervlakken

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Meer dan één oppervlak gebouwd uit punten | Eén project per oppervlak |
| (Binnenste) grenzen verbergen | Gebruik **Langste buitenrand** of een buitenste grens |
| Eén getekende breeklijn selecteren of bewerken | {{key:Mod+Z}}, of {{ui:Getekende breeklijnen verwijderen}} en opnieuw tekenen |
| Een uit LandXML gelezen oppervlak bewerken (breeklijnen, grens) | {{ui:Het oppervlak opnieuw bouwen uit de punten}} |
| Een oppervlak bewerken dat is gemaakt uit een hoogteraster | Importeer het raster opnieuw met andere keuzes |
| Een uit LandXML gelezen oppervlak converteren wanneer het coördinatenstelsel verandert | Bouw eerst {{ui:Het oppervlak opnieuw bouwen uit de punten}} |
| Gelabelde hoogtepunten en hellingwaarden | Lees ze af in de statusbalk, of kleur het oppervlak op helling met **Hellingsanalyse** in de werkomgeving Landschap ([Grading voor landschap](topic:landscape-grading#grading-checks)) |

## Tracés en profielen

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Spiralen anders dan klotoïde; een spiraal tussen twee bogen (samengestelde overgangen) | Klotoïde-spiralen aan de uiteinden van een boog zijn beschikbaar; de andere worden bij het importeren van LandXML benoemd en overgeslagen |
| Een PI tussen twee andere invoegen | Teken het tracé opnieuw, of typ de PI-coördinaten opnieuw in |
| Tracés uit objecten, offsets, verbredingen | Teken met PI's |
| K typen voor een verticale boog | Typ L (K wordt getoond) |
| Cirkelvormige en asymmetrische verticale bogen | Alleen symmetrische parabolische bogen |
| Meer dan één ontwerpprofiel per tracé | Eén tracé per variant |
| Het profiel zoomen, profielbanden onder het profiel | De profielweergave past het hele tracé; plot het op [plan- en profielbladen](topic:plan-profile-sheets) |
| Doorsneden in DWG of LandXML | Doorsnedebladen als PDF; {{ui:CSV}} van de oppervlakten en volumes |
| Dwarsprofiellijnen onder een hoek, of met verschillende breedtes langs de weg | Eén breedte per kant voor het hele tracé |

## Corridors

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Middenbermen, geleiderails en een overhoging die sjablonen roteert | Teken ze als sjablonen ([Corridorsjablonen](topic:corridor-templates)); sjablonen per stationering nemen nog geen overhoging over |
| Een geleidelijke overgang tussen de sjablonen van twee delen (overgangen, taps toelopend) | Wijzig het sjabloon bij een stationering, of geef een punt een breedtedoel op een lijn die als taps verloop is getekend |
| Rotatie om een rand, overhoging in LandXML | Overhoging roteert om de as bij cirkelvormige bogen; verbreed een rijstrook met een breedtedoel op een featurelijn |
| Doelen voor de taluds (ontgravingslijn naar een lijn of oppervlak), eigen corridoroppervlakken | Doelen verplaatsen de randen van de verharding en de bermen ([Corridors](topic:corridor)); de corridor wordt gegrade in het ontwerpoppervlak |
| Corridors geëxporteerd als LandXML-wegen; een tweede corridor op een tracé in de IFC-export | Het ontwerpoppervlak wordt geëxporteerd |
| Terreinsjablonen die het ontwerpoppervlak wijzigen, in 3D of in de doorsneden | Zij geven oppervlakten en volumes van elke laag ([Terreinsjablonen](topic:corridor-templates#terrain-templates)) |
| Draaicirkels (swept paths) met snelheid, bandslip, stuurtijd, stuurtrailers of carrosserieruimte; een bibliotheek met standaardontwerpvoertuigen; een draaicirkel getekend door het voertuig te slepen | Draaicirkels bij lage snelheid langs een featurelijn of een tracé, met uw eigen voertuigafmetingen ([Draaicirkels van voertuigen](topic:swept-paths)) |

## Grading en volumes

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Banketten, open featurelijnen die in het ontwerp worden gegrade, grading naar een featurelijn van elders | Sluit de featurelijn ([Featurelijnen](topic:feature-lines)), of gebruik die als breeklijn van het bestaande maaiveld |
| Een hoekpunt van een featurelijn invoegen of verwijderen | Teken de lijn opnieuw, of maak er een getrapte offset van |
| Bogen in getekende breeklijnen (door meetpunten), spiralen in featurelijnen | Teken een featurelijn met bogen en gebruik die als breeklijn van het bestaande maaiveld |
| Grading naar een afstand, hoogte of een ander oppervlak | Alleen ontgravingslijn naar het bestaande maaiveld |
| Een hoek van een plateau toevoegen of verwijderen | Verwijder het plateau en teken het opnieuw |
| TIN-naar-TIN (prisma)volumes, het kiezen van de rastercelgrootte | Rastermethode, celgrootte wordt voor u gekozen |
| Zwelling en krimp, teelaarde, verhardingsdiktes | Pas zelf factoren toe op de gerapporteerde getallen |
| Vrije-aanvoer- en overhaulkosten, aanvoer over verschillende tracés, aanvoerputten en stortlocaties op het plan geplaatst | Het massabalansdiagram met nulpunten, verplaatste volumes en gemiddelde aanvoerafstanden |

## Leidingnetwerken

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Meer dan één netwerk per project | Aparte projecten voor hemelwater en vuilwater |
| Waterleidingen: waterkwaliteit en leeftijd, regelgebaseerde regelingen, andere afsluitertypes (debietregeling, smoorklep, handhaving), pompen met opgegeven vermogen, vraag die van de druk afhangt, een optie Darcy–Weisbach, een leidingcatalogus met wanddiktes en drukklassen. De rest van drukleidingnetwerken is nog in ontwikkeling: [Waterleidingen](topic:water-mains) | Controleer die in software voor waterdistributie; ontwerpdebieten vuilwater staan in [Ontwerpdebieten vuilwater](topic:sanitary-design) |
| Rioolstromen in de tijd (hydrografen, dynamische routering, berging, pompen, overstorten) | [Ontwerpdebieten vuilwater](topic:sanitary-design) geeft het stationaire piekdebiet dat een ontwerpblad gebruikt |
| Capaciteit van straatkolken, gootspreiding, bergbezinkingsroutering, hydrografen, energieverliezen anders dan één knooppuntcoëfficiënt | Controleer ze in andere software; debieten, afmetingen en de HGL staan in [Hemelwaterafvoer](topic:storm-drainage) |
| Stroomgebieden in de PDF-plot, DWG, DXF of LandXML; stroomgebieden uit het oppervlak (waterscheidingen) | Teken stroomgebieden met de hand; ze worden bewaard in het projectbestand |
| Leidingcatalogi, niet-ronde leidingen, kunstwerken die geen rechtopstaande kasten of cilinders zijn (kegels, trappen, banketten), een afwateringscategorie in de bibliotheek | Kunstwerktypes op basis van parameters ([Leidingnetwerk](topic:pipe-network)); leidingen met een diameter |
| Leidingen in de profielweergave, gebogen leidingen | Lees binnenonderkanten en dekking af in het rechterpaneel |

## Percelen

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Kavels indelen op oppervlakte of breedte aan de straat, percelen uit de lijnen eromheen, wegrecht | Teken elk perceel met zijn hoekpunten, of voer zijn maten in |
| Boogtabellen en lijntabellen op het plan; labels handmatig verplaatst | Elk perceelsegment wordt langs zichzelf gelabeld |
| Percelen in LandXML | Percelen worden bewaard in het projectbestand en gaan naar de PDF, DWG en DXF |

## Polygonen

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Kleinste-kwadratenvereffening, de transitregel, hoeken wegen tegen afstanden | De kompasregel |
| Afbuigingshoeken, zenithoeken en schuine afstanden, hoogten door trigonometrische waterpassing | Herleid naar horizontale afstanden en hoeken, of naar richtingshoeken |
| Zijwaartse metingen, ruwe gegevensbestanden van dataloggers | Importeer de punten als puntenbestand |

## Uitzetten

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Offsetpalen (referentiepunten teruggezet van de paal), hellingpalen bij het aansluitpunt | Zet uit op de offsets die u nodig hebt, ook voorbij de berm |
| Palen rechtstreeks naar het eigen formaat van een dataverzamelaar sturen | Het CSV-bestand opent in de kantoorsoftware van de meeste dataverzamelaars |
| Leidingen, plateaus en percelen uitzetten | Gebruik meetpunten nabij een tracé, of de perceelsegmenten |

## Bestanden en uitvoer

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Tekst, arceringen en maatvoering uit DWG of DXF; papierruimte; gekoppelde tekeningen (xrefs); binaire DXF | Lijnwerk uit de modelruimte wordt geopend ([Een DWG of DXF als lijnwerk openen](topic:open-dwg-dxf)); open gekoppelde tekeningen afzonderlijk |
| Meerdere punten tegelijk verplaatsen door te slepen | Knip en plak ze, of bewerk ze één voor één |
| Staande bladen, eigen titelblokken, viewports die u indeelt, plan- en profielbladen in DWG | Eén liggend plan per PDF, of plan- en profielbladen langs een tracé (PDF) |
| Hoogtebanden en profielen plotten | Banden zijn alleen op het scherm; maak een schermafbeelding als u ze nodig hebt |
| Laagnamen, kleuren of labelstijlen wijzigen | Wijzig ze in een CAD-programma na de DXF-export |
| Opslaan in de cloud en versiegeschiedenis | Sla `.civilcraft.json`-bestanden op en houd er een back-up van; om samen aan één project te werken, gebruikt u een Live-sessie in CadCraft Studio ([Een bouwplaats samen live ontwerpen](topic:work-live)) |
| CadCraft Studio voor iPad en iPhone, en uit Google Play | Gebruik CivilCraft in de browser op het apparaat; op Android installeert CadCraft Studio via het APK-bestand op getcadcraft.com/download |
| Meerdere puntenbestanden of projectbestanden tegelijk openen | Één bestand per keer openen (GIS-bestanden die bij elkaar horen, zoals de onderdelen van een shapefile, worden samen geopend) |

## Landschap

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Kopjes en sproeiers van fabrikanten | Generieke kopjes, of voeg eigen kopjes toe uit een bestand; gegevens van fabrikanten komen erin zodra zij toestemming geven |
| Maximale zijlengtes voor druppelleidingen, stromen in de tijd, pompen, lusvormige leidingnetwerken | Houd druppelleidingen binnen de door de fabrikant gepubliceerde lengte; de controle vereist een vertakt netwerk |
| De exacte omtrek van een concaaf vrij object; het volume onder het maaiveld exact gemeten | De convexe romp wordt gegrade en het volume onder het maaiveld is een schatting (vermeld in Eigenschappen) |
| Planten in de eigen Plaats uit bibliotheek van BimCraft en ModelCraft | Exporteer landschaps-IFC en open dat in BimCraft naast het gebouw |
| Gedetailleerde plantmodellen (bladeren, takken, seizoenen) in de 3D-weergave; vrije objecten en irrigatie in de 3D-weergave | Planten tonen in 3D als eenvoudige vormen met afmetingen uit de plantenlijst ([Het terrein in 3D bekijken](topic:site-3d)); de scatter van ModelCraft maakt beplantingsbeelden |
| Hardscape-muren die een gegraded niveau erachter op het oppervlak keren | Geef een platform of plateau verticale zijden: die zijn keermuren op het oppervlak ([Grading](topic:grading)) |
| SVG-transformaties in uw eigen symbolen; texturen en kleuren van uw eigen GLB-plantmodellen; gecomprimeerde GLB-geometrie | Vlak transformaties eerst af in uw tekenprogramma; modellen worden in de kleur van de plant getekend; exporteer de GLB zonder compressie ([Plantgrafiek](topic:plant-graphics)) |
| Uw eigen plantenlijst bewaard in uw Bibliotheekaccount (bewerkt in de app) | Bewerk de eigen lijst van het project in de plantentabel en sla die op als plantenbestand |
| De landschapsgereedschappen voor assistenten zonder het venster (de bestandsserver en de opdrachtregel) | Ze werken met het CivilCraft-venster open ([Laat een AI-assistent met uw terrein werken](topic:assistants)) |

## Hoogspanningslijnen

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Een landnorm ingebouwd (belastinggevallen, vrije afstanden, factoren) | Stel de waarden van uw norm in via {{ui:Belastinggevallen en grenzen…}} en sla ze op, met uw bibliotheek, als een pakket om opnieuw te gebruiken en te delen ([Pakketten](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| De zijwaartse afstand van een geleider tot een boomkroon of een muur naast de lijn | De vrije hoogte recht omhoog boven planten en muren die de lijn kruist ([Controles van hoogspanningslijnen](topic:power-line-checks#clearances)) |
| Geleiderkruip en de rek van een nieuwe geleider | Houd daar rekening mee via de temperaturen in de spantabel |
| Thermische belastbaarheid van ondergrondse kabels (stroombelasting afhankelijk van hoe ze zijn gelegd) | Voer de stroombelasting van uw leverancier in bij het kabelitem |
| Kortsluit-, beveiligings- en aardingsstudies | Gebruik een speciaal elektrisch programma; CivilCraft levert de lengten en kabels van het netwerk |
| Vakwerkmasten ontworpen staaf voor staaf, en verankeringen in de grond | Masten worden gecontroleerd op hun nominale belasting; verankeringen op hun belastbaarheid |
| Een `.DON`-studiebestand gecontroleerd in het programma dat het leest | Controleer het bestand daar; stuur ons een voorbeeld zodat we kunnen testen met een echt bestand |
| Hoogspanningslijnen in de 3D-weergave en in IFC | Het plan, het lijnprofiel, de bladen en GIS-lagen |
| De hoogspanningsgereedschappen voor assistenten zonder het venster | Ze werken met het CivilCraft-venster open ([Laat een AI-assistent met uw terrein werken](topic:assistants)) |

## Gebouwmassa's

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Een bibliotheek met bestemmingsplannen of de regels van een stad | Typ de grenzen uit uw eigen verordening ([Bebouwingsgrenzen](topic:zoning-limits)) |
| Hemellicht op de muren (gevelbelichting), wind | [Zontijden](topic:sun-hours) telt alleen direct zonlicht |
| Schaduw van bomen, planten of alles wat niet als massa is getekend | Teken naburige gebouwen als massa's |
| Dakvormen op massa's | Massa's met platte bovenkant |
| Openingen, daken en wandtypen wanneer een massa in BimCraft wordt uitgewerkt | BimCraft bouwt gewone buitenmuren op elke verdieping en een vloer; voeg het overige daar toe |

## GIS en coördinatenstelsels

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| File Geodatabase; KML-stijlen, pictogrammen, grondoverlays en netwerklinks | Converteer eerst naar GeoPackage, shapefile of GeoJSON; KML-plaatsmerken worden zonder hun stijlen gelezen |
| GIS-objecten of hun attributen bewerken | Bewerk ze in een GIS-programma en importeer opnieuw. Het paneel Analyseren maakt nieuwe lagen (buffer, overlay, samenvoegen, selectie) en voegt velden voor oppervlakte en lengte toe, maar bewerkt een object niet ter plaatse |
| Netwerk- en rasteranalyse, buffers met vlakke of vierkante uiteinden en eenzijdige buffers, rijen toevoegen of verwijderen en het type van een veld wijzigen in de attributentabel, handmatige klassekleuren, een stijllegenda in plots | Gebruik {{ui:Selecteren}} om objecten te kiezen en er een laag van te maken; vlakke uiteinden worden niet aangeboden. Kleuren op attribuut en de attributentabel zijn gebouwd: zie [Een laag stijlen op een attribuut](topic:gis-symbology) en [Met de attributentabel van een laag werken](topic:gis-table) |
| Labelstijlen (grootte, plaatsing) en labels die elkaar ontwijken | Labels hebben één grootte en kunnen elkaar overlappen waar objecten dicht op elkaar staan |
| Verticale datums en geoïdemodellen | Hoogten worden gebruikt zoals het bestand ze geeft; controleer de verticale datum zelf |
| Rasterverschuivingen anders dan naar NAD83 vanuit NAD27 voorgesteld per gebied (OSTN15, NTv2 voor andere datums werken wanneer u het bestand toevoegt), meerdere rasters tegelijk, verticale rasters | Voeg zelf het rasterbestand voor uw datum toe; één raster per project |
| Kaartlagen in de DXF of in 3D-exports | Kaartlagen gaan in de PDF-plot, en naast de DWG als afbeelding |
| Kaartservers die een aanmelding, sleutel of token vereisen | Gebruik openbare diensten, of een gegeorefereerd afbeeldingsbestand |
| LAS- of LAZ-bestanden schrijven vanuit een oppervlak, het terreinmodel of de hoogterastergereedschappen en LiDAR | Exporteer oppervlakken als GeoTIFF-hoogteraster. De add-on [Puntenwolken](topic:point-clouds) schrijft een opgeschoonde wolk als LAS 1.4 of LAZ |
| LiDAR-intensiteit, kleur en retouren; hoogterasters met meerdere banden; raster- of LiDAR-bestanden groter dan 200 MB | LiDAR wordt alleen op klasse gefilterd, rasters gebruiken hun eerste band; knip grote bestanden eerst in tegels |

## Invoer

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Kaderselectie met aanraken (het vereist {{key:Shift}}) | Houd elk meetpunt lang ingedrukt om het toe te voegen |
| Getypte coördinaten of afstanden tijdens het tekenen | Teken ruw en typ daarna exacte PI-coördinaten in de PI-tabel van het tracé |
| Coördinaten typen voor plateauhoeken en kunstwerken | Sleep hun grepen; zoom in voor precisie en let op E en N in de statusbalk |
| Snappen op objecten (behalve meetpunten voor breeklijnen) | Zoom in en let op de statusbalk |

## 3D-weergave

| Nog niet beschikbaar | Nu in plaats daarvan |
|---|---|
| Tekenen of bewerken in de 3D-weergave | Teken en bewerk in het plan; de 3D-weergave volgt elke bewerking |
| Corridorfeaturelijnen of GIS-objecten selecteren door in 3D te klikken | Klik erop in het plan |
| De overdreven weergave exporteren of in ft | Exporten zijn op ware schaal in m; zie [Het terrein in 3D exporteren](topic:export-3d) |
| Labels in GLB- of OBJ-exports, labelgroottes en -stijlen in 3D | Labels tonen alleen in de 3D-weergave, één grootte; zie [Het terrein in 3D bekijken](topic:site-3d) |
| Texturen uit foto's, een rondrit opnemen als video, schaduwen van buiten het terrein, zontijden getoond in de 3D-weergave | Kaartlagen over de oppervlakken gedrapeerd; rijden en de zonnepositie op één moment; [zontijden](topic:sun-hours) voor een dag of seizoen op het plan |
