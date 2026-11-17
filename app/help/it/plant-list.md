---
title: L'elenco delle piante
summary: Circa 420 piante comuni delle zone temperate e mediterranee con dimensioni, rusticità, luce e acqua, ricercabili in qualsiasi lingua, più un proprio elenco salvato con il progetto.
keywords: elenco piante, banca dati piante, specie, nome botanico, nome comune, tavolozza piante, elenco per vivaio, zona di rusticità, csv, importa piante, esporta piante, le mie piante, elenco alberi, elenco arbusti, plantas, libreria di piante
from: 7ed09e7e
---

La sezione **Piante** del pannello di sinistra elenca ogni pianta che si può collocare. Fare clic su una pianta per vederne le dimensioni e per renderla la pianta usata da **Pianta**, **Aiuola** e **Siepe**.

## Cerca e filtra

Digitare in **Cerca**: qualsiasi parola del nome di una pianta in qualsiasi lingua (inglese, spagnolo, portoghese), il suo nome botanico, il suo tipo o una parola nelle sue note. Ogni parola digitata deve corrispondere, quindi `quercus evergreen` trova le querce sempreverdi. Gli accenti non contano.

Restringere l'elenco con **Tipo**, **Luce**, **Acqua** e **Zona di rusticità** (la zona USDA in cui si trova il sito: una pianta compare quando la zona rientra nel suo intervallo).

## Cosa contiene una pianta

| Campo | Significato |
|---|---|
| Tipo | Albero, arbusto, siepe, erba (prati compresi), perenne, copertura del suolo o rampicante |
| A maturità | Altezza e larghezza della pianta cresciuta in un giardino o in una strada, in metri |
| Alla messa a dimora | La dimensione con cui viene messa a dimora, e il suo contenitore |
| Interasse | Da centro a centro in un'aiuola o lungo una siepe |
| Zona di rusticità | Le zone USDA in cui di solito resiste |
| Luce, acqua, suolo | Ciò di cui ha bisogno |
| Note | Usi e avvertenze, come parti tossiche o una pianta che si diffonde |

:::note
L'elenco integrato è stato redatto per CadCraft a partire da conoscenze orticole generali: dimensioni tipiche, arrotondate. Non è il catalogo di nessun vivaio. Verificare dimensioni e rusticità con un vivaio locale. Le piante invasive più note della penisola iberica e di gran parte del mondo temperato sono escluse di proposito, e alcune che sono invasive in certe zone riportano una nota.
:::

## Le proprie piante

- **Aggiungi all'elenco di questo progetto** copia una pianta nell'elenco proprio del progetto, dove viene salvata con il progetto. Una pianta nell'elenco sostituisce quella integrata con la stessa chiave, così si possono modificare le sue dimensioni per la propria regione.
- **Importa un elenco di piante…** legge un CSV (o un file di piante). Il CSV richiede una colonna con il nome botanico e, idealmente, tipo, altezza e larghezza; vanno bene anche nomi di colonna nelle proprie parole (Latino, Nome comune, Altezza, Larghezza, Ampiezza, Zona). Vengono letti separatori a virgola, punto e virgola o tabulazione, e virgole decimali. Le dimensioni di messa a dimora, l'interasse e i contenitori vuoti assumono valori predefiniti sensati per il tipo.
- **Esporta come CSV** salva il proprio elenco (o, se è vuoto, le piante mostrate dalla ricerca) per aprirlo in un foglio di calcolo.

Un elenco di piante viene letto come qualsiasi file proveniente dall'esterno: ciò che non può essere usato viene escluso e conteggiato.

## Piante in altre applicazioni

L'elenco delle piante è una libreria unica per tutte le applicazioni CadCraft: BimCraft e ModelCraft hanno lo stesso elenco, ma il loro proprio **Colloca dalla libreria** non offre ancora piante. Oggi le piante arrivano a un modello BIM tramite l'IFC del paesaggio di CivilCraft (ogni pianta come `IfcGeographicElement`). Vedi [Piantumazione](topic:planting#ifc).
