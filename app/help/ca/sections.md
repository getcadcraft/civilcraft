---
title: Línies de mostreig i seccions transversals
summary: Talleu seccions en angle recte respecte a un traçat, vegeu el terreny, el disseny i el desmunt i terraplè a cada PK, i obteniu volums per àrees extremes mitjanes.
keywords: transport de massa, diagrama de massa, punt d'equilibri, contracció, esponjament, distància de transport, préstec, residus, plànols de seccions, plànols de seccions transversals, seccions pdf, seccions, seccions transversals, línies de mostreig, vista de secció, desmunt, terraplè, àrees, àrea extrema mitjana, volums per àrea extrema, moviment de terres, PK, desfasament, csv
from: 09639ce2
---

Una secció transversal mostra la carretera tal com es construirà: en travessar el traçat en un PK, el terreny existent, el disseny (el corredor o la plataforma nivellats) i el desmunt i terraplè entre tots dos.

## Afegeix línies de mostreig

1. Seleccioneu un traçat. A les **Propietats**, sota **Línies de mostreig**, cliqueu {{ui:Afegeix línies de mostreig}}.
2. Definiu **Cada** (l'espaiat: 50 ft o 20 m per començar), **Amplada esquerra** i **Amplada dreta** (fins on arriba cada secció des de l'eix).
3. Per tallar una secció en un PK concret, escriviu-lo a **Afegeix un PK** (per exemple `2+35`) i premeu {{key:Enter}}.

Les seccions es fan a cada múltiple exacte de l'espaiat, als dos extrems del traçat, a l'inici i al final de cada corba (PC i PT), i als PK que afegiu. Les línies de mostreig es veuen al plànol com a línies grises travessant el traçat; també surten en DXF, DWG i PDF a la capa C-ROAD-SCTN. Cada canvi és un pas: {{key:Mod+Z}} el desfà.

## La vista de la secció

Obriu-la amb {{ui:Vista de secció}} a les **Propietats** del traçat, amb {{ui:Seccions}} sota **Superfície** › {{ui:Més}}, o amb {{key:X}}. Ocupa el lloc de la vista del perfil sota el plànol.

- Passeu per les seccions amb les fletxes de la seva barra, la llista de PK, o {{key:Left}} i {{key:Right}} amb la vista de la secció enfocada ({{key:Home}} i {{key:End}} per a la primera i l'última).
- La línia grisa és el terreny existent, la línia vermella el disseny. El desmunt s'ombreja en taronja, el terraplè en verd. Els punts de corredor es marquen: CL (eix), EOP (vora de la calçada), SH (arcen) i DL (línia de tall).
- La capçalera mostra el PK, les àrees de desmunt i terraplè d'aquesta secció i l'exageració vertical. **Ajusta** omple el panell; trieu 1× per veure la secció a escala real.
- La línia gruixuda del plànol indica quina secció es veu a la pantalla.
- **Zoom i desplaçament:** la roda fa zoom al voltant del punter, i arrossegar mou la vista. {{ui:Ajusta}} (o {{key:F}}, o un doble clic) torna a ajustar tota la secció.

## Mesura en una secció

1. Cliqueu {{ui:Mesura}} a la barra de la secció, o premeu {{key:M}}. La indicació diu «Cliqueu el primer punt i després el segon».
2. Cliqueu dos punts. Cadascun s'encaixa al final d'una línia o a un punt del corredor (CL, EOP, SH, DL); manteniu {{key:Alt}} per a un punt lliure.
3. La lectura dona la distància horitzontal (ΔH), la distància vertical (ΔV), la pendent en per cent amb la seva relació, i la longitud recta, en les unitats del projecte.

Cliqueu de nou per començar una nova mesura. {{key:Esc}} l'esborra, i {{key:M}} desactiva Mesura.

## Plànols de seccions

{{ui:Plànols de seccions (PDF)}} sota **Línies de mostreig** posa cada secció en pàgines PDF, en files d'esquerra a dreta i de dalt a baix en ordre de PK. Trieu el **Paper**, l'**Escala del plànol** (l'escala horitzontal de les seccions) i l'**Exageració del perfil** (1×, 2×, 5× o 10×); el diàleg indica quantes seccions hi caben en una pàgina i quantes pàgines resulten.

Cada secció mostra una quadrícula amb distàncies i elevacions, el terreny (discontínua), el disseny, el desmunt i el terraplè ombrejats (taronja i verd), els punts del corredor, i sota seu el seu PK i les seves àrees de desmunt i terraplè. Totes les seccions dels plànols es dibuixen de la mateixa mida, prou altes per a la més gran; quan això no cap a la pàgina amb la vostra exageració, CivilCraft usa la més gran que hi cap i ho indica. La franja del títol indica el traçat, els PK de la pàgina, les escales i «Foli 1 de 3».

## A què es mesura el desmunt i el terraplè

Un corredor pot tenir capes sota el paviment: capes de paviment, components de plantilla, via. La **Volums mesurats fins a** de la barra de la secció tria fins on arriben el desmunt i el terraplè:

- **Superfície inferior** (l'inici): fins a la part inferior d'aquells components, de manera que el desmunt inclou el gruix de la composició del paviment.
- **Superfície superior**: només fins a la part superior del disseny, com abans que els components comptessin.

Les àrees de la capçalera, els volums de sota, el CSV i el transport de massa segueixen aquesta tria, i es desa amb el projecte.

## Volums per àrees extremes mitjanes

Entre dues seccions veïnes, el volum és la mitjana de les seves dues àrees per la distància entre els seus PK. La barra mostra els totals del traçat, i {{ui:CSV}} descarrega les àrees i volums de cada secció amb els totals acumulats (iardes cúbiques per als projectes en peus, metres cúbics per als mètrics).

Les **Propietats** mostren els mateixos totals al costat dels volums pel mètode de graella de [Volums de moviment de terres](topic:volumes). Són aproximacions diferents: seccions més properes les acosten, i en una carretera recta sobre terreny pla són iguals.

:::note
El desmunt i el terraplè només es compten dins de les àrees nivellades (les línies de tall d'un corredor o d'una plataforma), com fa el mètode de graella. Sense corredor ni plataforma el disseny és el terreny, de manera que una secció no mostra desmunt ni terraplè.
:::

## Transport de massa

**Transport de massa** sota **Línies de mostreig** dibuixa el diagrama de transport de massa a partir dels mateixos volums per àrees extremes: al llarg dels PK, el total acumulat de desmunt menys terraplè.

- **Contracció (−) o esponjament (+) del desmunt** indica què fa un metre cúbic de desmunt quan es col·loca com a terraplè: −10 % (el valor inicial, un marcador de posició) vol dir que es redueix a 0.9; la roca que s'esponja podria ser +5 %. Useu la xifra del vostre informe geotècnic.
- On la línia puja, la carretera és en desmunt; on baixa, en terraplè. Per sobre de zero (ombrejat taronja) la terra es mou cap amunt del PK; per sota de zero (verd), cap avall del PK.
- Els **Punts d'equilibri** són on la línia creua zero: entre dos d'ells, el desmunt i el terraplè s'equilibren. La taula llista cada tram equilibrat, el volum mogut (el seu punt més alt o més baix) i la distància mitjana de transport (l'àrea ombrejada dividida per aquell volum).
- On la línia acaba fora de zero, el que sobra és **residu** (per sobre) o **préstec** (per sota). En aquest últim tram només compta com a mogut la terra per sobre del nivell on acaba.

**CSV** desa l'ordenada de massa a cada secció, els trams i el factor.
