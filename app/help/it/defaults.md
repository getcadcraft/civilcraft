---
title: Valori iniziali e segnaposto
summary: Ogni valore con cui CivilCraft parte, per nuovi progetti, visualizzazione, tracciati, piazzali, corridoi, reti di tubazioni, volumi e stampe, e quali sono segnaposto da sostituire.
keywords: valori predefiniti, impostazioni, valori iniziali, segnaposto, criteri di progetto, norme, regole, ipotesi
from: fbfc7432
---

CivilCraft non ha una finestra di impostazioni né un modello. Questi sono i valori con cui le cose partono. I valori contrassegnati come **segnaposto** non sono presi da alcuna norma: sostituirli con i criteri del proprio progetto prima di affidarsi a una verifica o a una quantità.

## Nuovo progetto

| Impostazione | Valore |
|---|---|
| Nome | Sito senza nome (il nome del primo file di punti lo sostituisce) |
| Unità | Piedi US |
| Nome della superficie | Terreno esistente |
| Gruppi di punti | Ogni gruppo parte come {{ui:Points}} |
| Lato esterno più lungo | 0 (conservare ogni triangolo) |
| Passi di annullamento conservati | 200 |

## Visualizzazione

| Impostazione | Valore |
|---|---|
| Superficie | {{ui:Existing ground}} |
| Curve ogni | 1 (ft o m) |
| Direttrici ogni | 5ª curva |
| Fasce | 8 |
| Attivati | Curve, etichette delle curve, punti, linee di discontinuità, bordo della superficie, tubazioni |
| Disattivati | Triangoli, fasce di quota, frecce di pendenza, etichette dei punti |

## Tracciati e profili

| Impostazione | Valore |
|---|---|
| Nome | Tracciato 1, Tracciato 2 … |
| Progressiva iniziale | 0+00 |
| Raggio di curva a ogni PI interno | 100 ft o 30 m, più piccolo se non entra in metà di ogni tangente |
| Profilo di progetto | Nessuno finché non se ne inizia uno; {{ui:Start from the ground}} mette un PVI sul terreno a ogni estremità |
| Lunghezza della curva verticale | 0 (nessuna curva) finché non se ne digita una |

## Piazzali

| Impostazione | Valore |
|---|---|
| Nome | Piazzale 1, Piazzale 2 … |
| Quota | Il terreno al centro del piazzale, arrotondato a 0.1 (0 se il centro è fuori dalla superficie) |
| Scarpata di sterro | 2 : 1 (segnaposto) |
| Scarpata di riporto | 3 : 1 (segnaposto) |

## Assieme del corridoio (segnaposto)

| Impostazione | Piedi US | Metri |
|---|---|---|
| Larghezza corsia | 12 ft | 3.6 m |
| Pendenza corsia | 2% | 2% |
| Larghezza banchina | 4 ft | 1.2 m |
| Pendenza banchina | 4% | 4% |
| Scarpata di sterro | 2 : 1 | 2 : 1 |
| Scarpata di riporto | 3 : 1 | 3 : 1 |
| Sezione ogni | 10 ft | 5 m |

## Rete di tubazioni

| Impostazione | Piedi US | Metri |
|---|---|---|
| Nome e tipo | Acque meteoriche, acque meteoriche | Acque meteoriche, acque meteoriche |
| Pendenza minima (segnaposto) | 0.50% | 0.50% |
| Copertura minima (segnaposto) | 2 ft | 0.6 m |
| Caduta nei manufatti (segnaposto) | 0.10 ft | 0.03 m |
| Diametro di un nuovo manufatto | 48 in | 1200 mm |
| Diametro di una nuova tubazione | 12 in | 300 mm |
| Profondità del pozzetto | 0 | 0 |
| Chiusino | Dalla superficie | Dalla superficie |

Una rete di tubazioni aperta da LandXML usa anche queste regole, perché LandXML non le trasporta.

## Volumi

| Impostazione | Valore |
|---|---|
| Metodo | Griglia, campionata al centro delle celle dentro le linee di intersezione |
| Dimensione della cella | Scelta in modo che il rettangolo che contiene l'area sistemata abbia circa 250,000 celle (1, 2 o 5 volte una potenza di dieci) |
| Rigonfiamento e ritiro | Nessuno |

## Stampa

| Impostazione | Valore |
|---|---|
| Area | {{ui:Everything}} |
| Carta | Tabloid 11 × 17 in (progetti in piedi), ISO A3 (progetti in metri); sempre orizzontale |
| Scala | La scala più grande elencata che entra |
| Inchiostro | {{ui:Layer colors}} |

Le etichette DXF sono dimensionate per la scala alla quale tutto entra su Tabloid (piedi) o A3 (metri).
