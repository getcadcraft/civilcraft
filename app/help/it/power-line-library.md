---
title: La libreria delle linee elettriche
summary: Creare propri conduttori, cavi interrati, sostegni, apparecchiature e tipi di trincea, in categorie che si scelgono, e condividerli come file.
keywords: libreria, conduttore, cavo, palo, sostegno, mensola, isolatore, accessorio, tirante, strallo, trasformatore, armadio, giunto, trincea, categoria, csv, importa, esporta
from: 88733744
---

La sezione **Libreria** dell'area di lavoro Linee elettriche contiene ogni elemento che una linea o un cavo può usare. Nulla al suo interno è legato a un paese o a un produttore: si creano gli elementi con cui si lavora.

## Tre tipi di elementi

| Tipo | Dove si trova | Si può modificare? |
|---|---|---|
| **Esempi** | Forniti con CivilCraft, con valori generici ricavati dalle proprietà dei materiali | No: prima {{ui:Copia nella mia libreria}} |
| **Nel progetto** | Provengono dal file di progetto aperto | No: prima {{ui:Copia nella mia libreria}} |
| **Miei** | Elementi propri, conservati in questo browser | Sì, e le modifiche vengono salvate subito |

Ogni progetto conserva una copia di ogni elemento che utilizza, così un progetto si apre su qualsiasi computer con i propri conduttori e pali.

:::warning
Gli elementi di esempio sono solo esempi: verificare ogni valore con i dati del fornitore. I cavi interrati non hanno una portata di corrente di proposito, perché dipende da come il cavo viene posato.
:::

## Creare un elemento

1. In **Libreria**, scegliere il **Tipo** (conduttori aerei, cavi interrati, sostegni, apparecchiature o tipi di trincea).
2. Fare clic su {{ui:Nuovo elemento}}, oppure scegliere un esempio e fare clic su {{ui:Copia nella mia libreria}} o {{ui:Duplica}}.
3. Compilare i suoi campi. I campi contrassegnati con `*` sono quelli necessari alle verifiche; un elemento al quale ne manca uno viene contrassegnato con `!` ed elencato in **Verifiche** quando una linea lo usa.
4. Assegnare una **Categoria**, con `/` tra i livelli: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. L'albero segue le proprie categorie.

Cosa richiede ciascun tipo:

| Tipo | Necessario per le verifiche |
|---|---|
| Conduttore aereo | sezione, diametro, massa al metro, carico di rottura, modulo elastico, dilatazione termica |
| Cavo interrato | anime, sezione, tensione, diametro, resistenza, portata di corrente |
| Sostegno | lunghezza totale, carico nominale (riferito a un punto sotto la sommità), profondità nel terreno |
| Apparecchiatura | il suo tipo; una portata per mensole, accessori e tiranti; interasse delle fasi e caduta per le mensole; lunghezza per gli isolatori; l'angolo per i tiranti |
| Tipo di trincea | profondità, larghezza, ricoprimento sopra i cavi |

## Condividere

- {{ui:Salva la mia libreria}} salva tutti i propri elementi in un unico file `.cclines.json`; {{ui:Apri una libreria…}} lo rilegge (gli elementi con la stessa chiave vengono sostituiti).
- {{ui:Salva come CSV}} salva il tipo che si sta visualizzando come foglio di calcolo; {{ui:Apri una libreria…}} rilegge un CSV di quel tipo. Le colonne possono essere in qualsiasi ordine; un file separato da punto e virgola può usare la virgola decimale.
