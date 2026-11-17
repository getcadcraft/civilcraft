---
title: Disporre un layout proprio e salvare le configurazioni
summary: Scegliere quale pannello mostra il browser di progetto, Proprietà o il contenuto proprio del pannello, dove va la casella degli strumenti e che cosa contengono le barre, salvarlo come layout personale e conservare intere configurazioni con un nome per passare dall'una all'altra.
keywords: layout, area di lavoro, disponi, personalizza, il mio layout, layout proprio, pannelli, editor, browser di progetto, proprietà, casella degli strumenti, barra rapida, riquadro informazioni, ambiente di lavoro, configurazione, profilo, salva configurazione, passa a configurazione, esporta configurazione, importa configurazione, ccenv
from: 6af528e0
---

Oltre ai tre layout predefiniti si può disporne uno proprio e salvare l'intera configurazione con un nome, per tornarvi con un solo passaggio.

## Disporre un layout proprio

1. Aprire {{ui:Impostazioni}} (l'ingranaggio, oppure {{key:Mod+,}}), scegliere {{ui:Globali}}, poi {{ui:Layout}}.
2. Scegliere {{ui:Disponi il proprio layout…}}. La finestra parte dal layout in uso.
3. Assegnare un nome, poi scegliere:
   - **Sopra il disegno:** la barra degli strumenti dell'app, una barra multifunzione oppure nessuna delle due; una barra del titolo; un riquadro informazioni e quali comandi contiene.
   - **Accanto al disegno:** la casella degli strumenti a sinistra, a destra oppure assente, con o senza {{ui:Strumenti personali}}; quale pannello contiene le tavolozze, quale sta in cima (il browser di progetto o Proprietà, per esempio) e quali sono le schede sotto di esso.
   - **L'area del disegno:** le schede delle viste, una barra rapida e una barra della vista con i comandi che si spuntano, la tavolozza di modifica, una barra di stato.
   - **Aspetto:** dimensione, contorni dei pulsanti e stile delle schede.
4. Scegliere {{ui:Usa questo layout}}. L'app passa subito a esso, e ogni app che ha dei layout lo usa a sua volta.

Vengono proposti solo gli elementi che questa app possiede. Il layout compare in {{ui:Da add-on e file}}; {{ui:Esporta questo layout}} lo salva come file da dare a un collega, e il pulsante di rimozione lo elimina. I pannelli che riempie si ancorano, diventano mobili e si spostano in una finestra propria, come descritto in [Disponi i pannelli](common:arrange-panels).

## Salvare la configurazione come ambiente di lavoro

Un ambiente di lavoro è l'intera configurazione per ogni app in questo browser: il layout, lo stile dei menu e i tasti, lo stile della barra degli strumenti, i pannelli con le loro dimensioni e {{ui:Strumenti personali}}. Tema e lingua non ne fanno parte.

- **Salvare:** digitare un nome in {{ui:Ambienti di lavoro}} e scegliere {{ui:Salva la mia configurazione}}. Salvando con un nome già esistente si sostituisce quella configurazione.
- **Passare:** scegliere una configurazione nell'elenco e scegliere {{ui:Passa ad essa}}. L'app si ricarica in quella configurazione; se ci sono lavori non salvati, l'app chiede prima, come accade a ogni ricaricamento.
- **Condividere:** {{ui:Esporta}} salva la configurazione scelta come file `.ccenv.json`; {{ui:Importa una configurazione…}} ne aggiunge una da un file. Un file imposta solo queste scelte, nient'altro.
- **Rimuovere:** scegliere una configurazione e scegliere {{ui:Rimuovi}}.

Si possono conservare fino a dodici configurazioni.

Per cambiare un layout senza aprire la finestra (trascinare un blocco, fare clic destro su uno strumento), vedere [Cambiare un layout sullo schermo](common:layout-edit). Per provare prima le disposizioni predefinite, vedere [il layout a casella degli strumenti e riquadro informazioni](common:layout-toolbox), [il layout a barra multifunzione e browser di progetto](common:layout-ribbon) e [il layout Disegno](common:layout-drafting).
