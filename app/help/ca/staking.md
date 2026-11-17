---
title: Fes un informe de replanteig
summary: Llista les estaques al llarg d'un traçat, a les estacions i desfasaments, o els punts topogràfics propers, amb el PK, el desfasament, Y (nord) i X (est), la cota de projecte i la del terreny, i el desmunt o terraplè, i desa l'informe en CSV o PDF.
keywords: replanteig, estaques, informe d'estaques, fulla de desmunt, fulla de cotes, punt quilomètric, desfasament, desmunt, terraplè, traçat, replanteig de construcció, com construït
from: d8a4e9f1
---

Seleccioneu un traçat i premeu **Informe de replanteig** a les seves **Propietats**.

## Estaques a les estacions i desfasaments

1. **Des de** i **fins a**: les estacions a replantejar (1+50 o 150).
2. **cada**: l'interval. Les estaques van a cada múltiple, als dos extrems i (amb la casella marcada) on comencen i acaben les corbes del traçat.
3. **Desfasaments**: a l'esquerra i a la dreta del traçat, mirant en sentit creixent del PK: `12 L, 0, 12 R`, `L12 CL R12` o `-12, 0, 12` (l'esquerra és negativa). Un traçat amb un corredor comença amb les vores de la calçada i de les vorals.
4. **Numera a partir de** i **amb prefix** donen nom a les estaques: 1, 2, 3, o S101, S102.

## Punts topogràfics propers al traçat

Trieu **punts topogràfics propers al traçat** i la distància màxima. Cada punt dins d'aquesta distància rep el seu PK i desfasament, el projecte en aquell lloc, i la seva pròpia cota com a terreny: és una comprovació dels punts replantejats o mesurats com a construït.

## Què diu l'informe

| Columna | Què és |
|---|---|
| Punt | El nom de l'estaca, o el número del punt topogràfic |
| PK, Desfasament | On és al llarg del traçat: L a l'esquerra, R a la dreta |
| Y (nord), X (est) | Les seves coordenades |
| Cota de projecte | La superfície del corredor projectat en aquell punt (de línia de tall a línia de tall), si no, el perfil de projecte a l'eix |
| Cota del terreny | La superfície existent en aquell punt, o la cota pròpia del punt topogràfic |
| Desmunt/terraplè | C quan el terreny és per sobre del projecte (cal desmuntar-lo), F quan és per sota (cal omplir-lo), amb dues decimals |

Una estaca sense cota de projecte (fora del corredor, o en un traçat sense cota fora de l'eix) no té desmunt ni terraplè; el diàleg indica quantes n'hi ha.

## Desa-ho

- **CSV**: una línia de títol, després les columnes de dalt, més el desmunt o terraplè com a número amb signe (terreny menys projecte), per a fulls de càlcul i col·lectors de dades.
- **PDF**: pàgines de taula en el paper que trieu, una estaca per fila, desmunts en taronja i terraplens en verd, amb la franja del títol de la resta de fulls.

:::note
Les estaques es calculen a partir del projecte del fitxer. Comproveu-les amb els plànols aprovats abans de construir res.
:::
