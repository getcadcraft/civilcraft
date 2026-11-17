---
title: Tecles i ratolí
summary: Cada drecera de teclat i cada acció de ratolí, de trackpad i tàctil a CivilCraft, agrupades, amb les diferències del navegador i de la plataforma.
keywords: teclat, dreceres, tecles, ratolí, trackpad, tàctil, desplaçament, zoom, pinça, roda, clic dret, mac, tecla comanda
from: a9756f46
---

Les tecles d'una sola lletra funcionen quan no esteu escrivint en un quadre. Les dreceres amb {{key:Mod}} usen Command en un Mac i Ctrl a la resta. Vegeu també [Tecles al navegador](common:keys).

## Fitxers i edició

| Tecla | Acció |
|---|---|
| {{key:Mod+O}} | Obre un fitxer de punts, LandXML o projecte |
| {{key:Mod+S}} | Desa el projecte (es baixa un fitxer `.civilcraft.json`) |
| {{key:Mod+P}} | Traça el pla a PDF (obre el diàleg de traçat, no la impressió del navegador) |
| {{key:Mod+Z}} | Desfés |
| {{key:Mod+Y}} | Refés |
| {{key:Delete}} | Suprimeix els punts topogràfics, el traçat, la plataforma, l'estructura, la canonada o el PVI seleccionats |
| {{key:Mod+C}} | Copia els punts topogràfics seleccionats (també com a files de punts per a un full de càlcul) |
| {{key:Mod+X}} | Retalla els punts topogràfics seleccionats |
| {{key:Mod+V}} | Enganxa punts: segueixen el punter, feu clic on han d'anar |
| {{key:Mod+Shift+V}} | Enganxa al mateix lloc: a les coordenades pròpies dels punts |
| {{key:Mod+D}} | Duplica els punts topogràfics seleccionats: una còpia segueix el punter |
| {{key:Mod+A}} | Selecciona tots els punts topogràfics |
| {{key:Esc}} | Neteja la selecció (i cancel·la una enganxada) |

{{key:Mod+S}}, {{key:Mod+O}} i {{key:Mod+P}} funcionen fins i tot mentre escriviu en un quadre. {{key:Mod+Z}} i {{key:Mod+Y}} en un quadre de text desfan la vostra escriptura, com és habitual, i també ho fan {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} i {{key:Mod+A}}: en un quadre copien, retallen, enganxen i seleccionen el seu text. Amb text seleccionat a la pàgina (en un panell), {{key:Mod+C}} copia aquell text. {{key:Mod+Shift+Z}} no fa res a CivilCraft: useu {{key:Mod+Y}} o el botó {{ui:Refés}}.

:::mac
La tecla del Mac que diu **delete** és {{key:Backspace}} per al navegador. Per suprimir una selecció, premeu {{key:Delete}} (Fn i delete), o trieu {{ui:Suprimeix}} a la barra d'eines, dins del menú {{ui:Més}}.
:::

## Eines

| Tecla | Eina |
|---|---|
| {{key:V}} | {{ui:Selecciona}} |
| {{key:M}} | {{ui:Mesura}}: distàncies, àrees i pendents al pla ([Mesura](topic:measure)) |
| {{key:A}} | {{ui:Traçat}} |
| {{key:G}} | {{ui:Plataforma}} |
| {{key:P}} | {{ui:Canonades}} |
| {{key:B}} | {{ui:Línia de ruptura}} |
| {{key:O}} | {{ui:Contorn}} |
| {{key:R}} | Mostra o amaga la vista de perfil |
| {{key:I}} | Activa o desactiva {{ui:Afegeix PVI}} (obre la vista de perfil si és tancada) |
| {{key:F}} | {{ui:Ajusta}}: mostra-ho tot |
| {{key:D}} | {{ui:3D}}: mostra el lloc en 3D, o torna al pla |
| {{key:E}} | Mostra o amaga els pendents i les cotes al llarg de cada línia característica (només a la pantalla) |

Si premeu de nou la tecla de l'eina activa, torneu a {{ui:Selecciona}}. Les lletres amb {{key:Shift}} no fan res.

## Mentre dibuixeu

| Tecla | Acció |
|---|---|
| {{key:Enter}} | Acaba el traçat, la plataforma, el recorregut de canonada, la línia de ruptura o el contorn |
| {{key:Backspace}} | Elimina l'últim punt on heu fet clic |
| {{key:C}} | Línia característica: activa o desactiva els arcs (després d'un vèrtex, feu clic a un punt de la corba, i després al seu final) |
| {{key:Esc}} | Cancel·la el dibuix (o l'enganxada); si es torna a premer (o si no hi ha res dibuixat), torna a {{ui:Selecciona}} i neteja la selecció |

## Vista del pla

| Tecla o acció | Resultat |
|---|---|
| Roda | Amplia o redueix el zoom al punter |
| Arrossegueu en un espai buit | Desplaça (en qualsevol eina; un clic curt encara fa clic; amb {{key:Shift}} premuda, dibuixa un quadre de selecció) |
| Arrossegueu amb el botó del mig | Desplaça |
| Arrossegueu amb el botó dret | Desplaça (no obre cap menú) |
| {{key:Space}} i arrossegueu | Desplaça |
| Clic | Selecciona (amb {{ui:Selecciona}}), o col·loca un punt (amb una eina de dibuix) |
| {{key:Shift}} i clic | Afegeix un punt topogràfic a la selecció, o el treu |
| {{key:Shift}} i arrossegueu | Dibuixa un quadre: els punts topogràfics que hi són dins s'afegeixen a la selecció. Arrossegueu al voltant d'ells per fer un [llaç](topic:lasso-selection) |
| {{key:Space}} mentre dibuixeu un llaç | Finestra, després intersecció, després tanca |
| Clic en enganxar | Posa els punts enganxats allà ({{key:Enter}} els posa a les seves coordenades pròpies) |
| Arrossegueu una nansa | Mou un PI, un cantó de plataforma o una estructura (un pas per desfer) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Desplaça, quan el pla té el focus (feu-hi clic primer) |
| {{key:Plus}} i {{key:Minus}} | Amplia i redueix el zoom al centre, quan el pla té el focus |

La tecla = amplia com {{key:Plus}}, així que no cal {{key:Shift}}.

## Vista de perfil

| Acció | Resultat |
|---|---|
| Clic amb {{ui:Afegeix PVI}} activat | Afegeix un PVI allà |
| Clic en un PVI | El selecciona |
| Arrossegueu un PVI | El mou (un pas per desfer) |
| {{key:Delete}} o {{key:Backspace}} | Elimina el PVI seleccionat ({{key:Backspace}} només quan la vista de perfil té el focus) |

La vista de perfil no fa zoom ni es desplaça.

## Pantalla i ajuda

| Tecla | Acció |
|---|---|
| {{key:F1}} | Obre o tanca l'ajuda (el panell lateral); {{ui:Ajuda}} a la barra de l'aplicació fa el mateix |
| {{key:Esc}} | Tanca el panell d'ajuda quan és obert |
| {{key:Ctrl+Shift+F}} | Canvia entre els modes de pantalla: pantalla completa, pantalla completa amb les barres amagades, i normal |
| {{key:Esc}} | Surt de la pantalla completa (la tecla pròpia del navegador) |

{{key:F1}} arriba a l'ajuda abans que CivilCraft el vegi, de manera que funciona en qualsevol eina. En la majoria de teclats de Mac, premeu fn amb F1, o feu clic a {{ui:Ajuda}}. {{key:Ctrl+Shift+F}} usa la tecla Control en totes les plataformes, inclòs el Mac. Vegeu [Com usar l'ajuda](common:help) per saber com cercar en aquesta ajuda.

## Ratolí, trackpad i tàctil

:::mouse
- La roda amplia el zoom al punter. Un ratolí amb roda de gir lliure amplia el zoom ràpidament: doneu-li girs curts.
- Desplaceu-vos amb qualsevol arrossegament en un espai buit, amb el botó del mig, amb el botó dret, o amb {{key:Space}} i arrossegueu.
:::

:::mac
Al trackpad d'un Mac:

- El desplaçament amb dos dits **amplia el zoom** (no desplaça), i pinçar també amplia el zoom.
- Per desplaçar-vos, premeu i arrossegueu en un espai buit amb un dit, o manteniu {{key:Space}} i arrossegueu.
- Un clic amb dos dits (clic dret) no obre cap menú i no fa res per si sol.
:::

:::touch
En una pantalla tàctil:

- El primer toc fa que els botons i les files de menú tinguin la mida d'un dit.
- Toqueu per seleccionar o per col·locar un punt; un dit arrossegat en un espai buit desplaça. Un toc pot tremolar una mica: només desplaça quan el dit s'ha mogut uns 10 píxels.
- Dos dits que pinçen amplien el zoom, i si es mouen junts desplacen.
- Arrossegueu una nansa o un PVI amb un dit. Les nanses ocupen l'amplada d'un dit al seu voltant.
- Mentre dibuixeu un traçat, una plataforma, una línia de ruptura, un contorn, un recorregut de canonada, una línia característica o una parcel·la, una barra sobre el pla ofereix {{ui:Acaba}} ({{key:Enter}}), {{ui:Desfés punt}} ({{key:Backspace}}) i {{ui:Cancel·la}} ({{key:Esc}}). Una pulsació llarga (mig segon sense moure's) també acaba.
- A {{ui:Selecciona}}, una pulsació llarga sobre un punt topogràfic l'afegeix a la selecció, o el treu, igual que fa {{key:Shift}} amb el clic.
- A la vista 3D, un dit orbita, dos dits pinçen i desplacen, i un toc tria.
- En tàctil no hi ha passada de ratolí, de manera que les lectures de la barra d'estat només s'actualitzen mentre hi ha un dit a la pantalla.
:::

## Tecles del navegador que guanyen

Algunes tecles pertanyen al navegador i mai no arriben a CivilCraft, per exemple {{key:Mod+W}} (tanca la pestanya), {{key:Mod+T}} (pestanya nova), {{key:Mod+N}} (finestra nova) i {{key:F11}} (pantalla completa als navegadors de Windows i Linux). CivilCraft no les fa servir. Si una drecera obre alguna cosa al navegador, feu clic una vegada al pla perquè la pàgina tingui el focus, i torneu-ho a provar.

## On és Mou

No hi ha cap ordre Mou: trieu {{ui:Selecciona}} i arrossegueu un punt o un vèrtex, o editeu-ne les coordenades a {{ui:Propietats}}. Vegeu [Editar punts](topic:edit-points).
