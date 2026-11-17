---
title: Stel die projek se koördinaatstelsel
summary: Sê in watter koördinaatstelsel die opmeting is, sodat CivilCraft breedte- en lengtegraad wys, GIS-lêers en kaartlae plaas, en .prj-lêers skryf. Kies volgens kode, naam, die koördinate self of uit 'n .prj-lêer.
keywords: koördinaatstelsel, crs, epsg, srid, staatsvlak, spcs, utm, nad83, wgs 84, projeksie, prj, wkt, datum, breedtegraad, lengtegraad, lat long, geografies, rooster, georefereer, georeferensie, koördinaatstelsel toewys
from: 964250e2
---

'n Projek se koördinate is gewone getalle totdat jy sê wat hulle beteken. Die koördinaatstelsel in te stel **skuif nooit iets nie**: dit vertel CivilCraft byvoorbeeld dat E 6,150,000 N 2,080,000 Kalifornië-sone 6 staatsvlakkoördinate in US survey feet is. Sodra dit dit weet:

- wys die statusbalk die breedte- en lengtegraad van die wyser,
- word GIS-lêers in ander stelsels (shapefiles, GeoJSON, GeoPackage, hoogterooster en LiDAR) by oopmaak na die projek omgeskakel,
- kan kaartlae onder die plan geteken word ([Wys kaartlae onder die plan](topic:map-layers)),
- dra uitvoer na GIS-formate die stelsel (`.prj` vir shapefiles, die EPSG-kode vir GeoPackage en GeoTIFF).

## Kies die stelsel

1. Kies {{ui:Koördinate}} in die {{ui:GIS}}-groep van die nutsbalk. Die **Koördinaatstelsel**-dialoog maak oop. Bo-aan sê dit waarin die projek nou is, of **Geen — koördinate is net getalle**.
2. Vind die stelsel op een van hierdie maniere:
   - **Soek**: tik die EPSG-kode (`2277`, `EPSG:2277`) of woorde uit die naam (`texas central`, `utm 14n`, `lambert-93`). Kodes lys vanaf dié wat jy getik het; woorde lys stelsels wie se naam elke woord bevat.
   - {{ui:Stelsels waarby hierdie koördinate pas}} (wanneer die projek punte of 'n oppervlak het): CivilCraft lees die middel van jou projek in elke stelsel van die projek se eenheidsfamilie en lys dié wie se gebied van gebruik dit bevat. Staatsvlakkoördinate pas gewoonlik net in 'n paar sones: 'n projek in Texas by E 3,115,000 N 10,070,000 US survey feet pas by die vier Texas Central-variante (NAD83, NAD83(2011), HARN, NSRS2007). Elke inskrywing wys waar jou projek se middel sou wees.
   - **Naby (breedte, lengte)** en {{ui:Stel voor}}: tik waar die terrein is, byvoorbeeld `30.27, -97.74` of `30°16′N 97°44′W`, en CivilCraft lys die geprojekteerde stelsels wie se gebied dit bevat, nasionale en staatsroosters eerste.
   - {{ui:Lees 'n .prj-lêer…}}: maak die `.prj` oop wat by 'n shapefile of 'n tekening gekom het. CivilCraft pas dit by sy lys aan volgens die projeksiewiskunde (so 'n `.prj` wat 'n datum anders noem, vind steeds die regte stelsel) en sê watter een dit is; as niks presies pas nie, word die lêer se eie beskrywing gebruik. Jy kan ook 'n `.prj` op die dialoog sleep, of een op die plan alleen oopmaak of sleep.
3. Klik 'n stelsel in die lys. Onder **Gekies** wys dit die naam, EPSG-kode, eenheid, hoe goed sy datum aan WGS 84 vasgemaak is, sy gebied van gebruik in breedte- en lengtegraad, en waar jou projek se middel daarin val.
4. Laat **Rooster** gekies (die meeste projekte; sien [Grond- en plaaslike koördinate](topic:ground-and-local-coordinates) vir die ander) en kies {{ui:Pas toe}}.

Die statusbalk wys nou die wyser se breedte- en lengtegraad langs E en N. Die stelsel instel is een ontdoenstap: {{key:Mod+Z}} neem dit terug.

:::note
Die eenhede moet ooreenstem: 'n projek in feet neem stelsels in US survey feet of international feet, 'n projek in meter neem stelsels in meter. CivilCraft verduidelik 'n weiering ("The project is in feet but this system is in meters…"). 'n Voetprojek met 'n US survey foot-stelsel gebruik survey feet: die projek se "ft" beteken die stelsel se voet. Geografiese stelsels (breedte- en lengtegraad, soos WGS 84 self) kan nie 'n projek se stelsel wees nie: tekeninge het oos- en noordkoördinate nodig.
:::

## Verander of verwyder die stelsel

Maak {{ui:Koördinate}} weer oop, kies 'n ander stelsel en kies {{ui:Pas toe}}. Wanneer die projek punte of 'n ontwerp het, vra CivilCraft **Is die koördinate al in …?**

- {{ui:Ja — niks skuif nie}}: die getalle bly soos hulle is en net hul betekenis verander. Gebruik dit wanneer die ou stelsel per ongeluk gekies is.
- {{ui:Nee — skakel hulle om}}: elke opmetingspunt, breeklyn, grens, belyning-PI, plataformhoek en struktuur word van die ou stelsel na die nuwe omgeskakel, in een ontdoenstap. 'n Oppervlak wat as driehoeke uit LandXML gelees is, kan nie omgeskakel word nie; bou dit eers weer uit die punte.

{{ui:Verwyder die stelsel}} haal die stelsel weg (niks skuif nie). GIS-lae wat reeds in die projek is, bly waar hulle is.

## Breedte- en lengtegraad in die statusbalk

Solank die projek 'n stelsel het, wys die statusbalk die wyser se breedte- en lengtegraad op WGS 84, byvoorbeeld `30°18′00.00″ N  97°42′00.00″ W`. Kies desimale grade in plaas daarvan onder {{ui:Instellings}}, {{ui:CivilCraft}}, **Breedte- en lengtegraad** ([CivilCraft-instellings](topic:settings)). Met grond- of plaaslike koördinate gaan die aflesing eers deur daardie stap, so dit is korrek vir die punt onder die wyser.

## Hoe goed die datumverskuiwing is

Breedte-, lengtegraad, GeoJSON en kaartlae is almal op WGS 84. Elke stelsel se binding aan WGS 84 word in die dialoog gewys:

| Wat die dialoog sê | Wat dit beteken |
|---|---|
| WGS 84 self | Geen verskuiwing hoegenaamd nie. |
| NAD83 word as WGS 84 geneem | Die twee verskil met een of twee meter in die grootste deel van Noord-Amerika, hoogstens 'n paar meter. Goed vir kaartlae en terreinkonteks; nie vir opmetingsbeheer nie. |
| Bekend tot ongeveer *n* m (EPSG se syfer) | 'n Gepubliseerde verskuiwing; kaartlae en GeoJSON kan met ongeveer dit af wees. |
| Nie bekend vir hierdie datum nie | Daar is geen gepubliseerde verskuiwing sonder 'n roosterlêer nie: kaartlae en GeoJSON kan met honderde meters af wees. |
| Uit die roosterverskuiwingslêer … | 'n Roosterverskuiwingslêer word gebruik (hieronder): binne ongeveer 10 cm van NAD83 binne die rooster. |

Jou projek se eie koördinate gaan nooit deur 'n datumverskuiwing nie: net wat na of van breedte- en lengtegraad omgeskakel word, doen dit. Vertikale datums en geoïdemodelle word nie hanteer nie (hoogtes word nooit omgeskakel nie). Waar die beste verskuiwing 'n roosterlêer nodig het, dra die lys 'n growwer gepubliseerde verskuiwing, en die dialoog wys die akkuraatheid daarvan (NAD27-stelsels, byvoorbeeld, ongeveer 20 m), totdat jy die rooster byvoeg.

## Roosterverskuiwingslêers

Vir 'n NAD27-stelsel plaas **Roosterverskuiwingslêer** in die koördinaatstelsel-dialoog breedte- en lengtegraad, GIS-lêers en kaartlae binne ongeveer 10 cm van NAD83 in plaas van ongeveer 20 m:

- **Laai af** die rooster wat dit vir die stelsel se gebied voorstel (NADCON5 vir die aaneenlopende Verenigde State, NADCON vir Alaska, NTv2 vir Kanada) vanaf cdn.proj.org, PROJ se openbare roosterbediener. Net die rooster se lêernaam word gestuur.
- Of **Voeg 'n roosterlêer by…** wat jy reeds het: NTv2 (`.gsb`) of 'n PROJ GeoTIFF-rooster (`.tif`), tot 20 MB.

Die rooster word in die projeklêer gestoor, so dit reis saam met die projek. Die afdeling sê of die projek se middel binne die rooster is: buite dit word geen verskuiwing toegepas nie, so gebruik 'n rooster wat die terrein dek. **Hou op om die rooster te gebruik** gaan terug na die growwe verskuiwing. Elke verandering is een stap: {{key:Mod+Z}} ontdoen dit.

GIS-lae wat reeds in die projek is, bly waar hulle is wanneer die rooster verander; voer hulle weer in om hulle deur die rooster te plaas. Die projek se eie koördinate skuif nooit nie.

## Wat nagegaan is

- Elke omskakeling is vergelyk met PROJ (pyproj 3.7.1 met PROJ 9.5.1), die koördinaatbiblioteek wat die meeste GIS-programme gebruik, op meer as 330 stelsels: staatsvlak in US survey feet en feet, UTM noord en suid, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator en webmerkator, onder andere. Oos- en noordkoördinate stem tot op 1 cm ooreen met dieselfde datumverskuiwing (meeste tot ver onder 1 mm), en die projeksiewiskunde stem tot op 1 cm ooreen met PROJ se eie definisies.
- `.prj`-lêers wat deur PROJ in albei algemene vorms geskryf is (ESRI en OGC) is vir 105 stelsels teruggelees: 208 van die 210 het by hul presiese EPSG-kode gepas en die ander twee by 'n stelsel met dieselfde wiskunde op dieselfde ellipsoïde. `.prj`-lêers wat CivilCraft skryf, word deur PROJ as dieselfde stelsel gelees. ESRI-`.prj`-lêers vir poolstereografiese stelsels (UPS, Alaska-pool) kan nie gelees word nie; kies daardie stelsels volgens kode.
- Die breedte- en lengtegraad in die statusbalk het in die blaaier by PROJ ooreengestem tot op 0.01″.
