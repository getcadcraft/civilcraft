---
title: Mga worksheet: iskedyul na naka-link sa mga object
summary: Mga naka-save na worksheet na may row mula sa mga halaman, lugar na tinamnan, paving, pader, hagdan, ground modifier o lahat ng dami; sarili mong column at formula, grupo at kabuuan; CSV, XLSX at table sa mga sheet, laging updated.
keywords: worksheet, iskedyul, plant schedule, hardscape schedule, dami, column, formula, total, sum, count, group, filter, csv, xlsx, spreadsheet, table sa sheet
from: 11bc1bac
---

Bubuksan ng {{ui:Worksheets}} (Landscape › Higit pa) ang mga worksheet ng project na ito. Sa unang pagkakataon, awtomatikong gagawin ang **plant schedule** at ang **hardscape at areas schedule** para sa iyo. Kinukuwenta ang isang worksheet mula sa mga object sa tuwing ipinapakita, isinusulat o inilalagay ito sa isang sheet: palitan ang isang bed at magbabago ang bilang nito saanman.

- **Mga row mula sa**: mga halaman (isang row bawat species, cultivar at laki), mga lugar na tinamnan, paving, pader, hagdan, ground modifier (cut at fill) o lahat ng dami.
- **Mga column**: isang field (`qty`, `area`, `botanical`, o pangalan sa loob ng bracket gaya ng `[Net area]`) o isang formula: `+ - * / ^ %`, `&` para pagdugtungin ang teksto, `= <> < <= > >=`, at `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Ang formulang hindi makuwenta ay nagpapakita ng `#ERR` (o `#DIV/0`) sa cell nito. Binabasa ang mga formula ng sarili nang parser ng CadCraft; walang bahagi nila ang pinapatakbo bilang code.
- **Kabuuan** kada column (sum, count, average, pinakamaliit, pinakamalaki), **Group by** (subtotal kada grupo) at **Only rows where**.
- {{ui:I-save bilang CSV}}, {{ui:I-save bilang XLSX}}, at **Ilagay ang worksheet na ito sa mga sheet** (Sheet › Worksheets ay iginuguhit ito bilang table, sa kasing dami ng sheet na kailangan).

Ang mga label sa mga halaman at lugar ay gumagamit ng parehong pangalan ng field (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
