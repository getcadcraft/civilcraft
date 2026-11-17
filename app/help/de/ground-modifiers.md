---
title: Geländeänderungen und Live-Höhen
summary: Alles, was das Planungsgelände formt, in einer geordneten Liste (die spätere gewinnt, wo sich Bereiche überschneiden), Abtrag und Auftrag je Änderung, Anschlussprüfungen im Bereich Probleme sowie Höhenpunkte und Gefällepfeile, die das Gelände live auslesen.
keywords: Geländeänderungen, Stapel, Reihenfolge, Planungsgelände, Bestandsgelände, Überschneidung, Abtrag und Auftrag, Anschluss, Stützmauer, Pflasterkante, Sohlhöhe, Stufenpodest, Höhenpunkt, Höhenkote, Gefällepfeil, Gefälleangabe, Gefälle
from: 3998a5b0
---

Planungsgelände = Bestandsgelände + die Geländeänderungen, in dieser Reihenfolge. Das Bestandsgelände wird nie verändert.

## Die Liste

{{ui:Levels}} › {{ui:Ground modifiers…}} listet jedes Objekt auf, das das Gelände formt: Plattformen, Erdwälle, Mulden, Modellierungsflächen, Pflaster und Wege, bepflanzte Flächen mit einer Endhöhe sowie Stufen und Rampen, bei denen das Kästchen **Formt das Gelände** aktiviert ist (mit ihrer Unter- und Oberkante). Wo sich zwei überschneiden, gewinnt das **spätere**. Ziehen Sie eine Zeile oder nutzen Sie die Pfeile, um die Reihenfolge zu ändern; das Gelände wird sofort neu berechnet. Jede Zeile zeigt ihren Abtrag und Auftrag (was sie nach den darüber liegenden formt), die Summe steht unter der Liste.

## Anschlussprüfungen

Der Bereich Probleme listet mit **Gehe zu**:

- eine Mauer, deren hohe Seite über ihrer Oberkante liegt (Erde über der Mauer), oder deren niedrige Seite ihr Fundament zeigt;
- eine Bepflanzungsfläche, deren Endhöhe über der anstoßenden Pflasterkante liegt oder mehr als die übliche 150 mm darunter;
- Stufen, deren Unter- oder Oberkante nicht an das Pflaster anschließt, auf dem sie enden;
- zwei Änderungen, die sich überschneiden (die spätere gewinnt dort).

Eine Stützmauer kann ihre Oberkante der hohen Geländeseite folgen lassen: Ihre Höhe wird bei jeder Geländeänderung neu berechnet.

## Eine Stützmauer, die das Gelände formt

Wählen Sie eine Stützmauer und aktivieren Sie **Formt das Gelände**. Der Streifen unter der Mauer (so breit, wie die Mauer dick ist) wird als Änderung in die Liste aufgenommen:

- Die Kante auf der **hohen Seite** wird dort Station für Station am Gelände gehalten, sodass die Oberkante der Mauer der hohen Seite folgt (mit der Mauerabdeckung obenauf). Geben Sie eine **Oberkante** ein, wird stattdessen die hohe Seite auf dieser Höhe abzüglich der Abdeckung gehalten;
- die Kante auf der **niedrigen Seite** wird auf der Höhe **Gelände auf der niedrigen Seite halten** gehalten, die Sie eingeben, oder bei leerem Feld am dortigen Gelände;
- die hohe Seite ist die Seite, deren Gelände über die ganze Mauer höher liegt, sodass sie sich entlang der Mauer nie umkehrt;
- das Gelände jenseits des Streifens bleibt unverändert, und das Bestandsgelände wird nie verändert.

Wie jede Änderung steht sie in der Liste; eine danach aufgeführte Änderung gewinnt dort, wo sie sich überschneiden. Eine Mauer, deren gehaltene Höhe an einem Ende mehr als die übliche 150 mm vom dortigen Bestandsgelände abweicht, erhält im Bereich Probleme eine Warnung (mit **Gehe zu**). Eine freistehende Mauer formt das Gelände nicht. Das Kästchen ist in Dateien aus früheren Versionen ausgeschaltet, sodass diese so geöffnet werden, wie sie waren.

## Höhenpunkte und Gefällepfeile

{{ui:Spot level}} (ein Klick) und {{ui:Gradient arrow}} (zwei Klicks) lesen das Gelände jedes Mal, wenn sie gezeichnet werden: Verschieben oder neu auf Höhe bringen eines Objekts, und die Beschriftungen folgen. Wählen Sie in den Eigenschaften, ob eine Beschriftung das Planungs- oder das Bestandsgelände liest; Beschriftungen des Bestandsgeländes stehen in Klammern. Pfeile zeigen bergab und tragen `1:20 (5.0 %)`.
