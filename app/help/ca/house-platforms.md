---
title: Plataformes de casa en terrenys inclinats
summary: Anivellar una plataforma en un turó: murs de contenció com a vores de la plataforma, el mapa de desmunt i terraplè ombrejat per profunditat amb cotes puntuals (planta i 3D), una secció dibuixada en qualsevol punt pel terreny i el projecte, i rampes o plataformes inclinades per a accessos.
keywords: plataforma, plataforma de casa, terreny inclinat, turó, mur de contenció, desmunt i terraplè, mapa de desmunt i terraplè, cotes puntuals, secció lliure, línia de secció, plànols per a l'ajuntament, accés, rampa, plataforma inclinada, pendent, moviment de terres
from: daa08a3f
---

Una plataforma de casa és una **plataforma** (**Disseny** › {{ui:Plataforma}}): un polígon pla a un sol nivell, anivellat dins el terreny. Quatre coses ajuden en un pendent.

## Murs de contenció com a vores de la plataforma

Seleccioneu la plataforma i definiu un costat com a {{ui:Vertical (mur de contenció)}} en lloc d'un pendent (**Propietats** › {{ui:Costats i murs de contenció}}, o {{ui:Vertical: murs de contenció}} per a tots els costats alhora). L'alçada del mur es llegeix del terreny al llarg seu: el cim al terreny, la base a la plataforma. Es mostra als dos extrems i al seu punt més alt al pla, amb un avís quan és més alt que el límit que heu definit. Els murs i els pendents es poden combinar costat per costat.

## El mapa de desmunt i terraplè

Marqueu {{ui:Mapa de desmunt i terraplè}} sota **Mostra**. El pla s'ombreja segons la profunditat del desmunt o del terraplè, en graons iguals (desmunt càlid, terraplè blau, gairebé pla pàl·lid), amb una llegenda. Les **cotes puntuals** s'imprimeixen a la plataforma: el canvi de cota en punts d'una quadrícula, i el desmunt més profund i el terraplè més alt, marcats amb ▲. Les cel·les són les mateixes que usen els volums de moviment de terres, de manera que el mapa i els números sempre coincideixen.

A la vista 3D, trieu **Desmunt i terraplè** de la llista de colors per estendre els mateixos colors sobre el terreny i el projecte.

El factor d'esponjament o de contracció és a l'eina {{ui:Diagrama de masses}} (**Disseny** › {{ui:Diagrama de masses}}); no s'aplica als volums de la plataforma.

## Una secció lliure

Sota **Superfície** › {{ui:Més}}, trieu {{ui:Secció lliure}}, feu clic als punts de la línia de secció on sigui (pot fer revolts) i premeu {{key:Enter}}. Un diàleg dibuixa la secció: el terreny actual, el projecte anivellat (de trets) i el desmunt i terraplè entre tots dos, ombrejats, amb les seves àrees (el projecte només compta dins les plataformes i els camins). {{ui:Exageració vertical}} pren per defecte el valor que encaixa el dibuix; {{ui:Desa com a SVG}} i {{ui:Desa com a CSV}} us donen un dibuix per a l'ajuntament i els números.

## Rampes i plataformes inclinades

Sota **Superfície** › {{ui:Més}}, trieu {{ui:Rampa o plataforma inclinada}}, feu clic a l'extrem baix i després a l'alt, premeu {{key:Enter}}, i indiqueu l'amplada, la cota de l'extrem baix i el pendent. La plataforma és una franja els cantons de la qual porten aquestes cotes (la vora entre dos cantons va a un pendent constant), i s'anivella dins el terreny com qualsevol plataforma. Els cantons de qualsevol plataforma també poden portar les seves pròpies cotes, de manera que un accés de cotxes, una rampa o una terrassa inclinada és una plataforma amb una cota a cada cantó.
