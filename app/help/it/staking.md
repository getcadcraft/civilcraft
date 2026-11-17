---
title: Creare un rapporto di picchettamento
summary: Elencare i picchetti lungo un tracciato alle progressive e agli scostamenti, oppure i punti di rilievo vicini, con progressiva, scostamento, nord, est, quote di progetto e del terreno, e sterro o riporto, e salvare il rapporto in CSV o PDF.
keywords: picchettamento, tracciamento, rapporto di picchettamento, foglio di sterro, foglio delle quote, progressiva, scostamento, sterro, riporto, impostazione, picchettamento di cantiere, come costruito
from: d8a4e9f1
---

Selezionare un tracciato e fare clic su **Rapporto di picchettamento** nelle sue **Proprietà**.

## Picchetti alle progressive e agli scostamenti

1. **Da** e **a**: le progressive da picchettare (1+50 oppure 150).
2. **ogni**: l'intervallo. I picchetti vanno a ogni multiplo, a entrambe le estremità e (con la casella spuntata) dove iniziano e finiscono le curve del tracciato.
3. **Scostamenti**: a sinistra e a destra del tracciato, guardando verso le progressive crescenti: `12 L, 0, 12 R`, `L12 CL R12` oppure `-12, 0, 12` (a sinistra il segno è meno). Un tracciato con un corridoio parte dai propri margini della carreggiata e dalle banchine.
4. **Numerazione da** e **con prefisso** danno il nome ai picchetti: 1, 2, 3, oppure S101, S102.

## Punti di rilievo vicino al tracciato

Scegliere **punti di rilievo vicino al tracciato** e quanto vicini. Ogni punto entro quella distanza riceve la sua progressiva e il suo scostamento, il progetto in quel punto e la propria quota come terreno: un controllo dei punti picchettati o rilevati come costruito.

## Cosa riporta il rapporto

| Colonna | Cosa indica |
|---|---|
| Punto | Il nome del picchetto, oppure il numero del punto di rilievo |
| Progressiva, Scostamento | Dove si trova lungo il tracciato: L a sinistra, R a destra |
| Nord, Est | Le sue coordinate |
| Quota di progetto | La superficie del corridoio sistemato in quel punto (dalla linea di intersezione con il terreno alla linea di intersezione), altrimenti il profilo di progetto sull'asse |
| Quota del terreno | La superficie esistente in quel punto, oppure la quota propria del punto di rilievo |
| Sterro/riporto | C quando il terreno è sopra il progetto (da abbassare), F quando è sotto (da alzare), al centesimo |

Un picchetto senza quota di progetto (fuori dal corridoio, oppure su un tracciato senza quota lontano dall'asse) non ha sterro o riporto; la finestra indica quanti sono.

## Salvare

- **CSV**: una riga di titolo, poi le colonne sopra, più sterro o riporto come numero con segno (terreno meno progetto) per fogli di calcolo e registratori di dati.
- **PDF**: pagine di tabella sul formato carta scelto, un picchetto per riga, sterri in arancione e riporti in verde, con il cartiglio come nelle altre tavole.

:::note
I picchetti sono calcolati dal progetto. Verificarli rispetto ai piani approvati prima di costruire qualsiasi cosa.
:::
