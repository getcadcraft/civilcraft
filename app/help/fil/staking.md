---
title: Gumawa ng staking report
summary: Ilista ang mga stake sa kahabaan ng alignment sa mga station at offset, o ang mga survey point na malapit dito, kasama ang station, offset, northing, easting, design at ground elevation, at cut o fill, at i-save ang report bilang CSV o PDF.
keywords: staking, stakeout, stake report, cut sheet, grade sheet, station, offset, cut, fill, layout, construction staking, as-built
from: d8a4e9f1
---

Pumili ng alignment at i-click ang **Staking report** sa **Properties** nito.

## Stake sa mga station at offset

1. **Mula** at **hanggang**: ang mga station na lalagyan ng stake (1+50 o 150).
2. **bawat**: ang interval. Nilalagay ang mga stake sa bawat multiple nito, sa magkabilang dulo, at (kapag may tsek ang kahon) kung saan nagsisimula at nagtatapos ang mga curve ng alignment.
3. **Offsets**: kaliwa at kanan ng alignment, habang tumitingin pataas ng station: `12 L, 0, 12 R`, `L12 CL R12` o `-12, 0, 12` (negatibo ang kaliwa). Ang alignment na may corridor ay nagsisimula sa mga gilid ng pavement at shoulder.
4. **Numerohan mula sa** at **may prefix** ang nagpapangalan sa mga stake: 1, 2, 3, o S101, S102.

## Mga survey point malapit sa alignment

Piliin ang **mga survey point malapit sa alignment** at kung gaano kalapit. Bawat point sa loob ng layong iyon ay makakakuha ng station at offset nito, ang design doon, at sarili nitong elevation bilang ground. Isa itong pagsusuri ng mga point na na-stake o na-shoot bilang as built.

## Ano ang sinasabi ng report

| Kolum | Ano ito |
|---|---|
| Point | Ang pangalan ng stake, o ang numero ng survey point |
| Station, Offset | Kung nasaan ito sa kahabaan ng alignment: L kaliwa, R kanan |
| Northing, Easting | Ang mga coordinate nito |
| Design elev. | Ang surface ng graded corridor doon (mula daylight line hanggang daylight line), o kung wala, ang design profile sa centerline |
| Ground elev. | Ang umiiral na surface doon, o ang sariling elevation ng survey point |
| Cut/fill | C kapag mas mataas ang ground kaysa design (ibaba ito, cut), F kapag mas mababa (itaas ito, fill), hanggang sa ikasandaan |

Ang stake na walang design elevation (nasa labas ng corridor, o sa alignment na walang isa malayo sa centerline) ay walang cut o fill; sinasabi ng dialog kung ilan ang mga ito.

## I-save ito

- **CSV**: isang title line, saka ang mga column sa itaas, kasama ang cut o fill bilang may-sign na numero (ground minus design) para sa spreadsheet at data collector.
- **PDF**: table pages sa papel na pipiliin mo, isang stake bawat row, orange ang cut at berde ang fill, kasama ang title strip ng ibang sheet.

:::note
Kinakalkula ang mga stake mula sa design sa project. I-check ang mga ito laban sa aprubadong plano bago magtayo ng anuman.
:::
