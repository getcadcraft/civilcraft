---
title: Unità all'importazione: un file dichiara le sue unità, oppure viene chiesto prima
summary: Quando un disegno o una mesh importato in un progetto dichiara le sue unità, CivilCraft le converte e lo indica. Quando non le dichiara, CivilCraft chiede prima di leggerlo e ricorda la risposta per quel file.
keywords: unità, importazione, DWG, DXF, STL, OBJ, rilievo, piedi, US survey feet, metri, millimetri, scala, dimensione errata, troppo grande, troppo piccolo, chiedere, ricordato, INSUNITS, unità del disegno
from: 60921963
---

## Cosa si fa

Portare un file in un progetto e assicurarsi che entri con la dimensione giusta.

## Passaggi

1. Aprire il file come di consueto: {{ui:Apri}}, trascinarlo sul piano, oppure usare il comando di importazione del disegno CAD.
2. Se il file dichiara le sue unità, non viene chiesto nulla: la finestra di importazione le mostra come **Come indicato nel disegno**.
3. Se non le dichiara, una finestra chiede **Unità di** del file prima che si apra la finestra di importazione. Scegliere quale sia un'unità nel file e fare clic su {{ui:Usa queste unità}}.
4. {{ui:Annulla}} (oppure {{key:Esc}}) salta il file. Niente di esso viene letto nel progetto.

## Quali file dichiarano le unità

- **DWG e DXF**: le unità di inserimento del disegno (`$INSUNITS`). Un file che non le ha viene interrogato. L'elenco **Unità del disegno** nella finestra di importazione parte dalla risposta data e può ancora essere modificato.
- **STL e OBJ** (forme libere del terreno): non dichiarano mai le unità. Viene chiesto.
- **Elenchi di punti** (CSV, TXT) ed elenchi di rilievo di cantiere: un elenco che dichiara la sua unità nelle prime righe viene convertito e la riga di stato lo indica. Quello che non ne dichiara alcuna viene interrogato alla pressione di {{ui:Importa}}, prima che i punti vengano inseriti. Le colonne di latitudine e longitudine passano invece attraverso il sistema di coordinate.
- **Il componente Nuvole di punti**: chiede quando si crea una nuvola il cui file non dichiara un'unità, ed etichetta i numeri della nuvola con l'unità che porta.
- **IFC e LandXML**: dichiarano le proprie unità; vengono convertiti nelle unità del progetto.
- **LAS, LAZ e raster di quota**: vengono posizionati in base al loro sistema di coordinate; la finestra del terreno chiede l'unità di quota quando il file non la indica.

## Utile da sapere

- La risposta viene ricordata per quel file su questo computer, in tutte le applicazioni CadCraft. La volta successiva che il file viene importato non viene chiesto nulla.
- Per essere interrogati di nuovo: la palette dei comandi ({{key:Mod+K}}) › **Chiedi di nuovo le unità dei file importati**.
- Un'unità dichiarata in un elenco viene letta dalle prime otto righe: una riga come `units: ft`, oppure intestazioni di colonna che portano tutte la stessa unità tra parentesi, come `Elevation (m)`.
