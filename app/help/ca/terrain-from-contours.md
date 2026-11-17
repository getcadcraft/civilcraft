---
title: Terreny a partir de corbes de nivell
summary: Feu la superfície del terreny a partir d'un mapa de corbes: trieu les capes de línies, indiqueu d'on surt la cota de cada línia, comproveu els encreuaments i els duplicats, i construïu. Les corbes esdevenen línies de ruptura, amb els triangles plans a crestes i valls corregits. Un mapa dibuixat a partir d'una imatge o d'un PDF es pot escalar i situar amb dos punts coneguts.
keywords: corbes, corbes de nivell, terreny a partir de corbes, superfície a partir de corbes, mapa topogràfic, mapa de topografia, sense coordenades, línies de ruptura, triangles plans, carena, vall, cim, corbes que es creuen, corbes duplicades, interval entre corbes, escalar un mapa, dos punts, situar un mapa, DXF, DWG, shapefile
from: e6161653
---

Un topògraf de vegades envia un mapa de corbes: línies amb cotes, però sense punts. CivilCraft construeix el terreny existent a partir d'aquestes línies.

## Porteu les corbes

Obriu el mapa com a línies: un dibuix DXF o DWG, un shapefile o un GeoJSON (**GIS** › {{ui:Importa}}, o deixeu el fitxer sobre el plànol). Les línies entren com a **capes del mapa**. Sota **Superfície** › {{ui:Més}}, trieu {{ui:Terreny a partir de corbes de nivell}}.

## Digueu d'on surt la cota de cada línia

Marqueu les capes que contenen corbes, i després trieu **Cota obtinguda de**:

- {{ui:Les cotes pròpies de les línies}}: una línia on tots els vèrtexs tenen la mateixa cota (una polilínia 3D, o una polilínia amb cota). Una línia a 0 és dibuix de planta i no té cota.
- Un **camp numèric** de la capa (per exemple ELEV), quan el mapa en porta un.
- {{ui:Un valor inicial i un interval, segons l'ordre de llistat de les línies}}: per a línies sense cap cota. La primera línia llistada rep la **Cota de la primera línia**, la següent rep aquesta més l'**Interval entre corbes**, i així successivament. Llisteu les línies de la més baixa a la més alta (o reordeneu-les a la capa).

## Comproveu i després construïu

{{ui:Revisa}} llista el que està malament, en paraules, abans que res canviï:

- una línia **sense cota** o amb menys de dos punts;
- una línia **duplicada** (la mateixa forma dues vegades, fins i tot dibuixada a l'inrevés);
- dues línies que es **creuen**, a cotes diferents o a la mateixa (una línia que es creua amb si mateixa també), amb el lloc;
- una cota que **no és a l'interval** (un error de tecleig com 105.5 en un mapa d'1 m).

Marqueu {{ui:Deixa fora les línies que es creuen amb una altra}} per eliminar la línia que es creua amb més altres (després la següent, fins que no se n'encreuï cap): una línia perduda que talla totes les corbes és la que se'n va, no les corbes. Simplifica les línies dins d'una distància vol dir esborrar els vèrtexs que són més a prop d'un tram recte que aquesta distància.

{{ui:Construeix el terreny}} afegeix les línies al terreny existent com a línies de ruptura (un pas per desfer), de manera que la superfície passa exactament per cada corba. Amb {{ui:Corregeix els triangles plans a crestes, valls i cims}} marcat i un interval indicat, CivilCraft també afegeix un punt dins de cada triangle pla (un triangle amb tots els vèrtexs sobre la mateixa corba) a l'alçada on continua la pendent del costat, mai a més de mig interval de la corba. Sense això, les crestes, els fons de valls i els cims surten com a plaques planes. En un turó de prova, l'error respecte de la superfície real va baixar un quart; en una carena, un 40 %.

## Un mapa sense coordenades

Per a un mapa de corbes dibuixat a partir d'una imatge o d'un PDF, obriu **Escala i situa les capes per dos punts coneguts**. Doneu dos punts del mapa i on es troben de veritat; les capes marcades s'escalen, es giren i es mouen per encaixar (un pas per desfer; les alçades no canvien). Els mateixos dos punts donen l'escala (que es mostra al missatge) i la rotació.

La superfície és tan bona com el mapa: entre dues corbes és un pla, de manera que el terreny real entre elles no es coneix. Compareu el resultat amb les cotes puntuals abans de fiar-vos-en.
