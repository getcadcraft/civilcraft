---
title: Tavole di planimetria e profilo
summary: Stampa un tracciato come insieme di tavole di planimetria e profilo in un unico PDF, con linee di raccordo tra di esse.
keywords: planimetria e profilo, tavole, stampa, pdf, linea di raccordo, produzione di planimetrie, planimetrie stradali, stampa del profilo, esagerazione verticale, set di tavole
from: 34b4ec78
---

Le tavole di planimetria e profilo sono il modo in cui si disegnano di solito le planimetrie stradali: ogni tavola mostra un tratto di strada due volte, la planimetria sopra e il profilo sotto, alla stessa scala orizzontale, così una progressiva si trova nello stesso punto in entrambe.

## Creare le tavole

1. Selezionare il tracciato. In **Proprietà**, fare clic su {{ui:Tavole di planimetria e profilo}}.
2. Scegliere la **Carta**, la **Scala di planimetria** e l'**Esagerazione del profilo** (quante volte il profilo è disegnato più alto di quanto sia lungo; si parte da 10×). La finestra indica quante tavole vengono prodotte e quanta parte del tracciato mostra ciascuna.
3. Per stampare solo una parte del tracciato, modificare **Da progressiva** e **A progressiva**.
4. Fare clic su {{ui:Scarica PDF}}. Il PDF ha una pagina per tavola.

## Cosa c'è su una tavola

| Parte | Cosa mostra |
|---|---|
| Planimetria | Tutto ciò che è sulla planimetria (curve di livello, punti di rilievo, il tracciato e la sua progressiva, corridoi, piazzali, linee caratteristiche, tubazioni, linee di campionamento), ruotato in modo che questo tratto attraversi la tavola, con una freccia del nord ruotata di conseguenza |
| Linee di raccordo | Una linea tratto-punto perpendicolare al tracciato a ciascuna estremità che prosegue su un'altra tavola, con etichetta "Linea di raccordo sta 5+50.00, vedi tavola 2" |
| Profilo | Il terreno esistente (tratteggiato), il profilo di progetto (rosso), la pendenza di ogni rettifilo e il PVI, la quota, L e K di ogni curva verticale; progressive lungo il fondo, quote su entrambi i lati |
| Cartiglio | Il nome del progetto, il tracciato e il suo intervallo di progressive, "Tavola 1 di 3", le scale orizzontale e verticale e l'esagerazione |

Il tratto per tavola è lungo quanto consente la finestra della planimetria alla scala, arrotondato per difetto a un multiplo intero di 50 ft (20 m) sui tratti lunghi oppure a un multiplo intero di 10 ft (5 m) su quelli brevi.

:::note
Se le quote del profilo non entrassero con l'esagerazione scelta, CivilCraft disegna ogni tavola con la più grande fra 10×, 5×, 4×, 2× e 1× che entra, e la barra di stato lo indica. Un tracciato curvo viene ruotato secondo la direzione dall'inizio alla fine di ciascun tratto, quindi la strada può salire o scendere leggermente sulla tavola.
:::
