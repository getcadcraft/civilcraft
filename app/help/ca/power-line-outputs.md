---
title: Taules, quantitats, fulls i SIG de línies elèctriques
summary: Taules de tesat i de suports, quantitats de material per a un full de càlcul o TakeoffCraft, fulls de planta i de perfil amb un informe d'estudi en un sol PDF, i capes SIG amb les dades de cada element.
keywords: taula de tesat, taula de suports, quantitats, llista de materials, takeoffcraft, fulls, informe, pdf, full de perfil, sig, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Tot això és sota {{ui:Més}} al grup Línies elèctriques.

| Sortida | Què obteniu |
|---|---|
| {{ui:Taules de tesat…}} | Per secció, la tensió horitzontal i la fletxa de cada van a cada temperatura; es pot desar com a CSV. {{ui:Desa la taula de suports (CSV)}}: el rol de cada suport, l'element, el terreny, la fixació, la càrrega més gran, la nominal, OK, el suggeriment, la fonamentació, l'oscil·lació, l'arrencada |
| {{ui:Quantitats…}} | Conductor (longituds de catenària × conductors × circuits + 2 % per a pontets i amarratges), suports i equips per element de la biblioteca, cable, rasa, excavació, conductes, unions. CSV, Excel, o un fitxer de quantitats de TakeoffCraft |
| {{ui:Fulls i informe…}} | Un sol PDF: la planta; un full de perfil per a cada línia amb el conductor als casos de càrrega que trieu i una franja amb les longituds dels vans, les fletxes i les franquies mínimes; i un informe d'estudi (regles, seccions, taules de tesat, suports, totes les comprovacions) |
| {{ui:Exporta a SIG…}} | Suports, vans, rutes de cable, equips i obstacles com a capes amb les seves dades (alçades, càrregues, fletxes, franquies, què no compleix), en format GeoPackage, shapefile, GeoJSON, KML o KMZ |

El GeoJSON i el KML necessiten el sistema de coordenades del projecte ([Sistemes de coordenades](topic:coordinate-systems)); sense ell, els GeoPackage i els shapefiles porten els números propis del projecte.
