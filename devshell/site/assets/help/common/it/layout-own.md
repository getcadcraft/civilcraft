---
title: Disporre il proprio layout e salvare le configurazioni
summary: Scegliere quale pannello mostra il browser di progetto, le Proprietà o il contenuto proprio del pannello, dove va la casella degli strumenti e che cosa contengono le barre, salvarlo come proprio layout e conservare intere configurazioni con un nome per passare dall'una all'altra.
keywords: layout, area di lavoro, disporre, personalizzare, il mio layout, layout proprio, pannelli, editor, browser di progetto, proprietà, casella degli strumenti, barra rapida, riquadro informazioni, ambiente di lavoro, configurazione, profilo, salvare configurazione, cambiare configurazione, esportare configurazione, importare configurazione, ccenv
from: 2a71af43
---

Oltre ai tre layout predefiniti è possibile disporne uno proprio e salvare l'intera configurazione con un nome, per tornarvi con un solo passaggio.

## Disporre il proprio layout

1. Aprire {{ui:Impostazioni}} (l'ingranaggio, oppure {{key:Mod+,}}), scegliere {{ui:Globali}}, poi {{ui:Layout}}.
2. Scegliere {{ui:Disponi il proprio layout…}}. La finestra parte dal layout in uso.
3. Assegnargli un nome, poi scegliere:
   - **Sopra il disegno:** la barra degli strumenti dell'app, una barra multifunzione o nessuna; una barra del titolo; un riquadro informazioni e i controlli che contiene.
   - **Accanto al disegno:** la casella degli strumenti a sinistra, a destra o assente, con o senza {{ui:Strumenti personali}}; quale pannello contiene le palette, quale sta in cima (il browser di progetto o le Proprietà, per esempio) e quali sono schede sotto di esso.
   - **L'area di disegno:** schede delle viste, una barra rapida e una barra della vista con i controlli selezionati, la palette di modifica, una barra di stato.
   - **Aspetto:** dimensione, contorni dei pulsanti e stile delle schede.
4. Scegliere {{ui:Usa questo layout}}. L'app passa subito al nuovo layout, e lo usa anche ogni altra app che prevede layout.

Vengono proposte solo le parti presenti in questa app. Il layout è elencato sotto {{ui:Da add-on e file}}; {{ui:Esporta questo layout}} lo salva come file da dare a un collega e il pulsante di rimozione lo elimina. I pannelli che riempie si possono ancora ancorare, rendere mobili e spostare in finestre separate, come in [Disporre i pannelli](common:arrange-panels).

## Salvare la configurazione come ambiente di lavoro

Un ambiente di lavoro è l'intera configurazione per ogni app in questo browser: il layout, lo stile dei menu e i tasti, lo stile della barra degli strumenti, i pannelli e le loro dimensioni, e {{ui:Strumenti personali}}. Tema e lingua non ne fanno parte.

- **Salvare:** digitare un nome sotto {{ui:Ambienti di lavoro}} e scegliere {{ui:Salva la mia configurazione}}. Salvando con un nome già esistente, quella configurazione viene sostituita.
- **Passare a un'altra:** scegliere una configurazione nell'elenco e poi {{ui:Passa ad essa}}. L'app si ricarica con quella configurazione; in presenza di lavoro non salvato, l'app chiede prima conferma, come a ogni ricaricamento.
- **Condividere:** {{ui:Esporta}} salva la configurazione scelta come file `.ccenv.json`; {{ui:Importa una configurazione…}} ne aggiunge una da un file. Un file imposta soltanto queste scelte, nient'altro.
- **Rimuovere:** scegliere una configurazione e poi {{ui:Rimuovi}}.

È possibile conservare fino a dodici configurazioni.

Per provare prima le disposizioni predefinite, vedere [il layout con casella degli strumenti e riquadro informazioni](common:layout-toolbox) e [il layout con barra multifunzione e browser di progetto](common:layout-ribbon).
