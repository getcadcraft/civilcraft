---
title: Tasti e mouse
summary: Ogni scorciatoia da tastiera e ogni azione di mouse, trackpad e tocco in CivilCraft, raggruppate, con le differenze tra browser e piattaforme.
keywords: tastiera, scorciatoie, tasti rapidi, tasti, mouse, trackpad, tocco, pan, zoom, pizzica, rotella, clic destro, mac, tasto command
from: a9756f46
---

I tasti a lettera singola funzionano quando non si sta scrivendo in una casella. Le scorciatoie con {{key:Mod}} usano Command su un Mac e Ctrl altrove. Vedere anche [Tasti nel browser](common:keys).

## File e modifica

| Tasto | Azione |
|---|---|
| {{key:Mod+O}} | Apre un file di punti, LandXML o progetto |
| {{key:Mod+S}} | Salva il progetto (scarica un file `.civilcraft.json`) |
| {{key:Mod+P}} | Stampa la pianta in PDF (apre la finestra di stampa di CivilCraft, non quella del browser) |
| {{key:Mod+Z}} | Annulla |
| {{key:Mod+Y}} | Ripristina |
| {{key:Delete}} | Elimina i punti di rilievo, il tracciato, il piazzale, la struttura, la tubazione o il PVI selezionati |
| {{key:Mod+C}} | Copia i punti di rilievo selezionati (anche come righe di punti per un foglio di calcolo) |
| {{key:Mod+X}} | Taglia i punti di rilievo selezionati |
| {{key:Mod+V}} | Incolla i punti: seguono il puntatore, fare clic dove devono andare |
| {{key:Mod+Shift+V}} | Incolla sul posto: alle coordinate proprie dei punti |
| {{key:Mod+D}} | Duplica i punti selezionati: una copia segue il puntatore |
| {{key:Mod+A}} | Seleziona ogni punto di rilievo |
| {{key:Esc}} | Deseleziona tutto (e annulla un incolla) |

{{key:Mod+S}}, {{key:Mod+O}} e {{key:Mod+P}} funzionano anche mentre si scrive in una casella. {{key:Mod+Z}} e {{key:Mod+Y}} in una casella di testo annullano invece la propria digitazione, come di consueto, e così fanno {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}} e {{key:Mod+A}}: in una casella copiano, tagliano, incollano e selezionano il suo testo. Con del testo selezionato nella pagina (in un pannello), {{key:Mod+C}} copia quel testo. {{key:Mod+Shift+Z}} non fa nulla in CivilCraft: usare {{key:Mod+Y}} oppure il pulsante {{ui:Redo}}.

:::mac
Il tasto Mac etichettato **delete** corrisponde a {{key:Backspace}} nel browser. Per eliminare una selezione, premere {{key:Delete}} (Fn e delete), oppure scegliere {{ui:Delete}} nel menu {{ui:More}} della barra degli strumenti.
:::

## Strumenti

| Tasto | Strumento |
|---|---|
| {{key:V}} | {{ui:Select}} |
| {{key:M}} | {{ui:Measure}}: distanze, aree e pendenze sulla pianta ([Misura](topic:measure)) |
| {{key:A}} | {{ui:Alignment}} |
| {{key:G}} | {{ui:Pad}} |
| {{key:P}} | {{ui:Pipes}} |
| {{key:B}} | {{ui:Breakline}} |
| {{key:O}} | {{ui:Boundary}} |
| {{key:R}} | Mostra o nasconde la vista del profilo |
| {{key:I}} | Attiva o disattiva {{ui:Add PVIs}} (apre la vista del profilo se è chiusa) |
| {{key:F}} | {{ui:Fit}}: mostra tutto |
| {{key:D}} | {{ui:3D}}: mostra il sito in 3D, oppure torna alla pianta |
| {{key:E}} | Mostra o nasconde pendenze e quote lungo ogni linea caratteristica (solo sullo schermo) |

Premere di nuovo il tasto dello strumento attivo riporta a {{ui:Select}}. I tasti lettera con Shift non fanno nulla.

## Durante il disegno

| Tasto | Azione |
|---|---|
| {{key:Enter}} | Termina il tracciato, il piazzale, la tubazione, la linea di discontinuità o il perimetro |
| {{key:Backspace}} | Rimuove l'ultimo punto cliccato |
| {{key:C}} | Linea caratteristica: attiva o disattiva gli archi (dopo un vertice, fare clic su un punto della curva, poi sulla sua fine) |
| {{key:Esc}} | Annulla il disegno (o l'incolla); premuto di nuovo (o senza nulla disegnato), torna a {{ui:Select}} e cancella la selezione |

## Vista in pianta

| Tasto o azione | Risultato |
|---|---|
| Rotella | Zoom avanti o indietro nel punto del puntatore |
| Trascinare su uno spazio vuoto | Pan (in qualsiasi strumento; un breve clic fa comunque clic; con {{key:Shift}} tenuto premuto disegna un riquadro di selezione) |
| Trascinare con il pulsante centrale | Pan |
| Trascinare con il pulsante destro | Pan (non si apre alcun menu) |
| {{key:Space}} e trascinare | Pan |
| Clic | Seleziona (con {{ui:Select}}), oppure posiziona un punto (con uno strumento di disegno) |
| {{key:Shift}} e clic | Aggiunge un punto di rilievo alla selezione, oppure lo toglie |
| {{key:Shift}} e trascinare | Disegna un riquadro: i punti di rilievo al suo interno vengono aggiunti alla selezione. Trascinare intorno ad essi per un [lazo](topic:lasso-selection) |
| {{key:Space}} mentre si disegna un lazo | Finestra, poi intersezione, poi recinto |
| Clic durante l'incolla | Mette lì i punti incollati ({{key:Enter}} li mette alle loro coordinate proprie) |
| Trascinare un grip | Sposta un PI, un vertice del piazzale o una struttura (un solo passo di annullamento) |
| {{key:Up}} {{key:Down}} {{key:Left}} {{key:Right}} | Pan, quando la pianta ha il fuoco (fare prima clic su di essa) |
| {{key:Plus}} e {{key:Minus}} | Zoom avanti e indietro al centro, quando la pianta ha il fuoco |

Il tasto = fa zoom avanti come {{key:Plus}}, quindi non serve Shift.

## Vista del profilo

| Azione | Risultato |
|---|---|
| Clic con {{ui:Add PVIs}} attivo | Aggiunge lì un PVI |
| Clic su un PVI | Lo seleziona |
| Trascinare un PVI | Lo sposta (un solo passo di annullamento) |
| {{key:Delete}} o {{key:Backspace}} | Rimuove il PVI selezionato ({{key:Backspace}} solo quando la vista del profilo ha il fuoco) |

La vista del profilo non fa zoom né pan.

## Schermo e guida

| Tasto | Azione |
|---|---|
| {{key:F1}} | Apre o chiude questa guida (il pannello laterale); {{ui:Help}} nella barra dell'app fa lo stesso |
| {{key:Esc}} | Chiude il pannello della guida quando è aperto |
| {{key:Ctrl+Shift+F}} | Cambia le modalità dello schermo: schermo intero, schermo intero con le barre nascoste, normale |
| {{key:Esc}} | Esce dallo schermo intero (il tasto del browser) |

{{key:F1}} raggiunge la guida prima che CivilCraft lo veda, quindi funziona in qualsiasi strumento. Sulla maggior parte delle tastiere Mac, premere fn con F1, oppure fare clic su {{ui:Help}}. {{key:Ctrl+Shift+F}} usa il tasto Control su ogni piattaforma, compreso un Mac. Vedere [Usare la guida](common:help) per come cercare in questa guida.

## Mouse, trackpad e tocco

:::mouse
- La rotella fa zoom nel punto del puntatore. Un mouse con rotella a rotazione libera fa zoom rapidamente: dare giri brevi.
- Fare pan con qualsiasi trascinamento su uno spazio vuoto, con il pulsante centrale, con il pulsante destro, oppure con {{key:Space}} e trascinare.
:::

:::mac
Su un trackpad Mac:

- Lo scorrimento con due dita **fa zoom** (non fa pan), e anche il pizzico fa zoom.
- Per fare pan, premere e trascinare su uno spazio vuoto con un dito, oppure tenere premuto {{key:Space}} e trascinare.
- Un clic con due dita (clic destro) non apre alcun menu e non fa nulla da solo.
:::

:::touch
Su uno schermo tattile:

- Il primo tocco rende i pulsanti e le righe dei menu grandi come un dito.
- Toccare per selezionare o per posizionare un punto; un dito trascinato su uno spazio vuoto fa pan. Un tocco può oscillare un poco: il pan inizia solo dopo che il dito si è mosso di circa 10 pixel.
- Due dita pizzicano per fare zoom e si muovono insieme per fare pan.
- Trascinare un grip o un PVI con un dito. I grip occupano lo spazio di un dito intorno a sé.
- Mentre si disegna un tracciato, un piazzale, una linea di discontinuità, un perimetro, una tubazione, una linea caratteristica o una particella, una barra sulla pianta offre {{ui:Finish}} ({{key:Enter}}), {{ui:Undo point}} ({{key:Backspace}}) e {{ui:Cancel}} ({{key:Esc}}). Una pressione prolungata (mezzo secondo senza muoversi) termina anch'essa.
- In {{ui:Select}}, una pressione prolungata su un punto di rilievo lo aggiunge alla selezione, o lo toglie, come fa {{key:Shift}}+clic.
- Nella vista 3D, un dito ruota, due dita pizzicano e fanno pan, e un tocco seleziona.
- Sul tocco non c'è il passaggio del puntatore, quindi le letture della barra di stato si aggiornano solo mentre un dito è appoggiato.
:::

## Scorciatoie del browser che prevalgono

Alcuni tasti appartengono al browser e non raggiungono mai CivilCraft, ad esempio {{key:Mod+W}} (chiude la scheda), {{key:Mod+T}} (nuova scheda), {{key:Mod+N}} (nuova finestra) e {{key:F11}} (schermo intero nei browser di Windows e Linux). CivilCraft non li usa. Se una scorciatoia apre qualcosa nel browser, fare clic una volta sulla pianta in modo che la pagina abbia il fuoco, e riprovare.

## Dove si trova Sposta

Non esiste un comando Sposta: scegliere {{ui:Select}} e trascinare un punto o un vertice, oppure modificarne le coordinate in {{ui:Properties}}. Vedere [Modificare i punti](topic:edit-points).
