---
title: Selecció amb llaç de punts topogràfics
summary: Mantingueu premut Shift i arrossegueu un contorn a mà alçada al voltant dels punts topogràfics per seleccionar-los, com a finestra, intersecció o tanca; canvieu amb Space mentre arrossegueu. Un arrossegament recte encara dibuixa un quadre.
keywords: llaç, mà alçada, seleccionar punts, selecció, finestra, intersecció, tanca, espai, polígon, selecció per quadre, arrossegar amb Shift
from: 3dd4fcaa
---

## Què aprendreu

Com seleccionar punts topogràfics dibuixant al seu voltant, quan un quadre n'agafaria de no desitjats.

## Dibuixar un llaç

1. Feu clic a {{ui:Selecciona}} (o premeu {{key:V}}).
2. Mantingueu premut {{key:Shift}}, premeu sobre el plànol i arrossegueu **al voltant** dels punts que voleu, movent-vos primer cap a la **dreta**.
3. Deixeu anar.

Els punts dins del contorn s'afegeixen a la selecció. Un arrossegament que es queda a prop d'una línia recta dibuixa un quadre, com abans; tan bon punt es desvia d'aquesta línia (més d'uns 12 píxels), esdevé un llaç.

## Finestra, intersecció i tanca

| Arrossegueu | Llaç | Selecciona |
|---|---|---|
| Primer cap a la dreta | Finestra (contorn sòlid) | Els punts que hi ha dins |
| Primer cap a l'esquerra | Intersecció (discontínua, verda) | Els punts que hi ha dins, i els punts que el contorn toca |
| Premeu {{key:Space}} mentre arrossegueu | Finestra, després intersecció, després tanca | Tanca (un camí discontinu taronja, no tancat): els punts sobre els quals passa el camí |

La línia d'estat indica el llaç mentre arrossegueu. {{key:Esc}} mentre arrossegueu el cancel·la i no selecciona res.

:::tip
Una tanca és la manera ràpida de triar els punts topogràfics al llarg d'una vorada o d'una línia de rasa: arrossegueu al llarg d'ells i deixeu anar.
:::

## Vegeu també

- [Seleccionar, copiar i enganxar punts topogràfics](topic:copy-paste-points)
- [Tecles i ratolí](topic:keyboard)
