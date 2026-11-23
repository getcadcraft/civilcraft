---
title: Bruģējums, sienas un kāpnes
summary: Bruģējums ar slīpumiem uz notekām vai šķērsslīpumu, raksts un konstrukcijas slāņi; takas, kas seko terēnam; atbalsta un brīvstāvošas sienas ar pakāpeniskiem pamatiem; bordiūras; rampas un kāpnes, kas pārbaudītas pret saviem ierobežojumiem; IFC eksports.
keywords: cietais segums, bruģējums, bruģakmeņi, pagalms, terase, slīpumi, noteka, šķērsslīpums, zivjukaula, garenkārtojums, taka, gājēju ceļš, atbalsta siena, dārza siena, pamats, vainags, bordiūra, apmale, rampa, pieejamība, kāpnes, pakāpieni, stāvvirsmas, soļu virsmas, pieturlaukums
from: d34b4466
---

Cietais segums tiek aprēķināts no jauna katru reizi, tāpēc tas seko reljefam un pārveidojas, kad mainās terēns vai tā līnija. Velciet tā stūrus plānā kā jebkuru līniju. Atveriet to no {{ui:Cietais segums}} grupā Ainava.

## Bruģējums

Noklikšķiniet uz stūriem un nospiediet {{key:Enter}}. Rekvizītos:

- **Līmenis**: tukšs = zem tā esošā terēna vidējais līmenis.
- **Slīpumi**: līmenis, **šķērsslīpums** (% uz noteiktu virzienu) vai **uz noteku**: CivilCraft prasa noklikšķināt, kur atrodas noteka, un tad katrs stūris paceļas no notekas ar norādīto slīpumu. Bultiņas plānā rāda slīpumus.
- **Raksts** (režģis, garenkārtojums, zivjukaula) ar vienības izmēru, šuvi un leņķi; **Apmales** platums. Lapā šuves, kas šaurākas par milimetru, netiek attēlotas.
- Bruģējums ir daļa no projektētās virsmas. Tā slāņi (bruģakmeņi, gultne, pamatne) nonāk IFC un daudzumos.

## Takas

Noklikšķiniet gar taku un nospiediet {{key:Enter}}. Taka seko terēnam, ar savu **šķērsslīpumu** uz tās labo pusi. Taka, kas ir stāvāka par **Lielāko pieļaujamo slīpumu**, plānā ir atzīmēta ar `!` tur, kur tā atrodas, un Rekvizītos norādīts, cik stāvu tā kļūst.

Ja taka sastopas ar ceļu, ko izveidojis koridors, tā apstājas pie ceļa ārējās malas, līmenī ar gājēju ceļu vai malu tur, projektētajā virsmā un 3D skatā. Taka, kas šķērso ceļu, tiek izlīdzināta un parādīta kā divas daļas, un gals, kas novilkts līdz divreiz takas platumam īsāks par ceļu, tiek turpināts līdz tā malai. Plānā taka joprojām rādīta tā, kā to zīmējāt, un tās garums un laukums skaita visu līniju. Skatiet [Ceļa koridora izveide](topic:corridor).

## Sienas

Noklikšķiniet gar sienu un nospiediet {{key:Enter}}. Siena ir **atbalsta** vai **brīvstāvoša**. Bez **Augšējās malas** tā visā garumā paceļas par savu **Augstumu** virs terēna; ierakstiet augšējo malu, lai to turētu līmenī. Tās **pamats** atrodas noteiktā dziļumā zem terēna un pakāpjas veselos soļos, tāpēc starp tiem tas paliek līmenī. Rekvizīti sniedz tās garumu, augstumus, sejas laukumu un pamatu soļus; plānā sienas augšas un apakšas atzīmes (TW / BW) ir norādītas katrā galā.

:::warning
Atbalsta siena, kas augstāka par 1.2 m (4 ft), tiek atzīmēta: to projektē inženieris.
:::

## Bordiūras

Noklikšķiniet gar bordiūru un nospiediet {{key:Enter}}; iestatiet tās platumu un izvirzījumu.

## Rampas

Noklikšķiniet no apakšas uz augšu un nospiediet {{key:Enter}}. Līmeņi nāk no terēna katrā galā, ja vien neievadāt tos paši. Rampai tiek pievienots pieturlaukums ik pēc 750 mm (2.5 ft) paaugstinājuma, un tā tiek pārbaudīta pret **Lielāko pieļaujamo slīpumu** (sākumā 1:12) un minimālo platumu; Rekvizītos norādīts, cik garai tai būtu jābūt.

## Kāpnes

Noklikšķiniet uz apakšējā pakāpiena priekšējās malas, pēc tam tur, kur kāpnes sasniedz augšu, un nospiediet {{key:Enter}}. Stāvvirsmu skaits nāk no augstuma un **Lielākās stāvvirsmas**; soļa platums – no komforta likuma 2R + G ≈ 630 mm, nekad mazāks par **Mazāko soļa platumu**; pieturlaukums ik pēc **Stāvvirsmām vienā maršā ne vairāk kā**. Rekvizītos norādīts, vai tās iederas starp abiem punktiem vai cik garākas tām jābūt.

:::note
Rampu un kāpņu ierobežojumi ir atzīmēti kā noklusējuma vērtības. Iestatiet tās, ko prasa jūsu būvnoteikumi.
:::

## Ārpus CivilCraft

- Vairāk › {{ui:Eksportēt ainavu IFC}}: bruģējums un takas kā `IfcPavement`, sienas kā `IfcWall` (atbalsta sienas kā RETAININGWALL) ar to slāņiem, bordiūras kā `IfcKerb`, rampas kā `IfcRamp`, kāpnes kā `IfcStair` ar to stāvvirsmām un soļu virsmām.
- Augu specifikācijas **Nosūtīt uz TakeoffCraft** nes bruģējuma laukumus un slāņu tilpumus, sienu sejas laukumus un garumus, bordiūru garumus un soļu skaitu.
- Detalizētā lapa attēlo katras sienas šķērsgriezumu, katra bruģējuma konstrukciju un katru kāpņu maršu. Skatiet [Ainavas lapas](topic:landscape-sheets).
