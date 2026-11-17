---
title: Far lavorare un assistente IA con il proprio sito
summary: Attiva gli assistenti in Impostazioni, così un assistente sul computer può leggere il sito aperto (punti, superfici, volumi, profili, particelle), aggiungere punti di rilievo, salvare ed esportare LandXML o DWG, tramite CadCraft Studio. Disattivato finché non lo si attiva.
keywords: ia, assistente, mcp, script, automazione, studio, punti, quota, progressiva, offset, tracciato, volume, sterro, riporto, profilo, particella, landxml, dwg, usd, cartelle, permessi, disconnetti, attività
from: d0356582
---

## Cosa si impara

Come lasciare che un assistente IA (qualsiasi assistente che parla MCP) lavori con il sito aperto, che cosa può e non può fare, e come fermarlo.

## Cosa può fare un assistente in CivilCraft

| Chiede | Cosa ottiene | Richiede |
|---|---|---|
| Il sito | Nome, unità, sistema di coordinate, gruppi di punti, tracciati, superfici, piazzali, particelle e tubazioni | Lettura |
| Punti di rilievo | Numero, Est, Nord, quota e descrizione, per gruppo, per descrizione o dentro un riquadro | Lettura |
| Quote della superficie | Il terreno esistente (o la superficie sistemata) in qualsiasi punto indicato | Lettura |
| Progressive e offset | La progressiva e l'offset dei punti lungo un tracciato, oppure le coordinate e la quota del terreno delle progressive | Lettura |
| Un profilo | Quote del terreno, del profilo di progetto e della superficie sistemata lungo un tracciato, ogni tot piedi o metri | Lettura |
| Sterro e riporto | Volumi tra il terreno esistente e la superficie sistemata (anche di ogni piazzale e corridoio), o tra il terreno e un piano | Lettura |
| Particelle | Vertici, area (in acri o ettari), perimetro e descrizione catastale | Lettura |
| Una selezione | I punti indicati sono selezionati sulla pianta, come se fossero stati scelti a mano | Modifica |
| Nuovi punti di rilievo | Punti aggiunti con i numeri indicati, o con i successivi liberi. Ogni chiamata è un passo che si può annullare | Modifica |
| Salvataggio | Il pulsante {{ui:Salva}} di CivilCraft | Salva |
| LandXML o DWG | Gli stessi file dei pulsanti {{ui:LandXML}} e {{ui:DWG}} | Esporta |
| Il sito in 3D | OpenUSD (.usdz, .usda o .usdc) del terreno, della superficie sistemata, dei piazzali e delle tubazioni, come lo esporta la vista 3D | Esporta |
| Piante e computo delle piante | Piante trovate nell'elenco delle piante con qualsiasi nome, e i conteggi del computo delle piante | Lettura |
| Piantumazione e sistemazione | Piante, un'aiuola o una siepe collocate, oppure una piattaforma, un rilevato, una cunetta o un'area di sistemazione aggiunti, ciascuno come passo annullabile, con il suo sterro e riporto | Modifica |
| Verifica dell'irrigazione | La portata di ogni zona, la pressione necessaria alla sua valvola e all'alimentazione, il carico nel caso peggiore, i tempi di funzionamento, i problemi e la distinta base, come strumento di calcolo che un progettista di irrigazione verifica | Lettura |

Funziona con il sito aperto. In Studio può anche salvare ed esportare nelle cartelle che si scelgono (sotto); senza una cartella i suoi file vengono scaricati come fanno i pulsanti.

## Attivarlo

Gli assistenti raggiungono CivilCraft tramite CadCraft Studio sul computer; il browser semplice non ha un accesso.

1. Aprire {{ui:Impostazioni}} e scegliere la scheda **CivilCraft**.
2. In **Assistenti**, spuntare **Consenti ad assistenti IA e script di usare CivilCraft**.
3. **Lettura** è già spuntata. Spuntare **Modifica**, **Salva** o **Esporta** solo quando l'assistente ne ha bisogno.
4. Per consentirgli di salvare ed esportare in una cartella, scegliere {{ui:Aggiungi una cartella…}} sotto **Cartelle che può usare** e selezionare la cartella nella finestra di Studio. {{ui:Rimuovi}} la toglie subito; qualsiasi altro percorso viene rifiutato.
5. Collegare l'assistente in Studio (Studio mostra l'indirizzo e le impostazioni da incollare in esso).

## Mentre un assistente è collegato

Una nota in cima al pannello destro dice quale assistente è collegato e che cosa può fare. Fare clic su {{ui:Disconnetti}} per terminare subito la sua sessione; per continuare deve ricollegarsi.

**Attività**, sotto **Assistenti** nelle Impostazioni, elenca ogni chiamata fatta dall'assistente, dalla più recente, con l'indicazione se è riuscita.

:::tip
Chiedere con parole semplici, per esempio "qual è la quota del terreno ogni 50 piedi lungo via Principale?", "quanto sterro e riporto servono ai piazzali?" oppure "aggiungi un punto di controllo a queste coordinate". L'assistente legge il sito e risponde, oppure apporta la modifica come un solo passo annullabile.
:::

## Senza aprire CivilCraft

Il server di file CadCraft per gli assistenti (`npx @getcadcraft/mcp`) e la riga di comando `cadcraft` aprono i progetti CivilCraft salvati (`.civilcraft.json`) e i file di punti con il codice di CivilCraft stesso, senza finestra: gli stessi strumenti di lettura, l'aggiunta di punti, il salvataggio del progetto, LandXML e il sito in 3D come OpenUSD. `cadcraft convert site.civilcraft.json site.xml` scrive LandXML dalla riga di comando. L'apertura di LandXML, l'esportazione DWG e gli strumenti dello spazio di lavoro Landscape richiedono ancora la finestra di CivilCraft.

## Disattivarlo

Deselezionare **Consenti ad assistenti IA e script di usare CivilCraft**. Ogni assistente viene disconnesso subito, e l'impostazione viene mantenuta per la volta successiva.

## Vedi anche

- [Ricette per assistenti IA](common:assistants-recipes): esempi svolti, ciascuno con gli strumenti che chiama.
- [Disegnare un tracciato orizzontale](topic:alignment)
- [Costruire e rifinire la superficie](topic:build-surface)
- [Selezionare, copiare e incollare punti di rilievo](topic:copy-paste-points)
- [Impostazioni di CivilCraft](topic:settings)
