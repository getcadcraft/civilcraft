---
title: Línies de mostreig i perfils transversals
summary: Talleu seccions perpendiculars a un traçat, veieu el terreny, el projecte i el desmunt i el terraplè a cada punt quilomètric, i obteniu volums per àrees finals mitjanes.
keywords: diagrama de masses, punt d'equilibri, contracció, expansió, distància de transport, préstec, sobrant, fulls de seccions, fulls de perfils transversals, pdf de seccions, seccions, perfils transversals, línies de mostreig, vista de secció, desmunt, terraplè, àrees, volum per àrea final mitjana, moviment de terres, punt quilomètric, desplaçament, csv
from: 5060173c
---

Un perfil transversal mostra la carretera tal com es construirà: travessant el traçat en un punt quilomètric, el terreny existent, el projecte (el corredor o la plataforma ajustats) i el desmunt i el terraplè entre tots dos.

## Afegeix línies de mostreig

1. Seleccioneu un traçat. A **Propietats**, sota **Línies de mostreig**, feu clic a {{ui:Afegeix línies de mostreig}}.
2. Definiu **Cada** (la separació: 50 ft o 20 m com a inici), **Amplada esquerra** i **Amplada dreta** (fins on arriba cada secció des de l'eix).
3. Per tallar una secció en un punt quilomètric concret, escriviu-lo a **Afegeix un punt quilomètric** (per exemple `2+35`) i premeu {{key:Enter}}.

Les seccions es tallen a cada múltiple exacte de la separació, als dos extrems del traçat, al principi i al final de cada corba (PC i PT), i als punts quilomètrics que afegiu. Les línies de mostreig es mostren al plànol com a línies grises travessant el traçat; també surten en DXF, DWG i PDF a la capa C-ROAD-SCTN. Cada canvi és un sol pas: {{key:Mod+Z}} el desfà.

## La vista de secció

Obriu-la amb {{ui:Vista de secció}} a les **Propietats** del traçat, {{ui:Seccions}} sota **Superfície** › {{ui:Més}}, o amb {{key:X}}. Ocupa el lloc de la vista de perfil sota el plànol.

- Recorreu les seccions amb les fletxes de la seva barra, la llista de punts quilomètrics, o amb {{key:Left}} i {{key:Right}} amb la vista de secció enfocada ({{key:Home}} i {{key:End}} per a la primera i l'última).
- La línia grisa és el terreny existent, la línia vermella el projecte. El desmunt és ombrejat en taronja, el terraplè en verd. Els punts del corredor es marquen: CL (eix), EOP (vora del ferm), SH (espatlla) i DL (intersecció amb el terreny).
- La capçalera indica el punt quilomètric, les àrees de desmunt i terraplè d'aquesta secció i l'exageració vertical. **Ajusta** omple el plafó; trieu 1× per veure la secció a escala real.
- La línia gruixuda del plànol indica quina secció és a la pantalla.

## Fulls de seccions

{{ui:Fulls de seccions (PDF)}} sota **Línies de mostreig** posa cada secció en pàgines PDF, en files d'esquerra a dreta i de dalt a baix en ordre de punt quilomètric. Trieu el **Paper**, l'**Escala del plànol** (l'escala horitzontal de les seccions) i l'**Exageració del perfil** (1×, 2×, 5× o 10×); el diàleg indica quantes seccions caben en una pàgina i quantes pàgines resulten.

Cada secció mostra una quadrícula amb desplaçaments i cotes, el terreny (discontinu), el projecte, el desmunt i el terraplè ombrejats (taronja i verd), els punts del corredor, i sota seu el seu punt quilomètric i les seves àrees de desmunt i terraplè. Totes les seccions dels fulls tenen la mateixa mida, prou alta per a la més gran; quan això no cap a la pàgina amb l'exageració escollida, CivilCraft fa servir la més gran que hi cap i ho indica. La franja del títol indica el traçat, els punts quilomètrics d'aquella pàgina, les escales i "Full 1 de 3".

## Volums per àrees finals mitjanes

Entre dues seccions veïnes, el volum és la mitjana de les seves dues àrees per la distància entre els seus punts quilomètrics. La barra mostra els totals del traçat, i {{ui:CSV}} descarrega les àrees i els volums de cada secció amb els totals acumulats (iardes cúbiques per als projectes en peus, metres cúbics per als mètrics).

**Propietats** mostra els mateixos totals al costat dels volums pel mètode de quadrícula de [Volums de moviment de terres](topic:volumes). Són aproximacions diferents: seccions més properes les acosten, i en una carretera recta sobre terreny pla són iguals.

:::note
El desmunt i el terraplè només es compten dins de les àrees projectades (les línies d'intersecció amb el terreny d'un corredor o d'una plataforma), com fa el mètode de quadrícula. Sense corredor ni plataforma el projecte és el terreny, de manera que una secció no mostra desmunt ni terraplè.
:::

## Diagrama de masses

**Diagrama de masses** sota **Línies de mostreig** dibuixa el diagrama de masses a partir dels mateixos volums per àrees finals: al llarg dels punts quilomètrics, el total acumulat del desmunt menys el terraplè.

- **Contracció (−) o expansió (+) del desmunt** indica què ocupa una iarda cúbica de desmunt un cop col·locada com a terraplè: −10 % (el valor inicial, provisional) vol dir que es redueix a 0.9; la roca que s'expandeix podria ser +5 %. Useu la xifra del vostre informe geotècnic.
- On la línia puja la carretera és en desmunt; on baixa, en terraplè. Per sobre de zero (ombrejat en taronja) la terra es mou cap amunt del punt quilomètric; per sota de zero (verd), cap avall.
- Els **punts d'equilibri** són on la línia creua zero: entre dos d'ells el desmunt i el terraplè s'equilibren. La taula llista cada tram equilibrat, el volum mogut (el seu punt més alt o més baix) i la distància mitjana de transport (l'àrea ombrejada dividida per aquest volum).
- On la línia acaba fora de zero, el que sobra és **sobrant** (per sobre) o **préstec** (per sota). En aquest últim tram només es compta com a mogut el material més enllà del nivell on acaba.

{{ui:CSV}} desa l'ordenada de masses a cada secció, els trams i el factor.
