---
title: Valors inicials i valors provisionals
summary: Cada valor amb què comença CivilCraft, per a projectes nous, visualització, traçats, plataformes, corredors, xarxes de tuberies, volums i plànols, i quins són provisionals per substituir.
keywords: valors per defecte, configuració, valors inicials, provisionals, criteris de disseny, normes, regles, suposicions
from: fbfc7432
---

CivilCraft no té diàleg de configuració ni plantilla. Aquests són els valors amb què comencen les coses. Els valors marcats com a **provisional** no provenen de cap norma: substituïu-los pels criteris del vostre projecte abans de confiar en una comprovació o una quantitat.

## Projecte nou

| Ajust | Valor |
|---|---|
| Nom | Solar sense títol (el nom del primer fitxer de punts el substitueix) |
| Unitats | US feet |
| Nom de la superfície | Terreny actual |
| Grups de punts | Cada grup comença com a {{ui:Punts}} |
| Aresta exterior més llarga | 0 (conserva tots els triangles) |
| Passos de desfer conservats | 200 |

## Visualització

| Ajust | Valor |
|---|---|
| Superfície | {{ui:Terreny actual}} |
| Corbes cada | 1 (ft o m) |
| Major cada | 5a corba |
| Bandes | 8 |
| Activat | Corbes, etiquetes de corbes, punts, línies de ruptura, vora de la superfície, tuberies |
| Desactivat | Triangles, bandes d'elevació, fletxes de talús, etiquetes de punts |

## Traçats i perfils

| Ajust | Valor |
|---|---|
| Nom | Traçat 1, Traçat 2 … |
| PK inicial | 0+00 |
| Radi de corba a cada PI interior | 100 ft o 30 m, més petit si no hi cap a la meitat de cada tangent |
| Perfil de projecte | Cap fins que en comenceu un; {{ui:Comença des del terreny}} posa un PVI sobre el terreny a cada extrem |
| Longitud de la corba vertical | 0 (sense corba) fins que n'escriviu una |

## Plataformes

| Ajust | Valor |
|---|---|
| Nom | Plataforma 1, Plataforma 2 … |
| Elevació | El terreny al mig de la plataforma, arrodonit a 0.1 (0 si el mig és fora de la superfície) |
| Pendent de desmunt | 2 : 1 (provisional) |
| Pendent de terraplè | 3 : 1 (provisional) |

## Muntatge de corredor (provisionals)

| Ajust | US feet | Metres |
|---|---|---|
| Amplada del carril | 12 ft | 3.6 m |
| Pendent del carril | 2% | 2% |
| Amplada de l'arcen | 4 ft | 1.2 m |
| Pendent de l'arcen | 4% | 4% |
| Pendent de desmunt | 2 : 1 | 2 : 1 |
| Pendent de terraplè | 3 : 1 | 3 : 1 |
| Secció cada | 10 ft | 5 m |

## Xarxa de tuberies

| Ajust | US feet | Metres |
|---|---|---|
| Nom i tipus | Pluvial, pluvial | Pluvial, pluvial |
| Pendent mínim (provisional) | 0.50% | 0.50% |
| Recobriment mínim (provisional) | 2 ft | 0.6 m |
| Caiguda a les estructures (provisional) | 0.10 ft | 0.03 m |
| Diàmetre de nova estructura | 48 in | 1200 mm |
| Diàmetre de nou tub | 12 in | 300 mm |
| Profunditat del pou de decantació | 0 | 0 |
| Brocal | Des de la superfície | Des de la superfície |

Una xarxa de tuberies oberta des de LandXML també usa aquestes regles, perquè LandXML no les conté.

## Volums

| Ajust | Valor |
|---|---|
| Mètode | Graella, mostrejada als centres de cel·la dins de les línies de connexió amb el terreny |
| Mida de cel·la | Triada perquè el rectangle contenidor de l'àrea explanada contingui unes 250,000 cel·les (1, 2 o 5 vegades una potència de deu) |
| Esponjament i contracció | Cap |

## Plànol

| Ajust | Valor |
|---|---|
| Àrea | {{ui:Tot}} |
| Paper | Tabloid 11 × 17 in (projectes en peus), ISO A3 (projectes en metres); sempre apaïsat |
| Escala | L'escala més gran de les llistades que hi cap |
| Tinta | {{ui:Colors de capa}} |

Les etiquetes DXF es dimensionen per a l'escala a la qual tot hi cap a Tabloid (peus) o A3 (metres).
