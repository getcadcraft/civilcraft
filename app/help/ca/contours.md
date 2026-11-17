---
title: Llegeix corbes de nivell, elevacions i pendents
summary: Defineix l'equidistància i les corbes principals, mostra bandes d'elevació, fletxes de talús i triangles, i llegeix les elevacions del terreny sota el punter.
keywords: corbes de nivell, equidistància, corbes principals, etiquetes, bandes d'elevació, fletxes de talús, triangles, cota puntual, anàlisi de superfícies, anàlisi d'elevacions, anàlisi de pendents
from: 585e500a
---

La superfície es mostra amb corbes de nivell tan bon punt existeix. Tot el que tracta aquest tema es defineix a **Visualització** del tauler esquerre. Els ajustos de visualització només canvien el que veieu (i el que s'exporta); no són passos de desfer.

## Defineix l'equidistància de corbes

1. A **Visualització**, trieu un valor a **Corbes cada**.
   - En peus: 0.25, 0.5, 1, 2, 5, 10 o 20 ft.
   - En metres: 0.1, 0.25, 0.5, 1, 2, 5 o 10 m.
2. Trieu **Major cada**: la 2a, 4a, 5a o 10a corba.
   Les corbes principals es dibuixen més gruixudes i s'etiqueten amb la seva elevació. Cauen en múltiples exactes de l'espaiat major (amb corbes de 1 ft i una principal cada 5: 245, 250, 255 …).
3. Desactiveu {{ui:Etiquetes de corbes}} si les etiquetes amunteguen un plànol petit.

Un projecte nou comença amb 1 unitat i cada 5a corba és principal. Les corbes es doblen a les línies de ruptura; si travessen en línia recta una línia de drenatge o una carena, aquella línia encara no és una línia de ruptura (vegeu [Construeix i refina la superfície](topic:build-surface)).

:::note
Les corbes només es dibuixen quan hi ha no més de 2.000 nivells entre el punt més baix i el més alt. En un solar amb molt relleu i una equidistància molt petita, el plànol no mostra cap corba: trieu una equidistància més gran.
:::

## Suavitza les corbes

Les corbes es tracen com a trams rectes, un per cada triangle de la superfície, de manera que giren una petita cantonada a cada aresta del triangle. **Suavitat de corbes** a **Visualització** arrodoneix aquestes cantonades:

- **Cap (trams rectes)**: les línies tal com s'han traçat. És el que mostra un dibuix nou o antic.
- **Lleu**: cantonades arrodonides una mica. Una línia mai no es desplaça més del 10% del camí cap a la corba següent, i mai més lluny del seu tram recte que una sisena part de la longitud d'aquest tram.
- **Forta**: una corba fluida. Una línia mai no es desplaça més del 25% del camí cap a la corba següent, i mai més lluny del seu tram recte que una tercera part de la longitud d'aquest tram.

Amb qualsevol de les dues opcions, una corba suavitzada encara travessa cada aresta del triangle al mateix punt que la traçada, es queda dins del triangle que travessa cada tram i, per tant, mai no pot encreuar-se ni tocar una altra corba. On una corba travessa una línia de ruptura o el contorn, conserva la seva corba aguda. Les línies suavitzades són les que es dibuixen i s'exporten (DXF, DWG, PDF, GIS i 3D), i tenen més vèrtexs que les traçades.

La suavitzacio només canvia les línies dibuixades. Les elevacions, els volums, els perfils i les seccions continuen llegint-se de la mateixa superfície. Una corba que passa exactament per punts topogràfics (un punt a 250.00 a la corba 250) conserva una petita cantonada a cadascun d'aquests punts.

## Com es fa la superfície darrere de les corbes

Les corbes segueixen la superfície, i la superfície segueix el **Mètode de traçat de corbes** a **Superfície** del tauler esquerre. Per defecte, **Triangulació amb interpolació lineal**, uneix els punts en triangles i conserva exactament cada punt i cada línia de ruptura. Els altres mètodes ajusten primer una graella regular als punts (kriging, curvatura mínima, veí natural, distància inversa i d'altres), cosa que dóna corbes més arrodonides entre punts però no passa exactament per cada punt; l'informe de superfície que hi ha a **Superfície** indica quant s'allunya el resultat dels vostres punts.

**ABOS (aproximació basada en suavitzat)** és un dels mètodes de graella. Té dos ajustos propis: **Suavitat** (0.5 per començar; com més baix, més suau) i **Precisió** (1 per començar: la superfície s'ajusta a menys d'un 1% del rang d'alçades del solar als vostres punts; escriviu un número més petit per a un ajust més proper). Si no pot assolir la precisió amb la graella que té, l'informe de superfície ho diu: escriviu una **Separació de la graella** més petita.

## Llegeix una elevació en qualsevol punt

Moveu el punter sobre el plànol. La barra d'estat mostra:

- **E** i **N** sota el punter
- **Terreny** i l'elevació actual del terreny allà, interpolada al triangle sota el punter
- **Explanat** i l'elevació projectada, quan una plataforma o un corredor ha canviat el terreny
- "Fora de la superfície" fora de la superfície

Per llegir un punt topogràfic exactament, trieu {{ui:Selecciona}} i feu clic al punt: el tauler dret mostra el seu número, l'est, el nord, l'elevació, la descripció i el grup.

## Mostra bandes d'elevació

1. Marqueu {{ui:Bandes d'elevació}}.
   La superfície s'omple de color, de baix (blau-verd) a alt (ocre-marró). Una llegenda sota les caselles enumera el rang d'elevació de cada banda.
2. Trieu quantes bandes a **Bandes**: 5, 8, 10 o 12. Les bandes divideixen el rang des de l'elevació més baixa fins a la més alta en passos iguals.

Les bandes són només per mirar. No s'exporten a DXF ni s'imprimeixen a PDF.

## Mostra fletxes de talús

Marqueu {{ui:Fletxes de talús}}. Una fletxa curta a cada triangle prou gran per contenir-ne una apunta cap avall. Els triangles plans no tenen fletxa. Les fletxes serveixen per comprovar ràpidament la direcció del drenatge; el valor del talús encara no s'etiqueta.

## Mostra triangles, punts i arestes

- {{ui:Triangles}} dibuixa les arestes del TIN. Activeu-lo per comprovar com la superfície connecta els punts, sobretot al llarg de les línies de ruptura i a la vora exterior.
- {{ui:Punts}} dibuixa cada punt topogràfic; {{ui:Etiquetes de punts}} hi afegeix el seu número, la seva elevació i la seva descripció (o només part d'aquesta informació: vegeu **Etiquetes de punts** a [Configuració de CivilCraft](topic:settings)).
- {{ui:Línies de ruptura}} dibuixa les línies de ruptura (i el límit) en taronja.
- {{ui:Vora de la superfície}} dibuixa el contorn de la superfície.

## Existent o projectat

Quan una plataforma o un corredor s'ha explanat sense problemes, **Superfície** dins de **Visualització** ofereix {{ui:Projectat (explanat)}}. Les corbes, les bandes i les fletxes mostren aleshores la superfície explanada, perquè vegeu el terreny nou i el tall al seu voltant. Torneu a {{ui:Terreny actual}} per veure l'aixecament topogràfic.

## Què s'exporta

La sortida DXF i PDF segueix aquests ajustos: el que heu desactivat no s'escriu, i les corbes són les de la superfície mostrada. Les bandes d'elevació no s'exporten mai.
