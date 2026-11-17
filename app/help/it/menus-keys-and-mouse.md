---
title: Menu, tasti e mouse
summary: Scegliere uno stile di menu che corrisponda al modo di lavorare abituale, assegnare a ogni comando un tasto proprio, spostare i comandi tra le schede della barra multifunzione e impostare cosa fanno la rotella e i pulsanti del mouse nella pianta e in 3D.
keywords: stile menu, menu, barra multifunzione, barra civile, barra degli strumenti, riga di comando, disegno classico, scorciatoie da tastiera, tasti di scelta rapida, tasti, personalizza, riassegna, mouse, rotella, inverti, direzione zoom, pulsante centrale, pulsante destro, pan, orbita, esporta, importa, passaggio, familiare
from: 07ac73a0
---

I comandi di CivilCraft sono gli stessi qualunque sia il modo in cui vi si arriva. Uno **stile di menu** decide soltanto dove si trovano sullo schermo, come si chiamano e con quali tasti si eseguono, così da poter mantenere le proprie abitudini. Sceglierne uno in {{ui:Impostazioni}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu, tasti e mouse}}; la modifica è immediata, e questo browser la ricorda.

## I tre stili

| Stile | Cosa si ottiene |
|---|---|
| {{ui:CivilCraft}} | La barra degli strumenti propria di CivilCraft (File, {{ui:Esporta}}, {{ui:Superficie}}, Progettazione, Modifica, GIS, {{ui:Vista}}) e tasti singoli: {{key:A}} tracciato, {{key:G}} piazzale, {{key:P}} tubazioni, {{key:B}} linea di discontinuità, {{key:O}} contorno, {{key:L}} linea caratteristica, {{key:R}} profilo, {{key:X}} sezioni, {{key:E}} pendenze, {{key:D}} 3D, {{key:F}} adatta, {{key:V}} seleziona. Il punto di partenza. |
| {{ui:Disegno classico}} | Una piccola barra multifunzione ({{ui:Home}}, {{ui:Inserisci}}, {{ui:Uscita}}) e una riga di comando, per chi digita i comandi: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (annulla), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Iniziare a digitare ovunque e le lettere vanno alla riga di comando; {{key:Enter}} esegue, {{key:Enter}} su una riga vuota ripete l'ultimo comando, {{key:Esc}} la cancella. Il pulsante centrale fa pan. |
| {{ui:Barra civile}} | Schede di pulsanti grandi, come raggruppano i loro strumenti i programmi di progettazione civile: {{ui:Home}} (dati del terreno, creazione del progetto, viste di profilo e di sezione), {{ui:Superfici}}, {{ui:Modifica}}, {{ui:Geolocalizzazione}}, {{ui:Vista}} e {{ui:Uscita}}, con un menu {{ui:File}} e pulsanti rapidi a destra. I tasti singoli restano. Il pulsante centrale fa pan nella pianta; in 3D il pulsante centrale fa pan, e {{key:Shift}} con il pulsante centrale fa orbita. |

Ogni stile mantiene i tasti {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Un tasto che appartiene al layout proprio di CivilCraft, ma che lo stile ha assegnato a un altro comando, non fa nulla, e la riga di stato indica dove è finito il suo comando ("In I miei tasti, Pad è Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} e le frecce mantengono sempre il loro significato, e mentre si disegna una linea i suoi punti conservano i loro tasti ({{key:Backspace}}, {{key:Enter}}).
:::

## Personalizzare

1. Scegliere lo stile più vicino a ciò che si desidera, quindi cliccare {{ui:Personalizza…}}.
2. In {{ui:Tasti e menu}}, trovare un comando (la casella di ricerca aiuta). Cliccare {{ui:Aggiungi una chiave}} e premere il tasto, oppure due tasti di seguito per un tasto a due lettere. Cliccare un tasto per rimuoverlo.
3. Con una barra multifunzione, {{ui:Dove si trova}} sposta il comando in un'altra scheda o pannello, nel menu {{ui:File}}, oppure in {{ui:Solo tasti}}.
4. In {{ui:Mouse}}, impostare la rotella, i pulsanti che fanno pan nella pianta e cosa fa ciascun pulsante nella vista 3D.
5. Assegnare un nome e cliccare {{ui:Salva}}.

Salvare uno stile integrato crea una copia propria ("La mia barra civile"); quello integrato non cambia mai. Un tasto assegnato a due comandi, oppure uno che verrebbe eseguito prima che un tasto a due lettere possa essere digitato, appare in rosso e va corretto prima di poter salvare.

## Mouse

- **Rotella del mouse**: {{ui:Scorrere in avanti ingrandisce}} (il punto di partenza) oppure {{ui:Scorrere in avanti riduce}}, e con quale velocità, nella pianta e in 3D. Il pizzicamento sul trackpad fa sempre zoom nel verso in cui si muovono le dita.
- **Fare pan nella pianta con**: il pulsante centrale, il pulsante destro, o entrambi. Anche {{key:Space}} con il trascinamento fa pan. Il pulsante sinistro seleziona e disegna sempre.
- **Trascinamento nella vista 3D**: {{ui:Ogni vista propria}} mantiene i pulsanti di CivilCraft (sinistro orbita, destro fa pan). Oppure impostare ogni pulsante su orbita, pan, zoom o nessuno; {{key:Shift}} con il pulsante scambia orbita e pan. Un clic senza trascinamento seleziona comunque.

## Portare con sé

{{ui:Esporta}} salva lo stile in uso come un piccolo file `.ccinput.json`; {{ui:Importa…}} ne aggiunge uno, da un altro computer o da un collega. Un file importato può puntare solo ai comandi propri di CivilCraft: il resto viene omesso e conteggiato nella riga di stato. {{ui:Elimina questo stile}} rimuove uno dei propri.

:::note
Queste impostazioni restano in questo browser. {{ui:Usa questo stile in ogni app}} sotto le schede degli stili fa aprire ogni app nello stile corrispondente (la propria barra degli strumenti, una barra multifunzione o Disegno classico), con le modifiche fatte in ciascuna app. CivilCraft non ha uno stile con barra dei menu: quando la barra dei menu di un'altra app viene scelta per tutte le app, CivilCraft mantiene la propria barra degli strumenti.
:::

Vedere anche: [Tastiera e mouse](topic:keyboard) · [Impostazioni di CivilCraft](topic:settings) · [Provenienza da altri software civili](topic:coming-from)
