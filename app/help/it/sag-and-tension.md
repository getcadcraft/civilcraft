---
title: Freccia e tiro
summary: Le ipotesi di carico (temperatura, vento, ghiaccio) e i limiti di tiro, come CivilCraft calcola il tiro di ogni sezione, e le tabelle di tesatura.
keywords: freccia, tiro, ipotesi di carico, temperatura, vento, ghiaccio, ghiaccio asimmetrico, campata equivalente, campata di regolazione, cambiamento di stato, catenaria, tabella di tesatura, carico di rottura, tensione di esercizio
from: f8876c35
---

## Ipotesi di carico e limiti

{{ui:Altro}} › {{ui:Ipotesi di carico e limiti…}} modifica le regole che ogni linea del progetto segue.

- **Ipotesi di carico**: una temperatura, una pressione del vento sul conduttore (Pa) e il ghiaccio radiale (mm, con la sua densità). La prima ipotesi è quella di riferimento.
- **Limiti di tiro**: una quota del carico di rottura del conduttore, sul tiro orizzontale o sul tiro massimo a un sostegno, in un'ipotesi di carico. Oppure indicare direttamente il tiro orizzontale.
- **Distanze di sicurezza**: la distanza che il conduttore mantiene dal terreno, da una strada, da un edificio e così via. Aggiungere, rinominare e rimuovere: sono a propria scelta. Sotto di esse, scegliere le regole per **Piante del paesaggio sotto una linea**, **Muri del paesaggio sotto una linea** e **Attraversamenti interrati**.
- **Ipotesi usate dalle verifiche**: quale ipotesi dà la freccia massima (caldo), l'oscillazione dell'isolatore (vento), il ghiaccio e il ghiaccio da un lato di un sostegno.
- **Coefficienti**: coefficiente di interasse delle fasi k, oscillazione massima dell'isolatore, un coefficiente sui carichi di sostegni e accessori, gli angoli di deviazione che rendono sostegni di angolo e di amarro, la copertura minima dei cavi interrati, la caduta di tensione massima.

## Pacchetti: regole e libreria per un paese

Nessuna regola di un paese è incorporata in CivilCraft. Un **pacchetto** conserva insieme un insieme di regole e una libreria in un unico file (`.cclinepack.json`), per un paese, un gestore di rete o un'azienda:

- **Salva come pacchetto…** in {{ui:Ipotesi di carico e limiti…}} scrive l'insieme di regole mostrato e la propria libreria (oppure, con la libreria ancora vuota, gli elementi usati da questo progetto). Digitare prima **Paese o regione**.
- **Apri un insieme di regole o un pacchetto…** legge un pacchetto, un file di regole o un file di libreria. Le regole di un pacchetto sono mostrate nella finestra (fare clic su {{ui:Applica}} per usarle) e i suoi elementi entrano nella propria libreria.
- I pacchetti condivisi da altri sono elencati nella pagina degli add-on sotto **Pacchetti per linee elettriche**. Due pacchetti di esempio mostrano il formato; non sono le regole di alcun paese.

Ogni pacchetto è verificato quando viene aperto, come ogni file. Verificare ogni valore sulla norma applicabile prima che qualcosa venga costruito.

Due insiemi di regole di esempio sono pronti come punto di partenza: **Esempio: clima freddo** e **Esempio: clima mite**. I loro valori non derivano da alcuna norma: impostare quelli che la propria norma fornisce. {{ui:Salva regole}} e {{ui:Apri regole…}} condividono un insieme di regole come file.

## Come si calcola il tiro

Per ogni sezione tra due amarri:

1. La **campata equivalente** è √(ΣL³ ÷ ΣL) delle sue campate.
2. Ogni limite si trasforma in un tiro orizzontale nell'ipotesi di riferimento tramite l'**equazione del cambiamento di stato** sulla campata equivalente: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Il più restrittivo fissa il tiro.
3. Il tiro di ogni ipotesi di carico segue da quello, e la forma di ogni campata è l'esatta **catenaria** tra i suoi due punti di attacco (incluse le campate in pendenza): freccia dalla corda, lunghezza e tiro a ciascuna estremità.

Il carico per metro in un'ipotesi: peso più ghiaccio (area del ghiaccio × densità × g) in verticale; pressione del vento × il diametro con ghiaccio in orizzontale.

## Tabelle di tesatura

{{ui:Altro}} › {{ui:Tabelle di tesatura…}} elenca, per ogni sezione, il tiro orizzontale e la freccia di ogni campata a ciascuna temperatura dell'insieme di regole (da −5 °C a 40 °C a passi di 5 °C per iniziare), in aria calma. Salvarle, insieme alla tabella dei sostegni, in CSV.

Non sono considerati: lo scorrimento viscoso del conduttore negli anni e l'allungamento di un conduttore nuovo. Aggiungerli attraverso le temperature alle quali si esegue la tesatura.
