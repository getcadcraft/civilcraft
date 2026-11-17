---
title: Stampare la planimetria in PDF
summary: Stampa tutto o la vista corrente in un PDF vettoriale su un foglio standard, a scala ingegneristica o metrica, con i colori dei layer oppure in nero.
keywords: stampa, plot, pdf, foglio, scala, formato carta, tavola di planimetria, pubblica, cartiglio, freccia del nord, barra di scala
from: 9af396ca
---

{{ui:PDF}} stampa la planimetria in un PDF vettoriale su un solo foglio, con un cartiglio, una freccia del nord e una barra di scala. Il PDF viene creato nel browser e scaricato; non passa dalla finestra di stampa del browser.

## Stampa

1. Impostare la planimetria in **Visualizza**: la superficie mostrata, l'intervallo delle curve di livello e quali elementi sono attivi. La stampa segue queste impostazioni.
2. Se si vuole solo una parte del sito, fare zoom e pan sulla planimetria fino a quella parte.
3. Fare clic su {{ui:PDF}} nel gruppo **Esporta**, oppure premere {{key:Mod+P}}.
   Si apre la finestra **Stampa la planimetria in PDF**.
4. Scegliere l'**Area**: {{ui:Tutto}} oppure {{ui:Ciò che è sullo schermo}}.
5. Scegliere la **Carta**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 o A1. Un progetto in piedi parte da Tabloid, un progetto in metri da A3. I fogli sono sempre orizzontali.
6. Scegliere la **Scala**. L'elenco contrassegna con "(adatta)" la scala più grande che entra e la seleziona.
   - Piedi: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metri: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Scegliere l'**Inchiostro**: {{ui:Colori dei layer}} o {{ui:Nero}}.
8. Leggere la riga sotto le scelte. Riporta la dimensione dell'area sulla carta e il formato del foglio, per esempio "L'area è 297 × 222 mm a 1" = 40' su un foglio di 432 × 279 mm (orizzontale)."
9. Fare clic su {{ui:Scarica PDF}}.
   Il browser scarica `<name>.pdf`. La barra di stato indica "Stampato <name>.pdf a 1" = 40'."

Se l'area è più grande del foglio alla scala scelta, la stampa viene centrata e i bordi vengono tagliati. Scegliere la scala contrassegnata "(adatta)" oppure un foglio più grande.

## Cosa c'è sul foglio

- La planimetria, centrata nell'area di disegno, come vere linee vettoriali: curve di livello, etichette, tracciati con progressive, corridoi, piazzali e linee di intersezione con il terreno, tubazioni, punti.
- Spessori di linea per layer: tracciati, piazzali e tubazioni più pesanti; triangoli e curve secondarie sottili.
- Un cartiglio lungo il fondo con il **Nome** del progetto, la scala, una nota dell'intervallo delle curve di livello e quale superficie (esistente o di progetto), e la data e la versione a destra.
- Una freccia del nord nell'angolo superiore destro (il nord della planimetria è in alto) e una barra di scala nel cartiglio.
- I livelli cartografici mostrati sotto la planimetria (un'immagine, tessere di mappa o un servizio di mappa), quando è spuntato **Livelli cartografici sotto la planimetria**: vengono disegnati come un'unica immagine di tutta l'area di disegno a 150 dpi, sotto le linee, e l'attribuzione di una mappa va nel cartiglio. CivilCraft attende fino a 8 secondi le immagini di mappa ancora in arrivo; se alcune mancano ancora, la barra di stato lo indica.

Il testo usa il carattere Helvetica integrato nel PDF. I caratteri fuori dal set dell'Europa occidentale (Windows-1252) vengono stampati come "?", e il messaggio di stato li conta.

## Cosa non viene stampato

- Fasce altimetriche.
- La vista del profilo. La stampa dei profili non è ancora disponibile.
- Più di un foglio (per un tracciato, usare [tavole di planimetria e profilo](topic:plan-profile-sheets)), viewport, un cartiglio personalizzato o fogli verticali.

:::note
La finestra indica che le frecce di pendenza sono solo a schermo. In questa versione, le frecce di pendenza attivate in **Visualizza** vengono stampate (ed esportate in DXF). Disattivarle prima della stampa se non le si vogliono.
:::

## Stampa su carta

Aprire il PDF scaricato in un qualsiasi visualizzatore PDF e stamparlo al 100% (dimensione reale), così la scala resta corretta. "Adatta alla pagina" cambia la scala.
