---
title: Dibuixa amb referències a objectes, cantonades triades i mou, copia i gira
summary: Situeu traçats, plataformes, parcel·les i línies característiques exactament sobre punts i cantonades que ja teniu, escriviu o trieu l'est i el nord d'una cantonada, orienteu una tangent cap a dos punts, i mogueu, copieu o gireu un objecte per una distància o un angle.
keywords: referència a objectes, referències a objectes, osnap, pas a punt, pas a cantonada, PI, vèrtex, cantonada, triar, creueta, est, nord, coordenades, coordenades escrites, tangent, direcció, rumb, mou, copia, gira, transforma, copia girada, duplica, Alt, punt lliure, dibuix
from: 49864dda
---

Novetat a la 0.9: quan dibuixeu, el cursor cau sobre els punts i les cantonades que ja hi ha al plànol, i es pot escriure o triar una cantonada de plataforma, parcel·la o línia característica. Aquest tema repassa les tres eines.

## Què farem

- Dibuixar amb referències a objectes, de manera que un traçat, una plataforma, una parcel·la o una línia nova comenci i acabi exactament sobre quelcom que ja existeix.
- Fixar l'est i el nord d'una cantonada escrivint-los o triant un lloc al plànol.
- Orientar una tangent d'un traçat cap a dos punts triats.
- Moure, copiar o girar un objecte sencer.

## Passos

1. Trieu una eina de dibuix, per exemple {{ui:Traçat}}, {{ui:Plataforma}}, {{ui:Parcel·la}} o {{ui:Línia característica}}. Mogueu el punter a prop d'un punt topogràfic, d'un PI de traçat, d'una cantonada de plataforma, de parcel·la o de massa, d'un vèrtex de línia característica o d'una estructura pluvial. Apareix un marcador amb una etiqueta (PI, Cantonada, Vèrtex, Estructura o Punt i el seu número) i l'est i el nord on hi aterrarà. Feu clic per col·locar el punt allà.
2. Per col·locar un punt lliurement, manteniu premut {{key:Alt}} mentre feu clic. La referència es desactiva.
3. Seleccioneu una plataforma, una parcel·la o una línia característica. A **Propietats**, el bloc {{ui:Vèrtexs}} enumera cada vèrtex amb una casella d'Est i una de Nord. Escriviu números nous, o premeu el botó de creueta al costat d'un vèrtex i feu clic a un lloc del plànol. El vèrtex agafa aquest est i aquest nord. Premeu {{key:Esc}} per cancel·lar una selecció. La creueta només funciona al plànol: tanqueu primer la vista 3D.
4. Per girar una tangent, seleccioneu un traçat. A **Propietats**, sota {{ui:Tangent a partir de dos punts}}, trieu la tangent, premeu {{ui:Primer punt}} i feu clic al plànol, premeu {{ui:Segon punt}} i torneu a fer clic, i després premeu {{ui:Defineix la direcció}}. La tangent es gira perquè vagi del primer punt cap al segon i manté la seva longitud.
5. Per moure, copiar o girar, seleccioneu un traçat, una plataforma, una parcel·la o una línia característica. A **Propietats**, sota {{ui:Mou, copia i gira}}, escriviu {{ui:Mou a l'est}} i {{ui:Mou al nord}} (els números negatius van a l'oest i al sud) i premeu {{ui:Mou}} o {{ui:Copia}}. O premeu {{ui:Distància a partir de dos punts}} i feu clic al punt des d'on es mou i al punt on arriba.
6. Per girar, escriviu l'angle a {{ui:Gira en sentit antihorari}} (en graus), i després premeu {{ui:Gira}} o {{ui:Copia girada}}. Gira al voltant del punt mig dels seus vèrtexs, tret que trieu, amb la creueta al costat de l'angle, un punt al voltant del qual girar.

## Notes

- Una còpia deixa l'original al seu lloc i queda seleccionada després.
- Cada moviment, còpia, gir, cantonada fixada i tangent girada és un pas de desfer.
- Les referències arriben a 10 píxels de pantalla des del cursor. Un marcador de referència només ofereix un lloc; no es canvia res fins que feu clic.
- La mateixa creueta hi ha a les files de PI d'un traçat. Vegeu [Traçats](topic:alignment), [Parcel·les](topic:parcels) i [Línies característiques](topic:feature-lines).
