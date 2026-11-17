---
title: Dissenya un perfil vertical
summary: Obriu la vista del perfil, comenceu un perfil de disseny des del terreny, afegiu i arrossegueu els PVI, establiu les longituds de les corbes verticals i llegiu les pendents, els valors K i els punts alts i baixos.
keywords: perfil, traçat vertical, PVI, corba vertical, pendent, valor K, cresta, concavitat, BVC, EVC, vista del perfil, rasant acabada, FG, perfil del terreny existent, línies característiques al perfil, encreuaments, projectat, vorada, cuneta, etiquetes
from: e9182bfa
---

Cada traçat té un perfil de disseny: una llista de PVI (punt quilomètric i cota) units per pendents rectes, amb una corba vertical parabòlica simètrica a qualsevol PVI interior que tingui una longitud. El perfil del terreny existent es pren de la superfície automàticament.

## Obriu la vista del perfil

1. Seleccioneu el traçat (feu-hi clic amb {{ui:Selecciona}}).
2. Premeu {{key:R}}, o feu clic a {{ui:Perfil}} a la barra d'eines, o a {{ui:Vista del perfil}} a la part inferior del panell de la dreta.
   La vista del perfil s'obre sota la planta amb el terreny existent al llarg del traçat. Amb dos o més traçats, trieu-ne un a la llista de l'esquerra de la barra del perfil.

La vista mostra sempre tot el traçat i estira les cotes per omplir el panell; l'exageració s'imprimeix a la cantonada inferior esquerra, per exemple "Exageració vertical 10×". No fa zoom ni desplaçament.

Moveu el punter al llarg del perfil: la barra mostra el punt quilomètric, les cotes del terreny i de disseny, la pendent i el desmunt o terraplè en aquell punt, i un punt segueix el traçat a la planta.

## Comença el perfil de disseny

1. Al panell de la dreta, sota **Perfil de disseny**, feu clic a {{ui:Comença des del terreny}}.
   Es col·loquen dos PVI sobre el terreny als dos extrems del traçat, units per una pendent recta. La barra d'estat diu "Perfil de disseny començat des del terreny als dos extrems. Activeu Afegeix PVI i feu clic per afegir trencaments de pendent; doneu-los una longitud de corba a la taula."

Si el traçat no creua la superfície, apareix el missatge "Aquest traçat no té terreny sota seu per començar." Llavors afegiu PVI fent clic (següent apartat).

## Afegeix PVI

1. Premeu {{key:I}}, o feu clic a {{ui:Afegeix PVI}} a la barra del perfil. Es manté premut.
2. Feu clic al perfil on vulgueu un canvi de pendent. S'afegeix un PVI en aquell punt quilomètric i cota, arrodonit a 0.01, i queda seleccionat.
3. Afegiu-ne tants com necessiteu, i després torneu a premer {{key:I}} per deixar d'afegir-ne.

Un clic on ja hi ha un PVI es rebutja ("Ja hi ha un PVI a …"). Els PVI sempre estan en ordre de punt quilomètric.

## Ajusta els PVI

- **Arrossegueu** un PVI al perfil per moure'l. No pot passar dels seus veïns. El moviment és un sol pas per desfer.
- **Escriviu** valors exactes a la taula de PVI del panell de la dreta: **Punt quilomètric**, **Cota** i **Corba L** (longitud de la corba vertical). Premeu {{key:Enter}} després de cada un.
- **Elimineu** un PVI amb la x al final de la seva fila, o seleccioneu-lo (feu-hi clic) i premeu {{key:Delete}}. Quan la vista del perfil té el focus, {{key:Backspace}} també l'elimina.

El primer i l'últim PVI mai no tenen corba.

## Corbes verticals

1. Escriviu una longitud a **Corba L** per a un PVI interior, per exemple 200.
2. La corba es dibuixa centrada al PVI. El perfil i el panell de la dreta mostren el seu tipus (cresta o concavitat), L i K, els punts quilomètrics i cotes del BVC i de l'EVC, i el seu punt alt o baix quan n'hi ha un dins de la corba.

K es calcula a partir de L (K = L dividit per la diferència algebraica de les pendents, en per cent). Escriviu L; escriure K directament encara no està disponible.

Si una corba vertical no hi cap, un quadre vermell n'explica el motiu: es solapa amb el PVI o la corba anterior, o passa del PVI següent, i quant espai hi ha en aquell costat (una corba necessita la meitat de la seva longitud a cada costat del seu PVI). El seu botó fixa **la corba més llarga que hi cap**, amb el seu K, com un sol pas ({{key:Mod+Z}} la desfà). O separeu els PVI.

## Llegiu les dades

Sota la taula de PVI, una llista dona cada pendent en per cent ("Pendent 1: +1.25%") i cada corba, per exemple "Cresta a 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", i després "Punt alt 1+62.40, 254.12".

Si els PVI no arriben als dos extrems del traçat, una nota ho indica. Un corredor només es construeix on coincideixen el perfil i el traçat.

## Línies característiques al perfil

Les línies característiques també es mostren a la vista del perfil, de manera que podeu veure una vorada, una cuneta o la coronació d'un mur contra el perfil de la carretera.

- On una línia característica **encreua** el traçat, el perfil mostra un petit rombe en aquell punt quilomètric i cota, amb l'etiqueta del nom de la línia i la seva cota allà (la cota pròpia de la línia, calculada al llarg del segment que la creua).
- Escriviu una distància a {{ui:Al costat, dins de}} per dibuixar també les línies característiques que **van al costat** del traçat dins d'aquesta distància, com a línies de traços a les seves pròpies cotes. Buit o 0 només mostra els encreuaments.
- Les marques i les etiquetes segueixen cada canvi: moveu un vèrtex, escriviu una pendent o aixequeu la línia, i el perfil mostra de seguida les noves cotes.
- Feu clic al rombe d'un encreuament per seleccionar aquella línia característica; la línia seleccionada es dibuixa amb el color de ressaltat.
- {{ui:Línies característiques}} a la barra del perfil les amaga o les mostra totes. Ambdues opcions es desen amb el projecte.

Vegeu [Línies característiques](topic:feature-lines).

## Següent

- [Genera un corredor de carretera](topic:corridor) al llarg del traçat i d'aquest perfil.
- El perfil s'escriu a LandXML juntament amb el traçat; vegeu [Intercanvia LandXML](topic:landxml).
