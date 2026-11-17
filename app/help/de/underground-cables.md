---
title: Erdkabel
summary: Kabelstrecken im Graben zwischen Trägern und Betriebsmitteln, Überdeckung und Kreuzungen, Muffen nach Trommellänge sowie die Mengen für Graben und Kabel.
keywords: Erdkabel, Kabelstrecke, Graben, Leerrohr, Überdeckung, Kreuzung, Rohrkreuzung, Muffe, Trommel, Schrank, Transformator, Quelle, Spannungsabfall
from: adfd2717
---

## Eine Kabelstrecke zeichnen

1. Setzen Sie zuerst die Betriebsmittel, wenn das Kabel an einem Schrank, einem Transformator oder einer Muffe endet: {{ui:Betriebsmittel}}, dann klicken.
2. Klicken Sie auf {{ui:Kabel}} und dann auf die Strecke; Anfang und Ende auf einem Träger oder auf Betriebsmitteln verbinden sich damit. {{key:Enter}} beendet.

Wählen Sie unter **Eigenschaften** das **Kabel**, den **Grabentyp**, wie viele **Kabel nebeneinander** und die **Reserve** (%). Die Strecke zeigt ihre Länge, wo sie beginnt und endet und den Strom, den sie führt.

## Was geprüft wird

- **Überdeckung**: die Oberkante des Kabels liegt entlang der Strecke unter dem Gelände, geprüft gegen die Überdeckung des Grabentyps (oder die geringste Überdeckung des Regelsatzes).
- **Kreuzungen**: wo die Strecke eine CivilCraft-Rohrleitung oder ein anderes Kabel kreuzt, der Abstand zwischen ihnen gegen eine Abstandsregel: der eigene **Kreuzungsabstand** der Strecke (in ihren Eigenschaften), wenn Sie einen wählen, sonst die Regel **Erdkreuzungen** des Regelsatzes (die Beispielsätze verwenden *Erdkreuzung*, 0.3 m), sonst der Abstand des Grabentyps zu anderen Leitungen. Kreuzen sich zwei Kabel, gilt der größere ihrer beiden Werte. Eine gekreuzte Freileitung wird zur Information aufgeführt, und das Kabel erscheint im Längsschnitt dieser Leitung.
- **Muffen**: eine je Trommellänge des Kabels (mit Reserve), wenn der Kabelartikel eine Trommellänge angibt.

## Betriebsmittel

Betriebsmittel haben ein Bibliothekselement, eine **Last** (kW) mit ihrem **Leistungsfaktor**, und können **eine Quelle** sein: Das Netz wird von dort gespeist. Die Spannung einer Quelle stammt aus ihrem Bibliothekselement oder sonst aus der Leitung oder dem Kabel, das sie speist.

## Mengen

{{ui:Mehr}} › {{ui:Mengen…}} zählt das Kabel (Streckenlänge × (1 + Reserve) × Kabel nebeneinander + der Anstieg an jedem Ende), den Graben nach Typ, die Aushub-, Bettungs- und Verfüllmassen, Leerrohre und Muffen, mit Leiter, Trägern und Betriebsmitteln der Freileitungen.
