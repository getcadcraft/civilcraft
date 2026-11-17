---
title: Defineix el sistema de coordenades del projecte
summary: Indiqueu en quin sistema de coordenades és l'aixecament perquè CivilCraft mostri la latitud i la longitud, situï fitxers GIS i capes de mapa, i escrigui fitxers .prj. Trieu-lo per codi, per nom, per les pròpies coordenades o des d'un fitxer .prj.
keywords: sistema de coordenades, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, projecció, prj, wkt, datum, latitud, longitud, lat long, geogràfic, graella, georeferència, georeferenciar, assignar sistema de coordenades
from: 964250e2
---

Les coordenades d'un projecte són només números fins que indiqueu què signifiquen. Definir el sistema de coordenades **mai no mou res**: només indica a CivilCraft que, per exemple, E 6,150,000 N 2,080,000 són coordenades state plane de la zona 6 de Califòrnia en peus de topografia dels EUA. Un cop ho sap:

- la barra d'estat mostra la latitud i la longitud del punter,
- els fitxers GIS en altres sistemes (shapefiles, GeoJSON, GeoPackage, graelles d'elevacions, LiDAR) es converteixen al projecte en obrir-se,
- es poden dibuixar capes de mapa sota el plànol ([Mostra capes de mapa sota el plànol](topic:map-layers)),
- les exportacions a formats GIS porten el sistema (un `.prj` per als shapefiles, el codi EPSG per al GeoPackage i el GeoTIFF).

## Trieu el sistema

1. Trieu {{ui:Coordenades}} al grup {{ui:SIG}} de la barra d'eines. S'obre el diàleg **Sistema de coordenades**. A la part superior indica en quin sistema és ara el projecte, o **Cap — les coordenades són només números**.
2. Trobeu el sistema d'una d'aquestes maneres:
   - **Cerca**: escriviu el codi EPSG (`2277`, `EPSG:2277`) o paraules del nom (`texas central`, `utm 14n`, `lambert-93`). Els codis es llisten a partir del que heu escrit; les paraules llisten els sistemes el nom dels quals conté totes les paraules.
   - {{ui:Sistemes que encaixen amb aquestes coordenades}} (quan el projecte té punts o una superfície): CivilCraft llegeix el centre del projecte en cada sistema de la família d'unitats del projecte i llista els que contenen la seva àrea d'ús. Les coordenades state plane solen encaixar només en unes poques zones: un projecte a Texas a E 3,115,000 N 10,070,000 peus de topografia dels EUA encaixa amb les quatre variants de Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Cada entrada mostra on seria el centre del projecte.
   - **Prop de (lat, long)** i {{ui:Suggereix}}: escriviu on és el solar, per exemple `30.27, -97.74` o `30°16′N 97°44′W`, i CivilCraft llista els sistemes projectats l'àrea dels quals el conté, primer les graelles nacionals i estatals.
   - {{ui:Llegeix un fitxer .prj…}}: obriu el `.prj` que va amb un shapefile o un dibuix. CivilCraft el fa coincidir amb la seva llista segons les matemàtiques de projecció (així, un `.prj` que anomena un datum de manera diferent encara troba el sistema correcte) i indica quin és; quan no coincideix exactament amb cap, s'utilitza la descripció pròpia del fitxer. També podeu arrossegar un `.prj` al diàleg, o obrir-lo o arrossegar-lo sobre el plànol sol.
3. Feu clic en un sistema de la llista. A **Escollit** es mostra el nom, el codi EPSG, la unitat, com de bé està lligat el seu datum a WGS 84, la seva àrea d'ús en latitud i longitud, i on cau el centre del projecte.
4. Deixeu seleccionat **Graella** (la majoria de projectes; vegeu [Coordenades de terreny i locals](topic:ground-and-local-coordinates) per als altres) i trieu {{ui:Aplica}}.

La barra d'estat mostra ara la latitud i la longitud del punter al costat de E i N. Definir el sistema és un pas de desfer: {{key:Mod+Z}} el desfà.

:::note
Les unitats han de coincidir: un projecte en peus accepta sistemes en peus de topografia dels EUA o en peus internacionals; un projecte en metres accepta sistemes en metres. CivilCraft explica un rebuig ("El projecte és en peus però aquest sistema és en metres…"). Un projecte en peus amb un sistema de peu de topografia dels EUA utilitza peus de topografia: el "ft" del projecte vol dir el peu del sistema. Els sistemes geogràfics (latitud i longitud, com el mateix WGS 84) no poden ser el sistema d'un projecte: els dibuixos necessiten est i nord.
:::

## Canvia o suprimeix el sistema

Torneu a obrir {{ui:Coordenades}}, trieu un altre sistema i trieu {{ui:Aplica}}. Quan el projecte té punts o un disseny, CivilCraft pregunta **Les coordenades ja són en … ?**

- {{ui:Sí: no es mou res}}: els números es queden tal com són i només canvia el seu significat. Useu-ho quan el sistema anterior s'havia triat per error.
- {{ui:No: converteix-les}}: cada punt topogràfic, línia de ruptura, límit, PI de traçat, vèrtex de plataforma i estructura es converteix del sistema anterior al nou, en un sol pas de desfer. Una superfície llegida des de LandXML com a triangles no es pot convertir; reconstruïu-la primer des dels punts.

{{ui:Suprimeix el sistema}} en treu el sistema (no es mou res). Les capes GIS que ja hi ha al projecte es queden on són.

## Latitud i longitud a la barra d'estat

Mentre el projecte té un sistema, la barra d'estat mostra la latitud i la longitud del punter en WGS 84, per exemple `30°18′00.00″ N  97°42′00.00″ W`. Per veure graus decimals, trieu-los a {{ui:Configuració}}, {{ui:CivilCraft}}, **Latitud i longitud** ([Configuració de CivilCraft](topic:settings)). Amb coordenades de terreny o locals, la lectura passa primer per aquest pas, de manera que és correcta per al punt sota el punter.

## Quina és la qualitat del canvi de datum

Latitud, longitud, GeoJSON i les capes de mapa estan totes en WGS 84. El lligam de cada sistema amb WGS 84 es mostra al diàleg:

| Què diu el diàleg | Què vol dir |
|---|---|
| WGS 84 mateix | Cap canvi en absolut. |
| NAD83 es pren com a WGS 84 | Les dues difereixen en un o dos metres a la major part d'Amèrica del Nord, com a molt uns quants metres. Bo per a capes de mapa i context del solar; no per a control topogràfic. |
| Coneguda amb uns *n* m (xifra de l'EPSG) | Un canvi publicat; les capes de mapa i el GeoJSON poden tenir un error d'aproximadament aquesta magnitud. |
| No es coneix per a aquest datum | No hi ha cap canvi publicat sense un fitxer de graella: les capes de mapa i el GeoJSON poden estar desplaçats centenars de metres. |
| Del fitxer de desplaçament de graella … | S'utilitza un fitxer de desplaçament de graella (a continuació): a uns 10 cm de NAD83 dins de la graella. |

Les coordenades pròpies del projecte mai no passen per un canvi de datum: només ho fa el que es converteix cap a o des de latitud i longitud. Els datums verticals i els models de geoide no es tracten (les elevacions mai no es converteixen). Quan el millor canvi necessita un fitxer de graella, la llista porta un canvi publicat més aproximat i el diàleg mostra la seva precisió (els sistemes NAD27, per exemple, uns 20 m), fins que afegiu la graella.

## Fitxers de desplaçament de graella

Per a un sistema NAD27, **Fitxer de desplaçament de graella** del diàleg de sistema de coordenades situa la latitud i la longitud, els fitxers GIS i les capes de mapa a uns 10 cm de NAD83 en lloc de a uns 20 m:

- **Baixa** la graella que suggereix per a l'àrea del sistema (NADCON5 per als EUA contigus, NADCON per a Alaska, NTv2 per al Canadà) des de cdn.proj.org, el servidor públic de graelles de PROJ. Només s'envia el nom del fitxer de la graella.
- O bé **Afegeix un fitxer de graella…** que ja teniu: NTv2 (`.gsb`) o una graella GeoTIFF de PROJ (`.tif`), de fins a 20 MB.

La graella es desa al fitxer del projecte, de manera que viatja amb el projecte. La secció indica si el centre del projecte és dins de la graella: fora d'ella no s'aplica cap desplaçament, així que useu una graella que cobreixi el solar. **Deixa d'utilitzar la graella** torna al desplaçament aproximat. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

Les capes GIS que ja hi ha al projecte es queden on són quan canvia la graella; torneu-les a importar per situar-les a través de la graella. Les coordenades pròpies del projecte mai no es mouen.

## Què s'ha comprovat

- Cada conversió s'ha comparat amb PROJ (pyproj 3.7.1 amb PROJ 9.5.1), la biblioteca de coordenades que usen la majoria de programes GIS, en més de 330 sistemes: state plane en peus de topografia dels EUA i en peus, UTM nord i sud, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator i Mercator web, entre altres. Les coordenades est i nord coincideixen amb un error d'1 cm amb el mateix canvi de datum (la majoria, per sota de 1 mm amb escreix), i les matemàtiques de projecció coincideixen amb les definicions pròpies de PROJ amb 1 cm.
- Els fitxers `.prj` escrits per PROJ en les dues formes més comunes (ESRI i OGC) es van llegir de nou per a 105 sistemes: 208 dels 210 coincidien amb el seu codi EPSG exacte i els altres dos amb un sistema amb les mateixes matemàtiques sobre el mateix elipsoide. Els fitxers `.prj` que escriu CivilCraft els llegeix PROJ com el mateix sistema. Els fitxers `.prj` ESRI per als sistemes estereogràfics polars (UPS, Alaska polar) no es poden llegir; trieu aquests sistemes pel codi.
- La latitud i la longitud de la barra d'estat coincidien amb PROJ fins a 0.01″ al navegador.
