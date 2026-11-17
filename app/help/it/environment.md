---
title: Ombre, resa solare e comfort all'aperto
summary: Studiare l'ombra proiettata dalle masse degli edifici nell'arco di un giorno o di una stagione, vederne un'animazione, calcolare quanta elettricità produrrebbero in un anno tipo i pannelli solari su tetti e pareti, vedere quanto è confortevole la strada accanto a un edificio (UTCI) e ottenere una valutazione preliminare del comfort del vento per i pedoni.
keywords: studio ombre, ombra, ore di sole, animazione, solare, PV, fotovoltaico, pannelli, resa, kWh, EPW, file meteo, UTCI, comfort termico, comfort all'aperto, stress termico, vento
from: 96e7af4d
---

La sezione **Ambiente** si trova sotto **Ore di sole** nelle **Proprietà** di una massa. Usa le masse disegnate come edifici.

## Caricare un file meteo

Scegliere un file meteo di anno tipo (**.epw**) per la località interessata. Sono gratuiti dal sito meteo di EnergyPlus e da climate.onebuilding.org. Il file resta nel browser per questa sessione. La resa solare e lo studio del comfort lo richiedono; lo studio delle ombre funziona anche senza, quando il progetto ha un sistema di coordinate.

## Studio delle ombre

Scegliere una data (oppure selezionare **Stagione** e inserire una data finale e un passo in giorni) e un fuso orario, poi **Avvia studio delle ombre**. Si ottiene una mappa delle ore di sole, o di ombra, sul terreno intorno alle masse; una tabella di quanto terreno è in ombra durante la giornata; e un'animazione della giornata che si può riprodurre o far avanzare fotogramma per fotogramma. **Salva mappa**, **Salva fotogrammi animazione** (tutti i fotogrammi su un'unica immagine) e **Salva ore** (CSV) conservano i risultati.

Il terreno è considerato piano al livello della massa più bassa. Per le ombre su terreno in pendenza usare **Ore di sole**, che legge il terreno.

## Resa solare

Impostare l'efficienza dei pannelli, quanta parte di ogni tetto e parete è coperta e le perdite del sistema, poi **Avvia resa solare**. Per ogni tetto e parete si ottiene l'elettricità che un metro quadrato di pannello produrrebbe in un anno tipo, quanta ne sottraggono le masse vicine, e un totale per ogni massa. Il modello è descritto in termini semplici accanto al pulsante: si tratta di una stima di progetto basata su un anno tipo, non di una garanzia.

## Comfort all'aperto

**Avvia comfort** calcola l'Universal Thermal Climate Index (UTCI) per una persona in piedi su terreno aperto e accanto alla prima massa (lati sud, nord, est e ovest), con l'ombra di ogni massa. Mostra quanto cielo è visibile, l'UTCI medio diurno e le ore sopra 32 (stress da calore) e sotto 0 (stress da freddo).

## Vento (valutazione preliminare)

**Avvia studio del vento** risolve il flusso d'aria intorno alle masse una volta per ogni direzione del vento presente nel file meteo (4, 8, 12 o 16 direzioni), sull'intorno scelto (campagna aperta, periferia o centro città), e poi somma il vento orario dell'intero anno. La mappa colora il terreno per classe di comfort, dal verde (**seduti**) attraverso **in piedi**, **passeggiata** e **camminata** fino al rosso (**scomodo**): l'attività il cui limite di velocità (4, 6, 8 e 10 m/s) è superato per non più del 5 % delle ore. Una seconda tabella riporta il grado NEN 8100 (da A a E) in base alla quota di ore in cui il vento supera 5 m/s. Il fattore di raffica moltiplica la media oraria per ottenere una raffica effettiva.

Come funziona, in termini semplici: un risolutore di flusso lattice-Boltzmann large-eddy (sviluppato internamente, nella libreria `lib/wind`) in un volume intorno agli edifici, un profilo della velocità del vento che cresce con l'altezza in base alla scabrezza scelta, e la velocità a circa 1.5 m dal suolo confrontata con quella a monte a 10 m. **Valutazione preliminare** è veloce e grossolana; **Standard** usa più celle e richiede molto più tempo. Se il pannello indica che la griglia è grossolana (meno di 10 celle sull'edificio più alto), o che il flusso era ancora in variazione, prestare meno fiducia alla mappa.

**Cosa non è.** Il risolutore è stato verificato su flussi da manuale (un canale, una cavità a coperchio mobile) ed eseguito su un cubo per verificare che la scia e l'accelerazione agli spigoli risultino corrette. **Non** è stato validato con misure in galleria del vento su edifici, quindi ogni risultato è indicato come non validato. Non usarlo per un valore di progetto, un carico da vento o un certificato urbanistico: un ingegnere del vento deve eseguire e confermare uno studio adeguato. Il terreno piatto, le pareti lisce, la scorciatoia della scabrezza della stazione meteo e la tabella delle soglie sono semplificazioni; le soglie possono differire dai criteri usati dall'ente competente.

## Vento con OpenFOAM (add-on)

Il motore del vento integrato qui sopra è sperimentale. Per un vero risolutore di flusso, attivare l'add-on **Vento pedonale (OpenFOAM)** in **Impostazioni > Add-on** (è disattivato finché non lo si attiva). È un software con licenza GPL proprio, tenuto separato dal resto di CadCraft, e non include OpenFOAM: va installato a parte. Poi **Motore** nel blocco del vento elenca OpenFOAM.

Da configurare una sola volta:
1. **Installare OpenFOAM** (la serie v di ESI da openfoam.com; l'add-on è verificato con v2512). Su Ubuntu o Debian (anche in WSL su Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, poi `sudo apt install openfoam2512-default`. Viene installato in `/usr/lib/openfoam/openfoam2512`. CadCraft richiede `blockMesh`, `snappyHexMesh` e `simpleFoam` per funzionare. (Anche il pacchetto più vecchio `openfoam` 1912 dell'archivio di Ubuntu funziona, ma i suoi function object vanno in crash; in questo caso l'add-on legge da solo i file dei risultati.)
2. **Avviare il servizio ausiliario** dalla cartella `runner` dell'add-on con Node.js: `node cc-openfoam-runner.mjs serve`. Se OpenFOAM non è nel percorso di ricerca, fornire un piccolo `runner.json` con il percorso di `etc/bashrc` di OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) e avviarlo con `--config runner.json`. Il servizio ascolta solo su questo computer e stampa un token.
3. **Incollare il token** nei campi dell'add-on nel blocco del vento (l'indirizzo resta `http://127.0.0.1:8765`) e fare clic su **Verifica il servizio ausiliario**.

Poi **Avvia studio del vento** esegue un caso per ogni direzione del vento nel file meteo: le masse diventano una superficie (STL) in un volume dimensionato secondo la linea guida usuale (5 altezze di edificio intorno e sopra, 10 a valle), generata con blockMesh e snappyHexMesh, eseguita come RANS k-epsilon stazionario con ingresso di strato limite atmosferico sulla scabrezza scelta, e la velocità a 1.5 m viene riletta e convertita nelle stesse classi Lawson e NEN 8100. Nulla lascia il computer.

**Cosa è stato verificato.** Il testo sopra i risultati lo dice chiaramente ed è parte di ogni CSV salvato. La scrittura dei casi, la lettura dei risultati e l'intera pipeline dell'add-on sono verificate senza OpenFOAM, e un singolo cubo è stato eseguito con OpenFOAM reale con tre dimensioni di mesh (i valori sono nelle note di progetto). Non è stato validato con misure in galleria del vento su edifici. È una valutazione preliminare, non un valore di progetto né un certificato. Lo standard k-epsilon sovrastima la turbolenza davanti agli edifici, il terreno è piatto, le pareti sono lisce e non vi sono orografia né vegetazione.
