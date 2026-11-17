---
title: Izveidot nospraušanas atskaiti
summary: Uzskaitīt atzīmes pa trasi stacijās un nobīdēs vai tuvumā esošos uzmērīšanas punktus ar staciju, nobīdi, ziemeļu un austrumu koordinātēm, projektētajām un dabiskās zemes atzīmēm un izrakumu vai uzbērumu, un saglabāt atskaiti kā CSV vai PDF.
keywords: nospraušana, nospraušanas atskaite, izrakuma lapa, atzīmju lapa, stacija, nobīde, izrakums, uzbērums, izkārtojums, būvnospraušana, izpildmērījums
from: d8a4e9f1
---

Atlasiet trasi un noklikšķiniet uz **Nospraušanas atskaite** tās **Rekvizītos**.

## Atzīmes pie stacijām un nobīdēm

1. **No** un **līdz**: stacijas, kur nospraust (1+50 vai 150).
2. **katra**: solis. Atzīmes tiek liktas katrā tā kārtnī, abos galos un (ja atzīmēta kaste) tur, kur trases līknes sākas un beidzas.
3. **Nobīdes**: pa kreisi un pa labi no trases, skatoties augošās stacijas virzienā: `12 L, 0, 12 R`, `L12 CL R12` vai `-12, 0, 12` (pa kreisi ir mīnuss). Trase ar koridoru sākas ar tās seguma un apmales malām.
4. **Numurēt no** un **ar priedēkli** nosauc atzīmes: 1, 2, 3 vai S101, S102.

## Uzmērīšanas punkti trases tuvumā

Izvēlieties **uzmērīšanas punkti trases tuvumā** un cik tuvu. Katram punktam šajā attālumā tiek piešķirta stacija un nobīde, tur esošais projekts un pats punkts kā dabiskā zeme: pārbaude punktiem, kas nospraust vai uzmērīti kā izpildītus.

## Ko saka atskaite

| Kolonna | Ko tā ir |
|---|---|
| Punkts | Atzīmes nosaukums vai uzmērīšanas punkta numurs |
| Stacija, nobīde | Kur tas atrodas gar trasi: L pa kreisi, R pa labi |
| Ziemeļi, austrumi | Tā koordinātes |
| Projektētā atzīme | Izlīdzinātā koridora virsma tur (no robežlīnijas līdz robežlīnijai), citādi projektētais garenprofils uz ass |
| Dabiskās zemes atzīme | Esošā virsma tur vai uzmērīšanas punkta pašas atzīmes |
| Izrakums/uzbērums | C, kad zeme ir virs projekta (jānogriež), F, kad zem (jāuzber), līdz simtdaļai |

Atzīmei bez projektētās atzīmes (ārpus koridora vai trasē bez tās ārpus ass) nav izrakuma vai uzbēruma; dialogā ir norādīts, cik to ir.

## Saglabāšana

- **CSV**: virsraksta rinda, pēc tam augstāk minētās kolonnas, kā arī izrakums vai uzbērums kā parakstīts skaitlis (dabiskā zeme mīnus projekts) izklājlapām un datu savācējiem.
- **PDF**: tabulas lapas uz izvēlētā papīra, viena atzīme rindā, izrakumi oranžā, uzbērumi zaļā krāsā, ar tādu pašu nosaukuma joslu kā citām lapām.

:::note
Atzīmes tiek aprēķinātas no projekta projektējuma. Pirms būvniecības sākšanas pārbaudiet tās pēc apstiprinātajiem plāniem.
:::
