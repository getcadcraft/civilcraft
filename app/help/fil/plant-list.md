---
title: Ang listahan ng halaman
summary: Mga 420 karaniwang halaman ng temperate at Mediterranean na may kanilang sukat, hardiness, liwanag at tubig, mahahanap sa anumang wika, at ang sarili mong listahan na naka-save kasama ng proyekto.
keywords: plant list, plant database, species, botanical name, common name, plant palette, listahan ng nursery, hardiness zone, csv, mag-import ng halaman, mag-export ng halaman, aking mga halaman, listahan ng puno, listahan ng shrub, plantas, plant library
from: 7ed09e7e
---

Ang seksyong **Plants** ng kaliwang panel ay naglilista ng bawat halamang maaari mong ilagay. I-click ang isa para makita ang sukat nito at gawin itong halamang gagamitin ng **Plant**, **Bed** at **Hedge**.

## Paghahanap at pag-filter

I-type sa **Search**: anumang salita sa pangalan ng halaman sa anumang wika (English, Spanish, Portuguese), ang botanical name nito, ang uri nito, o isang salita sa mga tala nito. Kailangang tumugma ang bawat salitang i-type mo, kaya makikita ng `quercus evergreen` ang mga evergreen oak. Hindi mahalaga ang mga accent.

Paliitin ang listahan gamit ang **Type**, **Light**, **Water** at **Hardiness zone** (ang USDA zone kung nasaan ang iyong site: lumilitaw ang halaman kapag nasa loob ng saklaw nito ang zone).

## Ang datos ng halaman

| Field | Kahulugan |
|---|---|
| Type | Puno, shrub, hedge, damo (kasama ang lawn), perennial, groundcover o climber |
| At maturity | Taas at spread ng halaman kapag lumaki na sa hardin o kalye, sa metro |
| At planting | Ang sukat na itinatanim, at ang lalagyan nito |
| Spacing | Agwat mula sentro hanggang sentro sa bed o sa kahabaan ng hedge |
| Hardiness zone | Ang mga USDA zone kung saan karaniwan itong tumatagal |
| Light, water, soil | Ang kailangan nito |
| Notes | Gamit at babala, gaya ng nakalalasong bahagi o halamang kumakalat |

:::note
Isinulat ang built-in na listahan para sa CadCraft mula sa pangkalahatang kaalaman sa hortikultura: karaniwang sukat, bilugan. Hindi ito katalogo ng anumang nursery. Tingnan ang sukat at hardiness sa lokal na nursery. Sadyang hindi isinama ang mga pinakakilalang invasive na halaman ng Iberia at malaking bahagi ng temperate na mundo, at may tala ang ilang halamang invasive sa ilang lugar.
:::

## Sarili mong mga halaman

- **Add to this project's list** ay kumokopya ng halaman sa sariling listahan ng proyekto, kung saan ito naka-save kasama ng proyekto. Pumapalit ang halamang nasa listahan mo sa built-in na may parehong key, kaya maaari mong baguhin ang sukat nito para sa iyong rehiyon.
- **Import a plant list…** ay nagbabasa ng CSV (o plants file). Kailangan ng CSV ng column para sa botanical name at, mainam, para sa type, height at spread; tatanggapin ang mga pangalan ng column sa sarili mong salita (Latin, Common name, Height, Spread, Width, Zone). Binabasa ang mga kuwit, semicolon o tab, at ang decimal comma. Ang mga walang laman na planting size, spacing at container ay kumukuha ng makatwirang default ayon sa uri.
- **Export as CSV** ay nagse-save ng listahan mo (o, kung wala, ang mga halamang ipinapakita ng paghahanap) para mabuksan sa spreadsheet.

Binabasa ang listahan ng halaman tulad ng anumang file mula sa labas: anumang hindi nito magamit ay iniiwan at binibilang.

## Mga halaman sa ibang app

Iisang library ang listahan ng halaman para sa bawat app ng CadCraft: parehong dala ng BimCraft at ModelCraft ang listahan, ngunit ang sarili nilang **Place from library** ay wala pang alok na halaman. Sa ngayon, nakararating ang mga halaman sa BIM model sa pamamagitan ng landscape IFC ng CivilCraft (bawat halaman ay isang `IfcGeographicElement`). Tingnan ang [Pagtatanim](topic:planting#ifc).
