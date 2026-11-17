---
title: Darblapas: specifikācijas, kas saistītas ar objektiem
summary: Saglabātas darblapas ar rindām no augiem, stādītām platībām, bruģējuma, sienām, kāpnēm, zemes modifikatoriem vai visiem daudzumiem; jūsu pašu kolonnas un formulas, grupas un summas; CSV, XLSX un tabula lapās, vienmēr atjaunota.
keywords: darblapa, specifikācija, augu specifikācija, cieto segumu specifikācija, daudzumi, kolonnas, formula, summa, skaits, grupa, filtrs, csv, xlsx, izklājlapa, tabula lapā
from: 11bc1bac
---

{{ui:Darblapas}} (Ainavu darbvieta › Vairāk) atver šī projekta darblapas. Pirmajā reizē tiek izveidota **augu specifikācija** un **cieto segumu un platību specifikācija**. Darblapa tiek aprēķināta no objektiem katru reizi, kad to rāda, saglabā vai ievieto lapā: mainiet dobi, un tās skaits mainās visur.

- **Rindas no**: augi (viena rinda katrai sugai, šķirnei un izmēram), stādītas platības, bruģējums, sienas, kāpnes, zemes modifikatori (izrakums un uzbērums) vai visi daudzumi.
- **Kolonnas**: lauks (`qty`, `area`, `botanical` vai nosaukums kvadrātiekavās, piemēram `[Net area]`) vai formula: `+ - * / ^ %`, `&` teksta savienošanai, `= <> < <= > >=`, un `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Formula, ko nevar aprēķināt, šūnā rāda `#ERR` (vai `#DIV/0`). Formulas nolasa CadCraft pašu analizators; nekas tajās netiek izpildīts kā kods.
- **Summa** katrai kolonnai (summa, skaits, vidējais, mazākais, lielākais), **Grupēt pēc** (starpsummas katrai grupai) un **Tikai rindas, kur**.
- {{ui:Saglabāt kā CSV}}, {{ui:Saglabāt kā XLSX}} un **Ievietot šo darblapu lapās** (Lapas › Darblapas zīmē to kā tabulu, pāri tik lapām, cik vajadzīgs).

Etiķetes uz augiem un platībām lieto tos pašus lauku nosaukumus (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
