---
title: Analitza les capes SIG
summary: Zona d'influència (buffer), superposició (intersecció, unió, esborrat, dissolució), unió espacial, selecció per atribut i mesura de les capes SIG d'un projecte, cadascuna com a capa nova que es pot desfer.
keywords: sig, anàlisi, zona d'influència, buffer, superposició, intersecció, unió, esborra, retalla, dissol, unió espacial, uneix, selecciona per atribut, consulta, on, expressió, estadístiques, àrea, longitud, perímetre, mesura, parcel·les, servitud, retrocés, shapefile, geopackage, taula d'atributs
from: a6b2d3f9
---

Quan un projecte ja té capes SIG (vegeu [Importa dades SIG](topic:gis-import)), el botó **Analitza** del grup SIG (escrit `GISANALYSIS`, `ANALYZE` o `BUFFER`) obre un panell amb cinc pestanyes. Es queda obert al costat del plànol, de manera que el que seleccioneu es dibuixa al plànol mentre treballeu.

Cada eina que genera alguna cosa **afegeix una capa nova** i deixa les capes que ha llegit exactament com estaven. Cada una és un pas de desfer: {{ui:Desfés}} al panell (o Ctrl+Z) elimina la capa nova. Exporteu el resultat com qualsevol altra capa amb [Exporta les dades as-built per al SIG](topic:gis-export) com a shapefile, GeoJSON o GeoPackage.

La taula completa d'una capa, amb ordenació, edició i una calculadora de camps, és a [Treballa amb la taula d'atributs d'una capa](topic:gis-table); acolorir per un camp és a [Dona estil a una capa segons un atribut](topic:gis-symbology).

Tot es treballa al plànol, en les unitats del projecte (peus o metres). Un projecte sempre és en un sistema projectat o local, de manera que una distància de 50 vol dir 50 peus o 50 metres, mai graus. Les alçades (z) no es conserven als resultats.

## Zona d'influència

Dibuixa una zona d'una distància fixada al voltant de cada element, com a capa nova de polígons. Els punts es converteixen en cercles, les línies en corredors amb extrems arrodonits, i els polígons creixen. Una distància **negativa** redueix els polígons (un quadrat de 100 per 100 reduït en 5 és de 90 per 90; reduït en 60 no queda res, i el panell ho indica). Preneu la distància d'un camp numèric per donar a cada element la seva, o marqueu **Fusiona totes les zones d'influència en una sola forma** per dissoldre-les.

Les parts arrodonides són trams rectes dibuixats dins de la corba real, de manera que una zona d'influència és una mica més petita que el cercle exacte: uns 0.6 % en àrea amb la configuració normal, i 0.16 % amb la opció Fi. Useu Fi per a tot el que vagi a mesurar.

## Superposició

| Eina | Què obteniu |
|---|---|
| Intersecció | Els trossos on la capa d'entrada es troba amb els polígons de superposició, cadascun amb els camps de totes dues. Les línies i els punts es retallen als polígons. |
| Unió | Totes dues capes de polígons tallades per les vores de l'altra: els trossos compartits porten els camps de totes dues capes, la resta en porta només els d'una capa (els camps de l'altra queden buits). |
| Esborra | Els polígons d'entrada amb els polígons de superposició retirats. Els camps es mantenen de l'entrada. Un element esborrat completament es deixa fora (el panell els compta). |
| Dissol | Fusiona els polígons que es toquen o es superposen, tots junts o una forma per cada valor d'un camp. Afegeix `COUNT` i `AREA`. |

Un nom de camp que tenen les dues capes es conserva per a la primera capa, i el de la segona s'escriu amb `_2`. Els elements dins d'una mateixa capa no s'haurien de superposar entre ells: quan ho fan, una Unió compta la superposició a totes dues.

## Unió espacial

Una unió espacial copia els atributs d'una capa **font** a cada element **destí** que hi toca, i dona una capa nova amb les formes del destí. Trieu quan es troben: que es toquin o es superposin, que el destí quedi dins d'un polígon font, que el destí contingui l'element font, el de la font més proper (amb un límit opcional), o qualsevol element font dins d'una distància.

Quan diversos elements font coincideixen, agafeu els atributs del primer (el més proper, en les unions per proximitat i per distància; s'afegeix `DISTANCE`), o **els compteu i sumeu els seus camps numèrics**: `COUNT`, i `SUM_`, `MEAN_`, `MIN_`, `MAX_` per a cada camp numèric. Desmarqueu **Mantén els elements destí sense coincidència** per deixar-los fora. Els camps units queden buits on no hi ha coincidència, i el panell en compta els que no coincideixen.

## Selecciona

Escriviu una pregunta sobre els atributs o la forma, premeu **Selecciona**, i els elements es dibuixen al plànol amb el seu recompte, una taula i l'àrea, la longitud o el nombre total. Després, en podeu fer una capa pròpia, fer zoom fins a ells o netejar la selecció.

| Podeu escriure | Exemple |
|---|---|
| Un camp pel nom; useu "cometes" o [claudàtors] si el nom té espais | `VALUE`, `"Lot Number"` |
| Nombres, 'text', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (el text no distingeix majúscules; a `like`, `%` és qualsevol seqüència i `_` una lletra) | `Notes contains 'corner'` |
| `is null`, `is not null` (un valor buit compta com a null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` i parèntesis | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Valors de forma `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Una pregunta incompleta o que nomena un camp que la capa no té es refusa amb una frase que indica on és el problema.

## Mesura

Mostra l'àrea i el perímetre totals, la longitud o el nombre de la capa, i **afegeix camps** a la capa: `AREA` i `PERIMETER` per als polígons, `LENGTH` per a les línies (la longitud al plànol), `X` i `Y` per als punts. Un camp que ja existeix mai se sobreescriu: el nou es diu `AREA_2`. És un sol pas de desfer. **Estadístiques** dona el recompte, la suma, la mitjana, el mínim i el màxim d'un camp numèric, opcionalment per a cada valor d'un altre camp.

:::note
Les comprovacions d'aquestes eines es fan a mà en el test (`node bin/test-civilcraft-gisanalysis.mjs`): per exemple, parcel·les de 100 per 100 sota una zona de 100 per 80 s'intersequen en 3,000 més 3,000, i una línia de 100 de llargada amb una zona d'influència de 10 és 2,000 més un cercle.
:::
