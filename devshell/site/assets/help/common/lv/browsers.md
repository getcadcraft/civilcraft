---
title: Pārlūkprogrammas un datori
summary: Kurās pārlūkprogrammās lietotnes darbojas, kas tajās atšķiras un ko vajag jūsu datoram.
keywords: chrome, edge, firefox, safari, brave, pārlūkprogramma, mac, windows, linux, ipad, planšetdators, webgl, prasības, atmiņa
from: a11b09b1
---

Lietotnes darbojas tīmekļa pārlūkprogrammā. Darbu tās veic jūsu pašu datorā: jūsu faili tur tiek atvērti un nekad netiek nosūtīti mums (skatiet [Kur nonāk jūsu faili](common:your-files)).

## Kura pārlūkprogramma

Izmantojiet aktuālu versiju kādā no šīm:

| Pārlūkprogramma | Dzinējs | Piezīmes |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | Vispilnīgākā: mapes izvēle, saglabāšana bezsaistei, failu apstrāde. |
| Firefox | Gecko | Darbojas. Veselas mapes atvēršanai tiek izmantots vienkāršāks mapes izvēlētājs. Saglabāšana bezsaistei privātajos logos var nedarboties. |
| Safari | WebKit | Darbojas Mac un iPad. Veselas mapes atvēršanai tiek izmantots vienkāršāks mapes izvēlētājs. Safari var izdzēst bezsaistes kopiju, ko neesat izmantojis dažas nedēļas. |

Visi trīs dzinēji ikdienas darbam ir labi. Ja lietotne kādā no tiem darbojas citādi, tās palīdzība parāda soļus jūsu pārlūkprogrammai.

## Kas atšķiras starp pārlūkprogrammām

- **Mapes atvēršana.** Chromium pārlūkprogrammas rāda īstu mapes izvēlētāju un var nolasīt mapi tieši. Firefox un Safari lūdz izvēlēties mapi un pēc tam nolasa katru failu tajā, kas lielām projektu mapēm aizņem ilgāku laiku; mapes vilkšana uz lietotni darbojas visās trijās.
- **Saglabāšana.** Lietotnes saglabā, lejupielādējot failu. Pārlūkprogramma izlemj, kur lejupielādes nonāk un vai vispirms jautā.

:::chromium
Chrome vai Edge ieslēdziet „Ask where to save each file before downloading” (Iestatījumi, sadaļā Downloads), lai katru reizi izvēlētos mapi.
:::

:::firefox
Firefox atveriet Iestatījumi, pēc tam General, pēc tam Downloads, un izvēlieties „Always ask you where to save files”, lai katru reizi izvēlētos mapi.
:::

:::safari
Safari atveriet Iestatījumi, pēc tam General, un iestatiet „File download location” uz „Ask for each download”, lai katru reizi izvēlētos mapi.
:::

## Mac, Windows un Linux

Lietotnes ir vienādas katrā datorā. Mainās tastatūra: īsceļi tiek rakstīti jūsu datoram automātiski. Skatiet [Taustiņi, peles un skārienpaliktņi](common:keys).

## Planšetdatori un skārienekrāni

Dažas lietotnes pieņem skārienu (viens pirksts zīmē vai atlasa, divi pirksti tuvina un panoramē). Katras lietotnes palīdzība norāda, vai tā to dara. iPad izmantojiet Safari vai Chrome. Tastatūra palīdz lietotnēm, kas izmanto rakstītas komandas.

## Vecākā pārlūkprogramma un sistēma

Mēs to nolasām no 0.7 lietotņu koda, nevis minam: katrs fails tika apstrādāts, un katra valodas iespēja, ko tas izmanto, tika meklēta pārlūkprogrammu publicētajos saderības datos. Zem šīm versijām lietotnes nevar pat sākties, jo pārlūkprogramma nesaprot kodu.

| | Vecākā versija, kas var palaist lietotnes |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS un iOS 16.4) |

CadCraft Studio pats satur savu tīmekļa dzinēju Windows, tāpēc tam vajag Windows 10 vai 11; Mac tas izmanto sistēmas dzinēju, tāpēc vajag macOS 13.3 vai jaunāku. Studio sadaļā Iestatījumi › Atjauninājumi redzams, uz ko darbojas jūsu kopija.

Šī ir vecākā versija, kas *sāk darbu*, nolasīta no koda. Tas nav to vecāku pārlūkprogrammu saraksts, kurās mēs lietotnes esam palaiduši, tāpēc vecāka, kas sāk darbu, var joprojām nepazīt kādu iespēju.

## Ko jūsu datoram vajag

Šie ir plānotie lietotņu minimumi, nevis izmērītas prasības:

- 8 GB atmiņas (lielām federētām modeļiem ieteicami 16 GB).
- Grafikas mikroshēma ar WebGL 2 3D lietotnēm. Ja 3D skats paliek tukšs, pārbaudiet, vai pārlūkprogrammas iestatījumos ir ieslēgta aparatūras paātrināšana.
- Ekrāns vismaz 1280 pikseļus plats pilnām rīkjoslām; mazākos ekrānos tās tiek pārnestas.

Ļoti lieli faili (lieli plānu komplekti, lieli modeļi) pārlūkprogrammas cilnē izmanto daudz atmiņas. Ja lietotne palēninās, aizveriet citas smagas cilnes.
