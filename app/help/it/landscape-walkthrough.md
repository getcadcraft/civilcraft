---
title: Progettare un giardino, dall'inizio alla fine
summary: I dieci passi del progettista del paesaggio, dal rilievo al set pubblicato, con ciò che l'area di lavoro Paesaggio fa oggi per ciascuno e ciò che non fa ancora.
keywords: tutorial, percorso guidato, come fare, progettazione giardino, progettazione del paesaggio, primi passi, esempio, passo dopo passo, rilievo, linee, terreno, piantumazione, abaco, tavole, pubblicazione, un progetto
from: 87900bf5
---

Un progetto del paesaggio procede a cerchio: rilievo, schizzo, linee, terreno, aree, quote, piantumazione, abachi, tavole, e di nuovo daccapo. Ecco i dieci passi, con ciò che esiste per ciascuno. Dove un passo presenta una lacuna, questa è indicata in **Non ancora implementato** alla fine, e non nascosta nel passo.

È possibile seguire il sito di esempio, oppure il proprio disegno di rilievo. Con il proprio, iniziare dal passo 1.

## 1. Importare il rilievo

{{ui:Superficie}} › {{ui:Linee da un disegno…}}, scegliere il disegno di rilievo (DWG 2000–2018 o DXF). Verificare le unità, prendere le curve di livello, le polilinee 3D e il confine per la superficie, e i blocchi di punti come punti di rilievo. La sezione **Quote di rilievo e verifica** legge le quote scritte come testo o come attributo ed elenca ciò che sembra errato (unità, sistema di coordinate, distanza dallo zero, curve piatte, quote anomale, punti doppi) prima di aggiungere qualsiasi cosa. Vedere [Verificare un disegno di rilievo all'importazione](topic:survey-check) e [Aprire un DWG o DXF come linee](topic:open-dwg-dxf). Impostare il sistema di coordinate con {{ui:Sistema di coordinate…}}.

## 2. Schizzi a mano

Un foglio su carta, come un vecchio rilievo o una stampa annotata, entra con {{ui:Scansiona…}} (Partire da una scansione): viene posizionato in scala o su coordinate note sotto la pianta, e può essere ricalcato in linee. ModelCraft legge una foto di uno schizzo a mano (File › Importa una foto di schizzo…). CivilCraft stesso non ha uno strumento per gli schizzi a mano: posizionare il foglio sotto la pianta e disegnare sopra di esso.

## 3. Dallo schizzo alle linee

Disegnare linee caratteristiche e contorni sopra il rilievo in CivilCraft, oppure disegnarli nel disegno 2D. Paesaggio › Altro › {{ui:Da una linea}} trasforma una linea in pavimentazione, area piantumata, muro, gradini, linea caratteristica e altro, collegati: spostando la linea, l'oggetto la segue. Vedere [Oggetti dalle linee](topic:objects-from-lines). In SuperCad Studio, aprire il sito, il disegno e il modello dell'edificio in un unico progetto: l'area di lavoro **Paesaggio** ha gli strumenti di tutti, e una linea scelta nel disegno 2D può diventare un oggetto del paesaggio che la segue (Ctrl+K, {{ui:Oggetto del paesaggio dalla linea del disegno scelta}}).

## 4. Il terreno di progetto

Aprire {{ui:Superficie}} › {{ui:Altro}} › {{ui:Area di lavoro Paesaggio}}. Costruire il terreno di progetto con {{ui:Piattaforma}}, {{ui:Terrapieno}}, {{ui:Fossetta drenante}} e aree di sistemazione con quote puntuali e curve di livello; le pavimentazioni, i sentieri, i muri, le rampe e i gradini che si aggiungono si sistemano nella stessa superficie di progetto. Il terreno esistente non cambia mai. {{ui:Quote}} › {{ui:Modificatori del terreno…}} elenca tutto ciò che modella il terreno in un unico ordine, con sterro e riporto per ciascuno. Vedere [Sistemazione](topic:landscape-grading) e [Modificatori del terreno e quote dinamiche](topic:ground-modifiers).

## 5. Pavimentazioni e aree piantumate

{{ui:Superfici dure}} › {{ui:Pavimentazione}}, {{ui:Sentiero}}, {{ui:Muro}}, {{ui:Cordolo}}, {{ui:Rampa}} e {{ui:Gradini}}. {{ui:Aree}} disegna un prato, un'aiuola, un prato fiorito o un copriterra con la sua stratigrafia; si ritaglia da solo intorno a pavimentazioni, muri e gradini. {{ui:Aiuola}} riempie un'area alla spaziatura delle piante, con un mix di piante. Vedere [Superfici dure](topic:hardscape), [Aree piantumate](topic:planted-areas) e [Piantumazione](topic:planting).

## 6. Quote, pendenze e raccordi

In **Verifiche della sistemazione**, selezionare **Analisi delle pendenze** e **Frecce di deflusso e ristagno**. Se l'acqua ristagna contro una terrazza, aggiungere intorno ad essa una {{ui:Fossetta drenante}}. Le proprietà indicano quanti alzate servono ai gradini e se entrano, e dove un sentiero è più ripido del suo limite. Il pannello Problemi elenca dove gli oggetti si incontrano male: un muro sopraelevato, un'aiuola sopra la pavimentazione, gradini che non raggiungono il pianerottolo. {{ui:Quota puntuale}} e {{ui:Freccia di pendenza}} annotano il terreno e si aggiornano da soli.

## 7. Piantumazione

In **Piante**, cercare nell'elenco delle piante (alcune centinaia di specie, o un elenco proprio), scegliere una pianta e usare {{ui:Pianta}}, {{ui:Aiuola}} o {{ui:Siepe}}. Impostare dimensioni ed etichette della pianta dalla voce Altro. Altro › {{ui:Tabella piante}} modifica le proprie schede: cultivar, dimensioni fornite, densità, note di capitolato. Ogni scheda può contenere il proprio simbolo e modello 3D (OBJ, STL o GLB), e Altro › {{ui:Grafica delle piante}} disegna le piante in forma più semplice alle scale più piccole. Vedere [L'elenco delle piante](topic:plant-list), [Schede delle piante](topic:plant-records) e [Grafica delle piante](topic:plant-graphics).

## 8. Quantità e abachi

Altro › {{ui:Abachi}}: gli abachi delle piante e delle superfici dure, e i propri, restano collegati agli oggetti; salvarli come CSV o XLSX oppure inserirli nelle tavole (vedere [Abachi](topic:worksheets)). Altro › {{ui:Abaco delle piante…}} invia i conteggi a TakeoffCraft. Le quantità delle superfici dure sono nelle proprietà di pavimentazioni, muri e gradini. L'irrigazione ha una propria distinta: {{ui:Irrigazione}} › **Verifica del sistema…**. Vedere [Irrigazione](topic:irrigation).

## 9. Disegni e tavole

Altro › {{ui:Tavole del paesaggio…}}: planimetrie di impianto, sistemazione e irrigazione, con i dettagli. {{ui:Quote}} › {{ui:Linea di sezione}} disegna sezioni attraverso il terreno, i muri, le stratigrafie, i gradini e le piante. Vedere [Tavole del paesaggio](topic:landscape-sheets) e [Sezioni e set di pubblicazione](topic:landscape-sections).

## 10. Pubblicazione

{{ui:Set di pubblicazione (.zip)}} nella finestra di dialogo delle tavole crea un PDF con un elenco delle tavole e un DWG per tavola. Altro › {{ui:Esporta IFC del paesaggio}} fornisce a BimCraft le piante e le superfici dure. Salvare il progetto: tutto è nell'unico file.

## Cambiare una cosa: la scala

Il senso di tenere tutto in un unico progetto è che una modifica si propaga. Provarlo con una rampa di gradini tra due terrazze:

1. Disegnare la linea della rampa come linea caratteristica (o come linea nel disegno), poi Paesaggio › Altro › {{ui:Da una linea}} › {{ui:Gradini}}. Nelle proprietà dei gradini selezionare **Modella il terreno**, e impostare le quote inferiore e superiore sulle due terrazze.
2. Disegnare un'aiuola piantumata accanto e sotto la rampa con {{ui:Aree}}, e pavimentazione sulle terrazze. L'aiuola si ritaglia da sola intorno ai gradini e alla pavimentazione, e l'abaco delle piante conta solo ciò che è piantato.
3. Alzare la quota superiore della rampa nelle proprietà. Il terreno di progetto, le quote puntuali, le frecce di pendenza e lo sterro e riporto cambiano subito. Se la rampa non raggiunge più la terrazza superiore, il pannello Problemi indica di quanto.
4. Spostare la linea della rampa. I gradini seguono la loro linea nello stesso passo di annullamento; l'aiuola si ritaglia di nuovo e viene riconteggiata, e gli abachi e gli elenchi mostrano i nuovi numeri.
5. Premere Ctrl+Z una volta: la linea, i gradini, il terreno e l'aiuola tornano indietro insieme.

Vedere [Modificatori del terreno e quote dinamiche](topic:ground-modifiers), [Aree piantumate](topic:planted-areas) e [Abachi](topic:worksheets).

## Non ancora implementato

Sono richieste e non sono in questa versione:

- Muri che modellano il terreno (segnalano dove lo incontrano, e la loro sommità può seguirlo).
- Modifica dell'elenco delle piante della libreria nell'app (modificare l'elenco del progetto e salvarlo come file delle piante).
- Texture e colori dei propri modelli GLB di piante (si legge la forma; si usa il colore della pianta).

Vedere [L'area di lavoro Paesaggio](topic:landscape) per ogni strumento.
