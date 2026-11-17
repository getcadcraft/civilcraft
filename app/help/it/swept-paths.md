---
title: Percorsi di manovra dei veicoli
summary: Far guidare un veicolo con fino a tre rimorchi lungo una linea caratteristica o un tracciato, in avanti o in retromarcia, e vedere l'area che spazza, le tracce delle ruote, lo sterzo e il punto in cui si piega a coltello.
keywords: percorso di manovra, percorso di svolta, tracciamento del veicolo, sagoma di manovra, veicolo di progetto, camion, autobus, rimorchio, semirimorchio, retromarcia, piega a coltello, articolazione, blocco dello sterzo, fuori traccia, traccia della ruota, rampa di carico, raggio di svolta
from: 8caafb8a
---

Un percorso di manovra fa guidare un veicolo lungo una linea e mostra il terreno che il suo corpo attraversa. Usarlo per verificare che un camion possa fare una curva, raggiungere una rampa di carico o fare retromarcia con un rimorchio fino alla posizione giusta senza uscire dalla pavimentazione.

## Guidare un veicolo lungo una linea

1. Disegnare la linea che il veicolo segue, nel senso di marcia: una linea caratteristica (sono ammessi archi: premere {{key:C}} mentre la si disegna, vedere [Linee caratteristiche](topic:feature-lines)) oppure un tracciato.
2. Selezionarla e fare clic su {{ui:Ingombro di manovra…}} nelle sue **Proprietà**.
3. Sotto **Parti da**, scegliere un veicolo, poi impostarne le dimensioni dal proprio veicolo di progetto: larghezza, sbalzo anteriore, passo, sbalzo posteriore, carreggiata e **Blocco dello sterzo**. Aggiungere fino a tre rimorchi, ciascuno con il punto in cui è agganciato, la lunghezza dal gancio al suo asse, i suoi sbalzi e la sua **Articolazione massima**.
4. Scegliere **Marcia**: avanti o in retromarcia. Fare clic su {{ui:Guida}}.

:::warning
I veicoli di partenza sono valori provvisori, non uno standard. Impostare le dimensioni dal veicolo di progetto usato dal proprio progetto.
:::

## Avanti e retromarcia

| Marcia | Cosa segue la linea | Cosa calcola CivilCraft |
|---|---|---|
| **Avanti** | Il centro dell'asse anteriore | Dove vanno l'asse posteriore e ciascun rimorchio, l'angolo di sterzo e l'articolazione |
| **Retromarcia** | Il centro dell'ultimo asse (il retro del rimorchio) | Dove va ciascuna unità davanti, e lo sterzo che la cabina deve dare per portare il rimorchio lì |

La retromarcia serve a verificare una manovra in retromarcia: si indica dove deve andare il rimorchio, e CivilCraft dice se la cabina ci riesce.

## Leggere il risultato

Il percorso di manovra è disegnato in pianta in arancione: il suo contorno e, tratteggiate, le tracce delle ruote più esterne. Selezionarlo (fare clic al suo interno) per vedere nelle **Proprietà**:

- **Lunghezza percorsa**, il massimo angolo di **Sterzo** e l'**Articolazione** rispetto ai loro limiti, e l'**Area spazzata**.
- Ogni problema lungo la linea, con la sua distanza: lo sterzo oltre il blocco, oppure un rimorchio che gira oltre il limite di articolazione (si piega a coltello).
- **Il veicolo lungo la linea**: spostare il cursore per vedere il veicolo in ogni punto, con il suo sterzo e la sua articolazione in quel punto.

Modificare la linea e il percorso di manovra la segue. {{ui:Modifica il veicolo…}} cambia le dimensioni; **Marcia** passa da avanti a retromarcia. Ogni modifica è un passo: {{key:Mod+Z}} la annulla. {{key:Delete}} elimina il percorso di manovra selezionato (la linea resta).

Il contorno e le tracce delle ruote vanno nel PDF, nel DXF e nel DWG sul layer C-ROAD-SWPT.

## Come viene calcolato

Ogni unità ruota intorno alla linea del proprio asse posteriore ed è trascinata dal punto che la precede (l'asse anteriore, oppure il punto di aggancio): è il modello a bassa velocità senza slittamento usato dai controlli dei percorsi di manovra. L'area spazzata è l'unione dei contorni del corpo in ogni posizione. Non modella la velocità, lo slittamento dei pneumatici, il tempo che lo sterzo impiega a girare, i rimorchi sterzanti né la luce libera sotto la carrozzeria.
