---
title: Segumi, sienas un kāpnes
summary: Segums ar kritumu uz noteku vai šķērskritumu, raksts un tā konstrukcija; ceļi, kas seko zemei; atbalstsienas un brīvi stāvošas sienas ar pakāpeniskiem pamatiem; apmales; rampas un kāpnes, pārbaudītas pret to robežām; IFC eksports.
keywords: cietais segums, segums, bruģis, pagalms, terase, kritums, notekas, šķērskritums, zivjkaula raksts, pārlaiduma raksts, taka, gājēju ceļš, atbalstsiena, dārza siena, pamats, virsējā sega, bordiūra, apmale, malas apdare, rampa, pieejamība, kāpnes, pakāpieni, paaugstinājumi, laukums
from: 51475877
---

Cietais segums vienmēr tiek aprēķināts no jauna pēc zemes, tāpēc tas seko reljefam un atjaunojas, kad mainās zeme vai tās līnija. Velciet tā stūrus plānā kā jebkuru līniju. Atveriet to no {{ui:Cietais segums}} grupā Ainava.

## Segums

Noklikšķiniet stūrus un nospiediet {{key:Enter}}. Rekvizītos:

- **Līmenis**: tukšs = zemes vidējais līmenis zem tā.
- **Kritumi**: līmenis, **šķērskritums** (% kādā virzienā) vai **uz noteku**: CivilCraft lūdz noklikšķināt, kur atrodas notekas; tad katrs stūris paceļas no notekas ar kritumu. Plānā bultiņas rāda kritumus.
- **Raksts** (režģis, pārlaidums, zivjkaula) ar vienības izmēru, šuvi un leņķi; **Apmale** platums. Lapā šuves, kas mazākas par milimetru, tiek izlaistas.
- Segums ir daļa no projektētās virsmas. Tā slāņi (bruģakmeņi, gultne, pamatne) tiek iekļauti IFC un daudzumos.

## Ceļi

Noklikšķiniet gar ceļu un nospiediet {{key:Enter}}. Tas seko zemei, ar savu **šķērskritumu** pa labo pusi. Ceļš, kas ir stāvāks par **Lielāko pieļaujamo**, plānā ir atzīmēts ar `!` tajā vietā, un rekvizītos ir rādīts, cik stāvs tas kļūst.

## Sienas

Noklikšķiniet gar sienu un nospiediet {{key:Enter}}. Siena ir **atbalstsiena** vai **brīvi stāvoša**. Bez **Augšas** tā paceļas par savu **Augstumu** virs zemes visā garumā; ievadiet augšu, lai to turētu līmenī. Tās **pamats** atrodas noteiktā dziļumā zem zemes un pakāpeniski nolaižas pa veseliem soļiem, tāpēc starp tiem tas paliek līmenī. Rekvizītos ir norādīti sienas garums, augstumi, sejas laukums un pamata pakāpieni; plānā sienas augša un apakša (TW / BW) ir atzīmētas katrā galā.

:::warning
Atbalstsiena, kas augstāka par 1.2 m (4 ft), tiek atzīmēta: to projektē inženieris.
:::

## Apmales

Noklikšķiniet gar bordiūru un nospiediet {{key:Enter}}; iestatiet tās platumu un izvirzījumu.

## Rampas

Noklikšķiniet no apakšas uz augšu un nospiediet {{key:Enter}}. Līmeņi tiek ņemti no zemes katrā galā, ja vien tos neievadāt. Rampai ir laukums katrā 750 mm (2.5 ft) pacēlumā, un to pārbauda pret **Lielāko pieļaujamo** (sākumā 1:12) un minimālo platumu; rekvizītos ir rādīts, cik garai tai būtu jābūt.

## Kāpnes

Noklikšķiniet uz apakšējā pakāpiena priekšējās malas, pēc tam vietā, kur kāpnes sasniedz augšu, un nospiediet {{key:Enter}}. Paaugstinājumu skaits nāk no augstuma un **Lielākā paaugstinājuma**; soļa dziļums nāk no komforta noteikuma 2R + G ≈ 630 mm, bet ne mazāks par **Mazāko soli**; laukums ir katrā **Lielākajā pakāpienu skaitā posmā**. Rekvizītos ir rādīts, vai tās ietilpst starp abiem punktiem, vai cik garākas tām jābūt.

:::note
Rampu un kāpņu robežas ir atzīmēti noklusējuma iestatījumi. Iestatiet tās, kuras prasa jūsu būvnormatīvi.
:::

## Ārpus CivilCraft

- Vairāk › {{ui:Eksportēt ainavu IFC}}: segumi un ceļi kā `IfcPavement`, sienas kā `IfcWall` (atbalstsienas kā RETAININGWALL) ar to slāņiem, apmales kā `IfcKerb`, rampas kā `IfcRamp`, kāpnes kā `IfcStair` ar to paaugstinājumiem un pakāpienu virsmām.
- Augu specifikācijas **Nosūtīt uz TakeoffCraft** pārnes segumu laukumus un slāņu tilpumus, sienu sejas laukumus un garumus, apmaļu garumus un kāpņu pakāpienu skaitu.
- Detalizācijas lapa zīmē katras sienas griezumu, katra seguma konstrukciju un katru kāpņu posmu. Skatiet [Ainavas lapas](topic:landscape-sheets).
