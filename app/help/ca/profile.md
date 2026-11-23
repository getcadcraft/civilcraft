---
title: Dissenyar un perfil vertical
summary: Obriu la vista del perfil, començar un perfil de disseny des del terreny, afegir i arrossegar PVI, definir longituds de corbes verticals, i llegir pendents, valors K i punts alts i baixos.
keywords: perfil, traçat vertical, pvi, corba vertical, pendent, valor k, cresta, concavitat, bvc, evc, vista del perfil, cota de projecte, fg, perfil del terreny existent, línies característiques en el perfil, encreuaments, projectat, vorada, cuneta, etiquetes
from: dbb1f32d
---

Cada traçat té un perfil de disseny: una llista de PVI (PK i elevació) units per pendents rectes, amb una corba vertical parabòlica simètrica a qualsevol PVI interior que tingui una longitud. El perfil del terreny existent es pren de la superfície per vosaltres.

## Obre la vista del perfil

1. Seleccioneu el traçat (cliqueu-lo amb {{ui:Selecciona}}).
2. Premeu {{key:R}}, o cliqueu {{ui:Perfil}} a la barra d'eines, o {{ui:Vista del perfil}} a la part inferior de la fitxa dreta.
   La vista del perfil s'obre sota el plànol amb el terreny existent al llarg del traçat. Amb dos o més traçats, en trieu un a la llista de l'esquerra de la barra del perfil.

La vista comença mostrant tot el traçat i estirant les elevacions per omplir el panell; l'exageració s'imprimeix a la cantonada inferior esquerra, per exemple «Exageració vertical 10×».

## Fer zoom i desplaçar el perfil

- **Zoom:** gireu la roda del ratolí (o pinceu amb el touchpad) i la vista fa zoom al voltant del punter. Manteniu {{key:Shift}} per fer zoom només als PK, o {{key:Alt}} per fer zoom només a les elevacions (això canvia l'exageració). Amb la vista del perfil enfocada, les tecles més i menys fan zoom al centre.
- **Desplaçament:** arrossegueu amb el botó dret o el del mig del ratolí, o llisqueu amb dos dits en un touchpad.
- **Ajustar:** feu doble clic al perfil o premeu {{key:F}} per tornar a mostrar tot el traçat.

Editar un PVI manté el zoom que heu triat; no torna a l'ajust.

Moveu el punter al llarg del perfil: la barra mostra el PK, les elevacions del terreny i de projecte, la pendent i el desmunt o terraplè en aquell punt, i un punt segueix el traçat al plànol.

## Començar el perfil de disseny

1. A la fitxa dreta, sota **Perfil de disseny**, cliqueu {{ui:Comença des del terreny}}.
   Es col·loquen dos PVI sobre el terreny als dos extrems del traçat, units per una pendent recta. La barra d'estat diu «Perfil de disseny començat sobre el terreny a tots dos extrems. Activeu Afegeix PVI i cliqueu per afegir canvis de pendent; doneu-los una longitud de corba a la taula».

Si el traçat no travessa la superfície, obtindreu «Aquest traçat no té terreny sota seu per començar». Aleshores afegiu PVI cliquejant (la secció següent).

## Afegir PVI

1. Premeu {{key:I}}, o cliqueu {{ui:Afegeix PVI}} a la barra del perfil. Queda premut.
2. Cliqueu al perfil on vulgueu un canvi de pendent. S'afegeix un PVI en aquest PK i elevació, arrodonit a 0.01, i queda seleccionat.
3. Afegiu tants com calgui, i després premeu {{key:I}} de nou per aturar l'addició.

Un clic on ja hi ha un PVI es refusa («Ja hi ha un PVI a …»). Els PVI sempre es mantenen en ordre de PK.

## Encaix mentre afegiu o arrossegueu

El botó **Encaixa** de la barra del perfil està activat des del principi. Mentre està activat, un PVI que afegiu o arrossegueu s'encaixa al PVI més proper, al punt del terreny, al PK d'un PVI o a la línia del terreny, i una etiqueta al costat del marcador indica quin és. Manteniu {{key:Alt}} per a un punt lliure, a qualsevol lloc.

## Ajustar els PVI

- **Arrossegueu** un PVI al perfil per moure'l. No pot passar els seus veïns. El moviment és un sol pas per desfer.
- **Escriviu** valors exactes a la taula de PVI de la fitxa dreta: **PK**, **Elevació**, **Pendent %** i **Corba L** (longitud de la corba vertical). Premeu {{key:Enter}} després de cada un.
- **Trieu** un valor del perfil: el petit botó al costat del PK o de l'elevació d'un PVI espera un clic al perfil i omple aquell valor. El clic s'encaixa com a Afegeix PVI; manteniu {{key:Alt}} per a un punt lliure; {{key:Esc}} ho cancel·la.
- **La Pendent %** és la pendent de la tangent que comença en aquell PVI i arriba fins al següent. Escriure-la mou l'elevació del **següent** PVI (el seu PK mai no es mou). Si el següent PVI està bloquejat, es mou l'elevació del PVI anterior.
- **Bloquegeu** un PVI amb el cadenat al final de la seva fila. Un PVI bloquejat no s'arrossega, i una edició de pendent no el mou. Si els dos extrems d'una tangent estan bloquejats, la seva pendent no es pot canviar: la barra d'estat ho indica, i primer cal desbloquejar un extrem. El bloqueig es desa al fitxer.
- **Traieu** un PVI amb la x al final de la seva fila, o seleccioneu-lo (cliqueu-lo) i premeu {{key:Delete}}. Quan la vista del perfil té el focus, {{key:Backspace}} també el treu.

El primer i l'últim PVI mai no reben una corba.

## Corbes verticals

1. Escriviu una longitud a **Corba L** per a un PVI interior, per exemple 200.
2. La corba es dibuixa centrada al PVI. El perfil i la fitxa dreta mostren el seu tipus (cresta o concavitat), L i K, les estacions i elevacions BVC i EVC, i el seu punt alt o baix quan en té un dins de la corba.

La K es calcula a partir de L (K = L dividit per la diferència algebraica de pendents, en per cent). Vosaltres escriviu L; escriure directament la K encara no està disponible.

Si una corba vertical no hi cap, un requadre vermell indica el motiu: torna enrere cap al PVI o cap a la corba anterior, o passa del PVI següent, i quant espai hi ha a cada costat (una corba necessita la meitat de la seva longitud a cada costat del seu PVI). El seu botó fixa **la corba més llarga que hi cap**, amb la seva K, com un sol pas ({{key:Mod+Z}} ho desfà). O separeu més els PVI.

## Llegir les dades

Sota la taula de PVI, una llista dona cada pendent en per cent («Pendent 1: +1.25%») i cada corba, per exemple «Cresta a 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)», i després «Punt alt 1+62.40, 254.12».

Si els PVI no arriben als dos extrems del traçat, una nota ho indica. Un corredor només es construeix on el perfil i el traçat se solapen.

## Línies característiques en el perfil

Les línies característiques també es mostren a la vista del perfil, de manera que podeu veure una vorada, una cuneta o la part superior d'un mur contra el perfil de la carretera.

- On una línia característica **creua** el traçat, el perfil mostra un petit rombe en aquell PK i elevació, amb el nom de la línia i la seva elevació allà (l'elevació de la pròpia línia, calculada al llarg del segment que creua).
- Escriviu una distància a {{ui:Al costat, dins de}} per dibuixar també les línies característiques que **corren al costat** del traçat dins d'aquella distància, com a línies discontínues a les seves pròpies elevacions. Buit o 0 només mostra els encreuaments.
- Les marques i etiquetes segueixen cada canvi: moveu un vèrtex, escriviu una pendent o alceu la línia, i el perfil mostra de seguida les noves elevacions.
- Cliqueu el rombe d'un encreuament per seleccionar aquella línia característica; la línia seleccionada es dibuixa amb el color de ressaltat.
- {{ui:Línies característiques}} a la barra del perfil amaga o mostra totes. Les dues opcions es guarden amb el projecte.

Vegeu [Línies característiques](topic:feature-lines).

## Següent

- [Crea un corredor de carretera](topic:corridor) al llarg del traçat i d'aquest perfil.
- El perfil s'escriu a LandXML amb el traçat; vegeu [Intercanvi LandXML](topic:landxml).
