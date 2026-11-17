---
title: Disposició de l'aparcament
summary: Disposa places, carrils, places accessibles i per a furgonetes i illes dins d'un contorn, anivella l'aparcament amb pendents cap als desguassos respecte del terreny actual, i després pavimenta'l i planta'l. També disponible per a un assistent.
keywords: aparcament, plaça d'aparcament, carril, accessible, ada, furgoneta, illa, desguàs, pendent, anivellació, desmunt, terraplè, pavimentació, llambordes, plantació, arbres, terreny, núvol de punts, mcp, assistent
from: 06c14da9
---

Encaixeu un aparcament en una parcel·la, una plataforma o una línia característica tancada, i obteniu els recomptes, l'anivellació i la pavimentació en un sol pas.

## Disposa'l

1. Seleccioneu una parcel·la, una plataforma o una línia característica tancada al plànol.
2. Obriu **Superfície, Més, Aparcament...**
3. Trieu les regles, l'angle de les places (90, 75, 60, 45, 30 graus o paral·lel) i carrils d'un sentit o de dos sentits. Les mides de les places, dels carrils i de les illes parteixen de la taula, i cadascuna es pot escriure per sobre.
4. Trieu **Disposa**.

Les files van al llarg de la vora del contorn que dona més places (o a l'angle que escriviu). Una plaça només compta si queda completament dins del contorn. Quan queda espai per a una fila i un carril, s'hi afegeix una franja d'una sola fila. La finestra enumera les places, les places accessibles i per a furgonetes, les illes, els desguassos i l'àrea per plaça, i el plànol mostra les places, les places accessibles amb els seus carrils d'accés ratllats, les illes, les línies centrals dels carrils i els desguassos a les seves pròpies capes (C-PARK-...), perquè arribin al PDF, DXF i DWG.

## Places accessibles

Amb les normes dels Estats Units, el recompte segueix la taula 208.2 de les 2010 ADA Standards per a les places previstes (una de cada sis, arrodonida cap amunt, és una plaça per a furgonetes), situada a prop del primer vèrtex del contorn (l'entrada), cadascuna amb un carril d'accés; dues en comparteixen un. Una plaça més estreta que l'amplada accessible, o un pendent més pronunciat que 1:48 a les places accessibles, apareix com a problema. **Aquests números s'han escrit a partir de la norma tal com es recorda i no s'han comprovat amb la norma impresa.** Les mides típiques de places i carrils provenen de guies de disseny d'aparcaments i també no estan comprovades. Comproveu-ho tot dos i també la normativa local abans de confiar-hi. Trieu **Personalitzat** per introduir el vostre propi recompte de places accessibles.

## Pendents cap als desguassos, desmunt i terraplè

Si no ho desactiveu, l'aparcament es converteix en una àrea d'explanació a l'espai de treball Paisatge. Els desguassos es posen a les línies centrals dels carrils cada uns 100 feet (30 m); la superfície puja des de cada desguàs amb el pendent que indiqueu (1.5 per cent a l'inici), de manera que cada punt cau cap al seu desguàs més proper. El nivell s'escull perquè el desmunt i el terraplè de l'aparcament quadrin amb el terreny actual. El terreny actual és la superfície existent del projecte, que pot venir de punts topogràfics, d'un LandXML, d'un núvol de punts lidar o d'escaneig convertit en superfície, o de corbes de nivell. La finestra mostra l'estimació de desmunt i terraplè; els volums propis del projecte mostren després la xifra exacta. L'àrea d'explanació manté la seva vora sobre el terreny actual, de manera que quan la nova superfície es diferencia del terreny a la vora apareix un graó, i la finestra indica la seva mida.

## Pavimentació i plantació

Tot el contorn rep una pavimentació de llambordes (un patró de soga que podeu canviar a Paisatge, Elements durs) i cada illa rep un parterre d'arbustos i, quan és prou ampla, un arbre, pres de la llista de plantes. Després tot és un objecte normal de Paisatge: editeu-lo, o trieu **Disposa de nou** per substituir el que va generar l'aparcament. Eliminar l'aparcament elimina el que va generar.

## Des d'un assistent

Es pot demanar el mateix aparcament per MCP: `parking_layout` en fa una vista prèvia, `parking_build` l'escriu, `parking_remove` elimina un aparcament. Demaneu-lo pel nom de la parcel·la o envieu el contorn.

## Què no està fet

No es comprova si els carrils arriben a un carrer. La pavimentació cobreix tot el contorn, de manera que la seva àrea inclou les illes. Les opcions de material de pavimentació de la Biblioteca i un tipus de la Biblioteca per a les places encara no estan implementades; el patró de pavimentació és el d'Elements durs. Encara no hi ha cap altra normativa de cap altre país implementada.
