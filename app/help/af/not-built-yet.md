---
title: Nog nie gebou nie
summary: Wat hierdie weergawe van CivilCraft nog nie doen nie, en wat jy vandag in die plek daarvan kan doen.
keywords: ontbrekend, beperkings, padkaart, nie beskikbaar nie, spiraals, verbreding, dwg, dxf, inlate, detensie, dwarssnitte, kom later, limiete
from: a2d970ef
---

CivilCraft is vroeg. Hierdie bladsy lys wat die huidige weergawe nie doen nie, sodat jy nie daarvoor soek nie. Niks hier is vir 'n datum belowe nie.

## Punte

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Tweede puntlêer by die eerste voeg | Voeg die lêers eers saam in 'n teksredigeerder of sigblad |
| Uitvoer van 'n punte-tekslêer | Voer LandXML uit (punte gaan uit as CgPoints), gebruik GIS-{{ui:Uitvoer}} (punte met P-, N-, E-, Z- en D-velde), of {{ui:Kopieer}} die punte na 'n sigblad |
| Puntetiketstyle, simbole per beskrywingsleutel, krommes (boë) uit lynkodes, 'n beskrywingsleutel-lêer om tussen projekte te deel | Etikette wys die nommer, hoogte en beskrywing, of minder ([CivilCraft-instellings](topic:settings)); sleutels word in die projeklêer gehou |
| Eenheidsomskakeling | Skakel die lêer om voordat jy invoer; **Eenhede** verander net die etikette |

## Oppervlaktes

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Meer as een oppervlak uit punte gebou | Een projek per oppervlak |
| Versteek (binne-)grense | Gebruik **Langste buitekant** of 'n buitegrens |
| Kies of wysig een getekende breeklyn | {{key:Mod+Z}}, of {{ui:Verwyder getekende breeklyne}} en teken weer |
| Wysig 'n oppervlak wat uit LandXML gelees is (breeklyne, grens) | {{ui:Bou die oppervlak weer uit die punte}} |
| Wysig 'n oppervlak wat uit 'n hoogtenetwerk gemaak is | Voer die netwerk weer in met ander keuses |
| Omskakel 'n oppervlak wat uit LandXML gelees is wanneer die koördinaatstelsel verander | Eers {{ui:Bou die oppervlak weer uit die punte}} |
| Geëtiketteerde plekhoogtes en helling-waardes | Lees hulle in die statusbalk, of kleur die oppervlak volgens helling met **Hellingsanalise** in die Landskap-werkruimte ([Gelykmaking vir landskap](topic:landscape-grading#grading-checks)) |

## Belynings en lengteprofiele

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Spiraals behalwe klotoïde; 'n spiraal tussen twee krommes (saamgestelde oorgange) | Klotoïde-spiraals aan die punte van 'n kromme is beskikbaar; die ander word genoem en by LandXML-invoer oorgeslaan |
| 'n PI tussen twee ander invoeg | Teken die belyning weer, of tik PI-koördinate weer in |
| Belynings uit voorwerpe, afsette, verbredings | Teken met PI's |
| K tik vir 'n vertikale kromme | Tik L (K word gewys) |
| Sirkelvormige en ongelyke vertikale krommes | Net simmetriese parabolïese krommes |
| Meer as een ontwerplengteprofiel per belyning | Een belyning per variant |
| Zoem die profielaansig, profielbande onder die profiel | Die profielaansig pas die hele belyning; druk dit op [plan- en profielblaaie](topic:plan-profile-sheets) |
| Snitte in DWG of LandXML | Snitblaaie as PDF; {{ui:CSV}} van die oppervlaktes en volumes |
| Monsterlyne onder 'n hoek, of van verskillende breedtes langs die pad | Een breedte aan elke kant vir die hele belyning |

## Korridors

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Medians, versperrings en 'n superhoogte wat sjablone draai | Teken hulle as sjablone ([Korridorsjablone](topic:corridor-templates)); sjablone volgens stasie neem nog nie superhoogte nie |
| 'n Geleidelike oorgang tussen twee streke se sjablone (oorgange, taperings) | Verander die sjabloon by 'n stasie, of gee 'n punt 'n breedteteiken aan 'n lyn wat as die taper geteken is |
| Rotasie om 'n rand, superhoogte in LandXML | Superhoogte draai om die middellyn op sirkelvormige krommes; verbreed 'n baan met 'n breedteteiken na 'n kenmerklyn |
| Teikens vir die sykante (daglig na 'n lyn of 'n oppervlak), korridoroppervlaktes van hul eie | Teikens skuif die rande van plaveisel en skouers ([Korridors](topic:corridor)); die korridor word in die voorgestelde oppervlak gegradeer |
| Korridors uitgevoer as LandXML-paaie; 'n tweede korridor op 'n belyning in die IFC-uitvoer | Die voorgestelde oppervlak word uitgevoer |
| Terreinsjablone wat die voorgestelde oppervlak verander, in 3D of in die snitte | Hulle gee oppervlaktes en volumes van elke laag ([Terreinsjablone](topic:corridor-templates#terrain-templates)) |
| Swaaipaaie met spoed, bandglip, stuurtyd, stuurbare aanhangers of liggaamsspeling; 'n biblioteek van standaard ontwerpvoertuie; 'n swaaipad wat deur die voertuig te sleep geteken word | Lae-spoed swaaipaaie langs 'n kenmerklyn of 'n belyning, met jou eie voertuiggroottes ([Voertuig-swaaipaaie](topic:swept-paths)) |

## Gradering en volumes

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Banke, oop kenmerklyne wat in die ontwerp gegradeer word, gradering na 'n kenmerklyn van elders | Sluit die kenmerklyn ([Kenmerklyne](topic:feature-lines)), of gebruik dit as 'n breeklyn van die bestaande grond |
| Invoeg of verwydering van 'n kenmerklynhoekpunt | Teken die lyn weer, of maak 'n trapvormige afset daarvan |
| Boë in getekende breeklyne (deur opmetingspunte), spiraals in kenmerklyne | Teken 'n kenmerklyn met boë en gebruik dit as 'n breeklyn van die bestaande grond |
| Gradering tot 'n afstand, hoogte of 'n ander oppervlak | Daglig na bestaande grond alleen |
| Byvoeging of verwydering van 'n blad-hoek | Skrap die blad en teken dit weer |
| TIN-na-TIN (prisma-)volumes, kies van die roosselgrootte | Rastermetode, selgrootte vir jou gekies |
| Swel en krimp, teelaarde, plaveiseldieptes | Pas faktore self op die gerapporteerde getalle toe |
| Vrye-vervoer- en oorvervoerkoste, vervoer oor verskillende belynings, leenkuile en afvalterreine op die plan geplaas | Die massavervoerdiagram met balanspunte, volumes verskuif en gemiddelde vervoerafstande |

## Pypnetwerke

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Meer as een netwerk per projek | Aparte projekte vir storm en sanitêr |
| Waterhoofpype: waterkwaliteit en ouderdom, reëlgebaseerde beheer, ander klepsoorte (vloeibeheer, smoor, onderhou), pompe wat deur krag gegee word, aanvraag wat van druk afhang, 'n Darcy–Weisbach-opsie, 'n pypkatalogus met wanddiktes en drukklasse. Die res van druknetwerke is in die laboratorium: [Waterhoofpype](topic:water-mains) | Kontroleer dit in waterverspreidingsagteware; sanitêre ontwerpvloeie is in [Sanitêre ontwerpvloeie](topic:sanitary-design) |
| Rioolvloeie oor tyd (hidrograwe, dinamiese roetering, berging, pompe, oorlope) | [Sanitêre ontwerpvloeie](topic:sanitary-design) gee die bestendige piekvloei wat 'n ontwerpblad gebruik |
| Invoerkapasiteit, geutverspreiding, detensie-roetering, hidrograwe, energieverliese behalwe een aansluitingskoëffisiënt | Kontroleer hulle in ander sagteware; vloeie, groottes en die graadlyne is in [Stormdreinering](topic:storm-drainage) |
| Opvangareas in die PDF-plot, DWG, DXF of LandXML; opvangareas uit die oppervlak (waterskeidings) | Teken opvangareas met die hand; hulle word in die projeklêer gestoor |
| Pypkataloë, nie-ronde pype, strukture wat nie regop kaste of silinders is nie (keëls, trappe, bankies), 'n dreineringskategorie in die biblioteek | Struktuurtipes uit parameters ([Pypnetwerk](topic:pipe-network)); pype met 'n deursnee |
| Pype in die profielaansig, geboë pype | Lees binnepeile en dekking in die regterpaneel |

## Erwe

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Uitlê van erwe volgens oppervlakte of front, erwe uit die lyne rondom hulle, reg van weg | Teken elke erf volgens sy hoeke, of voer sy oproepe in |
| Kurwetabelle en lyntabelle op die plan; etikette wat met die hand verskuif is | Elke segment word langs homself geëtiketteer |
| Erwe in LandXML | Erwe word in die projeklêer gestoor en gaan na die PDF, DWG en DXF |

## Traverse

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Kleinste-kwadrate-aanpassing, die transitreël, weging van hoeke teen afstande | Die kompasreël |
| Afwykingshoeke, zenitale hoeke en skuinsafstande, hoogtes deur trigonometriese nivellering | Herlei na horisontale afstande en hoeke reg, of rigtings |
| Sykante, ruwe datalêers van dataversamelaars | Voer die punte in as 'n puntlêer |

## Afsteek

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Afsetpenne (verwysingspunte wat terug van die paal geplaas word), hellingpenne by die vangpunt | Steek af by die afsette wat jy nodig het, insluitend verby die skouer |
| Penne direk na 'n dataversamelaar se eie formaat stuur | Die CSV open in die kantoorsagteware van die meeste dataversamelaars |
| Pype, plato en erwe afsteek | Gebruik opmetingspunte naby 'n belyning, of die erf se segmente |

## Lêers en uitvoer

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Teks, arserings en maat uit DWG of DXF; papierruimte; gekoppelde tekeninge (xrefs); binêre DXF | Lynwerk uit modelruimte open ([Maak 'n DWG of DXF oop as lynwerk](topic:open-dwg-dxf)); open gekoppelde tekeninge op hul eie |
| Verskeie punte op een slag skuif deur te sleep | Knip en plak hulle, of wysig hulle een vir een |
| Staande blaaie, eie titelblokke, aansigpoorte wat jy rangskik, plan- en profielblaaie in DWG | Een liggende plan-blad per PDF, of plan- en profielblaaie langs 'n belyning (PDF) |
| Plot hoogtebande en profiele | Bande is net op die skerm; neem 'n skermkiekie as jy hulle nodig het |
| Verander laagname, kleure of etiketstyle | Verander hulle in 'n CAD-program na DXF-uitvoer |
| Wolkstoor en weergawe-geskiedenis | Stoor `.civilcraft.json`-lêers en hou rugsteun; om een projek saam te werk, gebruik 'n lewendige sessie in CadCraft Studio ([Ontwerp een terrein saam, lewendig](topic:work-live)) |
| CadCraft Studio vir iPad en iPhone, en vanaf Google Play | Gebruik CivilCraft in die blaaier op die toestel; op Android installeer CadCraft Studio vanaf sy APK op getcadcraft.com/download |
| Verskeie punt- of projeklêers op een slag oopmaak | Een lêer per oopmaak (GIS-lêers wat saamhoort, soos 'n shapefile se dele, open saam) |

## Landskap

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Vervaardigers se koppe en tuite | Generiese koppe, of voeg jou eie koppe by uit 'n lêer; vervaardigers se data kom in soos hulle toestemming gee |
| Maksimum sylengtes vir druppellyne, vloeie oor tyd, pompe, geslote pypnetwerke | Hou druppelloop by die vervaardiger se gepubliseerde lengte; die kontrole benodig 'n vertakkende netwerk |
| Die presiese omtrek van 'n konkawe vormvrye voorwerp; sy volume onder die grond presies gemeet | Die konvekse romp word gegradeer en die volume onder die grond is 'n skatting (word in Eienskappe gesê) |
| Plante in BimCraft se en ModelCraft se eie Plaas uit biblioteek | Voer landskap-IFC uit en open dit in BimCraft langs die gebou |
| Gedetailleerde plantmodelle (blare, takke, seisoene) in die 3D-aansig; vormvrye voorwerpe en besproeiing in die 3D-aansig | Plante wys in 3D as eenvoudige vorms wat volgens die plantlys bepaal word ([Bekyk die terrein in 3D](topic:site-3d)); ModelCraft se verspreiding maak plantbeelde |
| Hardeskapmure wat 'n gegradeerde vlak agter hulle op die oppervlak keer | Gee 'n platform of blad regte kante: dit is keermure op die oppervlak ([Gradering](topic:grading)) |
| SVG-transformasies in jou eie simbole; teksture en kleure van jou eie GLB-plantmodelle; saamgeperste GLB-geometrie | Plat transformasies eers in jou tekenprogram; modelle word in die plant se kleur geteken; voer die GLB sonder kompressie uit ([Plantgrafika](topic:plant-graphics)) |
| Jou eie plantlys wat in jou Biblioteekrekening gehou word (in die app geredigeer) | Wysig die projek se eie lys in die Plant-tabel en stoor dit as 'n plantlêer |
| Die landskap-gereedskap vir assistente sonder die venster (die lêerbediener en die opdraglyn) | Hulle werk met die CivilCraft-venster oop ([Laat 'n KI-assistent met jou terrein werk](topic:assistants)) |

## Kragleidings

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Land se standaard ingebou (lasgevalle, spelings, faktore) | Stel jou standaard se waardes in {{ui:Lasgevalle en perke…}} en stoor hulle, saam met jou biblioteek, as 'n pakket om te hergebruik en te deel ([Pakkette](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Die sywaartse afstand van 'n geleier tot 'n boomkroon of 'n muur langs die lyn | Die vertikale speling bo plante en mure wat die lyn kruis ([Kragleiding-kontroles](topic:power-line-checks#clearances)) |
| Geleierkruip en die rek van 'n nuwe geleier | Laat dit toe deur die temperature in die uitspanningstabel |
| Termiese graderings van begrawe kabels (stroomgradering uit hoe hulle gelê is) | Voer jou verskaffer se stroomgradering op die kabelitem in |
| Kortsluiting-, beskermings- en aardingstudies | Gebruik 'n toegewyde elektriese program; CivilCraft gee die netwerk se lengtes en kabels |
| Vakwerk-torings wat lid-vir-lid ontwerp is, en spanankers in die grond | Steune word volgens hul nominale las gekontroleer; spanne volgens hul gegradeerde las |
| 'n `.DON`-studielêer wat in die program wat dit lees, gekontroleer word | Kontroleer die lêer daar; stuur vir ons 'n monster sodat ons teen 'n regte een kan toets |
| Kragleidings in die 3D-aansig en in IFC | Die plan, die lynprofiel, die blaaie en die GIS-lae |
| Die kragleiding-gereedskap vir assistente sonder die venster | Hulle werk met die CivilCraft-venster oop ([Laat 'n KI-assistent met jou terrein werk](topic:assistants)) |

## Boumassas

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Biblioteek van soneringskodes of enige stad se reëls | Tik die perke uit jou eie verordening in ([Soneringsperke](topic:zoning-limits)) |
| Hemellig op die mure (gewelddaglig), wind | [Sonuur](topic:sun-hours) tel slegs direkte son |
| Skadu van bome, plante of enigiets wat nie as 'n massa geteken is nie | Teken buurgeboue as massas |
| Dakvorms op massas | Plat-bo massas |
| Openings, dakke en muurtipes wanneer 'n massa in BimCraft ontwikkel word | BimCraft bou gewone buitemure op elke vlak en 'n vloer; voeg die res daar by |

## GIS en koördinaatstelsels

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| File Geodatabase; KML-styl, ikone, grondoorlegsels en netwerkskakels | Omskep eers na GeoPackage, shapefile of GeoJSON; KML-merkers word sonder hul style gelees |
| Wysig GIS-kenmerke of hul eienskappe | Wysig hulle in 'n GIS-program en voer weer in. Die Analiseer-paneel maak nuwe lae (buffer, oorlegging, koppeling, seleksie) en voeg oppervlakte- en lengtevelde by, maar dit wysig nie 'n kenmerk op sy plek nie |
| Netwerk- en rasteranalise, buffers met plat of vierkantige punte en eenkantige buffers, byvoeg of skrap van rye en verander 'n veld se tipe in die eienskapstabel, handmatige klaskleure, 'n styllegende in plotte | Gebruik Kies om kenmerke te kies en 'n laag daarvan te maak; plat punte word nie aangebied nie. Kleur volgens eienskap en die eienskapstabel is gebou: sien [Styl 'n laag volgens 'n eienskap](topic:gis-symbology) en [Werk met 'n laag se eienskapstabel](topic:gis-table) |
| Etiketstyle (grootte, plasing) en etikette wat mekaar vermy | Etikette is een grootte en kan oorvleuel waar kenmerke dig is |
| Vertikale datums en geoïde-modelle | Hoogtes word gebruik soos die lêer dit gee; kontroleer die vertikale datum self |
| Rasterverskuiwings behalwe na NAD83 vanaf NAD27 wat volgens gebied voorgestel word (OSTN15; NTv2 vir ander datums werk wanneer jy die lêer byvoeg), verskeie rasters op een slag, vertikale rasters | Voeg die rasterlêer vir jou datum self by; een raster per projek |
| Kaartlae in die DXF of in 3D-uitvoere | Kaartlae gaan in die PDF-plot, en langs die DWG as 'n prent |
| Kaartbedieners wat 'n aanmelding, sleutel of token vereis | Gebruik openbare dienste, of 'n georefereerde beeldlêer |
| Skryf van LAS- of LAZ-lêers uit 'n oppervlak, die grondmodel of die hoogtenetwerk- en LiDAR-gereedskap | Voer oppervlaktes uit as 'n GeoTIFF-hoogtenetwerk. Die [Puntewolke](topic:point-clouds)-byvoeging skryf 'n skoongemaakte wolk as LAS 1.4 of LAZ |
| LiDAR-intensiteit, kleur en terugkeer; hoogtenetwerke met verskeie bande; raster- of LiDAR-lêers groter as 200 MB | LiDAR word net volgens klas gefiltreer, rasters gebruik hul eerste band; sny groot lêers eers in teëls |

## Invoer

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Kassie-seleksie per aanraking (dit benodig {{key:Shift}}) | Druk lank op elke opmetingspunt om dit by te voeg |
| Getikte koördinate of afstande terwyl jy teken | Teken ruwweg, tik dan presiese PI-koördinate in die belyning se PI-tabel |
| Tik koördinate vir blad-hoeke en strukture | Sleep hulle se handvatsels; zoem in vir presisie en hou E en N in die statusbalk dop |
| Vasmaak aan voorwerpe (behalwe opmetingspunte vir breeklyne) | Zoem in en hou die statusbalk dop |

## 3D-aansig

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Teken of wysig in die 3D-aansig | Teken en wysig in die plan; die 3D-aansig volg elke wysiging |
| Korridor-kenmerklyne of GIS-kenmerke kies deur in 3D te klik | Klik hulle in die plan |
| Uitvoer van die oordrewe aansig of in voet | Uitvoere is ware skaal in meter; sien [Voer die terrein in 3D uit](topic:export-3d) |
| Etikette in GLB- of OBJ-uitvoere, etiketgroottes en -style in 3D | Etikette wys net in die 3D-aansig, een grootte; sien [Bekyk die terrein in 3D](topic:site-3d) |
| Teksture uit foto's, 'n rit as video opneem, skaduwees van buite die terrein, sonure in die 3D-aansig | Kaartlae oor die oppervlaktes gedrapeer; ry deur en die son se posisie op een tyd; [sonuur](topic:sun-hours) vir 'n dag of 'n seisoen op die plan |
