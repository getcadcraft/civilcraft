---
title: Nog nie gebou nie
summary: Wat hierdie weergawe van CivilCraft nog nie doen nie, en wat jy vandag in die plek moet doen.
keywords: ontbreek, beperkings, padkaart, nie beskikbaar nie, spiraals, verbreding, dwg, dxf, inlate, opvanging, dwarssnitte, later beskikbaar, limiete
from: b91588d4
---

CivilCraft is nog vroeg. Hierdie bladsy lys wat die huidige bou nie doen nie, sodat jy nie daarvoor soek nie. Niks hier word vir 'n datum belowe nie.

## Punte

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Tweede puntlêer by die eerste voeg | Voeg die lêers eers in 'n teksredigeerder of sigbladprogram saam |
| 'n Puntteksslêer uitvoer | Voer LandXML uit (punte gaan as CgPoints), gebruik GIS {{ui:Uitvoer}} (punte met P-, N-, E-, Z- en D-velde), of {{ui:Kopieer}} die punte na 'n sigbladprogram |
| Puntetikketstyle, simbole per beskrywingsleutel, kurwes (boë) uit lynkodes, 'n beskrywingsleutellêer om tussen projekte te deel | Etikette wys die nommer, elevasie en beskrywing, of minder ([CivilCraft-instellings](topic:settings)); sleutels word in die projeklêer behou |
| Eenheidsomskakeling | Skakel die lêer om voor invoer; **Eenhede** verander net die etikette |

## Oppervlaktes

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Meer as een oppervlak wat uit punte gebou is | Een projek per oppervlak |
| Verberg (binne-)grense | Gebruik **Langste buitekant** of 'n buitegrens |
| Kies of wysig een getekende breeklyn | {{key:Mod+Z}}, of {{ui:Verwyder getekende breeklyne}} en teken weer |
| Wysig 'n oppervlak wat uit LandXML gelees is (breeklyne, grens) | {{ui:Bou die oppervlak weer uit die punte}} |
| Wysig 'n oppervlak wat uit 'n elevasierooster gemaak is | Voer die rooster weer in met ander keuses |
| Omskakel 'n oppervlak wat uit LandXML gelees is wanneer die koördinaatstelsel verander | Eers {{ui:Bou die oppervlak weer uit die punte}} |
| Gemerkte puntelevasies en hellingwaardes | Lees hulle in die statusbalk, of kleur die oppervlak volgens helling met **Hellingontleding** in die Landskap-werkruimte ([Gradering vir landskap](topic:landscape-grading#grading-checks)) |

## Belynings en profiele

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Spiraals behalwe klotoïde; 'n spiraal tussen twee krommes (saamgestelde oorgange) | Klotoïdespiraals aan die einde van 'n kromme is beskikbaar; die ander word benoem en oorgeslaan by LandXML-invoer |
| 'n PI tussen twee ander invoeg | Teken die belyning weer, of tik PI-koördinate weer in |
| Belynings uit voorwerpe, afsettings, verbredings | Teken met PI's |
| K vir 'n vertikale kromme intik | Tik L (K word gewys) |
| Sirkelvormige en asimmetriese vertikale krommes | Net simmetriese parabolies vertikale krommes |
| Meer as een ontwerpprofiel per belyning | Een belyning per variant |
| Zoem die profielaansig, profielbande onder die profiel | Die profielaansig pas die hele belyning; plot dit op [plan- en profielblaaie](topic:plan-profile-sheets) |
| Snitte in DWG of LandXML | Snitblaaie as PDF; {{ui:CSV}} van die areas en volumes |
| Monsterlyne teen 'n hoek, of van verskillende breedtes langs die pad | Een breedte aan elke kant vir die hele belyning |

## Koridors

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Middelstrepe, versperrings en 'n superhoogte wat sjablone draai | Teken hulle as sjablone ([Koridorsjablone](topic:corridor-templates)); sjablone volgens stasie neem nog nie superhoogte aan nie |
| 'n Geleidelike verandering tussen twee streke se sjablone (oorgange, taps) | Verander die sjablone by 'n stasie, of gee 'n punt 'n breedtedoel na 'n lyn wat as die taps geteken is |
| Rotasie om 'n rand, superhoogte in LandXML | Superhoogte draai om die middellyn op sirkelkrommes; verbreed 'n rybaan met 'n breedtedoel na 'n kenmerklyn |
| Doele vir die kanthellings (daglyn na 'n lyn of 'n oppervlak), eie koridoroppervlaktes | Doele skuif die plaveiselrande en skouers ([Koridors](topic:corridor)); die koridor word in die voorgestelde oppervlak gegradeer |
| Kerbafdraaiings, draaibane en eilande wat in 'n aansluiting gegradeer word; 'n syweg se einde wat op 'n skeef na die hoofpad se rand gesny word; 'n paadjie wat in die plan by 'n pad se lengte en oppervlakte verbind word | Paaie wat ontmoet word, reghoekig verbind, met die hoofpad se rand oop en die syweg daarheen afgewerk ([Waar paaie ontmoet](topic:corridor#where-roads-meet-roads-pads-and-paths)); 'n paadjie stop by die pad se rand in die voorgestelde oppervlak en in 3D |
| Koridors uitgevoer as LandXML-paaie; 'n tweede koridor op 'n belyning in die IFC-uitvoer | Die voorgestelde oppervlak word uitgevoer |
| Terreinsjablone wat die voorgestelde oppervlak verander, in 3D of in die snitte | Hulle gee areas en volumes van elke laag ([Terreinsjablone](topic:corridor-templates#terrain-templates)) |
| Veegpaaie met spoed, bandglip, stuurtyd, stuuraanhangers of liggaamsruimte; 'n biblioteek van standaard ontwerpvoertuie; 'n veegpad wat deur die voertuig te sleep geteken word | Lae-spoed veegpaaie langs 'n kenmerklyn of 'n belyning, met jou eie voertuigafmetings ([Veegpaaie van voertuie](topic:swept-paths)) |

## Gradering en volumes

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Banke, oop kenmerklyne wat in die ontwerp gegradeer word, gradering na 'n kenmerklyn van elders | Sluit die kenmerklyn ([Kenmerklyne](topic:feature-lines)), of gebruik dit as 'n breeklyn van die bestaande grond |
| 'n Kenmerklynhoek invoeg of verwyder | Teken die lyn weer, of maak 'n getrapte afset daarvan |
| Boë in getekende breeklyne (deur opmetingspunte), spiraals in kenmerklyne | Teken 'n kenmerklyn met boë en gebruik dit as 'n breeklyn van die bestaande grond |
| Gradering na 'n afstand, elevasie of 'n ander oppervlak | Daglig tot bestaande grond alleen |
| 'n Platformhoek byvoeg of verwyder | Vee die platform uit en teken dit weer |
| TIN-na-TIN- (prisma-)volumes, die kies van die roosterselgrootte | Roostermetode, selgrootte vir jou gekies |
| Swel en krimp, bogrond, plaveiseldieptes | Pas faktore self op die gerapporteerde getalle toe |
| Vrye vervoer- en oorhalekoste, vervoer oor verskillende belynings, leengate en afvalterreine wat op die plan geplaas word | Die massavervoerdiagram met balanspunte, volumes verskuif en gemiddelde vervoerafstande |

## Pypnetwerke

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Meer as een netwerk per projek | Aparte projekte vir storm en sanitêr |
| Waterhoofpype: waterkwaliteit en ouderdom, reëlgebaseerde beheer, ander klepsoorte (vloeibeheer, smoor, onderhoud), pompe gegee deur krag, vraag wat van druk afhang, 'n Darcy–Weisbach-opsie, 'n pypkatalogus met muurdikte en drukklasse. Die res van druknetwerke is in die laboratorium: [Waterhoofpype](topic:water-mains) | Kontroleer dit in waterverspreidingsagteware; sanitêre ontwerpvloeie is in [Sanitêre ontwerpvloeie](topic:sanitary-design) |
| Riooivloeie oor tyd (hidrograwe, dinamiese roetering, berging, pompe, oorlope) | [Sanitêre ontwerpvloeie](topic:sanitary-design) gee die bestendige piekvloei wat 'n ontwerpblad gebruik |
| Inlaatkapasiteit, gootspreiding, opvangroetering, hidrograwe, energieverliese behalwe een aansluitingskoëffisiënt | Kontroleer dit in ander sagteware; vloeie, groottes en die gradelyne is in [Stormdreinering](topic:storm-drainage) |
| Opvangareas in die PDF-plot, DWG, DXF of LandXML; opvangareas uit die oppervlak (waterskeidings) | Teken opvangareas met die hand; hulle word in die projeklêer gestoor |
| Pypkatalogusse, nie-ronde pype, strukture wat nie regop bokse of silinders is nie (keëls, trappe, banke), 'n dreineringskategorie in die biblioteek | Struktuurtipes uit parameters ([Pypnetwerk](topic:pipe-network)); pype met 'n deursnee |
| Pype in die profielaansig, geboë pype | Lees invertpeile en dekking in die regterpaneel |

## Erwe

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Erwe uitlê volgens oppervlakte of straatfront, erwe uit die lyne rondom hulle, serwitute | Teken elke erf by sy hoeke, of tik sy lyne in |
| Kromme-tabelle en lyntabelle op die plan; etikette met die hand verskuif | Elke kursus word langs homself geëtiketteer |
| Erwe in LandXML | Erwe word in die projeklêer gestoor en gaan na die PDF, DWG en DXF |

## Poligone

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Kleinstekwadrate-aanpassing, die transitreël, gewigte van hoeke teen afstande | Die kompasreël |
| Afbuighoeke, zenithoeke en skuinsafstande, elevasies deur trigonometriese nivellering | Herlei na horisontale afstande en hoeke reg, of rigtings |
| Sybeskietings, rou dataleêr van dataversamelaars | Voer die punte in as 'n puntlêer |

## Afsteek

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Afsetpale (verwysingspunte agter die paal), hellingpale by die vangpunt | Pen die afsettings uit wat jy nodig het, insluitend verby die skouer |
| Pale direk na 'n dataversamelaar se eie formaat stuur | Die CSV open in die kantoorsagteware van die meeste dataversamelaars |
| Pype, platforms en erwe uitpaal | Gebruik opmetingspunte naby 'n belyning, of die erf se lyne |

## Lêers en uitvoer

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Teks, arseringe en maatvoering uit DWG of DXF; papierruimte; gekoppelde tekeninge (xrefs); binêre DXF | Lynwerk uit modelruimte oopmaak ([Maak 'n DWG of DXF oop as lynwerk](topic:open-dwg-dxf)); maak gekoppelde tekeninge op hul eie oop |
| Verskeie punte op een keer deur te sleep skuif | Knip en plak hulle, of wysig hulle een vir een |
| Staanblaaie, jou eie titelblokke, aansigvensters wat jy rangskik, plan- en profielblaaie in DWG | Een liggende planblad per PDF, of plan- en profielblaaie langs 'n belyning (PDF) |
| Elevasiebande en profiele plot | Bande is net op die skerm; neem 'n skermkiekie as jy hulle nodig het |
| Laagname, kleure of etiketstyle verander | Verander hulle in 'n CAD-program ná DXF-uitvoer |
| Wolkberging en weergawegeskiedenis | Stoor `.civilcraft.json`-lêers en hou rugsteun; om saam aan een projek te werk, gebruik 'n lewendige sessie in CadCraft Studio ([Ontwerp een terrein saam, lewendig](topic:work-live)) |
| CadCraft Studio vir iPad en iPhone, en van Google Play | Gebruik CivilCraft in die blaaier op die toestel; op Android installeer CadCraft Studio van sy APK op getcadcraft.com/download |
| Verskeie punt- of projeklêers op een keer oopmaak | Een lêer per keer oop (GIS-lêers wat saam hoort, soos 'n shapefile se dele, maak saam oop) |

## Landskap

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Vervaardigers se koppe en spuiers | Generiese koppe, of voeg jou eie koppe uit 'n lêer by; vervaardigers se data kom in soos hulle toestemming gee |
| Maksimum syleidinglengtes vir druppellyne, vloeie oor tyd, pompe, geslote pypnetwerke | Hou druppelloopes by die vervaardiger se gepubliseerde lengte; die kontrole benodig 'n vertakkende netwerk |
| Die presiese omtrek van 'n konkawe vryevormvoorwerp; sy volume onder die grond presies gemeet | Die konvekse romp word gegradeer en die volume onder die grond is 'n skatting (gesê in Eienskappe) |
| Plante in BimCraft en ModelCraft se eie Plaas uit biblioteek | Voer landskap-IFC uit en open dit in BimCraft langs die gebou |
| Gedetailleerde plantmodelle (blare, takke, seisoene) in die 3D-aansig; vryevormvoorwerpe en besproeiing in die 3D-aansig | Plante wys in 3D as eenvoudige vorms wat uit die plantlys bepaal word ([Kyk na die terrein in 3D](topic:site-3d)); ModelCraft se verspreiding maak plantprente |
| Verhardingsmure wat 'n gegradeerde peil agter hulle op die oppervlak keer | Gee 'n platform of 'n plat vertikale sye: hulle is keermure op die oppervlak ([Gradering](topic:grading)) |
| SVG-transformasies in jou eie simbole; teksture en kleure van jou eie GLB-plantmodelle; saamgeperste GLB-geometrie | Plat die transformasies eers in jou tekenprogram; modelle word in die plant se kleur geteken; voer die GLB sonder kompressie uit ([Plantgrafika](topic:plant-graphics)) |
| Jou eie plantlys in jou Biblioteekrekening gehou (in die program geredigeer) | Wysig die projek se eie lys in die Plantetabel en stoor dit as 'n plantelêer |
| Die landskapgereedskap vir assistente sonder die venster (die lêerbediener en die opdragreël) | Hulle werk met die CivilCraft-venster oop ([Laat 'n KI-assistent met jou terrein werk](topic:assistants)) |

## Kraglyne

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Land se standaard ingebou (lasgevalle, vryruimtes, faktore) | Stel jou standaard se waardes in {{ui:Lasgevalle en perke…}} en stoor hulle, saam met jou biblioteek, as 'n pakket om te hergebruik en te deel ([Pakkette](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Die sydelingse afstand van 'n geleier na 'n boomkroon of 'n muur langs die lyn | Die vertikale vryruimte reguit op, oor plante en mure wat die lyn kruis ([Kragliinkontroles](topic:power-line-checks#clearances)) |
| Geleierkruip en die rek van 'n nuwe geleier | Laat daarvoor toe deur die temperature in die spantabel |
| Termiese graderinge van begrawe kabels (stroomgradering uit hoe hulle gelê is) | Tik jou verskaffer se stroomgradering op die kabelitem in |
| Kortsluit-, beskerming- en aardingstudies | Gebruik 'n toegewyde elektriese program; CivilCraft gee die netwerk se lengtes en kabels |
| Traliemaste wat lid vir lid ontwerp is, en spanankers in die grond | Maste word met hul nominale las nagegaan; spanne deur hul gegradeerde las |
| 'n `.DON`-studielêer wat in die program nagegaan word wat dit lees | Kontroleer die lêer daar; stuur vir ons 'n voorbeeld sodat ons teen 'n werklike een kan toets |
| Kraglyne in die 3D-aansig en in IFC | Die plan, die lynprofiel, die blaaie en GIS-lae |
| Die kraglyngereedskap vir assistente sonder die venster | Hulle werk met die CivilCraft-venster oop ([Laat 'n KI-assistent met jou terrein werk](topic:assistants)) |

## Geboumassas

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| 'n Biblioteek van soneringskodes of enige stad se reëls | Tik die limiete uit jou eie verordening in ([Soneringslimiete](topic:zoning-limits)) |
| Hemellig op die mure (gewelddaglig), wind | [Sonure](topic:sun-hours) tel net direkte son |
| Skadu van bome, plante of enigiets wat nie as 'n massa geteken is nie | Teken buurgeboue as massas |
| Dakvorms op massas | Plat-bo massas |
| Openinge, dakke en muurtipes wanneer 'n massa in BimCraft ontwikkel word | BimCraft bou eenvoudige buitemure op elke vlak en 'n vloer; voeg die res daar by |

## GIS en koördinaatstelsels

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Lêergeodatabasis; KML-style, ikone, grondoorlegsels en netwerkskakels | Skakel eers om na GeoPackage, shapefile of GeoJSON; KML-merkers word sonder hul style gelees |
| GIS-kenmerke of hul eienskappe wysig | Wysig hulle in 'n GIS-program en voer weer in. Die Ontleed-paneel maak nuwe lae (buffer, oorlegging, samevoeging, seleksie) en voeg oppervlakte- en lengtevelde by, maar dit wysig nie 'n kenmerk op sy plek nie |
| Netwerk- en rasterontleding, buffers met plat of vierkantige eindes en eenkantige buffers, rye byvoeg of verwyder en 'n veld se tipe in die eienskapstabel verander, handmatige klaskleure, 'n stylverklaring in plotte | Gebruik Kies om kenmerke te kies en 'n laag daaruit te maak; plat eindes word nie aangebied nie. Kleur volgens eienskap en die eienskapstabel is gebou: sien [Gee 'n laag styl volgens 'n eienskap](topic:gis-symbology) en [Werk met 'n laag se eienskapstabel](topic:gis-table) |
| Etiketstyle (grootte, plasing) en etikette wat mekaar vermy | Etikette is een grootte en kan oorvleuel waar kenmerke dig is |
| Vertikale datums en geoïedmodelle | Elevasies word gebruik soos die lêer dit gee; kontroleer die vertikale datum self |
| Rooster-verskuiwings behalwe na NAD83 vanaf NAD27 wat volgens gebied voorgestel word (OSTN15, NTv2 vir ander datums werk wanneer jy die lêer byvoeg), verskeie roosters op een keer, vertikale roosters | Voeg die roosterlêer vir jou datum self by; een rooster per projek |
| Kaartlae in die DXF of in 3D-uitvoere | Kaartlae gaan in die PDF-plot, en langs die DWG as 'n prent |
| Kaartbedieners wat 'n aanmelding, sleutel of token benodig | Gebruik openbare dienste, of 'n gegeoreferde beeldlêer |
| LAS- of LAZ-lêers uit 'n oppervlak, die grondmodel of die elevasierooster- en LiDAR-gereedskap skryf | Voer oppervlaktes uit as 'n GeoTIFF-elevasierooster. Die [Puntwolke](topic:point-clouds)-byvoeging skryf 'n skoongemaakte wolk as LAS 1.4 of LAZ |
| LiDAR-intensiteit, kleur en terugkere; elevasieroosters met verskeie bande; rooster- of LiDAR-lêers groter as 200 MB | LiDAR word net volgens klas gefiltreer, roosters gebruik hul eerste band; sny groot lêers eers in teëls |

## Invoer

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Kassie-seleksie met aanraking (dit benodig {{key:Shift}}) | Druk lank op elke opmetingspunt om dit by te voeg |
| Getikte koördinate of afstande terwyl jy teken | Teken ruweg, en tik dan presiese PI-koördinate in die belyning se PI-tabel |
| Koördinate vir platformhoeke en strukture intik | Sleep hulle handvatsels; zoem in vir presisie en hou E en N in die statusbalk dop |
| Vasvang aan voorwerpe (behalwe opmetingspunte vir breeklyne) | Zoem in en hou die statusbalk dop |

## 3D-aansig

| Nog nie gebou nie | In plaas daarvan, vandag |
|---|---|
| Teken of wysig in die 3D-aansig | Teken en wysig in die plan; die 3D-aansig volg elke wysiging |
| Koridorkenmerklyne of GIS-kenmerke kies deur in 3D te klik | Klik hulle in die plan |
| Die oordrewe aansig of in voet uitvoer | Uitvoere is ware skaal in meter; sien [Voer die terrein in 3D uit](topic:export-3d) |
| Etikette in GLB- of OBJ-uitvoere, etiketgroottes en -style in 3D | Etikette wys net in die 3D-aansig, een grootte; sien [Kyk na die terrein in 3D](topic:site-3d) |
| Teksture uit foto's, 'n rit as video opneem, skadu's van buite die terrein, sonure in die 3D-aansig | Kaartlae oor die oppervlaktes gelê; ry en die son se posisie op een tyd; [sonure](topic:sun-hours) vir 'n dag of 'n seisoen op die plan |
