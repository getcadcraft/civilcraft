---
title: Augu saraksts
summary: Apmēram 420 parastu mērenās un Vidusjūras joslas augu ar to izmēriem, izturību, gaismu un ūdeni, meklējami jebkurā valodā, kā arī jūsu pašu saraksts, kas tiek saglabāts kopā ar projektu.
keywords: augu saraksts, augu datubāze, suga, botāniskais nosaukums, parastais nosaukums, augu paletre, stādaudzētavas saraksts, izturības zona, csv, augu importēšana, augu eksportēšana, mani augi, koku saraksts, krūmu saraksts, augu bibliotēka
from: 7ed09e7e
---

Sadaļa **Augi** kreisajā panelī uzskaita katru augu, ko varat ievietot. Noklikšķiniet uz augu, lai redzētu tā izmērus un padarītu to par augu, ko izmanto **Augs**, **Dobe** un **Dzīvžogs**.

## Meklēšana un filtrēšana

Ierakstiet laukā **Meklēt**: jebkuru auga nosaukuma vārdu jebkurā valodā (angļu, spāņu, portugāļu), tā botānisko nosaukumu, tā tipu vai vārdu piezīmēs. Katram ierakstītajam vārdam jāsakrīt, tādēļ `quercus evergreen` atrod mūžzaļos ozolus. Diakritiskās zīmes nav svarīgas.

Sarakstu var sašaurināt ar **Tips**, **Gaisma**, **Ūdens** un **Izturības zona** (USDA zona, kurā atrodas jūsu objekts: augs tiek uzskaitīts, ja zona ir tā diapazonā).

## Ko augs satur

| Lauks | Nozīme |
|---|---|
| Tips | Koks, krūms, dzīvžogs, zāle (ieskaitot zālājus), daudzgadīgs augs, segaugs vai vīteņaugs |
| Pieaugušā vecumā | Augstums un izplatība dārzā vai ielā audzētam augam, metros |
| Stādot | Izmērs, kādā augs tiek stādīts, un tā konteiners |
| Attālums | No centra līdz centram dobē vai gar dzīvžogu |
| Izturības zona | USDA zonas, kurās tas parasti ir izturīgs |
| Gaisma, ūdens, augsne | Kas tam nepieciešams |
| Piezīmes | Lietojums un brīdinājumi, piemēram, indīgas daļas vai augs, kas izplatās |

:::note
Iebūvētais saraksts CadCraft vajadzībām sastādīts pēc vispārējām dārzkopības zināšanām: tipiski izmēri, noapaļoti. Tas nav nevienas stādaudzētavas katalogs. Izmērus un izturību pārbaudiet vietējā stādaudzētavā. Vispazīstamākie invazīvie augi Ibērijā un lielā daļā mērenās joslas tīšām nav iekļauti, un daži augi, kas kaut kur ir invazīvi, ir ar piezīmi.
:::

## Jūsu augi

- **Pievienot šī projekta sarakstam** nokopē augu projekta sarakstā, kur tas tiek saglabāts kopā ar projektu. Augs jūsu sarakstā aizstāj iebūvēto augu ar tādu pašu atslēgu, tādēļ varat mainīt tā izmērus savam reģionam.
- **Importēt augu sarakstu…** nolasa CSV (vai augu failu). CSV failam vajadzīga kolonna ar botānisko nosaukumu un, ideālā gadījumā, tipu, augstumu un izplatību; darbojas arī kolonnu nosaukumi jūsu pašu vārdos (Latin, Common name, Height, Spread, Width, Zone). Tiek nolasīti komati, semikoli vai tabulēšanas zīmes un decimālkomati. Tukšiem stādīšanas izmēriem, attālumiem un konteineriem tiek ņemtas saprātīgas noklusējuma vērtības atbilstoši tipam.
- **Eksportēt kā CSV** saglabā jūsu sarakstu (vai, ja tāda nav, augus, ko rāda meklēšana), lai to atvērtu izklājlapā.

Augu saraksts tiek nolasīts kā jebkurš fails no ārpuses: viss, ko tas nevar izmantot, tiek izlaists un saskaitīts.

## Augi citās lietotnēs

Augu saraksts ir viena bibliotēka visām CadCraft lietotnēm: BimCraft un ModelCraft satur to pašu sarakstu, bet to pašu **Ievietot no bibliotēkas** vēl nepiedāvā augus. Šobrīd augi nonāk BIM modelī caur CivilCraft ainavas IFC (katrs augs kā `IfcGeographicElement`). Skat. [Stādīšana](topic:planting#ifc).
