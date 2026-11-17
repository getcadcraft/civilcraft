---
title: Calcolare le portate meteoriche, i diametri delle tubazioni e la linea piezometrica
summary: Disegnare i bacini che scolano in ogni manufatto, sommare le portate lungo la rete con il metodo razionale, dimensionare le tubazioni con la formula di Manning e vedere dove la linea piezometrica risulta a tubo pieno o raggiunge la superficie.
keywords: acque meteoriche, drenaggio, bacino scolante, metodo razionale, coefficiente di deflusso, tempo di corrivazione, intensità di pioggia, idf, manning, dimensionamento delle tubazioni, linea piezometrica, hgl, linea dell'energia, egl, sovraccarico, allagamento, acqua di valle
from: e44872ec
---

Il drenaggio delle acque meteoriche lavora sulla [rete di tubazioni](topic:pipe-network): disegnare prima la rete, poi le aree che vi scolano. Tutto appare sotto **Drenaggio acque meteoriche** nel pannello di destra quando non è selezionato nulla.

## Disegnare un bacino

1. Fare clic su **Disegna un bacino** sotto **Drenaggio acque meteoriche**.
2. Fare clic sui vertici dell'area che scola in un manufatto. {{key:Enter}} oppure un doppio clic termina; {{key:Backspace}} annulla l'ultimo vertice, {{key:Esc}} interrompe.
3. Il bacino scola nel manufatto al suo interno, altrimenti in quello più vicino. Si aprono le sue **Proprietà**: impostare il nome, il **Coefficiente di deflusso C** (la quota di pioggia che scorre via, da 0 a 1), il **Tempo di corrivazione** in minuti e il manufatto in cui **Scarica in**.

**Disegna un altro bacino** nelle sue Proprietà avvia il successivo. Fare clic dentro un bacino sulla pianta per selezionarlo; {{key:Delete}} lo elimina. Ogni modifica è un passo: {{key:Mod+Z}} la annulla.

## Impostare la pioggia di progetto

L'intensità di pioggia è i = a ÷ (tc + b) elevato a c, in pollici all'ora per un progetto in piedi e in millimetri all'ora per un progetto in metri. Adattare **Intensità a**, **b** e **c** alla propria curva intensità-durata-frequenza per il periodo di ritorno di progetto.

:::warning
La curva di intensità iniziale, il Manning n (0.013) e la perdita di confluenza (0.5) sono valori provvisori, non uno standard. Impostarli in base ai propri dati pluviometrici e ai criteri di progetto.
:::

- **Tempo di corrivazione minimo**: nessuna tubazione viene calcolata con un tempo più breve (10 minuti all'inizio).
- **Manning n**: la scabrezza delle tubazioni.
- **Perdita di confluenza**: il carico perso in ogni manufatto, come quota parte dell'altezza cinetica V²/2g della tubazione che ne esce.
- **Quota dell'acqua allo scarico**: l'acqua di valle, dove l'ultima tubazione scarica. Lasciarla vuota quando lo scarico è libero.

## Come si sommano le portate

Ogni tubazione porta tutti i bacini a monte. Q = C × i × A, dove C × A è sommato lungo la rete e i è l'intensità al tempo di corrivazione più lungo dell'acqua che arriva: il tempo proprio di un bacino, oppure il tempo da un bacino a monte più il tempo di percorrenza nelle tubazioni (lunghezza ÷ velocità a tubo pieno). Q è in piedi cubi al secondo (A in acri) o in metri cubi al secondo (A in ettari).

## Dimensionare le tubazioni

La tabella sotto **Portate e linee piezometriche** mostra, per ogni tubazione, la portata, ciò che porta a tubo pieno alla sua pendenza, la velocità, la linea piezometrica in testa e al piede e quanto è profonda la corrente.

**Dimensionare le tubazioni per queste portate** assegna a ogni tubazione il diametro commerciale più piccolo che porta la sua portata alla propria pendenza (da 12 a 72 in, oppure da 300 a 1800 mm). È un solo passo. Le quote di fondo restano dove sono: se i diametri cambiano, usare **Imposta tutte le quote di fondo dalle regole** per mantenere il ricoprimento, poi ricontrollare la tabella.

## Leggere le linee piezometriche

La linea piezometrica (HGL) si calcola da valle verso monte:

- Una tubazione che scorre parzialmente piena ha la HGL sul pelo libero: la quota di fondo più il tirante normale.
- Quando l'acqua a valle è più alta della generatrice superiore, oppure la tubazione porta più di quanto possa portare a tubo pieno, scorre in pressione e la sua HGL sale della pendenza di attrito lungo la sua lunghezza.
- In ogni manufatto la HGL è la HGL in testa della tubazione uscente più la perdita di confluenza.
- La linea dell'energia (EGL) è la HGL più l'altezza cinetica.

Una tubazione a tubo pieno è elencata, così come ogni manufatto in cui la HGL supera il chiusino: l'acqua raggiunge la superficie in quel punto e il manufatto è cerchiato in rosso in pianta. Selezionare una tubazione o un manufatto per vedere nelle sue Proprietà portata, tirante, velocità e le due linee piezometriche.

## Simulare un evento

Il metodo razionale dà un solo picco per ogni tubazione. {{ui:Propaga l'evento}} (sotto i risultati, nelle Proprietà della rete) calcola invece l'intero evento: il deflusso di ciascun bacino nel tempo, trasportato lungo le tubazioni con il loro tempo di percorrenza e il loro invaso, e sommato dove si incontrano.

1. Lasciare vuoti {{ui:Durata della pioggia}} e {{ui:Intensità di pioggia}} per usare il tempo di corrivazione più lungo e la curva di pioggia sopra, oppure digitare i propri valori.
2. Premere {{ui:Propaga l'evento}}. La tabella elenca, per ogni tubazione, la portata massima in entrata e in uscita, quanto è più basso il picco in uscita, quanta parte della capacità a tubo pieno utilizza e il minuto in cui raggiunge il picco.
3. Ogni uscita riceve un piccolo grafico portata-tempo e {{ui:Scarica l'idrogramma (CSV)}}.

Un bacino restituisce la pioggia mediata sul proprio tempo di corrivazione, quindi un evento più breve di quello raggiunge un picco inferiore a C × i × A. Ogni tubazione è simulata con il metodo Muskingum–Cunge, usando il tirante già trovato dal metodo razionale. Due rami con tempi di corrivazione diversi non raggiungono il picco insieme, quindi la loro somma è inferiore alla somma dei loro picchi.

Non modella il sovraccarico, il rigurgito, l'invaso nei manufatti né l'allagamento. Una tubazione il cui picco simulato supera la capacità a tubo pieno viene elencata, e la sua acqua viene trasferita come se entrasse. Usarlo per vedere tempi e laminazione, non per dimensionare la tubazione. È un ausilio di calcolo: lo verifica un ingegnere.

## Salvato nel progetto

I bacini e le impostazioni della pioggia sono salvati nel file di progetto. Non sono ancora nella stampa PDF, nel DWG o nel DXF, né in LandXML: vedere [Non ancora implementato](topic:not-built-yet).
