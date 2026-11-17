---
title: Mostrar capes de mapa sota el plànol
summary: Col·loqueu una imatge georeferenciada, mosaics de mapa, un servidor WMS o WMTS o un servei de mapes sota el plànol com a context del lloc, amb el paràmetre d'internet, l'opacitat, l'ordre i l'atribució.
keywords: capes de mapa, mapa de base, fons, aeri, ortofoto, imatges, satèl·lit, ràster, fitxer de món, pgw, jgw, tfw, wld, geotiff, imatge georeferenciada, xyz, mosaics, mapa lliscant, wms, wmts, getcapabilities, servei de mapes, rest, mapserver, imageserver, usgs, national map, atribució, opacitat
from: 32d7718e
---

Les capes de mapa són imatges dibuixades sota el vostre disseny: una fotografia aèria amb el seu fitxer de món, o mapes de servidors d'internet. Són només context del lloc a la pantalla: **no** són a les exportacions PDF, DXF ni DWG, ni a la vista 3D.

Trieu {{ui:Mapa}} al grup {{ui:SIG}}. El diàleg **Capes de mapa** enumera les capes del projecte i n'afegeix de noves. Les capes de mapa necessiten el sistema de coordenades del projecte ([Definir el sistema de coordenades del projecte](topic:coordinate-systems)), excepte una imatge amb un fitxer de món que usa les coordenades del projecte.

## El paràmetre d'internet

CivilCraft no demana res a cap servidor de mapes fins que no ho permeteu: {{ui:Configuració}}, {{ui:CivilCraft}}, **Capes de mapa des d'internet**: **Desactivat** (l'inici) o **Activat**.

:::note
Quan és activat, CivilCraft demana als servidors de mapes que afegiu imatges de la zona de la pantalla. El vostre dibuix es queda en aquest ordinador; el servidor veu la zona i la vostra adreça d'internet.
:::

Mentre està desactivat, les capes d'internet es llisten al diàleg però en gris, amb el motiu, i no es dibuixa ni es demana res. Obrir un projecte que anomena servidors de mapes tampoc no els contacta. Una imatge des d'un fitxer funciona de les dues maneres. El botó {{ui:Obre Configuració}} del diàleg us hi porta.

## Una imatge georeferenciada (funciona sense connexió)

1. A **Afegeix una capa**, deixeu **Imatge georeferenciada** i trieu els fitxers: la imatge (PNG o JPEG) **juntament amb** el seu fitxer de món (`.pgw` per a PNG, `.jgw` per a JPEG, o `.wld`) i, si n'hi ha un, el seu `.prj`. També les podeu deixar anar al plànol juntes.
2. Sense `.prj`, CivilCraft pregunta quin sistema usa el fitxer de món: {{ui:El sistema del projecte}} (el més habitual), {{ui:Trieu un sistema…}}, o, en un projecte sense sistema, **Coordenades del projecte**.
3. La imatge apareix sota el plànol, i {{ui:Ajusta}} la inclou.

Un GeoTIFF RGB (una fotografia aèria desada com a GeoTIFF) porta la seva pròpia col·locació i sistema: obriu-lo sol. La imatge es guarda **dins del fitxer de projecte** (fins a 25 MB); una de més grossa es rebutja amb la seva mida, de manera que cal desar una còpia més petita (menys píxels, o JPEG).

## Mosaics, WMS, WMTS i serveis de mapes

Activeu primer **Capes de mapa des d'internet**. Després, a **Afegeix una capa**:

| Des de | Què cal enganxar | Què fa CivilCraft |
|---|---|---|
| URL de mosaic | Una plantilla amb `{z}`, `{x}` i `{y}` (o `{-y}`), i `{s}` per a una lletra de servidor, per exemple `https://tile.example.org/{z}/{x}/{y}.png`. Doneu-li un nom i la seva atribució. | Mosaics en projecció web Mercator per a la zona i el zoom de la pantalla. |
| Servidor WMS | L'adreça del servidor, o el seu enllaç GetCapabilities. Trieu {{ui:Obtén les capes}}, i després la capa. | Una imatge de la zona de la pantalla, demanada amb el codi EPSG del projecte quan el servidor l'ofereix; si no, en web Mercator o WGS 84. |
| Servidor WMTS | L'adreça del servidor, o el seu `WMTSCapabilities.xml`. Trieu {{ui:Obtén les capes}}, i després la capa i el conjunt de matrius de mosaics. | Mosaics del conjunt en el sistema del projecte quan n'hi ha un; si no, en web Mercator. |
| Servei de mapes ArcGIS (REST) | Un URL que acaba en `/MapServer` o `/ImageServer`. Trieu {{ui:Llegeix el servei}}. | Els serveis en web Mercator amb memòria cau es dibuixen a partir dels seus mosaics; els altres es demanen com una imatge de la zona de la pantalla. |

No hi ha cap servidor predefinit. Exemples públics, tots del USGS National Map (domini públic):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servei de mapes: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (també `USGSImageryOnly` per a fotografies aèries)

Molts departaments SIG de ciutats i comtats publiquen els seus propis serveis WMS o de mapes; les seves pàgines SIG en donen l'adreça. Un servidor que demana un inici de sessió o una clau no funciona: CivilCraft no envia noms d'usuari, contrasenyes ni claus.

## Com es dibuixen les capes

- Les imatges en un sistema diferent del del projecte es deformen cap a aquest: la imatge es talla en trossos, cadascun col·locat de manera que quedi dins d'un quart de píxel de la pantalla d'on el situa una conversió exacta.
- Els mosaics es trien per a la zona de la pantalla i el zoom: mai més de 64 per a una vista, i 6 alhora. Quan desplaceu o feu zoom, les peticions de la vista anterior es cancel·len. Hi ha uns 200 mosaics a la memòria (no es desa res al disc).
- Una imatge de WMS o de servei de mapes es demana quan la vista ha deixat de moure's; fins que arriba, l'anterior es queda al seu lloc.
- L'atribució de cada capa a la pantalla es mostra petita a la part inferior dreta del plànol.

## Canviar, ordenar i eliminar capes

Al diàleg, cada capa té una casella per mostrar-la o amagar-la, un control lliscant **Opacitat**, fletxes per dibuixar-la abans (més avall) o després (a dalt), un botó de zoom (per a les imatges) i un botó per eliminar-la. La primera capa de la llista es dibuixa a sota. Cada canvi és un pas per desfer.

## Quan una capa no mostra res

El motiu apareix una vegada a la línia d'estat i es queda sota el nom de la capa al diàleg:

| Missatge | Què cal fer |
|---|---|
| Desactivat: les capes de mapa d'internet estan desactivades a Configuració. | Activeu **Capes de mapa des d'internet**. |
| Cal el sistema de coordenades del projecte | Definiu-lo a {{ui:Coordenades}}. |
| El servidor no ha permès que aquesta pàgina usi les seves imatges (CORS), o no s'ha pogut contactar. | El servidor no deixa que les pàgines web usin les seves imatges, o està caigut. Després de quatre refusos, CivilCraft deixa de demanar; amagueu i mostreu la capa per tornar-ho a provar. |
| El servidor ha respost 404 … / El servidor ha enviat text/xml, no una imatge: … | El URL, la capa o l'estil són incorrectes, o el missatge del servidor indica què vol. |
| Aquesta capa no s'ofereix en el sistema del projecte, ni en web Mercator ni en WGS 84 | El servidor no pot dibuixar on CivilCraft la pot col·locar. |

## Què s'ha comprovat

- Els números dels mosaics s'han comprovat amb la divisió estàndard web Mercator. Les respostes WMS 1.1.1 i 1.3.0, WMTS i de servei de mapes s'han llegit de fitxers escrits a mà i de respostes reals desades dels servidors USGS National Map i terrestris OpenStreetMap. Les peticions WMS 1.3.0 posen la latitud primer per a EPSG:4326, com diu l'estàndard.
- La deformació s'ha comparat amb una conversió exacta píxel a píxel amb els números de PROJ: dins de 0,13 px per als mosaics, les imatges WMS i una imatge de mida de comtat, a escala del lloc i allunyada.
- Una imatge amb el seu fitxer de món i un GeoTIFF RGB escrit per GDAL (a través de rasterio) s'han dibuixat on indica la seva col·locació, comprovat píxel a píxel al navegador.
- Al navegador, amb un servidor de substitució al computador de proves: els mosaics cauen al mosaic on PROJ situa cada punt, una imatge WMS cau a menys de 2 px, com a màxim 6 peticions alhora, i amb el paràmetre desactivat cap petició surt de la pàgina. El servei de mapes del USGS National Map esmentat més amunt també es va llegir i dibuixar en viu al navegador una vegada (els seus mosaics van arribar i es van dibuixar, amb el seu text de copyright); els altres servidors públics només es van llegir de respostes desades.
