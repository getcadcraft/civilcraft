---
title: Importa punts topogràfics
summary: Obriu un fitxer de punts en CSV o text, comproveu l'ordre de columnes al diàleg Importa punts, corregiu les files que no es poden llegir i classifiqueu els punts en grups.
keywords: importa punts, csv, txt, pnezd, penzd, fitxer de punts, topografia, punts cogo, grups de punts, columnes, nord est
from: ad33d88a
---

Un fitxer de punts és un fitxer de text amb un punt per línia: número de punt, nord, est, elevació i descripció en algun ordre, separats per comes, tabuladors, punts i comes, o espais. CivilCraft el llegeix al navegador i en construeix seguida una superfície.

## Abans de començar

- Sapigueu l'ordre de les columnes si el podeu saber (PNEZD i PENZD semblen iguals per a un ordinador).
- Sapigueu-ne les unitats. CivilCraft no les converteix: definiu **Unitats** al panell esquerre perquè coincideixin amb el fitxer (vegeu [Unitats, abscisses i formats de nombres](topic:units-and-stations)).
- Les coordenades poden ser grans (els nords i ests de les projeccions de sistema estatal, en milions, van bé).

## Importar el fitxer

1. Feu clic a {{ui:Obre}} a la barra d'eines, o premeu {{key:Mod+O}}, i trieu el fitxer. També el podeu arrossegar al pla.
   S'obre el diàleg **Importa punts** amb el nom del fitxer, una llista **Columnes** definida a {{ui:Detecta}}, una línia de resum i els sis primers punts.
2. Llegiu la línia de resum. Diu quants punts s'han llegit, en quin ordre de columnes, com s'ha trobat aquest ordre i què separa les columnes. Hi ha tres maneres de trobar l'ordre:
   - "des de la fila de capçalera": la primera línia anomena les columnes (Point, Northing, Easting, Elevation, Description, o X, Y, Z…). És la més segura.
   - "tal com s'ha triat": heu triat un ordre a **Columnes**.
   - "endevinat a partir del nombre de columnes i de la configuració de files de punts (PNEZD) — comproveu que el nord i l'est no estiguin intercanviats": no hi havia una capçalera utilitzable. Si els vostres fitxers solen tenir primer l'est, definiu **Files de punts** a P, E, N, Z, D a la [configuració de CivilCraft](topic:settings).
3. Comproveu la taula de previsualització. Les seves columnes són sempre **Punt**, **Nord**, **Est**, **Elevació** i **Descripció**, sigui quin sigui l'ordre del fitxer. Els nords i els ests d'un lloc real solen ser de mides clarament diferents: si semblen intercanviats, la suposició era errònia.
4. Si l'ordre és incorrecte, trieu el correcte a **Columnes** (per exemple {{ui:PENZD — punt, est, nord, elevació, descripció}}). El resum i la previsualització s'actualitzen de seguida.
5. Mireu sota la previsualització per veure **Files no llegides**. Cada línia indica el número de línia del fitxer, el motiu i l'inici de la fila. Vegeu [Files que no es llegeixen](topic:import-points#rows-that-are-not-read).
6. Feu clic a {{ui:Importa}}.
   Els punts apareixen al pla, la vista fa zoom cap a ells i es construeix la superfície. La barra d'estat diu, per exemple, "S'han importat 276 punts de site.csv; superfície: 546 triangles."

Si el projecte encara no tenia nom, en pren el del fitxer.

## Comprovar els grups

Cada punt pertany a un grup amb el nom de la **primera paraula de la seva descripció**, en majúscules: "GRD", "FL 12" i "fl" són als grups GRD, FL i FL. Els punts sense descripció van a "(sense descripció)".

1. Mireu la taula sota **Punts** al panell esquerre: grup, nombre de punts i una opció de **Superfície**.
2. Cada grup comença com a {{ui:Punts}}. Canvieu les línies de desguàs, les vores de paviment, els cims i els peus de talús, les crestes i altres línies codificades similars a {{ui:Línia de ruptura}}. Definiu com a {{ui:Exclòs}} els grups que no han de modelar el terreny (punts de control, capçades d'arbres, pals de serveis mesurats a dalt).
3. Feu clic a un punt del pla (amb {{ui:Selecciona}}) per veure el seu número, coordenades, elevació, descripció i grup al panell dret.

:::warning
Un grup de línia de ruptura uneix **tots** els seus punts en **una** sola línia, per ordre de número de punt. Això funciona quan cada línia codificada s'ha mesurat en ordre amb el seu propi codi. Dues línies de desguàs separades però codificades "FL" esdevenen una sola línia en zigzag entre elles. Si els codis es comparteixen, useu l'eina {{ui:Línia de ruptura}} per fer clic als punts de cada línia (vegeu [Construir i refinar la superfície](topic:build-surface)).
:::

## Files que no es llegeixen

| Motiu mostrat | Què vol dir | Què cal fer |
|---|---|---|
| "el nord o l'est no és un número" | Una columna de coordenades conté text | Comproveu l'ordre de columnes, o una fila de text fora de lloc enmig del fitxer |
| "l'elevació no és un número" | La columna d'elevació conté text | Ordre de columnes incorrecte, o una descripció a la columna d'elevació |
| "sense número de punt" | La columna de punt és buida | Numereu el punt, o trieu un ordre sense P (NEZD, NEZ …): els punts es numeren llavors 1, 2, 3 … |
| "el punt 12 apareix dues vegades (es manté el primer)" | Dues files comparteixen un número | Torneu a numerar un dels dos al fitxer si els dos són mesuraments reals |
| "3 columnes, se n'esperaven 5 (PNEZD)" | La fila és curta | Una línia trencada, o un ordre de columnes incorrecte |

Un punt sense elevació es manté, però no s'usa a la superfície. Les dades de **Punts** mostren quants punts tenen elevació.

Les línies que comencen per `#`, `;` o `//` són comentaris i s'ometen. Les línies en blanc també s'ometen.

## Substituir o afegir punts

Tornar a importar **substitueix** tots els punts; no hi afegeix res. Els vostres traçats, plataformes, canonades, línies de ruptura dibuixades i contorn es mantenen. L'historial de desfer s'esborra, de manera que deseu el projecte primer si podeu voler recuperar els punts antics. Per combinar dos fitxers, uniu-los en un editor de text o un full de càlcul abans d'importar (aneu amb compte amb els números de punt repetits).

Els punts encara no es poden moure, editar ni suprimir dins de CivilCraft. Corregiu-los al fitxer i torneu a importar.

## Relacionat

- [Formats de fitxers de punts](topic:point-file-formats): cada ordre de columnes i com es reconeixen les capçaleres.
- [Construir i refinar la superfície](topic:build-surface).
