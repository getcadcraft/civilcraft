---
title: Mostrare layer di mappa sotto la pianta
summary: Mettere un'immagine georeferenziata, riquadri di mappa, un server WMS o WMTS o un servizio di mappa sotto la pianta come contesto del sito, con l'impostazione internet, opacità, ordine e attribuzione.
keywords: layer di mappa, mappa di base, sfondo, aerea, ortofoto, immagini, satellite, raster, world file, pgw, jgw, tfw, wld, geotiff, immagine georeferenziata, xyz, riquadri, mappa a riquadri, wms, wmts, getcapabilities, servizio di mappa, rest, mapserver, imageserver, usgs, national map, attribuzione, opacità
from: 32d7718e
---

I layer di mappa sono immagini disegnate sotto il progetto: una foto aerea con il suo world file, oppure mappe da server su internet. Sono contesto del sito solo a schermo: **non** sono presenti nelle stampe PDF, nelle esportazioni DXF o DWG, né nella vista 3D.

Scegliere {{ui:Mappa}} nel gruppo {{ui:GIS}}. La finestra **Layer di mappa** elenca i layer del progetto e ne aggiunge di nuovi. I layer di mappa richiedono il sistema di coordinate del progetto ([Impostare il sistema di coordinate del progetto](topic:coordinate-systems)), tranne un'immagine il cui world file usa le coordinate proprie del progetto.

## L'impostazione internet

CivilCraft non chiede nulla a un server di mappe finché non lo si consente: {{ui:Impostazioni}}, {{ui:CivilCraft}}, **Layer di mappa da internet**: **Disattivato** (all'avvio) oppure **Attivato**.

:::note
Se attivato, CivilCraft chiede ai server di mappa che si aggiungono le immagini dell'area a schermo. Il disegno resta su questo computer; il server vede l'area e l'indirizzo internet del computer.
:::

Finché è disattivato, i layer da internet sono elencati nella finestra ma in grigio, con il motivo, e non viene disegnato né richiesto nulla. Aprire un progetto che nomina server di mappa non li contatta nemmeno. Un'immagine da file funziona in ogni caso. Il pulsante {{ui:Apri Impostazioni}} della finestra porta lì.

## Un'immagine georeferenziata (funziona offline)

1. In **Aggiungi un layer**, mantenere **Immagine georeferenziata** e scegliere i file: l'immagine (PNG o JPEG) **insieme** al suo world file (`.pgw` per PNG, `.jgw` per JPEG, oppure `.wld`) e, se esiste, al suo `.prj`. Si possono anche trascinare sulla pianta insieme.
2. Senza `.prj`, CivilCraft chiede quale sistema usa il world file: {{ui:Il sistema del progetto}} (il più comune), {{ui:Scegliere un sistema…}}, oppure, in un progetto senza sistema, **Coordinate del progetto**.
3. L'immagine appare sotto la pianta, e {{ui:Adatta}} la include.

Un GeoTIFF RGB (una foto aerea salvata come GeoTIFF) porta con sé la propria collocazione e il proprio sistema: aprirlo da solo. L'immagine viene conservata nel file di progetto (fino a 25 MB); una più grande viene rifiutata con la sua dimensione, quindi salvare una copia più piccola (meno pixel, oppure JPEG).

## Riquadri, WMS, WMTS e servizi di mappa

Attivare prima **Layer di mappa da internet**. Poi, in **Aggiungi un layer**:

| Da | Che cosa incollare | Che cosa fa CivilCraft |
|---|---|---|
| URL di riquadro | Un modello con `{z}`, `{x}` e `{y}` (o `{-y}`), e `{s}` per una lettera del server, per esempio `https://tile.example.org/{z}/{x}/{y}.png`. Dare un nome e la sua attribuzione. | Riquadri in web Mercator per l'area e lo zoom a schermo. |
| Server WMS | L'indirizzo del server, o il suo link GetCapabilities. Scegliere {{ui:Ottieni i layer}}, poi il layer. | Un'immagine dell'area a schermo, richiesta nel codice EPSG del progetto quando il server lo offre, altrimenti in web Mercator o WGS 84. |
| Server WMTS | L'indirizzo del server, o il suo `WMTSCapabilities.xml`. Scegliere {{ui:Ottieni i layer}}, poi il layer e il tile matrix set. | Riquadri dal set nel sistema del progetto quando ce n'è uno, altrimenti web Mercator. |
| Servizio di mappa ArcGIS (REST) | Un URL che termina con `/MapServer` o `/ImageServer`. Scegliere {{ui:Leggi il servizio}}. | I servizi in web Mercator con cache sono disegnati dai loro riquadri; gli altri sono richiesti come un'immagine dell'area a schermo. |

Nessun server è preimpostato. Esempi pubblici, tutti dall'USGS National Map (pubblico dominio):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Servizio di mappa: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (anche `USGSImageryOnly` per le foto aeree)

Molti uffici GIS di comuni e province pubblicano i propri servizi WMS o di mappa; le loro pagine GIS riportano l'indirizzo. Un server che chiede di accedere o una chiave non funziona: CivilCraft non invia nomi utente, password o chiavi.

## Come vengono disegnati i layer

- Le immagini in un sistema diverso da quello del progetto vengono deformate per entrarvi: l'immagine viene tagliata in pezzi, ciascuno posizionato in modo da trovarsi entro 0.25 di pixel dello schermo da dove lo colloca una conversione esatta.
- I riquadri vengono scelti per l'area a schermo e lo zoom: mai più di 64 per una vista, 6 alla volta. Quando si sposta o si ingrandisce, le richieste per la vecchia vista vengono annullate. Circa 200 riquadri restano in memoria (nulla viene salvato su disco).
- Un'immagine WMS o da servizio di mappa viene richiesta quando la vista smette di muoversi; finché non arriva, resta quella precedente.
- L'attribuzione di ogni layer a schermo è mostrata in piccolo in basso a destra della pianta.

## Modificare, ordinare e rimuovere i layer

Nella finestra ogni layer ha una casella per mostrarlo o nasconderlo, un cursore **Opacità**, frecce per disegnarlo prima (più in basso) o dopo (sopra), un pulsante di zoom (per le immagini) e un pulsante di rimozione. Il primo layer della lista viene disegnato in basso. Ogni modifica è un solo passo di annullamento.

## Quando un layer non mostra nulla

Il motivo compare una volta nella riga di stato e resta sotto il nome del layer nella finestra:

| Messaggio | Che cosa fare |
|---|---|
| Disattivato: i layer di mappa da internet sono disattivati nelle Impostazioni. | Attivare **Layer di mappa da internet**. |
| Richiede il sistema di coordinate del progetto | Impostarlo in {{ui:Coordinate}}. |
| Il server non ha consentito a questa pagina di usare le sue immagini (CORS), oppure non è raggiungibile. | Il server non permette alle pagine web di usare le sue immagini, oppure è fuori servizio. Dopo quattro rifiuti CivilCraft smette di chiedere; nascondere e mostrare il layer per riprovare. |
| Il server ha risposto 404 … / Il server ha inviato text/xml, non un'immagine: … | L'URL, il layer o lo stile sono errati, oppure il messaggio del server indica che cosa chiede. |
| Questo layer non è offerto nel sistema del progetto, in web Mercator o in WGS 84 | Il server non può disegnare dove CivilCraft può collocarlo. |

## Che cosa è stato verificato

- I numeri dei riquadri sono stati verificati rispetto alla tassellatura web Mercator standard; le risposte WMS 1.1.1 e 1.3.0, WMTS e servizi di mappa sono state lette da file scritti a mano e da risposte reali salvate dall'USGS National Map e dai server OpenStreetMap di terrestris; le richieste WMS 1.3.0 mettono la latitudine per prima per EPSG:4326, come prescrive lo standard.
- La deformazione è stata confrontata con una conversione esatta pixel per pixel, usando i valori di PROJ: entro 0.13 px per riquadri, immagini WMS e un'immagine di scala di contea, a scala di sito e a zoom ridotto.
- Un'immagine con il suo world file e un GeoTIFF RGB scritto da GDAL (tramite rasterio) sono stati disegnati dove dice la loro collocazione, verificati pixel per pixel nel browser.
- Nel browser, contro un server sostitutivo sulla macchina di prova: i riquadri cadono nel riquadro in cui PROJ colloca ogni punto, un'immagine WMS cade entro 2 px, al massimo 6 richieste sono in corso alla volta, e con l'impostazione disattivata nessuna richiesta lascia la pagina. Il servizio di mappa USGS National Map sopra è stato anche letto e disegnato dal vivo nel browser una volta (i suoi riquadri sono arrivati e sono stati disegnati, con il relativo testo di copyright); gli altri server pubblici sono stati letti solo da risposte salvate.
