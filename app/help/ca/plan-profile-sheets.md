---
title: Fulls de planta i perfil
summary: Traceu un traçat com a conjunt de fulls de planta i perfil en un sol PDF, amb línies de concordança entre ells.
keywords: planta i perfil, fulls, traça, pdf, línia de concordança, producció de plànols, plànols de carreteres, traçat del perfil, exageració vertical, joc de fulls
from: 34b4ec78
---

Els fulls de planta i perfil són la manera habitual de dibuixar plànols de carreteres: cada full mostra un tram de la carretera dues vegades, la planta a dalt i el perfil a baix, a la mateixa escala horitzontal, de manera que un PK queda al mateix lloc en tots dos.

## Fer els fulls

1. Seleccioneu el traçat. A **Propietats**, feu clic a {{ui:Fulls de planta i perfil}}.
2. Trieu el **Paper**, l'**Escala del plànol** i l'**Exageració del perfil** (quantes vegades més alt es dibuixa el perfil del que és llarg; 10× per començar). El diàleg indica quants fulls resulten i quina part del traçat mostra cadascun.
3. Per traçar només una part del traçat, canvieu el **Des del PK** i el **Fins al PK**.
4. Feu clic a {{ui:Baixa el PDF}}. El PDF té una pàgina per full.

## Què hi ha en un full

| Part | Què mostra |
|---|---|
| Planta | Tot el que hi ha al plànol (corbes, punts topogràfics, el traçat i el seu PK, corredors, plataformes, línies característiques, canonades, línies de mostra) girat perquè aquest tram travessi el full, amb una fletxa del nord girada en conseqüència |
| Línies de concordança | Una línia de traç i punt perpendicular al traçat a cada extrem que continua en un altre full, etiquetada "Línia de concordança PK 5+50.00, vegeu el full 2" |
| Perfil | El terreny actual (discontinu), el perfil de projecte (vermell), la pendent de cada tangent i el PVI, la cota, L i K de cada corba vertical; els PK a la part inferior, les cotes als dos costats |
| Caixetí | El nom del projecte, el traçat i el seu interval de PK, "Full 1 de 3", les escales horitzontal i vertical i l'exageració |

El tram per full és tan llarg com permet la finestra del plànol a l'escala, arrodonit a la baixa a 50 ft (20 m) sencers en trams llargs o a 10 ft (5 m) sencers en trams curts.

:::note
Quan les cotes del perfil no hi cabrien amb l'exageració triada, CivilCraft dibuixa tots els fulls amb la més gran de 10×, 5×, 4×, 2× i 1× que hi càpiga, i la barra d'estat ho indica. Un traçat corbat es gira segons la direcció de l'inici a la fi de cada tram, de manera que la carretera pot pujar o baixar lleugerament al full.
:::
