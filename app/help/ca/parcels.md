---
title: Dibuixa parcel·les i escriu-ne les descripcions legals
summary: Dibuixa una parcel·la pels seus vèrtexs o introdueix els trams d'una escriptura o d'un plànol, comprova com tanquen, posa rumbs i distàncies al plànol, fes que qualsevol tram sigui una corba i copia un esborrany de descripció legal.
keywords: parcel·les, solars, límits de propietat, límit, escriptura, plànol de parcel·lació, mesures i límits, rumb, distància, tancament, error de tancament, precisió, descripció legal, punt d'inici, corba, radi, àrea, acres
from: 6793d6ce
---

Les parcel·les es troben al plànol amb el rumb i la distància de cada tram recte (una corba mostra el seu radi, la longitud i l'angle central) i el nom i l'àrea al centre. Passen al traçat PDF i a les exportacions DWG i DXF, a les capes `V-PROP` (línies) i `V-PROP-TEXT` (etiquetes). Tot és a **Parcel·les** al panell de la dreta quan no hi ha res seleccionat.

## Dibuixa una parcel·la

1. Feu clic a **Dibuixa una parcel·la**.
2. Feu clic als vèrtexs, començant pel punt d'inici. Un clic prop d'un punt topogràfic pren la posició exacta d'aquell punt.
3. Feu clic de nou al primer vèrtex, o premeu {{key:Enter}}, per acabar. {{key:Backspace}} treu l'últim vèrtex; {{key:Esc}} descarta els vèrtexs fets fins ara; torneu-la a prémer per sortir de l'eina.

## Introdueix els trams d'una escriptura

1. Feu clic a **Introdueix els trams de l'escriptura**.
2. Digueu on comencen els trams: el número d'un punt topogràfic, o una coordenada Y (nord) i X (est).
3. Escriviu o enganxeu els trams, un per línia:
   - una línia: un rumb i una distància, com `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` i els azimuts (`AZ 45°30'15"`) també funcionen, i "thence", les comes i "feet" s'ignoren.
   - una corba: `C R 300 L 52.36 right` (radi i longitud de l'arc), o `C R 300 D 10°00'00" left` (radi i angle central). Una corba segueix el tram anterior; quan no ho fa, afegiu-hi el rumb de la corda: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` comença una línia de comentari.
4. A mesura que escriviu, el diàleg mostra la longitud dels trams, l'**error de tancament** (fins a quina distància i en quina direcció acaben lluny de l'inici), la **precisió** (la longitud dividida per l'error de tancament, 1 : 10,000 i així successivament) i l'àrea. Les línies que no pot llegir es llisten amb el seu número de línia.
5. **Afegeix la parcel·la**. Quan els trams no tanquen, la parcel·la es tanca amb un tram recte sobre la bretxa: compareu els trams amb l'escriptura. Per repartir l'error d'un itinerari de camp entre els seus trams, ajusteu-lo primer.

## Corbes

A les **Propietats** d'una parcel·la, cada tram té un **Radi**. Escriviu-ne un per fer que aquest tram sigui una corba entre els mateixos dos vèrtexs (un radi més petit que la meitat de la distància entre els vèrtexs no hi arriba, així que es rebutja), i trieu **Dreta** o **Esquerra** a **Corbes**: una corba cap a la dreta té el centre a la dreta de la direcció de la marxa, com en una escriptura. Buideu el radi per tornar-lo recte. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

## La descripció legal

Les propietats d'una parcel·la acaben amb la seva descripció legal, escrita a partir del dibuix:

- "Comença a" el **Punt d'inici** que escriviu (per exemple, "el vèrtex nord-est del solar 4"); si no n'hi ha cap, la coordenada Y (nord) i X (est) del primer vèrtex, o el punt topogràfic on van començar els trams.
- "després" cada tram: un rumb i una distància, o una corba amb el seu radi, la longitud de l'arc, l'angle central, i el rumb i la distància de la corda.
- "Conté" la seva àrea en peus quadrats i acres (metres quadrats i hectàrees en un projecte en metres).

**Copia** la posa al porta-retalls; **Baixa com a text** la desa com a fitxer `.txt`.

:::warning
La descripció legal és un esborrany a partir del dibuix, no un aixecament topogràfic. Un topògraf habilitat l'ha de comprovar amb el registre i signar-la abans que ningú en depengui.
:::

Feu clic dins d'una parcel·la del plànol per seleccionar-la; {{key:Delete}} la suprimeix. Les parcel·les es desen al fitxer de projecte.
